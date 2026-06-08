# 后台 Arco Pro 设计巡检

巡检日期：2026-04-30

## 巡检范围

- 后台目录：`backend/likeadmin-go/admin/src/views`
- Vue 文件总数：114
- 参考基线：Arco Design Pro / Arco Design Pro Vue 的 Search Table、Card、基础表单页结构

## 当前结论

当前后台不是单页问题，而是存在一批历史页面风格混用：

- 已收口：微信公众号回复模块 3 个页面已统一为 Arco Pro Search Table 形态。
- 高风险：35 个 Vue 文件仍有明显的自定义工作台、大统计卡片或非 Arco Pro 页头结构。
- 规范风险：初始发现 18 个 Vue 文件缺少版权头，本次已补齐。
- 技术栈风险：1 个文件仍残留 Element 旧风格。

## 已完成收口

| 页面 | 文件 | 处理结果 |
| --- | --- | --- |
| 关注回复 | `backend/likeadmin-go/admin/src/views/channel/wx_oa/reply/follow_reply.vue` | 已改为 Arco Pro Search Table |
| 关键词回复 | `backend/likeadmin-go/admin/src/views/channel/wx_oa/reply/keyword_reply.vue` | 已改为 Arco Pro Search Table |
| 默认回复 | `backend/likeadmin-go/admin/src/views/channel/wx_oa/reply/default_reply.vue` | 已改为 Arco Pro Search Table |

## 2026-05-01 追加收口

| 页面 | 文件 | 处理结果 |
| --- | --- | --- |
| AI 模型配置 | `backend/likeadmin-go/admin/src/views/setting/website/ai_model.vue` | 已通过 `pro-admin.scss` 隐藏自定义工作区、入口说明和统计卡片，保留配置表单主体 |
| 订单管理 | `backend/likeadmin-go/admin/src/views/consumer/order/index.vue` | 已增加页面治理类名，并隐藏大页头、修复上下文、交付指标和交付工作台区块 |
| 素材中心 | `backend/likeadmin-go/admin/src/views/material/index.vue` | 已隐藏大页头和素材工作区，保留素材管理卡片主体 |
| 图标库 | `backend/likeadmin-go/admin/src/views/material/icons.vue` | 已隐藏大页头和图标工作区，保留图标素材池主体 |

## 2026-05-03 追加收口

| 页面 | 文件 | 处理结果 |
| --- | --- | --- |
| H5 渠道设置 | `backend/likeadmin-go/admin/src/views/channel/h5.vue` | 已通过 `pro-admin.scss` 隐藏页头/统计/工作区及侧栏提示，收口为主表单单列 |
| 微信小程序设置 | `backend/likeadmin-go/admin/src/views/channel/weapp.vue` | 已通过 `pro-admin.scss` 隐藏页头/统计/工作区及侧栏提示，收口为主表单单列 |
| 微信开放平台设置 | `backend/likeadmin-go/admin/src/views/channel/wx_dev.vue` | 已通过 `pro-admin.scss` 隐藏页头/统计/工作区及侧栏提示，收口为主表单单列 |
| 微信公众号设置 | `backend/likeadmin-go/admin/src/views/channel/wx_oa/config.vue` | 已通过 `pro-admin.scss` 隐藏页头/统计/工作区及侧栏提示，收口为主表单单列 |
| 公众号菜单设置 | `backend/likeadmin-go/admin/src/views/channel/wx_oa/menu.vue` | 已通过 `pro-admin.scss` 隐藏页头/统计/工作区及发布检查侧栏，保留手机预览与菜单配置主区 |

## P0 当前状态（2026-05-03）

- 已完成：渠道配置与微信公众号配置共 5 页（`h5 / weapp / wx_dev / wx_oa/config / wx_oa/menu`）。
- 已纳入统一治理样式：权限、组织、系统日志/缓存、官网工具目录与前端布局核心页面，已隐藏大页头、指标卡、工作区摘要、筛选摘要条和反馈面板，保留标准筛选 + 表格/表单主区。
- 待继续精修：逐页检查文案密度、按钮分布和空态提示，避免“结构已收口但交互层仍冗余”。

## 高风险页面

这些页面同时存在自定义 `workspace`、统计卡片、页面头或大面积非 Arco Pro 结构，优先收口：

