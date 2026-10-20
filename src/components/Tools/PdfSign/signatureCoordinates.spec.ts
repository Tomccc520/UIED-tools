import { describe, expect, it, vi } from 'vitest'
import { getSignatureCanvasCoordinates } from './signatureCoordinates'

describe('签名画布缩放坐标', () => {
  it('原尺寸显示时保留鼠标落点', () => {
    expect(getSignatureCanvasCoordinates(
      { clientX: 130, clientY: 90 },
      { left: 30, top: 40, width: 400, height: 200 },
      { width: 400, height: 200 },
    )).toEqual({ offsetX: 100, offsetY: 50 })
  })

  it('半尺寸显示时将触摸落点映射回同一位图位置', () => {
    expect(getSignatureCanvasCoordinates(
      { clientX: 80, clientY: 65 },
      { left: 30, top: 40, width: 200, height: 100 },
      { width: 400, height: 200 },
    )).toEqual({ offsetX: 100, offsetY: 50 })
  })

  it('设备像素比不会被重复乘入已经确定的位图尺寸', () => {
    vi.stubGlobal('devicePixelRatio', 3)
    try {
      expect(getSignatureCanvasCoordinates(
        { clientX: 80, clientY: 65 },
        { left: 30, top: 40, width: 200, height: 100 },
        { width: 400, height: 200 },
      )).toEqual({ offsetX: 100, offsetY: 50 })
    } finally {
      vi.unstubAllGlobals()
    }
  })

  it('横竖缩放比例不同也能保持手指与签名落点一致', () => {
    expect(getSignatureCanvasCoordinates(
      { clientX: 150, clientY: 140 },
      { left: 30, top: 40, width: 240, height: 200 },
      { width: 400, height: 200 },
    )).toEqual({ offsetX: 200, offsetY: 100 })
  })

  it('隐藏画布不产生无穷大坐标', () => {
    expect(getSignatureCanvasCoordinates(
      { clientX: 80, clientY: 65 },
      { left: 30, top: 40, width: 0, height: 0 },
      { width: 400, height: 200 },
    )).toEqual({ offsetX: 0, offsetY: 0 })
  })
})
