/**
 * @file useToolConsume.ts
 * @description 工具积分扣减组合式函数：统一“开始处理时扣积分”逻辑，便于后续挂会员免扣策略
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-30
 */

import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  dispatchFrontendUserLoginPrompt,
  consumeFrontendUserPoints,
  getFrontendUserProfile,
  isFrontendUserLoggedIn,
  type FrontendUserProfile
} from '@/services/frontendUser'

const TOOL_CONSUME_DEDUPE_WINDOW_MS = 1200
const toolConsumeTimestampMap = new Map<string, number>()

/**
 * 函数说明：构建工具积分扣减的短时去重键，避免同一次点击链路被重复扣分。
 */
const buildToolConsumeDedupeKey = (toolKey: string): string => {
  return String(toolKey || '').trim().toLowerCase()
}

/**
 * 函数说明：判断当前工具是否处于短时去重窗口，命中时直接跳过重复扣分。
 */
const isToolConsumeDuplicated = (dedupeKey: string): boolean => {
  const key = String(dedupeKey || '').trim()
  if (!key) {
    return false
  }
  const now = Date.now()
  const previousTimestamp = Number(toolConsumeTimestampMap.get(key) || 0)
  if (previousTimestamp > 0 && now - previousTimestamp <= TOOL_CONSUME_DEDUPE_WINDOW_MS) {
    return true
  }
  return false
}

/**
 * 函数说明：写入工具扣分时间戳，用于短时去重控制。
 */
const markToolConsumeTimestamp = (dedupeKey: string) => {
  const key = String(dedupeKey || '').trim()
  if (!key) {
    return
  }
  toolConsumeTimestampMap.set(key, Date.now())
}

/**
 * 函数说明：清理失败请求的去重标记，确保用户可立即重试。
 */
const clearToolConsumeTimestamp = (dedupeKey: string) => {
  const key = String(dedupeKey || '').trim()
  if (!key) {
    return
  }
  toolConsumeTimestampMap.delete(key)
}

export type ToolConsumeMode = 'consume' | 'check-login'

export interface ToolConsumeOptions {
  toolKey: string
  action?: string
  mode?: ToolConsumeMode
  loginWarningText?: string
  redirectPath?: string
  showConsumeSuccessToast?: boolean
  insufficientPointsRedirect?: string
  skipConsumeWhen?: (profile: FrontendUserProfile | null) => boolean | Promise<boolean>
}

/**
 * 函数说明：提供工具积分消费能力，统一登录校验、积分扣减与异常提示。
 */
export const useToolConsume = () => {
  const route = useRoute()
  const router = useRouter()

  /**
   * 函数说明：构造动作触发时的回跳地址，默认回到当前页面（含 query/hash）。
   */
  const buildActionRedirectPath = (customRedirectPath?: string): string => {
    const targetPath = String(customRedirectPath || route.fullPath || route.path || '/').trim() || '/'
    return targetPath
  }

  /**
   * 函数说明：统一拉起登录弹窗事件，并保留登录后回跳路径。
   */
  const promptLoginDialog = (warningText: string, customRedirectPath?: string, source = '') => {
    ElMessage.warning(warningText)
    dispatchFrontendUserLoginPrompt({
      reason: warningText,
      redirectPath: buildActionRedirectPath(customRedirectPath),
      source
    })
  }

  /**
   * 函数说明：积分不足时统一提示剩余/消耗信息，并引导前往积分中心。
   */
  const navigateToPointsCenter = async (redirectPath: string) => {
    const profile = getFrontendUserProfile()
    const remainPoints = Number(profile?.pointsBalance || 0)
    const consumePoints = Math.max(1, Number(profile?.pointsToolConsumePoints || 1))
    ElMessage.warning(`积分不足：当前剩余 ${remainPoints} 积分，本次需消耗 ${consumePoints} 积分`)
    await router.push(redirectPath)
  }

  /**
   * 函数说明：执行一次工具积分扣减，返回是否允许继续处理。
   */
  const ensureToolConsume = async (options: ToolConsumeOptions): Promise<boolean> => {
    const toolKey = String(options.toolKey || '').trim()
    const action = String(options.action || 'use').trim() || 'use'
    const mode: ToolConsumeMode = options.mode === 'check-login' ? 'check-login' : 'consume'
    const loginWarningText = String(options.loginWarningText || '请先登录后再使用该工具').trim()
    const insufficientPointsRedirect = String(options.insufficientPointsRedirect || '/user/center?tab=points').trim()
    const showConsumeSuccessToast = Boolean(options.showConsumeSuccessToast)

    if (!toolKey) {
      ElMessage.error('工具积分配置异常：toolKey 不能为空')
      return false
    }

    if (!isFrontendUserLoggedIn()) {
      promptLoginDialog(loginWarningText, options.redirectPath, `${toolKey}:${action}`)
      return false
    }

    // 仅做登录校验，不扣积分：用于下载/导出等高价值动作前拦截。
    if (mode === 'check-login') {
      return true
    }

    if (options.skipConsumeWhen) {
      const profile = getFrontendUserProfile()
      const shouldSkip = await options.skipConsumeWhen(profile)
      if (shouldSkip) {
        return true
      }
    }

    const dedupeKey = buildToolConsumeDedupeKey(toolKey)
    if (isToolConsumeDuplicated(dedupeKey)) {
      return true
    }
    markToolConsumeTimestamp(dedupeKey)

    try {
      const consumeResult = await consumeFrontendUserPoints(toolKey, action)
      if (!consumeResult) {
        promptLoginDialog('登录状态已失效，请重新登录后再试', options.redirectPath, `${toolKey}:${action}:expired`)
        return false
      }

      if (consumeResult.dailyGiftApplied) {
        ElMessage.success(`已自动发放今日积分 +${consumeResult.profile.pointsDailyGiftPoints}`)
      } else if (showConsumeSuccessToast) {
        ElMessage.success(`已扣除 ${consumeResult.consumePoints} 积分，剩余 ${consumeResult.remainPoints} 积分`)
      }
      return true
    } catch (error) {
      clearToolConsumeTimestamp(dedupeKey)
      const message = error instanceof Error ? error.message : '积分扣减失败，请稍后重试'
      if (message.includes('积分') || message.includes('余额')) {
        await navigateToPointsCenter(insufficientPointsRedirect)
        return false
      }
      ElMessage.error(message)
      return false
    }
  }

  return {
    ensureToolConsume
  }
}
