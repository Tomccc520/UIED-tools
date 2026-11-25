/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-25
 */
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFObject, PDFRawStream, PDFRef, PDFStream } from 'pdf-lib'

export type PdfCompressionLevel = 'gentle' | 'balanced' | 'strong'
export type PdfStructureMode = PdfCompressionLevel | 'structure'
export type PdfCompressionNotice = 'protected' | 'browser'

const profiles = {
  gentle: { longEdge: 3000, quality: 0.91 },
  balanced: { longEdge: 2100, quality: 0.78 },
  strong: { longEdge: 1500, quality: 0.57 }
} satisfies Record<PdfCompressionLevel, { longEdge: number; quality: number }>
const maxInputPixels = 16 * 1024 * 1024
const minImageBytes = 24 * 1024
const name = PDFName.of
const hasSpecialImageSettings = ['Mask', 'SMask', 'SMaskInData', 'ImageMask', 'Decode', 'DecodeParms',
  'F', 'Alternates', 'OPI', 'Intent', 'Matte'].map(name)

/** 检查重写会破坏的签名、时间戳与 XFA 表单，并收集作为遮罩使用的图片引用。 */
function inspectDocument(objects: Iterable<PDFObject>) {
  const masks = new Set<PDFRef>()
  const seen = new Set<PDFObject>()
  const pending = [...objects]
  let complexMask = false
  while (pending.length) {
    const object = pending.pop()!
    if (seen.has(object)) continue
    if (object instanceof PDFArray) {
      seen.add(object)
      for (const value of object.asArray()) pending.push(value)
      continue
    }
    const dictionary = object instanceof PDFStream ? object.dict : object
    if (!(dictionary instanceof PDFDict)) continue
    seen.add(object)
    const type = dictionary.lookup(name('Type'))
    if (type === name('Sig') || type === name('DocTimeStamp') ||
      (dictionary.has(name('ByteRange')) && dictionary.has(name('Contents'))) || dictionary.has(name('XFA'))) {
      return { protected: true, masks, complexMask }
    }
    for (const [key, value] of dictionary.entries()) {
      if (value instanceof PDFRef && (key === name('Mask') || key === name('SMask'))) masks.add(value)
      if (key === name('SMask')) {
        const mask = dictionary.lookup(key)
        if (mask instanceof PDFDict && mask.has(name('G'))) complexMask = true
      }
      if (value instanceof PDFDict || value instanceof PDFArray) pending.push(value)
    }
  }
  return { protected: false, masks, complexMask }
}

/** 只接受无蒙版、无解码参数、8 位 RGB 或灰度的普通 JPEG/Flate 图片流。 */
function getImageInfo(stream: PDFRawStream) {
  const { dict } = stream
  if (dict.lookup(name('Subtype')) !== name('Image') || stream.getContentsSize() < minImageBytes ||
    hasSpecialImageSettings.some((key) => dict.has(key))) return
  const color = dict.lookup(name('ColorSpace'))
  const bits = dict.lookup(name('BitsPerComponent'))
  const width = dict.lookup(name('Width'))
  const height = dict.lookup(name('Height'))
  if ((color !== name('DeviceRGB') && color !== name('DeviceGray')) || !(bits instanceof PDFNumber) ||
    bits.asNumber() !== 8 || !(width instanceof PDFNumber) || !(height instanceof PDFNumber)) return
  const w = width.asNumber()
  const h = height.asNumber()
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w * h > maxInputPixels) return

  const filters = dict.lookup(name('Filter'))
  const filter = filters instanceof PDFArray && filters.size() === 1 ? filters.lookup(0) : filters
  if (filter !== name('DCTDecode') && filter !== name('FlateDecode')) return
  return { width: w, height: h, channels: color === name('DeviceGray') ? 1 : 3, jpeg: filter === name('DCTDecode') }
}

/** 将字节包装为浏览器可解码的 Blob，保留原始流作为失败时的回退。 */
function imageBlob(bytes: Uint8Array, type: string) {
  return new Blob([bytes as Uint8Array<ArrayBuffer>], { type })
}

