/**
 * @file videoCompress.ts
 * @description 服务端 FFmpeg 视频压缩接口封装
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-20
 */

import axios from 'axios'

const VIDEO_COMPRESS_CONFIG_ENDPOINT = '/api/common/video/compress/config'
const VIDEO_COMPRESS_ENDPOINT = '/api/common/video/compress'
// 服务端 HTTP 写入超时为 10 分钟，前端额外保留少量收尾时间，避免网络异常时无限等待。
export const VIDEO_COMPRESS_REQUEST_TIMEOUT_MS = 10 * 60 * 1000 + 15 * 1000

export type VideoCompressSpeed = 'fast' | 'balanced'

export interface VideoCompressServerConfig {
  available: boolean
  maxSizeMB: number
  outputFormat: string
  videoCodec: string
  audioCodec: string
  maxResolution: number
  maxFrameRate: number
  crf: number
  audioBitrate: string
  concurrency: number
  defaultSpeed: VideoCompressSpeed
  preset: string
}

export interface VideoCompressServerResult {
  blob: Blob
  fileName: string
  compressed: boolean
  originalSize: number
  outputSize: number
  elapsedMs: number
}

interface CompressOptions {
  signal?: AbortSignal
  speed?: VideoCompressSpeed
  onUploadProgress?: (progress: number) => void
  onDownloadProgress?: (progress: number | null) => void
}

const DEFAULT_SERVER_CONFIG: VideoCompressServerConfig = {
  available: false,
  maxSizeMB: 500,
  outputFormat: 'MP4',
  videoCodec: 'H.264',
  audioCodec: 'AAC',
  maxResolution: 1920,
  maxFrameRate: 30,
  crf: 26,
  audioBitrate: '128K',
  concurrency: 1,
  defaultSpeed: 'fast',
  preset: 'veryfast'
}

/**
 * 函数说明：从 Content-Disposition 中解析服务端下载文件名。
 */
export const parseVideoCompressFileName = (headerValue: unknown, fallbackName: string) => {
  const raw = String(headerValue || '').trim()
  let plainName = ''
  let extendedName = ''
  // 引号内的分号属于文件名，反斜杠只用于还原 quoted-string 转义。
  const parameters = /(?:^|;)\s*(filename\*?)\s*=\s*("(?:[^"\\]|\\.)*"|[^;]*)/gi
  for (const match of raw.matchAll(parameters)) {
    const value = match[2].startsWith('"')
      ? match[2].slice(1, -1).replace(/\\(.)/g, '$1')
      : match[2].trim()
    if (match[1].toLowerCase() === 'filename*') {
      const utf8 = value.match(/^UTF-8'[^']*'(.*)$/i)
      if (!utf8) continue
      try { extendedName = decodeURIComponent(utf8[1]) } catch { /* 损坏的扩展参数回退到普通文件名。 */ }
    } else {
      plainName = value
    }
  }
  return extendedName || plainName || fallbackName
}

/**
 * 函数说明：将响应头布尔值规范化为压缩状态。
 */
export const parseVideoCompressBoolean = (value: unknown) => {
  return String(value || '').trim().toLowerCase() === 'true'
}

/** 读取压缩接口的文本错误，兼容缺少 Blob.text 的浏览器环境。 */
const readVideoResponseText = (blob: Blob): Promise<string> => {
  if (typeof blob.text === 'function') return blob.text()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('无法读取服务端响应，请稍后重试'))
    reader.readAsText(blob)
  })
}

/**
 * 函数说明：读取服务端 FFmpeg 视频压缩能力，失败时返回不可用配置。
 */
