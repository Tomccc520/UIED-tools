/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import GifCompress from './GifCompress.vue'

const mocks = vi.hoisted(() => ({
  loadRuntime: vi.fn(), encoderOptions: vi.fn(), addFrame: vi.fn(), render: vi.fn(),
  listeners: new Map<string, (...args: any[]) => void>(),
  message: { warning: vi.fn(), success: vi.fn(), error: vi.fn() }
}))

vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/gif-compress' }) }))
vi.mock('@vueuse/head', () => ({ useHead: vi.fn() }))
vi.mock('@/utils/toolRuntimeLoaders', () => ({ ensureGifRuntime: mocks.loadRuntime }))
vi.mock('element-plus', async (importOriginal) => ({
  ...await importOriginal<typeof import('element-plus')>(), ElMessage: mocks.message
}))

/** 为测试提供与全站标题函数一致的最小中文标题处理。 */
const ensureFreeToolTitleForTest = (title: string): string => title.includes('免费') ? title : `免费${title}`

/** 构造不透明两像素 GIF 解码数据，便于验证页面到编码器的真实选项传递。 */
const makeRuntime = () => ({
  GIF: class {
    activeWorkers = []
    freeWorkers = []
    constructor(options: unknown) { mocks.encoderOptions(options) }
    addFrame(image: ImageData, options: unknown) { mocks.addFrame(image, options) }
    on(event: string, callback: (...args: any[]) => void) { mocks.listeners.set(event, callback); return this }
    render() { mocks.render() }
    abort() {}
  },
  parseGIF: vi.fn(() => ({
    lsd: { width: 2, height: 1, backgroundColorIndex: 0 }, gct: [[255, 255, 255]],
    frames: [
      { application: { id: 'NETSCAPE2.0', blocks: [1, 2, 0] } },
      { image: { descriptor: { width: 2, height: 1, top: 0, left: 0 } } }
    ]
  })),
  decompressFrames: vi.fn(() => [{
    dims: { width: 2, height: 1, top: 0, left: 0 },
    patch: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 255]), delay: 250, disposalType: 1
  }])
})

