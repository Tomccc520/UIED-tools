/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import * as UPNG from 'upng-js'
import {
  PNG_COMPRESSION_MAX_PIXELS,
  PngCompressionError,
  type PngCompressionColors,
  type PngCompressionMode,
} from './pngCompressionProtocol'

interface PngChunk {
  type: string
  start: number
  end: number
}

interface PngInformation {
  width: number
  height: number
  depth: number
  colorType: number
  interlaced: boolean
  chunks: PngChunk[]
}

interface DecodedPng {
  width: number
  height: number
  depth: number
  ctype: number
  data: Uint8Array
}

const codec = UPNG as unknown as {
  decode(buffer: ArrayBuffer): DecodedPng
  toRGBA8(decoded: DecodedPng): ArrayBuffer[]
  encode(buffers: ArrayBuffer[], width: number, height: number, colors: number, delays?: number[], forbidPalette?: boolean): ArrayBuffer
}
const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10]
const COLOR_DEPTHS: Record<number, number[]> = { 0: [1, 2, 4, 8, 16], 2: [8, 16], 3: [1, 2, 4, 8], 4: [8, 16], 6: [8, 16] }
const PRESERVED_CHUNKS = new Set(['iCCP', 'cHRM', 'gAMA', 'sRGB', 'pHYs', 'eXIf'])
const CRC_TABLE = new Uint32Array(256)
for (let value = 0; value < 256; value++) {
  let crc = value
  for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1)
  CRC_TABLE[value] = crc >>> 0
}

/** 校验 PNG 块的 CRC，避免把损坏数据当作成功的压缩结果。 */
function calculateChunkCrc(bytes: Uint8Array, start: number, end: number): number {
  let crc = 0xffffffff
  for (let index = start; index < end; index++) crc = CRC_TABLE[(crc ^ bytes[index]) & 255] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

/** 在分配像素缓冲区前验证 PNG 签名、尺寸、块边界、校验和与动画标记。 */
export function inspectPngBuffer(buffer: ArrayBuffer): PngInformation {
  const bytes = new Uint8Array(buffer)
  if (bytes.length < 45 || PNG_SIGNATURE.some((value, index) => bytes[index] !== value)) throw new PngCompressionError('invalid')
  const view = new DataView(buffer)
  const chunks: PngChunk[] = []
  let width = 0
  let height = 0
  let depth = 0
  let colorType = 0
  let interlaced = false
  let hasImageData = false
  let ended = false
  for (let offset = 8; offset < bytes.length;) {
    if (offset + 12 > bytes.length) throw new PngCompressionError('invalid')
    const length = view.getUint32(offset)
    const end = offset + length + 12
    if (end > bytes.length) throw new PngCompressionError('invalid')
    const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8))
    if (!/^[A-Za-z]{4}$/.test(type)) throw new PngCompressionError('invalid')
    if (type === 'IHDR') {
      if (chunks.length !== 0 || length !== 13) throw new PngCompressionError('invalid')
      width = view.getUint32(offset + 8)
      height = view.getUint32(offset + 12)
      depth = bytes[offset + 16]
      colorType = bytes[offset + 17]
      if (!width || !height || !COLOR_DEPTHS[colorType]?.includes(depth) || bytes[offset + 18] !== 0 || bytes[offset + 19] !== 0 || bytes[offset + 20] > 1) throw new PngCompressionError('invalid')
      if (width * height > PNG_COMPRESSION_MAX_PIXELS) throw new PngCompressionError('too-large')
      interlaced = bytes[offset + 20] === 1
    } else if (chunks.length === 0) throw new PngCompressionError('invalid')
    if (calculateChunkCrc(bytes, offset + 4, end - 4) !== view.getUint32(end - 4)) throw new PngCompressionError('invalid')
    if (type === 'acTL' || type === 'fcTL' || type === 'fdAT') throw new PngCompressionError('animated')
    if (type === 'IDAT' && length > 0) hasImageData = true
    chunks.push({ type, start: offset, end })
    if (type === 'IEND') {
      if (length !== 0 || end !== bytes.length) throw new PngCompressionError('invalid')
      ended = true
      break
    }
    offset = end
  }
  if (!ended || !hasImageData) throw new PngCompressionError('invalid')
  return { width, height, depth, colorType, interlaced, chunks }
}

