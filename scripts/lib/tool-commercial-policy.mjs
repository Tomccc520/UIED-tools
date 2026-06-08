/**
 * @file tool-commercial-policy.mjs
 * @description 工具商业策略规则：统一生成 toolKey、计费字段和会员核心工具标记
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-29
 */

const TOOL_KEY_PATTERN = /[^a-z0-9]+/g

export const COMMERCIAL_POLICY_VERSION = '2026-04-commercial-v1'

export const COMMERCIAL_TIER = {
  FREE: 'free',
  STANDARD: 'standard',
  PREMIUM: 'premium'
}

export const MEMBER_CORE_TOOL_PRESETS = [
  { matchUrl: '/tools/photo/background', toolKey: 'photo-background', consumePoints: 3, title: '证件照换底色' },
  { matchUrl: '/tools/photo/transparent', toolKey: 'photo-transparent', consumePoints: 3, title: '证件照免冠处理' },
  { matchUrl: '/tools/photo/crop', toolKey: 'photo-crop', consumePoints: 2, title: '证件照尺寸裁剪' },
  { matchUrl: '/tools/photo/layout', toolKey: 'photo-layout', consumePoints: 2, title: '证件照排版打印' },
  { matchUrl: '/tools/ai/deepseek-r1', toolKey: 'ai-deepseek-r1', consumePoints: 2, title: 'DeepSeek R1 对话' },
  { matchUrl: '/tools/ai/deepseek', toolKey: 'ai-deepseek', consumePoints: 2, title: 'DeepSeek AI 对话' },
  { matchUrl: '/tools/ai/ocr', toolKey: 'ai-ocr', consumePoints: 3, title: 'AI OCR 识别' },
  { matchUrl: '/tools/ai/image-enhance', toolKey: 'ai-image-enhance', consumePoints: 3, title: 'AI 图片变清晰' },
  { matchUrl: '/tools/ai/remove-watermark', toolKey: 'ai-remove-watermark', consumePoints: 3, title: 'AI 智能去水印' },
  { matchUrl: '/tools/ai/work-summary', toolKey: 'ai-work-summary', consumePoints: 2, title: '工作总结' },
  { matchUrl: '/tools/ai/work-summary?type=annual', toolKey: 'ai-work-summary-annual', consumePoints: 2, title: '年度工作总结' },
  { matchUrl: '/tools/ai/office/custom-summary', toolKey: 'ai-office-custom-summary', consumePoints: 2, title: '自定义总结' },
  { matchUrl: '/tools/ai/office/resume-creation', toolKey: 'ai-office-resume-creation', consumePoints: 2, title: '简历制作' },
  { matchUrl: '/tools/ai/office/meeting-minutes', toolKey: 'ai-office-meeting-minutes', consumePoints: 2, title: '润色会议纪要' },
  { matchUrl: '/tools/ai/analysis/research-report', toolKey: 'ai-analysis-research-report', consumePoints: 2, title: '研究报告' },
  { matchUrl: '/tools/ai/analysis/business-plan', toolKey: 'ai-analysis-business-plan', consumePoints: 2, title: '商业计划书写作' },
  { matchUrl: '/tools/ai/article-generator', toolKey: 'ai-article-generator', consumePoints: 2, title: 'AI 文章生成' },
  { matchUrl: '/tools/ai/xiaohongshu-note', toolKey: 'ai-xiaohongshu-note', consumePoints: 2, title: '小红书笔记生成' },
  { matchUrl: '/tools/video/compress', toolKey: 'video-compress', consumePoints: 2, title: '视频压缩' },
  { matchUrl: '/tools/video/convert', toolKey: 'video-format-convert', consumePoints: 2, title: '视频格式转换' }
]

const MEMBER_CORE_PRESET_MAP = new Map(
  MEMBER_CORE_TOOL_PRESETS.map((item, index) => [
    normalizeToolRouteMatchKey(item.matchUrl),
    {
      ...item,
      sort: 1000 + index * 10
    }
  ])
)

const STANDARD_ROUTE_PREFIXES = [
  '/tools/ai/',
  '/tools/photo/',
  '/tools/video/',
  '/tools/audio/',
  '/tools/pdf-'
]

const STANDARD_ROUTE_EXACT_SET = new Set([
  '/tools/img-to-pdf',
  '/tools/text-to-pdf',
  '/tools/markdown-to-pdf',
  '/tools/image-compress',
  '/tools/gif-compress',
  '/tools/img-format',
  '/tools/img-watermark',
  '/tools/img-matting'
])

/**
 * 函数说明：规范化工具路由匹配键，保留 query 用于区分同一路由下的细分工具。
 */
export function normalizeToolRouteMatchKey(value) {
  const rawValue = String(value || '').trim().split('#')[0]
  if (!rawValue) {
    return ''
  }
  const [rawPathName, rawQueryString = ''] = rawValue.split('?')
  const normalizedPath = rawPathName === '/' ? '/' : rawPathName.replace(/\/+$/g, '')
  const queryString = rawQueryString.trim()
  if (!queryString) {
    return normalizedPath
  }
  return `${normalizedPath}?${queryString}`
}

