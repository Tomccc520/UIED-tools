/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-27
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import { createRequire } from 'node:module'
const require = createRequire(new URL('../package.json', import.meta.url))
const ts = require('typescript')
const { computed, reactive, ref, watch } = require('vue')
const root = new URL('../src/', import.meta.url)
/** 执行真实TS模块或页面脚本，只隔离网络、权限、生命周期和浏览器边界。 */
export const execute = (source, bindings, names) => {
    const script = source.includes('<script') ? source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1] : source
    const parsed = ts.createSourceFile('settings-subject.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, URL, Error, computed, reactive, ref, watch, ...bindings })
    vm.runInContext(ts.transpileModule(code + '\nthis.subject = {' + names.join(',') + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return context.subject
}
/** 读取并执行真实业务模块，供页面和组件共用同一生产实现。 */
const module = (path, bindings, names) => execute(fs.readFileSync(new URL(path, root), 'utf8'), bindings, names)
const links = module('views/setting/website/composables/config-links.ts', {}, ['readConfigObjectArray', 'readConfigLinks', 'buildConfigFieldPatch'])
const content = module('views/setting/website/composables/frontend-content.ts', links, ['createFrontendContent', 'readFrontendContent', 'buildFrontendContentPatch', 'validateFrontendContent', 'frontendContentKeys', 'readContentArray', 'updateContentItem'])
const defaults = module('views/setting/website/defaults/officialSite.ts', {}, ['OFFICIAL_SITE_DEFAULT_SEO'])
/** 生成完整SEO响应，包含合法空图与待保留扩展字段。 */
const fixture = () => ({ toolsSeoDefaultTitle: '', toolsSeoDefaultKeywords: '关键词', toolsSeoDefaultDescription: '默认描述', toolsSeoDefaultImage: '', toolsSeoPages: JSON.stringify([{ path: '/', title: '首页', keywords: '', description: '首页说明', image: '', extension: { rank: 0, enabled: false } }]) })
/** 构造完整页面与真实配置控制器，内存接口不访问或写入真实站点数据。 */
export const createPage = (name = 'seo', initial = name === 'seo' ? fixture() : content.createFrontendContent(), writable = true) => {
    const calls = { saves: [], reads: 0, success: [], errors: [], confirms: 0 }
    const io = { read: async () => initial, save: async () => ({}), confirm: async () => {} }
    const user = reactive({ perms: writable ? ['*'] : [] })
    const hooks = { mounted: [], activated: [], deactivated: [], unmount: [], leave: null }
    const feedback = { msgSuccess: value => calls.success.push(value), msgError: value => calls.errors.push(value), alertWarning: value => calls.errors.push(value), confirm: async () => { calls.confirms++; return io.confirm() } }
    const bindings = { feedback, onMounted: fn => hooks.mounted.push(fn), onActivated: fn => hooks.activated.push(fn), onDeactivated: fn => hooks.deactivated.push(fn), onBeforeUnmount: fn => hooks.unmount.push(fn), onBeforeRouteLeave: fn => { hooks.leave = fn }, window: { addEventListener() {}, removeEventListener() {}, open() {} } }
    const useConfigLoad = module('composables/use-config-load.ts', bindings, ['useConfigLoad']).useConfigLoad
    const useOperateSubmit = module('composables/use-operate-submit.ts', bindings, ['useOperateSubmit']).useOperateSubmit
    const useConfigEditor = module('composables/use-config-editor.ts', { ...bindings, useConfigLoad, useOperateSubmit }, ['useConfigEditor']).useConfigEditor
    const names = name === 'seo' ? ['getData', 'handleSubmit', 'formData', 'seoPages', 'simpleMode', 'addSeoPage', 'restoreDefaultSeo', 'reloadSeoData', 'hasUnsavedChanges', 'loadErrorMessage', 'submitError', 'seoPagesError', 'seoPagesRepairDraft', 'applySeoPagesRepair', 'resetSeoPagesRepair'] : ['getData', 'handleSubmit', 'formData', 'retryLoadData', 'openImport', 'applyImport', 'importSource', 'importError', 'importVisible', 'hasUnsavedChanges', 'loadErrorMessage', 'submitError']
    const page = module('views/setting/website/' + name + '.vue', { ...bindings, ...links, ...content, ...defaults, useConfigLoad, useOperateSubmit, useConfigEditor, defaultChangelogTimelineSource: [], localStorage: { getItem: () => null, setItem() {} }, useAppStore: () => ({ config: {} }), useUserStore: () => user, getWebsite: async () => { calls.reads++; return io.read() }, setWebsite: async payload => { calls.saves.push(JSON.parse(JSON.stringify(payload))); return io.save(payload) } }, names)
    return { page, io, calls, user, hooks, initial }
}
/** 提供手动完成的异步边界，复现确认与保存之间的并发。 */
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes }); return { promise, resolve } }

