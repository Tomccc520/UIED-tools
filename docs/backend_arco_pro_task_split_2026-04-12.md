# 后台 Arco Pro 收口任务拆分

更新时间：2026-04-12

## 使用方式

- 本文档用于把后台 Arco Pro 收口工作拆成 4 份近似均等的任务。
- 每份任务都限制了明确文件范围，避免多人同时改同一个文件。
- 每份任务的第一句都固定为：
  - `解决这些问题，之后检查是否有其它问题，直到无法再发现问题为止`
- 默认执行仓库：
  - `/Users/tangxiaoda/Desktop/网站备份/tools-web-master 2/tools-web/backend/likeadmin-go/admin`

## 通用执行规则

1. 只能修改自己负责的文件范围，不跨范围修别人的文件。
2. 每份任务都必须跑：
   - `npm run type-check`
   - 至少对自己负责的页面做真实页面回归
3. 每份任务都必须检查控制台 warning / error。
4. 如果发现问题属于别的任务范围：
   - 只记录
   - 不跨范围直接修改
5. 每份任务都要先修已知问题，再继续扩展扫描，直到本范围内无法继续发现问题。

## 任务 1：壳层 / Navbar / Workbench / 登录页

解决这些问题，之后检查是否有其它问题，直到无法再发现问题为止

### 文件范围

- `src/layout/default/**`
- `src/views/workbench/**`
- `src/views/account/login.vue`
- `src/views/account/components/**`
- `src/router/index.ts`
- `src/App.vue`

### 禁止修改

- `src/views/setting/website/**`
- `src/views/material/**`
- `src/components/material/**`
- `src/views/permission/**`
- `src/views/organization/**`
- `src/views/channel/**`
- `src/views/setting/system/**`

### 目标

- 把后台壳层、navbar、workbench、登录页继续收成更接近官方 Arco Pro 的成品状态。
- 清掉这条链路里的运行时 warning / error。

### 详细清单

1. 检查顶部 navbar 的按钮组间距、hover、圆角、边框、图标大小、右侧留白是否统一。
2. 检查全局搜索弹层：
   - 头部说明
   - 输入框
   - 快捷入口
   - 结果列表
   - 空态
   - 键盘导航
3. 检查通知抽屉：
   - 头部说明
   - 统计卡
   - 操作按钮
   - 通知列表
   - 空态
   - 跳转路径提示
4. 检查头像下拉、面包屑、多标签栏是否还带有旧 likeadmin 风格。
5. 检查侧栏在以下宽度下是否稳定：
   - `1366`
   - `1200`
   - `1160`
   - `1100`
   - `900`
   - `820`
   - `768`
6. 检查 workbench 左右栏比例、卡片高度、图表区、快捷操作、最近访问、系统信息、服务支持区的密度是否统一。
7. 检查 workbench 是否还存在：
   - Arco props 警告
   - 路由相关告警
   - 断点布局问题
8. 检查登录页左侧 banner、右侧表单、验证码、错误提示、演示账号卡片、底部版权是否属于同一套后台视觉体系。
9. 检查移动端登录页和后台首页是否有：
   - 溢出
   - 错位
   - 双滚动条

### 必做回归

- `npm run type-check`
- 真实检查 `/login`
- 真实检查 `/workbench`
- 检查 `/workbench` 控制台 warning / error，目标为 `0`

### 验收标准

- `workbench` 控制台 `0 warning / 0 error`
- `navbar` 的搜索弹层和通知抽屉达到可演示水平
- 登录页、workbench、layout shell 看起来属于同一套 Arco Pro 后台

## 任务 2：官网设置上半区

解决这些问题，之后检查是否有其它问题，直到无法再发现问题为止

### 文件范围

- `src/views/setting/website/frontend_layout.vue`
- `src/views/setting/website/information.vue`
- `src/views/setting/website/sidebar.vue`
- `src/views/setting/website/header.vue`
- `src/views/setting/website/hot_tools.vue`
- `src/views/setting/website/components/operate-collapse.vue`

### 禁止修改

