/**
 * @file useCoreToolManualConsume.ts
 * @description 会员核心工具页面内显式运行扣分封装，统一运行前登录与积分扣减文案
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
 */

import { ElMessage } from 'element-plus'
import { useToolConsume } from '@/composables/useToolConsume'
import {
  FRONTEND_USER_AUTH_EVENT,
  getFrontendUserProfile,
  resolveFrontendUserPointsConsume,
  type FrontendUserPointsConsumeResolveResult
} from '@/services/frontendUser'

export interface CoreToolManualConsumeOptions {
  toolKey: string
  action?: string
  requestId?: string
  routePath?: string
  loginWarningText?: string
  showConsumeSuccessToast?: boolean
}

export type CoreToolRunOutcome = 'success' | 'failed'

interface PendingCoreToolRunSettlement {
  requestId: string
  outcome: CoreToolRunOutcome
  reason: string
  userUid: string
  createTime: number
}

const CORE_TOOL_RUN_SETTLEMENT_STORAGE_KEY = 'uiedtool:pending-core-tool-run-settlements'
const CORE_TOOL_RUN_SETTLEMENT_MAX_AGE_MS = 24 * 60 * 60 * 1000
let coreToolSettlementListenersBound = false
let pendingSettlementFlushPromise: Promise<void> | null = null

/**
 * 函数说明：读取本地待结算运行，过滤超时或格式异常数据。
 */
const readPendingCoreToolRunSettlements = (): PendingCoreToolRunSettlement[] => {
  if (typeof window === 'undefined') return []
  try {
    const rawList = JSON.parse(window.localStorage.getItem(CORE_TOOL_RUN_SETTLEMENT_STORAGE_KEY) || '[]')
    if (!Array.isArray(rawList)) return []
    const now = Date.now()
    return rawList.filter((item) => {
      return item &&
        typeof item.requestId === 'string' &&
        (item.outcome === 'success' || item.outcome === 'failed') &&
        typeof item.userUid === 'string' &&
        Number(item.createTime) > now - CORE_TOOL_RUN_SETTLEMENT_MAX_AGE_MS
    })
  } catch {
    return []
  }
}

/**
 * 函数说明：持久化待结算运行，保留最近 50 条避免本地存储无限增长。
 */
