/**
 * @file useToolRuntimeGate.ts
 * @description 工具运行态门禁组合式函数，统一停用、登录、扣费、外链和跳转行为
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
 */

import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import {
  resolveToolConsumeRuntimePolicy,
  useToolConsume,
  type RuntimeToolConsumePolicy,
  type ToolConsumeMode,
  type ToolConsumeOptions
} from '@/composables/useToolConsume'
import type { Tool } from '@/types/tools'

export interface ToolRuntimeEntry {
  title?: string
  url?: string
  isExternal?: boolean
  status?: number
  remark?: string
  toolKey?: string
  needLogin?: boolean
  consumePoints?: number
}

export interface ToolRuntimeGateOptions {
  action?: string
  consumeMode?: ToolConsumeMode | 'none'
  requireLogin?: boolean
  redirectPath?: string
  loginWarningText?: string
  showConsumeSuccessToast?: boolean
  insufficientPointsRedirect?: string
  skipConsumeWhen?: ToolConsumeOptions['skipConsumeWhen']
  source?: string
}

export interface ToolRuntimeOpenOptions extends ToolRuntimeGateOptions {
  target?: 'current' | 'blank'
}

type ToolRuntimeLinkKind = 'internal' | 'external' | 'unsafe'

/**
 * 函数说明：标准化工具链接，统一清理首尾空格。
 */
export const normalizeToolRuntimeUrl = (url: unknown): string => {
  return String(url || '').trim()
}

/**
 * 函数说明：判断链接是否为可执行的站内工具链接，避免广告外链参与工具策略扣费。
 */
export const isInternalToolRuntimeLink = (url: unknown): boolean => {
  return normalizeToolRuntimeUrl(url).startsWith('/tools/')
}

/**
 * 函数说明：解析工具链接类型，只允许 http(s)、协议相对地址、mailto、tel 和站内相对地址。
 */
export const resolveToolRuntimeLinkKind = (url: unknown): ToolRuntimeLinkKind => {
  const targetUrl = normalizeToolRuntimeUrl(url)
  if (!targetUrl) {
    return 'unsafe'
  }
  if (targetUrl.startsWith('//')) {
    return 'external'
  }
  const schemeMatch = targetUrl.match(/^([a-z][a-z\d+.-]*):/i)
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase()
    return scheme === 'http' || scheme === 'https' || scheme === 'mailto' || scheme === 'tel' ? 'external' : 'unsafe'
  }
  return 'internal'
}

/**
 * 函数说明：判断链接是否为安全外链，屏蔽 javascript/data 等危险 scheme。
 */
export const isExternalToolLink = (url: unknown): boolean => {
  return resolveToolRuntimeLinkKind(url) === 'external'
}

/**
 * 函数说明：根据工具地址推导 toolKey，作为入口没有显式 toolKey 时的兜底。
 */
