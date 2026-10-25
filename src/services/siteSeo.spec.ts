/**
 * @file siteSeo.spec.ts
 * @description 站点 SEO 服务单元测试，覆盖关于页元数据和结构化数据输出。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-17
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { SitePublicConfig } from './siteConfig'
import { getDefaultSitePublicConfig, getSitePublicConfig } from './siteConfig'
import { applyRouteSeo, applyRouteSeoFallback } from './siteSeo'

vi.mock('./siteConfig', async (importOriginal) => ({
  ...await importOriginal<typeof import('./siteConfig')>(),
  getSitePublicConfig: vi.fn()
}))

/** 函数说明：构造没有静态 meta 的工具路由，与当前 Vue Router 的注册方式保持一致。 */
const toolRoute = (path: string, fullPath = path) => ({ path, fullPath, meta: {} })

/** 函数说明：读取最终 title、description 与 canonical，验证配置加载前后的工具身份一致。 */
const currentSeo = () => ({
  title: document.title,
  description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
  canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href')
})

/** 函数说明：为测试配置添加一个后台工具目录项，其他配置保持默认值。 */
const configWithTool = (url: string, fields: Record<string, unknown>): SitePublicConfig => ({
  ...getDefaultSitePublicConfig(),
  toolCategories: [{
    id: 1, title: '工具分类', list: [{
      id: 2, title: '工具', list: [{ id: 3, title: '后台工具', desc: '', logo: '', url, ...fields }]
    }]
  }]
})

describe('siteSeo', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.title = ''
    vi.mocked(getSitePublicConfig).mockReset()
    vi.mocked(getSitePublicConfig).mockResolvedValue(getDefaultSitePublicConfig())
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

  it('无 route meta 或后台目录时，两款工具仍有独立标题、描述和自身 canonical', () => {
    applyRouteSeoFallback(toolRoute('/tools/qrcode'))
    const qr = currentSeo()
    expect(qr.title).toBe('免费二维码生成器 - UIED-Tools')
    expect(qr.description).toContain('网址和文本二维码')
    expect(qr.canonical).toBe(new URL('/tools/qrcode', window.location.origin).href)

    applyRouteSeoFallback(toolRoute('/tools/dev/json-format'))
    const json = currentSeo()
    expect(json.title).toBe('JSON 格式化与压缩工具 - UIED-Tools')
    expect(json.description).toContain('保留大整数和小数原值')
    expect(json.canonical).toBe(new URL('/tools/dev/json-format', window.location.origin).href)
    expect(json.title).not.toBe(qr.title)
    expect(json.description).not.toBe(qr.description)
  })

  it('其他已注册工具复用本地目录兜底，不继承全站通用描述', () => {
    applyRouteSeoFallback(toolRoute('/tools/image-compress'))
    expect(document.title).toContain('图片压缩')
    expect(currentSeo().description).toMatch(/图片|JPG|PNG/)
    expect(currentSeo().description).not.toBe('UIED免费在线工具大全')
  })

  it('后台工具和页面中复制的全站泛文案不能覆盖详情页专属兜底', async () => {
    const config = configWithTool('/tools/qrcode', {
      seoTitle: 'UIED免费在线工具大全 - Tools',
      seoDescription: 'UIED免费在线工具大全'
    })
    config.seoDefaultTitle = 'UIED免费在线工具大全'
    config.seoDefaultDescription = 'UIED免费在线工具大全'
    config.seoPages = [{ path: '/tools/qrcode', title: config.seoDefaultTitle, description: config.seoDefaultDescription, keywords: '', image: '' }]
    vi.mocked(getSitePublicConfig).mockResolvedValue(config)

    await applyRouteSeo(toolRoute('/tools/qrcode'))
    expect(document.title).toContain('免费二维码生成器')
    expect(currentSeo().description).toContain('网址和文本二维码')
  })

  it('后台独立维护的工具 SEO 优先于本地兜底', async () => {
    vi.mocked(getSitePublicConfig).mockResolvedValue(configWithTool('/tools/qrcode', {
      seoTitle: '企业品牌二维码在线生成',
      seoDescription: '为企业名片创建带 Logo 的品牌二维码，支持调整尺寸和颜色。'
    }))

    await applyRouteSeo(toolRoute('/tools/qrcode'))
    expect(document.title).toBe('企业品牌二维码在线生成 - UIED-Tools')
    expect(currentSeo().description).toContain('企业名片')
  })

  it('后台请求失败时保留已写入的专属 SEO，不抛出未处理异常', async () => {
    vi.mocked(getSitePublicConfig).mockRejectedValue(new Error('network unavailable'))

    await expect(applyRouteSeo(toolRoute('/tools/dev/json-format'))).resolves.toBeUndefined()
    expect(document.title).toContain('JSON 格式化与压缩工具')
    expect(currentSeo().description).toContain('保留大整数和小数原值')
  })

  it('规范链接不带追踪参数或 hash，仍指向当前工具', async () => {
    await applyRouteSeo(toolRoute('/tools/qrcode', '/tools/qrcode?utm_source=test#preview'))
    expect(currentSeo().canonical).toBe(new URL('/tools/qrcode', window.location.origin).href)
    expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(currentSeo().canonical)
  })

  it('业务 query 对应的工具优先匹配，规范链接保留该业务 query', async () => {
    const config = configWithTool('/tools/ai/work-summary', { seoTitle: '通用工作总结' })
    config.toolCategories[0].list[0].list.push({
      id: 4, title: '年度工作总结', desc: '撰写全年工作成果总结。', logo: '',
      url: '/tools/ai/work-summary?type=annual', seoTitle: '年度工作总结生成器'
    })
    vi.mocked(getSitePublicConfig).mockResolvedValue(config)

    await applyRouteSeo(toolRoute('/tools/ai/work-summary', '/tools/ai/work-summary?type=annual'))
    expect(document.title).toContain('年度工作总结生成器')
    expect(currentSeo().canonical).toBe(new URL('/tools/ai/work-summary?type=annual', window.location.origin).href)
  })

  it('切换路由后的同步 fallback 会使旧页面未完成的配置回填失效', async () => {
    let resolveConfig!: (config: SitePublicConfig) => void
    vi.mocked(getSitePublicConfig).mockImplementationOnce(() => new Promise((resolve) => { resolveConfig = resolve }))
    const oldRequest = applyRouteSeo(toolRoute('/tools/qrcode'))
    applyRouteSeoFallback(toolRoute('/tools/dev/json-format'))
    resolveConfig(configWithTool('/tools/qrcode', { seoTitle: '旧路由的后台二维码标题' }))
    await oldRequest

    expect(document.title).toContain('JSON 格式化与压缩工具')
    expect(currentSeo().canonical).toBe(new URL('/tools/dev/json-format', window.location.origin).href)
  })

  it('并发路由请求仅让最后一页的后台配置生效', async () => {
    let resolveFirst!: (config: SitePublicConfig) => void
    vi.mocked(getSitePublicConfig)
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve }))
      .mockResolvedValueOnce(configWithTool('/tools/dev/json-format', { seoTitle: 'JSON 数据格式校验器' }))
    const first = applyRouteSeo(toolRoute('/tools/qrcode'))
    await applyRouteSeo(toolRoute('/tools/dev/json-format'))
    resolveFirst(configWithTool('/tools/qrcode', { seoTitle: '晚到的二维码标题' }))
    await first

    expect(document.title).toBe('JSON 数据格式校验器 - UIED-Tools')
  })
})
