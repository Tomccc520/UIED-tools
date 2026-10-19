/**
 * 严格解析 PDF 页码，禁止静默截断非法输入或修改越界页码。
 * @param value 逗号分隔的页码或递增范围，支持中文逗号
 * @param totalPages 文档实际页数
 * @returns 每个范围对应的从 1 开始的页码组
 */
export const parsePdfPageRanges = (value: string, totalPages: number): number[][] => {
  if (!Number.isSafeInteger(totalPages) || totalPages < 1) throw new Error('PDF 页数无效')
  if (!value.trim()) throw new Error('请输入页面范围')
  return value.split(/[,，]/).map((part) => {
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(part.trim())
    if (!match) throw new Error('页面范围格式无效，请使用 1-3, 5 这样的格式')
    const start = Number(match[1])
    const end = Number(match[2] || match[1])
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end > totalPages) {
      throw new Error(`页码必须在 1-${totalPages} 之间`)
    }
    if (start > end) throw new Error('页面范围的起始页不能大于结束页')
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  })
}
