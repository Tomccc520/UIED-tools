/**
 * @description JSON 与 Unicode 真实编辑器回归，验证可逆转换、错误保留及选择性解码。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const baseUrl = (process.env.UIED_TEXT_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')

/** 从实际 CodeMirror 行节点读取文本，包括换行、引号及反斜杠。 */
const readEditor = (page) => page.locator('.cm-content .cm-line').evaluateAll((lines) => lines.map((line) => line.textContent).join('\n'))

/** 等待工具操作及 Vue 更新完成，再断言编辑器内容与期望逐字相同。 */
const waitEditor = async (page, expected) => {
  await page.waitForFunction((text) => [...document.querySelectorAll('.cm-content .cm-line')]
    .map((line) => line.textContent).join('\n') === text, expected)
  assert.equal(await readEditor(page), expected)
}

/** 输入原文并确认编辑器接收完成，避免把异步加载误判为转换故障。 */
const fillEditor = async (page, text) => {
  await page.locator('.cm-content[contenteditable="true"]').fill(text)
  await waitEditor(page, text)
}

/** 验证响应式布局稳定后无横向溢出。 */
const checkWidths = async (page) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth, undefined, { timeout: 4000 })
  }
}

/** 使用真实页面按钮完成往返、错误恢复、复制和 Unicode 精确输出。 */
const main = async () => {
  const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({
    headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }))
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write']
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.goto(`${baseUrl}/tools/json`, { waitUntil: 'networkidle' })
    const original = String.raw`C:\temp\a.txt "引号" \\ \u4e2d` + '\n下一行\t中文😀'
    await fillEditor(page, original)
    await page.getByRole('button', { name: '转义', exact: true }).click()
    await waitEditor(page, JSON.stringify(original).slice(1, -1))
    await page.getByRole('button', { name: '去转义', exact: true }).click()
    await waitEditor(page, original)
    await page.getByRole('button', { name: '复制', exact: true }).click()
    await page.waitForFunction((expected) => navigator.clipboard.readText().then((text) => text === expected), original)

    const invalid = String.raw`C:\temp\a.txt\q`
    await fillEditor(page, invalid)
    await page.getByRole('button', { name: '去转义', exact: true }).click()
    const errorPanel = page.locator('.uied-tool-view [role="alert"]')
    await errorPanel.filter({ hasText: '原文已保留' }).waitFor()
    assert.equal(await readEditor(page), invalid)
    await page.getByRole('button', { name: '转义', exact: true }).click()
    await waitEditor(page, JSON.stringify(invalid).slice(1, -1))
    await errorPanel.waitFor({ state: 'hidden' })
    await page.getByRole('button', { name: '去转义', exact: true }).click()
    await waitEditor(page, invalid)
    await checkWidths(page)

    await page.goto(`${baseUrl}/tools/unicode`, { waitUntil: 'networkidle' })
    const mixed = String.raw`C:\temp\u4e2d 100%25 https://example.com/a%20b \t \uD83D\uDE00 \u{1F600} \\u4e2d`
    const decoded = String.raw`C:\temp中 100%25 https://example.com/a%20b \t 😀 😀 \\u4e2d`
    await fillEditor(page, mixed)
    await page.getByRole('button', { name: 'Unicode转中文', exact: true }).click()
    const output = page.getByPlaceholder('转换结果将在这里显示', { exact: true })
    await page.waitForFunction(({ element, expected }) => element.value === expected, {
      element: await output.elementHandle(), expected: decoded
    })
    assert.equal(await output.inputValue(), decoded)
    assert.equal(await readEditor(page), mixed)
    await checkWidths(page)
    assert.deepEqual(errors, [])
    console.log('文本编码浏览器回归通过：JSON 一层往返及实际复制、错误保留与恢复、Unicode 精确解码、路径/百分号/URL不变、四档宽度。')
  } finally { await browser.close() }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
