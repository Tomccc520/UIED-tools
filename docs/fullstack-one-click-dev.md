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

## 执行统一升级补丁

适用于以下场景：

- 拉取了新版本代码，需要把 `sql/upgrade` 和 `sql/patches` 的补丁补齐
- 客户环境之前已经运行过项目，但需要按日志表补齐后续版本变更
- 上线前要确认数据库结构与当前代码一致

执行命令：

```bash
npm run dev:upgrade:apply
```

如需强制重放全部补丁日志记录对应的 SQL，可执行：

```bash
npm run dev:upgrade:apply -- --force
```

如当前数据库已经是旧环境，只是缺少补丁日志，建议先执行日志回填模式：

```bash
npm run dev:upgrade:apply -- --bootstrap-legacy-log
```

执行后会自动：

1. 启动 MySQL 与 Redis 容器
2. 创建升级日志表 `la_system_upgrade_log`
3. 扫描 `backend/likeadmin-go/sql/upgrade/*.sql`
4. 扫描 `backend/likeadmin-go/sql/patches/*.sql`
5. 只执行未成功记录或文件哈希已变化的补丁

注意：

- 新库或未跑过历史 SQL 的环境，直接执行 `npm run dev:upgrade:apply`
- 老库但没有补丁日志的环境，优先执行 `--bootstrap-legacy-log`
- 只有确认 SQL 可重复执行时，才使用 `--force`

## 执行商业交付自检

适用于以下场景：

- 准备打包交付给客户前
- 版本发布前做一次环境和服务链路检查
- 客户环境排查“为什么跑不起来”时快速定位

执行命令：

```bash
npm run dev:delivery:check
```

该命令会检查：

- Node / Go / Python / Docker / curl 等基础依赖
- 关键源码目录是否齐全
- MySQL / Redis 容器是否存在
- 关键数据表是否存在
- 升级补丁日志是否覆盖当前 SQL 文件
- 前台、后台、Go API、抠图服务是否可访问

如有 `FAIL`，应先修复失败项；如只有 `WARN`，建议上线前继续处理。

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

## 建议交付顺序

商业交付或上线前，建议按以下顺序执行：

```bash
npm run dev:fullstack:start
npm run dev:upgrade:apply
npm run dev:delivery:check
```

如果 `dev:delivery:check` 输出通过或只有少量 `WARN`，再进入业务回归阶段。
