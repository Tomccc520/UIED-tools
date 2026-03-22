/**
 * @file siteConfig.ts
 * @description 站点公共配置读取服务，统一对接 likeadmin-go 公共配置接口
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */

export interface SiteLinkItem {
  name: string
  link: string
}

export interface SiteLinkSection {
  title: string
  items: SiteLinkItem[]
}

export interface SiteSidebarCategoryMenu {
  key: string
  title: string
  cateTitle: string
  link?: string
}

export interface SiteHotToolItem {
  title: string
  desc: string
  link: string
}

export interface SitePublicConfig {
  webName: string
  webLogo: string
  webFavicon: string
  webBackdrop: string
  ossDomain: string
  siteSlogan: string
  sidebarRecommendTitle: string
  footerIntro: string
  footerQuickTitle: string
  footerFriendTitle: string
  officialMediaTitle: string
  footerSupportLabel: string
  footerSupportLinks: SiteLinkItem[]
  footerRecordLinks: SiteLinkItem[]
  hotTools: SiteHotToolItem[]
  headerLinks: SiteLinkItem[]
  sidebarRecommendLinks: SiteLinkItem[]
  sidebarCategoryMenus: SiteSidebarCategoryMenu[]
  sidebarBottomLinks: SiteLinkItem[]
  footerQuickSections: SiteLinkSection[]
  footerFriendSections: SiteLinkSection[]
  officialMediaLinks: SiteLinkItem[]
}

interface SiteConfigOptions {
  endpoint?: string
  timeoutMs?: number
  forceRefresh?: boolean
}

const DEFAULT_ENDPOINT = '/api/common/index/config'
const DEFAULT_TIMEOUT_MS = 5000
const CACHE_TTL_MS = 5 * 60 * 1000

const DEFAULT_SITE_PUBLIC_CONFIG: SitePublicConfig = {
  webName: 'UIED-Tools',
  webLogo: '',
  webFavicon: '',
  webBackdrop: '',
  ossDomain: '',
  siteSlogan: '免费在线工具集',
  sidebarRecommendTitle: '推荐工具',
  footerIntro: '在线工具平台',
  footerQuickTitle: '工具快捷入口',
  footerFriendTitle: '友情链接',
  officialMediaTitle: '官方媒体',
  footerSupportLabel: '技术支持',
  footerSupportLinks: [],
  footerRecordLinks: [],
  hotTools: [],
  headerLinks: [],
  sidebarRecommendLinks: [],
  sidebarCategoryMenus: [],
  sidebarBottomLinks: [],
  footerQuickSections: [],
  footerFriendSections: [],
  officialMediaLinks: []
}

type SiteConfigCacheState = {
  data: SitePublicConfig
  expiresAt: number
}

let siteConfigCacheState: SiteConfigCacheState | null = null
let siteConfigPromise: Promise<SitePublicConfig> | null = null

/**
 * 函数说明：将接口返回的数组或 JSON 字符串统一转换为数组
 */
const normalizeArrayInput = (input: unknown): unknown[] => {
  if (Array.isArray(input)) {
    return input
  }
  if (typeof input === 'string' && input.trim()) {
    try {
      const parsed = JSON.parse(input)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

/**
 * 函数说明：清洗通用链接列表配置，过滤无效项
 */
const normalizeLinkItems = (input: unknown): SiteLinkItem[] => {
  return normalizeArrayInput(input)
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const name = String(record.name || '').trim()
      const link = String(record.link || '').trim()
      if (!name || !link) {
        return null
      }
      return { name, link }
    })
    .filter((item): item is SiteLinkItem => Boolean(item))
}

/**
 * 函数说明：清洗热门工具列表配置，支持 title/name 与 link/url 字段兼容
 */
const normalizeHotToolItems = (input: unknown): SiteHotToolItem[] => {
  return normalizeArrayInput(input)
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const title = String(record.title || record.name || '').trim()
      const desc = String(record.desc || record.description || '').trim()
      const link = String(record.link || record.url || '').trim()
      if (!title || !link) {
        return null
      }
      return { title, desc, link }
    })
    .filter((item): item is SiteHotToolItem => Boolean(item))
}

/**
 * 函数说明：清洗侧边栏分类菜单配置，过滤无效项并补齐菜单标识
 */
const normalizeSidebarCategoryMenus = (input: unknown): SiteSidebarCategoryMenu[] => {
  return normalizeArrayInput(input)
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const key = String(record.key || '').trim() || `menu-${index + 1}`
      const title = String(record.title || '').trim()
      const cateTitle = String(record.cateTitle || '').trim()
      const link = String(record.link || '').trim()
      if (!title || !cateTitle) {
        return null
      }
      if (link) {
        return { key, title, cateTitle, link }
      }
      return { key, title, cateTitle }
    })
    .filter(Boolean) as SiteSidebarCategoryMenu[]
}

/**
 * 函数说明：清洗链接分组配置，用于页脚快捷入口和友情链接
 */
const normalizeLinkSections = (input: unknown): SiteLinkSection[] => {
  return normalizeArrayInput(input)
    .map((section) => {
      if (!section || typeof section !== 'object') {
        return null
      }
      const record = section as Record<string, unknown>
      const title = String(record.title || '').trim()
      const items = normalizeLinkItems(record.items)
      if (!title || items.length === 0) {
        return null
      }
      return { title, items }
    })
    .filter((section): section is SiteLinkSection => Boolean(section))
}

