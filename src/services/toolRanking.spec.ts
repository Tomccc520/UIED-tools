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

import { resolveToolRankingMetaByRoute } from './toolRanking'

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
})