/**
 * 函数说明：规范化工具主路径，去除 query/hash 和尾斜杠。
 */
export function normalizeToolRoutePath(value) {
  const rawPath = String(value || '').trim().split('?')[0].split('#')[0]
  if (!rawPath) {
    return ''
  }
  if (rawPath === '/') {
    return '/'
  }
  return rawPath.replace(/\/+$/g, '')
}

/**
 * 函数说明：把任意文本转换为适合作为 toolKey 片段的 kebab-case。
 */
function normalizeToolKeySegment(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(TOOL_KEY_PATTERN, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * 函数说明：根据工具 URL 推导稳定 toolKey，query 参数会进入 key 以避免细分工具冲突。
 */
export function deriveToolKeyByUrl(url) {
  const normalizedMatchKey = normalizeToolRouteMatchKey(url)
  const [routePath, queryString = ''] = normalizedMatchKey.split('?')
  const routeKey = normalizeToolKeySegment(
    routePath
      .replace(/^\/tools\//, '')
      .replace(/^\/+|\/+$/g, '')
      .replace(/[/_]+/g, '-')
  )
  if (!queryString) {
    return routeKey || 'tools-home'
  }
  const queryKey = Array.from(new URLSearchParams(queryString).entries())
    .map(([key, value]) => `${normalizeToolKeySegment(key)}-${normalizeToolKeySegment(value)}`)
    .filter((item) => item !== '-')
    .join('-')
  return [routeKey, queryKey].filter(Boolean).join('-') || 'tools-home'
}

/**
 * 函数说明：判断工具是否属于标准计费工具范围，标准工具登录后扣 1 分，会员免扣。
 */
function isStandardCommercialTool(url) {
  const routePath = normalizeToolRoutePath(url)
  return STANDARD_ROUTE_EXACT_SET.has(routePath) || STANDARD_ROUTE_PREFIXES.some((prefix) => routePath.startsWith(prefix))
}

/**
 * 函数说明：解析单个工具的商业策略，优先命中 20 个会员核心工具预设。
 */
function resolveToolCommercialPolicy(tool, sortIndex) {
  const normalizedUrl = normalizeToolRouteMatchKey(tool?.url)
  const memberCorePreset = MEMBER_CORE_PRESET_MAP.get(normalizedUrl)
  const existingConsumePoints = Number(tool?.consumePoints)
  const hasExistingConsumePoints = Number.isFinite(existingConsumePoints)
  const existingStatus = Number(tool?.status)
  const hasExistingStatus = Number.isFinite(existingStatus)

  if (memberCorePreset) {
    return {
      toolKey: String(tool?.toolKey || memberCorePreset.toolKey).trim().toLowerCase(),
      consumePoints:
        tool?.policyVersion === COMMERCIAL_POLICY_VERSION && hasExistingConsumePoints
          ? Math.max(0, Math.floor(existingConsumePoints))
          : memberCorePreset.consumePoints,
      memberFree: typeof tool?.memberFree === 'boolean' ? tool.memberFree : true,
      status: hasExistingStatus ? (existingStatus === 0 ? 0 : 1) : 1,
      sort: Number.isFinite(Number(tool?.sort)) ? Math.max(0, Math.floor(Number(tool.sort))) : memberCorePreset.sort,
      remark: String(tool?.remark || `会员核心工具：${memberCorePreset.title}`).trim(),
      needLogin: typeof tool?.needLogin === 'boolean' ? tool.needLogin : true,
      allowAnonymousPreview: typeof tool?.allowAnonymousPreview === 'boolean' ? tool.allowAnonymousPreview : true,
      anonymousQuota: Number.isFinite(Number(tool?.anonymousQuota)) ? Math.max(0, Math.floor(Number(tool.anonymousQuota))) : 0,
      commercialTier: COMMERCIAL_TIER.PREMIUM,
      memberCore: true,
      policyVersion: COMMERCIAL_POLICY_VERSION
    }
  }

  const standardCommercialTool = isStandardCommercialTool(tool?.url)
  const commercialTier = standardCommercialTool ? COMMERCIAL_TIER.STANDARD : COMMERCIAL_TIER.FREE
  const defaultConsumePoints = standardCommercialTool ? 1 : 0
  const defaultNeedLogin = standardCommercialTool

  return {
    toolKey: String(tool?.toolKey || deriveToolKeyByUrl(tool?.url)).trim().toLowerCase(),
    consumePoints: hasExistingConsumePoints ? Math.max(0, Math.floor(existingConsumePoints)) : defaultConsumePoints,
    memberFree: typeof tool?.memberFree === 'boolean' ? tool.memberFree : true,
    status: hasExistingStatus ? (existingStatus === 0 ? 0 : 1) : 1,
    sort: Number.isFinite(Number(tool?.sort)) ? Math.max(0, Math.floor(Number(tool.sort))) : sortIndex * 10,
    remark: String(tool?.remark || (standardCommercialTool ? '标准计费工具：登录后使用，会员免扣' : '免费引流工具：无需登录扣分')).trim(),
    needLogin: typeof tool?.needLogin === 'boolean' ? tool.needLogin : defaultNeedLogin,
    allowAnonymousPreview: typeof tool?.allowAnonymousPreview === 'boolean' ? tool.allowAnonymousPreview : !defaultNeedLogin,
    anonymousQuota: Number.isFinite(Number(tool?.anonymousQuota)) ? Math.max(0, Math.floor(Number(tool.anonymousQuota))) : 0,
    commercialTier,
    memberCore: Boolean(tool?.memberCore),
    policyVersion: COMMERCIAL_POLICY_VERSION
  }
}

/**
 * 函数说明：递归为工具分类树补齐商业策略字段，保持原分类结构不变。
 */
export function enrichToolCategoriesWithCommercialPolicy(categories) {
  let sortIndex = 1
  if (!Array.isArray(categories)) {
    return []
  }
  return categories.map((category) => ({
    ...category,
    list: Array.isArray(category?.list)
      ? category.list.map((subCategory) => ({
          ...subCategory,
          list: Array.isArray(subCategory?.list)
            ? subCategory.list.map((tool) => {
                const policy = resolveToolCommercialPolicy(tool, sortIndex)
                sortIndex += 1
                return {
                  ...tool,
                  ...policy
                }
              })
            : []
        }))
      : []
  }))
}

/**
 * 函数说明：拍平工具分类树，便于统计和生成后台计费规则。
 */
function flattenTools(categories) {
  if (!Array.isArray(categories)) {
    return []
  }
  return categories.flatMap((category) => {
    const subCategoryList = Array.isArray(category?.list) ? category.list : []
    return subCategoryList.flatMap((subCategory) => (Array.isArray(subCategory?.list) ? subCategory.list : []))
  })
}

/**
 * 函数说明：统计商业策略覆盖情况，供同步日志和审计脚本复用。
 */
export function countCommercialPolicyTools(categories) {
  const tools = flattenTools(categories)
  return tools.reduce(
    (summary, tool) => {
      summary.toolCount += 1
      if (String(tool?.toolKey || '').trim()) {
        summary.explicitToolKeyCount += 1
      }
      if (
        Number.isFinite(Number(tool?.consumePoints)) ||
        typeof tool?.memberFree === 'boolean' ||
        Number.isFinite(Number(tool?.status))
      ) {
        summary.strategyFieldToolCount += 1
      }
      if (tool?.memberCore === true) {
        summary.memberCoreToolCount += 1
      }
      if (tool?.commercialTier === COMMERCIAL_TIER.PREMIUM) {
        summary.premiumToolCount += 1
      } else if (tool?.commercialTier === COMMERCIAL_TIER.STANDARD) {
        summary.standardToolCount += 1
      } else {
        summary.freeToolCount += 1
      }
      return summary
    },
    {
      toolCount: 0,
      explicitToolKeyCount: 0,
      strategyFieldToolCount: 0,
      memberCoreToolCount: 0,
      freeToolCount: 0,
      standardToolCount: 0,
      premiumToolCount: 0
    }
  )
}

/**
 * 函数说明：从工具分类树生成后台登录积分策略规则，确保扣分口径与工具主数据一致。
 */
export function buildToolConsumeRulesFromCategories(categories) {
  const seenToolKeys = new Set()
  return flattenTools(categories).reduce((rules, tool, index) => {
    const toolKey = String(tool?.toolKey || '').trim().toLowerCase()
    if (!toolKey || seenToolKeys.has(toolKey)) {
      return rules
    }
    seenToolKeys.add(toolKey)
    const consumePointsRaw = Number(tool?.consumePoints)
    const statusRaw = Number(tool?.status)
    const sortRaw = Number(tool?.sort)
    const needLogin = typeof tool?.needLogin === 'boolean' ? tool.needLogin : Number(tool?.consumePoints || 0) > 0
    rules.push({
      toolKey,
      name: String(tool?.title || toolKey).trim(),
      consumePoints: Number.isFinite(consumePointsRaw) ? Math.max(0, Math.floor(consumePointsRaw)) : 0,
      memberFree: tool?.memberFree === false ? 0 : 1,
      status: Number.isFinite(statusRaw) && statusRaw === 0 ? 0 : 1,
      sort: Number.isFinite(sortRaw) ? Math.max(0, Math.floor(sortRaw)) : index + 1,
      remark: String(tool?.remark || '').trim(),
      needLogin: needLogin ? 1 : 0,
      commercialTier: String(tool?.commercialTier || COMMERCIAL_TIER.FREE).trim(),
      memberCore: tool?.memberCore === true ? 1 : 0,
      policyVersion: String(tool?.policyVersion || COMMERCIAL_POLICY_VERSION).trim()
    })
    return rules
  }, [])
}
