/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  runVideoGifJob, waitForVideoGifFrame, VIDEO_GIF_JOB_TIMEOUT_MS, VIDEO_GIF_SEEK_TIMEOUT_MS,
  type VideoGifEncoder, type VideoGifSettings
} from './videoToGifJob'

const settings: VideoGifSettings = { startTime: 1, endTime: 1.25, width: 320, height: 180, fps: 10, quality: 10, speed: 2 }
let drawImage: ReturnType<typeof vi.fn>

/** 模拟实际视频跳转事件，记录每次从源视频捕获的时刻。 */
const video = (respondToSeek = true) => {
  const target = new EventTarget() as HTMLVideoElement
  let currentTime = 0
  const times: number[] = []
  Object.defineProperties(target, {
    readyState: { configurable: true, value: 2 }, seeking: { configurable: true, value: false },
    currentTime: { configurable: true, get: () => currentTime, set: (value: number) => {
      currentTime = value
      times.push(value)
      if (respondToSeek) setTimeout(() => target.dispatchEvent(new Event('seeked')), 0)
    } }
  })
  return { target, times }
}

/** 模拟 gif.js 事件与 Worker 集合，保留完整任务流程而不依赖 jsdom 编解码能力。 */
const encoder = (render?: (instance: ReturnType<typeof encoder>) => void) => {
  const callbacks = new Map<string, ((...args: any[]) => void)[]>()
  const worker = Object.assign(new EventTarget(), { terminate: vi.fn() })
  const instance = {
    activeWorkers: [] as typeof worker[], freeWorkers: [worker],
    addFrame: vi.fn(), abort: vi.fn(), removeAllListeners: vi.fn(() => callbacks.clear()),
    on: vi.fn((event: string, callback: (...args: any[]) => void) => {
      callbacks.set(event, [...(callbacks.get(event) || []), callback])
    }),
    emit: (event: string, ...args: any[]) => (callbacks.get(event) || []).forEach((callback) => callback(...args)),
    render: vi.fn(() => {
      if (render) render(instance)
      else instance.emit('finished', new Blob(['GIF89a-result'], { type: 'image/gif' }))
    })
  }
  return instance
}

beforeEach(() => {
  vi.useFakeTimers()
  drawImage = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D)
})
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

