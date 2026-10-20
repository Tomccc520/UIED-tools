/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { rssNewsService, type NewsItem } from './rss-news'

const service = rssNewsService as any

/** 生成用于区分成功数据与旧缓存的资讯样例。 */
function sample(title: string): NewsItem {
  return { title, url: 'https://example.com/news', date: Date.now(), time: '12:00', source: 'IT之家', category: 'IT之家' }
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
  vi.setSystemTime(new Date('2026-10-21T12:00:00+08:00'))
  localStorage.clear()
  rssNewsService.clearCache()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  clearInterval(service.refreshTimer)
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('RSS 多源结果与超时边界', () => {
  it('全部上游失败必须报错，不把失败伪装成成功的空列表', async () => {
    vi.spyOn(service, 'fetchRSS').mockRejectedValue(new Error('upstream unavailable'))
    await expect(rssNewsService.getNews()).rejects.toThrow('资讯加载失败')
    expect(rssNewsService.getLastError()).toBeInstanceOf(Error)
    expect(service.cache.size).toBe(0)
  })

  it('部分上游失败时仍返回成功来源的真实资讯', async () => {
    vi.spyOn(service, 'fetchRSS').mockImplementation(async (source: any) => {
      if (source.category === 'IT之家') return [sample('可用来源')]
      throw new Error('source unavailable')
    })
    await expect(rssNewsService.getNews()).resolves.toEqual([sample('可用来源')])
    expect(rssNewsService.getLastError()).toBeNull()
  })

  it('来源请求成功但确实没有文章时允许返回空列表', async () => {
    vi.spyOn(service, 'fetchRSS').mockResolvedValue([])
    await expect(rssNewsService.getNews('IT之家')).resolves.toEqual([])
    expect(rssNewsService.getLastError()).toBeNull()
  })

  it('强制刷新失败不覆盖已有的有效缓存', async () => {
    const cached = [sample('有效旧缓存')]
    service.cache.set('all_1_50', { data: cached, timestamp: Date.now() - 60_000 })
    vi.spyOn(service, 'fetchRSS').mockRejectedValue(new Error('network unavailable'))
    await expect(rssNewsService.getNews(undefined, 1, 50, true)).rejects.toThrow()
    expect(service.cache.get('all_1_50').data).toEqual(cached)
  })

  it('获取响应头后仍要限制响应体读取时间，不能提前清除超时', async () => {
    vi.stubGlobal('fetch', vi.fn((_url, options) => Promise.resolve({
      ok: true,
      text: () => new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
      }),
    })))
    let error: Error | undefined
    const request = service.fetchWithRetry('/test-feed', {}, 1).catch((value: Error) => { error = value })
    await flushPromises()
    await vi.advanceTimersByTimeAsync(15_000)
    expect(error?.message).toBe('请求超时')
    await request
    expect(vi.getTimerCount()).toBe(0)
  })

  it('网络立即失败后也会清理超时计时器', async () => {
    const timersBefore = vi.getTimerCount()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await expect(service.fetchWithRetry('/test-feed', {}, 1)).rejects.toThrow('offline')
    expect(vi.getTimerCount()).toBe(timersBefore)
  })
})
