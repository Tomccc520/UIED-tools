/**
 * @description 可逆 JSON 字符串编码与只处理 Unicode 转义的文本转换。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */

/**
 * 编码一层 JSON 字符串内容，省略外层双引号；保留反斜杠、换行及原有 Unicode 序列。
 * @param value 未编码原文，不裁剪、不规范化字符
 * @returns 与 decodeJsonStringContent 配对的转义文本
 */
export const encodeJsonStringContent = (value: string): string => JSON.stringify(value).slice(1, -1)

/**
 * 只解码一层 JSON 字符串内容；格式错误直接抛出，调用方不能覆盖原文。
 * @param value 不含外层双引号的 JSON 转义文本
 * @returns 恢复后的原始字符串，不进行二次解码
 */
export const decodeJsonStringContent = (value: string): string => {
  try {
    return JSON.parse(`"${value}"`)
  } catch {
    throw new Error('转义文本格式无效，请检查反斜杠、双引号和控制字符；原文已保留')
  }
}

/**
 * 只解码合法的 Unicode 转义，保留路径、URL、百分号及其他反斜杠文本。
 * @param value 包含 \\uXXXX 或 \\u{码点} 的原文；成对反斜杠及不完整/无效序列原样保留
 * @returns 解码后的文本，UTF-16 代理项只在配对时转换
 */
export const decodeUnicodeEscapes = (value: string): string => {
  let result = ''
  let index = 0
  while (index < value.length) {
    if (value[index] !== '\\') {
      result += value[index++]
      continue
    }
    // 反斜杠对表示字面反斜杠；只尝试解码奇数个连续反斜杠的最后一个。
    const start = index
    while (value[index] === '\\') index++
    const count = index - start
    result += '\\'.repeat(count - count % 2)
    if (count % 2 === 0) continue
    index--
    const remaining = value.slice(index)
    const braced = /^\\u\{([0-9a-fA-F]{1,6})\}/.exec(remaining)
    if (braced) {
      const codePoint = Number.parseInt(braced[1], 16)
      if (codePoint <= 0x10ffff && !(codePoint >= 0xd800 && codePoint <= 0xdfff)) {
        result += String.fromCodePoint(codePoint)
        index += braced[0].length
        continue
      }
    }
    const escaped = /^\\u([0-9a-fA-F]{4})/.exec(remaining)
    if (escaped) {
      const code = Number.parseInt(escaped[1], 16)
      if (code >= 0xd800 && code <= 0xdbff) {
        const next = /^\\u([0-9a-fA-F]{4})/.exec(remaining.slice(6))
        const low = next ? Number.parseInt(next[1], 16) : 0
        if (low >= 0xdc00 && low <= 0xdfff) {
          result += String.fromCodePoint(0x10000 + (code - 0xd800) * 0x400 + low - 0xdc00)
          index += 12
          continue
        }
      } else if (code < 0xdc00 || code > 0xdfff) {
        result += String.fromCharCode(code)
        index += 6
        continue
      }
    }
    result += value[index++]
  }
  return result
}
