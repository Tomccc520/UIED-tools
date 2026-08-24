/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-11
 */

import standaloneToolsConfig from './standalone-tools.json'
import type { Tool, ToolCategory } from '@/types/tools'

export interface StandaloneToolConfig {
  toolKey: string
  basePath: string
  defaultDevTarget: string
}

export const standaloneTools = standaloneToolsConfig.tools as StandaloneToolConfig[]
export const AI_RESUME_STANDALONE_TOOL = standaloneTools.find((tool) => tool.toolKey === 'ai-resume') as StandaloneToolConfig
export const AI_PERLER_TOOL_PATH = '/tools/ai-perler'
export const AI_RESUME_RELEASE_ENABLED = import.meta.env.VITE_ENABLE_AI_RESUME === 'true'
const RELEASE_HIDDEN_TOOL_PATHS = new Set([
  '/tools/design/brand-spec'
])

/**
 * 函数说明：判断工具是否为本期暂缓发布的 AI 简历入口，同时兼容新旧路由和后台缺少 toolKey 的历史数据。
 */
export const isAiResumeToolEntry = (tool: Pick<Tool, 'toolKey' | 'url'>): boolean => {
  const normalizedToolKey = String(tool.toolKey || '').trim().toLowerCase()
  const normalizedUrl = String(tool.url || '').trim().split(/[?#]/)[0].replace(/\/$/, '')
  return normalizedToolKey === AI_RESUME_STANDALONE_TOOL.toolKey
    || normalizedUrl === AI_RESUME_STANDALONE_TOOL.basePath
    || normalizedUrl.startsWith(`${AI_RESUME_STANDALONE_TOOL.basePath}/`)
    || normalizedUrl === '/tools/ai/resume'
}

/**
 * 函数说明：判断工具是否属于当前版本未达到可交付标准的隐藏入口。
 */
export const isReleaseHiddenToolEntry = (tool: Pick<Tool, 'url'>): boolean => {
  const normalizedUrl = String(tool.url || '').trim().split(/[?#]/)[0].replace(/\/$/, '')
  return RELEASE_HIDDEN_TOOL_PATHS.has(normalizedUrl)
}

/**
 * 函数说明：按当前发布开关过滤工具分类树，统一约束首页、侧栏、搜索、推荐和随机工具的数据入口。
 */
export const filterToolCategoriesForRelease = (
  categories: ToolCategory[],
  aiResumeEnabled = AI_RESUME_RELEASE_ENABLED
): ToolCategory[] => {
  return categories
    .map((category) => ({
      ...category,
      list: category.list
        .map((subCategory) => ({
          ...subCategory,
          list: subCategory.list.filter((tool) => {
            if (isReleaseHiddenToolEntry(tool)) {
              return false
            }
            return aiResumeEnabled || !isAiResumeToolEntry(tool)
          })
        }))
        .filter((subCategory) => subCategory.list.length > 0)
    }))
    .filter((category) => category.list.length > 0)
}

/**
 * 函数说明：判断目标路径是否属于独立部署工具，防止交给 Vue Router 处理。
 */
export const isStandaloneToolPath = (url: unknown): boolean => {
  const normalizedUrl = String(url || '').trim().split(/[?#]/)[0].replace(/\/$/, '')
  return standaloneTools.some((tool) => (
    normalizedUrl === tool.basePath || normalizedUrl.startsWith(`${tool.basePath}/`)
  ))
}
