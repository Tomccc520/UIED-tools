/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
const baseUrl = (process.env.ADMIN_SMOKE_BASE_URL || 'http://127.0.0.1:5180').replace(/\/$/, '')
const apiUrl = (process.env.ADMIN_SMOKE_API_BASE_URL || 'http://127.0.0.1:8003').replace(/\/$/, '')
const output = path.resolve(
    process.env.ADMIN_WORKBENCH_SMOKE_OUTPUT || '../../../output/playwright/admin-workbench'
)
/** 仅在本机开发服务执行，不把默认测试账号发送到外部站点。 */
function assertLocal(url) {
    assert.ok(
        ['127.0.0.1', 'localhost', '[::1]'].includes(new URL(url).hostname),
        '工作台冒烟仅支持本机服务'
    )
}
assertLocal(baseUrl)
assertLocal(apiUrl)
/** 沿用已有本地测试登录流程，仅获取会话，不修改业务数据。 */
async function login() {
    if (process.env.ADMIN_SMOKE_TOKEN) return process.env.ADMIN_SMOKE_TOKEN
    const { data = {} } = await (await fetch(`${apiUrl}/api/system/captcha`)).json()
    const svg = Buffer.from(
        String(data.captchaImage || '')
            .split(',')
            .pop() || '',
        'base64'
    ).toString('utf8')
    const code = [...svg.matchAll(/<text\b[^>]*>(.*?)<\/text>/gi)]
        .map((item) => item[1].trim())
        .join('')
        .toUpperCase()
    const response = await (
        await fetch(`${apiUrl}/api/system/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                username: process.env.ADMIN_SMOKE_USERNAME || 'admin',
                password: process.env.ADMIN_SMOKE_PASSWORD || '123456',
                captchaKey: data.captchaKey || '',
                captchaCode: Number(data.captchaOn ?? 1) === 1 ? code : ''
            })
        })
    ).json()
    assert.equal(response.code, 200, '本地测试账号登录失败，请通过环境变量提供账号或 token')
    assert.ok(response.data?.token, '登录未返回 token')
    return response.data.token
}
/** 等待读取结束，确保失败不会停留在无限 loading。 */
async function waitForData(page) {
    await page.locator('.data-section[aria-busy="false"]').waitFor({ timeout: 15000 })
}
/** 验证文档与工作台均无横向溢出。 */
async function assertNoOverflow(page, width) {
    const result = await page.evaluate(() => ({
        viewport: innerWidth,
        document: document.documentElement.scrollWidth,
        workbench: document.querySelector('.workbench-page')?.scrollWidth,
        available: document.querySelector('.workbench-page')?.clientWidth
    }))
    assert.ok(
        result.document <= result.viewport + 1 && result.workbench <= result.available + 1,
        `${width}px 横向溢出: ${JSON.stringify(result)}`
    )
}
const token = await login()
const realResponse = await (
    await fetch(`${apiUrl}/api/common/index/console`, { headers: { token } })
).json()
assert.equal(realResponse.code, 200, '真实工作台接口应读取成功')
const browser = await chromium.launch({
    headless: true,
    executablePath:
        process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
})
const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 }
})
await context.addInitScript(
    (value) => localStorage.setItem('like_admin_token', JSON.stringify({ expire: '', value })),
    token
)
const page = await context.newPage()
const pageErrors = []
page.on('pageerror', (error) => pageErrors.push(error.message))
fs.mkdirSync(output, { recursive: true })
try {
    await page.goto(`${baseUrl}/workbench`, { waitUntil: 'domcontentloaded' })
    await waitForData(page)
    await page.getByRole('heading', { name: '工作台', exact: true }).waitFor()
    assert.equal(
        await page.locator('.metric-value').first().innerText(),
        Number(realResponse.data.today.todayVisits).toLocaleString('zh-CN')
    )
    assert.equal(
        await page.getByText(/健康度|用户增长度|订单转化度|营收完成度|商业版升级|最近访问/).count(),
        0
    )
    assert.ok((await page.locator('[data-admin-smoke="workbench-quick-operation"]').count()) >= 3)
    assert.equal(
        await page.locator('[data-workbench-section="maintenance"]').getAttribute('open'),
        null
    )
    await page.locator('[data-workbench-section="maintenance"] > summary').focus()
    await page.keyboard.press('Enter')
    await page
        .locator('[data-admin-smoke="workbench-shortcut-panel"]')
        .first()
        .waitFor({ state: 'visible' })
    await page.locator('[data-workbench-section="release-checklist"] > summary').click()
    assert.equal(await page.locator('.release-checklist input:checked').count(), 0)
    await page.locator('[data-admin-smoke="workbench-release-mark-all"]').click()
    assert.equal(await page.locator('.release-checklist input:checked').count(), 4)
    await page.locator('[data-admin-smoke="workbench-release-reset"]').click()
    assert.equal(await page.locator('.release-checklist input:checked').count(), 0)
    await page.locator('[data-workbench-section="maintenance"] > summary').click()
    await page.locator('[data-workbench-section="release-checklist"] > summary').click()
    for (const width of [375, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 })
        await page.waitForFunction((target) => {
            const store = document.querySelector('#app').__vue_app__.config.globalProperties.$pinia._s.get('app')
            return store.isMobile === (target <= 900)
        }, width, { timeout: 5000 })
        await page.evaluate(() => {
            document.querySelector('.layout-content > .arco-layout-content')?.scrollTo(0, 0)
        })
        await page.waitForTimeout(300)
        await assertNoOverflow(page, width)
        const heading = page.getByRole('heading', { name: '工作台', exact: true })
        await heading.scrollIntoViewIfNeeded()
        const hitState = await heading.evaluate((element) => {
            const rect = element.getBoundingClientRect()
            const hit = document.elementFromPoint(rect.left + 4, rect.top + 4)
            const appStore = document.querySelector('#app').__vue_app__.config.globalProperties.$pinia._s.get('app')
            const main = document.querySelector('.layout-content')
            return { visible: Boolean(hit && (hit === element || element.contains(hit))), viewport: innerWidth, mobile: appStore.isMobile, collapsed: appStore.isCollapsed, heading: rect.toJSON(), content: main?.getBoundingClientRect().toJSON(), contentStyle: main?.getAttribute('style'), padding: main ? getComputedStyle(main).paddingLeft : null, workbench: document.querySelector('.workbench-page')?.getBoundingClientRect().toJSON(), sidebar: document.querySelector('.layout-sider')?.getBoundingClientRect().toJSON(), hit: hit?.outerHTML.slice(0, 300) }
        })
        assert.equal(hitState.visible, true, `${width}px 工作台标题被侧栏或顶栏遮挡: ${JSON.stringify(hitState)}`)
        await page.screenshot({
            path: path.join(output, `workbench-${width}.png`),
            fullPage: true
        })
    }
    await page.evaluate(() => {
        const store = document
            .querySelector('#app')
            .__vue_app__.config.globalProperties.$pinia._s.get('user')
        /** 只临时裁剪浏览器内的授权菜单，验证无权限入口自动消失。 */
        const prune = (routes) =>
            routes
                .filter(
                    (route) =>
                        !['tools_catalog', 'permission'].some((key) =>
                            route.path.split('/').includes(key)
                        )
                )
                .map((route) => ({
                    ...route,
                    children: route.children ? prune(route.children) : undefined
                }))
        store.routes = prune(store.routes)
    })
    await page.waitForFunction(
        () =>
            !document.querySelector(
                '[data-admin-smoke="workbench-quick-operation"][href^="/official_site/tools_catalog"]'
            )
    )
    assert.equal(
        await page
            .locator('[data-admin-smoke="workbench-shortcut-panel"][href^="/permission/"]')
            .count(),
        0
    )
    await page.reload({ waitUntil: 'domcontentloaded' })
    await waitForData(page)
    const pattern = '**/common/index/console*'
    await page.route(pattern, (route) =>
        route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ code: 500, msg: 'temporary failure' })
        })
    )
    await page.locator('[data-admin-smoke="workbench-refresh"]').click()
    await page.locator('.data-error').waitFor()
    assert.equal(await page.locator('.metric-value').count(), 4, '刷新失败保留上次数据')
    await page.getByText('下方保留上次成功读取的数据，可能不是最新状态。').waitFor()
    await page.unroute(pattern)
    await page.locator('[data-admin-smoke="workbench-retry"]').click()
    await waitForData(page)
    assert.equal(await page.locator('.data-error').count(), 0)
    await page.route(pattern, (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ code: 200, data: { today: {}, visitor: {} } })
        })
    )
    await page.locator('[data-admin-smoke="workbench-refresh"]').click()
    await waitForData(page)
    await page.getByText('暂无统计数据，站点产生访问或订单后将在这里显示。').waitFor()
    assert.equal(await page.locator('.metric-value').count(), 0)
    await page.unroute(pattern)
    await page.route(pattern, (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 200, data: { today: { todayVisits: 0, totalVisits: 0, todayUsers: 0, totalUsers: 0, todayOrder: 0, totalOrder: 0, todaySales: 0, totalSales: 0 }, visitor: { date: ['2026-10-18'], list: [0] } } })
    }))
    await page.locator('[data-admin-smoke="workbench-refresh"]').click()
    await waitForData(page)
    assert.deepEqual(await page.locator('.metric-value').allInnerTexts(), ['0', '0', '0', '¥0.00'])
    await page.getByText('最近 15 天暂无工具访问记录').waitFor()
    await page.unroute(pattern)
    await page.route(pattern, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 14000))
        await route.abort().catch(() => {})
    })
    const started = Date.now()
    await page.locator('[data-admin-smoke="workbench-refresh"]').click()
    await page.locator('.data-error').waitFor({ timeout: 14000 })
    assert.ok(Date.now() - started < 13500, '12 秒截止应结束无限 loading')
    await waitForData(page)
    await page.unroute(pattern)
    await page.locator('[data-admin-smoke="workbench-retry"]').click()
    await waitForData(page)
    assert.equal(await page.locator('.metric-value').count(), 4)
    assert.equal(pageErrors.length, 0, pageErrors.join('; '))
    console.log(
        '工作台冒烟通过：真实数据、权限过滤、空数据、失败保留与重试、12秒超时、键盘展开、临时自查及375/768/1440px无横向溢出。'
    )
} finally {
    await context.close()
    await browser.close()
}
