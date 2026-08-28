/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */

import { describe, expect, it, vi } from 'vitest'
import defaultChangelogTimeline from '@/constants/changelogTimeline'
import { getRequiredSitePublicConfig, normalizeBannerSlides, normalizeChangelogTimeline } from './siteConfig'

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
  it('请求公共配置时应携带防缓存参数并禁用浏览器缓存', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 200, data: {} })
    })
    vi.stubGlobal('fetch', fetchMock)

    await getRequiredSitePublicConfig({ endpoint: '/api/test/config', timeoutMs: 100 })

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0]
    expect(requestUrl).toMatch(/^\/api\/test\/config\?_uied_config_ts=\d+$/)
    expect(requestOptions).toMatchObject({ method: 'GET', cache: 'no-store' })

    vi.unstubAllGlobals()
  })

  it('接口失败时应抛出异常，不得回退成登录关闭配置', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network error'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      getRequiredSitePublicConfig({ endpoint: '/api/test/config', timeoutMs: 100 })
    ).rejects.toThrow('network error')
    expect(fetchMock).toHaveBeenCalledOnce()

    vi.unstubAllGlobals()
  })
})
