/**
 * @file smoke-frontend-mobile-visual.mjs
 * @description 前台移动端 Playwright 可视冒烟，检查首页、热榜、登录开关和弹窗关键布局
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-09
 */

import net from 'node:net'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium } from 'playwright'

const projectRoot = process.cwd()
const host = '127.0.0.1'
const mobileViewport = { width: 390, height: 844 }
const systemBrowserCandidates = [
  {
    name: 'Google Chrome',
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  },
  {
    name: 'Microsoft Edge',
    executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
  },
  {
    name: 'Chromium',
    executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium'
  }
]
const mockToolRankingItems = [
  {
    rank: 1,
    toolKey: 'ai-ocr',
    toolTitle: 'OCR 文字识别',
    toolUrl: '/tools/ai/ocr',
    cateTitle: 'AI 工具',
    viewCount: 1880,
    startCount: 520,
    successCount: 486,
    downloadCount: 132,
    score: 98,
    status: 1,
    remark: ''
  },
  {
    rank: 2,
    toolKey: 'ai-image-enhance',
    toolTitle: 'AI 图片增强',
    toolUrl: '/tools/ai/image-enhance',
    cateTitle: '图片处理',
    viewCount: 1560,
    startCount: 430,
    successCount: 402,
    downloadCount: 118,
    score: 92,
    status: 1,
    remark: ''
  },
  {
    rank: 3,
    toolKey: 'remove-watermark',
    toolTitle: '图片去水印',
    toolUrl: '/tools/ai/remove-watermark',
    cateTitle: '图片处理',
    viewCount: 1420,
    startCount: 390,
    successCount: 351,
    downloadCount: 106,
    score: 89,
    status: 1,
    remark: ''
  },
  {
    rank: 4,
    toolKey: 'article-generator',
    toolTitle: 'AI 文章生成器',
    toolUrl: '/tools/ai/article-generator',
    cateTitle: 'AI 写作',
    viewCount: 1260,
    startCount: 352,
    successCount: 331,
    downloadCount: 88,
    score: 84,
    status: 1,
    remark: ''
  },
  {
    rank: 5,
    toolKey: 'image-compress',
    toolTitle: '图片压缩',
    toolUrl: '/tools/image-compress',
    cateTitle: '图片处理',
    viewCount: 980,
    startCount: 280,
    successCount: 274,
    downloadCount: 172,
    score: 78,
    status: 1,
    remark: ''
  },
  {
    rank: 6,
    toolKey: 'qrcode',
    toolTitle: '二维码生成器',
    toolUrl: '/tools/qrcode',
    cateTitle: '开发工具',
    viewCount: 820,
    startCount: 244,
    successCount: 238,
    downloadCount: 160,
    score: 72,
    status: 1,
    remark: ''
  }
]
const consumeApiPatterns = [
  '/api/common/frontend-user/points/consume',
  '/api/user/points/consume',
  '/points/consume'
]

/**
 * 函数说明：获取本地空闲端口，避免可视冒烟干扰用户当前开发服务。
 */
const findFreePort = () => {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.once('error', reject)
    server.listen(0, host, () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      server.close(() => resolve(port))
    })
  })
}

/**
 * 函数说明：等待临时 Vite 服务可访问，避免 Playwright 过早打开页面。
 */
const waitForServerReady = async (baseUrl, serverProcess) => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < 30000) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Vite 服务提前退出，退出码：${serverProcess.exitCode}`)
    }
    try {
      const response = await fetch(baseUrl)
      if (response.ok || response.status < 500) {
        return
      }
    } catch {
      await delay(400)
    }
  }
  throw new Error(`Vite 服务启动超时：${baseUrl}`)
}

/**
 * 函数说明：启动临时 Vite 服务，供移动端可视冒烟独立访问。
 */
const startViteServer = async () => {
  const port = await findFreePort()
  const baseUrl = `http://${host}:${port}`
  const viteBin = path.resolve(projectRoot, 'node_modules/vite/bin/vite.js')
  const serverProcess = spawn(process.execPath, [viteBin, '--host', host, '--port', String(port)], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  })

  let serverOutput = ''
  serverProcess.stdout.on('data', (chunk) => {
    serverOutput += String(chunk)
  })
  serverProcess.stderr.on('data', (chunk) => {
    serverOutput += String(chunk)
  })

  try {
    await waitForServerReady(baseUrl, serverProcess)
  } catch (error) {
    serverProcess.kill('SIGTERM')
    throw new Error(`${error instanceof Error ? error.message : String(error)}\n${serverOutput}`)
  }

  return {
    baseUrl,
    serverProcess
  }
}

/**
 * 函数说明：启动 Chromium 浏览器，托管浏览器缺失时回退到本机 Chrome 或 Edge。
 */
