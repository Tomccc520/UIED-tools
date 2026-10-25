/**
 * @description 隔离挂载真实后台组件，以样例数据验证设计与保存交互；不登录、不读取或修改真实后台。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { chromium } from 'playwright'

const adminDir = fileURLToPath(new URL('../', import.meta.url))
const projectDir = path.resolve(adminDir, '../../..')
const outputDir = path.join(projectDir, 'output/playwright/admin-redesign')
const baseUrl = process.env.ADMIN_DESIGN_BASE_URL || 'http://localhost:5180'
const captureToolsOnly = process.argv.includes('--capture-tools-only')
const reportName = captureToolsOnly ? 'result-tools-screenshot.json' : 'result.json'
const entryName = `__admin-design-${randomUUID()}`
const temporaryFiles = ['html', 'mjs', 'vue'].map(extension => path.join(adminDir, `${entryName}.${extension}`))
const avatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" rx="20" fill="%236C54FF"/%3E%3C/svg%3E'
const toolTree = [{ title: '文件与媒体', list: [{ title: '文件处理', list: [
    { title: '视频压缩', url: '/tools/video/compress', toolKey: 'video-compress', desc: '样例：压缩视频体积，设置画质与目标尺寸', consumePoints: 0, memberFree: true, seoTitle: '在线视频压缩', seoDescription: '浏览器视频压缩工具', geoSummary: '压缩视频文件' },
    { title: '图片压缩', url: '/tools/image-compress', toolKey: 'image-compress', desc: '样例：批量处理 JPG、PNG 与 WebP 图片', consumePoints: 0, memberFree: true },
    { title: 'PDF 压缩', url: '/tools/pdf-compress', toolKey: 'pdf-compress', desc: '样例：减少 PDF 文件大小', consumePoints: 0, memberFree: true }
] }] }]
let fixture = {
    webName: 'UIED-Tools · 样例', toolsSidebarBrandText: 'UIED-Tools', toolsSiteSlogan: '样例配置',
    toolsSidebarBrandLogo: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="30"><rect width="64" height="30" rx="6" fill="#6C54FF"/><text x="8" y="21" fill="white" font-size="17">UIED</text></svg>',
    toolsSidebarRecommendTitle: '推荐工具', toolsSidebarRecommend: JSON.stringify([{ name: '图片压缩', link: '/tools/image-compress' }]),
    toolsSidebarCategoryMenus: JSON.stringify([{ key: 'files', title: '文件与媒体', cateTitle: '文件与媒体', icon: 'system-icon-File' }]),
    toolsSidebarBottomLinks: JSON.stringify([{ name: '更新记录', link: '/changelog' }]), toolsSidebarMenuBlocks: '[]', toolsAiToolboxSidebarMenus: '[]',
    toolsCategoryTree: JSON.stringify(toolTree), toolsHomepageLearningEnabled: '1', toolsHomepageLearningTitle: '每日学习',
    toolsHomepageLearningRssUrl: 'https://www.uied.cn/api/open/v1/rss.xml', toolsHomepageLearningFilterType: 'all',
    toolsHomepageLearningCategorySlug: '', toolsHomepageLearningCategoryIds: '', toolsHomepageLearningLimit: '8'
}
const requests = []
const saves = []
const pageErrors = []
const credentialViolations = []
const checks = []
const screenshots = []
const layoutSamples = []
let failSave = false
let failLoad = false
let failRefresh = false
let browser
let page

/** 创建独立 Vue 入口，保留实际 Layout、菜单、公共导航和业务页面，Pinia 仅注入样例权限与菜单。 */
const createHarness = async () => {
    await fs.mkdir(outputDir, { recursive: true })
    await fs.writeFile(temporaryFiles[0], `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>组件验收 · 样例数据</title></head><body><div id="app"></div><script type="module" src="/${entryName}.mjs"></script></body></html>`)
    await fs.writeFile(temporaryFiles[1], `
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import Arco, { Message } from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import './src/styles/index.scss'
import 'virtual:svg-icons-register'
import App from './${entryName}.vue'
import Layout from './src/layout/default/index.vue'
import Catalog from './src/views/setting/website/tools_catalog.vue'
import Homepage from './src/views/setting/website/frontend_layout.vue'
import Sidebar from './src/views/setting/website/sidebar.vue'
import useAppStore from './src/stores/modules/app'
import useUserStore from './src/stores/modules/user'
import useSettingStore from './src/stores/modules/setting'
import perms from './src/install/directives/perms'
const entries = [ ['tools_catalog', '工具管理', Catalog], ['frontend_layout', '首页内容', Homepage], ['sidebar', '前台菜单', Sidebar] ]
const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: Layout, children: entries.map(([key, title, component]) => ({ path: 'official_site/' + key, name: key, component, meta: { title, type: 'C', icon: 'system-icon-Settings' } })) }] })
const app = createApp(App)
app.use(createPinia())
const user = useUserStore()
user.perms = ['*']
user.userInfo = { nickname: '样例管理员', role_name: '组件验收', avatar: ${JSON.stringify(avatar)} }
user.routes = [{ path: '/official_site', meta: { title: '网站管理', type: 'M', icon: 'system-icon-Settings' }, children: entries.map(([key, title]) => ({ path: key, meta: { title, type: 'C', icon: 'system-icon-File' } })) }]
const state = useAppStore()
state.config = ${JSON.stringify(fixture)}
let lastMobile
const syncViewport = () => { const mobile = innerWidth <= 900; state.setMobile(mobile); if (lastMobile !== mobile) state.toggleCollapsed(mobile); lastMobile = mobile }
syncViewport()
addEventListener('resize', syncViewport)
useSettingStore().setTheme(false)
app.use(Arco)
app.directive('perms', perms)
app.use(router)
router.push('/official_site/tools_catalog').then(() => { app.mount('#app'); window.__adminDesign = { navigate: path => router.push(path), route: () => router.currentRoute.value.path, clearMessages: () => Message.clear(), layoutState: () => ({ mobile: state.isMobile, collapsed: state.isCollapsed }), ready: true } })
`)
    await fs.writeFile(temporaryFiles[2], `
<script setup>
import zhCn from '@arco-design/web-vue/es/locale/lang/zh-cn'
</script>
<template><a-config-provider :locale="zhCn"><router-view /></a-config-provider><div class="fixture-indicator" role="note">组件验收 · 样例数据</div></template>
<style>.fixture-indicator{position:fixed;right:8px;bottom:4px;z-index:11000;padding:4px 10px;border-radius:4px;background:#342276;color:#fff;font:12px/1.6 sans-serif;pointer-events:none}body{margin:0}</style>
`)
}

