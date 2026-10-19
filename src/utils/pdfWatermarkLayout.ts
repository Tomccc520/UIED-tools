/**
 * @description PDF 水印共用布局与绘制，页面坐标不随预览尺寸或高清像素倍率变化。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */

export interface PdfWatermarkSettings {
  text: string
  size: number
  opacity: number
  rotate: number
  color: string
  layout: 'center' | 'tile'
}

/**
 * 按页面逻辑坐标计算水印中心；平铺间距包含旋转后的文字包围盒和留白。
 * @param width 页面宽度
 * @param height 页面高度
 * @param textWidth 当前字号的实测文字宽度
 * @param settings 水印字号、角度及布局
 * @returns 从上到下排列的水印中心坐标
 */
export const getPdfWatermarkPositions = (
  width: number,
  height: number,
  textWidth: number,
  settings: Pick<PdfWatermarkSettings, 'size' | 'rotate' | 'layout'>,
) => {
  if (width <= 0 || height <= 0 || settings.size <= 0) return []
  if (settings.layout === 'center') return [{ x: width / 2, y: height / 2 }]

  const radians = settings.rotate * Math.PI / 180
  const cosine = Math.abs(Math.cos(radians))
  const sine = Math.abs(Math.sin(radians))
  const gap = Math.max(24, settings.size * 1.5)
  const stepX = textWidth * cosine + settings.size * sine + gap
  const stepY = textWidth * sine + settings.size * cosine + gap
  const columns = Math.max(1, Math.floor(width / stepX))
  const rows = Math.max(1, Math.floor(height / stepY))
  const positions: { x: number; y: number }[] = []

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      positions.push({
        x: width / 2 + (column - (columns - 1) / 2) * stepX,
        y: height / 2 + (row - (rows - 1) / 2) * stepY,
      })
    }
  }
  return positions
}

/**
 * 在页面逻辑坐标中绘制水印，沿用调用方的缩放与页面旋转变换。
 * @param context 已配置页面坐标变换的画布上下文
 * @param width 页面逻辑宽度
 * @param height 页面逻辑高度
 * @param settings 水印文字及样式
 */
export const drawPdfWatermark = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PdfWatermarkSettings,
) => {
  if (!settings.text.trim()) return
  context.save()
  context.globalAlpha = settings.opacity
  context.fillStyle = settings.color
  context.font = `${settings.size}px sans-serif`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  const positions = getPdfWatermarkPositions(width, height, context.measureText(settings.text).width, settings)
  for (const position of positions) {
    context.save()
    context.translate(position.x, position.y)
    context.rotate(settings.rotate * Math.PI / 180)
    context.fillText(settings.text, 0, 0)
    context.restore()
  }
  context.restore()
}

/**
 * 创建透明水印画布，将高清倍率仅应用到像素和坐标变换，保持逻辑字号不变。
 * @param width 页面逻辑宽度
 * @param height 页面逻辑高度
 * @param settings 水印文字及样式
 * @param pixelRatio 像素密度倍率
 * @returns 已绘制的水印画布
 */
export const createPdfWatermarkCanvas = (
  width: number,
  height: number,
  settings: PdfWatermarkSettings,
  pixelRatio = 2,
) => {
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width * pixelRatio)
  canvas.height = Math.ceil(height * pixelRatio)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('无法创建水印画布')
  context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0)
  drawPdfWatermark(context, width, height, settings)
  return canvas
}
