/**
 * @file matting.ts
 * @description AI 抠图 API Provider 调用封装
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-21
 */

export type MattingProviderId = 'aliyun' | 'koukoutu'

export interface RequestMattingOptions {
  timeoutMs?: number
  endpoint?: string
  provider?: MattingProviderId
  providerConfigEndpoint?: string
  providerConfigTimeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 180000
const DEFAULT_ENDPOINT = '/api/matting/matting'
const DEFAULT_PROVIDER_CONFIG_ENDPOINT = '/api/common/ai/model/current'
const DEFAULT_PROVIDER_CONFIG_TIMEOUT_MS = 2500
const PROVIDER_CACHE_TTL_MS = 5 * 60 * 1000
const PROVIDER_FAIL_CACHE_TTL_MS = 30 * 1000
const SUPPORTED_PROVIDER_IDS: MattingProviderId[] = ['aliyun', 'koukoutu']
const SUPPORTED_PROVIDER_ID_SET = new Set(SUPPORTED_PROVIDER_IDS)

type ProviderCacheState = {
  provider: MattingProviderId | ''
  expiresAt: number
}

let providerCacheState: ProviderCacheState | null = null
let providerPromise: Promise<MattingProviderId | ''> | null = null

/**
 * 函数说明：校验 Provider ID 是否为后端支持的外部抠图服务。
 */
const isSupportedProviderId = (provider: string): provider is MattingProviderId => {
  return SUPPORTED_PROVIDER_ID_SET.has(provider as MattingProviderId)
}

/**
 * 函数说明：标准化 Provider ID，非法值回退为空并交给服务端自动选择。
 */
const normalizeProviderId = (provider: unknown): MattingProviderId | '' => {
  if (typeof provider !== 'string') return ''
  const normalized = provider.trim().toLowerCase()
  return isSupportedProviderId(normalized) ? normalized : ''
}

/**
 * 函数说明：从后台兼容响应中提取抠图 Provider ID。
 */
const extractProviderIdFromPayload = (payload: unknown): MattingProviderId | '' => {
  if (!payload || typeof payload !== 'object') return ''
  const record = payload as Record<string, any>
  const candidates = [
    record.provider,
    record.providerId,
    record.modelId,
    record.currentProviderId,
    record.currentModelId,
    record?.current?.provider,
    record?.current?.modelId,
    record?.data?.provider,
    record?.data?.providerId,
    record?.data?.modelId,
    record?.data?.currentModelId,
    record?.data?.current?.provider,
    record?.data?.current?.modelId
  ]
  for (const candidate of candidates) {
    const normalized = normalizeProviderId(candidate)
    if (normalized) {
      return normalized
    }
  }
  return ''
}

/**
 * 函数说明：解析接口错误响应，优先展示服务端返回的可读说明。
 */
const parseApiErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.clone().json()
    const detail = data?.detail || data?.msg || data?.message
    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }
  } catch {
    // 忽略 JSON 解析错误，继续尝试文本响应
  }

  try {
    const text = await response.text()
    const trimmed = text.trim()
    if (trimmed && !trimmed.includes('<html') && !trimmed.includes('<!doctype html')) {
      return `抠图服务异常（HTTP ${response.status}）：${trimmed.slice(0, 120)}`
    }
  } catch {
    // 忽略文本解析错误，使用状态码兜底
  }

  if (response.status === 503) {
    return '抠图 API 尚未配置，请联系管理员完成服务商配置'
  }
  if (response.status >= 500) {
    return `抠图上游服务异常（HTTP ${response.status}），请稍后重试`
  }
  return `抠图请求失败（HTTP ${response.status}）`
}

/**
 * 函数说明：读取后台当前抠图 Provider，读取失败时交由服务端自动选择。
 */
const fetchCurrentProvider = async (
  endpoint: string,
  timeoutMs: number
): Promise<MattingProviderId | ''> => {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal
    })
    if (!response.ok) {
      return ''
    }
    return extractProviderIdFromPayload(await response.json())
  } finally {
    window.clearTimeout(timer)
  }
}

/**
 * 函数说明：获取当前抠图 Provider，并使用短期缓存减少重复配置请求。
 */
export const getCurrentMattingProvider = async (
  options: { endpoint?: string; timeoutMs?: number; forceRefresh?: boolean } = {}
): Promise<MattingProviderId | ''> => {
  const endpoint = options.endpoint || DEFAULT_PROVIDER_CONFIG_ENDPOINT
  const timeoutMs = options.timeoutMs ?? DEFAULT_PROVIDER_CONFIG_TIMEOUT_MS
  const now = Date.now()

  if (!options.forceRefresh && providerCacheState && providerCacheState.expiresAt > now) {
    return providerCacheState.provider
  }
  if (!options.forceRefresh && providerPromise) {
    return providerPromise
  }

  providerPromise = (async () => {
    try {
      const provider = await fetchCurrentProvider(endpoint, timeoutMs)
      providerCacheState = {
        provider,
        expiresAt: Date.now() + PROVIDER_CACHE_TTL_MS
      }
      return provider
    } catch {
      providerCacheState = {
        provider: '',
        expiresAt: Date.now() + PROVIDER_FAIL_CACHE_TTL_MS
      }
      return ''
    } finally {
      providerPromise = null
    }
  })()

  return providerPromise
}

/**
 * 函数说明：提前预热 Provider 配置缓存，减少首次运行时的等待。
 */
export const warmupMattingProvider = async (): Promise<void> => {
  await getCurrentMattingProvider()
}

/**
 * 函数说明：调用统一抠图代理接口并返回透明背景图片 Blob。
 */
export const requestMattingImage = async (
  file: File,
  options: RequestMattingOptions = {}
): Promise<Blob> => {
  const endpoint = options.endpoint || DEFAULT_ENDPOINT
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const providerConfigEndpoint =
    options.providerConfigEndpoint || DEFAULT_PROVIDER_CONFIG_ENDPOINT
  const providerConfigTimeoutMs =
    options.providerConfigTimeoutMs ?? DEFAULT_PROVIDER_CONFIG_TIMEOUT_MS
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const provider =
      normalizeProviderId(options.provider) ||
      (await getCurrentMattingProvider({
        endpoint: providerConfigEndpoint,
        timeoutMs: providerConfigTimeoutMs
      }))

    const formData = new FormData()
    formData.append('file', file)
    if (provider) {
      formData.append('provider', provider)
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(await parseApiErrorMessage(response))
    }
    return await response.blob()
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('抠图请求超时，请稍后重试或更换更小的图片')
    }
    if (error instanceof TypeError) {
      throw new Error('无法连接抠图 API 代理服务，请联系管理员检查服务状态')
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('抠图失败，请稍后重试')
  } finally {
    window.clearTimeout(timer)
  }
}
