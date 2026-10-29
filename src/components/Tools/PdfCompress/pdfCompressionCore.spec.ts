// @vitest-environment node
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-29
 */
import { describe, expect, it } from 'vitest'
import { PDFDocument, PDFName, PDFString, StandardFonts } from 'pdf-lib'
import createQpdf from '@neslinesli93/qpdf-wasm'
import * as pdfjs from 'pdfjs-dist'
import { compressPdfStructureWithRuntime } from './pdfCompressionCore'

const dependenciesPath = `${globalThis.process.cwd()}/node_modules`

/** 生成包含文字、两页不同尺寸、可点击链接及表单值的真实 PDF 样本。 */
async function fixture() {
  const doc = await PDFDocument.create()
  doc.setAuthor('UIED retained author')
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const first = doc.addPage([400, 300])
  first.drawText('UIED text remains searchable', { x: 30, y: 260, size: 18, font })
  doc.addPage([300, 400]).drawText('Second page retained', { x: 20, y: 330, size: 16, font })
  const field = doc.getForm().createTextField('userName')
  field.setText('Retained UIED value')
  field.addToPage(first, { x: 30, y: 150, width: 250, height: 28 })
  const link = doc.context.register(doc.context.obj({
    Type: 'Annot', Subtype: 'Link', Rect: [30, 70, 250, 100], Border: [0, 0, 0],
    A: { Type: 'Action', S: 'URI', URI: PDFString.of('https://uiedtool.com/') }
  }))
  first.node.addAnnot(link)
  return doc.save({ useObjectStreams: false })
}

/** 用真实 WASM 运行与浏览器一致的参数，确认当前依赖确实支持这些选项。 */
async function compress(bytes: Uint8Array) {
  const options = {
    locateFile: () => `${dependenciesPath}/@neslinesli93/qpdf-wasm/dist/qpdf.wasm`,
    print: () => undefined, printErr: () => undefined
  }
  const runtime = await createQpdf(options)
  return compressPdfStructureWithRuntime(runtime as typeof runtime & Parameters<typeof compressPdfStructureWithRuntime>[0], bytes)
}

describe('PDF 结构压缩真实 WASM 验证', () => {
  it('压缩后两页文字、链接、表单、尺寸和作者信息仍可被独立阅读器读取', async () => {
    const source = await fixture()
    const result = await compress(source)
    expect(result.byteLength).toBeLessThan(source.byteLength)
    const task = pdfjs.getDocument({ data: result.slice(), standardFontDataUrl: `${dependenciesPath}/pdfjs-dist/standard_fonts/` })
    const reader = await task.promise
    try {
      expect(reader.numPages).toBe(2)
      const page = await reader.getPage(1)
      const content = await page.getTextContent()
      expect(content.items.map(item => 'str' in item ? item.str : '').join(' ')).toContain('UIED text remains searchable')
      const annotations = await page.getAnnotations()
      expect(annotations.some(annotation => annotation.url === 'https://uiedtool.com/')).toBe(true)
      const fields = await reader.getFieldObjects()
      expect(fields?.userName.some(field => (field as { value?: string }).value === 'Retained UIED value')).toBe(true)
      expect((await reader.getMetadata()).info).toMatchObject({ Author: 'UIED retained author' })
      expect(page.view).toEqual([0, 0, 400, 300])
      expect((await reader.getPage(2)).view).toEqual([0, 0, 300, 400])
      const parsed = await PDFDocument.load(result)
      expect(parsed.catalog.has(PDFName.of('AcroForm'))).toBe(true)
      expect(parsed.getForm().getTextField('userName').getText()).toBe('Retained UIED value')
    } finally { await reader.destroy() }
  }, 30000)

  it('损坏的 PDF 不会返回伪成功产物', async () => {
    await expect(compress(new TextEncoder().encode('not a valid PDF'))).rejects.toThrow('PDF 压缩失败')
  }, 30000)
})
