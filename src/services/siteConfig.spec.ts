/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import defaultChangelogTimeline from '@/constants/changelogTimeline'
import {
  getRequiredSitePublicConfig,
  getSitePublicConfig,
  getSiteConfigErrorMessage,
  SiteConfigRequestError,
  normalizeBannerSlides,
  normalizeChangelogTimeline,
  normalizeToolSeoTitle
} from './siteConfig'

/** 函数说明：构造包含明确登录策略的公共配置成功响应，用于隔离验证请求与失败关闭契约。 */
const createConfigResponse = (loginEnabled: unknown = false) => ({
  ok: true,
  status: 200,
  json: async () => ({ code: 200, data: { loginEnabled } })
})

describe('normalizeBannerSlides', () => {
  it('会将历史渐变文字广告迁移为 HTML 广告', () => {
    const result = normalizeBannerSlides([
      {
        badge: '推荐',
        text: 'UIED 社区',
        link: 'https://fsuied.com',
        gradient: 'linear-gradient(to right,#111,#fff)'
      }
    ])
    expect(result).toHaveLength(1)
    expect(result[0].renderMode).toBe('html')
    expect(result[0].htmlCode).toContain('UIED 社区')
    expect(result[0].htmlCode).toContain('https://fsuied.com')
  })

  it('会保留有效图片广告并清理危险跳转链接', () => {
    const result = normalizeBannerSlides([
      {
        renderMode: 'image',
        text: '图片广告',
        image: 'https://uiedtool.com/ad.png',
        link: 'javascript:alert(1)',
        target: '_blank',
        height: 96
      }
    ])
    expect(result[0]).toMatchObject({
      renderMode: 'image',
      image: 'https://uiedtool.com/ad.png',
      link: '',
      target: '_blank',
      height: 96
    })
  })
})

describe('normalizeChangelogTimeline', () => {
  it('合并重复版本、同名功能块和重复描述', () => {
    const result = normalizeChangelogTimeline([
      {
        id: 'v1',
        version: '1.0.0',
        date: '2026-08-25',
        badgeText: '发布',
        badgeType: 'success',
        title: '首次发布',
        features: [
          {
            title: '功能更新',
            points: ['新增 <strong>搜索</strong>', '移动端适配']
          }
        ]
      },
      {
        id: 'v1-duplicate',
        version: '1.0.0',
        date: '2026-08-26',
        badgeText: '优化',
        badgeType: 'info',
        title: '重复版本',
        features: [
          {
            title: '功能更新',
            points: ['新增 搜索', '增加版本筛选']
          },
          {
            title: '体验优化</div><div class="legacy">旧结构',
            points: ['移动端适配', '无阴影卡片']
          }
        ]
      }
    ])

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('首次发布')
    expect(result[0].features).toEqual([
      {
        title: '功能更新',
        points: ['新增 <strong>搜索</strong>', '移动端适配', '增加版本筛选']
      },
      {
        title: '体验优化',
        points: ['无阴影卡片']
      }
    ])
  })

  it('默认时间线不再返回重复版本', () => {
    const result = normalizeChangelogTimeline(defaultChangelogTimeline)
    const versions = result.map((item) => item.version.toLowerCase())
    expect(new Set(versions).size).toBe(versions.length)
    expect(versions.filter((version) => version === '1.1.8')).toHaveLength(1)
    expect(versions.filter((version) => version === '1.1.4')).toHaveLength(1)
  })
})

