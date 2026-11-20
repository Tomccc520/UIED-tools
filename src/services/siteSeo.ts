/**
 * @file siteSeo.ts
 * @description 站点 SEO 运行时消费服务，统一合并路由静态信息、后台页面配置与工具配置
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import type { RouteLocationNormalizedLoaded, RouteLocationNormalized } from 'vue-router'
import type { SitePublicConfig, SiteSeoPageItem } from '@/services/siteConfig'
import type { Tool, ToolCategory, ToolSubCategory } from '@/types/tools'
import { getDefaultSitePublicConfig, getSitePublicConfig, normalizeToolSeoTitle } from '@/services/siteConfig'
import { getToolsCate } from '@/components/Tools/tools'
import toolSeoOverrides from '@/config/tool-seo-overrides.json'

type RouteLike = Pick<RouteLocationNormalizedLoaded | RouteLocationNormalized, 'path' | 'fullPath' | 'meta'>

interface ResolvedSeoPayload {
  title: string
  keywords: string
  description: string
  image: string
  geoSummary: string
  geoQuestions: string
  canonicalPath: string
}

interface LocalToolSeo {
  title: string
  description: string
  keywords: string
  url: string
}

let seoRequestSerial = 0
const defaultPageSeo = getDefaultSitePublicConfig().seoPages

/**
 * 函数说明：统一规范路由路径，去掉 hash 与末尾斜杠，便于匹配后台 SEO 配置。
 */
const normalizeSeoPath = (input: string): string => {
  const value = String(input || '').trim()
  if (!value) {
    return ''
  }
  const hashlessValue = value.split('#')[0].trim()
  if (!hashlessValue) {
    return ''
  }
  const [pathValue, queryValue = ''] = hashlessValue.split('?')
  const normalizedPath = pathValue !== '/' ? pathValue.replace(/\/+$/, '') : '/'
  return queryValue ? `${normalizedPath}?${queryValue}` : normalizedPath
}

/**
 * 函数说明：生成当前路由的候选匹配键，优先匹配完整路径，再回退到纯 path。
 */
const buildRouteMatchCandidates = (route: RouteLike): string[] => {
  const candidateList = [
    normalizeSeoPath(route.fullPath || ''),
    normalizeSeoPath(route.path || '')
  ].filter(Boolean)

  return [...new Set(candidateList)]
}

/**
 * 函数说明：扁平化工具分类树，便于按路由路径快速查找工具基础信息和 SEO 信息。
 */
const flattenToolCategories = (categories: ToolCategory[]): Tool[] => {
  const toolList: Tool[] = []
  categories.forEach((category: ToolCategory) => {
    category.list.forEach((subCategory: ToolSubCategory) => {
      subCategory.list.forEach((tool: Tool) => {
        toolList.push(tool)
      })
    })
  })
  return toolList
}

/**
 * 函数说明：按当前路由匹配后台工具配置，优先命中完整 fullPath，兼容 query 版工具入口。
 */
const findToolSeoSource = (siteConfig: SitePublicConfig, route: RouteLike): Tool | null => {
  const candidateList = buildRouteMatchCandidates(route)
  if (!candidateList.length || !siteConfig.toolCategories.length) {
    return null
  }

  const flatTools = flattenToolCategories(siteConfig.toolCategories)
  for (const candidate of candidateList) {
    const tool = flatTools.find((item) => normalizeSeoPath(item.url) === candidate)
    if (tool) return tool
  }
  return null
}

let localToolList: Tool[] | null = null

