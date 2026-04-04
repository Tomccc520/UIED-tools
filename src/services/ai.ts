/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */
import axios from 'axios'
import { useToolsStore } from '@/store/modules/tools'
import type { Tool } from '@/types/tools'
import { buildToolsPromptContext, mergeToolSuggestions, searchToolsByQuery } from '@/utils/toolSearch'
import { debugLog, debugError, debugTimeStart, debugTimeEnd } from '@/utils/debug'
import { getCurrentAiProvider } from '@/services/aiProvider'

const SEARCH_CONTEXT_LIMIT = 80
const SEARCH_LOCAL_MATCH_LIMIT = 24
const SEARCH_SUGGESTION_LIMIT = 5

export const AI_DEFAULT_MODELS = {
  SEARCH: 'deepseek-ai/DeepSeek-V3',
  SUGGESTION: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B'
} as const

// AI搜索接口
export interface AISearchResponse {
  content: string
  reasoning_content?: string
  suggestions?: Array<{
    title: string
    description: string
    url: string
  }>
  onUpdate?: (data: {
    content?: string
    reasoning_content?: string
  }) => void
}

interface StreamDelta {
  content?: string
  reasoning_content?: string
}

const aiClient = axios.create({
  baseURL: '/api/common/ai/provider',
  timeout: 120000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// 响应拦截器
aiClient.interceptors.response.use(
  response => response.data,
  error => {
    debugError('AI Provider 请求失败:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('请求超时，请稍后重试')
    }

    const upstreamMessage =
      error.response?.data?.msg ||
      error.response?.data?.message ||
      error.response?.data?.error?.message

    throw new Error(upstreamMessage || '服务器错误，请稍后重试')
  }
)

// 系统提示词
const SEARCH_SYSTEM_PROMPT = `你是一个专业的工具网站搜索助手。你需要：

1. 理解用户搜索意图
2. 在以下工具列表中查找相关工具
3. 用中文回复，直接给出建议和推荐工具

回答要求：
1. 使用清晰自然的语言
2. 不要使用特殊符号
3. 不要在回复中重复工具的链接
4. 保持专业友好的语气
5. 直接给出建议，不需要解释推理过程

工具列表：
{{tools}}
`

/**
 * 函数说明：检查后台是否已经配置可用的文本 AI Provider，决定是否进入 AI 增强逻辑。
 */
const hasAvailableProvider = async (): Promise<boolean> => {
  const provider = await getCurrentAiProvider()
  return Boolean(provider.available && provider.defaultModel)
}

/**
 * 函数说明：获取当前可用的默认模型，优先读取后台 Provider 默认模型，缺失时回退到本地安全默认值。
 */
const getProviderModel = async (fallbackModel: string): Promise<string> => {
  const provider = await getCurrentAiProvider()
  return provider.defaultModel || fallbackModel
}

/**
 * 函数说明：加载工具数据，保证搜索前拿到完整工具分类，避免首次检索为空。
 */
const loadAllTools = async (): Promise<Tool[]> => {
  const toolsStore = useToolsStore()
  if (!toolsStore.cates.length) {
    await toolsStore.getToolCate()
  }
  return toolsStore.getAllTools()
}

/**
 * 函数说明：组装搜索上下文工具池，先使用本地高相关候选，再补齐通用工具以平衡召回率和成本。
 */
const buildSearchToolPool = (allTools: Tool[], query: string) => {
  const localMatches = searchToolsByQuery(allTools, query, SEARCH_LOCAL_MATCH_LIMIT)
  const contextTools = mergeToolSuggestions([localMatches, allTools], SEARCH_CONTEXT_LIMIT)
  return { localMatches, contextTools }
}

/**
 * 函数说明：提取回答中命中的工具，便于在 AI 回答基础上补充更稳妥的推荐列表。
 */
const extractMentionedTools = (content: string, allTools: Tool[]): Tool[] => {
  if (!content) return []
  return allTools.filter(tool => tool.title && content.includes(tool.title))
}

/**
 * 函数说明：将工具数据转换为前端建议格式，统一推荐项数据结构。
 */
const mapSuggestions = (tools: Tool[]) => {
  return tools.map(tool => ({
    title: tool.title,
    description: tool.desc || '',
    url: tool.url
  }))
}

/**
 * 函数说明：构建本地兜底搜索响应，当 AI 服务不可用时仍返回可点击的工具建议。
 */
const buildLocalFallbackResponse = (
  query: string,
  localMatches: Tool[],
  reason: string = 'AI服务暂时不可用，已为你返回本地搜索结果。'
): AISearchResponse => {
  const suggestions = mapSuggestions(localMatches.slice(0, SEARCH_SUGGESTION_LIMIT))

  if (!suggestions.length) {
    return {
      content: `${reason}\n\n未找到与“${query}”高度匹配的工具，请尝试更具体的关键词，例如“PDF压缩”“JSON格式化”“二维码生成”。`,
      suggestions: []
    }
  }

  const preview = suggestions
    .map((item, index) => `${index + 1}. ${item.title}：${item.description || '可直接打开使用'}`)
    .join('\n')

  return {
    content: `${reason}\n\n根据“${query}”为你找到以下工具：\n${preview}`,
    suggestions
  }
}

/**
 * 函数说明：创建流式 SSE 文本解析器，处理跨 chunk 的半包数据，避免流式内容丢失。
 */
const createSSEParser = (onDelta: (delta: StreamDelta) => void) => {
  let cursor = 0
  let pendingLine = ''

  return (responseText: string) => {
    const appendedText = responseText.slice(cursor)
    if (!appendedText) return
    cursor = responseText.length

    const mergedText = pendingLine + appendedText
    const lines = mergedText.split('\n')
    pendingLine = lines.pop() || ''

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine.startsWith('data: ')) continue

      const payload = trimmedLine.replace('data: ', '').trim()
      if (!payload || payload === '[DONE]') continue

      try {
        const data = JSON.parse(payload)
        const delta = data?.choices?.[0]?.delta
        if (!delta) continue
        onDelta({
          content: delta.content,
          reasoning_content: delta.reasoning_content
        })
      } catch {
        // 忽略非完整 JSON 行，等待后续 chunk 拼接
      }
    }
  }
}