/** 还原原 PNG 的色彩配置和分辨率信息，并去除编码器自行添加的 sRGB 声明。 */
function preservePngMetadata(source: ArrayBuffer, sourceInfo: PngInformation, encoded: ArrayBuffer): ArrayBuffer {
  const encodedInfo = inspectPngBuffer(encoded)
  const original = new Uint8Array(source)
  const compressed = new Uint8Array(encoded)
  const parts: Uint8Array[] = [compressed.subarray(0, 8)]
  for (const chunk of encodedInfo.chunks) {
    if (PRESERVED_CHUNKS.has(chunk.type)) continue
    parts.push(compressed.subarray(chunk.start, chunk.end))
    if (chunk.type === 'IHDR') {
      for (const originalChunk of sourceInfo.chunks) {
        if (PRESERVED_CHUNKS.has(originalChunk.type)) parts.push(original.subarray(originalChunk.start, originalChunk.end))
      }
    }
  }
  const output = new Uint8Array(parts.reduce((length, part) => length + part.length, 0))
  let offset = 0
  for (const part of parts) {
    output.set(part, offset)
    offset += part.length
  }
  return output.buffer
}

/** 比较解码后的完整 RGBA，包含完全透明像素的 RGB，确保无损模式真实保真。 */
function hasIdenticalPixels(first: ArrayBuffer, second: ArrayBuffer): boolean {
  if (first.byteLength !== second.byteLength) return false
  const source = new Uint8Array(first)
  const result = new Uint8Array(second)
  for (let index = 0; index < source.length; index++) if (source[index] !== result[index]) return false
  return true
}

/** 小图调色板输出可能超过 UPNG 预留长度，必要时改用真彩色编码避免截断文件。 */
function encodeValidPng(rgba: ArrayBuffer, information: PngInformation, colors: number): ArrayBuffer {
  const encoded = codec.encode([rgba], information.width, information.height, colors)
  try {
    inspectPngBuffer(encoded)
    return encoded
  } catch {
    const trueColor = codec.encode([rgba], information.width, information.height, colors, undefined, true)
    inspectPngBuffer(trueColor)
    return trueColor
  }
}

/** 仅供 Worker 使用：保留原尺寸压缩静态 PNG，显式减色之外不改变像素。 */
export function encodePngBuffer(
  buffer: ArrayBuffer,
  mode: PngCompressionMode = 'lossless',
  colors: PngCompressionColors = 256,
): ArrayBuffer {
  if (!['lossless', 'quantized'].includes(mode) || ![32, 64, 128, 256].includes(colors)) throw new PngCompressionError('invalid')
  const information = inspectPngBuffer(buffer)
  try {
    const decoded = codec.decode(buffer)
    if (decoded.width !== information.width || decoded.height !== information.height) throw new PngCompressionError('invalid')
    // UPNG 的高位深、低位灰度和部分交错展开不适合重新编码；无损模式直接保留源文件。
    if (information.depth === 16 || information.interlaced || (information.colorType === 0 && information.depth < 8)) {
      if (mode === 'lossless') return buffer
      throw new PngCompressionError('unsupported-depth')
    }
    const rgba = codec.toRGBA8(decoded)[0]
    if (rgba.byteLength !== information.width * information.height * 4) throw new PngCompressionError('invalid')
    const encoded = encodeValidPng(rgba, information, mode === 'lossless' ? 0 : colors)
    const result = preservePngMetadata(buffer, information, encoded)
    if (mode === 'lossless') {
      const outputPixels = codec.toRGBA8(codec.decode(result))[0]
      if (!hasIdenticalPixels(rgba, outputPixels) || result.byteLength >= buffer.byteLength) return buffer
    }
    return result
  } catch (error) {
    if (error instanceof PngCompressionError) throw error
    throw new PngCompressionError('invalid')
  }
}
