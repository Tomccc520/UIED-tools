/**
 * @file siteConfig.ts
 * @description 站点公共配置读取服务，统一对接 likeadmin-go 公共配置接口
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */

import type { Tool, ToolCategory, ToolSubCategory } from '@/types/tools'

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
  icon?: string
}

export type SiteSidebarMenuBlockType = 'dropdown' | 'list' | 'image' | 'category'

export interface SiteSidebarMenuBlockItem {
  name: string
  link: string
  icon?: string
  image?: string
  desc?: string
  category?: string
}

export interface SiteSidebarMenuBlock {
  key: string
  title: string
  type: SiteSidebarMenuBlockType
  icon?: string
  items: SiteSidebarMenuBlockItem[]
}

export interface SiteHotToolItem {
  title: string
  desc: string
  link: string
}

export interface SiteBannerSlideItem {
  badge: string
  text: string
  link: string
  gradient: string
}

export interface SitePublicConfig {
  webName: string
  webLogo: string
  webFavicon: string
  webBackdrop: string
  ossDomain: string
  userCenterEnabled: boolean
  userCenterTitle: string
  userCenterLink: string
  loginOpenOtherAuth: boolean
  loginOpenWechatAuth: boolean
  loginOpenQqAuth: boolean
  loginWechatAuthorizeUrl: string
  loginQqAuthorizeUrl: string
  loginDailyGiftPoints: number
  loginToolConsumePoints: number
  loginMemberEnabled: boolean
  loginMemberTrialDays: number
  bannerSlides: SiteBannerSlideItem[]
  siteSlogan: string
  sidebarBrandLogo: string
  sidebarBrandText: string
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
  sidebarMenuBlocks: SiteSidebarMenuBlock[]
  toolCategories: ToolCategory[]
  sidebarBottomLinks: SiteLinkItem[]
  aiToolboxSidebarMenus: SiteLinkItem[]
  changelogHeaderLinks: SiteLinkItem[]
  changelogIntroText: string
  changelogMetaLinks: SiteLinkItem[]
  changelogSplitTitle: string
  changelogSplitDesc: string
  changelogSplitLink: string
  changelogSplitLinkText: string
  changelogStatsText: string
  aiChatHeaderLinks: SiteLinkItem[]
  aiCommonHeaderLinks: SiteLinkItem[]
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

const DEFAULT_SIDEBAR_MENU_BLOCKS: SiteSidebarMenuBlock[] = []

const DEFAULT_SITE_PUBLIC_CONFIG: SitePublicConfig = {
  webName: 'UIED-Tools',
  webLogo: '',
  webFavicon: '',
  webBackdrop: '',
  ossDomain: '',
  userCenterEnabled: false,
  userCenterTitle: '用户中心',
  userCenterLink: '/user/center',
  loginOpenOtherAuth: false,
  loginOpenWechatAuth: false,
  loginOpenQqAuth: false,
  loginWechatAuthorizeUrl: '',
  loginQqAuthorizeUrl: '',
  loginDailyGiftPoints: 50,
  loginToolConsumePoints: 1,
  loginMemberEnabled: false,
  loginMemberTrialDays: 0,
  bannerSlides: [
    {
      badge: '推荐',
      text: '一人企业Vibe Coding社区！',
      link: 'https://fsuied.com',
      gradient: 'linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)'
    },
    {
      badge: '热门',
      text: 'GPT-5.4重回巅峰 智能对话',
      link: 'https://nf.video/mbx1u6/?gid=18',
      gradient: 'linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)'
    },
    {
      badge: '新品',
      text: '免费AI编程工具 Trae - 智能编码助手',
      link: 'https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied',
      gradient: 'linear-gradient(to right,#a855f7,#f3e8ff,#f5f3ff,#c084fc)'
    },
    {
      badge: '新品',
      text: '腾讯元宝 智能对话新体验',
      link: 'https://yuanbao.paluai.com/uied',
      gradient: 'linear-gradient(to right,#ffc800,#ffed99,#fff8cc,#ffaa00)'
    },
    {
      badge: '高效',
      text: '免费AI生成PPT - 一键生成演示文稿',
      link: 'https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047',
      gradient: 'linear-gradient(to right,#10b981,#d1fae5,#ecfdf5,#34d399)'
    },
    {
      badge: '特惠',
      text: 'Adobe 正版全家桶可用AI',
      link: 'https://universalbus.cn/?s=lPLG02aydo',
      gradient: 'linear-gradient(to right,#f97316,#ffedd5,#fff7ed,#fb923c)'
    },
    {
      badge: '新品',
      text: 'Gemini3 可用 nanobanana',
      link: 'https://universalbus.cn/?s=lPLG02aydo',
      gradient: 'linear-gradient(to right,#0ea5e9,#e0f2fe,#f0f9ff,#38bdf8)'
    }
  ],
  siteSlogan: '免费在线工具集',
  sidebarBrandLogo: '',
  sidebarBrandText: 'UIED-Tools',
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
  sidebarMenuBlocks: DEFAULT_SIDEBAR_MENU_BLOCKS,
  toolCategories: [],
  sidebarBottomLinks: [],
  aiToolboxSidebarMenus: [],
  changelogHeaderLinks: [],
  changelogIntroText: '由 Tomda 开发（AI协助）并记录 UIED-Tools 的开发历程和功能更新。公众号：Tomda',
  changelogMetaLinks: [
    { name: 'GitHub（开源版）', link: 'https://github.com/Tomccc520/UIED-tools' },
    { name: 'Gitee（闭源版）', link: 'https://gitee.com/tomdac/tool' },
    { name: 'CSDN 博客', link: 'https://blog.csdn.net/Tomdac?spm=1000.2115.3001.5343' },
    { name: 'UIED技术团队', link: 'https://fsuied.com/' }
  ],
  changelogSplitTitle: '工具箱 3.0.0 版本分岔提醒',
  changelogSplitDesc: '纯前端开源版在 3.0.0 后进入维护态；包含后台运营、会员与模型管理能力的版本为商业源码版。',
  changelogSplitLink: 'https://fsuied.com/',
  changelogSplitLinkText: '购买源码与服务支持（fsuied.com）',
  changelogStatsText: '当前工具总数：332个 | 最后更新：2026-03-23 10:30',
  aiChatHeaderLinks: [],
  aiCommonHeaderLinks: [
    { name: '每日免费分享最新AI资讯', link: 'https://ai.feishu.cn/wiki/CIktwhQHni3FLwkllYac6Bm2ndb?from=from_copylink' },
    { name: 'AI学习平台', link: 'https://www.uied.cn/' },
    { name: 'AI免费工具uiedtool.com', link: 'https://uiedtool.com' },
    { name: 'AI资讯热榜hot.uied.cn', link: 'https://hot.uied.cn' },
    { name: 'AI工具导航', link: 'https://hao.uied.cn/ai' }
  ],
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
 * 函数说明：将后端返回的布尔/数字/字符串标记统一转换为布尔值。
 */
const normalizeBooleanFlag = (input: unknown): boolean => {
  if (typeof input === 'boolean') {
    return input
  }
  if (typeof input === 'number') {
    return input === 1
  }
  if (typeof input === 'string') {
    const normalized = input.trim().toLowerCase()
    return normalized === '1' || normalized === 'true'
  }
  return false
}

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
 * 函数说明：清洗顶部 Banner 轮播配置，确保每条包含文案、链接和背景渐变
 */
const normalizeBannerSlides = (input: unknown): SiteBannerSlideItem[] => {
  const parsed = normalizeArrayInput(input)
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const badge = String(record.badge || '').trim()
      const text = String(record.text || '').trim()
      const link = String(record.link || record.url || '').trim()
      const gradient = String(record.gradient || '').trim()
      if (!badge || !text || !link || !gradient) {
        return null
      }
      return { badge, text, link, gradient }
    })
    .filter((item): item is SiteBannerSlideItem => Boolean(item))
  return parsed.length ? parsed : DEFAULT_SITE_PUBLIC_CONFIG.bannerSlides
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
      const icon = String(record.icon || '').trim()
      if (!title || !cateTitle) {
        return null
      }
      return {
        key,
        title,
        cateTitle,
        ...(link ? { link } : {}),
        ...(icon ? { icon } : {})
      }
    })
    .filter(Boolean) as SiteSidebarCategoryMenu[]
}

