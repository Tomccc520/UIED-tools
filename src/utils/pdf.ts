let pdfjsRuntimePromise: Promise<typeof import('pdfjs-dist')> | null = null
let pdfLibRuntimePromise: Promise<typeof import('pdf-lib')> | null = null

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
 * 按需加载 PDF.js 运行时
 * 首次调用时完成动态导入并配置 worker 地址，后续复用缓存 Promise
 */
export const ensurePdfjsRuntime = async () => {
  if (!pdfjsRuntimePromise) {
    pdfjsRuntimePromise = (async () => {
      const pdfjsLib = await import('pdfjs-dist')
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
      return pdfjsLib
    })()
  }

  return pdfjsRuntimePromise
}

/**
 * 按需加载 PDF-Lib 运行时
 * 仅在执行合并/拆分/编辑时动态加载，避免首次进入页面时解析大依赖
 */
export const ensurePdfLibRuntime = async () => {
  if (!pdfLibRuntimePromise) {
    pdfLibRuntimePromise = import('pdf-lib')
  }
  return pdfLibRuntimePromise
}

/**
 * 兼容旧调用方的 worker 预热方法
 * 内部改为异步预加载，不再通过静态导入触发 pdfjs-dist 进入首屏链路
 */
export const setupPdfWorker = () => {
  void ensurePdfjsRuntime()
}
