# 后台接入说明（likeadmin-go）

本目录用于承载 `likeadmin-go` 后台基座与后续会员/配额/支付能力。

## 当前状态

- 已完成前端源码备份：`/Users/tangxiaoda/Desktop/网站备份/tools-web-master 2/tools-web/backups/frontend-src-20260321-185054.tar.gz`
- 已拉取后台基座：`/Users/tangxiaoda/Desktop/网站备份/tools-web-master 2/tools-web/backend/likeadmin-go`
- 已初始化抠图微服务骨架：`/Users/tangxiaoda/Desktop/网站备份/tools-web-master 2/tools-web/backend/matting-service`

## 推荐架构（与你当前纯前端项目兼容）

- 前端站点：当前 `tools-web`（继续独立发布）
- 后台系统：`likeadmin-go`（菜单/权限/会员/订单/配置）
- AI 推理服务：独立 Python 服务（抠图模型推理）
- 对外网关：Nginx（按路径转发）

## 首次启动（本地）

1. 启动基础依赖（MySQL + Redis）

```bash
cd /Users/tangxiaoda/Desktop/网站备份/tools-web-master\ 2/tools-web/backend
docker compose up -d
```

2. 初始化 likeadmin-go

```bash
cd /Users/tangxiaoda/Desktop/网站备份/tools-web-master\ 2/tools-web
bash scripts/backend/bootstrap-likeadmin-go.sh
```

3. 导入 SQL（根据 likeadmin-go/sql 目录选择）

4. 启动服务端

```bash
cd /Users/tangxiaoda/Desktop/网站备份/tools-web-master\ 2/tools-web/backend/likeadmin-go/server
go run main.go
```

## 一键全栈启动（推荐）

在项目根目录执行：

```bash
npm run dev:fullstack:start
```

该命令会自动完成：

- 启动 MySQL/Redis
- 初始化 `uiedtool` 数据库（首次）
- 启动 likeadmin-go 服务端
- 启动 likeadmin-go 后台前端
- 启动抠图 Python 服务
- 启动 tools-web 前端

说明：

- 各服务端口会自动避让冲突（从默认起始端口向后顺延）。
- 数据库名称固定为 `uiedtool`。

更多命令见：

- `npm run dev:fullstack:status`
- `npm run dev:fullstack:stop`
- `npm run dev:fullstack:stop:all`

## 大版本注意事项

- 前端与后台先分仓思路推进，避免一次性混改。
- 先打通登录/菜单/配置中心，再挂会员与配额，不要直接改业务工具逻辑。
- 抠图能力建议走独立推理服务，后台只做鉴权、计费、配额和审计日志。

## 新手部署指引

- 宝塔部署文档：`/Users/tangxiaoda/Desktop/网站备份/tools-web-master 2/tools-web/docs/ai-matting-baota-deploy.md`
- 一键启动脚本：`/Users/tangxiaoda/Desktop/网站备份/tools-web-master 2/tools-web/scripts/backend/run-matting-service.sh`
