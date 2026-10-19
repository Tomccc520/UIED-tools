/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { resolvePdfEncryptionPasswords, type PdfEncryptionPasswords } from '@/utils/pdfEncryptionCore'

/**
 * 函数说明：启动独立 PDF 加密任务，提供超时和取消，并在完成后销毁 Worker 释放文档及密码。
 * @param file 待加密的 PDF 文件
 * @param passwords 打开密码与权限密码
 * @param signal 可选的取消信号
 * @returns 真正使用 AES-256 加密的 PDF 文件 Blob
 */
export const encryptPdfLocally = async (
  file: File,
  passwords: PdfEncryptionPasswords,
  signal?: AbortSignal
): Promise<Blob> => {
  const resolvedPasswords = resolvePdfEncryptionPasswords(passwords)
  if (signal?.aborted) throw new Error('已取消加密')

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../utils/pdfEncryption.worker.ts', import.meta.url), { type: 'module' })
    let finished = false
    const finish = (error?: Error, result?: Uint8Array) => {
      if (finished) return
      finished = true
      window.clearTimeout(timeoutId)
      signal?.removeEventListener('abort', abort)
      worker.terminate()
      if (error) reject(error)
      else resolve(new Blob([result as BlobPart], { type: 'application/pdf' }))
    }
    const abort = () => finish(new Error('已取消加密'))
    const timeoutId = window.setTimeout(() => finish(new Error('加密处理超时，请选择较小的文件后重试')), 120000)
    signal?.addEventListener('abort', abort, { once: true })
    worker.onmessage = (event: MessageEvent<{ ok: boolean; data?: Uint8Array; message?: string }>) => {
      if (event.data.ok && event.data.data?.byteLength) finish(undefined, event.data.data)
      else finish(new Error(event.data.message || 'PDF 加密失败，请重试'))
    }
    worker.onerror = () => finish(new Error('加密引擎加载失败，请刷新后重试'))
    try {
      worker.postMessage({ file, passwords: resolvedPasswords })
    } catch {
      finish(new Error('无法读取 PDF 文件，请重新上传'))
    }
  })
}
