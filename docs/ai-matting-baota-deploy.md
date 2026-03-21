<!--
@copyright Tomda (https://www.tomda.top)
@copyright UIED技术团队 (https://fsuied.com)
@author UIED技术团队
@createDate 2026-03-21
-->

# AI 抠图（ModelScope）宝塔部署指南（新手版）

适用场景：

- 现有前端项目继续纯前端发布
- 新增后端（likeadmin-go）管理会员/配额/支付
- AI 抠图由独立 Python 服务处理

使用模型：

- `iic/cv_unet_universal-matting`
- 模型地址：<https://modelscope.cn/models/iic/cv_unet_universal-matting/summary>

## 一、先理解整体架构

- 前端站点（Nginx 静态）  
  `https://你的域名`
- likeadmin-go 后台（Go 服务）  
  `http://127.0.0.1:8080`（示例）
- 抠图服务（Python + FastAPI）  
  `http://127.0.0.1:8091`
- 业务数据库（MySQL）  
  建议库名统一：`uiedtool`
- Nginx 反向代理  
  - `/api/admin/*` -> likeadmin-go
  - `/api/matting/*` -> matting-service

## 二、为什么不建议“把模型手工上传到宝塔”

新手最稳方案是：

- 在服务器上运行 Python 抠图服务
- 第一次调用时由 `modelscope` 自动下载模型到本机缓存目录

优点：

- 不用你先处理模型格式和目录细节
- 后续升级模型更简单

## 三、服务器准备（宝塔）

1. 宝塔安装 Python 3.10+（建议 3.10/3.11）
2. 安装 `supervisor`（宝塔进程守护）
3. 安装 Nginx
4. 服务器需要能访问 ModelScope（首次下载模型）

## 四、上传代码到服务器

上传目录建议：

```bash
/www/wwwroot/uied-tools/backend/matting-service
```

把本地这些文件上传上去：

- `backend/matting-service/app.py`
- `backend/matting-service/requirements.txt`
- `scripts/backend/run-matting-service.sh`

## 五、初始化并启动抠图服务

服务器执行：

```bash
cd /www/wwwroot/uied-tools/backend/matting-service
bash /www/wwwroot/uied-tools/scripts/backend/run-matting-service.sh
```

默认端口：`8091`  
健康检查：`http://127.0.0.1:8091/health`

## 六、用 Supervisor 托管（建议）

Supervisor 启动命令示例：

```bash
cd /www/wwwroot/uied-tools/backend/matting-service && \
source .venv/bin/activate && \
uvicorn app:app --host 127.0.0.1 --port 8091 --workers 1
```

说明：

- `workers=1` 是为了降低内存占用，新手先这样最稳
- 后续压力上来再扩容

## 七、Nginx 反向代理

在站点配置里增加：

```nginx
location /api/matting/ {
    proxy_pass http://127.0.0.1:8091/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 300;
}
```

## 八、前端如何调用

前端统一调用：

- `POST /api/matting/matting`（上传图片字段名 `file`）

不要在前端直接放模型，也不要让浏览器下载 220MB 权重。

## 九、常见问题（新手高频）

1. 首次请求很慢  
原因：模型首次下载 + 初始化。正常现象。

2. 内存不足  
降低并发、限制上传大小（比如 12MB），必要时升级服务器。

3. 超时  
Nginx 的 `proxy_read_timeout` 要调大，建议 300 秒。

4. 后续会员限制怎么做  
放在 likeadmin-go：登录、次数、套餐、订单。  
抠图服务只做推理，和业务逻辑解耦。