/** 所有 API 均在浏览器请求边界返回样例结果；未知写入也不会转发到开发或线上服务。 */
const fulfillFixture = async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname.startsWith('/api/')) {
        const credentialPresent = !['', 'null', 'undefined'].includes(request.headers().token || '')
        requests.push({ path: url.pathname, method: request.method(), credentialPresent })
        if (credentialPresent) {
            credentialViolations.push(url.pathname)
            return route.fulfill({ json: { code: 500, msg: '隔离验收禁止登录凭证', data: null } })
        }
        let response = { code: 200, msg: '样例数据', data: [] }
        if (url.pathname.endsWith('/setting/website/detail')) response = failLoad ? { code: 500, msg: '样例：配置读取失败', data: null } : { code: 200, data: fixture }
        else if (url.pathname.endsWith('/setting/website/save')) {
            const payload = request.postDataJSON()
            saves.push(payload)
            await new Promise(resolve => setTimeout(resolve, 180))
            if (failSave) response = { code: 500, msg: '样例：保存接口失败', data: null }
            else { fixture = { ...fixture, ...payload }; response = { code: 200, data: fixture } }
        } else if (url.pathname.endsWith('/common/index/config')) response = failRefresh ? { code: 500, msg: '样例：预览缓存刷新失败', data: null } : { code: 200, data: fixture }
        else if (request.method() !== 'GET') response = { code: 500, msg: '样例验收不允许此写入', data: null }
        return route.fulfill({ json: response })
    }
    if (url.origin === new URL(baseUrl).origin) return route.continue()
    return route.abort()
}

