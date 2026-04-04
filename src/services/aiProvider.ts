/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

export interface AiProviderModelOption {
  label: string
  value: string
  desc: string
  maxTokens: number
}

export interface AiProviderCurrent {
  available: boolean
  scene: string
  provider: string
  label: string
  description: string
  defaultModel: string
  models: AiProviderModelOption[]
}

export interface AiProviderChatMessage {
  role: string
  content: string
}

export interface AiProviderChatRequest {
  scene?: string
  model?: string
  messages: AiProviderChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
  presence_penalty?: number
  frequency_penalty?: number
  top_p?: number
  extra_options?: Record<string, any>
  overrideApiKey?: string
  signal?: AbortSignal
}

interface ProviderCacheState {
  value: AiProviderCurrent
  expiresAt: number
}

const DEFAULT_SCENE = 'chat'
const CURRENT_ENDPOINT = '/api/common/ai/provider/current'
const CHAT_ENDPOINT = '/api/common/ai/provider/chat'
const PROVIDER_CACHE_TTL_MS = 5 * 60 * 1000
const PROVIDER_FAIL_CACHE_TTL_MS = 30 * 1000

const providerCacheMap = new Map<string, ProviderCacheState>()
const providerPromiseMap = new Map<string, Promise<AiProviderCurrent>>()

/**
 * 函数说明：构造文本 AI Provider 的空态返回，保证前端在未配置时也能稳定降级。
 */
const createEmptyProvider = (): AiProviderCurrent => ({
  available: false,
  scene: DEFAULT_SCENE,
  provider: '',
  label: '',
  description: '',
  defaultModel: '',
  models: []
})

/**
 * 函数说明：从后端响应中提取 Provider 配置，兼容直接返回与标准包装两种格式。
 */
const extractProviderPayload = (payload: unknown): AiProviderCurrent => {
  if (!payload || typeof payload !== 'object') {
    return createEmptyProvider()
  }

  const record = payload as Record<string, any>
  const source = (record.data && typeof record.data === 'object' ? record.data : record) as Record<string, any>
  const models = Array.isArray(source.models)
    ? source.models.map((item: any) => ({
        label: String(item?.label || item?.value || ''),
        value: String(item?.value || ''),
        desc: String(item?.desc || ''),
        maxTokens: Number(item?.maxTokens || 0)
      })).filter((item: AiProviderModelOption) => item.value)
    : []

  return {
    available: Boolean(source.available),
    scene: typeof source.scene === 'string' && source.scene.trim() ? source.scene.trim() : DEFAULT_SCENE,
    provider: typeof source.provider === 'string' ? source.provider.trim() : '',
    label: typeof source.label === 'string' ? source.label.trim() : '',
    description: typeof source.description === 'string' ? source.description.trim() : '',
    defaultModel: typeof source.defaultModel === 'string' ? source.defaultModel.trim() : '',
    models
  }
}

/**
 * 函数说明：读取当前文本 AI Provider 配置，失败时返回空态，避免页面初始化直接抛错。
 */
const fetchCurrentAiProvider = async (scene: string): Promise<AiProviderCurrent> => {
  const endpoint = `${CURRENT_ENDPOINT}?scene=${encodeURIComponent(scene || DEFAULT_SCENE)}`
  const response = await fetch(endpoint, {
    method: 'GET'
  })
  if (!response.ok) {
    throw new Error(`获取 AI Provider 配置失败（HTTP ${response.status}）`)
  }
  const payload = await response.json()
  return extractProviderPayload(payload)
}

/**
 * 函数说明：获取当前文本 AI Provider，带短期缓存与失败降级，减少高频页面初始化重复请求。
 */
export const getCurrentAiProvider = async (
  options: { scene?: string; forceRefresh?: boolean } = {}
): Promise<AiProviderCurrent> => {
  const scene = options.scene || DEFAULT_SCENE
  const now = Date.now()
  const cacheState = providerCacheMap.get(scene) || null
  const cachedPromise = providerPromiseMap.get(scene) || null

  if (!options.forceRefresh && cacheState && cacheState.expiresAt > now) {
    return cacheState.value
  }

  if (!options.forceRefresh && cachedPromise) {
    return cachedPromise
  }

  const nextPromise = (async () => {
    try {
      const provider = await fetchCurrentAiProvider(scene)
      providerCacheMap.set(scene, {
        value: provider,
        expiresAt: Date.now() + PROVIDER_CACHE_TTL_MS
      })
      return provider
    } catch {
      const emptyProvider = createEmptyProvider()
      providerCacheMap.set(scene, {
        value: emptyProvider,
        expiresAt: Date.now() + PROVIDER_FAIL_CACHE_TTL_MS
      })
      return emptyProvider
    } finally {
      providerPromiseMap.delete(scene)
    }
  })()

  providerPromiseMap.set(scene, nextPromise)
  return nextPromise
}

/**
 * 函数说明：预热当前 AI Provider 配置，减少用户首次点击生成按钮时的等待。
 */
export const warmupAiProvider = async (): Promise<void> => {
  await getCurrentAiProvider()
}

/**
 * 函数说明：解析 AI Provider 代理请求的错误信息，优先提取后端或上游返回的可读文案。
 */
export const parseAiProviderErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.clone().json()
    const message = data?.msg || data?.message || data?.error?.message || data?.detail
    if (typeof message === 'string' && message.trim()) {
      return message.trim()
    }
  } catch {
    // 忽略 JSON 解析错误，继续尝试文本内容
  }

  try {
    const text = await response.clone().text()
    const trimmed = text.trim()
    if (trimmed) {
      return trimmed.slice(0, 200)
    }
  } catch {
    // 忽略文本解析错误，使用兜底文案
  }

  return `AI Provider 请求失败（HTTP ${response.status}）`
}

/**
 * 函数说明：调用后端 AI Provider 代理接口，统一承接对话、写作、搜索等文本生成请求。
 */
export const requestAiProviderChat = async (payload: AiProviderChatRequest): Promise<Response> => {
  return fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    signal: payload.signal,
    body: JSON.stringify({
      scene: payload.scene || DEFAULT_SCENE,
      model: payload.model,
      messages: payload.messages,
      temperature: payload.temperature,
      max_tokens: payload.max_tokens,
      stream: payload.stream,
      presence_penalty: payload.presence_penalty,
      frequency_penalty: payload.frequency_penalty,
      top_p: payload.top_p,
      extra_options: payload.extra_options,
      overrideApiKey: payload.overrideApiKey
    })
  })
}