/** 函数说明：从本地工具注册表读取页面专属文案，接口不可用或目录为空时仍保留当前工具身份。 */
const findLocalToolSeo = (route: RouteLike): LocalToolSeo | null => {
  const path = normalizeSeoPath(route.path || '').split('?')[0]
  const override = (toolSeoOverrides as Record<string, Omit<LocalToolSeo, 'url' | 'keywords'> & { keywords?: string }>)[path]
  if (override) return { keywords: override.title, ...override, url: path }
  if (!localToolList) localToolList = flattenToolCategories(getToolsCate())
  for (const candidate of buildRouteMatchCandidates(route)) {
    const tool = localToolList.find((item) => normalizeSeoPath(item.url) === candidate)
    if (tool) {
      return {
        title: tool.title,
        description: tool.desc,
        keywords: [tool.title, tool.cate, '在线工具'].filter(Boolean).join(','),
        url: tool.url
      }
    }
  }
  return null
}

/**
 * 函数说明：按当前路由匹配后台页面 SEO 配置，适用于首页、更新页、登录页等非工具页。
 */
const findPageSeoSource = (pages: SiteSeoPageItem[], route: RouteLike): SiteSeoPageItem | null => {
  const candidateList = buildRouteMatchCandidates(route)
  if (!candidateList.length || !pages.length) {
    return null
  }

  for (const candidate of candidateList) {
    const page = pages.find((item) => normalizeSeoPath(item.path) === candidate)
    if (page) return page
  }
  return null
}

/**
 * 函数说明：返回第一个非空字符串，统一处理 SEO 字段回退顺序。
 */
const pickFirstText = (...values: unknown[]): string => {
  for (const value of values) {
    const text = String(value || '').trim()
    if (text) {
      return text
    }
  }
  return ''
}

/** 函数说明：比较 SEO 文案时忽略大小写和标点，识别旧数据中复制到工具页的站点通用文案。 */
const normalizeSeoComparison = (value: unknown): string => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[\s\p{P}\p{S}]/gu, '')

/** 函数说明：工具详情仅接受独立文案，拒绝全站默认值和常见历史通用标题；非工具页保留原有配置规则。 */
const pickToolSpecificText = (siteConfig: SitePublicConfig, ...values: unknown[]): string => {
  const siteWideValues = [
    siteConfig.webName,
    siteConfig.seoDefaultTitle,
    siteConfig.seoDefaultDescription,
    import.meta.env.VITE_APP_TITLE,
    import.meta.env.VITE_APP_DESC
  ].map(normalizeSeoComparison).filter(Boolean)
  for (const value of values) {
    const text = pickFirstText(value)
    const comparable = normalizeSeoComparison(text)
    if (!comparable || siteWideValues.includes(comparable)) continue
    if (/^(?:uied(?:tools)?|tools)?(?:免费)?(?:在线)?工具(?:大全|集合|集|箱)?(?:tools)?$/.test(comparable)) continue
    return text
  }
  return ''
}

/** 函数说明：移除统计查询参数；仅目录明确声明且与当前入口匹配的业务查询才进入规范链接。 */
const resolveCanonicalPath = (route: RouteLike, declaredPaths: unknown[]): string => {
  const candidates = buildRouteMatchCandidates(route)
  for (const declaredPath of declaredPaths) {
    const normalized = normalizeSeoPath(String(declaredPath || ''))
    if (normalized.includes('?') && candidates.includes(normalized)) return normalized
  }
  return normalizeSeoPath(route.path || '/').split('?')[0] || '/'
}

/**
 * 函数说明：构建最终文档标题，避免站点名重复拼接。
 */
const buildDocumentTitle = (rawTitle: string, webName: string): string => {
  const title = normalizeToolSeoTitle(rawTitle)
  const brand = String(webName || '').trim()
  if (!title) {
    return brand || 'UIED Tools'
  }
  if (!brand) {
    return title
  }
  if (title.includes(brand)) {
    return title
  }
  return `${title} - ${brand}`
}

/**
 * 函数说明：合并后台配置、工具配置与路由静态 meta，生成最终 SEO 结果。
 */
