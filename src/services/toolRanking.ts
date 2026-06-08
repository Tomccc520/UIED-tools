/**
 * @file toolRanking.ts
 * @description 工具排行榜服务，统一处理前台榜单读取与访问/开始处理等埋点上报
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
 */

import { findToolByUrl } from '@/services/toolCatalog'
import { getSitePublicConfig } from '@/services/siteConfig'
import type { Tool } from '@/types/tools'

export type ToolRankingEventType = 'view' | 'start' | 'success' | 'download'
export type ToolRankingPeriod = 'day' | 'week' | 'month' | 'all'
export type ToolRankingSortBy = 'score' | 'view' | 'start' | 'success' | 'download'

export interface ToolRankingTrackPayload {
  toolKey: string
  routePath?: string
  eventType: ToolRankingEventType
  toolTitle?: string
  toolUrl?: string
  cateTitle?: string
  source?: string
}

export interface ToolRankingListItem {
  rank: number
  toolKey: string
  toolTitle: string
  toolUrl: string
  cateTitle: string
  viewCount: number
  startCount: number
  successCount: number
  downloadCount: number
  score: number
  status: number
  remark: string
}

export interface ToolRankingListResult {
  period: ToolRankingPeriod
  sortBy: ToolRankingSortBy
  limit: number
  startDate: string
  endDate: string
  updatedAt: number
  list: ToolRankingListItem[]
}

interface ToolRankingApiResponse<T> {
  code?: number
  msg?: string
  data?: T
}

interface ToolRankingApiError extends Error {
  code?: number
}

interface ToolRankingListOptions {
  period?: ToolRankingPeriod
  sortBy?: ToolRankingSortBy
  limit?: number
}

interface ToolRankingResolvedMeta {
  toolKey: string
  toolTitle: string
  toolUrl: string
  cateTitle: string
}

const TOOL_RANKING_LIST_ENDPOINT = '/api/common/tool-ranking/list'
const TOOL_RANKING_TRACK_ENDPOINT = '/api/common/tool-ranking/track'
const TOOL_RANKING_API_TIMEOUT_MS = 8000
const TOOL_RANKING_VIEW_DEDUPE_TTL_MS = 10 * 60 * 1000
const TOOL_RANKING_VIEW_DEDUPE_STORAGE_KEY = 'uiedtool.tool-ranking.view-dedupe'

/**
 * 函数说明：构建统一的工具排行榜接口错误对象，便于组件侧统一处理失败提示。
 */
const buildToolRankingApiError = (message: string, code = 0): ToolRankingApiError => {
  const error = new Error(String(message || '请求失败，请稍后重试')) as ToolRankingApiError
  error.code = code
  return error
}

/**
 * 函数说明：标准化工具路由，统一去除 query/hash 与尾斜杠。
 */
const normalizeToolRankingRoutePath = (value: unknown): string => {
  const normalizedPath = String(value || '')
    .trim()
    .split('?')[0]
    .split('#')[0]
  if (!normalizedPath) {
    return ''
  }
  if (normalizedPath === '/') {
    return '/'
  }
  return normalizedPath.replace(/\/+$/g, '')
}

/**
 * 函数说明：标准化 toolKey，统一转为小写，保证不同入口归因一致。
 */
const normalizeToolRankingKey = (value: unknown): string => {
  return String(value || '').trim().toLowerCase()
}

/**
 * 函数说明：标准化排行榜周期，避免后台脏值导致接口请求与前端展示口径不一致。
 */
export const normalizeToolRankingPeriod = (value: unknown, fallback: ToolRankingPeriod = 'week'): ToolRankingPeriod => {
  const normalized = String(value || '').trim()
  return normalized === 'day' || normalized === 'week' || normalized === 'month' || normalized === 'all'
    ? normalized
    : fallback
}

/**
 * 函数说明：按工具路由推导 toolKey，作为后台未显式配置 toolKey 时的前端兜底方案。
 */
