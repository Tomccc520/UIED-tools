/**
 * @description 视频转 GIF 单次任务：串行取帧、编码超时与取消清理。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */

export const VIDEO_GIF_SEEK_TIMEOUT_MS = 5_000
export const VIDEO_GIF_JOB_TIMEOUT_MS = 120_000

export interface VideoGifSettings {
  startTime: number
  endTime: number
  width: number
  height: number
  fps: number
  quality: number
  speed: number
}

interface GifWorker extends EventTarget {
  terminate: () => void
}

export interface VideoGifEncoder {
  addFrame: (context: CanvasRenderingContext2D, options: { copy: boolean; delay: number }) => void
  on: (event: string, callback: (...args: any[]) => void) => unknown
  render: () => void
  abort?: () => void
  removeAllListeners?: () => void
  activeWorkers?: GifWorker[]
  freeWorkers?: GifWorker[]
}

export interface VideoGifJobOptions {
  video: HTMLVideoElement
  settings: Readonly<VideoGifSettings>
  encoder: VideoGifEncoder
  signal: AbortSignal
  onProgress: (progress: number, message: string) => void
}

/** 创建统一的取消异常，使任务取消不被当作生成失败。 */
const abortError = (): DOMException => new DOMException('处理已取消', 'AbortError')

/** 在任务取消或编码完成后终止全部 GIF 线程，包含 gif.js 留存的空闲线程。 */
export const disposeVideoGifEncoder = (encoder: VideoGifEncoder): void => {
  // gif.js 的 abort 只清理 activeWorkers，完成后的 freeWorkers 也需要回收。
  const workers = new Set([...(encoder.activeWorkers || []), ...(encoder.freeWorkers || [])])
  encoder.removeAllListeners?.()
  try {
    encoder.abort?.()
  } catch {
    // 个别浏览器中已结束的线程可能抛错，仍继续清理剩余线程。
  }
  workers.forEach((worker) => worker.terminate())
  if (encoder.activeWorkers) encoder.activeWorkers.length = 0
  if (encoder.freeWorkers) encoder.freeWorkers.length = 0
}

/**
 * 等待指定视频帧可读；超时、解码失败和取消都会移除监听并结束等待。
 * @param video 当前任务固定的视频元素
 * @param targetTime 源视频的目标秒数
 * @param signal 当前任务取消信号
 */
export const waitForVideoGifFrame = (
  video: HTMLVideoElement,
  targetTime: number,
  signal: AbortSignal
): Promise<void> => new Promise((resolve, reject) => {
  if (signal.aborted) {
    reject(abortError())
    return
  }
  if (Math.abs(video.currentTime - targetTime) < 0.001 && video.readyState >= 2 && !video.seeking) {
    resolve()
    return
  }

  /** 清除本次定位的全部事件及计时器，避免取消后残留任务。 */
  const cleanup = () => {
    clearTimeout(timeoutId)
    video.removeEventListener('seeked', handleSeeked)
    video.removeEventListener('loadeddata', handleSeeked)
    video.removeEventListener('error', handleError)
    signal.removeEventListener('abort', handleAbort)
  }
  /** 在目标帧真正可读时完成定位。 */
  const handleSeeked = () => {
    // Firefox 等浏览器可能对 currentTime 做隐私舍入，以 seeked 和可读状态判断完成。
    if (video.readyState < 2 || video.seeking) return
    cleanup()
    resolve()
  }
  /** 将视频解码错误传回外层任务，统一展示可重试反馈。 */
  const handleError = () => {
    cleanup()
    reject(new Error('视频解码失败，请更换为浏览器支持的 MP4 或 WebM 文件'))
  }
  /** 主动取消时立即解除定位等待。 */
  const handleAbort = () => {
    cleanup()
    reject(abortError())
  }
  const timeoutId = setTimeout(() => {
    cleanup()
    reject(new Error('视频定位超时，请更换编码格式后重试'))
  }, VIDEO_GIF_SEEK_TIMEOUT_MS)
  video.addEventListener('seeked', handleSeeked)
  video.addEventListener('loadeddata', handleSeeked)
  video.addEventListener('error', handleError)
  signal.addEventListener('abort', handleAbort, { once: true })
  try {
    video.currentTime = targetTime
  } catch (error) {
    cleanup()
    reject(error)
  }
})

/** 为浏览器保留绘制进度和处理取消事件的机会，后台标签页也不会因 rAF 暂停而卡死。 */
const yieldVideoGifFrame = (signal: AbortSignal): Promise<void> => new Promise((resolve, reject) => {
  /** 解除下一帧等待并清理取消监听。 */
  const finish = () => {
    signal.removeEventListener('abort', handleAbort)
    resolve()
  }
  /** 取消时清理定时器，不再继续读取源视频。 */
  const handleAbort = () => {
    clearTimeout(timer)
    signal.removeEventListener('abort', handleAbort)
    reject(abortError())
  }
  const timer = setTimeout(finish, 0)
  signal.addEventListener('abort', handleAbort, { once: true })
  if (signal.aborted) handleAbort()
})

