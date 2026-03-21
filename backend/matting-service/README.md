# Matting Service（ModelScope 通用抠图）

## 说明

该服务用于承接你指定的模型：

- `iic/cv_unet_universal-matting`
- 模型页：<https://modelscope.cn/models/iic/cv_unet_universal-matting/summary>

服务职责：

- 接收前端上传图片
- 本地执行抠图
- 返回透明 PNG 结果

## 本地运行

```bash
cd /Users/tangxiaoda/Desktop/网站备份/tools-web-master\ 2/tools-web/backend/matting-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8091 --reload
```

## 接口

- `GET /health`：健康检查
- `POST /matting`：上传文件字段名 `file`

示例：

```bash
curl -X POST "http://127.0.0.1:8091/matting" \
  -F "file=@/absolute/path/to/test.png" \
  --output result.png
```

## 注意事项

- 第一次调用会下载模型权重，耗时较长。
- 当前限制单图最大 12MB，可按需求调整。
- 线上建议接入对象存储、任务队列与鉴权层。