test('SEO只保存改变字段，保留合法空值及页面扩展信息', async () => {
    const { page, calls } = createPage()
    await page.getData()
    assert.equal(page.formData.toolsSeoDefaultImage, '')
    assert.equal(page.seoPages.value[0].image, '')
    page.formData.toolsSeoDefaultTitle = '新标题'
    await page.handleSubmit()
    assert.deepEqual(calls.saves, [{ toolsSeoDefaultTitle: '新标题' }])
    page.seoPages.value[0].title = '新首页'
    await page.handleSubmit()
    assert.deepEqual(Object.keys(calls.saves[1]), ['toolsSeoPages'])
    assert.deepEqual(JSON.parse(calls.saves[1].toolsSeoPages)[0].extension, { rank: 0, enabled: false })
})
test('SEO坏JSON和有效空数组不恢复默认，不随无关标题保存被覆写', async () => {
    for (const raw of ['[bad', '[]', '[null]', '[{"path":123}]']) {
        const { page, calls } = createPage('seo', { ...fixture(), toolsSeoPages: raw })
        await page.getData()
        assert.equal(page.seoPages.value.length, 0)
        page.formData.toolsSeoDefaultTitle = '只改标题'
        await page.handleSubmit()
        assert.deepEqual(calls.saves, [{ toolsSeoDefaultTitle: '只改标题' }])
    }
})
test('SEO异常或不完整响应保留草稿，加载失败不保存默认值', async () => {
    const { page, io, calls } = createPage()
    await page.getData()
    page.formData.toolsSeoDefaultTitle = '保留草稿'
    io.read = async () => ({ toolsSeoDefaultTitle: '错误响应' })
    await page.reloadSeoData()
    assert.equal(page.formData.toolsSeoDefaultTitle, '保留草稿')
    assert.notEqual(page.loadErrorMessage.value, '')
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
})
test('SEO隐藏的分享图校验错误自动展开高级模式', async () => {
    const { page, calls } = createPage()
    await page.getData()
    page.seoPages.value[0].image = 'javascript:bad'
    await page.handleSubmit()
    assert.equal(page.simpleMode.value, false)
    assert.equal(calls.saves.length, 0)
})
test('SEO只读账号不能操作列表、默认恢复或直接保存', async () => {
    const { page, calls } = createPage('seo', fixture(), false)
    await page.getData()
    page.addSeoPage()
    await page.restoreDefaultSeo()
    assert.equal(page.seoPages.value.length, 1)
    assert.equal(page.hasUnsavedChanges.value, false)
    page.formData.toolsSeoDefaultTitle = '绕过界面调用'
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
})
test('学习与更新只读账号不能导入草稿或直接保存', async () => {
    const { page, calls } = createPage('frontend_layout', content.createFrontendContent(), false)
    await page.getData()
    page.openImport()
    assert.equal(page.importVisible.value, false)
    page.importSource.value = '{"toolsHomepageLearningTitle":"不应导入"}'
    page.applyImport()
    assert.equal(page.formData.toolsHomepageLearningTitle, '每日学习')
    page.formData.toolsHomepageLearningTitle = '绕过界面调用'
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
})
test('两页重载确认期间开始保存，迟到确认不得触发读取并丢失新草稿', async () => {
    for (const name of ['seo', 'frontend_layout']) {
        const { page, calls, io } = createPage(name)
        await page.getData()
        const key = name === 'seo' ? 'toolsSeoDefaultTitle' : 'toolsHomepageLearningTitle'
        page.formData[key] = '第一版'
        const confirmation = deferred(), save = deferred()
        io.confirm = () => confirmation.promise
        io.save = () => save.promise
        const reload = name === 'seo' ? page.reloadSeoData() : page.retryLoadData()
        const saving = page.handleSubmit()
        page.formData[key] = '第二版草稿'
        confirmation.resolve()
        await reload
        assert.equal(calls.reads, 1)
        save.resolve({})
        await saving
        assert.equal(page.formData[key], '第二版草稿')
        assert.equal(page.hasUnsavedChanges.value, true)
    }
})
test('更新记录确认删除期间切换版本，不误删另一个版本', async () => {
    const confirmation = deferred(), emitted = []
    const props = reactive({ modelValue: '[{"version":"A"},{"version":"B"}]', defaultValue: '[]', disabled: false })
    const component = module('views/setting/website/components/content-timeline-editor.vue', { ...content, defineProps: () => props, withDefaults: value => value, defineEmits: () => (event, value) => emitted.push(value), feedback: { confirm: () => confirmation.promise } }, ['selected', 'removeVersion'])
    const removing = component.removeVersion()
    component.selected.value = 1
    confirmation.resolve()
    await removing
    assert.equal(emitted.length, 0)
})
test('更新记录编辑拒绝精度丢失的数字，不把扩展字段大整数舍入', () => {
    assert.throws(() => content.updateContentItem('[{"version":"A","id":9007199254740993}]', 0, 'title', '新标题'), /数字|无损/)
})