- `src/layout/default/**`
- `src/views/workbench/**`
- `src/views/account/**`
- `src/views/setting/website/footer.vue`
- `src/views/setting/website/seo.vue`
- `src/views/setting/website/protocol.vue`
- `src/views/setting/website/filing.vue`
- `src/views/setting/website/license.vue`
- `src/views/setting/website/ai_model.vue`
- `src/views/material/**`
- `src/components/material/**`
- `src/views/permission/**`
- `src/views/organization/**`
- `src/views/channel/**`
- `src/views/setting/system/**`

### 目标

- 把首页布局、网站信息、侧栏菜单、头部设置、热门工具收成统一的运营工作区。

### 详细清单

1. 检查 `frontend_layout` 首屏入口卡是否还过高、过散、说明过多。
2. 检查 `frontend_layout` 主配置区里：
   - Banner
   - 更新记录
   - 说明块
   - 空态
   - 按钮节奏
3. 检查 `information` 页是否和其它官网设置页保持一致的：
   - page header
   - workspace
   - group 区块节奏
4. 检查 `sidebar` 页中的：
   - 品牌区
   - 推荐链接
   - 一级菜单
   - 底部入口
   - AI 工具箱左栏菜单
   - 空态文案和操作建议
5. 检查 `header` 页中的：
   - 头部快捷链接
   - 搜索快捷入口
   - AI 对话页链接
   - AI 通用页链接
   - 说明与空态
6. 检查 `hot_tools` 页的：
   - 工作区
   - 统计卡
   - 列表卡片
   - 空态
   - 链接说明
7. 检查 `operate-collapse` 是否还有重复动作入口、重复说明块、重复保存触点。
8. 检查这些页面的 page-header、状态 tag、右侧动作区口径是否一致。
9. 检查这些页面是否都保留“底部唯一主保存”。

### 必做回归

- `npm run type-check`
- 真实检查 `/official_site/frontend_layout`
- 真实检查 `/official_site/information`
- 真实检查 `/official_site/sidebar`
- 真实检查 `/official_site/header`
- 真实检查 `/official_site/hot_tools`

### 验收标准

- 页面属于同一个产品体系
- 空态和操作建议可以直接给运营使用
- 没有明显重复说明区或重复保存按钮

## 任务 3：官网设置下半区 + 素材中心

解决这些问题，之后检查是否有其它问题，直到无法再发现问题为止

### 文件范围

- `src/views/setting/website/footer.vue`
- `src/views/setting/website/seo.vue`
- `src/views/setting/website/protocol.vue`
- `src/views/setting/website/filing.vue`
- `src/views/setting/website/license.vue`
- `src/views/setting/website/ai_model.vue`
- `src/views/material/index.vue`
- `src/views/material/icons.vue`
- `src/components/material/**`

### 禁止修改

- `src/layout/default/**`
- `src/views/workbench/**`
- `src/views/account/**`
- `src/views/setting/website/frontend_layout.vue`
- `src/views/setting/website/information.vue`
- `src/views/setting/website/sidebar.vue`
- `src/views/setting/website/header.vue`
- `src/views/setting/website/hot_tools.vue`
- `src/views/permission/**`
- `src/views/organization/**`
- `src/views/channel/**`
- `src/views/setting/system/**`

### 目标

- 把页脚、SEO、协议、备案、授权、AI 模型和素材中心这条链路收成真正可运营的后台成品。

### 详细清单

1. 检查 `footer` 页中的：
   - 技术支持
   - 备案与版权
   - 友情链接
   - 官方媒体
   - 分组配置
   - 空态与说明文案
2. 检查 `seo` 页中的：
   - 默认 SEO
   - 页面级 SEO
   - 分享图说明
   - 路径提示
   - 空态
3. 检查 `protocol`、`filing` 页是否仍有：
   - 文案语气不一致
   - 操作密度失衡
   - 说明过长
4. 检查 `license` 页的：
   - 授权状态卡
   - 风险说明
   - 异常引导
   - 动作按钮
5. 检查 `ai_model` 页的：
   - Provider
   - 工具能力
   - 模型字段说明
   - 旧结构残留
6. 检查 `material/index` 三栏布局在不同宽度下是否稳定，不能再出现：
   - tabs 半宽
   - 右栏挤压
   - 内容错位
7. 检查素材详情区的附件信息排版是否接近 WordPress 媒体库的可读性。
8. 检查素材空态、筛选空态、未选中素材空态文案是否专业。
9. 检查图标库是否与素材中心保持同一套风格。
10. 检查素材中心控制台是否还有 warning / error。

