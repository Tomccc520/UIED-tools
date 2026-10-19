// @vitest-environment node
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { describe, expect, it, vi } from 'vitest'
import { createConvertedImageNames, encodeImageCanvas, getImageOutputMimeType, validateEncodedImageBlob } from './imageFormatConversion'

/** 使用原生 Blob 模拟真实编码结果，参数为文件头字节及 MIME，返回待校验结果。 */
const createBlob = (bytes: number[], type: string): Blob => new Blob([new Uint8Array(bytes)], { type })

const jpeg = [0xff, 0xd8, 0xff, 0xe0]
const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const webp = [...new TextEncoder().encode('RIFF'), 0, 0, 0, 0, ...new TextEncoder().encode('WEBP')]

describe('图片转换真实编码', () => {
  it('JPG 和 JPEG 使用 image/jpeg，BMP/TIFF 明确拒绝', () => {
    expect(getImageOutputMimeType('jpg')).toBe('image/jpeg')
    expect(getImageOutputMimeType('jpeg')).toBe('image/jpeg')
    expect(getImageOutputMimeType('png')).toBe('image/png')
    expect(getImageOutputMimeType('webp')).toBe('image/webp')
    for (const format of ['bmp', 'tiff', 'gif', 'constructor']) {
      expect(() => getImageOutputMimeType(format)).toThrow('不支持导出')
    }
  })

  it('成功结果必须同时满足目标 MIME 和真实签名', async () => {
    await expect(validateEncodedImageBlob(createBlob(jpeg, 'image/jpeg'), 'jpg')).resolves.toBeUndefined()
    await expect(validateEncodedImageBlob(createBlob(png, 'image/png'), 'png')).resolves.toBeUndefined()
    await expect(validateEncodedImageBlob(createBlob(webp, 'image/webp'), 'webp')).resolves.toBeUndefined()
    await expect(validateEncodedImageBlob(createBlob(png, 'image/jpeg'), 'jpg')).rejects.toThrow('格式不符')
    await expect(validateEncodedImageBlob(createBlob([], 'image/jpeg'), 'jpg')).rejects.toThrow('不支持导出')
  })

  it('Canvas 收到标准 JPEG MIME，PNG 静默回退不能视作 JPG/WebP 成功', async () => {
    const toBlob = vi.fn((callback: BlobCallback) => callback(createBlob(jpeg, 'image/jpeg')))
    const canvas = { toBlob } as unknown as HTMLCanvasElement
    await expect(encodeImageCanvas(canvas, 'jpg', 0.9)).resolves.toHaveProperty('type', 'image/jpeg')
    expect(toBlob).toHaveBeenLastCalledWith(expect.any(Function), 'image/jpeg', 0.9)
    toBlob.mockImplementation((callback) => callback(createBlob(png, 'image/png')))
    await expect(encodeImageCanvas(canvas, 'jpg', 0.9)).rejects.toThrow('不支持导出 JPG')
    await expect(encodeImageCanvas(canvas, 'webp', 0.9)).rejects.toThrow('不支持导出 WEBP')
    toBlob.mockClear()
    await expect(encodeImageCanvas(canvas, 'tiff', 0.9)).rejects.toThrow('不支持导出 TIFF')
    expect(toBlob).not.toHaveBeenCalled()
    toBlob.mockImplementation((callback) => callback(null))
    await expect(encodeImageCanvas(canvas, 'png', 0.9)).rejects.toThrow('图片编码失败')
  })
})

describe('图片转换批量命名', () => {
  it('保留多个句点，并为重复、跨输入格式及大小写碰撞编号', () => {
    expect(createConvertedImageNames([
      { name: 'design.v1.png', format: 'jpg' },
      { name: 'design.v2.png', format: 'jpg' },
      { name: 'design.v1.webp', format: 'jpg' },
      { name: 'design.v1.png', format: 'jpg' },
      { name: 'DESIGN.V1.JPG', format: 'jpg' }
    ])).toEqual(['design.v1.jpg', 'design.v2.jpg', 'design.v1 (2).jpg', 'design.v1 (3).jpg', 'DESIGN.V1 (4).jpg'])
  })

  it('已有编号名称和目录符号不会覆盖其他 ZIP 条目', () => {
    expect(createConvertedImageNames([
      { name: 'photo (2).png', format: 'png' },
      { name: 'photo.jpg', format: 'png' },
      { name: 'photo.webp', format: 'png' },
      { name: '../photo.png', format: 'png' }
    ])).toEqual(['photo (2).png', 'photo.png', 'photo (3).png', '.._photo.png'])
  })
})
