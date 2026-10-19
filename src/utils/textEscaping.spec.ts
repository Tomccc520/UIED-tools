/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { describe, expect, it } from 'vitest'
import { encodeJsonStringContent, decodeJsonStringContent, decodeUnicodeEscapes } from './textEscaping'

describe('JSON 字符串一层编码', () => {
  it.each([
    String.raw`C:\temp\a.txt`,
    String.raw`{"path":"C:\\temp\\a.txt","escaped":"\\u4e2d"}`,
    '他说："你好"，反斜杠 \\ 和结尾 \\',
    '第一行\r\n第二行\n\t缩进',
    String.raw`\u4e2d \n \t \" \\`,
    '中文😀e\u0301\u2028\u0000',
    ' \n\t ',
    ''
  ])('原文往返不变：%j', (original) => {
    expect(decodeJsonStringContent(encodeJsonStringContent(original))).toBe(original)
  })

  it('仅解码一层，不把原本的字面 Unicode 序列继续转换', () => {
    expect(decodeJsonStringContent(String.raw`\\u4e2d`)).toBe(String.raw`\u4e2d`)
    expect(decodeJsonStringContent(String.raw`\u4e2d`)).toBe('中')
  })

  it.each([String.raw`bad\q`, 'bad\\', 'unescaped "quote"', 'raw\nnewline', String.raw`\u123X`])(
    '拒绝非法转义，不静默删除字符：%j', (input) => {
      expect(() => decodeJsonStringContent(input)).toThrow('原文已保留')
    }
  )
})

describe('只解码 Unicode 转义', () => {
  it('保留路径、URL 和百分号，仅替换目标序列', () => {
    const input = String.raw`C:\temp\u4e2d 100%25 https://example.com/a%20b?q=%u4e2d`
    expect(decodeUnicodeEscapes(input)).toBe(String.raw`C:\temp中 100%25 https://example.com/a%20b?q=%u4e2d`)
  })

  it('支持四位编码、代理项对和合法码点，不修改原有中文', () => {
    expect(decodeUnicodeEscapes(String.raw`中文 \u4e2d\u6587 \uD83D\uDE00 \u{1F600}`)).toBe('中文 中文 😀 😀')
  })

  it.each([String.raw`\u12`, String.raw`\uZZZZ`, String.raw`\uD800`, String.raw`\uDC00`, String.raw`\u{110000}`, String.raw`\u{D800}`, String.raw`\t\n\x41 50%25`])(
    '无效序列或其他转义原样保留：%j', (input) => {
      expect(decodeUnicodeEscapes(input)).toBe(input)
    }
  )

  it('保留成对反斜杠，不能把已转义的 Unicode 文本多解码一层', () => {
    expect(decodeUnicodeEscapes(String.raw`\\u4e2d`)).toBe(String.raw`\\u4e2d`)
    expect(decodeUnicodeEscapes(String.raw`\\\u4e2d`)).toBe(String.raw`\\中`)
  })
})
