/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { format } from 'sql-formatter'

type SqlTokenKind = 'text' | 'whitespace' | 'literal' | 'identifier' | 'lineComment' | 'blockComment'
interface SqlToken { kind: SqlTokenKind; raw: string }

/** 判断单个字符是否为 SQL 空白，供词法扫描使用，不处理字面量内容。 */
function isWhitespace(character: string): boolean {
  return /\s/u.test(character)
}

/** 扫描一个完整的引号 token，支持双写引号及单引号内的反斜杠转义，返回结束位置。 */
function readQuotedToken(source: string, start: number): number {
  const quote = source[start]
  // 三引号也可能是标准 SQL 的双写引号；只有普通扫描会提前结束时才拒绝方言歧义。
  const tripleClose = quote !== '`' && source.startsWith(quote.repeat(3), start)
    ? source.indexOf(quote.repeat(3), start + 3)
    : -1
  let cursor = start + 1
  while (cursor < source.length) {
    if (quote === "'" && source[cursor] === '\\') {
      cursor += 2
    } else if (source[cursor] === quote) {
      if (source[cursor + 1] === quote) cursor += 2
      else {
        if (tripleClose !== -1 && cursor + 1 < tripleClose + 3) {
          throw new Error('SQL 三引号存在方言歧义，请先转换为通用 SQL。')
        }
        return cursor + 1
      }
    } else cursor++
  }
  throw new Error('SQL 引号未闭合，请检查字符串或带引号的标识符。')
}

/** 检查当前位置是否为通用 SQL 不支持的 Oracle q/nq 字符串前缀，只检查语法区。 */
function hasOracleQuotedPrefix(source: string, cursor: number): boolean {
  if (cursor > 0 && /[\p{L}\p{N}_$]/u.test(source[cursor - 1])) return false
  return source.slice(cursor, cursor + 2).toUpperCase() === "Q'"
    || source.slice(cursor, cursor + 3).toUpperCase() === "NQ'"
}

/** 拒绝会让依赖跳过词法分析的控制注释；字符串里的同名文本不会进入此检查。 */
function assertSupportedBlockComment(body: string): void {
  const directive = body.trim().toLowerCase()
  if (directive === 'sql-formatter-disable' || directive === 'sql-formatter-enable') {
    throw new Error('SQL 格式化控制注释暂不支持，请移除 sql-formatter-disable/enable 后重试。')
  }
}

/**
 * 按状态扫描 SQL 为原文 token，并检查引号、注释和括号是否闭合。
 * 注释与字面量独立扫描，内容中的空白、括号和注释符号均不会被当作 SQL 语法。
 */
function tokenizeSql(source: string): SqlToken[] {
  const tokens: SqlToken[] = []
  let cursor = 0
  let parentheses = 0
  while (cursor < source.length) {
    const start = cursor
    const character = source[cursor]
    let kind: SqlTokenKind = 'text'
    if (isWhitespace(character)) {
      kind = 'whitespace'
      while (cursor < source.length && isWhitespace(source[cursor])) cursor++
    } else if (hasOracleQuotedPrefix(source, cursor)) {
      throw new Error('SQL 暂不支持 Oracle q/nq 引号，请先转换为通用 SQL。')
    } else if (character === "'" || character === '"' || character === '`') {
      kind = character === "'" ? 'literal' : 'identifier'
      cursor = readQuotedToken(source, cursor)
    } else if (source.startsWith('--', cursor)) {
      kind = 'lineComment'
      cursor += 2
      while (cursor < source.length && source[cursor] !== '\n' && source[cursor] !== '\r') cursor++
    } else if (source.startsWith('/*', cursor)) {
      kind = 'blockComment'
      const end = source.indexOf('*/', cursor + 2)
      if (end === -1) throw new Error('SQL 块注释未闭合，请补充 */。')
      assertSupportedBlockComment(source.slice(cursor + 2, end))
      cursor = end + 2
    } else {
      if (character === '(') parentheses++
      if (character === ')') {
        parentheses--
        if (parentheses < 0) throw new Error('SQL 括号不匹配，请检查括号是否闭合。')
      }
      cursor++
    }
    tokens.push({ kind, raw: source.slice(start, cursor) })
  }
  if (parentheses !== 0) throw new Error('SQL 括号不匹配，请检查括号是否闭合。')
  return tokens
}

/** 使用 SQL Formatter 的词法分析和语法解析格式化通用 SQL，不支持的语法抛出中文错误。 */
function parseAndFormatSql(source: string): string {
  try {
    return format(source, { language: 'sql', keywordCase: 'upper', tabWidth: 2 })
  } catch {
    throw new Error('SQL 解析失败，请检查语法；当前支持通用 SQL，不支持存储过程或方言专有语法。')
  }
}

/** 获取字面量及带引号标识符的原始 token，用于核对格式化前后没有修改其内容。 */
function getQuotedValues(tokens: SqlToken[]): string[] {
  return tokens.filter((token) => token.kind === 'literal' || token.kind === 'identifier').map((token) => token.raw)
}

/** 格式化通用 SQL；返回排版后的结果，任何解析错误或引号内容变化均抛出错误。 */
export function formatSqlText(source: string): string {
  const quotedValues = getQuotedValues(tokenizeSql(source))
  const formatted = parseAndFormatSql(source)
  const formattedValues = getQuotedValues(tokenizeSql(formatted))
  if (quotedValues.length !== formattedValues.length || quotedValues.some((value, index) => value !== formattedValues[index])) {
    throw new Error('SQL 格式化无法完整保留引号内容，请检查所用 SQL 方言。')
  }
  return formatted
}

/**
 * 压缩 SQL token 之间的空白，原样保留字面量、标识符及所有注释。
 * 行注释后保留换行，避免吞掉后续语句；字符串间的换行也保留，避免改变隐式字符串连接语义。
 */
export function compressSqlText(source: string): string {
  const tokens = tokenizeSql(source)
  parseAndFormatSql(source)
  let compressed = ''
  let lastCodeKind: SqlTokenKind | undefined
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    if (token.kind === 'whitespace') {
      if (!compressed || index === tokens.length - 1) continue
      const afterLineComment = tokens[index - 1]?.kind === 'lineComment'
      const betweenLiterals = lastCodeKind === 'literal' && tokens[index + 1]?.kind === 'literal'
      compressed += afterLineComment || (betweenLiterals && /[\r\n]/u.test(token.raw)) ? '\n' : ' '
    } else {
      compressed += token.raw
      if (token.kind !== 'lineComment' && token.kind !== 'blockComment') lastCodeKind = token.kind
    }
  }
  return compressed
}
