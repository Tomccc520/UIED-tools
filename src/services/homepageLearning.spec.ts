/**
 * @file homepageLearning.spec.ts
 * @description 首页每日学习数据服务单元测试
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-17
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { getHomepageLearningFeed } from './homepageLearning'

describe('homepageLearning', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('应读取后台分类 ID 配置并标准化 RSS 条目', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 200,
        msg: '成功',
        data: {
          config: {
            enabled: 1,
            title: '每日学习',
            filterType: 'categories',
            categoryIds: '417,3351',
            limit: 2
          },
          items: [
            { title: '文章 A', link: 'https://www.uied.cn/a', pubDate: '2026-07-17' },
            { title: '文章 B', url: 'https://www.uied.cn/b', publishedAt: '2026-07-16' },
            { title: '文章 C', url: 'https://www.uied.cn/c', publishedAt: '2026-07-15' }
          ],
          sections: {
            relax: [{ title: '摸鱼内容', url: 'https://www.uied.cn/relax', date: '2026-07-17' }],
            deepseek: [{ title: 'DeepSeek 教程', url: 'https://www.uied.cn/deepseek' }],
            aigc: [{ title: 'AIGC 学习', url: 'https://www.uied.cn/aigc' }]
          }
        }
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getHomepageLearningFeed()

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/common/index/learning-rss',
      expect.objectContaining({ method: 'GET' })
    )
    expect(result.config).toMatchObject({
      enabled: true,
      filterType: 'categories',
      categoryIds: '417,3351',
      limit: 2
    })
    expect(result.items).toHaveLength(2)
    expect(result.items[0]).toEqual({
      title: '文章 A',
      url: 'https://www.uied.cn/a',
      publishedAt: '2026-07-17'
    })
    expect(result.sections.relax[0].title).toBe('摸鱼内容')
    expect(result.sections.deepseek[0].title).toBe('DeepSeek 教程')
    expect(result.sections.aigc[0].title).toBe('AIGC 学习')
  })

  it('应在后台返回非成功 code 时抛出可读错误', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 500, msg: 'RSS 源暂时不可用' })
    }))

    await expect(getHomepageLearningFeed()).rejects.toThrow('RSS 源暂时不可用')
  })
})