/**
 * 函数说明：标准化侧栏菜单模块类型，避免后台传入非法类型导致前端渲染异常。
 */
const normalizeSidebarMenuBlockType = (input: unknown): SiteSidebarMenuBlockType => {
  const normalized = String(input || '').trim().toLowerCase()
  if (normalized === 'dropdown' || normalized === 'list' || normalized === 'image' || normalized === 'category') {
    return normalized
  }
  return 'list'
}

/**
 * 函数说明：清洗侧栏菜单模块条目，统一名称/链接并补齐可选字段。
 */
const normalizeSidebarMenuBlockItems = (input: unknown): SiteSidebarMenuBlockItem[] => {
  return normalizeArrayInput(input)
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const name = String(record.name || '').trim()
      const link = String(record.link || '').trim()
      const icon = String(record.icon || '').trim()
      const image = String(record.image || '').trim()
      const desc = String(record.desc || '').trim()
      const category = String(record.category || '').trim()
      if (!name || !link) {
        return null
      }
      return {
        name,
        link,
        ...(icon ? { icon } : {}),
        ...(image ? { image } : {}),
        ...(desc ? { desc } : {}),
        ...(category ? { category } : {})
      }
    })
    .filter((item): item is SiteSidebarMenuBlockItem => Boolean(item))
}

