/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-20
 */
import { describe, expect, it } from 'vitest'
import { formatJsonLosslessly, minifyJsonLosslessly } from './losslessJson'

describe('JSON 数字 token 无损排版', () => {
  it.each([
    '9007199254740993', '-9007199254740993', '0.123456789012345678901234567890',
    '1e400', '-1e400', '1E+0400', '1e-400', '-0', '-0.000000000000000001',
    '{"id":9007199254740993,"nested":[-9007199254740993,1e400,{"decimal":0.123456789012345678901234567890}]}',
    '[1.2300,0.00000000000000000001,1E+00,true,false,null,"9007199254740993"]'
  ])('两种操作与反复往返均保留原始 token：%s', (source) => {
    for (const indent of [2, 4, '\t']) {
      expect(minifyJsonLosslessly(formatJsonLosslessly(source, indent))).toBe(source)
      expect(minifyJsonLosslessly(source)).toBe(source)
    }
  })

  it('只删除结构空白，保留字符串内空格、路径、转义及 Unicode 序列', () => {
    const compact = String.raw`{"text":"a  b","path":"C:\\temp\\a.txt","escape":"quote\" slash\\ newline\n\t","unicode":"\u4e2d\uD83D\uDE00","braces":"} [ , : { ]"}`
    const input = ' \n\t' + compact.replace(',"path"', ',\n\t"path"') + '\r\n '
    expect(minifyJsonLosslessly(input)).toBe(compact)
    expect(minifyJsonLosslessly(formatJsonLosslessly(input, '\t'))).toBe(compact)
  })

  it('保留重复键、整数样式键的次序和原始字符串转义', () => {
    const compact = String.raw`{"10":9007199254740993,"2":1e400,"id":1,"id":2,"\u0061":"\u0062","__proto__":null}`
    expect(minifyJsonLosslessly(formatJsonLosslessly(compact))).toBe(compact)
  })

  it('正常 JSON 的空格、Tab、空容器排版与常规工具一致', () => {
    const value = { first: [1, true, null, '双引号"和换行\n'], empty: {}, list: [], nested: { a: [false] } }
    const source = JSON.stringify(value)
    for (const indent of [0, 2, 4, '\t']) {
      expect(formatJsonLosslessly(source, indent)).toBe(JSON.stringify(value, null, indent))
    }
  })

  it('很长的整数与深层数组不经过数值转换或递归调用栈', () => {
    const integer = '9'.repeat(10000)
    const source = '['.repeat(3000) + integer + ']'.repeat(3000)
    expect(minifyJsonLosslessly(source)).toBe(source)
  })

  it.each([
    '', ' \n\t', 'undefined', 'NaN', 'Infinity', '-Infinity', '+1', '01', '-01',
    '.1', '1.', '1e', '1e+', '1e-', '--1', '0x10', '1 2', 'truefalse', '{}[]',
    '{', '[', '}', ']', '{"x":}', '{"x" 1}', '{1:2}', '{x:2}', '{"x":1,}',
    '[1,]', '[,1]', '[1 2]', '{"x":1 "y":2}', '{"x":1]', '[1}',
    String.raw`"\x41"`, String.raw`"\u123"`, String.raw`"\u12XZ"`, String.raw`"\v"`,
    '"raw\nline"', '"raw\tvalue"', '"unterminated', '"trailing\\',
    '/* comment */{}', '{"x":1//comment\n}', '\u00a0{}', '\uFEFF{}'
  ])('严格拒绝无效 JSON，不能返回部分内容：%j', (source) => {
    expect(() => formatJsonLosslessly(source)).toThrow(SyntaxError)
    expect(() => minifyJsonLosslessly(source)).toThrow(SyntaxError)
  })

  it('缩进不允许写入非空白字符', () => {
    expect(() => formatJsonLosslessly('{}', 'x')).toThrow('缩进')
    expect(() => formatJsonLosslessly('{}', -1)).toThrow('缩进')
  })
})
