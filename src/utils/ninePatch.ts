/**
 * @file ninePatch.ts
 * @description Android Nine-patch 像素区间与九宫格缩放计算工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-28
 */

export interface NinePatchRange {
  start: number
  end: number
}

export interface NinePatchSliceAxis {
  source: [number, number, number]
  target: [number, number, number]
}

/**
 * 函数说明：把像素区间限制在图片尺寸内，并确保起止值按从小到大排列。
 */
export const normalizeNinePatchRange = (range: NinePatchRange, size: number): NinePatchRange => {
  const maxIndex = Math.max(0, Math.floor(size) - 1)
  const first = Math.min(maxIndex, Math.max(0, Math.round(Number(range.start) || 0)))
  const second = Math.min(maxIndex, Math.max(0, Math.round(Number(range.end) || 0)))
  return {
    start: Math.min(first, second),
    end: Math.max(first, second)
  }
}

/**
 * 函数说明：按照图片尺寸生成居中的默认拉伸区或内容安全区。
 */
export const createNinePatchRange = (size: number, startRatio: number, endRatio: number): NinePatchRange => {
  const safeSize = Math.max(1, Math.floor(size))
  return normalizeNinePatchRange(
    {
      start: Math.floor(safeSize * startRatio),
      end: Math.max(0, Math.ceil(safeSize * endRatio) - 1)
    },
    safeSize
  )
}

/**
 * 函数说明：计算单轴九宫格源片段和目标片段尺寸，固定两端并拉伸中间区域。
 */
export const calculateNinePatchSliceAxis = (
  sourceSize: number,
  stretchRange: NinePatchRange,
  targetSize: number
): NinePatchSliceAxis => {
  const safeSourceSize = Math.max(1, Math.floor(sourceSize))
  const safeTargetSize = Math.max(1, Math.floor(targetSize))
  const normalized = normalizeNinePatchRange(stretchRange, safeSourceSize)
  const leading = normalized.start
  const stretch = normalized.end - normalized.start + 1
  const trailing = Math.max(0, safeSourceSize - normalized.end - 1)
  const fixedSize = leading + trailing

  if (safeTargetSize >= fixedSize) {
    return {
      source: [leading, stretch, trailing],
      target: [leading, Math.max(0, safeTargetSize - fixedSize), trailing]
    }
  }

  const ratio = fixedSize > 0 ? safeTargetSize / fixedSize : 0
  const targetLeading = Math.round(leading * ratio)
  return {
    source: [leading, stretch, trailing],
    target: [targetLeading, 0, Math.max(0, safeTargetSize - targetLeading)]
  }
}

/**
 * 函数说明：把源图单轴坐标映射到九宫格缩放后的目标坐标，兼容目标尺寸小于固定边总长的场景。
 */
export const mapNinePatchCoordinate = (
  coordinate: number,
  sourceSize: number,
  stretchRange: NinePatchRange,
  targetSize: number
): number => {
  const safeSourceSize = Math.max(1, Math.floor(sourceSize))
  const safeTargetSize = Math.max(1, Math.floor(targetSize))
  const safeCoordinate = Math.min(safeSourceSize, Math.max(0, Number(coordinate) || 0))
  const axis = calculateNinePatchSliceAxis(safeSourceSize, stretchRange, safeTargetSize)
  const sourceLeadingEnd = axis.source[0]
  const sourceStretchEnd = sourceLeadingEnd + axis.source[1]
  const targetLeadingEnd = axis.target[0]
  const targetStretchEnd = targetLeadingEnd + axis.target[1]

  if (safeCoordinate <= sourceLeadingEnd) {
    return sourceLeadingEnd > 0 ? (safeCoordinate / sourceLeadingEnd) * targetLeadingEnd : 0
  }
  if (safeCoordinate <= sourceStretchEnd) {
    return targetLeadingEnd +
      (axis.source[1] > 0 ? ((safeCoordinate - sourceLeadingEnd) / axis.source[1]) * axis.target[1] : 0)
  }
  return targetStretchEnd +
    (axis.source[2] > 0 ? ((safeCoordinate - sourceStretchEnd) / axis.source[2]) * axis.target[2] : 0)
}
