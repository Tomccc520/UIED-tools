/**
 * @description SQL 工具真实 Chrome 回归，可通过 UIED_SQL_SMOKE_BASE_URL 指向生产构建预览。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'

const baseUrl = (process.env.UIED_SQL_SMOKE_BASE_URL || 'http://localhost:5179').replace(/\/+$/, '')
const screenshotDirectory = process.env.UIED_SQL_SMOKE_SCREENSHOTS

/** 等待真实 SQL 结果框满足指定结果，兼容工具门禁异步处理。 */
async function waitForOutput(page, expected) {
  await page.waitForFunction((value) => document.querySelector('#sql-output')?.value === value, expected)
  assert.equal(await page.getByLabel('格式化结果', { exact: true }).inputValue(), expected)
}

/** 在给定宽度点击格式化、压缩及复制按钮，核对字面量、注释和错误保护。 */
async function verifyTool(page, width) {
  await page.setViewportSize({ width, height: 1000 })
  await page.goto(`${baseUrl}/tools/dev/sql-format`, { waitUntil: 'networkidle' })
  const input = page.getByLabel('输入 SQL', { exact: true })
  const output = page.getByLabel('格式化结果', { exact: true })
  const formatButton = page.getByRole('button', { name: '格式化 SQL', exact: true })
  const compressButton = page.getByRole('button', { name: '压缩 SQL', exact: true })
  for (const literal of ["'a--b'", "'a  b'", "'/*keep*/'", String.raw`'it\'s /*still*/  text'`, "'it''s -- still  text'", '"a--b  from"', '"a""b"']) {
    const source = `SELECT ${literal} AS value;`
    await input.fill(source)
    await formatButton.click()
    await page.waitForFunction((value) => {
      const result = document.querySelector('#sql-output')?.value || ''
      return result.startsWith('SELECT\n') && result.includes(value)
    }, literal)
    assert.ok((await output.inputValue()).includes(literal), `${width}px 格式化改变字面量 ${literal}`)
    await compressButton.click()
    await waitForOutput(page, source)
    assert.equal(await input.inputValue(), source)
  }

  const comments = "SELECT  1; -- comment ' )\n SELECT /*+ INDEX(users idx_id) */ 'a  b';"
  const compressedComments = "SELECT 1; -- comment ' )\nSELECT /*+ INDEX(users idx_id) */ 'a  b';"
  await input.fill(comments)
  await compressButton.click()
  await waitForOutput(page, compressedComments)
  await page.getByRole('button', { name: '复制结果', exact: true }).click()
  await page.waitForFunction((expected) => navigator.clipboard.readText().then((value) => value === expected), compressedComments)

  for (const [source, message] of [
    ["SELECT 'unterminated", '引号未闭合'],
    ['SELECT 1 /* unterminated', '块注释未闭合'],
    ['SELECT (1;', '括号不匹配'],
    ['SELECT $tag$text$tag$;', 'SQL 解析失败'],
    ['/* sql-formatter-disable */ SELECT $$a  b$$;', '格式化控制注释暂不支持'],
    ['SELECT 1; /*sql-formatter-enable*/', '格式化控制注释暂不支持'],
    ["SELECT q'[a '   b ' c]' FROM dual;", '暂不支持 Oracle q/nq'],
    ["SELECT NQ'[a '   b ' c]' FROM dual;", '暂不支持 Oracle q/nq'],
    ["SELECT '''a '   b ' c''' AS value;", '三引号存在方言歧义'],
    ['SELECT """a "   b " c""" AS value;', '三引号存在方言歧义'],
    ['   ', '请先输入 SQL']
  ]) {
    for (const button of [formatButton, compressButton]) {
      await input.fill(source)
      await button.click()
      await page.locator('#sql-error[role="alert"]').filter({ hasText: message }).waitFor()
      assert.equal(await input.inputValue(), source)
      assert.equal(await output.inputValue(), compressedComments)
    }
  }

  await input.fill("SELECT 'a--b' AS value;")
  await compressButton.focus()
  await page.keyboard.press('Enter')
  await waitForOutput(page, "SELECT 'a--b' AS value;")
  assert.equal(await page.locator('#sql-error').count(), 0)
  await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth)
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px 页面横向溢出`)
  if (screenshotDirectory) {
    await page.evaluate(() => scrollTo(0, 0))
    await page.screenshot({ path: `${screenshotDirectory}/sql-format-${width}.png`, fullPage: true })
  }
}

/** 使用本机 Google Chrome 运行桌面和窄屏回归，最终释放浏览器资源。 */
async function main() {
  if (screenshotDirectory) await mkdir(screenshotDirectory, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    for (const width of [320, 1440]) await verifyTool(page, width)
    assert.deepEqual(errors, [])
    console.log('SQL Chrome 回归通过：320/1440px，字面量与转义、引号标识符、注释、复制、键盘操作、错误保留及横向布局。')
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