export const getVideoCompressServerConfig = async (signal?: AbortSignal): Promise<VideoCompressServerConfig> => {
  try {
    const response = await axios.get(VIDEO_COMPRESS_CONFIG_ENDPOINT, { timeout: 5000, signal })
    const payload = response.data?.data || response.data || {}
    return {
      available: Boolean(payload.available),
      maxSizeMB: Number(payload.maxSizeMB || DEFAULT_SERVER_CONFIG.maxSizeMB),
      outputFormat: String(payload.outputFormat || DEFAULT_SERVER_CONFIG.outputFormat),
      videoCodec: String(payload.videoCodec || DEFAULT_SERVER_CONFIG.videoCodec),
      audioCodec: String(payload.audioCodec || DEFAULT_SERVER_CONFIG.audioCodec),
      maxResolution: Number(payload.maxResolution || DEFAULT_SERVER_CONFIG.maxResolution),
      maxFrameRate: Number(payload.maxFrameRate || DEFAULT_SERVER_CONFIG.maxFrameRate),
      crf: Number(payload.crf || DEFAULT_SERVER_CONFIG.crf),
      audioBitrate: String(payload.audioBitrate || DEFAULT_SERVER_CONFIG.audioBitrate),
      concurrency: Number(payload.concurrency || DEFAULT_SERVER_CONFIG.concurrency),
      defaultSpeed: payload.defaultSpeed === 'balanced' ? 'balanced' : 'fast',
      preset: String(payload.preset || DEFAULT_SERVER_CONFIG.preset)
    }
  } catch {
    return { ...DEFAULT_SERVER_CONFIG }
  }
}

/**
 * 函数说明：上传视频到 FFmpeg 服务并返回压缩 Blob 与处理元数据。
 */
export const compressVideoWithServer = async (
  file: File,
  options: CompressOptions = {}
): Promise<VideoCompressServerResult> => {
  const formData = new FormData()
  formData.append('file', file, file.name)
  formData.append('speed', options.speed || 'fast')
  const response = await axios.post(VIDEO_COMPRESS_ENDPOINT, formData, {
    responseType: 'blob',
    timeout: VIDEO_COMPRESS_REQUEST_TIMEOUT_MS,
    signal: options.signal,
    onUploadProgress: (event) => {
      if (!event.total) return
      const progress = Math.min(100, Math.round((event.loaded / event.total) * 100))
      options.onUploadProgress?.(progress)
    },
    onDownloadProgress: (event) => {
      options.onDownloadProgress?.(event.total
        ? Math.min(100, Math.round(event.loaded / event.total * 100))
        : null)
    }
  }).catch(async (error: unknown) => {
    const data = (error as { response?: { data?: unknown } })?.response?.data
    if (data instanceof Blob && data.type.includes('json')) {
      let message = ''
      try {
        const payload = JSON.parse(await readVideoResponseText(data))
        if (typeof payload?.msg === 'string') message = payload.msg.trim()
      } catch {
        // 无法解析的响应交给统一网络错误提示，不把解析堆栈显示给用户。
      }
      if (message) throw new Error(message)
    }
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      throw new Error('服务端处理超时，请稍后重试，或改用浏览器本地压缩')
    }
    if (axios.isAxiosError(error) && !axios.isCancel(error)) {
      throw new Error('视频压缩请求失败，请检查网络后重试')
    }
    throw error
  })

  const contentType = String(response.headers['content-type'] || '').toLowerCase()
  if (contentType.includes('json')) {
    const text = await readVideoResponseText(response.data)
    let message = '服务端视频压缩失败'
    try {
      message = JSON.parse(text)?.msg || message
    } catch { /* 损坏的错误响应保留可读默认提示。 */ }
    throw new Error(message)
  }
  if (!(response.data instanceof Blob) || response.data.size === 0 || contentType.includes('text/')) {
    throw new Error('服务端未返回有效视频，请稍后重试')
  }

  const fallbackBaseName = file.name.replace(/\.[^/.]+$/, '') || 'video'
  const compressed = parseVideoCompressBoolean(response.headers['x-video-compressed'])
  return {
    blob: response.data,
    fileName: parseVideoCompressFileName(
      response.headers['content-disposition'],
      compressed ? `${fallbackBaseName}_compressed.mp4` : file.name
    ),
    compressed,
    originalSize: Number(response.headers['x-video-original-size'] || file.size),
    outputSize: Number(response.headers['x-video-output-size'] || response.data.size),
    elapsedMs: Number(response.headers['x-video-elapsed-ms'] || 0)
  }
}
