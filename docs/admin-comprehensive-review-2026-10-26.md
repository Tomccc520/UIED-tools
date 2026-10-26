# 后台配置与操作检查：2026-10-26

版本保持 **3.0.6**。本轮继续上一批后台重构，不制作部署包，不导入数据库，不替换生产配置。检查基线为 `cee394d7`，全部前后端源码仍由根仓管理。

## 检查范围与结论

用户手动完成本地验证码登录后，对当前账号可访问的 **40 个菜单入口**完成实际浏览器读取和导航检查。核心配置、素材与用户管理九个页面完成 **320 / 375 / 768 / 1440px 共 36 组**布局检查；素材工具栏精简后再完成八组复核。对应记录与截图位于被忽略的 `output/playwright/admin-comprehensive/`。

这能确认入口、页面渲染、配置读取、主要布局及指定保存链路，不代表每个页面的全部新增、删除、权限、支付、发消息及第三方平台动作都已验收。本轮没有执行真实删除、角色授权、支付、公众号发布或法务正文保存。

| 业务范围 | 实际打开的路由 |
| --- | --- |
| 工作台 | `/workbench` |
| 用户与订单 | `/consumer/login_commerce`、`/consumer/order`、`/consumer/lists` |
| 渠道 | `/channel/weapp`、`/channel/wx_oa/default`、`/channel/wx_oa/keyword`、`/channel/wx_oa/follow`、`/channel/wx_oa/menu`、`/channel/wx_oa/config`、`/channel/h5`、`/channel/wx_dev` |
| 组织 | `/organization/department`、`/organization/post` |
| 权限 | `/permission/admin`、`/permission/role`、`/permission/menu` |
| 运营与素材 | `/operation/advertising`、`/material/icons`、`/material/index` |
| 官网内容与工具 | `/official_site/frontend_layout`、`/official_site/tools_catalog`、`/official_site/tool_ranking_config`、`/official_site/tool_ranking_manage` |
| 官网导航与基础配置 | `/official_site/sidebar`、`/official_site/header`、`/official_site/footer`、`/official_site/seo`、`/official_site/information`、`/official_site/filing`、`/official_site/protocol` |
| AI | `/ai_model_manage/ai_ability`、`/ai_model_manage/ai_provider`、`/ai_model_manage/ai_model` |
| 系统与开发 | `/setting/storage`、`/setting/system/environment`、`/setting/system/cache`、`/setting/system/journal`、`/dev_tools/dict`、`/dev_tools/code` |

## 本轮界面调整

- 网站管理按内容与工具、导航与外观、站点与收录直接在侧栏分组；移除页面上重复的配置导航。侧栏、面包屑、页签与搜索结果使用一致短名称，保留历史搜索别名。只重排账号已授权入口，不补造权限。
- 首页内容只维护文章栏目与更新记录。更新记录提供可视化版本、分组、逐条正文、排序及链接编辑；原始 JSON 作为可展开的导入和修正入口。小屏用可搜索选择器选历史版本，避免滑动几十张版本卡片。
- 后台品牌、备案版权、协议、广告、AI、登录与商业化及默认头像使用明确的读取、编辑和保存状态，去掉本轮触及页面里的重复统计、模式和说明层。
- 素材管理补回页面边距，将四张重复状态卡收成一行；名称搜索直接可用，关联内容筛选展开后使用。视图切换支持键盘，空结果不重复展示选择和附件详情。
- Tailwind 基础重置进入低优先级 CSS 层，避免加载顺序把 Arco 开关背景覆盖成透明。实际 DOM 已验证开启状态为品牌紫 `rgb(108, 84, 255)`。富文本标题样式限定到编辑器内容，避免污染其他页面标题。

## 功能修复

