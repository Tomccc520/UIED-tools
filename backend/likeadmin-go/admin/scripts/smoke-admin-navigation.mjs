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

const baseUrl = process.env.ADMIN_BASE_URL || 'http://127.0.0.1:5180'
const apiBaseUrl = process.env.ADMIN_API_BASE_URL || 'http://127.0.0.1:8003'
const outputDir = path.resolve(process.cwd(), '../../../output/playwright/admin-navigation')

/** 使用本地测试账号及现有 SVG 验证码流程获取登录态，不输出令牌。 */
const getToken = async () => {
    if (process.env.ADMIN_TOKEN) return process.env.ADMIN_TOKEN
    const captcha = (await (await fetch(`${apiBaseUrl}/api/system/captcha`)).json()).data
    const svg = Buffer.from(
        String(captcha.captchaImage || '')
            .split(',')
            .pop() || '',
        'base64'
    ).toString('utf8')
    const code = Array.from(svg.matchAll(/<text\b[^>]*>(.*?)<\/text>/gi))
        .map((match) => match[1].trim())
        .join('')
        .toUpperCase()
    const login = await (
        await fetch(`${apiBaseUrl}/api/system/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                username: process.env.ADMIN_USERNAME || 'admin',
                password: process.env.ADMIN_PASSWORD || '123456',
                terminal: 1,
                captchaKey: captcha.captchaKey || '',
                captchaCode: code
            })
        })
    ).json()
    assert.equal(login.code, 200, login.msg)
    assert.ok(login.data?.token, '登录未返回令牌')
    return login.data.token
}

/** 按视口建立独立页面，模拟真实用户登录并记录运行时错误。 */
const createPage = async (browser, token, width, prepare) => {
    const context = await browser.newContext({ viewport: { width, height: 1000 } })
    await context.addInitScript(
        (value) => localStorage.setItem('like_admin_token', JSON.stringify({ expire: '', value })),
        token
    )
    if (prepare) await prepare(context)
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`${baseUrl}/official_site/tools_catalog`)
    await page.locator('.layout-navbar').waitFor()
    return { page, context, errors }
}

/** 搜索功能，返回实际输入框，随后由调用方验证点击或键盘跳转。 */
const searchFor = async (page, keyword) => {
    const input = page.getByPlaceholder('搜索功能或用途，例如：广告、工具上架、备案')
    await input.waitFor()
    await input.fill(keyword)
    await page.locator('.search-item').first().waitFor()
    return input
}

/** 检查手机上的功能搜索浮层位于屏幕内，结果按钮完整可点击。 */
const assertSearchFits = async (page, width) => {
    const modal = await page.locator('.arco-modal:visible').boundingBox()
    assert.ok(
        modal && modal.x >= -1 && modal.x + modal.width <= width + 1,
        `${width}px 搜索浮层溢出`
    )
    const result = await page.locator('.search-item').first().boundingBox()
    assert.ok(result && result.x >= 0 && result.x + result.width <= width + 1)
}

const token = await getToken()
const executablePath =
    process.env.CHROME_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const browser = await chromium.launch({
    headless: true,
    ...(fs.existsSync(executablePath) ? { executablePath } : {})
})
fs.mkdirSync(outputDir, { recursive: true })
try {
    const { page, context, errors } = await createPage(browser, token, 1440)
    await page.locator('.menu-search:visible').waitFor()
    const groups = await page.locator('.menu-group-title:visible').allTextContents()
    assert.ok(groups.includes('业务运营') && groups.includes('系统管理'))
    await page.locator('.menu-search:visible').click()
    let input = await searchFor(page, '工具上架')
    assert.match(await page.locator('.search-item').first().innerText(), /工具主数据/)
    await input.press('Enter')
    await page.waitForURL('**/official_site/tools_catalog')
    await page.locator('.arco-modal:visible').waitFor({ state: 'hidden' })

    await page.getByRole('button', { name: '打开全局搜索', exact: true }).click()
    await searchFor(page, '备案')
    await page.locator('.search-item').first().click()
    await page.waitForURL('**/official_site/filing')

    await page.keyboard.press('Control+k')
    input = await searchFor(page, '榜单')
    assert.equal(await page.locator('.search-item').count(), 2)
    await input.press('ArrowDown')
    await page.waitForFunction(() =>
        document.querySelector('.search-item.is-active')?.textContent?.includes('热榜管理')
    )
    await input.press('Enter')
    await page.waitForURL('**/official_site/tool_ranking_manage')

    await page.getByRole('button', { name: '展开或收起侧栏', exact: true }).click()
    await page.locator('.menu-search--collapsed:visible').waitFor()
    await page.getByRole('button', { name: '展开或收起侧栏', exact: true }).click()
    await page.locator('.menu-group-title:visible').filter({ hasText: '业务运营' }).waitFor()
    assert.ok(
        await page
            .locator('.sidebar .side:visible')
            .getByText('官网设置', { exact: true })
            .isVisible()
    )
    await page.getByRole('button', { name: '打开通知配置', exact: true }).click()
    await page.getByText('当前账号暂无可用的通知配置入口', { exact: true }).waitFor()
    assert.equal(
        await page.locator('.notice-panel').getByText('待处理', { exact: false }).count(),
        0
    )
    assert.equal(
        await page.locator('.notice-panel').getByText('AI模型管理入口', { exact: true }).count(),
        0
    )
    await page.keyboard.press('Escape')
    await page.locator('.notice-panel').waitFor({ state: 'hidden' })
    await page.screenshot({ path: path.join(outputDir, 'navigation-1440.png'), fullPage: true })
    assert.deepEqual(errors, [])
    await context.close()
    console.log('1440px：侧栏分组、点击/回车/方向键导航、折叠展开、无伪通知通过')

    for (const width of [320, 375, 768]) {
        const { page, context, errors } = await createPage(browser, token, width)
        await page.getByRole('button', { name: '展开或收起侧栏', exact: true }).click()
        await page.locator('.arco-drawer:visible .menu-search').waitFor()
        assert.ok(
            await page
                .locator('.arco-drawer:visible')
                .getByText('官网设置', { exact: true })
                .isVisible()
        )
        await page.locator('.arco-drawer:visible .menu-search').click()
        await searchFor(page, '备案')
        await page.waitForFunction(() => {
            const modal = document.querySelector('.arco-modal')
            return (
                modal &&
                getComputedStyle(modal).opacity === '1' &&
                !document.querySelector(
                    '.arco-drawer-slide-enter-active, .arco-drawer-slide-leave-active'
                )
            )
        })
        await assertSearchFits(page, width)
        await page.screenshot({ path: path.join(outputDir, `search-${width}.png`), fullPage: true })
        await page.locator('.search-item').first().click()
        await page.waitForURL('**/official_site/filing')
        await page.locator('.arco-modal:visible').waitFor({ state: 'hidden' })
        assert.deepEqual(errors, [])
        await context.close()
        console.log(`${width}px：抽屉文字、侧栏复用搜索、浮层尺寸、结果跳转通过`)
    }

    // 以下数据仅拦截独立浏览器上下文，不保存菜单或修改后端权限。
    let noticeMode = 'success'
    const fixture = await createPage(browser, token, 1440, async (context) => {
        await context.route('**/api/system/menu/route', async (route) => {
            const response = await route.fetch()
            const payload = await response.json()
            payload.data.push({
                paths: 'qa_notice',
                menuName: '通知设置测试',
                menuType: 'M',
                isShow: 1,
                children: [
                    {
                        paths: 'list',
                        menuName: '通知配置测试',
                        menuType: 'C',
                        isShow: 1,
                        perms: 'setting:notice:list',
                        component: 'message/notice/index'
                    }
                ]
            })
            await route.fulfill({ response, json: payload })
        })
        await context.route('**/api/setting/notice/list?*', async (route) => {
            const recipient = new URL(route.request().url()).searchParams.get('recipient')
            const payload =
                noticeMode === 'failure'
                    ? { code: 500, msg: '模拟通知读取失败', data: null }
                    : {
                          code: 200,
                          msg: '成功',
                          data:
                              noticeMode === 'success' && recipient === '1'
                                  ? [{ id: 101, name: '测试通知场景', type: '站内信' }]
                                  : []
                      }
            await route.fulfill({ status: 200, json: payload })
        })
    })
    await fixture.page.getByRole('button', { name: '打开通知配置', exact: true }).click()
    await fixture.page.locator('.notice-panel').getByText('测试通知场景', { exact: true }).waitFor()
    assert.equal(
        await fixture.page.locator('.notice-panel').getByText('待处理', { exact: false }).count(),
        0
    )
    noticeMode = 'empty'
    await fixture.page.getByRole('button', { name: '刷新通知', exact: true }).click()
    await fixture.page.getByText('暂无通知配置', { exact: true }).waitFor()
    noticeMode = 'failure'
    await fixture.page.getByRole('button', { name: '刷新通知', exact: true }).click()
    await fixture.page.getByText('通知配置加载失败，请重试', { exact: true }).waitFor()
    noticeMode = 'success'
    await fixture.page.getByRole('button', { name: '刷新通知', exact: true }).click()
    await fixture.page.locator('.notice-panel').getByText('测试通知场景', { exact: true }).waitFor()
    assert.equal(
        await fixture.page.getByText('通知配置加载失败，请重试', { exact: true }).count(),
        0
    )
    assert.deepEqual(fixture.errors, [])
    await fixture.context.close()
    console.log('通知配置独立拦截回归：成功、空数据、接口失败、重试恢复均通过，无伪待办')
} finally {
    await browser.close()
}
