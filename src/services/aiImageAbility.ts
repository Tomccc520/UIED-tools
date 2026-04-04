/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

export interface AiImageAbilityCurrent {
  available: boolean
  ability: string
  label: string
  description: string
  method: 'GET' | 'POST'
  timeoutSeconds: number
}

export interface AiImageAbilityRequest {
  ability: string
  method?: 'GET' | 'POST'
  query?: Record<string, any>
  body?: FormData | Record<string, any> | string | Blob | null
  headers?: Record<string, string>
  signal?: AbortSignal
}

interface AbilityCacheState {
  value: AiImageAbilityCurrent
  expiresAt: number
}

const CURRENT_ENDPOINT = '/api/common/ai/image/current'
const PROXY_ENDPOINT = '/api/common/ai/image/proxy'
const IMAGE_ABILITY_CACHE_TTL_MS = 5 * 60 * 1000
const IMAGE_ABILITY_FAIL_CACHE_TTL_MS = 30 * 1000

const abilityCacheMap = new Map<string, AbilityCacheState>()
const abilityPromiseMap = new Map<string, Promise<AiImageAbilityCurrent>>()

/**
 * 函数说明：构造图片 AI 能力空态，确保前端在后台未配置时也能稳定降级展示。
 */
const createEmptyImageAbility = (ability = ''): AiImageAbilityCurrent => ({
  available: false,
  ability,
  label: '',
  description: '',
  method: 'POST',
  timeoutSeconds: 90
})

/**
 * 函数说明：序列化查询参数，自动跳过空值，供图片 AI 代理接口拼接查询串。
 */
const buildQueryString = (query: Record<string, any> = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }
    searchParams.append(key, String(value))
  })
  return searchParams.toString()
}

/**
 * 函数说明：解析图片 AI 能力返回数据，兼容标准包装与直接对象两种格式。
 */
const extractImageAbilityPayload = (payload: unknown, ability = ''): AiImageAbilityCurrent => {
  if (!payload || typeof payload !== 'object') {
    return createEmptyImageAbility(ability)
  }

  const record = payload as Record<string, any>
  const source = (record.data && typeof record.data === 'object' ? record.data : record) as Record<string, any>
  const method = typeof source.method === 'string' ? source.method.toUpperCase() : 'POST'

  return {
    available: Boolean(source.available),
    ability: typeof source.ability === 'string' && source.ability.trim() ? source.ability.trim() : ability,
    label: typeof source.label === 'string' ? source.label.trim() : '',
    description: typeof source.description === 'string' ? source.description.trim() : '',
    method: method === 'GET' ? 'GET' : 'POST',
    timeoutSeconds: Number(source.timeoutSeconds || 90)
  }
}

/**
 * 函数说明：从后端读取当前图片 AI 能力配置，失败时由上层统一兜底。
 */
const fetchCurrentAiImageAbility = async (ability: string): Promise<AiImageAbilityCurrent> => {
  const endpoint = `${CURRENT_ENDPOINT}?ability=${encodeURIComponent(ability)}`
  const response = await fetch(endpoint, { method: 'GET' })
  if (!response.ok) {
    throw new Error(`获取图片 AI 能力配置失败（HTTP ${response.status}）`)
  }
  const payload = await response.json()
  return extractImageAbilityPayload(payload, ability)
}

/**
 * 函数说明：获取当前图片 AI 能力信息，带短期缓存，减少多个工具页初始化重复请求。
 */
export const getCurrentAiImageAbility = async (
  options: { ability: string; forceRefresh?: boolean }
): Promise<AiImageAbilityCurrent> => {
  const ability = options.ability.trim()
  const now = Date.now()
  const cacheState = abilityCacheMap.get(ability) || null
  const cachedPromise = abilityPromiseMap.get(ability) || null

  if (!options.forceRefresh && cacheState && cacheState.expiresAt > now) {
    return cacheState.value
  }

  if (!options.forceRefresh && cachedPromise) {
    return cachedPromise
  }

  const nextPromise = (async () => {
    try {
      const current = await fetchCurrentAiImageAbility(ability)
      abilityCacheMap.set(ability, {
        value: current,
        expiresAt: Date.now() + IMAGE_ABILITY_CACHE_TTL_MS
      })
      return current
    } catch {
      const fallback = createEmptyImageAbility(ability)
      abilityCacheMap.set(ability, {
        value: fallback,
        expiresAt: Date.now() + IMAGE_ABILITY_FAIL_CACHE_TTL_MS
      })
      return fallback
    } finally {
      abilityPromiseMap.delete(ability)
    }
  })()

  abilityPromiseMap.set(ability, nextPromise)
  return nextPromise
}

/**
 * 函数说明：解析图片 AI 代理接口的错误信息，优先提取后端或上游返回的可读文案。
 */
export const parseAiImageAbilityErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.clone().json()
    const message = data?.msg || data?.message || data?.error?.message || data?.detail
    if (typeof message === 'string' && message.trim()) {
      return message.trim()
    }
  } catch {
    // 忽略 JSON 解析错误，继续尝试文本兜底
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

  return `图片 AI 请求失败（HTTP ${response.status}）`
}

/**
 * 函数说明：统一调用后端图片 AI 代理接口，支持 GET 查询和 POST 表单/JSON 两种模式。
 */
export const requestAiImageAbility = async (payload: AiImageAbilityRequest): Promise<Response> => {
  const method = payload.method || 'POST'
  const queryString = buildQueryString({ ability: payload.ability, ...(payload.query || {}) })
  const endpoint = queryString ? `${PROXY_ENDPOINT}?${queryString}` : PROXY_ENDPOINT

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(payload.headers || {})
  }

  let body: BodyInit | undefined
  if (method === 'POST' && payload.body !== undefined && payload.body !== null) {
    if (payload.body instanceof FormData || payload.body instanceof Blob || typeof payload.body === 'string') {
      body = payload.body as BodyInit
    } else {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json'
      body = JSON.stringify(payload.body)
    }
  }

  if (body instanceof FormData) {
    delete headers['Content-Type']
  }

  return fetch(endpoint, {
    method,
    headers,
    body,
    signal: payload.signal
  })
}
