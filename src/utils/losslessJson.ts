/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-20
 */

interface JsonToken {
  kind: 'string' | 'number' | 'literal' | 'punctuation'
  raw: string
  position: number
}

interface JsonFrame {
  type: 'object' | 'array'
  state: 'keyOrEnd' | 'key' | 'colon' | 'valueOrEnd' | 'value' | 'commaOrEnd'
}

const jsonNumberPattern = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y

/** 在原文位置报告语法错误，数字位置不涉及对 JSON 数值的解释或转换。 */
function syntaxError(position: number, reason: string): never {
  throw new SyntaxError(`第 ${position + 1} 个字符：${reason}`)
}

/** 扫描严格 JSON token，保留数字及字符串的原始片段，不经过 JS Number。 */
function tokenizeJson(source: string): JsonToken[] {
  const tokens: JsonToken[] = []
  let position = 0
  while (position < source.length) {
    const character = source[position]
    if (/[ \t\r\n]/.test(character)) { position++; continue }
    const start = position
    if ('{}[]:,'.includes(character)) {
      tokens.push({ kind: 'punctuation', raw: character, position: start })
      position++
      continue
    }
    if (character === '"') {
      position++
      let closed = false
      while (position < source.length) {
        const current = source[position]
        if (current === '"') { position++; closed = true; break }
        if (current === '\\') {
          position++
          const escape = source[position]
          if (escape === 'u') {
            if (!/^[0-9a-fA-F]{4}$/.test(source.slice(position + 1, position + 5))) {
              syntaxError(position, 'Unicode 转义必须包含四位十六进制数字')
            }
            position += 5
          } else {
            if (!escape || !'"\\/bfnrt'.includes(escape)) syntaxError(position, '字符串转义无效')
            position++
          }
          continue
        }
        if (source.charCodeAt(position) < 0x20) syntaxError(position, '字符串不能包含未转义的控制字符')
        position++
      }
      if (!closed) syntaxError(position, '字符串缺少结束双引号')
      tokens.push({ kind: 'string', raw: source.slice(start, position), position: start })
      continue
    }
    if (character === '-' || (character >= '0' && character <= '9')) {
      jsonNumberPattern.lastIndex = position
      const number = jsonNumberPattern.exec(source)
      if (!number) syntaxError(position, '数字格式无效')
      position += number[0].length
      tokens.push({ kind: 'number', raw: number[0], position: start })
      continue
    }
    const literal = ['true', 'false', 'null'].find(value => source.startsWith(value, position))
    if (literal) {
      tokens.push({ kind: 'literal', raw: literal, position: start })
      position += literal.length
      continue
    }
    syntaxError(position, '不是有效的 JSON 内容')
  }
  return tokens
}

/** 使用显式栈校验对象、数组和根值，拒绝尾逗号及多余 token，避免深层递归溢出。 */
function validateStructure(tokens: JsonToken[], sourceLength: number): void {
  const frames: JsonFrame[] = []
  let rootConsumed = false
  for (const token of tokens) {
    const parent = frames[frames.length - 1]
    if (parent?.type === 'object' && (parent.state === 'keyOrEnd' || parent.state === 'key')) {
      if (parent.state === 'keyOrEnd' && token.raw === '}') { frames.pop(); continue }
      if (token.kind !== 'string') syntaxError(token.position, '对象键必须是双引号字符串')
      parent.state = 'colon'
      continue
    }
    if (parent?.state === 'colon') {
      if (token.raw !== ':') syntaxError(token.position, '对象键后缺少冒号')
      parent.state = 'value'
      continue
    }
    if (parent?.state === 'commaOrEnd') {
      const closing = parent.type === 'object' ? '}' : ']'
      if (token.raw === closing) { frames.pop(); continue }
      if (token.raw !== ',') syntaxError(token.position, `缺少逗号或 ${closing}`)
      parent.state = parent.type === 'object' ? 'key' : 'value'
      continue
    }
    if (parent?.type === 'array' && parent.state === 'valueOrEnd' && token.raw === ']') {
      frames.pop()
      continue
    }
    if (!parent && rootConsumed) syntaxError(token.position, '根值之后存在多余内容')
    if (token.kind === 'punctuation' && token.raw !== '{' && token.raw !== '[') {
      syntaxError(token.position, '缺少 JSON 值')
    }
    if (parent) parent.state = 'commaOrEnd'
    else rootConsumed = true
    if (token.raw === '{') frames.push({ type: 'object', state: 'keyOrEnd' })
    else if (token.raw === '[') frames.push({ type: 'array', state: 'valueOrEnd' })
  }
  if (!rootConsumed) syntaxError(sourceLength, '请输入 JSON 内容')
  if (frames.length) syntaxError(sourceLength, 'JSON 内容未结束')
}

/** 将受支持的缩进设置转换为空白；0 表示压缩，不允许注入非 JSON 空白。 */
function indentationUnit(indent: number | string): string {
  if (typeof indent === 'number') {
    if (!Number.isInteger(indent) || indent < 0 || indent > 10) throw new Error('缩进必须是 0 至 10 个空格')
    return ' '.repeat(indent)
  }
  if (!/^[ \t]*$/.test(indent)) throw new Error('缩进只能使用空格或 Tab')
  return indent.slice(0, 10)
}

/**
 * 无损格式化严格 JSON，仅调整 token 之间的空白。
 * @param source JSON 原文，数字、字符串转义、重复键和属性顺序均保持原样。
 * @param indent 空格数或 Tab 字符；0 表示压缩。
 * @returns 已校验的 JSON 文本；语法无效时抛出错误，不返回部分结果。
 */
export function formatJsonLosslessly(source: string, indent: number | string = 2): string {
  const unit = indentationUnit(indent)
  const tokens = tokenizeJson(source)
  validateStructure(tokens, source.length)
  const parts: string[] = []
  let depth = 0
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    const raw = token.raw
    if (token.kind !== 'punctuation') { parts.push(raw); continue }
    if (raw === '{' || raw === '[') {
      parts.push(raw)
      depth++
      if (unit && tokens[index + 1]?.raw !== (raw === '{' ? '}' : ']')) parts.push('\n', unit.repeat(depth))
    } else if (raw === '}' || raw === ']') {
      depth--
      if (unit && tokens[index - 1]?.raw !== (raw === '}' ? '{' : '[')) parts.push('\n', unit.repeat(depth))
      parts.push(raw)
    } else if (raw === ',') {
      parts.push(',')
      if (unit) parts.push('\n', unit.repeat(depth))
    } else if (raw === ':') parts.push(unit ? ': ' : ':')
  }
  return parts.join('')
}

/** 压缩严格 JSON 的结构空白，保留原始数字 token 与字符串内容。 */
export function minifyJsonLosslessly(source: string): string {
  return formatJsonLosslessly(source, 0)
}

/** 校验严格 JSON 并返回原始数字 token，供表格等有数值精度限制的输出在解析前检查；字符串内数字不会被当作数值。 */
export function getJsonNumberLiterals(source: string): string[] {
  const tokens = tokenizeJson(source)
  validateStructure(tokens, source.length)
  return tokens.filter(token => token.kind === 'number').map(token => token.raw)
}
