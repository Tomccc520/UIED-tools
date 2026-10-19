/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { describe, expect, it } from 'vitest'
import { compressSqlText, formatSqlText } from './sqlFormatting'

const transforms = [formatSqlText, compressSqlText]

describe.each(transforms)('%s 的 SQL 字面量保护', (transform) => {
  it.each(["'a--b'", "'a  b'", "'/*keep*/'", "'select (a), from where'", "'line 1\n  line 2'"])(
    '原样保留 %s 的内容', (literal) => {
      expect(transform(`SELECT ${literal} AS value;`)).toContain(literal)
    }
  )

  it('保留双写单引号、反斜杠转义以及带注释符号的后续内容', () => {
    const source = String.raw`SELECT 'it''s -- still  text', 'it\'s /* still */  text' AS value;`
    const result = transform(source)
    expect(result).toContain("'it''s -- still  text'")
    expect(result).toContain(String.raw`'it\'s /* still */  text'`)
    expect(result).toMatch(/value/i)
  })

  it.each(["''''", "'''hello'", "'''a'''", "'''a''''b'''"])(
    '仍支持以连续引号开头的标准 SQL 字符串 %s', (literal) => {
      expect(transform(`SELECT ${literal} AS value;`)).toContain(literal)
    }
  )

  it('允许字符串及标识符中出现格式化开关和 Oracle 前缀文本', () => {
    const source = `SELECT '/* sql-formatter-disable */', '/* sql-formatter-enable */', 'q''[a  b]''', "sql-formatter-disable";`
    const result = transform(source)
    expect(result).toContain("'/* sql-formatter-disable */'")
    expect(result).toContain("'/* sql-formatter-enable */'")
    expect(result).toContain("'q''[a  b]'''")
    expect(result).toContain('"sql-formatter-disable"')
  })

  it.each([
    '/* sql-formatter-disable */ SELECT $$a  b$$;',
    '/*sql-formatter-disable*/ SELECT [a  b]; /*sql-formatter-enable*/',
    'SELECT 1; /* sql-formatter-enable */',
    "SELECT q'[a '   b ' c]' AS value FROM dual;",
    "SELECT NQ'[a '   b ' c]' AS value FROM dual;",
    "SELECT '''a '   b ' c''' AS value;",
    'SELECT """a "   b " c""" AS value;'
  ])('安全拒绝会绕过通用词法保护的输入 %j', (source) => {
    expect(() => transform(source)).toThrow(/SQL/)
  })

  it('保留双引号及反引号标识符的空白、关键字和转义', () => {
    const result = transform('SELECT "a--b", "select  from", "a""b", `/*keep*/`, `a  b` FROM "my  table";')
    for (const identifier of ['"a--b"', '"select  from"', '"a""b"', '`/*keep*/`', '`a  b`', '"my  table"']) {
      expect(result).toContain(identifier)
    }
  })

  it('保留注释中的引号与括号，不把它们作为语法处理', () => {
    const result = transform("SELECT 1 /* ' unmatched ( */ AS value; -- comment ' )\nSELECT 2;")
    expect(result).toContain("/* ' unmatched ( */")
    expect(result).toContain("-- comment ' )")
    expect(result).toMatch(/-- comment ' \)\nSELECT/)
  })

  it.each(["SELECT 'unterminated", 'SELECT "unterminated', 'SELECT `unterminated', 'SELECT 1 /* unterminated', 'SELECT (1;', 'SELECT 1);'])(
    '拒绝未闭合或括号不匹配的 SQL %j', (source) => {
      expect(() => transform(source)).toThrow(/SQL/)
    }
  )
})

describe('SQL 格式化和压缩的语法处理', () => {
  it('只提升语法关键字，不修改字面量中的关键字', () => {
    const result = formatSqlText("select 'select from  where' as value from users where id = 1;")
    expect(result).toContain("'select from  where'")
    expect(result).toContain('SELECT\n')
    expect(result).toContain('\nFROM\n')
    expect(result).toContain('\nWHERE\n')
  })

  it('只压缩外部空白，保留行注释换行和相邻字符串换行', () => {
    expect(compressSqlText("  SELECT   'a  b'   AS value;  ")).toBe("SELECT 'a  b' AS value;")
    expect(compressSqlText('SELECT 1; -- keep\n  SELECT 2;')).toBe('SELECT 1; -- keep\nSELECT 2;')
    expect(compressSqlText("SELECT 'a'\n   'b';")).toBe("SELECT 'a'\n'b';")
  })

  it('压缩保留优化器提示和可执行注释', () => {
    expect(compressSqlText(' SELECT /*+ INDEX(users idx_id) */ id FROM users; '))
      .toBe('SELECT /*+ INDEX(users idx_id) */ id FROM users;')
    expect(compressSqlText(' SELECT /*! STRAIGHT_JOIN */ id FROM users; '))
      .toBe('SELECT /*! STRAIGHT_JOIN */ id FROM users;')
  })

  it('拒绝通用 SQL 解析器不支持的内容', () => {
    expect(() => formatSqlText('SELECT $tag$text$tag$;')).toThrow(/SQL 解析失败/)
    expect(() => compressSqlText('SELECT $tag$text$tag$;')).toThrow(/SQL 解析失败/)
  })
})
