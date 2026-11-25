/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-29
 */
import createQpdf from '@neslinesli93/qpdf-wasm'
import qpdfWasmUrl from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url'
import { compressPdfStructureWithRuntime } from './pdfCompressionCore'
import { optimizeEmbeddedPdfImages, type PdfStructureMode } from './pdfImageCompression'

/** 在独立线程优化 PDF 内嵌图片和对象流，完成后只传输实际采用的文件。 */
self.onmessage = async (event: MessageEvent<{ file: File; mode: PdfStructureMode }>) => {
  try {
    const { file, mode } = event.data
    const source = new Uint8Array(await file.arrayBuffer())
    const { data, images, notice } = await optimizeEmbeddedPdfImages(source, mode)
    if (notice === 'protected') {
      self.postMessage({ ok: true, notice, images: 0 })
      return
    }
    const options = { locateFile: () => qpdfWasmUrl, print: () => undefined, printErr: () => undefined }
    const module = await createQpdf(options)
    const runtime = module as typeof module & Parameters<typeof compressPdfStructureWithRuntime>[0]
    const structured = compressPdfStructureWithRuntime(runtime, data)
    // 重写有时会增加体积；图片已缩小时，连同结构优化版本一起比较。
    const result = images && data.length < structured.length ? data : structured
    if (result.length >= source.length) {
      self.postMessage({ ok: true, notice, images: 0 })
      return
    }
    self.postMessage({ ok: true, data: result, images, notice }, { transfer: [result.buffer] })
  } catch {
    self.postMessage({ ok: false, message: 'PDF 压缩失败，请检查文件是否损坏或有打开密码' })
  }
}
