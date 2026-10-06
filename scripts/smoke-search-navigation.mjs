/**
 * @file smoke-search-navigation.mjs
 * @description 验证首页搜索结果通过点击、Enter 和方向键回车进入工具详情。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-06
 */

import { chromium } from 'playwright'

const baseUrl = String(process.env.UIED_SEARCH_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')
const targetUrl = `${baseUrl}/tools/json`

/**
 * 函数说明：断言条件成立，失败时抛出带交互上下文的错误。
 * @param condition 待验证条件
 * @param message 失败提示
 */
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

/**
 * 函数说明：启动 Playwright 浏览器，优先使用托管浏览器，缺失时回退到 Mac Chrome。
 * @returns 浏览器实例
 */
const launchBrowser = async () => {
  try {
    return await chromium.launch({ headless: true })
  } catch (error) {
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    return chromium.launch({
      headless: true,
      executablePath: chromePath
    }).catch(() => {
      throw error
    })
  }
}

/**
 * 函数说明：打开搜索浮层并检索 JSON 在线转换工具。
 * @param page Playwright 页面
 */
const openJsonSearch = async (page) => {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '搜索工具' }).click()
  const input = page.locator('.search-input input')
  await input.fill('Json在线转换')
  await page.locator('.instant-result-item').first().waitFor({ state: 'visible', timeout: 10000 })
  const resultText = await page.locator('.instant-result-item').first().innerText()
  assert(resultText.includes('Json在线转换'), `搜索首条结果不是 Json在线转换：${resultText}`)
  return input
}

/**
 * 函数说明：验证点击首条结果后进入 JSON 工具详情并关闭搜索浮层。
 * @param browser 浏览器实例
 */
const verifyClick = async (browser) => {
  const page = await browser.newPage()
  try {
    await openJsonSearch(page)
    await page.locator('.instant-result-item').first().click()
    await page.waitForURL(targetUrl, { timeout: 10000 })
    assert(!(await page.locator('.search-panel').count()), '点击导航后搜索浮层仍然存在')
  } finally {
    await page.close()
  }
}

/**
 * 函数说明：验证直接按 Enter 后打开首条本地搜索结果。
 * @param browser 浏览器实例
 */
const verifyEnter = async (browser) => {
  const page = await browser.newPage()
  try {
    const input = await openJsonSearch(page)
    await input.press('Enter')
    await page.waitForURL(targetUrl, { timeout: 10000 })
  } finally {
    await page.close()
  }
}

/**
 * 函数说明：验证方向键选中结果后按 Enter 能够完成同页导航。
 * @param browser 浏览器实例
 */
const verifyArrowEnter = async (browser) => {
  const page = await browser.newPage()
  try {
    const input = await openJsonSearch(page)
    await input.press('ArrowDown')
    await input.press('Enter')
    await page.waitForURL(targetUrl, { timeout: 10000 })
  } finally {
    await page.close()
  }
}

/**
 * 函数说明：验证点击搜索浮层空白遮罩可以关闭面板。
 * @param browser 浏览器实例
 */
const verifyBackdropClose = async (browser) => {
  const page = await browser.newPage()
  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: '搜索工具' }).click()
    await page.locator('.search-mask').click({ position: { x: 8, y: 8 } })
    await page.locator('.search-panel').waitFor({ state: 'detached', timeout: 5000 })
  } finally {
    await page.close()
  }
}

/**
 * 函数说明：运行搜索导航三组浏览器回归并输出结果。
 */
const main = async () => {
  const browser = await launchBrowser()
  try {
    await verifyClick(browser)
    await verifyEnter(browser)
    await verifyArrowEnter(browser)
    await verifyBackdropClose(browser)
    console.log('✅ 搜索交互冒烟通过：点击、Enter、方向键回车导航，空白遮罩关闭')
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(`❌ 搜索导航冒烟失败：${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
