/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import {
  PNG_COMPRESSION_TIMEOUT_MS,
  PngCompressionError,
  isPngCompressionErrorCode,
  type PngCompressionOptions,
  type PngCompressionRequest,
  type PngCompressionResponse,
} from './pngCompressionProtocol'

export {
  PNG_COMPRESSION_MAX_PIXELS,
  PNG_COMPRESSION_TIMEOUT_MS,
  PngCompressionError,
  type PngCompressionMode,
  type PngCompressionOptions,
} from './pngCompressionProtocol'

/** 在独立 Worker 中压缩 PNG；超时、取消或异常时结束任务并释放线程。 */
export function compressPngInWorker(
  file: File,
  options: PngCompressionOptions = { mode: 'lossless', colors: 256 },
): Promise<Blob> {
  if (options.signal?.aborted) return Promise.reject(new PngCompressionError('cancelled'))
  if (typeof Worker === 'undefined') return Promise.reject(new PngCompressionError('unsupported'))

  return new Promise<Blob>((resolve, reject) => {
    let worker: Worker | undefined
    let settled = false

    /** 回收计时器、取消监听和 Worker，避免页面离开后继续占用内存。 */
    const cleanup = (): void => {
      clearTimeout(timer)
      options.signal?.removeEventListener('abort', onAbort)
      if (worker) {
        worker.onmessage = null
        worker.onerror = null
        worker.onmessageerror = null
        worker.terminate()
      }
    }

    /** 一次性结束失败任务，统一使用可直接展示的中文错误。 */
    const fail = (error: PngCompressionError): void => {
      if (settled) return
      settled = true
      cleanup()
      reject(error)
    }

    /** 页面销毁或主动取消时立即中止后台编码。 */
    const onAbort = (): void => fail(new PngCompressionError('cancelled'))
    const timer = setTimeout(() => fail(new PngCompressionError('timeout')), PNG_COMPRESSION_TIMEOUT_MS)

    try {
      worker = new Worker(new URL('./pngCompression.worker.ts', import.meta.url), { type: 'module' })
      worker.onmessage = (event: MessageEvent<PngCompressionResponse>): void => {
        if (settled) return
        const result = event.data
        if (result?.ok === true && result.buffer instanceof ArrayBuffer && result.buffer.byteLength > 0) {
          settled = true
          cleanup()
          resolve(new Blob([result.buffer], { type: 'image/png' }))
          return
        }
        fail(new PngCompressionError(result?.ok === false && isPngCompressionErrorCode(result.code) ? result.code : 'worker'))
      }
      worker.onerror = (event: ErrorEvent): void => {
        event.preventDefault()
        fail(new PngCompressionError('worker'))
      }
      worker.onmessageerror = (): void => fail(new PngCompressionError('worker'))
      options.signal?.addEventListener('abort', onAbort, { once: true })
      if (options.signal?.aborted) {
        onAbort()
        return
      }
      const request: PngCompressionRequest = { file, mode: options.mode, colors: options.colors }
      worker.postMessage(request)
    } catch {
      fail(new PngCompressionError('worker'))
    }
  })
}