/** 安全读取简单 Flate 图片原始像素；产出超过声明尺寸时立即取消解压。 */
async function inflatePixels(source: Uint8Array, size: number) {
  const reader = imageBlob(source, 'application/octet-stream').stream().pipeThrough(new DecompressionStream('deflate')).getReader()
  const output = new Uint8Array(size)
  let offset = 0
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) return offset === size ? output : undefined
      if (offset + value.length > size) return
      output.set(value, offset)
      offset += value.length
    }
  } finally {
    await reader.cancel().catch(() => undefined)
    reader.releaseLock()
  }
}

/** 解码符合条件的图片。解码尺寸必须与 PDF 字典相同，避免改变图片方向。 */
async function decodeImage(stream: PDFRawStream, info: NonNullable<ReturnType<typeof getImageInfo>>) {
  if (info.jpeg) {
    return createImageBitmap(imageBlob(stream.contents, 'image/jpeg'), { imageOrientation: 'none' })
  }
  if (typeof DecompressionStream !== 'function') return
  const pixels = await inflatePixels(stream.contents, info.width * info.height * info.channels)
  if (!pixels) return
  const image = new ImageData(info.width, info.height)
  for (let input = 0, output = 0; input < pixels.length; input += info.channels, output += 4) {
    image.data[output] = pixels[input]
    image.data[output + 1] = pixels[input + (info.channels === 3 ? 1 : 0)]
    image.data[output + 2] = pixels[input + (info.channels === 3 ? 2 : 0)]
    image.data[output + 3] = 255
  }
  return createImageBitmap(image)
}

/** 使用档位上限等比缩小图片并编码，只返回确实更小的 JPEG 图片流。 */
async function recompressImage(stream: PDFRawStream, level: PdfCompressionLevel) {
  const info = getImageInfo(stream)
  if (!info) return
  const bitmap = await decodeImage(stream, info)
  if (!bitmap) return
  try {
    if (bitmap.width !== info.width || bitmap.height !== info.height) return
    const profile = profiles[level]
    const ratio = Math.min(1, profile.longEdge / Math.max(info.width, info.height))
    const canvas = new OffscreenCanvas(Math.max(1, Math.round(info.width * ratio)), Math.max(1, Math.round(info.height * ratio)))
    try {
      const context = canvas.getContext('2d', { alpha: false })
      if (!context) return
      context.imageSmoothingQuality = 'high'
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: profile.quality })
      if (blob.type !== 'image/jpeg' || blob.size >= stream.contents.length) return
      const dict = stream.dict.clone()
      dict.set(name('Width'), PDFNumber.of(canvas.width))
      dict.set(name('Height'), PDFNumber.of(canvas.height))
      dict.set(name('ColorSpace'), name('DeviceRGB'))
      dict.set(name('Filter'), name('DCTDecode'))
      return PDFRawStream.of(dict, new Uint8Array(await blob.arrayBuffer()))
    } finally {
      canvas.width = 1
      canvas.height = 1
    }
  } finally {
    bitmap.close()
  }
}

/** 只替换适合重编码的独立图片对象，页内容、图片位置及链接等原有引用保持不动。 */
export async function optimizeEmbeddedPdfImages(source: Uint8Array, mode: PdfStructureMode) {
  const pdf = await PDFDocument.load(source, { updateMetadata: false })
  const entries = pdf.context.enumerateIndirectObjects()
  const inspection = inspectDocument(entries.map(([, object]) => object))
  if (inspection.protected) return { data: source, images: 0, notice: 'protected' as const }
  if (mode === 'structure' || inspection.complexMask) return { data: source, images: 0 }
  if (typeof OffscreenCanvas !== 'function' || typeof OffscreenCanvas.prototype.convertToBlob !== 'function' ||
    typeof createImageBitmap !== 'function') return { data: source, images: 0, notice: 'browser' as const }

  let images = 0
  for (const [reference, object] of entries) {
    if (!(object instanceof PDFRawStream) || inspection.masks.has(reference)) continue
    // 单张图像编码失败时仍处理其他图片，并保留该源流。
    const result = await recompressImage(object, mode).catch(() => undefined)
    if (!result) continue
    pdf.context.assign(reference, result)
    images++
  }
  if (!images) return { data: source, images }
  const data = await pdf.save({ addDefaultPage: false, updateFieldAppearances: false })
  return data.length < source.length ? { data, images } : { data: source, images: 0 }
}