/**
 * 函数说明：兼容后端响应包装结构，提取实际业务数据对象
 */
const extractResponseData = (payload: unknown): Record<string, unknown> => {
  if (!payload || typeof payload !== 'object') {
    return {}
  }
  const record = payload as Record<string, unknown>
  if (record.data && typeof record.data === 'object') {
    return record.data as Record<string, unknown>
  }
  return record
}

/**
 * 函数说明：将接口返回数据映射为站点公共配置结构并补齐默认值
 */
const mapToSitePublicConfig = (payload: unknown): SitePublicConfig => {
  const record = extractResponseData(payload)

  return {
    webName: String(record.webName || DEFAULT_SITE_PUBLIC_CONFIG.webName).trim() || DEFAULT_SITE_PUBLIC_CONFIG.webName,
    webLogo: String(record.webLogo || '').trim(),
    webFavicon: String(record.webFavicon || '').trim(),
    webBackdrop: String(record.webBackdrop || '').trim(),
    ossDomain: String(record.ossDomain || '').trim(),
    siteSlogan: String(record.toolsSiteSlogan || DEFAULT_SITE_PUBLIC_CONFIG.siteSlogan).trim() || DEFAULT_SITE_PUBLIC_CONFIG.siteSlogan,
    sidebarRecommendTitle:
      String(record.toolsSidebarRecommendTitle || DEFAULT_SITE_PUBLIC_CONFIG.sidebarRecommendTitle).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.sidebarRecommendTitle,
    footerIntro: String(record.toolsFooterIntro || DEFAULT_SITE_PUBLIC_CONFIG.footerIntro).trim() || DEFAULT_SITE_PUBLIC_CONFIG.footerIntro,
    footerQuickTitle:
      String(record.toolsFooterQuickTitle || DEFAULT_SITE_PUBLIC_CONFIG.footerQuickTitle).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.footerQuickTitle,
    footerFriendTitle:
      String(record.toolsFooterFriendTitle || DEFAULT_SITE_PUBLIC_CONFIG.footerFriendTitle).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.footerFriendTitle,
    officialMediaTitle:
      String(record.toolsOfficialMediaTitle || DEFAULT_SITE_PUBLIC_CONFIG.officialMediaTitle).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.officialMediaTitle,
    footerSupportLabel:
      String(record.toolsFooterSupportLabel || DEFAULT_SITE_PUBLIC_CONFIG.footerSupportLabel).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.footerSupportLabel,
    footerSupportLinks: normalizeLinkItems(record.toolsFooterSupportLinks),
    footerRecordLinks: normalizeLinkItems(record.toolsFooterRecordLinks),
    hotTools: normalizeHotToolItems(record.toolsHotTools),
    headerLinks: normalizeLinkItems(record.toolsHeaderLinks),
    sidebarRecommendLinks: normalizeLinkItems(record.toolsSidebarRecommend),
    sidebarCategoryMenus: normalizeSidebarCategoryMenus(record.toolsSidebarCategoryMenus),
    sidebarBottomLinks: normalizeLinkItems(record.toolsSidebarBottomLinks),
    footerQuickSections: normalizeLinkSections(record.toolsFooterQuickSections),
    footerFriendSections: normalizeLinkSections(record.toolsFooterFriendSections),
    officialMediaLinks: normalizeLinkItems(record.toolsOfficialMediaLinks)
  }
}

/**
 * 函数说明：请求后端站点公共配置接口
 */
const fetchSitePublicConfig = async (endpoint: string, timeoutMs: number): Promise<SitePublicConfig> => {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal
    })
    if (!response.ok) {
      throw new Error(`获取站点配置失败（HTTP ${response.status}）`)
    }
    const payload = await response.json()
    return mapToSitePublicConfig(payload)
  } finally {
    window.clearTimeout(timer)
  }
}

/**
 * 函数说明：获取站点公共配置，内置短期缓存与失败兜底
 */
export const getSitePublicConfig = async (options: SiteConfigOptions = {}): Promise<SitePublicConfig> => {
  const endpoint = options.endpoint || DEFAULT_ENDPOINT
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const now = Date.now()

  if (!options.forceRefresh && siteConfigCacheState && siteConfigCacheState.expiresAt > now) {
    return siteConfigCacheState.data
  }

  if (!options.forceRefresh && siteConfigPromise) {
    return siteConfigPromise
  }

  siteConfigPromise = (async () => {
    try {
      const data = await fetchSitePublicConfig(endpoint, timeoutMs)
      siteConfigCacheState = {
        data,
        expiresAt: Date.now() + CACHE_TTL_MS
      }
      return data
    } catch {
      siteConfigCacheState = {
        data: DEFAULT_SITE_PUBLIC_CONFIG,
        expiresAt: Date.now() + 30 * 1000
      }
      return DEFAULT_SITE_PUBLIC_CONFIG
    } finally {
      siteConfigPromise = null
    }
  })()

  return siteConfigPromise
}

/**
 * 函数说明：预热站点配置缓存，减少首次渲染等待
 */
export const warmupSitePublicConfig = async (): Promise<void> => {
  await getSitePublicConfig()
}

/**
 * 函数说明：返回默认站点配置，供组件初始化占位使用
 */
export const getDefaultSitePublicConfig = (): SitePublicConfig => ({ ...DEFAULT_SITE_PUBLIC_CONFIG })
