import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ToolConsumeOptions } from '@/composables/useToolConsume'
import type { FrontendUserProfile } from '@/services/frontendUser'
import { usePhotoMatting } from './usePhotoMatting'

const runtime = vi.hoisted(() => ({
  ensureToolConsume: vi.fn(),
  resolveCoreToolRun: vi.fn(),
  requestMattingImage: vi.fn()
}))

vi.mock('@/composables/useToolConsume', () => ({
  useToolConsume: () => ({ ensureToolConsume: runtime.ensureToolConsume })
}))
vi.mock('@/composables/useCoreToolManualConsume', () => ({
  useCoreToolManualConsume: () => ({ resolveCoreToolRun: runtime.resolveCoreToolRun }),
  createCoreToolRunRequestId: () => 'matting-test-request'
}))
vi.mock('@/services/matting', () => ({ requestMattingImage: runtime.requestMattingImage }))

const file = new File(['test'], 'photo.png', { type: 'image/png' })
const image = new Blob(['test'], { type: 'image/png' })
const options = { toolKey: 'photo-background' }

beforeEach(() => {
  vi.resetAllMocks()
  runtime.ensureToolConsume.mockImplementation(async (input: ToolConsumeOptions) => {
    input.onConsumed?.({
      requestId: 'matting-test-request',
      status: 'reserved',
      toolKey: options.toolKey,
      action: 'matting',
      consumePoints: 3,
      remainPoints: 0,
      dailyGiftApplied: false,
      profile: { uid: 'qa-user' } as FrontendUserProfile
    })
    return true
  })
  runtime.requestMattingImage.mockResolvedValue(image)
  runtime.resolveCoreToolRun.mockResolvedValue(true)
})

describe('证件照抠图结算', () => {
  it('成功交付成品后只确认一次同一笔预扣', async () => {
    const deliver = vi.fn(() => expect(runtime.resolveCoreToolRun).not.toHaveBeenCalled())
    await expect(usePhotoMatting().runPhotoMatting(file, options, deliver)).resolves.toBe(true)
    expect(deliver).toHaveBeenCalledOnce()
    expect(runtime.resolveCoreToolRun).toHaveBeenCalledExactlyOnceWith('matting-test-request', 'success', '', 'qa-user')
  })

  it('代理不可用时使用同一个 requestId 退款', async () => {
    runtime.requestMattingImage.mockRejectedValue(new Error('抠图服务暂未接通'))
    const deliver = vi.fn()
    await expect(usePhotoMatting().runPhotoMatting(file, options, deliver)).rejects.toThrow('抠图服务暂未接通')
    expect(deliver).not.toHaveBeenCalled()
    expect(runtime.resolveCoreToolRun).toHaveBeenCalledExactlyOnceWith(
      'matting-test-request', 'failed', '证件照抠图未完成', 'qa-user'
    )
  })

  it('换文件或合成失败导致无法交付时退款', async () => {
    const deliver = vi.fn().mockRejectedValue(new Error('照片已更换'))
    await expect(usePhotoMatting().runPhotoMatting(file, options, deliver)).rejects.toThrow('照片已更换')
    expect(runtime.resolveCoreToolRun).toHaveBeenCalledExactlyOnceWith(
      'matting-test-request', 'failed', '证件照抠图未完成', 'qa-user'
    )
  })

  it('后台免费放行时无需发起积分结算', async () => {
    runtime.ensureToolConsume.mockResolvedValue(true)
    await expect(usePhotoMatting().runPhotoMatting(file, options, vi.fn())).resolves.toBe(true)
    expect(runtime.resolveCoreToolRun).not.toHaveBeenCalled()
  })
})
