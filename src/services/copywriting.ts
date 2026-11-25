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
  if (record.code !== undefined && record.code !== 200 && record.code !== '200') {
    throw new Error(typeof record.msg === 'string' && record.msg.trim() ? record.msg.trim() : '文案服务暂不可用')
  }
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

/** 读取网关 JSON 并检查 HTTP 与业务状态；未传入调用方信号时为整个读取过程设置时限。 */
async function requestCopywriting(endpoint: string, label: string, timeout: number, signal?: AbortSignal): Promise<CopywritingTextResult> {
  const controller = signal ? undefined : new AbortController()
  const timer = controller && setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: signal ?? controller?.signal
    })
    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      throw new Error(`${label}接口响应无法解析（HTTP ${response.status}）`)
    }
    if (!response.ok) {
      const message = payload && typeof payload === 'object' && 'msg' in payload && typeof payload.msg === 'string'
        ? payload.msg.trim() : ''
      throw new Error(message || `${label}接口请求失败（HTTP ${response.status}）`)
    }
    return extractCopywritingResult(payload)
  } finally {
    clearTimeout(timer)
  }
}

/** 通过同域网关读取指定类型的随机文案，为网关两路轮询和本地降级预留时间。 */
export const fetchCopywritingText = (kind: CopywritingKind, signal?: AbortSignal): Promise<CopywritingTextResult> =>
  requestCopywriting(COPYWRITING_ENDPOINTS[kind], '文案', 4500, signal)

/** 经同域网关取得当前文案的英文译文，调用方可在切换文案时取消。 */
export const fetchCopywritingTranslation = async (text: string, signal?: AbortSignal): Promise<string> => {
  const endpoint = `${COPYWRITING_TRANSLATE_ENDPOINT}?text=${encodeURIComponent(text)}`
  return (await requestCopywriting(endpoint, '翻译', 6500, signal)).text
}
