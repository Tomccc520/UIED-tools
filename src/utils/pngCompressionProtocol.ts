/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */

/** PNG 解码后的安全像素预算，避免小文件解压后耗尽浏览器内存。 */
export const PNG_COMPRESSION_MAX_PIXELS = 24_000_000
export const PNG_COMPRESSION_TIMEOUT_MS = 90_000

export type PngCompressionMode = 'lossless' | 'quantized'
export type PngCompressionColors = 32 | 64 | 128 | 256

export interface PngCompressionOptions {
  mode: PngCompressionMode
  colors: PngCompressionColors
  signal?: AbortSignal
}

export type PngCompressionErrorCode =
  | 'unsupported'
  | 'invalid'
  | 'too-large'
  | 'animated'
  | 'unsupported-depth'
  | 'timeout'
  | 'cancelled'
  | 'worker'

const ERROR_MESSAGES: Record<PngCompressionErrorCode, string> = {
  unsupported: '当前浏览器不支持后台 PNG 压缩，请使用新版 Chrome、Edge、Firefox 或 Safari',
  invalid: 'PNG 文件无法读取，请检查图片是否完整后重试',
  'too-large': `PNG 像素超过 ${PNG_COMPRESSION_MAX_PIXELS / 1_000_000} 百万，请先缩小图片后重试`,
  animated: '暂不支持压缩动态 PNG（APNG），请使用静态 PNG，避免丢失动画帧',
  'unsupported-depth': '这张 PNG 暂不支持减色，请选择无损压缩以保留原图',
  timeout: 'PNG 压缩超时，请重试或先缩小图片',
  cancelled: 'PNG 压缩已取消',
  worker: 'PNG 后台压缩失败，请重试或更换浏览器',
}

export class PngCompressionError extends Error {
  /** 根据固定错误码生成安全的中文提示，不透出编码库内部错误。 */
  constructor(public readonly code: PngCompressionErrorCode) {
    super(ERROR_MESSAGES[code])
    this.name = 'PngCompressionError'
  }
}

export interface PngCompressionRequest {
  file: File
  mode: PngCompressionMode
  colors: PngCompressionColors
}

export type PngCompressionResponse =
  | { ok: true; buffer: ArrayBuffer }
  | { ok: false; code: PngCompressionErrorCode }

/** 检查 Worker 返回的错误码，防止把内部错误文本直接展示给用户。 */
export function isPngCompressionErrorCode(value: unknown): value is PngCompressionErrorCode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, value)
}
