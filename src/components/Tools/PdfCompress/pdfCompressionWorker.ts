/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-29
 */

/** 按需创建 PDF 结构压缩 Worker，支持取消并在完成后释放 WASM 内存。 */
export const compressPdfStructure = (file: File, signal: AbortSignal): Promise<Blob> => new Promise((resolve, reject) => {
  if (signal.aborted) { reject(new Error('已取消 PDF 压缩')); return }
  const worker = new Worker(new URL('./pdfCompression.worker.ts', import.meta.url), { type: 'module' })
  /** 每个文件使用独立线程，结束时清理事件与整个虚拟文件系统。 */
  const cleanup = () => { signal.removeEventListener('abort', onAbort); worker.terminate() }
  /** 取消时立即释放 CPU 和内存，不等待同步 WASM 自行结束。 */
  const onAbort = () => { cleanup(); reject(new Error('已取消 PDF 压缩')) }
  signal.addEventListener('abort', onAbort, { once: true })
  worker.onmessage = (event: MessageEvent<{ ok: boolean; data?: Uint8Array; message?: string }>) => {
    cleanup()
    if (!event.data.ok || !event.data.data?.byteLength) reject(new Error(event.data.message || 'PDF 压缩失败，请重试'))
    else resolve(new Blob([new Uint8Array(event.data.data).buffer], { type: 'application/pdf' }))
  }
  worker.onerror = () => { cleanup(); reject(new Error('PDF 压缩引擎加载失败，请重试')) }
  worker.postMessage(file)
})
