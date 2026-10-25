/**
 * @file seoNavigation.spec.ts
 * @description 验证工具异步回调和卸载不会覆盖新路由的统一 SEO。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { getDefaultSitePublicConfig, getSitePublicConfig, type SitePublicConfig } from '@/services/siteConfig'
import { applyRouteSeo, applyRouteSeoFallback } from '@/services/siteSeo'
import HotRanking from './HotRanking.vue'
import Pomodoro from '../Pomodoro/index.vue'

vi.mock('@/services/siteConfig', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/services/siteConfig')>(),
  getSitePublicConfig: vi.fn()
}))
vi.mock('vue-router', async (importOriginal) => ({
  ...await importOriginal<typeof import('vue-router')>(),
  useRoute: () => ({ path: '/tools/pomodoro' })
}))

let view: VueWrapper | undefined
const stubs = { ToolRankingBoard: true, ToolsRecommend: true, UsageGuide: true }

/** 函数说明：读取文档和分享标题，验证两者持续由统一路由 SEO 管理。 */
const readTitles = () => ({
  title: document.title,
  ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content')
})

describe('工具离开页面时的 SEO 归属', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    localStorage.clear()
    vi.mocked(getSitePublicConfig).mockReset()
    vi.mocked(getSitePublicConfig).mockResolvedValue(getDefaultSitePublicConfig())
  })

  afterEach(() => {
    view?.unmount()
    view = undefined
    vi.useRealTimers()
  })

  it('排行榜慢配置在离开页面后完成，不得覆盖新工具标题或分享标题', async () => {
    let finishRequest!: (config: SitePublicConfig) => void
    vi.mocked(getSitePublicConfig).mockImplementationOnce(() => new Promise((resolve) => { finishRequest = resolve }))
    view = mount(HotRanking, { global: { stubs } })
    view.unmount()
    view = undefined

    applyRouteSeoFallback({ path: '/tools/dev/json-format', fullPath: '/tools/dev/json-format', meta: {} })
    const nextPageTitles = readTitles()
    finishRequest({ ...getDefaultSitePublicConfig(), toolRankingPageTitle: '旧页面迟到的标题' })
    await flushPromises()

    expect(readTitles()).toEqual(nextPageTitles)
    expect(nextPageTitles.title).toContain('JSON')
    expect(nextPageTitles.title).toBe(nextPageTitles.ogTitle)
  })

  it('排行榜正文标题更新时保留后台独立配置的 SEO 和 OG 标题', async () => {
    const config = getDefaultSitePublicConfig()
    config.toolRankingPageTitle = '站内热门工具'
    config.seoPages = [{ path: '/tools/hot-ranking', title: '本周热门在线工具推荐', description: '发现本周大家常用的在线工具。', keywords: '', image: '' }]
    vi.mocked(getSitePublicConfig).mockResolvedValue(config)
    await applyRouteSeo({ path: '/tools/hot-ranking', fullPath: '/tools/hot-ranking', meta: {} })
    const configuredTitles = readTitles()

    view = mount(HotRanking, { global: { stubs } })
    await flushPromises()

    expect(view.get('h1').text()).toBe('站内热门工具')
    expect(readTitles()).toEqual(configuredTitles)
    expect(configuredTitles.title).toContain('本周热门在线工具推荐')
    expect(configuredTitles.title).toBe(configuredTitles.ogTitle)
  })

  it('番茄钟卸载时只清理计时器，不得把新工具标题还原成全站标题', async () => {
    vi.useFakeTimers()
    view = mount(Pomodoro, { global: { stubs } })
    const startButton = view.findAll('button').find((button) => button.text() === '开始')!
    await startButton.trigger('click')
    expect(vi.getTimerCount()).toBe(1)

    applyRouteSeoFallback({ path: '/tools/qrcode', fullPath: '/tools/qrcode', meta: {} })
    const nextPageTitles = readTitles()
    view.unmount()
    view = undefined

    expect(vi.getTimerCount()).toBe(0)
    expect(readTitles()).toEqual(nextPageTitles)
    expect(nextPageTitles.title).toContain('二维码')
  })
})
