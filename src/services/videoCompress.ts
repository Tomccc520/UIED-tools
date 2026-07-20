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
  onUploadProgress?: (progress: number) => void
}

const DEFAULT_SERVER_CONFIG: VideoCompressServerConfig = {
  available: false,
  maxSizeMB: 220,
  outputFormat: 'MP4',
  videoCodec: 'H.264',
  audioCodec: 'AAC',
  maxResolution: 1920,
  maxFrameRate: 30,
  crf: 28,
  audioBitrate: '128K',
  concurrency: 1
}

/**
 * 函数说明：从 Content-Disposition 中解析服务端下载文件名。
 */
export const parseVideoCompressFileName = (headerValue: unknown, fallbackName: string) => {
  const raw = String(headerValue || '').trim()
  const utf8Match = raw.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1])
    } catch {
      return utf8Match[1]
    }
  }
  const plainMatch = raw.match(/filename="?([^";]+)"?/i)
  return plainMatch?.[1]?.trim() || fallbackName
}

/**
 * 函数说明：将响应头布尔值规范化为压缩状态。
 */
export const parseVideoCompressBoolean = (value: unknown) => {
  return String(value || '').trim().toLowerCase() === 'true'
}

/**
 * 函数说明：读取服务端 FFmpeg 视频压缩能力，失败时返回不可用配置。
 */
export const getVideoCompressServerConfig = async (): Promise<VideoCompressServerConfig> => {
  try {
    const response = await axios.get(VIDEO_COMPRESS_CONFIG_ENDPOINT, { timeout: 5000 })
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
      concurrency: Number(payload.concurrency || DEFAULT_SERVER_CONFIG.concurrency)
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
  const response = await axios.post(VIDEO_COMPRESS_ENDPOINT, formData, {
    responseType: 'blob',
    timeout: 0,
    signal: options.signal,
    onUploadProgress: (event) => {
      if (!event.total) return
      const progress = Math.min(100, Math.round((event.loaded / event.total) * 100))
      options.onUploadProgress?.(progress)
    }
  })

  const contentType = String(response.headers['content-type'] || '')
  if (contentType.includes('application/json')) {
    const text = await response.data.text()
    let message = '服务端视频压缩失败'
    try {
      message = JSON.parse(text)?.msg || message
    } catch {
      message = text || message
    }
    throw new Error(message)
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
