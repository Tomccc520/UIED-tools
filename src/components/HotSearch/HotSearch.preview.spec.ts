/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'

const cacheKey = 'hot_search_cache_v6'
const wrappers: VueWrapper[] = []
/** 提供真实缓存结构，测试只操作学习组件自己的缓存，不清理其他本地数据。 */
const seedCache = () => localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: {
  learningConfig: { enabled: true, title: '旧学习标题', filterType: 'all', categorySlug: '', categoryIds: '', limit: 20 },
  sections: { learn: [{ title: '缓存文章', url: 'https://uied.cn/old', date: '', hot: 1 }], relax: [], deepseek: [], aigc: [] }
} }))
/** 使用本站公开 RSS 响应形态返回新配置，不访问真实 RSS 或第三方接口。 */
const feedResponse = () => ({ ok: true, json: async () => ({ code: 200, data: {
  config: { enabled: true, title: '后台新学习标题', limit: 8 }, items: [{ title: '新文章', url: 'https://uied.cn/new' }], sections: {}
} }) })
/** 挂载真实学习组件并等待首屏延迟任务，保留其缓存与网络服务实现。 */
const mountLearning = async () => {
  const component = (await import('./HotSearch.vue')).default
  const view = mount(component, { global: { stubs: { RouterLink: { template: '<a><slot /></a>' }, ElIcon: { template: '<span><slot /></span>' } } } })
  wrappers.push(view)
  await vi.advanceTimersByTimeAsync(120)
  await flushPromises()
  return view
}

describe('后台学习内容预览缓存', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    window.history.replaceState({}, '', '/')
    seedCache()
    localStorage.setItem('unrelated-preview-test', 'keep')
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    wrappers.splice(0).forEach(view => view.unmount())
    localStorage.removeItem(cacheKey)
    localStorage.removeItem('unrelated-preview-test')
    window.history.replaceState({}, '', '/')
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('普通首页保留十分钟学习缓存，不额外请求 RSS', async () => {
    const fetchMock = vi.fn().mockResolvedValue(feedResponse())
    vi.stubGlobal('fetch', fetchMock)
    expect((await mountLearning()).text()).toContain('旧学习标题')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('预览跳过旧标题与文章缓存，成功后同次启动重新挂载仍使用新缓存', async () => {
    window.history.replaceState({}, '', '/?_uied_preview=1')
    const fetchMock = vi.fn().mockResolvedValue(feedResponse())
    vi.stubGlobal('fetch', fetchMock)
    const view = await mountLearning()
    expect(view.text()).toContain('后台新学习标题')
    expect(view.text()).not.toContain('旧学习标题')
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/^\/api\/common\/index\/learning-rss\?_uied_learning_ts=\d+$/), expect.objectContaining({ cache: 'no-store' }))
    view.unmount()
    expect((await mountLearning()).text()).toContain('后台新学习标题')
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(localStorage.getItem('unrelated-preview-test')).toBe('keep')
  })

  it('预览请求失败可点击重试，不能重新展示旧缓存冒充最新配置', async () => {
    window.history.replaceState({}, '', '/?_uied_preview=1')
    const fetchMock = vi.fn().mockRejectedValue(new Error('synthetic failure'))
    vi.stubGlobal('fetch', fetchMock)
    const view = await mountLearning()
    expect(view.text()).toContain('今日热榜加载失败，请重试')
    expect(view.text()).not.toContain('旧学习标题')
    fetchMock.mockResolvedValue(feedResponse())
    await view.get('.hot-state__retry').trigger('click')
    await flushPromises()
    expect(view.text()).toContain('后台新学习标题')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('后台关闭学习且返回空列表时也替换旧缓存，重挂载不能恢复旧标题', async () => {
    window.history.replaceState({}, '', '/?_uied_preview=1')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 200, data: { config: { enabled: false, title: '已关闭学习' }, items: [], sections: {} } }) })
    vi.stubGlobal('fetch', fetchMock)
    const first = await mountLearning()
    expect(first.text()).not.toContain('旧学习标题')
    expect(first.text()).not.toContain('缓存文章')
    first.unmount()
    const next = await mountLearning()
    expect(next.text()).not.toContain('旧学习标题')
    expect(next.text()).not.toContain('缓存文章')
    expect(fetchMock).toHaveBeenCalledOnce()
  })
})
