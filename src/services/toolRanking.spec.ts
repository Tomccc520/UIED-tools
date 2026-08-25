/**
 * @file toolRanking.spec.ts
 * @description 工具榜单路由归因回归测试
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSitePublicConfig: vi.fn()
}))

vi.mock('./siteConfig', () => ({
  getSitePublicConfig: mocks.getSitePublicConfig
}))

import { getToolRankingList, resolveToolRankingMetaByRoute } from './toolRanking'

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

  it('使用工具主数据修正旧榜单标题并过滤导航页', async () => {
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
          toolUrl: '/tools/ai-perler',
          cateTitle: 'AI图像工具',
          viewCount: 20
        }
      ]
    })
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
  })
})
