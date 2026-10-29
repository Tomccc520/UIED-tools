/**
 * @description 静态图片压缩前检查动画标记，避免 Canvas 编码静默丢失动画。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-29
 */

/** 比较二进制中的固定四字符标记，不把图片内容中的普通文本误认为容器块。 */
function matchesFourCC(bytes: Uint8Array, offset: number, text: string): boolean {
  return offset + 4 <= bytes.length && Array.from(text).every((character, index) => bytes[offset + index] === character.charCodeAt(0))
}

/**
 * 从容器头或完整 PNG 缓冲区识别动画；返回可读提示，静态图或未知格式返回空串。
 * WebP 只需前 30 字节；PNG 需要遍历块边界，调用方传入完整原文件。
 */
export function getStaticImageAnimationError(buffer: ArrayBuffer, mimeType: string): string {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)
  if (mimeType === 'image/webp' && bytes.length >= 30
    && matchesFourCC(bytes, 0, 'RIFF') && matchesFourCC(bytes, 8, 'WEBP')
    && matchesFourCC(bytes, 12, 'VP8X') && view.getUint32(16, true) === 10 && (bytes[20] & 2) !== 0) {
    return '暂不支持压缩动态 WebP，请保留原文件，避免丢失动画帧'
  }
  const signature = [137, 80, 78, 71, 13, 10, 26, 10]
  if (mimeType !== 'image/png' || bytes.length < 8 || signature.some((value, index) => bytes[index] !== value)) return ''
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const end = offset + view.getUint32(offset) + 12
    if (end > bytes.length) break
    if (['acTL', 'fcTL', 'fdAT'].some(type => matchesFourCC(bytes, offset + 4, type))) {
      return '暂不支持压缩动态 PNG（APNG），请保留原文件，避免丢失动画帧'
    }
    if (matchesFourCC(bytes, offset + 4, 'IEND')) break
    offset = end
  }
  return ''
}
