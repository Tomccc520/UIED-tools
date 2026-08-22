/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-20
 */

import process from 'node:process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const smokeOrigin = String(process.env.UIED_PERLER_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')

/**
 * 函数说明：断言拼豆页面使用主站 Vue 壳层而非独立页面或 iframe。
 */
const verifyMainSiteShell = async (page, path, options = {}) => {
  await page.goto(`${smokeOrigin}${path}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.perler-react-host', { timeout: 12_000 })

  const pageState = await page.evaluate(() => ({
    hasMainSidebar: Boolean(document.querySelector('.el-aside:first-child .el-scrollbar')),
    hasMainHeader: Boolean(document.querySelector('header')),
    hasMainFooter: Boolean(document.querySelector('footer[role="contentinfo"]')),
    hasLegacyStandaloneShell: Boolean(document.querySelector('.uied-tool-shell')),
    hasIframe: Boolean(document.querySelector('iframe')),
    hasPerlerCanvas: Boolean(document.querySelector('.perler-react-host')),
    hasUploadEntry: document.body.textContent?.includes('点击选择文件') || false,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }))

  assert(pageState.hasMainSidebar, `${path} 未复用主站左侧菜单`)
  assert(pageState.hasMainHeader, `${path} 未复用主站头部`)
  assert(pageState.hasMainFooter, `${path} 未复用主站页脚`)
  assert(pageState.hasPerlerCanvas, `${path} 未挂载拼豆 React 画布`)
  assert(pageState.hasUploadEntry || options.allowRedirect, `${path} 未显示拼豆上传入口`)
  assert(!pageState.hasLegacyStandaloneShell, `${path} 不应保留独立拼豆壳层`)
  assert(!pageState.hasIframe, `${path} 不应使用 iframe`)
  assert(!pageState.overflow, `${path} 在当前视口出现横向溢出`)
}

/**
 * 函数说明：断言拼豆工具同域接入条件，失败时输出可直接定位的发布错误。
 */
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

/**
 * 函数说明：选择本机已安装的 Chrome，避免本地未下载 Playwright 内置浏览器时阻塞检查。
 */
const launchBrowser = async () => {
  try {
    return await chromium.launch({ channel: 'chrome', headless: true })
  } catch {
    return chromium.launch({ headless: true })
  }
}

/**
 * 函数说明：上传主站内置图片并确认裁剪，验证拼豆像素化主链没有因 Vue 宿主迁移而中断。
 */
const verifyPixelationFlow = async (page) => {
  const fixturePath = path.join(ROOT_DIR, 'src/assets/uiedlogo.png')
  await page.locator('.perler-react-host input[type="file"]').setInputFiles(fixturePath)
  await page.getByRole('button', { name: '确认裁剪' }).click()
  await page.waitForSelector('#granularityInput', { timeout: 12_000 })

  const hasPixelatedPreview = await page.evaluate(() => {
    return Boolean(document.querySelector('.perler-react-host canvas'))
  })
  assert(hasPixelatedPreview, '上传图片后未生成拼豆像素画布')
}

/**
 * 函数说明：验证从编辑画布进入专心拼豆模式后仍处于主站路由与主站外壳中。
 */
const verifyFocusModeFlow = async (page) => {
  await page.getByRole('button', { name: '进入专心拼豆模式' }).click()
  await page.getByRole('button', { name: '直接进入（不下载）' }).click()
  await page.waitForURL('**/tools/ai-perler/focus', { timeout: 12_000 })
  await page.waitForSelector('.perler-react-host', { timeout: 12_000 })

  const focusState = await page.evaluate(() => ({
    hasMainSidebar: Boolean(document.querySelector('.el-aside:first-child .el-scrollbar')),
    hasMainHeader: Boolean(document.querySelector('header')),
    hasFocusContent: document.body.textContent?.includes('专心拼豆') || false,
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }))
  assert(focusState.hasMainSidebar && focusState.hasMainHeader, '专心拼豆模式未复用主站菜单或头部')
  assert(focusState.hasFocusContent, '专心拼豆模式内容未加载')
  assert(!focusState.overflow, '专心拼豆模式出现横向溢出')
}

/**
 * 函数说明：检查拼豆工具已作为主站 Vue 路由接入，覆盖桌面与移动端外壳及专心模式回退。
 */
const main = async () => {
  const browser = await launchBrowser()
  try {
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 960 } })
    await verifyMainSiteShell(desktopPage, '/tools/ai-perler')
    await verifyPixelationFlow(desktopPage)
    await verifyFocusModeFlow(desktopPage)

    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true })
    await verifyMainSiteShell(mobilePage, '/tools/ai-perler')

    const focusPage = await browser.newPage({ viewport: { width: 1440, height: 960 } })
    await focusPage.goto(`${smokeOrigin}/tools/ai-perler/focus`, { waitUntil: 'networkidle' })
    await focusPage.waitForTimeout(400)
    assert(
      focusPage.url().startsWith(`${smokeOrigin}/tools/ai-perler`),
      '专心模式缺少拼豆数据时未能回退到主站拼豆首页'
    )
  } finally {
    await browser.close()
  }

  console.log(`拼豆图纸生成器主站集成冒烟通过: ${smokeOrigin}/tools/ai-perler`)
}

main().catch((error) => {
  console.error(`拼豆图纸生成器同域集成冒烟失败: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
