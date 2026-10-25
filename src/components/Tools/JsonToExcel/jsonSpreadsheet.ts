/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import { getJsonNumberLiterals } from '@/utils/losslessJson'

type SpreadsheetValue = string | number | boolean | null

/** 将已校验的十进制 token 归一为有效数字及十进制指数，仅比较精确十进制值，不经浮点计算。 */
function normalizeDecimal(raw: string): string {
  const [, sign, integer, fraction = '', exponent = '0'] = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(raw)!
  const digits = (integer + fraction).replace(/^0+/, '')
  if (!digits) return '0'
  const trimmed = digits.replace(/0+$/, '')
  const power = BigInt(exponent) - BigInt(fraction.length) + BigInt(digits.length - trimmed.length)
  return `${sign}${trimmed}e${power}`
}

/** 按 Excel 的 15 位有效数字和数值范围检查，并拒绝 Number 舍入；原始数值不自动改成字符串。 */
function assertSpreadsheetNumber(raw: string): void {
  const value = Number(raw)
  const normalized = normalizeDecimal(raw)
  const significantDigits = normalized.split('e')[0].replace('-', '').length
  const magnitude = Math.abs(value)
  if (!Number.isFinite(value) || Object.is(value, -0) ||
      significantDigits > 15 || magnitude > 9.99999999999999e307 ||
      (magnitude > 0 && magnitude < 2.2251e-308) ||
      normalized !== normalizeDecimal(String(value))) {
    throw new Error('存在无法安全转换的数值，请给长数字或高精度数值加双引号，作为文本导出。')
  }
}

/** 校验对象数组并构建表头与单元格矩阵；嵌套结构写入明确的 JSON 文本，拒绝空表及错误行类型。 */
export function prepareJsonSpreadsheet(source: string): SpreadsheetValue[][] {
  getJsonNumberLiterals(source).forEach(assertSpreadsheetNumber)
  const rows: unknown = JSON.parse(source)
  if (!Array.isArray(rows) || !rows.length || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) {
    throw new Error('JSON 必须是非空对象数组，每一行都应是对象。')
  }
  if (rows.length > 1048575) throw new Error('Excel 最多支持 1048576 行（含表头），请拆分数据后导出。')
  const headers = [...new Set(rows.flatMap(row => Object.keys(row)))]
  if (!headers.length) throw new Error('JSON 对象至少需要包含一个字段，无法导出空表。')
  if (headers.length > 16384) throw new Error('Excel 最多支持 16384 列，请减少字段或拆分数据后导出。')
  return [headers, ...rows.map(row => headers.map(header => {
    const value = Object.prototype.hasOwnProperty.call(row, header) ? row[header] : null
    return value !== null && typeof value === 'object' ? JSON.stringify(value) : value as SpreadsheetValue
  }))]
}
