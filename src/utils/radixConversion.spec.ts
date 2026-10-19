/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { describe, expect, it } from 'vitest'
import { convertIntegerRadix, type IntegerRadix } from './radixConversion'

describe('整数进制转换', () => {
  it('超过安全整数范围仍能精确双向转换', () => {
    expect(convertIntegerRadix('9007199254740993', 'dec').hex).toBe('20000000000001')
    expect(convertIntegerRadix('20000000000001', 'hex').dec).toBe('9007199254740993')
  })

  it.each<IntegerRadix>(['bin', 'oct', 'dec', 'hex'])('%s 的零转换为四个零', (radix) => {
    expect(convertIntegerRadix('0', radix)).toEqual({ bin: '0', oct: '0', dec: '0', hex: '0' })
  })

  it('保留负整数的符号并支持大写十六进制', () => {
    expect(convertIntegerRadix('-FF', 'hex')).toEqual({ bin: '-11111111', oct: '-377', dec: '-255', hex: '-ff' })
    expect(convertIntegerRadix('-9007199254740993', 'dec').hex).toBe('-20000000000001')
  })

  it.each<[string, IntegerRadix]>([
    ['102', 'bin'], ['89', 'oct'], ['1G', 'hex'], ['12.5', 'dec'],
    ['1.1', 'bin'], ['', 'dec'], ['   ', 'oct'], ['-', 'hex'], ['12 3', 'dec']
  ])('拒绝不完整或非法输入 %j (%s)', (input, radix) => {
    expect(() => convertIntegerRadix(input, radix)).toThrow()
  })
})
