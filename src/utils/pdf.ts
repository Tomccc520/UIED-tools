import * as pdfjsLib from 'pdfjs-dist'

/**
 * 判断文件是否为PDF
 */
export const isPdfFile = (file: File) => {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

/**
 * 校验PDF文件类型与大小
 */
export const getPdfFileError = (file: File, maxSizeMB: number) => {
  if (!isPdfFile(file)) {
    return '仅支持PDF文件'
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `文件大小不能超过${maxSizeMB}MB`
  }
  return ''
}
/**
 * 设置 PDF.js 的 worker 脚本路径
 */
export const setupPdfWorker = () => {
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
}