describe('视频转 GIF 任务', () => {
  it('串行截取起止时间内的真实帧，按速度写入延迟并回收空闲线程', async () => {
    const source = video()
    const gif = encoder()
    const worker = gif.freeWorkers[0]
    const onProgress = vi.fn()
    const task = runVideoGifJob({ video: source.target, settings, encoder: gif, signal: new AbortController().signal, onProgress })
    await vi.runAllTimersAsync()
    expect((await task).type).toBe('image/gif')
    expect(source.times).toEqual([1, 1.1, 1.2])
    expect(drawImage).toHaveBeenCalledTimes(3)
    expect(drawImage).toHaveBeenLastCalledWith(source.target, 0, 0, 320, 180)
    expect(gif.addFrame.mock.calls.map((call) => call[1])).toEqual([
      { copy: true, delay: 50 }, { copy: true, delay: 50 }, { copy: true, delay: 30 }
    ])
    expect(onProgress.mock.calls.map((call) => call[0]).slice(0, 3)).toEqual([18, 37, 55])
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each([
    { duration: 1, fps: 30, speed: 1, frames: 30, expected: 1000 },
    { duration: 1, fps: 30, speed: 2, frames: 30, expected: 500 },
    { duration: 1, fps: 30, speed: 0.5, frames: 30, expected: 2000 },
    { duration: 0.15, fps: 10, speed: 1, frames: 2, expected: 150 },
    { duration: 0.15, fps: 10, speed: 2, frames: 2, expected: 80 },
    { duration: 0.15, fps: 10, speed: 0.5, frames: 2, expected: 300 },
    { duration: 2, fps: 10, speed: 1, frames: 20, expected: 2000 },
    { duration: 0.10001, fps: 10, speed: 2, frames: 2, expected: 50 },
    { duration: 0.001, fps: 30, speed: 2, frames: 1, expected: 10 }
  ])('片段 $duration 秒、$fps fps、$speed 倍速累计编码 $expected ms', async ({ duration, fps, speed, frames, expected }) => {
    const source = video()
    const gif = encoder()
    const task = runVideoGifJob({
      video: source.target, settings: { ...settings, startTime: 0, endTime: duration, fps, speed },
      encoder: gif, signal: new AbortController().signal, onProgress: vi.fn()
    })
    await vi.runAllTimersAsync()
    await task
    const delays = gif.addFrame.mock.calls.map((call) => call[1].delay)
    // 独立模拟 gif.js setDelay 的逐帧量化，验证真实编码后累计时间没有再次漂移。
    expect(delays.reduce((total, delay) => total + Math.round(delay / 10) * 10, 0)).toBe(expected)
    expect(delays).toHaveLength(frames)
    expect(delays.every((delay) => delay >= 10 && delay % 10 === 0)).toBe(true)
    expect(source.times.every((time) => time < duration)).toBe(true)
    expect(Math.abs(expected - duration / speed * 1000)).toBeLessThanOrEqual(10)
  })

  it('视频定位超时向任务调用方报错，结束加载并清理编码资源', async () => {
    const gif = encoder()
    const worker = gif.freeWorkers[0]
    const task = runVideoGifJob({ video: video(false).target, settings, encoder: gif, signal: new AbortController().signal, onProgress: vi.fn() })
    const result = expect(task).rejects.toThrow('视频定位超时')
    await vi.advanceTimersByTimeAsync(VIDEO_GIF_SEEK_TIMEOUT_MS)
    await result
    expect(gif.render).not.toHaveBeenCalled()
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('视频解码错误可以拒绝等待，不会变成未处理异步异常', async () => {
    const source = video(false)
    const signal = new AbortController().signal
    const result = expect(waitForVideoGifFrame(source.target, 1, signal)).rejects.toThrow('视频解码失败')
    source.target.dispatchEvent(new Event('error'))
    await result
    expect(vi.getTimerCount()).toBe(0)
  })

  it('起始帧尚未解码时等待 loadeddata，不会提前绘制空白帧', async () => {
    const source = video(false)
    Object.defineProperty(source.target, 'readyState', { configurable: true, value: 1 })
    let resolved = false
    const task = waitForVideoGifFrame(source.target, 0, new AbortController().signal).then(() => { resolved = true })
    await Promise.resolve()
    expect(resolved).toBe(false)
    Object.defineProperty(source.target, 'readyState', { configurable: true, value: 2 })
    source.target.dispatchEvent(new Event('loadeddata'))
    await task
    expect(resolved).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('编码进度从取帧的 55% 接续递增，不会前半段编码一直停在 55%', async () => {
    const onProgress = vi.fn()
    const gif = encoder((instance) => {
      instance.emit('progress', 0)
      instance.emit('progress', 0.2)
      instance.emit('progress', 0.5)
      instance.emit('finished', new Blob(['GIF89a-result'], { type: 'image/gif' }))
    })
    const task = runVideoGifJob({ video: video().target, settings, encoder: gif, signal: new AbortController().signal, onProgress })
    await vi.runAllTimersAsync()
    await task
    expect(onProgress.mock.calls.slice(-3).map((call) => call[0])).toEqual([55, 64, 78])
  })

  it('gif.js 没有转发的 Worker 错误也会立即报错并回收线程', async () => {
    const gif = encoder((instance) => { setTimeout(() => instance.freeWorkers[0].dispatchEvent(new Event('error')), 0) })
    const worker = gif.freeWorkers[0]
    const task = runVideoGifJob({ video: video().target, settings, encoder: gif, signal: new AbortController().signal, onProgress: vi.fn() })
    const result = expect(task).rejects.toThrow('GIF 编码线程加载失败')
    await vi.runAllTimersAsync()
    await result
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('编码线程不再发送消息时触发任务超时，不能无限等待', async () => {
    const gif = encoder(() => {})
    const worker = gif.freeWorkers[0]
    const task = runVideoGifJob({ video: video().target, settings, encoder: gif, signal: new AbortController().signal, onProgress: vi.fn() })
    const result = expect(task).rejects.toThrow('GIF 生成超时')
    await vi.advanceTimersByTimeAsync(VIDEO_GIF_JOB_TIMEOUT_MS)
    await result
    expect(gif.render).toHaveBeenCalledOnce()
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('取消定位立即拒绝任务，不再捕获新帧，任务计时器全部解除', async () => {
    const gif = encoder()
    const controller = new AbortController()
    const task = runVideoGifJob({ video: video(false).target, settings, encoder: gif, signal: controller.signal, onProgress: vi.fn() })
    const result = expect(task).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort()
    await result
    expect(gif.addFrame).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('取消编码立即结束任务，晚到的 finished 不会创建成功结果', async () => {
    const gif = encoder(() => {})
    const controller = new AbortController()
    const task = runVideoGifJob({ video: video().target, settings, encoder: gif, signal: controller.signal, onProgress: vi.fn() })
    const result = expect(task).rejects.toMatchObject({ name: 'AbortError' })
    await vi.advanceTimersByTimeAsync(100)
    expect(gif.render).toHaveBeenCalledOnce()
    controller.abort()
    await result
    gif.emit('finished', new Blob(['late'], { type: 'image/gif' }))
    expect(vi.getTimerCount()).toBe(0)
  })

  it('绘制帧失败直接向外传出并释放线程，不能继续渲染', async () => {
    const gif = encoder()
    drawImage.mockImplementation(() => { throw new Error('draw failed') })
    const task = runVideoGifJob({ video: video().target, settings, encoder: gif as VideoGifEncoder, signal: new AbortController().signal, onProgress: vi.fn() })
    const result = expect(task).rejects.toThrow('draw failed')
    await vi.runAllTimersAsync()
    await result
    expect(gif.render).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
})
