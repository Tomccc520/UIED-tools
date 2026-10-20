/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import Compressor from 'compressorjs'

export interface BrowserImageCompressionOptions {
  quality: number
  preserveDimensions: boolean
  signal?: AbortSignal
}

type BrowserImageCompressionErrorCode = 'unsupported' | 'decode' | 'timeout' | 'aborted' | 'invalid-options'
type BrowserImageMimeType = 'image/jpeg' | 'image/webp'

export class BrowserImageCompressionError extends Error {
  /** 创建可直接展示给用户的压缩错误，保留错误类别供调用方区分取消与失败。 */
  constructor(public readonly code: BrowserImageCompressionErrorCode, message: string) {
    super(message)
    this.name = 'BrowserImageCompressionError'
  }
}

const COMPRESSION_TIMEOUT_MS = 90_000
const RESIZED_MAX_EDGE = 4096

/**
 * 压缩 JPEG/WebP，默认保留原尺寸；可选最长边 4096 像素，并校验真实输出 MIME。
 * @param file 原始图片，缺少 MIME 时使用调用方已识别的格式补齐。
 * @param mimeType 期望保留的 JPEG/WebP 格式。
 * @param options 本次任务的独立质量、尺寸与取消配置。
 * @returns 可下载的图片 Blob；无法编码、超时或取消时抛出中文业务错误。
 */
export function compressBrowserImage(
  file: File,
  mimeType: BrowserImageMimeType,
  options: BrowserImageCompressionOptions
): Promise<Blob> {
  if (!Number.isFinite(options.quality)) {
    return Promise.reject(new BrowserImageCompressionError('invalid-options', '压缩质量无效，请重新设置后重试'))
  }
  if (mimeType !== 'image/jpeg' && mimeType !== 'image/webp') {
    return Promise.reject(new BrowserImageCompressionError('unsupported', '当前浏览器不支持该图片格式，请更换图片后重试'))
  }
  if (options.signal?.aborted) {
    return Promise.reject(new BrowserImageCompressionError('aborted', '图片压缩已取消'))
  }

  // MIME 已正确时保留 File 身份，以便页面准确识别 Compressor 的原图回退结果。
  const source = file.type === mimeType ? file : new Blob([file], { type: mimeType })
  const quality = Math.max(0, Math.min(100, options.quality)) / 100
  const preserveDimensions = options.preserveDimensions !== false
  const signal = options.signal
  const formatLabel = mimeType === 'image/jpeg' ? 'JPG' : 'WebP'

  return new Promise<Blob>((resolve, reject) => {
    let compressor: Compressor | undefined
    let settled = false
    let abortRequested = false
    let timeout: ReturnType<typeof setTimeout> | undefined

    /** 清除当前任务的超时与取消监听，避免批量任务累积监听或处理已完成的图片。 */
    const cleanup = () => {
      if (timeout !== undefined) clearTimeout(timeout)
      signal?.removeEventListener('abort', handleAbort)
    }

    /** 中止底层读取/编码；构造函数同步回调期间尚无实例时延后执行。 */
    const abortCompressor = () => {
      abortRequested = true
      if (!compressor) return
      try {
        compressor.abort()
      } catch {
        // 已经结束的底层实例可能拒绝重复终止，业务 Promise 的结论保持不变。
      }
    }

    /** 仅结算一次失败，先移除监听再中止，避免 abort 触发 error 时覆盖原始失败类型。 */
    const fail = (error: BrowserImageCompressionError, abort = false) => {
      if (settled) return
      settled = true
      cleanup()
      if (abort) abortCompressor()
      reject(error)
    }

    /** 响应调用方取消，让页面卸载后及时结束当前图片任务。 */
    function handleAbort() {
      fail(new BrowserImageCompressionError('aborted', '图片压缩已取消'), true)
    }

    timeout = setTimeout(() => {
      fail(new BrowserImageCompressionError('timeout', '图片压缩超时，请降低图片尺寸后重试'), true)
    }, COMPRESSION_TIMEOUT_MS)
    signal?.addEventListener('abort', handleAbort, { once: true })

    try {
      compressor = new Compressor(source, {
        strict: true,
        quality,
        mimeType,
        convertSize: Infinity,
        ...(preserveDimensions ? {} : { maxWidth: RESIZED_MAX_EDGE, maxHeight: RESIZED_MAX_EDGE }),
        /** 验证格式与文件非空，拒绝浏览器不支持目标格式时产生的 PNG 回退。 */
        success(result) {
          if (settled) return
          if (!result || result.size === 0) {
            fail(new BrowserImageCompressionError('decode', '压缩失败，未生成有效图片，请重试或更换图片'))
            return
          }
          if (result.type !== mimeType) {
            fail(new BrowserImageCompressionError('unsupported', `当前浏览器不支持导出 ${formatLabel}，请更换浏览器后重试`))
            return
          }
          settled = true
          cleanup()
          resolve(result)
        },
        /** 将底层读取/解码错误转换为中文反馈，避免向用户暴露内部错误信息。 */
        error() {
          fail(new BrowserImageCompressionError('decode', '压缩失败，图片可能已损坏，请移除后重新选择或重试'))
        }
      })
      if (abortRequested) abortCompressor()
    } catch {
      fail(new BrowserImageCompressionError('decode', '压缩失败，图片可能已损坏或浏览器无法处理，请重试'))
    }
  })
}