describe('getRequiredSitePublicConfig', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('请求公共配置时应携带防缓存参数并禁用浏览器缓存', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createConfigResponse())
    vi.stubGlobal('fetch', fetchMock)

    await getRequiredSitePublicConfig({ endpoint: '/api/test/config', timeoutMs: 100 })

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0]
    expect(requestUrl).toMatch(/^\/api\/test\/config\?_uied_config_ts=\d+$/)
    expect(requestOptions).toMatchObject({ method: 'GET', cache: 'no-store' })

  })

  it('网络持续失败时只重试一次并抛错，不得回退成登录关闭配置', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network error'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      getRequiredSitePublicConfig({ endpoint: '/api/test/config', timeoutMs: 100 })
    ).rejects.toMatchObject({ kind: 'network' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(console.warn).toHaveBeenCalledWith('[site-config] 站点配置请求失败', {
      kind: 'network', httpStatus: 0, attempts: 2
    })
  })

  it('短暂断网后自动重试成功，仍使用接口返回的真实登录策略', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(createConfigResponse(true))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRequiredSitePublicConfig()).resolves.toMatchObject({ loginEnabled: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(console.warn).not.toHaveBeenCalled()
  })

  it('并发工具校验与页面配置读取共享同一在途请求', async () => {
    let resolveRequest!: (response: ReturnType<typeof createConfigResponse>) => void
    const fetchMock = vi.fn(() => new Promise((resolve) => { resolveRequest = resolve }))
    vi.stubGlobal('fetch', fetchMock)

    const display = getSitePublicConfig({ forceRefresh: true })
    const first = getRequiredSitePublicConfig()
    const second = getRequiredSitePublicConfig()
    expect(fetchMock).toHaveBeenCalledOnce()
    resolveRequest(createConfigResponse(true))
    const results = await Promise.all([display, first, second])
    expect(results.every((result) => result.loginEnabled)).toBe(true)
  })

  it('连续操作重新获取策略，不复用上一次成功读取的免登录配置', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(createConfigResponse(false))
      .mockResolvedValueOnce(createConfigResponse(true))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRequiredSitePublicConfig()).resolves.toMatchObject({ loginEnabled: false })
    await expect(getRequiredSitePublicConfig()).resolves.toMatchObject({ loginEnabled: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('展示失败的默认配置不能作为工具运行的可信策略', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getSitePublicConfig({ forceRefresh: true })).resolves.toMatchObject({ loginEnabled: false })
    await expect(getRequiredSitePublicConfig()).rejects.toMatchObject({ kind: 'network' })
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('临时 503 可重试恢复，权限失败不重复请求', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce(createConfigResponse())
      .mockResolvedValueOnce({ ok: false, status: 403 })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRequiredSitePublicConfig()).resolves.toMatchObject({ loginEnabled: false })
    await expect(getRequiredSitePublicConfig()).rejects.toMatchObject({ kind: 'http', httpStatus: 403 })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it.each([300, 403, 500])('HTTP 200 的业务 code=%s 必须拒绝，不能转换成免费模式', async (code) => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code, msg: 'internal server details', data: [] })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRequiredSitePublicConfig()).rejects.toMatchObject({ kind: 'business' })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain('internal server details')
  })

  it.each([null, [], {}, { loginEnabled: null }, { loginEnabled: 'invalid' }])(
    '配置数据 %j 缺少有效登录开关时不能放行工具', async (data) => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 200, data }) })
      vi.stubGlobal('fetch', fetchMock)

      await expect(getRequiredSitePublicConfig()).rejects.toMatchObject({ kind: 'invalid-response' })
      expect(fetchMock).toHaveBeenCalledOnce()
    }
  )

  it('超时最多两次后终止，并允许下一次点击重新发起请求', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    }))
    vi.stubGlobal('fetch', fetchMock)

    const pending = getRequiredSitePublicConfig({ timeoutMs: 100 })
    const rejected = expect(pending).rejects.toMatchObject({ kind: 'timeout' })
    await vi.advanceTimersByTimeAsync(200)
    await rejected
    expect(fetchMock).toHaveBeenCalledTimes(2)

    fetchMock.mockImplementationOnce(async () => createConfigResponse(true))
    await expect(getRequiredSitePublicConfig({ timeoutMs: 100 })).resolves.toMatchObject({ loginEnabled: true })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('非法 JSON 不伪装成网络故障，也不会自动重复请求', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, json: async () => { throw new SyntaxError('unexpected HTML') }
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getRequiredSitePublicConfig()).rejects.toMatchObject({ kind: 'invalid-response' })
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('错误提示区分超时、网络和服务异常，不显示服务端内部内容', () => {
    expect(getSiteConfigErrorMessage(new SiteConfigRequestError('timeout'))).toBe('站点配置请求超时，请重试')
    expect(getSiteConfigErrorMessage(new SiteConfigRequestError('network'))).toContain('无法连接')
    expect(getSiteConfigErrorMessage(new SiteConfigRequestError('invalid-response'))).toContain('响应异常')
    expect(getSiteConfigErrorMessage(new SiteConfigRequestError('http', 500))).toContain('服务暂时不可用')
    expect(getSiteConfigErrorMessage(new Error('private details'))).not.toContain('private details')
  })

})

describe('normalizeToolSeoTitle', () => {
  it('应清理历史配置中的重复 SEO 固定短语', () => {
    expect(normalizeToolSeoTitle('色彩对比度检测｜在线工具在线工具')).toBe('色彩对比度检测｜在线工具')
    expect(normalizeToolSeoTitle('在线工具大全工具大全')).toBe('在线工具大全')
  })
})