/**
 * 函数说明：执行 AI 搜索，统一通过后台 AI Provider 代理完成增强搜索。
 */
export const searchWithAI = async (
  query: string,
  onUpdate?: (data: { content?: string; reasoning_content?: string }) => void
): Promise<AISearchResponse> => {
  const safeQuery = query.trim()
  if (!safeQuery) {
    return {
      content: '请输入搜索关键词',
      suggestions: []
    }
  }

  debugTimeStart('AI搜索')
  try {
    debugLog('开始AI搜索，查询内容:', safeQuery)

    const allTools = await loadAllTools()
    const { localMatches, contextTools } = buildSearchToolPool(allTools, safeQuery)

    if (!(await hasAvailableProvider())) {
      return buildLocalFallbackResponse(safeQuery, localMatches, 'AI能力未配置，已切换为本地搜索模式。')
    }

    const finalPrompt = SEARCH_SYSTEM_PROMPT.replace('{{tools}}', buildToolsPromptContext(contextTools))
    const messages = [
      {
        role: 'system',
        content: finalPrompt
      },
      {
        role: 'user',
        content: `请帮我搜索：${safeQuery}`
      }
    ]

    let fullContent = ''
    let fullReasoningContent = ''

    const parseSSE = createSSEParser((delta) => {
      const contentDelta = delta.content || ''
      const reasoningDelta = delta.reasoning_content || ''
      if (!contentDelta && !reasoningDelta) return

      fullContent += contentDelta
      fullReasoningContent += reasoningDelta
      onUpdate?.({
        content: contentDelta || undefined,
        reasoning_content: reasoningDelta || undefined
      })
    })

    const model = await getProviderModel(AI_DEFAULT_MODELS.SEARCH)

    await aiClient.post('/chat', {
      scene: 'chat',
      model,
      messages,
      temperature: 0.6,
      max_tokens: 1800,
      stream: true
    }, {
      responseType: 'text',
      onDownloadProgress: (progressEvent: any) => {
        const responseText = progressEvent?.event?.target?.responseText
        if (typeof responseText !== 'string') return
        parseSSE(responseText)
      }
    })

    const mentionedTools = extractMentionedTools(fullContent, allTools)
    const suggestions = mapSuggestions(
      mergeToolSuggestions(
        [localMatches, mentionedTools],
        SEARCH_SUGGESTION_LIMIT
      )
    )

    return {
      content: fullContent || buildLocalFallbackResponse(safeQuery, localMatches).content,
      reasoning_content: fullReasoningContent || '分析完成',
      suggestions
    }
  } catch (error) {
    debugError('AI搜索失败，降级到本地搜索:', error)
    const allTools = await loadAllTools()
    const localMatches = searchToolsByQuery(allTools, safeQuery, SEARCH_LOCAL_MATCH_LIMIT)
    return buildLocalFallbackResponse(safeQuery, localMatches)
  } finally {
    debugTimeEnd('AI搜索')
  }
}