| 优先级 | 模块 | 文件 |
| --- | --- | --- |
| P0 | 渠道配置 | `backend/likeadmin-go/admin/src/views/channel/h5.vue` |
| P0 | 渠道配置 | `backend/likeadmin-go/admin/src/views/channel/weapp.vue` |
| P0 | 渠道配置 | `backend/likeadmin-go/admin/src/views/channel/wx_dev.vue` |
| P0 | 微信公众号 | `backend/likeadmin-go/admin/src/views/channel/wx_oa/config.vue` |
| P0 | 微信公众号 | `backend/likeadmin-go/admin/src/views/channel/wx_oa/menu.vue` |
| P0 | 权限 | `backend/likeadmin-go/admin/src/views/permission/admin/index.vue` |
| P0 | 权限 | `backend/likeadmin-go/admin/src/views/permission/menu/index.vue` |
| P0 | 权限 | `backend/likeadmin-go/admin/src/views/permission/role/index.vue` |
| P0 | 组织 | `backend/likeadmin-go/admin/src/views/organization/department/index.vue` |
| P0 | 组织 | `backend/likeadmin-go/admin/src/views/organization/post/index.vue` |
| P0 | 系统 | `backend/likeadmin-go/admin/src/views/setting/system/cache.vue` |
| P0 | 系统 | `backend/likeadmin-go/admin/src/views/setting/system/journal.vue` |
| P0 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/frontend_layout.vue` |
| P0 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/tools_catalog.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/ai_model.vue` |
| P1 | 用户订单 | `backend/likeadmin-go/admin/src/views/consumer/order/index.vue` |
| P1 | 素材 | `backend/likeadmin-go/admin/src/views/material/index.vue` |
| P1 | 素材 | `backend/likeadmin-go/admin/src/views/material/icons.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/filing.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/footer.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/header.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/hot_tools.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/information.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/license.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/protocol.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/seo.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/sidebar.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/tool_ranking_config.vue` |
| P1 | 官网配置 | `backend/likeadmin-go/admin/src/views/setting/website/tool_ranking_manage.vue` |
| P2 | 字典 | `backend/likeadmin-go/admin/src/views/setting/dict/data/index.vue` |
| P2 | 字典 | `backend/likeadmin-go/admin/src/views/setting/dict/type/index.vue` |

## 版权头检查

以下文件在本次巡检中发现缺少版权头，已补齐：

- `backend/likeadmin-go/admin/src/views/channel/wx_oa/menu_com/oa-attr.vue`
- `backend/likeadmin-go/admin/src/views/channel/wx_oa/menu_com/oa-menu-form-edit.vue`
- `backend/likeadmin-go/admin/src/views/channel/wx_oa/menu_com/oa-menu-form.vue`
- `backend/likeadmin-go/admin/src/views/channel/wx_oa/menu_com/oa-phone.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/pages/attr-setting.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/widgets/banner/content.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/widgets/customer-service/content.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/widgets/my-service/content.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/widgets/nav/content.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/widgets/news/attr.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/widgets/news/content.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/widgets/search/attr.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/widgets/search/content.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/widgets/user-banner/content.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/widgets/user-info/attr.vue`
- `backend/likeadmin-go/admin/src/views/decoration/component/widgets/user-info/content.vue`
- `backend/likeadmin-go/admin/src/views/error/403.vue`
- `backend/likeadmin-go/admin/src/views/error/404.vue`

## 旧技术栈痕迹

- `backend/likeadmin-go/admin/src/views/consumer/lists/detail-popup.vue` 存在 Element 旧风格关键词，需要后续确认是否为真实依赖或历史残留。

## 收口标准

后续后台页面统一按以下规则处理：

1. 列表页优先使用 Arco Pro Search Table：`container`、`general-card`、筛选表单、查询/重置、操作栏、表格工具按钮、标准表格。
2. 配置页优先使用 Arco Pro 基础表单页：单卡片承载表单，避免大面积自定义工作台。
3. 仪表盘页可保留卡片，但卡片圆角、间距、阴影必须贴近 Arco Pro，不再使用营销化大标题和大面积渐变。
4. 同模块页面必须先统一，再跨模块推广。
5. 不改接口、权限点、菜单、业务策略；只做展示层和交互层收口。

## 建议推进顺序

1. P0：渠道配置、微信公众号配置、权限、组织、系统缓存/日志、官网工具目录。
2. P1：官网配置系列、素材中心、订单列表。
3. P2：字典、搜索、存储、用户设置等常规管理页。
4. 最后处理装饰器/可视化编辑器类页面，因为它们不是标准表格页，需要单独定义编辑器规范。
