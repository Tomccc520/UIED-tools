/**
 * @description 真实 Chrome 回归温度、中文大写、零利率房贷和日历年龄计算。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const baseUrl = (process.env.UIED_CALCULATION_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')
const outputDir = path.resolve('output/playwright/calculation-tools')

/** 等待结果框的实际数值更新，并对浮点温度允许极小计算误差。 */
const expectNumericInput = async (page, locator, expected) => {
  await page.waitForFunction(({ element, expected }) => {
    return element.value.trim() !== '' && Math.abs(Number(element.value) - expected) < 1e-8
  }, { element: await locator.elementHandle(), expected })
}

/** 从带中文标签的结果行获取数值，验证页面没有残留 NaN 或 Infinity。 */
const expectResult = async (page, label, expected) => {
  const row = page.getByText(label, { exact: true }).locator('..')
  await row.getByText(`${expected} 元`, { exact: true }).waitFor()
  assert.doesNotMatch(await page.locator('.uied-tool-view').innerText(), /NaN|Infinity/)
}

/** 核对相关视口页面宽度，并保留桌面截图供检查。 */
const checkWidths = async (page, name) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1050 })
    await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth, undefined, { timeout: 4000 })
  }
  await page.screenshot({ path: path.join(outputDir, `${name}.png`), fullPage: true })
}