/**
 * 以固定参数串行捕获视频片段并生成 GIF；所有异步错误都会由返回的 Promise 传出。
 * @returns 编码完成的真实 GIF Blob，任务结束时同步释放所有编码线程
 */
export const runVideoGifJob = async ({ video, settings, encoder, signal, onProgress }: VideoGifJobOptions): Promise<Blob> => {
  const controller = new AbortController()
  let timedOut = false
  /** 将页面取消传播到当前帧和编码阶段。 */
  const handleAbort = () => controller.abort()
  signal.addEventListener('abort', handleAbort, { once: true })
  if (signal.aborted) controller.abort()
  const timeout = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, VIDEO_GIF_JOB_TIMEOUT_MS)
  const workerErrors = new Map<GifWorker, EventListener>()

  try {
    if (controller.signal.aborted) throw abortError()
    const canvas = document.createElement('canvas')
    canvas.width = settings.width
    canvas.height = settings.height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('无法创建画布，请更换浏览器后重试')
    const clipDuration = settings.endTime - settings.startTime
    const frameCount = Math.max(1, Math.ceil(clipDuration * settings.fps))
    // GIF 以 10ms 记录时长：累计边界取整，避免 30fps 等帧率逐帧取整后不断积累误差。
    // 为每帧保留至少一个时间单位，避免 gif.js 将 0ms 当作默认 500ms。
    const totalTicks = Math.max(frameCount, Math.round(clipDuration / settings.speed * 100))
    let elapsedTicks = 0
    for (let frame = 0; frame < frameCount; frame++) {
      await waitForVideoGifFrame(video, settings.startTime + frame / settings.fps, controller.signal)
      if (controller.signal.aborted) throw abortError()
      context.drawImage(video, 0, 0, settings.width, settings.height)
      const sourceEnd = Math.min(clipDuration, (frame + 1) / settings.fps)
      const roundedBoundary = Math.round(sourceEnd / settings.speed * 100)
      const reservedTicks = frameCount - frame - 1
      const endTicks = Math.min(totalTicks - reservedTicks, Math.max(elapsedTicks + 1, roundedBoundary))
      encoder.addFrame(context, { copy: true, delay: (endTicks - elapsedTicks) * 10 })
      elapsedTicks = endTicks
      onProgress(Math.round((frame + 1) / frameCount * 55), `正在捕获帧... ${frame + 1}/${frameCount}`)
      await yieldVideoGifFrame(controller.signal)
    }

    return await new Promise<Blob>((resolve, reject) => {
      let settled = false
      /** 编码结束或失败时只结算一次，并清除取消监听。 */
      const finish = (error?: Error, blob?: Blob) => {
        if (settled) return
        settled = true
        controller.signal.removeEventListener('abort', handleEncodeAbort)
        if (error) reject(error)
        else resolve(blob!)
      }
      /** 编码阶段取消时主动拒绝 Promise，避免 abort 后等待 finished。 */
      const handleEncodeAbort = () => finish(abortError())
      controller.signal.addEventListener('abort', handleEncodeAbort, { once: true })
      encoder.on('finished', (blob: Blob) => {
        if (!(blob instanceof Blob) || blob.size === 0 || blob.type !== 'image/gif') {
          finish(new Error('GIF 编码结果无效，请降低参数后重试'))
          return
        }
        finish(undefined, blob)
      })
      encoder.on('error', () => finish(new Error('GIF 编码失败，请降低参数或更换浏览器后重试')))
      encoder.on('abort', () => finish(abortError()))
      encoder.on('progress', (value: number) => {
        if (settled || controller.signal.aborted || !Number.isFinite(value)) return
        onProgress(55 + Math.round(Math.min(1, Math.max(0, value)) * 45), `正在编码 GIF... ${Math.round(value * 100)}%`)
      })
      if (controller.signal.aborted) {
        finish(abortError())
        return
      }
      try {
        onProgress(55, '正在编码 GIF...')
        encoder.render()
        // gif.js 没有向外转发 Worker error，在线程创建后补充错误监听。
        new Set([...(encoder.activeWorkers || []), ...(encoder.freeWorkers || [])]).forEach((worker) => {
          /** 编码线程无法加载或运行失败时给出明确反馈。 */
          const handleWorkerError: EventListener = () => finish(new Error('GIF 编码线程加载失败，请刷新页面后重试'))
          worker.addEventListener('error', handleWorkerError)
          worker.addEventListener('messageerror', handleWorkerError)
          workerErrors.set(worker, handleWorkerError)
        })
      } catch (error) {
        finish(error instanceof Error ? error : new Error('GIF 编码失败，请重试'))
      }
    })
  } catch (error) {
    if (timedOut) throw new Error('GIF 生成超时，请缩短片段、降低尺寸或帧率后重试')
    throw error
  } finally {
    clearTimeout(timeout)
    signal.removeEventListener('abort', handleAbort)
    workerErrors.forEach((listener, worker) => {
      worker.removeEventListener('error', listener)
      worker.removeEventListener('messageerror', listener)
    })
    disposeVideoGifEncoder(encoder)
  }
}
