---
name: uied-tools-matting-service-debug
description: 用于 Mac 环境排查 tools-web 抠图 500 问题，覆盖 matting-service 启停、依赖安装、端口代理、模型映射与前端错误兜底。
license: Internal project skill
---

本技能用于快速定位 `http://localhost:5179/tools/photo/*` 抠图失败问题。

## 适用场景

- 页面报错：`抠图请求失败（HTTP 500）`
- 服务未启动或端口冲突
- 模型加载失败、依赖缺失（如 `torch`）
- 前端代理地址不对导致请求落空

## 快速排障顺序

1. 看运行态  
`bash scripts/dev/status-fullstack.sh`

2. 看抠图服务日志  
`tail -n 200 .runtime/logs/matting-service.log`

3. 看健康检查  
`curl http://127.0.0.1:8091/health`

4. 看前端代理配置  
- `vite.config.ts` 的 `VITE_MATTING_PROXY_TARGET`  
- `scripts/dev/start-fullstack.sh` 是否注入了 `VITE_MATTING_PROXY_TARGET`

## 常见问题与处理

### 服务未启动

- 启动命令：

```bash
bash scripts/backend/run-matting-service.sh
```

### 依赖缺失（如 `ModuleNotFoundError: torch`）

- 在 `backend/matting-service/.venv` 内重新安装：

```bash
cd backend/matting-service
source .venv/bin/activate
pip install -r requirements.txt
```

### HTTP 500 但响应体为空

- 多数是代理目标不可达。先确认 `matting-service` 端口可访问，再检查前端代理地址。

### 模型可配但推理失败

- 校验 `modelId` 是否在后端白名单  
- 校验模型与任务映射是否正确（人物抠像/通用抠像）

## 回归基线

1. 上传 JPG/PNG/WebP 可正常处理  
2. `photo/transparent` 和 `photo/background` 都可成功  
3. 切换后台模型后，前台无需改代码可生效  
4. 前端错误提示应明确“服务未启动/超时/不支持模型”
