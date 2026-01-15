/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */
import axios from 'axios'
import { useToolsStore } from '@/store/modules/tools'
import { debugLog, debugError, debugTimeStart, debugTimeEnd } from '@/utils/debug'

// AI搜索服务配置
const AI_API_CONFIG = {
  baseURL: 'https://api.siliconflow.cn/v1',
  timeout: 60000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SILICONFLOW_API_KEY}`
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

// API响应类型定义
interface ChatResponse {
  choices: Array<{
    message: {
      content: string
      role: string
      reasoning_content?: string
    }
    index: number
    finish_reason: string
  }>
}

// 创建axios实例
const aiClient = axios.create(AI_API_CONFIG)

// 请求拦截器
aiClient.interceptors.request.use(
  config => {
    // 确保每次请求都带上最新的token
    config.headers['Authorization'] = `Bearer ${import.meta.env.VITE_SILICONFLOW_API_KEY}`
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
aiClient.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求失败:', {
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
 * 执行AI搜索
 * @param query 搜索关键词
 * @param onUpdate 更新回调函数
 * @returns Promise<AISearchResponse>
 */
export const searchWithAI = async (query: string, onUpdate?: (data: { content?: string, reasoning_content?: string }) => void): Promise<AISearchResponse> => {
  try {
    debugTimeStart('AI搜索')
    debugLog('开始AI搜索，查询内容:', query)
    const toolsStore = useToolsStore()
    const allTools = toolsStore.getAllTools()

    // 构建工具列表文本
    const toolsList = allTools.map(tool =>
      `- ${tool.title}: ${tool.desc || '暂无描述'} [${tool.url}]`
    ).join('\n')

    // 替换提示词中的工具列表
    const finalPrompt = SEARCH_SYSTEM_PROMPT.replace('{{tools}}', toolsList)

    const messages = [
      {
        role: 'system',
        content: finalPrompt
      },
      {
        role: 'user',
        content: `请帮我搜索：${query}`
      }
    ]

    // 用于存储完整响应
    let fullContent = ''
    let fullReasoningContent = ''

    // 用于存储未处理完的数据
    let buffer = ''

    const response = await aiClient.post('/chat/completions', {
      model: SILICONFLOW_MODELS.DEEPSEEK_V3,
      messages,
      temperature: 0.6,
      max_tokens: 2000,
      stream: true
    }, {
      responseType: 'text',
      onDownloadProgress: (progressEvent) => {
        const newText = progressEvent.event.target.responseText.slice(buffer.length)
        buffer = progressEvent.event.target.responseText

        // 处理新增的文本
        const lines = newText.split('\n')
        let content = ''
        let reasoning = ''

        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.replace('data: ', '').trim()
              if (jsonStr && jsonStr !== '[DONE]') {
                const data = JSON.parse(jsonStr)
                if (data.choices?.[0]?.delta?.content) {
                  content += data.choices[0].delta.content
                  fullContent += data.choices[0].delta.content
                }
                if (data.choices?.[0]?.delta?.reasoning_content) {
                  reasoning += data.choices[0].delta.reasoning_content
                  fullReasoningContent += data.choices[0].delta.reasoning_content
                }
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        })

        // 只有当有新内容时才触发更新
        if (content || reasoning) {
          onUpdate?.({
            content: content || undefined,
            reasoning_content: reasoning || undefined
          })
        }
      }
    })

    // 提取建议的工具
    const suggestions = allTools
      .filter(tool => fullContent.includes(tool.title))
      .map(tool => ({
        title: tool.title,
        description: tool.desc || '',
        url: tool.url
      }))
      .slice(0, 5)

    // 记录API请求时间
    debugTimeEnd('AI搜索')
    return {
      content: fullContent || '暂无回答',
      reasoning_content: fullReasoningContent || '分析完成',
      suggestions
    }
  } catch (error) {
    debugError('AI搜索失败:', error)
    if (error instanceof Error) {
      throw new Error(`搜索失败: ${error.message}`)
    }
    throw new Error('搜索失败，请稍后重试')
  }
}

/**
 * 获取AI搜索建议
 * @param query 搜索关键词
 * @returns Promise<string[]>
 */
export const getAISuggestions = async (query: string): Promise<string[]> => {
  try {
    const toolsStore = useToolsStore()
    const allTools = toolsStore.getAllTools()

    const messages = [
      {
        role: 'system',
        content: `你是一个工具网站的搜索建议助手。基于以下工具列表，为用户提供5个相关的搜索建议，每行一个：
${allTools.map(tool => `- ${tool.title}: ${tool.desc || '暂无描述'}`).join('\n')}`
      },
      {
        role: 'user',
        content: `请为"${query}"提供搜索建议`
      }
    ]

    const response = await aiClient.post('/chat/completions', {
      model: SILICONFLOW_MODELS.DEEPSEEK_R1_DISTILL_QWEN_32B,
      messages,
      temperature: 0.5,
      max_tokens: 1000,
      stream: false
    })

    if (!response.choices || !response.choices[0]?.message?.content) {
      throw new Error('API响应格式错误')
    }

    return response.choices[0].message.content
      .split('\n')
      .filter((suggestion: string) => suggestion.trim())
      .slice(0, 5)
  } catch (error) {
    console.error('获取AI建议失败:', error)
    if (error instanceof Error) {
      throw new Error(`获取建议失败: ${error.message}`)
    }
    throw new Error('获取搜索建议失败，请稍后重试')
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
    let buffer = ''

    await aiClient.post('/chat/completions', {
      model: params.model || SILICONFLOW_MODELS.DEEPSEEK_V3,
      messages,
      temperature: params.temperature || 0.7,
      max_tokens: 4000,
      stream: true
    }, {
      responseType: 'text',
      onDownloadProgress: (progressEvent) => {
        const newText = progressEvent.event.target.responseText.slice(buffer.length)
        buffer = progressEvent.event.target.responseText

        const lines = newText.split('\n')
        let contentChunk = ''

        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.replace('data: ', '').trim()
              if (jsonStr && jsonStr !== '[DONE]') {
                const data = JSON.parse(jsonStr)
                if (data.choices?.[0]?.delta?.content) {
                  const content = data.choices[0].delta.content
                  contentChunk += content
                  fullContent += content
                }
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        })

        if (contentChunk && onUpdate) {
          onUpdate(contentChunk)
        }
      }
    })

    debugTimeEnd('AI写作')
    return fullContent
  } catch (error) {
    debugError('AI写作失败:', error)
    if (error instanceof Error) {
      throw new Error(`生成失败: ${error.message}`)
    }
    throw new Error('生成失败，请稍后重试')
  }
}

export default {
  searchWithAI,
  getAISuggestions,
  generateAIWriting
}
