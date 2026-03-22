---
name: uied-tools-fe-be-linkage
description: 用于 tools-web 项目前后端联动开发，覆盖接口契约、likeadmin-go 路由与权限、前端接入、菜单SQL与回归发布。
license: Internal project skill
---

本技能用于你当前仓库里“前端工具 + likeadmin-go + Python AI服务”的联动开发。

## 触发场景

- 新增一个需要后台配置/鉴权的工具能力
- 前端要读取后台配置再调用 AI 服务
- 后台新增菜单后前端要立即可用
- 需要一次性做完“接口 + 菜单 + 页面 + 回归”

## 联动步骤

1. 定义接口契约  
- 先明确 URL、参数、响应字段、错误码  
- 管理端和前台读取分离（例如 `/api/setting/*` + `/api/common/*`）

2. 后端先落接口  
- 目录：`backend/likeadmin-go/server/admin/service/**`  
- 路由：`backend/likeadmin-go/server/admin/routers/**`  
- 注册：`backend/likeadmin-go/server/admin/routers/enter.go`、`server/admin/service/enter.go`

3. 权限与菜单同步  
- 白名单：`backend/likeadmin-go/server/config/admin.go`  
- 新装 SQL：`backend/likeadmin-go/sql/install.sql`  
- 增量 SQL：`backend/likeadmin-go/sql/upgrade/*.sql`

4. 前端接入  
- 后台管理端 API：`backend/likeadmin-go/admin/src/api/**`  
- 后台页面：`backend/likeadmin-go/admin/src/views/**`  
- 工具站请求层：`src/services/**`  
- 工具页面：`src/components/Tools/**`

5. 回归检查  
- 后端：`go test ./...`（`backend/likeadmin-go/server`）  
- 工具站：`npm run build:check`（项目根目录）  
- 菜单验证：后台可见、权限可控、保存后前台生效

## 约束原则

- 不先改页面样式，先保证契约稳定
- 失败路径必须有可读错误提示
- 同类配置必须走统一读取入口，避免页面各自硬编码
- 改动尽量按模块拆 commit（后端/前端/SQL 分开）
