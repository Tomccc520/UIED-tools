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

/** 编译并执行真实页面脚本，网络和浏览器边界由测试替代。 */
const execute = (source, bindings, names) => {
    const parsed = ts.createSourceFile('subject.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, computed, reactive, ref, ...bindings })
    vm.runInContext(ts.transpileModule(code + '\nthis.subject={' + names.join(',') + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return context.subject
}
/** 构造样例配置，不访问真实热搜或用户数据。 */
const fixture = () => ({ isHotSearch: 1, list: [{ name: '图片压缩', sort: 2 }, { name: 'JSON格式化', sort: 8 }] })
/** 转换跨沙箱对象，方便比较实际提交值。 */
const clone = value => JSON.parse(JSON.stringify(value))
/** 使用生产门禁函数与页面，注入可控网络、权限和确认结果。 */
const createPage = (perms = ['*']) => {
    const calls = { reads: 0, writes: [], successes: [], errors: [], confirms: 0 }
    const io = { read: async () => fixture(), save: async () => {} }
    const feedback = { msgSuccess: message => calls.successes.push(message), msgError: message => calls.errors.push(message), confirm: async () => { calls.confirms++ } }
    const composable = (file, name) => execute(fs.readFileSync(new URL('../src/composables/' + file, import.meta.url), 'utf8'), { feedback }, [name])[name]
    const hooks = { leave: null }
    const script = fs.readFileSync(new URL('../src/views/setting/search/index.vue', import.meta.url), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const bindings = {
        feedback, useUserStore: () => ({ perms }),
        useConfigLoad: composable('use-config-load.ts', 'useConfigLoad'), useOperateSubmit: composable('use-operate-submit.ts', 'useOperateSubmit'),
        getSearch: async () => { calls.reads++; return io.read() }, setSearch: async payload => { calls.writes.push(clone(payload)); await io.save(payload) },
        onMounted() {}, onBeforeUnmount() {}, onActivated() {}, onDeactivated() {}, onBeforeRouteLeave: callback => { hooks.leave = callback }, window: { addEventListener() {}, removeEventListener() {} }
    }
    bindings.useConfigEditor = execute(fs.readFileSync(new URL('../src/composables/use-config-editor.ts', import.meta.url), 'utf8'), bindings, ['useConfigEditor']).useConfigEditor
    const page = execute(script, bindings, ['getData', 'reloadData', 'handleSave', 'handleAdd', 'handleDel', 'formData', 'previewList', 'hasUnsavedChanges', 'hasLoadedData', 'loadErrorMessage', 'submitError', 'isSubmitting', 'canEdit'])
    return { page, calls, io, feedback, hooks }
}
/** 手动完成保存，测试并发、快照和禁止重读。 */
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes }); return { promise, resolve } }

test('首读失败不能用默认值覆盖配置，重试成功后才允许保存', async () => {
    const { page, calls, io } = createPage()
    io.read = async () => { throw Error('网络失败') }
    assert.equal(await page.getData(), false)
    assert.ok(page.loadErrorMessage.value)
    page.handleAdd()
    assert.equal(page.formData.list.length, 0)
    page.formData.list = [{ name: '有效内容', sort: 1, __rowKey: 'fake' }]
    await page.handleSave()
    assert.equal(calls.writes.length, 0)
    io.read = async () => fixture()
    assert.equal(await page.getData(), true)
    page.formData.isHotSearch = 0
    assert.equal(await page.handleSave(), true)
    assert.equal(calls.writes[0].isHotSearch, 0)
    assert.equal(page.hasUnsavedChanges.value, false)
})

test('异常响应整体拒绝，不能部分回填开关或列表', async () => {
    const { page, io } = createPage()
    await page.getData()
    page.formData.list[0].name = '未保存草稿'
    const before = clone(page.formData)
    for (const data of [null, {}, { isHotSearch: 0, list: null }, { isHotSearch: 0, list: [{ name: '错误', sort: NaN }] }, { isHotSearch: 2, list: [] }]) {
        io.read = async () => data
        assert.equal(await page.reloadData(), false)
        assert.deepEqual(clone(page.formData), before)
    }
})

test('取消重载不读接口，重载失败保留草稿且暂停发布', async () => {
    const { page, calls, io, feedback } = createPage()
    await page.getData()
    page.formData.list[0].name = '待保存关键词'
    feedback.confirm = async () => { throw Error('取消') }
    assert.equal(await page.reloadData(), false)
    assert.equal(calls.reads, 1)
    feedback.confirm = async () => {}
    io.read = async () => { throw Error('重载失败') }
    assert.equal(await page.reloadData(), false)
    assert.equal(page.formData.list[0].name, '待保存关键词')
    assert.equal(page.hasUnsavedChanges.value, true)
    assert.equal(await page.handleSave(), false)
    assert.equal(calls.writes.length, 0)
    io.read = async () => fixture()
    assert.equal(await page.reloadData(), true)
    assert.equal(page.hasUnsavedChanges.value, false)
})

test('保存失败保留原草稿和可重试载荷，不发成功提示', async () => {
    const { page, calls, io } = createPage()
    await page.getData()
    page.formData.list[0].name = '修改的关键词'
    io.save = async () => { throw Error('保存失败') }
    assert.equal(await page.handleSave(), false)
    assert.equal(page.hasUnsavedChanges.value, true)
    assert.ok(page.submitError.value)
    assert.equal(calls.successes.length, 0)
    io.save = async () => {}
    assert.equal(await page.handleSave(), true)
    assert.deepEqual(calls.writes[0], calls.writes[1])
    assert.equal(page.submitError.value, '')
    assert.equal(page.hasUnsavedChanges.value, false)
})

test('保存使用独立快照并锁定重复提交，稍后的修改保留为草稿', async () => {
    const { page, calls, io, hooks } = createPage()
    await page.getData()
    page.formData.list[0].name = '本次提交'
    const pending = deferred()
    io.save = () => pending.promise
    const saving = page.handleSave()
    assert.equal(await page.handleSave(), false)
    assert.equal(await page.reloadData(), false)
    assert.equal(await hooks.leave(), false)
    page.handleAdd()
    page.handleDel(0)
    assert.equal(page.formData.list.length, 2)
    page.formData.list[0].name = '后来的草稿'
    assert.equal(calls.writes.length, 1)
    assert.equal(calls.writes[0].list[0].name, '本次提交')
    pending.resolve()
    assert.equal(await saving, true)
    assert.equal(page.formData.list[0].name, '后来的草稿')
    assert.equal(page.hasUnsavedChanges.value, true)
    assert.equal(calls.reads, 1)
})

test('POST成功后不重读配置，后续接口失败不覆盖草稿或误报', async () => {
    const { page, calls, io } = createPage()
    await page.getData()
    page.formData.isHotSearch = 0
    io.read = async () => { throw Error('后续读取失败') }
    assert.equal(await page.handleSave(), true)
    assert.equal(calls.reads, 1)
    assert.equal(calls.successes.length, 1)
    assert.equal(page.submitError.value, '')
})

test('只读权限禁止脚本增删保存，离开确认仍保护本地编辑', async () => {
    const { page, calls, feedback, hooks } = createPage([])
    await page.getData()
    assert.equal(page.canEdit.value, false)
    page.handleAdd()
    page.handleDel(0)
    assert.equal(page.formData.list.length, 2)
    page.formData.isHotSearch = 0
    assert.equal(await page.handleSave(), false)
    assert.equal(calls.writes.length, 0)
    feedback.confirm = async () => { throw Error('取消离开') }
    assert.equal(await hooks.leave(), false)
})

test('新增删除和排序预览保留编辑顺序，保存不传界面行键', async () => {
    const { page, calls } = createPage(['setting:search:save'])
    await page.getData()
    assert.deepEqual(clone(page.previewList.value).map(item => item.name), ['JSON格式化', '图片压缩'])
    assert.equal(page.formData.list[0].name, '图片压缩')
    page.handleAdd()
    page.formData.list[2].name = 'PDF压缩'
    page.formData.list[2].sort = 10
    page.handleDel(-1)
    page.handleDel(20)
    assert.equal(page.formData.list.length, 3)
    assert.equal(await page.handleSave(), true)
    assert.deepEqual(calls.writes[0].list, [{ name: '图片压缩', sort: 2 }, { name: 'JSON格式化', sort: 8 }, { name: 'PDF压缩', sort: 10 }])
    page.handleDel(2); page.handleDel(1); page.handleDel(0)
    assert.equal(await page.handleSave(), true)
    assert.deepEqual(calls.writes[1].list, [], '用户清空列表是明确配置，不能补回默认词')
})

test('空词和非法排序拒绝发布并保留原输入供修正', async () => {
    const { page, calls } = createPage()
    await page.getData()
    page.handleAdd()
    assert.equal(await page.handleSave(), false)
    assert.equal(page.formData.list.length, 3)
    page.formData.list[2].name = '有效关键词'
    page.formData.list[2].sort = 1.5
    assert.equal(await page.handleSave(), false)
    page.formData.list[2].sort = -1
    assert.equal(await page.handleSave(), false)
    assert.equal(calls.writes.length, 0)
    assert.equal(calls.errors.length, 3)
})