test('SEO修复原文必须明确应用，未应用稿不能被其他保存当成成功', async () => {
    const { page, calls } = createPage('seo', { ...fixture(), toolsSeoPages: '[bad' })
    await page.getData()
    page.seoPagesRepairDraft.value = '[{"path":"/fixed","title":"修复页面","description":"已修复","extra":{"keep":true}}]'
    page.formData.toolsSeoDefaultTitle = '另一个草稿'
    assert.equal(page.hasUnsavedChanges.value, true)
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
    page.applySeoPagesRepair()
    await page.handleSubmit()
    assert.equal(page.seoPagesError.value, '')
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.deepEqual(JSON.parse(calls.saves[0].toolsSeoPages)[0].extra, { keep: true })
})
test('学习与更新不完整重载响应不能把已有草稿替换成默认配置', async () => {
    const { page, io, calls } = createPage('frontend_layout')
    await page.getData()
    page.formData.toolsHomepageLearningTitle = '应保留的草稿'
    io.read = async () => ({ toolsChangelogStatsText: '响应缺失字段' })
    await page.retryLoadData()
    assert.equal(page.formData.toolsHomepageLearningTitle, '应保留的草稿')
    assert.notEqual(page.loadErrorMessage.value, '')
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
})
test('只读更新记录仍可选择版本，全部修改事件及删除确认被阻止', async () => {
    const emitted = [], confirmations = []
    const props = reactive({ modelValue: '[{"version":"A"},{"version":"B"}]', defaultValue: '[]', disabled: true })
    const component = module('views/setting/website/components/content-timeline-editor.vue', { ...content, defineProps: () => props, withDefaults: value => value, defineEmits: () => (event, value) => emitted.push(value), feedback: { confirm: async () => confirmations.push(true) } }, ['selected', 'selectVersion', 'updateVersion', 'addVersion', 'moveVersion', 'removeVersion', 'loadDefaults', 'replaceRaw'])
    component.selectVersion(1)
    assert.equal(component.selected.value, 1)
    component.updateVersion('title', '不可修改')
    component.addVersion()
    component.moveVersion(-1)
    await component.removeVersion()
    component.loadDefaults()
    component.replaceRaw('[]')
    assert.equal(emitted.length, 0)
    assert.equal(confirmations.length, 0)
})


test('配置导入的数组扩展数字也先校验精度，失败保留整份原草稿', async () => {
    const { page } = createPage('frontend_layout')
    await page.getData()
    page.formData.toolsHomepageLearningTitle = '原草稿'
    page.importSource.value = '{"toolsHomepageLearningTitle":"不应部分导入","toolsChangelogTimeline":[{"version":"A","id":9007199254740993}]}'
    page.applyImport()
    assert.equal(page.formData.toolsHomepageLearningTitle, '原草稿')
    assert.match(page.importError.value, /数字|无损/)
})
