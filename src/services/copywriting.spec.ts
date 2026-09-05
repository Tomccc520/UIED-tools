/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-30
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchCopywritingText, fetchCopywritingTranslation } from './copywriting'

describe('copywriting service', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('解析 Go 标准响应并保留后端来源标记', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        code: 200,
        msg: '成功',
        data: { text: '备用一言', source: 'fallback' }
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCopywritingText('yiyan')).resolves.toEqual({
      text: '备用一言',
      source: 'fallback'
    })
    expect(fetchMock).toHaveBeenCalledWith('/api/common/copywriting/yiyan', expect.objectContaining({
      method: 'GET',
      headers: { Accept: 'application/json' }
    }))
  })

  it('兼容接口直接返回文案对象', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ text: '肯德基疯狂星期四', source: 'upstream' })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCopywritingText('kfc')).resolves.toEqual({
      text: '肯德基疯狂星期四',
      source: 'upstream'
    })
  })

  it('解析扩展文案元数据并请求同域随机路由', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        code: 200,
        data: { text: '海内存知己。', source: 'upstream', title: '送杜少府之任蜀州', author: '王勃' }
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCopywritingText('daily-poem')).resolves.toEqual({
      text: '海内存知己。',
      source: 'upstream',
      title: '送杜少府之任蜀州',
      author: '王勃'
    })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/common/copywriting/random/daily-poem')
  })

  it('接口失败时抛出后台返回的可读错误', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => ({ code: 502, msg: '文案服务暂不可用' })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCopywritingText('yiyan')).rejects.toThrow('文案服务暂不可用')
  })

  it('通过同域接口解析翻译结果', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ code: 200, data: { text: 'Crazy Thursday at KFC' } })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(fetchCopywritingTranslation('疯狂星期四')).resolves.toBe('Crazy Thursday at KFC')
    expect(fetchMock.mock.calls[0][0]).toContain('/api/common/copywriting/translate?text=')
  })
})
