/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchEditorialLibrary, getBundledEditorialLibrary, getDailyEditorialEntry, getEditorialDay } from './editorialCopywriting'

describe('站内文案服务', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('北京时间 00:00 统一换日，同一天的首条保持稳定', () => {
    const before = getEditorialDay(Date.parse('2026-11-12T15:59:59.999Z'))
    const after = getEditorialDay(Date.parse('2026-11-12T16:00:00.000Z'))
    const items = getBundledEditorialLibrary('daily-poem').items
    expect(before.date).toBe('2026-11-12')
    expect(before.nextAt).toBe(Date.parse('2026-11-12T16:00:00.000Z'))
    expect(after.date).toBe('2026-11-13')
    expect(getDailyEditorialEntry(items, before.index).id).not.toBe(getDailyEditorialEntry(items, after.index).id)
    expect(getEditorialDay(Date.parse('2026-11-13T09:00:00Z')).index).toBe(after.index)
  })

  it.each([
    ['daily-poem', { code: 503, data: getBundledEditorialLibrary('daily-poem') }],
    ['daily-poem', { code: 200, data: { updatedAt: '2026-11-13', items: [{ id: 'p1', text: '片段' }, { id: 'p2', text: '缺少出处' }] } }],
    ['dog-diary', { code: 200, data: { updatedAt: '2026-11-13', items: [{ id: 'd1', text: '同一篇' }, { id: 'd2', text: '同一篇' }] } }]
  ] as const)('%s 拒绝错误响应、不完整条目和重复正文', async (kind, payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => payload }))
    await expect(fetchEditorialLibrary(kind)).resolves.toBeNull()
  })

  it('后台同步超时后取消网络请求，继续使用本地内容', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn((_path: string, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new Error('取消同步')), { once: true })
    }))
    vi.stubGlobal('fetch', fetchMock)
    const request = fetchEditorialLibrary('kfc')
    await vi.advanceTimersByTimeAsync(1800)
    await expect(request).resolves.toBeNull()
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/common/copywriting/library/kfc')
    expect(fetchMock.mock.calls[0][1].signal?.aborted).toBe(true)
  })
})
