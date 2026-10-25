/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { computed, reactive, ref } from 'vue'
import { flattenCatalogEditorTree, readCatalogEditorTree, updateCatalogEditorTool, resolveCatalogPreviewHref } from '../src/views/setting/website/composables/tool-catalog-editor.ts'

const viewUrl = new URL('../src/views/setting/website/', import.meta.url)
/** 读取真实页面脚本，确保测试运行生产实现。 */
const readScript = (file) => fs.readFileSync(new URL(file, viewUrl), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
/** 编译真实 TypeScript，注入响应式能力与可控网络边界。 */
const execute = (source, bindings, exposed) => {
    const parsed = ts.createSourceFile('subject.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter((item) => !ts.isImportDeclaration(item)).map((item) => item.getText(parsed)).join('\n')
    const compiled = ts.transpileModule(code + '\nthis.subject = {' + exposed.join(', ') + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText
    const context = vm.createContext({ exports: {}, computed, reactive, ref, URL, Error, ...bindings })
    vm.runInContext(compiled, context)
    return context.subject
}
/** 创建包含扩展字段与相邻工具的目录，检查写入范围和数据保真。 */
const fixture = () => JSON.stringify([{ title: '图片', extraCategory: 7, list: [{ title: '处理', list: [{ title: '图片压缩', url: '/tools/image-compress', desc: '原简介', extension: { keep: true } }, { title: '格式转换', url: '/tools/image-to-webp', desc: '相邻工具' }] }] }])
/** 创建真实工具管理页，仅替换网络、权限和浏览器生命周期。 */
const createPage = (permissions = ['setting:website:catalog:save']) => {
    const calls = { reads: 0, writes: [], refreshes: 0, errors: [], warnings: [], successes: [] }
    const io = { read: async () => ({ toolsCategoryTree: fixture() }), save: async () => ({}), refresh: async () => {} }
    const feedback = { msgSuccess: (text) => calls.successes.push(text), msgError: (text) => calls.errors.push(text), msgWarning: (text) => calls.warnings.push(text), confirm: async () => {} }
    const composable = (file, name) => execute(fs.readFileSync(new URL('composables/' + file, viewUrl), 'utf8'), { feedback }, [name])[name]
    const user = reactive({ perms: permissions })
    const page = execute(readScript('tools_catalog.vue'), {
        feedback, readCatalogEditorTree,
        useRouter: () => ({ push() {} }), useUserStore: () => user,
        useAppStore: () => ({ config: {}, getConfig: async () => { calls.refreshes++; await io.refresh() } }),
        useOperateSubmit: composable('use-operate-submit.ts', 'useOperateSubmit'),
        useConfigLoad: composable('use-config-load.ts', 'useConfigLoad'),
        getWebsite: async () => { calls.reads++; return io.read() },
        setWebsite: async (patch) => { calls.writes.push({ ...patch }); return io.save(patch) },
        onMounted() {}, onBeforeUnmount() {}, onBeforeRouteLeave() {},
        window: { addEventListener() {}, removeEventListener() {} }
    }, ['getData', 'handleSubmit', 'persistToolChanges', 'refreshCatalogConfig', 'toolsCategoryTreeEditor', 'hasUnsavedChanges', 'catalogRefreshWarning', 'submitError', 'canSaveCatalog', 'isSubmitting'])
    return { page, io, calls, user }
}
/** 创建真实抽屉脚本，捕获列表草稿事件并透传父页真实保存回调。 */
const createEditor = (source, persistChanges, overrides = {}) => {
    const props = reactive({ modelValue: source, disabled: false, canEdit: true, pendingChanges: false, previewBase: 'https://uiedtool.com/', persistChanges, ...overrides })
    const calls = { updates: [], successes: [] }
    const editor = execute(readScript('components/catalog-tool-editor.vue'), {
        flattenCatalogEditorTree, updateCatalogEditorTool, resolveCatalogPreviewHref,
        useAppStore: () => ({ isMobile: false }),
        withDefaults: (value) => value, defineProps: () => props,
        defineEmits: () => (event, value) => { calls.updates.push({ event, value }); props.modelValue = value },
        feedback: { msgSuccess: (text) => calls.successes.push(text), confirm: async () => {} },
        onMounted() {}, onBeforeUnmount() {}, onBeforeRouteLeave() {},
        window: { addEventListener() {}, removeEventListener() {} }
    }, ['openEditor', 'saveChanges', 'applyChanges', 'confirmClose', 'draft', 'selected', 'editError', 'isPersisting', 'draftChanged'])
    editor.openEditor(flattenCatalogEditorTree(source)[0])
    return { editor, props, calls }
}
/** 创建手动完成的请求，检查处理中重复操作和关闭门禁。 */
const deferred = () => { let resolve; const promise = new Promise((yes) => { resolve = yes }); return { promise, resolve } }
/** 修改首项标题生成直存快照，保留其它字段。 */
const editFirstTitle = (source, title) => { const [row] = flattenCatalogEditorTree(source); return updateCatalogEditorTool(source, row.key, JSON.stringify(row.tool), { title }) }

test('抽屉一次保存成功才关闭，父页只补丁保存目录并保留未知字段和相邻工具', async () => {
    const { page, calls } = createPage()
    await page.getData()
    const { editor, calls: drawer } = createEditor(page.toolsCategoryTreeEditor.value, page.persistToolChanges)
    editor.draft.title = '新的图片压缩'
    await editor.saveChanges()
    assert.equal(editor.selected.value, null)
    assert.equal(drawer.updates.length, 0)
    assert.equal(calls.writes.length, 1)
    assert.deepEqual(Object.keys(calls.writes[0]), ['toolsCategoryTree'])
    const saved = readCatalogEditorTree(calls.writes[0].toolsCategoryTree)
    assert.equal(saved[0].list[0].list[0].title, '新的图片压缩')
    assert.deepEqual(saved[0].list[0].list[0].extension, { keep: true })
    assert.equal(saved[0].extraCategory, 7)
    assert.equal(saved[0].list[0].list[1].desc, '相邻工具')
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.equal(calls.reads, 1, '写成功后不重读覆盖编辑区')
})

test('持久化失败保留抽屉草稿和父页基线，重试仍提交相同修改', async () => {
    const { page, io, calls } = createPage()
    await page.getData()
    const source = page.toolsCategoryTreeEditor.value
    io.save = async () => { throw Error('模拟写入失败') }
    const { editor } = createEditor(source, page.persistToolChanges)
    editor.draft.title = '失败后保留'
    await editor.saveChanges()
    assert.ok(editor.selected.value)
    assert.equal(editor.draft.title, '失败后保留')
    assert.match(editor.editError.value, /未保存/)
    assert.equal(page.toolsCategoryTreeEditor.value, source)
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.equal(calls.successes.length, 0)
    io.save = async () => ({})
    await editor.saveChanges()
    assert.equal(editor.selected.value, null)
    assert.equal(JSON.parse(calls.writes[1].toolsCategoryTree)[0].list[0].list[0].title, '失败后保留')
})

test('前端缓存读回失败仍认定写入成功，独立警告可重试且不改变基线', async () => {
    const { page, io, calls } = createPage()
    await page.getData()
    io.refresh = async () => { throw Error('模拟缓存刷新失败') }
    const { editor } = createEditor(page.toolsCategoryTreeEditor.value, page.persistToolChanges)
    editor.draft.desc = '写入已成功'
    await editor.saveChanges()
    assert.equal(editor.selected.value, null)
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.equal(page.submitError.value, '')
    assert.equal(calls.successes.length, 1)
    assert.match(page.catalogRefreshWarning.value, /已保存.*刷新失败/)
    const baseline = page.toolsCategoryTreeEditor.value
    io.refresh = async () => {}
    assert.equal(await page.refreshCatalogConfig(), true)
    assert.equal(page.catalogRefreshWarning.value, '')
    assert.equal(page.toolsCategoryTreeEditor.value, baseline)
    assert.equal(calls.writes.length, 1)
})

test('已有其它目录草稿时直存被阻止，应用到列表后才可明确统一保存', async () => {
    const { page, calls } = createPage()
    await page.getData()
    const rows = readCatalogEditorTree(page.toolsCategoryTreeEditor.value)
    rows[0].list[0].list[1].desc = '尚未确认的其它草稿'
    page.toolsCategoryTreeEditor.value = JSON.stringify(rows)
    const source = page.toolsCategoryTreeEditor.value
    assert.equal(await page.persistToolChanges(editFirstTitle(source, '首项修改'), source), false)
    assert.equal(calls.writes.length, 0)
    const { editor, props } = createEditor(source, page.persistToolChanges, { pendingChanges: true })
    editor.draft.title = '首项修改'
    await editor.saveChanges()
    assert.ok(editor.selected.value)
    assert.match(editor.editError.value, /未保存更改/)
    editor.applyChanges()
    assert.equal(editor.selected.value, null)
    page.toolsCategoryTreeEditor.value = props.modelValue
    await page.handleSubmit()
    const saved = readCatalogEditorTree(calls.writes[0].toolsCategoryTree)[0].list[0].list
    assert.equal(saved[0].title, '首项修改')
    assert.equal(saved[1].desc, '尚未确认的其它草稿')
})

test('来源目录已改变时拒绝直存，不能覆盖加载或同步后的新数据', async () => {
    const { page, calls } = createPage()
    await page.getData()
    const source = page.toolsCategoryTreeEditor.value
    assert.equal(await page.persistToolChanges(editFirstTitle(source, '新标题'), source + '\n'), false)
    assert.equal(calls.writes.length, 0)
})

test('只读权限不能打开编辑、应用草稿或经父页函数越权保存', async () => {
    const { page, calls } = createPage([])
    await page.getData()
    const source = page.toolsCategoryTreeEditor.value
    const { editor, props, calls: drawer } = createEditor(source, page.persistToolChanges, { canEdit: false })
    assert.equal(editor.selected.value, null)
    props.canEdit = true
    editor.openEditor(flattenCatalogEditorTree(source)[0])
    editor.draft.title = '越权修改'
    props.canEdit = false
    editor.applyChanges()
    await editor.saveChanges()
    await page.handleSubmit()
    assert.equal(await page.persistToolChanges(editFirstTitle(source, '绕过按钮'), source), false)
    assert.equal(calls.writes.length, 0)
    assert.equal(drawer.updates.length, 0)
    assert.ok(editor.selected.value)
})

test('超级管理员具备保存权限；读取失败后即使有草稿也不能发布', async () => {
    const { page, io, calls } = createPage(['*'])
    assert.equal(page.canSaveCatalog.value, true)
    io.read = async () => { throw Error('首次加载失败') }
    await page.getData()
    await page.handleSubmit()
    assert.equal(await page.persistToolChanges(fixture(), '[]'), false)
    assert.equal(calls.writes.length, 0)
})

test('保存进行中阻止重复提交、应用和关闭，成功前不改变页面目录', async () => {
    const pending = deferred()
    const { page, io, calls } = createPage()
    await page.getData()
    const source = page.toolsCategoryTreeEditor.value
    io.save = () => pending.promise
    const { editor, calls: drawer } = createEditor(source, page.persistToolChanges)
    editor.draft.title = '等待保存'
    const saving = editor.saveChanges()
    await editor.saveChanges()
    editor.applyChanges()
    assert.equal(await editor.confirmClose(), false)
    assert.equal(editor.isPersisting.value, true)
    assert.equal(calls.writes.length, 1)
    assert.equal(drawer.updates.length, 0)
    assert.equal(page.toolsCategoryTreeEditor.value, source)
    pending.resolve({})
    await saving
    assert.equal(editor.isPersisting.value, false)
    assert.equal(editor.selected.value, null)
})

test('无效工具草稿不写入，错误保留在抽屉并允许继续修改', async () => {
    let writes = 0
    const { editor } = createEditor(fixture(), async () => { writes++; return true })
    editor.draft.title = ''
    await editor.saveChanges()
    assert.equal(writes, 0)
    assert.ok(editor.selected.value)
    assert.match(editor.editError.value, /名称/)
})

test('安全预览保留路径参数，只允许 HTTP(S) 链接', () => {
    assert.equal(resolveCatalogPreviewHref('/tools/ai/work-summary?type=annual', 'https://uiedtool.com/'), 'https://uiedtool.com/tools/ai/work-summary?type=annual')
    assert.equal(resolveCatalogPreviewHref('https://example.com/tool', ''), 'https://example.com/tool')
    for (const url of ['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', '']) assert.equal(resolveCatalogPreviewHref(url, 'https://uiedtool.com/'), '')
})

/** 等待当前微任务与响应式保存链推进，不依赖真实计时或网络。 */
const flushTasks = () => new Promise((resolve) => setImmediate(resolve))

test('第一次缓存刷新缓慢时连续保存仍写入两次，并排队刷新最新工具目录', async () => {
    const { page, io, calls } = createPage()
    await page.getData()
    const firstRefresh = deferred()
    const latestRefresh = deferred()
    io.refresh = () => calls.refreshes === 1 ? firstRefresh.promise : latestRefresh.promise
    page.toolsCategoryTreeEditor.value = editFirstTitle(page.toolsCategoryTreeEditor.value, '工具 A')
    const firstSave = page.handleSubmit()
    await flushTasks()
    assert.equal(page.isSubmitting.value, false, '等待刷新不能继续锁住持久化')
    page.toolsCategoryTreeEditor.value = editFirstTitle(page.toolsCategoryTreeEditor.value, '工具 B')
    const secondSave = page.handleSubmit()
    await flushTasks()
    try {
        assert.equal(calls.writes.length, 2)
        assert.equal(calls.refreshes, 1)
        firstRefresh.resolve()
        await flushTasks()
        assert.equal(calls.refreshes, 2, '第一次刷新完成后必须再读取 B 保存后的配置')
        latestRefresh.resolve()
        await Promise.all([firstSave, secondSave])
        assert.equal(page.hasUnsavedChanges.value, false)
        assert.equal(page.submitError.value, '')
        assert.equal(page.catalogRefreshWarning.value, '')
        assert.equal(readCatalogEditorTree(page.toolsCategoryTreeEditor.value)[0].list[0].list[0].title, '工具 B')
    } finally {
        firstRefresh.resolve()
        latestRefresh.resolve()
        await Promise.all([firstSave, secondSave])
    }
})

test('排队的最新刷新失败仅显示刷新警告，两次保存均成功且可独立重试刷新', async () => {
    const { page, io, calls } = createPage()
    await page.getData()
    const firstRefresh = deferred()
    io.refresh = async () => {
        if (calls.refreshes === 1) await firstRefresh.promise
        else throw Error('最新配置刷新失败')
    }
    page.toolsCategoryTreeEditor.value = editFirstTitle(page.toolsCategoryTreeEditor.value, '工具 A')
    const firstSave = page.handleSubmit()
    await flushTasks()
    page.toolsCategoryTreeEditor.value = editFirstTitle(page.toolsCategoryTreeEditor.value, '工具 B')
    const secondSave = page.handleSubmit()
    await flushTasks()
    firstRefresh.resolve()
    await Promise.all([firstSave, secondSave])
    assert.equal(calls.writes.length, 2)
    assert.equal(calls.refreshes, 2)
    assert.equal(calls.successes.length, 2)
    assert.equal(page.submitError.value, '')
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.match(page.catalogRefreshWarning.value, /已保存.*刷新失败/)
    assert.equal(readCatalogEditorTree(page.toolsCategoryTreeEditor.value)[0].list[0].list[0].title, '工具 B')
    io.refresh = async () => {}
    assert.equal(await page.refreshCatalogConfig(), true)
    assert.equal(calls.refreshes, 3)
    assert.equal(calls.writes.length, 2)
    assert.equal(page.catalogRefreshWarning.value, '')
})