const resolveRouteSeoPayload = (route: RouteLike, siteConfig: SitePublicConfig): ResolvedSeoPayload => {
  const routeMeta = route.meta || {}
  const toolSource = findToolSeoSource(siteConfig, route)
  const pageSource = findPageSeoSource(siteConfig.seoPages, route)
  const defaultPage = findPageSeoSource(defaultPageSeo, route)
  const localSource = findLocalToolSeo(route)
  const isToolPage = String(route.path || '').startsWith('/tools/')
  const webName = siteConfig.webName || import.meta.env.VITE_APP_TITLE || 'UIED Tools'
  const fallbackTitle = isToolPage ? pickToolSpecificText(
    siteConfig,
    pageSource?.title,
    toolSource?.seoTitle,
    routeMeta.title,
    localSource?.title,
    defaultPage?.title,
    toolSource?.title
  ) || webName : pickFirstText(
    pageSource?.title,
    toolSource?.seoTitle,
    routeMeta.title,
    toolSource?.title,
    defaultPage?.title,
    siteConfig.seoDefaultTitle,
    webName
  )
  const fallbackKeywords = pickFirstText(
    toolSource?.seoKeywords,
    pageSource?.keywords,
    routeMeta.keywords,
    localSource?.keywords,
    defaultPage?.keywords,
    siteConfig.seoDefaultKeywords
  )
  const fallbackDescription = isToolPage ? pickToolSpecificText(
    siteConfig,
    toolSource?.seoDescription,
    pageSource?.description,
    routeMeta.description,
    localSource?.description,
    defaultPage?.description,
    toolSource?.desc
  ) : pickFirstText(
    toolSource?.seoDescription,
    pageSource?.description,
    routeMeta.description,
    toolSource?.desc,
    defaultPage?.description,
    siteConfig.seoDefaultDescription,
    import.meta.env.VITE_APP_DESC,
    'UIED免费在线工具大全'
  )
  const fallbackImage = pickFirstText(
    toolSource?.seoImage,
    pageSource?.image,
    routeMeta.image,
    defaultPage?.image,
    siteConfig.seoDefaultImage,
    '/favicon.ico'
  )
  const geoSummary = pickFirstText(toolSource?.geoSummary, fallbackDescription)
  const geoQuestions = pickFirstText(toolSource?.geoQuestions)

  return {
    title: buildDocumentTitle(fallbackTitle, webName),
    keywords: fallbackKeywords,
    description: fallbackDescription,
    image: fallbackImage,
    geoSummary,
    geoQuestions,
    canonicalPath: resolveCanonicalPath(route, [pageSource?.path, toolSource?.url, localSource?.url])
  }
}

/**
 * 函数说明：设置或创建单个 meta 标签，保证 SEO 字段更新有唯一出口。
 */
