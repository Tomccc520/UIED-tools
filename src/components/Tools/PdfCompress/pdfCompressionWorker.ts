/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-29
 */
import type { PdfCompressionNotice, PdfStructureMode } from './pdfImageCompression'

interface PdfCompressionResult {
  blob: Blob
  images: number
  notice?: PdfCompressionNotice
}

/** 按需创建压缩 Worker，返回产物、实际优化的图片数及保护原因，结束时释放 WASM 内存。 */
export const compressPdfStructure = (file: File, signal: AbortSignal, mode: PdfStructureMode): Promise<PdfCompressionResult> => new Promise((resolve, reject) => {
  if (signal.aborted) { reject(new Error('已取消 PDF 压缩')); return }
  const worker = new Worker(new URL('./pdfCompression.worker.ts', import.meta.url), { type: 'module' })
  /** 每个文件使用独立线程，结束时清理事件与整个虚拟文件系统。 */
  const cleanup = () => { signal.removeEventListener('abort', onAbort); worker.terminate() }
  /** 取消时立即释放 CPU 和内存，不等待同步 WASM 自行结束。 */
  const onAbort = () => { cleanup(); reject(new Error('已取消 PDF 压缩')) }
  signal.addEventListener('abort', onAbort, { once: true })
  worker.onmessage = (event: MessageEvent<{ ok: boolean; data?: Uint8Array; message?: string; images: number; notice?: PdfCompressionNotice }>) => {
    cleanup()
    const { ok, data, images, notice, message } = event.data
    if (!ok) {
      reject(new Error(message || 'PDF 压缩失败，请重试'))
      return
    }
    const blob = data?.byteLength ? new Blob([data as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }) : file
    resolve({ blob, images, notice })
  }
  worker.onerror = () => { cleanup(); reject(new Error('PDF 压缩引擎加载失败，请重试')) }
  worker.postMessage({ file, mode })
})
