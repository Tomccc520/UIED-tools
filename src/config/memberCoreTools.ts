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
  outputHint: string
  failureHint: string
}

export const MEMBER_CORE_TOOL_EXPERIENCES: MemberCoreToolExperience[] = [
  {
    route: '/tools/photo/background',
    toolKey: 'photo-background',
    consumePoints: 3,
    title: '证件照换底色',
    valuePoint: '一键替换证件照背景色，适合报名、考试、简历和工牌场景。',
    inputHint: '上传清晰正面人像，优先选择无遮挡、光线均匀的照片。',
    outputHint: '输出标准背景色证件照，可继续下载或进入尺寸裁剪。',
    failureHint: '识别失败时请换用更清晰照片，避免多人合照、强阴影或低分辨率图片。'
  },
  {
    route: '/tools/photo/transparent',
    toolKey: 'photo-transparent',
    consumePoints: 3,
    title: '证件照免冠处理',
    valuePoint: '快速处理证件照免冠透明底，减少反复修图和抠图成本。',
    inputHint: '上传单人半身或头像照片，人物边缘越清晰效果越稳定。',
    outputHint: '输出透明底人像，可继续合成证件照背景或保存素材。',
    failureHint: '若头发边缘或肩部识别不完整，请换用纯色背景照片后重试。'
  },
  {
    route: '/tools/photo/crop',
    toolKey: 'photo-crop',
    consumePoints: 2,
    title: '证件照尺寸裁剪',
    valuePoint: '按常见证件照规格快速裁剪，减少手动调尺寸误差。',
    inputHint: '先上传已处理好的人像照片，再选择目标证件照规格。',
    outputHint: '输出符合尺寸比例的证件照，适合报名系统或资料提交。',
    failureHint: '裁剪后主体偏移时，请重新调整取景区域或先完成换底处理。'
  },
  {
    route: '/tools/photo/layout',
    toolKey: 'photo-layout',
    consumePoints: 2,
    title: '证件照排版打印',
    valuePoint: '把多张证件照自动排到打印纸上，适合线下冲印和批量交付。',
    inputHint: '上传已完成尺寸裁剪的证件照，选择纸张和排版规格。',
    outputHint: '输出排版后的打印图，便于直接保存或打印。',
    failureHint: '若排版留白异常，请确认照片尺寸比例正确后重新生成。'
  },
  {
    route: '/tools/ai/deepseek-r1',
    toolKey: 'ai-deepseek-r1',
    consumePoints: 2,
    title: 'DeepSeek R1 对话',
    valuePoint: '面向推理、分析和复杂问题拆解，适合深度思考类任务。',
    inputHint: '输入明确问题、背景信息和期望输出格式，复杂任务建议分步骤描述。',
    outputHint: '输出结构化回答，可继续追问、复制或用于文档整理。',
    failureHint: '回答中断时请缩短问题或重新发送，必要时切换为更具体的任务描述。'
  },
  {
    route: '/tools/ai/deepseek',
    toolKey: 'ai-deepseek',
    consumePoints: 2,
    title: 'DeepSeek AI 对话',
    valuePoint: '适合日常问答、写作辅助、资料整理和轻量代码解释。',
    inputHint: '输入问题和上下文，补充语气、长度或格式要求可提升结果可用性。',
    outputHint: '输出可复制的对话结果，适合继续润色或拆分为执行步骤。',
    failureHint: '若模型响应慢，请稍后重试或减少一次性输入长度。'
  },
  {
    route: '/tools/ai/ocr',
    toolKey: 'ai-ocr',
    consumePoints: 3,
    title: 'AI OCR 识别',
    valuePoint: '把截图、票据、文档图片快速识别成可复制文本。',
    inputHint: '上传文字清晰、方向正确的图片，复杂表格建议先裁掉无关区域。',
    outputHint: '输出识别文本，便于复制、整理或继续交给 AI 总结。',
    failureHint: '识别不准时请提高图片清晰度，避免倾斜、反光和过小字号。'
  },
  {
    route: '/tools/ai/image-enhance',
    toolKey: 'ai-image-enhance',
    consumePoints: 3,
    title: 'AI 图片变清晰',
    valuePoint: '提升模糊图片清晰度，适合头像、商品图和低清素材修复。',
    inputHint: '上传主体明确的图片，避免过度压缩或严重马赛克素材。',
    outputHint: '输出增强后的高清图片，可对比原图后下载。',
    failureHint: '增强失败时请换用较小尺寸或更清晰原图，避免超大文件。'
  },
  {
    route: '/tools/ai/remove-watermark',
    toolKey: 'ai-remove-watermark',
    consumePoints: 3,
    title: 'AI 智能去水印',
    valuePoint: '辅助清理图片中影响展示的水印、污点或局部瑕疵。',
    inputHint: '上传需要处理的图片，并优先选择水印区域明确的素材。',
    outputHint: '输出修复后的图片，适合继续裁剪、压缩或作为展示素材。',
    failureHint: '水印覆盖主体时可能影响结果，建议先裁剪区域或降低处理范围。'
  },
  {
    route: '/tools/ai/work-summary',
    toolKey: 'ai-work-summary',
    consumePoints: 2,
    title: '工作总结',
    valuePoint: '快速生成结构完整的阶段工作总结，覆盖成果、问题和计划。',
    inputHint: '填写岗位、周期、关键成果和遇到的问题，内容越具体越可交付。',
    outputHint: '输出可复制的总结正文，可继续调整语气和篇幅。',
    failureHint: '结果空泛时请补充数据、项目名称和具体工作事项后重新生成。'
  },
  {
    route: '/tools/ai/work-summary?type=annual',
    toolKey: 'ai-work-summary-annual',
    consumePoints: 2,
    title: '年度工作总结',
    valuePoint: '把全年工作沉淀为正式总结，适合述职、绩效和年终汇报。',
    inputHint: '补充年度目标、核心项目、量化成果、问题复盘和下一年规划。',
    outputHint: '输出年度总结框架与正文，可继续扩写为汇报稿。',
    failureHint: '如篇幅不足，请按季度补充素材，避免只输入一句话需求。'
  },
  {
    route: '/tools/ai/office/custom-summary',
    toolKey: 'ai-office-custom-summary',
    consumePoints: 2,
    title: '自定义总结',
    valuePoint: '按自定义主题生成总结，适合会议、项目、学习和运营复盘。',
    inputHint: '填写总结主题、素材要点、对象和输出风格。',
    outputHint: '输出贴合场景的总结内容，可继续复制到办公文档。',
    failureHint: '结果偏题时请明确总结对象和不要包含的内容。'
  },
  {
    route: '/tools/ai/office/resume-creation',
    toolKey: 'ai-office-resume-creation',
    consumePoints: 2,
    title: '简历制作',
    valuePoint: '把经历整理成更专业的简历表达，突出岗位匹配和成果价值。',
    inputHint: '填写目标岗位、工作经历、项目成果、技能和教育背景。',
    outputHint: '输出简历模块内容，可继续复制到简历模板或精修措辞。',
    failureHint: '如果表达不够具体，请补充数据指标、职责范围和项目结果。'
  },
  {
    route: '/tools/ai/office/meeting-minutes',
    toolKey: 'ai-office-meeting-minutes',
    consumePoints: 2,
    title: '润色会议纪要',
    valuePoint: '把零散会议记录整理为议题、结论、待办和责任人。',
    inputHint: '粘贴会议原始记录，补充会议主题、参会角色和重点关注事项。',
    outputHint: '输出结构化会议纪要，适合直接发群或沉淀到项目文档。',
    failureHint: '待办不清晰时请补充责任人、截止时间和会议结论。'
  },
  {
    route: '/tools/ai/analysis/research-report',
    toolKey: 'ai-analysis-research-report',
    consumePoints: 2,
    title: '研究报告',
    valuePoint: '快速生成研究报告骨架和正文，适合行业、产品和课题分析。',
    inputHint: '输入研究主题、目标对象、资料要点和需要覆盖的章节。',
    outputHint: '输出报告结构、分析内容和结论建议，可继续人工补充数据。',
    failureHint: '事实性内容需要人工核验；结果泛化时请补充真实数据来源。'
  },
  {
    route: '/tools/ai/analysis/business-plan',
    toolKey: 'ai-analysis-business-plan',
    consumePoints: 2,
    title: '商业计划书写作',
    valuePoint: '辅助整理商业模式、市场机会、产品策略和落地计划。',
    inputHint: '填写项目背景、目标用户、收入模式、竞品和资源条件。',
    outputHint: '输出商业计划书章节内容，适合继续扩写或做路演材料。',
    failureHint: '财务和市场数据需自行核验；信息不足时先补业务假设再生成。'
  },
  {
    route: '/tools/ai/article-generator',
    toolKey: 'ai-article-generator',
    consumePoints: 2,
    title: 'AI 文章生成',
    valuePoint: '按主题快速生成文章正文，适合运营内容、公众号和知识分享。',
    inputHint: '填写主题、受众、关键词、字数和语气风格。',
    outputHint: '输出文章标题、结构和正文，可继续润色、复制或二次编辑。',
    failureHint: '结果重复或空泛时，请补充观点、案例和需要规避的表述。'
  },
  {
    route: '/tools/ai/xiaohongshu-note',
    toolKey: 'ai-xiaohongshu-note',
    consumePoints: 2,
    title: '小红书笔记生成',
    valuePoint: '快速生成更适合种草传播的小红书标题、正文和标签。',
    inputHint: '填写产品/主题、目标人群、卖点、语气和注意事项。',
    outputHint: '输出笔记正文和标签建议，适合继续人工调整真实体验细节。',
    failureHint: '营销味过重时请补充真实使用感受和不夸大的表达要求。'
  },
  {
    route: '/tools/video/compress',
    toolKey: 'video-compress',
    consumePoints: 2,
    title: '视频压缩',
    valuePoint: '在尽量保留画质的前提下降低视频体积，适合上传和分享。',
    inputHint: '上传本地视频，选择压缩强度、输出格式和目标清晰度。',
    outputHint: '输出压缩后视频和体积对比，可确认效果后下载。',
    failureHint: '处理失败时请减小视频体积或更换格式，避免浏览器内存不足。'
  },
  {
    route: '/tools/video/convert',
    toolKey: 'video-format-convert',
    consumePoints: 2,
    title: '视频格式转换',
    valuePoint: '把视频转换为常用格式，适配不同平台上传和播放要求。',
    inputHint: '上传视频后选择目标格式，必要时调整分辨率和编码参数。',
    outputHint: '输出转换后视频文件，可下载并用于目标平台。',
    failureHint: '转换失败时请尝试较小文件或常见源格式，如 MP4、MOV、WEBM。'
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
