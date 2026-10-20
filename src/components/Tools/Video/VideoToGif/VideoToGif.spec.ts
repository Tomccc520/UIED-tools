/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import VideoToGif from './VideoToGif.vue'

const mocks = vi.hoisted(() => ({
  consume: vi.fn(), runJob: vi.fn(), runtime: vi.fn(), encoder: vi.fn(), mobile: false,
  message: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() }
}))
vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vueuse/core')>()
  const { ref } = await import('vue')
  return { ...actual, useMediaQuery: () => ref(mocks.mobile) }
})
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/video/gif' }) }))
vi.mock('element-plus', () => ({ ElMessage: mocks.message }))
vi.mock('@/composables/useToolConsume', () => ({ useToolConsume: () => ({ ensureToolConsume: mocks.consume }) }))
vi.mock('@/utils/toolRuntimeLoaders', () => ({ ensureGifRuntime: mocks.runtime }))
vi.mock('./videoToGifJob', () => ({ runVideoGifJob: mocks.runJob }))

let wrapper: VueWrapper | undefined
let objectUrlCount = 0

/** 以真实文件输入和媒体事件挂载页面，仅替换 jsdom 没有的媒体编码器与站点外壳。 */
const mountTool = () => {
  wrapper = mount(VideoToGif, { attachTo: document.body, global: { stubs: {
    ToolsRecommend: true, VideoWorkspaceIntro: true, VideoUploadZone: true,
    ElSlider: defineComponent({ props: ['disabled'], template: '<input type="range" :disabled="disabled">' }),
    ElInputNumber: defineComponent({ props: ['modelValue', 'disabled', 'size'], emits: ['update:modelValue', 'change'], template: '<input type="number" :value="modelValue" :disabled="disabled" @input="$emit(\'update:modelValue\', Number($event.target.value)); $emit(\'change\')">' }),
    VideoProcessStatus: defineComponent({ emits: ['cancel'], template: '<button @click="$emit(\'cancel\')">取消处理</button>' }),
    VideoResultComparison: defineComponent({ props: ['metrics'], template: '<dl><div v-for="metric in metrics"><dt>{{ metric.label }}</dt><dd>{{ metric.after }}</dd></div></dl>' })
  } } })
  return wrapper
}

/** 选择源视频，派发浏览器读取完成事件并填入固定的 320×180、2 秒元数据。 */
const loadSource = async (name = 'clip.mp4', complete = true) => {
  const input = wrapper!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: [new File(['source-video'], name, { type: 'video/mp4' })] })
  await input.trigger('change')
  if (!complete) return
  const video = wrapper!.get('video')
  Object.defineProperties(video.element, {
    duration: { configurable: true, value: 2 }, videoWidth: { configurable: true, value: 320 }, videoHeight: { configurable: true, value: 180 }
  })
  await video.trigger('loadedmetadata')
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.mobile = false
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => `blob:video-test-${++objectUrlCount}`), revokeObjectURL: vi.fn() })
  mocks.consume.mockResolvedValue(true)
  mocks.runtime.mockResolvedValue({ GIF: class { constructor(options: unknown) { mocks.encoder(options) } } })
  mocks.runJob.mockResolvedValue(new Blob(['GIF89a'], { type: 'image/gif' }))
})
afterEach(() => { wrapper?.unmount(); wrapper = undefined; vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.innerHTML = '' })