/** 通过真实输入和点击验证五个路由的数值、错误输入及日期边界。 */
const main = async () => {
  await fs.mkdir(outputDir, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 }, timezoneId: 'Asia/Shanghai' })
  const page = await context.newPage()
  await page.clock.setFixedTime(new Date('2026-10-19T12:00:00+08:00'))
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.goto(`${baseUrl}/tools/unit`, { waitUntil: 'networkidle' })
    await page.getByRole('tab', { name: '温度', exact: true }).click()
    const temperature = page.getByRole('tabpanel', { name: '温度', exact: true })
    const celsius = temperature.locator('.custom-box-single').filter({ hasText: '摄氏度' }).locator('input')
    for (const [label, value, expected] of [
      ['华氏度', '32', 0], ['华氏度', '212', 100], ['华氏度', '-40', -40],
      ['开氏度', '273.15', 0], ['开氏度', '0', -273.15], ['兰氏度', '491.67', 0]
    ]) {
      const group = temperature.locator('.custom-box-single').filter({ hasText: label })
      await group.locator('input').fill(value)
      await group.getByRole('button', { name: '转换', exact: true }).click()
      await expectNumericInput(page, celsius, expected)
    }
    await temperature.locator('.custom-box-single').filter({ hasText: '摄氏度' }).getByRole('button').click()
    await expectNumericInput(page, temperature.locator('.custom-box-single').filter({ hasText: '华氏度' }).locator('input'), 32)
    await checkWidths(page, 'temperature')
    console.log('温度：32°F、212°F、-40°F、273.15K、0K、兰氏度及往返通过')

    await page.goto(`${baseUrl}/tools/doc/number-chinese`, { waitUntil: 'networkidle' })
    const number = page.getByPlaceholder('请输入数字，最高13位数字', { exact: true })
    const chinese = page.getByPlaceholder('转换结果将在这里显示', { exact: true })
    for (const [input, expected] of [
      ['0', '零'], ['100000', '壹拾万'], ['1000000', '壹佰万'], ['100001', '壹拾万零壹'],
      ['100010000', '壹亿零壹万'], ['1000000000000', '壹万亿']
    ]) {
      await number.fill(input)
      await page.getByRole('button', { name: '转换', exact: true }).click()
      await page.waitForFunction(({ element, expected }) => element.value === expected, { element: await chinese.elementHandle(), expected })
    }
    await number.fill('1.5')
    await page.getByRole('button', { name: '转换', exact: true }).click()
    await page.getByText('请输入最多13位的非负整数，不支持小数或科学计数法', { exact: true }).waitFor()
    assert.equal(await number.inputValue(), '1.5')
    assert.equal(await chinese.inputValue(), '')
    assert.equal(await page.getByRole('button', { name: '复制结果', exact: true }).isDisabled(), true)
    await checkWidths(page, 'number-chinese')
    console.log('中文大写：零、万、亿、万亿、跨组零及非法小数通过')

    await page.goto(`${baseUrl}/tools/calculation/mortgage`, { waitUntil: 'networkidle' })
    const mortgage = page.locator('.uied-tool-view .el-input-number input')
    for (const [index, value] of [[0, '120'], [1, '10'], [2, '0']]) await mortgage.nth(index).fill(value)
    await page.getByRole('button', { name: '开始计算', exact: true }).click()
    await expectResult(page, '首月月供:', '10000.00')
    await expectResult(page, '还款总额:', '1200000.00')
    await expectResult(page, '支付利息:', '0.00')
    await mortgage.nth(0).fill('')
    await page.getByRole('button', { name: '开始计算', exact: true }).click()
    await page.getByText('请输入有效的贷款金额', { exact: true }).waitFor()
    await expectResult(page, '首月月供:', '10000.00')
    await expectResult(page, '还款总额:', '1200000.00')
    await mortgage.nth(0).fill('120')
    await checkWidths(page, 'mortgage')

    await page.goto(`${baseUrl}/tools/calculation/mortgage-rate`, { waitUntil: 'networkidle' })
    const comparison = page.locator('.uied-tool-view .el-input-number input')
    for (const [index, value] of [[0, '120'], [1, '10'], [2, '0'], [3, '0']]) await comparison.nth(index).fill(value)
    await page.getByRole('button', { name: '开始计算', exact: true }).click()
    await expectResult(page, '原月供:', '10000.00')
    await expectResult(page, '新月供:', '10000.00')
    await expectResult(page, '累计节省利息:', '0.00')
    await comparison.nth(2).fill('3')
    await page.getByRole('button', { name: '开始计算', exact: true }).click()
    await expectResult(page, '新月供:', '10000.00')
    await comparison.nth(2).fill('0')
    await comparison.nth(3).fill('3')
    await page.getByRole('button', { name: '开始计算', exact: true }).click()
    await expectResult(page, '原月供:', '10000.00')
    const previousNewMonthly = await page.getByText('新月供:', { exact: true }).locator('..').locator('span').last().innerText()
    await comparison.nth(0).fill('')
    await page.getByRole('button', { name: '开始计算', exact: true }).click()
    await page.getByText('请输入有效的贷款金额', { exact: true }).waitFor()
    await expectResult(page, '原月供:', '10000.00')
    assert.equal(await page.getByText('新月供:', { exact: true }).locator('..').locator('span').last().innerText(), previousNewMonthly)
    await comparison.nth(0).fill('120')
    await checkWidths(page, 'mortgage-rate')
    console.log('房贷：120万元/10年零利率，两侧均零及仅一侧零通过')

    await page.goto(`${baseUrl}/tools/daily/age-calculator`, { waitUntil: 'networkidle' })
    for (const [birth, months] of [['2020-12-15', '70'], ['2026-09-20', '0'], ['2025-10-20', '11']]) {
      await page.locator('input[type=date]').fill(birth)
      await page.getByRole('button', { name: '开始计算', exact: true }).click()
      await page.getByText('个月', { exact: true }).locator('..').getByText(months, { exact: true }).waitFor()
    }
    for (const [day, expected] of [
      ['01-19', '摩羯座'], ['01-20', '水瓶座'], ['01-25', '水瓶座'], ['01-31', '水瓶座'],
      ['02-18', '水瓶座'], ['02-19', '双鱼座'], ['12-21', '射手座'], ['12-22', '摩羯座']
    ]) {
      await page.locator('input[type=date]').fill(`2020-${day}`)
      await page.getByRole('button', { name: '开始计算', exact: true }).click()
      await page.getByText('星座', { exact: true }).locator('..').getByText(expected, { exact: true }).waitFor()
    }
    await checkWidths(page, 'age')
    assert.deepEqual(errors, [])
    console.log(`计算工具 Chrome 回归通过，四档宽度无溢出，页面异常为零。截图：${outputDir}`)
  } finally { await browser.close() }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