const deriveToolRankingKeyByPath = (routePath: string): string => {
  const normalizedPath = normalizeToolRankingRoutePath(routePath)
    .replace(/^\/tools\//, '')
    .replace(/^\/+|\/+$/g, '')
  const toolKey = normalizedPath.replace(/[\/_]+/g, '-').trim()
  return normalizeToolRankingKey(toolKey || 'tools-home')
}

/**
 * 函数说明：解析接口响应，统一校验 code=200 的成功口径。
 */
const parseToolRankingApiResponse = <T>(payload: unknown): T => {
  const responsePayload = (payload || {}) as ToolRankingApiResponse<T>
  const code = Number(responsePayload.code || 0)
  if (code !== 200) {
    throw buildToolRankingApiError(String(responsePayload.msg || '请求失败，请稍后重试'), code)
  }
  return (responsePayload.data || ({} as T)) as T
}

/**
 * 函数说明：发起工具排行榜接口请求，统一处理超时、错误与 JSON 解析。
 */
const requestToolRankingApi = async <T>(endpoint: string, init: RequestInit): Promise<T> => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), TOOL_RANKING_API_TIMEOUT_MS)
  try {
    const headers = new Headers(init.headers || {})
    if (!headers.has('Content-Type') && String(init.method || 'GET').toUpperCase() !== 'GET') {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(endpoint, {
      ...init,
      headers,
      signal: controller.signal
    })
    if (!response.ok) {
      throw buildToolRankingApiError(`请求失败（HTTP ${response.status}）`)
    }
    const payload = await response.json()
    return parseToolRankingApiResponse<T>(payload)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw buildToolRankingApiError('工具排行榜请求超时，请稍后重试')
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

/**
 * 函数说明：将接口返回的榜单项标准化为前端固定结构。
 */
const normalizeToolRankingListItems = (input: unknown): ToolRankingListItem[] => {
  if (!Array.isArray(input)) {
    return []
  }
  return input
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      return {
        rank: Math.max(1, Number(record.rank || 0) || 1),
        toolKey: normalizeToolRankingKey(record.toolKey),
        toolTitle: String(record.toolTitle || '').trim(),
        toolUrl: String(record.toolUrl || '').trim(),
        cateTitle: String(record.cateTitle || '').trim(),
        viewCount: Math.max(0, Number(record.viewCount || 0)),
        startCount: Math.max(0, Number(record.startCount || 0)),
        successCount: Math.max(0, Number(record.successCount || 0)),
        downloadCount: Math.max(0, Number(record.downloadCount || 0)),
        score: Math.max(0, Number(record.score || 0)),
        status: Number(record.status ?? 1) === 0 ? 0 : 1,
        remark: String(record.remark || '').trim()
      }
    })
    .filter((item): item is ToolRankingListItem => Boolean(item?.toolKey && item.toolTitle && item.toolUrl))
}

/**
 * 函数说明：将榜单查询结果标准化，保证页面在接口字段缺失时仍有稳定默认值。
 */
const normalizeToolRankingListResult = (input: unknown): ToolRankingListResult => {
  const record = (input || {}) as Record<string, unknown>
  return {
    period: normalizeToolRankingPeriod(record.period),
    sortBy: (String(record.sortBy || 'view').trim() || 'view') as ToolRankingSortBy,
    limit: Math.max(1, Number(record.limit || 10) || 10),
    startDate: String(record.startDate || '').trim(),
    endDate: String(record.endDate || '').trim(),
    updatedAt: Math.max(0, Number(record.updatedAt || 0)),
    list: normalizeToolRankingListItems(record.list)
  }
}

/**
 * 函数说明：读取 sessionStorage 中的访问去重缓存，异常时自动回退为空对象。
 */
