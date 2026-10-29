/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import ImageCompress from './ImageCompress.vue'

const mocks = vi.hoisted(() => ({
  compress: vi.fn(), compressPng: vi.fn(), addToZip: vi.fn(), generateZip: vi.fn(), download: vi.fn(),
  message: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() }
}))
vi.mock('compressorjs', () => ({ default: class { constructor(file: Blob, options: unknown) { mocks.compress(file, options) } } }))
vi.mock('@/utils/pngCompression', () => ({
  compressPngInWorker: mocks.compressPng,
  PngCompressionError: class extends Error {},
  PNG_COMPRESSION_MAX_PIXELS: 24000000
}))
vi.mock('element-plus', () => ({ ElMessage: mocks.message }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/image-compress' }) }))
vi.mock('@/utils/file', () => ({ autoDown: mocks.download }))
vi.mock('jszip', () => ({ default: class { file = mocks.addToZip; generateAsync = mocks.generateZip } }))

let wrapper: VueWrapper | undefined
let urlCount = 0
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => `blob:test-${++urlCount}`), revokeObjectURL: vi.fn() })
  mocks.compress.mockImplementation((_file, options) => options.success(new Blob(['compressed'], { type: 'image/jpeg' })))
  mocks.compressPng.mockResolvedValue(new Blob(['png'], { type: 'image/png' }))
  mocks.generateZip.mockResolvedValue(new Blob(['zip']))
})
afterEach(() => { wrapper?.unmount(); vi.unstubAllGlobals() })

/** 挂载真实文件队列与压缩逻辑，仅替换浏览器编解码和站点外壳。 */
const mountCompressor = () => {
  wrapper = mount(ImageCompress, { global: { stubs: {
    StandardToolPageTemplate: { template: '<main><slot /><slot name="actions" /></main>' },
    ToolsRecommend: true, ElImage: true, ElSlider: true,
    ElButton: defineComponent({ props: ['disabled'], template: '<button :disabled="disabled"><slot /></button>' })
  } } })
  return wrapper
}

/** 通过真实文件输入事件添加本地文件，验证批次状态而不访问组件私有方法。 */
const addFiles = async (files: File[]) => {
  const input = wrapper!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: files })
  await input.trigger('change')
}

/** 创建尺寸足够大的 JPEG 样本供压缩引擎替身处理。 */
const image = (name: string, type = 'image/jpeg') => new File(['original image content'], name, { type })

/** 点击压缩入口并等待批次结果回写。 */
const compress = async () => {
  await wrapper!.get('[data-smoke="image-compress-start"]').trigger('click')
  await flushPromises()
}