const launchChromiumBrowser = async () => {
  try {
    return await chromium.launch({ headless: true })
  } catch (managedBrowserError) {
    const fallbackBrowser = systemBrowserCandidates.find((browser) => existsSync(browser.executablePath))
    if (!fallbackBrowser) {
      throw managedBrowserError
    }

    try {
      const browser = await chromium.launch({
        headless: true,
        executablePath: fallbackBrowser.executablePath
      })
      console.log(`ℹ️ Playwright 托管 Chromium 不可用，已使用本机浏览器：${fallbackBrowser.name}`)
      return browser
    } catch (fallbackBrowserError) {
      const managedMessage = managedBrowserError instanceof Error ? managedBrowserError.message : String(managedBrowserError)
      const fallbackMessage =
        fallbackBrowserError instanceof Error ? fallbackBrowserError.message : String(fallbackBrowserError)
      throw new Error(
        `Playwright 浏览器启动失败。\n托管 Chromium 错误：${managedMessage}\n本机浏览器回退错误：${fallbackMessage}`
      )
    }
  }
}

/**
 * 函数说明：安装前台移动端可视冒烟的只读接口 mock，降低本地后台状态对视觉回归的影响。
 */
const installFrontendVisualApiMocks = async (page, options = {}) => {
  const loginEnabled = options.loginEnabled !== false
  await page.route('**/api/common/index/config**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        code: 200,
        data: {
          loginEnabled,
          toolsToolRankingEnabled: 1,
          toolsToolRankingPageTitle: '站内工具使用排行榜',
          toolsToolRankingPageDescription: '按站内真实点击量排行，帮助你快速看清当前最受欢迎的工具。',
          toolsToolRankingDefaultPeriod: 'week',
          toolsToolRankingPageLimit: 12,
          toolsToolRankingShowOnSidebar: 1
        }
      })
    })
  })

  await page.route('**/api/common/tool-ranking/list**', async (route) => {
    const requestUrl = new URL(route.request().url())
    const limit = Math.max(1, Number(requestUrl.searchParams.get('limit') || 12) || 12)
    const period = requestUrl.searchParams.get('period') || 'week'
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({
        code: 200,
        data: {
          period,
          sortBy: 'view',
          limit,
          startDate: '2026-06-01',
          endDate: '2026-06-09',
          updatedAt: Date.now(),
          list: mockToolRankingItems.slice(0, limit)
        }
      })
    })
  })
}

/**
 * 函数说明：断言页面没有横向溢出，避免移动端出现左右滚动。
 */
const assertNoHorizontalOverflow = (metrics, context) => {
  if (metrics.scrollWidth > metrics.clientWidth + 1) {
    throw new Error(`${context} 存在横向溢出：scrollWidth=${metrics.scrollWidth}, clientWidth=${metrics.clientWidth}`)
  }
}

/**
 * 函数说明：断言元素没有可见阴影，保持移动端榜单和弹窗的克制视觉。
 */
const assertNoBoxShadow = (boxShadow, context) => {
  const normalizedShadow = String(boxShadow || '').trim()
  if (normalizedShadow && normalizedShadow !== 'none') {
    throw new Error(`${context} 不应出现阴影：${normalizedShadow}`)
  }
}

/**
 * 函数说明：检查首页移动端工具卡片保持两列布局且无横向溢出。
 */
const verifyHomeMobileLayout = async (page, baseUrl) => {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.tool-card', { state: 'visible', timeout: 15000 })
  await page.waitForFunction(() => document.querySelectorAll('.tool-card').length >= 4, { timeout: 15000 })

  const metrics = await page.evaluate(() => {
    const html = document.documentElement
    const grid = document.querySelector('.grid')
    const gridStyle = grid ? window.getComputedStyle(grid) : null
    const cards = Array.from(document.querySelectorAll('.tool-card'))
      .slice(0, 4)
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        }
      })
    return {
      scrollWidth: html.scrollWidth,
      clientWidth: html.clientWidth,
      gridTemplateColumns: gridStyle?.gridTemplateColumns || '',
      gridGap: gridStyle?.gap || '',
      cards
    }
  })

  assertNoHorizontalOverflow(metrics, '首页移动端')
  const columns = metrics.gridTemplateColumns.split(/\s+/).filter(Boolean)
  if (columns.length !== 2) {
    throw new Error(`首页移动端工具卡应为两列，当前 gridTemplateColumns=${metrics.gridTemplateColumns}`)
  }
  if (metrics.cards.length < 4) {
    throw new Error(`首页移动端工具卡数量不足，当前 ${metrics.cards.length} 个`)
  }
  const [firstCard, secondCard, thirdCard] = metrics.cards
  if (!(firstCard.left < secondCard.left && Math.abs(firstCard.top - secondCard.top) <= 4 && thirdCard.top > firstCard.top)) {
    throw new Error(`首页移动端工具卡排列异常：${JSON.stringify(metrics.cards)}`)
  }
  if (firstCard.width < 120 || secondCard.width < 120) {
    throw new Error(`首页移动端工具卡宽度异常：${JSON.stringify(metrics.cards)}`)
  }
}

