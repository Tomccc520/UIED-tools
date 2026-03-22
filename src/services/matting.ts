/**
 * @file matting.ts
 * @description AI 抠图接口调用封装
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-21
 */

export type MattingModelId = 'iic/cv_unet_image-matting' | 'iic/cv_unet_universal-matting'

export interface RequestMattingOptions {
  timeoutMs?: number
  endpoint?: string
  modelId?: string
  modelConfigEndpoint?: string
  modelConfigTimeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 300000
const DEFAULT_ENDPOINT = '/api/matting/matting'
const DEFAULT_MODEL_CONFIG_ENDPOINT = '/api/common/ai/model/current'
const DEFAULT_MODEL_CONFIG_TIMEOUT_MS = 2500
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000
const MODEL_FAIL_CACHE_TTL_MS = 30 * 1000
const DEFAULT_MODEL_ID: MattingModelId = 'iic/cv_unet_universal-matting'
const SUPPORTED_MODEL_IDS: MattingModelId[] = [
  'iic/cv_unet_image-matting',
  'iic/cv_unet_universal-matting'
]
const SUPPORTED_MODEL_ID_SET = new Set(SUPPORTED_MODEL_IDS)

type ModelCacheState = {
  modelId: MattingModelId
  expiresAt: number
}

let modelCacheState: ModelCacheState | null = null
let modelPromise: Promise<MattingModelId> | null = null

/**
 * 函数说明：校验模型ID是否在可用白名单中
 */
const isSupportedModelId = (modelId: string): modelId is MattingModelId => {
  return SUPPORTED_MODEL_ID_SET.has(modelId as MattingModelId)
}

/**
 * 函数说明：标准化模型ID，非法值会回退为空字符串
 */
const normalizeModelId = (modelId: unknown): string => {
  if (typeof modelId !== 'string') return ''
  const normalized = modelId.trim()
  return isSupportedModelId(normalized) ? normalized : ''
}

/**
 * 函数说明：从后端响应中提取模型ID，兼容多种响应包装结构
 */
const extractModelIdFromPayload = (payload: unknown): string => {
  if (!payload || typeof payload !== 'object') return ''
  const record = payload as Record<string, any>
  const candidates = [
    record.modelId,
    record.currentModelId,
    record?.current?.modelId,
    record?.data?.modelId,
    record?.data?.currentModelId,
    record?.data?.current?.modelId
  ]
  for (const candidate of candidates) {
    const normalized = normalizeModelId(candidate)
    if (normalized) {
      return normalized
    }
  }
  return ''
}

/**
 * 函数说明：解析接口错误响应，优先提取后端返回的可读错误信息
 */
const parseApiErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json()
    const detail = data?.detail || data?.msg || data?.message
    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }
  } catch {
    // 忽略 JSON 解析错误，继续尝试解析文本
  }

  try {
    const text = await response.text()
    const trimmed = text.trim()
    if (trimmed) {
      if (trimmed.includes('<html') || trimmed.includes('<!doctype html')) {
        return `抠图服务异常（HTTP ${response.status}），请检查 matting-service 是否已启动`
      }
      return `抠图服务异常（HTTP ${response.status}）：${trimmed.slice(0, 120)}`
    }
  } catch {
    // 忽略文本解析错误，走兜底文案
  }

  if (response.status >= 500) {
    return `抠图服务异常（HTTP ${response.status}），请检查 matting-service 日志后重试`
  }

  return `抠图请求失败（HTTP ${response.status}）`
}

/**
 * 函数说明：请求后端当前模型配置，失败时抛出错误供上层统一兜底
 */
const fetchCurrentModelId = async (endpoint: string, timeoutMs: number): Promise<MattingModelId> => {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal
    })
    if (!response.ok) {
      throw new Error(`获取模型配置失败（HTTP ${response.status}）`)
    }

    const payload = await response.json()
    const modelId = extractModelIdFromPayload(payload)
    if (!modelId) {
      throw new Error('模型配置返回格式异常')
    }
    return modelId as MattingModelId
  } finally {
    window.clearTimeout(timer)
  }
}

/**
 * 函数说明：获取当前生效的抠图模型ID，带短期缓存与失败降级
 */
export const getCurrentMattingModelId = async (
  options: { endpoint?: string; timeoutMs?: number; forceRefresh?: boolean } = {}
): Promise<MattingModelId> => {
  const endpoint = options.endpoint || DEFAULT_MODEL_CONFIG_ENDPOINT
  const timeoutMs = options.timeoutMs ?? DEFAULT_MODEL_CONFIG_TIMEOUT_MS
  const now = Date.now()

  if (!options.forceRefresh && modelCacheState && modelCacheState.expiresAt > now) {
    return modelCacheState.modelId
  }

  if (!options.forceRefresh && modelPromise) {
    return modelPromise
  }

  modelPromise = (async () => {
    try {
      const modelId = await fetchCurrentModelId(endpoint, timeoutMs)
      modelCacheState = {
        modelId,
        expiresAt: Date.now() + MODEL_CACHE_TTL_MS
      }
      return modelId
    } catch {
      modelCacheState = {
        modelId: DEFAULT_MODEL_ID,
        expiresAt: Date.now() + MODEL_FAIL_CACHE_TTL_MS
      }
      return DEFAULT_MODEL_ID
    } finally {
      modelPromise = null
    }
  })()

  return modelPromise
}

/**
 * 函数说明：提前预热模型配置缓存，减少用户首次点击时的等待
 */
export const warmupMattingModelId = async (): Promise<void> => {
  await getCurrentMattingModelId()
}

/**
 * 函数说明：调用 AI 抠图接口并返回透明 PNG Blob
 */
export const requestMattingImage = async (
  file: File,
  options: RequestMattingOptions = {}
): Promise<Blob> => {
  const endpoint = options.endpoint || DEFAULT_ENDPOINT
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const modelConfigEndpoint = options.modelConfigEndpoint || DEFAULT_MODEL_CONFIG_ENDPOINT
  const modelConfigTimeoutMs = options.modelConfigTimeoutMs ?? DEFAULT_MODEL_CONFIG_TIMEOUT_MS
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const configuredModelId = normalizeModelId(options.modelId)
    const modelId =
      configuredModelId ||
      (await getCurrentMattingModelId({
        endpoint: modelConfigEndpoint,
        timeoutMs: modelConfigTimeoutMs
      }))

    const formData = new FormData()
    formData.append('file', file)
    formData.append('modelId', modelId)

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
      throw new Error('无法连接抠图服务，请先启动 matting-service 后再重试')
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('抠图失败，请稍后重试')
  } finally {
    window.clearTimeout(timer)
  }
}
