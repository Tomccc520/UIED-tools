/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-29
 */
import createQpdf from '@neslinesli93/qpdf-wasm'
import qpdfWasmUrl from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url'
import { compressPdfStructureWithRuntime } from './pdfCompressionCore'

/** 在独立线程重写 PDF 对象和流；不读取或发送用户文件到服务端。 */
self.onmessage = async (event: MessageEvent<File>) => {
  try {
    const options = { locateFile: () => qpdfWasmUrl, print: () => undefined, printErr: () => undefined }
    const module = await createQpdf(options)
    const runtime = module as typeof module & Parameters<typeof compressPdfStructureWithRuntime>[0]
    const result = compressPdfStructureWithRuntime(runtime, new Uint8Array(await event.data.arrayBuffer()))
    self.postMessage({ ok: true, data: result }, { transfer: [result.buffer] })
  } catch {
    self.postMessage({ ok: false, message: 'PDF 压缩失败，请检查文件是否损坏或有打开密码' })
  }
}
