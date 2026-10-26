/**
 * @description 隔离挂载真实后台组件，以样例数据验证设计与保存交互；不登录、不读取或修改真实后台。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { chromium } from 'playwright'

const adminDir = fileURLToPath(new URL('../', import.meta.url))
const projectDir = path.resolve(adminDir, '../../..')
const outputDir = path.join(projectDir, 'output/playwright/admin-redesign')
const baseUrl = process.env.ADMIN_DESIGN_BASE_URL || 'http://localhost:5180'
const captureToolsOnly = process.argv.includes('--capture-tools-only')
const serveOnly = process.argv.includes('--serve-only')
const fixturePort = Number(process.env.ADMIN_DESIGN_FIXTURE_PORT || 5182)
const reportName = captureToolsOnly ? 'result-tools-screenshot.json' : 'result.json'
const entryName = `__admin-design-${randomUUID()}`
const temporaryFiles = ['html', 'mjs', 'vue'].map(extension => path.join(adminDir, `${entryName}.${extension}`))
const avatar = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" rx="20" fill="%236C54FF"/%3E%3C/svg%3E'
const toolTree = [{ title: '文件与媒体', list: [{ title: '文件处理', list: [
    { title: '视频压缩', url: '/tools/video/compress', toolKey: 'video-compress', desc: '样例：压缩视频体积，设置画质与目标尺寸', consumePoints: 0, memberFree: true, seoTitle: '在线视频压缩', seoDescription: '浏览器视频压缩工具', geoSummary: '压缩视频文件' },
    { title: '图片压缩', url: '/tools/image-compress', toolKey: 'image-compress', desc: '样例：批量处理 JPG、PNG 与 WebP 图片', consumePoints: 0, memberFree: true },
    { title: 'PDF 压缩', url: '/tools/pdf-compress', toolKey: 'pdf-compress', desc: '样例：减少 PDF 文件大小', consumePoints: 0, memberFree: true },
    ...Array.from({ length: 331 }, (_, index) => ({
        title: `样例文件工具 ${index + 1}`, url: `/tools/fixture-file-${index + 1}`,
        toolKey: `fixture-file-${index + 1}`, desc: '样例：用于验证三位工具数量、长列表和多页布局',
        consumePoints: 0, memberFree: true
    }))
] }] }]
let fixture = {
    webName: 'UIED-Tools · 样例', toolsSidebarBrandText: 'UIED-Tools', toolsSiteSlogan: '样例配置',
    toolsSidebarBrandLogo: '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="30"><rect width="64" height="30" rx="6" fill="#6C54FF"/><text x="8" y="21" fill="white" font-size="17">UIED</text></svg>',
    toolsSidebarRecommendTitle: '推荐工具', toolsSidebarRecommend: JSON.stringify([{ name: '图片压缩', link: '/tools/image-compress' }]),
    toolsSidebarCategoryMenus: JSON.stringify([{ key: 'files', title: '文件与媒体', cateTitle: '文件与媒体', icon: 'system-icon-File' }]),
    toolsSidebarBottomLinks: JSON.stringify([{ name: '更新记录', link: '/changelog' }]), toolsSidebarMenuBlocks: '[]', toolsAiToolboxSidebarMenus: '[]',
    toolsCategoryTree: JSON.stringify(toolTree), toolsHomepageLearningEnabled: '1', toolsHomepageLearningTitle: '每日学习',
    toolsHomepageLearningRssUrl: 'https://www.uied.cn/api/open/v1/rss.xml', toolsHomepageLearningFilterType: 'all',
    toolsHomepageLearningCategorySlug: '', toolsHomepageLearningCategoryIds: '', toolsHomepageLearningLimit: '8',
    toolsChangelogTimeline: JSON.stringify([
        { id: 'fixture-latest', version: '3.0.6', date: '2026-10-26', title: '样例：新版内容配置', extension: { preserve: true }, features: [{ title: '功能更新', points: ['样例：原始更新内容'], extension: '保留分组扩展字段' }] },
        { id: 'fixture-previous', version: '3.0.5', date: '2026-10-25', title: '样例：历史版本', features: [{ title: '问题修复', points: ['样例：历史记录保持不变'] }] }
    ]),
    toolsChangelogIntroText: '样例：更新记录介绍', toolsChangelogStatsText: '样例：版本摘要',
    toolsChangelogHeaderLinks: '[]', toolsChangelogMetaLinks: '[]'
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
let fixtureServer
let fixtureCacheDir

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
const openedPreviews = []
/** 隔离预览出口，实际按钮仍执行真实地址解析，但不会访问其他服务。 */
window.open = url => { openedPreviews.push(String(url)); return null }
router.push('/official_site/tools_catalog').then(() => { app.mount('#app'); window.__adminDesign = { openedPreviews, navigate: path => router.push(path), route: () => router.currentRoute.value.path, clearMessages: () => Message.clear(), layoutState: () => ({ mobile: state.isMobile, collapsed: state.isCollapsed }), ready: true } })
`)
    await fs.writeFile(temporaryFiles[2], `