describe('视频转 GIF 页面状态', () => {
  it('在权限请求前锁定入口、设置和视频播放，重复点击不会重复扣次数或创建任务', async () => {
    const view = mountTool()
    await loadSource()
    let finishConsume!: (allowed: boolean) => void
    mocks.consume.mockReturnValue(new Promise((resolve) => { finishConsume = resolve }))
    await view.get('.gif-primary').trigger('click')
    await view.get('.gif-primary').trigger('click')
    expect(mocks.consume).toHaveBeenCalledOnce()
    expect(view.get('.gif-primary').attributes('disabled')).toBeDefined()
    expect(view.findAll('input').every((input) => input.attributes('disabled') !== undefined)).toBe(true)
    expect(view.get('video').attributes('controls')).toBeUndefined()
    expect(view.findAll('.gif-speed-options button').every((button) => button.attributes('disabled') !== undefined)).toBe(true)
    finishConsume(true)
    await flushPromises()
    expect(mocks.runJob).toHaveBeenCalledOnce()
    expect(view.find('.gif-download').exists()).toBe(true)
    expect(view.get('video').attributes('controls')).toBeDefined()
  })

  it('取消尚未完成的权限请求后，晚到的允许结果不会启动旧任务', async () => {
    const view = mountTool()
    await loadSource()
    let finishConsume!: (allowed: boolean) => void
    mocks.consume.mockReturnValue(new Promise((resolve) => { finishConsume = resolve }))
    await view.get('.gif-primary').trigger('click')
    await view.findAll('button').find((button) => button.text() === '取消处理')!.trigger('click')
    finishConsume(true)
    await flushPromises()
    expect(mocks.runJob).not.toHaveBeenCalled()
    expect(view.get('.gif-primary').attributes('disabled')).toBeUndefined()
  })

  it('更换源文件时清空旧元数据，解码失败有明确提示且不能误用上一份视频生成', async () => {
    const view = mountTool()
    await loadSource()
    expect(view.text()).toContain('320 × 180')
    await loadSource('broken.mp4', false)
    expect(view.text()).not.toContain('320 × 180')
    expect(view.text()).toContain('正在读取视频信息')
    expect(view.get('.gif-primary').attributes('disabled')).toBeDefined()
    await view.get('video').trigger('error')
    expect(view.get('[role="alert"]').text()).toContain('视频解码失败')
    expect(view.get('.gif-primary').attributes('disabled')).toBeDefined()
    expect(mocks.consume).not.toHaveBeenCalled()
  })

  it('定位或编码失败清除忙碌状态并保留可重试入口，结果不会误显示为成功', async () => {
    const view = mountTool()
    await loadSource()
    mocks.runJob.mockRejectedValueOnce(new Error('视频定位超时，请更换编码格式后重试'))
    await view.get('.gif-primary').trigger('click')
    await flushPromises()
    expect(view.get('[role="alert"]').text()).toContain('视频定位超时')
    expect(view.get('.gif-primary').attributes('disabled')).toBeUndefined()
    expect(view.find('.gif-download').exists()).toBe(false)
    await view.get('.gif-primary').trigger('click')
    await flushPromises()
    expect(view.find('[role="alert"]').exists()).toBe(false)
    expect(view.find('.gif-download').exists()).toBe(true)
  })

  it('结果的尺寸与时长使用生成时快照，后续修改设置不会伪造已导出参数', async () => {
    const view = mountTool()
    await loadSource()
    await view.get('.gif-primary').trigger('click')
    await flushPromises()
    const snapshot = mocks.runJob.mock.calls[0][0].settings
    expect(snapshot).toMatchObject({ width: 320, height: 180, fps: 10, speed: 1, startTime: 0, endTime: 2 })
    await view.findAll('input[type="number"]')[2].setValue('160')
    await view.findAll('.gif-speed-options button').find((button) => button.text() === '2x')!.trigger('click')
    expect(view.get('.gif-result-panel').text()).toContain('320 × 180')
    expect(view.get('.gif-result-panel').text()).toContain('2.0s')
    expect(snapshot.width).toBe(320)
    expect(snapshot.speed).toBe(1)
  })

  it('离开页面取消任务，旧任务完成后不能创建对象地址或回写成功提示', async () => {
    const view = mountTool()
    await loadSource()
    let finishJob!: (blob: Blob) => void
    mocks.runJob.mockReturnValue(new Promise((resolve) => { finishJob = resolve }))
    await view.get('.gif-primary').trigger('click')
    await flushPromises()
    const signal: AbortSignal = mocks.runJob.mock.calls[0][0].signal
    expect(signal.aborted).toBe(false)
    view.unmount()
    wrapper = undefined
    expect(signal.aborted).toBe(true)
    finishJob(new Blob(['late-result'], { type: 'image/gif' }))
    await flushPromises()
    expect(URL.createObjectURL).toHaveBeenCalledOnce()
    expect(URL.revokeObjectURL).toHaveBeenCalledOnce()
    expect(mocks.message.success).not.toHaveBeenCalled()
  })
})


/** 读取真实 Teleport 到 body 的手机操作栏，验证按钮确实可触发同一业务入口。 */
const mobileBar = () => document.querySelector<HTMLElement>('section[aria-label="视频转 GIF 操作"]')!

/** 点击手机固定栏主操作并等待 Vue 和已有异步业务更新。 */
const clickMobilePrimary = async () => {
  mobileBar().querySelector<HTMLButtonElement>('.mobile-tool-actions__primary')!.click()
  await flushPromises()
}