| 问题 | 修复与验证 |
| --- | --- |
| 读取失败后仍能保存默认值 | 登录与商业化、广告、基础资料、备案、协议、默认头像、热门搜索及素材压缩配置增加完整响应和读取成功门禁；失败保留原草稿并提供重试。 |
| 保存成功后重读失败被误报，或重读覆盖新编辑 | 使用提交时快照更新基线；不再把无关的第二次读取当作保存前提；新修改保持未保存状态。 |
| AI 三页覆盖彼此配置 | 新增可选 `scope=matting/provider/ability`；服务只写指定模块并在事务内保存，兼容旧完整请求，缺失模块数据明确拒绝。 |
| 协议、热搜、压缩策略部分写入 | 各组字段改为同一事务，任一写入失败全部回滚。协议 HTML 和空白不自动修订。 |
| 同值更新可能新增重复配置 | `ConfigUtil.Set` 在零影响行时先确认同键是否存在，存在即成功，查询失败返回错误；仅确实不存在时插入。未清理历史重复值。 |
| 协议页未编辑也拦截离开 | 富文本默认只读；明确进入正文编辑后才接受更新。初始化归一化不会改写原文。真实浏览器确认未编辑保持 ready 并能直接离开。 |
| 分页重置、迟到响应和空的末页 | 重置筛选回第一页；忽略旧响应；超出末页最多补查一次。用户、订单、日志明确区分失败和空结果。 |
| 删除、移动、重命名并发与失败反馈 | 权限和素材列表加入操作锁、选中 ID 快照及失败保留；写入成功但刷新失败单独提示。不执行真实删除来验收。 |
| 附件信息返回写到另一文件 | 提交时固定素材 ID 和表单快照；返回只更新同 ID 行，不覆盖切换后的素材或后续草稿。 |
| 关闭自动压缩、零阈值无法保存 | DTO 区分缺失与合法 0；关闭和阈值 0 均可保存，缺失/非法值继续拒绝。已完成本地真实保存和读回并恢复原策略。 |
| 字典类型无法停用 | DTO 接受显式 0/1，拒绝缺失和非法值；新增明确写入状态，避免 GORM 默认值把 0 变成 1。路由和真实 GORM SQL 生成测试覆盖。 |
| 缓存用量把 MiB 当百分比 | 按实际 MB 表达并动态设置量程；读取失败保留已有信息并提供重试。 |
| 后台预览仍读旧缓存 | 预览 URL 带 `_uied_preview=1`；主站配置与文章缓存仅在预览启动时成功刷新一次，失败可重试。普通用户缓存策略保留，不清空整个浏览器存储。 |

## 实际保存与隔离验证

1. 每日学习标题临时增加验收标记，后台保存、重新读取、公开配置 API 和新打开的主站预览均出现同一值；随后恢复原始“每日学习”，公开接口及预览再次确认原值。
2. 素材自动压缩临时切为关闭、阈值 0，保存并重新读取后仍为 false / 0；随后恢复原始开启 / 300KB，并重新读取确认。JPEG 质量和 PNG 等级未修改。
3. 独立端口、全内存 API 样例验证可视化更新记录保存与必填失败反馈：修改一个版本标题后，版本/分组扩展字段、历史记录和其他配置保持一致；清空版本号不能写入服务器样例。样例服务、临时入口和独立缓存已清理。

浏览器只能读到实际页面证据；没有读取或导出登录 token、密码或 API key。使用人工验证码登录，不运行自动验证码识别。

## 检查结果

- 后台 Node 真实脚本隔离回归：**166 / 166** 通过。
- 主站单测：**78 个文件，821 / 821** 通过。
- 主站、后台 TypeScript：通过。
- 主站 `npm run build:check`、后台 `COPY_TO_FRONTEND=0 npm run build`：通过；保留既有大分包提示，未同步部署目录。
- 静态 P0 操作入口检查：**27 个页面**通过。
- Go `./admin/service/common ./admin/routers/common ./util ./admin/service/setting ./admin/routers/setting`：通过，已使用最新源码构建并重启本地 8003。
- 36 组核心页面布局及素材额外八组复核：实际 innerWidth 与目标一致，文档横向溢出为 0。
- 没有宣称运行整套自动浏览器脚本；本轮真实 UI 验收通过已登录 CUA 会话，错误/并发/事务主要由隔离测试覆盖。

## 仍需持续处理

- 登录与商业化仍承载较多业务选项，订单表字段较多，渠道配置也保留了原业务结构。本轮修复保存和共享交互，尚不能称为全部业务流程已重新设计。
- 本地更新记录的人工摘要仍含 3.0.1 等历史运营文案；本轮保存验收恢复原始数据，没有擅自发布新的运营正文。
- 新建同键配置的并发竞争最终仍需数据库唯一约束与数据迁移共同处理；本轮不引入未确认的数据清理或结构迁移。
- 网站保存后再读取详情的极端响应边界仍需单独处理：若写入成功但详情读取失败，现有服务响应可能仍报告失败。
- 第三方支付、公众号、存储凭据、权限授权及删除需在明确的测试账号和可回收数据下逐项验收。入口能打开不能替代这些业务验收。

复现基础命令：

```sh
# 项目根目录
npx vue-tsc --noEmit
npm run test:unit -- --run
npm run build:check
git diff --check

# backend/likeadmin-go/admin
node --test scripts/*.test.mjs
node scripts/smoke-p0-actions.mjs
npm run type-check
COPY_TO_FRONTEND=0 npm run build

# backend/likeadmin-go/server
go test ./admin/service/common ./admin/routers/common ./util ./admin/service/setting ./admin/routers/setting
```
