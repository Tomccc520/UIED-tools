---
name: uied-tools-ai-model-menu-sync
description: 用于 tools-web 与 likeadmin-go 联动时新增或维护 AI 模型管理能力，覆盖后端接口、后台菜单 SQL、前端模型读取与联调回归。
license: Internal project skill
---

本技能用于“AI 模型可配置并驱动前台工具生效”的改造。

## 适用场景

- 新增 AI 模型配置（如抠图/OCR/文生图）
- 后台新增“模型设置”菜单与权限点
- 前台工具页改为按后台配置读取模型
- 修复“菜单已加但前台不生效”问题

## 标准流程

1. 先定接口契约  
- 管理端：`GET /api/setting/ai/model/detail`  
- 管理端：`POST /api/setting/ai/model/save`  
- 前台读配置：`GET /api/common/ai/model/current`

2. 后端实现并注册  
- `backend/likeadmin-go/server/admin/service/setting/*.go`  
- `backend/likeadmin-go/server/admin/routers/setting/*.go`  
- `backend/likeadmin-go/server/admin/routers/common/*.go`  
- `backend/likeadmin-go/server/admin/routers/enter.go`  
- `backend/likeadmin-go/server/admin/service/enter.go`  
- `backend/likeadmin-go/server/config/admin.go`（免登录白名单）

3. 后台菜单与权限  
- 新装库：修改 `backend/likeadmin-go/sql/install.sql`  
- 存量库：新增 `backend/likeadmin-go/sql/upgrade/*.sql`

4. 前端接入  
- 后台管理端 API：`backend/likeadmin-go/admin/src/api/setting/*.ts`  
- 后台页面：`backend/likeadmin-go/admin/src/views/setting/**`  
- 工具前端请求：`src/services/*`  
- 工具页面：`src/components/Tools/**`

5. 回归检查  
- 后端：`go test ./...`（`backend/likeadmin-go/server`）  
- 前端：`npm run build:check`（项目根目录）  
- 管理端：至少验证“菜单可见、可保存、刷新后仍生效”

## 存量库导入 SQL（uiedtool）

如果是已运行中的库，优先执行增量 SQL，不直接重刷 install.sql。

示例（Docker 环境）：

```bash
docker compose -p uiedtool_stack --env-file .runtime/compose.env -f backend/docker-compose.yml up -d mysql redis
docker compose -p uiedtool_stack --env-file .runtime/compose.env -f backend/docker-compose.yml exec -T -e MYSQL_PWD=root123456 mysql mysql -uroot uiedtool < backend/likeadmin-go/sql/upgrade/20260321_ai_model_menu.sql
```

## 易错点

- 只加了路由，没加 `InitRouters` 或 `InitFunctions`
- 前台读取接口未加到 `NotLoginUri`
- 菜单 SQL 已导入，但角色权限未授权
- 前端代理仍指向旧后端端口
