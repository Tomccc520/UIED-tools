# 后台页面规范（Arco Pro）

## 目标
- 新增页面默认采用统一的 Pro 风格页面骨架，避免“每页一个样式体系”。
- 保留 likeadmin-go 现有接口与权限体系，仅统一前端视觉与交互层。

## 页面骨架
- 页面根节点统一增加 `pro-page-shell`，控制最大宽度和左右留白。
- 内容区优先使用 `a-space` + `a-row/a-col` 组织模块，模块间距统一 `16px`。
- 业务模块卡片统一使用圆角 `12px`，边框 `var(--color-border-2)`。

## 标题与说明
- 主标题使用 `.pro-page-title`，说明文案使用 `.pro-page-subtitle`。
- 卡片标题统一使用左文案 + 右标签/操作按钮的 `card-title-row` 结构。

## 交互反馈
- 保存类动作统一给出：加载态、成功提示、失败提示。
- 模块配置页保留“未保存状态”提示，避免误操作离开。

## 样式基线文件
- 全局规范样式：`admin/src/styles/pro-admin.scss`
- 全局入口：`admin/src/styles/index.scss`

## 本轮已落地页面
- `admin/src/views/workbench/index.vue`
- `admin/src/views/account/login.vue`