<script setup>
import zhCn from '@arco-design/web-vue/es/locale/lang/zh-cn'
</script>
<template><a-config-provider :locale="zhCn"><router-view /></a-config-provider><div class="fixture-indicator" role="note">组件验收 · 样例数据</div></template>
<style>.fixture-indicator{position:fixed;right:8px;bottom:4px;z-index:11000;padding:4px 10px;border-radius:4px;background:#342276;color:#fff;font:12px/1.6 sans-serif;pointer-events:none}body{margin:0}</style>
`)
}

/** 在内存中处理样例 API；浏览器回归和本机 CUA 预览共用相同数据与禁止真实写入规则。 */
const fixtureResponse = async (pathname, method, payload, credentialPresent) => {
    requests.push({ path: pathname, method, credentialPresent })
    if (credentialPresent) {
        credentialViolations.push(pathname)
        return { code: 500, msg: '隔离验收禁止登录凭证', data: null }
    }
    if (pathname.endsWith('/setting/website/detail')) return failLoad ? { code: 500, msg: '样例：配置读取失败', data: null } : { code: 200, data: fixture }
    if (pathname.endsWith('/setting/website/save')) {
        saves.push(payload)
        await new Promise(resolve => setTimeout(resolve, 180))
        if (failSave) return { code: 500, msg: '样例：保存接口失败', data: null }
        fixture = { ...fixture, ...payload }
        return { code: 200, data: fixture }
    }
    if (pathname.endsWith('/common/index/config')) return failRefresh ? { code: 500, msg: '样例：预览缓存刷新失败', data: null } : { code: 200, data: fixture }
    return method === 'GET' ? { code: 200, msg: '样例数据', data: [] } : { code: 500, msg: '样例验收不允许此写入', data: null }
}

/** 所有 API 均在浏览器请求边界返回样例结果；未知写入也不会转发到开发或线上服务。 */
const fulfillFixture = async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname.startsWith('/api')) {
        const credentialPresent = !['', 'null', 'undefined'].includes(request.headers().token || '')
        const payload = request.method() === 'GET' ? undefined : request.postDataJSON()
        return route.fulfill({ json: await fixtureResponse(url.pathname, request.method(), payload, credentialPresent) })
    }
    if (url.origin === new URL(baseUrl).origin) return route.continue()
    return route.abort()
}

/** 退出时同步删除本脚本拥有的临时入口和独立缓存，兼容 Vite 的 SIGTERM 退出处理。 */
const cleanupFixtureFiles = () => {
    for (const file of temporaryFiles) rmSync(file, { force: true })
    if (fixtureCacheDir) rmSync(fixtureCacheDir, { recursive: true, force: true })
}

/** 为人工浏览器验收开启独立本机端口；最前置 API 中间件只读写样例内存，不使用开发服务代理。 */
const serveFixture = async () => {
    if (!Number.isInteger(fixturePort) || fixturePort < 1024 || fixturePort > 65535 || [5179, 5180, 8003].includes(fixturePort)) throw new Error('样例服务必须使用独立的有效本机端口')
    process.once('exit', cleanupFixtureFiles)
    const { createServer } = await import('vite')
    fixtureCacheDir = await fs.mkdtemp(path.join(tmpdir(), 'uied-admin-design-vite-'))
    fixtureServer = await createServer({
        cacheDir: fixtureCacheDir,
        root: adminDir, configFile: path.join(adminDir, 'vite.config.ts'), base: '/',
        server: { host: '127.0.0.1', port: fixturePort, strictPort: true, open: false },
        plugins: [{
            name: 'uied-admin-design-fixture',
            /** 在 Vite 代理前截住全部样例 API，任何失败也不继续转发。 */
            configureServer(server) {
                server.middlewares.use(async (request, response, next) => {
                    const url = new URL(request.url || '/', 'http://127.0.0.1')
                    if (!url.pathname.startsWith('/api')) return next()
                    response.setHeader('Content-Type', 'application/json; charset=utf-8')
                    response.setHeader('Cache-Control', 'no-store')
                    try {
                        let body = ''
                        for await (const chunk of request) {
                            body += chunk
                            if (body.length > 2 * 1024 * 1024) throw new Error('样例请求过大')
                        }
                        const credentialPresent = !['', 'null', 'undefined'].includes(String(request.headers.token || ''))
                        const result = await fixtureResponse(url.pathname, request.method || 'GET', body ? JSON.parse(body) : undefined, credentialPresent)
                        response.end(JSON.stringify(result))
                    } catch {
                        response.statusCode = 400
                        response.end(JSON.stringify({ code: 500, msg: '样例请求无效，未访问真实接口', data: null }))
                    }
                })
            }
        }]
    })
    await fixtureServer.listen()
    console.log(JSON.stringify({ mode: 'serve-only', url: `http://127.0.0.1:${fixturePort}/${entryName}.html`, pid: process.pid, scope: '独立端口与独立临时缓存、全 API 内存样例；不启动浏览器、不登录、不访问真实配置；SIGINT/SIGTERM 清理临时入口' }))
    await new Promise(resolve => { process.once('SIGINT', resolve); process.once('SIGTERM', resolve) })
}

