/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type Compressor from 'compressorjs'
import { BrowserImageCompressionError, compressBrowserImage } from './browserImageCompression'

const mocks = vi.hoisted(() => ({ construct: vi.fn(), abort: vi.fn() }))
vi.mock('compressorjs', () => ({
  default: class {
    constructor(file: Blob, options: Compressor.Options) { mocks.construct(file, options) }
    abort() { mocks.abort() }
  }
}))

/** 创建能辨别原图回退的测试文件，底层浏览器编码由可控回调替身模拟。 */
const image = (type = 'image/jpeg') => new File(['original image'], 'sample.jpg', { type })

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  mocks.construct.mockImplementation((_file: Blob, options: Compressor.Options) => {
    options.success?.(new Blob(['compressed'], { type: options.mimeType }))
  })
})
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

/** 构造符合 WebP 扩展头布局的文件，动画标记位置来自容器规范。 */
function webpImage(animated = true): File {
  const bytes = new Uint8Array(30)
  bytes.set(new TextEncoder().encode('RIFF'), 0)
  new DataView(bytes.buffer).setUint32(4, 22, true)
  bytes.set(new TextEncoder().encode('WEBPVP8X'), 8)
  new DataView(bytes.buffer).setUint32(16, 10, true)
  bytes[20] = animated ? 2 : 16
  return new File([bytes], 'animation.webp', { type: 'image/webp' })
}

/** 手动控制头部读取，覆盖文件读完之前取消和超时的情况。 */
function mockHeaderReader() {
  const readers: any[] = []
  vi.stubGlobal('FileReader', class {
    result: ArrayBuffer | null = null
    readyState = 1
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    onabort: (() => void) | null = null
    abort = vi.fn()
    readAsArrayBuffer = vi.fn()
    /** 记录读取器，供测试显式控制读取完成顺序。 */
    constructor() { readers.push(this) }
  })
  return readers
}

/** 创建扩展头中的能力标记，避免依赖图片解码器。 */
function webpHeader(flags: number): ArrayBuffer {
  const bytes = new Uint8Array(30)
  bytes.set(new TextEncoder().encode('RIFF'), 0)
  bytes.set(new TextEncoder().encode('WEBPVP8X'), 8)
  new DataView(bytes.buffer).setUint32(16, 10, true)
  bytes[20] = flags
  return bytes.buffer
}

