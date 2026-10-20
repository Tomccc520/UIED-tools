/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import AINews from './AINews.vue'

const runtime = vi.hoisted(() => ({ getNews: vi.fn(), error: vi.fn() }))
vi.mock('element-plus', () => ({ ElMessage: { error: runtime.error } }))
vi.mock('@/services/rss-news', () => ({
  rssNewsService: { getNews: runtime.getNews },
  NEWS_CATEGORIES: ['全部', 'AI资讯', 'IT之家'],
}))

let view: VueWrapper | undefined

/** 创建可区分分类的资讯，默认日期为固定测试时间。 */
function news(title: string) {
  return { title, url: `https://example.com/${title}`, time: '12:00', date: Date.now(), source: 'IT之家', category: 'IT之家' }
}

/** 挂载真实页面，通过新闻服务替身控制请求先后与失败。 */
function mountNews() {
  view = mount(AINews)
  return view
}

/** 从分类入口切换分类，避免直接修改组件状态掩盖事件链问题。 */
async function selectCategory(label: string) {
  const category = view!.findAll('button').find(item => item.text() === label)
    || view!.findAll('div').find(item => item.text().trim() === label && item.classes().includes('cursor-pointer'))
  if (!category) throw new Error('分类入口不存在')
  await category.trigger('click')
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-21T12:00:00+08:00'))
  vi.clearAllMocks()
  runtime.getNews.mockReset()
  localStorage.clear()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  runtime.getNews.mockResolvedValue([news('初始资讯')])
})
afterEach(() => {
  view?.unmount()
  view = undefined
  document.querySelectorAll('script[type="application/ld+json"]').forEach(node => node.remove())
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('资讯分类与请求反馈', () => {
  it('首次加载后立即切换分类也会加载，不会因冷却清空列表后停住', async () => {
    mountNews()
    await flushPromises()
    runtime.getNews.mockResolvedValueOnce([news('IT分类资讯')])
    await selectCategory('IT之家')
    await flushPromises()
    expect(runtime.getNews).toHaveBeenLastCalledWith('IT之家', 1, 50, false)
    expect(view!.text()).toContain('IT分类资讯')
  })

  it('切换中的旧请求晚返回不能覆盖新分类或提前撤销新请求的加载状态', async () => {
    let resolveOld!: (value: unknown) => void
    let resolveNew!: (value: unknown) => void
    runtime.getNews.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
    mountNews()
    runtime.getNews.mockImplementationOnce(() => new Promise(resolve => { resolveNew = resolve }))
    await selectCategory('AI资讯')
    expect(runtime.getNews).toHaveBeenCalledTimes(2)
    resolveOld([news('过时分类资讯')])
    await flushPromises()
    expect((view!.vm as any).loading).toBe(true)
    expect(view!.text()).not.toContain('过时分类资讯')
    resolveNew([news('当前分类资讯')])
    await flushPromises()
    expect(view!.text()).toContain('当前分类资讯')
    expect((view!.vm as any).loading).toBe(false)
  })

  it('成功的空列表展示空状态，不提示接口失败，完成后没有残留超时定时器', async () => {
    runtime.getNews.mockResolvedValueOnce([])
    mountNews()
    await flushPromises()
    expect(view!.text()).toContain('暂无相关资讯')
    expect(runtime.error).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('失败文案不暴露内部错误，重试入口能重新加载成功', async () => {
    runtime.getNews.mockRejectedValueOnce(new Error('upstream secret /internal/path stack trace'))
    mountNews()
    await flushPromises()
    expect(view!.text()).toContain('资讯加载失败，请重试')
    expect(view!.text()).not.toContain('secret')
    expect(view!.text()).not.toContain('暂无相关资讯')
    runtime.getNews.mockResolvedValueOnce([news('重试成功资讯')])
    await view!.findAll('button').find(item => item.text() === '点击重试')!.trigger('click')
    await flushPromises()
    expect(view!.text()).toContain('重试成功资讯')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('请求超时结束加载，晚到的结果不会在超时后突然重新填充列表', async () => {
    let resolveRequest!: (value: unknown) => void
    runtime.getNews.mockImplementationOnce(() => new Promise(resolve => { resolveRequest = resolve }))
    mountNews()
    await vi.advanceTimersByTimeAsync(30_000)
    await flushPromises()
    expect((view!.vm as any).loading).toBe(false)
    expect(view!.text()).toContain('资讯加载超时，请重试')
    resolveRequest([news('超时后的旧结果')])
    await flushPromises()
    expect(view!.text()).not.toContain('超时后的旧结果')
  })

  it('更新与卸载只清理本页结构化数据，不能删除全站已有 schema', async () => {
    const shared = document.createElement('script')
    shared.type = 'application/ld+json'
    shared.dataset.testSchema = 'site'
    shared.textContent = '{"@type":"WebSite"}'
    document.head.appendChild(shared)
    mountNews()
    await flushPromises()
    expect(shared.isConnected).toBe(true)
    expect(document.querySelector('script[data-ai-news-schema]')).not.toBeNull()
    view!.unmount()
    view = undefined
    expect(shared.isConnected).toBe(true)
    expect(document.querySelector('script[data-ai-news-schema]')).toBeNull()
  })

  it('卸载后晚到的请求不再写入页面 schema，也不遗留超时计时器', async () => {
    let resolveRequest!: (value: unknown) => void
    runtime.getNews.mockImplementationOnce(() => new Promise(resolve => { resolveRequest = resolve }))
    mountNews()
    view!.unmount()
    view = undefined
    expect(vi.getTimerCount()).toBe(0)
    resolveRequest([news('离开后到达')])
    await flushPromises()
    expect(document.querySelector('script[data-ai-news-schema]')).toBeNull()
  })
})