### 必做回归

- `npm run type-check`
- 真实检查 `/official_site/footer`
- 真实检查 `/official_site/seo`
- 真实检查 `/official_site/protocol`
- 真实检查 `/official_site/filing`
- 真实检查 `/official_site/license`
- 真实检查 `/official_site/ai_model`
- 真实检查 `/material/index`
- 真实检查 `/material/icons`

### 验收标准

- 官网设置下半区页面风格完全统一
- 素材中心能直接给运营和内容团队使用
- 控制台无明显 warning / error

## 任务 4：权限 / 组织 / 渠道 / 系统设置

解决这些问题，之后检查是否有其它问题，直到无法再发现问题为止

### 文件范围

- `src/views/permission/**`
- `src/views/organization/**`
- `src/views/channel/**`
- `src/views/setting/system/**`

### 禁止修改

- `src/layout/default/**`
- `src/views/workbench/**`
- `src/views/account/**`
- `src/views/setting/website/**`
- `src/views/material/**`
- `src/components/material/**`

### 目标

- 把权限管理、组织管理、渠道设置、系统设置这几组页面统一成同一套 Pro 工作区模板。

### 详细清单

1. 检查管理员、角色、菜单三张列表页的：
   - 筛选区
   - 反馈条
   - 批量操作区
   - 空态
   - 表格操作列
2. 检查管理员编辑、角色编辑、角色授权、菜单编辑弹窗是否还有：
   - 表单区块不一致
   - 说明块混乱
   - 按钮口径不统一
3. 检查部门、岗位页是否已经达到和权限页同级别的成品感。
4. 检查渠道设置下的小程序、公众号、H5、微信开放平台等页面，是否还有旧风格残留或说明不足。
5. 检查系统设置里的环境、日志、缓存页是否仍然存在：
   - 空页感
   - 无反馈
   - 无说明
6. 检查这些页是否还残留旧 likeadmin / Element 风格。
7. 检查主按钮、次按钮、危险按钮、页头动作区、表格操作列是否统一。
8. 检查这些页在中等宽度下是否有：
   - 换行
   - 挤压
   - 表头溢出
   - 弹窗内容超长
9. 检查所有真实页面控制台 warning / error。

### 必做回归

- `npm run type-check`
- 真实检查 `/permission/admin`
- 真实检查 `/permission/role`
- 真实检查 `/permission/menu`
- 真实检查 `/organization/department`
- 真实检查 `/organization/post`
- 真实检查 `/channel/wx_dev`
- 真实检查 `/channel/weapp`
- 真实检查 `/channel/h5`
- 真实检查 `/channel/wx_oa/config`
- 真实检查 `/setting/system/environment`
- 真实检查 `/setting/system/journal`
- 真实检查 `/setting/system/cache`

### 验收标准

- 权限、组织、渠道、系统设置四组页面形成统一后台模板
- 控制台无明显 warning / error
- 可以作为后续新模块的 UI / 交互模板

## PM 分发建议

### 角色建议

- `Jammy`：优先接任务 1
- `Jason`：优先接任务 2
- `Tomda`：优先接任务 3
- `Planck`：不建议直接改代码，优先负责交叉验收和回归

### PM 的下发顺序

1. 先发任务 1
   - 先收壳层、navbar、workbench、登录页
   - 可以减少后面真页回归噪音
2. 再发任务 2
   - 官网设置上半区直接影响运营使用
3. 再发任务 3
   - 官网设置下半区和素材中心是商业交付感最强的部分
4. 最后发任务 4
   - 作为后台基础管理页统一收尾

## Planck 验收口径

Planck 不直接改代码时，建议独立执行以下验收：

1. 逐页检查控制台 warning / error。
2. 逐页截图，标记：
   - 过密
   - 过空
   - 空态不专业
   - 说明语气不统一
   - 断点错位
3. 对每份任务只提“本范围内”的问题，不跨范围混提。
4. 每份任务验收时必须附：
   - 页面地址
   - 截图
   - 问题级别
   - 是否复现稳定

## 备注

- 如果后续要进一步切成子代理短提示词版本，可以再从本文件提炼。
- 如果后续要做 commit + push，建议按任务号分 4 个独立 commit，避免范围混乱。
