<!--
  @copyright Tomda (https://www.tomda.top)
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2026-10-19
-->

# 后台运营流程审计与重构建议

## 检查范围与证据边界

- 代码基准：`9b4c11e0ee0be3cb26025ee6f6879ef99f5da2f9`，产品版本 `3.0.3`。
- 本轮为只读代码审计，检查 LikeAdmin Vue 后台及相关 Go 配置契约，没有修改后台实现、数据库菜单、权限或生产数据。
- 实际浏览器访问 `http://localhost:5180/workbench` 后重定向至带图形验证码的登录页；没有可用的已登录会话，未完成后台登录后的点击、保存或视觉回归。本文不将代码推断表述为浏览器验收结果。
- 主 Agent 已复核广告加载与保存、计费 `0 || 1`、最终 SEO 字段优先级的代码。其他条目同样以当前源码为证，不代表完整业务流程均已复现。
- 上一轮已完成目录搜索与抽屉、权限导航筛选、部分配置页统一保存条和加载保护、Go 网站配置事务 patch，详见[上一轮记录](admin-optimization-2026-10-18.md)。本文聚焦仍存在的流程问题，不将这些已修内容重复列为缺陷。

下面的行号对应检查时源码，供定位使用；后续改动可能使其偏移。

## 六项具体问题

### 1. 广告等配置页读取失败后仍能发布默认内容

广告页 `loadAdvertising` 在请求失败时回填默认广告和热门工具，再更新为当前基线；`handleSubmit` 只检查重复提交和字段格式，没有首次读取成功或 `loadError` 门槛。此时运营仍可能把默认内容保存到真实配置。榜单和品牌基础信息页也只有读取失败提示，没有统一的首次加载成功门槛。

证据：

- [广告加载与失败回退](../backend/likeadmin-go/admin/src/views/operation/advertising/index.vue#L579)，579–596 行。
- [广告保存入口](../backend/likeadmin-go/admin/src/views/operation/advertising/index.vue#L736)，736–758 行。
- [榜单读取与保存](../backend/likeadmin-go/admin/src/views/setting/website/tool_ranking_config.vue#L291)，291–338 行。
- [品牌基础信息读取](../backend/likeadmin-go/admin/src/views/setting/website/information.vue#L289)，289–301 行；[保存入口](../backend/likeadmin-go/admin/src/views/setting/website/information.vue#L335)，335–343 行。

建议优先补齐这些页的加载、失败、重试、保存禁用状态，复用现有 [ConfigEditFrame](../backend/likeadmin-go/admin/src/views/setting/website/components/config-edit-frame.vue#L10)，并在提交函数内部再次校验状态。不能仅禁用按钮，也不能把失败后的默认值当成已读取内容。

### 2. 单工具计费修改经过多次保存，默认同步又不更新旧规则

工具抽屉编辑的是计费种子，需要“加入待保存更改 → 保存工具目录 → 同步计费策略”。实际执行规则又可在登录与积分页独立修改，运营需要理解两个配置来源。默认 `append` 模式遇到已有 `toolKey` 直接跳过，因此修改已有工具积分后同步也不会应用新值。

还存在具体零值错误：新规则使用 `Number(seedRule.consumePoints || 1)`，会将显式配置的 `0` 改成 `1`；上游种子生成和输入控件都允许零积分。

证据：

- [计费种子说明、允许零值的输入和抽屉提交](../backend/likeadmin-go/admin/src/views/setting/website/components/catalog-tool-editor.vue#L61)，61–69 行。
- [默认 append 模式](../backend/likeadmin-go/admin/src/views/setting/website/tools_catalog.vue#L517)，517 行。
- [上游保留零积分](../backend/likeadmin-go/admin/src/views/setting/website/tools_catalog.vue#L1109)，1109–1112 行。
- [跳过旧规则及零值转换](../backend/likeadmin-go/admin/src/views/setting/website/tools_catalog.vue#L1730)，1730–1739 行。
- [读取整份登录配置再同步规则](../backend/likeadmin-go/admin/src/views/setting/website/tools_catalog.vue#L1768)，1768–1787 行。
- [实际工具计费规则的另一处编辑入口](../backend/likeadmin-go/admin/src/views/setting/user/login_register.vue#L346)，346–425 行。

建议先修零值，并在工具详情显示实际执行规则、来源和未同步差异。后续按单个工具应用明确差异，避免运营用“全量覆盖”修改一个工具。把种子和实际规则合并为一次保存前，需要先确定接口权限、事务和并发边界。

### 3. 工具管理能改文案，但日常结构操作仍依赖整树 JSON

简版工具表当前只有编辑动作；没有新增、移动分类、排序和可见性管理。抽屉只读展示分类和工具链接，分类结构变更仍要进入高级编辑修改完整 JSON。这使非技术运营在基本维护中也必须理解嵌套结构。

证据：

- [工具表及其唯一行操作](../backend/likeadmin-go/admin/src/views/setting/website/components/catalog-tool-editor.vue#L19)，19–34 行。
- [分类位置和只读工具链接](../backend/likeadmin-go/admin/src/views/setting/website/components/catalog-tool-editor.vue#L37)，37–44 行。
- [工具分类树 JSON 编辑区](../backend/likeadmin-go/admin/src/views/setting/website/tools_catalog.vue#L307)，307–350 行。

建议将分类树、工具列表和单工具详情分开表达，为已有工具提供选择分类、移动及排序。路由绑定先保留只读；新增站内路由仍须有实际页面实现。不要直接把现有 `status` 字段当上架状态，它目前参与生成计费规则；工具可见性须另行确定字段语义。

### 4. 前台菜单与工具分类靠手输名称绑定，分类改名可能使菜单变空

菜单设置需要分别填写菜单 key、显示标题和分类标题。前台通过 `cate.title === cateTitle` 精确匹配分类，而后台只检查必填，没有验证分类是否存在。运营改名或输错分类名称后，可能得到“保存成功但菜单没有工具”的结果。

证据：

- [菜单名称和分类标题输入](../backend/likeadmin-go/admin/src/views/setting/website/sidebar.vue#L190)，190–205 行。
- [只判断必填和链接格式](../backend/likeadmin-go/admin/src/views/setting/website/sidebar.vue#L839)，839–852 行。
- [前台按名称精确匹配](../src/components/Layout/Left/Left.vue#L337)，337–341 行。

建议把分类标题输入改成真实分类选择器，先补存在性校验和受影响入口提示，再逐步以稳定分类标识绑定。迁移时保留历史名称兼容，不能直接使线上旧配置失效。

### 5. 工具 SEO 与页面覆写仍重叠，各字段优先级不一致

全站与固定页面 SEO 页的推荐模板仍包含图片压缩、JSON 等工具路径，工具详情又维护自己的 SEO。最终标题优先读取页面覆写，描述、关键词和分享图则优先读取工具字段，因此一个工具的最终元数据可能混合两个配置来源，运营无法在单处判断生效结果。

证据：

- [固定页 SEO 推荐中的工具路径](../backend/likeadmin-go/admin/src/views/setting/website/seo.vue#L258)，258–270 行。
- [最终标题、关键词、描述和分享图优先级](../src/services/siteSeo.ts#L148)，148–182 行。

建议单工具 SEO/GEO 归工具详情，全站页维护默认值与固定页面。详情增加最终标题、描述、分享图预览和来源说明。历史工具路径覆写需有兼容和迁移策略，不能直接删除或在未确认时改变线上优先级。

### 6. 发布更新记录仍要求编辑嵌套 JSON，首页内容页还保留大量已关闭模块

当前首页内容页真正开放的模块只有每日学习和更新记录。更新记录正文依然是 JSON 文本框，并建议导出后修改再导入；发一条版本记录缺少版本表单和条目编辑。该文件还保留已关闭的菜单、工具目录、SEO、头尾等完整模板与状态，维护成本较高。

证据：

- [实际可见模块白名单](../backend/likeadmin-go/admin/src/views/setting/website/frontend_layout.vue#L2663)，2663 行；[可见性判断](../backend/likeadmin-go/admin/src/views/setting/website/frontend_layout.vue#L2701)，2701–2712 行。
- [时间线 JSON 编辑与导入导出建议](../backend/likeadmin-go/admin/src/views/setting/website/frontend_layout.vue#L916)，916–935 行。
- [仅负责首页内容和更新记录的保存 payload](../backend/likeadmin-go/admin/src/views/setting/website/frontend_layout.vue#L5680)，5680–5706 行。

建议更新记录独立为“版本列表 → 版本编辑 → 功能条目 → 预览”流程；首页内容只维护首页真实模块。逐步拆除不可达模板，继续兼容已有配置字段和内容结构。

## 按运营任务组织四组导航

| 分组 | 运营者要完成的事 | 建议包含的入口 |
| --- | --- | --- |
| 工具运营 | 找到工具、改信息、维护分类、检查实际使用情况 | 工具列表、分类管理、单工具详情、工具访问与榜单数据 |
| 站点运营 | 改首页展示和入口、发布内容、检查收录配置 | 首页内容、广告与人工推荐、导航/头部/页脚、更新记录、全站与固定页 SEO |
| 用户与计费 | 查看用户和订单、设置实际权益与收费、配置收款 | 用户、订单、积分与会员、支付接入、登录访问规则；单工具详情提供实际规则与明确关联入口 |
| 系统管理 | 管理后台人员、权限、品牌和维护配置 | 账号角色权限、后台品牌、系统维护及现有运维入口；备案和协议按权限保留可定位入口 |

分组先通过前端展示层映射现有已授权路由实现，不先删除或重建数据库菜单。无权限入口继续隐藏；菜单 query、已有 URL 和按钮权限不丢失。每个配置只设一个主要维护位置，其他任务页显示只读摘要或明确关联入口，不复制另一套表单。

## 第一阶段：完成一个单工具详情保存流程

目标流程：**搜索工具 → 打开详情 → 修改基本信息或 SEO/GEO → 保存一次 → 查看实际生效结果。**

第一阶段边界：

1. 以现有工具表和抽屉为起点，保留 Vue、Arco 和现有路由权限体系。将“加入待保存更改”与全页保存的两层操作收敛为清晰的单工具保存；不能仅改按钮名称而仍要求第二次保存。
2. 首先覆盖名称、简介、标签和 SEO/GEO。分类与路由绑定可先只读，避免把新增路由、分类标识迁移和整个工具树 CRUD 混入同一阶段。
3. 展示实际计费规则、来源和种子差异；第一阶段不在保存文案时隐式同步、覆盖实际积分规则，不改会员权益、支付或风控策略。计费改造单独补零值、旧规则更新及接口事务测试。
4. 保留现有 Go 接口与配置格式的兼容性、扩展字段和生产内容。如果需要新增按工具 patch 接口，应校验当前工具编辑基线，在事务中读取并更新目标条目，不能把过期整树覆盖最新目录。
5. 读取失败时禁存，提交中锁定本次编辑，失败保留草稿并可重试；成功依据已提交快照或服务端回读更新基线。预览展示最终配置，并明确已保存内容与尚未保存草稿。
6. 先补广告等旧页的读取失败保存保护，再扩展统一配置框架；不以重构为理由继续暴露已确认的覆盖风险。

验收应包含：

- 普通单工具信息修改只需一次持久化保存，保存后回读和前台对应工具一致，不再要求全页第二次保存。
- 其他工具、分类结构和未知扩展字段保持原值；并发编辑或旧基线冲突明确提示，不静默覆盖。
- SEO/GEO 显示最终生效内容及来源；历史页面覆写造成的差异可解释，不擅自改变线上既定优先级。
- 读取失败、接口超时、保存失败、提交中修改、取消离开、重试成功均有可验证状态；读取失败不能发布默认配置。
- 无权限账号不能看到或调用保存入口；保持既有角色和接口权限校验。
- 320/375/768/1440px 实际浏览器验证，加上有意义的数据更新、错误和并发测试；配置往返以隔离数据或原值回写验证，不能把测试文案写入生产。
- 后台 TypeScript、构建及受影响测试通过，并记录实际验证范围。当前尚未实施上述流程，也尚未完成本轮后台登录后的验收。

本轮只增加此审计文档，不升级版本、不提交或推送 Git，也不打包部署。实现和正式发布应分别确认实际完成范围与验证证据。
