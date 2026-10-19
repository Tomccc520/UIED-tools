<!--
  @copyright Tomda (https://www.tomda.top)
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2026-10-18
-->

# 后台操作与配置整理

本轮在现有未提交修复上继续开发，版本保持 3.0.3。范围是 LikeAdmin Vue 后台及 Go 网站配置保存，不改变主站框架、数据库菜单、角色权限、计费执行规则或生产环境。

## 已落地

| 操作问题 | 本轮处理 | 主要位置（相对 `backend/likeadmin-go/`） |
| --- | --- | --- |
| 常用运营和系统维护混在侧栏，功能难找 | 菜单按总览、业务运营、系统管理分组，保留后端菜单和路由；侧栏和顶栏共用用途搜索；隐藏目录和按钮不进入搜索，保留菜单 query。修复方向键选择被鼠标悬停重置。 | `admin/src/utils/admin-navigation.ts`、`admin/src/layout/default/components/sidebar/`、`header/index.vue` |
| 工作台重复快捷入口、假最近访问和推算健康分 | 合并常用任务，按真实权限过滤；工具访问、用户、订单、实付金额使用实际数据。系统信息、维护、临时发布自查和支持默认收起，失败、空数据、重试及超时明确。 | `admin/src/views/workbench/`、`admin/src/api/app.ts` |
| 通知配置被当成待处理通知，失败生成假入口 | 明确为通知配置；成功、空、失败、无权限分别处理；无权限不请求，不跳转到无关配置页。 | `admin/src/layout/default/components/header/index.vue` |
| 改一个工具必须找整份 JSON | 默认显示搜索、分类筛选和分页工具表；单工具抽屉编辑基本信息、SEO、GEO 和计费种子。高级编辑继续保留分类 JSON 与批量操作。单条编辑及批量补齐保留未知扩展字段；原始结构校验拒绝非法节点；抽屉草稿、目录变化冲突都有保护。 | `admin/src/views/setting/website/tools_catalog.vue`、`components/catalog-tool-editor.vue`、`composables/tool-catalog-editor.ts` |
| 官网配置职责难区分，来回找菜单 | 增加按用途分组的配置选择器，仅显示账号已有权限。说明单工具 SEO/GEO、全站 SEO、前台菜单、首页内容、广告各自归属。菜单设置按品牌、推荐、一级菜单、底部入口分组。 | `components/config-settings-nav.vue`、`sidebar.vue`、`layout/default/components/main.vue` |
| 保存入口重复，加载/失败/待发布含义不清 | 工具目录、菜单、头部、页脚、SEO 使用统一保存条；显示未保存、保存中、错误和最近保存时间。首次加载失败不能发布默认空值；重载确认后才覆盖；保存时禁用编辑；失败保留原编辑并提供重试。页面及保存 API 不再自动重复请求。 | `components/config-edit-frame.vue`、`composables/use-config-load.ts`、`use-operate-submit.ts`、相关页面及 `api/setting/website.ts` |
| 高级内容切回简版再保存时丢失 | 已编辑的高级草稿继续校验并提交，未改动的隐藏高级字段仍不写回。头部与页脚使用发送前快照标记保存基线。 | `sidebar.vue`、`frontend_layout.vue`、`header.vue`、`footer.vue` |
| 确认对话框实际无法取消 | 公共 `feedback.confirm` 改用真正的确认框，明确显示取消。抽屉右上角关闭使用 Arco 同步拦截，再异步确认草稿。 | `admin/src/utils/feedback.ts`、`catalog-tool-editor.vue` |
| 缩放窗口时侧栏状态与实际宽度不一致 | 按实际窗口原生 resize 同步断点，跨断点才重置折叠状态；普通缩放保留用户选择，手机初始收起。配置页补统一留白，窄屏表单标签改为上下布局。 | `admin/src/App.vue`、配置容器及 `admin/src/styles/public.scss` |
| 不同配置页并发保存会把别页数据改回旧值；中途失败可能部分成功 | 55 个字段显式白名单，只有本次传入字段生成 patch，在同一事务保存；不读取全量旧配置再重写，失败整批回滚。保留 RSS 白名单、图片地址和历史规范化约定。 | `server/admin/service/setting/website.go` |

## 配置归属

- 工具管理：单个工具信息、SEO、GEO、计费种子；执行计费仍通过“同步计费策略”写入登录与积分规则。
- 首页内容与更新记录：每日学习 RSS、更新记录说明及时间线；广告和人工热门推荐在广告管理。
- 前台菜单、顶部与搜索推荐、页脚：分别维护各自展示区域；不改变后台权限菜单。
- 全站与固定页面 SEO：全站默认和固定页覆写；现有历史工具路径覆写保留，不擅自删除线上配置。
- 品牌基础信息：后台及商城品牌；前台左栏文案仍在前台菜单。备案与协议使用原独立接口。

## 验证记录

- 后台 TypeScript 检查、生产构建通过。
- 最终生产构建在 `http://127.0.0.1:5182/admin/` 预览，配置、导航、工作台三组 Chrome 脚本均再次通过，包含发布目录前缀及实际 Go API 联动；预览服务验收后关闭，日常 5179/5180/8003 服务保留。
- 导航与目录数据测试 12 项通过，覆盖权限、路由参数、扩展字段保留、重复名称、编辑基线冲突和非法结构。
- P0 静态冒烟通过 27 页；实际浏览器巡检覆盖 27 页关键入口，菜单设置在最终源码稳定后单独复验通过。未真实点击保存、删除、同步或清空等持久化操作。
- 配置专用 Chrome 回归通过：单工具编辑、右上角关闭取消、重载取消、保存中禁用、保存失败保留、首次加载失败禁存、重试恢复、唯一保存入口，以及 320/375/768/1440px。视觉复查修复长表格固定列遮挡保存按钮，补充实际点击命中检查。
- 导航 Chrome 回归通过：点击、Enter、方向键第二项跳转、桌面折叠、320/375/768px 抽屉文字和搜索；通知配置成功、空、失败、重试。
- 工作台 Chrome 回归通过：实际数值、权限裁剪、空值与零值、失败重试、10 秒请求超时及 12 秒页面兜底、375/768/1440px 标题无遮挡。
- `go test -race ./admin/service/setting ./admin/routers/setting ./admin/service/common ./admin/routers/common` 通过。事务测试使用隔离驱动，不连接开发或生产库，覆盖三路并发、字段失败回滚、提交失败及 nil/显式空值。
- 新 Go 服务已在本地 8003 重启并通过健康检查；真实 API 并发回写头部、页脚、SEO 原值，完整回读与保存前一致，未改变配置内容。
- 配置浏览器的成功/失败保存使用浏览器内拦截，不向实际数据库写入测试文案。截图保留在 `output/playwright/admin-optimization/`、`admin-navigation/`、`admin-workbench/`。
- `git diff --check` 通过。本轮未升级版本、提交、推送或部署。

## 可重复检查

在 `backend/likeadmin-go/admin/` 执行：

```bash
npm run type-check
npm run build
npm run smoke:p0-actions
npm run smoke:p0-actions:visual
node --experimental-strip-types --test scripts/admin-navigation.test.mjs scripts/tool-catalog-editor.test.mjs
node scripts/smoke-admin-navigation.mjs
node scripts/smoke-workbench.mjs
node scripts/smoke-admin-configuration.mjs
```

## 仍保留的边界

本轮优化高频运营流程和配置可靠性，不代表所有后台业务语义都已逐条人工验收。分类结构的新增/迁移仍使用高级编辑；计费种子与实际执行规则保持现有两步同步；前端布局文件中已迁移模块的历史代码尚未整体拆除。已有 SEO 工具路径覆写与目录 SEO 的优先级策略未在本轮改变，避免影响线上内容。

生产环境仍需后续正式打包、部署后验收；旧发布包不包含本轮后台改动。
