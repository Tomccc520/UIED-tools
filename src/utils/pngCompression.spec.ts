/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import pako from 'pako'
import * as UPNG from 'upng-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  compressPngInWorker,
  PNG_COMPRESSION_MAX_PIXELS,
  PNG_COMPRESSION_TIMEOUT_MS,
  PngCompressionError,
} from './pngCompression'
import { encodePngBuffer, inspectPngBuffer } from './pngCompressionCore'

const codec = UPNG as unknown as {
  decode(buffer: ArrayBuffer): unknown
  toRGBA8(decoded: unknown): ArrayBuffer[]
}
const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

/** 使用独立 CRC 算法创建测试 PNG 块，不依赖被测解析器。 */
function chunk(type: string, data = new Uint8Array()): Uint8Array {
  const bytes = new Uint8Array(12 + data.length)
  const view = new DataView(bytes.buffer)
  view.setUint32(0, data.length)
  bytes.set(Array.from(type, character => character.charCodeAt(0)), 4)
  bytes.set(data, 8)
  let crc = 0xffffffff
  for (const byte of bytes.subarray(4, bytes.length - 4)) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1)
  }
  view.setUint32(bytes.length - 4, (crc ^ 0xffffffff) >>> 0)
  return bytes
}

/** 拼接测试二进制，并返回独立的完整缓冲区。 */
function concatenate(...parts: Uint8Array[]): ArrayBuffer {
  const result = new Uint8Array(parts.reduce((length, part) => length + part.length, 0))
  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }
  return result.buffer
}

/** 创建没有 Canvas 预乘处理的真实 RGBA PNG，包含透明与半透明颜色。 */
function createRgbaPng(width = 64, height = 48, metadata: Uint8Array[] = []): { buffer: ArrayBuffer; rgba: Uint8Array } {
  const rgba = new Uint8Array(width * height * 4)
  const scanlines = new Uint8Array(height * (width * 4 + 1))
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4
      rgba.set([(x * 31 + y * 7) % 256, (x * 3 + y * 17) % 256, (x * 11 + y * 5) % 256, (x + y) % 4 === 0 ? 0 : (x * 13 + y * 19) % 256], offset)
    }
    scanlines.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1)
  }
  const header = new Uint8Array(13)
  const headerView = new DataView(header.buffer)
  headerView.setUint32(0, width)
  headerView.setUint32(4, height)
  header[8] = 8
  header[9] = 6
  return { buffer: concatenate(signature, chunk('IHDR', header), ...metadata, chunk('IDAT', pako.deflate(scanlines, { level: 0 })), chunk('IEND')), rgba }
}

/** 创建高位深或低位灰度 PNG，检查编码器不能保真时是否保留原文件。 */
function createGrayPng(depth: 1 | 16): ArrayBuffer {
  const header = new Uint8Array(13)
  const view = new DataView(header.buffer)
  view.setUint32(0, 3)
  view.setUint32(4, 2)
  header[8] = depth
  const scanlines = depth === 16
    ? new Uint8Array([0, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0, 0xab, 0xcd, 0xef, 0x01, 0x23, 0x45])
    : new Uint8Array([0, 0xa0, 0, 0x40])
  return concatenate(signature, chunk('IHDR', header), chunk('IDAT', pako.deflate(scanlines)), chunk('IEND'))
}

/** 从 PNG 中取出某个块的完整字节，核对元数据未经修改。 */
function readChunk(buffer: ArrayBuffer, type: string): Uint8Array | undefined {
  const information = inspectPngBuffer(buffer)
  const found = information.chunks.find(item => item.type === type)
  return found ? new Uint8Array(buffer.slice(found.start, found.end)) : undefined
}

class FakeWorker {
  static instances: FakeWorker[] = []
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  onmessageerror: (() => void) | null = null
  postMessage = vi.fn()
  terminate = vi.fn()

  /** 记录独立 Worker 实例，供生命周期和发送参数断言使用。 */
  constructor(public url: URL, public options: WorkerOptions) {
    FakeWorker.instances.push(this)
  }
}