/**
 * 函数说明：检查热榜移动端无阴影、无横向溢出，前三名展示在单列中。
 */
const verifyHotRankingMobileLayout = async (page, baseUrl) => {
  await page.goto(`${baseUrl}/tools/hot-ranking`, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.tool-ranking-page__hero', { state: 'visible', timeout: 15000 })
  await page.waitForSelector('.tool-ranking-board', { state: 'visible', timeout: 15000 })
  await page.waitForFunction(
    () =>
      Boolean(
        document.querySelector('.tool-ranking-board__podium') ||
          document.querySelector('.tool-ranking-board__empty')
      ),
    { timeout: 15000 }
  )

  const metrics = await page.evaluate(() => {
    const html = document.documentElement
    const readElement = (selector) => {
      const element = document.querySelector(selector)
      if (!element) {
        return null
      }
      const rect = element.getBoundingClientRect()
      const style = window.getComputedStyle(element)
      return {
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        boxShadow: style.boxShadow,
        display: style.display,
        gridTemplateColumns: style.gridTemplateColumns
      }
    }
    return {
      scrollWidth: html.scrollWidth,
      clientWidth: html.clientWidth,
      hero: readElement('.tool-ranking-page__hero'),
      board: readElement('.tool-ranking-board'),
      podium: readElement('.tool-ranking-board__podium'),
      firstPodiumItem: readElement('.tool-ranking-board__podium-item'),
      firstItem: readElement('.tool-ranking-board__item'),
      podiumItemCount: document.querySelectorAll('.tool-ranking-board__podium-item').length,
      listItemCount: document.querySelectorAll('.tool-ranking-board__item').length,
      emptyText: String(document.querySelector('.tool-ranking-board__empty')?.textContent || '').trim()
    }
  })

  assertNoHorizontalOverflow(metrics, '热榜移动端')
  assertNoBoxShadow(metrics.hero?.boxShadow, '热榜首屏')
  assertNoBoxShadow(metrics.board?.boxShadow, '热榜榜单容器')
  assertNoBoxShadow(metrics.firstPodiumItem?.boxShadow, '热榜前三名卡片')
  assertNoBoxShadow(metrics.firstItem?.boxShadow, '热榜列表项')
  if (!metrics.podium || metrics.podiumItemCount < 3) {
    throw new Error(`热榜移动端前三名未完整渲染：podium=${JSON.stringify(metrics.podium)}, emptyText=${metrics.emptyText}`)
  }
  if (metrics.listItemCount < 1) {
    throw new Error(`热榜移动端后续列表未渲染：listItemCount=${metrics.listItemCount}`)
  }
  const podiumColumns = String(metrics.podium?.gridTemplateColumns || '').split(/\s+/).filter(Boolean)
  if (podiumColumns.length !== 1) {
    throw new Error(`热榜移动端前三名应为单列，当前 gridTemplateColumns=${metrics.podium?.gridTemplateColumns || '空'}`)
  }
}

/**
 * 函数说明：通过前台登录事件拉起登录弹窗，检查移动端弹窗不溢出且按钮排布正常。
 */
const verifyLoginDialogMobileLayout = async (page, baseUrl) => {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('header', { state: 'visible', timeout: 15000 })
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent('uiedtool:frontend-user-login-prompt', {
        detail: {
          reason: '请先登录后再使用该工具',
          redirectPath: '/tools/ai/article-generator',
          source: 'frontend-mobile-visual-smoke'
        }
      })
    )
  })
  await page.waitForSelector('.frontend-login-dialog', { state: 'visible', timeout: 15000 })

  const metrics = await page.evaluate(() => {
    const html = document.documentElement
    const readElement = (selector) => {
      const element = document.querySelector(selector)
      if (!element) {
        return null
      }
      const rect = element.getBoundingClientRect()
      const style = window.getComputedStyle(element)
      return {
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        display: style.display,
        gridTemplateColumns: style.gridTemplateColumns,
        boxShadow: style.boxShadow
      }
    }
    const dialog = document.querySelector('.frontend-login-dialog.el-dialog, .frontend-login-dialog .el-dialog, .el-dialog.frontend-login-dialog')
    return {
      scrollWidth: html.scrollWidth,
      clientWidth: html.clientWidth,
      dialogText: dialog ? String(dialog.innerText || '').replace(/\s+/g, ' ').trim() : '',
      dialog: readElement('.frontend-login-dialog.el-dialog, .frontend-login-dialog .el-dialog, .el-dialog.frontend-login-dialog'),
      shell: readElement('.login-dialog-shell'),
      points: readElement('.login-dialog-points'),
      footer: readElement('.login-dialog-footer')
    }
  })

  assertNoHorizontalOverflow(metrics, '登录弹窗移动端')
  assertNoBoxShadow(metrics.dialog?.boxShadow, '登录弹窗')
  if (!metrics.dialog || metrics.dialog.left < 8 || metrics.dialog.right > metrics.clientWidth - 8) {
    throw new Error(`登录弹窗移动端左右间距异常：${JSON.stringify(metrics.dialog)}`)
  }
  if (!metrics.dialogText.includes('登录用户中心') || !metrics.dialogText.includes('昵称') || !metrics.dialogText.includes('密码')) {
    throw new Error(`登录弹窗关键文案缺失：${metrics.dialogText}`)
  }
  const footerColumns = String(metrics.footer?.gridTemplateColumns || '').split(/\s+/).filter(Boolean)
  if (footerColumns.length !== 2) {
    throw new Error(`登录弹窗底部按钮应为两列，当前 gridTemplateColumns=${metrics.footer?.gridTemplateColumns || '空'}`)
  }
  const pointsColumns = String(metrics.points?.gridTemplateColumns || '').split(/\s+/).filter(Boolean)
  if (pointsColumns.length !== 2) {
    throw new Error(`登录弹窗积分权益应为两列，当前 gridTemplateColumns=${metrics.points?.gridTemplateColumns || '空'}`)
  }
}

