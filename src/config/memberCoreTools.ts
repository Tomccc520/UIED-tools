/**
 * @file memberCoreTools.ts
 * @description 20 个会员核心工具体验配置，统一维护首屏卖点、输入输出说明和失败兜底提示
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
 */

export interface MemberCoreToolExperience {
  route: string
  toolKey: string
  consumePoints: number
  title: string
  valuePoint: string
  inputHint: string
  sampleInput: string
  outputHint: string
  deliverableExample: string
  failureHint: string
  qualityHint: string
}

export const MEMBER_CORE_TOOL_EXPERIENCES: MemberCoreToolExperience[] = [
  {
    route: '/tools/photo/background',
    toolKey: 'photo-background',
    consumePoints: 3,
    title: '证件照换底色',
    valuePoint: '一键替换证件照背景色，适合报名、考试、简历和工牌场景。',
    inputHint: '上传清晰正面人像，优先选择无遮挡、光线均匀的照片。',
    sampleInput: '单人正面半身照，白墙或浅色背景，文件小于 10MB。',
    outputHint: '输出标准背景色证件照，可继续下载或进入尺寸裁剪。',
    deliverableExample: '蓝底/白底/红底证件照成品，保留自然人像边缘。',
    failureHint: '识别失败时请换用更清晰照片，避免多人合照、强阴影或低分辨率图片。',
    qualityHint: '建议生成后检查头发边缘、肩部轮廓和背景纯度，确认无误再下载。'
  },
  {
    route: '/tools/photo/transparent',
    toolKey: 'photo-transparent',
    consumePoints: 3,
    title: '证件照免冠处理',
    valuePoint: '快速处理证件照免冠透明底，减少反复修图和抠图成本。',
    inputHint: '上传单人半身或头像照片，人物边缘越清晰效果越稳定。',
    sampleInput: '一张单人头像或半身照片，头发和肩部轮廓清晰。',
    outputHint: '输出透明底人像，可继续合成证件照背景或保存素材。',
    deliverableExample: '透明底 PNG 人像，可直接进入换底色或排版流程。',
    failureHint: '若头发边缘或肩部识别不完整，请换用纯色背景照片后重试。',
    qualityHint: '下载前重点检查透明边缘是否干净，必要时先换底色再导出。'
  },
  {
    route: '/tools/photo/crop',
    toolKey: 'photo-crop',
    consumePoints: 2,
    title: '证件照尺寸裁剪',
    valuePoint: '按常见证件照规格快速裁剪，减少手动调尺寸误差。',
    inputHint: '先上传已处理好的人像照片，再选择目标证件照规格。',
    sampleInput: '已换底色的人像照片，目标规格选择一寸、二寸或考试报名照。',
    outputHint: '输出符合尺寸比例的证件照，适合报名系统或资料提交。',
    deliverableExample: '固定像素和比例的证件照，可按报名要求直接上传。',
    failureHint: '裁剪后主体偏移时，请重新调整取景区域或先完成换底处理。',
    qualityHint: '提交前核对尺寸、脸部位置和肩部留白，避免报名系统二次驳回。'
  },
  {
    route: '/tools/photo/layout',
    toolKey: 'photo-layout',
    consumePoints: 2,
    title: '证件照排版打印',
    valuePoint: '把多张证件照自动排到打印纸上，适合线下冲印和批量交付。',
    inputHint: '上传已完成尺寸裁剪的证件照，选择纸张和排版规格。',
    sampleInput: '一张已裁剪证件照，纸张选择 5 寸或 6 寸排版。',
    outputHint: '输出排版后的打印图，便于直接保存或打印。',
    deliverableExample: '单页多张证件照打印图，保留裁切间距。',
    failureHint: '若排版留白异常，请确认照片尺寸比例正确后重新生成。',
    qualityHint: '打印前建议预览纸张方向、单张间距和裁切线，避免浪费相纸。'
  },
  {
    route: '/tools/ai/deepseek-r1',
    toolKey: 'ai-deepseek-r1',
    consumePoints: 2,
    title: 'DeepSeek R1 对话',
    valuePoint: '面向推理、分析和复杂问题拆解，适合深度思考类任务。',
    inputHint: '输入明确问题、背景信息和期望输出格式，复杂任务建议分步骤描述。',
    sampleInput: '请分析这个产品商业化方案的风险，并按优先级给出整改建议。',
    outputHint: '输出结构化回答，可继续追问、复制或用于文档整理。',
    deliverableExample: '包含判断依据、风险分级、行动清单的推理型回答。',
    failureHint: '回答中断时请缩短问题或重新发送，必要时切换为更具体的任务描述。',
    qualityHint: '复杂结论建议继续追问依据、边界和下一步动作，避免直接照搬。'
  },
  {
    route: '/tools/ai/deepseek',
    toolKey: 'ai-deepseek',
    consumePoints: 2,
    title: 'DeepSeek AI 对话',
    valuePoint: '适合日常问答、写作辅助、资料整理和轻量代码解释。',
    inputHint: '输入问题和上下文，补充语气、长度或格式要求可提升结果可用性。',
    sampleInput: '帮我把这段运营文案改得更简洁，语气专业但不要生硬。',
    outputHint: '输出可复制的对话结果，适合继续润色或拆分为执行步骤。',
    deliverableExample: '可复制的改写文案、解释说明或分步骤建议。',
    failureHint: '若模型响应慢，请稍后重试或减少一次性输入长度。',
    qualityHint: '正式使用前建议核对事实、日期、数字和链接，必要时补充上下文重问。'
  },
  {
    route: '/tools/ai/ocr',
    toolKey: 'ai-ocr',
    consumePoints: 3,
    title: 'AI OCR 识别',
    valuePoint: '把截图、票据、文档图片快速识别成可复制文本。',
    inputHint: '上传文字清晰、方向正确的图片，复杂表格建议先裁掉无关区域。',
    sampleInput: '一张合同截图、发票照片或网页长截图，文字方向保持正向。',
    outputHint: '输出识别文本，便于复制、整理或继续交给 AI 总结。',
    deliverableExample: '分段文本、数字和表格内容，支持复制到文档。',
    failureHint: '识别不准时请提高图片清晰度，避免倾斜、反光和过小字号。',
    qualityHint: '复制前建议检查专有名词、金额、日期和表格换行，避免误录。'
  },
  {
    route: '/tools/ai/image-enhance',
    toolKey: 'ai-image-enhance',
    consumePoints: 3,
    title: 'AI 图片变清晰',
    valuePoint: '提升模糊图片清晰度，适合头像、商品图和低清素材修复。',
    inputHint: '上传主体明确的图片，避免过度压缩或严重马赛克素材。',
    sampleInput: '一张低清头像、商品图或旧素材图，主体不要被严重遮挡。',
    outputHint: '输出增强后的高清图片，可对比原图后下载。',
    deliverableExample: '清晰度提升后的图片文件，可用于展示或二次编辑。',
    failureHint: '增强失败时请换用较小尺寸或更清晰原图，避免超大文件。',
    qualityHint: '下载前建议放大查看脸部、文字和边缘区域，确认没有过锐化或伪影。'
  },
  {
    route: '/tools/ai/remove-watermark',
    toolKey: 'ai-remove-watermark',
    consumePoints: 3,
    title: 'AI 智能去水印',
    valuePoint: '辅助清理图片中影响展示的水印、污点或局部瑕疵。',
    inputHint: '上传需要处理的图片，并优先选择水印区域明确的素材。',
    sampleInput: '一张带角标、水印或局部污点的授权图片素材。',
    outputHint: '输出修复后的图片，适合继续裁剪、压缩或作为展示素材。',
    deliverableExample: '局部修复后的图片，水印区域尽量与周围纹理融合。',
    failureHint: '水印覆盖主体时可能影响结果，建议先裁剪区域或降低处理范围。',
    qualityHint: '用于商业展示前请确认素材授权，并检查修复区域是否有明显涂抹痕迹。'
  },
  {
    route: '/tools/ai/work-summary',
    toolKey: 'ai-work-summary',
    consumePoints: 2,
    title: '工作总结',
    valuePoint: '快速生成结构完整的阶段工作总结，覆盖成果、问题和计划。',
    inputHint: '填写岗位、周期、关键成果和遇到的问题，内容越具体越可交付。',
    sampleInput: '岗位：产品运营；周期：本周；成果：上线会员工具面板、优化用户反馈。',
    outputHint: '输出可复制的总结正文，可继续调整语气和篇幅。',
    deliverableExample: '包含工作成果、问题复盘、下周计划的正式总结正文。',
    failureHint: '结果空泛时请补充数据、项目名称和具体工作事项后重新生成。',
    qualityHint: '提交前建议补充量化成果、项目名称和负责人视角，让总结更可信。'
  },
  {
    route: '/tools/ai/work-summary?type=annual',
    toolKey: 'ai-work-summary-annual',
    consumePoints: 2,
    title: '年度工作总结',
    valuePoint: '把全年工作沉淀为正式总结，适合述职、绩效和年终汇报。',
    inputHint: '补充年度目标、核心项目、量化成果、问题复盘和下一年规划。',
    sampleInput: '年度目标、四个季度核心项目、增长数据、问题复盘和下一年计划。',
    outputHint: '输出年度总结框架与正文，可继续扩写为汇报稿。',
    deliverableExample: '适合述职使用的年度总结结构、重点成果和规划段落。',
    failureHint: '如篇幅不足，请按季度补充素材，避免只输入一句话需求。',
    qualityHint: '用于述职前建议按季度核对事实，并补充关键指标和下一年计划。'
  },
  {
    route: '/tools/ai/office/custom-summary',
    toolKey: 'ai-office-custom-summary',
    consumePoints: 2,
    title: '自定义总结',
    valuePoint: '按自定义主题生成总结，适合会议、项目、学习和运营复盘。',
    inputHint: '填写总结主题、素材要点、对象和输出风格。',
    sampleInput: '主题：项目复盘；素材：上线延期、用户反馈、优化动作；风格：客观。',
    outputHint: '输出贴合场景的总结内容，可继续复制到办公文档。',
    deliverableExample: '按主题生成的复盘、会议或学习总结，结构清晰可复制。',
    failureHint: '结果偏题时请明确总结对象和不要包含的内容。',
    qualityHint: '发送前建议核对受众、语气和敏感信息，必要时删除内部数据。'
  },
  {
    route: '/tools/ai/office/resume-creation',
    toolKey: 'ai-office-resume-creation',
    consumePoints: 2,
    title: '简历制作',
    valuePoint: '把经历整理成更专业的简历表达，突出岗位匹配和成果价值。',
    inputHint: '填写目标岗位、工作经历、项目成果、技能和教育背景。',
    sampleInput: '目标岗位：UI 设计师；经历：3 年 B 端设计；项目：后台改版。',
    outputHint: '输出简历模块内容，可继续复制到简历模板或精修措辞。',
    deliverableExample: '岗位匹配的个人优势、项目经历和成果表达。',
    failureHint: '如果表达不够具体，请补充数据指标、职责范围和项目结果。',
    qualityHint: '投递前建议把夸张表述改成真实经历，并补充可验证成果。'
  },
  {
    route: '/tools/ai/office/meeting-minutes',
    toolKey: 'ai-office-meeting-minutes',
    consumePoints: 2,
    title: '润色会议纪要',
    valuePoint: '把零散会议记录整理为议题、结论、待办和责任人。',
    inputHint: '粘贴会议原始记录，补充会议主题、参会角色和重点关注事项。',
    sampleInput: '会议主题：工具商业化；记录：确认 20 个核心工具、下周补可视冒烟。',
    outputHint: '输出结构化会议纪要，适合直接发群或沉淀到项目文档。',
    deliverableExample: '含会议议题、关键结论、待办事项、负责人和截止时间。',
    failureHint: '待办不清晰时请补充责任人、截止时间和会议结论。',
    qualityHint: '发送前建议人工确认决议、责任人和截止时间，避免误派任务。'
  },
  {
    route: '/tools/ai/analysis/research-report',
    toolKey: 'ai-analysis-research-report',
    consumePoints: 2,
    title: '研究报告',
    valuePoint: '快速生成研究报告骨架和正文，适合行业、产品和课题分析。',
    inputHint: '输入研究主题、目标对象、资料要点和需要覆盖的章节。',
    sampleInput: '主题：AI 工具网站商业化；对象：个人创作者；章节：市场、竞品、策略。',
    outputHint: '输出报告结构、分析内容和结论建议，可继续人工补充数据。',
    deliverableExample: '研究报告大纲、核心分析段落、风险和建议清单。',
    failureHint: '事实性内容需要人工核验；结果泛化时请补充真实数据来源。',
    qualityHint: '对外发布前必须核验引用、数据口径和时间范围，避免事实错误。'
  },
  {
    route: '/tools/ai/analysis/business-plan',
    toolKey: 'ai-analysis-business-plan',
    consumePoints: 2,
    title: '商业计划书写作',
    valuePoint: '辅助整理商业模式、市场机会、产品策略和落地计划。',
    inputHint: '填写项目背景、目标用户、收入模式、竞品和资源条件。',
    sampleInput: '项目：AI 工具会员站；用户：设计师和运营；收入：会员订阅和企业授权。',
    outputHint: '输出商业计划书章节内容，适合继续扩写或做路演材料。',
    deliverableExample: '包含商业模式、用户画像、产品策略和阶段计划的初稿。',
    failureHint: '财务和市场数据需自行核验；信息不足时先补业务假设再生成。',
    qualityHint: '路演前建议补真实市场数据、财务模型和团队信息，AI 文案只作初稿。'
  },
  {
    route: '/tools/ai/article-generator',
    toolKey: 'ai-article-generator',
    consumePoints: 2,
    title: 'AI 文章生成',
    valuePoint: '按主题快速生成文章正文，适合运营内容、公众号和知识分享。',
    inputHint: '填写主题、受众、关键词、字数和语气风格。',
    sampleInput: '主题：AI 工具如何提升运营效率；受众：新媒体运营；字数：1200。',
    outputHint: '输出文章标题、结构和正文，可继续润色、复制或二次编辑。',
    deliverableExample: '文章标题、分段小标题、正文内容和结尾行动建议。',
    failureHint: '结果重复或空泛时，请补充观点、案例和需要规避的表述。',
    qualityHint: '发布前建议加入原创案例和品牌口径，并检查标题与正文是否一致。'
  },
  {
    route: '/tools/ai/xiaohongshu-note',
    toolKey: 'ai-xiaohongshu-note',
    consumePoints: 2,
    title: '小红书笔记生成',
    valuePoint: '快速生成更适合种草传播的小红书标题、正文和标签。',
    inputHint: '填写产品/主题、目标人群、卖点、语气和注意事项。',
    sampleInput: '主题：AI 证件照工具；人群：求职学生；卖点：换底、裁剪、排版。',
    outputHint: '输出笔记正文和标签建议，适合继续人工调整真实体验细节。',
    deliverableExample: '小红书标题、正文段落、互动话术和标签建议。',
    failureHint: '营销味过重时请补充真实使用感受和不夸大的表达要求。',
    qualityHint: '发布前建议加入真实图片、体验细节和合规表达，避免夸大宣传。'
  },
  {
    route: '/tools/video/compress',
    toolKey: 'video-compress',
    consumePoints: 2,
    title: '视频压缩',
    valuePoint: '在尽量保留画质的前提下降低视频体积，适合上传和分享。',
    inputHint: '上传本地视频，选择压缩强度、输出格式和目标清晰度。',
    sampleInput: '一个 200MB 以内的 MP4 视频，目标压缩到适合微信或网页上传。',
    outputHint: '输出压缩后视频和体积对比，可确认效果后下载。',
    deliverableExample: '体积明显减小的视频文件，并展示压缩前后大小对比。',
    failureHint: '处理失败时请减小视频体积或更换格式，避免浏览器内存不足。',
    qualityHint: '下载前建议播放检查首尾、音画同步和关键画面清晰度。'
  },
  {
    route: '/tools/video/convert',
    toolKey: 'video-format-convert',
    consumePoints: 2,
    title: '视频格式转换',
    valuePoint: '把视频转换为常用格式，适配不同平台上传和播放要求。',
    inputHint: '上传视频后选择目标格式，必要时调整分辨率和编码参数。',
    sampleInput: '一个 MOV 或 WEBM 视频，目标转换为 MP4 用于平台上传。',
    outputHint: '输出转换后视频文件，可下载并用于目标平台。',
    deliverableExample: '目标格式视频文件，保留主要画面和音频内容。',
    failureHint: '转换失败时请尝试较小文件或常见源格式，如 MP4、MOV、WEBM。',
    qualityHint: '上传平台前建议检查格式、时长、音频和封面帧是否符合要求。'
  }
]