describe('PNG Worker 编码核心', () => {
  it('默认无损保留每个透明和半透明像素的 RGBA 与尺寸', () => {
    const { buffer, rgba } = createRgbaPng()
    const result = encodePngBuffer(buffer)
    expect(inspectPngBuffer(result)).toMatchObject({ width: 64, height: 48 })
    expect(new Uint8Array(codec.toRGBA8(codec.decode(result))[0])).toEqual(rgba)
    expect(result.byteLength).toBeLessThan(buffer.byteLength)
  })

  it.each([[1, 1], [2, 1], [3, 3], [7, 5]])('小图 %i×%i 输出完整 PNG，避免编码库调色板缓冲区截断', (width, height) => {
    const { buffer, rgba } = createRgbaPng(width, height)
    const result = encodePngBuffer(buffer)
    expect(inspectPngBuffer(result)).toMatchObject({ width, height })
    expect(new Uint8Array(codec.toRGBA8(codec.decode(result))[0])).toEqual(rgba)
    const reduced = encodePngBuffer(buffer, 'quantized', 32)
    expect(inspectPngBuffer(reduced)).toMatchObject({ width, height })
  })

  it.each([32, 64, 128, 256] as const)('只有显式选择减色时才限制到 %i 色', colors => {
    const { buffer, rgba } = createRgbaPng()
    const result = encodePngBuffer(buffer, 'quantized', colors)
    expect(inspectPngBuffer(result)).toMatchObject({ width: 64, height: 48, colorType: 3 })
    const palette = readChunk(result, 'PLTE')!
    expect((palette.length - 12) / 3).toBeLessThanOrEqual(colors)
    expect(new Uint8Array(codec.toRGBA8(codec.decode(result))[0])).not.toEqual(rgba)
  })

  it('保留原色彩、ICC 和分辨率块，且不自行添加 sRGB', () => {
    const gamma = new Uint8Array(4)
    new DataView(gamma.buffer).setUint32(0, 45455)
    const density = new Uint8Array(9)
    const densityView = new DataView(density.buffer)
    densityView.setUint32(0, 11811)
    densityView.setUint32(4, 11811)
    density[8] = 1
    const icc = new Uint8Array([73, 67, 67, 0, 0, ...pako.deflate(new Uint8Array(128))])
    const { buffer, rgba } = createRgbaPng(32, 32, [chunk('gAMA', gamma), chunk('iCCP', icc), chunk('pHYs', density)])
    const result = encodePngBuffer(buffer)
    for (const type of ['gAMA', 'iCCP', 'pHYs']) expect(readChunk(result, type)).toEqual(readChunk(buffer, type))
    expect(readChunk(result, 'sRGB')).toBeUndefined()
    expect(new Uint8Array(codec.toRGBA8(codec.decode(result))[0])).toEqual(rgba)
  })

  it('原图声明 sRGB 时保留其渲染意图', () => {
    const { buffer } = createRgbaPng(32, 32, [chunk('sRGB', new Uint8Array([0]))])
    expect(readChunk(encodePngBuffer(buffer), 'sRGB')).toEqual(readChunk(buffer, 'sRGB'))
  })

  it.each([1, 16] as const)('%i 位灰度无损模式直接保留原二进制，避免位深与行填充损失', depth => {
    const buffer = createGrayPng(depth)
    expect(encodePngBuffer(buffer)).toBe(buffer)
    expect(() => encodePngBuffer(buffer, 'quantized', 256)).toThrowError('请选择无损压缩')
  })

  it('像素超限时在解码分配前失败', () => {
    const { buffer } = createRgbaPng(1, 1)
    const bytes = new Uint8Array(buffer)
    const header = bytes.slice(16, 29)
    const headerView = new DataView(header.buffer)
    headerView.setUint32(0, 5000)
    headerView.setUint32(4, Math.floor(PNG_COMPRESSION_MAX_PIXELS / 5000) + 1)
    const oversized = concatenate(signature, chunk('IHDR', header), bytes.subarray(33))
    expect(() => encodePngBuffer(oversized)).toThrowError('PNG 像素超过')
  })

  it('拒绝 APNG，避免导出时静默丢弃动画帧', () => {
    const { buffer } = createRgbaPng(2, 2)
    const bytes = new Uint8Array(buffer)
    const animated = concatenate(bytes.subarray(0, 33), chunk('acTL', new Uint8Array([0, 0, 0, 2, 0, 0, 0, 0])), bytes.subarray(33))
    expect(() => encodePngBuffer(animated)).toThrowError('暂不支持压缩动态 PNG')
  })

  it('损坏签名、块边界或 CRC 时返回固定提示', () => {
    const { buffer } = createRgbaPng(2, 2)
    const damaged = buffer.slice(0)
    new Uint8Array(damaged)[damaged.byteLength - 1] ^= 1
    for (const input of [new ArrayBuffer(10), buffer.slice(0, -2), damaged]) {
      expect(() => encodePngBuffer(input)).toThrowError('PNG 文件无法读取')
    }
  })
})

