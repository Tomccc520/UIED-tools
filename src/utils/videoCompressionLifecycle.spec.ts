/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { seekVideoForCompression } from './videoCompressionLifecycle'

afterEach(() => vi.useRealTimers())

describe('视频压缩定位等待', () => {
  it('已在起点时无需等待新的 seeked 事件', async () => {
    const video = document.createElement('video')
    await expect(seekVideoForCompression(video, 0, new AbortController().signal)).resolves.toBeUndefined()
  })

  it('取消和媒体错误会及时结束等待', async () => {
    const video = document.createElement('video')
    video.currentTime = 5
    const controller = new AbortController()
    const aborted = seekVideoForCompression(video, 0, controller.signal)
    controller.abort()
    await expect(aborted).rejects.toThrow('已取消')
    video.currentTime = 5
    const failed = seekVideoForCompression(video, 0, new AbortController().signal)
    video.dispatchEvent(new Event('error'))
    await expect(failed).rejects.toThrow('无法读取')
  })

  it('浏览器不再触发定位事件时 8 秒超时，不能无限 loading', async () => {
    vi.useFakeTimers()
    const video = document.createElement('video')
    video.currentTime = 5
    const pending = seekVideoForCompression(video, 0, new AbortController().signal)
    const assertion = expect(pending).rejects.toThrow('定位超时')
    await vi.advanceTimersByTimeAsync(8000)
    await assertion
    expect(vi.getTimerCount()).toBe(0)
  })
})
