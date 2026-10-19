<!--
  @copyright Tomda (https://www.tomda.top)
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2026-10-18
-->

# 文本与文件完整性修复（问题 7–12）

本轮基于 `69878ed9` 及前两轮尚未提交的修复继续开发，保留全部已有改动。公开 `main / b389faf` 是旧审计基准；本轮逐个核对当前文件后，确认以下六项仍需修复。版本保持 3.0.3，未提交、推送、重新制作发布包或改动线上服务。

## 修复结果

| 编号 | 问题及处理 | 主要文件 |
| --- | --- | --- |
| 7 | SQL 使用状态词法扫描保护引号、注释与字面量，格式化使用锁定的 `sql-formatter@15.9.0`；压缩只改外部空白，保留行注释换行及提示注释。三个原始反例、双写引号、反斜杠和带引号标识符都保留。依赖的跳过格式化控制注释、Oracle q/nq 和三引号歧义会明确拒绝，保留原输入和上次成功结果。 | `SqlFormat.vue`、`utils/sqlFormatting.ts`、对应测试和依赖锁文件 |
| 8 | JSON 转义与去转义改用配对的一层 JSON 字符串编码/解码，生成不含外层双引号的字符串内容；不再全局删除反斜杠。错误输入不覆盖编辑器并显示可读错误，成功操作清除旧错误。 | `JsonTran.vue`、`utils/textEscaping.ts`；旧 `string.transferred` 标记不适用于 JSON 编码 |
| 9 | Unicode 只解码合法 `\\uXXXX`、UTF-16 代理项对和 `\\u{码点}`；保留其他反斜杠、路径、URL、百分号、无效或未配对序列。成对反斜杠不多解码一层。 | `Unicode.vue`、`utils/textEscaping.ts` |
| 10 | JPG/JPEG 明确映射到 `image/jpeg`，编码后同时校验 Blob MIME 和文件头。仅提供真实支持的 JPG/PNG/WebP；没有独立编码器的 BMP/TIFF 不再列为输出选项，Canvas 回退 PNG 时明确失败。 | `ImgFormat.vue`、`utils/imageFormatConversion.ts` |
| 11 | 单图下载与 ZIP 使用同一套唯一命名；只移除最后扩展名，保留 `design.v1`、`design.v2`，重复、大小写、跨源格式及已有编号碰撞继续编号。每个成功转换结果都保留独立 ZIP 条目。 | 同上 |
| 12 | 预览与导出使用同一水印布局和逻辑页面坐标。高清倍率只改变画布像素及坐标变换，字号不缩水；平铺按旋转后的文字包围框生成网格。保留原 PDF 页面内容，兼容旋转与裁剪框。 | `PdfWatermark/index.vue`、`utils/pdfWatermarkLayout.ts` |

## 验证

- 全量单测：37 个测试文件、252 项测试通过。
- `npm run build:check` 通过，包含 TypeScript 检查与生产构建；以下四组浏览器脚本均在本轮新构建的 `http://127.0.0.1:5181` 上再次通过。
- 定向单测：SQL 62 项，JSON/Unicode 27 项，图片编码/命名 5 项，水印布局/缩放 4 项，均包含在全量结果中。
- 独立 SQLite：执行六组原 SQL、格式化 SQL 和压缩 SQL，对比实际返回值，一致。
- JSON 额外校验：全部 65,536 个 UTF-16 码元的单层编解码往返均保留原文；真实编辑器及剪贴板回归包括 Windows 路径、引号、换行、反斜杠和字面 Unicode。
- Unicode 示例 `C:\temp\u4e2d 100%25` 得到 `C:\temp中 100%25`，原输入框不变。
- 图片：真实 JPG 文件头 `FF D8 FF`、MIME `image/jpeg`；PNG 签名 `89 50 4E 47 0D 0A 1A 0A`；WebP 包含 `RIFF`/`WEBP`。六份素材由系统 `unzip` 独立提取，数量、文件名和各自颜色均对应，模拟编码回退明确失败且无下载。
- PDF：两页 A4，字号 50，导出后用独立 Poppler 阅读器渲染。默认平铺为 2 行 2 列共 4 处；预览/导出水印面积比约 1.029、像素重合率约 0.884，居中及带旋转、裁剪框的页面同样通过。
- 页面回归：SQL、图片、水印检查 320/1440px；JSON、Unicode 检查 320/375/768/1440px，控件可操作，无页面异常及持续横向溢出。
- `git diff --check`、工具/路由一致性检查通过。

## 可重复的浏览器验收

以下脚本默认访问本地开发服务 `http://127.0.0.1:5179`，可用各自环境变量指定生产构建预览地址：

```bash
node scripts/smoke-sql-format.mjs
node scripts/smoke-text-encoding.mjs
node scripts/smoke-image-format.mjs
node scripts/smoke-pdf-watermark.mjs
```

对应基址变量依次为 `UIED_SQL_SMOKE_BASE_URL`、`UIED_TEXT_SMOKE_BASE_URL`、`UIED_IMAGE_FORMAT_SMOKE_BASE_URL`、`UIED_PDF_SMOKE_BASE_URL`。图片脚本使用系统 `unzip`；PDF 脚本使用独立 `pdftoppm` 渲染，可用 `UIED_PDFTOPPM_BIN` 指定程序位置。

PDF 视觉证据位于 `output/playwright/pdf-watermark/`，包含居中、平铺、旋转及裁剪页的 PDF、阅读器渲染与预览。SQL 和图片的窄屏/桌面截图也保留在 `output/playwright/`。这些是本地验收证据，不能替代新包上线后的验证。

## 使用边界

- SQL 工具支持通用 SQL，未提供数据库方言选择；不支持或有引号歧义的输入会明确报错，不自动猜测语义。
- JSON 去转义按页面说明接收“不含外层双引号”的一层转义内容；不是删除反斜杠或反复解码。
- BMP/TIFF 输出尚未实现可靠编码器，本轮选择明确限制输出格式。
- 本轮验收使用本地生成的样本，没有把用户文件上传至线上。线上仍需部署包含这些改动的新包。
