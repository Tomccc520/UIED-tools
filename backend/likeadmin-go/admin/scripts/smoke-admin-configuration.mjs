/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createLocalAdminSession } from './lib/local-admin-session.mjs'

const outputDir = path.resolve('../../../output/playwright/admin-optimization')
await fs.mkdir(outputDir, { recursive: true })
const { browser, context, page, baseUrl, readApi } = await createLocalAdminSession()
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.setDefaultTimeout(10000)
let savedPayload
let failSave = false
let failLoad = false
let saveRequests = 0
let localConfig = await readApi('/api/setting/website/detail')

/** 仅在浏览器内模拟保存与故障，不写本地或线上配置；登录与初始读取使用真实 API。 */
await context.route('**/api/setting/website/save', async route => {
    saveRequests++
    savedPayload = route.request().postDataJSON()
    if (failSave) return route.fulfill({ json: { code: 500, msg: '模拟保存失败', data: null } })
    await new Promise(resolve => setTimeout(resolve, 600))
    localConfig = { ...localConfig, ...savedPayload }
    await route.fulfill({ json: { code: 200, msg: '成功', data: localConfig } })
})
await context.route('**/api/setting/website/detail', async route => {
    await route.fulfill({ json: failLoad ? { code: 500, msg: '模拟加载失败', data: null } : { code: 200, msg: '成功', data: localConfig } })
})

/** 打开配置页并等待可交互状态，避免把加载首帧当成验收结果。 */
const openPage = async route => {
    await page.goto(baseUrl + route, { waitUntil: 'networkidle' })
    await page.locator('.config-edit-frame').waitFor()
    await page.waitForFunction(() => document.querySelector('.config-edit-frame')?.getAttribute('aria-busy') === 'false')
    if (!failLoad && route !== '/official_site/tools_catalog') await page.locator('.config-edit-frame__actions button').waitFor()
    if (!failLoad && route === '/official_site/tools_catalog') assert.equal(await page.locator('.config-edit-frame__save').count(), 0, '工具列表没有草稿时不要求全局保存')
}

/** 主动展开批量编辑入口后应用草稿，保留日常直接保存与批量发布两条真实流程。 */
const applyToolDraft = async () => {
    const batch = page.locator('.catalog-editor__batch')
    if (await batch.getAttribute('open') === null) await batch.locator('summary').click()
    await batch.locator('[data-admin-smoke="tools-catalog-tool-apply"]').click()
}

/** 等待断点同步及侧栏过渡完成，再检查内容位置和截图，避免记录窗口缩放中的中间帧。 */
const waitLayoutStable = async () => {
    await page.waitForFunction(() => {
        const layout = document.querySelector('.layout-content')
        const sider = document.querySelector('.layout-sider')
        if (!layout) return false
        const expected = Number.parseFloat(layout.style.paddingLeft)
        const current = Number.parseFloat(getComputedStyle(layout).paddingLeft)
        if (innerWidth <= 900) return Math.abs(expected - current) < 0.5 && expected === 0 && !sider
        if (!sider) return false
        const sideExpected = Number.parseFloat(sider.style.width)
        return Math.abs(expected - current) < 0.5 && Math.abs(sider.getBoundingClientRect().width - sideExpected) < 0.5 && expected > 0
    })
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}

