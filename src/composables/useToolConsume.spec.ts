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
  getRequiredSitePublicConfig: vi.fn(),
  isFrontendUserLoggedIn: vi.fn(),
  trackToolRankingEvent: vi.fn(),
  error: vi.fn(),
  warning: vi.fn()
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    error: mocks.error,
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

vi.mock('@/services/siteConfig', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/services/siteConfig')>(),
  getRequiredSitePublicConfig: mocks.getRequiredSitePublicConfig,
  getSitePublicConfig: vi.fn()
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
    mocks.trackToolRankingEvent.mockResolvedValue(undefined)
  })

  it('前台登录关闭时应跳过登录弹窗和积分扣减并直接放行', async () => {
    mocks.getRequiredSitePublicConfig.mockResolvedValue(createSiteConfig(false))
    const { ensureToolConsume } = useToolConsume()

    const onConsumed = vi.fn()
    await expect(ensureToolConsume({ toolKey: 'ai-ocr', action: 'run', onConsumed })).resolves.toBe(true)
    expect(onConsumed).not.toHaveBeenCalled()
    expect(mocks.dispatchFrontendUserLoginPrompt).not.toHaveBeenCalled()
    expect(mocks.consumeFrontendUserPoints).not.toHaveBeenCalled()
  })

  it('只有消费 API 的真实回执通知调用方，并透传幂等 requestId', async () => {
    mocks.getRequiredSitePublicConfig.mockResolvedValue(createSiteConfig(true))
    mocks.isFrontendUserLoggedIn.mockReturnValue(true)
    const receipt = { requestId: 'video_task_0001', status: 'reserved', consumePoints: 5,
      remainPoints: 0, profile: { uid: '1001' }, dailyGiftApplied: false }
    mocks.consumeFrontendUserPoints.mockResolvedValue(receipt)
    const onConsumed = vi.fn()
    const { ensureToolConsume } = useToolConsume()
    await expect(ensureToolConsume({ toolKey: 'video-compress-large', action: 'compress', requestId: receipt.requestId, onConsumed })).resolves.toBe(true)
    expect(mocks.consumeFrontendUserPoints).toHaveBeenCalledWith('video-compress-large', 'compress', receipt.requestId)
    expect(onConsumed).toHaveBeenCalledExactlyOnceWith(receipt)
  })

  it('免费策略和下载登录校验不创建可退款的消费回执', async () => {
    mocks.getRequiredSitePublicConfig.mockResolvedValue({ ...createSiteConfig(true), loginToolConsumeRules: [
      { toolKey: 'video-compress', needLogin: false, consumePoints: 0, memberFree: true, status: 1 }
    ] })
    mocks.isFrontendUserLoggedIn.mockReturnValue(true)
    const onConsumed = vi.fn()
    const { ensureToolConsume } = useToolConsume()
    await expect(ensureToolConsume({ toolKey: 'video-compress', action: 'compress', onConsumed })).resolves.toBe(true)
    await expect(ensureToolConsume({ toolKey: 'video-compress-large', mode: 'check-login', onConsumed })).resolves.toBe(true)
    expect(mocks.consumeFrontendUserPoints).not.toHaveBeenCalled()
    expect(onConsumed).not.toHaveBeenCalled()
  })

  it('前台登录开启且用户未登录时应继续拉起登录提示', async () => {
    mocks.getRequiredSitePublicConfig.mockResolvedValue(createSiteConfig(true))
    const { ensureToolConsume } = useToolConsume()

    await expect(ensureToolConsume({ toolKey: 'ai-ocr', action: 'run' })).resolves.toBe(false)
    expect(mocks.dispatchFrontendUserLoginPrompt).toHaveBeenCalledOnce()
    expect(mocks.consumeFrontendUserPoints).not.toHaveBeenCalled()
  })

  it('站点配置读取失败时应保守拦截，避免误进入免登录模式', async () => {
    mocks.getRequiredSitePublicConfig.mockRejectedValue(new Error('network error'))
    const { ensureToolConsume } = useToolConsume()

    await expect(ensureToolConsume({ toolKey: 'ai-ocr', action: 'run' })).resolves.toBe(false)
    expect(mocks.error).toHaveBeenCalledWith('站点配置服务暂时不可用，请稍后重试')
    expect(mocks.dispatchFrontendUserLoginPrompt).not.toHaveBeenCalled()
    expect(mocks.consumeFrontendUserPoints).not.toHaveBeenCalled()
  })
})
