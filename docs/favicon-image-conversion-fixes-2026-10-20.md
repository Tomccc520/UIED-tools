# Favicon 与独立图片转换入口修复

基线：`c73996e5b7ec92470237ee63c3cedec6d6443030`。版本保持 3.0.4，源码纳入 2026-10-20 修复提交，未重新打包或部署。

## 修复范围

- `src/components/Tools/FaviconMaker/FaviconMaker.vue`：PNG 按所选尺寸生成，单尺寸直接下载，多尺寸 ZIP 内每个尺寸独立成图；文件名、尺寸、HTML 引用均使用生成结果的快照。更改选项会说明旧结果仍使用原设置。
- `src/utils/faviconExport.ts`：统一处理缩放、真实 PNG 编码、PNG/ICO 打包与元数据。ICO 保持独立尺寸文件打包行为，256 像素目录字段为 0、数据偏移为 22。
- Favicon 连续上传主动调用 Cropper 的 `replace`，读取期间禁用生成；离开页面在子组件卸载前销毁裁剪实例、取消读取并释放结果 URL。
- `src/components/Tools/ImageToWebp/ImageToWebp.vue`：每条结果保存 Blob、真实格式、MIME 和唯一文件名；下载和 ZIP 不再使用当前尚未执行的选项命名。转换整批快照配置，通过稳定 ID 写回结果，支持移除、清空、卸载取消及 30 秒超时。
- 独立转换入口复用已有的 `imageFormatConversion.ts` 校验 MIME 和文件头，移除缺乏可靠编码器的 BMP 输出及未实现的 WebP 无损、渐进式 JPG 开关。JPG 透明区域填白，PNG 透明度选项实际应用。该页未做视觉重构，先前 ImgFormat 修复保留。

## 验证

- 修改前 Favicon 三项测试失败，确认输出仍为 1024×1024、PNG 多尺寸没有 ZIP、切 ICO 后旧 PNG 被命名为 ZIP；裁剪源替换与销毁另有两项失败复现。
- ImageToWebp 修改前七项失败，确认切格式命名、ZIP 覆盖、在途配置变化、格式回退和迟到写回问题。
- 新增 Favicon 页面 7 项、导出工具函数 5 项、ImageToWebp 页面 12 项测试；全量 **63 个文件、619 项测试通过**。
- `npm run build:check`（含 TypeScript）、`npm run check:tools`、`git diff --check` 均通过。构建仅有既有依赖提示。
- 实际浏览器上传 1024×1024 图片，下载 16×16 PNG；16/32 多尺寸 ZIP 的两个 PNG 尺寸正确。PNG 生成后切 ICO，下载仍为 PNG 且显示旧设置提示。
- 实际连续上传四色 1024 图、纯蓝 200 图，第二次导出的 16×16 PNG 像素为 `[20,40,240,255]`，证明未沿用旧裁剪源；另核验 ICO 的 16/256 尺寸和目录偏移。
- 独立转换入口上传两个同名 PNG，转换 PNG 后切 JPG，单张下载和 ZIP 均保留 `.png` 与 PNG 文件头，ZIP 有两个独立条目。重新转换 JPG 后实际为 `image/jpeg`、`FF D8 FF`；WebP 实际为 `image/webp`、`RIFF...WEBP`。
- 两页已验证 375px 无页面横向溢出，并在桌面完成生成、下载和设置切换。异步参数变化、超时及取消由可控回归测试验证。

实际产物、截图与独立解码报告保存在忽略目录 `output/playwright/favicon-webp-bugs-2026-10-20/`；完整测试、构建日志为 `output/favicon-webp-unit-2026-10-20.log` 与 `output/favicon-webp-build-2026-10-20.log`。临时下载已清理，验收产物保留。

现有 `c73996e5` 的 3.0.4 部署包不含本轮修复，部署前需重新打包。
