<!--
@copyright Tomda (https://www.tomda.top)
@copyright UIED技术团队 (https://fsuied.com)
@author UIED技术团队
@createDate 2026-07-26
-->

# AI 抠图 API 代理宝塔部署指南

## 一、部署结构

- 前端站点：Nginx 静态文件
- likeadmin-go：会员、积分和运营配置
- matting-service：外部抠图 API 代理
- 抠图服务商：阿里云或抠抠图

matting-service 不再运行本地模型，因此服务器不需要 Torch、TensorFlow、ModelScope 或 GPU。

## 二、准备 API 密钥

支持以下任一服务商：

- 阿里云视觉智能开放平台：开通分割抠图 `SegmentCommonImage`
- 抠抠图：申请 `X-API-Key`

密钥推荐在管理后台“AI 抠图 API”页面维护，不要写入前端环境变量或提交 Git。

## 三、配置服务

```bash
cd /www/wwwroot/uied-tools/backend/matting-service
cp .env.example .env
```

在 likeadmin-go 与 matting-service 中配置相同的内部令牌：

```dotenv
# likeadmin-go/server/.env
MATTING_INTERNAL_TOKEN=替换为足够长的随机令牌
```

```dotenv
# backend/matting-service/.env
MATTING_CONFIG_ENDPOINT=http://127.0.0.1:8003/api/common/ai/matting/internal-config
MATTING_INTERNAL_TOKEN=与likeadmin-go相同的随机令牌
```

然后进入管理后台选择阿里云或抠抠图并填写对应 Key。环境变量密钥仅作为后台暂不可用时的兜底：

```dotenv
MATTING_PROVIDER=auto
KOUKOUTU_API_KEY=
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=
```

## 四、启动与守护

```bash
cd /www/wwwroot/uied-tools
bash scripts/backend/run-matting-service.sh
```

Supervisor 启动命令：

```bash
cd /www/wwwroot/uied-tools/backend/matting-service && \
source .venv/bin/activate && \
set -a && source .env && set +a && \
uvicorn app:app --host 127.0.0.1 --port 8091 --workers 2
```

健康检查：

```bash
curl http://127.0.0.1:8091/health
```

返回中的 `ready` 应为 `true`、`configSource` 应为 `backend`，`localModelEnabled` 固定为 `false`。

## 五、Nginx 反向代理

```nginx
location /api/matting/ {
    proxy_pass http://127.0.0.1:8091/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 180;
    client_max_body_size 10m;
}
```

前端继续调用：

```text
POST /api/matting/matting
```

因此切换服务商不需要修改前端页面或工具路由。

## 六、上线检查

1. `/health` 返回 `ready: true`
2. `/health` 返回 `configSource: backend`
3. 内部配置接口在缺少或错误令牌时返回 401
4. 未配置密钥时接口返回明确的 503 提示
5. 上传成功后返回透明背景图片
6. 浏览器网络请求中不出现 AccessKey 或 API Key
7. 阿里云图片控制在 3MB、最长边 1999 像素以内
8. 失败请求不扣积分，成功后再完成业务计费确认
