/**
 * @file toolRanking.spec.ts
 * @description 工具榜单路由归因回归测试
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSitePublicConfig: vi.fn()
}))

vi.mock('./siteConfig', () => ({
  getSitePublicConfig: mocks.getSitePublicConfig
}))

import { buildFallbackToolRankingItems, getToolRankingList, resolveToolRankingMetaByRoute } from './toolRanking'

const toolCategories = [
  {
    id: 1,
    title: 'AI工具箱',
    icon: '',
    list: [
      {
        id: 101,
        title: 'AI图像工具',
        list: [
          {
            id: 10101,
            title: '拼豆图纸生成器',
            logo: { type: 'svg', name: 'aiQrcode' },
            desc: '上传图片生成拼豆图纸',
            url: '/tools/ai-perler',
            cate: 'AI图像工具',
            toolKey: 'ai-perler'
          }
        ]
      }
    ]
  }
]

describe('toolRanking', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mocks.getSitePublicConfig.mockResolvedValue({ toolCategories })
  })

  it('将拼豆专心模式归并到主工具', async () => {
    await expect(resolveToolRankingMetaByRoute('/tools/ai-perler/focus')).resolves.toEqual({
      toolKey: 'ai-perler',
      toolTitle: '拼豆图纸生成器',
      toolUrl: '/tools/ai-perler',
      cateTitle: 'AI图像工具'
    })
  })

  it('不上报工具主数据之外的导航页', async () => {
    await expect(resolveToolRankingMetaByRoute('/tools/ai/toolbox')).resolves.toBeNull()
  })

  it('复用工具主数据补充简介、修正旧榜单标题并过滤导航页', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 200,
      msg: '成功',
      data: {
        period: 'week',
        sortBy: 'view',
        limit: 12,
        list: [
          {
            rank: 1,
            toolKey: 'ai-perler',
            toolTitle: 'ai-perler',
            toolUrl: '/tools/ai-perler',
            cateTitle: '',
            viewCount: 20
          },
          {
            rank: 2,
            toolKey: 'ai-toolbox',
            toolTitle: 'ai-toolbox',
            toolUrl: '/tools/ai/toolbox',
            cateTitle: '',
            viewCount: 10
          }
        ]
      }
    }), { status: 200 }))

    await expect(getToolRankingList({ period: 'week', limit: 12 })).resolves.toMatchObject({
      list: [
        {
          rank: 1,
          toolKey: 'ai-perler',
          toolTitle: '拼豆图纸生成器',
          toolDescription: '上传图片生成拼豆图纸',
          toolUrl: '/tools/ai-perler',
          cateTitle: 'AI图像工具',
          viewCount: 20
        }
      ]
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('工具目录尚未加载时保留接口榜单，避免冷启动空白', async () => {
    mocks.getSitePublicConfig.mockResolvedValue({ toolCategories: [] })
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 200,
      data: {
        period: 'week',
        sortBy: 'view',
        limit: 1,
        list: [
          {
            rank: 1,
            toolKey: 'ai-perler',
            toolTitle: '拼豆图纸生成器',
            toolUrl: '/tools/ai-perler',
            cateTitle: 'AI图像工具',
            viewCount: 20
          }
        ]
      }
    }), { status: 200 }))

    const result = await getToolRankingList({ period: 'week', limit: 1 })
    expect(result.list).toHaveLength(1)
    expect(result.list[0]?.toolTitle).toBe('拼豆图纸生成器')
    expect(result.list[0]?.toolDescription).toBeUndefined()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('兜底推荐直接复用工具简介，保留既有排名和门禁信息', () => {
    const result = buildFallbackToolRankingItems([{
      id: 1,
      title: '拼豆图纸生成器',
      logo: '',
      desc: '  上传图片生成拼豆图纸  ',
      url: '/tools/ai-perler',
      cate: 'AI图像工具',
      toolKey: 'ai-perler',
      status: 0,
      remark: '维护中'
    }])

    expect(result).toMatchObject([{
      rank: 1,
      toolKey: 'ai-perler',
      toolTitle: '拼豆图纸生成器',
      toolDescription: '上传图片生成拼豆图纸',
      toolUrl: '/tools/ai-perler',
      status: 0,
      remark: '维护中'
    }])
  })

  describe('排行榜请求状态', () => {
    it('请求成功时返回真实排行榜数据', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
        code: 200,
        data: {
          period: 'week',
          sortBy: 'view',
          limit: 4,
          list: [{
            rank: 1,
            toolKey: 'ai-perler',
            toolTitle: '拼豆图纸生成器',
            toolUrl: '/tools/ai-perler',
            cateTitle: 'AI图像工具',
            viewCount: 42
          }]
        }
      }), { status: 200 }))

      const result = await getToolRankingList({ period: 'week', limit: 4 })
      expect(result.list).toHaveLength(1)
      expect(result.list[0]?.viewCount).toBe(42)
    })

    it('接口返回空列表时保留明确的空数据结果', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
        code: 200,
        data: { period: 'week', sortBy: 'view', limit: 4, list: [] }
      }), { status: 200 }))

      const result = await getToolRankingList({ period: 'week', limit: 4 })
      expect(result.list).toEqual([])
    })

    it('接口返回失败码时抛出可识别的请求错误', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
        code: 503,
        msg: '排行榜服务暂不可用'
      }), { status: 200 }))

      await expect(getToolRankingList({ period: 'week', limit: 4 })).rejects.toThrow('排行榜服务暂不可用')
    })

    it('请求超过超时时间时抛出超时错误', async () => {
      vi.useFakeTimers()
      vi.stubGlobal('fetch', vi.fn((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const abortError = new Error('aborted')
          abortError.name = 'AbortError'
          reject(abortError)
        })
      })))

      try {
        const request = getToolRankingList({ period: 'week', limit: 4 })
        const result = expect(request).rejects.toThrow('超时')
        await vi.advanceTimersByTimeAsync(8000)
        await result
      } finally {
        vi.useRealTimers()
      }
    })
  })
})

describe('排行榜访问上报去重与失败恢复', () => {
  let trackVisit: typeof import('./toolRanking').trackToolVisitByRoute

  beforeEach(async () => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.resetModules()
    window.sessionStorage.clear()
    mocks.getSitePublicConfig.mockResolvedValue({ toolCategories })
    trackVisit = (await import('./toolRanking')).trackToolVisitByRoute
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('首次上报失败后允许重试，成功后才进入去重窗口', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('network unavailable'))
      .mockResolvedValue(new Response(JSON.stringify({ code: 200, data: {} })))
    await expect(trackVisit('/tools/ai-perler')).rejects.toThrow('network unavailable')
    await trackVisit('/tools/ai-perler')
    await trackVisit('/tools/ai-perler')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('存储写入被拒绝时仍上报，并通过内存避免重复', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError') })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ code: 200, data: {} })))
    await expect(trackVisit('/tools/ai-perler')).resolves.toBeUndefined()
    await trackVisit('/tools/ai-perler')
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('存储读取被拒绝时仍可上报', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('denied', 'SecurityError') })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ code: 200, data: {} })))
    await expect(trackVisit('/tools/ai-perler')).resolves.toBeUndefined()
    await trackVisit('/tools/ai-perler')
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('并发访问共享上报；失败清理在途任务后仍能重试', async () => {
    let rejectRequest!: (error: Error) => void
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockImplementationOnce(() => new Promise<Response>((_resolve, reject) => { rejectRequest = reject }))
      .mockResolvedValue(new Response(JSON.stringify({ code: 200, data: {} })))
    const results = Promise.allSettled([trackVisit('/tools/ai-perler'), trackVisit('/tools/ai-perler')])
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    rejectRequest(new Error('temporarily unavailable'))
    expect((await results).map((result) => result.status)).toEqual(['rejected', 'rejected'])
    await trackVisit('/tools/ai-perler')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('成功去重在十分钟后失效，不会永久屏蔽访问', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ code: 200, data: {} })))
    await trackVisit('/tools/ai-perler')
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000 + 1)
    await trackVisit('/tools/ai-perler')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
