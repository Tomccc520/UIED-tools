/**
 * @file useCoreToolManualConsume.ts
 * @description 会员核心工具页面内显式运行扣分封装，统一运行前登录与积分扣减文案
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
 */

import { useToolConsume } from '@/composables/useToolConsume'

export interface CoreToolManualConsumeOptions {
  toolKey: string
  action?: string
  routePath?: string
  loginWarningText?: string
  showConsumeSuccessToast?: boolean
}

/**
 * 函数说明：提供会员核心工具页面内显式扣分能力，确保校验通过后、真实运行前才扣分。
 */
export const useCoreToolManualConsume = () => {
  const { ensureToolConsume } = useToolConsume()

  /**
   * 函数说明：执行一次核心工具运行扣分，返回是否允许继续发起 AI 或处理请求。
   */
  const consumeCoreToolRun = async (options: CoreToolManualConsumeOptions): Promise<boolean> => {
    return ensureToolConsume({
      toolKey: options.toolKey,
      action: options.action || 'generate',
      mode: 'consume',
      routePath: options.routePath,
      loginWarningText: options.loginWarningText || '请先登录后再运行会员核心工具',
      showConsumeSuccessToast: options.showConsumeSuccessToast ?? true
    })
  }

  return {
    consumeCoreToolRun
  }
}
