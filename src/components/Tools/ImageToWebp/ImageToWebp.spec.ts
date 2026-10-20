/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-20
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import ImageToWebp from './ImageToWebp.vue'

const mocks = vi.hoisted(() => ({
  success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn(),
  zipFile: vi.fn(), zipGenerate: vi.fn()
}))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/image-to-webp' }) }))
vi.mock('element-plus', () => ({ ElMessage: mocks }))
vi.mock('jszip', () => ({ default: class {
  /** 模拟压缩包目录，记录真实交付给 ZIP 的文件名和二进制。 */
  folder() { return { file: mocks.zipFile } }
  /** 返回可下载压缩包，使测试不依赖真实压缩耗时。 */
  generateAsync(...args: unknown[]) { return mocks.zipGenerate(...args) }
} }))

interface TestImage {
  src: string
  width: number
  height: number
  onload: null | (() => void)
  onerror: null | (() => void)
}

let view: VueWrapper | undefined
let autoDecode = true
let autoEncode = true
let fallbackMime = ''
let decoders: TestImage[] = []
let encodings: Array<{ callback: BlobCallback; mime: string; quality?: number }> = []
let downloads: Array<{ name: string; url: string }> = []
let objectUrls = new Map<string, Blob>()
let urlNumber = 0
const drawImage = vi.fn()
const fillRect = vi.fn()

/** 生成带真实文件头的测试 Blob，让页面复用的 MIME 与签名校验保持运行。 */
function encodedBlob(mime: string): Blob {
  const bytes = mime === 'image/jpeg' ? [0xff, 0xd8, 0xff, 0xe0]
    : mime === 'image/webp' ? [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]
      : [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  const data = new Uint8Array(bytes)
  const blob = new Blob([data], { type: mime })
  const slice = blob.slice.bind(blob)
  // jsdom Blob 尚无 arrayBuffer，为真实切片补齐浏览器已经支持的读取能力。
  blob.slice = (start = 0, end = data.length) => {
    const part = slice(start, end)
    part.arrayBuffer = async () => data.slice(start, end).buffer
    return part
  }
  return blob
}

/** 挂载真实页面，仅替换推荐模块和外部运行环境。 */
function mountPage() {
  view = mount(ImageToWebp, { global: {
    mocks: { $ensureFreeToolTitle: (title: string) => title }, stubs: { ToolsRecommend: true }
  } })
}

/** 从用户文件输入提交测试图片，保留文件名用于下载断言。 */
async function uploadFiles(names: string[]) {
  const input = view!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value:
    names.map(name => new File(['source'], name, { type: 'image/png' }))
  })
  await input.trigger('change')
  await flushPromises()
}

/** 通过页面可见按钮名称定位操作，不依赖组件内部状态。 */
function buttons(label: string) { return view!.findAll('button').filter(button => button.text() === label) }

/** 点击主操作并等待解码、Blob 签名校验及界面更新。 */
async function clickButton(label: string) {
  await buttons(label)[0].trigger('click')
  await flushPromises()
  await flushPromises()
}

beforeEach(() => {
  vi.clearAllMocks()
  autoDecode = true
  autoEncode = true
  fallbackMime = ''
  decoders = []
  encodings = []
  downloads = []
  objectUrls = new Map()
  URL.createObjectURL = vi.fn((blob: Blob) => {
    const url = `blob:image-format-${++urlNumber}`
    objectUrls.set(url, blob)
    return url
  })
  URL.revokeObjectURL = vi.fn()
  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ blob: async () => objectUrls.get(url) })))
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
    downloads.push({ name: this.download, url: this.href })
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage, fillRect } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback, mime = 'image/png', quality) => {
    encodings.push({ callback, mime, quality })
    if (autoEncode) callback(encodedBlob(fallbackMime || mime))
  })
  mocks.zipGenerate.mockResolvedValue(new Blob(['zip'], { type: 'application/zip' }))
  vi.stubGlobal('Image', class {
    width = 100
    height = 100
    onload: null | (() => void) = null
    onerror: null | (() => void) = null
    private source = ''
    /** 收集图片实例，使测试可控制移除或清空后的迟到回调。 */
    constructor() { decoders.push(this) }
    /** 自动完成普通测试的解码，特殊时序测试可改为手工回调。 */
    set src(value: string) { this.source = value; if (value && autoDecode) queueMicrotask(() => this.onload?.()) }
    /** 返回当前源地址，便于验证资源取消。 */
    get src() { return this.source }
  })
})

