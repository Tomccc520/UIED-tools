#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@copyright Tomda (https://www.tomda.top)
@copyright UIED技术团队 (https://fsuied.com)
@author UIED技术团队
@createDate 2026-03-21
"""

from __future__ import annotations

import os
import tempfile
from typing import Any, Optional

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from PIL import Image
from starlette.background import BackgroundTask

MODEL_ID = os.getenv("MATTING_MODEL_ID", "iic/cv_unet_universal-matting")
MAX_UPLOAD_MB = int(os.getenv("MATTING_MAX_UPLOAD_MB", "12"))
ALLOWED_IMAGE_MIME = {"image/jpeg", "image/png", "image/webp"}
SUPPORTED_MODEL_IDS = {
    "iic/cv_unet_image-matting",
    "iic/cv_unet_universal-matting",
}
MODEL_TASK_BY_ID = {
    "iic/cv_unet_image-matting": "portrait_matting",
    "iic/cv_unet_universal-matting": "universal_matting",
}
OUTPUT_KEY_IMAGE = "output_img"
OUTPUT_KEY_MASK = "mask"
OUTPUT_KEY_OUTPUT = "output"
_matting_pipelines: dict[str, Any] = {}

app = FastAPI(title="UIED Matting Service", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_matting_pipeline():
    """函数说明：初始化并缓存抠图模型管线，避免每次请求重复加载模型。"""
    return get_matting_pipeline_by_model_id(MODEL_ID)


def get_matting_pipeline_by_model_id(model_id: str):
    """函数说明：按模型ID初始化并缓存抠图管线，支持后台动态切换模型。"""
    global _matting_pipelines

    if model_id not in SUPPORTED_MODEL_IDS:
        raise RuntimeError(f"不支持的模型ID: {model_id}")

    if model_id not in _matting_pipelines:
        try:
            from modelscope.pipelines import pipeline  # pylint: disable=import-outside-toplevel
            from modelscope.utils.constant import Tasks  # pylint: disable=import-outside-toplevel
        except ModuleNotFoundError as exc:
            missing_name = exc.name or "未知依赖"
            raise RuntimeError(
                f"抠图服务缺少依赖：{missing_name}，请先执行 `pip install -r requirements.txt`"
            ) from exc

        try:
            model_task = MODEL_TASK_BY_ID.get(model_id, "universal_matting")
            task_value = getattr(Tasks, model_task, Tasks.universal_matting)
            _matting_pipelines[model_id] = pipeline(task_value, model=model_id)
        except Exception as exc:
            raise RuntimeError(f"抠图模型初始化失败：{str(exc)}") from exc
    return _matting_pipelines[model_id]


def remove_file_safely(path: str) -> None:
    """函数说明：安全删除临时文件，避免异常清理导致请求中断。"""
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except OSError:
        pass


def read_upload_size(upload_file: UploadFile) -> int:
    """函数说明：读取上传文件大小并在读取后恢复文件指针位置。"""
    upload_file.file.seek(0, os.SEEK_END)
    size_bytes = upload_file.file.tell()
    upload_file.file.seek(0)
    return size_bytes


def save_upload_to_temp(upload_file: UploadFile) -> str:
    """函数说明：将上传文件分块写入临时文件，避免一次性读取占用过大内存。"""
    suffix = os.path.splitext(upload_file.filename or "")[-1] or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        while True:
            chunk = upload_file.file.read(1024 * 1024)
            if not chunk:
                break
            tmp.write(chunk)
        return tmp.name


def to_uint8_array(array_data: Any) -> np.ndarray:
    """函数说明：将模型输出统一转换为 uint8 数组，兼容 float/uint16 等输入类型。"""
    array = np.asarray(array_data)
    if array.dtype == np.uint8:
        return array

    array = array.astype(np.float32)
    max_value = float(np.max(array)) if array.size else 0.0
    if max_value <= 1.0:
        array = array * 255.0
    return np.clip(array, 0, 255).astype(np.uint8)


def image_from_any(image_data: Any) -> Optional[Image.Image]:
    """函数说明：把模型返回的多种图像类型统一转换成 PIL.Image。"""
    if image_data is None:
        return None

    if isinstance(image_data, Image.Image):
        return image_data.copy()

    if isinstance(image_data, str) and os.path.exists(image_data):
        with Image.open(image_data) as image_obj:
            return image_obj.copy()

    if isinstance(image_data, np.ndarray):
        array = to_uint8_array(image_data)
        if array.ndim == 2:
            return Image.fromarray(array, mode="L")

        if array.ndim == 3 and array.shape[2] == 3:
            # ModelScope 常见输出为 BGR，这里转换为 RGB
            rgb_array = array[..., ::-1]
            return Image.fromarray(rgb_array, mode="RGB")

        if array.ndim == 3 and array.shape[2] == 4:
            # ModelScope 常见输出为 BGRA，这里转换为 RGBA
            rgba_array = array[..., [2, 1, 0, 3]]
            return Image.fromarray(rgba_array, mode="RGBA")

    return None


def normalize_alpha_mask(mask_image: Image.Image, target_size: tuple[int, int]) -> Image.Image:
    """函数说明：标准化 alpha 蒙版尺寸与模式，确保可直接用于前景合成。"""
    alpha = mask_image.convert("L")
    if alpha.size != target_size:
        alpha = alpha.resize(target_size, Image.Resampling.BILINEAR)
    return alpha


def build_matting_result_image(result: dict[str, Any], input_rgba: Image.Image) -> Image.Image:
    """函数说明：兼容不同模型输出结构，统一生成透明背景 RGBA 图像。"""
    result_image = image_from_any(result.get(OUTPUT_KEY_IMAGE))
    alpha_candidates = [
        result.get(OUTPUT_KEY_MASK),
        result.get("alpha"),
        result.get(OUTPUT_KEY_OUTPUT),
    ]
    alpha_image = None
    for candidate in alpha_candidates:
        candidate_image = image_from_any(candidate)
        if candidate_image is not None:
            alpha_image = candidate_image
            break

    if result_image is not None and result_image.mode == "RGBA":
        return result_image

    if result_image is not None and result_image.mode == "RGB":
        composed = result_image.copy()
        if alpha_image is not None:
            composed.putalpha(normalize_alpha_mask(alpha_image, composed.size))
        else:
            composed.putalpha(Image.new("L", composed.size, 255))
        return composed

    if result_image is not None and result_image.mode == "L":
        composed = input_rgba.copy()
        composed.putalpha(normalize_alpha_mask(result_image, composed.size))
        return composed

    if alpha_image is not None:
        composed = input_rgba.copy()
        composed.putalpha(normalize_alpha_mask(alpha_image, composed.size))
        return composed

    raise RuntimeError("模型未返回可用的抠图结果")


@app.get("/health")
def health():
    """函数说明：健康检查接口，用于部署探活与服务状态确认。"""
    return JSONResponse(
        {
            "ok": True,
            "service": "matting-service",
            "model": MODEL_ID,
            "loaded": MODEL_ID in _matting_pipelines,
            "loadedModels": list(_matting_pipelines.keys()),
            "supportedModels": list(SUPPORTED_MODEL_IDS),
            "modelTasks": MODEL_TASK_BY_ID,
            "maxUploadMB": MAX_UPLOAD_MB,
        }
    )


@app.post("/matting")
def matting(file: UploadFile = File(...), modelId: str = Form(default="")):
    """函数说明：执行抠图推理，返回透明背景 PNG 文件。"""
    if not file.content_type or file.content_type not in ALLOWED_IMAGE_MIME:
        raise HTTPException(status_code=400, detail="仅支持 JPG/PNG/WebP 图片上传")

    selected_model_id = (modelId or MODEL_ID).strip()
    if selected_model_id not in SUPPORTED_MODEL_IDS:
        raise HTTPException(status_code=400, detail=f"不支持的模型ID: {selected_model_id}")

    size_bytes = read_upload_size(file)
    if size_bytes > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"图片过大，限制 {MAX_UPLOAD_MB}MB")

    input_path = ""
    output_path = ""
    try:
        input_path = save_upload_to_temp(file)
        with Image.open(input_path) as input_image:
            input_rgba = input_image.convert("RGBA")

        matting_pipe = get_matting_pipeline_by_model_id(selected_model_id)
        result = matting_pipe(input_path)
        if not isinstance(result, dict):
            raise RuntimeError("模型输出格式异常")

        output_rgba = build_matting_result_image(result, input_rgba)
        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".png").name
        output_rgba.save(output_path, format="PNG", optimize=True)

        output_name = f"{os.path.splitext(file.filename or 'matting')[0]}-matting.png"
        return FileResponse(
            path=output_path,
            media_type="image/png",
            filename=output_name,
            background=BackgroundTask(remove_file_safely, output_path),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"抠图失败: {str(exc)}") from exc
    finally:
        remove_file_safely(input_path)
