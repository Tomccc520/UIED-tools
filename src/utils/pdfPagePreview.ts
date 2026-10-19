/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'

interface PreviewState { settled: Promise<unknown>; task?: RenderTask }
const previewStates = new WeakMap<HTMLCanvasElement, PreviewState>()

/** 将源页面角度与本次增量相加，统一返回 0–359 度供预览及导出使用。 */
export const getPdfPageRotation = (original: number, increment: number) => ((original + increment) % 360 + 360) % 360

/** 取消指定画布的旧渲染，让清除文件及快速旋转后的旧任务不能覆盖新预览。 */
export const cancelPdfPagePreview = (canvas: HTMLCanvasElement) => {
  const previous = previewStates.get(canvas)
  previewStates.set(canvas, { settled: previous?.settled ?? Promise.resolve(), task: previous?.task })
  previous?.task?.cancel()
}

/** 按稳定源页索引渲染一次旋转；等待旧任务释放画布并丢弃过时请求，返回是否完成当前绘制。 */
export const renderPdfPagePreview = async (
  document: PDFDocumentProxy,
  sourceIndex: number,
  increment: number,
  canvas: HTMLCanvasElement,
  isCurrent: () => boolean,
  maxSize = 200,
) => {
  const previous = previewStates.get(canvas)
  // 传递尚未释放的画布等待链，第三次旋转不能越过第二次仍在等待的旧任务。
  const state: PreviewState = { settled: previous?.settled ?? Promise.resolve() }
  previewStates.set(canvas, state)
  previous?.task?.cancel()
  /** 判断当前请求仍持有画布，且所属文件未被替换或清除。 */
  const current = () => previewStates.get(canvas) === state && isCurrent()
  try {
    await state.settled
    if (!current()) return false
    const page = await document.getPage(sourceIndex + 1)
    if (!current()) return false
    const rotation = getPdfPageRotation(page.rotate, increment)
    const viewport = page.getViewport({ scale: 1, rotation })
    const scale = Math.min(maxSize / viewport.width, maxSize / viewport.height)
    const scaledViewport = page.getViewport({ scale, rotation })
    const context = canvas.getContext('2d')
    if (!context) return false
    canvas.width = scaledViewport.width
    canvas.height = scaledViewport.height
    state.task = page.render({ canvasContext: context, viewport: scaledViewport })
    state.settled = state.task.promise.catch(() => undefined)
    await state.task.promise
    return current()
  } catch (error) {
    if (current() && (error as Error)?.name !== 'RenderingCancelledException') throw error
    return false
  }
}
