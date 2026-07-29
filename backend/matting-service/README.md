# Matting API Proxy

<!--
@copyright Tomda (https://www.tomda.top)
@copyright UIED技术团队 (https://fsuied.com)
@author UIED技术团队
@createDate 2026-07-26
-->

## 说明

该服务不再下载或运行本地抠图模型，只负责：

- 接收前端上传的 JPG、PNG、WebP
- 在服务端安全调用外部抠图 API
- 下载第三方临时结果并返回给前端
- 隐藏 AccessKey 与 API Key

当前预留 Provider：

- `koukoutu`：抠抠图同步文件 API
- `aliyun`：阿里云视觉智能开放平台 `SegmentCommonImage`

## 配置

```bash
cd backend/matting-service
cp .env.example .env
```

推荐在 likeadmin-go 后台的“AI 抠图 API”页面选择服务商并填写密钥。8091 通过内部令牌读取配置：

```dotenv
MATTING_CONFIG_ENDPOINT=http://127.0.0.1:8003/api/common/ai/matting/internal-config
MATTING_INTERNAL_TOKEN=与likeadmin-go相同的长随机令牌
```

后台不可用时仍可通过 `KOUKOUTU_API_KEY` 或阿里云 AccessKey 环境变量兜底。

## 本地运行

```bash
bash scripts/backend/run-matting-service.sh
```

首次运行只安装轻量 Web 服务及 API SDK，不再安装 ModelScope、Torch、TensorFlow 或下载模型权重。

## 接口

- `GET /health`：查看 Provider 配置状态，不返回密钥
- `POST /matting`：上传字段名为 `file`，可选字段 `provider`

```bash
curl -X POST "http://127.0.0.1:8091/matting" \
  -F "file=@/absolute/path/to/test.png" \
  --output result.png
```

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `MATTING_PROVIDER` | `auto`、`aliyun` 或 `koukoutu` |
| `MATTING_MAX_UPLOAD_MB` | 服务统一上传限制，默认 10MB |
| `MATTING_REQUEST_TIMEOUT_SECONDS` | 上游请求超时，默认 120 秒 |
| `MATTING_CONFIG_ENDPOINT` | likeadmin-go 内部抠图配置接口 |
| `MATTING_INTERNAL_TOKEN` | 服务间鉴权令牌，必须与 likeadmin-go 一致 |
| `MATTING_CONFIG_CACHE_TTL_SECONDS` | 后台配置缓存秒数，默认 30 秒 |
| `KOUKOUTU_API_URL` | 抠抠图同步接口地址 |
| `KOUKOUTU_API_KEY` | 抠抠图 `X-API-Key` |
| `ALIYUN_ACCESS_KEY_ID` | 阿里云 AccessKey ID |
| `ALIYUN_ACCESS_KEY_SECRET` | 阿里云 AccessKey Secret |
| `ALIYUN_IMAGESEG_ENDPOINT` | 阿里云图像分割 Endpoint |

阿里云 `SegmentCommonImage` 单图限制为 3MB，超过限制时服务会返回明确提示。