export const deriveRuntimeToolKeyByUrl = (url: unknown): string => {
  const normalizedUrl = normalizeToolRuntimeUrl(url).split('#')[0]
  const [rawPath, rawQuery = ''] = normalizedUrl.split('?')
  const routeKey = rawPath
    .replace(/^\/tools\//, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[\/_]+/g, '-')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
    .toLowerCase()
  const queryKey = Array.from(new URLSearchParams(rawQuery).entries())
    .map(([key, value]) => {
      const normalizedKey = `${key}-${value}`
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .trim()
        .toLowerCase()
      return normalizedKey
    })
    .filter(Boolean)
    .join('-')
  return [routeKey, queryKey].filter(Boolean).join('-')
}

/**
 * 函数说明：判断工具是否被后台停用，统一以 status=0 作为停用口径。
 */
export const isRuntimeToolDisabled = (tool: ToolRuntimeEntry | null | undefined): boolean => {
  return Number(tool?.status ?? 1) === 0
}

/**
 * 函数说明：输出工具停用提示，优先展示后台维护的停用备注。
 */
export const resolveRuntimeToolDisabledMessage = (
  tool: ToolRuntimeEntry | null | undefined,
  fallbackTitle = '当前工具'
): string => {
  const title = String(tool?.title || fallbackTitle || '当前工具').trim() || '当前工具'
  const remark = String(tool?.remark || '').trim()
  if (remark) {
    return `工具「${title}」已停用：${remark}`
  }
  return `工具「${title}」已在后台停用，请稍后再试。`
}

/**
 * 函数说明：将完整工具数据收口为运行态门禁只关心的字段。
 */
export const toToolRuntimeEntry = (tool: Tool | ToolRuntimeEntry): ToolRuntimeEntry => {
  return {
    title: tool.title,
    url: tool.url,
    isExternal: Boolean(tool.isExternal),
    status: tool.status,
    remark: tool.remark,
    toolKey: tool.toolKey,
    needLogin: tool.needLogin,
    consumePoints: tool.consumePoints
  }
}

/**
 * 函数说明：提供统一工具运行态门禁，覆盖停用提示、登录/扣费校验和内外链跳转。
 */
export const useToolRuntimeGate = () => {
  const route = useRoute()
  const router = useRouter()
  const { ensureToolConsume } = useToolConsume()

  /**
   * 函数说明：解析入口可用的 toolKey，优先读取后台显式配置，失败时按工具链接推导。
   */
  const resolveRuntimeToolKey = (tool: ToolRuntimeEntry): string => {
    return String(tool.toolKey || deriveRuntimeToolKeyByUrl(tool.url)).trim().toLowerCase()
  }

  /**
   * 函数说明：根据后台运行时策略和入口配置判断是否需要进入登录或扣费门禁。
   */
  const shouldRunConsumeGate = (
    tool: ToolRuntimeEntry,
    options: ToolRuntimeGateOptions,
    runtimePolicy: RuntimeToolConsumePolicy | null
  ): boolean => {
    if (options.consumeMode && options.consumeMode !== 'none') {
      return true
    }
    if (options.requireLogin) {
      return true
    }
    if (runtimePolicy) {
      return Boolean(runtimePolicy.needLogin || runtimePolicy.consumePoints > 0)
    }
    return Boolean(tool.needLogin || Number(tool.consumePoints || 0) > 0)
  }

  /**
   * 函数说明：判断当前工具入口是否需要查询后台运行时策略，避免普通广告外链被误纳入扣费。
   */
  const shouldResolveRuntimePolicy = (tool: ToolRuntimeEntry, options: ToolRuntimeGateOptions): boolean => {
    if (options.consumeMode === 'none') {
      return false
    }
    if (isInternalToolRuntimeLink(tool.url)) {
      return true
    }
    return Boolean(tool.toolKey || tool.needLogin || Number(tool.consumePoints || 0) > 0 || options.requireLogin)
  }

  /**
   * 函数说明：执行工具入口门禁，先拦停用，再按需执行登录或积分校验。
   */
  const ensureToolRuntimeGate = async (
    rawTool: Tool | ToolRuntimeEntry,
    options: ToolRuntimeGateOptions = {}
  ): Promise<boolean> => {
    const tool = toToolRuntimeEntry(rawTool)
    if (isRuntimeToolDisabled(tool)) {
      ElMessage.warning(resolveRuntimeToolDisabledMessage(tool))
      return false
    }

    const toolKey = resolveRuntimeToolKey(tool)
    const runtimePolicy = shouldResolveRuntimePolicy(tool, options)
      ? await resolveToolConsumeRuntimePolicy(toolKey, normalizeToolRuntimeUrl(tool.url))
      : null

    if (runtimePolicy?.status === 0) {
      ElMessage.warning(resolveRuntimeToolDisabledMessage({
        ...tool,
        status: runtimePolicy.status,
        remark: runtimePolicy.remark || tool.remark
      }))
      return false
    }

    if (!shouldRunConsumeGate(tool, options, runtimePolicy)) {
      return true
    }

    const gateToolKey = String(runtimePolicy?.toolKey || toolKey).trim().toLowerCase()

    if (!gateToolKey) {
      ElMessage.error('工具运行态配置异常：toolKey 不能为空')
      return false
    }

    const mode: ToolConsumeMode = options.consumeMode === 'consume' ? 'consume' : 'check-login'
    return ensureToolConsume({
      toolKey: gateToolKey,
      action: options.action || 'open',
      mode,
      routePath: normalizeToolRuntimeUrl(tool.url),
      redirectPath: options.redirectPath || route.fullPath,
      loginWarningText: options.loginWarningText || '请先登录后再使用该工具',
      showConsumeSuccessToast: options.showConsumeSuccessToast,
      insufficientPointsRedirect: options.insufficientPointsRedirect,
      skipConsumeWhen: options.skipConsumeWhen
    })
  }

  /**
   * 函数说明：统一执行工具跳转，外链新窗口打开，站内链接可按目标策略当前页或新窗口打开。
   */
  const openToolEntry = async (
    rawTool: Tool | ToolRuntimeEntry,
    options: ToolRuntimeOpenOptions = {}
  ): Promise<boolean> => {
    const tool = toToolRuntimeEntry(rawTool)
    const targetUrl = normalizeToolRuntimeUrl(tool.url)
    if (!targetUrl) {
      return false
    }
    const linkKind = resolveToolRuntimeLinkKind(targetUrl)
    if (linkKind === 'unsafe') {
      ElMessage.warning('该链接协议不安全，已阻止打开')
      return false
    }

    const allow = await ensureToolRuntimeGate(tool, options)
    if (!allow) {
      return false
    }

    if (tool.isExternal || linkKind === 'external') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer')
      return true
    }

    if (options.target === 'blank') {
      window.open(`${window.location.origin}${targetUrl}`, '_blank', 'noopener,noreferrer')
      return true
    }

    await router.push(targetUrl)
    return true
  }

  return {
    isToolDisabled: isRuntimeToolDisabled,
    resolveToolDisabledMessage: resolveRuntimeToolDisabledMessage,
    isExternalLink: isExternalToolLink,
    ensureToolRuntimeGate,
    openToolEntry
  }
}
