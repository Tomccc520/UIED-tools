/**
 * 将鼠标或手指的视口坐标换算成签名画布的实际像素坐标。
 * @param point 指针在视口中的位置（CSS 像素）
 * @param rect 画布实际显示位置及尺寸
 * @param bitmap 画布内部位图尺寸；已包含渲染缩放，不再重复乘设备像素比
 * @returns 可直接传给 CanvasRenderingContext2D 的坐标
 */
export function getSignatureCanvasCoordinates(
  point: { clientX: number; clientY: number },
  rect: { left: number; top: number; width: number; height: number },
  bitmap: { width: number; height: number },
): { offsetX: number; offsetY: number } {
  if (rect.width <= 0 || rect.height <= 0) return { offsetX: 0, offsetY: 0 }
  return {
    offsetX: (point.clientX - rect.left) * bitmap.width / rect.width,
    offsetY: (point.clientY - rect.top) * bitmap.height / rect.height,
  }
}
