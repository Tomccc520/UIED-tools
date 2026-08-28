<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-29
 */
-->

# 参与贡献

感谢关注 UIED Tools。项目以自用、免费工具和长期维护为优先，欢迎提交工具、体验优化、文档修正和问题反馈。

## 开始之前

- 请先搜索已有 Issue，避免重复提交。
- 新增工具前，优先复用 `src/components/Layout` 和 `src/styles/tailwind.css` 中的公共布局规范。
- 涉及后台配置、菜单、SQL 或 API 的改动，必须同时检查前台调用和存量数据库升级路径。
- 严禁提交真实 API Key、Token、数据库密码、生产环境文件或用户数据。

## 本地开发

```bash
npm install
npm run dev:fullstack:start
```

默认地址：

- 主站：`http://127.0.0.1:5179`
- 管理端：`http://127.0.0.1:5180`
- Go API：`http://127.0.0.1:8003`

## 提交改动

1. 从最新 `main` 创建功能分支，例如 `codex/feature-name`。
2. 保持一个提交只解决一类问题，提交信息使用 `feat`、`fix`、`docs`、`refactor`、`test` 或 `chore` 前缀。
3. 新增函数添加中文函数级注释；页面保留 UIED 版权信息。
4. 前后端联动改动按“接口契约 → 后台 → 前台 → 菜单权限 → 闭环回归”的顺序处理。
5. 提交前至少执行：

```bash
npm run -s test:unit -- --run
npm run -s build:check
go test ./...
git diff --check
```

## 响应式规范

- 页面容器使用 `min-width: 0`，避免网格或 Flex 子项把页面撑出横向滚动。
- 内容宽度优先使用 `max-width` 限制，大屏保持可读密度，不随视口无限拉伸。
- 图片、画布、代码和表格在自身区域内滚动，页面主体不使用全局横向滚动兜底。
- 断点至少检查桌面（1440px）、平板（768px）和手机（390px）。

## 广告和运营配置

- 广告只能通过后台运营模块发布，HTML 广告会经过安全清洗。
- 图片广告必须提供有效图片地址；外链使用 HTTPS，站内链接使用 `/` 或 `#` 开头。
- 保存后必须验证“后台保存 → 公共配置接口 → 主站实际展示”。
- 热门工具原生广告与顶部广告共用运营入口，不在前台写死运营内容。

## Pull Request

PR 描述请说明：改动目的、影响范围、验证命令、桌面/移动端截图（如涉及 UI）以及是否需要数据库补丁。维护者会优先合并小范围、可回归、不会泄露配置的改动。
