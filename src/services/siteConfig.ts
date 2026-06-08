/**
 * @file siteConfig.ts
 * @description 站点公共配置读取服务，统一对接 likeadmin-go 公共配置接口
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */

import defaultChangelogTimeline from '../constants/changelogTimeline'
import type { Tool, ToolCategory, ToolSubCategory } from '@/types/tools'

export interface SiteLinkItem {
  name: string
  link: string
}

export interface SiteQuickToolItem {
  title: string
  url: string
  desc?: string
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

export interface SiteSeoPageItem {
  path: string
  title: string
  keywords: string
  description: string
  image: string
}

export interface SiteLoginToolConsumeRule {
  toolKey: string
  name: string
  consumePoints: number
  memberFree: boolean
  status: number
  sort: number
  remark: string
  needLogin?: boolean
  commercialTier?: string
  memberCore?: boolean
  policyVersion?: string
}

export interface SiteChangelogFeatureItem {
  title: string
  points: string[]
}

export interface SiteChangelogTimelineItem {
  id: string
  version: string
  date: string
  badgeText: string
  badgeType: string
  title: string
  features: SiteChangelogFeatureItem[]
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
  loginToolConsumeRules: SiteLoginToolConsumeRule[]
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
  toolRankingEnabled: boolean
  toolRankingPageTitle: string
  toolRankingPageDescription: string
  toolRankingDefaultPeriod: 'day' | 'week' | 'month' | 'all'
  toolRankingPageLimit: number
  toolRankingShowOnSidebar: boolean
  toolRankingSidebarTitle: string
  toolRankingSidebarPeriod: 'day' | 'week' | 'month' | 'all'
  headerLinks: SiteLinkItem[]
  searchQuickTools: SiteQuickToolItem[]
  searchProviderLabel: string
  searchProviderLink: string
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
  changelogTimeline: SiteChangelogTimelineItem[]
  aiChatHeaderLinks: SiteLinkItem[]
  aiCommonHeaderLinks: SiteLinkItem[]
  footerQuickSections: SiteLinkSection[]
  footerFriendSections: SiteLinkSection[]
  officialMediaLinks: SiteLinkItem[]
  seoDefaultTitle: string
  seoDefaultKeywords: string
  seoDefaultDescription: string
  seoDefaultImage: string
  seoPages: SiteSeoPageItem[]
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
  loginToolConsumeRules: [],
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
  toolRankingEnabled: true,
  toolRankingPageTitle: '站内工具使用排行榜',
  toolRankingPageDescription: '这是工具热榜的独立页面，按站内真实点击量排行，帮助运营快速判断哪些工具最受欢迎。',
  toolRankingDefaultPeriod: 'week',
  toolRankingPageLimit: 12,
  toolRankingShowOnSidebar: true,
  toolRankingSidebarTitle: '本周热榜',
  toolRankingSidebarPeriod: 'week',
  headerLinks: [],
  searchQuickTools: [
    {
      title: 'DeepSeek R1对话',
      desc: '基于 DeepSeek-R1 推理模型的智能对话',
      url: '/tools/ai/deepseek-r1'
    },
    {
      title: 'DeepSeek AI对话',
      desc: '基础智能对话服务',
      url: '/tools/ai/deepseek'
    },
    {
      title: 'DeepSeek提示词',
      desc: '专业的 Prompt 提示词指南',
      url: '/tools/ai/deepseek-prompt'
    },
    {
      title: 'DeepSeek导航',
      desc: 'DeepSeek 模型与工具导航',
      url: '/tools/ai/deepseek-nav'
    },
    {
      title: 'AI封面设计',
      desc: 'AI智能生成封面图片',
      url: '/tools/ai-design-cover'
    },
    {
      title: 'AI产品榜',
      desc: '跳转至 AI 产品导航站',
      url: 'https://hao.uied.cn/'
    }
  ],
  searchProviderLabel: '硅基流动 x 华为云联合 SiliconFlow',
  searchProviderLink: 'https://cloud.siliconflow.cn/i/AZywGNhl',
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
  changelogTimeline: (defaultChangelogTimeline as SiteChangelogTimelineItem[]).map((item) => ({
    ...item,
    features: Array.isArray(item.features)
      ? item.features.map((feature) => ({
          title: String(feature.title || '').trim(),
          points: Array.isArray(feature.points)
            ? feature.points.map((point) => String(point || '').trim()).filter(Boolean)
            : []
        }))
      : []
  })),
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
  officialMediaLinks: [],
  seoDefaultTitle: '',
  seoDefaultKeywords:
    '免费在线工具,UIED,UIED-Tools,免费AI工具箱,AI工具,AI工具箱,AI工具大全,AI工具网站,AI工具网站大全,AI工具网站推荐,AI工具网站排行榜',
  seoDefaultDescription: 'UIED免费在线工具大全',
  seoDefaultImage: '/logo.png',
  seoPages: [
    {
      path: '/',
      title: '首页',
      keywords: 'tools-web,在线工具,开发人员工具,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
      description: 'tools-web,在线工具,在线工具大全,开发人员工具,日常生活工具,办公助手,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
      image: '/logo.png'
    },
    {
      path: '/changelog',
      title: '更新日志',
      keywords: 'UIED-Tools更新日志,版本历史,功能更新',
      description: 'UIED-Tools的更新日志，记录了所有版本的功能更新和变更信息',
      image: '/logo.png'
    },
    {
      path: '/user/login',
      title: '用户登录',
      keywords: '用户登录,QQ登录,微信登录,个人中心',
      description: 'UIED Tools 用户登录页，支持登录后进入个人中心，管理账号资料与QQ邮箱绑定。',
      image: '/logo.png'
    },
    {
      path: '/user/center',
      title: '个人中心',
      keywords: '个人中心,QQ邮箱绑定,用户资料',
      description: 'UIED Tools 个人中心，支持维护昵称与QQ邮箱绑定信息。',
      image: '/logo.png'
    },
    {
      path: '/tools/ai/toolbox',
      title: 'AI工具箱',
      keywords: 'AI工具箱,AI工具导航,AI工具合集,免费AI工具',
      description: 'UIED Tools AI工具箱聚合页，按分类整合对话、写作、图像、办公等高频 AI 工具。',
      image: '/logo.png'
    }
  ]
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
 * 函数说明：标准化工具排行榜周期，避免后台脏值导致请求参数与页面展示不一致。
 */
const normalizeSiteToolRankingPeriod = (
  input: unknown,
  fallback: SitePublicConfig['toolRankingDefaultPeriod'] = DEFAULT_SITE_PUBLIC_CONFIG.toolRankingDefaultPeriod
): SitePublicConfig['toolRankingDefaultPeriod'] => {
  const normalized = String(input || '').trim()
  return normalized === 'day' || normalized === 'week' || normalized === 'month' || normalized === 'all'
    ? normalized
    : fallback
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
 * 函数说明：清洗搜索面板快捷入口配置，兼容 title/name 与 url/link 字段。
 */
const normalizeQuickToolItems = (input: unknown): SiteQuickToolItem[] => {
  const parsed = normalizeArrayInput(input)
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const title = String(record.title || record.name || '').trim()
      const url = String(record.url || record.link || '').trim()
      const desc = String(record.desc || record.description || '').trim()
      if (!title || !url) {
        return null
      }
      return {
        title,
        url,
        ...(desc ? { desc } : {})
      }
    })
    .filter((item): item is SiteQuickToolItem => Boolean(item))

