<!--
  @copyright Tomda (https://www.tomda.top)
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2026-08-20
-->

# 拼豆图纸生成器主站接入与部署

## 架构边界

- UIED-Tools 主站保持 Vue 3 + Vite 构建。
- 拼豆的 React 画布挂载在 Vue 路由 `/tools/ai-perler` 内容区，直接复用主站 `App.vue` 的头部、左侧菜单、右侧推荐和页脚。
- 不使用 iframe、独立 Next.js 服务、端口 `3003` 或 Nginx 路径反向代理。
- 图纸生成、色板映射、统计、编辑与导出都在浏览器端完成，默认免登录、不扣积分。
- AI 图片优化默认关闭。启用前需先配置专用服务端接口和密钥，不能仅暴露前端环境变量。

## 本地联调

1. 在 UIED-Tools 主站执行 `npm install`。
2. 使用 `npm run dev -- --host 127.0.0.1 --port 5179` 启动主站。
3. 执行 `npm run smoke:ai-perler-integration`。

本地入口为 http://127.0.0.1:5179/tools/ai-perler，专心拼豆模式为 http://127.0.0.1:5179/tools/ai-perler/focus。

## 生产部署

1. 在 UIED-Tools 主站执行 `npm ci` 和 `npm run build`。
2. 按既有主站 Nginx 静态站点配置部署 `dist/`，不需要新增拼豆专用 `location`、Node 进程或端口。
3. 执行 `npm run smoke:ai-perler-integration`，确认主站壳层与拼豆画布均可访问。
4. 主站和后台启动后运行 `npm run sync:frontend-menus`，把拼豆图纸生成器同步进工具主数据。

## 开源合规

- 上游项目使用 Apache-2.0 协议。
- 主站源码目录 `src/components/Tools/AI/Perler/LICENSE` 必须随发布保留。
- 已移除上游广告、访问统计、打赏入口和强制域名跳转，不保留外部运营依赖。
