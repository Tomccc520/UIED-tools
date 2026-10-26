/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { computed, reactive, ref } from 'vue'
import { readConfigLinks, buildConfigFieldPatch } from '../src/views/setting/website/composables/config-links.ts'
import { OFFICIAL_SITE_DEFAULT_HEADER } from '../src/views/setting/website/defaults/officialSite.ts'

/** 编译真实脚本，仅隔离网络、权限、浏览器与消息；生产编辑和提交代码原样执行。 */
const execute = (source, bindings, names) => {
    const parsed = ts.createSourceFile('header-subject.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, computed, reactive, ref, Error, ...bindings })
    vm.runInContext(ts.transpileModule(code + '\nthis.subject = {' + names.join(',') + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return context.subject
}
/** 提供完整读取响应，含嵌套扩展、合法零值和非本页字段，不连接真实接口。 */
const fixture = () => ({
    toolsHeaderLinks: JSON.stringify([{ name: '官网', link: '/', sort: 0, extension: { keep: true }, nofollow: false }]),
    toolsSearchQuickTools: JSON.stringify([{ name: '图片压缩', link: '/tools/image-compress', desc: '处理图片', meta: [0, false] }]),
    toolsSearchProviderLabel: '原服务方', toolsSearchProviderLink: 'https://example.com/provider',
    toolsAiChatHeaderLinks: JSON.stringify([{ name: '模型', link: '/tools/ai/deepseek', target: '_blank' }]),
    toolsAiCommonHeaderLinks: JSON.stringify([{ name: '配音', link: '/tools/text-to-speech', icon: 'keep' }]), otherPage: '不得写入'
})
/** 创建可控制的页面和真实公共生命周期，记录写入但不发送实际请求。 */
const createPage = (initial = fixture(), writable = true) => {
    const calls = { saves: [], errors: [], success: [], reads: 0, confirms: 0 }
    const io = { read: async () => initial, save: async () => ({}), confirm: async () => {} }
    const user = reactive({ perms: writable ? ['setting:website:header:save'] : ['setting:website:header:detail'] })
    const hooks = { mounted: [], activate: [], deactivate: [], unmount: [], leave: null }
    const listeners = new Map()
    const feedback = { msgSuccess: message => calls.success.push(message), msgError: message => calls.errors.push(message), confirm: async () => { calls.confirms++; return io.confirm() } }
    const boundaries = {
        feedback, onMounted: callback => hooks.mounted.push(callback), onBeforeUnmount: callback => hooks.unmount.push(callback),
        onActivated: callback => hooks.activate.push(callback), onDeactivated: callback => hooks.deactivate.push(callback),
        onBeforeRouteLeave: callback => { hooks.leave = callback },
        window: { addEventListener: (name, listener) => listeners.set(name, listener), removeEventListener: (name, listener) => { if (listeners.get(name) === listener) listeners.delete(name) }, open() {} }
    }
    const composable = (file, name, extra = {}) => execute(fs.readFileSync(new URL('../src/composables/' + file, import.meta.url), 'utf8'), { ...boundaries, ...extra }, [name])[name]
    const useConfigLoad = composable('use-config-load.ts', 'useConfigLoad')
    const useOperateSubmit = composable('use-operate-submit.ts', 'useOperateSubmit')
    const useConfigEditor = composable('use-config-editor.ts', 'useConfigEditor', { useConfigLoad, useOperateSubmit })
    const source = fs.readFileSync(new URL('../src/views/setting/website/header.vue', import.meta.url), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const page = execute(source, {
        ...boundaries, useConfigEditor, readConfigLinks, buildConfigFieldPatch, OFFICIAL_SITE_DEFAULT_HEADER,
        useAppStore: () => ({ config: {} }), useUserStore: () => user, resolveToolsPreviewUrl: () => 'http://localhost:5179/',
        getWebsite: async () => { calls.reads++; return io.read() }, setWebsite: async payload => { calls.saves.push(JSON.parse(JSON.stringify(payload))); return io.save(payload) }
    }, ['formData', 'headerLinks', 'searchQuickTools', 'aiChatHeaderLinks', 'aiCommonHeaderLinks', 'activeHeaderTab', 'rawLinkFields', 'linkFieldErrors', 'linkRepairDrafts', 'repairExpanded', 'baselineHeaderPayload', 'getData', 'reloadHeaderData', 'handleSubmit', 'hasUnsavedChanges', 'submitError', 'loadErrorMessage', 'applyLinkRepair', 'resetLinkRepair', 'addLinkItem', 'removeLinkItem', 'moveLinkItem', 'restoreHeaderDefaults', 'runHeaderHealthCheck', 'canEdit'])
    return { page, calls, io, user, hooks, listeners, initial }
}
/** 控制延迟写入的完成时点，验证提交快照与后续草稿分离。 */
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes }); return { promise, resolve } }

test('坏JSON明确留原文，改普通字段不会把损坏链接写成空数组', async () => {
    const { page, calls } = createPage({ ...fixture(), toolsHeaderLinks: '[bad' })
    await page.getData()
    assert.match(page.linkFieldErrors.toolsHeaderLinks, /JSON|原始/)
    assert.equal(page.rawLinkFields.toolsHeaderLinks, '[bad')
    assert.equal(page.hasUnsavedChanges.value, false)
    page.formData.toolsSearchProviderLabel = '新服务方'
    assert.equal(await page.handleSubmit(), true)
    assert.deepEqual(calls.saves, [{ toolsSearchProviderLabel: '新服务方' }])
    assert.equal(page.baselineHeaderPayload.value.toolsHeaderLinks, '[bad')
})
test('非数组单组隔离，修改链接只PATCH该组并保留所有扩展字段', async () => {
    const { page, calls } = createPage({ ...fixture(), toolsAiCommonHeaderLinks: '{}' })
    await page.getData()
    assert.notEqual(page.linkFieldErrors.toolsAiCommonHeaderLinks, '')
    page.headerLinks.value[0].name = '新官网'
    await page.handleSubmit()
    assert.deepEqual(Object.keys(calls.saves[0]), ['toolsHeaderLinks'])
    assert.deepEqual(JSON.parse(calls.saves[0].toolsHeaderLinks)[0], { name: '新官网', link: '/', sort: 0, extension: { keep: true }, nofollow: false })
    assert.equal(page.rawLinkFields.toolsAiCommonHeaderLinks, '{}')
})
test('合法清空列表和服务链接形成PATCH，空值不被过滤', async () => {
    const { page, calls } = createPage()
    await page.getData()
    page.headerLinks.value.splice(0)
    page.formData.toolsSearchProviderLink = ''
    await page.handleSubmit()
    assert.deepEqual(calls.saves, [{ toolsSearchProviderLink: '', toolsHeaderLinks: '[]' }])
    assert.equal(page.hasUnsavedChanges.value, false)
})
test('修复必须明确应用；有效修复保留扩展，未应用文本阻止假成功', async () => {
    const { page, calls } = createPage({ ...fixture(), toolsHeaderLinks: 'broken' })
    await page.getData()
    page.activeHeaderTab.value = 'ai'
    page.linkRepairDrafts.toolsHeaderLinks = 'still broken'
    page.formData.toolsSearchProviderLabel = '其他更改'
    assert.equal(await page.handleSubmit(), false)
    assert.equal(page.activeHeaderTab.value, 'top')
    assert.equal(page.repairExpanded.toolsHeaderLinks, true)
    assert.equal(calls.saves.length, 0)
    assert.equal(page.applyLinkRepair('toolsHeaderLinks'), false)
    assert.equal(page.rawLinkFields.toolsHeaderLinks, 'broken')
    page.linkRepairDrafts.toolsHeaderLinks = '[{"name":"新链接","link":"/new","extra":{"keep":0}}]'
    assert.equal(page.applyLinkRepair('toolsHeaderLinks'), true)
    assert.equal(await page.handleSubmit(), true)
    assert.deepEqual(JSON.parse(calls.saves[0].toolsHeaderLinks), [{ name: '新链接', link: '/new', extra: { keep: 0 } }])
    assert.equal(calls.saves[0].toolsSearchProviderLabel, '其他更改')
})
test('恢复损坏字段原文只放弃修复输入，不抹掉其他普通草稿', async () => {
    const { page, calls } = createPage({ ...fixture(), toolsSearchQuickTools: '[null]' })
    await page.getData()
    page.linkRepairDrafts.toolsSearchQuickTools = '[]'
    page.formData.toolsSearchProviderLabel = '保留编辑'
    page.resetLinkRepair('toolsSearchQuickTools')
    await page.handleSubmit()
    assert.deepEqual(calls.saves, [{ toolsSearchProviderLabel: '保留编辑' }])
    assert.equal(page.linkRepairDrafts.toolsSearchQuickTools, '[null]')
})
test('隐藏AI或搜索字段无效时自动定位对应tab，不留隐藏阻断', async () => {
    const { page, calls } = createPage()
    await page.getData()
    page.activeHeaderTab.value = 'top'
    page.aiChatHeaderLinks.value[0].link = 'javascript:bad'
    assert.equal(await page.handleSubmit(), false)
    assert.equal(page.activeHeaderTab.value, 'ai')
    page.aiChatHeaderLinks.value[0].link = '/tools/ai/deepseek'
    page.formData.toolsSearchProviderLink = 'not-a-url'
    assert.equal(await page.handleSubmit(), false)
    assert.equal(page.activeHeaderTab.value, 'search')
    assert.equal(calls.saves.length, 0)
})
test('只读页面编辑入口和保存函数遵守权限，不产生无用草稿', async () => {
    const { page, calls } = createPage(fixture(), false)
    await page.getData()
    page.addLinkItem('toolsHeaderLinks')
    await page.removeLinkItem('toolsHeaderLinks', 0)
    page.moveLinkItem('toolsHeaderLinks', 0, 1)
    await page.restoreHeaderDefaults()
    assert.equal(page.applyLinkRepair('toolsHeaderLinks'), false)
    assert.equal(await page.handleSubmit(), false)
    assert.equal(page.canEdit.value, false)
    assert.equal(page.headerLinks.value.length, 1)
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.equal(calls.saves.length, 0)
    assert.equal(calls.confirms, 0)
})
test('首次失败与不完整重载不回填默认，读取失败保留草稿且禁存', async () => {
    const { page, calls, io } = createPage()
    io.read = async () => ({ toolsHeaderLinks: '[]' })
    assert.equal(await page.getData(), false)
    assert.equal(await page.handleSubmit(), false)
    io.read = async () => fixture()
    await page.reloadHeaderData()
    page.formData.toolsSearchProviderLabel = '未保存草稿'
    io.read = async () => ({ ...fixture(), toolsSearchProviderLabel: null })
    assert.equal(await page.reloadHeaderData(), false)
    assert.equal(page.formData.toolsSearchProviderLabel, '未保存草稿')
    assert.notEqual(page.loadErrorMessage.value, '')
    assert.equal(await page.handleSubmit(), false)
    assert.equal(calls.saves.length, 0)
})
test('保存失败保留补丁，提交中的新编辑不被旧成功响应标为已保存', async () => {
    const { page, calls, io } = createPage()
    await page.getData()
    page.formData.toolsSearchProviderLabel = '第一次编辑'
    io.save = async () => { throw Error('offline') }
    assert.equal(await page.handleSubmit(), false)
    assert.equal(page.hasUnsavedChanges.value, true)
    assert.equal(page.baselineHeaderPayload.value.toolsSearchProviderLabel, '原服务方')
    const wait = deferred()
    io.save = () => wait.promise
    const saving = page.handleSubmit()
    page.formData.toolsSearchProviderLabel = '提交后的编辑'
    assert.equal(await page.handleSubmit(), false)
    wait.resolve({})
    assert.equal(await saving, true)
    assert.equal(page.hasUnsavedChanges.value, true)
    assert.equal(page.baselineHeaderPayload.value.toolsSearchProviderLabel, '第一次编辑')
    io.save = async () => ({})
    await page.handleSubmit()
    assert.deepEqual(calls.saves.at(-1), { toolsSearchProviderLabel: '提交后的编辑' })
})
test('缓存失活解绑刷新守卫并禁编，激活不重读或覆盖草稿', async () => {
    const { page, calls, hooks, listeners } = createPage()
    await page.getData()
    hooks.activate.forEach(callback => callback())
    page.formData.toolsSearchProviderLabel = '缓存草稿'
    let prevented = false
    listeners.get('beforeunload')({ preventDefault() { prevented = true } })
    assert.equal(prevented, true)
    hooks.deactivate.forEach(callback => callback())
    assert.equal(listeners.has('beforeunload'), false)
    page.addLinkItem('toolsHeaderLinks')
    assert.equal(await page.handleSubmit(), false)
    assert.equal(page.headerLinks.value.length, 1)
    hooks.activate.forEach(callback => callback())
    assert.equal(calls.reads, 1)
    assert.equal(page.formData.toolsSearchProviderLabel, '缓存草稿')
    assert.equal(page.hasUnsavedChanges.value, true)
})