/**
 * 函数说明：清洗侧栏菜单样式模块配置，支持下拉/列表/图片/分类四种渲染类型。
 */
const normalizeSidebarMenuBlocks = (input: unknown): SiteSidebarMenuBlock[] => {
  const parsed = normalizeArrayInput(input)
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const title = String(record.title || '').trim()
      const key = String(record.key || '').trim() || `menu-block-${index + 1}`
      const type = normalizeSidebarMenuBlockType(record.type)
      const icon = String(record.icon || '').trim()
      const items = normalizeSidebarMenuBlockItems(record.items)
      if (!title || items.length === 0) {
        return null
      }
      return {
        key,
        title,
        type,
        ...(icon ? { icon } : {}),
        items
      }
    })
    .filter((item): item is SiteSidebarMenuBlock => Boolean(item))

  if (parsed.length > 0) {
    return parsed
  }
  return DEFAULT_SIDEBAR_MENU_BLOCKS.map((block) => ({
    ...block,
    items: block.items.map((item) => ({ ...item }))
  }))
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
 * 函数说明：清洗工具图标配置，兼容图片 URL 与 SVG 图标对象
 */
const normalizeToolLogo = (input: unknown): Tool['logo'] => {
  if (typeof input === 'string' && input.trim()) {
    return input.trim()
  }
  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>
    const type = String(record.type || '').trim()
    const name = String(record.name || '').trim()
    if (type === 'svg' && name) {
      return { type: 'svg', name }
    }
  }
  return { type: 'svg', name: 'palette' }
}

/**
 * 函数说明：清洗后台工具分类树配置，仅保留前端渲染所需字段
 */
