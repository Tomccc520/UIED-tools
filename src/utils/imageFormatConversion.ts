/**
 * @description 图片格式转换的真实编码校验与批量下载命名。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */

export const IMAGE_OUTPUT_MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp'
} as const

export type ImageOutputFormat = keyof typeof IMAGE_OUTPUT_MIME_TYPES

/** 根据输出扩展名取得标准 MIME；拒绝没有可靠编码器的格式，避免 Canvas 静默回退 PNG。 */
export const getImageOutputMimeType = (format: string): string => {
  if (!Object.prototype.hasOwnProperty.call(IMAGE_OUTPUT_MIME_TYPES, format)) {
    throw new Error(`不支持导出 ${format.toUpperCase()} 格式，请选择 JPG、PNG 或 WebP`)
  }
  return IMAGE_OUTPUT_MIME_TYPES[format as ImageOutputFormat]
}

/** 校验编码结果的 MIME 和真实文件头；参数为 Canvas 结果及目标格式，失败时抛出可展示的错误。 */
export const validateEncodedImageBlob = async (blob: Blob, format: string): Promise<void> => {
  const mimeType = getImageOutputMimeType(format)
  if (!blob.size || blob.type.toLowerCase() !== mimeType) {
    throw new Error(`当前浏览器不支持导出 ${format.toUpperCase()}，请改用其他格式`)
  }
  const header = new Uint8Array(await blob.slice(0, 12).arrayBuffer())
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff
  const isPng = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((byte, index) => header[index] === byte)
  const isWebp = String.fromCharCode(...header.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...header.slice(8, 12)) === 'WEBP'
  const matches = mimeType === 'image/jpeg' ? isJpeg : mimeType === 'image/png' ? isPng : isWebp
  if (!matches) throw new Error(`转换结果与 ${format.toUpperCase()} 格式不符，请改用其他格式`)
}

/** 按标准 MIME 编码 Canvas，并在返回 Blob 前校验实际格式，浏览器回退或空结果均视为失败。 */
export const encodeImageCanvas = async (canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> => {
  const mimeType = getImageOutputMimeType(format)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('图片编码失败，请重试')), mimeType, quality)
  })
  await validateEncodedImageBlob(blob, format)
  return blob
}

/** 为转换结果生成唯一下载名：仅移除最后扩展名，对重复名称、跨格式及已有编号碰撞逐一编号。 */
export const createConvertedImageNames = (files: { name: string; format: ImageOutputFormat }[]): string[] => {
  const usedNames = new Set<string>()
  return files.map(({ name, format }) => {
    const safeName = name.replace(/[\\/\x00-\x1f]/g, '_') || 'image'
    const dot = safeName.lastIndexOf('.')
    const stem = dot > 0 ? safeName.slice(0, dot) : safeName
    let outputName = `${stem}.${format}`
    let suffix = 2
    while (usedNames.has(outputName.toLowerCase())) outputName = `${stem} (${suffix++}).${format}`
    usedNames.add(outputName.toLowerCase())
    return outputName
  })
}
