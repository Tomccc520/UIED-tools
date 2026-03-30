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
  consumeFrontendUserPoints,
  getFrontendUserProfile,
  isFrontendUserLoggedIn,
  type FrontendUserProfile
} from '@/services/frontendUser'

export interface ToolConsumeOptions {
  toolKey: string
  action?: string
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
   * 函数说明：构造登录后回跳链接，默认回到当前页面。
   */
  const buildLoginRedirectPath = (customRedirectPath?: string): string => {
    const targetPath = String(customRedirectPath || route.fullPath || route.path || '/').trim() || '/'
    return `/user/login?redirect=${encodeURIComponent(targetPath)}`
  }

  /**
   * 函数说明：跳转登录页并提示原因。
   */
  const redirectToLogin = async (warningText: string, customRedirectPath?: string) => {
    ElMessage.warning(warningText)
    await router.push(buildLoginRedirectPath(customRedirectPath))
  }

  /**
   * 函数说明：执行一次工具积分扣减，返回是否允许继续处理。
   */
  const ensureToolConsume = async (options: ToolConsumeOptions): Promise<boolean> => {
    const toolKey = String(options.toolKey || '').trim()
    const action = String(options.action || 'use').trim() || 'use'
    const loginWarningText = String(options.loginWarningText || '请先登录后再使用该工具').trim()
    const insufficientPointsRedirect = String(options.insufficientPointsRedirect || '/user/center?tab=points').trim()
    const showConsumeSuccessToast = Boolean(options.showConsumeSuccessToast)

    if (!toolKey) {
      ElMessage.error('工具积分配置异常：toolKey 不能为空')
      return false
    }

    if (!isFrontendUserLoggedIn()) {
      await redirectToLogin(loginWarningText, options.redirectPath)
      return false
    }

    if (options.skipConsumeWhen) {
      const profile = getFrontendUserProfile()
      const shouldSkip = await options.skipConsumeWhen(profile)
      if (shouldSkip) {
        return true
      }
    }

    try {
      const consumeResult = await consumeFrontendUserPoints(toolKey, action)
      if (!consumeResult) {
        await redirectToLogin('登录状态已失效，请重新登录后再试', options.redirectPath)
        return false
      }

      if (consumeResult.dailyGiftApplied) {
        ElMessage.success(`已自动发放今日积分 +${consumeResult.profile.pointsDailyGiftPoints}`)
      } else if (showConsumeSuccessToast) {
        ElMessage.success(`已扣除 ${consumeResult.consumePoints} 积分，剩余 ${consumeResult.remainPoints} 积分`)
      }
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : '积分扣减失败，请稍后重试'
      ElMessage.error(message)

      if (message.includes('积分') || message.includes('余额')) {
        await router.push(insufficientPointsRedirect)
      }
      return false
    }
  }

  return {
    ensureToolConsume
  }
}
