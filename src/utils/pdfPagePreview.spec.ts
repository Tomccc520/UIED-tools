import { afterEach, describe, expect, it, vi } from 'vitest'
import { cancelPdfPagePreview, getPdfPageRotation, renderPdfPagePreview } from './pdfPagePreview'

afterEach(() => vi.restoreAllMocks())

/** 创建可控制完成时机的 Promise，模拟页面获取与 PDF.js 渲染的乱序完成。 */
const deferred = () => {
  let resolve!: (value?: any) => void
  const promise = new Promise<any>((done) => { resolve = done })
  return { promise, resolve }
}

/** 记录最终绘制角度，避免将测试绑定到组件内部的版本号实现。 */
const previewPage = (render: (...args: any[]) => any, originalRotation = 0) => ({
  rotate: originalRotation,
  getViewport: ({ scale, rotation }: any) => ({ width: 400 * scale, height: 600 * scale, rotation }),
  render,
})

describe('PDF 页面预览取消和旋转顺序', () => {
  it('源角度与增量按整圈归一化，逆转不会输出负角度', () => {
    expect(getPdfPageRotation(90, 90)).toBe(180)
    expect(getPdfPageRotation(0, -90)).toBe(270)
    expect(getPdfPageRotation(270, 90)).toBe(0)
  })

  it('较慢的旧 getPage 完成时，不能覆盖已经渲染的新角度', async () => {
    const older = deferred()
    const render = vi.fn((_options: any) => ({ promise: Promise.resolve(), cancel: vi.fn() }))
    const page = previewPage(render, 90)
    const pdf = { getPage: vi.fn().mockReturnValueOnce(older.promise).mockResolvedValue(page) }
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue({} as any)
    const first = renderPdfPagePreview(pdf as any, 2, 90, canvas, () => true)
    await Promise.resolve()
    const latest = renderPdfPagePreview(pdf as any, 2, 180, canvas, () => true)
    expect(await latest).toBe(true)
    older.resolve(page)
    expect(await first).toBe(false)
    expect(render).toHaveBeenCalledTimes(1)
    expect(render.mock.calls[0][0].viewport.rotation).toBe(270)
  })

  it('新渲染等待旧任务取消释放画布，清除任务不会重新写入画布', async () => {
    const pending = deferred()
    const cancel = vi.fn(() => pending.resolve())
    const render = vi.fn().mockReturnValueOnce({ promise: pending.promise, cancel })
      .mockReturnValue({ promise: Promise.resolve(), cancel: vi.fn() })
    const pdf = { getPage: vi.fn().mockResolvedValue(previewPage(render)) }
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue({} as any)
    const first = renderPdfPagePreview(pdf as any, 0, 90, canvas, () => true)
    await Promise.resolve()
    await Promise.resolve()
    const next = renderPdfPagePreview(pdf as any, 0, 180, canvas, () => true)
    expect(cancel).toHaveBeenCalledOnce()
    expect(await first).toBe(false)
    expect(await next).toBe(true)
    const final = renderPdfPagePreview(pdf as any, 0, 270, canvas, () => true)
    cancelPdfPagePreview(canvas)
    expect(await final).toBe(false)
    expect(render).toHaveBeenCalledTimes(2)
  })

  it('连续三次旋转都等待尚未结束的旧绘制，不会跳过中间请求而争用画布', async () => {
    const pending = deferred()
    const cancel = vi.fn()
    const render = vi.fn().mockReturnValueOnce({ promise: pending.promise, cancel })
      .mockReturnValue({ promise: Promise.resolve(), cancel: vi.fn() })
    const pdf = { getPage: vi.fn().mockResolvedValue(previewPage(render)) }
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue({} as any)
    const first = renderPdfPagePreview(pdf as any, 0, 90, canvas, () => true)
    await Promise.resolve()
    await Promise.resolve()
    const second = renderPdfPagePreview(pdf as any, 0, 180, canvas, () => true)
    const third = renderPdfPagePreview(pdf as any, 0, 270, canvas, () => true)
    await Promise.resolve()
    await Promise.resolve()
    expect(render).toHaveBeenCalledTimes(1)
    pending.resolve()
    expect(await first).toBe(false)
    expect(await second).toBe(false)
    expect(await third).toBe(true)
    expect(render).toHaveBeenCalledTimes(2)
    expect(render.mock.calls[1][0].viewport.rotation).toBe(270)
  })

  it('旧 getPage 失败后不再报告已被新旋转替代的错误', async () => {
    let rejectOld!: (error: Error) => void
    const pending = new Promise((_, reject) => { rejectOld = reject })
    const render = vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() }))
    const pdf = { getPage: vi.fn().mockReturnValueOnce(pending).mockResolvedValue(previewPage(render)) }
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue({} as any)
    const first = renderPdfPagePreview(pdf as any, 0, 90, canvas, () => true)
    await Promise.resolve()
    const latest = renderPdfPagePreview(pdf as any, 0, 180, canvas, () => true)
    rejectOld(new Error('旧页面加载失败'))
    expect(await first).toBe(false)
    expect(await latest).toBe(true)
  })
})
