import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  appendGifTimelineFrame, createGifFrameComposer, getGifRepeat, normalizeGifDelay,
  renderGifWithTimeout, splitGifTimelineDelays, validateGifMemoryBudget,
  type GifFrame, type GifMetadata, type GifTimelineFrame
} from './gifCompression'

const red = [255, 0, 0, 255]
const green = [0, 255, 0, 255]
const blue = [0, 0, 255, 255]
const transparent = [0, 0, 0, 0]

/** 生成两像素逻辑画布和合法 GIF 帧描述，便于独立验证合成及循环规则。 */
const makeGif = (): GifMetadata => ({
  lsd: { width: 2, height: 1, backgroundColorIndex: 0 },
  gct: [[255, 255, 255]],
  frames: [{ image: { descriptor: { width: 2, height: 1, left: 0, top: 0 } } }]
})

/** 用明确的像素、位置与 disposal 构造解码帧。 */
const makeFrame = (pixels: number[][], extras: Partial<GifFrame> = {}): GifFrame => ({
  patch: new Uint8ClampedArray(pixels.flat()),
  dims: { width: pixels.length, height: 1, left: 0, top: 0 }, delay: 100, disposalType: 1, ...extras
})

/** 构造能够派发失败事件及检查资源释放的 Worker。 */
const makeWorker = () => Object.assign(new EventTarget(), { terminate: vi.fn() }) as unknown as Worker

/** 构造 gif.js 事件接口，测试真实等待与错误收口逻辑而不启动浏览器 Worker。 */
const makeEncoder = () => {
  const listeners = new Map<string, (...args: any[]) => void>()
  const worker = makeWorker()
  return {
    worker,
    activeWorkers: [worker], freeWorkers: [] as Worker[],
    render: vi.fn(), abort: vi.fn(),
    on: vi.fn((name: string, callback: (...args: any[]) => void) => listeners.set(name, callback)),
    emit: (name: string, ...args: any[]) => listeners.get(name)?.(...args)
  }
}

afterEach(() => vi.useRealTimers())

describe('GIF 帧合成与时间轴', () => {
  it('透明 patch 保留底帧的颜色而非抹成透明', () => {
    const first = makeFrame([red, blue])
    const composer = createGifFrameComposer(makeGif(), first)
    expect([...composer.compose(first)]).toEqual([...red, ...blue])
    expect([...composer.compose(makeFrame([transparent, green], { transparentIndex: 0 }))]).toEqual([...red, ...green])
  })

  it('disposal 2 恢复逻辑背景色，透明帧按透明背景清除', () => {
    const first = makeFrame([red, blue])
    const composer = createGifFrameComposer(makeGif(), first)
    composer.compose(first)
    composer.compose(makeFrame([green], { disposalType: 2 }))
    expect([...composer.compose(makeFrame([transparent, transparent], { transparentIndex: 0 }))]).toEqual([255, 255, 255, 255, ...blue])
    const transparentFirst = makeFrame([red, transparent], { transparentIndex: 0, disposalType: 2 })
    const transparentComposer = createGifFrameComposer(makeGif(), transparentFirst)
    transparentComposer.compose(transparentFirst)
    expect([...transparentComposer.compose(makeFrame([transparent, transparent], { transparentIndex: 0 }))]).toEqual([...transparent, ...transparent])
  })

  it('disposal 3 恢复该帧绘制前的画面，局部帧偏移保持正确', () => {
    const first = makeFrame([red, blue])
    const composer = createGifFrameComposer(makeGif(), first)
    composer.compose(first)
    expect([...composer.compose(makeFrame([green], { disposalType: 3, dims: { width: 1, height: 1, left: 1, top: 0 } }))]).toEqual([...red, ...green])
    expect([...composer.compose(makeFrame([transparent, transparent], { transparentIndex: 0 }))]).toEqual([...red, ...blue])
  })

  it('重复 A/A/B 的时长保留在 A，不错放到 B', () => {
    const timeline: GifTimelineFrame[] = []
    appendGifTimelineFrame(timeline, new Uint8ClampedArray(red), 100, true)
    expect(appendGifTimelineFrame(timeline, new Uint8ClampedArray(red), 200, true)).toBe(true)
    appendGifTimelineFrame(timeline, new Uint8ClampedArray(blue), 300, true)
    expect(timeline.map((frame) => frame.delay)).toEqual([300, 300])
    expect([...timeline[0].pixels]).toEqual(red)
    expect([...timeline[1].pixels]).toEqual(blue)
  })

  it('抽帧把被丢帧时长分配给之前保留的画面，完整保留动画总时长', () => {
    const timeline: GifTimelineFrame[] = []
    appendGifTimelineFrame(timeline, new Uint8ClampedArray(red), 100, false)
    appendGifTimelineFrame(timeline, null, 250, false)
    appendGifTimelineFrame(timeline, new Uint8ClampedArray(blue), 400, false)
    appendGifTimelineFrame(timeline, null, 150, false)
    expect(timeline.map((frame) => frame.delay)).toEqual([350, 550])
  })

  it('拆分超过 GIF 16 位字段的延迟而不丢失时间', () => {
    const frames = splitGifTimelineDelays([{ pixels: new Uint8ClampedArray(red), delay: 1_310_710 }])
    expect(frames.map((frame) => frame.delay)).toEqual([655_350, 655_350, 10])
    expect(frames.reduce((total, frame) => total + frame.delay, 0)).toBe(1_310_710)
  })

  it('保留合法 10ms 延迟，并为缺失或零延迟使用 100ms 默认值', () => {
    expect(normalizeGifDelay(10)).toBe(10)
    expect(normalizeGifDelay(250)).toBe(250)
    expect(normalizeGifDelay(0)).toBe(100)
    expect(normalizeGifDelay(Number.NaN)).toBe(100)
  })

  it('有限循环、无限循环和播放一次分别映射正确', () => {
    const gif = makeGif()
    expect(getGifRepeat(gif)).toBe(-1)
    gif.frames.unshift({ application: { id: 'NETSCAPE2.0', blocks: [1, 2, 0] } })
    expect(getGifRepeat(gif)).toBe(2)
    gif.frames[0].application!.blocks = [1, 0, 0]
    expect(getGifRepeat(gif)).toBe(0)
    gif.frames[0].application!.blocks = [1, 2, 1]
    expect(getGifRepeat(gif)).toBe(258)
  })

  it('解码前拒绝巨大展开像素量和超出逻辑画布的帧', () => {
    const gif = makeGif()
    expect(() => validateGifMemoryBudget(gif)).not.toThrow()
    gif.lsd.width = 20_000
    gif.lsd.height = 20_000
    expect(() => validateGifMemoryBudget(gif)).toThrow('像素量过大')
    const invalid = makeGif()
    invalid.frames[0].image!.descriptor.left = 1
    expect(() => validateGifMemoryBudget(invalid)).toThrow('帧尺寸无效')
  })
})