/**
 * 函数说明：检查关闭前台登录后不再展示账号入口或登录弹窗，工具入口保持免登录放行。
 */
const verifyLoginDisabledBypass = async (page, baseUrl) => {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('header', { state: 'visible', timeout: 15000 })
  await page.waitForFunction(
    () => !document.querySelector('.header-link-item--account'),
    { timeout: 15000 }
  )
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent('uiedtool:frontend-user-login-prompt', {
        detail: {
          reason: '请先登录后再使用该工具',
          redirectPath: '/tools/ai/article-generator',
          source: 'frontend-mobile-visual-smoke-disabled'
        }
      })
    )
  })
  await page.waitForTimeout(300)

  const state = await page.evaluate(() => ({
    accountEntryCount: document.querySelectorAll('.header-link-item--account').length,
    loginDialogCount: document.querySelectorAll('.frontend-login-dialog').length
  }))
  if (state.accountEntryCount !== 0 || state.loginDialogCount !== 0) {
    throw new Error(`关闭前台登录后仍出现登录入口或弹窗：${JSON.stringify(state)}`)
  }
}

/**
 * 函数说明：执行前台移动端可视冒烟，并保证浏览器和临时服务退出。
 */
const main = async () => {
  let serverProcess = null
  let browser = null
  const consumeRequests = []

  try {
    const server = await startViteServer()
    serverProcess = server.serverProcess
    browser = await launchChromiumBrowser()
    const page = await browser.newPage({ viewport: mobileViewport })
    await installFrontendVisualApiMocks(page)

    page.on('request', (request) => {
      const requestUrl = request.url()
      if (consumeApiPatterns.some((pattern) => requestUrl.includes(pattern))) {
        consumeRequests.push(requestUrl)
      }
    })

    await verifyHomeMobileLayout(page, server.baseUrl)
    await verifyHotRankingMobileLayout(page, server.baseUrl)
    await verifyLoginDialogMobileLayout(page, server.baseUrl)

    const loginDisabledPage = await browser.newPage({ viewport: mobileViewport })
    await installFrontendVisualApiMocks(loginDisabledPage, { loginEnabled: false })
    loginDisabledPage.on('request', (request) => {
      const requestUrl = request.url()
      if (consumeApiPatterns.some((pattern) => requestUrl.includes(pattern))) {
        consumeRequests.push(requestUrl)
      }
    })
    await verifyLoginDisabledBypass(loginDisabledPage, server.baseUrl)

    if (consumeRequests.length > 0) {
      throw new Error(`移动端可视冒烟不应触发扣费接口：${consumeRequests.join(', ')}`)
    }

    console.log('✅ 前台移动端可视冒烟通过：首页两列、热榜无阴影、登录开关与弹窗布局正常。')
  } finally {
    if (browser) {
      await browser.close()
    }
    if (serverProcess && serverProcess.exitCode === null) {
      serverProcess.kill('SIGTERM')
    }
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error('❌ 前台移动端可视冒烟失败：')
  console.error(message)
  process.exit(1)
})