  if (parsed.length > 0) {
    return parsed
  }
  return DEFAULT_SITE_PUBLIC_CONFIG.searchQuickTools.map((item) => ({ ...item }))
}

/**
 * 函数说明：清洗更新记录页时间线功能块，统一标题与要点格式。
 */
const normalizeChangelogFeatureItems = (input: unknown): SiteChangelogFeatureItem[] => {
  return normalizeArrayInput(input)
    .map((feature) => {
      if (!feature || typeof feature !== 'object') {
        return null
      }
      const record = feature as Record<string, unknown>
      const title = String(record.title || '').trim()
      const points = normalizeArrayInput(record.points)
        .map((point) => String(point || '').trim())
        .filter(Boolean)
      if (!title || points.length === 0) {
        return null
      }
      return { title, points }
    })
    .filter((feature): feature is SiteChangelogFeatureItem => Boolean(feature))
}

/**
 * 函数说明：清洗更新记录页时间线配置，兼容后台 JSON 与默认数据兜底。
 */
const normalizeChangelogTimeline = (input: unknown): SiteChangelogTimelineItem[] => {
  const parsed = normalizeArrayInput(input)
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const version = String(record.version || '').trim()
      const date = String(record.date || '').trim()
      const title = String(record.title || '').trim()
      const badgeText = String(record.badgeText || '').trim()
      const badgeType = String(record.badgeType || '').trim() || 'info'
      const features = normalizeChangelogFeatureItems(record.features)
      const id =
        String(record.id || '').trim() ||
        `version-${String(version || index + 1)
          .trim()
          .replace(/[^\w-]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .toLowerCase()}`
      if (!version || !date || !title || features.length === 0) {
        return null
      }
      return {
        id,
        version,
        date,
        badgeText,
        badgeType,
        title,
        features
      }
    })
    .filter((item): item is SiteChangelogTimelineItem => Boolean(item))

  if (parsed.length > 0) {
    return parsed
  }
  return DEFAULT_SITE_PUBLIC_CONFIG.changelogTimeline.map((item) => ({
    ...item,
    features: item.features.map((feature) => ({
      title: feature.title,
      points: [...feature.points]
    }))
  }))
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
 * 函数说明：清洗站点 SEO 页面配置，兼容后台 JSON 结构并过滤无效项
 */
