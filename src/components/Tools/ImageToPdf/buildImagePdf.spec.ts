// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { PDFArray, PDFDocument, PDFRawStream, decodePDFRawStream, PageSizes } from 'pdf-lib'
import { buildImagePdf } from './buildImagePdf'

/** 读取真实的横向 4×2 和纵向 2×4 PNG，构造浏览器传入的文件列表。 */
function sampleFiles() {
  return [
    'iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAYAAAB/qH1jAAAAEUlEQVR4AWP0BQIGJMDEgAYAJkwBOPQ4OB8AAAAASUVORK5CYII=',
    'iVBORw0KGgoAAAANSUhEUgAAAAIAAAAECAYAAACk7+45AAAAGElEQVR4AWP0BQIGIGBigAImBihgYoACACkCATxrOxjgAAAAAElFTkSuQmCC',
  ].map((png, i) => new File([Uint8Array.from(Buffer.from(png, 'base64'))], i + '.png', { type: 'image/png' }))
}

describe('图片转 PDF 的实际页面与嵌入图片尺寸', () => {
  it('合并时让每一页分别匹配对应图片的方向、顺序和 96 dpi 尺寸', async () => {
    const blob = await buildImagePdf(sampleFiles(), 'original')
    const pdf = await PDFDocument.load(await blob.arrayBuffer())
    expect(pdf.getPages().map(page => page.getSize())).toEqual([{ width: 3, height: 1.5 }, { width: 1.5, height: 3 }])
  })

  it.each(['a4-portrait', 'a4-landscape'] as const)('%s 等比居中，图片不会被拉长', async (mode) => {
    const blob = await buildImagePdf(sampleFiles().slice(0, 1), mode)
    const pdf = await PDFDocument.load(await blob.arrayBuffer())
    const page = pdf.getPage(0)
    const [width, height] = mode === 'a4-portrait' ? PageSizes.A4 : [...PageSizes.A4].reverse()
    expect(page.getSize()).toEqual({ width, height })
    const streams = page.node.Contents() as PDFArray
    const stream = pdf.context.lookup(streams.get(0))
    if (!(stream instanceof PDFRawStream)) throw new Error('未找到导出页面的原始内容流')
    const ops = Buffer.from(decodePDFRawStream(stream).decode()).toString('ascii')
    expect(ops).toContain(`${width} 0 0 ${width / 2} 0 0 cm`)
    expect(ops).toContain(`1 0 0 1 0 ${(height - width / 2) / 2} cm`)
  })
})