describe('GIF 编码超时与资源释放', () => {
  it('成功返回 GIF 后释放全部 Worker，并清除超时', async () => {
    vi.useFakeTimers()
    const encoder = makeEncoder()
    const freeWorker = makeWorker()
    encoder.freeWorkers.push(freeWorker)
    const result = renderGifWithTimeout(encoder, new AbortController().signal, 50)
    const blob = new Blob(['GIF89a'], { type: 'image/gif' })
    encoder.emit('finished', blob)
    await expect(result).resolves.toBe(blob)
    expect(encoder.worker.terminate).toHaveBeenCalledOnce()
    expect(freeWorker.terminate).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('Worker 资源加载失败立即报错，避免无限 loading', async () => {
    const encoder = makeEncoder()
    const result = renderGifWithTimeout(encoder, new AbortController().signal)
    encoder.worker.dispatchEvent(new Event('error'))
    await expect(result).rejects.toThrow('编码器加载失败')
    expect(encoder.worker.terminate).toHaveBeenCalledOnce()
  })

  it('编码超时后明确报错并关闭 Worker', async () => {
    vi.useFakeTimers()
    const encoder = makeEncoder()
    const result = renderGifWithTimeout(encoder, new AbortController().signal, 50)
    const rejected = expect(result).rejects.toThrow('编码超时')
    await vi.advanceTimersByTimeAsync(50)
    await rejected
    expect(encoder.worker.terminate).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('取消或离开页面时拒绝等待，不接受后续完成结果', async () => {
    const encoder = makeEncoder()
    const controller = new AbortController()
    const result = renderGifWithTimeout(encoder, controller.signal)
    controller.abort()
    encoder.emit('finished', new Blob(['GIF89a'], { type: 'image/gif' }))
    await expect(result).rejects.toThrow('已取消')
    expect(encoder.worker.terminate).toHaveBeenCalledOnce()
  })

  it('编码器同步启动失败和非 GIF 结果均反馈错误', async () => {
    const encoder = makeEncoder()
    encoder.render.mockImplementation(() => { throw new Error('Worker 不可用') })
    await expect(renderGifWithTimeout(encoder, new AbortController().signal)).rejects.toThrow('Worker 不可用')
    const invalid = makeEncoder()
    const result = renderGifWithTimeout(invalid, new AbortController().signal)
    invalid.emit('finished', new Blob(['wrong'], { type: 'image/png' }))
    await expect(result).rejects.toThrow('编码结果无效')
  })
})