describe('浏览器 JPEG/WebP 压缩', () => {
  it('动态 WebP 在编码前明确拒绝，不能静默变成静态单帧', async () => {
    const readers = mockHeaderReader()
    const pending = compressBrowserImage(webpImage(), 'image/webp', { quality: 80, preserveDimensions: true })
    const assertion = expect(pending).rejects.toMatchObject({ code: 'animated', message: expect.stringContaining('动画帧') })
    expect(mocks.construct).not.toHaveBeenCalled()
    readers[0].result = webpHeader(2)
    readers[0].onload()
    await assertion
    expect(mocks.construct).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('静态透明 WebP 只读取固定长度头部，再按原配置编码', async () => {
    const readers = mockHeaderReader()
    const pending = compressBrowserImage(webpImage(false), 'image/webp', { quality: 70, preserveDimensions: true })
    expect(readers[0].readAsArrayBuffer.mock.calls[0][0].size).toBe(30)
    readers[0].result = webpHeader(16)
    readers[0].onload()
    expect((await pending).type).toBe('image/webp')
    expect(mocks.construct.mock.calls[0][1].quality).toBe(0.7)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('头部读取期间取消立即释放读取器，迟到读取不会开始编码', async () => {
    const readers = mockHeaderReader()
    const controller = new AbortController()
    const pending = compressBrowserImage(webpImage(), 'image/webp', { quality: 80, preserveDimensions: true, signal: controller.signal })
    const assertion = expect(pending).rejects.toMatchObject({ code: 'aborted' })
    const oldLoad = readers[0].onload
    controller.abort()
    await assertion
    expect(readers[0].abort).toHaveBeenCalledOnce()
    readers[0].result = webpHeader(16)
    oldLoad()
    expect(mocks.construct).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('WebP 头部读取同样受总任务超时限制，超时后释放读取器且不开始编码', async () => {
    const readers = mockHeaderReader()
    const pending = compressBrowserImage(webpImage(), 'image/webp', { quality: 80, preserveDimensions: true })
    const assertion = expect(pending).rejects.toMatchObject({ code: 'timeout' })
    await vi.advanceTimersByTimeAsync(90_000)
    await assertion
    expect(readers[0].abort).toHaveBeenCalledOnce()
    expect(mocks.construct).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('默认保持原图尺寸，质量转换为 0–1，并避免引入隐式 4096 限制', async () => {
    const result = await compressBrowserImage(image(), 'image/jpeg', { quality: 80, preserveDimensions: true })
    const options = mocks.construct.mock.calls[0][1]
    expect(result.type).toBe('image/jpeg')
    expect(options).toMatchObject({ quality: 0.8, strict: true, mimeType: 'image/jpeg', convertSize: Infinity })
    expect(options).not.toHaveProperty('maxWidth')
    expect(options).not.toHaveProperty('maxHeight')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('仅显式关闭保持原尺寸时，将最长边设为 4096，且并发任务配置互不影响', async () => {
    await Promise.all([
      compressBrowserImage(image(), 'image/jpeg', { quality: 20, preserveDimensions: false }),
      compressBrowserImage(image('image/webp'), 'image/webp', { quality: 95, preserveDimensions: true })
    ])
    expect(mocks.construct.mock.calls[0][1]).toMatchObject({ maxWidth: 4096, maxHeight: 4096, quality: 0.2 })
    expect(mocks.construct.mock.calls[1][1]).toMatchObject({ quality: 0.95, mimeType: 'image/webp' })
    expect(mocks.construct.mock.calls[1][1]).not.toHaveProperty('maxWidth')
  })

  it('拒绝浏览器将不支持的 WebP 编码悄悄回退成 PNG', async () => {
    mocks.construct.mockImplementation((_file, options) => options.success(new Blob(['png'], { type: 'image/png' })))
    await expect(compressBrowserImage(image('image/webp'), 'image/webp', { quality: 80, preserveDimensions: true }))
      .rejects.toMatchObject({ code: 'unsupported', message: '当前浏览器不支持导出 WebP，请更换浏览器后重试' })
    expect(vi.getTimerCount()).toBe(0)
  })

  it('拒绝空文件结果，不能显示压缩成功', async () => {
    mocks.construct.mockImplementation((_file, options) => options.success(new Blob([], { type: 'image/jpeg' })))
    await expect(compressBrowserImage(image(), 'image/jpeg', { quality: 80, preserveDimensions: true }))
      .rejects.toMatchObject({ code: 'decode', message: expect.stringContaining('未生成有效图片') })
  })

  it('保留库返回的原 File 身份，不把正常原图回退误判为重新编码', async () => {
    const file = image()
    mocks.construct.mockImplementation((source, options) => options.success(source))
    expect(await compressBrowserImage(file, 'image/jpeg', { quality: 80, preserveDimensions: false })).toBe(file)
  })

  it('为没有 MIME 的原图补齐格式，原图回退仍有正确类型与内容大小', async () => {
    const file = image('')
    mocks.construct.mockImplementation((source, options) => options.success(source))
    const result = await compressBrowserImage(file, 'image/jpeg', { quality: 80, preserveDimensions: true })
    expect(result.type).toBe('image/jpeg')
    expect(result.size).toBe(file.size)
  })

  it('超时会中止实例并移除取消监听，晚到回调不能改变失败结果', async () => {
    const controller = new AbortController()
    const remove = vi.spyOn(controller.signal, 'removeEventListener')
    mocks.construct.mockImplementation(() => {})
    const pending = compressBrowserImage(image(), 'image/jpeg', { quality: 80, preserveDimensions: true, signal: controller.signal })
    const outcome = expect(pending).rejects.toMatchObject({ code: 'timeout', message: expect.stringContaining('超时') })
    await vi.advanceTimersByTimeAsync(90_000)
    await outcome
    expect(mocks.abort).toHaveBeenCalledTimes(1)
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function))
    mocks.construct.mock.calls[0][1].success(new Blob(['late'], { type: 'image/jpeg' }))
    controller.abort()
    expect(mocks.abort).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('卸载时取消正在进行的任务，abort 触发的底层 error 不会覆盖取消状态', async () => {
    const controller = new AbortController()
    mocks.construct.mockImplementation(() => {})
    mocks.abort.mockImplementation(() => mocks.construct.mock.calls[0][1].error(new Error('internal stack')))
    const pending = compressBrowserImage(image(), 'image/jpeg', { quality: 80, preserveDimensions: true, signal: controller.signal })
    const outcome = expect(pending).rejects.toMatchObject({ code: 'aborted', message: '图片压缩已取消' })
    controller.abort()
    await outcome
    expect(mocks.abort).toHaveBeenCalledTimes(1)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('传入已取消的信号时不创建底层编码实例', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(compressBrowserImage(image(), 'image/jpeg', { quality: 80, preserveDimensions: true, signal: controller.signal }))
      .rejects.toBeInstanceOf(BrowserImageCompressionError)
    expect(mocks.construct).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('兼容构造函数期间同步取消，在获得实例后执行延后的 abort', async () => {
    const controller = new AbortController()
    mocks.construct.mockImplementation(() => controller.abort())
    await expect(compressBrowserImage(image(), 'image/jpeg', { quality: 80, preserveDimensions: true, signal: controller.signal }))
      .rejects.toMatchObject({ code: 'aborted' })
    expect(mocks.abort).toHaveBeenCalledTimes(1)
  })

  it('同步构造失败和解码失败只返回中文提示，不泄露底层错误内容', async () => {
    mocks.construct.mockImplementationOnce(() => { throw new Error('SECRET native stack') })
    await expect(compressBrowserImage(image(), 'image/jpeg', { quality: 80, preserveDimensions: true }))
      .rejects.toMatchObject({ code: 'decode', message: expect.not.stringContaining('SECRET') })
    mocks.construct.mockImplementationOnce((_file, options) => options.error(new Error('SECRET native stack')))
    await expect(compressBrowserImage(image(), 'image/jpeg', { quality: 80, preserveDimensions: true }))
      .rejects.toMatchObject({ code: 'decode', message: expect.stringContaining('图片可能已损坏') })
    expect(vi.getTimerCount()).toBe(0)
  })

  it('拒绝非有限质量，有限越界值收敛到有效范围', async () => {
    await expect(compressBrowserImage(image(), 'image/jpeg', { quality: NaN, preserveDimensions: true }))
      .rejects.toMatchObject({ code: 'invalid-options' })
    await compressBrowserImage(image(), 'image/jpeg', { quality: 150, preserveDimensions: true })
    expect(mocks.construct.mock.calls[0][1].quality).toBe(1)
    await compressBrowserImage(image(), 'image/jpeg', { quality: -20, preserveDimensions: true })
    expect(mocks.construct.mock.calls[1][1].quality).toBe(0)
  })
})