const normalizeToolCategories = (input: unknown): ToolCategory[] => {
  return normalizeArrayInput(input)
    .map((category, categoryIndex) => {
      if (!category || typeof category !== 'object') {
        return null
      }
      const categoryRecord = category as Record<string, unknown>
      const categoryTitle = String(categoryRecord.title || '').trim()
      const categoryIcon = String(categoryRecord.icon || '').trim()
      const categoryIdRaw = Number(categoryRecord.id)
      const categoryId =
        Number.isFinite(categoryIdRaw) && categoryIdRaw > 0 ? categoryIdRaw : categoryIndex + 1

      const subCategories = normalizeArrayInput(categoryRecord.list)
        .map((subCategory, subCategoryIndex) => {
          if (!subCategory || typeof subCategory !== 'object') {
            return null
          }
          const subCategoryRecord = subCategory as Record<string, unknown>
          const subCategoryTitle = String(subCategoryRecord.title || '').trim()
          const subCategoryIdRaw = Number(subCategoryRecord.id)
          const subCategoryId =
            Number.isFinite(subCategoryIdRaw) && subCategoryIdRaw > 0
              ? subCategoryIdRaw
              : categoryId * 100 + subCategoryIndex + 1

          const toolList = normalizeArrayInput(subCategoryRecord.list)
            .map((tool, toolIndex) => {
              if (!tool || typeof tool !== 'object') {
                return null
              }
              const toolRecord = tool as Record<string, unknown>
              const toolTitle = String(toolRecord.title || '').trim()
              const toolUrl = String(toolRecord.url || '').trim()
              if (!toolTitle || !toolUrl) {
                return null
              }

              const toolIdRaw = Number(toolRecord.id)
              const toolId =
                Number.isFinite(toolIdRaw) && toolIdRaw > 0
                  ? toolIdRaw
                  : categoryId * 10000 + subCategoryId * 100 + toolIndex + 1

              const toolDesc = String(toolRecord.desc || toolTitle).trim() || toolTitle
              const isExternal = /^https?:\/\//i.test(toolUrl)
              const cate = String(toolRecord.cate || subCategoryTitle).trim() || subCategoryTitle

              const normalizedTool: Tool = {
                id: toolId,
                title: toolTitle,
                logo: normalizeToolLogo(toolRecord.logo),
                desc: toolDesc,
                url: toolUrl,
                cate,
                isExternal
              }
              return normalizedTool
            })
            .filter((tool): tool is Tool => Boolean(tool))

          if (!subCategoryTitle || toolList.length === 0) {
            return null
          }

          const normalizedSubCategory: ToolSubCategory = {
            id: subCategoryId,
            title: subCategoryTitle,
            list: toolList
          }
          return normalizedSubCategory
        })
        .filter((subCategory): subCategory is ToolSubCategory => Boolean(subCategory))

      if (!categoryTitle || subCategories.length === 0) {
        return null
      }

      const normalizedCategory: ToolCategory = {
        id: categoryId,
        title: categoryTitle,
        list: subCategories,
        ...(categoryIcon ? { icon: categoryIcon } : {})
      }
      return normalizedCategory
    })
    .filter((category): category is ToolCategory => Boolean(category))
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
  const dailyGiftPointsRaw = Number(record.loginDailyGiftPoints)
  const toolConsumePointsRaw = Number(record.loginToolConsumePoints)
  const dailyGiftPoints = Number.isFinite(dailyGiftPointsRaw)
    ? Math.max(0, dailyGiftPointsRaw)
    : DEFAULT_SITE_PUBLIC_CONFIG.loginDailyGiftPoints
  const toolConsumePoints = Number.isFinite(toolConsumePointsRaw)
    ? Math.max(1, toolConsumePointsRaw)
    : DEFAULT_SITE_PUBLIC_CONFIG.loginToolConsumePoints
  const memberTrialDaysRaw = Number(record.loginMemberTrialDays)
  const memberTrialDays = Number.isFinite(memberTrialDaysRaw)
    ? Math.max(0, memberTrialDaysRaw)
    : DEFAULT_SITE_PUBLIC_CONFIG.loginMemberTrialDays

  return {
    webName: String(record.webName || DEFAULT_SITE_PUBLIC_CONFIG.webName).trim() || DEFAULT_SITE_PUBLIC_CONFIG.webName,
    webLogo: String(record.webLogo || '').trim(),
    webFavicon: String(record.webFavicon || '').trim(),
    webBackdrop: String(record.webBackdrop || '').trim(),
    ossDomain: String(record.ossDomain || '').trim(),
    userCenterEnabled: normalizeBooleanFlag(record.userCenterEnabled),
    userCenterTitle:
      String(record.userCenterTitle || DEFAULT_SITE_PUBLIC_CONFIG.userCenterTitle).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.userCenterTitle,
    userCenterLink:
      String(record.userCenterLink || DEFAULT_SITE_PUBLIC_CONFIG.userCenterLink).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.userCenterLink,
    loginOpenOtherAuth: normalizeBooleanFlag(record.loginOpenOtherAuth),
    loginOpenWechatAuth: normalizeBooleanFlag(record.loginOpenWechatAuth),
    loginOpenQqAuth: normalizeBooleanFlag(record.loginOpenQqAuth),
    loginWechatAuthorizeUrl: String(record.loginWechatAuthorizeUrl || '').trim(),
    loginQqAuthorizeUrl: String(record.loginQqAuthorizeUrl || '').trim(),
    loginDailyGiftPoints: dailyGiftPoints,
    loginToolConsumePoints: toolConsumePoints,
    loginMemberEnabled: normalizeBooleanFlag(record.loginMemberEnabled),
    loginMemberTrialDays: memberTrialDays,
    bannerSlides: normalizeBannerSlides(record.toolsBannerSlides),
    siteSlogan: String(record.toolsSiteSlogan || DEFAULT_SITE_PUBLIC_CONFIG.siteSlogan).trim() || DEFAULT_SITE_PUBLIC_CONFIG.siteSlogan,
    sidebarBrandLogo: String(record.toolsSidebarBrandLogo || DEFAULT_SITE_PUBLIC_CONFIG.sidebarBrandLogo).trim(),
    sidebarBrandText:
      String(record.toolsSidebarBrandText || DEFAULT_SITE_PUBLIC_CONFIG.sidebarBrandText).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.sidebarBrandText,
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
    sidebarMenuBlocks: normalizeSidebarMenuBlocks(record.toolsSidebarMenuBlocks),
    toolCategories: normalizeToolCategories(record.toolsCategoryTree),
    sidebarBottomLinks: normalizeLinkItems(record.toolsSidebarBottomLinks),
    aiToolboxSidebarMenus: normalizeLinkItems(record.toolsAiToolboxSidebarMenus),
    changelogHeaderLinks: normalizeLinkItems(record.toolsChangelogHeaderLinks),
    changelogIntroText:
      String(record.toolsChangelogIntroText || DEFAULT_SITE_PUBLIC_CONFIG.changelogIntroText).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.changelogIntroText,
    changelogMetaLinks: normalizeLinkItems(record.toolsChangelogMetaLinks),
    changelogSplitTitle:
      String(record.toolsChangelogSplitTitle || DEFAULT_SITE_PUBLIC_CONFIG.changelogSplitTitle).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.changelogSplitTitle,
    changelogSplitDesc:
      String(record.toolsChangelogSplitDesc || DEFAULT_SITE_PUBLIC_CONFIG.changelogSplitDesc).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.changelogSplitDesc,
    changelogSplitLink:
      String(record.toolsChangelogSplitLink || DEFAULT_SITE_PUBLIC_CONFIG.changelogSplitLink).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.changelogSplitLink,
    changelogSplitLinkText:
      String(record.toolsChangelogSplitLinkText || DEFAULT_SITE_PUBLIC_CONFIG.changelogSplitLinkText).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.changelogSplitLinkText,
    changelogStatsText:
      String(record.toolsChangelogStatsText || DEFAULT_SITE_PUBLIC_CONFIG.changelogStatsText).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.changelogStatsText,
    aiChatHeaderLinks: normalizeLinkItems(record.toolsAiChatHeaderLinks),
    aiCommonHeaderLinks: normalizeLinkItems(record.toolsAiCommonHeaderLinks),
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

  if (siteConfigPromise) {
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
