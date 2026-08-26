/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-14
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  ensureToolConsume: vi.fn(),
  getSitePublicConfig: vi.fn(),
  resolveFrontendUserPointsConsume: vi.fn(),
  warning: vi.fn()
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    warning: mocks.warning
  }
}))

vi.mock('@/composables/useToolConsume', () => ({
  useToolConsume: () => ({ ensureToolConsume: mocks.ensureToolConsume })
}))

vi.mock('@/services/frontendUser', () => ({
  FRONTEND_USER_AUTH_EVENT: 'uiedtool:frontend-user-auth-changed',
  getFrontendUserProfile: () => ({ uid: 1001 }),
  resolveFrontendUserPointsConsume: mocks.resolveFrontendUserPointsConsume
}))

vi.mock('@/services/siteConfig', () => ({
  getSitePublicConfig: mocks.getSitePublicConfig
}))

import {
  flushPendingCoreToolRunSettlements,
  useCoreToolManualConsume
} from '@/composables/useCoreToolManualConsume'

const SETTLEMENT_STORAGE_KEY = 'uiedtool:pending-core-tool-run-settlements'

/**
 * 函数说明：创建可手动结束的 Promise，用于稳定复现预扣期间的快速连点。
 */
const createDeferredBoolean = () => {
  let resolve!: (value: boolean) => void
  const promise = new Promise<boolean>((promiseResolve) => {
    resolve = promiseResolve
  })
  return { promise, resolve }
}

describe('useCoreToolManualConsume', () => {
  beforeEach(() => {
    window.localStorage.clear()
    mocks.ensureToolConsume.mockReset()
    mocks.getSitePublicConfig.mockReset()
    mocks.getSitePublicConfig.mockResolvedValue({ loginEnabled: true })
    mocks.resolveFrontendUserPointsConsume.mockReset()
    mocks.warning.mockReset()
    vi.useRealTimers()
  })

  it('预扣请求未返回时阻止第二次运行', async () => {
    const deferred = createDeferredBoolean()
    mocks.ensureToolConsume.mockReturnValueOnce(deferred.promise)
    const { consumeCoreToolRun } = useCoreToolManualConsume()
    const firstRun = consumeCoreToolRun({ toolKey: 'ai-ocr', requestId: 'request_00000001' })
    const secondRun = await consumeCoreToolRun({ toolKey: 'ai-ocr', requestId: 'request_00000002' })

    expect(secondRun).toBe(false)
    expect(mocks.ensureToolConsume).toHaveBeenCalledTimes(1)
    deferred.resolve(true)
    await expect(firstRun).resolves.toBe(true)
  })

  it('结算成功后清理本地幂等队列', async () => {
    mocks.resolveFrontendUserPointsConsume.mockResolvedValue({ status: 'committed' })
    const { resolveCoreToolRun } = useCoreToolManualConsume()

    await expect(resolveCoreToolRun('request_00000003', 'success')).resolves.toBe(true)
    expect(window.localStorage.getItem(SETTLEMENT_STORAGE_KEY)).toBeNull()
  })

  it('前台登录关闭时跳过积分结算且不显示退款同步警告', async () => {
    mocks.getSitePublicConfig.mockResolvedValue({ loginEnabled: false })
    const { resolveCoreToolRun } = useCoreToolManualConsume()

    await expect(resolveCoreToolRun('request_00000005', 'failed', '生成失败')).resolves.toBe(true)
    expect(mocks.resolveFrontendUserPointsConsume).not.toHaveBeenCalled()
    expect(mocks.warning).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(SETTLEMENT_STORAGE_KEY)).toBeNull()
  })

  it('网络失败时保留结算队列并可在恢复后重放', async () => {
    vi.useFakeTimers()
    mocks.resolveFrontendUserPointsConsume.mockRejectedValue(new Error('network error'))
    const { resolveCoreToolRun } = useCoreToolManualConsume()
    const resolving = resolveCoreToolRun('request_00000004', 'success')
    await vi.runAllTimersAsync()

    await expect(resolving).resolves.toBe(false)
    expect(window.localStorage.getItem(SETTLEMENT_STORAGE_KEY)).toContain('request_00000004')
    mocks.resolveFrontendUserPointsConsume.mockReset()
    mocks.resolveFrontendUserPointsConsume.mockResolvedValue({ status: 'committed' })
    await flushPendingCoreToolRunSettlements()
    expect(window.localStorage.getItem(SETTLEMENT_STORAGE_KEY)).toBeNull()
  })
})