describe('图片压缩批量与打包', () => {
  it('参数修改后撤下旧下载，打包时使用新参数重新处理全部图片', async () => {
    const view = mountCompressor()
    await addFiles([image('settings.jpg')])
    await compress()
    expect(view.findAll('a[download]')).toHaveLength(1)
    await view.get('input[type="checkbox"]').setValue(false)
    expect(view.findAll('a[download]')).toHaveLength(0)
    expect(view.text()).toContain('参数已修改')
    expect(view.text()).toContain('已完成: 0')
    await view.get('[data-smoke="image-compress-download"]').trigger('click')
    await flushPromises()
    expect(mocks.compress).toHaveBeenCalledTimes(2)
    expect(mocks.compress.mock.calls[1][1].maxWidth).toBe(4096)
    expect(mocks.download).toHaveBeenCalledOnce()
  })

  it('PNG 模式修改不会继续下载旧无损结果', async () => {
    const view = mountCompressor()
    await addFiles([image('settings.png', 'image/png')])
    await compress()
    await view.get('input[value="quantized"]').setValue(true)
    expect(view.findAll('a[download]')).toHaveLength(0)
    await view.get('[data-smoke="image-compress-download"]').trigger('click')
    await flushPromises()
    expect(mocks.compressPng.mock.calls[1][1].mode).toBe('quantized')
  })

  it('停止批次保留已完成图片，忽略迟到回调，之后可继续处理剩余图片', async () => {
    const view = mountCompressor()
    let lateSuccess!: (blob: Blob) => void
    mocks.compress.mockImplementationOnce((_file, options) => options.success(new Blob(['small'], { type: 'image/jpeg' })))
      .mockImplementationOnce((_file, options) => { lateSuccess = options.success })
    await addFiles([image('done.jpg'), image('cancel.jpg'), image('pending.jpg')])
    await view.get('[data-smoke="image-compress-start"]').trigger('click')
    await flushPromises()
    expect(mocks.compress).toHaveBeenCalledTimes(2)
    await view.get('[data-smoke="image-compress-cancel"]').trigger('click')
    await flushPromises()
    expect(view.text()).toContain('已停止')
    expect(view.text()).toContain('已完成: 1')
    expect(view.text()).toContain('待处理: 2')
    expect(view.findAll('[role="alert"]')).toHaveLength(0)
    lateSuccess(new Blob(['late'], { type: 'image/jpeg' }))
    await flushPromises()
    expect(view.findAll('a[download]')).toHaveLength(1)
    await view.get('[data-smoke="image-compress-download"]').trigger('click')
    await flushPromises()
    expect(mocks.compress).toHaveBeenCalledTimes(4)
    expect(mocks.addToZip.mock.calls.map((call) => call[0])).toEqual(['uied_done.jpg', 'uied_cancel.jpg', 'uied_pending.jpg'])
  })

  it('压缩并下载期间主动停止，不自动打包不完整批次，PNG 任务收到取消信号', async () => {
    const view = mountCompressor()
    mocks.compressPng.mockImplementationOnce((_file, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
    }))
    await addFiles([image('cancel.png', 'image/png'), image('pending.png', 'image/png')])
    await view.get('[data-smoke="image-compress-download"]').trigger('click')
    expect(mocks.compressPng).toHaveBeenCalledOnce()
    const signal = mocks.compressPng.mock.calls[0][1].signal as AbortSignal
    await view.get('[data-smoke="image-compress-cancel"]').trigger('click')
    await flushPromises()
    expect(signal.aborted).toBe(true)
    expect(mocks.generateZip).not.toHaveBeenCalled()
    expect(mocks.download).not.toHaveBeenCalled()
    expect(view.get('[data-smoke="image-compress-download"]').attributes('disabled')).toBeUndefined()
    expect(view.findAll('[role="alert"]')).toHaveLength(0)
  })

  it('窄屏大图对比切换跟随当前文件结果，新增未处理图片不会沿用旧结果', async () => {
    const view = mountCompressor()
    await addFiles([image('first.jpg')])
    const original = view.get('.image-preview__mobile-tabs button:first-child')
    const result = view.get('.image-preview__mobile-tabs button:last-child')
    expect(original.attributes('aria-pressed')).toBe('true')
    expect(result.attributes('disabled')).toBeDefined()
    await compress()
    expect(result.attributes('aria-pressed')).toBe('true')
    expect(view.get('.image-preview__grid').classes()).toContain('image-preview__grid--compressed')
    await original.trigger('click')
    expect(original.attributes('aria-pressed')).toBe('true')
    expect(view.findAll('a[download]')).toHaveLength(1)
    await addFiles([image('second.jpg')])
    await view.get('button[aria-label="预览 second.jpg"]').trigger('click')
    expect(original.attributes('aria-pressed')).toBe('true')
    expect(result.attributes('disabled')).toBeDefined()
    expect(view.findAll('[data-smoke="image-compress-file"]')).toHaveLength(2)
  })

  it('手机批量下载栏移到页面底部且复用完整压缩打包流程，离开页面后清理', async () => {
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches: query === '(max-width: 640px)', media: query,
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })))
    const view = mountCompressor()
    await addFiles([image('phone.jpg')])
    await flushPromises()
    const dock = document.body.querySelector('.image-results__footer--docked')!
    expect(dock).not.toBeNull()
    expect(dock.parentElement).toBe(document.body)
    const download = dock.querySelector<HTMLButtonElement>('[data-smoke="image-compress-download"]')!
    expect(download.textContent).toContain('压缩并下载')
    download.click()
    await flushPromises()
    expect(mocks.compress).toHaveBeenCalledOnce()
    expect(mocks.generateZip).toHaveBeenCalledOnce()
    expect(mocks.addToZip.mock.calls[0][0]).toBe('uied_phone.jpg')
    expect(download.textContent).toContain('打包下载')
    view.unmount()
    wrapper = undefined
    expect(document.body.querySelector('.image-results__footer--docked')).toBeNull()
  })

  it('已完成数量响应式更新，新增图片会在打包前完成压缩', async () => {
    const view = mountCompressor()
    await addFiles([image('first.jpg')])
    await compress()
    expect(view.text()).toContain('已完成: 1')
    await addFiles([image('second.jpg')])
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    await flushPromises()
    expect(mocks.compress).toHaveBeenCalledTimes(2)
    expect(mocks.addToZip.mock.calls.map((call) => call[0])).toEqual(['uied_first.jpg', 'uied_second.jpg'])
    expect(view.text()).toContain('已完成: 2')
  })

  it('同名图片的独立下载及 ZIP 条目均有唯一名称', async () => {
    const view = mountCompressor()
    await addFiles([image('same.jpg'), image('same.jpg')])
    await compress()
    expect(view.findAll('a[download]').map((link) => link.attributes('download'))).toEqual(['uied_same.jpg', 'uied_same (2).jpg'])
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    await flushPromises()
    expect(mocks.addToZip.mock.calls.map((call) => call[0])).toEqual(['uied_same.jpg', 'uied_same (2).jpg'])
  })

  it('打包期间锁定上传、移除和重新压缩，避免结果被清空或重复下载', async () => {
    const view = mountCompressor()
    await addFiles([image('one.jpg')])
    await compress()
    let finishZip!: (blob: Blob) => void
    mocks.generateZip.mockReturnValue(new Promise<Blob>((resolve) => { finishZip = resolve }))
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    expect(view.get('button[aria-label="移除 one.jpg"]').attributes('disabled')).toBeDefined()
    await addFiles([image('blocked.jpg')])
    expect(view.findAll('[data-smoke="image-compress-file"]')).toHaveLength(1)
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    expect(mocks.generateZip).toHaveBeenCalledTimes(1)
    finishZip(new Blob(['zip']))
    await flushPromises()
    expect(view.get('button[aria-label="移除 one.jpg"]').attributes('disabled')).toBeUndefined()
  })

  it('损坏图片显示持久错误，不阻止后续文件压缩；移除后剩余结果可下载', async () => {
    const view = mountCompressor()
    mocks.compress.mockImplementationOnce((_file, options) => options.error(new Error('Cannot decode image')))
    await addFiles([image('broken.jpg'), image('good.jpg')])
    await compress()
    expect(view.get('[role="alert"]').text()).toContain('图片可能已损坏')
    expect(view.text()).toContain('已完成: 1')
    await view.get('button[aria-label="移除 broken.jpg"]').trigger('click')
    expect(view.findAll('[role="alert"]')).toHaveLength(0)
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    await flushPromises()
    expect(mocks.addToZip.mock.calls.map((call) => call[0])).toEqual(['uied_good.jpg'])
  })

  it('重新压缩失败时撤下旧结果，不能继续下载上一次的文件', async () => {
    const view = mountCompressor()
    await addFiles([image('retry.jpg')])
    await compress()
    expect(view.findAll('a[download]')).toHaveLength(1)
    mocks.compress.mockImplementationOnce((_file, options) => options.error(new Error('Decode failed on retry')))
    await compress()
    expect(view.findAll('a[download]')).toHaveLength(0)
    expect(view.get('[role="alert"]').text()).toContain('压缩失败')
    expect(view.text()).not.toContain('已完成: 1')
  })

  it('生成 ZIP 失败后明确报错并解除锁定，允许重试下载', async () => {
    const view = mountCompressor()
    await addFiles([image('retry.zip.jpg')])
    await compress()
    mocks.generateZip.mockRejectedValueOnce(new Error('ZIP failed'))
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    await flushPromises()
    expect(mocks.message.error).toHaveBeenCalledWith('打包下载失败，请重试')
    expect(mocks.download).not.toHaveBeenCalled()
    expect(view.get('button[aria-label="移除 retry.zip.jpg"]').attributes('disabled')).toBeUndefined()
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    await flushPromises()
    expect(mocks.download).toHaveBeenCalledOnce()
  })

  it('缺少 MIME 但后缀有效的图片传给编码器前会补齐格式', async () => {
    mountCompressor()
    await addFiles([image('dragged.JPG', '')])
    await compress()
    expect(mocks.compress.mock.calls[0][0].type).toBe('image/jpeg')
  })

  it('成功、失败与待处理混合时仅汇总成功体积，打包会处理新增图片并排除失败项', async () => {
    const view = mountCompressor()
    mocks.compress.mockImplementation((_file, options) => options.success(new Blob(['small'], { type: 'image/jpeg' })))
    mocks.compress
      .mockImplementationOnce((_file, options) => options.success(new Blob(['small'], { type: 'image/jpeg' })))
      .mockImplementationOnce((_file, options) => options.error(new Error('Cannot decode image')))
    await addFiles([image('good.jpg'), image('broken.jpg')])
    await compress()
    await addFiles([image('pending.jpg')])

    const status = view.get('[role="status"]')
    expect(status.text()).toContain('已完成: 1')
    expect(status.text()).toContain('失败: 1')
    expect(status.text()).toContain('待处理: 1')
    const summary = view.get('[data-smoke="image-compress-summary"]')
    expect(summary.text()).toContain('共节省 17.00 B')
    expect(summary.text()).toContain('已完成图片 22.00 B → 5.00 B')
    expect(summary.text()).toContain('打包时会先处理剩余图片')

    mocks.compress.mockImplementationOnce((_file, options) => options.error(new Error('Still cannot decode image')))
    await view.get('[data-smoke="image-compress-download"]').trigger('click')
    await flushPromises()

    expect(mocks.compress).toHaveBeenCalledTimes(4)
    expect(mocks.addToZip.mock.calls.map((call) => call[0])).toEqual(['uied_good.jpg', 'uied_pending.jpg'])
    expect(view.get('[role="status"]').text()).toContain('已完成: 2')
    expect(view.get('[role="status"]').text()).toContain('失败: 1')
    expect(view.get('[role="status"]').text()).not.toContain('待处理:')
    expect(summary.text()).toContain('共节省 34.00 B')
    expect(summary.text()).toContain('已完成图片 44.00 B → 10.00 B')
    expect(mocks.download).toHaveBeenCalledOnce()
  })

  it('原生选择图片按钮打开选择器，打包期间禁用并在完成后恢复', async () => {
    const view = mountCompressor()
    const input = view.get('input[type="file"]')
    const clickInput = vi.spyOn(input.element as HTMLInputElement, 'click').mockImplementation(() => {})
    /** 上传前使用整块选择区，上传后使用工具栏添加入口；始终检查当前可交互按钮。 */
    const selectButton = () => view.find('button[aria-label="选择图片"]').exists()
      ? view.get('button[aria-label="选择图片"]')
      : view.findAll('button').find((button) => button.text() === '添加图片')!
    await selectButton().trigger('click')
    expect(clickInput).toHaveBeenCalledOnce()

    await addFiles([image('one.jpg')])
    await compress()
    let finishZip!: (blob: Blob) => void
    mocks.generateZip.mockReturnValueOnce(new Promise<Blob>((resolve) => { finishZip = resolve }))
    await view.get('[data-smoke="image-compress-download"]').trigger('click')
    expect(selectButton().attributes('disabled')).toBeDefined()
    expect(input.attributes('disabled')).toBeDefined()
    expect(view.findAll('a[download]')).toHaveLength(0)
    await selectButton().trigger('click')
    expect(clickInput).toHaveBeenCalledOnce()

    finishZip(new Blob(['zip']))
    await flushPromises()
    expect(selectButton().attributes('disabled')).toBeUndefined()
    expect(input.attributes('disabled')).toBeUndefined()
    expect(view.findAll('a[download]')).toHaveLength(1)
    await selectButton().trigger('click')
    expect(clickInput).toHaveBeenCalledTimes(2)
    clickInput.mockRestore()
  })

  it('批量进度按实际结束的成功和失败文件计数，并显示当前文件', async () => {
    const view = mountCompressor()
    const jobs: { success: (blob: Blob) => void; error: (error: Error) => void }[] = []
    mocks.compress.mockImplementation((_file, options) => { jobs.push(options) })
    await addFiles([image('first.jpg'), image('broken.jpg'), image('last.jpg')])
    await view.get('[data-smoke="image-compress-start"]').trigger('click')

    /** 读取原生进度属性，验证当前批次真实完成数。 */
    const progress = () => view.get('progress[aria-label="批量压缩进度"]').element as HTMLProgressElement
    expect(progress().max).toBe(3)
    expect(progress().value).toBe(0)
    expect(view.get('[data-smoke="image-compress-progress"]').text()).toContain('正在处理：first.jpg')

    jobs[0].success(new Blob(['small'], { type: 'image/jpeg' }))
    await flushPromises()
    expect(progress().value).toBe(1)
    expect(view.get('[data-smoke="image-compress-progress"]').text()).toContain('正在处理：broken.jpg')

    jobs[1].error(new Error('Cannot decode image'))
    await flushPromises()
    expect(progress().value).toBe(2)
    expect(view.get('[data-smoke="image-compress-progress"]').text()).toContain('正在处理：last.jpg')
    expect(view.get('input[type="file"]').attributes('disabled')).toBeDefined()

    jobs[2].success(new Blob(['small'], { type: 'image/jpeg' }))
    await flushPromises()
    expect(view.find('[data-smoke="image-compress-progress"]').exists()).toBe(false)
    expect(view.text()).toContain('已完成: 2')
    expect(view.text()).toContain('失败: 1')
    expect(view.get('input[type="file"]').attributes('disabled')).toBeUndefined()
  })

  it('仅重新压缩失败图片，成功图片及其下载地址保持不变', async () => {
    const view = mountCompressor()
    mocks.compress.mockImplementationOnce((_file, options) => options.success(new Blob(['small'], { type: 'image/jpeg' })))
    mocks.compress.mockImplementationOnce((_file, options) => options.error(new Error('Temporary decode failure')))
    await addFiles([image('good.jpg'), image('retry.jpg')])
    await compress()
    const successUrl = view.get('a[download="uied_good.jpg"]').attributes('href')
    expect(mocks.compress).toHaveBeenCalledTimes(2)

    let finishRetry!: (blob: Blob) => void
    mocks.compress.mockImplementationOnce((_file, options) => { finishRetry = options.success })
    const retry = view.get('[data-smoke="image-compress-retry"]')
    expect(retry.text()).toContain('压缩')
    await retry.trigger('click')
    expect(view.find('[data-smoke="image-compress-retry"]').exists()).toBe(false)
    expect(view.get('[data-smoke="image-compress-start"]').attributes('disabled')).toBeDefined()
    expect(view.get('input[type="file"]').attributes('disabled')).toBeDefined()
    expect((view.get('progress[aria-label="批量压缩进度"]').element as HTMLProgressElement).max).toBe(1)
    expect(mocks.compress).toHaveBeenCalledTimes(3)

    finishRetry(new Blob(['retry success'], { type: 'image/jpeg' }))
    await flushPromises()
    expect(view.findAll('[role="alert"]')).toHaveLength(0)
    expect(view.find('[data-smoke="image-compress-retry"]').exists()).toBe(false)
    expect(view.get('a[download="uied_good.jpg"]').attributes('href')).toBe(successUrl)
    expect(view.findAll('a[download]')).toHaveLength(2)
    expect(view.text()).toContain('已完成: 2')
    expect(mocks.compress).toHaveBeenCalledTimes(3)
  })

  it('ZIP 进度跟随编码回调，失败后解除锁定并在重试时归零', async () => {
    const view = mountCompressor()
    await addFiles([image('one.jpg')])
    await compress()
    let updateProgress!: (metadata: { percent: number }) => void
    let failZip!: (error: Error) => void
    mocks.generateZip.mockImplementationOnce((_options, onUpdate) => {
      updateProgress = onUpdate
      return new Promise<Blob>((_resolve, reject) => { failZip = reject })
    })
    await view.get('[data-smoke="image-compress-download"]').trigger('click')
    /** 读取原生打包百分比，验证编码回调和重新打包的状态。 */
    const progress = () => view.get('progress[aria-label="打包进度"]').element as HTMLProgressElement
    expect(progress().max).toBe(100)
    expect(progress().value).toBe(0)
    updateProgress({ percent: 63.5 })
    await flushPromises()
    expect(progress().value).toBe(63.5)
    expect(view.get('button[aria-label="移除 one.jpg"]').attributes('disabled')).toBeDefined()
    expect(view.get('input[type="file"]').attributes('disabled')).toBeDefined()
    expect(view.findAll('a[download]')).toHaveLength(0)

    failZip(new Error('ZIP encoding failed'))
    await flushPromises()
    expect(view.find('progress').exists()).toBe(false)
    expect(view.get('button[aria-label="移除 one.jpg"]').attributes('disabled')).toBeUndefined()
    expect(mocks.download).not.toHaveBeenCalled()
    expect(mocks.message.error).toHaveBeenCalledWith('打包下载失败，请重试')

    let finishZip!: (blob: Blob) => void
    mocks.generateZip.mockReturnValueOnce(new Promise<Blob>((resolve) => { finishZip = resolve }))
    await view.get('[data-smoke="image-compress-download"]').trigger('click')
    expect(progress().value).toBe(0)
    expect(view.get('input[type="file"]').attributes('disabled')).toBeDefined()
    finishZip(new Blob(['zip']))
    await flushPromises()
    expect(view.find('progress').exists()).toBe(false)
    expect(view.get('input[type="file"]').attributes('disabled')).toBeUndefined()
    expect(mocks.download).toHaveBeenCalledOnce()
  })

  it('一次多选仍遵守 30 张批量上限，超过 25MB 的单张图片不入队', async () => {
    const view = mountCompressor()
    expect(view.get('input[type="file"]').attributes('multiple')).toBeDefined()
    const oversized = image('oversized.jpg')
    Object.defineProperty(oversized, 'size', { value: 25 * 1024 * 1024 + 1 })
    await addFiles([oversized])
    expect(view.findAll('[data-smoke="image-compress-file"]')).toHaveLength(0)
    expect(mocks.message.warning).toHaveBeenCalledWith('文件 oversized.jpg 超过25MB，请选择更小的文件')

    await addFiles(Array.from({ length: 31 }, (_, index) => image(`photo-${index + 1}.jpg`)))
    expect(view.findAll('[data-smoke="image-compress-file"]')).toHaveLength(30)
    expect(view.text()).toContain('已选择 30 / 30 张图片')
    expect(mocks.message.warning).toHaveBeenCalledWith('最多只能上传30个文件')
    expect(view.text()).not.toContain('photo-31.jpg')
  })

  it('PNG 默认无损，滑块的 JPEG 质量不会改变 PNG 模式', async () => {
    const view = mountCompressor()
    await addFiles([image('transparent.png', 'image/png')])
    expect((view.get('input[value="lossless"]').element as HTMLInputElement).checked).toBe(true)
    await compress()
    expect(mocks.compressPng).toHaveBeenCalledWith(expect.any(File), expect.objectContaining({ mode: 'lossless', colors: 256 }))
    expect(mocks.compress).not.toHaveBeenCalled()
    expect(view.text()).toContain('已完成: 1')
  })

  it('PNG 减色需主动选择，颜色设置传入独立编码任务', async () => {
    const view = mountCompressor()
    await addFiles([image('poster.png', 'image/png')])
    await view.get('input[value="quantized"]').setValue(true)
    await view.get('select[aria-label="PNG 颜色上限"]').setValue('64')
    expect(view.text()).toContain('可能改变颜色及半透明细节')
    await compress()
    expect(mocks.compressPng.mock.calls[0][1]).toEqual(expect.objectContaining({ mode: 'quantized', colors: 64 }))
  })

  it('默认保尺寸，可选 4096；同批编码参数使用快照并锁定设置', async () => {
    const view = mountCompressor()
    await addFiles([image('large.jpg')])
    expect((view.get('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(true)
    await compress()
    expect(mocks.compress.mock.calls[0][1].maxWidth).toBeUndefined()
    expect(mocks.compress.mock.calls[0][1].maxHeight).toBeUndefined()
    await view.get('input[type="checkbox"]').setValue(false)

    const jobs: { success: (blob: Blob) => void }[] = []
    mocks.compress.mockImplementation((_file, options) => { jobs.push(options) })
    await addFiles([image('next.jpg')])
    await view.get('[data-smoke="image-compress-start"]').trigger('click')
    expect(view.get('input[type="checkbox"]').attributes('disabled')).toBeDefined()
    expect(view.get('fieldset').attributes('disabled')).toBeDefined()
    expect(mocks.compress.mock.calls[1][1]).toEqual(expect.objectContaining({ maxWidth: 4096, maxHeight: 4096 }))
    jobs[0].success(new Blob(['small'], { type: 'image/jpeg' }))
    await flushPromises()
    expect(mocks.compress.mock.calls[2][1]).toEqual(expect.objectContaining({ maxWidth: 4096, maxHeight: 4096 }))
    jobs[1].success(new Blob(['small'], { type: 'image/jpeg' }))
    await flushPromises()
    expect(view.get('input[type="checkbox"]').attributes('disabled')).toBeUndefined()
  })

  it('浏览器把 WebP 回退成 PNG 时明确失败，不生成扩展名错误的下载文件', async () => {
    const view = mountCompressor()
    mocks.compress.mockImplementationOnce((_file, options) => options.success(new Blob(['png'], { type: 'image/png' })))
    await addFiles([image('photo.webp', 'image/webp')])
    await compress()
    expect(view.findAll('a[download]')).toHaveLength(0)
    expect(view.get('[role="alert"]').text()).toMatch(/浏览器|格式|WebP/)
    expect(view.find('[data-smoke="image-compress-retry"]').exists()).toBe(true)
  })

  it('请求缩小尺寸时即使结果变大也保留编码结果，不悄悄回退大尺寸原图', async () => {
    const view = mountCompressor()
    await addFiles([image('large.jpg')])
    await view.get('input[type="checkbox"]').setValue(false)
    mocks.compress.mockImplementationOnce((_file, options) => options.success(new Blob(['x'.repeat(50)], { type: 'image/jpeg' })))
    await compress()
    expect(view.text()).toContain('50.00 B')
    expect(view.text()).toContain('已按设置重新编码')
    expect(view.text()).not.toContain('原图已较小，保留原图')
  })

  it('离开页面取消正在执行的 PNG 编码，不再写回结果或启动下一张', async () => {
    const view = mountCompressor()
    let finish!: (blob: Blob) => void
    mocks.compressPng.mockReturnValueOnce(new Promise<Blob>((resolve) => { finish = resolve }))
    await addFiles([image('first.png', 'image/png'), image('second.png', 'image/png')])
    await view.get('[data-smoke="image-compress-start"]').trigger('click')
    const signal = mocks.compressPng.mock.calls[0][1].signal as AbortSignal
    expect(signal.aborted).toBe(false)
    view.unmount()
    wrapper = undefined
    expect(signal.aborted).toBe(true)
    finish(new Blob(['png'], { type: 'image/png' }))
    await flushPromises()
    expect(mocks.compressPng).toHaveBeenCalledTimes(1)
    expect(mocks.message.success).not.toHaveBeenCalled()
  })

  it('选择图片后才出现参数与前后预览，切换后移除当前图片会回到有效结果', async () => {
    const view = mountCompressor()
    expect(view.find('.image-editor').exists()).toBe(false)
    await addFiles([image('first.jpg'), image('second.jpg')])
    await compress()
    expect(view.get('.image-preview__heading').text()).toContain('first.jpg')
    await view.get('button[aria-label="预览 second.jpg"]').trigger('click')
    expect(view.get('.image-preview__heading').text()).toContain('second.jpg')
    expect(view.get('button[aria-label="预览 second.jpg"]').attributes('aria-pressed')).toBe('true')
    expect(view.findAll('a[download]')).toHaveLength(2)
    await view.get('button[aria-label="移除 second.jpg"]').trigger('click')
    expect(view.get('.image-preview__heading').text()).toContain('first.jpg')
    expect(view.findAll('a[download]')).toHaveLength(1)
    await view.findAll('button').find(button => button.text() === '清空文件列表')!.trigger('click')
    expect(view.find('.image-editor').exists()).toBe(false)
    expect(view.find('button[aria-label="选择图片"]').exists()).toBe(true)
  })
})
