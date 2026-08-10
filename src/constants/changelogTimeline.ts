/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

const defaultChangelogTimeline = [
  {
    "id": "v3.0.1",
    "version": "3.0.1",
    "date": "2026-07-29 23:31",
    "badgeText": "部署候选",
    "badgeType": "success",
    "title": "商业化能力、前后台体验与部署链路全面收口",
    "features": [
      {
        "title": "会员与工具商业化",
        "points": [
          "完成 20 个会员核心工具的统一策略接入，停用、登录、扣费、外链和内部跳转统一由运行入口校验。",
          "登录功能支持后台开启或关闭；关闭时工具可免登录使用，积分与会员信息集中在用户中心展示。",
          "订单状态统一为待支付、已支付和已关闭，后台支持订单筛选、补单、关闭与导出。"
        ]
      },
      {
        "title": "前台体验与内容运营",
        "points": [
          "首页移动端工具卡调整为双列并收紧左右间距，热榜、随机工具、登录弹窗和头部操作区完成视觉重构。",
          "每日学习改为 RSS 动态内容源，支持按分类别名、分类 ID 和多分类组合配置。",
          "视频压缩与 GIF 压缩补齐格式说明、进度、结果对比、失败兜底和下载体验。"
        ]
      },
      {
        "title": "后台 Arco Pro 收口",
        "points": [
          "Workbench、权限、组织、日志、缓存、渠道、工具主数据和前端布局等 P0 页面统一操作区与信息层级。",
          "前端布局、头部、页脚和 SEO 配置页将说明及统计收进折叠区，核心运营表单与保存操作常驻。",
          "工具主数据补齐同步高频工具、策略同步、一键体检、缺失策略提示和前端预览。"
        ]
      },
      {
        "title": "抠图服务改为 API 提供商",
        "points": [
          "移除本地 ModelScope 抠图模型及其大体积运行依赖，服务端保留统一安全代理。",
          "后台可配置阿里云抠图 API 或抠抠图 API 的密钥与地址，前台不暴露第三方密钥。",
          "未配置可用提供商时返回明确提示，不再静默调用效果不稳定的本地模型。"
        ]
      },
      {
        "title": "AI 简历同域集成",
        "points": [
          "AI 简历以独立 Next.js 应用接入 <strong><router-link to=\"/tools/ai-resume\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">/tools/ai-resume</router-link></strong>，通过同域路径代理运行，不使用 iframe，也不混合主站依赖。",
          "编辑器补齐专业模板、移动端全屏编辑、AI 内容对比/应用/撤销闭环，并保留独立构建和发布能力。",
          "导出链路同时支持 PDF 与可编辑 Word，发布冒烟覆盖首页、编辑器、静态资源、AI API 和 DOCX 文件有效性。"
        ]
      },
      {
        "title": "发布回归与稳定性",
        "points": [
          "新增前台移动端、20 个核心工具与后台 P0 页面 Playwright 可视冒烟，检查关键入口真实可见且可点击。",
          "一键启动脚本强化 PID、端口和服务健康检查，前后端配置保存回环已纳入业务冒烟。",
          "版本继续保持 <strong>3.0.1</strong>，本轮不扩工具数量，优先保证部署、运营和续费链路稳定。"
        ]
      }
    ]
  },
  {
    "id": "v3.0.0",
    "version": "3.0.0",
    "date": "2026-03-22 23:40",
    "badgeText": "版本分岔",
    "badgeType": "danger",
    "title": "纯前端开源版与后台商业版正式分离",
    "features": [
      {
        "title": "版本策略调整",
        "points": [
          "纯前端开源版在 3.0.0 作为分岔节点，后续仅做稳定维护与安全修复。",
          "后台运营配置、模型管理、会员支付等能力归入商业源码版。",
          "商业版获取与服务支持统一入口：<a href=\"https://fsuied.com/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-blue-600 hover:text-blue-700\">fsuied.com</a>。"
        ]
      },
      {
        "title": "本次同步内容",
        "points": [
          "顶部 Banner 支持后台动态配置，前端不再写死。",
          "首页热门推荐、头部快捷链接、页脚分组继续向后台运营化推进。",
          "素材中心补齐“图标库”入口，支持侧边栏 SVG 图标运营配置。"
        ]
      }
    ]
  },
  {
    "id": "v1.0.1-fullstack",
    "version": "1.0.1-Fullstack",
    "date": "2026-03-22 21:30",
    "badgeText": "版本发布",
    "badgeType": "warning",
    "title": "UIEDTool 正式接入后台（likeadmin-go）",
    "features": [
      {
        "title": "后台模型管理分级与前台联动",
        "points": [
          "后台菜单升级为 <strong>AI模型管理（一级）</strong> + <strong>AI抠图模型（二级）</strong>，便于后续扩展更多模型类型。",
          "<strong><router-link to=\"/tools/photo/background\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">证件照换底色</router-link></strong>： 首次抠图后缓存透明 PNG，后续换底色本地渲染，不重复调用抠图模型。",
          "头部、侧栏、页脚已接入后端站点配置（<code>/api/common/index/config</code>），并在后台网站设置新增 <code>Tools 前端布局 JSON</code> 配置项，支持按链接分组动态下发。"
        ]
      }
    ]
  },
  {
    "id": "v2.7.14",
    "version": "2.7.14",
    "date": "2026-03-19 17:51",
    "badgeText": "工具优化",
    "badgeType": "success",
    "title": "视频工具总览跳转优化与新工具补齐",
    "features": [
      {
        "title": "视频入口与可用能力更新",
        "points": [
          "<strong><router-link to=\"/tools/video\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频工具总览</router-link></strong>：工具卡片与能力核对区链接统一改为新窗口打开，降低处理中误切换风险。",
          "<strong><router-link to=\"/tools/video/convert\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频格式转换</router-link></strong>：新增 MP4/WebM/MOV 常见格式转换，支持进度、ETA、取消处理和结果对比。",
          "<strong><router-link to=\"/tools/video/resolution\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频分辨率重设</router-link></strong>：新增 1080p/720p/480p 与自定义尺寸重设，保持等比输出并支持结果对比。",
          "<strong><router-link to=\"/tools/video/merge\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频拼接</router-link></strong>：新增多段视频顺序合并导出，支持片段排序、进度/ETA、取消处理与结果区下载。"
        ]
      }
    ]
  },
  {
    "id": "v2.7.13",
    "version": "2.7.13",
    "date": "2026-03-18 23:40",
    "badgeText": "工具优化",
    "badgeType": "success",
    "title": "GIF 压缩画质与交互升级",
    "features": [
      {
        "title": "GIF 压缩体验升级",
        "points": [
          "<strong><router-link to=\"/tools/gif-compress\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">GIF 压缩</router-link></strong>：新增“画质保护模式”（原尺寸/原帧率/256 色优先）与压缩预设，减少误操作带来的画质损失。",
          "<strong><router-link to=\"/tools/gif-compress\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">GIF 压缩</router-link></strong>：增加逐帧重复帧识别与延时合并统计，在尽量保持观感的前提下进一步压缩体积。"
        ]
      }
    ]
  },
  {
    "id": "v2.7.12",
    "version": "2.7.12",
    "date": "2026-03-18 22:20",
    "badgeText": "性能优化",
    "badgeType": "success",
    "title": "PDF工具组运行时加载优化（精简记录）",
    "features": [
      {
        "title": "PDF 依赖链路懒加载",
        "points": [
          "<strong><router-link to=\"/tools/pdf-compress\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 压缩</router-link></strong> / <strong><router-link to=\"/tools/pdf-merge\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 合并</router-link></strong> / <strong><router-link to=\"/tools/pdf-split\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 分割</router-link></strong> / <strong><router-link to=\"/tools/pdf-delete\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 删除</router-link></strong> / <strong><router-link to=\"/tools/pdf-rotate\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 旋转</router-link></strong> / <strong><router-link to=\"/tools/pdf-encrypt\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 加密</router-link></strong> / <strong><router-link to=\"/tools/pdf-watermark\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 水印</router-link></strong> / <strong><router-link to=\"/tools/pdf-sign\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 签名</router-link></strong> / <strong><router-link to=\"/tools/pdf-extract-text\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 提取文本</router-link></strong> / <strong><router-link to=\"/tools/pdf-to-images\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 转图片</router-link></strong> / <strong><router-link to=\"/tools/pdf-page-number\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 加页码</router-link></strong> 统一改为运行时按需加载 <code>pdfjs-dist</code> 与 <code>pdf-lib</code>。",
          "新增 <strong><router-link to=\"/tools/pdf-compress\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">/tools/pdf-compress</router-link></strong> 冒烟项，持续校验路由可达与关键按钮可用。"
        ]
      }
    ]
  },
  {
    "id": "v2.7.11",
    "version": "2.7.11",
    "date": "2026-03-18 20:40",
    "badgeText": "性能优化",
    "badgeType": "success",
    "title": "导出工具重依赖按需加载（精简记录）",
    "features": [
      {
        "title": "运行时加载收敛",
        "points": [
          "<strong><router-link to=\"/tools/ai/resume\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI简历</router-link> / <router-link to=\"/tools/ai-outsource-quote\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI外包报价</router-link> / <router-link to=\"/tools/ai/prompt-editor\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI提示词编辑</router-link> / <router-link to=\"/tools/xiaohongshu\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">小红书生成</router-link></strong> 与 <strong><router-link to=\"/tools/design/DesignQuote\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">设计报价单</router-link> / <router-link to=\"/tools/design/logo-spec\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Logo 规范</router-link> / <router-link to=\"/tools/fish-calendar\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">摸鱼日历</router-link> / <router-link to=\"/tools/horoscope\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">星座运势</router-link> / <router-link to=\"/tools/pdf-compress\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF 压缩</router-link></strong> 的 <code>html2canvas</code>、<code>jsPDF</code> 链路已统一切换为“触发导出时再加载”。",
          "清理无效静态导入，减少首页解析压力，原有功能与交互保持不变。"
        ]
      }
    ]
  },
  {
    "id": "v2.7.10",
    "version": "2.7.10",
    "date": "2026-03-18 18:20",
    "badgeText": "性能优化",
    "badgeType": "success",
    "title": "工具链路优化（精简记录）",
    "features": [
      {
        "title": "AI产品榜外链调整",
        "points": [
          "<strong>AI产品榜</strong>：站内页面下线，统一跳转至 <a href=\"https://hao.uied.cn/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-blue-600 hover:text-blue-700\">https://hao.uied.cn/</a>，并保留原路由兼容访问。"
        ]
      },
      {
        "title": "AI工具页加载优化",
        "points": [
          "<strong>AI/Student 全量页面</strong>：统一接入结果编辑器按需挂载、分片缓冲 + `requestAnimationFrame` 流式输出、复制预览前编辑器就绪兜底与卸载清理。",
          "<strong><router-link to=\"/tools/markdown\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Markdown</router-link> / <router-link to=\"/tools/markdown-to-pdf\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Markdown 转 PDF</router-link></strong>：优化编辑器初始化占位文案，默认自动加载，减少操作步骤；Markdown 转 PDF 增加渲染结果缓存，减少重复解析。"
        ]
      }
    ]
  },
  {
    "id": "v2.7.9",
    "version": "2.7.9",
    "date": "2026-03-18 14:30",
    "badgeText": "性能优化",
    "badgeType": "success",
    "title": "重工具页加载链路优化与回归加固",
    "features": [
      {
        "title": "核心页面性能优化",
        "points": [
          "<strong><router-link to=\"/tools/ai/chat\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI Chat</router-link></strong>：流式输出阶段采用纯文本展示，结束后再执行 Markdown 渲染；消息渲染增加 HTML 缓存，减少重复解析开销。",
          "<strong><router-link to=\"/tools/ai/deepseek-r1\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">DeepSeek R1</router-link></strong>：流式响应改为分帧滚动更新，避免每个分片触发同步布局；消息渲染增加缓存并在流式结束后再做 Markdown 解析。",
          "<strong><router-link to=\"/tools/ai/deepseek\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">DeepSeek</router-link></strong>：逐字符输出改为分帧批量写入，减少高频响应式更新；补充滚动调度与卸载清理，降低长回答卡顿。",
          "<strong><router-link to=\"/tools/ai/xunfei-spark\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">讯飞星火</router-link></strong>：打字机链路升级为分帧批量输出，修复“重新生成”状态阻塞问题，并优化对话区滚动性能。",
          "<strong>搜索面板</strong>：流式响应改为按帧合并输出，历史回答增加 Markdown 解析缓存，降低高频渲染占用。",
          "<strong><router-link to=\"/tools/markdown-to-pdf\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Markdown 转 PDF</router-link></strong>：编辑器改为空闲时挂载，预览 HTML 改为导出前一次性解析，减少输入阶段主线程占用；修复分页位移按页面尺寸计算，提升 Letter/A4 一致性。",
          "<strong><router-link to=\"/tools/text-to-pdf\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">文本转 PDF</router-link></strong>：修复多页导出时分页位移常量错误，统一按当前纸张尺寸分页；复用导出图片数据，减少重复编码开销。",
          "<strong><router-link to=\"/tools/ai/office/code-generator\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 代码生成</router-link></strong>：流式代码输出改为分片缓冲 + `requestAnimationFrame` 刷新，提升长内容生成流畅度。",
          "<strong><router-link to=\"/tools/ai/work-summary\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 工作总结</router-link></strong>：结果编辑器改为按需挂载，流式文本输出改为分片缓冲 + `requestAnimationFrame`，降低长文生成时编辑区卡顿。",
          "<strong><router-link to=\"/tools/ai/weekly-summary\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 周报总结</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，降低连续长文生成时的主线程抖动。",
          "<strong><router-link to=\"/tools/ai/debriefing-report\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 述职报告</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，并补充卸载清理逻辑，减少状态残留风险。",
          "<strong><router-link to=\"/tools/ai/speech-script\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 讲话稿</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，降低长稿生成时编辑区高频重渲染。",
          "<strong><router-link to=\"/tools/ai/project-proposal\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 项目策划方案</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，并完善流式状态清理逻辑，提升连续生成稳定性。",
          "<strong><router-link to=\"/tools/ai/article-summary\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 摘要生成</router-link></strong>：结果编辑器切换为按需挂载，流式输出改为分片缓冲 + `requestAnimationFrame` 刷新，降低长文提炼时卡顿。",
          "<strong><router-link to=\"/tools/ai/article-outline\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 写作大纲</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，并补充复制预览前的编辑器就绪兜底。",
          "<strong><router-link to=\"/tools/ai/article-polishing\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 降重润色</router-link></strong>：同步接入结果编辑器按需挂载、分帧流式输出与卸载清理逻辑，提升连续处理稳定性。",
          "<strong><router-link to=\"/tools/ai/literature-review\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 文献综述</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，并补充复制预览前的编辑器就绪兜底，降低长文综述生成卡顿。",
          "<strong><router-link to=\"/tools/ai/novel-plot\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 小说剧情创作</router-link></strong>：同步接入结果编辑器按需挂载、分帧流式输出与卸载清理逻辑，提升长剧情生成稳定性。",
          "<strong><router-link to=\"/tools/ai/practice-report\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 实践报告</router-link></strong>：同步接入结果编辑器按需挂载与分片缓冲输出，减少连续生成时编辑区高频重渲染。",
          "<strong><router-link to=\"/tools/ai/opening-report\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 开题报告</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，降低长报告生成期间的编辑器卡顿。",
          "<strong><router-link to=\"/tools/ai/essay-writing\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 作文一键写作</router-link></strong>：同步接入结果编辑器按需挂载、分片缓冲输出与卸载清理逻辑，提升连续生成稳定性。",
          "<strong><router-link to=\"/tools/ai/speech-draft\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 演讲稿</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，并补充复制预览前的编辑器就绪兜底。",
          "<strong><router-link to=\"/tools/ai/intern-summary\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 实习总结</router-link></strong>：同步接入结果编辑器按需挂载与分片缓冲输出，降低连续生成时编辑区高频重渲染。",
          "<strong><router-link to=\"/tools/ai/analysis-report\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 分析报告</router-link></strong>：同步接入结果编辑器按需挂载、分帧流式输出与卸载清理逻辑，提升长报告生成稳定性。",
          "<strong><router-link to=\"/tools/ai/literature-recommend\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 文献推荐</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，并补充复制预览前的编辑器就绪兜底。",
          "<strong><router-link to=\"/tools/ai/essay-contest\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 征文</router-link></strong>：同步接入结果编辑器按需挂载、分帧流式输出与卸载清理逻辑，降低长稿生成过程中的编辑区重渲染抖动。",
          "<strong><router-link to=\"/tools/ai/graduation-thesis\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 毕业长文/报告</router-link></strong>：同步接入结果编辑器按需挂载与分片缓冲输出，并补充复制预览前的编辑器就绪兜底，提升长文连续生成稳定性。",
          "<strong><router-link to=\"/tools/ai/self-reflection\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 检讨书</router-link></strong>：同步接入结果编辑器按需挂载、分帧流式输出与流式状态清理逻辑，减少连续生成时的卡顿与状态残留。",
          "<strong><router-link to=\"/tools/ai/short-video-title\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 短视频标题</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，降低标题批量生成时编辑区高频重渲染。",
          "<strong><router-link to=\"/tools/ai/spokesperson-speech\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 发言稿</router-link></strong>：同步接入结果编辑器按需挂载、分帧流式输出与卸载清理逻辑，提升连续生成稳定性。",
          "<strong><router-link to=\"/tools/ai/training-experience\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 培训心得</router-link></strong>：同步接入结果编辑器按需挂载与分片缓冲输出，并补充复制预览前的编辑器就绪兜底。",
          "<strong><router-link to=\"/tools/ai/work-report-ppt\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 工作汇报PPT</router-link></strong>：同步接入结果编辑器按需挂载、分帧流式输出与流式状态清理逻辑，降低长内容生成时卡顿。",
          "<strong><router-link to=\"/tools/ai/analysis/research-report\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 研究报告</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，降低深度报告生成时编辑区高频重渲染。",
          "<strong><router-link to=\"/tools/ai/analysis/business-plan\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 商业计划书</router-link></strong>：同步接入结果编辑器按需挂载、分片缓冲输出与卸载清理逻辑，提升长内容连续生成稳定性。",
          "<strong><router-link to=\"/tools/ai/analysis/feasibility-study\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 可行性研究报告</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，并补充复制预览前的编辑器就绪兜底。",
          "<strong><router-link to=\"/tools/ai/analysis/swot\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI SWOT分析</router-link></strong>：同步接入结果编辑器按需挂载、分帧流式输出与流式状态清理逻辑，减少连续优化时的状态残留。",
          "<strong><router-link to=\"/tools/ai/analysis/analysis-report\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 分析报告</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，降低复杂分析生成时编辑区重渲染压力。",
          "<strong><router-link to=\"/tools/ai/analysis/activity-plan\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 活动方案</router-link></strong>：同步接入结果编辑器按需挂载、分片缓冲输出与卸载清理逻辑，提升连续调整时稳定性。",
          "<strong><router-link to=\"/tools/ai/analysis/survey-report\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 调研报告</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，并补充复制预览前的编辑器就绪兜底。",
          "<strong><router-link to=\"/tools/ai/analysis/industry-report\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 行业报告</router-link></strong>：同步接入结果编辑器按需挂载、分帧流式输出与流式状态清理逻辑，减少长内容生成阶段卡顿。",
          "<strong><router-link to=\"/tools/ai/analysis/project-application\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 立项申请报告</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，并补充复制预览前的编辑器就绪兜底。",
          "<strong><router-link to=\"/tools/ai/analysis/pest\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI PEST分析</router-link></strong>：同步接入结果编辑器按需挂载、分片缓冲输出与卸载清理逻辑，提升连续分析稳定性。",
          "<strong><router-link to=\"/tools/ai/analysis/transport-plan\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 运输方案</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，降低长方案生成时编辑区卡顿。",
          "<strong><router-link to=\"/tools/ai/analysis/situation-report\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 情况报告</router-link></strong>：同步接入结果编辑器按需挂载、分帧流式输出与流式状态清理逻辑，减少连续生成时状态残留。",
          "<strong><router-link to=\"/tools/ai/analysis/seven-s\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 波士顿7S分析</router-link></strong>：同步接入结果编辑器按需挂载与分片缓冲输出，提升组织诊断长文生成流畅度。",
          "<strong><router-link to=\"/tools/ai/analysis/marketing-4p\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 4P营销分析</router-link></strong>：同步接入结果编辑器按需挂载、分帧流式输出与复制预览前的编辑器就绪兜底。",
          "<strong><router-link to=\"/tools/ai/analysis/industry-consultant\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 产业顾问</router-link></strong>：同步接入结果编辑器按需挂载、分片缓冲输出与卸载清理逻辑，提升连续咨询场景稳定性。",
          "<strong><router-link to=\"/tools/ai/analysis/startup-ideas\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI 创新创业金点子</router-link></strong>：同步接入结果编辑器按需挂载与分帧流式输出，降低创意扩展阶段重渲染开销。",
          "<strong>AI Office 全量工具页</strong>：为 <router-link to=\"/tools/ai/office/notice-generator\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">通知生成</router-link>、<router-link to=\"/tools/ai/office/resume-builder\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">简历制作</router-link>、<router-link to=\"/tools/ai/office/okr-generator\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">OKR 制定</router-link>、<router-link to=\"/tools/ai/office/contract-template\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">合同模版</router-link> 及同类 Office 页面统一接入结果编辑器按需挂载、分片缓冲 + `requestAnimationFrame` 流式输出、复制预览前编辑器就绪兜底与卸载清理，减少长内容生成卡顿并提升连续操作稳定性。",
          "<strong>流程减负优化</strong>：对已改造的写作工具新增“高级选项（可选）”折叠区，并移除结果区“立即加载编辑器”显式按钮，改为“生成后自动加载”提示，减少页面步骤感与视觉负担。"
        ]
      },
      {
        "title": "重依赖懒加载链路优化",
        "points": [
          "<strong><router-link to=\"/tools/markdown\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Markdown 编辑器</router-link></strong>：编辑器改为空闲时挂载，支持用户手动立即加载，降低首屏阻塞。",
          "<strong><router-link to=\"/tools/diff\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">文本对比</router-link></strong>：改为点击后初始化对比组件，并对快照输入做短延时防抖，减少长文本输入时重算压力。"
        ]
      }
    ]
  },
  {
    "id": "v2.7.8",
    "version": "2.7.8",
    "date": "2025-12-20 20:00",
    "badgeText": "更新",
    "badgeType": "primary",
    "title": "热榜数据修复与系统优化",
    "features": [
      {
        "title": "功能修复与优化",
        "points": [
          "<strong>今日热榜</strong>：修复即梦AI和Nano-Banana数据获取异常问题（修正为Tag获取）；优化视觉设计，移除卡片阴影，提升阅读体验。",
          "<strong>系统维护</strong>：移除已失效的抖音/小红书下载工具，精简路由配置，提升系统稳定性。"
        ]
      }
    ]
  },
  {
    "id": "v2.7.6",
    "version": "2.7.6",
    "date": "2025-12-20 12:00",
    "badgeText": "更新",
    "badgeType": "primary",
    "title": "热榜聚合接口升级与工具优化",
    "features": [
      {
        "title": "今日热榜 - 聚合接口升级</div> <div class=\"feature-desc\"> <p class=\"text-sm text-gray-600 mb-2\">新增39个平台支持，覆盖科技、社区、游戏等多领域。</p> <p class=\"text-sm text-gray-500\"> 包括：36氪、51CTO、吾爱破解、AcFun、酷安、CSDN、数字尾巴、极客公园、原神、果壳、HelloGitHub、虎扑、虎嗅、爱范儿、英雄联盟、NGA、什么值得买等。</p> </div> </li> <li> <div class=\"feature-title\">工具优化与修复",
        "points": [
          "<strong><router-link to=\"/tools/design/font-copyright\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">字体版权查询</router-link></strong>：优化结果展示，支持列表式查看详细版权信息，增加使用说明。",
          "<strong><router-link to=\"/tools/daily/car-price\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">车辆价格查询</router-link></strong>：修复API数据展示问题，增加空状态提示和使用说明。",
          "<strong>工具推荐</strong>：优化相关工具推荐逻辑，提升匹配准确度。"
        ]
      }
    ]
  },
  {
    "id": "v2.7.5",
    "version": "2.7.5",
    "date": "2025-12-19 10:00",
    "badgeText": "更新",
    "badgeType": "primary",
    "title": "新增AI学生助手分类与工具",
    "features": []
  },
  {
    "id": "v2.7.2",
    "version": "2.7.2",
    "date": "2025-12-17 10:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "AI分析报告工具矩阵扩充",
    "features": []
  },
  {
    "id": "v2.7.1",
    "version": "2.7.1",
    "date": "2025-12-16 18:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "AI办公工具矩阵进一步完善",
    "features": []
  },
  {
    "id": "v2.7.0",
    "version": "2.7.0",
    "date": "2025-12-16 16:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "新增AI办公工具分类，助力高效办公",
    "features": []
  },
  {
    "id": "v2.6.2",
    "version": "2.6.2",
    "date": "2025-12-16 10:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "AI写作工具持续扩充与优化",
    "features": [
      {
        "title": "新增11个AI写作工具",
        "points": [
          "<strong><router-link to=\"/tools/ai/literature-recommend\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">文献推荐</router-link></strong>：智能推荐相关领域的高质量文献，助力学术研究。",
          "<strong><router-link to=\"/tools/ai/self-reflection\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">检讨书</router-link></strong>：智能生成态度诚恳的检讨书。",
          "<strong><router-link to=\"/tools/ai/project-proposal\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">项目策划方案</router-link></strong>：生成包含背景、目标、实施计划的完整策划案。",
          "<strong><router-link to=\"/tools/ai/speech-script\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">讲话稿</router-link></strong>：生成各类场合的致辞和讲话稿。",
          "<strong><router-link to=\"/tools/ai/short-video-title\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">短视频标题</router-link></strong>：生成吸引眼球的短视频爆款标题。",
          "<strong><router-link to=\"/tools/ai/short-video-script\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">短视频剧本</router-link></strong>：生成专业的分镜头脚本。",
          "<strong><router-link to=\"/tools/ai/article-summary\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">长文/报告摘要</router-link></strong>：智能提炼核心观点，生成精准摘要。",
          "<strong><router-link to=\"/tools/ai/opening-report\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">开题报告</router-link></strong>：生成标准规范的学术论文开题报告。",
          "<strong><router-link to=\"/tools/ai/article-outline\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">长文/报告大纲</router-link></strong>：生成逻辑清晰的文章/报告大纲。",
          "<strong><router-link to=\"/tools/ai/article-polishing\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">文章降重润色</router-link></strong>：智能改写降重，优化语言表达。",
          "<strong><router-link to=\"/tools/ai/graduation-thesis\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">毕业长文/报告</router-link></strong>：辅助生成毕业论文初稿。"
        ]
      },
      {
        "title": "体验优化",
        "points": [
          "优化AI生成内容的标题层级，默认使用三级标题，提升阅读体验。",
          "修复生成按钮的加载动画效果。"
        ]
      }
    ]
  },
  {
    "id": "v2.6.1",
    "version": "2.6.1",
    "date": "2025-12-15 14:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "AI写作工具大规模扩充",
    "features": [
      {
        "title": "新增13个AI写作工具",
        "points": [
          "<strong><router-link to=\"/tools/ai/book-review\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">读后感/读书笔记</router-link></strong>：智能生成高质量读后感和读书笔记，支持多种书籍类型。",
          "<strong><router-link to=\"/tools/ai/literature-review\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">文献综述</router-link></strong>：智能生成专业文献综述，支持多种学术领域。",
          "<strong><router-link to=\"/tools/ai/training-experience\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">培训心得</router-link></strong>：智能生成培训心得体会，总结学习收获和感悟。",
          "<strong><router-link to=\"/tools/ai/work-report-ppt\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">工作汇报PPT</router-link></strong>：智能生成工作汇报PPT大纲和内容脚本，助力高效汇报。",
          "<strong><router-link to=\"/tools/ai/speech-draft\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">演讲稿</router-link></strong>：智能生成精彩演讲稿，支持多种场合和风格。",
          "<strong><router-link to=\"/tools/ai/novel-plot\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">小说剧情创作</router-link></strong>：智能生成小说剧情大纲、角色设定和故事梗概。",
          "<strong><router-link to=\"/tools/ai/debriefing-report\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">述职报告</router-link></strong>：智能生成个人述职报告，突出工作业绩和职业亮点。",
          "<strong><router-link to=\"/tools/ai/essay-writing\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">作文一键写作</router-link></strong>：智能生成各类作文，支持不同年级和题材要求。",
          "<strong><router-link to=\"/tools/ai/xiaohongshu-note\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">小红书笔记生成</router-link></strong>：智能生成小红书风格笔记，包含Emoji和种草文案。",
          "<strong><router-link to=\"/tools/ai/xiaohongshu-title\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">小红书爆款标题</router-link></strong>：智能生成吸引眼球的小红书爆款标题，提升点击率。",
          "<strong><router-link to=\"/tools/ai/xiaohongshu-rewrite\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">小红书笔记改写</router-link></strong>：一键将普通文本改写为小红书风格笔记，增加吸引力。",
          "<strong><router-link to=\"/tools/ai/essay-contest\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">征文</router-link></strong>：智能生成各类征文稿件，紧扣主题，文采斐然。",
          "<strong><router-link to=\"/tools/ai/spokesperson-speech\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">发言稿</router-link></strong>：智能生成各类会议、活动发言稿，得体大方。"
        ]
      },
      {
        "title": "工具总数更新",
        "points": [
          "工具总数从227个增加到240个，AI写作工具分类已达15个。"
        ]
      }
    ]
  },
  {
    "id": "v2.6.0",
    "version": "2.6.0",
    "date": "2025-12-15 10:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "AI工具箱扩充",
    "features": [
      {
        "title": "新增AI工具",
        "points": [
          "<strong><router-link to=\"/tools/ai/article-generator\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">AI文章生成</router-link></strong>：智能生成高质量文章，支持多种风格和用途。"
        ]
      },
      {
        "title": "分类优化",
        "points": [
          "新增<strong>AI写作工具</strong>分类，整合写作类AI应用。"
        ]
      }
    ]
  },
  {
    "id": "v2.5.9",
    "version": "2.5.9",
    "date": "2025-12-14 21:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "多媒体工具扩充与修复",
    "features": [
      {
        "title": "新增与优化",
        "points": [
          "<strong><router-link to=\"/tools/video/trimmer\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频时长剪辑</router-link></strong>：新增视频片段截取功能，支持双向滑块精确选择。",
          "<strong><router-link to=\"/tools/video/rotate\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频旋转/翻转</router-link></strong>：新增视频旋转和镜像翻转工具，解决拍摄方向问题。",
          "<strong><router-link to=\"/tools/video/crop\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频画面裁剪</router-link></strong>：优化裁剪工具体验，增加处理进度显示。",
          "<strong><router-link to=\"/tools/audio/merge\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">音频合并</router-link></strong>：UI 全面升级，新增时长计算、拖拽上传和实时进度条。",
          "<strong><router-link to=\"/tools/video/to-audio\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频提取音频</router-link></strong>：UI 升级，优化格式支持和预览体验。"
        ]
      }
    ]
  },
  {
    "id": "v2.5.8",
    "version": "2.5.8",
    "date": "2025-12-14 20:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "多媒体剪辑功能增强",
    "features": [
      {
        "title": "新增剪辑工具",
        "points": [
          "<strong><router-link to=\"/tools/video/crop\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频画面裁剪</router-link></strong>：在线裁剪视频画面区域，支持自由调整比例。",
          "<strong><router-link to=\"/tools/audio/volume-booster\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">音频音量放大</router-link></strong>：在线调整音频音量，支持最大 300% 增益。",
          "<strong><router-link to=\"/tools/audio/recorder\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">在线录音</router-link></strong>：免费在线录音工具，支持波形可视化与WebM导出。"
        ]
      }
    ]
  },
  {
    "id": "v2.5.7",
    "version": "2.5.7",
    "date": "2025-12-14 19:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "音频处理工具上线",
    "features": [
      {
        "title": "新增音频工具",
        "points": [
          "<strong><router-link to=\"/tools/audio/converter\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">音频格式转换</router-link></strong>：在线音频格式转换工具，支持 MP3、WAV、AAC、OGG 等格式互转。",
          "<strong><router-link to=\"/tools/audio/trimmer\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">音频剪辑</router-link></strong>：在线音频剪辑工具，支持可视化的波形剪辑，精确裁剪音频片段。"
        ]
      }
    ]
  },
  {
    "id": "v2.5.6",
    "version": "2.5.6",
    "date": "2025-12-14 18:00",
    "badgeText": "优化",
    "badgeType": "primary",
    "title": "视频工具体验优化",
    "features": [
      {
        "title": "功能优化",
        "points": [
          "全面优化视频工具系列的交互体验，增加详细的版权信息和功能注释。",
          "优化代码结构，提升工具运行稳定性。"
        ]
      }
    ]
  },
  {
    "id": "v2.5.5",
    "version": "2.5.5",
    "date": "2025-12-14 17:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "剪辑工具分类上线",
    "features": [
      {
        "title": "新增剪辑工具",
        "points": [
          "<strong><router-link to=\"/tools/video/frame\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频抽帧工具</router-link></strong>：在线提取视频画面，支持按时间点精确截图和批量导出，本地处理保护隐私。",
          "<strong><router-link to=\"/tools/video/audio\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频提取音频</router-link></strong>：在线从视频中提取高质量音频，支持导出为 WAV 格式。",
          "<strong><router-link to=\"/tools/video/gif\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频转GIF</router-link></strong>：在线将视频转换为GIF动图，支持截取片段、调整尺寸和帧率。",
          "<strong><router-link to=\"/tools/video/webcam\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">摄像头录制</router-link></strong>：在线录制摄像头视频，支持高清录制和音频采集，本地处理更安全。",
          "<strong><router-link to=\"/tools/video/watermark\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频加水印</router-link></strong>：在线为视频添加文字或图片水印，支持拖拽调节位置，本地处理保护隐私。",
          "<strong><router-link to=\"/tools/video/speed\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">视频倍速处理</router-link></strong>：在线调整视频播放速度（0.5x - 4.0x），支持导出处理后的视频，本地处理更安全。"
        ]
      }
    ]
  },
  {
    "id": "v2.5.4",
    "version": "2.5.4",
    "date": "2025-12-14 16:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "开发者辅助工具",
    "features": [
      {
        "title": "新增开发工具",
        "points": [
          "<strong><router-link to=\"/tools/dev/url-parser\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">URL 解析器</router-link></strong>：将 URL 解析为协议、主机、路径、查询参数等组成部分。",
          "<strong><router-link to=\"/tools/dev/cron\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Cron 表达式生成器</router-link></strong>：可视化生成 Cron 表达式，支持 Quartz 和 Linux Crontab 格式。"
        ]
      }
    ]
  },
  {
    "id": "v2.5.3",
    "version": "2.5.3",
    "date": "2025-12-14 15:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "开发者辅助工具",
    "features": [
      {
        "title": "新增辅助工具",
        "points": [
          "<strong><router-link to=\"/tools/dev/keycode\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">键盘键值码查看器</router-link></strong>：在线查看键盘按键的 KeyCode、Code 等详细信息，开发调试必备。",
          "<strong><router-link to=\"/tools/dev/user-agent\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">User Agent 解析</router-link></strong>：查看您的浏览器 User Agent 字符串，解析操作系统、浏览器版本和设备类型。"
        ]
      }
    ]
  },
  {
    "id": "v2.5.2",
    "version": "2.5.2",
    "date": "2025-12-14 14:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "办公规范工具更新",
    "features": [
      {
        "title": "新增办公规范工具",
        "points": [
          "<strong><router-link to=\"/tools/doc/spec\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">常用文档规范</router-link></strong>：提供公文写作与文档排版的标准规范参考，包含A4纸张尺寸、页边距、字体字号等详细参数。"
        ]
      }
    ]
  },
  {
    "id": "v2.5.1",
    "version": "2.5.1",
    "date": "2025-12-14 12:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "开发者工具箱扩充",
    "features": [
      {
        "title": "新增开发辅助工具",
        "points": [
          "<strong><router-link to=\"/tools/dev/json-format\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">JSON 格式化工具</router-link></strong>：在线 JSON 代码格式化、验证、压缩工具，支持错误检查和一键复制。",
          "<strong><router-link to=\"/tools/dev/diff-checker\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">文本对比工具</router-link></strong>：在线比较两段文本或代码的差异，高亮显示新增和删除的内容。",
          "<strong><router-link to=\"/tools/dev/url-encoder\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">URL 编码/解码</router-link></strong>：在线 URL Encode / Decode 工具，支持 UTF-8 编码，自动处理特殊字符。",
          "<strong><router-link to=\"/tools/dev/timestamp-converter\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">时间戳转换</router-link></strong>：在线 Unix 时间戳与北京时间相互转换工具，支持秒和毫秒单位。",
          "<strong><router-link to=\"/tools/dev/md5-encrypt\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">MD5 加密工具</router-link></strong>：在线 MD5 加密工具，支持 32 位和 16 位加密，大小写可选。"
        ]
      },
      {
        "title": "新增媒体工具",
        "points": [
          "<strong><router-link to=\"/tools/media/qrcode-generator\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">二维码生成器</router-link></strong>：在线生成自定义二维码，支持设置颜色、尺寸、容错率，可下载 PNG 图片。"
        ]
      }
    ]
  },
  {
    "id": "v2.5.0",
    "version": "2.5.0",
    "date": "2025-12-14 10:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "设计与文档工具更新",
    "features": [
      {
        "title": "新增设计规范工具",
        "points": [
          "<strong><router-link to=\"/tools/design/web-ui-spec\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Web端设计规范</router-link></strong>：提供Web端常用布局尺寸、栅格系统、文字排版等设计规范参考。",
          "<strong><router-link to=\"/tools/design/typography-spec\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">字体排版规范</router-link></strong>：提供Web端常用字体家族、字号层级、行高比例等排版规范。",
          "<strong><router-link to=\"/tools/design/color-spec\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">色彩规范生成器</router-link></strong>：基于主色调自动生成完整的色彩系统，包含明暗色阶和辅助色。"
        ]
      },
      {
        "title": "新增文档处理工具",
        "points": [
          "<strong><router-link to=\"/tools/doc/markdown-table\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Markdown 表格生成器</router-link></strong>：可视化编辑表格，自动生成 Markdown 格式代码。",
          "<strong><router-link to=\"/tools/doc/text-cleaner\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">文本清洗工具</router-link></strong>：一键去除空行、重复行、HTML标签，支持大小写转换。",
          "<strong><router-link to=\"/tools/doc/number-chinese\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">数字转中文大写</router-link></strong>：在线将数字转换为中文大写金额，适用于财务报销等场景。"
        ]
      },
      {
        "title": "新增常用设计工具",
        "points": [
          "<strong><router-link to=\"/tools/design/css-flexbox\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">CSS Flexbox 生成器</router-link></strong>：可视化调整 Flexbox 布局属性，生成 CSS 代码。",
          "<strong><router-link to=\"/tools/design/css-text-shadow\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">CSS 文本阴影生成器</router-link></strong>：在线可视化生成 CSS text-shadow 代码。",
          "<strong><router-link to=\"/tools/design/css-gradient-text\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">CSS 渐变文字生成器</router-link></strong>：快速生成炫酷的渐变色文字效果。"
        ]
      }
    ]
  },
  {
    "id": "v2.4.8",
    "version": "2.4.8",
    "date": "2025-12-13 18:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "实用开发与计算工具",
    "features": [
      {
        "title": "新增工具",
        "points": [
          "<strong><router-link to=\"/tools/dev/sql-format\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">SQL格式化</router-link></strong>：在线SQL代码格式化和美化工具，支持多种SQL方言。",
          "<strong><router-link to=\"/tools/calculation/discount\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">折扣计算器</router-link></strong>：快速计算打折后的价格和节省的金额，支持折扣率和减免金额。",
          "<strong><router-link to=\"/tools/design/gradient\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">CSS 渐变生成器</router-link></strong>：在线生成精美的 CSS 线性渐变和径向渐变背景代码。",
          "<strong><router-link to=\"/tools/web/meta-tags\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Meta 标签生成器</router-link></strong>：生成网页 SEO 及社交媒体分享所需的 Meta 标签。"
        ]
      }
    ]
  },
  {
    "id": "version-2-4-7",
    "version": "2.4.7",
    "date": "2025-12-13 16:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "设计规范优化与新工具",
    "features": [
      {
        "title": "新增健康工具",
        "points": [
          "<strong><router-link to=\"/tools/calculation/bmr\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">BMR 基础代谢计算器</router-link></strong>：计算基础代谢率(BMR)和每日热量消耗(TDEE)，科学管理身材。"
        ]
      },
      {
        "title": "设计规范优化",
        "points": [
          "优化了<strong>在线图片压缩</strong>工具的页面布局和视觉风格，使其与整体 UI 规范保持一致。",
          "优化了<strong>全屏翻页时钟</strong>的默认展示效果，增加了卡片容器和全屏切换动画。"
        ]
      }
    ]
  },
  {
    "id": "version-2-4-6",
    "version": "2.4.6",
    "date": "2025-12-13 14:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "视觉与图片工具上新",
    "features": [
      {
        "title": "新增工具",
        "points": [
          "<strong><router-link to=\"/tools/daily/flip-clock\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">全屏翻页时钟</router-link></strong>：极简风格的翻页时钟，支持 12/24 小时制，适合作为桌面屏保。",
          "<strong><router-link to=\"/tools/design/image-compressor\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">在线图片压缩</router-link></strong>：支持 JPG/PNG/WEBP 格式图片压缩，可调节质量和尺寸，本地处理更安全。"
        ]
      },
      {
        "title": "体验优化",
        "points": [
          "优化了<strong>打字雨</strong>游戏的游戏区域高度，适配不同屏幕尺寸，提升游戏体验。"
        ]
      }
    ]
  },
  {
    "id": "version-2-4-5",
    "version": "2.4.5",
    "date": "2025-12-13 12:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "前端开发工具上新",
    "features": [
      {
        "title": "新增开发工具",
        "points": [
          "<strong><router-link to=\"/tools/design/gradient\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">CSS 渐变生成器</router-link></strong>：在线生成精美的 CSS 线性渐变和径向渐变背景代码。",
          "<strong><router-link to=\"/tools/web/meta-tags\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Meta 标签生成器</router-link></strong>：生成网页 SEO 及社交媒体分享所需的 Meta 标签，支持实时预览。"
        ]
      }
    ]
  },
  {
    "id": "version-2-4-4",
    "version": "2.4.4",
    "date": "2025-12-13 10:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "开发、设计与生活工具上新",
    "features": [
      {
        "title": "新增开发与设计工具",
        "points": [
          "<strong><router-link to=\"/tools/design/glassmorphism\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">CSS 玻璃拟态生成器</router-link></strong>：在线生成 Glassmorphism 风格 CSS 代码。",
          "<strong><router-link to=\"/tools/image-to-base64\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">图片转 Base64</router-link></strong>：在线将图片转换为 Base64 编码，支持一键复制。",
          "<strong><router-link to=\"/tools/dev/case-converter\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">命名风格转换</router-link></strong>：支持 Camel、Pascal、Snake、Kebab 等多种变量命名风格互转。",
          "<strong><router-link to=\"/tools/text/lorem-ipsum\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Lorem Ipsum 生成器</router-link></strong>：快速生成中文、英文占位符文本。"
        ]
      },
      {
        "title": "新增生活工具",
        "points": [
          "<strong><router-link to=\"/tools/image-color\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">图片主色调提取</router-link></strong>：上传图片自动提取主色调，生成配色方案。",
          "<strong><router-link to=\"/tools/percentage\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">百分比计算器</router-link></strong>：在线百分比计算工具，支持计算占比、数值计算、增长率等。"
        ]
      },
      {
        "title": "新增测试工具",
        "points": [
          "<strong><router-link to=\"/tools/dev/keyboard-test\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">键盘测试</router-link></strong>：在线检测键盘按键是否正常，支持全键位检测。"
        ]
      }
    ]
  },
  {
    "id": "version-2-4-3",
    "version": "2.4.3",
    "date": "2025-12-12 12:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "生活工具与心理测试上新",
    "features": [
      {
        "title": "新增生活常用工具",
        "points": [
          "<strong><router-link to=\"/tools/daily/decision-maker\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">帮我决定</router-link></strong>：选择困难症福音，输入选项，让运气帮你做决定。"
        ]
      },
      {
        "title": "新增潜能测试",
        "points": [
          "<strong><router-link to=\"/tools/psychology/color-test\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">色彩性格测试</router-link></strong>：基于哈特曼性格色彩密码，探索你的核心动力和性格优势。"
        ]
      },
      {
        "title": "规范优化",
        "points": [
          "全面检查并优化了生活常用类和潜能测试类工具的页面布局，确保符合统一的 UI 设计规范。"
        ]
      }
    ]
  },
  {
    "id": "version-2-4-2",
    "version": "2.4.2",
    "date": "2025-12-12 11:30",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "游戏体验修复与新增",
    "features": [
      {
        "title": "新增小游戏",
        "points": [
          "<strong><router-link to=\"/tools/games/memory-card\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">记忆翻牌</router-link></strong>：考验记忆力的翻牌配对游戏，支持 4x4 和 6x6 两种难度。"
        ]
      },
      {
        "title": "问题修复",
        "points": [
          "<strong>打字雨</strong>：修复了全屏模式下输入框无法显示的问题，现在全屏体验更加完美。"
        ]
      }
    ]
  },
  {
    "id": "version-2-4-1",
    "version": "2.4.1",
    "date": "2025-12-12 10:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "游戏功能升级与新工具",
    "features": [
      {
        "title": "新增摸鱼工具",
        "points": [
          "<strong><router-link to=\"/tools/games/woodfish\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">电子木鱼</router-link></strong>：在线敲木鱼，积攒功德，净化心灵。",
          "<strong><router-link to=\"/tools/games/2048\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">2048</router-link></strong>：经典的数字合成游戏，挑战合成2048。"
        ]
      },
      {
        "title": "体验优化",
        "points": [
          "<strong>打字雨</strong>：新增全屏模式，提供更沉浸的打字体验。",
          "<strong>界面优化</strong>：统一了扫雷、贪吃蛇、打字雨、电子木鱼、2048等小游戏页面的排版风格，增加工具推荐。"
        ]
      }
    ]
  },
  {
    "id": "version-2-4-0",
    "version": "2.4.0",
    "date": "2025-12-11 20:00",
    "badgeText": "娱乐",
    "badgeType": "warning",
    "title": "摸鱼游戏再添新成员",
    "features": [
      {
        "title": "新增经典小游戏",
        "points": [
          "<strong><router-link to=\"/tools/games/snake\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">贪吃蛇</router-link></strong>：经典怀旧游戏，控制小蛇吃食物变长，挑战反应速度与策略规划。",
          "<strong><router-link to=\"/tools/games/minesweeper\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">扫雷</router-link></strong>：Windows 经典再现，提供初级、中级、高级三种难度，支持右键插旗标记，锻炼逻辑推理能力。"
        ]
      }
    ]
  },
  {
    "id": "version-2-3-9",
    "version": "2.3.9",
    "date": "2025-12-11 18:00",
    "badgeText": "娱乐",
    "badgeType": "warning",
    "title": "新增摸鱼小游戏",
    "features": [
      {
        "title": "新增打字雨游戏",
        "points": [
          "<strong><router-link to=\"/tools/games/typing-rain-cn\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">打字雨 (中文版)</router-link></strong>：经典打字游戏，支持中文词库，锻炼拼音输入速度。",
          "<strong><router-link to=\"/tools/games/typing-rain-en\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">打字雨 (英文版)</router-link></strong>：Type the falling words before they hit the ground! 锻炼英文打字速度。",
          "<strong>游戏特性</strong>：包含动态难度调整、连击系统、准确率统计以及炫酷的城市夜景雨滴效果。"
        ]
      }
    ]
  },
  {
    "id": "version-2-3-8",
    "version": "2.3.8",
    "date": "2025-12-11 16:00",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "新增生活常用与开发工具",
    "features": [
      {
        "title": "新增实用工具",
        "points": [
          "<strong><router-link to=\"/tools/relationship\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">亲戚称呼计算器</router-link></strong>：解决过年走亲戚不知如何称呼的尴尬，支持互查，逢年过节必备神器。",
          "<strong><router-link to=\"/tools/base64\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Base64转换工具</router-link></strong>：支持文本与图片的Base64编码转换，支持UTF-8字符集与常见图片格式。"
        ]
      }
    ]
  },
  {
    "id": "version-2-3-7",
    "version": "2.3.7",
    "date": "2025-12-11 10:00",
    "badgeText": "重磅",
    "badgeType": "danger",
    "title": "全面升级PDF工具箱与新增效率工具",
    "features": [
      {
        "title": "PDF工具箱全面升级",
        "points": [
          "新增 <strong><router-link to=\"/tools/pdf-rotate\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF旋转</router-link></strong>、 <strong><router-link to=\"/tools/pdf-split\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF拆分</router-link></strong>、 <strong><router-link to=\"/tools/pdf-merge\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF合并</router-link></strong>、 <strong><router-link to=\"/tools/pdf-watermark\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF水印</router-link></strong>、 <strong><router-link to=\"/tools/pdf-encrypt\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF加密</router-link></strong>、 <strong><router-link to=\"/tools/pdf-page-number\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF页码</router-link></strong>、 <strong><router-link to=\"/tools/pdf-extract-text\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">PDF文本提取</router-link></strong> 等8大核心工具。",
          "统一全新的 <strong>UI设计规范</strong>，支持 <strong>实时预览</strong> 与 <strong>本地处理</strong>，保护隐私安全。",
          "优化 <strong><router-link to=\"/tools/markdown-to-pdf\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">Markdown转PDF</router-link></strong> 工具，支持代码高亮与样式定制。"
        ]
      },
      {
        "title": "新增效率办公工具",
        "points": [
          "新增 <strong><router-link to=\"/tools/word-count\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">字数统计</router-link></strong>、 <strong><router-link to=\"/tools/date-calculator\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">日期计算器</router-link></strong>、 <strong><router-link to=\"/tools/screen-recorder\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">屏幕录制</router-link></strong>、 <strong><router-link to=\"/tools/todo-list\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">待办清单</router-link></strong>、 <strong><router-link to=\"/tools/pomodoro\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">番茄钟</router-link></strong> 等实用工具。",
          "新增 <strong><router-link to=\"/tools/daily/age-calculator\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">年龄计算器</router-link></strong> 与 <strong><router-link to=\"/tools/daily/life-progress\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">人生进度条</router-link></strong>，可视化展示时间流逝。"
        ]
      }
    ]
  },
  {
    "id": "version-2-3-6",
    "version": "2.3.6",
    "date": "2025-12-08 10:00",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "新增多款实用计算器与工具详情页优化",
    "features": [
      {
        "title": "新增5款效率计算器",
        "points": [
          "<strong><router-link to=\"/tools/calculation/mortgage\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">房贷计算器</router-link></strong>：支持商业贷款、公积金贷款及组合贷款计算，提供等额本息与等额本金两种还款方式对比。",
          "<strong><router-link to=\"/tools/calculation/mortgage-rate\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">房贷利率调整计算器</router-link></strong>：快速计算LPR利率调整前后的月供变化与利息节省情况。",
          "<strong><router-link to=\"/tools/calculation/investment\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">投资收益计算器</router-link></strong>：支持复利计算与定投收益预测，辅助制定长期理财规划。",
          "<strong><router-link to=\"/tools/calculation/social-insurance\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">五险一金计算器</router-link></strong>：依据2025最新政策，精准计算个人应缴社保公积金及税后收入。",
          "<strong><router-link to=\"/tools/calculation/temperature\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">温度转换器</router-link></strong>：支持摄氏度、华氏度、开尔文温标的实时双向转换。"
        ]
      },
      {
        "title": "工具详情页体验升级",
        "points": [
          "<strong>新增工具指南</strong>：所有计算器页面新增详细的\"工具介绍\"与\"使用方法\"指南，帮助用户快速上手。",
          "<strong>视觉与布局优化</strong>：统一优化页面布局与视觉风格，提升浏览体验。",
          "<strong>智能推荐集成</strong>：底部集成智能工具推荐功能，方便用户发现更多实用工具。"
        ]
      }
    ]
  },
  {
    "id": "version-2-3-5",
    "version": "2.3.5",
    "date": "2025-12-06 14:00",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "心理测试组件重构与架构标准化",
    "features": [
      {
        "title": "心理测试组件全面重构",
        "points": [
          "<strong>组件标准化</strong>：完成 LeftRightBrain、EQTest、ProgrammerTest、BigFive、Enneagram、ABO、MBTI 等7个核心测试组件的重构。",
          "<strong>架构升级</strong>：统一采用 BaseTest 模板架构，移除冗余代码与重复依赖，大幅提升代码可维护性。",
          "<strong>体验优化</strong>：优化组件加载逻辑与数据流转，确保测试过程更加流畅稳定。"
        ]
      }
    ]
  },
  {
    "id": "version-2-3-4",
    "version": "2.3.4",
    "date": "2025-12-06 10:00",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "图片工具矩阵扩充与AI助手优化",
    "features": [
      {
        "title": "新增数据图表工具",
        "points": [
          "<strong><router-link to=\"/tools/radar\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">雷达图</router-link></strong>：支持多维数据对比分析，适用于能力评估、绩效分析等场景。",
          "<strong><router-link to=\"/tools/funnel\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">漏斗图</router-link></strong>：支持转化率分析，适用于销售漏斗、用户行为路径等场景。",
          "<strong><router-link to=\"/tools/gauge\" target=\"_blank\" class=\"hover:text-blue-600 transition-colors\">仪表盘</router-link></strong>：支持进度展示与完成率分析，适用于KPI监控、目标追踪等场景。"
        ]
      },
      {
        "title": "新增图片处理工具",
        "points": [
          "<strong>免费在线图片拼接</strong>：支持多张图片横向或纵向拼接，可自定义间距与背景色，制作长图神器。",
          "<strong>免费图片合成GIF</strong>：在线将多张静态图片合成为动态GIF，支持自定义帧率、尺寸与画质。",
          "<strong>免费九宫格切图</strong>：原\"图片切割\"工具升级，支持拖拽上传与自定义行列数，完美适配社交媒体配图。"
        ]
      },
      {
        "title": "AI助手与搜索优化",
        "points": [
          "<strong>AI智能搜索</strong>：大幅优化响应速度，移除冗余推理过程，提升UI交互体验，修复API超时问题。",
          "<strong>AI对话助手</strong>：新增使用限制与密码验证功能，保障服务稳定性；优化图标与界面细节。"
        ]
      },
      {
        "title": "体验优化",
        "points": [
          "<strong>证件照换底色</strong>：新增容差调节功能，优化抠图效果；调整UI布局提升易用性。"
        ]
      }
    ]
  },
  {
    "id": "version-2-3-3",
    "version": "2.3.3",
    "date": "2025-12-03 16:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "AI对话助手与DeepSeek R1重大更新",
    "features": [
      {
        "title": "<router-link to=\"/tools/ai/chat\" class=\"hover:text-blue-600 transition-colors flex items-center gap-2 group\" target=\"_blank\"> AI对话助手 (AIChat) 界面重构 <svg class=\"w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"> <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14\"></path> </svg> </router-link>",
        "points": [
          "<strong>界面升级</strong>：采用 Ant Design X 极简风格，优化输入框圆角与阴影，提升视觉体验。",
          "<strong>交互优化</strong>：办公智能体移至主对话区“快速提示词”，新增代码解释、周报生成等8种常用场景。",
          "<strong>功能增强</strong>：新增系统提示词与温度设置功能；顶部增加AI知识库等实用导航链接（新窗口打开）。",
          "<strong>细节打磨</strong>：模型选择增加SVG图标，消息气泡样式微调，响应式布局优化。"
        ]
      },
      {
        "title": "<router-link to=\"/tools/ai/deepseek-r1\" class=\"hover:text-blue-600 transition-colors flex items-center gap-2 group\" target=\"_blank\"> DeepSeek R1 修复与优化 <svg class=\"w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"> <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14\"></path> </svg> </router-link>",
        "points": [
          "修复 CSS 构建错误，优化思考动画与代码块样式。"
        ]
      }
    ]
  },
  {
    "id": "version-2-3-2",
    "version": "2.3.2",
    "date": "2025-12-03 10:00",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "免费在线文本配音工具上线",
    "features": [
      {
        "title": "文本转语音功能",
        "points": [
          "支持多种角色声音选择（少女音、阳光男声、成熟女声等）",
          "提供丰富的情感风格（愉快、悲伤、严肃等）",
          "一键生成自然流畅的语音，支持在线试听与下载"
        ]
      },
      {
        "title": "功能优化",
        "points": [
          "<strong>图片提示词反推工具</strong>：优化UI设计，精简模型选择，提升反推体验"
        ]
      }
    ]
  },
  {
    "id": "version-2-3-1",
    "version": "2.3.1",
    "date": "2025-12-02 16:00",
    "badgeText": "新增",
    "badgeType": "success",
    "title": "免费图片提示词反推工具上线",
    "features": [
      {
        "title": "核心功能",
        "points": [
          "支持图片上传与URL输入反推提示词",
          "通用模型精准识别，中文结果输出",
          "一键复制反推结果，便捷高效"
        ]
      }
    ]
  },
  {
    "id": "version-2-3-0",
    "version": "2.3.0",
    "date": "2025-12-02 15:30",
    "badgeText": "重磅",
    "badgeType": "danger",
    "title": "星座运势工具全新升级",
    "features": [
      {
        "title": "视觉与交互重构",
        "points": [
          "全新 <strong>深空主题UI</strong>，融合毛玻璃拟态设计，沉浸感十足",
          "新增 <strong>横向滚动星座选择器</strong>，配合流畅动效，切换更丝滑",
          "重构 <strong>响应式网格布局</strong>，完美适配移动端与桌面端显示"
        ]
      },
      {
        "title": "功能与体验优化",
        "points": [
          "新增 <strong>文案完整性智能检测</strong>，自动处理截断问题，确保内容完整",
          "优化 <strong>分享卡片生成算法</strong>，支持动态高度与高清渲染",
          "集成 <strong>SEO 结构化数据</strong> 与语义化文件名，提升搜索可见性"
        ]
      }
    ]
  },
  {
    "id": "version-2-2-9",
    "version": "2.2.9",
    "date": "2025-12-02 11:00",
    "badgeText": "重磅",
    "badgeType": "danger",
    "title": "免费应用图标生成器全新升级",
    "features": [
      {
        "title": "核心功能增强",
        "points": [
          "支持 <strong>多格式导出 (PNG/SVG/ICO)</strong>，满足全平台开发需求",
          "新增 <strong>自定义尺寸设置</strong> (16x16 至 1024x1024)，灵活适配各种场景",
          "支持 <strong>实时预览</strong> 与 <strong>多图层编辑</strong>，设计效果所见即所得",
          "内置 <strong>多平台预设</strong> (iOS/Android/Web)，一键生成标准图标包"
        ]
      },
      {
        "title": "性能与体验优化",
        "points": [
          "采用 <strong>异步渲染引擎</strong> 与 <strong>智能缓存机制</strong>，操作流畅无卡顿",
          "全新 <strong>响应式布局</strong>，完美适配移动端与桌面端操作",
          "纯前端处理，<strong>数据不上传</strong>，完全保护用户隐私"
        ]
      }
    ]
  },
  {
    "id": "version-2-2-8",
    "version": "2.2.8",
    "date": "2025-12-01 14:30",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "PDF 压缩工具全新升级",
    "features": [
      {
        "title": "核心压缩算法重构",
        "points": [
          "引入 <strong>DPI 智能光栅化技术</strong>，完美升级压缩策略，平衡体积与清晰度",
          "新增 <strong>灰度模式 (Grayscale)</strong>，去除冗余色彩信息，极致压缩文档体积",
          "支持 <strong>自定义图片质量 (0-100%)</strong>，精准控制压缩比率",
          "优化文件大小限制，支持最大 <strong>100MB</strong> 单文件处理"
        ]
      },
      {
        "title": "交互体验优化",
        "points": [
          "全新 <strong>简洁扁平化设计</strong>，去除多余阴影，视觉更清爽",
          "<strong>高级设置</strong> 默认展开，参数调整更直观便捷",
          "新增 <strong>重新压缩</strong> 功能，参数不满意可随时调整重试",
          "实时显示 <strong>压缩进度</strong> 与 <strong>体积对比</strong>，效果一目了然"
        ]
      }
    ]
  },
  {
    "id": "version-2-2-7",
    "version": "2.2.7",
    "date": "2025-12-01 10:00",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "GIF 压缩工具体验升级",
    "features": [
      {
        "title": "核心功能升级",
        "points": [
          "新增 <strong>Dithering (抖动算法)</strong> 选项，有效提升低色彩模式下的画质表现，减少色彩断层",
          "新增 <strong>自定义尺寸</strong> 输入功能，支持宽高比例自动锁定与智能调整"
        ]
      },
      {
        "title": "交互与视觉优化",
        "points": [
          "重构界面布局，将 <strong>效果对比</strong> 直接整合至预览区域，对比效果一目了然",
          "优化 <strong>使用说明</strong> 模块，拆分为功能特性与常见问题 (FAQ) 两个板块，阅读体验更佳",
          "统一全站设计风格，去除多余阴影，视觉体验更加清爽简洁",
          "修复部分 TypeScript 类型定义问题，提升代码稳定性与运行效率"
        ]
      }
    ]
  },
  {
    "id": "version-2-2-6",
    "version": "2.2.6",
    "date": "2025-09-25 16:30",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "国庆专属头像工具上线",
    "features": [
      {
        "title": "国庆专属头像生成器",
        "points": [
          "支持上传个人头像，一键生成国庆主题头像",
          "支持JPG、PNG格式图片上传，最大文件大小5MB",
          "实时预览效果，所见即所得的编辑体验",
          "一键下载生成的国庆头像，方便社交媒体使用",
          "移动端优化设计，完美适配手机操作"
        ]
      },
      {
        "title": "核心功能特点",
        "points": [
          "使用Canvas技术进行高质量图像处理和合成",
          "参考移动端原生应用设计，提供流畅的用户体验",
          "圆形头像预览区域，符合现代UI设计趋势",
          "大按钮设计，便于移动端触摸操作",
          "渐变背景和阴影效果，提升视觉层次感",
          "完整的错误处理和用户提示系统",
          "本地处理，保护用户隐私安全"
        ]
      },
      {
        "title": "技术实现亮点",
        "points": [
          "Vue 3 Composition API架构，代码结构清晰",
          "TypeScript类型安全，提升开发效率",
          "响应式布局设计，适配各种屏幕尺寸",
          "集成到工具列表和路由系统，无缝融入平台",
          "添加版权信息和开发团队标识"
        ]
      }
    ]
  },
  {
    "id": "version-2-2-5",
    "version": "2.2.5",
    "date": "2025-05-11 10:39",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "AI简历生成器工具上线",
    "features": [
      {
        "title": "AI简历生成器功能",
        "points": [
          "支持多种专业简历模板，提供简约、现代、清新、极简、扁平等风格",
          "集成AI内容生成功能，智能创建个人简介和工作经历描述",
          "提供快速模板填充，包含前端、后端、全栈、产品、设计等多种职业预设",
          "支持实时预览和一键导出PDF",
          "本地存储功能，确保数据不丢失"
        ]
      },
      {
        "title": "核心功能特点",
        "points": [
          "响应式设计，适配桌面和移动设备",
          "支持头像上传和编辑功能",
          "教育背景和工作经验可动态添加删除",
          "技能标签智能展示，支持逗号分隔输入",
          "高质量PDF导出，排版清晰专业",
          "内置职业化指导建议，帮助求职者更好地展示自己"
        ]
      }
    ]
  },
  {
    "id": "version-2-2-4",
    "version": "2.2.4",
    "date": "2025-05-05 19:20",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "摸头GIF生成器工具优化上线",
    "features": [
      {
        "title": "摸头GIF生成器",
        "points": [
          "支持上传图片生成可爱的摸头GIF动画",
          "支持JPG/PNG格式，文件大小不超过10MB",
          "提供多种参数调整：尺寸(15%-200%)、形变度(0%-150%)、速度(0.5x-5x)",
          "支持图片翻转和实时预览功能",
          "支持透明背景导出，更好地与各种背景融合",
          "支持通过URL添加图片，方便远程图片处理"
        ]
      },
      {
        "title": "核心功能特点",
        "points": [
          "使用Canvas实现高质量动画预览",
          "采用精灵图(sprite sheet)处理手部动画，效果更自然",
          "提供播放/暂停控制，优化预览体验",
          "优雅的UI设计，左侧预览右侧控制的布局",
          "全局响应式设计，适配移动端和桌面端"
        ]
      }
    ]
  },
  {
    "id": "version-2-2-3",
    "version": "2.2.3",
    "date": "2025-05-05 15:45",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "摸鱼日历工具上线",
    "features": [
      {
        "title": "摸鱼日历功能",
        "points": [
          "展示工资发放倒计时、距离周末天数等摸鱼信息",
          "提供丰富的节日倒计时（12个最近节日）",
          "显示每日摸鱼名言和小贴士",
          "支持一键复制为图片分享",
          "本地处理，无需联网获取数据"
        ]
      },
      {
        "title": "核心功能特点",
        "points": [
          "优雅的卡片设计和布局",
          "日期和工作日信息展示",
          "薪资发放日期倒计时",
          "年度重要节日倒计时",
          "响应式设计，完美适配移动设备",
          "简洁直观的图片复制分享功能"
        ]
      }
    ]
  },
  {
    "id": "version-2-2-2",
    "version": "2.2.2",
    "date": "2025-03-18 17:08",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "图片转SVG矢量图工具上线",
    "features": [
      {
        "title": "图片转SVG功能",
        "points": [
          "支持JPG、PNG、GIF等格式图片转换为SVG矢量图",
          "提供多种转换参数设置，包括颜色提取、曲线优化等",
          "支持实时预览和对比效果",
          "本地处理，无需上传服务器，保护隐私"
        ]
      },
      {
        "title": "功能特点",
        "points": [
          "支持彩色和黑白SVG转换模式",
          "提供专业的参数调节面板",
          "支持SVG代码复制和下载",
          "优化的转换算法，确保最佳效果"
        ]
      }
    ]
  },
  {
    "id": "version-2-2-1",
    "version": "2.2.1",
    "date": "2025-03-13 19:57",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "搜索功能全面升级",
    "features": [
      {
        "title": "AI搜索体验优化",
        "points": [
          "修复推理过程图标显示问题，优化视觉体验",
          "重新设计AI头像显示方案，提高跨平台兼容性",
          "解决回车键搜索响应问题，提升使用便捷性"
        ]
      },
      {
        "title": "错误处理机制优化",
        "points": [
          "增强API超时智能处理，长时间请求提供友好提示",
          "完善网络错误反馈机制，提供更清晰的解决建议",
          "优化加载状态显示，减少用户等待焦虑"
        ]
      },
      {
        "title": "界面交互体验优化",
        "points": [
          "简化快捷入口UI视觉效果，采用轻量级描边设计",
          "调整搜索面板配色与响应式布局，提升整体视觉协调性"
        ]
      }
    ]
  },
  {
    "id": "version-2-2-0",
    "version": "2.2.0",
    "date": "2025-03-13 18:06",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "图片格式转换工具上线",
    "features": [
      {
        "title": "图片格式转换功能",
        "points": [
          "支持JPG、PNG、WebP、BMP等多种格式互相转换",
          "支持批量处理多张图片并打包下载",
          "提供多种质量选项和专业参数设置",
          "本地处理，无需上传服务器，保护隐私"
        ]
      },
      {
        "title": "技术优化",
        "points": [
          "优化图片处理工具集性能",
          "改进批量处理文件下载体验",
          "完善各类图片格式的兼容性"
        ]
      }
    ]
  },
  {
    "id": "version-2-1-0",
    "version": "2.1.0",
    "date": "2024-02-27 23:41",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "AI 资讯聚合工具上线",
    "features": [
      {
        "title": "AI 资讯聚合功能",
        "points": [
          "支持多个 AI 资讯平台Rss内容聚合（机器之心、量子位等）",
          "实时更新的 AI 相关新闻和动态",
          "智能的新闻分类和筛选功能",
          "已读状态记录和持久化存储"
        ]
      },
      {
        "title": "技术优化",
        "points": [
          "优化数据加载和缓存策略",
          "优化移动端适配和触摸体验",
          "完善错误处理和重试机制"
        ]
      }
    ]
  },
  {
    "id": "version-2-0-9",
    "version": "2.0.9",
    "date": "2025-02-27 14:30",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "星系运动查看工具上线",
    "features": [
      {
        "title": "沉浸式星系运动查看工具",
        "points": [
          "可视化模拟宇宙中星系、行星、恒星等天体的运动轨迹",
          "支持太阳系、银河系、仙女座等多种天体模型展示",
          "支持调整速度、缩放比例和视角，实现沉浸式体验",
          "提供多种天体系统选择，包括银河系、半人马座α星系、蟹状星云等",
          "优化的WebGL渲染，确保流畅的动画效果",
          "支持显示/隐藏轨道和天体名称"
        ]
      },
      {
        "title": "交互体验优化",
        "points": [
          "响应式设计，支持桌面和移动设备",
          "可折叠控制面板，提供更大的观察空间",
          "智能自适应缩放功能，根据屏幕尺寸优化显示效果",
          "全面的SEO优化，提供更好的可访问性",
          "优化的语义化HTML结构，提升屏幕阅读器兼容性"
        ]
      }
    ]
  },
  {
    "id": "version-2-0-8",
    "version": "2.0.8",
    "date": "2025-02-26 00:55",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "DeepSeek AI 功能优化",
    "features": [
      {
        "title": "功能优化与增强",
        "points": [
          "优化\"进阶提示\"和\"DeepSeek导航\"按钮，支持新窗口打开",
          "改进代码复制功能，修复复制成功提示问题",
          "优化深度思考模式的切换逻辑",
          "完善用户交互体验和界面响应"
        ]
      },
      {
        "title": "用户体验提升",
        "points": [
          "优化按钮跳转逻辑，提供更好的导航体验",
          "改进功能提示信息的展示方式",
          "增强系统响应的及时性和准确性",
          "提升整体操作流畅度"
        ]
      }
    ]
  },
  {
    "id": "version-2-0-7",
    "version": "2.0.7",
    "date": "2025-02-25 12:14",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "AI智能搜索工具上线",
    "features": [
      {
        "title": "AI智能站内搜索",
        "points": [
          "基于大语言模型的智能搜索功能",
          "支持自然语言理解和语义匹配",
          "智能推荐相关工具和功能",
          "新增背景图片上传功能，支持jpg、png、webp格式",
          "优化图片滤镜效果，支持调节亮度、对比度、饱和度等",
          "新增多种装饰元素，包括霓虹光效、故障效果等",
          "优化预览框大小，采用固定尺寸以提供更稳定的预览体验",
          "增加背景类型选择，可在渐变背景和图片背景间切换",
          "完善文件格式限制，提供更清晰的上传提示"
        ]
      },
      {
        "title": "用户体验提升",
        "points": [
          "优化图片上传和预览交互流程",
          "增加更多提示信息，提升操作引导性",
          "改进预览缩放比例，提供更好的视觉体验",
          "优化移动端适配效果"
        ]
      }
    ]
  },
  {
    "id": "version-2-0-5",
    "version": "2.0.5",
    "date": "2025-02-23 20:03",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "DeepSeek专栏上线",
    "features": [
      {
        "title": "DeepSeek专栏功能",
        "points": [
          "新增DeepSeek专栏导航页面，提供一站式DeepSeek资源导航",
          "新增AI深度对话功能，支持多轮对话和上下文理解",
          "新增DeepSeek学习教程，包含基础入门到高级应用",
          "新增提示词工程指南，提供专业的Prompt编写建议",
          "支持多种场景应用案例展示"
        ]
      },
      {
        "title": "核心功能特点",
        "points": [
          "专业的DeepSeek模型调用和参数配置",
          "丰富的应用场景示例和最佳实践",
          "完整的学习路径和进阶指南",
          "优雅的界面设计和交互体验",
          "完善的移动端适配"
        ]
      }
    ]
  },
  {
    "id": "version-2-0-4",
    "version": "2.0.4",
    "date": "2025-02-21 18:02",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "DeepSeek提示词指南工具上线",
    "features": [
      {
        "title": "DeepSeek提示词指南",
        "points": [
          "提供专业的DeepSeek提示词模板和应用场景",
          "支持多种场景分类，包括投资分析、融资计划等",
          "提供详细的提示词使用说明和最佳实践",
          "优化的响应式布局和交互体验"
        ]
      }
    ]
  },
  {
    "id": "version-2-0-3",
    "version": "2.0.3",
    "date": "2025-02-18 20:44",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "AI产品榜单工具上线",
    "features": [
      {
        "title": "AI产品榜单工具",
        "points": [
          "实时展示热门AI工具和产品排名",
          "支持多维度排序（热度、评分、更新时间等）",
          "提供详细的工具介绍和使用说明",
          "支持一键访问目标工具",
          "优雅的响应式布局设计"
        ]
      },
      {
        "title": "核心功能特点",
        "points": [
          "智能排序算法，确保榜单数据准确性",
          "实时数据更新，保持信息时效性",
          "简洁直观的用户界面",
          "完善的移动端适配"
        ]
      }
    ]
  },
  {
    "id": "version-2-0-2",
    "version": "2.0.2",
    "date": "2025-02-16 16:06",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "AI外包报价生成器上线",
    "features": [
      {
        "title": "AI外包报价生成器",
        "points": [
          "支持多种项目类型（程序开发、短视频制作、设计等）",
          "智能分析项目需求，生成合理的工作量和成本预算",
          "支持自定义公司信息和模板管理",
          "提供PDF和图片两种导出格式",
          "支持税费、折扣等商务条款的灵活配置",
          "内置保密协议和水印功能"
        ]
      },
      {
        "title": "核心功能特点",
        "points": [
          "支持免费API和自定义API切换",
          "提供多个AI模型选择",
          "专业的报价单布局和样式",
          "自动保存功能，防止数据丢失",
          "完善的表单验证和错误提示"
        ]
      }
    ]
  },
  {
    "id": "version-2-0-1",
    "version": "2.0.1",
    "date": "2025-02-16 13:50",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "AI设计封面生成工具上线",
    "features": [
      {
        "title": "新增AI设计封面生成工具",
        "points": [
          "支持多种封面风格和布局选择",
          "内置20种精美渐变背景效果",
          "提供12种装饰元素（渐变边框、角标装饰、波浪线等）",
          "支持10种字体预设样式",
          "支持4种预设尺寸（小红书、微信公众号、知乎、通用海报）",
          "实时预览和一键下载功能"
        ]
      },
      {
        "title": "核心功能特点",
        "points": [
          "专业的字体排版系统，支持自定义字间距和描边效果",
          "智能文本布局，自动调整字体大小和位置",
          "高度可定制的装饰元素系统",
          "支持高清PNG格式导出",
          "完全本地处理，保护创作隐私"
        ]
      }
    ]
  },
  {
    "id": "version-2-0-0",
    "version": "2.0.0",
    "date": "2025-02-15 18:57",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "表情包制作工具上线",
    "features": [
      {
        "title": "表情包制作工具",
        "points": [
          "支持自定义文字内容和样式",
          "提供多种预设文字效果（简约黑体、粉色可爱、白底黑边等）",
          "支持自定义Logo和大小调整",
          "一键导出高清表情包",
          "本地处理，保护隐私安全"
        ]
      },
      {
        "title": "功能特点",
        "points": [
          "简洁直观的用户界面",
          "实时预览编辑效果",
          "支持字体大小和颜色自定义",
          "内置多种文字样式模板",
          "完善的移动端适配"
        ]
      }
    ]
  },
  {
    "id": "version-1-1-9",
    "version": "1.1.9",
    "date": "2025-02-15 14:29",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "DeepSeek AI 移动端 UI 适配优化",
    "features": [
      {
        "title": "页面移动端用户体验优化",
        "points": [
          "优化移动端字体大小，采用 rem 单位实现响应式文字",
          "改进移动端间距和布局，提升紧凑型布局体验",
          "优化移动端按钮和输入框尺寸，提高操作友好度",
          "完善移动端代码块展示，优化滚动和复制功能",
          "改进移动端功能区域布局，优化特性和问答展示"
        ]
      }
    ]
  },
  {
    "id": "version-1-1-8",
    "version": "1.1.8",
    "date": "2025-02-14 19:00",
    "badgeText": "更新",
    "badgeType": "success",
    "title": "AI提示词编辑器重大更新",
    "features": [
      {
        "title": "功能增强",
        "points": [
          "新增双模型支持：同时支持 Midjourney 和 Stable Diffusion 提示词生成",
          "优化标签系统：新增艺术风格、质量提升、光照效果等12个专业分类",
          "添加权重调整功能：支持精确的提示词权重控制",
          "集成智能翻译：支持中英文精准互译，提升使用体验",
          "改进用户界面：新增一键复制功能，优化标签展示效果"
        ]
      }
    ]
  },
  {
    "id": "version-1-1-7",
    "version": "1.1.7",
    "date": "2025-02-14 14:05",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "DeepSeek AI 对话工具界面优化",
    "features": [
      {
        "title": "DeepSeek R1 对话工具",
        "points": [
          "优化复制按钮样式，采用简洁的图标设计",
          "改进代码块样式，提供更好的阅读体验",
          "优化界面布局和交互细节",
          "提升整体视觉效果和用户体验"
        ]
      }
    ]
  },
  {
    "id": "version-1-1-6",
    "version": "1.1.6",
    "date": "2025-02-13 12:32",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "DeepSeek AI 对话工具重大升级",
    "features": [
      {
        "title": "DeepSeek R1 对话工具",
        "points": [
          "新增深度思考功能，实时展示 AI 的推理过程，帮助用户更好地理解 AI 的思考方式",
          "优化模型选择区域，提供更清晰的模型说明和性能特点",
          "改进界面交互体验，提升视觉效果",
          "增强系统稳定性和响应速度"
        ]
      }
    ]
  },
  {
    "id": "version-1-1-5",
    "version": "1.1.5",
    "date": "2025-02-12 16:37",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "DeepSeek AI 对话工具升级",
    "features": [
      {
        "title": "DeepSeek R1 对话工具",
        "points": [
          "优化用户界面设计，提升视觉体验",
          "支持多种模型选择（7B-70B）",
          "增强代码显示和语法高亮",
          "改进对话记录保存功能",
          "新增快捷提示词功能"
        ]
      },
      {
        "title": "DeepSeek 对话工具",
        "points": [
          "全新的界面设计和交互体验",
          "优化打字机效果显示",
          "改进消息保存和复制功能",
          "新增常见问题解答"
        ]
      }
    ]
  },
  {
    "id": "version-1-1-4",
    "version": "1.1.4",
    "date": "2025-02-08 21:48",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "新增小红书风格图片生成工具",
    "features": [
      {
        "title": "小红书风格图片生成工具",
        "points": [
          "基于 DeepSeek 大模型的智能文案生成",
          "支持多种文案风格和模板选择",
          "提供丰富的图片尺寸和样式设置",
          "支持自定义字体、颜色和排版",
          "一键生成精美的小红书风格图片"
        ]
      },
      {
        "title": "功能特点",
        "points": [
          "支持免费模式和自定义API双模式",
          "提供多种AI模型选择，满足不同需求",
          "实时预览和编辑功能",
          "支持一键导出和分享"
        ]
      }
    ]
  },
  {
    "id": "version-1-1-3",
    "version": "1.1.3",
    "date": "2025-02-07 03:55",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "新增 OCR 识别工具和讯飞星火工具",
    "features": [
      {
        "title": "OCR 识别工具",
        "points": [
          "支持图像文字识别，提供高效的文字提取功能",
          "支持多种语言识别",
          "支持批量处理和导出",
          "本地处理，保护隐私安全"
        ]
      },
      {
        "title": "讯飞星火工具",
        "points": [
          "基于讯飞星火大模型的智能对话工具",
          "支持多轮对话和上下文理解",
          "提供多种对话场景",
          "实时响应，高效准确"
        ]
      }
    ]
  },
  {
    "id": "version-1-1-2",
    "version": "1.1.2",
    "date": "2025-02-06 17:58",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "AI工具扩展与首页优化",
    "features": [
      {
        "title": "新增四个AI工具",
        "points": [
          "DeepSeek AI对话工具 <ul class=\"list-disc list-inside ml-4 text-sm text-gray-600 space-y-1\"> <li>支持自然语言对话和问答",
          "提供多种对话场景和专业领域支持",
          "实时响应，高效准确",
          "AI二维码生成工具 <ul class=\"list-disc list-inside ml-4 text-sm text-gray-600 space-y-1\"> <li>支持自定义二维码样式和内容",
          "AI智能优化二维码设计",
          "提供多种艺术风格选择",
          "Stable Diffusion绘画工具 <ul class=\"list-disc list-inside ml-4 text-sm text-gray-600 space-y-1\"> <li>支持文本生成图像",
          "提供多种艺术风格和参数调节",
          "高质量图像生成",
          "图像增强工具 <ul class=\"list-disc list-inside ml-4 text-sm text-gray-600 space-y-1\"> <li>AI智能提升图像质量",
          "支持多种增强模式",
          "批量处理功能"
        ]
      },
      {
        "title": "标签样式优化",
        "points": [
          "简化标签设计，采用更轻量的视觉效果",
          "优化标签间距和排版，最多显示2个标签",
          "超出标签数使用\"+n\"形式展示",
          "改进标签在不同设备下的适配效果"
        ]
      },
      {
        "title": "交互体验提升",
        "points": [
          "优化卡片悬停效果",
          "改进分类标签的展示方式",
          "提升整体页面的流畅度"
        ]
      }
    ]
  },
  {
    "id": "version-1-1-1",
    "version": "1.1.1",
    "date": "2025-02-05 15:00",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "照片工具集扩展",
    "features": [
      {
        "title": "新增四个照片处理工具",
        "points": [
          "证件照排版打印工具 <ul class=\"list-disc list-inside ml-4 text-sm text-gray-600 space-y-1\"> <li>支持多种纸张规格（A4、6寸、5寸、7寸相纸）",
          "智能排版算法，自动计算最佳布局",
          "支持自定义边距和照片间距",
          "提供多种预设方案（标准、护照、简历等）",
          "证件照裁剪工具 <ul class=\"list-disc list-inside ml-4 text-sm text-gray-600 space-y-1\"> <li>支持多种证件照尺寸",
          "智能人像识别和裁剪",
          "支持自定义裁剪区域",
          "证件照背景色修改工具 <ul class=\"list-disc list-inside ml-4 text-sm text-gray-600 space-y-1\"> <li>支持一键更换背景色",
          "提供标准证件照背景色",
          "支持自定义背景颜色",
          "证件照背景透明工具 <ul class=\"list-disc list-inside ml-4 text-sm text-gray-600 space-y-1\"> <li>智能抠图技术",
          "支持导出透明背景图片",
          "保持图片边缘清晰度"
        ]
      },
      {
        "title": "功能特点",
        "points": [
          "所有处理均在本地完成，保护隐私安全",
          "支持批量处理和一键导出",
          "优雅的界面设计和交互体验",
          "完善的移动端适配"
        ]
      }
    ]
  },
  {
    "id": "version-1-1-0",
    "version": "1.1.0",
    "date": "2025-01-28 00:50",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "新年文案生成器上线",
    "features": [
      {
        "title": "新增新年文案生成器",
        "points": [
          "使用 DeepSeek AI 生成走心的新年朋友圈文案",
          "支持个性化定制，可输入关键词生成更符合需求的文案",
          "支持一键复制功能和历史记录保存",
          "优雅的打字机展示效果和动画交互"
        ]
      },
      {
        "title": "功能特点",
        "points": [
          "响应式布局设计，完美适配各种设备",
          "优雅的动画效果和交互体验",
          "支持历史记录管理和一键复制分享"
        ]
      }
    ]
  },
  {
    "id": "version-1-0-9",
    "version": "1.0.9",
    "date": "2025-01-28 22:58",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "星座运势工具上线",
    "features": [
      {
        "title": "新增星座运势工具",
        "points": [
          "支持多时段运势查询（今日/明日/本周/本月）",
          "支持运势卡片生成与分享功能",
          "支持二维码快速访问",
          "优雅的响应式布局设计"
        ]
      },
      {
        "title": "功能特点",
        "points": [
          "实时获取最新星座运势数据",
          "支持一键生成运势卡片",
          "支持复制和下载运势卡片",
          "优雅的动画和交互效果"
        ]
      }
    ]
  },
  {
    "id": "version-1-0-8",
    "version": "1.0.8",
    "date": "2025-01-25 17:41",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "左侧菜单锚点跳转优化",
    "features": [
      {
        "title": "优化锚点跳转功能",
        "points": [
          "优化左侧菜单锚点跳转逻辑，支持直接跳转到对应位置",
          "当在首页时直接滚动到锚点位置",
          "当不在首页时通过路由参数跳转到对应位置",
          "提升用户导航体验和交互效率"
        ]
      }
    ]
  },
  {
    "id": "version-1-0-7",
    "version": "1.0.7",
    "date": "2025-01-24 00:18",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "新增三个实用工具",
    "features": [
      {
        "title": "新增今日热榜工具",
        "points": [
          "聚合各大平台热点内容",
          "支持实时更新和自动刷新",
          "优雅的动画效果和骨架屏",
          "响应式布局设计"
        ]
      },
      {
        "title": "新增爱情公寓一言工具",
        "points": [
          "自动获取爱情公寓经典台词",
          "优雅的打字机展示效果",
          "一键复制分享功能"
        ]
      }
    ]
  },
  {
    "id": "version-1-0-6",
    "version": "1.0.6",
    "date": "2025-01-22 16:50",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "摸鱼工具扩展",
    "features": [
      {
        "title": "新增三个摸鱼工具",
        "points": [
          "随机动漫壁纸 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/wallpaper/anime\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>",
          "随机柴郡表情包 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/emoji/cheshire\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>",
          "随机表情包 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/emoji/random\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>"
        ]
      },
      {
        "title": "功能特点",
        "points": [
          "支持一键获取随机壁纸和表情包",
          "优雅的加载动画效果",
          "一键下载功能",
          "响应式布局设计"
        ]
      }
    ]
  },
  {
    "id": "version-1-0-5",
    "version": "1.0.5",
    "date": "2025-01-22 15:16",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "随机文案工具扩展",
    "features": [
      {
        "title": "新增三个随机文案工具",
        "points": [
          "网易云热评生成器 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/copywriting/cloud-music\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>",
          "暖心安慰文案生成器 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/copywriting/comfort\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>",
          "毒鸡汤文案生成器 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/copywriting/poison-soup\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>"
        ]
      },
      {
        "title": "功能特点",
        "points": [
          "支持实时获取最新文案内容",
          "优雅的打字机展示效果",
          "一键复制分享功能",
          "响应式布局设计"
        ]
      }
    ]
  },
  {
    "id": "version-1-0-4",
    "version": "1.0.4",
    "date": "2025-01-22 11:04",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "应用图标生成器上线",
    "features": [
      {
        "title": "新增应用图标生成器",
        "points": [
          "支持多平台图标生成(iOS、Android、Web App等)",
          "支持自定义圆角和实时预览",
          "支持一键生成所有尺寸图标",
          "自动优化小尺寸图标清晰度",
          "支持批量打包下载"
        ]
      }
    ]
  },
  {
    "id": "version-1-0-3",
    "version": "1.0.3",
    "date": "2025-01-21 22:05",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "免费图标下载工具上线",
    "features": [
      {
        "title": "新增免费图标下载工具",
        "points": [
          "支持多种图标分类和搜索功能",
          "支持SVG和PNG格式下载",
          "支持自定义图标颜色和尺寸",
          "支持批量下载和打包导出",
          "所有图标均基于开源协议，可免费商用"
        ]
      }
    ]
  },
  {
    "id": "version-1-0-2",
    "version": "1.0.2",
    "date": "2025-01-18 16:17",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "栅格计算工具上线",
    "features": [
      {
        "title": "新增栅格计算工具",
        "points": [
          "支持自定义容器宽度、列数、间距等参数",
          "提供桌面端、平板、移动端等常用布局预设",
          "支持实时预览栅格布局效果",
          "支持导出 Figma/Sketch 配置和 CSS 代码",
          "支持响应式布局预览和设备切换"
        ]
      },
      {
        "title": "交互体验优化",
        "points": [
          "优化栅格预览区域的视觉效果",
          "添加参考线和列宽标注功能",
          "支持设备框架预览效果",
          "优化布局预设的展示和切换"
        ]
      }
    ]
  },
  {
    "id": "version-即将更新",
    "version": "即将更新",
    "date": "预计 2025-02",
    "badgeText": "预告",
    "badgeType": "info",
    "title": "新功能预告",
    "features": [
      {
        "title": "设计规范工具扩展",
        "points": [
          "<router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/design/logo-spec\" class=\"text-blue-500 hover:text-blue-600\">Logo设计规范</router-link> - 提供专业的Logo设计规范生成工具，包含使用场景和注意事项",
          "<router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/design/brand-spec\" class=\"text-blue-500 hover:text-blue-600\">品牌设计规范</router-link> - 生成完整的品牌设计规范，包含VI系统和应用场景",
          "<router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/design/contract\" class=\"text-blue-500 hover:text-blue-600\">设计合同生成器</router-link> - 快速生成设计项目合同，包含条款和版权说明"
        ]
      }
    ]
  },
  {
    "id": "version-1-0-1",
    "version": "1.0.1",
    "date": "2025-01-17 23:36",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "设计规范工具上线",
    "features": [
      {
        "title": "设计尺寸规范工具",
        "points": [
          "支持 iOS 和 Android 平台的设计规范查询",
          "包含字体、图标、分辨率等详细参数",
          "提供完整的设计规范参考指南",
          "支持快速切换平台查看不同规范"
        ]
      },
      {
        "title": "屏幕尺寸大全",
        "points": [
          "提供全面的手机屏幕尺寸参数查询",
          "包含主流品牌机型的详细参数",
          "支持按品牌和尺寸快速筛选"
        ]
      }
    ]
  },
  {
    "id": "version-1-0-0",
    "version": "1.0.0",
    "date": "2025-01-17 16:18",
    "badgeText": "正式版",
    "badgeType": "danger",
    "title": "UIED-Tools 正式版发布",
    "features": [
      {
        "title": "🎉 正式版发布说明",
        "points": [
          "经过多轮测试和优化，UIED-Tools 正式发布 1.0.0 版本",
          "全新的设计工具模块上线，提供专业的设计辅助功能"
        ]
      },
      {
        "title": "设计报价单生成器",
        "points": [
          "支持多种设计类型报价(UI设计、平面设计、品牌设计等)",
          "支持自定义项目明细和价格",
          "支持导出PDF和图片格式",
          "内置多个专业报价模板",
          "支持添加公司信息和水印"
        ]
      },
      {
        "title": "配色方案生成器",
        "points": [
          "支持多种配色方案生成(单色、互补色、三色、类比色等)",
          "支持自定义主色调和配色规则",
          "内置多个经典配色模板",
          "支持一键复制颜色代码"
        ]
      }
    ]
  },
  {
    "id": "version-beta-1-2-2",
    "version": "Beta 1.2.2",
    "date": "2025-01-16 17:15",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "界面布局优化",
    "features": [
      {
        "title": "页面间距优化",
        "points": [
          "优化主内容区域与顶部导航栏的间距",
          "调整工具页面整体布局的视觉层次",
          "改进页面内容的呈现效果"
        ]
      },
      {
        "title": "搜索功能优化",
        "points": [
          "修复工具搜索结果的跳转问题",
          "优化搜索结果的展示效果",
          "改进搜索交互体验"
        ]
      }
    ]
  },
  {
    "id": "version-beta-1-2-1",
    "version": "Beta 1.2.1",
    "date": "2025-01-16 13:40",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "新增办公工具分类",
    "features": [
      {
        "title": "新增办公工具分类</div> <div class=\"feature-desc\">新增办公工具一级分类，整合现有PDF相关工具</div> </li> <li> <div class=\"feature-title\">PDF工具集成",
        "points": [
          "图片转PDF工具 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/img-to-pdf\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>",
          "PDF转图片工具 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/pdf-to-images\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>",
          "PDF合并工具 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/pdf-merge\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>",
          "PDF分割工具 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/pdf-split\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>",
          "PDF页面旋转工具 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/pdf-rotate\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>",
          "PDF页面删除工具 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/pdf-delete\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>",
          "PDF压缩工具 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/pdf-compress\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link>"
        ]
      }
    ]
  },
  {
    "id": "version-beta-1-2-0",
    "version": "Beta 1.2.0",
    "date": "2025-01-16 03:25",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "工具页面全面设计优化",
    "features": [
      {
        "title": "统一设计风格",
        "points": [
          "优化所有工具页面的整体布局和视觉层次",
          "统一标题区域样式，采用新的标题展示效果",
          "改进功能区域的布局和间距",
          "优化按钮和输入框的样式与交互效果"
        ]
      },
      {
        "title": "功能展示优化",
        "points": [
          "采用卡片式设计展示功能特点",
          "优化功能说明和使用场景的展示方式",
          "改进FAQ展示效果，提升可读性",
          "增加图标和背景效果，提升视觉体验"
        ]
      },
      {
        "title": "交互体验提升",
        "points": [
          "增加按钮和卡片的悬停效果",
          "优化输入框和操作区域的反馈效果",
          "改进移动端适配效果",
          "提升整体页面的流畅度和响应性"
        ]
      }
    ]
  },
  {
    "id": "version-beta-1-1-9",
    "version": "Beta 1.1.9",
    "date": "2025-01-15 16:17",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "KFC 文案生成器上线",
    "features": [
      {
        "title": "新增 KFC 文案生成器</div> <div class=\"feature-desc\"> 支持生成肯德基疯狂星期四文案，让你的朋友圈充满诱惑 <router-link target=\"_blank\" rel=\"noopener noreferrer\" to=\"/tools/copywriting/kfc\" class=\"text-blue-500 hover:text-blue-600 ml-1\">立即体验 →</router-link> </div> </li> <li> <div class=\"feature-title\">主要功能",
        "points": [
          "自动获取最新 KFC 文案",
          "支持中英文翻译功能",
          "优雅的打字机展示效果",
          "一键复制中英文内容"
        ]
      }
    ]
  },
  {
    "id": "version-beta-1-1-8",
    "version": "Beta 1.1.8",
    "date": "2025-01-15 01:09",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "工具页面布局优化",
    "features": [
      {
        "title": "右侧边栏优化",
        "points": [
          "优化右侧边栏的展示效果，调整工具推荐的布局和样式",
          "改进相关工具和随机推荐的展示方式，增加推荐数量至12个",
          "优化工具卡片的悬停效果和交互体验",
          "调整边栏的固定定位和滚动行为"
        ]
      },
      {
        "title": "页面布局调整",
        "points": [
          "优化工具页面的整体布局，采用新的布局组件结构",
          "调整内容区域和边栏的间距，优化页面的视觉层次",
          "统一工具页面的标题和描述样式",
          "改进页面的留白和对齐方式"
        ]
      },
      {
        "title": "响应式优化",
        "points": [
          "完善工具页面在不同设备下的显示效果",
          "优化边栏的显示与隐藏逻辑，仅在工具页面显示",
          "调整移动端下的布局和间距",
          "优化页面在不同尺寸下的适配效果"
        ]
      },
      {
        "title": "代码结构优化",
        "points": [
          "重构工具页面的路由配置，统一使用布局组件",
          "优化组件的导入方式和依赖管理",
          "规范化组件的注释和文档",
          "清理冗余代码，提升代码质量"
        ]
      }
    ]
  },
  {
    "id": "version-beta-1-1-7",
    "version": "Beta 1.1.7",
    "date": "2025-01-14 17:59",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "图片水印工具上线",
    "features": []
  },
  {
    "id": "version-beta-1-1-6",
    "version": "Beta 1.1.6",
    "date": "2025-01-14 16:27",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "更新日志组件优化",
    "features": []
  },
  {
    "id": "version-beta-1-1-5",
    "version": "Beta 1.1.5",
    "date": "2025-01-14 14:09",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "工具功能与界面优化",
    "features": []
  },
  {
    "id": "version-beta-1-1-4",
    "version": "Beta 1.1.4",
    "date": "2025-01-14 10:57",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "导航菜单与工具展示优化",
    "features": []
  },
  {
    "id": "version-beta-1-1-3",
    "version": "Beta 1.1.3",
    "date": "2025-01-13 22:10",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "PDF压缩工具上线",
    "features": []
  },
  {
    "id": "version-beta-1-1-2",
    "version": "Beta 1.1.2",
    "date": "2025-01-13 18:22",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "图片格式转换工具优化",
    "features": []
  },
  {
    "id": "version-beta-1-1-1",
    "version": "Beta 1.1.1",
    "date": "2025-01-12 22:18",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "PDF工具全面优化升级",
    "features": []
  },
  {
    "id": "version-beta-1-1-0",
    "version": "Beta 1.1.0",
    "date": "2025-01-12 19:42",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "工具功能优化",
    "features": []
  },
  {
    "id": "version-beta-1-0-9",
    "version": "Beta 1.0.9",
    "date": "2025-01-12 15:29",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "功能优化",
    "features": []
  },
  {
    "id": "version-beta-1-0-8",
    "version": "Beta 1.0.8",
    "date": "2025-01-12 13:00",
    "badgeText": "维护更新",
    "badgeType": "warning",
    "title": "功能优化",
    "features": []
  },
  {
    "id": "version-beta-1-0-7",
    "version": "Beta 1.0.7",
    "date": "2025-01-12 02:07",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "摸头GIF生成工具上线",
    "features": []
  },
  {
    "id": "version-beta-1-0-6",
    "version": "Beta 1.0.6",
    "date": "2025-01-12 01:01",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "动漫头像转换工具和随机头像工具上线",
    "features": []
  },
  {
    "id": "version-beta-1-0-5",
    "version": "Beta 1.0.5",
    "date": "2025-01-11 23:01",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "随机工具推荐功能优化，热门工具展示优化",
    "features": []
  },
  {
    "id": "version-beta-1-0-4",
    "version": "Beta 1.0.4",
    "date": "2025-01-10 22:33",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "页面底部优化",
    "features": []
  },
  {
    "id": "version-beta-1-0-3",
    "version": "Beta 1.0.3",
    "date": "2025-01-10 21:14",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "界面优化更新",
    "features": []
  },
  {
    "id": "version-beta-1-0-2",
    "version": "Beta 1.0.2",
    "date": "2025-01-10",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "随机工具推荐功能优化",
    "features": []
  },
  {
    "id": "version-beta-1-0-1",
    "version": "Beta 1.0.1",
    "date": "2025-01-09",
    "badgeText": "测试版",
    "badgeType": "warning",
    "title": "功能扩展更新",
    "features": []
  },
  {
    "id": "version-beta-1-0-0",
    "version": "Beta 1.0.0",
    "date": "2025-01-08",
    "badgeText": "测试版",
    "badgeType": "warning",
    "title": "首次发布",
    "features": []
  },
  {
    "id": "version-1-1-8",
    "version": "1.1.8",
    "date": "2025-02-15 14:29",
    "badgeText": "优化",
    "badgeType": "success",
    "title": "移动端 UI 适配优化",
    "features": [
      {
        "title": "移动端用户体验优化",
        "points": [
          "优化移动端字体大小，采用 rem 单位实现响应式文字",
          "改进移动端间距和布局，提升紧凑型布局体验",
          "优化移动端按钮和输入框尺寸，提高操作友好度",
          "完善移动端代码块展示，优化滚动和复制功能",
          "改进移动端功能区域布局，优化特性和问答展示"
        ]
      }
    ]
  },
  {
    "id": "version-1-1-4",
    "version": "1.1.4",
    "date": "2025-02-16 13:50",
    "badgeText": "新增",
    "badgeType": "primary",
    "title": "AI设计封面生成工具上线",
    "features": [
      {
        "title": "新增AI设计封面生成工具",
        "points": [
          "支持多种封面风格和布局选择",
          "支持自定义字体、颜色和装饰元素",
          "内置多种渐变背景和装饰效果",
          "支持实时预览和一键下载",
          "优雅的响应式布局设计"
        ]
      },
      {
        "title": "功能特点",
        "points": [
          "支持多种预设尺寸（小红书、微信公众号等）",
          "丰富的字体预设和装饰元素",
          "高清图片导出功能",
          "专业的设计参数调节"
        ]
      }
    ]
  }
]

export default defaultChangelogTimeline
