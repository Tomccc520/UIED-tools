<!--
@copyright Tomda (https://www.tomda.top)
@copyright UIED技术团队 (https://fsuied.com)
@author UIED技术团队
@createDate 2026-04-28
-->

# 商业交付运行手册

适用于 `tools-web + likeadmin-go + matting-service` 的商业交付、自测上线和客户环境排障。

## 1. 目标

本手册解决三件事：

1. 客户拿到代码后，能够快速完成基础启动
2. 升级版本时，数据库补丁有统一入口，不靠手工记忆
3. 上线或交付前，能够跑一遍最小可用自检

## 2. 最小环境要求

建议环境：

- macOS / Linux
- Docker Desktop 或 Docker Engine
- Node.js 18+
- npm 9+
- Go 1.22+
- Python 3.10+

关键命令依赖：

- `docker`
- `npm`
- `node`
- `go`
- `python3`
- `curl`
- `lsof`

## 3. 首次启动

在根目录执行：

```bash
cd /Users/tangxiaoda/Desktop/网站备份/tools-web-master\ 2/tools-web
npm run dev:fullstack:start
```

脚本会自动完成：

1. 启动 MySQL / Redis
2. 检查并初始化数据库
3. 自愈常见 SQL 补丁
4. 启动 Go 后台 API
5. 启动后台前端
6. 启动前台工具站
7. 启动抠图服务

## 4. 统一升级补丁

如果是以下情况，必须执行统一补丁入口：

- 拉取了新版本代码
- 从旧版本升级到新版本
- 客户环境缺少某些新能力的表结构或配置项

执行：

```bash
npm run dev:upgrade:apply
```

如需强制重放已有记录补丁：

```bash
npm run dev:upgrade:apply -- --force
```

如当前数据库已经是历史运行环境，只是缺少 `la_system_upgrade_log`，建议优先执行：

```bash
npm run dev:upgrade:apply -- --bootstrap-legacy-log
```

补丁脚本会：

1. 启动数据库容器
2. 创建 `la_system_upgrade_log`
3. 扫描 `backend/likeadmin-go/sql/upgrade/*.sql`
4. 扫描 `backend/likeadmin-go/sql/patches/*.sql`
5. 基于 `补丁路径 + sha1` 判断是否需要执行
6. 写入执行成功或失败日志

策略说明：

- 新装库：直接执行 `npm run dev:upgrade:apply`
- 老库缺日志：先执行 `--bootstrap-legacy-log`
- 仅在确认补丁具备可重放条件时，才使用 `--force`

建议检查：

```sql
SELECT patch_key, status, applied_at
FROM la_system_upgrade_log
ORDER BY id DESC
LIMIT 20;
```

## 5. 商业交付自检

在交付给客户前，或者上线前，执行：

```bash
npm run dev:delivery:check
```

自检范围包括：

- 环境依赖
- 关键源码目录
- MySQL / Redis 状态
- 核心表结构
- 升级补丁日志覆盖率
- 前台、后台、Go API、抠图服务可访问性

结果说明：

- `PASS`：通过
- `WARN`：基本可用，但建议处理
- `FAIL`：不可交付，必须先修复

## 6. 推荐交付流程

建议按这个顺序执行：

```bash
npm run dev:fullstack:start
npm run dev:upgrade:apply
npm run dev:delivery:check
```

然后再做业务侧冒烟：

1. 前台首页可打开
2. 后台登录可进入
3. 官网设置可保存
4. AI 模型设置可保存
5. 工具热榜页可访问
6. 用户中心可访问
7. 授权管理页可访问

## 7. 客户排障建议

### 7.1 页面打不开

先执行：

```bash
npm run dev:fullstack:status
```

再看对应端口是否存活。

### 7.2 后台 API 报错

先执行：

```bash
npm run dev:upgrade:apply
```

再执行：

```bash
npm run dev:delivery:check
```

如果补丁未覆盖完整，优先补齐数据库。

### 7.3 抠图或 AI 服务异常

优先检查：

- 抠图服务端口
- 模型下载是否完成
- 后台 AI Provider 是否已配置

## 8. 交付物建议

建议对客户至少提供：

1. 源码包
2. 本手册
3. 启动命令
4. 测试账号
5. 当前版本号
6. 升级说明

## 9. 默认访问入口

本地全栈启动成功后，默认访问入口如下：

- 工具前端：`http://127.0.0.1:5179`
- 独立热榜页：`http://127.0.0.1:5179/tools/hot-ranking`
- 后台前端：`http://127.0.0.1:5180/login`
- 后台 API：`http://127.0.0.1:8003`
- 抠图健康检查：`http://127.0.0.1:8091/health`

如端口冲突，脚本会自动顺延；最终以 `npm run dev:fullstack:status` 输出为准。

## 10. 默认测试账号

### 10.1 后台管理员

当前后台登录页内置了本地测试账号提示，默认可用于交付回归：

- 账号：`admin`
- 密码：`123456`

说明：

- 如客户环境已重置管理员数据，应以客户自建管理员为准
- 该测试账号仅建议用于本地演示、安装验证与交付回归
- 准备正式上线时，建议客户第一时间修改管理员密码

### 10.2 官网用户

官网用户侧当前不提供固定通用演示账号，建议通过注册流程生成演示账号后再做用户中心回归。

## 11. 升级注意事项

版本升级时，建议严格按以下顺序执行：

1. 备份数据库
2. 拉取新代码
3. 执行 `npm run dev:upgrade:apply`
4. 执行 `npm run dev:delivery:check`
5. 再进入业务回归

重点注意：

- 老库但缺少 `la_system_upgrade_log` 时，优先执行：
  - `npm run dev:upgrade:apply -- --bootstrap-legacy-log`
- 不要在未知 SQL 是否幂等的情况下直接使用 `--force`
- 升级完成后，至少检查一次：
  - 后台登录
  - 官网设置保存
  - AI 模型配置保存
  - 工具热榜页
  - 授权管理页
  - 用户中心访问

## 12. 客户常见问题（FAQ）

### Q1：脚本显示启动成功，但页面打不开？

先执行：

```bash
npm run dev:fullstack:status
```

确认实际端口，再检查：

- 本机防火墙
- 端口是否被其它进程占用
- 浏览器是否访问了旧端口

### Q2：数据库里已经有数据，为什么还要跑升级补丁？

因为新版本功能通常依赖新增表、字段、菜单、配置项。已有数据不代表结构已跟上代码版本。

### Q3：为什么 `dev:delivery:check` 里会出现 WARN？

`WARN` 代表“可以继续，但建议处理”。最常见原因是：

- 服务还没启动
- 某些业务链路尚未初始化
- 升级日志未覆盖完整

如果出现 `FAIL`，则不建议交付或上线。

### Q4：客户是旧库，执行补丁会不会把历史数据冲掉？

正常情况下不会直接冲掉，但老库缺升级日志时，建议先执行：

```bash
npm run dev:upgrade:apply -- --bootstrap-legacy-log
```

不要默认重放全部历史 SQL。

### Q5：正式上线前最少要验证什么？

建议至少验证：

1. 后台管理员登录
2. 官网设置保存并前台生效
3. AI Provider/模型配置读取正常
4. 工具热榜页可访问
5. 授权管理页可访问
6. 用户登录与用户中心可访问
7. 关键 AI/图片工具至少成功一次

## 13. 当前命令清单

```bash
npm run dev:fullstack:start
npm run dev:fullstack:status
npm run dev:fullstack:stop
npm run dev:fullstack:stop:all
npm run dev:upgrade:apply
npm run dev:delivery:check
```
