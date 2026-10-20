# 常用页面移动端适配验收（2026-10-19）

## 本轮范围与结论

主站继续使用 Vue 3 和同一套业务组件，按工作区实际宽度调整布局。本轮完成首批常用页面适配和 52 个不同页面的浏览器布局回归，不代表全站所有工具已经完成真机和完整功能验收。版本保持 3.0.3，未提交 Git、推送或部署。

用户随后反馈参数、预览与文件列表仍拥挤；操作密度与路由切换的后续修复，见 `docs/image-compress-mobile-usability-2026-10-19.md`。本记录保留首轮检查范围，不把“无溢出”视为手机体验全部通过。

浏览器环境为 Codex 内置 Chromium，宽度为 320 / 375 / 768 / 1440px，共 208 次检查，整页横向溢出均为 0。原始数据保存在 `output/playwright/other-pages-mobile-2026-10-19/layout-final.json`。PDF 原尺寸预览、记忆牌困难模式和代码长行允许在各自区域内部滚动。

## 已调整内容

| 分组 | 调整 |
| --- | --- |
| 首页与搜索 | 保留首页现有视觉；补充隐藏的页面主标题；搜索输入 16px、关闭与清空触区 44px、安全区和短视口滚动；快捷入口使用原生按钮；热门工具只显示分类，不展示内部计费备注。 |
| 图片与设计 | 图标生成、二维码、图片裁剪、切割、拼接接入显式限定的共用响应式样式；标题、设置区、长文件名、预览和按钮适配窄容器；裁剪控制放在图像下方。 |
| PDF | 14 个页面共用局部响应式样式，设置区堆叠、页卡操作在手机和触屏设备常显；数字增减触区加宽；签名板等比缩放并按真实画布换算落点。 |
| 视频与 GIF | 视频工作区单列、操作换行，结果对比改为手机卡片；视频裁剪支持 Pointer Events 和窗口失焦清理；抽帧删除常显；图片合成 GIF 提供上移/下移。 |
| JSON / SQL / AI | 缩减嵌套留白；文本编辑字号 16px，操作顺序和按钮适配手机；AI 模板按容器堆叠；输入不再自动抢焦点唤起键盘。 |
| 交互画板 | 2048 数字块与格子使用一致尺寸；记忆牌困难模式保持 36 张牌，内部横滚；ClipPath 画板等比缩放并扩大拖点触区。 |

## 回归中修复的功能问题

- PDF 签名首次确认时预览画布尚未挂载，导致页面尺寸为 0。现在等待挂载、渲染当前页，再居中签名；渲染失败显示错误并允许重试，未就绪时不能导出。
- PDF 签名和页码工具用深层 `ref` 保存 PDF.js 文档，破坏其原生私有字段。改用 `shallowRef`；测试替身包含真正的私有字段，覆盖首次渲染和翻页。
- GIF 合成调整顺序后仍可下载旧预览。按钮和拖拽排序都使旧预览失效；编码中锁定顺序。
- 图片裁剪使用旧输出缓存，格式切换、亮度和对比度没有可靠反映到导出，JPG MIME 错误；缩放还调用了不存在的库方法。改为下载时读取最新区域并复用真实编码校验，失败有提示；修正缩放接口和资源释放。

## 实际交互与文件检查