try {
    await openPage('/official_site/tools_catalog')
    await page.getByRole('textbox', { name: '搜索工具', exact: true }).fill('视频压缩')
    const row = page.locator('.arco-table-tr').filter({ hasText: '视频压缩' })
    await row.getByRole('button', { name: '编辑视频压缩', exact: true }).click()
    const originalDesc = await page.getByRole('textbox', { name: '工具简介', exact: true }).inputValue()
    await page.getByRole('textbox', { name: '工具简介', exact: true }).fill(originalDesc + '〔本地验收草稿〕')
    // 右上角关闭必须等待确认，点取消后编辑内容不丢失。
    await page.getByRole('button', { name: 'Close', exact: true }).click()
    await page.locator('.arco-modal').getByRole('button', { name: '取消', exact: true }).click()
    assert.match(await page.getByRole('textbox', { name: '工具简介', exact: true }).inputValue(), /本地验收草稿/)
    await applyToolDraft()
    await page.getByText('有未保存的更改', { exact: true }).waitFor()
    await page.getByRole('button', { name: '重新加载', exact: true }).click()
    await page.locator('.arco-modal').getByRole('button', { name: '取消', exact: true }).click()
    await page.getByText('有未保存的更改', { exact: true }).waitFor()
    await page.locator('.config-edit-frame__actions button').click()
    await page.getByText('正在保存更改', { exact: true }).waitFor()
    assert.equal(await page.getByPlaceholder('搜索工具名称、用途、链接或标识').isEnabled(), false)
    await page.locator('.config-edit-frame[data-state="saved"]').waitFor()
    const toolTree = JSON.parse(savedPayload.toolsCategoryTree)
    const changed = toolTree.flatMap(category => category.list.flatMap(group => group.list)).find(tool => tool.title === '视频压缩')
    assert.equal(changed.desc, originalDesc + '〔本地验收草稿〕')
    assert.deepEqual(Object.keys(savedPayload), ['toolsCategoryTree'])

    // 单工具直接保存：故障不关抽屉、不丢草稿，重试成功只写一次目录补丁。
    await row.getByRole('button', { name: '编辑视频压缩', exact: true }).click()
    await page.getByRole('textbox', { name: '工具简介', exact: true }).fill(originalDesc)
    failSave = true
    await page.locator('[data-admin-smoke="tools-catalog-tool-save"]').click()
    await page.getByText('工具未保存，您的修改已保留。请检查页面提示后重试。', { exact: true }).waitFor()
    assert.equal(await page.getByRole('textbox', { name: '工具简介', exact: true }).inputValue(), originalDesc)
    failSave = false
    await page.locator('[data-admin-smoke="tools-catalog-tool-save"]').click()
    await page.locator('.arco-drawer:visible').waitFor({ state: 'hidden' })
    await page.locator('.config-edit-frame[data-state="saved"]').waitFor()
    assert.deepEqual(Object.keys(savedPayload), ['toolsCategoryTree'])
    assert.equal(JSON.parse(savedPayload.toolsCategoryTree).flatMap(category => category.list.flatMap(group => group.list)).find(tool => tool.title === '视频压缩').desc, originalDesc)

    // 页面存在其它工具草稿时，抽屉禁止直接发布，仍可选择应用列表后统一保存。
    await row.getByRole('button', { name: '编辑视频压缩', exact: true }).click()
    await page.getByRole('textbox', { name: '工具简介', exact: true }).fill(originalDesc + '〔待批量保存〕')
    await applyToolDraft()
    await row.getByRole('button', { name: '编辑视频压缩', exact: true }).click()
    await page.getByRole('textbox', { name: '工具名称', exact: true }).fill('视频压缩〔批量草稿〕')
    assert.equal(await page.locator('[data-admin-smoke="tools-catalog-tool-save"]').count(), 0, '已有批量草稿时不提供单工具直接发布，避免暗中一并保存')
    await applyToolDraft()
    await page.locator('.config-edit-frame__actions button').click()
    await page.locator('.config-edit-frame[data-state="saved"]').waitFor()

    // 首次加载失败不允许把默认空配置保存到后端，重试后恢复。
    failLoad = true
    await openPage('/official_site/header')
    await page.getByText('加载失败，暂不能保存', { exact: true }).waitFor()
    assert.equal(await page.locator('.config-edit-frame__actions button').isEnabled(), false)
    const priorSaves = saveRequests
    failLoad = false
    await page.locator('.config-edit-frame__alert').getByRole('button', { name: '重新加载', exact: true }).click()
    await page.getByText('当前没有未保存更改', { exact: true }).waitFor()
    assert.equal(saveRequests, priorSaves)

    for (const route of ['sidebar', 'header', 'footer', 'seo']) {
        await openPage('/official_site/' + route)
        assert.equal(await page.locator('.config-edit-frame__actions button').count(), 1)
        if (route === 'sidebar') {
            for (const label of ['推荐链接', '一级菜单', '底部入口', '品牌文案']) await page.locator('.sidebar-section-tabs').getByText(label, { exact: true }).click()
        }
        // 各任务页默认分组可能没有链接，选择稳定文案字段验证草稿，避免编辑下拉搜索框。
        let input
        if (route === 'header') {
            await page.getByRole('tab', { name: '搜索推荐', exact: true }).click()
            input = page.getByRole('textbox', { name: '搜索服务方名称', exact: true })
        } else if (route === 'footer') {
            await page.getByRole('tab', { name: '文案与版权', exact: true }).click()
            input = page.getByRole('textbox', { name: '页脚介绍文案', exact: true })
        } else if (route === 'sidebar') {
            input = page.getByPlaceholder('如：免费在线工具集')
        } else {
            input = page.locator('.config-edit-frame__fields').locator('input:visible:not([readonly]):not([type="checkbox"]):not([type="radio"]),textarea:visible:not([readonly])').first()
        }
        const original = await input.inputValue()
        await input.fill(original + '测')
        await page.getByRole('button', { name: '重新加载', exact: true }).click()
        await page.locator('.arco-modal').getByRole('button', { name: '取消', exact: true }).click()
        assert.equal(await input.inputValue(), original + '测')
        await input.fill(original)
        for (const width of [320, 375, 768, 1440]) {
            await page.setViewportSize({ width, height: 1000 })
            await waitLayoutStable()
            await page.waitForFunction(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
            if (width <= 900) await page.waitForFunction(() => getComputedStyle(document.querySelector('.layout-content')).paddingLeft === '0px')
            const layout = await page.locator('.layout-content').evaluate(element => ({ left: getComputedStyle(element).paddingLeft, width: innerWidth }))
            if (width <= 900) assert.equal(layout.left, '0px')
            await page.screenshot({ path: path.join(outputDir, `${route}-${width}.png`), fullPage: false })
        }
    }
    // 首页内容使用独立保存文案，仍要求读取失败禁存、重试恢复且不补发默认值。
    const savesBeforeContentRetry = saveRequests
    failLoad = true
    await page.goto(baseUrl + '/official_site/frontend_layout', { waitUntil: 'networkidle' })
    assert.equal(await page.locator('[data-admin-smoke="frontend-layout-save-top"]').isEnabled(), false)
    failLoad = false
    await page.locator('[data-admin-smoke="frontend-layout-reload"]').click()
    await page.locator('.config-edit-frame[data-state="ready"]').waitFor()
    assert.equal(await page.locator('[data-admin-smoke="frontend-layout-save-top"]').isEnabled(), false, '读取恢复但未编辑时仍不提交空闲配置')
    assert.equal(saveRequests, savesBeforeContentRetry)
    assert.equal(await page.locator('.layout-tabs > .arco-tabs-nav .arco-tabs-tab').count(), 2)
    assert.equal(await page.locator('[data-admin-smoke="config-task-navigation"]').count(), 0)
    await openPage('/official_site/tools_catalog')
    // 真实形成批量草稿后再检验保存条，避免把列表空闲状态误当作必须保存。
    await page.getByRole('textbox', { name: '搜索工具', exact: true }).fill('视频压缩')
    await page.getByRole('button', { name: '编辑视频压缩', exact: true }).click()
    const finalDraft = page.getByRole('textbox', { name: '工具简介', exact: true })
    await finalDraft.fill((await finalDraft.inputValue()) + '〔保存条布局验收〕')
    await applyToolDraft()
    await page.locator('.config-edit-frame__save[data-state="dirty"]').waitFor()
    for (const width of [320, 375, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 })
        await waitLayoutStable()
        await page.waitForFunction(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
        const saveButton = page.locator('.config-edit-frame__actions button')
        assert.equal(await saveButton.evaluate(button => getComputedStyle(button).backgroundColor), 'rgb(108, 84, 255)', '草稿保存按钮采用品牌紫')
        if (width <= 600) assert.ok(await saveButton.evaluate(button => button.getBoundingClientRect().height) >= 44, '手机草稿保存按钮至少44px高')
        assert.equal(await saveButton.evaluate(button => {
            const rect = button.getBoundingClientRect()
            return button.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2))
        }), true, '长表格的固定操作列不能遮挡保存按钮')
        await page.screenshot({ path: path.join(outputDir, `tools-catalog-${width}.png`), fullPage: false })
    }
    assert.deepEqual(errors, [])
    console.log('后台配置 Chrome 回归通过：可视工具编辑、一次保存并生效、失败保留抽屉草稿、批量草稿禁止暗中发布、×关闭取消保留草稿、重载确认、保存中禁用、保存失败/重试、首次加载失败禁存、唯一保存入口、320/375/768/1440px。未写入真实配置。')
} finally {
    await browser.close()
}
