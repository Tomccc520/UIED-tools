#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@copyright Tomda (https://www.tomda.top)
@copyright UIED技术团队 (https://fsuied.com)
@author UIED技术团队
@createDate 2026-03-21
"""

from __future__ import annotations

import io
import os
import threading
import time
from typing import Any
from urllib.parse import quote

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from PIL import Image

DEFAULT_PROVIDER = os.getenv("MATTING_PROVIDER", "auto").strip().lower()
MAX_UPLOAD_MB = int(os.getenv("MATTING_MAX_UPLOAD_MB", "10"))
REQUEST_TIMEOUT_SECONDS = float(os.getenv("MATTING_REQUEST_TIMEOUT_SECONDS", "120"))
CONFIG_REQUEST_TIMEOUT_SECONDS = float(
    os.getenv("MATTING_CONFIG_REQUEST_TIMEOUT_SECONDS", "5")
)
CONFIG_CACHE_TTL_SECONDS = float(os.getenv("MATTING_CONFIG_CACHE_TTL_SECONDS", "30"))
MATTING_CONFIG_ENDPOINT = os.getenv("MATTING_CONFIG_ENDPOINT", "").strip()
MATTING_INTERNAL_TOKEN = os.getenv("MATTING_INTERNAL_TOKEN", "").strip()
ALLOWED_IMAGE_MIME = {"image/jpeg", "image/png", "image/webp"}
SUPPORTED_PROVIDERS = {"aliyun", "koukoutu"}

KOUKOUTU_API_URL = os.getenv(
    "KOUKOUTU_API_URL", "https://sync.koukoutu.com/v1/create"
).strip()
KOUKOUTU_API_KEY = os.getenv("KOUKOUTU_API_KEY", "").strip()

ALIYUN_ACCESS_KEY_ID = os.getenv("ALIYUN_ACCESS_KEY_ID", "").strip()
ALIYUN_ACCESS_KEY_SECRET = os.getenv("ALIYUN_ACCESS_KEY_SECRET", "").strip()
ALIYUN_IMAGESEG_ENDPOINT = os.getenv(
    "ALIYUN_IMAGESEG_ENDPOINT", "imageseg.cn-shanghai.aliyuncs.com"
).strip()

_provider_config_cache: dict[str, Any] = {
    "expiresAt": 0.0,
    "value": None,
    "error": "",
}
_provider_config_lock = threading.Lock()

app = FastAPI(title="UIED Matting API Proxy", version="0.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_env_provider_config(provider: str) -> dict[str, Any]:
    """函数说明：读取环境变量中的抠图配置，作为后台配置不可用时的部署兜底。"""
    if provider == "koukoutu":
        return {
            "provider": "koukoutu",
            "apiUrl": KOUKOUTU_API_URL,
            "apiKey": KOUKOUTU_API_KEY,
            "accessKeyId": "",
            "accessKeySecret": "",
            "endpoint": "",
            "timeoutSeconds": REQUEST_TIMEOUT_SECONDS,
        }
    if provider == "aliyun":
        return {
            "provider": "aliyun",
            "apiUrl": "",
            "apiKey": "",
            "accessKeyId": ALIYUN_ACCESS_KEY_ID,
            "accessKeySecret": ALIYUN_ACCESS_KEY_SECRET,
            "endpoint": ALIYUN_IMAGESEG_ENDPOINT,
            "timeoutSeconds": REQUEST_TIMEOUT_SECONDS,
        }
    return {}


def provider_is_configured(
    provider: str,
    config: dict[str, Any] | None = None,
) -> bool:
    """函数说明：判断指定抠图 API Provider 是否已经配置必要密钥。"""
    current = config or get_env_provider_config(provider)
    if provider == "koukoutu":
        return bool(current.get("apiUrl") and current.get("apiKey"))
    if provider == "aliyun":
        return bool(
            current.get("accessKeyId")
            and current.get("accessKeySecret")
            and current.get("endpoint")
        )
    return False


def normalize_backend_provider_config(payload: Any) -> dict[str, Any] | None:
    """函数说明：解析 likeadmin-go 统一响应并规范化为 8091 内部配置。"""
    if not isinstance(payload, dict):
        return None
    data = payload.get("data", payload)
    if not isinstance(data, dict):
        return None

    provider = str(data.get("provider", "")).strip().lower()
    if provider not in SUPPORTED_PROVIDERS:
        return None
    return {
        "provider": provider,
        "apiUrl": str(data.get("apiUrl", "")).strip(),
        "apiKey": str(data.get("apiKey", "")).strip(),
        "accessKeyId": str(data.get("accessKeyId", "")).strip(),
        "accessKeySecret": str(data.get("accessKeySecret", "")).strip(),
        "endpoint": str(data.get("endpoint", "")).strip(),
        "timeoutSeconds": max(
            10.0,
            float(data.get("timeoutSeconds") or REQUEST_TIMEOUT_SECONDS),
        ),
    }


def load_backend_provider_config(force: bool = False) -> dict[str, Any] | None:
    """函数说明：通过内部令牌读取后台当前抠图配置，并使用短缓存降低请求开销。"""
    if not MATTING_CONFIG_ENDPOINT or not MATTING_INTERNAL_TOKEN:
        return None

    now = time.monotonic()
    if not force and now < float(_provider_config_cache["expiresAt"]):
        return _provider_config_cache["value"]

    with _provider_config_lock:
        now = time.monotonic()
        if not force and now < float(_provider_config_cache["expiresAt"]):
            return _provider_config_cache["value"]
        try:
            response = httpx.get(
                MATTING_CONFIG_ENDPOINT,
                headers={"X-Matting-Internal-Token": MATTING_INTERNAL_TOKEN},
                timeout=CONFIG_REQUEST_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            config = normalize_backend_provider_config(response.json())
            if not config or not provider_is_configured(
                str(config["provider"]),
                config,
            ):
                raise RuntimeError("后台抠图 Provider 配置不完整")
            _provider_config_cache.update(
                {
                    "expiresAt": now + CONFIG_CACHE_TTL_SECONDS,
                    "value": config,
                    "error": "",
                }
            )
            return config
        except (httpx.HTTPError, ValueError, RuntimeError) as exc:
            _provider_config_cache.update(
                {
                    "expiresAt": now + min(CONFIG_CACHE_TTL_SECONDS, 10.0),
                    "value": None,
                    "error": str(exc),
                }
            )
            return None


def resolve_provider_config(requested_provider: str) -> dict[str, Any]:
    """函数说明：优先采用后台选中的 Provider，后台不可用时再按环境变量选择。"""
    backend_config = load_backend_provider_config()
    if backend_config:
        return backend_config

    provider = requested_provider.strip().lower()
    if provider in SUPPORTED_PROVIDERS:
        config = get_env_provider_config(provider)
        if provider_is_configured(provider, config):
            return config

    if DEFAULT_PROVIDER in SUPPORTED_PROVIDERS:
        config = get_env_provider_config(DEFAULT_PROVIDER)
        if provider_is_configured(DEFAULT_PROVIDER, config):
            return config

    for candidate in ("koukoutu", "aliyun"):
        config = get_env_provider_config(candidate)
        if provider_is_configured(candidate, config):
            return config

    raise HTTPException(
        status_code=503,
        detail="抠图 API 尚未配置，请在管理后台填写 Provider 密钥",
    )


def read_upload_bytes(upload_file: UploadFile) -> bytes:
    """函数说明：读取上传图片并校验大小，避免向上游发送超限文件。"""
    upload_file.file.seek(0)
    content = upload_file.file.read()
    upload_file.file.seek(0)
    if len(content) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"图片过大，限制 {MAX_UPLOAD_MB}MB")
    return content


def find_result_url(payload: Any) -> str:
    """函数说明：递归提取第三方响应中的结果图片 URL，兼容不同包装层级。"""
    if isinstance(payload, str):
        value = payload.strip()
        return value if value.startswith(("http://", "https://")) else ""

    if isinstance(payload, dict):
        preferred_keys = (
            "image_url",
            "imageUrl",
            "url",
            "output_url",
            "outputUrl",
            "result_url",
            "resultUrl",
        )
        for key in preferred_keys:
            result_url = find_result_url(payload.get(key))
            if result_url:
                return result_url
        for value in payload.values():
            result_url = find_result_url(value)
            if result_url:
                return result_url

    if isinstance(payload, list):
        for item in payload:
            result_url = find_result_url(item)
            if result_url:
                return result_url

    return ""


def download_result_image(result_url: str) -> tuple[bytes, str]:
    """函数说明：下载第三方返回的临时结果图并统一返回二进制内容。"""
    try:
        with httpx.Client(
            timeout=REQUEST_TIMEOUT_SECONDS,
            follow_redirects=True,
        ) as client:
            response = client.get(result_url)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise RuntimeError(f"结果图片下载失败: {str(exc)}") from exc

    media_type = response.headers.get("content-type", "image/png").split(";")[0]
    if not media_type.startswith("image/"):
        raise RuntimeError("上游返回的结果不是有效图片")
    return response.content, media_type


def request_koukoutu(
    image_bytes: bytes,
    filename: str,
    content_type: str,
    provider_config: dict[str, Any],
) -> tuple[bytes, str]:
    """函数说明：调用抠抠图同步文件 API，并下载透明背景结果。"""
    if not provider_is_configured("koukoutu", provider_config):
        raise RuntimeError("抠抠图 API 未配置 KOUKOUTU_API_KEY")

    try:
        with httpx.Client(
            timeout=float(provider_config["timeoutSeconds"]),
            follow_redirects=True,
        ) as client:
            response = client.post(
                str(provider_config["apiUrl"]),
                headers={"X-API-Key": str(provider_config["apiKey"])},
                data={
                    "model_key": "background-removal",
                    "output_format": "webp",
                    "crop": "0",
                    "border": "0",
                    "stamp_crop": "0",
                    "response": "url",
                },
                files={"image_file": (filename, image_bytes, content_type)},
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text.strip()[:300]
        raise RuntimeError(
            f"抠抠图 API 请求失败（HTTP {exc.response.status_code}）: {detail}"
        ) from exc
    except httpx.HTTPError as exc:
        raise RuntimeError(f"抠抠图 API 连接失败: {str(exc)}") from exc

    media_type = response.headers.get("content-type", "").split(";")[0]
    if media_type.startswith("image/"):
        return response.content, media_type

    try:
        payload = response.json()
    except ValueError as exc:
        raise RuntimeError("抠抠图 API 返回格式异常") from exc

    result_url = find_result_url(payload)
    if not result_url:
        message = payload.get("message") or payload.get("msg") or "未返回结果图片地址"
        raise RuntimeError(f"抠抠图 API 处理失败: {message}")
    return download_result_image(result_url)


def request_aliyun(
    image_bytes: bytes,
    provider_config: dict[str, Any],
) -> tuple[bytes, str]:
    """函数说明：调用阿里云通用分割 API，并下载四通道透明 PNG。"""
    if not provider_is_configured("aliyun", provider_config):
        raise RuntimeError("阿里云抠图 API 未配置 AccessKey")
    if len(image_bytes) > 3 * 1024 * 1024:
        raise RuntimeError("阿里云通用分割单图限制 3MB，请压缩图片后重试")
    try:
        with Image.open(io.BytesIO(image_bytes)) as input_image:
            width, height = input_image.size
    except Exception as exc:
        raise RuntimeError("无法读取待抠图图片，请更换 JPG、PNG 或 WebP") from exc
    if width <= 32 or height <= 32 or width > 1999 or height > 1999:
        raise RuntimeError("阿里云通用分割要求图片边长大于 32 且不超过 1999 像素")

    try:
        from alibabacloud_imageseg20191230 import models as imageseg_models
        from alibabacloud_imageseg20191230.client import Client as ImagesegClient
        from alibabacloud_tea_openapi import models as open_api_models
        from alibabacloud_tea_util import models as util_models
    except ModuleNotFoundError as exc:
        raise RuntimeError("缺少阿里云图像分割 SDK，请重新安装 requirements.txt") from exc

    config = open_api_models.Config(
        access_key_id=str(provider_config["accessKeyId"]),
        access_key_secret=str(provider_config["accessKeySecret"]),
    )
    config.endpoint = str(provider_config["endpoint"])
    client = ImagesegClient(config)
    request = imageseg_models.SegmentCommonImageAdvanceRequest(
        image_urlobject=io.BytesIO(image_bytes),
    )

    try:
        response = client.segment_common_image_advance(
            request,
            util_models.RuntimeOptions(
                read_timeout=int(float(provider_config["timeoutSeconds"]) * 1000),
                connect_timeout=10000,
            ),
        )
        result_url = response.body.data.image_url
    except Exception as exc:
        raise RuntimeError(f"阿里云通用分割请求失败: {str(exc)}") from exc

    if not result_url:
        raise RuntimeError("阿里云通用分割未返回结果图片地址")
    return download_result_image(result_url)


def build_result_response(
    image_bytes: bytes,
    source_name: str,
    provider: str,
) -> Response:
    """函数说明：构造统一的图片下载响应，并标记实际调用的 Provider。"""
    base_name = os.path.splitext(source_name or "matting")[0]
    try:
        with Image.open(io.BytesIO(image_bytes)) as result_image:
            output = io.BytesIO()
            result_image.convert("RGBA").save(output, format="PNG", optimize=True)
            normalized_bytes = output.getvalue()
    except Exception as exc:
        raise RuntimeError("上游返回的结果图片无法转换为透明 PNG") from exc

    encoded_filename = quote(f"{base_name}-matting.png")
    return Response(
        content=normalized_bytes,
        media_type="image/png",
        headers={
            "Content-Disposition": (
                'attachment; filename="matting.png"; '
                f"filename*=UTF-8''{encoded_filename}"
            ),
            "X-Matting-Provider": provider,
        },
    )


@app.get("/health")
def health() -> JSONResponse:
    """函数说明：返回 API 代理健康状态及 Provider 配置状态，不暴露任何密钥。"""
    backend_config = load_backend_provider_config()
    if backend_config:
        selected_provider = str(backend_config["provider"])
        configured = {
            provider: provider == selected_provider
            for provider in sorted(SUPPORTED_PROVIDERS)
        }
        config_source = "backend"
    else:
        selected_provider = DEFAULT_PROVIDER
        configured = {
            provider: provider_is_configured(provider)
            for provider in sorted(SUPPORTED_PROVIDERS)
        }
        config_source = "environment"
    return JSONResponse(
        {
            "ok": True,
            "service": "matting-api-proxy",
            "provider": selected_provider,
            "supportedProviders": sorted(SUPPORTED_PROVIDERS),
            "configuredProviders": configured,
            "ready": any(configured.values()),
            "configSource": config_source,
            "backendConfigEnabled": bool(
                MATTING_CONFIG_ENDPOINT and MATTING_INTERNAL_TOKEN
            ),
            "localModelEnabled": False,
            "maxUploadMB": MAX_UPLOAD_MB,
        }
    )


@app.post("/matting")
def matting(
    file: UploadFile = File(...),
    provider: str = Form(default=""),
    modelId: str = Form(default=""),
) -> Response:
    """函数说明：接收图片并转发至选定的外部抠图 API，返回透明背景结果。"""
    if not file.content_type or file.content_type not in ALLOWED_IMAGE_MIME:
        raise HTTPException(status_code=400, detail="仅支持 JPG/PNG/WebP 图片上传")

    provider_config = resolve_provider_config(provider or modelId)
    selected_provider = str(provider_config["provider"])
    image_bytes = read_upload_bytes(file)

    try:
        if selected_provider == "aliyun":
            result_bytes, _media_type = request_aliyun(image_bytes, provider_config)
        else:
            result_bytes, _media_type = request_koukoutu(
                image_bytes,
                file.filename or "image.png",
                file.content_type,
                provider_config,
            )
        return build_result_response(
            result_bytes,
            file.filename or "matting",
            selected_provider,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"抠图失败: {str(exc)}") from exc