const upsertMetaTag = (selector: string, attrName: string, attrValue: string): void => {
  let metaElement = document.querySelector(selector)
  if (!metaElement) {
    metaElement = document.createElement('meta')
    if (attrName === 'name') {
      metaElement.setAttribute('name', selector.match(/meta\[name="([^"]+)"\]/)?.[1] || '')
    }
    if (attrName === 'property') {
      metaElement.setAttribute('property', selector.match(/meta\[property="([^"]+)"\]/)?.[1] || '')
    }
    document.head.appendChild(metaElement)
  }
  metaElement.setAttribute('content', attrValue)
}

/** 函数说明：生成当前路由的元数据与结构化数据，供构建和浏览器共用。 */
export const getRouteSeoDocument = (route: RouteLike, origin: string, siteConfig = getDefaultSitePublicConfig()) => {
  const seo = resolveRouteSeoPayload(route, siteConfig)
  const siteUrl = origin.replace(/\/+$/, '')
  const canonical = new URL(seo.canonicalPath, siteUrl + '/').href
  const image = /^https?:\/\//i.test(seo.image) ? seo.image : siteUrl + '/' + seo.image.replace(/^\/+/, '')
  const siteName = siteConfig.webName || import.meta.env.VITE_APP_TITLE || 'UIED Tools'
  const schema = {
    '@context': 'https://schema.org',
    '@type': normalizeSeoPath(route.path || '') === '/about' ? 'AboutPage' : 'WebPage',
    name: seo.title,
    description: seo.description,
    url: canonical,
    inLanguage: 'zh-CN',
    primaryImageOfPage: { '@type': 'ImageObject', url: image },
    isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl + '/' },
    ...(seo.geoSummary ? { abstract: seo.geoSummary } : {}),
    ...(seo.geoQuestions
      ? {
          mainEntity: {
            '@type': 'Question',
            name: seo.geoQuestions.split(/[；;\n]/).map((item) => item.trim()).filter(Boolean)[0] || seo.title,
            acceptedAnswer: { '@type': 'Answer', text: seo.geoSummary || seo.description }
          }
        }
      : {})
  }
  return {
    title: seo.title,
    canonical,
    schema,
    meta: {
      name: {
        keywords: seo.keywords,
        description: seo.description,
        robots: String(route.meta?.robots || '').trim() || 'index,follow,max-image-preview:large',
        'twitter:card': 'summary_large_image',
        'twitter:title': seo.title,
        'twitter:description': seo.description,
        'twitter:image': image
      },
      property: {
        'og:title': seo.title,
        'og:site_name': siteName,
        'og:description': seo.description,
        'og:type': 'website',
        'og:locale': 'zh_CN',
        'og:url': canonical,
        'og:image': image
      }
    }
  }
}

/** 函数说明：把当前路由的 SEO 数据写入浏览器文档。 */
const applyResolvedSeoToDocument = (route: RouteLike, siteConfig: SitePublicConfig): void => {
  const origin = import.meta.env.VITE_APP_URL || window.location.origin
  const { title, canonical, schema, meta } = getRouteSeoDocument(route, origin, siteConfig)
  document.title = title
  for (const [key, value] of Object.entries(meta.name)) {
    upsertMetaTag('meta[name="' + key + '"]', 'name', value)
  }
  for (const [key, value] of Object.entries(meta.property)) {
    upsertMetaTag('meta[property="' + key + '"]', 'property', value)
  }

  let canonicalElement = document.querySelector('link[rel="canonical"]')
  if (!canonicalElement) {
    canonicalElement = document.createElement('link')
    canonicalElement.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalElement)
  }
  canonicalElement.setAttribute('href', canonical)

  let schemaElement = document.querySelector<HTMLScriptElement>('script#site-route-seo-schema')
  if (!schemaElement) {
    schemaElement = document.createElement('script')
    schemaElement.id = 'site-route-seo-schema'
    schemaElement.type = 'application/ld+json'
    document.head.appendChild(schemaElement)
  }
  schemaElement.textContent = JSON.stringify(schema)
}

/**
 * 函数说明：使用默认站点配置立即写入 SEO，作为后台配置异步回填前的同步兜底。
 */
export const applyRouteSeoFallback = (route: RouteLike): void => {
  seoRequestSerial += 1
  if (typeof document === 'undefined') {
    return
  }
  applyResolvedSeoToDocument(route, getDefaultSitePublicConfig())
}

/**
 * 函数说明：读取后台站点配置并写入当前路由 SEO，作为最终生效入口。
 */
export const applyRouteSeo = async (route: RouteLike): Promise<void> => {
  if (typeof document === 'undefined') {
    return
  }
  const requestSerial = ++seoRequestSerial
  applyResolvedSeoToDocument(route, getDefaultSitePublicConfig())
  let siteConfig: SitePublicConfig
  try {
    siteConfig = await getSitePublicConfig()
  } catch {
    // 配置不可用时保留已写入的工具专属兜底，避免拒绝的 Promise 清空元数据。
    return
  }
  if (requestSerial !== seoRequestSerial) {
    return
  }
  applyResolvedSeoToDocument(route, siteConfig)
}
