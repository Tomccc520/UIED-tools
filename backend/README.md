# UIED Tools 全栈后台

`backend/likeadmin-go` 是 UIED Tools 3.0.1 开放源码的一部分，包含 Go API、Arco Pro 管理端、安装 SQL 和增量补丁。

## 项目架构

- 主站：仓库根目录的 Vue 3 应用
- 管理端：`backend/likeadmin-go/admin`
- Go API：`backend/likeadmin-go/server`
- 数据库：`backend/likeadmin-go/sql`
- 对外网关：Nginx 按 `/`、`/admin/`、`/api/` 分流
- AI 简历：独立构建，可按需启用
- 抠图：通过 Go API 安全代理第三方服务，不再携带本地大模型

## 首次启动（本地）

## 一键全栈启动

在项目根目录执行：

```bash
npm run dev:fullstack:start
```

该命令会自动完成：

- 启动 MySQL/Redis
- 初始化 `uiedtool` 数据库（首次）
- 启动 likeadmin-go 服务端
- 启动 likeadmin-go 后台前端
- 启动 tools-web 前端

说明：

- 各服务端口会自动避让冲突（从默认起始端口向后顺延）。
- 数据库名称固定为 `uiedtool`。

更多命令见：

- `npm run dev:fullstack:status`
- `npm run dev:fullstack:stop`
- `npm run dev:fullstack:stop:all`

## 部署

- 宝塔部署文档：`docs/uiedtool-3.0.1-baota-deploy.md`
- 生产打包：`npm run release:fullstack`
- 生产包统一输出到：`output/production/uiedtool-3.0.1/`

部署前必须修改数据库密码、Redis 配置和第三方 API 密钥，不要提交真实 `.env`。
