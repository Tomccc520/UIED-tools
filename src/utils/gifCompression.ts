/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */

export interface GifFrame {
  patch: Uint8ClampedArray
  dims: { width: number; height: number; top: number; left: number }
  delay: number
  disposalType: number
  transparentIndex?: number
}

export interface GifMetadata {
  lsd: { width: number; height: number; backgroundColorIndex?: number }
  gct?: number[][]
  frames: Array<{
    image?: { descriptor: GifFrame['dims'] }
    gce?: { delay: number }
    application?: { id: string; blocks: ArrayLike<number> }
  }>
}

export interface GifTimelineFrame {
  pixels: Uint8ClampedArray
  delay: number
}

export const MAX_GIF_DECODED_PIXELS = 32_000_000
export const GIF_ENCODING_TIMEOUT_MS = 120_000
const MAX_GIF_DELAY_MS = 655_350

/**
 * 在解码前检查 GIF 画布和全帧内存预算，避免小体积文件展开后耗尽浏览器内存。
 * @param gif GIF 解析头和帧描述信息
 */
export const validateGifMemoryBudget = (gif: GifMetadata): void => {
  const { width, height } = gif.lsd || {}
  const frames = gif.frames.filter((frame) => frame.image)
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0 || !frames.length) {
    throw new Error('GIF 文件没有有效画布或动画帧，请重新选择文件')
  }
  const expandedPixels = width * height * frames.length
  if (!Number.isSafeInteger(expandedPixels) || expandedPixels > MAX_GIF_DECODED_PIXELS) {
    throw new Error('GIF 展开后的像素量过大，请先缩短动画或缩小尺寸后重试')
  }
  for (const frame of frames) {
    const dims = frame.image!.descriptor
    if (!Number.isInteger(dims.width) || !Number.isInteger(dims.height) || dims.width <= 0 || dims.height <= 0 ||
      dims.left < 0 || dims.top < 0 || dims.left + dims.width > width || dims.top + dims.height > height) {
      throw new Error('GIF 帧尺寸无效，请检查文件是否完整')
    }
  }
}

/**
 * 读取 Netscape 动画循环次数；没有循环扩展时播放一次，0 表示无限循环。
 * @param gif GIF 解析结果
 * @returns gif.js 对应的循环参数
 */
export const getGifRepeat = (gif: GifMetadata): number => {
  for (const frame of gif.frames) {
    const application = frame.application
    if (!application || !['NETSCAPE2.0', 'ANIMEXTS1.0'].includes(application.id)) continue
    const blocks = application.blocks
    if (blocks.length >= 3 && blocks[0] === 1) return blocks[1] | (blocks[2] << 8)
  }
  return -1
}

/**
 * 保留 GIF 原始的百分之一秒帧延迟；缺失或零延迟采用浏览器常见的 100ms 默认值。
 * @param delay gifuct-js 提供的毫秒延迟
 * @returns 可写入 GIF 的毫秒延迟
 */
export const normalizeGifDelay = (delay: number): number => {
  return Number.isFinite(delay) && delay > 0 ? Math.max(10, Math.round(delay / 10) * 10) : 100
}

/**
 * 按 GIF 透明像素覆盖规则合成帧，并在输出后应用 disposal 2/3。
 * @param gif GIF 逻辑画布与背景色
 * @param firstFrame 首帧，用于确定透明画布初始状态
 * @returns 每次调用后返回当前可见帧像素的合成器
 */
export const createGifFrameComposer = (gif: GifMetadata, firstFrame: GifFrame) => {
  const { width, height } = gif.lsd
  const background = gif.gct?.[gif.lsd.backgroundColorIndex ?? 0] || [0, 0, 0]
  const canvas = new Uint8ClampedArray(width * height * 4)

  /** 将指定矩形恢复为逻辑背景色或透明背景。 */
  const clearRect = (left: number, top: number, rectWidth: number, rectHeight: number, transparent: boolean) => {
    for (let y = top; y < top + rectHeight; y++) {
      for (let x = left; x < left + rectWidth; x++) {
        const offset = (y * width + x) * 4
        canvas[offset] = transparent ? 0 : background[0]
        canvas[offset + 1] = transparent ? 0 : background[1]
        canvas[offset + 2] = transparent ? 0 : background[2]
        canvas[offset + 3] = transparent ? 0 : 255
      }
    }
  }

  clearRect(0, 0, width, height, firstFrame.transparentIndex !== undefined)

  return {
    /**
     * 合成并返回当前可见帧；透明 patch 像素保留底帧，不覆盖已显示的内容。
     * @param frame 当前解码帧
     * @returns 独立 RGBA 像素快照
     */
    compose(frame: GifFrame): Uint8ClampedArray {
      const { left, top, width: frameWidth, height: frameHeight } = frame.dims
      if (frame.patch.length !== frameWidth * frameHeight * 4) throw new Error('GIF 帧像素不完整，请重新选择文件')
      const restore = frame.disposalType === 3 ? canvas.slice() : null
      for (let y = 0; y < frameHeight; y++) {
        for (let x = 0; x < frameWidth; x++) {
          const source = (y * frameWidth + x) * 4
          if (frame.patch[source + 3] === 0) continue
          const target = ((top + y) * width + left + x) * 4
          canvas.set(frame.patch.subarray(source, source + 4), target)
        }
      }
      const visible = canvas.slice()
      if (frame.disposalType === 2) {
        clearRect(left, top, frameWidth, frameHeight, frame.transparentIndex !== undefined)
      } else if (restore) {
        canvas.set(restore)
      }
      return visible
    }
  }
}

