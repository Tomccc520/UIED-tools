/**
 * @file toolAccessGuard.ts
 * @description 工具路由访问守卫：统一处理登录校验（积分扣减改为工具按钮触发）
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-30
 */

import type { RouteLocationNormalized } from 'vue-router'
import { isFrontendUserLoggedIn } from '@/services/frontendUser'

export interface ToolAccessGuardResult {
  allow: boolean
  redirectPath?: string
  toastMessage?: string
  toastType?: 'success' | 'warning' | 'error'
}

const TOOL_ROUTE_PREFIX = '/tools'

/**
 * 函数说明：标准化工具路由路径，去除末尾斜杠，确保路由匹配一致。
 */
const normalizeToolPath = (path: string): string => {
  const normalized = String(path || '').trim().replace(/\/+$/, '')
  return normalized || '/'
}

/**
 * 函数说明：判断当前路由是否属于工具页路径。
 */
const isToolRoutePath = (path: string): boolean => {
  const normalizedPath = normalizeToolPath(path)
  return normalizedPath === TOOL_ROUTE_PREFIX || normalizedPath.startsWith(`${TOOL_ROUTE_PREFIX}/`)
}

/**
 * 函数说明：生成登录页跳转地址，并回传当前目标路由供登录后回跳。
 */
const buildLoginRedirectPath = (to: RouteLocationNormalized): string => {
  const targetPath = String(to.fullPath || to.path || '/').trim() || '/'
  return `/user/login?redirect=${encodeURIComponent(targetPath)}`
}

/**
 * 函数说明：统一执行工具路由访问校验（仅登录校验，不在路由进入时扣积分）。
 */
export const ensureToolRouteAccess = async (to: RouteLocationNormalized): Promise<ToolAccessGuardResult> => {
  if (!isToolRoutePath(to.path)) {
    return { allow: true }
  }

  if (!isFrontendUserLoggedIn()) {
    return {
      allow: false,
      redirectPath: buildLoginRedirectPath(to),
      toastMessage: '请先登录后再使用工具',
      toastType: 'warning'
    }
  }

  return { allow: true }
}
