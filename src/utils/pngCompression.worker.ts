/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { encodePngBuffer } from './pngCompressionCore'
import { PngCompressionError, type PngCompressionRequest, type PngCompressionResponse } from './pngCompressionProtocol'

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<PngCompressionRequest>) => Promise<void>) | null
  postMessage(message: PngCompressionResponse, transfer?: Transferable[]): void
}

/** 在后台线程读取、解码和编码 PNG，成功后转移缓冲区避免主线程复制像素。 */
workerScope.onmessage = async (event: MessageEvent<PngCompressionRequest>): Promise<void> => {
  try {
    const request = event.data
    if (!request?.file || typeof request.file.arrayBuffer !== 'function') throw new PngCompressionError('invalid')
    const buffer = encodePngBuffer(await request.file.arrayBuffer(), request.mode, request.colors)
    workerScope.postMessage({ ok: true, buffer }, [buffer])
  } catch (error) {
    workerScope.postMessage({ ok: false, code: error instanceof PngCompressionError ? error.code : 'invalid' })
  }
}
