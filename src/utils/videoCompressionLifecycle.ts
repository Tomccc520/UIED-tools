/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */

/** 等待视频定位，支持取消和有限超时；当前位置无需移动时直接完成，避免等待不存在的 seeked 事件。 */
export const seekVideoForCompression = (video: HTMLVideoElement, time: number, signal: AbortSignal) => {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new Error('视频压缩任务已取消'))
      return
    }
    if (!video.seeking && Math.abs(video.currentTime - time) < 0.001) {
      resolve()
      return
    }
    /** 结束等待并移除事件与定时器，防止取消后的旧任务继续执行。 */
    const finish = (error?: Error) => {
      window.clearTimeout(timer)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      signal.removeEventListener('abort', onAbort)
      if (error) reject(error)
      else resolve()
    }
    /** 视频定位成功后允许开始录制。 */
    const onSeeked = () => finish()
    /** 视频无法解码时停止等待并给出可操作提示。 */
    const onError = () => finish(new Error('浏览器无法读取此视频，请使用专业 H.264 模式或更换视频'))
    /** 用户取消时立即拒绝，释放等待中的任务。 */
    const onAbort = () => finish(new Error('视频压缩任务已取消'))
    const timer = window.setTimeout(() => finish(new Error('视频定位超时，请重新上传视频后重试')), 8000)
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', onError)
    signal.addEventListener('abort', onAbort, { once: true })
    try {
      video.currentTime = time
    } catch {
      finish(new Error('无法定位视频，请重新上传视频后重试'))
    }
  })
}