/**
 * 函数说明：标准化工具路由匹配键，保留 query 以区分同一路径下的会员核心工具。
 */
export const normalizeMemberCoreRouteKey = (value: unknown): string => {
  const rawValue = String(value || '').trim().split('#')[0]
  if (!rawValue) {
    return ''
  }
  const [rawPath, rawQuery = ''] = rawValue.split('?')
  const normalizedPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/g, '')
  return rawQuery.trim() ? `${normalizedPath}?${rawQuery.trim()}` : normalizedPath
}

/**
 * 函数说明：根据当前路由匹配会员核心工具体验配置，优先精确匹配 query，再回退到主路径。
 */
export const resolveMemberCoreToolExperience = (routePath: unknown): MemberCoreToolExperience | null => {
  const routeKey = normalizeMemberCoreRouteKey(routePath)
  if (!routeKey) {
    return null
  }
  const exactMatched = MEMBER_CORE_TOOL_EXPERIENCES.find((item) => normalizeMemberCoreRouteKey(item.route) === routeKey)
  if (exactMatched) {
    return exactMatched
  }
  const pathOnly = routeKey.split('?')[0]
  return MEMBER_CORE_TOOL_EXPERIENCES.find((item) => normalizeMemberCoreRouteKey(item.route).split('?')[0] === pathOnly) || null
}
