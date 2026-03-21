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
from typing import Optional

import cv2
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from modelscope.outputs import OutputKeys
from modelscope.pipelines import pipeline
from modelscope.utils.constant import Tasks

app = FastAPI(title="UIED Matting Service", version="0.1.0")

_matting_pipeline: Optional[object] = None
MODEL_ID = "iic/cv_unet_universal-matting"
MAX_UPLOAD_MB = 12


def get_matting_pipeline():
    """初始化并缓存抠图模型管线，避免每次请求重复加载模型。"""
    global _matting_pipeline
    if _matting_pipeline is None:
        _matting_pipeline = pipeline(Tasks.universal_matting, model=MODEL_ID)
    return _matting_pipeline


def save_upload_to_temp(file: UploadFile) -> str:
    """将上传文件落盘到临时目录，供 ModelScope 管线读取。"""
    suffix = os.path.splitext(file.filename or "")[-1] or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = file.file.read()
        tmp.write(content)
        return tmp.name


def write_result_png(result_img, output_path: str) -> None:
    """将模型输出写为 PNG，输出透明背景图。"""
    ok = cv2.imwrite(output_path, result_img)
    if not ok:
        raise RuntimeError("写入抠图结果失败")


@app.get("/health")
def health():
    """健康检查接口，用于部署探活。"""
    return JSONResponse({"ok": True, "service": "matting-service", "model": MODEL_ID})


@app.post("/matting")
def matting(file: UploadFile = File(...)):
    """执行通用抠图：上传图片后返回透明 PNG 文件。"""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="仅支持图片文件上传")

    file.file.seek(0, os.SEEK_END)
    size_bytes = file.file.tell()
    file.file.seek(0)
    if size_bytes > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"图片过大，限制 {MAX_UPLOAD_MB}MB")

    input_path = None
    output_path = None
    try:
        input_path = save_upload_to_temp(file)
        output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".png").name

        matting_pipe = get_matting_pipeline()
        result = matting_pipe(input_path)
        output_img = result.get(OutputKeys.OUTPUT_IMG)
        if output_img is None:
            raise RuntimeError("模型未返回有效结果")

        write_result_png(output_img, output_path)
        return FileResponse(
            path=output_path,
            media_type="image/png",
            filename=f"{os.path.splitext(file.filename or 'matting')[0]}-matting.png",
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"抠图失败: {str(exc)}") from exc
    finally:
        if input_path and os.path.exists(input_path):
            os.remove(input_path)

