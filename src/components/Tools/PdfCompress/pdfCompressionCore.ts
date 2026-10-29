/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-29
 */

interface PdfCompressionRuntime {
  callMain: (args: string[]) => number
  FS: {
    writeFile: (path: string, data: Uint8Array) => void
    readFile: (path: string) => Uint8Array
    unlink: (path: string) => void
  }
}

/** 使用已安装的 qpdf 压缩对象和流，保留原页面文字、链接、表单及图片编码。 */
export const compressPdfStructureWithRuntime = (runtime: PdfCompressionRuntime, source: Uint8Array): Uint8Array => {
  const input = '/source.pdf'
  const output = '/compressed.pdf'
  try {
    runtime.FS.writeFile(input, source)
    const exitCode = runtime.callMain([
      input, '--object-streams=generate', '--stream-data=compress', '--recompress-flate', '--compression-level=9', output
    ])
    if (exitCode !== 0 && exitCode !== 3) throw new Error('PDF 压缩失败，请检查文件是否损坏或有打开密码')
    const result = runtime.FS.readFile(output).slice()
    if (!result.length) throw new Error('PDF 压缩没有生成有效文件')
    return result
  } finally {
    for (const file of [input, output]) {
      try { runtime.FS.unlink(file) } catch { /* 不存在的虚拟文件无需清理。 */ }
    }
  }
}