describe('GifCompress.vue', () => {
  let wrapper: ReturnType<typeof mount>
  let runtime: ReturnType<typeof makeRuntime>
  let urlIndex = 0

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listeners.clear()
    urlIndex = 0
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => `blob:gif-${++urlIndex}`), revokeObjectURL: vi.fn()
    })
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: query === '(max-width: 640px)', media: query, onchange: null,
      addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(), dispatchEvent: vi.fn()
    })))
    vi.stubGlobal('ImageData', class {
      data: Uint8ClampedArray
      width: number
      height: number
      constructor(data: Uint8ClampedArray, width: number, height: number) {
        this.data = data; this.width = width; this.height = height
      }
    })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({
      clearRect: vi.fn(), drawImage: vi.fn(), putImageData: vi.fn(),
      getImageData: () => ({ data: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 255, 255]) })
    }) as unknown as CanvasRenderingContext2D)
    runtime = makeRuntime()
    mocks.loadRuntime.mockResolvedValue(runtime)
    wrapper = mount(GifCompress, {
      global: {
        mocks: { $ensureFreeToolTitle: ensureFreeToolTitleForTest },
        stubs: { 'router-link': { props: ['to'], template: '<a :href="to"><slot /></a>' }, ToolsRecommend: true }
      }
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  /** 准备有合法 GIF 签名的源文件及尺寸，不依赖 jsdom 的原生图片解码。 */
  const prepareFile = () => {
    const source = new File(['GIF89a' + 'source'.repeat(20)], 'test.gif', { type: 'image/gif' })
    Object.defineProperty(source, 'arrayBuffer', { configurable: true, value: async () => new TextEncoder().encode('GIF89atest-data').buffer })
    const vm = wrapper.vm as any
    vm.file = source
    vm.originalSrc = 'blob:original'
    vm.originalSize = source.size
    vm.originalDimensions.width = vm.customDimensions.width = 2
    vm.originalDimensions.height = vm.customDimensions.height = 1
    return vm
  }

  it('显示单个明确 H1，并提供存在的跳转视频转 GIF 入口', () => {
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.text()).toContain('免费在线 GIF 动图压缩工具')
    expect(wrapper.find('a[href="/tools/video/gif"]').exists()).toBe(true)
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
  })

  it('编码使用源 loop，成功后显示真实结果且释放繁忙锁', async () => {
    const vm = prepareFile()
    // 等待编码器实际启动事件，避免并行运行下组件渲染耗时超过轮询的默认一秒。
    const rendered = new Promise<void>((resolve) => mocks.render.mockImplementationOnce(() => resolve()))
    const job = vm.startCompression()
    await rendered
    expect(mocks.render).toHaveBeenCalledOnce()
    expect(mocks.encoderOptions).toHaveBeenCalledWith(expect.objectContaining({ repeat: 2, width: 2, height: 1, quality: 1 }))
    expect(mocks.addFrame.mock.calls[0][1]).toEqual({ delay: 250 })
    mocks.listeners.get('finished')!(new Blob(['GIF89a-result'], { type: 'image/gif' }))
    await job
    expect(vm.compressedSrc).toBe('blob:gif-1')
    expect(vm.isProcessing).toBe(false)
    expect(wrapper.text()).toContain('已保留原动画总时长和循环次数')
  })

  it('压缩过程中锁定重新上传和全部参数，直接调用重置也不会删除正在处理的文件', async () => {
    const vm = prepareFile()
    const source = vm.file
    // 等待编码器实际启动事件，避免并行运行下组件渲染耗时超过轮询的默认一秒。
    const rendered = new Promise<void>((resolve) => mocks.render.mockImplementationOnce(() => resolve()))
    const job = vm.startCompression()
    await rendered
    expect(mocks.render).toHaveBeenCalledOnce()
    expect(wrapper.findAll('button').filter((button) => button.text() === '重新上传')[0].attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('button').filter((button) => ['画质优先保画质', '平衡体积/画质'].includes(button.text().replace(/\s/g, ''))).every((button) => button.attributes('disabled') !== undefined)).toBe(true)
    vm.reset()
    vm.applyCompressionPreset('strong')
    expect(vm.file).toBe(source)
    expect(vm.options.scale).toBe(1)
    vm.cancelCompression()
    await job
    expect(vm.isProcessing).toBe(false)
    expect(wrapper.text()).toContain('已取消压缩')
  })

  it('等待依赖时也能取消，不再一直停留在压缩中', async () => {
    mocks.loadRuntime.mockImplementation(() => new Promise(() => {}))
    const vm = prepareFile()
    const job = vm.startCompression()
    await flushPromises()
    vm.cancelCompression()
    await job
    expect(vm.isProcessing).toBe(false)
    expect(vm.compressedSrc).toBe('')
    expect(wrapper.text()).toContain('已取消压缩')
  })

  it('整任务超时包括依赖加载，显示明确超时错误并解除锁定', async () => {
    vi.useFakeTimers()
    mocks.loadRuntime.mockImplementation(() => new Promise(() => {}))
    const vm = prepareFile()
    const job = vm.startCompression()
    await vi.advanceTimersByTimeAsync(120_000)
    await job
    expect(vm.isProcessing).toBe(false)
    expect(wrapper.get('[role="alert"]').text()).toContain('GIF 压缩超时')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('透明画布安全保留原图并明确说明未应用参数，不伪装压缩成功', async () => {
    runtime.decompressFrames.mockReturnValue([{
      dims: { width: 2, height: 1, top: 0, left: 0 },
      patch: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 0, 0]),
      delay: 100, disposalType: 1, transparentIndex: 0
    } as any])
    const vm = prepareFile()
    vm.applyCompressionPreset('extreme')
    await vm.startCompression()
    expect(mocks.render).not.toHaveBeenCalled()
    expect(vm.keptOriginal).toBe(true)
    expect(vm.outputDimensions).toMatchObject({ width: 2, height: 1 })
    expect(wrapper.text()).toContain('暂不支持安全压缩')
    expect(wrapper.text()).toContain('未应用自定义参数')
    expect(wrapper.text()).toContain('下载原图')
    expect(mocks.message.success).not.toHaveBeenCalled()
  })

  it('结果更大时恢复原尺寸和原帧数，避免展示未执行的自定义缩放', async () => {
    const vm = prepareFile()
    vm.applyCompressionPreset('extreme')
    // 等待编码器实际启动事件，避免并行运行下组件渲染耗时超过轮询的默认一秒。
    const rendered = new Promise<void>((resolve) => mocks.render.mockImplementationOnce(() => resolve()))
    const job = vm.startCompression()
    await rendered
    expect(mocks.render).toHaveBeenCalledOnce()
    mocks.listeners.get('finished')!(new Blob(['GIF89a' + 'larger'.repeat(50)], { type: 'image/gif' }))
    await job
    expect(vm.compressedSrc).toBe('blob:original')
    expect(vm.keptOriginal).toBe(true)
    expect(vm.outputDimensions).toMatchObject({ width: 2, height: 1 })
    expect(vm.compressionStats.encodedFrames).toBe(1)
    expect(wrapper.text()).toContain('未应用自定义参数')
  })

  it('重新压缩失败时清除旧结果，显示错误并允许重试', async () => {
    const vm = prepareFile()
    vm.compressedSrc = 'blob:old-result'
    mocks.loadRuntime.mockRejectedValue(new Error('GIF 编码器加载失败，请刷新页面后重试'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await vm.startCompression()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:old-result')
    expect(vm.compressedSrc).toBe('')
    expect(vm.isProcessing).toBe(false)
    expect(wrapper.get('[role="alert"]').text()).toContain('编码器加载失败')
    expect(wrapper.text()).not.toContain('下载原图')
  })

  it('校验完整 GIF 文件签名，不把仅改扩展名的其他文件当 GIF', async () => {
    const vm = prepareFile()
    Object.defineProperty(vm.file, 'arrayBuffer', { configurable: true, value: async () => new TextEncoder().encode('NotGIF').buffer })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await vm.startCompression()
    expect(runtime.parseGIF).not.toHaveBeenCalled()
    expect(wrapper.get('[role="alert"]').text()).toContain('不是有效 GIF')
  })

  it('离开页面时取消在途任务并释放源文件和历史预览 URL', async () => {
    mocks.loadRuntime.mockImplementation(() => new Promise(() => {}))
    const vm = prepareFile()
    const job = vm.startCompression()
    await flushPromises()
    wrapper.unmount()
    await job
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:original')
    expect(mocks.render).not.toHaveBeenCalled()
  })

  it('手机默认收起参数与帮助，单张预览在原图和压缩后之间切换，底部复用压缩及下载', async () => {
    prepareFile()
    await flushPromises()
    const toggle = wrapper.get('.gif-settings-toggle')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('.gif-help').attributes('open')).toBeUndefined()
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    const original = wrapper.get('.gif-preview-tabs button:first-child')
    const result = wrapper.get('.gif-preview-tabs button:last-child')
    expect(original.attributes('aria-pressed')).toBe('true')
    expect(result.attributes('disabled')).toBeDefined()
    const primary = document.querySelector<HTMLButtonElement>('.mobile-tool-actions__primary')!
    expect(primary.textContent).toBe('开始压缩')
    const rendered = new Promise<void>((resolve) => mocks.render.mockImplementationOnce(() => resolve()))
    primary.click()
    await rendered
    expect(primary.disabled).toBe(true)
    mocks.listeners.get('finished')!(new Blob(['GIF89a-result'], { type: 'image/gif' }))
    await flushPromises()
    expect(result.attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('.gif-mobile-previews').classes()).toContain('gif-mobile-previews--compressed')
    await original.trigger('click')
    expect(wrapper.get('.gif-mobile-previews').classes()).toContain('gif-mobile-previews--original')
    await result.trigger('click')
    expect(wrapper.get('.gif-mobile-previews').classes()).toContain('gif-mobile-previews--compressed')
    const download = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    expect(primary.textContent).toBe('下载 GIF')
    primary.click()
    expect(download).toHaveBeenCalledOnce()
    expect((download.mock.instances[0] as HTMLAnchorElement).href).toBe('blob:gif-1')
    expect((download.mock.instances[0] as HTMLAnchorElement).download).toBe('uiedtool_test.gif')
  })

  it('调整参数会撤销旧结果并恢复压缩入口，不能从底部下载未应用新参数的旧 GIF', async () => {
    const vm = prepareFile()
    const rendered = new Promise<void>((resolve) => mocks.render.mockImplementationOnce(() => resolve()))
    const job = vm.startCompression()
    await rendered
    mocks.listeners.get('finished')!(new Blob(['GIF89a-result'], { type: 'image/gif' }))
    await job
    await flushPromises()
    expect(document.querySelector('.mobile-tool-actions__primary')!.textContent).toBe('下载 GIF')
    vm.applyCompressionPreset('strong')
    await flushPromises()
    expect(vm.compressedSrc).toBe('')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:gif-1')
    expect(wrapper.get('.gif-mobile-previews').classes()).toContain('gif-mobile-previews--original')
    expect(wrapper.get('.gif-preview-tabs button:last-child').attributes('disabled')).toBeDefined()
    expect(document.querySelector('.mobile-tool-actions__primary')!.textContent).toBe('开始压缩')
    expect(wrapper.text()).toContain('参数已修改，请重新压缩')
  })

  it('手机底部可以取消依赖尚未完成的压缩，离开页面后操作栏清理', async () => {
    mocks.loadRuntime.mockImplementation(() => new Promise(() => {}))
    const vm = prepareFile()
    await flushPromises()
    document.querySelector<HTMLButtonElement>('.mobile-tool-actions__primary')!.click()
    await flushPromises()
    expect(vm.isProcessing).toBe(true)
    document.querySelector<HTMLButtonElement>('.mobile-tool-actions__cancel')!.click()
    await flushPromises()
    expect(vm.isProcessing).toBe(false)
    expect(wrapper.text()).toContain('已取消压缩')
    expect(document.querySelector<HTMLButtonElement>('.mobile-tool-actions__primary')!.disabled).toBe(false)
    wrapper.unmount()
    expect(document.querySelector('.mobile-tool-actions')).toBeNull()
  })

  it('透明 GIF 回退时手机主操作准确显示下载原图，并保留原图体积', async () => {
    runtime.decompressFrames.mockReturnValue([{
      dims: { width: 2, height: 1, top: 0, left: 0 },
      patch: new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 0, 0]),
      delay: 100, disposalType: 1, transparentIndex: 0
    } as any])
    const vm = prepareFile()
    await vm.startCompression()
    await flushPromises()
    expect(document.querySelector('.mobile-tool-actions__primary')!.textContent).toBe('下载原图')
    expect(document.querySelector('.mobile-tool-actions__status strong')!.textContent).toBe('已保留原图')
    expect(vm.compressedSize).toBe(vm.originalSize)
    expect(mocks.render).not.toHaveBeenCalled()
  })
})
