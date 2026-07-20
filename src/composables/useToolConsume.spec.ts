/**
 * @file useToolConsume.spec.ts
 * @description 工具登录与积分门禁单元测试，覆盖前台登录总开关的免登录放行行为。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-17
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  consumeFrontendUserPoints: vi.fn(),
  dispatchFrontendUserLoginPrompt: vi.fn(),
  getSitePublicConfig: vi.fn(),
  isFrontendUserLoggedIn: vi.fn(),
  trackToolRankingEvent: vi.fn(),
  warning: vi.fn()
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    warning: mocks.warning
  }
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ path: '/tools/ai/ocr', fullPath: '/tools/ai/ocr' }),
  useRouter: () => ({ push: vi.fn() })
}))

vi.mock('@/services/frontendUser', () => ({
  consumeFrontendUserPoints: mocks.consumeFrontendUserPoints,
  dispatchFrontendUserLoginPrompt: mocks.dispatchFrontendUserLoginPrompt,
  getFrontendUserProfile: vi.fn(() => null),
  isFrontendUserLoggedIn: mocks.isFrontendUserLoggedIn
}))

vi.mock('@/services/siteConfig', () => ({
  getSitePublicConfig: mocks.getSitePublicConfig
}))

vi.mock('@/services/toolRanking', () => ({
  trackToolRankingEvent: mocks.trackToolRankingEvent
}))

import { useToolConsume } from './useToolConsume'

const createSiteConfig = (loginEnabled: boolean) => ({
  loginEnabled,
  loginToolConsumeRules: [],
  toolCategories: []
})

describe('useToolConsume', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset())
    mocks.isFrontendUserLoggedIn.mockReturnValue(false)
  })

  it('前台登录关闭时应跳过登录弹窗和积分扣减并直接放行', async () => {
    mocks.getSitePublicConfig.mockResolvedValue(createSiteConfig(false))
    const { ensureToolConsume } = useToolConsume()

    await expect(ensureToolConsume({ toolKey: 'ai-ocr', action: 'run' })).resolves.toBe(true)
    expect(mocks.dispatchFrontendUserLoginPrompt).not.toHaveBeenCalled()
    expect(mocks.consumeFrontendUserPoints).not.toHaveBeenCalled()
  })

  it('前台登录开启且用户未登录时应继续拉起登录提示', async () => {
    mocks.getSitePublicConfig.mockResolvedValue(createSiteConfig(true))
    const { ensureToolConsume } = useToolConsume()

    await expect(ensureToolConsume({ toolKey: 'ai-ocr', action: 'run' })).resolves.toBe(false)
    expect(mocks.dispatchFrontendUserLoginPrompt).toHaveBeenCalledOnce()
    expect(mocks.consumeFrontendUserPoints).not.toHaveBeenCalled()
  })
})