const writePendingCoreToolRunSettlements = (list: PendingCoreToolRunSettlement[]) => {
  if (typeof window === 'undefined') return
  try {
    const nextList = list.slice(-50)
    if (nextList.length === 0) {
      window.localStorage.removeItem(CORE_TOOL_RUN_SETTLEMENT_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(CORE_TOOL_RUN_SETTLEMENT_STORAGE_KEY, JSON.stringify(nextList))
  } catch {
    // 函数说明：隐私模式或存储配额异常时仍保留当前短重试链路。
  }
}

/**
 * 函数说明：把当前运行结算加入本地幂等队列，同一 requestId 只保留最新结果。
 */
const queuePendingCoreToolRunSettlement = (
  requestId: string,
  outcome: CoreToolRunOutcome,
  reason: string
) => {
  const userUid = String(getFrontendUserProfile()?.uid || '').trim()
  const currentList = readPendingCoreToolRunSettlements().filter((item) => item.requestId !== requestId)
  currentList.push({
    requestId,
    outcome,
    reason: String(reason || '').trim().slice(0, 200),
    userUid,
    createTime: Date.now()
  })
  writePendingCoreToolRunSettlements(currentList)
}

/**
 * 函数说明：从本地队列移除已经进入服务端终态的运行记录。
 */
const removePendingCoreToolRunSettlement = (requestId: string) => {
  writePendingCoreToolRunSettlements(
    readPendingCoreToolRunSettlements().filter((item) => item.requestId !== requestId)
  )
}

/**
 * 函数说明：校验服务端结算状态是否与本次运行结果一致。
 */
const isCoreToolRunSettlementResolved = (
  result: FrontendUserPointsConsumeResolveResult,
  outcome: CoreToolRunOutcome
): boolean => {
  if (outcome === 'success') return result.status === 'committed'
  return result.status === 'refunded' || result.status === 'expired'
}

/**
 * 函数说明：重放当前登录用户的待结算运行，用于断网恢复或重新登录后补偿。
 */
export const flushPendingCoreToolRunSettlements = async (): Promise<void> => {
  if (pendingSettlementFlushPromise) return pendingSettlementFlushPromise
  pendingSettlementFlushPromise = (async () => {
    const currentUserUid = String(getFrontendUserProfile()?.uid || '').trim()
    if (!currentUserUid) return
    for (const item of readPendingCoreToolRunSettlements()) {
      if (item.userUid && item.userUid !== currentUserUid) continue
      try {
        const result = await resolveFrontendUserPointsConsume(item.requestId, item.outcome, item.reason)
        if (result && (isCoreToolRunSettlementResolved(result, item.outcome) || result.status !== 'reserved')) {
          removePendingCoreToolRunSettlement(item.requestId)
        }
      } catch {
        // 函数说明：服务仍不可用时保留队列，等待下次 online 或登录态事件重试。
      }
    }
  })().finally(() => {
    pendingSettlementFlushPromise = null
  })
  return pendingSettlementFlushPromise
}

/**
 * 函数说明：全局绑定网络恢复与登录态事件，每个页面会话只初始化一次。
 */
const ensureCoreToolSettlementRecovery = () => {
  if (typeof window === 'undefined' || coreToolSettlementListenersBound) return
  coreToolSettlementListenersBound = true
  const flush = () => {
    void flushPendingCoreToolRunSettlements()
  }
  window.addEventListener('online', flush)
  window.addEventListener(FRONTEND_USER_AUTH_EVENT, flush)
  window.setTimeout(flush, 0)
}

/**
 * 函数说明：为一次真实核心工具运行生成跨请求稳定的积分结算幂等标识。
 */
export const createCoreToolRunRequestId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 18)}`.slice(0, 40)
}

/**
 * 函数说明：等待指定毫秒后继续，用于积分结算网络失败时做短间隔重试。
 */
const waitForCoreToolSettlementRetry = (delay: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

/**
 * 函数说明：提供会员核心工具页面内显式扣分能力，确保校验通过后、真实运行前才扣分。
 */
export const useCoreToolManualConsume = () => {
  const { ensureToolConsume } = useToolConsume()
  let consumePending = false
  ensureCoreToolSettlementRecovery()

  /**
   * 函数说明：执行一次核心工具运行扣分，返回是否允许继续发起 AI 或处理请求。
   */
  const consumeCoreToolRun = async (options: CoreToolManualConsumeOptions): Promise<boolean> => {
    if (consumePending) return false
    consumePending = true
    try {
      return await ensureToolConsume({
        toolKey: options.toolKey,
        action: options.action || 'generate',
        requestId: options.requestId,
        mode: 'consume',
        routePath: options.routePath,
        loginWarningText: options.loginWarningText || '请先登录后再运行会员核心工具',
        showConsumeSuccessToast: options.showConsumeSuccessToast ?? true
      })
    } finally {
      consumePending = false
    }
  }

  /**
   * 函数说明：结算一次核心工具运行；成功确认消费，失败触发幂等退款，短暂网络错误会自动重试。
   */
  const resolveCoreToolRun = async (
    requestId: string,
    outcome: CoreToolRunOutcome,
    reason = ''
  ): Promise<boolean> => {
    const normalizedRequestId = String(requestId || '').trim()
    if (!normalizedRequestId) {
      return false
    }
    queuePendingCoreToolRunSettlement(normalizedRequestId, outcome, reason)
    const retryDelays = [0, 250, 700]
    for (const delay of retryDelays) {
      if (delay > 0) {
        await waitForCoreToolSettlementRetry(delay)
      }
      try {
        const result = await resolveFrontendUserPointsConsume(normalizedRequestId, outcome, reason)
        if (result && isCoreToolRunSettlementResolved(result, outcome)) {
          removePendingCoreToolRunSettlement(normalizedRequestId)
          return true
        }
        if (result && result.status !== 'reserved') {
          removePendingCoreToolRunSettlement(normalizedRequestId)
          break
        }
      } catch {
        // 函数说明：当前轮结算失败时继续使用相同 requestId 重试，避免重复扣分或退款。
      }
    }
    ElMessage.warning(outcome === 'failed'
      ? '积分退款同步失败，系统将在预扣超时后自动退还'
      : '积分结算同步失败，系统将在预扣超时后自动退还')
    return false
  }

  return {
    consumeCoreToolRun,
    resolveCoreToolRun
  }
}
