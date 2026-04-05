/**
 * @file toolCatalog.ts
 * @description 工具分类运行时服务，统一基于后台工具分类树计算工具详情、相关推荐与随机工具。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import type { Tool, ToolCategory, ToolSubCategory } from '@/types/tools'

/**
 * 函数说明：标准化工具链接，统一去掉查询、哈希与结尾斜杠，便于在不同入口间稳定匹配。
 */
const normalizeToolUrl = (rawUrl: string): string => {
  const normalized = String(rawUrl || '').trim().replace(/[?#].*$/, '')
  if (!normalized) {
    return ''
  }
  if (normalized === '/') {
    return normalized
  }
  return normalized.replace(/\/+$/, '')
}

/**
 * 函数说明：将工具分类树扁平化，同时补齐一级分类与二级分类标题，便于后续统一做检索与推荐。
 */
export const flattenToolsFromCategories = (categories: ToolCategory[]): Tool[] => {
  const toolList: Tool[] = []
  categories.forEach((category: ToolCategory) => {
    category.list.forEach((subCategory: ToolSubCategory) => {
      subCategory.list.forEach((tool: Tool) => {
        toolList.push({
          ...tool,
          cate: tool.cate || subCategory.title,
          cateId: tool.cateId || subCategory.id
        })
      })
    })
  })
  return toolList
}

/**
 * 函数说明：根据当前工具路径查找工具详情，优先使用标准化后的路径比对。
 */
export const findToolByUrl = (categories: ToolCategory[], currentPath: string): Tool | null => {
  const normalizedPath = normalizeToolUrl(currentPath)
  if (!normalizedPath) {
    return null
  }

  const matchedTool = flattenToolsFromCategories(categories).find((tool: Tool) => {
    return normalizeToolUrl(tool.url) === normalizedPath
  })
  return matchedTool || null
}

/**
 * 函数说明：判断两个工具是否属于同一推荐分组，优先比较二级分类，其次回退到一级分类。
 */
const isSameToolGroup = (currentTool: Tool, candidateTool: Tool): boolean => {
  const currentCate = String(currentTool.cate || '').trim()
  const candidateCate = String(candidateTool.cate || '').trim()
  if (currentCate && candidateCate && currentCate === candidateCate) {
    return true
  }
  return false
}

/**
 * 函数说明：从工具列表中构建稳定的去重结果，避免同一路由因 query 变体重复出现。
 */
const dedupeTools = (tools: Tool[], limit: number): Tool[] => {
  const seen = new Set<string>()
  const result: Tool[] = []

  tools.forEach((tool: Tool) => {
    if (result.length >= limit) {
      return
    }
    const uniqueKey = normalizeToolUrl(tool.url) || `id:${tool.id}`
    if (seen.has(uniqueKey)) {
      return
    }
    seen.add(uniqueKey)
    result.push(tool)
  })

  return result
}

/**
 * 函数说明：基于后台工具分类树获取相关推荐，先取同类工具，再补充其他工具，保证数量稳定。
 */
export const getRelatedToolsFromCategories = (
  categories: ToolCategory[],
  currentPath: string,
  sameLimit: number = 6,
  otherLimit: number = 2
): Tool[] => {
  const allTools = flattenToolsFromCategories(categories)
  const currentTool = findToolByUrl(categories, currentPath)
  const normalizedCurrentPath = normalizeToolUrl(currentPath)

  if (!allTools.length) {
    return []
  }

  if (!currentTool) {
    return dedupeTools(
      allTools.filter((tool: Tool) => normalizeToolUrl(tool.url) !== normalizedCurrentPath),
      Math.max(0, sameLimit + otherLimit)
    )
  }

  const siblingTools = allTools.filter((tool: Tool) => {
    return normalizeToolUrl(tool.url) !== normalizedCurrentPath && isSameToolGroup(currentTool, tool)
  })
  const otherTools = allTools.filter((tool: Tool) => {
    return normalizeToolUrl(tool.url) !== normalizedCurrentPath && !isSameToolGroup(currentTool, tool)
  })

  return [
    ...dedupeTools(siblingTools, Math.max(0, sameLimit)),
    ...dedupeTools(otherTools, Math.max(0, otherLimit))
  ].slice(0, Math.max(0, sameLimit + otherLimit))
}

/**
 * 函数说明：基于后台工具分类树获取随机工具列表，当前实现使用原顺序兜底，避免服务端配置刷新导致排序跳动。
 */
export const getRandomToolsFromCategories = (
  categories: ToolCategory[],
  limit: number = 8,
  excludePath: string = ''
): Tool[] => {
  const normalizedExcludePath = normalizeToolUrl(excludePath)
  const allTools = flattenToolsFromCategories(categories).filter((tool: Tool) => {
    return normalizeToolUrl(tool.url) !== normalizedExcludePath
  })
  return dedupeTools(allTools, Math.max(0, limit))
}

/**
 * 函数说明：获取后台配置里的新品工具，按发布时间、isNew 标记优先排序。
 */
export const getNewToolsFromCategories = (categories: ToolCategory[], limit: number = 8): Tool[] => {
  const allTools = flattenToolsFromCategories(categories)
  const sortedTools = [...allTools].sort((currentTool: Tool, nextTool: Tool) => {
    const currentNewScore = currentTool.isNew ? 1 : 0
    const nextNewScore = nextTool.isNew ? 1 : 0
    if (currentNewScore !== nextNewScore) {
      return nextNewScore - currentNewScore
    }

    const currentReleaseTime = currentTool.releaseDate ? new Date(currentTool.releaseDate).getTime() : 0
    const nextReleaseTime = nextTool.releaseDate ? new Date(nextTool.releaseDate).getTime() : 0
    return nextReleaseTime - currentReleaseTime
  })

  return dedupeTools(sortedTools, Math.max(0, limit))
}

/**
 * 函数说明：获取后台配置里的实用工具，优先返回非热门、非新品的常驻工具，再补齐其它工具。
 */
export const getUtilityToolsFromCategories = (categories: ToolCategory[], limit: number = 8): Tool[] => {
  const allTools = flattenToolsFromCategories(categories)
  const utilityCandidates = allTools.filter((tool: Tool) => {
    const tagList = Array.isArray(tool.tags) ? tool.tags : []
    return !tool.isNew && !tagList.includes('热门') && !tagList.includes('推荐')
  })
  const fallbackTools = allTools.filter((tool: Tool) => !utilityCandidates.includes(tool))
  return [
    ...dedupeTools(utilityCandidates, Math.max(0, limit)),
    ...dedupeTools(fallbackTools, Math.max(0, limit))
  ].slice(0, Math.max(0, limit))
}