const getToolRankingViewDedupeMap = (): Record<string, number> => {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const rawText = window.sessionStorage.getItem(TOOL_RANKING_VIEW_DEDUPE_STORAGE_KEY)
    if (!rawText) {
      return {}
    }
    const parsed = JSON.parse(rawText) as Record<string, number>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * 函数说明：写入访问去重缓存，仅保留最近有效项，避免 sessionStorage 无限增长。
 */
const saveToolRankingViewDedupeMap = (value: Record<string, number>) => {
  if (typeof window === 'undefined') {
    return
  }
  const now = Date.now()
  const nextValue = Object.entries(value || {}).reduce<Record<string, number>>((result, [key, timestamp]) => {
    if (now - Number(timestamp || 0) <= TOOL_RANKING_VIEW_DEDUPE_TTL_MS) {
      result[key] = Number(timestamp || 0)
    }
    return result
  }, {})
  window.sessionStorage.setItem(TOOL_RANKING_VIEW_DEDUPE_STORAGE_KEY, JSON.stringify(nextValue))
}

/**
 * 函数说明：判断当前工具访问是否命中短期去重窗口，避免刷新页面短时间内重复记访问。
 */
const shouldSkipToolRankingViewTrack = (toolKey: string, routePath: string): boolean => {
  const normalizedToolKey = normalizeToolRankingKey(toolKey)
  const normalizedRoutePath = normalizeToolRankingRoutePath(routePath)
  if (!normalizedToolKey || !normalizedRoutePath || typeof window === 'undefined') {
    return false
  }
  const dedupeKey = `${normalizedToolKey}@@${normalizedRoutePath}`
  const dedupeMap = getToolRankingViewDedupeMap()
  const previousTimestamp = Number(dedupeMap[dedupeKey] || 0)
  const now = Date.now()
  if (previousTimestamp > 0 && now - previousTimestamp <= TOOL_RANKING_VIEW_DEDUPE_TTL_MS) {
    return true
  }
  dedupeMap[dedupeKey] = now
  saveToolRankingViewDedupeMap(dedupeMap)
  return false
}

/**
 * 函数说明：根据当前工具路由解析前端兜底元信息，优先复用后台工具主数据。
 */
export const resolveToolRankingMetaByRoute = async (routePath: string): Promise<ToolRankingResolvedMeta | null> => {
  const normalizedRoutePath = normalizeToolRankingRoutePath(routePath)
  if (!normalizedRoutePath.startsWith('/tools/')) {
    return null
  }
  try {
    const siteConfig = await getSitePublicConfig()
    const matchedTool = findToolByUrl(siteConfig.toolCategories, normalizedRoutePath)
    if (matchedTool) {
      return {
        toolKey: normalizeToolRankingKey(matchedTool.toolKey) || deriveToolRankingKeyByPath(normalizedRoutePath),
        toolTitle: String(matchedTool.title || '').trim(),
        toolUrl: normalizedRoutePath,
        cateTitle: String(matchedTool.cate || '').trim()
      }
    }
  } catch {
    // 函数说明：站点配置读取失败时静默回退为路径推导，不阻断工具页使用。
  }
  return {
    toolKey: deriveToolRankingKeyByPath(normalizedRoutePath),
    toolTitle: '',
    toolUrl: normalizedRoutePath,
    cateTitle: ''
  }
}

/**
 * 函数说明：读取工具排行榜列表，供首页和右侧栏统一展示榜单。
 */
export const getToolRankingList = async (options: ToolRankingListOptions = {}): Promise<ToolRankingListResult> => {
  const searchParams = new URLSearchParams()
  if (options.period) {
    searchParams.set('period', String(options.period))
  }
  if (options.sortBy) {
    searchParams.set('sortBy', String(options.sortBy))
  }
  if (typeof options.limit === 'number' && options.limit > 0) {
    searchParams.set('limit', String(options.limit))
  }
  const endpoint = searchParams.toString()
    ? `${TOOL_RANKING_LIST_ENDPOINT}?${searchParams.toString()}`
    : TOOL_RANKING_LIST_ENDPOINT
  const data = await requestToolRankingApi<unknown>(endpoint, { method: 'GET' })
  return normalizeToolRankingListResult(data)
}

/**
 * 函数说明：写入工具排行榜埋点事件，供访问、开始处理、下载等动作统一上报。
 */
export const trackToolRankingEvent = async (payload: ToolRankingTrackPayload): Promise<void> => {
  await requestToolRankingApi<unknown>(TOOL_RANKING_TRACK_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      toolKey: normalizeToolRankingKey(payload.toolKey),
      routePath: normalizeToolRankingRoutePath(payload.routePath),
      eventType: payload.eventType,
      toolTitle: String(payload.toolTitle || '').trim(),
      toolUrl: normalizeToolRankingRoutePath(payload.toolUrl),
      cateTitle: String(payload.cateTitle || '').trim(),
      source: String(payload.source || '').trim()
    })
  })
}

/**
 * 函数说明：按路由记录工具访问埋点，并带本地去重，避免刷新造成榜单虚高。
 */
export const trackToolVisitByRoute = async (routePath: string, source = 'route-view'): Promise<void> => {
  const resolvedMeta = await resolveToolRankingMetaByRoute(routePath)
  if (!resolvedMeta || !resolvedMeta.toolKey) {
    return
  }
  if (shouldSkipToolRankingViewTrack(resolvedMeta.toolKey, routePath)) {
    return
  }
  await trackToolRankingEvent({
    toolKey: resolvedMeta.toolKey,
    routePath,
    eventType: 'view',
    toolTitle: resolvedMeta.toolTitle,
    toolUrl: resolvedMeta.toolUrl,
    cateTitle: resolvedMeta.cateTitle,
    source
  })
}

/**
 * 函数说明：按工具实体构建榜单兜底数据，供接口冷启动或异常时复用现有推荐区内容。
 */
export const buildFallbackToolRankingItems = (toolList: Tool[]): ToolRankingListItem[] => {
  return (Array.isArray(toolList) ? toolList : [])
    .filter((tool) => String(tool?.title || '').trim() && String(tool?.url || '').trim())
    .map((tool, index) => ({
      rank: index + 1,
      toolKey: normalizeToolRankingKey(tool.toolKey) || deriveToolRankingKeyByPath(String(tool.url || '')),
      toolTitle: String(tool.title || '').trim(),
      toolUrl: String(tool.url || '').trim(),
      cateTitle: String(tool.cate || '').trim(),
      viewCount: 0,
      startCount: 0,
      successCount: 0,
      downloadCount: 0,
      score: 0,
      status: Number(tool.status ?? 1) === 0 ? 0 : 1,
      remark: String(tool.remark || '').trim()
    }))
}
