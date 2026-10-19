/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount, type VueWrapper } from '@vue/test-utils'
import VideoCompress from './VideoCompress.vue'

const services = vi.hoisted(() => ({ consume: vi.fn(), config: vi.fn(), compress: vi.fn() }))
vi.mock('@/composables/useToolConsume', () => ({ useToolConsume: () => ({ ensureToolConsume: services.consume }) }))
vi.mock('@/services/videoCompress', () => ({
  getVideoCompressServerConfig: services.config,
  compressVideoWithServer: services.compress
}))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/video/compress' }), onBeforeRouteLeave: vi.fn() }))
vi.mock('element-plus', () => ({ ElMessage: { warning: vi.fn(), error: vi.fn(), info: vi.fn(), success: vi.fn() } }))

let wrapper: VueWrapper | undefined

/** 创建可手动完成的异步响应，重现校验、取消与旧响应之间的竞争。 */
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}

/** 挂载视频工具并上传浏览器无法解码的测试文件，确保专业模式不依赖浏览器元数据。 */
async function mountVideo() {
  wrapper = shallowMount(VideoCompress, {
    global: {
      stubs: {
        VideoProcessStatus: { template: '<button data-test="cancel" @click="$emit(\'cancel\')">取消处理</button>' },
        ElRadioGroup: { template: '<div><slot /></div>' },
        ElRadioButton: { template: '<span><slot /></span>' },
        ElSlider: true,
        ElInputNumber: true,
        ElOption: true,
        ElSelect: true,
        ElSwitch: true
      }
    }
  })
  const input = wrapper.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: [new File(['not-a-decodable-video'], 'sample.avi', { type: 'video/x-msvideo' })] })
  await input.trigger('change')
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  URL.createObjectURL = vi.fn(() => 'blob:video-test')
  URL.revokeObjectURL = vi.fn()
  services.consume.mockResolvedValue(true)
  services.config.mockResolvedValue({ available: true, crf: 26 })
})

afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
})

describe('视频压缩任务的取消和重试', () => {
  it('扣次响应未返回时禁止重复开始，取消后不能再上传', async () => {
    const consume = deferred<boolean>()
    services.consume.mockReturnValue(consume.promise)
    const view = await mountVideo()
    const start = view.get('.video-compress-primary')
    await start.trigger('click')
    await start.trigger('click')
    expect(services.consume).toHaveBeenCalledTimes(1)
    expect(start.attributes('disabled')).toBeDefined()
    await view.get('[data-test="cancel"]').trigger('click')
    consume.resolve(true)
    await flushPromises()
    expect(services.config).not.toHaveBeenCalled()
    expect(services.compress).not.toHaveBeenCalled()
    expect(start.attributes('disabled')).toBeUndefined()
  })

  it('取消能力检测后，迟到的可用配置不会恢复上传', async () => {
    const config = deferred<{ available: boolean }>()
    services.config.mockReturnValue(config.promise)
    const view = await mountVideo()
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    await view.get('[data-test="cancel"]').trigger('click')
    config.resolve({ available: true })
    await flushPromises()
    expect(services.compress).not.toHaveBeenCalled()
  })

  it('取消后忽略旧压缩结果，并允许新任务正常完成', async () => {
    const oldResult = deferred<any>()
    services.compress.mockReturnValueOnce(oldResult.promise).mockResolvedValueOnce({
      blob: new Blob(['new-video']), outputSize: 9, fileName: 'new.mp4', compressed: true, elapsedMs: 10
    })
    const view = await mountVideo()
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(services.compress).toHaveBeenCalledTimes(1)
    const signal = services.compress.mock.calls[0][1].signal as AbortSignal
    await view.get('[data-test="cancel"]').trigger('click')
    expect(signal.aborted).toBe(true)
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(view.find('.video-result-panel').exists()).toBe(true)
    const createdCount = vi.mocked(URL.createObjectURL).mock.calls.length
    oldResult.resolve({ blob: new Blob(['old-video']), outputSize: 9, fileName: 'old.mp4', compressed: true, elapsedMs: 10 })
    await flushPromises()
    expect(URL.createObjectURL).toHaveBeenCalledTimes(createdCount)
    expect(view.text()).toContain('压缩完成')
    expect(view.get('.video-compress-primary').attributes('disabled')).toBeUndefined()
  })

  it('浏览器不能读取 AVI 元数据时仍可使用专业模式，服务失败后明确停止', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    services.compress.mockRejectedValueOnce(new Error('unsupported codec'))
    const view = await mountVideo()
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(services.compress).toHaveBeenCalledTimes(1)
    expect(view.text()).toContain('专业压缩失败，浏览器也无法读取此视频')
    expect(view.get('.video-compress-primary').attributes('disabled')).toBeUndefined()
    expect(view.find('[data-test="cancel"]').exists()).toBe(false)
    expect(warning).toHaveBeenCalledOnce()
  })

  it('专业服务不可用且本地无法解码时直接显示错误，不进入无限等待', async () => {
    services.config.mockResolvedValueOnce({ available: false })
    const view = await mountVideo()
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(services.compress).not.toHaveBeenCalled()
    expect(view.text()).toContain('专业压缩服务暂不可用，浏览器也无法读取此视频')
    expect(view.get('.video-compress-primary').attributes('disabled')).toBeUndefined()
  })

  it('下载校验期间换文件，不得下载已被释放的旧结果', async () => {
    const downloadAllowed = deferred<boolean>()
    services.consume.mockResolvedValueOnce(true).mockReturnValueOnce(downloadAllowed.promise)
    services.compress.mockResolvedValueOnce({
      blob: new Blob(['video']), outputSize: 5, fileName: 'result.mp4', compressed: true, elapsedMs: 10
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const view = await mountVideo()
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    const download = view.findAll('button').find((button) => button.text() === '下载压缩视频')!
    await download.trigger('click')
    const input = view.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { configurable: true, value: [new File(['new'], 'new.mp4', { type: 'video/mp4' })] })
    await input.trigger('change')
    downloadAllowed.resolve(true)
    await flushPromises()
    expect(click).not.toHaveBeenCalled()
    expect(view.find('.video-result-panel').exists()).toBe(false)
  })
})