describe('视频转 GIF 手机任务布局', () => {
  it('默认保留截取时间，其余参数按需展开且不销毁输入控件', async () => {
    mocks.mobile = true
    const view = mountTool()
    await loadSource()
    const widthInput = view.findAll('input[type="number"]')[2].element
    expect(view.get('.gif-range-inputs').isVisible()).toBe(true)
    expect(view.get('.gif-advanced-settings').isVisible()).toBe(false)
    expect(view.get('.gif-mobile-toggle').text()).toContain('320 × 180')
    expect(view.get('.gif-mobile-toggle').attributes('aria-expanded')).toBe('false')
    await view.get('.gif-mobile-toggle').trigger('click')
    expect(view.get('.gif-advanced-settings').isVisible()).toBe(true)
    expect(view.findAll('input[type="number"]')[2].element).toBe(widthInput)
    await view.findAll('input[type="number"]')[2].setValue('160')
    await view.get('.gif-mobile-toggle').trigger('click')
    expect(view.get('.gif-mobile-toggle').text()).toContain('160 × 90')
    expect(mocks.consume).not.toHaveBeenCalled()
  })

  it('底部生成成功后切到大GIF预览，切换原视频不销毁取帧依赖的video节点', async () => {
    mocks.mobile = true
    const view = mountTool()
    await loadSource()
    const sourceVideo = view.get('video').element
    expect(mobileBar().textContent).toContain('生成 GIF')
    await clickMobilePrimary()
    expect(mocks.runJob).toHaveBeenCalledOnce()
    expect(mocks.runJob.mock.calls[0][0].video).toBe(sourceVideo)
    expect(view.get('video').element).toBe(sourceVideo)
    expect(view.get('.gif-preview-panel').isVisible()).toBe(false)
    expect(view.get('.gif-result-panel').isVisible()).toBe(true)
    expect(view.get('#video-gif-result-details').isVisible()).toBe(false)
    await view.get('.gif-result-details-toggle').trigger('click')
    expect(view.get('#video-gif-result-details').isVisible()).toBe(true)
    expect(mobileBar().textContent).toContain('下载 GIF')
    await view.findAll('.gif-mobile-preview-tabs button')[0].trigger('click')
    expect(view.get('.gif-preview-panel').isVisible()).toBe(true)
    expect(view.get('.gif-result-panel').isVisible()).toBe(false)
    await view.findAll('.gif-mobile-preview-tabs button')[1].trigger('click')
    expect(view.get('video').element).toBe(sourceVideo)
    expect(view.get('.gif-result-panel').isVisible()).toBe(true)
  })

  it('修改设置后主操作变为重新生成，旧结果参数保留快照，重新生成才申请使用权限', async () => {
    mocks.mobile = true
    const view = mountTool()
    await loadSource()
    await clickMobilePrimary()
    expect(mocks.consume).toHaveBeenCalledTimes(1)
    await view.get('.gif-mobile-toggle').trigger('click')
    await view.findAll('input[type="number"]')[2].setValue('160')
    expect(mobileBar().textContent).toContain('重新生成 GIF')
    expect(view.get('.gif-result-panel').text()).toContain('320 × 180')
    expect(view.get('.gif-stale-result').text()).toContain('上次生成')
    expect(mocks.consume).toHaveBeenCalledTimes(1)
    await clickMobilePrimary()
    expect(mocks.runJob).toHaveBeenCalledTimes(2)
    expect(mocks.runJob.mock.calls[1][0].settings).toMatchObject({ width: 160, height: 90 })
    expect(mocks.consume.mock.calls.map(([request]) => request.action)).toEqual(['generate', 'generate'])
  })

  it('手机取消按钮沿用Abort信号，晚到编码结果不能覆盖页面', async () => {
    mocks.mobile = true
    const view = mountTool()
    await loadSource()
    let finishJob!: (blob: Blob) => void
    mocks.runJob.mockReturnValue(new Promise((resolve) => { finishJob = resolve }))
    await clickMobilePrimary()
    const signal = mocks.runJob.mock.calls[0][0].signal as AbortSignal
    mobileBar().querySelector<HTMLButtonElement>('.mobile-tool-actions__cancel')!.click()
    await flushPromises()
    expect(signal.aborted).toBe(true)
    finishJob(new Blob(['late'], { type: 'image/gif' }))
    await flushPromises()
    expect(view.find('.gif-result-panel').exists()).toBe(false)
    expect(URL.createObjectURL).toHaveBeenCalledOnce()
    expect(mobileBar().textContent).toContain('生成 GIF')
  })

  it('等待下载授权时可取消，重复点击或晚到允许结果都不能产生下载', async () => {
    mocks.mobile = true
    mountTool()
    await loadSource()
    await clickMobilePrimary()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    let finishDownload!: (allowed: boolean) => void
    mocks.consume.mockReturnValue(new Promise((resolve) => { finishDownload = resolve }))
    await clickMobilePrimary()
    await clickMobilePrimary()
    expect(mocks.consume).toHaveBeenCalledTimes(2)
    expect(mocks.consume.mock.calls[1][0]).toMatchObject({ action: 'download', mode: 'check-login' })
    expect(mobileBar().textContent).toContain('取消下载')
    mobileBar().querySelector<HTMLButtonElement>('.mobile-tool-actions__cancel')!.click()
    await flushPromises()
    finishDownload(true)
    await flushPromises()
    expect(click).not.toHaveBeenCalled()
    expect(mobileBar().textContent).toContain('下载 GIF')
  })

  it('手机说明和推荐默认折叠，桌面仍默认展示完整说明', async () => {
    mocks.mobile = true
    const view = mountTool()
    expect(view.get('#video-gif-guide').isVisible()).toBe(false)
    expect(view.get('#video-gif-recommendations').isVisible()).toBe(false)
    await view.get('.gif-guide-toggle').trigger('click')
    await view.get('.gif-recommend-toggle').trigger('click')
    expect(view.get('#video-gif-guide').isVisible()).toBe(true)
    expect(view.get('#video-gif-recommendations').isVisible()).toBe(true)
    view.unmount()
    wrapper = undefined
    mocks.mobile = false
    const desktop = mountTool()
    expect(desktop.get('#video-gif-guide').isVisible()).toBe(true)
    expect(mobileBar()).toBeNull()
  })
})
