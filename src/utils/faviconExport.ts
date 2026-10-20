/**
 * @description 按所选尺寸生成 Favicon 文件及不可变的下载元数据。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-20
 */
import JSZip from 'jszip'
import { encodeImageCanvas } from './imageFormatConversion'

export const FAVICON_OUTPUT_SIZES = [16, 32, 48, 64, 128, 256] as const
export type FaviconOutputFormat = 'png' | 'ico'
export interface FaviconExportResult {
  blob: Blob
  filename: string
  format: FaviconOutputFormat
  sizes: number[]
  isArchive: boolean
}

/** 将裁剪画布缩放到指定正方形尺寸并编码为真实 PNG，失败时不返回空文件。 */
async function resizeFaviconPng(source: HTMLCanvasElement, size: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  try {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('无法创建图标画布，请重试')
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(source, 0, 0, size, size)
    return await encodeImageCanvas(canvas, 'png', 1)
  } finally {
    canvas.width = canvas.height = 0
  }
}

/** 将已缩放的 PNG 封装为单尺寸 ICO；256 像素按 ICO 规范以 0 标识。 */
async function pngToIco(png: Blob, size: number): Promise<Blob> {
  const pngBytes = new Uint8Array(await png.arrayBuffer())
  const bytes = new Uint8Array(22 + pngBytes.length)
  const header = new DataView(bytes.buffer)
  header.setUint16(2, 1, true)
  header.setUint16(4, 1, true)
  bytes[6] = bytes[7] = size === 256 ? 0 : size
  header.setUint16(10, 1, true)
  header.setUint16(12, 32, true)
  header.setUint32(14, pngBytes.length, true)
  header.setUint32(18, 22, true)
  bytes.set(pngBytes, 22)
  return new Blob([bytes], { type: 'image/x-icon' })
}

/**
 * 从裁剪画布生成指定格式和尺寸的结果，下载名称始终与结果本身绑定。
 * @param source 已裁剪的源画布，函数不会修改它。
 * @param format PNG 或 ICO；单尺寸 PNG 直接下载，多尺寸 PNG 与 ICO 使用 ZIP。
 * @param selectedSizes 用户选择的尺寸，调用开始时复制、去重并排序。
 * @returns 可下载 Blob、真实文件名与本次生成的格式和尺寸快照。
 */
export async function createFaviconExport(
  source: HTMLCanvasElement,
  format: FaviconOutputFormat,
  selectedSizes: readonly number[]
): Promise<FaviconExportResult> {
  const sizes = [...new Set(selectedSizes)].sort((a, b) => a - b)
  if (format !== 'png' && format !== 'ico') throw new Error('请选择 PNG 或 ICO 格式')
  if (!sizes.length || sizes.some(size => !(FAVICON_OUTPUT_SIZES as readonly number[]).includes(size))) {
    throw new Error('请选择有效的图标尺寸')
  }
  const entries: { name: string; blob: Blob }[] = []
  for (const size of sizes) {
    const png = await resizeFaviconPng(source, size)
    entries.push({ name: `favicon-${size}x${size}.${format}`, blob: format === 'png' ? png : await pngToIco(png, size) })
  }
  if (format === 'png' && entries.length === 1) {
    return { blob: entries[0].blob, filename: entries[0].name, format, sizes, isArchive: false }
  }
  const zip = new JSZip()
  for (const entry of entries) zip.file(entry.name, await entry.blob.arrayBuffer())
  const blob = await zip.generateAsync({ type: 'blob' })
  return { blob, filename: `favicons-${format}.zip`, format, sizes, isArchive: true }
}