/** 在内存路由中切换实际配置页，既不进入正式路由，也不加载认证守卫。 */
const navigate = async key => {
    await page.evaluate(key => window.__adminDesign.navigate('/official_site/' + key), key)
    await page.locator('.config-edit-frame__save').waitFor()
    await page.waitForFunction(() => !document.querySelector('.config-edit-frame')?.getAttribute('aria-busy')?.includes('true'))
}

/** 检查页面和实际内容容器的横向溢出，并保存带样例标记的当前视口截图。 */
const captureResponsive = async (name, width) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.waitForFunction(() => {
        const layout = document.querySelector('.layout-content')
        if (!layout || document.querySelector('.layout')?.classList.contains('mobile') !== (innerWidth <= 900)) return false
        const expected = Number.parseFloat(layout.style.paddingLeft)
        const sider = document.querySelector('.layout-sider')
        return Math.abs(Number.parseFloat(getComputedStyle(layout).paddingLeft) - expected) < 0.5
            && Math.abs(sider.getBoundingClientRect().width - Number.parseFloat(sider.style.width)) < 0.5
    })
    await page.evaluate(() => { window.__adminDesign.clearMessages(); document.querySelector('.layout-content > .arco-layout-content')?.scrollTo(0, 0) })
    await page.locator('.arco-message').first().waitFor({ state: 'hidden' })
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const layoutSample = await page.evaluate(({ name, width }) => ({
        name, width, ...window.__adminDesign.layoutState(),
        siderWidth: document.querySelector('.layout-sider').getBoundingClientRect().width,
        siderStyleWidth: document.querySelector('.layout-sider').style.width,
        menuCollapsed: Boolean(document.querySelector('.menu-search--collapsed')),
        visibleGroupTitles: [...document.querySelectorAll('.menu-group-title')].filter(element => element.getBoundingClientRect().width > 0).length,
        formLabels: [...document.querySelectorAll('.compact-form .arco-form-item-label-col')]
            .filter(element => element.getBoundingClientRect().width > 0).slice(0, 2)
            .map(element => ({ text: element.textContent.trim(), display: getComputedStyle(element).display,
                justifyContent: getComputedStyle(element).justifyContent, textAlign: getComputedStyle(element).textAlign }))
    }), { name, width })
    layoutSamples.push(layoutSample)
    if (width <= 600) {
        for (const label of layoutSample.formLabels) assert.equal(label.justifyContent, 'flex-start', `${name} 手机标签“${label.text}”应左对齐`)
    }
    const overflow = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth - innerWidth,
        content: [...document.querySelectorAll('.layout-main-inner, .pro-page-shell, .config-edit-frame')].map(element => ({ className: element.className, pixels: element.scrollWidth - element.clientWidth }))
    }))
    assert.ok(overflow.document <= 1, `${name} ${width}px 文档横向溢出 ${overflow.document}px`)
    for (const item of overflow.content) assert.ok(item.pixels <= 1, `${name} ${width}px ${item.className} 横向溢出 ${item.pixels}px`)
    const saveButton = page.locator('.config-edit-frame__actions .arco-btn-primary')
    assert.equal(await saveButton.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(108, 84, 255)', `${name} 保存按钮须采用品牌紫`)
    if (width <= 600) assert.ok(await saveButton.evaluate(element => element.getBoundingClientRect().height) >= 44, '手机保存操作至少44px高')
    const file = path.join(outputDir, `${name}-${width}.png`)
    await page.screenshot({ path: file })
    screenshots.push(file)
    checks.push(`${name} ${width}px 无横向溢出、品牌紫正确${width <= 600 ? '、44px保存操作与左对齐标签' : ''}`)
}