| 页面 | 已完成的浏览器验收 |
| --- | --- |
| 搜索 | 375px 结果列表；点击“Json在线转换”进入 `/tools/json`；方向键选第三项并回车导航；Escape 关闭；320×360 短视口输入仍在可见范围，关闭触区 44px。短视口不等同于真实 iOS 键盘验收。 |
| PDF 旋转 | 上传自行生成的 A/B/C 三页 PDF，375px 单页操作常显、44×44px；旋转第一页并下载。独立读取产物为 3 页，旋转角度 `[90, 0, 0]`。 |
| PDF 签名 | 缩放手写板绘制、确认、显示真实 595×842px PDF、翻到第二页并下载；独立读取产物仍为 3 页 A4。位置与笔迹坐标另有单测，尚未覆盖所有旋转源文档。 |
| 视频裁剪 | 上传 2 秒测试视频，375px 拖动由 X/Y=10%/10% 变为约 16%/15%；角点缩放宽高从 80% 变为约 72%，框仍在画面内。 |
| 视频压缩 | 320px 上传后切换专业/本地及比例、目标大小、目标码率三种参数布局，均无整页横向溢出。本轮未重新验收所有编码输出。 |
| 图片合成 GIF | 上传两张图并生成预览；上移第二张后顺序更新、旧预览撤销、下载禁用，要求重新生成。 |
| 图片裁剪 | 375px 上传后选择 1:1，分别下载 PNG 和 JPG；独立解码均为 384×384，实际 PNG 头 `89504e470d0a1a0a`，JPEG 头 `ffd8ff`。 |
| SQL | 320px 输入含 `a--b` 字符串及超长行并格式化，字面量保留、结果可读、整页无溢出。 |
| PEST | 320px 输入分析对象后“开始分析”启用，输入字号 16px；未调用付费 AI，没有将结果态列为已完成浏览器验收。 |
| 2048 | 方向键移动后，320 / 375 / 1440px 数字块与背景格边界最大偏差均为 0px（等待动画结束后测量）。 |
| 记忆翻牌 | 320px 困难模式保留 36 张牌，卡片至少 44px，棋盘内横滚可操作第 36 张牌，页面无外溢。 |

截图、自产测试文件和下载产物保存在 `output/playwright/other-pages-mobile-2026-10-19/`。较早的 `initial-checks.json` 和 `layout-checks.json` 为排查过程记录；最终布局结论以 `layout-final.json` 为准。

## 52 个页面覆盖清单

- 基础与分类（6）：`/`、`/changelog`、`/about`、`/tools/hot-ranking`、`/tools/random-tools`、`/tools/ai/toolbox`。
- 图片、设计与开发（10）：`/tools/json`、`/tools/dev/json-format`、`/tools/dev/sql-format`、`/tools/design/icon-generator`、`/tools/design/contrast-checker`、`/tools/qrcode`、`/tools/img-format`、`/tools/image-crop`、`/tools/img-cut`、`/tools/image-joiner`。
- PDF（14）：`/tools/img-to-pdf`、`/tools/pdf-to-images`、`/tools/pdf-merge`、`/tools/pdf-split`、`/tools/pdf-rotate`、`/tools/pdf-delete`、`/tools/pdf-compress`、`/tools/pdf-watermark`、`/tools/pdf-encrypt`、`/tools/pdf-page-number`、`/tools/pdf-sign`、`/tools/pdf-extract-text`、`/tools/text-to-pdf`、`/tools/markdown-to-pdf`。
- 视频（15）：`/tools/video`、`/tools/video/frame`、`/tools/video/compress`、`/tools/video/convert`、`/tools/video/resolution`、`/tools/video/merge`、`/tools/video/audio`、`/tools/video/mute`、`/tools/video/gif`、`/tools/video/webcam`、`/tools/video/watermark`、`/tools/video/speed`、`/tools/video/rotate`、`/tools/video/crop`、`/tools/video/trimmer`。另检查 `/tools/video/to-audio`，该入口规范到音频工具，因此不重复计数。
- GIF / AI / 画板（7）：`/tools/gif-compress`、`/tools/image-to-gif`、`/tools/ai/analysis/pest`、`/tools/ai/article-generator`、`/tools/games/2048`、`/tools/games/memory-card`、`/tools/design/clip-path`。

图片压缩页此前已单独验收，见 `docs/image-compress-mobile-review-2026-10-19.md`，本轮 52 页不重复计入。

## 自动检查与边界

- `npm run test:unit -- --run`：56 个文件、481 项测试通过；之后仅调整 GIF 合成测试的全局 mock 写法以满足 TypeScript，该文件 3 项测试再次通过。
- `npm run build:check`：类型检查及生产构建通过。
- `npm run check:tools`：重复 path/name/URL 及无路由工具均为 0。
- `git diff --check`：通过。

后续仍需按真实使用量逐页补充其余工具，并在真实 iOS Safari、Android Chrome 验证触摸、软键盘、安全区和大文件内存。摄像头页只检查初始布局，未请求设备权限。PDF/GIF/视频大文件、AI 生成结果全屏、全部工具输出和后台移动端不在本轮已完成验收范围。部分旧页面仍有 Element Plus 弃用提示、历史 head provider 警告，不将其描述为控制台零警告。
