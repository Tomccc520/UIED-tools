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
import { computed, reactive, ref, watch } from 'vue'
import { readConfigObjectArray } from '../src/views/setting/website/composables/config-links.ts'

const root = new URL('../src/views/setting/website/', import.meta.url)
/** 编译真实源码，仅替换网络、提示和生命周期边界，不复写被测保存逻辑。 */
const execute = (source, bindings, names) => {
    const parsed = ts.createSourceFile('subject.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const compiled = ts.transpileModule(code + '\nthis.subject = {' + names.join(',') + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText
    const context = vm.createContext({ exports: {}, URL, computed, reactive, ref, watch, ...bindings })
    vm.runInContext(compiled, context)
    return context.subject
}
const helpers = execute(fs.readFileSync(new URL('composables/frontend-content.ts', root), 'utf8'), { readConfigObjectArray }, [
    'frontendContentKeys', 'createFrontendContent', 'readFrontendContent', 'buildFrontendContentPatch',
    'readContentArray', 'updateContentItem', 'validateContentTimeline', 'validateFrontendContent'
])
/** 构造真实页面，使用实际加载/保存组合式函数，接口全在内存运行。 */
const createPage = () => {
    const calls = { saves: [], success: [], errors: [], confirms: 0, reads: 0 }
    const initial = { ...helpers.createFrontendContent(), otherPage: '不能写入', toolsChangelogTimeline: '[]' }
    const io = { read: async () => initial, save: async () => ({}), confirm: async () => {} }
    const feedback = { msgSuccess: text => calls.success.push(text), msgError: text => calls.errors.push(text), confirm: async () => { calls.confirms++; return io.confirm() } }
    const lifecycle = { onMounted() {}, onActivated() {}, onDeactivated() {}, onBeforeUnmount() {}, onBeforeRouteLeave() {} }
    const composable = (file, name, bindings = {}) => execute(fs.readFileSync(new URL('../src/composables/' + file, import.meta.url), 'utf8'), { feedback, ...lifecycle, ...bindings }, [name])[name]
    const useConfigLoad = composable('use-config-load.ts', 'useConfigLoad')
    const useOperateSubmit = composable('use-operate-submit.ts', 'useOperateSubmit')
    const useConfigEditor = composable('use-config-editor.ts', 'useConfigEditor', { useConfigLoad, useOperateSubmit })
    const source = fs.readFileSync(new URL('frontend_layout.vue', root), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const page = execute(source, {
        ...helpers, readConfigObjectArray, feedback, defaultChangelogTimelineSource: [],
        localStorage: { getItem: () => null, setItem() {} },
        useAppStore: () => ({ config: {} }),
        useConfigEditor,
        useUserStore: () => ({ perms: ['*'] }),
        getWebsite: async () => { calls.reads++; return io.read() },
        setWebsite: async payload => { calls.saves.push(JSON.parse(JSON.stringify(payload))); return io.save(payload) },
        onMounted() {}, onBeforeUnmount() {}, onBeforeRouteLeave() {}
    }, ['formData', 'getData', 'retryLoadData', 'handleSubmit', 'hasUnsavedChanges', 'submitError',
        'lastSavedAt', 'loadErrorMessage', 'validationMessage', 'baselineLayoutSnapshot', 'activeTab',
        'importSource', 'importError', 'applyImport', 'learningSourceExpanded', 'pageOptionsExpanded'])
    return { page, calls, io, initial }
}

test('首次读取失败不保存默认配置，恢复后只PATCH已改字段', async () => {
    const { page, calls, io } = createPage()
    io.read = async () => { throw new Error('offline') }
    await page.getData()
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
    assert.notEqual(page.loadErrorMessage.value, '')
    io.read = async () => helpers.createFrontendContent()
    await page.retryLoadData()
    page.formData.toolsHomepageLearningTitle = '新栏目'
    await page.handleSubmit()
    assert.deepEqual(calls.saves, [{ toolsHomepageLearningTitle: '新栏目' }])
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.notEqual(page.lastSavedAt.value, '')
})

test('保存失败保留草稿与基线，重试仍发送同一修改', async () => {
    const { page, io, calls } = createPage()
    await page.getData()
    const baseline = page.baselineLayoutSnapshot.value
    page.formData.toolsHomepageLearningTitle = '草稿标题'
    io.save = async () => { throw new Error('write failed') }
    await page.handleSubmit()
    assert.equal(page.baselineLayoutSnapshot.value, baseline)
    assert.equal(page.hasUnsavedChanges.value, true)
    assert.notEqual(page.submitError.value, '')
    io.save = async () => ({})
    await page.handleSubmit()
    assert.deepEqual(calls.saves[0], calls.saves[1])
    assert.equal(page.hasUnsavedChanges.value, false)
})

test('保存进行中不重复写入，提交后的新草稿仍是未保存', async () => {
    const { page, io, calls } = createPage()
    await page.getData()
    page.formData.toolsHomepageLearningTitle = '本次提交'
    let finish
    io.save = () => new Promise(resolve => { finish = resolve })
    const pending = page.handleSubmit()
    await page.handleSubmit()
    assert.equal(calls.saves.length, 1)
    page.formData.toolsHomepageLearningTitle = '提交后的修改'
    finish({})
    await pending
    assert.equal(page.hasUnsavedChanges.value, true)
    assert.equal(JSON.parse(page.baselineLayoutSnapshot.value).toolsHomepageLearningTitle, '本次提交')
})

test('重新加载取消或失败均保留草稿，失败后禁止继续保存', async () => {
    const { page, io, calls } = createPage()
    await page.getData()
    page.formData.toolsHomepageLearningTitle = '不丢失的草稿'
    io.confirm = async () => { throw new Error('cancel') }
    await page.retryLoadData()
    assert.equal(calls.reads, 1)
    io.confirm = async () => {}
    io.read = async () => { throw new Error('offline') }
    await page.retryLoadData()
    assert.equal(page.formData.toolsHomepageLearningTitle, '不丢失的草稿')
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
})

test('保存不依赖第二次整页GET，成功后不额外重读表单', async () => {
    const { page, io, calls } = createPage()
    await page.getData()
    io.read = async () => { throw new Error('future read fails') }
    page.formData.toolsHomepageLearningTitle = '已保存内容'
    await page.handleSubmit()
    assert.equal(calls.reads, 1)
    assert.equal(calls.success.length, 1)
    assert.equal(page.submitError.value, '')
})

test('更新记录错误定位到更新模块，无关未修改的历史JSON不阻止栏目保存', async () => {
    const { page, calls } = createPage()
    await page.getData()
    page.formData.toolsHomepageLearningTitle = '有效新栏目'
    page.formData.toolsChangelogTimeline = '{invalid'
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
    assert.equal(page.activeTab.value, 'pageOps')
    assert.notEqual(page.validationMessage.value, '')
    const next = createPage()
    next.io.read = async () => ({ ...helpers.createFrontendContent(), toolsChangelogTimeline: '{legacy-invalid' })
    await next.page.getData()
    next.page.formData.toolsHomepageLearningTitle = '只改栏目'
    await next.page.handleSubmit()
    assert.deepEqual(next.calls.saves, [{ toolsHomepageLearningTitle: '只改栏目' }])
})

test('配置导入先完整验证，失败不改原稿，部分导入只覆盖本页明确字段', async () => {
    const { page, calls } = createPage()
    await page.getData()
    page.formData.toolsHomepageLearningTitle = '原草稿'
    page.importSource.value = '{broken'
    page.applyImport()
    assert.equal(page.formData.toolsHomepageLearningTitle, '原草稿')
    assert.notEqual(page.importError.value, '')
    page.importSource.value = JSON.stringify({ toolsChangelogStatsText: '新摘要', toolsSidebarBrandText: '不能越界' })
    page.applyImport()
    assert.equal(page.formData.toolsHomepageLearningTitle, '原草稿')
    assert.equal(page.formData.toolsChangelogStatsText, '新摘要')
    assert.equal('toolsSidebarBrandText' in page.formData, false)
    assert.equal(calls.saves.length, 0)
})

test('版本编辑保留未知字段、相邻版本与未修改分组', () => {
    const original = [{ id: 'v1', version: '1', date: '2026-10-26', title: '版本一', custom: { enabled: true }, features: [{ title: '功能', points: ['原文'], extension: '保留' }] }, { version: '2', untouched: true }]
    const updated = JSON.parse(helpers.updateContentItem(JSON.stringify(original), 0, 'title', '新标题'))
    assert.deepEqual(updated[0].custom, original[0].custom)
    assert.deepEqual(updated[0].features, original[0].features)
    assert.deepEqual(updated[1], original[1])
    assert.equal(updated[0].title, '新标题')
})

test('拒绝坏数组、重复版本与空更新组，不静默过滤数据', () => {
    assert.throws(() => helpers.readContentArray('[null]'))
    assert.throws(() => helpers.updateContentItem('[]', 0, 'title', 'x'))
    const record = { version: '1', title: '记录', date: '2026-10-26', features: [{ title: '修复', points: ['内容'] }] }
    assert.equal(helpers.validateContentTimeline(JSON.stringify([record])), '')
    assert.match(helpers.validateContentTimeline(JSON.stringify([record, record])), /重复/)
    assert.match(helpers.validateContentTimeline(JSON.stringify([{ ...record, features: [] }])), /至少/)
})

test('RSS与链接校验只允许预期协议/主机，合法分类与原始链接字段保留', () => {
    const form = helpers.createFrontendContent()
    form.toolsHomepageLearningRssUrl = 'https://evil.example/feed'
    assert.match(helpers.validateFrontendContent(form, { toolsHomepageLearningTitle: 'x' }), /RSS/)
    form.toolsHomepageLearningRssUrl = 'https://uied.cn/feed'
    form.toolsHomepageLearningFilterType = 'categories'
    form.toolsHomepageLearningCategoryIds = '307, 417'
    assert.equal(helpers.validateFrontendContent(form, { toolsHomepageLearningTitle: 'x' }), '')
    form.toolsChangelogHeaderLinks = JSON.stringify([{ name: '网站', link: 'javascript:alert(1)' }])
    assert.notEqual(helpers.validateFrontendContent(form, { toolsChangelogHeaderLinks: form.toolsChangelogHeaderLinks }), '')
})

test('校验失败展开隐藏设置，便于修正 RSS 和链接且不提前保存', async () => {
    const { page, calls } = createPage()
    await page.getData()
    page.formData.toolsHomepageLearningRssUrl = 'https://invalid.example/rss'
    await page.handleSubmit()
    assert.equal(page.activeTab.value, 'homepageLearning')
    assert.equal(page.learningSourceExpanded.value, true)
    assert.equal(calls.saves.length, 0)
    page.formData.toolsHomepageLearningRssUrl = helpers.createFrontendContent().toolsHomepageLearningRssUrl
    page.formData.toolsChangelogTimeline = JSON.stringify([{ version: '3.0.6', title: '有效版本', date: '2026-10-26', features: [{ title: '修复', points: ['有效更新'] }] }])
    page.formData.toolsChangelogHeaderLinks = JSON.stringify([{ name: '网站', link: 'javascript:alert(1)' }])
    await page.handleSubmit()
    assert.equal(page.activeTab.value, 'pageOps')
    assert.equal(page.pageOptionsExpanded.value, true)
    assert.equal(calls.saves.length, 0)
})
