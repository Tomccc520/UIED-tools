/**
 * @file smoke-p0-actions-visual.mjs
 * @description 后台 P0 页面关键操作入口 Playwright 可视冒烟，检查按钮/开关真实可见和可点击
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
 */

import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import {
  filterAdminP0ActionPages,
  resolveAdminP0SafeClickMarkers,
  resolveAdminP0VisualCheckGroups
} from './lib/admin-p0-action-pages.mjs'

const cwd = process.cwd()
const defaultOutputDir = path.resolve(cwd, '../../../output/playwright/admin-p0-actions-visual')
const baseUrl = String(process.env.ADMIN_BASE_URL || process.env.ADMIN_SMOKE_BASE_URL || 'http://127.0.0.1:5180')
  .trim()
  .replace(/\/+$/, '')
const apiBaseUrl = String(process.env.ADMIN_API_BASE_URL || process.env.ADMIN_SMOKE_API_BASE_URL || 'http://127.0.0.1:8003')
  .trim()
  .replace(/\/+$/, '')
const storageState = String(process.env.ADMIN_STORAGE_STATE || process.env.ADMIN_SMOKE_STORAGE_STATE || '').trim()
const adminToken = String(process.env.ADMIN_TOKEN || process.env.ADMIN_SMOKE_TOKEN || '').trim()
const adminUsername = String(process.env.ADMIN_USERNAME || process.env.ADMIN_SMOKE_USERNAME || 'admin').trim()
const adminPassword = String(process.env.ADMIN_PASSWORD || process.env.ADMIN_SMOKE_PASSWORD || '123456').trim()
const outputDir = String(process.env.ADMIN_SMOKE_OUTPUT_DIR || defaultOutputDir).trim()
const headless = String(process.env.ADMIN_HEADLESS || process.env.ADMIN_SMOKE_HEADLESS || '1') !== '0'
const slowMo = Math.max(0, Number(process.env.ADMIN_SMOKE_SLOW_MO || 0))
const actionTimeout = Math.max(1000, Number(process.env.ADMIN_SMOKE_ACTION_TIMEOUT || 10000))
const navigationTimeout = Math.max(3000, Number(process.env.ADMIN_SMOKE_NAVIGATION_TIMEOUT || 30000))
const allowTrialFallback = String(process.env.ADMIN_SMOKE_ALLOW_TRIAL_FALLBACK || '1') !== '0'
const enableSafeRealClick = String(process.env.ADMIN_SMOKE_SAFE_REAL_CLICK || '1') !== '0'
const captureSuccess = String(process.env.ADMIN_SMOKE_CAPTURE_SUCCESS || '0') === '1'
const pageFilter = String(process.env.ADMIN_SMOKE_ONLY || process.env.ADMIN_SMOKE_PAGES || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
const maxDiagnostics = 30

/**
 * 函数说明：解析后台可视冒烟视口，支持 390x844 形式的移动端回归参数。
 */
const resolveViewport = () => {
  const rawViewport = String(process.env.ADMIN_SMOKE_VIEWPORT || '').trim()
  const matchedViewport = rawViewport.match(/^(\d{2,4})\s*[x,]\s*(\d{2,4})$/i)
  if (!matchedViewport) {
    return { width: 1440, height: 960 }
  }
  return {
    width: Number(matchedViewport[1]),
    height: Number(matchedViewport[2])
  }
}

const viewport = resolveViewport()

const selectedP0Pages = filterAdminP0ActionPages(pageFilter)
let safeRealClickCount = 0

/**
 * 函数说明：生成适合文件名的安全文本，避免路由或标记中的特殊字符影响截图保存。
 */
const toSafeFileName = (value) => {
  return String(value || '')
    .replace(/[^a-z0-9\u4e00-\u9fa5_-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

/**
 * 函数说明：确保截图输出目录存在。
 */
const ensureOutputDir = () => {
  fs.mkdirSync(outputDir, { recursive: true })
}

/**
 * 函数说明：限制诊断数组长度，避免接口错误过多导致日志不可读。
 */
const pushDiagnostic = (list, item) => {
  if (list.length >= maxDiagnostics) {
    return
  }
  list.push(item)
}

/**
 * 函数说明：等待页面进入可检查状态，兼容部分接口慢响应或页面首次动态路由注入。
 */
const waitForPageReady = async (page) => {
  await page.waitForLoadState('domcontentloaded', { timeout: navigationTimeout })
  await page.waitForTimeout(500)
}

/**
 * 函数说明：等待后台页面主体不再处于空白状态，降低热更新或动态路由注入造成的误判。
 */
const waitForShellRendered = async (page) => {
  await page.waitForFunction(
    () => {
      const bodyText = document.body?.innerText?.trim() || ''
      const appChildren = document.querySelector('#app')?.children?.length || 0
      return bodyText.length > 0 && appChildren > 0
    },
    undefined,
    { timeout: navigationTimeout }
  )
}

/**
 * 函数说明：等待 Arco 页面级加载态结束，避免接口慢响应时把临时 disabled 误判为按钮不可用。
 */
const waitForArcoIdle = async (page) => {
  await page
    .waitForFunction(
      () => {
        const loadingSelectors = [
          '.arco-spin-loading',
          '.arco-btn-loading',
          '.arco-loading',
          '[aria-busy="true"]'
        ]
        return !loadingSelectors.some((selector) => document.querySelector(selector))
      },
      undefined,
      { timeout: actionTimeout }
    )
    .catch(() => undefined)
}

/**
 * 函数说明：从后台 SVG 验证码 dataURL 中提取验证码字符，用于本地自动化登录。
 */
const resolveCaptchaCodeFromImage = (captchaImage) => {
  const imageText = String(captchaImage || '').trim()
  const base64Text = imageText.includes(',') ? imageText.split(',').pop() : ''
  if (!base64Text) {
    return ''
  }
  const svgText = Buffer.from(base64Text, 'base64').toString('utf8')
  return Array.from(svgText.matchAll(/<text\b[^>]*>(.*?)<\/text>/gi))
    .map((match) => String(match[1] || '').trim())
    .join('')
    .toUpperCase()
}

/**
 * 函数说明：请求后台接口获取登录 token，支持验证码开启时解析本地 SVG 验证码。
 */
const fetchAdminTokenByApi = async () => {
  if (adminToken) {
    return adminToken
  }
  const captchaResponse = await fetch(`${apiBaseUrl}/api/system/captcha`)
  if (!captchaResponse.ok) {
    throw new Error(`验证码接口请求失败（HTTP ${captchaResponse.status}）`)
  }
  const captchaPayload = await captchaResponse.json()
  const captchaData = captchaPayload?.data || {}
  const captchaOn = Number(captchaData?.captchaOn ?? 1) === 1
  const captchaCode = captchaOn ? resolveCaptchaCodeFromImage(captchaData?.captchaImage) : ''
  if (captchaOn && !captchaCode) {
    throw new Error('验证码已开启，但未能从 SVG 验证码中解析出验证码字符')
  }
  const loginPayload = {
    username: adminUsername,
    password: adminPassword,
    terminal: 1,
    captchaKey: captchaOn ? String(captchaData?.captchaKey || '').trim() : '',
    captchaCode
  }
  const loginResponse = await fetch(`${apiBaseUrl}/api/system/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(loginPayload)
  })
  if (!loginResponse.ok) {
    throw new Error(`登录接口请求失败（HTTP ${loginResponse.status}）`)
  }
  const loginPayloadResult = await loginResponse.json()
  const token = String(loginPayloadResult?.data?.token || '').trim()
  if (Number(loginPayloadResult?.code) !== 200 || !token) {
    throw new Error(String(loginPayloadResult?.msg || '登录接口未返回 token'))
  }
  return token
}

/**
 * 函数说明：向 localStorage 写入后台 token，用于 CI 或本地脚本绕过页面表单登录。
 */
const seedAdminToken = async (context, token) => {
  const normalizedToken = String(token || '').trim()
  if (!normalizedToken) {
    return
  }
  await context.addInitScript((tokenValue) => {
    window.localStorage.setItem(
      'like_admin_token',
      JSON.stringify({
        expire: '',
        value: tokenValue
      })
    )
  }, normalizedToken)
}

/**
 * 函数说明：尝试通过登录页账号密码登录；验证码开启时输出明确错误，提示改用 storage state 或 token。
 */
const loginByAccount = async (page) => {
  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: navigationTimeout })
  await page.getByPlaceholder('请输入管理员账号').fill(adminUsername)
  await page.getByPlaceholder('请输入密码').fill(adminPassword)
  const captchaInput = page.getByPlaceholder('请输入图形验证码')
  if (await captchaInput.isVisible({ timeout: 1500 }).catch(() => false)) {
    throw new Error(
      '后台登录验证码已开启，Playwright 可视冒烟无法自动输入验证码。请设置 ADMIN_STORAGE_STATE、ADMIN_TOKEN，或在测试环境关闭后台验证码。'
    )
  }
  await page.getByRole('button', { name: /登录后台|登录/ }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: navigationTimeout })
}

/**
 * 函数说明：检查当前页面是否已经具备后台登录态，未登录时按账号密码兜底登录。
 */
const ensureLoggedIn = async (page) => {
  await page.goto(`${baseUrl}/workbench`, { waitUntil: 'domcontentloaded', timeout: navigationTimeout })
  await waitForPageReady(page)
  if (!page.url().includes('/login')) {
    return
  }
  if (adminToken || storageState) {
    throw new Error('已注入登录态但仍被重定向到登录页，请检查 token/storage state 是否过期或权限是否完整。')
  }
  await loginByAccount(page)
}

/**
 * 函数说明：制造前端布局页的临时未保存状态，用于真实检查底部浮动保存按钮。
 */
const prepareFrontendLayoutUnsaved = async (page) => {
  await page.waitForSelector('[data-admin-smoke="frontend-layout-save-top"]', {
    state: 'visible',
    timeout: actionTimeout
  })
  await waitForArcoIdle(page)
  await page.waitForFunction(
    () => {
      const bodyText = document.body?.innerText || ''
      return bodyText.includes('顶部Banner') && bodyText.includes('每日学习')
    },
    undefined,
    { timeout: actionTimeout }
  )
  if (
    await page
      .locator('[data-admin-smoke="frontend-layout-save-floating"]')
      .first()
      .isVisible({ timeout: 500 })
      .catch(() => false)
  ) {
    return
  }
  const bannerModule = page.getByText('顶部Banner', { exact: true }).first()
  if (await bannerModule.isVisible({ timeout: 1000 }).catch(() => false)) {
    await bannerModule.click({ timeout: actionTimeout })
  }
  const firstBannerTextInput = page
    .locator('.banner-row input[placeholder*="文案"], input[placeholder*="免费AI编程工具"]')
    .first()
  const isBannerTextVisible = await firstBannerTextInput.isVisible({ timeout: actionTimeout }).catch(() => false)
  if (isBannerTextVisible) {
    const currentValue = await firstBannerTextInput.inputValue()
    const nextValue = currentValue.endsWith(' Playwright')
      ? currentValue.replace(/\s+Playwright$/, '')
      : `${currentValue || 'Playwright 可视冒烟'} Playwright`
    await firstBannerTextInput.fill(nextValue)
    await firstBannerTextInput.press('Tab').catch(() => undefined)
  } else {
    await page.locator('button', { hasText: '新增轮播' }).first().click({ timeout: actionTimeout })
  }
  await page.waitForSelector('[data-admin-smoke="frontend-layout-save-floating"]', {
    state: 'visible',
    timeout: actionTimeout
  })
}

/**
 * 函数说明：切换工具主数据页高级模式，用于检查默认折叠的策略同步条件入口。
 */
const prepareToolsCatalogAdvanced = async (page) => {
  const policySyncAdvanced = page
    .locator('[data-admin-smoke="tools-catalog-policy-sync-advanced"]')
    .first()
  if (await policySyncAdvanced.isVisible({ timeout: 1000 }).catch(() => false)) {
    return
  }
  await page
    .locator('[data-admin-smoke="tools-catalog-mode-switch"]')
    .first()
    .click({ timeout: actionTimeout })
  await page.waitForSelector('[data-admin-smoke="tools-catalog-policy-sync-advanced"]', {
    state: 'visible',
    timeout: actionTimeout
  })
}

/**
 * 函数说明：切换菜单设置页高级模式，用于检查菜单样式与 AI 独立左栏入口。
 */
const prepareSidebarAdvanced = async (page) => {
  const formatBlocks = page.locator('[data-admin-smoke="sidebar-format-blocks"]').first()
  if (await formatBlocks.isVisible({ timeout: 1000 }).catch(() => false)) {
    return
  }
  await page
    .locator('[data-admin-smoke="sidebar-mode-switch"]')
    .first()
    .click({ timeout: actionTimeout })
  await formatBlocks.waitFor({ state: 'visible', timeout: actionTimeout })
}

/**
 * 函数说明：切换登录与商业化页的任务页签，用于验证条件表单真实可见。
 */
const prepareLoginCommerceSection = async (page, tabLabel, panelMarker) => {
  const panel = page.locator(`[data-admin-smoke="${panelMarker}"]`).first()
  if (await panel.isVisible({ timeout: 800 }).catch(() => false)) {
    return
  }
  await page.getByText(tabLabel, { exact: true }).first().click({ timeout: actionTimeout })
  await panel.waitFor({ state: 'visible', timeout: actionTimeout })
}

/**
 * 函数说明：按页面配置执行检查前准备动作，覆盖条件按钮等默认不可见场景。
 */
const preparePageForCheck = async (page, prepare) => {
  if (prepare === 'frontendLayoutUnsaved') {
    await prepareFrontendLayoutUnsaved(page)
  }
  if (prepare === 'toolsCatalogAdvanced') {
    await prepareToolsCatalogAdvanced(page)
  }
  if (prepare === 'sidebarAdvanced') {
    await prepareSidebarAdvanced(page)
  }
  if (prepare === 'loginCommerceBilling') {
    await prepareLoginCommerceSection(page, '积分与会员', 'login-register-billing-panel')
  }
  if (prepare === 'loginCommercePayment') {
    await prepareLoginCommerceSection(page, '支付接入', 'login-register-payment-panel')
  }
}

/**
 * 函数说明：返回元素是否具备 disabled 或 aria-disabled 状态。
 */
const resolveDisabledState = async (locator) => {
  return locator.evaluate((element) => {
    const htmlElement = element
    return Boolean(
      htmlElement.disabled ||
        htmlElement.getAttribute('aria-disabled') === 'true' ||
        htmlElement.classList.contains('is-disabled') ||
        htmlElement.closest('[disabled], [aria-disabled="true"], .is-disabled')
    )
  })
}

/**
 * 函数说明：校验安全真实点击标记，避免保存、同步、清空等有副作用入口被误放入真实点击清单。
 */
const assertSafeRealClickMarker = (pageSpec, marker) => {
  const forbiddenPattern = /(save|submit|sync|delete|remove|clear|format|settings|add|seed|policy-sync)/i
  if (forbiddenPattern.test(marker)) {
    throw new Error(`${pageSpec.name} ${marker}: 不允许作为安全真实点击入口，请继续使用 trial click`)
  }
}

/**
 * 函数说明：等待标记元素脱离 loading/disabled 状态，避免真实点击后的异步状态影响后续页面。
 */
const waitForMarkerSettled = async (page, marker) => {
  await page
    .waitForFunction(
      (smokeMarker) => {
        const element = document.querySelector(`[data-admin-smoke="${smokeMarker}"]`)
        if (!element) {
          return true
        }
        const htmlElement = element
        return !(
          htmlElement.disabled ||
          htmlElement.getAttribute('aria-disabled') === 'true' ||
          htmlElement.classList.contains('is-disabled') ||
          htmlElement.closest('[disabled], [aria-disabled="true"], .is-disabled')
        )
      },
      marker,
      { timeout: actionTimeout }
    )
    .catch(() => undefined)
}

/**
 * 函数说明：关闭真实点击后出现的 Arco 弹窗；单按钮提示点确定，多按钮确认优先取消，避免误确认有副作用操作。
 */
const dismissArcoModalIfVisible = async (page) => {
  for (let index = 0; index < 3; index += 1) {
    const modal = page.locator('.arco-modal:visible').first()
    if (!(await modal.isVisible({ timeout: 500 }).catch(() => false))) {
      return
    }
    const footerButtons = modal.locator('.arco-modal-footer button:visible')
    const footerButtonCount = await footerButtons.count()
    if (footerButtonCount <= 1) {
      const okButton = modal.getByRole('button', { name: /确定|OK|知道了|关闭/ }).first()
      if (await okButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await okButton.click({ timeout: actionTimeout }).catch(() => undefined)
      } else {
        await page.keyboard.press('Escape').catch(() => undefined)
      }
    } else {
      const cancelButton = modal.getByRole('button', { name: /取消|关闭|Cancel/ }).first()
      if (await cancelButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await cancelButton.click({ timeout: actionTimeout }).catch(() => undefined)
      } else {
        await page.keyboard.press('Escape').catch(() => undefined)
      }
    }
    await modal.waitFor({ state: 'hidden', timeout: actionTimeout }).catch(() => undefined)
    await page.waitForTimeout(100)
  }
}

/**
 * 函数说明：对安全入口执行真实点击，覆盖查询、重置、刷新、体检等无持久化副作用动作。
 */
const clickSafeMarker = async (page, pageSpec, marker) => {
  assertSafeRealClickMarker(pageSpec, marker)
  const locator = page.locator(`[data-admin-smoke="${marker}"]`).first()
  await dismissArcoModalIfVisible(page)
  await waitForArcoIdle(page)
  await waitForMarkerSettled(page, marker)
  await locator.waitFor({ state: 'visible', timeout: actionTimeout })
  const popupPromise = page.waitForEvent('popup', { timeout: 300 }).catch(() => null)
  await locator.click({ timeout: actionTimeout })
  safeRealClickCount += 1
  const popup = await popupPromise
  if (popup) {
    await popup.close().catch(() => undefined)
  }
  await page.waitForTimeout(200)
  await dismissArcoModalIfVisible(page)
  await waitForArcoIdle(page)
  await waitForMarkerSettled(page, marker)
}

/**
 * 函数说明：对单个 smoke 标记执行可见性、尺寸、禁用态和 trial click 检查。
 */
const checkMarker = async (page, pageSpec, marker) => {
  const locator = page.locator(`[data-admin-smoke="${marker}"]`).first()
  await dismissArcoModalIfVisible(page)
  await waitForArcoIdle(page)
  await waitForMarkerSettled(page, marker)
  await locator.waitFor({ state: 'visible', timeout: actionTimeout })
  const box = await locator.boundingBox()
  if (!box || box.width <= 0 || box.height <= 0) {
    throw new Error(`${pageSpec.name} ${marker}: 元素尺寸异常，width=${box?.width || 0}, height=${box?.height || 0}`)
  }
  const styleState = await locator.evaluate((element) => {
    const style = window.getComputedStyle(element)
    return {
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      pointerEvents: style.pointerEvents
    }
  })
  if (styleState.display === 'none' || styleState.visibility === 'hidden') {
    throw new Error(`${pageSpec.name} ${marker}: 元素被隐藏 ${JSON.stringify(styleState)}`)
  }
  if (await resolveDisabledState(locator)) {
    throw new Error(`${pageSpec.name} ${marker}: 元素处于 disabled 状态`)
  }
  try {
    await locator.click({ trial: true, timeout: actionTimeout })
  } catch (error) {
    if (!allowTrialFallback) {
      throw error
    }
    await locator.scrollIntoViewIfNeeded({ timeout: actionTimeout })
    await locator.hover({ timeout: actionTimeout })
  }
}

/**
 * 函数说明：按完整路径判断是否为后台登录页，避免 login_commerce 等业务路由被误判。
 */
const isAdminLoginPage = (pageUrl) => {
  try {
    const pathname = new URL(pageUrl).pathname.replace(/\/+$/, '') || '/'
    return pathname === '/login' || pathname.startsWith('/login/')
  } catch {
    return false
  }
}

/**
 * 函数说明：访问单个 P0 页面并检查该页所有关键操作入口。
 */
const checkPage = async (page, pageSpec) => {
  await page.goto(`${baseUrl}${pageSpec.path}`, { waitUntil: 'domcontentloaded', timeout: navigationTimeout })
  await waitForPageReady(page)
  await waitForShellRendered(page)
  if (isAdminLoginPage(page.url())) {
    throw new Error(`${pageSpec.name}: 未登录或无权限，访问 ${pageSpec.path} 被重定向到登录页`)
  }
  if (page.url().includes('/403')) {
    throw new Error(`${pageSpec.name}: 当前账号无权限访问 ${pageSpec.path}`)
  }
  const checkedSafeMarkers = []
  const safeMarkerSet = resolveAdminP0SafeClickMarkers(pageSpec)
  for (const checkGroup of resolveAdminP0VisualCheckGroups(pageSpec)) {
    await preparePageForCheck(page, checkGroup.prepare)
    for (const marker of checkGroup.markers) {
      await checkMarker(page, pageSpec, marker)
      if (safeMarkerSet.has(marker)) {
        checkedSafeMarkers.push(marker)
      }
    }
  }
  if (enableSafeRealClick) {
    for (const marker of [...new Set(checkedSafeMarkers)]) {
      await clickSafeMarker(page, pageSpec, marker)
    }
  }
}

/**
 * 函数说明：发生失败时保存当前页面截图，便于快速定位隐藏、遮挡或布局问题。
 */
const captureFailure = async (page, name, diagnostics = { consoleMessages: [], failedRequests: [] }) => {
  ensureOutputDir()
  const safeName = toSafeFileName(name || 'failed')
  const screenshotPath = path.join(outputDir, `${safeName}.png`)
  const diagnosticPath = path.join(outputDir, `${safeName}.json`)
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined)
  const pageState = await page
    .evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        bodyText: (document.body?.innerText || '').trim().slice(0, 2000),
        smokeMarkers: Array.from(document.querySelectorAll('[data-admin-smoke]'))
          .map((element) => element.getAttribute('data-admin-smoke'))
          .filter(Boolean)
      }
    })
    .catch((error) => ({
      url: page.url(),
      title: '',
      bodyText: `页面状态读取失败：${error?.message || error}`,
      smokeMarkers: []
    }))
  fs.writeFileSync(
    diagnosticPath,
    JSON.stringify(
      {
        ...pageState,
        consoleMessages: diagnostics.consoleMessages.slice(-maxDiagnostics),
        failedRequests: diagnostics.failedRequests.slice(-maxDiagnostics)
      },
      null,
      2
    )
  )
  return { screenshotPath, diagnosticPath }
}

/**
 * 函数说明：启动浏览器并执行后台 P0 页面可视冒烟。
 */
const main = async () => {
  ensureOutputDir()
  const runtimeAdminToken = storageState ? adminToken : await fetchAdminTokenByApi()
  const browser = await chromium.launch({
    channel: process.env.ADMIN_BROWSER_CHANNEL || 'chrome',
    headless,
    slowMo
  })
  const context = await browser.newContext({
    baseURL: baseUrl,
    storageState: storageState || undefined,
    viewport
  })
  await seedAdminToken(context, runtimeAdminToken)
  const page = await context.newPage()
  const diagnostics = {
    consoleMessages: [],
    failedRequests: []
  }
  page.on('console', (message) => {
    const type = message.type()
    if (!['error', 'warning'].includes(type)) {
      return
    }
    pushDiagnostic(diagnostics.consoleMessages, {
      type,
      text: message.text(),
      location: message.location()
    })
  })
  page.on('requestfailed', (request) => {
    pushDiagnostic(diagnostics.failedRequests, {
      method: request.method(),
      url: request.url(),
      failure: request.failure()?.errorText || ''
    })
  })
  page.on('response', (response) => {
    const status = response.status()
    if (status < 400) {
      return
    }
    pushDiagnostic(diagnostics.failedRequests, {
      method: response.request().method(),
      url: response.url(),
      status
    })
  })
  page.setDefaultTimeout(actionTimeout)
  page.setDefaultNavigationTimeout(navigationTimeout)

  const errors = []
  try {
    if (selectedP0Pages.length === 0) {
      throw new Error(`没有匹配 ADMIN_SMOKE_ONLY/ADMIN_SMOKE_PAGES=${pageFilter.join(',')} 的 P0 页面`)
    }
    await ensureLoggedIn(page)
    for (const pageSpec of selectedP0Pages) {
      try {
        await checkPage(page, pageSpec)
        if (captureSuccess) {
          ensureOutputDir()
          const successScreenshotPath = path.join(
            outputDir,
            `${toSafeFileName(pageSpec.name)}-success.png`
          )
          await page.screenshot({ path: successScreenshotPath, fullPage: true })
        }
        console.log(`✓ ${pageSpec.name} ${pageSpec.path}`)
      } catch (error) {
        const { screenshotPath, diagnosticPath } = await captureFailure(page, pageSpec.name, diagnostics)
        errors.push(`${pageSpec.name}: ${error.message}（截图：${screenshotPath}，诊断：${diagnosticPath}）`)
      }
    }
  } finally {
    await context.close()
    await browser.close()
  }

  if (errors.length > 0) {
    console.error('后台 P0 页面 Playwright 可视冒烟未通过：')
    errors.forEach((error) => console.error(`- ${error}`))
    process.exitCode = 1
    return
  }
  console.log(
    `后台 P0 页面 Playwright 可视冒烟通过：${selectedP0Pages.length} 个页面，安全真实点击 ${safeRealClickCount} 次，视口=${viewport.width}x${viewport.height}，baseUrl=${baseUrl}，apiBaseUrl=${apiBaseUrl}`
  )
}

main().catch((error) => {
  console.error('后台 P0 页面 Playwright 可视冒烟启动失败：')
  console.error(error?.message || error)
  process.exitCode = 1
})
