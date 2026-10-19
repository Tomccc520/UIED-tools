/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { describe, expect, it, vi } from 'vitest'
import { numberToChinese } from './string'

// 数值测试不涉及剪贴板，隔离该依赖的 CommonJS/ESM 包装。
vi.mock('vue-clipboard3', () => ({ default: vi.fn() }))

describe('中文数字大写的四位分组', () => {
  it.each([
    [0, '零'], [10, '壹拾'], [100000, '壹拾万'], [1000000, '壹佰万'],
    [100001, '壹拾万零壹'], [100010000, '壹亿零壹万'],
    [1000000000000, '壹万亿'], [100000001, '壹亿零壹'],
    [100100010, '壹亿零壹拾万零壹拾'], [100100000, '壹亿零壹拾万'],
    [1000100010001, '壹万亿零壹亿零壹万零壹'],
    [9999999999999, '玖万亿玖仟玖佰玖拾玖亿玖仟玖佰玖拾玖万玖仟玖佰玖拾玖']
  ])('%s 转为 %s', (input, expected) => {
    expect(numberToChinese(input)).toBe(expected)
  })

  it.each([-1, 1.5, NaN, Infinity, 10000000000000])('拒绝超出页面范围或非整数：%s', (input) => {
    expect(() => numberToChinese(input)).toThrow()
  })

  it.each(['', ' ', '1.5', '1e3', '123abc', '-1', '10000000000000'])('拒绝不完整的数字输入：%j', (input) => {
    expect(() => numberToChinese(input)).toThrow()
  })

  it('字符串零和带前导零的整数也能正确转换', () => {
    expect(numberToChinese('0')).toBe('零')
    expect(numberToChinese('000100001')).toBe('壹拾万零壹')
  })
})
