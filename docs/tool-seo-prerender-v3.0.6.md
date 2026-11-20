<!--
  @copyright Tomda (https://www.tomda.top)
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2026-10-25
-->

# 工具页首个 HTML 与运行时 SEO

3.0.6 为以下页面生成真实正文：

- `/`、`/about`、`/changelog`：首页工具目录、关于页和更新记录。
- `/tools/qrcode`：二维码生成。
- `/tools/dev/json-format`、`/tools/json`：JSON 格式化与压缩、JSON 转换与转义。
- `/tools/image-compress`：JPG、PNG、WebP 批量压缩。
- `/tools/gif-compress`：GIF 动图压缩。
- `/tools/pdf-compress`：PDF 批量压缩及扫描件有损压缩。
- `/tools/video/compress`：视频专业转码和浏览器本地压缩。
- `/tools/copywriting/kfc`、`/tools/copywriting/daily-poem`、`/tools/copywriting/dog-diary`、`/tools/copywriting/moments`：四个文案工具的站内精选。

Vue 3 主站保持原有架构；构建阶段通过隔离浏览器加载本次静态产物，输出页面原有正文、唯一 H1、表单与工具专属元数据，不根据 User-Agent 区分搜索引擎与普通访客，也不另写仅供爬虫读取的隐藏正文。

## 构建与访问

`npm run build`、`npm run build:check` 与 `npm run build:pro` 均由 Vite 构建钩子执行预渲染。输出位于 `dist/_prerender/`，清单记录路由、标题、描述、canonical、正文长度和文件哈希。上述页面缺少正文或就绪元素时构建失败。其他已登记页面也生成专属元数据和结构化数据，正文由 Vue 加载。可索引路由出现空白或重复标题、描述时，构建会报错。配置清单为 `src/config/prerender-routes.json`，专属兜底文案为 `src/config/tool-seo-overrides.json`。

Nginx 精确路由读取对应 HTML，未知路径返回真实 HTTP 404 与 noindex。内部 `/_prerender/` 地址返回 404，`/index.html` 以 HTTP 301 跳转到首页。构建同时生成 Nginx 白名单和 sitemap，发布包直接使用同次构建产物。访问带追踪参数或末尾斜杠的工具页时，canonical 指向该工具的规范路径。

验收命令为 `npm run check:tool-seo`（默认正式站），本地 Nginx 验证时使用 `UIED_TOOL_SEO_BASE_URL=http://127.0.0.1:5182 npm run check:tool-seo`。该脚本通过 curl 读取原始响应，不执行 JavaScript，同时检查正文、专属元数据、规范链接及真实 404。

浏览器启用 JavaScript 后由原 Vue 页面接管，继续提供二维码生成、JSON 格式化和文件压缩等操作；未启用 JavaScript 时仍能读取页面正文和使用说明。预渲染 HTML 不是交互功能本身的服务端实现。

压缩工具的 SEO 描述以页面实际能力为准。图片支持本地批量处理与 PNG 无损或减色选项。GIF 可调整尺寸、颜色和帧率。PDF 默认保留文档结构，扫描件有损模式会栅格化页面。视频专业模式输出 H.264 MP4，本地输出格式取决于浏览器。文件大小和配额以页面配置为准。

构建阶段不访问正式 API、统计或外部 AI 服务，也不携带登录状态；站点默认配置由本地稳定响应提供。后台 API 故障不会让工具专属 SEO 消失。运营后台的独立自定义 SEO 继续在客户端优先生效；需要同时更新静态首个 HTML 时，应修改对应构建数据并重新构建发布。

后台历史目录中的已知旧默认描述，由公共配置适配层按工具路径和完整原文精确迁移，正文描述、SEO 描述与 GEO 摘要一起读取当前能力文案。旧文案清单与新描述共用 `tool-seo-overrides.json`，避免“图片仅 10MB”“GIF 批量处理”“视频始终保持分辨率”等旧承诺重新覆盖详情；未登记的文案和其他工具不受影响。图片目录描述继续从既有图片压缩限制配置读取，不另存文件大小上限。此次仅适配读取，不修改生产数据库。

## 依赖与维护

复用项目已经安装的 Playwright 和 Cheerio，不新增依赖或浏览器端公共包。构建机需要可用的 Playwright Chromium；Mac 可使用已安装的官方 Chrome，其他构建机可通过 `UIED_PRERENDER_BROWSER` 指定已有浏览器路径。浏览器只在构建时运行，临时 HTTP 服务仅监听回环地址，成功或失败均会关闭。

现有 `vite-plugin-seo-prerender` 未启用：其当前安装版本会自行执行 `vite preview`，异步流程调用 `process.exit()`，且缺少本轮要求的离线请求隔离、正文校验和失败清理。此次直接复用已有 Playwright 完成受控预渲染；不改第三方源码、不再安装另一套预渲染依赖，也不在本轮清理存量依赖。

扩展正文预渲染时，补充清单中的页面就绪选择器、标题识别文字与独立 SEO，再执行原始 HTTP、无 JavaScript 阅读、浏览器交互和 404 回归。日更内容使用构建当天的站内精选作为首屏，Vue 启动后按访问当天轮换。

运行时元数据由 `siteSeo.ts` 维护。排行榜的迟到配置回调不再独立写标题，番茄钟卸载也不再还原全站标题，避免覆盖后续页面或造成 title 与 OG 标题不一致。番茄钟运行中的倒计时标题继续保留。

本轮只修复、升级版本及验证；不生成部署归档、不部署线上。生产验证需在用户另行要求打包部署后进行。
