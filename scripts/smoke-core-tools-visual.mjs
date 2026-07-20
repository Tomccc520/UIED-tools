/**
 * @file smoke-core-tools-visual.mjs
 * @description 20 个会员核心工具 Playwright 可视冒烟，检查首屏不展示大型卖点面板且结果提示接入完整
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
import { MEMBER_CORE_TOOL_PRESETS } from './lib/tool-commercial-policy.mjs'

const projectRoot = process.cwd()
const host = '127.0.0.1'
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
const consumeApiPatterns = [
  '/api/common/frontend-user/points/consume',
  '/api/user/points/consume',
  '/points/consume'
]

/**
 * 函数说明：获取一个本地空闲端口，避免和用户当前开发服务冲突。
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
 * 函数说明：等待 Vite 服务可访问，避免 Playwright 过早打开页面。
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
 * 函数说明：启动当前项目 Vite 服务，供可视冒烟逐页访问。
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
 * 函数说明：启动 Chromium 浏览器，托管浏览器缺失时回退到 Mac 本机 Chrome、Edge 或 Chromium。
 */
const launchChromiumBrowser = async () => {
  try {
    return await chromium.launch({ headless: true })
  } catch (managedBrowserError) {
    const fallbackBrowser = systemBrowserCandidates.find((item) => existsSync(item.executablePath))
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
 * 函数说明：读取元素文本并压缩空白，便于输出稳定的断言错误。
 */
const readVisibleText = async (locator) => {
  const text = await locator.textContent()
  return String(text || '').replace(/\s+/g, ' ').trim()
}

/**
 * 函数说明：检查首页可渲染，作为核心工具路由前的基础页面冒烟。
 */
const verifyHomePage = async (page, baseUrl) => {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await page.locator('body').waitFor({ state: 'visible', timeout: 15000 })
  const bodyText = await readVisibleText(page.locator('body'))
  if (bodyText.length < 20) {
    throw new Error('首页渲染内容过少，可能为空白页')
  }
}

/**
 * 函数说明：检查单个会员核心工具首屏不展示大型卖点面板，并验证页内结果提示接入。
 */
const verifyCoreToolPage = async (page, baseUrl, tool) => {
  await page.goto(`${baseUrl}${tool.matchUrl}`, { waitUntil: 'domcontentloaded' })

  const runtimePanel = page.locator('.member-core-runtime-panel')
  if (await runtimePanel.count()) {
    throw new Error(`${tool.matchUrl} 首屏不应展示大型会员卖点面板`)
  }

  const tips = page.locator(`.member-core-tool-tips[data-member-core-tool-key="${tool.toolKey}"]`)
  if (tool.toolKey === 'video-compress') {
    if (await tips.count()) {
      throw new Error(`${tool.matchUrl} 完成提醒不应在压缩前展示`)
    }
    return
  }
  await tips.waitFor({ state: 'visible', timeout: 15000 })
  const tipsItemCount = await tips.locator('.member-core-tool-tips__item').count()
  if (tipsItemCount < 3) {
    throw new Error(`${tool.matchUrl} 页内会员体验提示不足 3 项`)
  }
}

/**
 * 函数说明：执行 Playwright 可视冒烟并保证关闭浏览器和本地服务。
 */
const main = async () => {
  let serverProcess = null
  let browser = null
  const consumeRequests = []

  try {
    const server = await startViteServer()
    serverProcess = server.serverProcess
    browser = await launchChromiumBrowser()
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })

    page.on('request', (request) => {
      const requestUrl = request.url()
      if (consumeApiPatterns.some((pattern) => requestUrl.includes(pattern))) {
        consumeRequests.push(requestUrl)
      }
    })

    const baseUrl = server.baseUrl
    await verifyHomePage(page, baseUrl)
    for (const tool of MEMBER_CORE_TOOL_PRESETS) {
      await verifyCoreToolPage(page, baseUrl, tool)
    }

    if (consumeRequests.length > 0) {
      throw new Error(`可视冒烟不应触发扣费接口：${consumeRequests.join(', ')}`)
    }

    console.log(`✅ 会员核心工具可视冒烟通过：首页 + ${MEMBER_CORE_TOOL_PRESETS.length} 个核心工具。`)
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
  console.error('❌ 会员核心工具可视冒烟失败：')
  console.error(message)
  process.exit(1)
})
