import { ensurePdfLibRuntime } from '@/utils/pdf'

export type ImagePdfPageSize = 'original' | 'a4-portrait' | 'a4-landscape'

/** 将选定图片按传入顺序嵌入 PDF；原始页按 96 像素/英寸排版，A4 页面保持比例并居中。 */
export async function buildImagePdf(files: readonly File[], pageSize: ImagePdfPageSize): Promise<Blob> {
  const { PDFDocument, PageSizes } = await ensurePdfLibRuntime()
  const pdf = await PDFDocument.create()
  for (const file of files) {
    const bytes = await file.arrayBuffer()
    const image = file.type === 'image/png' ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes)
    let pageWidth = image.width * 72 / 96
    let pageHeight = image.height * 72 / 96
    if (pageSize === 'a4-portrait') [pageWidth, pageHeight] = PageSizes.A4
    if (pageSize === 'a4-landscape') [pageHeight, pageWidth] = PageSizes.A4
    const page = pdf.addPage([pageWidth, pageHeight])
    const { width, height } = image.scaleToFit(pageWidth, pageHeight)
    page.drawImage(image, { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height })
  }
  return new Blob([await pdf.save() as BlobPart], { type: 'application/pdf' })
}
