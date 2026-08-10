<!--
  @copyright Tomda (https://www.tomda.top)
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2026-08-11
-->

# AI 简历同域接入与部署

## 架构边界

- UIED-Tools 主站保持 Vue 3 + Vite 独立构建。
- AI 简历保持 Next.js 14 独立构建，默认监听 `127.0.0.1:3002`。
- Nginx 将 `/tools/ai-resume/*` 原路径转发到 Next.js，不使用 iframe，不合并两套框架依赖。
- 历史地址 `/tools/ai/resume` 统一 301 到新入口，主站运行时也保留整页跳转兼容。
- 主站工具卡仍经过 `useToolRuntimeGate`，可继续由后台控制停用、登录与计费策略。

## 本地联调

1. 在 AI 简历仓启动 Next.js：

```bash
cd /path/to/airesume
npm run dev
```

2. 主站 `.env` 保留：

```dotenv
VITE_RESUME_PROXY_TARGET=http://127.0.0.1:3002
```

3. 启动或重启 UIED-Tools，再验证：

```bash
npm run dev
npm run smoke:ai-resume-integration
```

本地入口为 `http://127.0.0.1:5179/tools/ai-resume`，编辑器为 `http://127.0.0.1:5179/tools/ai-resume/editor`。

## 生产部署

1. 按 AI 简历仓 `.env.example` 配置 `NEXT_PUBLIC_APP_BASE_PATH=/tools/ai-resume`。
2. 执行 AI 简历的 `npm ci && npm run build && PORT=3002 npm start`。
3. 把 [`deploy/nginx/ai-resume.location.conf`](../deploy/nginx/ai-resume.location.conf) 放入 `uiedtool.com` 站点的 `server` 块，位于主站 `location /` 之前。
4. 执行 `nginx -t` 后平滑重载 Nginx。
5. 应用后台升级补丁 `20260811_integrate_ai_resume_app.sql`，将工具主数据旧地址更新为新入口。

`proxy_pass http://127.0.0.1:3002;` 末尾不能带 `/`，否则 `_next` 与 `/api/ai` 会 404。

## 登录边界

当前主站登录总开关关闭时，AI 简历可免登录使用；开启后，从主站工具卡进入会按 `ai-resume` 策略校验。Next.js 子应用目前不伪造共享登录态，直接访问子路径仍为公开工具。如后续需要硬性会员保护，应增加同域 SSO 校验或 Nginx `auth_request`，不应只依赖前端弹窗。

## 验收清单

- `/tools/ai-resume` 和 `/tools/ai-resume/editor` 直接访问、刷新均返回 200。
- HTML 里的资源地址以 `/tools/ai-resume/_next/` 开头。
- `/tools/ai-resume/api/ai` 无效 JSON 返回 400，不得返回 404。
- 编辑、模板切换、AI 对比/应用/撤销、PDF/Word 导出正常。
- 主站首页、热榜、搜索、会员中心和其他工具路由不受影响。

若部署平台无法按路径转发到独立 Node.js 服务，备选方案是 `resume.uiedtool.com`。这是基础设施限制，不应通过把 Next.js 源码直接混入 Vue 主站解决。
