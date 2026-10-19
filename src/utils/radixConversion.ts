/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */

export type IntegerRadix = 'bin' | 'oct' | 'dec' | 'hex'

const radixRules = {
  bin: { pattern: /^[+-]?[01]+$/, prefix: '0b', name: '二进制', digits: '0、1' },
  oct: { pattern: /^[+-]?[0-7]+$/, prefix: '0o', name: '八进制', digits: '0–7' },
  dec: { pattern: /^[+-]?\d+$/, prefix: '', name: '十进制', digits: '0–9' },
  hex: { pattern: /^[+-]?[0-9a-f]+$/i, prefix: '0x', name: '十六进制', digits: '0–9、A–F' }
} as const

/**
 * 校验完整的有符号整数字符串，再使用 BigInt 返回四种进制结果，避免大整数经过 Number 丢失精度。
 * @param input 用户输入的整数，允许首尾空白及正负号，不接受小数或进制前缀。
 * @param radix 输入整数使用的进制。
 * @returns 二、八、十、十六进制的精确字符串。
 */
export function convertIntegerRadix(input: string, radix: IntegerRadix): Record<IntegerRadix, string> {
  const value = input.trim()
  const rule = radixRules[radix]
  if (!value) throw new Error(`请输入${rule.name}整数`)
  if (!rule.pattern.test(value)) {
    throw new Error(`${rule.name}输入无效，仅支持 ${rule.digits} 和开头的正负号，不支持小数`)
  }

  const negative = value.startsWith('-')
  const digits = value.replace(/^[+-]/, '')
  const magnitude = BigInt(`${rule.prefix}${digits}`)
  const integer = negative ? -magnitude : magnitude
  return {
    bin: integer.toString(2),
    oct: integer.toString(8),
    dec: integer.toString(10),
    hex: integer.toString(16)
  }
}
