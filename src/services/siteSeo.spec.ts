/**
 * @file siteSeo.spec.ts
 * @description 站点 SEO 服务单元测试，覆盖关于页元数据和结构化数据输出。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-17
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { applyRouteSeoFallback } from './siteSeo'

describe('siteSeo', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.title = ''
  })

  it('应为关于页输出完整的基础 SEO 与 AboutPage 结构化数据', () => {
    applyRouteSeoFallback({
      path: '/about',
      fullPath: '/about#team',
      meta: {}
    })

    const canonicalUrl = new URL('/about', window.location.origin).toString()
    const schemaElement = document.querySelector<HTMLScriptElement>('script#site-route-seo-schema')
    const schema = JSON.parse(schemaElement?.textContent || '{}')

    expect(document.title).toBe('关于我们 - UIED-Tools')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('了解 UIED Tools 在线工具平台')
    expect(document.querySelector('meta[name="keywords"]')?.getAttribute('content')).toContain('在线工具平台')
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index,follow,max-image-preview:large')
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(canonicalUrl)
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(canonicalUrl)
    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: '关于我们 - UIED-Tools',
      url: canonicalUrl,
      inLanguage: 'zh-CN'
    })
  })

  it('应为 404 页面输出唯一描述并禁止索引', () => {
    applyRouteSeoFallback({
      path: '/404',
      fullPath: '/404',
      meta: {
        title: '页面不存在',
        description: '你访问的页面不存在，返回 UIED Tools 首页或浏览工具分类。',
        keywords: '页面不存在,404,UIED Tools,在线工具',
        robots: 'noindex,nofollow'
      }
    })

    expect(document.title).toBe('页面不存在 - UIED-Tools')
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('你访问的页面不存在')
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex,nofollow')
  })
})