describe('PNG Worker 生命周期', () => {
  beforeEach(() => {
    FakeWorker.instances = []
    vi.stubGlobal('Worker', FakeWorker)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('使用模块 Worker，默认请求无损，成功后释放线程和定时器', async () => {
    const file = new File(['source'], 'source.png', { type: 'image/png' })
    const pending = compressPngInWorker(file)
    const worker = FakeWorker.instances[0]
    expect(worker.options).toEqual({ type: 'module' })
    expect(worker.url.pathname).toContain('pngCompression.worker.ts')
    expect(worker.postMessage).toHaveBeenCalledWith({ file, mode: 'lossless', colors: 256 })
    const buffer = createRgbaPng(2, 2).buffer
    worker.onmessage!({ data: { ok: true, buffer } } as MessageEvent)
    const blob = await pending
    expect(blob.type).toBe('image/png')
    expect(blob.size).toBe(buffer.byteLength)
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(worker.onmessage).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('显式减色参数不与 JPEG/WebP 质量混用', async () => {
    const file = new File(['source'], 'source.png')
    const pending = compressPngInWorker(file, { mode: 'quantized', colors: 64 })
    const assertion = expect(pending).rejects.toMatchObject({ code: 'invalid' })
    const worker = FakeWorker.instances[0]
    expect(worker.postMessage).toHaveBeenCalledWith({ file, mode: 'quantized', colors: 64 })
    worker.onmessage!({ data: { ok: false, code: 'invalid' } } as MessageEvent)
    await assertion
  })

  it('90 秒超时后结束 Promise 并回收 Worker', async () => {
    const pending = compressPngInWorker(new File(['source'], 'source.png'))
    const assertion = expect(pending).rejects.toMatchObject({ code: 'timeout' })
    await vi.advanceTimersByTimeAsync(PNG_COMPRESSION_TIMEOUT_MS - 1)
    expect(FakeWorker.instances[0].terminate).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await assertion
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('处理中取消会结束任务、清理监听且不等待编码完成', async () => {
    const controller = new AbortController()
    const removeListener = vi.spyOn(controller.signal, 'removeEventListener')
    const pending = compressPngInWorker(new File(['source'], 'source.png'), { mode: 'lossless', colors: 256, signal: controller.signal })
    const assertion = expect(pending).rejects.toMatchObject({ code: 'cancelled' })
    controller.abort()
    await assertion
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce()
    expect(removeListener).toHaveBeenCalledWith('abort', expect.any(Function))
    expect(vi.getTimerCount()).toBe(0)
  })

  it('已取消的请求不会创建 Worker', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(compressPngInWorker(new File([], 'source.png'), { mode: 'lossless', colors: 256, signal: controller.signal })).rejects.toMatchObject({ code: 'cancelled' })
    expect(FakeWorker.instances).toHaveLength(0)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('不支持 Worker 时明确提示，不回退到主线程同步编码', async () => {
    vi.stubGlobal('Worker', undefined)
    await expect(compressPngInWorker(new File([], 'source.png'))).rejects.toMatchObject({ code: 'unsupported' })
    expect(FakeWorker.instances).toHaveLength(0)
  })

  it.each(['error', 'messageerror'] as const)('Worker %s 只返回安全提示并释放资源', async eventType => {
    const pending = compressPngInWorker(new File([], 'source.png'))
    const assertion = expect(pending).rejects.toMatchObject({ code: 'worker', message: 'PNG 后台压缩失败，请重试或更换浏览器' })
    const worker = FakeWorker.instances[0]
    if (eventType === 'error') {
      const preventDefault = vi.fn()
      worker.onerror!({ message: 'secret stack', preventDefault } as unknown as ErrorEvent)
      expect(preventDefault).toHaveBeenCalledOnce()
    } else worker.onmessageerror!()
    await assertion
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('Worker 无法创建或消息格式错误时不会无限等待', async () => {
    vi.stubGlobal('Worker', class { constructor() { throw new Error('CSP secret details') } })
    await expect(compressPngInWorker(new File([], 'source.png'))).rejects.toMatchObject({ code: 'worker' })
    expect(vi.getTimerCount()).toBe(0)
    vi.stubGlobal('Worker', FakeWorker)
    const pending = compressPngInWorker(new File([], 'source.png'))
    const assertion = expect(pending).rejects.toBeInstanceOf(PngCompressionError)
    FakeWorker.instances[0].onmessage!({ data: { ok: false, code: 'secret stack' } } as MessageEvent)
    await assertion
    expect(vi.getTimerCount()).toBe(0)
  })
})
