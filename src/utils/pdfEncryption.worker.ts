/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import createQpdf from '@neslinesli93/qpdf-wasm'
import qpdfWasmUrl from '@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url'
import { encryptPdfWithRuntime, type PdfEncryptionPasswords, type PdfEncryptionRuntime } from './pdfEncryptionCore'

/**
 * 函数说明：在独立 Worker 内加载本地 WASM 并加密 PDF，任务结束后由调用方销毁内存。
 * @param event PDF 文件和已校验的密码，不向服务端传输
 */
self.onmessage = async (event: MessageEvent<{ file: File; passwords: PdfEncryptionPasswords }>) => {
  try {
    const options = {
      locateFile: () => qpdfWasmUrl,
      // qpdf 日志可能包含命令行参数，避免输出用户密码和文档路径。
      print: () => undefined,
      printErr: () => undefined
    }
    const module = await createQpdf(options)
    // 上游声明缺少 Emscripten FS 的写入/删除类型，实际导出两种标准方法。
    const runtime = module as typeof module & PdfEncryptionRuntime
    const source = new Uint8Array(await event.data.file.arrayBuffer())
    const result = encryptPdfWithRuntime(runtime, source, event.data.passwords)
    self.postMessage({ ok: true, data: result }, { transfer: [result.buffer] })
  } catch {
    self.postMessage({ ok: false, message: '加密失败，请确认 PDF 未损坏且没有已有的打开密码' })
  }
}