/** 等待保存状态条进入指定状态，避免把请求发送视为保存完成。 */
const waitSaveState = async state => page.waitForFunction(state => document.querySelector('.config-edit-frame__save')?.getAttribute('data-state') === state, state)

try {
    await createHarness()
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
    await context.route('**/*', fulfillFixture)
    page = await context.newPage()
    page.setDefaultTimeout(15000)
    page.on('pageerror', error => pageErrors.push(error.message))
    await page.goto(`${baseUrl}/${entryName}.html`, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForFunction(() => window.__adminDesign?.ready, undefined, { timeout: 30000 })
    await page.locator('[data-admin-smoke="config-task-navigation"]').waitFor()
    assert.equal(await page.locator('h1').count(), 1)
    assert.equal(await page.getByText('组件验收 · 样例数据', { exact: true }).count(), 1)

    if (captureToolsOnly) {
        await page.getByRole('textbox', { name: '搜索工具', exact: true }).fill('视频压缩')
        await captureResponsive('tools-catalog-filtered', 1440)
    } else {
        // 工具抽屉保存失败保留草稿，重试后直接生效；更新确认与缓存刷新分开表达。
        await page.getByRole('textbox', { name: '搜索工具', exact: true }).fill('视频压缩')
        await page.getByRole('button', { name: '编辑视频压缩', exact: true }).click()
        const description = page.getByRole('textbox', { name: '工具简介', exact: true })
        await description.fill('样例：失败后应保留的工具草稿')
        failSave = true
        await page.getByRole('button', { name: '保存工具并生效', exact: true }).click()
        await page.getByText('工具未保存，您的修改已保留。请检查页面提示后重试。', { exact: true }).waitFor()
        assert.equal(await description.inputValue(), '样例：失败后应保留的工具草稿')
        await page.evaluate(() => window.__adminDesign.clearMessages())
        await page.locator('.arco-message').first().waitFor({ state: 'hidden' })
        await page.screenshot({ path: path.join(outputDir, 'tool-drawer-save-failed.png') })
        screenshots.push(path.join(outputDir, 'tool-drawer-save-failed.png'))
        failSave = false
        failRefresh = true
        await page.getByRole('button', { name: '保存工具并生效', exact: true }).click()
        await page.locator('.arco-drawer:visible').waitFor({ state: 'hidden' })
        await waitSaveState('saved')
        await page.locator('.catalog-refresh-warning').waitFor()
        assert.deepEqual(Object.keys(saves.at(-1)), ['toolsCategoryTree'])
        assert.equal(JSON.parse(fixture.toolsCategoryTree)[0].list[0].list[0].desc, '样例：失败后应保留的工具草稿')
        const savedCount = saves.length
        failRefresh = false
        await page.locator('.catalog-refresh-warning').getByRole('button', { name: '重试刷新', exact: true }).click()
        await page.locator('.catalog-refresh-warning').waitFor({ state: 'hidden' })
        assert.equal(saves.length, savedCount)
        checks.push('工具抽屉：失败保留草稿、重试成功关闭、PATCH 白名单、刷新失败不误报保存失败、刷新不重复写入')
        await page.getByRole('textbox', { name: '搜索工具', exact: true }).fill('')
        for (const width of [320, 375, 768, 1440]) await captureResponsive('tools-catalog', width)

        await navigate('frontend_layout')
        assert.equal(await page.locator('[data-admin-smoke="frontend-layout-save-top"]').count(), 1)
        assert.equal(await page.locator('.config-edit-frame__actions button').count(), 1)
        await page.locator('input[maxlength="20"]').fill('样例：新的学习栏目')
        await waitSaveState('dirty')
        failRefresh = true
        await page.locator('[data-admin-smoke="frontend-layout-save-top"]').click()
        await waitSaveState('saved')
        await page.getByText('配置已保存，前台预览刷新未完成，可重试刷新。', { exact: true }).first().waitFor()
        assert.equal(await page.locator('.config-edit-frame__alert').count(), 0)
        const homeSaves = saves.length
        failRefresh = false
        await page.locator('.layout-refresh-warning').getByRole('button', { name: '重试刷新', exact: true }).click()
        await page.locator('.layout-refresh-warning').waitFor({ state: 'hidden' })
        assert.equal(saves.length, homeSaves)
        assert.equal(fixture.toolsHomepageLearningTitle, '样例：新的学习栏目')
        checks.push('首页内容：唯一保存入口、写入后刷新失败仍为已保存、独立刷新无需重发 PATCH')
        for (const width of [320, 375, 768, 1440]) await captureResponsive('homepage-content', width)

        // 公共导航只切任务分组；点击目标页才真正导航，当前状态保持清楚。
        await page.getByRole('button', { name: '导航与外观', exact: true }).click()
        assert.equal(await page.evaluate(() => window.__adminDesign.route()), '/official_site/frontend_layout')
        await page.locator('.config-settings-nav__links').getByRole('link', { name: '前台菜单', exact: true }).click()
        await page.getByRole('heading', { name: '前台菜单与品牌', exact: true }).waitFor()
        await waitSaveState('ready')
        const sidebarInput = page.getByPlaceholder('如：免费在线工具集')
        await sidebarInput.fill('样例：菜单草稿')
        await page.getByRole('button', { name: '重新加载', exact: true }).click()
        await page.locator('.arco-modal').getByRole('button', { name: '取消', exact: true }).click()
        assert.equal(await sidebarInput.inputValue(), '样例：菜单草稿')
        await page.getByRole('button', { name: '保存配置', exact: true }).click()
        await waitSaveState('saved')
        assert.equal(fixture.toolsSiteSlogan, '样例：菜单草稿')
        assert.equal(Object.hasOwn(saves.at(-1), 'toolsCategoryTree'), false)
        for (const label of ['推荐链接', '一级菜单', '底部入口', '品牌文案']) await page.locator('.sidebar-section-tabs').getByText(label, { exact: true }).click()
        checks.push('公共导航与菜单：按任务选择、真实页面切换、重载取消保留草稿、唯一保存、菜单分组可切换')
        for (const width of [320, 375, 768, 1440]) await captureResponsive('sidebar-settings', width)

        failLoad = true
        await navigate('frontend_layout')
        await waitSaveState('error')
        assert.equal(await page.locator('[data-admin-smoke="frontend-layout-save-top"]').isEnabled(), false)
        failLoad = false
        await page.locator('[data-admin-smoke="frontend-layout-reload"]').click()
        await waitSaveState('ready')
        checks.push('首次读取失败禁止保存，重新加载后恢复')
    }
    assert.deepEqual(pageErrors, [])
    assert.deepEqual(credentialViolations, [])
    assert.equal(await context.cookies().then(items => items.length), 0)
    assert.equal(await page.evaluate(() => Object.keys(localStorage).some(key => /token/i.test(key))), false)
    await Promise.all(['failure.png', 'failure.txt'].map(file => fs.rm(path.join(outputDir, file), { force: true })))
    await fs.writeFile(path.join(outputDir, reportName), JSON.stringify({ status: 'passed', checks, requests, saveRequests: saves.length, screenshots, layoutSamples, pageErrors, scope: '真实 Layout 与实际 Vue 页面；全部 API 为浏览器内样例 fixture；未登录、未访问真实 API' }, null, 2))
    console.log(JSON.stringify({ status: 'passed', checks, saveRequests: saves.length, screenshots, layoutSamples, pageErrors }, null, 2))
} catch (error) {
    if (page) {
        await page.screenshot({ path: path.join(outputDir, 'failure.png') }).catch(() => {})
        await fs.writeFile(path.join(outputDir, 'failure.txt'), await page.locator('body').innerText().catch(() => '')).catch(() => {})
    }
    await fs.writeFile(path.join(outputDir, reportName), JSON.stringify({ status: 'failed', error: String(error), checks, requests, screenshots, layoutSamples, pageErrors }, null, 2))
    throw error
} finally {
    try { await browser?.close() }
    finally { await Promise.all(temporaryFiles.map(file => fs.rm(file, { force: true }))) }
}
