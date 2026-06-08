/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-31
 */

import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { normalizeRuntimeToolKey, useToolConsume } from '@/composables/useToolConsume'
import { getSitePublicConfig } from '@/services/siteConfig'
import {
  TOOL_CONSUME_GUARD_ACTION_KEYWORDS,
  TOOL_CONSUME_GUARD_FALSE_POSITIVE_WHITELIST,
  TOOL_CONSUME_GUARD_IGNORE_KEYWORDS,
  TOOL_CONSUME_MANUAL_ROUTE_PATHS
} from '@/config/toolConsumeGuard'

const AUTO_GUARD_SKIP_ATTR = 'data-tool-consume-guard-skip'
const MANUAL_GUARD_SKIP_SELECTOR = '[data-skip-tool-consume="1"]'
const ACTION_TRIGGER_SELECTOR = 'button, a, [role="button"], .el-button'
const ROUTE_TOOL_KEY_CACHE_TTL_MS = 5 * 60 * 1000

let routeToolKeyCacheExpiresAt = 0
let routeToolKeyMap = new Map<string, string>()
let routeToolMatchKeyMap = new Map<string, string>()

/**
 * 函数说明：转义关键词中的正则特殊字符，确保动态构造 RegExp 时行为稳定。
 */
const escapeRegexKeyword = (keyword: string): string => {
  return String(keyword || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 函数说明：根据关键词数组构造正则表达式；若为空则返回永不命中的表达式。
 */
const buildKeywordRegExp = (keywords: string[]): RegExp => {
  const validKeywords = Array.isArray(keywords)
    ? keywords.map((item) => String(item || '').trim()).filter(Boolean)
    : []
  if (validKeywords.length === 0) {
    return /$^/
  }
  return new RegExp(`(${validKeywords.map(escapeRegexKeyword).join('|')})`, 'i')
}

const ACTION_KEYWORD_REG = buildKeywordRegExp(TOOL_CONSUME_GUARD_ACTION_KEYWORDS)
const ACTION_IGNORE_REG = buildKeywordRegExp(TOOL_CONSUME_GUARD_IGNORE_KEYWORDS)
const ACTION_FALSE_POSITIVE_WHITELIST = TOOL_CONSUME_GUARD_FALSE_POSITIVE_WHITELIST
  .map((item) => String(item || '').trim().toLowerCase())
  .filter(Boolean)

const MANUAL_CONSUME_ROUTE_SET = new Set(
  TOOL_CONSUME_MANUAL_ROUTE_PATHS
    .map((item) => String(item || '').trim())
    .filter(Boolean)
)

/**
 * 函数说明：标准化按钮文案，统一为单行文本，便于后续关键词识别。
 */
const normalizeActionText = (rawText: string): string => {
  return String(rawText || '').replace(/\s+/g, ' ').trim()
}

/**
 * 函数说明：从点击元素提取动作文案，优先读取可见文本，兜底读取 aria/title。
 */
const resolveActionText = (target: HTMLElement): string => {
  const visibleText = normalizeActionText(target.innerText || target.textContent || '')
  if (visibleText) {
    return visibleText
  }
  const ariaLabel = normalizeActionText(target.getAttribute('aria-label') || '')
  if (ariaLabel) {
    return ariaLabel
  }
  return normalizeActionText(target.getAttribute('title') || '')
}

/**
 * 函数说明：标准化路由路径（去除 query/hash/尾斜杠），用于手动接入路由清单比对。
 */
const normalizeRoutePath = (path: string): string => {
  const cleaned = String(path || '')
    .split('?')[0]
    .split('#')[0]
    .trim()
  if (!cleaned) {
    return ''
  }
  if (cleaned === '/') {
    return '/'
  }
  return cleaned.replace(/\/+$/g, '')
}

/**
 * 函数说明：标准化完整工具路由匹配键，保留 query 用于区分同一路径下的细分工具。
 */
const normalizeRouteMatchKey = (path: string): string => {
  const rawValue = String(path || '').trim().split('#')[0]
  if (!rawValue) {
    return ''
  }
  const [rawPath, rawQuery = ''] = rawValue.split('?')
  const normalizedPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/g, '')
  const query = rawQuery.trim()
  return query ? `${normalizedPath}?${query}` : normalizedPath
}

/**
 * 函数说明：从完整工具路由生成 toolKey，保留 query 并归并历史别名，便于积分扣减统计归类。
 */
const deriveToolKeyByPath = (path: string): string => {
  const [rawPath, rawQuery = ''] = normalizeRouteMatchKey(path).split('?')
  const routeKey = rawPath
    .replace(/^\/tools\//, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[\/_]+/g, '-')
  const queryKey = Array.from(new URLSearchParams(rawQuery).entries())
    .map(([key, value]) => `${key}-${value}`)
    .join('-')
  const key = [routeKey, queryKey]
    .filter(Boolean)
    .join('-')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
  return normalizeRuntimeToolKey(key) || 'tools-home'
}

/**
 * 函数说明：构建“路由路径 => toolKey”映射缓存，优先读取后台工具主数据里的显式 toolKey。
 */
const buildRouteToolKeyCache = async () => {
  const now = Date.now()
  if (routeToolKeyMap.size > 0 && now <= routeToolKeyCacheExpiresAt) {
    return
  }
  try {
    const siteConfig = await getSitePublicConfig()
    const nextPathMap = new Map<string, string>()
    const nextMatchKeyMap = new Map<string, string>()
    const categoryList = Array.isArray(siteConfig.toolCategories) ? siteConfig.toolCategories : []
    categoryList.forEach((category) => {
      const subList = Array.isArray(category.list) ? category.list : []
      subList.forEach((subCategory) => {
        const toolList = Array.isArray(subCategory.list) ? subCategory.list : []
        toolList.forEach((tool) => {
          const routePath = normalizeRoutePath(tool.url)
          const routeMatchKey = normalizeRouteMatchKey(tool.url)
          const toolKey = normalizeRuntimeToolKey(tool.toolKey)
          if ((!routePath && !routeMatchKey) || !toolKey) {
            return
          }
          if (routeMatchKey) {
            nextMatchKeyMap.set(routeMatchKey, toolKey)
          }
          if (routePath && (!nextPathMap.has(routePath) || routeMatchKey === routePath)) {
            nextPathMap.set(routePath, toolKey)
          }
        })
      })
    })
    routeToolKeyMap = nextPathMap
    routeToolMatchKeyMap = nextMatchKeyMap
    routeToolKeyCacheExpiresAt = now + ROUTE_TOOL_KEY_CACHE_TTL_MS
  } catch (error) {
    routeToolKeyMap = new Map<string, string>()
    routeToolMatchKeyMap = new Map<string, string>()
    routeToolKeyCacheExpiresAt = now + 30 * 1000
  }
}

/**
 * 函数说明：根据路由路径解析 toolKey，优先命中后台工具主数据映射，失败时回退路径推导。
 */
const resolveToolKeyByPath = async (path: string): Promise<string> => {
  const normalizedPath = normalizeRoutePath(path)
  const normalizedMatchKey = normalizeRouteMatchKey(path)
  await buildRouteToolKeyCache()
  const mappedExactToolKey = routeToolMatchKeyMap.get(normalizedMatchKey)
  if (mappedExactToolKey) {
    return mappedExactToolKey
  }
  const mappedToolKey = routeToolKeyMap.get(normalizedPath)
  if (mappedToolKey) {
    return mappedToolKey
  }
  return deriveToolKeyByPath(path)
}

/**
 * 函数说明：判断当前动作文案是否命中误判白名单，命中后直接放行。
 */
const isActionTextInFalsePositiveWhitelist = (actionText: string): boolean => {
  const text = normalizeActionText(actionText).toLowerCase()
  if (!text) {
    return false
  }
  return ACTION_FALSE_POSITIVE_WHITELIST.some((keyword) => text.includes(keyword))
}

/**
 * 函数说明：判断当前路由是否已经手动接入 useToolConsume，命中后跳过全局自动拦截。
 */
const isManualConsumeRoute = (path: string): boolean => {
  const normalized = normalizeRoutePath(path)
  if (!normalized) {
    return false
  }
  return MANUAL_CONSUME_ROUTE_SET.has(normalized)
}

/**
 * 函数说明：根据动作文案推断 action 标识，便于后端统计不同操作类型。
 */
const resolveActionCode = (actionText: string): string => {
  const text = normalizeActionText(actionText)
  if (/下载|导出/i.test(text)) {
    return 'download'
  }
  if (/支付|购买|开通/i.test(text)) {
    return 'purchase'
  }
  if (/压缩/i.test(text)) {
    return 'compress'
  }
  if (/转换/i.test(text)) {
    return 'convert'
  }
  if (/抠图|去水印/i.test(text)) {
    return 'matting'
  }
  if (/裁剪/i.test(text)) {
    return 'crop'
  }
  if (/旋转/i.test(text)) {
    return 'rotate'
  }
  if (/合并/i.test(text)) {
    return 'merge'
  }
  if (/录制/i.test(text)) {
    return 'record'
  }
  if (/提取/i.test(text)) {
    return 'extract'
  }
  if (/生成/i.test(text)) {
    return 'generate'
  }
  return 'use'
}

/**
 * 函数说明：判断触发元素是否可操作（未禁用且未处于 loading 锁定态）。
 */
const isActionElementEnabled = (target: HTMLElement): boolean => {
  if (target.getAttribute('disabled') !== null) {
    return false
  }
  if (target.getAttribute('aria-disabled') === 'true') {
    return false
  }
  if (target.classList.contains('is-disabled') || target.classList.contains('is-loading')) {
    return false
  }
  return true
}

/**
 * 函数说明：判断当前点击是否属于“应拦截的高价值动作”。
 */
const shouldGuardAction = (target: HTMLElement, actionText: string): boolean => {
  if (!actionText) {
    return false
  }
  if (isActionTextInFalsePositiveWhitelist(actionText)) {
    return false
  }
  if (ACTION_IGNORE_REG.test(actionText)) {
    return false
  }
  if (!ACTION_KEYWORD_REG.test(actionText)) {
    return false
  }
  if (!isActionElementEnabled(target)) {
    return false
  }
  return true
}

/**
 * 函数说明：全局挂载“工具动作扣分拦截层”，用于补齐未接入页面的登录/积分校验。
 */
export const useGlobalToolConsumeGuard = () => {
  const route = useRoute()
  const { ensureToolConsume } = useToolConsume()
  let isHandling = false

  /**
   * 函数说明：全局点击捕获器，在工具页识别高价值动作并先执行登录/积分校验。
   */
  const handleClickCapture = async (event: MouseEvent) => {
    if (isHandling) {
      return
    }
    if (!String(route.path || '').startsWith('/tools/')) {
      return
    }
    if (isManualConsumeRoute(route.path)) {
      return
    }

    const eventTarget = event.target
    if (!(eventTarget instanceof HTMLElement)) {
      return
    }

    const trigger = eventTarget.closest(ACTION_TRIGGER_SELECTOR) as HTMLElement | null
    if (!trigger) {
      return
    }
    if (trigger.getAttribute(AUTO_GUARD_SKIP_ATTR) === '1') {
      return
    }
    if (trigger.closest(MANUAL_GUARD_SKIP_SELECTOR)) {
      return
    }

    const actionText = resolveActionText(trigger)
    if (!shouldGuardAction(trigger, actionText)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    isHandling = true

    try {
      const allow = await ensureToolConsume({
        toolKey: await resolveToolKeyByPath(route.fullPath),
        action: resolveActionCode(actionText),
        routePath: route.fullPath,
        redirectPath: route.fullPath,
        loginWarningText: '请先登录后再继续当前工具操作'
      })
      if (!allow) {
        return
      }

      trigger.setAttribute(AUTO_GUARD_SKIP_ATTR, '1')
      trigger.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }))
      window.setTimeout(() => {
        trigger.removeAttribute(AUTO_GUARD_SKIP_ATTR)
      }, 0)
    } finally {
      isHandling = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickCapture, true)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickCapture, true)
  })
}
