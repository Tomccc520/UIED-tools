/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount, type VueWrapper } from '@vue/test-utils'
import VideoCompress from './VideoCompress.vue'
import MobileToolActions from '@/components/Common/MobileToolActions.vue'
import VideoProcessStatus from '@/components/Tools/Video/Shared/VideoProcessStatus.vue'
import VideoResultComparison from '@/components/Tools/Video/Shared/VideoResultComparison.vue'

const services = vi.hoisted(() => ({ consume: vi.fn(), settle: vi.fn(), config: vi.fn(), compress: vi.fn(), userUid: '1001' }))
vi.mock('@/composables/useToolConsume', () => ({ useToolConsume: () => ({ ensureToolConsume: services.consume }) }))
vi.mock('@/composables/useCoreToolManualConsume', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/composables/useCoreToolManualConsume')>(),
  useCoreToolManualConsume: () => ({ resolveCoreToolRun: services.settle })
}))
vi.mock('@/services/frontendUser', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/services/frontendUser')>(),
  getFrontendUserProfile: () => ({ uid: services.userUid })
}))
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
async function mountVideo(sizeMB?: number) {
  wrapper = shallowMount(VideoCompress, {
    global: {
      stubs: {
        VideoProcessStatus: { props: ['indeterminate', 'progressLabel'], template: '<button data-test="cancel" @click="$emit(\'cancel\')">取消处理</button>' },
        ElRadioGroup: { name: 'ElRadioGroup', props: ['modelValue', 'disabled'], template: '<div><slot /></div>' },
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
  const file = new File(['not-a-decodable-video'], 'sample.avi', { type: 'video/x-msvideo' })
  if (sizeMB) Object.defineProperty(file, 'size', { value: sizeMB * 1024 * 1024 })
  Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
  await input.trigger('change')
  return wrapper
}

/** 用可控录制器与时钟推进长视频尾部，验证不截断、不因文件较大自动重播。 */
async function prepareLocalRecording(view: VueWrapper, duration = 600, start = true) {
  const frames: FrameRequestCallback[] = []
  const recorders: any[] = []
  const stream = { getTracks: () => [], getVideoTracks: () => [], getAudioTracks: () => [] }
  const createElement = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tag: string, options?: ElementCreationOptions) => {
    if (tag === 'canvas') return { getContext: () => ({ drawImage: vi.fn() }), captureStream: () => stream } as any
    return createElement(tag, options)
  })
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.push(callback); return frames.length })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  vi.stubGlobal('MediaRecorder', class {
    state = 'inactive'
    ondataavailable: ((event: { data: Blob }) => void) | null = null
    onstop: (() => void) | null = null
    /** 记录实例次数以发现隐蔽的重复编码。 */
    constructor() { recorders.push(this) }
    /** 模拟浏览器已支持所请求的输出编码。 */
    static isTypeSupported() { return true }
    /** 开始一次录制。 */
    start() { this.state = 'recording' }
    /** 请求分片由测试通过 ondataavailable 手动完成。 */
    requestData() {}
    /** 停止录制并通知工具组装真实 Blob。 */
    stop() { this.state = 'inactive'; this.onstop?.() }
  })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
  const video = view.get('video[aria-label="原视频预览"]')
  Object.defineProperties(video.element, {
    duration: { configurable: true, value: duration },
    videoWidth: { configurable: true, value: 320 },
    videoHeight: { configurable: true, value: 180 },
    currentTime: { configurable: true, value: 0, writable: true },
    ended: { configurable: true, value: false, writable: true }
  })
  await video.trigger('loadedmetadata')
  if (start) {
    view.findAllComponents({ name: 'ElRadioGroup' })[0].vm.$emit('update:modelValue', 'browser')
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
  }
  return { video: video.element as HTMLVideoElement, frames, recorders }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
  services.userUid = '1001'
  services.settle.mockReset().mockResolvedValue(true)
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  URL.createObjectURL = vi.fn(() => 'blob:video-test')
  URL.revokeObjectURL = vi.fn()
  services.consume.mockResolvedValue(true)
  services.config.mockResolvedValue({ available: true, crf: 26 })
})

afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('视频压缩任务的取消和重试', () => {
  /** 模拟后端按 requestId 预扣、结算及退款，积分余额不使用固定的成功桩。 */
  function installPointsLedger(initialBalance: number) {
    const ledger = new Map<string, { status: string; points: number }>()
    let balance = initialBalance
    let legacyCalls = 0
    services.consume.mockImplementation(async (options) => {
      if (options.mode === 'check-login') return true
      const requestId = options.requestId || `legacy_${++legacyCalls}`
      if (!ledger.has(requestId)) {
        if (balance < 5) return false
        balance -= 5
        ledger.set(requestId, { status: options.requestId ? 'reserved' : 'committed', points: 5 })
      }
      const entry = ledger.get(requestId)!
      options.onConsumed?.({ requestId, status: entry.status, consumePoints: entry.points,
        profile: { uid: services.userUid }, remainPoints: balance })
      return true
    })
    services.settle.mockImplementation(async (requestId, outcome) => {
      const entry = ledger.get(requestId)
      if (!entry) return false
      if (entry.status === 'reserved') {
        entry.status = outcome === 'success' ? 'committed' : 'refunded'
        if (outcome === 'failed') balance += entry.points
      }
      return true
    })
    return { ledger, balance: () => balance }
  }

  it.each([
    ['服务不可用', 5], ['服务不可用', 10], ['服务处理失败', 5], ['服务处理失败', 10]
  ] as const)('%s且余额为%s时，本地兜底沿用一次预扣并在成功后结算', async (failure, balance) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const points = installPointsLedger(balance)
    if (failure === '服务不可用') services.config.mockResolvedValueOnce({ available: false })
    else services.compress.mockRejectedValueOnce(new Error('压缩处理失败'))
    const view = await mountVideo(221)
    const { video, recorders } = await prepareLocalRecording(view, 3, false)
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(services.consume.mock.calls[0][0].toolKey).toBe('video-compress-large')
    await view.get('[data-test="use-local-compression"]').trigger('click')
    await view.get('.video-compress-primary').trigger('click')
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(services.consume).toHaveBeenCalledOnce()
    expect(recorders).toHaveLength(1)
    expect(points.balance()).toBe(balance - 5)
    recorders[0].ondataavailable({ data: new Blob(['compressed-video']) })
    video.onended!(new Event('ended'))
    await flushPromises()
    expect(view.find('.video-result-panel').exists()).toBe(true)
    expect(services.settle).toHaveBeenCalledOnce()
    expect(services.settle.mock.calls[0].slice(0, 2)).toEqual([services.consume.mock.calls[0][0].requestId, 'success'])
    expect([...points.ledger.values()].map(entry => entry.status)).toEqual(['committed'])
    expect(points.balance()).toBe(balance - 5)
  })

  it('服务端重复重试不再扣费，用户放弃任务时只退款一次', async () => {
    const points = installPointsLedger(5)
    services.config.mockResolvedValue({ available: false })
    const view = await mountVideo(221)
    await prepareLocalRecording(view, 3, false)
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(services.config).toHaveBeenCalledTimes(2)
    expect(services.consume).toHaveBeenCalledOnce()
    await view.get('[data-test="end-compression-task"]').trigger('click')
    await flushPromises()
    wrapper!.unmount()
    wrapper = undefined
    await flushPromises()
    expect(services.settle).toHaveBeenCalledOnce()
    expect(points.balance()).toBe(5)
  })

  it('本地兜底和两次兼容重试均失败时退回预扣，重新开始使用新任务', async () => {
    vi.useFakeTimers()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const points = installPointsLedger(5)
    services.config.mockResolvedValue({ available: false })
    const view = await mountVideo(221)
    const { recorders } = await prepareLocalRecording(view, 3, false)
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    await view.get('[data-test="use-local-compression"]').trigger('click')
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    for (let index = 0; index < 3; index++) {
      recorders[index].onerror({ error: new Error('record failed') })
      await vi.advanceTimersByTimeAsync(80)
    }
    await flushPromises()
    expect(services.consume).toHaveBeenCalledOnce()
    expect(services.settle.mock.calls[0][1]).toBe('failed')
    expect(points.balance()).toBe(5)
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(services.consume).toHaveBeenCalledTimes(2)
    expect(services.consume.mock.calls[1][0].requestId).not.toBe(services.consume.mock.calls[0][0].requestId)
    expect(points.balance()).toBe(0)
  })

  it('取消迟到的预扣后立即重试，先完成退款再授权，余额只有一次费用也可继续', async () => {
    const points = installPointsLedger(5)
    const consume = services.consume.getMockImplementation()!
    const delayed = deferred<void>()
    services.consume.mockImplementationOnce(async (options) => {
      const allowed = await consume(options)
      await delayed.promise
      return allowed
    })
    services.config.mockResolvedValue({ available: false })
    const view = await mountVideo(221)
    await prepareLocalRecording(view, 3, false)
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    await view.get('[data-test="cancel"]').trigger('click')
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(services.consume).toHaveBeenCalledOnce()
    delayed.resolve()
    await flushPromises()
    expect(services.consume).toHaveBeenCalledTimes(2)
    expect(services.settle).toHaveBeenCalledOnce()
    expect(points.balance()).toBe(0)
    expect([...points.ledger.values()].map(entry => entry.status)).toEqual(['refunded', 'reserved'])
    expect(view.find('[data-test="use-local-compression"]').exists()).toBe(true)
  })

  it('更换视频会退回未完成任务预扣，新视频不能复用旧授权', async () => {
    const points = installPointsLedger(5)
    services.config.mockResolvedValue({ available: false })
    const view = await mountVideo(221)
    await prepareLocalRecording(view, 3, false)
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    const nextFile = new File(['new-file'], 'other.mp4', { type: 'video/mp4' })
    Object.defineProperty(nextFile, 'size', { value: 221 * 1024 * 1024 })
    Object.defineProperty(view.get('input[type="file"]').element, 'files', { configurable: true, value: [nextFile] })
    await view.get('input[type="file"]').trigger('change')
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(services.consume).toHaveBeenCalledTimes(2)
    expect(services.consume.mock.calls[1][0].requestId).not.toBe(services.consume.mock.calls[0][0].requestId)
    expect(points.balance()).toBe(5)
    expect([...points.ledger.values()].every(entry => entry.status === 'refunded')).toBe(true)
  })

  it('服务端与浏览器都无法处理视频时立即退款，不保留不可用的授权', async () => {
    const points = installPointsLedger(5)
    services.config.mockResolvedValue({ available: false })
    const view = await mountVideo(221)
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(services.settle).toHaveBeenCalledOnce()
    expect(points.balance()).toBe(5)
    expect(view.find('[data-test="end-compression-task"]').exists()).toBe(false)
  })

  it('免费放行没有消费回执，失败或离开时不得申请不存在的退款', async () => {
    services.config.mockResolvedValue({ available: false })
    const view = await mountVideo()
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    wrapper!.unmount()
    wrapper = undefined
    await flushPromises()
    expect(services.settle).not.toHaveBeenCalled()
  })

  it('成功后再次压缩属于新任务，不能永久复用同一视频的历史授权', async () => {
    const points = installPointsLedger(10)
    services.compress.mockResolvedValue({ blob: new Blob(['video']), outputSize: 5,
      fileName: 'result.mp4', compressed: true, elapsedMs: 10 })
    const view = await mountVideo(221)
    for (let run = 0; run < 2; run++) {
      await view.get('.video-compress-primary').trigger('click')
      await flushPromises()
    }
    expect(services.consume).toHaveBeenCalledTimes(2)
    expect(new Set(services.consume.mock.calls.map(([options]) => options.requestId)).size).toBe(2)
    expect(points.balance()).toBe(0)
    expect([...points.ledger.values()].every(entry => entry.status === 'committed')).toBe(true)
  })

  it('WebM 未提供有限时长时明确说明，不能把 Infinity 展示成零秒', async () => {
    services.compress.mockResolvedValueOnce({
      blob: new Blob(['video']), outputSize: 5, fileName: 'result.webm', compressed: false, elapsedMs: 10
    })
    const view = await mountVideo()
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    const resultVideo = view.get('video[aria-label="压缩视频预览"]')
    Object.defineProperty(resultVideo.element, 'duration', { configurable: true, value: Infinity })
    await resultVideo.trigger('loadedmetadata')
    expect(view.findComponent(VideoResultComparison).props('metrics').find((metric: any) => metric.label === '时长').after)
      .toBe('容器未提供时长')
  })

  it('十分钟视频到 99% 不能提前封装，必须保留最后几秒', async () => {
    const { video, frames, recorders } = await prepareLocalRecording(await mountVideo())
    expect(recorders).toHaveLength(1)
    video.currentTime = 595
    frames.shift()!(0)
    expect(recorders[0].state).toBe('recording')
    expect(video.onended).toBeTypeOf('function')
    expect(frames).toHaveLength(1)
  })

  it('本地结果没有缩小时直接保留原视频，不自动再编码两遍', async () => {
    const view = await mountVideo()
    const { video, recorders } = await prepareLocalRecording(view, 3)
    recorders[0].ondataavailable({ data: new Blob(['larger-than-the-original-test-file'.repeat(3)]) })
    video.onended!(new Event('ended'))
    await flushPromises()
    expect(view.find('.video-result-panel').exists()).toBe(true)
    expect(view.text()).toContain('已保留原视频')
    expect(view.get('.video-compress-primary').attributes('disabled')).toBeUndefined()
    expect(recorders).toHaveLength(1)
    expect(services.consume).toHaveBeenCalledOnce()
  })

  it('默认使用快速档，标准档选择传给服务器；处理中切换参数不改变已提交任务', async () => {
    const pending = deferred<any>()
    services.compress.mockReturnValue(pending.promise)
    const view = await mountVideo()
    const speed = view.findAllComponents({ name: 'ElRadioGroup' }).find((group) => group.props('modelValue') === 'fast')!
    expect(speed).toBeDefined()
    speed.vm.$emit('update:modelValue', 'balanced')
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(services.compress.mock.calls[0][1].speed).toBe('balanced')
    expect(speed.props('disabled')).toBe(true)
  })

  it('上传完成后不伪造转码百分比，下载开始后切换到接收结果阶段', async () => {
    services.compress.mockReturnValue(deferred<any>().promise)
    const view = await mountVideo()
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    const callbacks = services.compress.mock.calls[0][1]
    callbacks.onUploadProgress(100)
    await flushPromises()
    expect(view.findComponent(VideoProcessStatus).props('indeterminate')).toBe(true)
    expect(view.findComponent(VideoProcessStatus).props('progressLabel')).toBe('服务端处理中')
    expect(view.findComponent(MobileToolActions).props('description')).not.toContain('45%')
    callbacks.onDownloadProgress(30)
    await flushPromises()
    expect(view.findComponent(VideoProcessStatus).props('progressLabel')).toBe('接收 30%')
    expect(view.findComponent(VideoProcessStatus).props('indeterminate')).toBe(false)
  })

  it('专业模式失败后停止，用户决定是否改用需要完整播放的本地模式', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    services.compress.mockRejectedValueOnce(new Error('压缩服务繁忙，请稍后重试'))
    const view = await mountVideo()
    const video = view.get('video[aria-label="原视频预览"]')
    Object.defineProperties(video.element, {
      duration: { configurable: true, value: 120 },
      videoWidth: { configurable: true, value: 1920 },
      videoHeight: { configurable: true, value: 1080 }
    })
    await video.trigger('loadedmetadata')
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    expect(view.get('.video-compress-primary').attributes('disabled')).toBeUndefined()
    expect(view.text()).toContain('压缩服务繁忙')
    expect(view.find('[data-test="cancel"]').exists()).toBe(false)
    await view.get('[data-test="use-local-compression"]').trigger('click')
    expect(view.text()).toContain('至少需要约 02:00')
    expect(services.compress).toHaveBeenCalledOnce()
    expect(services.consume).toHaveBeenCalledOnce()
  })
  it('手机主操作复用压缩流程，完成后切换结果，预览切换不卸载原视频', async () => {
    services.compress.mockResolvedValueOnce({
      blob: new Blob(['video']), outputSize: 5, fileName: 'result.mp4', compressed: true, elapsedMs: 10
    })
    const view = await mountVideo()
    const original = view.get('video[aria-label="原视频预览"]').element
    const dock = view.findComponent(MobileToolActions)
    expect(dock.props('actionLabel')).toBe('开始压缩')
    dock.vm.$emit('action')
    await flushPromises()
    expect(services.compress).toHaveBeenCalledOnce()
    expect(dock.props('actionLabel')).toBe('下载视频')
    expect(view.get('.video-compress-preview-tabs button:last-child').attributes('aria-pressed')).toBe('true')
    await view.get('.video-compress-preview-tabs button:first-child').trigger('click')
    expect(view.get('video[aria-label="原视频预览"]').element).toBe(original)
    expect(view.find('video[aria-label="压缩视频预览"]').exists()).toBe(true)
  })

  it('修改参数会明确标记旧结果，并把手机主操作改回重新压缩', async () => {
    services.compress.mockResolvedValueOnce({
      blob: new Blob(['video']), outputSize: 5, fileName: 'result.mp4', compressed: true, elapsedMs: 10
    })
    const view = await mountVideo()
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    view.findAllComponents({ name: 'ElRadioGroup' })[0].vm.$emit('update:modelValue', 'browser')
    await flushPromises()
    expect(view.findComponent(MobileToolActions).props('actionLabel')).toBe('重新压缩')
    expect(view.get('.video-compress-stale').text()).toContain('上次结果')
    expect(view.find('video[aria-label="压缩视频预览"]').exists()).toBe(true)
  })

  it.each(['取消', '拒绝'])('参数修改后，%s重压授权仍保持旧结果失效', async (outcome) => {
    services.compress.mockResolvedValueOnce({
      blob: new Blob(['video']), outputSize: 5, fileName: 'result.mp4', compressed: true, elapsedMs: 10
    })
    const view = await mountVideo()
    const video = view.get('video[aria-label="原视频预览"]')
    Object.defineProperties(video.element, {
      duration: { configurable: true, value: 2 },
      videoWidth: { configurable: true, value: 320 },
      videoHeight: { configurable: true, value: 180 }
    })
    await video.trigger('loadedmetadata')
    await view.get('.video-compress-primary').trigger('click')
    await flushPromises()
    view.findAllComponents({ name: 'ElRadioGroup' })[0].vm.$emit('update:modelValue', 'browser')
    await flushPromises()
    const pending = deferred<boolean>()
    services.consume.mockReturnValueOnce(pending.promise)
    view.findComponent(MobileToolActions).vm.$emit('action')
    await flushPromises()
    if (outcome === '取消') await view.get('[data-test="cancel"]').trigger('click')
    pending.resolve(outcome === '取消')
    await flushPromises()
    expect(view.findComponent(MobileToolActions).props('actionLabel')).toBe('重新压缩')
    expect(view.get('.video-compress-stale').text()).toContain('上次结果')
    expect(services.compress).toHaveBeenCalledOnce()
  })

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
