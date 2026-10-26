/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** 构造无敏感数据的公开配置，区分缓存与真实预览读回。 */
const response = (brand: string) => ({ ok: true, status: 200, json: async () => ({ code: 200, data: { loginEnabled: false, toolsSidebarBrandText: brand } }) })

describe('后台公开配置预览', () => {
  beforeEach(() => {
    vi.resetModules()
    window.history.replaceState({}, '', '/')
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    window.history.replaceState({}, '', '/')
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('普通访问继续复用五分钟缓存，不增加公共配置请求', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response('缓存品牌'))
    vi.stubGlobal('fetch', fetchMock)
    const { getSitePublicConfig } = await import('./siteConfig')
    await getSitePublicConfig()
    await getSitePublicConfig()
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('预览标记绕过既有内存缓存，并发消费者只刷新一次，之后继续缓存', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response('旧品牌'))
    vi.stubGlobal('fetch', fetchMock)
    const { getSitePublicConfig } = await import('./siteConfig')
    await getSitePublicConfig()
    window.history.replaceState({}, '', '/tools/qrcode?text=hello&_uied_preview=1#result')
    let complete!: (value: ReturnType<typeof response>) => void
    fetchMock.mockImplementationOnce(() => new Promise(resolve => { complete = resolve }))
    const pending = [getSitePublicConfig(), getSitePublicConfig(), getSitePublicConfig()]
    expect(fetchMock).toHaveBeenCalledTimes(2)
    complete(response('新品牌'))
    const results = await Promise.all(pending)
    expect(results.every(config => config.sidebarBrandText === '新品牌')).toBe(true)
    expect((await getSitePublicConfig()).sidebarBrandText).toBe('新品牌')
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(window.location.search).toBe('?text=hello&_uied_preview=1')
    expect(window.location.hash).toBe('#result')
  })

  it('预览刷新失败不消费刷新机会，后续重试绕过失败兜底缓存', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response('旧品牌'))
    vi.stubGlobal('fetch', fetchMock)
    const { getSitePublicConfig } = await import('./siteConfig')
    await getSitePublicConfig()
    window.history.replaceState({}, '', '/?_uied_preview=1')
    fetchMock.mockRejectedValue(new TypeError('synthetic network failure'))
    await getSitePublicConfig()
    expect(fetchMock).toHaveBeenCalledTimes(3)
    fetchMock.mockResolvedValue(response('重试后品牌'))
    expect((await getSitePublicConfig()).sidebarBrandText).toBe('重试后品牌')
    await getSitePublicConfig()
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('公开配置刷新不会提前消费学习RSS的独立预览刷新机会', async () => {
    window.history.replaceState({}, '', '/?_uied_preview=1')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response('新品牌')))
    const { getSitePublicConfig } = await import('./siteConfig')
    const { needsConfigurationPreviewRefresh } = await import('./configurationPreview')
    await getSitePublicConfig()
    expect(needsConfigurationPreviewRefresh('site-config')).toBe(false)
    expect(needsConfigurationPreviewRefresh('learning-rss')).toBe(true)
  })
})
