/**
 * @description 图片压缩下载命名与打包条目，保证同名上传不会覆盖结果。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */

interface ImageArchiveSource {
  name: string
  compressedBlob?: Blob
}

/** 为整批图片生成唯一、无目录层级的下载名称，同时避免已有编号文件名发生碰撞。 */
export const createImageArchiveNames = (files: Pick<ImageArchiveSource, 'name'>[]): string[] => {
  const used = new Set<string>()
  return files.map((file) => {
    const safeName = file.name.replace(/[\\/\x00-\x1f]/g, '_') || 'image'
    const dot = safeName.lastIndexOf('.')
    const stem = dot > 0 ? safeName.slice(0, dot) : safeName
    const extension = dot > 0 ? safeName.slice(dot) : ''
    let name = `uied_${safeName}`
    let suffix = 2
    while (used.has(name.toLowerCase())) name = `uied_${stem} (${suffix++})${extension}`
    used.add(name.toLowerCase())
    return name
  })
}

/** 仅为有真实压缩结果的图片建立 ZIP 条目，名称与列表中的独立下载保持一致。 */
export const createImageArchiveEntries = (files: ImageArchiveSource[]): { name: string; blob: Blob }[] => {
  const names = createImageArchiveNames(files)
  return files.flatMap((file, index) => file.compressedBlob ? [{ name: names[index], blob: file.compressedBlob }] : [])
}
