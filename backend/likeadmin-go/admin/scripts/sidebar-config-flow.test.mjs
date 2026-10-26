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

const website = new URL('../src/views/setting/website/', import.meta.url)
/** 编译真实页面及组合式函数，只替换网络、消息和生命周期边界。 */
const execute = (source, bindings, names) => {
    const parsed = ts.createSourceFile('subject.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const statements = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, computed, reactive, ref, ...bindings })
    vm.runInContext(ts.transpileModule(statements + '\nthis.subject={' + names.join(',') + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return context.subject
}
const helpers = execute(fs.readFileSync(new URL('composables/config-links.ts', website), 'utf8'), {}, ['readConfigObjectArray', 'readConfigLinks', 'buildConfigFieldPatch'])
/** 构造完整但完全合成的页面配置，不访问真实站点或用户资料。 */
const fixture = () => ({
    toolsSiteSlogan: '样例标语', toolsSidebarBrandLogo: '/logo.svg', toolsSidebarBrandText: '样例品牌', toolsSidebarRecommendTitle: '推荐工具',
    toolsSidebarRecommend: JSON.stringify([{ name: '推荐一', link: '/tools/a', custom: { keep: true }, enabled: 0 }]),
    toolsSidebarCategoryMenus: JSON.stringify([{ key: 'files', title: '文件工具', icon: '', cateTitle: '文件工具', link: '', extra: { sort: 0 } }]),
    toolsSidebarBottomLinks: JSON.stringify([{ name: '更新记录', link: '/changelog', target: '_blank' }]),
    toolsAiToolboxSidebarMenus: JSON.stringify([{ name: 'AI精选', link: '#highlights', nofollow: true }]),
    toolsSidebarMenuBlocks: JSON.stringify([{ key: 'special', title: '特殊入口', type: 'list', extra: 'keep', items: [{ name: '文件', link: '/tools/a', custom: 9 }] }]),
    unrelatedField: '不能提交'
})
/** 复制网络样例，防止测试或页面共享对象引用。 */
const clone = value => JSON.parse(JSON.stringify(value))
/** 创建真实页面，实际加载/提交与字段补丁实现均使用生产源码。 */
const createPage = ({ perms = ['*'], initial = fixture() } = {}) => {
    const calls = { reads: 0, saves: [], errors: [], success: [], confirms: 0 }
    const io = { read: async () => clone(initial), save: async () => ({}), confirm: async () => {} }
    const hooks = { mounted: [], activated: [], deactivated: [], unmount: [], leave: null }
    const listeners = new Set()
    const feedback = { msgError: text => calls.errors.push(text), msgSuccess: text => calls.success.push(text), confirm: async () => { calls.confirms++; return io.confirm() } }
    const lifecycle = { onMounted: handler => hooks.mounted.push(handler), onActivated: handler => hooks.activated.push(handler), onDeactivated: handler => hooks.deactivated.push(handler), onBeforeUnmount: handler => hooks.unmount.push(handler), onBeforeRouteLeave: handler => { hooks.leave = handler } }
    const bindings = { ...helpers, ...lifecycle, feedback,
        useAppStore: () => ({ config: {} }), useUserStore: () => ({ perms }), useRouter: () => ({ push() {} }),
        getWebsite: async () => { calls.reads++; return io.read() }, setWebsite: async patch => { calls.saves.push(clone(patch)); return io.save(patch) },
        resolveToolsPreviewUrl: () => 'https://example.invalid/',
        window: { addEventListener: (_, handler) => listeners.add(handler), removeEventListener: (_, handler) => listeners.delete(handler), open() {} }
    }
    for (const [file, name] of [['use-config-load.ts', 'useConfigLoad'], ['use-operate-submit.ts', 'useOperateSubmit']]) bindings[name] = execute(fs.readFileSync(new URL('../src/composables/' + file, import.meta.url), 'utf8'), bindings, [name])[name]
    bindings.useConfigEditor = execute(fs.readFileSync(new URL('../src/composables/use-config-editor.ts', import.meta.url), 'utf8'), bindings, ['useConfigEditor']).useConfigEditor
    const source = fs.readFileSync(new URL('sidebar.vue', website), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const page = execute(source, bindings, [
        'formData', 'getData', 'handleSubmit', 'reloadSidebarData', 'hasUnsavedChanges', 'hasLoadedData', 'loadErrorMessage', 'submitError', 'baselinePayload',
        'sidebarRecommendLinks', 'sidebarCategoryMenus', 'sidebarBottomLinks', 'aiToolboxSidebarMenus', 'sidebarMenuBlocksEditor',
        'fieldErrors', 'repairDrafts', 'rawArrayFields', 'applySidebarFieldRepair', 'restoreSidebarFieldRepair', 'activeSidebarSection', 'simpleMode',
        'addSidebarRecommendLink', 'addSidebarCategoryMenu', 'addSidebarBottomLink', 'addAiToolboxSidebarMenu', 'removeSidebarRecommendLink', 'moveLinkItem',
        'formatSidebarMenuBlocksEditor', 'handleSidebarBrandLogoMaterialChange'
    ])
    return { page, io, calls, hooks, listeners }
}
/** 创建可控制完成次序的异步边界，不使用真实等待或接口。 */
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }

test('只PATCH改变的品牌字段，未修改链接和其他页面字段不顺带发布', async () => {
    const { page, calls } = createPage(); await page.getData()
    page.formData.toolsSidebarBrandText = '新的品牌'
    assert.equal(await page.handleSubmit(), true)
    assert.deepEqual(calls.saves, [{ toolsSidebarBrandText: '新的品牌' }])
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.equal(calls.reads, 1, '保存不再GET整包覆盖新草稿')
})
test('可视化修改保留链接、分类及模块的未知字段和显式零值', async () => {
    const { page, calls } = createPage(); await page.getData()
    page.sidebarRecommendLinks.value[0].name = '新推荐'; page.sidebarCategoryMenus.value[0].title = '新菜单标题'
    await page.handleSubmit()
    const links = JSON.parse(calls.saves[0].toolsSidebarRecommend); const menus = JSON.parse(calls.saves[0].toolsSidebarCategoryMenus)
    assert.deepEqual(links[0].custom, { keep: true }); assert.equal(links[0].enabled, 0); assert.deepEqual(menus[0].extra, { sort: 0 })
    assert.deepEqual(Object.keys(calls.saves[0]).sort(), ['toolsSidebarCategoryMenus', 'toolsSidebarRecommend'])
    page.formatSidebarMenuBlocksEditor(); assert.equal(page.hasUnsavedChanges.value, false, '纯格式化不产生数据差异')
    const blocks = JSON.parse(page.sidebarMenuBlocksEditor.value)
    assert.equal(blocks[0].extra, 'keep'); assert.equal(blocks[0].items[0].custom, 9)
})
for (const bad of ['[bad', '{}', '[null]', 'null']) test(`损坏字段${bad}明确报错，保存其他字段不写成空数组`, async () => {
    const initial = fixture(); initial.toolsSidebarRecommend = bad
    const { page, calls } = createPage({ initial }); await page.getData()
    assert.equal(page.hasLoadedData.value, true); assert.notEqual(page.fieldErrors.toolsSidebarRecommend, undefined)
    assert.equal(page.rawArrayFields.toolsSidebarRecommend, bad)
    page.formData.toolsSiteSlogan = '只修改标语'; assert.equal(await page.handleSubmit(), true)
    assert.deepEqual(calls.saves, [{ toolsSiteSlogan: '只修改标语' }]); assert.equal(page.rawArrayFields.toolsSidebarRecommend, bad)
})
test('修复草稿必须先应用或恢复，合法清空会提交明确[]', async () => {
    const initial = fixture(); initial.toolsSidebarRecommend = '{'
    const { page, calls } = createPage({ initial }); await page.getData()
    page.repairDrafts.toolsSidebarRecommend = '[]'; page.formData.toolsSiteSlogan = '另一个草稿'
    assert.equal(page.hasUnsavedChanges.value, true); assert.equal(await page.handleSubmit(), false); assert.equal(calls.saves.length, 0)
    assert.equal(page.activeSidebarSection.value, 'recommend'); assert.equal(page.applySidebarFieldRepair('toolsSidebarRecommend'), true)
    assert.equal(await page.handleSubmit(), true)
    assert.deepEqual(calls.saves, [{ toolsSiteSlogan: '另一个草稿', toolsSidebarRecommend: '[]' }])
})
test('坏JSON修复失败保留输入，恢复原文后可独立保存普通字段', async () => {
    const initial = fixture(); initial.toolsSidebarBottomLinks = '{'
    const { page, calls } = createPage({ initial }); await page.getData()
    page.repairDrafts.toolsSidebarBottomLinks = '[null]'; assert.equal(page.applySidebarFieldRepair('toolsSidebarBottomLinks'), false)
    assert.equal(page.repairDrafts.toolsSidebarBottomLinks, '[null]'); page.restoreSidebarFieldRepair('toolsSidebarBottomLinks')
    page.formData.toolsSiteSlogan = ''; await page.handleSubmit()
    assert.deepEqual(calls.saves, [{ toolsSiteSlogan: '' }])
})
test('有效列表合法清空不被过滤，模块变更保留嵌套扩展字段', async () => {
    const { page, calls } = createPage(); await page.getData()
    page.sidebarBottomLinks.value = []; const blocks = JSON.parse(page.sidebarMenuBlocksEditor.value); blocks[0].title = '新模块'
    page.sidebarMenuBlocksEditor.value = JSON.stringify(blocks); await page.handleSubmit()
    assert.equal(calls.saves[0].toolsSidebarBottomLinks, '[]'); assert.equal(JSON.parse(calls.saves[0].toolsSidebarMenuBlocks)[0].items[0].custom, 9)
})
test('只读页面不能通过增删排序修复素材回调或提交制造编辑与写入', async () => {
    const initial = fixture(); initial.toolsSidebarRecommend = JSON.stringify([{ name: '一', link: '/one' }, { name: '二', link: '/two' }])
    const { page, calls } = createPage({ perms: [], initial }); await page.getData(); const before = clone(page.sidebarRecommendLinks.value)
    page.addSidebarRecommendLink(); page.addSidebarCategoryMenu(); page.addSidebarBottomLink(); page.addAiToolboxSidebarMenu()
    page.moveLinkItem(page.sidebarRecommendLinks.value, 0, 1); await page.removeSidebarRecommendLink(0); page.handleSidebarBrandLogoMaterialChange('/changed.svg')
    assert.equal(page.applySidebarFieldRepair('toolsSidebarRecommend'), false); assert.equal(await page.handleSubmit(), false)
    assert.deepEqual(clone(page.sidebarRecommendLinks.value), before); assert.equal(page.formData.toolsSidebarBrandLogo, '/logo.svg')
    assert.equal(page.hasUnsavedChanges.value, false); assert.equal(calls.saves.length, 0); assert.equal(calls.confirms, 0)
})
test('保存校验自动定位其他常规分组与隐藏高级配置', async () => {
    const { page, calls } = createPage(); await page.getData(); page.sidebarBottomLinks.value[0].link = 'javascript:bad'
    assert.equal(await page.handleSubmit(), false); assert.equal(page.activeSidebarSection.value, 'bottom')
    page.sidebarBottomLinks.value[0].link = '/changelog'; page.aiToolboxSidebarMenus.value[0].name = ''
    assert.equal(await page.handleSubmit(), false); assert.equal(page.simpleMode.value, false); assert.equal(calls.saves.length, 0)
})
test('保存失败保留草稿与PATCH基线，重试成功后才清除dirty', async () => {
    const { page, io, calls } = createPage(); await page.getData(); page.formData.toolsSidebarBrandText = '保存草稿'
    io.save = async () => { throw Error('write failed') }; assert.equal(await page.handleSubmit(), false)
    assert.equal(page.hasUnsavedChanges.value, true); assert.notEqual(page.submitError.value, '')
    io.save = async () => ({}); assert.equal(await page.handleSubmit(), true)
    assert.deepEqual(calls.saves[0], calls.saves[1]); assert.equal(page.hasUnsavedChanges.value, false)
})
test('提交中不重复保存或重载，迟到成功不覆盖随后输入的草稿', async () => {
    const { page, io, calls } = createPage(); await page.getData(); page.formData.toolsSidebarBrandText = '本次提交'
    const pending = deferred(); io.save = () => pending.promise; const saving = page.handleSubmit()
    assert.equal(await page.handleSubmit(), false); assert.equal(await page.reloadSidebarData(), false)
    page.formData.toolsSidebarBrandText = '后来的草稿'; pending.resolve({}); await saving
    assert.equal(page.hasUnsavedChanges.value, true); assert.equal(calls.saves.length, 1); assert.equal(calls.reads, 1)
    assert.equal(calls.saves[0].toolsSidebarBrandText, '本次提交')
})
test('缓存失活不再影响其他页刷新，激活保留草稿且不重新读取', async () => {
    const { page, calls, hooks, listeners } = createPage(); await page.getData(); hooks.activated.forEach(handler => handler())
    assert.equal(listeners.size, 1); page.formData.toolsSidebarBrandText = '缓存草稿'
    hooks.deactivated.forEach(handler => handler()); assert.equal(listeners.size, 0); assert.equal(await page.handleSubmit(), false)
    hooks.activated.forEach(handler => handler()); assert.equal(page.formData.toolsSidebarBrandText, '缓存草稿')
    assert.equal(listeners.size, 1); assert.equal(calls.reads, 1)
})
test('删除确认期间重新读取后，不会删除新列表中的同位置条目', async () => {
    const { page, io } = createPage(); await page.getData(); const pending = deferred(); io.confirm = () => pending.promise
    const deleting = page.removeSidebarRecommendLink(0); const next = fixture(); next.toolsSidebarRecommend = JSON.stringify([{ name: '新的列表', link: '/new' }])
    io.read = async () => next; await page.getData(); pending.resolve(); await deleting
    assert.equal(page.sidebarRecommendLinks.value.length, 1); assert.equal(page.sidebarRecommendLinks.value[0].name, '新的列表')
})


test('高级草稿切回常规分组后仍只PATCH已改字段，保留其他高级内容', async () => {
    const { page, calls } = createPage(); await page.getData()
    page.simpleMode.value = false
    page.aiToolboxSidebarMenus.value[0].name = '新的AI入口'
    const blocks = JSON.parse(page.sidebarMenuBlocksEditor.value); blocks[0].title = '新模块标题'
    page.sidebarMenuBlocksEditor.value = JSON.stringify(blocks)
    page.simpleMode.value = true
    assert.equal(await page.handleSubmit(), true)
    assert.deepEqual(Object.keys(calls.saves[0]).sort(), ['toolsAiToolboxSidebarMenus', 'toolsSidebarMenuBlocks'])
    assert.equal(JSON.parse(calls.saves[0].toolsAiToolboxSidebarMenus)[0].nofollow, true)
    assert.equal(JSON.parse(calls.saves[0].toolsSidebarMenuBlocks)[0].items[0].custom, 9)
})
