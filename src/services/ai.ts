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

const SEARCH_CONTEXT_LIMIT = 80
const SEARCH_LOCAL_MATCH_LIMIT = 24
const SEARCH_SUGGESTION_LIMIT = 5

// AI搜索服务配置
const AI_API_CONFIG = {
  baseURL: 'https://api.siliconflow.cn/v1',
  timeout: 60000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SILICONFLOW_API_KEY || ''}`
  }
}

// 硅基流动模型列表
export const SILICONFLOW_MODELS = {
  // DeepSeek系列
  DEEPSEEK_V3: 'deepseek-ai/DeepSeek-V3',
  DEEPSEEK_R1: 'deepseek-ai/DeepSeek-R1',
  DEEPSEEK_R1_DISTILL_QWEN_32B: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',

  // Qwen系列
  QWEN_2_5_72B_INSTRUCT: 'Qwen/Qwen2.5-72B-Instruct',
  QWEN_2_5_CODER_32B: 'Qwen/Qwen2.5-Coder-32B-Instruct',

  // GLM系列
  GLM_4_9B_CHAT: 'THUDM/glm-4-9b-chat'
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

// 创建axios实例
const aiClient = axios.create(AI_API_CONFIG)

// 请求拦截器
aiClient.interceptors.request.use(
  config => {
    // 确保每次请求都带上最新的token
    const token = import.meta.env.VITE_SILICONFLOW_API_KEY || ''
    ;(config.headers as any).Authorization = `Bearer ${token}`
    return config
  },
  error => {
    debugError('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
aiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    debugError('API请求失败:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('请求超时，请稍后重试')
    }

    throw new Error(error.response?.data?.message || '服务器错误，请稍后重试')
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
 * 检查 AI Key 是否可用
 * @description 用于决定是否调用远端 AI 服务，避免无效请求
 * @returns 是否已配置可用密钥
 */
const hasAvailableApiKey = (): boolean => {
  return Boolean((import.meta.env.VITE_SILICONFLOW_API_KEY || '').trim())
}

/**
 * 加载工具数据
 * @description 保证搜索前拿到完整工具分类，避免首次检索为空
 * @returns 扁平化工具列表
 */
const loadAllTools = async (): Promise<Tool[]> => {
  const toolsStore = useToolsStore()
  if (!toolsStore.cates.length) {
    await toolsStore.getToolCate()
  }
  return toolsStore.getAllTools()
}

/**
 * 组装搜索上下文工具池
 * @description 先使用本地高相关候选，再补齐通用工具，平衡召回率和 Token 成本
 * @param allTools 全量工具
 * @param query 用户查询词
 * @returns 本地命中列表与模型上下文列表
 */
const buildSearchToolPool = (allTools: Tool[], query: string) => {
  const localMatches = searchToolsByQuery(allTools, query, SEARCH_LOCAL_MATCH_LIMIT)
  const contextTools = mergeToolSuggestions([localMatches, allTools], SEARCH_CONTEXT_LIMIT)
  return { localMatches, contextTools }
}

/**
 * 提取回答中命中的工具
 * @description 当 AI 回答明确提及工具标题时，用于补充推荐列表
 * @param content AI回答内容
 * @param allTools 全量工具
 * @returns 命中工具列表
 */
const extractMentionedTools = (content: string, allTools: Tool[]): Tool[] => {
  if (!content) return []
  return allTools.filter(tool => tool.title && content.includes(tool.title))
}

/**
 * 将工具数据转换为前端建议格式
 * @description 统一推荐项数据结构，避免重复映射逻辑
 * @param tools 工具列表
 * @returns 推荐项数组
 */
const mapSuggestions = (tools: Tool[]) => {
  return tools.map(tool => ({
    title: tool.title,
    description: tool.desc || '',
    url: tool.url
  }))
}

/**
 * 构建本地兜底搜索响应
 * @description 当 AI 服务不可用时仍返回可点击的工具建议
 * @param query 搜索关键词
 * @param localMatches 本地匹配结果
 * @param reason 兜底原因
 * @returns 搜索响应
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
 * 创建流式 SSE 文本解析器
 * @description 处理跨 chunk 的半包数据，避免流式内容丢失
 * @param onDelta 解析到增量文本后的回调
 * @returns 响应文本处理函数
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
 * 执行AI搜索
 * @param query 搜索关键词
 * @param onUpdate 更新回调函数
 * @returns Promise<AISearchResponse>
 */
export const searchWithAI = async (
  query: string,
  onUpdate?: (data: { content?: string, reasoning_content?: string }) => void
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

    if (!hasAvailableApiKey()) {
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

    await aiClient.post('/chat/completions', {
      model: SILICONFLOW_MODELS.DEEPSEEK_V3,
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
 * 获取AI搜索建议
 * @param query 搜索关键词
 * @returns Promise<string[]>
 */
export const getAISuggestions = async (query: string): Promise<string[]> => {
  const safeQuery = query.trim()
  if (!safeQuery) return []

  try {
    const allTools = await loadAllTools()
    const localMatches = searchToolsByQuery(allTools, safeQuery, SEARCH_SUGGESTION_LIMIT)

    if (!hasAvailableApiKey()) {
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

    const response: any = await aiClient.post('/chat/completions', {
      model: SILICONFLOW_MODELS.DEEPSEEK_R1_DISTILL_QWEN_32B,
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
 * 通用AI写作生成
 * @param params 生成参数
 * @param onUpdate 更新回调
 * @returns Promise<string>
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

    // 用于存储完整内容
    let fullContent = ''
    const parseSSE = createSSEParser((delta) => {
      const contentDelta = delta.content || ''
      if (!contentDelta) return
      fullContent += contentDelta
      onUpdate?.(contentDelta)
    })

    await aiClient.post('/chat/completions', {
      model: params.model || SILICONFLOW_MODELS.DEEPSEEK_V3,
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
