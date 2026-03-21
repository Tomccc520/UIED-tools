<!--
@copyright Tomda (https://www.tomda.top)
@copyright UIED技术团队 (https://fsuied.com)
@author UIED技术团队
@createDate 2026-03-21
-->

# 一键启动前后端（含数据库）

适用于本项目本地联调：

- 工具前端（Vite）
- likeadmin-go 后台 API（Go）
- likeadmin-go 后台前端（Vite）
- AI 抠图服务（Python/FastAPI）
- MySQL + Redis（Docker）

## 一键启动

首次需要先确保目录存在：

```bash
/Users/tangxiaoda/Desktop/网站备份/tools-web-master 2/tools-web/backend/likeadmin-go
```

如不存在，请先拉取：

```bash
cd /Users/tangxiaoda/Desktop/网站备份/tools-web-master\ 2/tools-web
mkdir -p backend
git clone --depth 1 https://gitee.com/likeadmin/likeadmin_go.git backend/likeadmin-go
```

然后执行：

```bash
cd /Users/tangxiaoda/Desktop/网站备份/tools-web-master\ 2/tools-web
npm run dev:fullstack:start
```

## 查看状态

```bash
npm run dev:fullstack:status
```

## 停止服务

仅停止前后端进程（保留数据库容器）：

```bash
npm run dev:fullstack:stop
```

停止全部（包括 MySQL/Redis）：

```bash
npm run dev:fullstack:stop:all
```

## 端口与数据库

脚本使用以下“起始端口”，如冲突会自动顺延到可用端口：

- 工具前端起始：`5179`
- 后台前端起始：`5180`
- 后台 API 起始：`8001`
- 抠图服务起始：`8091`
- MySQL 起始：`33069`
- Redis 起始：`16379`

数据库名固定为：`uiedtool`

查看当前实际端口：

```bash
npm run dev:fullstack:status
```

如需固定某个端口，可在启动前设置环境变量，例如：

```bash
TOOLS_PORT=5279 GO_API_PORT=9001 npm run dev:fullstack:start
```

## 首次启动说明

1. 脚本会自动起数据库并检测初始化 `uiedtool` 库中的 `la_admin` 表结构。  
2. 脚本会自动生成并覆盖 likeadmin 本地联调环境变量。  
3. 抠图服务首次调用会下载模型，首次会比较慢。  
