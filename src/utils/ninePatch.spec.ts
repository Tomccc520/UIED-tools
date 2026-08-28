/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-28
 */

import { describe, expect, it } from 'vitest'
import {
  calculateNinePatchSliceAxis,
  createNinePatchRange,
  mapNinePatchCoordinate,
  normalizeNinePatchRange
} from './ninePatch'

describe('normalizeNinePatchRange', () => {
  it('会交换反向区间并限制在图片像素范围内', () => {
    expect(normalizeNinePatchRange({ start: 18, end: -2 }, 12)).toEqual({ start: 0, end: 11 })
  })
})

describe('createNinePatchRange', () => {
  it('会按比例生成有效的居中区间', () => {
    expect(createNinePatchRange(100, 0.25, 0.75)).toEqual({ start: 25, end: 74 })
  })
})

describe('calculateNinePatchSliceAxis', () => {
  it('目标尺寸足够时会固定两端并只缩放中间区域', () => {
    const result = calculateNinePatchSliceAxis(100, { start: 20, end: 79 }, 180)
    expect(result.source).toEqual([20, 60, 20])
    expect(result.target).toEqual([20, 140, 20])
    expect(result.target.reduce((sum, value) => sum + value, 0)).toBe(180)
  })

  it('目标尺寸过小时仍保证目标片段总尺寸准确', () => {
    const result = calculateNinePatchSliceAxis(100, { start: 40, end: 59 }, 30)
    expect(result.target.reduce((sum, value) => sum + value, 0)).toBe(30)
    expect(result.target[1]).toBe(0)
  })
})

describe('mapNinePatchCoordinate', () => {
  it('目标尺寸不足时按压缩后的固定边映射内容坐标', () => {
    expect(mapNinePatchCoordinate(20, 100, { start: 40, end: 59 }, 50)).toBe(12.5)
    expect(mapNinePatchCoordinate(80, 100, { start: 40, end: 59 }, 50)).toBe(37.5)
  })
})
