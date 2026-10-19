import { describe, expect, it } from 'vitest'
import { parsePdfPageRanges } from './pdfPageRanges'

describe('PDF 页码完整校验', () => {
  it('支持单页、范围、中文逗号及边界页', () => {
    expect(parsePdfPageRanges('1-3， 5, 8-10', 10)).toEqual([[1, 2, 3], [5], [8, 9, 10]])
    expect(parsePdfPageRanges('1', 1)).toEqual([[1]])
  })
  it.each(['1abc', '1.5', '1-2-3', '1,,2', '', '0', '-1', '2-1', '1-11', '11', '9007199254740993'])('拒绝非法或越界输入 %j，不静默改成其他页', (value) => {
    expect(() => parsePdfPageRanges(value, 10)).toThrow()
  })
})