/** 在内存路由中切换实际配置页，既不进入正式路由，也不加载认证守卫。 */
const navigate = async key => {
    await page.evaluate(key => window.__adminDesign.navigate('/official_site/' + key), key)
    await page.locator('.config-edit-frame').waitFor()
    await page.waitForFunction(() => !document.querySelector('.config-edit-frame')?.getAttribute('aria-busy')?.includes('true'))
}

/** 主动展开批量编辑入口后应用草稿，保留日常直接保存与批量发布两条真实流程。 */
const applyToolDraft = async () => {
    const batch = page.locator('.catalog-editor__batch')
    if (await batch.getAttribute('open') === null) await batch.locator('summary').click()
    await batch.locator('[data-admin-smoke="tools-catalog-tool-apply"]').click()
}

/** 检查页面和实际内容容器的横向溢出，并保存带样例标记的当前视口截图。 */
const captureResponsive = async (name, width) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.waitForFunction(() => {
        const layout = document.querySelector('.layout-content')
        if (!layout || document.querySelector('.layout')?.classList.contains('mobile') !== (innerWidth <= 900)) return false
        const expected = Number.parseFloat(layout.style.paddingLeft)
        const sider = document.querySelector('.layout-sider')
        const paddingStable = Math.abs(Number.parseFloat(getComputedStyle(layout).paddingLeft) - expected) < 0.5
        return innerWidth <= 900
            ? paddingStable && expected === 0 && !sider
            : paddingStable && Boolean(sider) && Math.abs(sider.getBoundingClientRect().width - Number.parseFloat(sider.style.width)) < 0.5
    })
    await page.evaluate(() => { window.__adminDesign.clearMessages(); document.querySelector('.layout-content > .arco-layout-content')?.scrollTo(0, 0) })
    await page.locator('.arco-message').first().waitFor({ state: 'hidden' })
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    const layoutSample = await page.evaluate(({ name, width }) => ({
        name, width, ...window.__adminDesign.layoutState(),
        siderWidth: document.querySelector('.layout-sider')?.getBoundingClientRect().width ?? 0,
        siderStyleWidth: document.querySelector('.layout-sider')?.style.width ?? '',
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
        content: [...document.querySelectorAll('.layout-main-inner, .pro-page-shell, .config-edit-frame, .catalog-editor__filters')].map(element => ({ className: element.className, pixels: element.scrollWidth - element.clientWidth }))
    }))
    assert.ok(overflow.document <= 1, `${name} ${width}px 文档横向溢出 ${overflow.document}px`)
    for (const item of overflow.content) assert.ok(item.pixels <= 1, `${name} ${width}px ${item.className} 横向溢出 ${item.pixels}px`)
    if (name === 'tools-catalog') {
        assert.match(await page.locator('.catalog-editor__count').innerText(), /^\d{3,} 个工具$/, '样例目录须覆盖三位工具数和多页分页')
        const pagination = await page.locator('.catalog-editor .arco-pagination').evaluate(element => {
            const editorRect = element.closest('.catalog-editor').getBoundingClientRect()
            const bounds = [...element.querySelectorAll('.arco-pagination-item'), element]
                .filter(item => item.getBoundingClientRect().width > 0)
                .map(item => ({ className: item.className, left: item.getBoundingClientRect().left, right: item.getBoundingClientRect().right }))
            return { editorLeft: editorRect.left, editorRight: editorRect.right, viewportWidth: innerWidth, simple: element.classList.contains('arco-pagination-simple'), bounds }
        })
        assert.equal(pagination.simple, width <= 900, '手机使用简洁分页，桌面保留完整分页')
        for (const bounds of pagination.bounds) {
            assert.ok(bounds.left >= Math.max(0, pagination.editorLeft) - 1 && bounds.right <= Math.min(pagination.viewportWidth, pagination.editorRight) + 1,
                `${name} ${width}px 分页或按钮越界：${bounds.className} [${bounds.left}, ${bounds.right}]`)
        }
        checks.push(`工具目录 ${width}px：三位工具数、多页分页和前后页按钮均未越界`)
    }
    const saveButton = page.locator('.config-edit-frame__actions .arco-btn-primary')
    const frameState = await page.locator('.config-edit-frame').getAttribute('data-state')
    const isCleanCatalogList = name.startsWith('tools-catalog') && await page.locator('.catalog-editor').count() > 0 && ['ready', 'saved'].includes(frameState)
    if (isCleanCatalogList) {
        assert.equal(await page.locator('.config-edit-frame__save').count(), 0, '工具列表无草稿时不应显示全局保存区')
        checks.push(`工具目录 ${width}px：无草稿时不出现全局保存条`)
    } else {
        assert.equal(await saveButton.evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(108, 84, 255)', `${name} 保存按钮须采用品牌紫`)
        if (width <= 600) assert.ok(await saveButton.evaluate(element => element.getBoundingClientRect().height) >= 44, '手机保存操作至少44px高')
    }
    const file = path.join(outputDir, `${name}-${width}.png`)
    await page.screenshot({ path: file })
    screenshots.push(file)
    checks.push(`${name} ${width}px 无横向溢出${isCleanCatalogList ? '、空闲保存区已收起' : `、品牌紫正确${width <= 600 ? '、44px保存操作与左对齐标签' : ''}`}`)
}