const normalizeSeoPages = (input: unknown): SiteSeoPageItem[] => {
  const parsed = normalizeArrayInput(input)
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const path = String(record.path || '').trim()
      const title = String(record.title || '').trim()
      const keywords = String(record.keywords || '').trim()
      const description = String(record.description || '').trim()
      const image = String(record.image || '').trim()
      if (!path) {
        return null
      }
      return {
        path,
        title,
        keywords,
        description,
        image
      }
    })
    .filter((item): item is SiteSeoPageItem => Boolean(item))

  if (parsed.length > 0) {
    return parsed
  }
  return DEFAULT_SITE_PUBLIC_CONFIG.seoPages.map((item) => ({ ...item }))
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
 * 函数说明：清洗登录配置中的按工具计费规则，供前台拦截层读取 status/consumePoints。
 */
const normalizeLoginToolConsumeRules = (input: unknown): SiteLoginToolConsumeRule[] => {
  return normalizeArrayInput(input)
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const record = item as Record<string, unknown>
      const toolKey = String(record.toolKey || '').trim().toLowerCase()
      if (!toolKey) {
        return null
      }
      const consumePointsRaw = Number(record.consumePoints)
      const sortRaw = Number(record.sort)
      return {
        toolKey,
        name: String(record.name || '').trim() || toolKey,
        consumePoints: Number.isFinite(consumePointsRaw) ? Math.max(0, Math.floor(consumePointsRaw)) : 1,
        memberFree: normalizeBooleanFlag(record.memberFree ?? true),
        status: Number(record.status ?? 1) === 0 ? 0 : 1,
        sort: Number.isFinite(sortRaw) ? Math.max(0, Math.floor(sortRaw)) : index + 1,
        remark: String(record.remark || '').trim(),
        ...(record.needLogin !== undefined ? { needLogin: normalizeBooleanFlag(record.needLogin) } : {}),
        ...(record.commercialTier ? { commercialTier: String(record.commercialTier || '').trim() } : {}),
        ...(record.memberCore !== undefined ? { memberCore: normalizeBooleanFlag(record.memberCore) } : {}),
        ...(record.policyVersion ? { policyVersion: String(record.policyVersion || '').trim() } : {})
      } as SiteLoginToolConsumeRule
    })
    .filter((item): item is SiteLoginToolConsumeRule => Boolean(item))
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
              const releaseDate = String(toolRecord.releaseDate || '').trim()
              const icon = String(toolRecord.icon || '').trim()
              const gradient = String(toolRecord.gradient || '').trim()
              const badge = String(toolRecord.badge || '').trim()
              const text = String(toolRecord.text || '').trim()
              const seoTitle = String(toolRecord.seoTitle || '').trim()
              const seoKeywords = String(toolRecord.seoKeywords || '').trim()
              const seoDescription = String(toolRecord.seoDescription || '').trim()
              const seoImage = String(toolRecord.seoImage || '').trim()
              const toolKey = String(toolRecord.toolKey || '').trim().toLowerCase()
              const consumePointsRaw = Number(toolRecord.consumePoints)
              const consumePoints =
                Number.isFinite(consumePointsRaw) ? Math.max(0, Math.floor(consumePointsRaw)) : undefined
              const memberFree = toolRecord.memberFree !== undefined ? normalizeBooleanFlag(toolRecord.memberFree) : undefined
              const statusRaw = Number(toolRecord.status)
              const status = Number.isFinite(statusRaw) ? (statusRaw === 0 ? 0 : 1) : undefined
              const sortRaw = Number(toolRecord.sort)
              const sort = Number.isFinite(sortRaw) ? Math.max(0, Math.floor(sortRaw)) : undefined
              const remark = String(toolRecord.remark || '').trim()
              const needLogin =
                toolRecord.needLogin !== undefined ? normalizeBooleanFlag(toolRecord.needLogin) : undefined
              const allowAnonymousPreview =
                toolRecord.allowAnonymousPreview !== undefined
                  ? normalizeBooleanFlag(toolRecord.allowAnonymousPreview)
                  : undefined
              const anonymousQuotaRaw = Number(toolRecord.anonymousQuota)
              const anonymousQuota =
                Number.isFinite(anonymousQuotaRaw) ? Math.max(0, Math.floor(anonymousQuotaRaw)) : undefined
              const commercialTierRaw = String(toolRecord.commercialTier || '').trim()
              const commercialTier =
                commercialTierRaw === 'premium' || commercialTierRaw === 'standard' || commercialTierRaw === 'free'
                  ? commercialTierRaw
                  : undefined
              const memberCore =
                toolRecord.memberCore !== undefined ? normalizeBooleanFlag(toolRecord.memberCore) : undefined
              const policyVersion = String(toolRecord.policyVersion || '').trim()
              const tags = normalizeArrayInput(toolRecord.tags)
                .map((tag) => String(tag || '').trim())
                .filter(Boolean)
              const isNew = normalizeBooleanFlag(toolRecord.isNew)

              const normalizedTool: Tool = {
                id: toolId,
                title: toolTitle,
                logo: normalizeToolLogo(toolRecord.logo),
                desc: toolDesc,
                url: toolUrl,
                cate,
                isExternal,
                ...(releaseDate ? { releaseDate } : {}),
                ...(tags.length > 0 ? { tags } : {}),
                ...(icon ? { icon } : {}),
                ...(isNew ? { isNew } : {}),
                ...(gradient ? { gradient } : {}),
                ...(badge ? { badge } : {}),
                ...(text ? { text } : {}),
                ...(seoTitle ? { seoTitle } : {}),
                ...(seoKeywords ? { seoKeywords } : {}),
                ...(seoDescription ? { seoDescription } : {}),
                ...(seoImage ? { seoImage } : {}),
                ...(toolKey ? { toolKey } : {}),
                ...(consumePoints !== undefined ? { consumePoints } : {}),
                ...(memberFree !== undefined ? { memberFree } : {}),
                ...(status !== undefined ? { status } : {}),
                ...(sort !== undefined ? { sort } : {}),
                ...(remark ? { remark } : {}),
                ...(needLogin !== undefined ? { needLogin } : {}),
                ...(allowAnonymousPreview !== undefined ? { allowAnonymousPreview } : {}),
                ...(anonymousQuota !== undefined ? { anonymousQuota } : {}),
                ...(commercialTier ? { commercialTier } : {}),
                ...(memberCore !== undefined ? { memberCore } : {}),
                ...(policyVersion ? { policyVersion } : {})
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
  const toolRankingPageLimitRaw = Number(record.toolsToolRankingPageLimit)
  const dailyGiftPoints = Number.isFinite(dailyGiftPointsRaw)
    ? Math.max(0, dailyGiftPointsRaw)
    : DEFAULT_SITE_PUBLIC_CONFIG.loginDailyGiftPoints
  const toolConsumePoints = Number.isFinite(toolConsumePointsRaw)
    ? Math.max(1, toolConsumePointsRaw)
    : DEFAULT_SITE_PUBLIC_CONFIG.loginToolConsumePoints
  const toolRankingPageLimit = Number.isFinite(toolRankingPageLimitRaw)
    ? Math.min(20, Math.max(1, Math.floor(toolRankingPageLimitRaw)))
    : DEFAULT_SITE_PUBLIC_CONFIG.toolRankingPageLimit
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
    loginToolConsumeRules: normalizeLoginToolConsumeRules(record.loginToolConsumeRules),
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
    toolRankingEnabled: normalizeBooleanFlag(record.toolsToolRankingEnabled ?? DEFAULT_SITE_PUBLIC_CONFIG.toolRankingEnabled),
    toolRankingPageTitle:
      String(record.toolsToolRankingPageTitle || DEFAULT_SITE_PUBLIC_CONFIG.toolRankingPageTitle).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.toolRankingPageTitle,
    toolRankingPageDescription:
      String(record.toolsToolRankingPageDescription || DEFAULT_SITE_PUBLIC_CONFIG.toolRankingPageDescription).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.toolRankingPageDescription,
    toolRankingDefaultPeriod: normalizeSiteToolRankingPeriod(
      record.toolsToolRankingDefaultPeriod,
      DEFAULT_SITE_PUBLIC_CONFIG.toolRankingDefaultPeriod
    ),
    toolRankingPageLimit,
    toolRankingShowOnSidebar: normalizeBooleanFlag(
      record.toolsToolRankingShowOnSidebar ?? DEFAULT_SITE_PUBLIC_CONFIG.toolRankingShowOnSidebar
    ),
    toolRankingSidebarTitle:
      String(record.toolsToolRankingSidebarTitle || DEFAULT_SITE_PUBLIC_CONFIG.toolRankingSidebarTitle).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.toolRankingSidebarTitle,
    toolRankingSidebarPeriod: normalizeSiteToolRankingPeriod(
      record.toolsToolRankingSidebarPeriod,
      DEFAULT_SITE_PUBLIC_CONFIG.toolRankingSidebarPeriod
    ),
    headerLinks: normalizeLinkItems(record.toolsHeaderLinks),
    searchQuickTools: normalizeQuickToolItems(record.toolsSearchQuickTools),
    searchProviderLabel:
      String(record.toolsSearchProviderLabel || DEFAULT_SITE_PUBLIC_CONFIG.searchProviderLabel).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.searchProviderLabel,
    searchProviderLink:
      String(record.toolsSearchProviderLink || DEFAULT_SITE_PUBLIC_CONFIG.searchProviderLink).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.searchProviderLink,
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
    changelogTimeline: normalizeChangelogTimeline(record.toolsChangelogTimeline),
    aiChatHeaderLinks: normalizeLinkItems(record.toolsAiChatHeaderLinks),
    aiCommonHeaderLinks: normalizeLinkItems(record.toolsAiCommonHeaderLinks),
    footerQuickSections: normalizeLinkSections(record.toolsFooterQuickSections),
    footerFriendSections: normalizeLinkSections(record.toolsFooterFriendSections),
    officialMediaLinks: normalizeLinkItems(record.toolsOfficialMediaLinks),
    seoDefaultTitle: String(record.toolsSeoDefaultTitle || DEFAULT_SITE_PUBLIC_CONFIG.seoDefaultTitle).trim(),
    seoDefaultKeywords:
      String(record.toolsSeoDefaultKeywords || DEFAULT_SITE_PUBLIC_CONFIG.seoDefaultKeywords).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.seoDefaultKeywords,
    seoDefaultDescription:
      String(record.toolsSeoDefaultDescription || DEFAULT_SITE_PUBLIC_CONFIG.seoDefaultDescription).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.seoDefaultDescription,
    seoDefaultImage:
      String(record.toolsSeoDefaultImage || DEFAULT_SITE_PUBLIC_CONFIG.seoDefaultImage).trim() ||
      DEFAULT_SITE_PUBLIC_CONFIG.seoDefaultImage,
    seoPages: normalizeSeoPages(record.toolsSeoPages)
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
