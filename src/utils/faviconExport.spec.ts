// @vitest-environment node
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-20
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import JSZip from 'jszip'
import { createFaviconExport } from './faviconExport'

let draw: ReturnType<typeof vi.fn>
let failEncoding = false
const source = { width: 1024, height: 1024 } as HTMLCanvasElement

/** 以实际编码画布的宽高构造 PNG 签名与 IHDR 尺寸字段，供结果校验读取。 */
function pngFromCanvas(canvas: HTMLCanvasElement): Blob {
  const header = new Uint8Array(24)
  header.set([137, 80, 78, 71, 13, 10, 26, 10])
  const view = new DataView(header.buffer)
  view.setUint32(16, canvas.width)
  view.setUint32(20, canvas.height)
  return new Blob([header], { type: 'image/png' })
}

beforeEach(() => {
  draw = vi.fn()
  failEncoding = false
  vi.stubGlobal('document', { createElement: () => ({
    width: 0, height: 0,
    /** 模拟 Canvas 绘图上下文，仅记录目标尺寸，不模拟导出流程。 */
    getContext: () => ({ drawImage: draw }),
    /** 按画布实际宽高完成编码，或模拟浏览器编码失败。 */
    toBlob(this: HTMLCanvasElement, callback: BlobCallback) { callback(failEncoding ? null : pngFromCanvas(this)) }
  }) })
})
afterEach(() => vi.unstubAllGlobals())

describe('Favicon 多尺寸导出', () => {
  it('单尺寸 PNG 的绘制和实际尺寸都是 16，不导出源图 1024', async () => {
    const result = await createFaviconExport(source, 'png', [16])
    const data = new DataView(await result.blob.arrayBuffer())
    expect([data.getUint32(16), data.getUint32(20)]).toEqual([16, 16])
    expect(draw).toHaveBeenCalledWith(source, 0, 0, 16, 16)
    expect(result).toMatchObject({ filename: 'favicon-16x16.png', format: 'png', sizes: [16], isArchive: false })
  })

  it('多尺寸 PNG 去重排序，ZIP 内每张图有自己的尺寸', async () => {
    const result = await createFaviconExport(source, 'png', [32, 16, 32])
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer())
    expect(Object.keys(zip.files)).toEqual(['favicon-16x16.png', 'favicon-32x32.png'])
    for (const size of [16, 32]) {
      const bytes = await zip.file(`favicon-${size}x${size}.png`)!.async('arraybuffer')
      const data = new DataView(bytes)
      expect([data.getUint32(16), data.getUint32(20)]).toEqual([size, size])
    }
    expect(result).toMatchObject({ filename: 'favicons-png.zip', isArchive: true, sizes: [16, 32] })
  })

  it('ICO 保留各尺寸文件，256 的目录尺寸为 0 且内嵌 PNG 为 256', async () => {
    const result = await createFaviconExport(source, 'ico', [16, 256])
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer())
    for (const size of [16, 256]) {
      const data = new DataView(await zip.file(`favicon-${size}x${size}.ico`)!.async('arraybuffer'))
      expect(data.getUint16(2, true)).toBe(1)
      expect(data.getUint16(4, true)).toBe(1)
      expect([data.getUint8(6), data.getUint8(7)]).toEqual(size === 256 ? [0, 0] : [size, size])
      expect(data.getUint32(18, true)).toBe(22)
      expect([data.getUint32(22 + 16), data.getUint32(22 + 20)]).toEqual([size, size])
    }
  })

  it('生成开始时复制尺寸，后续更改原数组不影响本次结果', async () => {
    const sizes = [16, 32]
    const pending = createFaviconExport(source, 'png', sizes)
    sizes.splice(0, sizes.length, 256)
    const result = await pending
    expect(result.sizes).toEqual([16, 32])
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer())
    expect(Object.keys(zip.files)).toEqual(['favicon-16x16.png', 'favicon-32x32.png'])
  })

  it('空尺寸或非法尺寸明确失败，编码失败不能生成可下载结果', async () => {
    await expect(createFaviconExport(source, 'png', [])).rejects.toThrow('请选择有效')
    await expect(createFaviconExport(source, 'png', [1024])).rejects.toThrow('请选择有效')
    failEncoding = true
    await expect(createFaviconExport(source, 'png', [16])).rejects.toThrow('图片编码失败')
  })
})
