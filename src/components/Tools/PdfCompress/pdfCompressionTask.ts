/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-29
 */

export const PDF_COMPRESSION_TIMEOUT_MS = 5 * 60 * 1000

/** 创建单文件压缩的有限生命周期；等待依赖、解析和绘制时均可立即取消。 */
export const createPdfCompressionTask = (timeoutMs = PDF_COMPRESSION_TIMEOUT_MS) => {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort('timeout'), timeoutMs)

  /** 检查是否仍可处理文件，超时和主动取消使用不同的可读提示。 */
  const assertActive = () => {
    if (controller.signal.aborted) {
      throw new Error(controller.signal.reason === 'timeout' ? 'PDF 压缩超时，请降低分辨率或拆分文件后重试' : '已取消 PDF 压缩')
    }
  }

  /** 等待一个处理步骤；取消后忽略迟到结果并移除监听，不无限等待旧 Promise。 */
  const wait = <T>(promise: PromiseLike<T>): Promise<T> => new Promise((resolve, reject) => {
    /** 终止等待并将停止原因传给队列。 */
    const onAbort = () => {
      try { assertActive() } catch (error) { reject(error) }
    }
    if (controller.signal.aborted) { onAbort(); return }
    controller.signal.addEventListener('abort', onAbort, { once: true })
    Promise.resolve(promise).then((value) => {
      controller.signal.removeEventListener('abort', onAbort)
      try { assertActive(); resolve(value) } catch (error) { reject(error) }
    }, (error) => {
      controller.signal.removeEventListener('abort', onAbort)
      reject(error)
    })
  })

  return {
    signal: controller.signal,
    wait,
    assertActive,
    /** 主动取消压缩；调用者继续负责释放引擎任务和画布。 */
    cancel: () => controller.abort('cancel'),
    /** 文件处理结束后释放超时器。 */
    dispose: () => window.clearTimeout(timer)
  }
}

export type PdfCompressionTask = ReturnType<typeof createPdfCompressionTask>