afterEach(() => {
  view?.unmount()
  view = undefined
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('图片格式转换的结果与配置隔离', () => {
  it('PNG 转换后切换 JPG，单张下载仍交付 PNG 字节和 .png 名称并显示实际格式', async () => {
    mountPage()
    await uploadFiles(['photo.png'])
    await clickButton('PNG')
    await clickButton('开始转换')
    await clickButton('JPG')
    await clickButton('下载')
    expect(downloads[0].name).toBe('photo.png')
    expect(objectUrls.get(downloads[0].url)?.type).toBe('image/png')
    expect(view!.text()).toContain('实际格式：PNG')
  })

  it('批量打包读取已保存结果，切格式不改扩展名，同名文件不互相覆盖', async () => {
    mountPage()
    await uploadFiles(['photo.png', 'photo.webp'])
    await clickButton('PNG')
    await clickButton('开始转换')
    await clickButton('JPG')
    await clickButton('下载全部')
    expect(mocks.zipFile.mock.calls.map(call => call[0])).toEqual(['photo.png', 'photo (2).png'])
    expect(mocks.zipFile.mock.calls.map(call => call[1].type)).toEqual(['image/png', 'image/png'])
    expect(fetch).not.toHaveBeenCalled()
  })

  it('整批在开始时快照格式和质量，在途改为 WebP 不会改变任何一行的 JPG 编码', async () => {
    autoDecode = false
    mountPage()
    await uploadFiles(['one.png', 'two.png'])
    await clickButton('JPG')
    await view!.get('input[type="range"]').setValue('90')
    await clickButton('开始转换')
    await clickButton('WEBP')
    await view!.get('input[type="range"]').setValue('20')
    decoders[0].onload!()
    await flushPromises()
    await flushPromises()
    decoders[1].onload!()
    await flushPromises()
    await flushPromises()
    expect(encodings.map(item => [item.mime, item.quality])).toEqual([['image/jpeg', 0.9], ['image/jpeg', 0.9]])
    expect(fillRect).toHaveBeenCalledTimes(2)
    await clickButton('下载全部')
    expect(mocks.zipFile.mock.calls.map(call => call[0])).toEqual(['one.jpg', 'two.jpg'])
  })

  it('浏览器回退 PNG 时拒绝冒充 JPG，不产生下载结果或成功消息', async () => {
    fallbackMime = 'image/png'
    mountPage()
    await uploadFiles(['unsupported.png'])
    await clickButton('JPG')
    await clickButton('开始转换')
    expect(buttons('下载')).toHaveLength(0)
    expect(mocks.error).toHaveBeenCalledWith(expect.stringContaining('不支持导出 JPG'))
    expect(mocks.success).not.toHaveBeenCalled()
  })

  it('坏图明确报错且不记为成功，后续有效图片继续转换', async () => {
    autoDecode = false
    mountPage()
    await uploadFiles(['broken.png', 'valid.png'])
    await clickButton('PNG')
    await clickButton('开始转换')
    decoders[0].onerror!()
    await flushPromises()
    decoders[1].onload!()
    await flushPromises()
    await flushPromises()
    expect(mocks.error).toHaveBeenCalledWith(expect.stringContaining('broken.png'))
    expect(mocks.success).not.toHaveBeenCalled()
    expect(buttons('下载')).toHaveLength(1)
    await clickButton('下载')
    expect(downloads[0].name).toBe('valid.png')
  })

  it('移除正在解码的首行后迟到回调不会写入下一行，剩余图片仍能转换', async () => {
    autoDecode = false
    mountPage()
    await uploadFiles(['removed.png', 'remaining.png'])
    await clickButton('PNG')
    await clickButton('开始转换')
    const lateLoad = decoders[0].onload!
    await buttons('移除')[0].trigger('click')
    lateLoad()
    await flushPromises()
    expect(buttons('下载')).toHaveLength(0)
    decoders[1].onload!()
    await flushPromises()
    await flushPromises()
    await clickButton('下载')
    expect(downloads[0].name).toBe('remaining.png')
  })

  it('清空并上传新文件后，旧编码回调不能写回新行或结束新批次', async () => {
    autoEncode = false
    mountPage()
    await uploadFiles(['old.png'])
    await clickButton('PNG')
    await clickButton('开始转换')
    const oldPreview = decoders[0].src
    await clickButton('清除全部')
    await uploadFiles(['new.png'])
    await clickButton('JPG')
    await clickButton('开始转换')
    encodings[0].callback(encodedBlob('image/png'))
    await flushPromises()
    expect(buttons('下载')).toHaveLength(0)
    expect(buttons('转换中...')).toHaveLength(1)
    encodings[1].callback(encodedBlob('image/jpeg'))
    await flushPromises()
    await flushPromises()
    await clickButton('下载')
    expect(downloads[0].name).toBe('new.jpg')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(oldPreview)
  })

  it('新格式转换失败时保留旧结果，并继续按旧结果的 PNG 格式下载', async () => {
    mountPage()
    await uploadFiles(['kept.png'])
    await clickButton('PNG')
    await clickButton('开始转换')
    mocks.success.mockClear()
    fallbackMime = 'image/png'
    await clickButton('JPG')
    await clickButton('开始转换')
    await clickButton('下载')
    expect(downloads[0].name).toBe('kept.png')
    expect(objectUrls.get(downloads[0].url)?.type).toBe('image/png')
    expect(view!.text()).toContain('实际格式：PNG')
    expect(mocks.success).not.toHaveBeenCalled()
  })

  it('声明 JPEG 但文件头为 PNG 的结果也会被拒绝', async () => {
    autoEncode = false
    mountPage()
    await uploadFiles(['wrong-header.png'])
    await clickButton('JPG')
    await clickButton('开始转换')
    const invalid = encodedBlob('image/png')
    Object.defineProperty(invalid, 'type', { value: 'image/jpeg' })
    encodings[0].callback(invalid)
    await flushPromises()
    await flushPromises()
    expect(buttons('下载')).toHaveLength(0)
    expect(mocks.error).toHaveBeenCalledWith(expect.stringContaining('格式不符'))
  })

  it('PNG 保留透明度选项按批次快照，质量参数固定为无损编码值', async () => {
    autoDecode = false
    mountPage()
    await uploadFiles(['transparent.png'])
    await clickButton('PNG')
    await view!.get('#transparent').setValue(false)
    await clickButton('开始转换')
    await view!.get('#transparent').setValue(true)
    decoders[0].onload!()
    await flushPromises()
    await flushPromises()
    expect(fillRect).toHaveBeenCalledWith(0, 0, 100, 100)
    expect(encodings.map(item => [item.mime, item.quality])).toEqual([['image/png', 1]])
    expect(buttons('BMP')).toHaveLength(0)
    expect(view!.find('#lossless').exists()).toBe(false)
    expect(view!.find('#progressive').exists()).toBe(false)
  })

  it('卸载会取消待解码任务并释放源地址，迟到回调不编码也不通知成功', async () => {
    autoDecode = false
    mountPage()
    await uploadFiles(['unmounted.png'])
    await clickButton('开始转换')
    const source = decoders[0].src
    const lateLoad = decoders[0].onload!
    view!.unmount()
    view = undefined
    lateLoad()
    await flushPromises()
    expect(encodings).toHaveLength(0)
    expect(decoders[0].onload).toBeNull()
    expect(decoders[0].onerror).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(source)
    expect(mocks.success).not.toHaveBeenCalled()
  })

  it('超过 30 秒未返回的编码会报错并结束忙碌状态，迟到结果不能重新发布', async () => {
    vi.useFakeTimers()
    autoEncode = false
    mountPage()
    await uploadFiles(['timeout.png'])
    await clickButton('开始转换')
    await vi.advanceTimersByTimeAsync(30_000)
    await flushPromises()
    expect(mocks.error).toHaveBeenCalledWith(expect.stringContaining('处理超时'))
    expect(buttons('开始转换')[0].attributes('disabled')).toBeUndefined()
    encodings[0].callback(encodedBlob('image/webp'))
    await flushPromises()
    expect(buttons('下载')).toHaveLength(0)
    expect(mocks.success).not.toHaveBeenCalled()
  })
})
