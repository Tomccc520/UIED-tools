<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.27
 */
-->

# 开发记录

## 2026-01-28
### 开发辅助能力增强
- 安装 frontend-design skill 到 .agents/skills 目录，增强前端设计与开发辅助能力
- 路径：.agents/skills/frontend-design

## 2026-01-27
### PDF 功能统一与优化
- 统一 PDF.js worker 引用为 public 根路径，减少各工具重复打包与加载
- 补齐并统一 PDF 文件校验逻辑（类型与大小），提高一致性与用户提示准确性
- 按规范更新工具页版权信息块
- 为关键函数补充中文函数级注释，提升代码可维护性
- 通过 vue-tsc 与构建校验验证改动有效性

- 更新文件与关键行号：
  - src/utils/pdf.ts（L1-L6, L21-L31）
  - src/components/Tools/PdfEncrypt/index.vue（L1-L8, L137-L151, L256-L274, L285-L326）
  - src/components/Tools/PdfMerge/index.vue（L1-L8, L228-L233）
  - src/components/Tools/PdfRotate/index.vue（L1-L8, L206-L211）
  - src/components/Tools/PdfSplit/index.vue（L1-L8, L178-L191）
  - src/components/Tools/PdfWatermark/index.vue（L1-L8, L178-L191）
  - src/components/Tools/PdfPageNumber/index.vue（L1-L8, L185-L198, L310-L330, L391-L459）
  - src/components/Tools/PdfExtractText/index.vue（L1-L8, L184-L196, L306-L326, L337-L421）
  - src/components/Tools/PdfSign/index.vue（L1-L8, L139-L152, L250-L269, L410-L477）
  - src/components/Tools/PdfToImages/index.vue（L1-L8, L254-L266, L413-L417, L298-L320）
- 为视频转 GIF 增加超过 5 次需公众号密码验证的限制，复用 DeepSeek 验证逻辑与提示文案
- 抽离“关注公众号获取密码”弹窗为可复用组件，支持自定义文案与按钮文案
- 修复工具详情获取方法缺失，新增根据路由或ID匹配工具信息逻辑
- 更新文件：src/store/modules/tools.ts
- 修复外包报价与小红书等 AI 工具的类型与逻辑报错
- 更新文件：src/components/Tools/AI/AIOutsourceQuote.vue、src/components/Tools/AI/AIRanking.vue、src/components/Tools/AI/AIResume.vue、src/components/Tools/AI/OCRRecognition.vue、src/components/Tools/AI/XiaoHongShu.vue、src/components/Tools/AI/XunfeiSpark.vue
- 修复 Header 与字体页面的类型报错
- 更新文件：src/components/Layout/Header/Header.vue、src/components/Tools/Design/Font.vue
- 视频转 GIF 标题增加“免费”，修复转换流程与 workerScript 引用
- 更新文件：src/components/Tools/Video/VideoToGif/VideoToGif.vue（L12-L209, L320-L322）
- 补充项目开发规范条目
- 更新文件：.trae/rules/guifan.md（L2-L6）
- 根据项目现状完善规范，补充工具页版权块、路由/工具配置同步、worker 路径与类型定义要求
- 更新文件：.trae/rules/guifan.md（L1-L13）
- 拆分工具配置逻辑为常量数据，并统一工具类型定义引用
- 合并重复路由入口，统一 PDF 与 AI 快讯标题规则，移除重复的 AI 分析报告入口
- 更新文件：src/components/Tools/tools.ts（L1-L3827）
- 更新文件：src/types/tools.ts（L1-L50）
- 更新文件：src/store/modules/tools.ts（L1-L223）
- 更新文件：src/components/Home/Home.vue（L18-L36）
- 更新文件：src/components/Tools/RandomTools/RandomTools.vue（L110-L159）
- 更新文件：src/components/Layout/Left/Left.vue（L17-L535）
- 更新文件：src/router/router.ts（L152-L999, L1262-L1271, L2658-L2666）
