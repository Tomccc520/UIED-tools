/**
 * @file homepageLearning.ts
 * @description 首页每日学习数据服务，统一读取后台代理并标准化后的 UIED RSS 内容
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-17
 */

export type HomepageLearningFilterType = 'all' | 'category_slug' | 'categories'

export interface HomepageLearningFeedItem {
  title: string
  url: string
  publishedAt: string
}

export interface HomepageLearningFeedConfig {
  enabled: boolean
  title: string
  filterType: HomepageLearningFilterType
  categorySlug: string
  categoryIds: string
  limit: number
}

export interface HomepageLearningFeedResult {
  config: HomepageLearningFeedConfig
  items: HomepageLearningFeedItem[]
  sections: HomepageLearningRelatedSections
}

export interface HomepageLearningRelatedSections {
  relax: HomepageLearningFeedItem[]
  deepseek: HomepageLearningFeedItem[]
  aigc: HomepageLearningFeedItem[]
}

interface HomepageLearningApiResponse {
  code?: number
  msg?: string
  data?: unknown
}

interface HomepageLearningApiError extends Error {
  code?: number
}

const HOMEPAGE_LEARNING_ENDPOINT = '/api/common/index/learning-rss'
const HOMEPAGE_LEARNING_TIMEOUT_MS = 8000
const DEFAULT_HOMEPAGE_LEARNING_CONFIG: HomepageLearningFeedConfig = {
  enabled: true,
  title: '每日学习',
  filterType: 'all',
  categorySlug: '',
  categoryIds: '',
  limit: 20
}

/**
 * 函数说明：兼容布尔值与 0/1 字符串，避免后台存储类型差异导致开关误判。
 */
const normalizeBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    return value !== 0
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === '1' || normalized === 'true') {
      return true
    }
    if (normalized === '0' || normalized === 'false') {
      return false
    }
  }
  return fallback
}

/**
 * 函数说明：标准化 RSS 筛选类型，未知值回退到全部文章。
 */
const normalizeFilterType = (value: unknown): HomepageLearningFilterType => {
  const normalized = String(value || '').trim()
  return normalized === 'category_slug' || normalized === 'categories' ? normalized : 'all'
}

/**
 * 函数说明：将后台配置标准化为前端固定结构并限制合理的展示数量。
 */
const normalizeConfig = (value: unknown): HomepageLearningFeedConfig => {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const limitValue = Number(record.limit ?? record.itemLimit)
  return {
    enabled: normalizeBoolean(record.enabled, DEFAULT_HOMEPAGE_LEARNING_CONFIG.enabled),
    title: String(record.title || DEFAULT_HOMEPAGE_LEARNING_CONFIG.title).trim() || DEFAULT_HOMEPAGE_LEARNING_CONFIG.title,
    filterType: normalizeFilterType(record.filterType),
    categorySlug: String(record.categorySlug || '').trim(),
    categoryIds: String(record.categoryIds || record.categories || '').trim(),
    limit: Number.isFinite(limitValue)
      ? Math.min(50, Math.max(1, Math.floor(limitValue)))
      : DEFAULT_HOMEPAGE_LEARNING_CONFIG.limit
  }
}

/**
 * 函数说明：标准化后端 RSS 条目，过滤缺失标题或链接的无效数据。
 */
const normalizeItems = (value: unknown, limit: number): HomepageLearningFeedItem[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const title = String(record.title || '').trim()
      const url = String(record.url || record.link || '').trim()
      if (!title || !url) {
        return null
      }
      return {
        title,
        url,
        publishedAt: String(record.publishedAt || record.pubDate || record.date || '').trim()
      }
    })
    .filter((item): item is HomepageLearningFeedItem => Boolean(item))
    .slice(0, limit)
}

/**
 * 函数说明：解析 LikeAdmin 统一响应结构，同时兼容配置位于 config 或数据根节点的情况。
 */
const parseHomepageLearningResponse = (payload: unknown): HomepageLearningFeedResult => {
  const response = (payload || {}) as HomepageLearningApiResponse
  const code = Number(response.code || 0)
  if (code !== 200) {
    const error = new Error(String(response.msg || '获取每日学习内容失败')) as HomepageLearningApiError
    error.code = code
    throw error
  }

  const data = response.data && typeof response.data === 'object'
    ? (response.data as Record<string, unknown>)
    : {}
  const config = normalizeConfig(data.config || data)
  const sections = data.sections && typeof data.sections === 'object'
    ? (data.sections as Record<string, unknown>)
    : {}
  return {
    config,
    items: normalizeItems(data.items || data.list, config.limit),
    sections: {
      relax: normalizeItems(sections.relax, 30),
      deepseek: normalizeItems(sections.deepseek, 30),
      aigc: normalizeItems(sections.aigc, 30)
    }
  }
}

/**
 * 函数说明：请求本站后端代理的每日学习 RSS，统一处理超时和错误提示。
 */
export const getHomepageLearningFeed = async (): Promise<HomepageLearningFeedResult> => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), HOMEPAGE_LEARNING_TIMEOUT_MS)
  try {
    const response = await fetch(HOMEPAGE_LEARNING_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      signal: controller.signal
    })
    if (!response.ok) {
      throw new Error(`获取每日学习内容失败（HTTP ${response.status}）`)
    }
    return parseHomepageLearningResponse(await response.json())
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('每日学习内容请求超时，请稍后重试')
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

/**
 * 函数说明：返回默认每日学习配置，用于页面首次渲染与失败兜底。
 */
export const getDefaultHomepageLearningConfig = (): HomepageLearningFeedConfig => ({
  ...DEFAULT_HOMEPAGE_LEARNING_CONFIG
})
