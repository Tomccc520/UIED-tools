/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-11
 */

import standaloneToolsConfig from './standalone-tools.json'

export interface StandaloneToolConfig {
  toolKey: string
  basePath: string
  defaultDevTarget: string
}

export const standaloneTools = standaloneToolsConfig.tools as StandaloneToolConfig[]
export const AI_RESUME_STANDALONE_TOOL = standaloneTools.find((tool) => tool.toolKey === 'ai-resume') as StandaloneToolConfig

/**
 * 函数说明：判断目标路径是否属于独立部署工具，防止交给 Vue Router 处理。
 */
export const isStandaloneToolPath = (url: unknown): boolean => {
  const normalizedUrl = String(url || '').trim().split(/[?#]/)[0].replace(/\/$/, '')
  return standaloneTools.some((tool) => (
    normalizedUrl === tool.basePath || normalizedUrl.startsWith(`${tool.basePath}/`)
  ))
}
