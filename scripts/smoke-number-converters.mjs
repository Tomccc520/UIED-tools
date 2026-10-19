/**
 * @description 进制与时间戳转换浏览器回归，验证精度、非法输入、独立单位及复制结果。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const baseUrl = (process.env.UIED_NUMBER_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')

/** 函数说明：等待 Vue 和工具操作门禁处理完成，再断言实际输入框的结果。 */
const waitInputValue = async (page, input, value) => {
  await page.waitForFunction(({ element, expected }) => element.value === expected, {
    element: await input.elementHandle(), expected: value
  })
  assert.equal(await input.inputValue(), value)
}

/** 函数说明：按指定输入框触发对应进制转换，避免选中其他转换按钮。 */
const convertRadix = async (page, placeholder, value) => {
  const input = page.getByPlaceholder(placeholder, { exact: true })
  await input.fill(value)
  await input.locator('xpath=ancestor::div[contains(@class,"el-input-group")]')
    .getByRole('button', { name: '转换', exact: true }).click()
}

/** 函数说明：选择上、下半区的实际 Element Plus 单位选项。 */
const selectUnit = async (page, index, label) => {
  const select = page.locator('.uied-tool-view .el-select').nth(index)
  const controls = await select.getByRole('combobox').getAttribute('aria-controls')
  assert.ok(controls, '单位选择器缺少关联的选项列表')
  await select.click()
  await page.locator(`[id="${controls}"]`).getByRole('option', { name: label, exact: true }).click()
  await page.locator(`[id="${controls}"]`).waitFor({ state: 'hidden' })
}

/** 函数说明：等待响应式侧栏及浮层收起，再核对视口范围内的实际页面宽度。 */
const assertNoOverflow = async (page, label, width) => {
  await page.setViewportSize({ width, height: 1000 })
  await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth, undefined, { timeout: 3000 })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} ${width}px 横向溢出`)
}

/** 函数说明：通过真实点击及系统剪贴板验证单位往返，所有浏览器资源在结束时释放。 */
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
    await page.goto(`${baseUrl}/tools/scaletran`, { waitUntil: 'networkidle' })
    const hex = page.getByPlaceholder('请输入十六进制数', { exact: true })
    await convertRadix(page, '请输入十进制数', '9007199254740993')
    await waitInputValue(page, hex, '20000000000001')
    await convertRadix(page, '请输入十进制数', '-255')
    await waitInputValue(page, hex, '-ff')
    await convertRadix(page, '请输入十进制数', '0')
    await waitInputValue(page, hex, '0')
    for (const [placeholder, value, message] of [
      ['请输入二进制数', '102', '二进制输入无效'],
      ['请输入八进制数', '89', '八进制输入无效'],
      ['请输入十六进制数', '1G', '十六进制输入无效'],
      ['请输入十进制数', '1.5', '十进制输入无效'],
      ['请输入十进制数', '', '请输入十进制整数']
    ]) {
      await convertRadix(page, placeholder, value)
      await page.locator('.uied-tool-view [role="alert"]').filter({ hasText: message }).waitFor()
    }
    for (const width of [320, 375, 768, 1440]) {
      await assertNoOverflow(page, '进制页', width)
    }

    await page.goto(`${baseUrl}/tools/dev/timestamp-converter`, { waitUntil: 'networkidle' })
    await page.getByPlaceholder('YYYY-MM-DD HH:mm:ss', { exact: true }).fill('2024-01-02 03:04:05')
    const output = page.getByLabel('日期转换结果', { exact: true })
    const seconds = await output.inputValue()
    assert.match(seconds, /^\d{10}$/)
    const milliseconds = (BigInt(seconds) * 1000n).toString()
    // 上半区的单位变化不得改变下半区的数值和标签。
    await selectUnit(page, 0, '毫秒(ms)')
    await waitInputValue(page, output, seconds)
    assert.ok((await page.locator('.uied-tool-view .el-select').nth(1).innerText()).includes('秒(s)'))
    await selectUnit(page, 1, '毫秒(ms)')
    await waitInputValue(page, output, milliseconds)
    const copyButton = output.locator('xpath=ancestor::div[contains(@class,"flex-1")]').getByRole('button')
    await copyButton.click()
    await page.waitForFunction((value) => navigator.clipboard.readText().then((text) => text === value), milliseconds)
    await selectUnit(page, 1, '秒(s)')
    await waitInputValue(page, output, seconds)
    await copyButton.click()
    await page.waitForFunction((value) => navigator.clipboard.readText().then((text) => text === value), seconds)
    for (const width of [320, 375, 768, 1440]) {
      await assertNoOverflow(page, '时间戳页', width)
    }
    assert.deepEqual(errors, [])
    console.log('数值转换浏览器回归通过：大整数、负数、零、五组非法输入、独立单位、秒/毫秒往返与复制、四档宽度。')
  } finally { await browser.close() }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