/**
 * 将抽帧和重复帧的时长累加给上一幅保留画面，避免把停留时间错误移动到下一幅。
 * @param timeline 输出时间轴
 * @param pixels 当前完整 RGBA 画面；抽帧时可传 null
 * @param delay 当前帧毫秒延迟
 * @param mergeDuplicates 是否合并相邻相同画面
 * @returns 是否合并了一幅重复画面
 */
export const appendGifTimelineFrame = (
  timeline: GifTimelineFrame[], pixels: Uint8ClampedArray | null, delay: number, mergeDuplicates: boolean
): boolean => {
  const previous = timeline[timeline.length - 1]
  if (!pixels) {
    if (previous) previous.delay += normalizeGifDelay(delay)
    return false
  }
  const same = mergeDuplicates && previous && previous.pixels.length === pixels.length &&
    pixels.every((value, index) => value === previous.pixels[index])
  if (same) {
    previous.delay += normalizeGifDelay(delay)
    return true
  }
  timeline.push({ pixels, delay: normalizeGifDelay(delay) })
  return false
}

/**
 * 将过长的合并延迟拆成合法 GIF 帧，避免 16 位延迟字段溢出导致动画加速。
 * @param timeline 合成后的时间轴
 * @returns 可直接交给编码器的时间轴
 */
export const splitGifTimelineDelays = (timeline: GifTimelineFrame[]): GifTimelineFrame[] => {
  const result: GifTimelineFrame[] = []
  for (const frame of timeline) {
    let remaining = frame.delay
    while (remaining > 0) {
      const delay = Math.min(remaining, MAX_GIF_DELAY_MS)
      result.push({ pixels: frame.pixels, delay })
      remaining -= delay
    }
  }
  return result
}

interface GifEncoderRuntime {
  on(event: string, callback: (...args: any[]) => void): unknown
  render(): void
  abort(): void
  activeWorkers?: Worker[]
  freeWorkers?: Worker[]
}

/**
 * 终止 gif.js 留存的全部 Worker，包括编码完成后进入空闲池的 Worker。
 * @param encoder 当前编码器
 */
export const disposeGifEncoder = (encoder: GifEncoderRuntime): void => {
  const workers = new Set([...(encoder.activeWorkers || []), ...(encoder.freeWorkers || [])])
  for (const worker of workers) worker.terminate()
  encoder.activeWorkers = []
  encoder.freeWorkers = []
}

/**
 * 为 gif.js 增加 Worker 错误、取消和超时收口，所有路径均释放 Worker 和定时器。
 * @param encoder gif.js 编码实例
 * @param signal 页面离开或用户取消信号
 * @param timeoutMs 最长编码时间
 * @returns 最终 GIF 文件
 */
export const renderGifWithTimeout = (
  encoder: GifEncoderRuntime, signal: AbortSignal, timeoutMs = GIF_ENCODING_TIMEOUT_MS
): Promise<Blob> => new Promise((resolve, reject) => {
  let settled = false
  const workerErrorHandlers = new Map<Worker, EventListener>()
  let timer: ReturnType<typeof setTimeout> | undefined

  /** 统一结算任务，解除事件并回收编码 Worker。 */
  const finish = (error?: Error, blob?: Blob) => {
    if (settled) return
    settled = true
    clearTimeout(timer)
    signal.removeEventListener('abort', handleAbort)
    for (const [worker, handler] of workerErrorHandlers) {
      worker.removeEventListener('error', handler)
      worker.removeEventListener('messageerror', handler)
    }
    disposeGifEncoder(encoder)
    if (error) reject(error)
    else if (!blob || blob.size === 0 || blob.type !== 'image/gif') reject(new Error('GIF 编码结果无效，请重试'))
    else resolve(blob)
  }

  /** 用户取消或页面离开时终止等待，不让过期结果写回页面。 */
  const handleAbort = () => finish(new Error('GIF 压缩已取消'))
  if (signal.aborted) {
    handleAbort()
    return
  }
  signal.addEventListener('abort', handleAbort, { once: true })
  encoder.on('finished', (blob: Blob) => finish(undefined, blob))
  encoder.on('abort', () => finish(new Error('GIF 编码已中断，请重试')))
  timer = setTimeout(() => finish(new Error('GIF 编码超时，请减小尺寸或缩短动画后重试')), timeoutMs)
  try {
    encoder.render()
    for (const worker of [...(encoder.activeWorkers || []), ...(encoder.freeWorkers || [])]) {
      /** Worker 加载失败或无法解码消息时给用户明确错误。 */
      const handleError = () => finish(new Error('GIF 编码器加载失败，请刷新页面后重试'))
      workerErrorHandlers.set(worker, handleError)
      worker.addEventListener('error', handleError)
      worker.addEventListener('messageerror', handleError)
    }
  } catch (error) {
    finish(error instanceof Error ? error : new Error('GIF 编码启动失败，请重试'))
  }
})
