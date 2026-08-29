/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-18
 */
import type { Tool } from '@/types/tools'

const SEARCH_SYNONYM_GROUPS = [
  ['图片', '图像', '照片', 'image', 'photo'],
  ['压缩', '缩小', '减小', 'compress'],
  ['抠图', '去背景', '移除背景', '背景移除', 'matting'],
  ['二维码', 'qr', 'qrcode'],
  ['视频', '影片', 'video'],
  ['音频', '声音', 'audio'],
  ['人工智能', '智能', 'ai'],
  ['格式化', '美化', 'format'],
  ['转换', '转化', 'convert']
]

/**
 * 归一化搜索文本
 * @description 统一小写、去空白，降低中英文混排查询的匹配噪音
 * @param value 原始文本
 * @returns 归一化后的文本
 */
const normalizeText = (value: string): string => {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, '')
    .trim()
}

/**
 * 函数说明：拆分并扩展搜索词，兼容中英文别名和常见同义表达。
 * @param query 用户输入
 * @returns 去重后的搜索词集合
 */
const buildSearchTokens = (query: string): string[] => {
  const normalizedQuery = normalizeText(query)
  const tokenSet = new Set(
    String(query || '')
      .toLowerCase()
      .split(/[\s,，。.!！？;；、/\\|_-]+/)
      .map(token => normalizeText(token))
      .filter(Boolean)
  )

  if (normalizedQuery) {
    tokenSet.add(normalizedQuery)
  }

  SEARCH_SYNONYM_GROUPS.forEach((group) => {
    const normalizedGroup = group.map(item => normalizeText(item))
    if (normalizedGroup.some(item => normalizedQuery.includes(item) || tokenSet.has(item))) {
      normalizedGroup.forEach(item => tokenSet.add(item))
    }
  })

  return Array.from(tokenSet)
}

/**
 * 函数说明：判断工具是否满足查询中已识别出的全部搜索概念。
 * @description 多概念查询采用同时满足策略，例如“图片压缩”不会混入仅命中“压缩”的视频工具。
 * @param tool 工具数据
 * @param query 用户输入
 * @returns 是否满足搜索意图
 */
const matchesSearchIntent = (tool: Tool, query: string): boolean => {
  const normalizedQuery = normalizeText(query)
  const searchableText = normalizeText([
    tool.title,
    tool.desc,
    tool.cate,
    ...(tool.tags || []),
    tool.toolKey,
    tool.seoTitle,
    tool.seoKeywords,
    tool.seoDescription
  ].filter(Boolean).join(' '))

  const detectedConceptGroups = SEARCH_SYNONYM_GROUPS
    .map(group => group.map(item => normalizeText(item)))
    .filter(group => group.some(item => normalizedQuery.includes(item)))

  return detectedConceptGroups.every(group => group.some(item => searchableText.includes(item)))
}

/**
 * 标准化工具链接
 * @description 去除 hash 与 query，确保建议去重稳定
 * @param url 工具链接
 * @returns 标准化后的链接
 */
const normalizeToolUrl = (url: string): string => {
  return (url || '').split('#')[0].split('?')[0]
}

/**
 * 对单个工具进行相关性评分
 * @description 按标题、描述、标签、分类多维度加权，输出可排序分数
 * @param tool 工具数据
 * @param query 归一化后的查询词
 * @param tokens 查询词切分结果
 * @returns 分值，越高表示越相关
 */
const scoreTool = (tool: Tool, query: string, tokens: string[]): number => {
  if (!query) return 0

  const title = normalizeText(tool.title || '')
  const desc = normalizeText(tool.desc || '')
  const cate = normalizeText(tool.cate || '')
  const tags = (tool.tags || []).map(tag => normalizeText(tag)).filter(Boolean)
  const metadata = normalizeText([
    tool.toolKey,
    tool.seoTitle,
    tool.seoKeywords,
    tool.seoDescription
  ].filter(Boolean).join(' '))

  let score = 0

  if (title === query) score += 140
  if (title.startsWith(query)) score += 90
  if (title.includes(query)) score += 70
  if (desc.includes(query)) score += 36
  if (cate.includes(query)) score += 24
  if (tags.some(tag => tag.includes(query))) score += 40
  if (metadata.includes(query)) score += 28

  for (const token of tokens) {
    if (token.length < 2) continue
    if (title.includes(token)) score += 24
    if (desc.includes(token)) score += 14
    if (cate.includes(token)) score += 12
    if (tags.some(tag => tag.includes(token))) score += 18
    if (metadata.includes(token)) score += 10
  }

  if (tool.isNew) score += 2
  if (Number(tool.status) === 0) score -= 8
  return score
}

/**
 * 执行本地工具检索
 * @description 使用多维评分对工具列表排序，返回相关性最高的候选集
 * @param tools 工具列表
 * @param query 用户输入
 * @param limit 返回数量上限
 * @returns 匹配后的工具列表
 */
export const searchToolsByQuery = (tools: Tool[], query: string, limit: number = 12): Tool[] => {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery || !Array.isArray(tools) || tools.length === 0) {
    return []
  }

  const tokens = buildSearchTokens(query)

  const scoredTools = tools
    .map(tool => ({
      tool,
      score: scoreTool(tool, normalizedQuery, tokens)
    }))
    .filter(item => item.score > 0 && matchesSearchIntent(item.tool, query))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return (a.tool.title || '').length - (b.tool.title || '').length
    })

  const seenUrls = new Set<string>()
  const matchedTools: Tool[] = []
  for (const item of scoredTools) {
    const normalizedUrl = normalizeToolUrl(item.tool.url)
    if (seenUrls.has(normalizedUrl)) continue
    seenUrls.add(normalizedUrl)
    matchedTools.push(item.tool)
    if (matchedTools.length >= limit) break
  }

  return matchedTools
}

/**
 * 组装 AI 搜索上下文
 * @description 将工具列表压缩为模型可读文本，控制上下文长度
 * @param tools 工具列表
 * @returns 工具上下文文本
 */
export const buildToolsPromptContext = (tools: Tool[]): string => {
  if (!tools.length) {
    return '- 暂无可用工具数据'
  }

  return tools
    .map(tool => `- ${tool.title}: ${tool.desc || '暂无描述'} [${tool.url}]`)
    .join('\n')
}

/**
 * 合并并去重工具建议
 * @description 按传入顺序合并多个候选列表，保证建议结果稳定
 * @param sourceLists 候选工具列表数组
 * @param limit 返回数量上限
 * @returns 去重后的工具建议
 */
export const mergeToolSuggestions = (sourceLists: Tool[][], limit: number = 5): Tool[] => {
  const merged: Tool[] = []
  const seenUrls = new Set<string>()

  for (const list of sourceLists) {
    for (const tool of list) {
      const normalizedUrl = normalizeToolUrl(tool.url)
      if (!normalizedUrl || seenUrls.has(normalizedUrl)) continue
      seenUrls.add(normalizedUrl)
      merged.push(tool)
      if (merged.length >= limit) {
        return merged
      }
    }
  }

  return merged
}
