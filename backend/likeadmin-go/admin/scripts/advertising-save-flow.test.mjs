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
import { computed, ref } from 'vue'

const source = fs.readFileSync(new URL('../src/views/operation/advertising/index.vue', import.meta.url), 'utf8')

/** 提取页面真实的读取、校验和保存函数，只替换网络与确认边界，不接触实际配置。 */
const createPage = () => {
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('advertising.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const names = new Set(['cloneAdvertisingItems', 'cloneHotTools', 'normalizeAdvertisingItem', 'isValidAdvertisingLink', 'collectValidationTips', 'collectHotToolValidationTips', 'containsUnsafeAdvertisingHtml', 'bannerValidationTips', 'hotToolValidationTips', 'validationTips', 'currentSnapshot', 'hasUnsavedChanges', 'updateBaseline', 'loadAdvertising', 'retryLoadAdvertising', 'buildAdvertisingPayload', 'refreshSavedPreview', 'handleSubmit'])
    const declarations = parsed.statements.filter(statement => ts.isVariableStatement(statement) && statement.declarationList.declarations.some(item => names.has(item.name.getText(parsed))))
    const expose = '\nthis.page = { loadAdvertising, handleSubmit, hasUnsavedChanges, retryLoadAdvertising: typeof retryLoadAdvertising === "function" ? retryLoadAdvertising : loadAdvertising, refreshSavedPreview: typeof refreshSavedPreview === "function" ? refreshSavedPreview : undefined };'
    const code = ts.transpileModule(declarations.map(statement => statement.getText(parsed)).join('\n') + expose, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText
    const fixture = { items: [{ renderMode: 'image', text: '原始广告', image: '/uploads/banner.png', htmlCode: '', link: '/tools/qrcode', target: '_self', height: 96 }], hotTools: [{ title: '原始推荐', desc: '原始简介', link: '/tools/image-compress' }] }
    const calls = { reads: 0, saves: [], refresh: 0, notifications: 0, confirms: 0, success: [], errors: [], warnings: [] }
    const io = { load: async () => structuredClone(fixture), save: async payload => payload, refresh: async () => ({}), confirm: async () => {} }
    const state = { advertisingItems: ref([]), hotTools: ref([]), expandedKeys: ref([]), previewIndex: ref(0), isLoading: ref(false), isSubmitting: ref(false), hasLoadedData: ref(false), loadError: ref(''), submitError: ref(''), previewRefreshWarning: ref(''), isRefreshingPreview: ref(false), lastSavedAt: ref(''), baselineSnapshot: ref('') }
    const context = vm.createContext({
        exports: {}, computed, ref, ...state,
        defaultAdvertisingItems: [{ ...fixture.items[0], text: '不应自动发布的默认广告' }],
        defaultHotTools: [{ ...fixture.hotTools[0], title: '不应自动发布的默认推荐' }],
        getAdvertisingDetail: async () => { calls.reads++; return io.load() },
        saveAdvertising: async (items, hotTools) => { const payload = structuredClone({ items, hotTools }); calls.saves.push(payload); return io.save(payload) },
        appStore: { getConfig: async () => { calls.refresh++; return io.refresh() } },
        notifyFrontendSiteConfigRefresh: () => { calls.notifications++ },
        formatSavedAt: () => '2026-10-25 21:30:00',
        feedback: { confirm: async () => { calls.confirms++; return io.confirm() }, msgSuccess: text => calls.success.push(text), msgError: text => calls.errors.push(text), msgWarning: text => calls.warnings.push(text) }
    })
    vm.runInContext(code, context)
    return { page: context.page, state, calls, io, fixture }
}

test('首次读取失败不填默认、不确认基线，也不能发布默认广告', async () => {
    const { page, state, calls, io } = createPage()
    io.load = async () => { throw new Error('fixture unavailable') }
    await page.loadAdvertising()
    assert.equal(state.hasLoadedData.value, false)
    assert.deepEqual([...state.advertisingItems.value], [])
    assert.deepEqual([...state.hotTools.value], [])
    assert.equal(state.baselineSnapshot.value, '')
    assert.match(state.loadError.value, /加载失败/)
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
    assert.equal(state.isLoading.value, false)
})

test('重新读取失败保留草稿与基线，并阻止将旧草稿当最新配置发布', async () => {
    const { page, state, calls, io } = createPage()
    await page.loadAdvertising()
    const baseline = state.baselineSnapshot.value
    state.advertisingItems.value[0].text = '重新读取前的草稿'
    io.load = async () => { throw new Error('fixture unavailable') }
    await page.retryLoadAdvertising()
    assert.equal(calls.confirms, 1)
    assert.equal(state.advertisingItems.value[0].text, '重新读取前的草稿')
    assert.equal(state.baselineSnapshot.value, baseline)
    assert.equal(page.hasUnsavedChanges.value, true)
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
})

test('取消重新加载不会发送请求，也不会覆盖当前广告草稿', async () => {
    const { page, state, calls, io } = createPage()
    await page.loadAdvertising()
    state.hotTools.value[0].title = '当前推荐草稿'
    io.confirm = async () => { throw new Error('cancel') }
    await page.retryLoadAdvertising()
    assert.equal(calls.reads, 1)
    assert.equal(state.hotTools.value[0].title, '当前推荐草稿')
    assert.equal(page.hasUnsavedChanges.value, true)
})

test('读取进行中不会并发读取或提前提交，成功后才能保存', async () => {
    const { page, state, calls, io } = createPage()
    await page.loadAdvertising()
    let finishLoad
    io.load = () => new Promise(resolve => { finishLoad = resolve })
    const reading = page.loadAdvertising()
    await page.loadAdvertising()
    await page.handleSubmit()
    assert.equal(calls.reads, 2)
    assert.equal(calls.saves.length, 0)
    finishLoad({ items: [], hotTools: [] })
    await reading
    assert.equal(state.hasLoadedData.value, true)
})

test('服务器明确返回空列表时保留空值，不擅自恢复默认推荐', async () => {
    const { page, state, io } = createPage()
    io.load = async () => ({ items: [], hotTools: [] })
    await page.loadAdvertising()
    assert.equal(state.hasLoadedData.value, true)
    assert.equal(state.advertisingItems.value.length, 0)
    assert.equal(state.hotTools.value.length, 0)
})

test('发布接口失败保留草稿、保存错误和 dirty，允许使用原草稿重试', async () => {
    const { page, state, calls, io } = createPage()
    await page.loadAdvertising()
    state.advertisingItems.value[0].text = '失败后保留'
    io.save = async () => { throw new Error('fixture unavailable') }
    await page.handleSubmit()
    assert.equal(state.advertisingItems.value[0].text, '失败后保留')
    assert.equal(page.hasUnsavedChanges.value, true)
    assert.equal(state.lastSavedAt.value, '')
    assert.match(state.submitError.value, /保存失败/)
    assert.equal(calls.refresh, 0)
    io.save = async payload => payload
    await page.handleSubmit()
    assert.equal(calls.saves.length, 2)
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.equal(state.submitError.value, '')
})

test('POST 成功后先确认提交快照，缓存失败只警告，独立重试不重复发布', async () => {
    const { page, state, calls, io } = createPage()
    await page.loadAdvertising()
    state.advertisingItems.value[0].text = '  已确认的发布内容  '
    io.refresh = async () => { throw new Error('fixture refresh unavailable') }
    await page.handleSubmit()
    assert.equal(calls.saves.length, 1)
    assert.equal(calls.saves[0].items[0].text, '已确认的发布内容')
    assert.equal(state.advertisingItems.value[0].target, '_self')
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.notEqual(state.lastSavedAt.value, '')
    assert.equal(state.submitError.value, '')
    assert.match(state.previewRefreshWarning.value, /已保存/)
    assert.equal(calls.notifications, 1)
    io.refresh = async () => ({})
    await page.refreshSavedPreview()
    assert.equal(state.previewRefreshWarning.value, '')
    assert.equal(calls.saves.length, 1)
    assert.equal(calls.refresh, 2)
})

test('写入进行中禁止重复提交，确认只覆盖提交时快照，后到草稿仍可辨认', async () => {
    const { page, state, calls, io } = createPage()
    await page.loadAdvertising()
    state.advertisingItems.value[0].text = '已提交A'
    let finishSave
    io.save = () => new Promise(resolve => { finishSave = resolve })
    const saving = page.handleSubmit()
    await page.handleSubmit()
    assert.equal(calls.saves.length, 1)
    state.advertisingItems.value[0].text = '后到草稿B'
    finishSave(calls.saves[0])
    await saving
    assert.equal(state.advertisingItems.value[0].text, '后到草稿B')
    assert.equal(JSON.parse(state.baselineSnapshot.value).items[0].text, '已提交A')
    assert.equal(page.hasUnsavedChanges.value, true)
})

test('独立刷新进行中阻止交错发布，完成后再提交当前草稿', async () => {
    const { page, state, calls, io } = createPage()
    await page.loadAdvertising()
    let finishRefresh
    io.refresh = () => new Promise(resolve => { finishRefresh = resolve })
    const refreshing = page.refreshSavedPreview()
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
    finishRefresh({})
    await refreshing
    io.refresh = async () => ({})
    await page.handleSubmit()
    assert.equal(calls.saves.length, 1)
    assert.equal(state.isRefreshingPreview.value, false)
})
