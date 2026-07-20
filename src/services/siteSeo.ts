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
import { getDefaultSitePublicConfig, getSitePublicConfig } from '@/services/siteConfig'

type RouteLike = Pick<RouteLocationNormalizedLoaded | RouteLocationNormalized, 'path' | 'fullPath' | 'meta'>

interface ResolvedSeoPayload {
  title: string
  keywords: string
  description: string
  image: string
}

interface RouteStructuredDataPayload {
  title: string
  description: string
  image: string
  siteName: string
  siteUrl: string
  url: string
}

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
  return (
    flatTools.find((tool) => candidateList.includes(normalizeSeoPath(tool.url))) ||
    null
  )
}

/**
 * 函数说明：按当前路由匹配后台页面 SEO 配置，适用于首页、更新页、登录页等非工具页。
 */
const findPageSeoSource = (siteConfig: SitePublicConfig, route: RouteLike): SiteSeoPageItem | null => {
  const candidateList = buildRouteMatchCandidates(route)
  if (!candidateList.length || !siteConfig.seoPages.length) {
    return null
  }

  return (
    siteConfig.seoPages.find((item) => candidateList.includes(normalizeSeoPath(item.path))) ||
    null
  )
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

/**
 * 函数说明：构建最终文档标题，避免站点名重复拼接。
 */
const buildDocumentTitle = (rawTitle: string, webName: string): string => {
  const title = String(rawTitle || '').trim()
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
  const pageSource = findPageSeoSource(siteConfig, route)
  const webName = siteConfig.webName || import.meta.env.VITE_APP_TITLE || 'UIED Tools'
  const fallbackTitle = pickFirstText(
    pageSource?.title,
    toolSource?.seoTitle,
    routeMeta.title,
    toolSource?.title,
    siteConfig.seoDefaultTitle,
    webName
  )
  const fallbackKeywords = pickFirstText(
    toolSource?.seoKeywords,
    pageSource?.keywords,
    routeMeta.keywords,
    siteConfig.seoDefaultKeywords
  )
  const fallbackDescription = pickFirstText(
    toolSource?.seoDescription,
    pageSource?.description,
    routeMeta.description,
    toolSource?.desc,
    siteConfig.seoDefaultDescription,
    import.meta.env.VITE_APP_DESC,
    'UIED免费在线工具大全'
  )
  const fallbackImage = pickFirstText(
    toolSource?.seoImage,
    pageSource?.image,
    routeMeta.image,
    siteConfig.seoDefaultImage,
    '/favicon.ico'
  )

  return {
    title: buildDocumentTitle(fallbackTitle, webName),
    keywords: fallbackKeywords,
    description: fallbackDescription,
    image: fallbackImage
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

/**
 * 函数说明：为当前路由写入唯一的 WebPage/AboutPage 结构化数据，提升搜索引擎对页面语义的理解。
 */
const upsertRouteStructuredData = (route: RouteLike, payload: RouteStructuredDataPayload): void => {
  let scriptElement = document.querySelector<HTMLScriptElement>('script#site-route-seo-schema')
  if (!scriptElement) {
    scriptElement = document.createElement('script')
    scriptElement.id = 'site-route-seo-schema'
    scriptElement.type = 'application/ld+json'
    document.head.appendChild(scriptElement)
  }

  const pageType = normalizeSeoPath(route.path || '') === '/about' ? 'AboutPage' : 'WebPage'
  scriptElement.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': pageType,
    name: payload.title,
    description: payload.description,
    url: payload.url,
    inLanguage: 'zh-CN',
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: payload.image
    },
    isPartOf: {
      '@type': 'WebSite',
      name: payload.siteName,
      url: payload.siteUrl
    }
  })
}

/**
 * 函数说明：将解析出的 SEO 结果写入 document，统一维护 title、meta、OG、Twitter 与 canonical。
 */
const applyResolvedSeoToDocument = (route: RouteLike, siteConfig: SitePublicConfig, resolvedSeo: ResolvedSeoPayload): void => {
  const siteUrl = String(import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/+$/, '')
  const canonicalPath = normalizeSeoPath(route.fullPath || route.path || '/') || '/'
  const currentUrl = new URL(canonicalPath, `${siteUrl}/`).toString()
  const absoluteImageUrl = /^https?:\/\//i.test(resolvedSeo.image)
    ? resolvedSeo.image
    : `${siteUrl}${resolvedSeo.image.startsWith('/') ? resolvedSeo.image : `/${resolvedSeo.image}`}`
  const siteName = siteConfig.webName || import.meta.env.VITE_APP_TITLE || 'UIED Tools'

  document.title = resolvedSeo.title
  upsertMetaTag('meta[name="keywords"]', 'name', resolvedSeo.keywords)
  upsertMetaTag('meta[name="description"]', 'name', resolvedSeo.description)
  upsertMetaTag('meta[name="robots"]', 'name', 'index,follow,max-image-preview:large')
  upsertMetaTag('meta[property="og:title"]', 'property', resolvedSeo.title)
  upsertMetaTag('meta[property="og:site_name"]', 'property', siteName)
  upsertMetaTag('meta[property="og:description"]', 'property', resolvedSeo.description)
  upsertMetaTag('meta[property="og:type"]', 'property', 'website')
  upsertMetaTag('meta[property="og:locale"]', 'property', 'zh_CN')
  upsertMetaTag('meta[property="og:url"]', 'property', currentUrl)
  upsertMetaTag('meta[property="og:image"]', 'property', absoluteImageUrl)
  upsertMetaTag('meta[name="twitter:card"]', 'name', 'summary_large_image')
  upsertMetaTag('meta[name="twitter:title"]', 'name', resolvedSeo.title)
  upsertMetaTag('meta[name="twitter:description"]', 'name', resolvedSeo.description)
  upsertMetaTag('meta[name="twitter:image"]', 'name', absoluteImageUrl)

  let canonicalElement = document.querySelector('link[rel="canonical"]')
  if (!canonicalElement) {
    canonicalElement = document.createElement('link')
    canonicalElement.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalElement)
  }
  canonicalElement.setAttribute('href', currentUrl)

  upsertRouteStructuredData(route, {
    title: resolvedSeo.title,
    description: resolvedSeo.description,
    image: absoluteImageUrl,
    siteName,
    siteUrl: `${siteUrl}/`,
    url: currentUrl
  })
}

/**
 * 函数说明：使用默认站点配置立即写入 SEO，作为后台配置异步回填前的同步兜底。
 */
export const applyRouteSeoFallback = (route: RouteLike): void => {
  if (typeof document === 'undefined') {
    return
  }
  const siteConfig = getDefaultSitePublicConfig()
  const resolvedSeo = resolveRouteSeoPayload(route, siteConfig)
  applyResolvedSeoToDocument(route, siteConfig, resolvedSeo)
}

/**
 * 函数说明：读取后台站点配置并写入当前路由 SEO，作为最终生效入口。
 */
export const applyRouteSeo = async (route: RouteLike): Promise<void> => {
  if (typeof document === 'undefined') {
    return
  }
  const siteConfig = await getSitePublicConfig()
  const resolvedSeo = resolveRouteSeoPayload(route, siteConfig)
  applyResolvedSeoToDocument(route, siteConfig, resolvedSeo)
}
