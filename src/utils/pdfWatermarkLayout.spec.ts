import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPdfWatermarkCanvas, getPdfWatermarkPositions, type PdfWatermarkSettings } from './pdfWatermarkLayout'

const settings: PdfWatermarkSettings = {
  text: 'UIED Tools', size: 50, opacity: 0.5, rotate: -45, color: '#FF0000', layout: 'tile',
}

/** 构造记录绘制参数的上下文，用于验证页面逻辑坐标和高清像素倍率互不混用。 */
const mockContext = () => ({
  save: vi.fn(), restore: vi.fn(), translate: vi.fn(), rotate: vi.fn(),
  fillText: vi.fn(), setTransform: vi.fn(), measureText: vi.fn(() => ({ width: 240 })),
  font: '', globalAlpha: 1, fillStyle: '', textAlign: '', textBaseline: '',
})

afterEach(() => vi.restoreAllMocks())

describe('PDF 水印页面坐标与平铺', () => {
  it('居中水印使用页面真实中心，角度不改变锚点', () => {
    expect(getPdfWatermarkPositions(595.28, 841.89, 240, { ...settings, layout: 'center' }))
      .toEqual([{ x: 297.64, y: 420.945 }])
  })

  it('A4 字号 50 平铺包含多行多列，中心对称且旋转后的文字不会重叠', () => {
    const positions = getPdfWatermarkPositions(595.28, 841.89, 240, settings)
    const columns = [...new Set(positions.map(({ x }) => x))]
    const rows = [...new Set(positions.map(({ y }) => y))]
    expect(columns.length).toBeGreaterThan(1)
    expect(rows.length).toBeGreaterThan(1)
    expect(positions).toHaveLength(columns.length * rows.length)
    expect((columns[0] + columns[columns.length - 1]) / 2).toBeCloseTo(595.28 / 2)
    expect((rows[0] + rows[rows.length - 1]) / 2).toBeCloseTo(841.89 / 2)
    const rotatedBound = (240 + 50) / Math.sqrt(2)
    expect(columns[1] - columns[0]).toBeGreaterThan(rotatedBound)
    expect(rows[1] - rows[0]).toBeGreaterThan(rotatedBound)
  })

  it('高清画布倍率为 2 时仍按页面大小、字号 50 和同一组坐标绘制', () => {
    const contexts = [mockContext(), mockContext()]
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValueOnce(contexts[0] as unknown as CanvasRenderingContext2D)
      .mockReturnValueOnce(contexts[1] as unknown as CanvasRenderingContext2D)
    const normal = createPdfWatermarkCanvas(595.28, 841.89, settings, 1)
    const highRes = createPdfWatermarkCanvas(595.28, 841.89, settings, 2)
    expect(normal.width).toBe(596)
    expect(highRes.width).toBe(1191)
    expect(contexts[1].setTransform).toHaveBeenCalledWith(1191 / 595.28, 0, 0, 1684 / 841.89, 0, 0)
    expect(contexts[0].font).toBe('50px sans-serif')
    expect(contexts[1].font).toBe('50px sans-serif')
    expect(contexts[1].translate.mock.calls).toEqual(contexts[0].translate.mock.calls)
    expect(contexts[1].fillText.mock.calls.length).toBeGreaterThan(1)
    expect(contexts[1].fillText.mock.calls).toEqual(contexts[0].fillText.mock.calls)
  })

  it('空白文字不绘制任何水印', () => {
    const context = mockContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
    createPdfWatermarkCanvas(595.28, 841.89, { ...settings, text: ' ' })
    expect(context.fillText).not.toHaveBeenCalled()
  })
})