/** 等待配置根节点进入指定状态；空闲列表可收起保存条，请求发送不等于保存完成。 */
const waitSaveState = async state => page.waitForFunction(state => document.querySelector('.config-edit-frame')?.getAttribute('data-state') === state, state)

try {
    await createHarness()
    if (serveOnly) {
        await serveFixture()
    } else {
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
    await context.route('**/*', fulfillFixture)
    page = await context.newPage()
    page.setDefaultTimeout(15000)
    page.on('pageerror', error => pageErrors.push(error.message))
    await page.goto(`${baseUrl}/${entryName}.html`, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForFunction(() => window.__adminDesign?.ready, undefined, { timeout: 30000 })
    await page.locator('.layout-sider .arco-menu').waitFor()
    assert.equal(await page.locator('[data-admin-smoke="config-task-navigation"]').count(), 0, '后台不应重复显示顶部任务导航')
    const dailyHeading = page.locator('.layout-sider .menu-group-title').filter({ hasText: /^日常运营$/ })
    await dailyHeading.waitFor()
    assert.equal(await dailyHeading.locator('button,a').count(), 0, '日常运营标题不增加可点击层级')
    for (const label of ['工具管理', '学习与更新']) await page.locator('.layout-sider .arco-menu-item').filter({ hasText: new RegExp('^' + label + '$') }).waitFor()
    await page.locator('.layout-sider .arco-menu-inline-header').filter({ hasText: /^网站设置$/ }).waitFor()
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
        await page.locator('[data-admin-smoke="tools-catalog-tool-save"]').click()
        await page.getByText('工具未保存，您的修改已保留。请检查页面提示后重试。', { exact: true }).waitFor()
        assert.equal(await description.inputValue(), '样例：失败后应保留的工具草稿')
        await page.evaluate(() => window.__adminDesign.clearMessages())
        await page.locator('.arco-message').first().waitFor({ state: 'hidden' })
        await page.screenshot({ path: path.join(outputDir, 'tool-drawer-save-failed.png') })
        screenshots.push(path.join(outputDir, 'tool-drawer-save-failed.png'))
        failSave = false
        failRefresh = true
        await page.locator('[data-admin-smoke="tools-catalog-tool-save"]').click()
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
        // 桌面容量选择须实际改变表体行数，避免受控 pageSize 把容量锁定在默认值。
        await page.locator('.catalog-editor .arco-pagination-options .arco-select').click()
        await page.getByText('50 条/页', { exact: true }).click()
        await page.waitForFunction(() => document.querySelectorAll('.catalog-editor tbody > .arco-table-tr').length === 50)
        assert.equal(await page.locator('.catalog-editor tbody > .arco-table-tr').count(), 50, '选择50条/页后须实际展示50行工具')
        checks.push('工具目录桌面分页：选择50条/页后表体实际显示50行')

        await navigate('frontend_layout')
        assert.equal(await page.locator('[data-admin-smoke="frontend-layout-save-top"]').count(), 1)
        assert.equal(await page.locator('.config-edit-frame__actions button').count(), 1)
        const contentTabs = page.locator('.layout-tabs > .arco-tabs-nav .arco-tabs-tab')
        assert.equal(await contentTabs.count(), 2, '首页内容只保留每日学习和更新记录两个模块')
        const learningTitle = page.getByRole('textbox', { name: '栏目标题', exact: true })
        await learningTitle.fill('样例：新的学习栏目')
        await waitSaveState('dirty')
        await contentTabs.filter({ hasText: /^更新记录$/ }).click()
        await page.getByRole('textbox', { name: '更新记录页面介绍', exact: true }).waitFor({ state: 'visible' })
        const originalTimeline = JSON.parse(fixture.toolsChangelogTimeline)
        await page.getByRole('textbox', { name: '版本标题', exact: true }).fill('样例：可视化编辑后的版本')
        await page.getByRole('textbox', { name: '第1组更新内容', exact: true }).fill('样例：可视化第一条更新\n样例：可视化第二条更新')
        const learningTab = contentTabs.filter({ hasText: /^每日学习$/ })
        await learningTab.focus()
        await learningTab.press('Enter')
        await learningTitle.waitFor({ state: 'visible' })
        assert.equal(await learningTitle.inputValue(), '样例：新的学习栏目')
        await waitSaveState('dirty')
        checks.push('首页模块：可视编辑版本和分组，键盘 Enter 切换模块后保留未保存草稿')
        const contentReads = requests.filter(item => item.path.endsWith('/setting/website/detail')).length
        const refreshReads = requests.filter(item => item.path.endsWith('/common/index/config')).length
        // 首页内容确认保存后不再发起无关刷新；预览按钮通过专用标记读取新配置。
        failRefresh = true
        await page.locator('[data-admin-smoke="frontend-layout-save-top"]').click()
        await waitSaveState('saved')
        failRefresh = false
        assert.equal(await page.locator('.config-edit-frame__alert').count(), 0)
        assert.equal(requests.filter(item => item.path.endsWith('/setting/website/detail')).length, contentReads)
        assert.equal(requests.filter(item => item.path.endsWith('/common/index/config')).length, refreshReads)
        assert.deepEqual(Object.keys(saves.at(-1)).sort(), ['toolsChangelogTimeline', 'toolsHomepageLearningTitle'])
        assert.equal(fixture.toolsHomepageLearningTitle, '样例：新的学习栏目')
        const editedTimeline = JSON.parse(fixture.toolsChangelogTimeline)
        assert.equal(editedTimeline[0].title, '样例：可视化编辑后的版本')
        assert.deepEqual(editedTimeline[0].features[0].points, ['样例：可视化第一条更新', '样例：可视化第二条更新'])
        assert.deepEqual(editedTimeline[0].extension, originalTimeline[0].extension)
        assert.equal(editedTimeline[0].features[0].extension, originalTimeline[0].features[0].extension)
        assert.deepEqual(editedTimeline[1], originalTimeline[1], '编辑当前版本不改写历史版本')
        await page.locator('[data-admin-smoke="frontend-layout-preview"]').click()
        let previewUrl = new URL(await page.evaluate(() => window.__adminDesign.openedPreviews.at(-1)))
        assert.equal(previewUrl.pathname, '/')
        assert.equal(previewUrl.searchParams.get('_uied_preview'), '1')
        checks.push('首页内容：唯一保存入口、仅提交修改字段、保留历史与扩展字段、保存后不重读、预览携带配置刷新标记')
        for (const width of [320, 375, 768, 1440]) await captureResponsive('homepage-content', width)
        await contentTabs.filter({ hasText: /^更新记录$/ }).click()
        await page.getByRole('button', { name: '预览更新记录', exact: true }).click()
        previewUrl = new URL(await page.evaluate(() => window.__adminDesign.openedPreviews.at(-1)))
        assert.equal(previewUrl.pathname, '/changelog')
        assert.equal(previewUrl.searchParams.get('_uied_preview'), '1')
        for (const width of [320, 375, 768, 1440]) await captureResponsive('changelog-editor', width)

        // 任务标题只是侧栏分组；点击已授权菜单即可直接打开页面，不经过第二层导航。
        const sidebarMenu = page.locator('.layout-sider .arco-menu-item').filter({ hasText: /^前台菜单$/ })
        if (!await sidebarMenu.isVisible()) await page.locator('.layout-sider .arco-menu-inline-header').filter({ hasText: /^网站设置$/ }).click()
        assert.equal(await sidebarMenu.count(), 1)
        await sidebarMenu.click()
        await page.waitForFunction(() => window.__adminDesign.route() === '/official_site/sidebar')
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
        checks.push('侧栏任务分组与菜单：直接进入已授权页面、重载取消保留草稿、唯一保存、菜单分组可切换')
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
    }
} catch (error) {
    if (page) {
        await page.screenshot({ path: path.join(outputDir, 'failure.png') }).catch(() => {})
        await fs.writeFile(path.join(outputDir, 'failure.txt'), await page.locator('body').innerText().catch(() => '')).catch(() => {})
    }
    await fs.writeFile(path.join(outputDir, reportName), JSON.stringify({ status: 'failed', error: String(error), checks, requests, screenshots, layoutSamples, pageErrors }, null, 2))
    throw error
} finally {
    try { await browser?.close(); await fixtureServer?.close() }
    finally {
        await Promise.all(temporaryFiles.map(file => fs.rm(file, { force: true })))
        if (fixtureCacheDir) await fs.rm(fixtureCacheDir, { recursive: true, force: true })
    }
}
