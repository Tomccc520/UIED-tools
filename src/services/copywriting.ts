/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-30
 */

export type CopywritingKind =
  | 'yiyan'
  | 'kfc'
  | 'poison-soup'
  | 'daily-poem'
  | 'funny'
  | 'inspiring'
  | 'moments'
  | 'comfort'
  | 'dog-diary'
  | 'cloud-music'

export interface CopywritingTextResult {
  text: string
  source: 'upstream' | 'fallback' | string
  title?: string
  author?: string
  from?: string
}

const COPYWRITING_ENDPOINTS: Record<CopywritingKind, string> = {
  yiyan: '/api/common/copywriting/yiyan',
  kfc: '/api/common/copywriting/kfc',
  'poison-soup': '/api/common/copywriting/random/poison-soup',
  'daily-poem': '/api/common/copywriting/random/daily-poem',
  funny: '/api/common/copywriting/random/funny',
  inspiring: '/api/common/copywriting/random/inspiring',
  moments: '/api/common/copywriting/random/moments',
  comfort: '/api/common/copywriting/random/comfort',
  'dog-diary': '/api/common/copywriting/random/dog-diary',
  'cloud-music': '/api/common/copywriting/random/cloud-music'
}

const COPYWRITING_TRANSLATE_ENDPOINT = '/api/common/copywriting/translate'

/**
 * 函数说明：从 Go API 的标准响应或兼容的直接响应中提取随机文案结果。
 */
const extractCopywritingResult = (payload: unknown): CopywritingTextResult => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('文案接口返回格式不正确')
  }

  const record = payload as Record<string, any>
  const source = record.data && typeof record.data === 'object' ? record.data : record
  const text = typeof source.text === 'string' ? source.text.trim() : ''
  if (!text) {
    throw new Error(typeof record.msg === 'string' && record.msg.trim() ? record.msg.trim() : '文案接口未返回内容')
  }

  const result: CopywritingTextResult = {
    text,
    source: typeof source.source === 'string' ? source.source : 'upstream'
  }
  if (typeof source.title === 'string' && source.title.trim()) {
    result.title = source.title.trim()
  }
  if (typeof source.author === 'string' && source.author.trim()) {
    result.author = source.author.trim()
  }
  if (typeof source.from === 'string' && source.from.trim()) {
    result.from = source.from.trim()
  }
  return result
}

/**
 * 函数说明：通过同域 Go API 获取随机文案，避免浏览器直接请求不稳定的第三方接口。
 */
export const fetchCopywritingText = async (kind: CopywritingKind, signal?: AbortSignal): Promise<CopywritingTextResult> => {
  const endpoint = COPYWRITING_ENDPOINTS[kind]
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal
  })

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error(`文案接口响应无法解析（HTTP ${response.status}）`)
  }

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && typeof (payload as Record<string, any>).msg === 'string'
      ? String((payload as Record<string, any>).msg).trim()
      : ''
    throw new Error(message || `文案接口请求失败（HTTP ${response.status}）`)
  }

  return extractCopywritingResult(payload)
}

/**
 * 函数说明：通过同域 Go API 翻译文案，避免生产环境直接访问第三方翻译服务。
 */
export const fetchCopywritingTranslation = async (text: string, signal?: AbortSignal): Promise<string> => {
  const endpoint = `${COPYWRITING_TRANSLATE_ENDPOINT}?text=${encodeURIComponent(text)}`
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal
  })

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new Error(`翻译接口响应无法解析（HTTP ${response.status}）`)
  }

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && typeof (payload as Record<string, any>).msg === 'string'
      ? String((payload as Record<string, any>).msg).trim()
      : ''
    throw new Error(message || `翻译接口请求失败（HTTP ${response.status}）`)
  }

  return extractCopywritingResult(payload).text
}
