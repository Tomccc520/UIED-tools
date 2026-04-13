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
import { getSitePublicConfig, type SiteLoginToolConsumeRule } from '@/services/siteConfig'
import { trackToolRankingEvent } from '@/services/toolRanking'
import type { Tool, ToolCategory } from '@/types/tools'

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

interface RuntimeToolConsumePolicy {
  toolKey: string
  consumePoints: number
  memberFree: boolean
  status: number
  ruleMatched: boolean
  source: 'login-rule' | 'tool-catalog'
}

/**
 * 函数说明：标准化 toolKey，统一小写并去除首尾空格。
 */
const normalizeToolKeyText = (value: unknown): string => {
  return String(value || '').trim().toLowerCase()
}

/**
 * 函数说明：标准化工具路径，统一去除 query/hash 与尾部斜杠，便于按路由匹配工具策略。
 */
const normalizeToolRoutePath = (value: unknown): string => {
  const rawPath = String(value || '')
    .trim()
    .split('?')[0]
    .split('#')[0]
  if (!rawPath) {
    return ''
  }
  if (rawPath === '/') {
    return '/'
  }
  return rawPath.replace(/\/+$/g, '')
}

/**
 * 函数说明：根据工具链接推导 toolKey（作为后台未显式配置 toolKey 的兜底）。
 */
const deriveToolKeyByUrl = (url: string): string => {
  const normalizedPath = normalizeToolRoutePath(url)
    .replace(/^\/tools\//, '')
    .replace(/^\/+|\/+$/g, '')
  const key = normalizedPath.replace(/[\/_]+/g, '-').trim()
  return normalizeToolKeyText(key)
}

/**
 * 函数说明：将工具分类树扁平化为工具列表，便于统一按 toolKey/路由进行策略匹配。
 */
const flattenToolsFromCategories = (categories: ToolCategory[]): Tool[] => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return []
  }
  return categories.flatMap((category) => {
    const subList = Array.isArray(category.list) ? category.list : []
    return subList.flatMap((subCategory) => (Array.isArray(subCategory.list) ? subCategory.list : []))
  })
}

/**
 * 函数说明：从工具主数据中读取运行时策略（status/consumePoints/memberFree），作为登录规则缺失时的兜底来源。
 */
const resolveRuntimePolicyFromToolCatalog = (
  categories: ToolCategory[],
  normalizedToolKey: string,
  normalizedRoutePath: string
): RuntimeToolConsumePolicy | null => {
  const flatTools = flattenToolsFromCategories(categories)
  if (flatTools.length === 0) {
    return null
  }
  const matchedByKey = flatTools.find((tool) => {
    return normalizeToolKeyText(tool.toolKey) === normalizedToolKey
  })
  const matchedTool = matchedByKey || flatTools.find((tool) => {
    return normalizeToolRoutePath(tool.url) === normalizedRoutePath
  })
  if (!matchedTool) {
    return null
  }
  const toolStatus = Number(matchedTool.status ?? 1) === 0 ? 0 : 1
  const toolConsumePointsRaw = Number(matchedTool.consumePoints ?? 1)
  const consumePoints = Number.isFinite(toolConsumePointsRaw) ? Math.max(0, Math.floor(toolConsumePointsRaw)) : 1
  return {
    toolKey: normalizeToolKeyText(matchedTool.toolKey) || normalizedToolKey || deriveToolKeyByUrl(matchedTool.url),
    consumePoints,
    memberFree: Boolean(matchedTool.memberFree ?? true),
    status: toolStatus,
    ruleMatched: true,
    source: 'tool-catalog'
  }
}

/**
 * 函数说明：根据后端登录策略规则解析当前工具的运行时扣分策略。
 */
const resolveRuntimeToolPolicy = async (toolKey: string, routePath = ''): Promise<RuntimeToolConsumePolicy | null> => {
  const normalizedToolKey = normalizeToolKeyText(toolKey)
  const normalizedRoutePath = normalizeToolRoutePath(routePath)
  if (!normalizedToolKey) {
    return null
  }
  try {
    const siteConfig = await getSitePublicConfig()
    const ruleList = Array.isArray(siteConfig.loginToolConsumeRules)
      ? siteConfig.loginToolConsumeRules
      : []
    const matchedRule = ruleList.find((item: SiteLoginToolConsumeRule) => {
      return normalizeToolKeyText(item.toolKey) === normalizedToolKey
    })
    if (!matchedRule) {
      return resolveRuntimePolicyFromToolCatalog(siteConfig.toolCategories, normalizedToolKey, normalizedRoutePath)
    }
    const status = Number(matchedRule.status ?? 1) === 0 ? 0 : 1
    return {
      toolKey: normalizedToolKey,
      consumePoints: Math.max(0, Number(matchedRule.consumePoints ?? 1)),
      memberFree: Boolean(matchedRule.memberFree),
      status,
      ruleMatched: true,
      source: 'login-rule'
    }
  } catch (error) {
    return null
  }
}

/**
 * 函数说明：根据用户资料与运行时策略计算预期扣分，用于积分不足提示文案。
 */
const resolveExpectedConsumePoints = (
  profile: FrontendUserProfile | null,
  runtimePolicy: RuntimeToolConsumePolicy | null
): number => {
  const globalConsumePoints = Math.max(1, Number(profile?.pointsToolConsumePoints || 1))
  if (!runtimePolicy || !runtimePolicy.ruleMatched) {
    return globalConsumePoints
  }
  let consumePoints = Math.max(0, Number(runtimePolicy.consumePoints || 0))
  if (profile?.memberActive && runtimePolicy.memberFree) {
    consumePoints = 0
  }
  return Math.max(0, consumePoints)
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
  const navigateToPointsCenter = async (redirectPath: string, requiredPoints: number) => {
    const profile = getFrontendUserProfile()
    const remainPoints = Number(profile?.pointsBalance || 0)
    const consumePoints = Math.max(0, Number(requiredPoints))
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

    const runtimePolicy = await resolveRuntimeToolPolicy(toolKey, route.path)
    if (runtimePolicy?.status === 0) {
      ElMessage.warning('当前工具已在后台停用，请稍后再试')
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

      void trackToolRankingEvent({
        toolKey,
        routePath: route.path,
        eventType: action === 'download' ? 'download' : 'start',
        toolUrl: route.path,
        source: 'use-tool-consume'
      }).catch(() => {
        // 函数说明：排行榜埋点属于非阻断能力，失败时不影响当前工具继续执行。
      })
      return true
    } catch (error) {
      clearToolConsumeTimestamp(dedupeKey)
      const message = error instanceof Error ? error.message : '积分扣减失败，请稍后重试'
      if (message.includes('积分') || message.includes('余额')) {
        const profile = getFrontendUserProfile()
        const expectedConsumePoints = resolveExpectedConsumePoints(profile, runtimePolicy)
        await navigateToPointsCenter(insufficientPointsRedirect, expectedConsumePoints)
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