/**
 * 函数说明：获取 AI 搜索建议，优先走后台 Provider，失败时自动降级到本地建议。
 */
export const getAISuggestions = async (query: string): Promise<string[]> => {
  const safeQuery = query.trim()
  if (!safeQuery) return []

  try {
    const allTools = await loadAllTools()
    const localMatches = searchToolsByQuery(allTools, safeQuery, SEARCH_SUGGESTION_LIMIT)

    if (!(await hasAvailableProvider())) {
      return localMatches.map(tool => tool.title).slice(0, SEARCH_SUGGESTION_LIMIT)
    }

    const contextTools = mergeToolSuggestions([localMatches, allTools], 60)
    const messages = [
      {
        role: 'system',
        content: `你是一个工具网站的搜索建议助手。基于以下工具列表，为用户提供5个相关搜索建议，每行一个：\n${buildToolsPromptContext(contextTools)}`
      },
      {
        role: 'user',
        content: `请为"${safeQuery}"提供搜索建议`
      }
    ]

    const model = await getProviderModel(AI_DEFAULT_MODELS.SUGGESTION)

    const response: any = await aiClient.post('/chat', {
      scene: 'chat',
      model,
      messages,
      temperature: 0.5,
      max_tokens: 500,
      stream: false
    })

    const aiContent = response?.choices?.[0]?.message?.content || ''
    const aiSuggestions = aiContent
      .split('\n')
      .map((item: string) => item.replace(/^\d+[.\s、-]*/, '').trim())
      .filter(Boolean)

    const mergedSuggestions = [
      ...new Set([
        ...localMatches.map(tool => tool.title),
        ...aiSuggestions
      ])
    ]

    return mergedSuggestions.slice(0, SEARCH_SUGGESTION_LIMIT)
  } catch (error) {
    debugError('获取AI建议失败，降级到本地建议:', error)
    const allTools = await loadAllTools()
    return searchToolsByQuery(allTools, safeQuery, SEARCH_SUGGESTION_LIMIT)
      .map(tool => tool.title)
      .slice(0, SEARCH_SUGGESTION_LIMIT)
  }
}

/**
 * 函数说明：通用 AI 写作生成，统一通过后台 Provider 代理输出流式文本。
 */
export const generateAIWriting = async (
  params: {
    prompt: string
    systemPrompt?: string
    model?: string
    temperature?: number
  },
  onUpdate?: (content: string) => void
): Promise<string> => {
  try {
    debugTimeStart('AI写作')

    const provider = await getCurrentAiProvider()
    if (!provider.available) {
      throw new Error('AI能力未配置，请先到后台 AI 模型管理中启用可用 Provider')
    }

    const messages = [
      {
        role: 'system',
        content: params.systemPrompt || '你是一个专业的AI写作助手，请根据用户的要求生成高质量的内容。'
      },
      {
        role: 'user',
        content: params.prompt
      }
    ]

    let fullContent = ''
    const parseSSE = createSSEParser((delta) => {
      const contentDelta = delta.content || ''
      if (!contentDelta) return
      fullContent += contentDelta
      onUpdate?.(contentDelta)
    })

    await aiClient.post('/chat', {
      scene: 'chat',
      model: params.model || provider.defaultModel,
      messages,
      temperature: params.temperature || 0.7,
      max_tokens: 4000,
      stream: true
    }, {
      responseType: 'text',
      onDownloadProgress: (progressEvent: any) => {
        const responseText = progressEvent?.event?.target?.responseText
        if (typeof responseText !== 'string') return
        parseSSE(responseText)
      }
    })

    return fullContent
  } catch (error) {
    debugError('AI写作失败:', error)
    if (error instanceof Error) {
      throw new Error(`生成失败: ${error.message}`)
    }
    throw new Error('生成失败，请稍后重试')
  } finally {
    debugTimeEnd('AI写作')
  }
}

export default {
  searchWithAI,
  getAISuggestions,
  generateAIWriting
}
