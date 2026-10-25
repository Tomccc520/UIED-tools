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

const source = fs.readFileSync(new URL('../src/views/setting/website/frontend_layout.vue', import.meta.url), 'utf8')

/** 提取真实页面的保存与基线函数，仅替换网络边界，保留 PATCH 组装和响应式 dirty 行为。 */
const createPage = () => {
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('frontend-layout.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const names = new Set(['handleSubmit', 'refreshSavedPreview', 'buildFrontendLayoutPayload', 'buildLayoutSnapshot', 'updateBaselineLayoutSnapshot', 'hasUnsavedChanges'])
    const declarations = parsed.statements.filter(statement => ts.isVariableStatement(statement) && statement.declarationList.declarations.some(item => names.has(item.name.getText(parsed))))
    const code = declarations.map(statement => statement.getText(parsed)).join('\n') + '\nthis.page = {handleSubmit, refreshSavedPreview, buildFrontendLayoutPayload, updateBaselineLayoutSnapshot, hasUnsavedChanges};'
    const calls = { saves: [], success: [], errors: [], warnings: [], refresh: 0, reads: 0 }
    const io = { save: async () => ({}), refresh: async () => {} }
    const formData = reactive({ toolsHomepageLearningEnabled: '1', toolsHomepageLearningTitle: '每日学习', toolsHomepageLearningRssUrl: 'https://uied.cn/feed', toolsHomepageLearningFilterType: 'all', toolsHomepageLearningCategorySlug: '', toolsHomepageLearningCategoryIds: '', toolsHomepageLearningLimit: '8', toolsChangelogIntroText: '更新说明', toolsChangelogStatsText: '统计说明', toolsChangelogTimeline: '[]', toolsChangelogHeaderLinks: '[]', toolsChangelogMetaLinks: '[]', toolsChangelogSplitTitle: '版本更新', toolsChangelogSplitDesc: '版本说明', toolsChangelogSplitLink: '/changelog', toolsChangelogSplitLinkText: '查看更新', toolsSidebarBrandText: '不应提交的导航品牌', toolsSeoDefaultTitle: '不应提交的全站标题' })
    const state = { formData, layoutForm: reactive({ changelogHeaderLinks: [], changelogMetaLinks: [] }), baselineLayoutSnapshot: ref(''), isSubmitting: ref(false), isLoadingData: ref(false), hasLoadedData: ref(true), loadErrorMessage: ref(''), submitError: ref(''), previewRefreshWarning: ref(''), isRefreshingPreview: ref(false), lastSavedAt: ref(''), simpleMode: ref(true), hasAdvancedLayoutChanges: ref(false) }
    const context = vm.createContext({
        exports: {}, computed, reactive, ref, ...state,
        validateHomepageLearningForm: () => true,
        syncLayoutFormToJson: () => true,
        formatDateTimeText: () => '2026-10-25 19:30:00',
        setWebsite: async payload => { calls.saves.push({ ...payload }); return io.save(payload) },
        getConfig: async () => { calls.refresh++; return io.refresh() },
        getData: async () => { calls.reads++; return false },
        feedback: { msgSuccess: text => calls.success.push(text), msgError: text => calls.errors.push(text), msgWarning: text => calls.warnings.push(text) }
    })
    vm.runInContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    const page = context.page
    page.updateBaselineLayoutSnapshot()
    formData.toolsHomepageLearningTitle = '新的每日学习标题'
    return { page, state, calls, io }
}

test('首页内容保存只 PATCH 自己的字段，确认成功后清除 dirty，不再重复整页读取', async () => {
    const { page, state, calls } = createPage()
    assert.equal(page.hasUnsavedChanges.value, true)
    await page.handleSubmit()
    assert.equal(calls.saves.length, 1)
    assert.deepEqual(Object.keys(calls.saves[0]).sort(), ['toolsChangelogIntroText', 'toolsChangelogStatsText', 'toolsChangelogTimeline', 'toolsHomepageLearningCategoryIds', 'toolsHomepageLearningCategorySlug', 'toolsHomepageLearningEnabled', 'toolsHomepageLearningFilterType', 'toolsHomepageLearningLimit', 'toolsHomepageLearningRssUrl', 'toolsHomepageLearningTitle'].sort())
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.notEqual(state.lastSavedAt.value, '')
    assert.equal(calls.reads, 0)
    assert.equal(calls.success.length, 1)
})

test('持久化成功而预览刷新失败时仍确认已保存，只报告刷新警告', async () => {
    const { page, state, calls, io } = createPage()
    io.refresh = async () => { throw new Error('preview unavailable') }
    await page.handleSubmit()
    assert.equal(calls.saves.length, 1)
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.notEqual(state.lastSavedAt.value, '')
    assert.equal(state.submitError.value, '')
    assert.match(state.previewRefreshWarning.value, /已保存/)
    assert.equal(calls.errors.length, 0)
    assert.equal(calls.warnings.length, 1)
    assert.equal(state.isSubmitting.value, false)
})

test('保存接口失败保留编辑与 dirty，不提前更新基线或报成功', async () => {
    const { page, state, calls, io } = createPage()
    io.save = async () => { throw new Error('save unavailable') }
    await page.handleSubmit()
    assert.equal(page.hasUnsavedChanges.value, true)
    assert.equal(state.formData.toolsHomepageLearningTitle, '新的每日学习标题')
    assert.equal(state.lastSavedAt.value, '')
    assert.match(state.submitError.value, /保存失败/)
    assert.equal(calls.success.length, 0)
    assert.equal(calls.refresh, 0)
})

test('保存进行中不能重复提交，保存失败后仍可使用原草稿重试', async () => {
    const { page, state, calls, io } = createPage()
    let rejectSave
    io.save = () => new Promise((_, reject) => { rejectSave = reject })
    const pending = page.handleSubmit()
    await page.handleSubmit()
    assert.equal(calls.saves.length, 1)
    rejectSave(new Error('network error'))
    await pending
    assert.equal(state.isSubmitting.value, false)
    io.save = async () => ({})
    await page.handleSubmit()
    assert.equal(calls.saves.length, 2)
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.equal(state.submitError.value, '')
})


test('预览刷新失败可单独重试，不重复保存，也不覆盖后续编辑', async () => {
    const { page, state, calls, io } = createPage()
    io.refresh = async () => { throw new Error('preview unavailable') }
    await page.handleSubmit()
    state.formData.toolsHomepageLearningTitle = '保存后的新草稿'
    io.refresh = async () => ({})
    assert.equal(await page.refreshSavedPreview(), true)
    assert.equal(calls.saves.length, 1)
    assert.equal(calls.refresh, 2)
    assert.equal(state.previewRefreshWarning.value, '')
    assert.equal(state.formData.toolsHomepageLearningTitle, '保存后的新草稿')
    assert.equal(page.hasUnsavedChanges.value, true)
})

test('高级项只增加六个更新记录字段，依然不提交导航与 SEO 配置', async () => {
    const { page, state, calls } = createPage()
    state.hasAdvancedLayoutChanges.value = true
    await page.handleSubmit()
    const payload = calls.saves[0]
    assert.equal(Object.keys(payload).length, 16)
    for (const key of ['toolsChangelogHeaderLinks', 'toolsChangelogMetaLinks', 'toolsChangelogSplitTitle', 'toolsChangelogSplitDesc', 'toolsChangelogSplitLink', 'toolsChangelogSplitLinkText']) {
        assert.equal(payload[key], state.formData[key])
    }
    assert.equal(Object.hasOwn(payload, 'toolsSidebarBrandText'), false)
    assert.equal(Object.hasOwn(payload, 'toolsSeoDefaultTitle'), false)
})


test('预览缓存刷新进行中阻止交错保存，完成后才提交当前草稿', async () => {
    const { page, state, calls, io } = createPage()
    let finishRefresh
    io.refresh = () => new Promise(resolve => { finishRefresh = resolve })
    const refreshing = page.refreshSavedPreview()
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
    assert.equal(page.hasUnsavedChanges.value, true)
    finishRefresh({})
    await refreshing
    io.refresh = async () => ({})
    await page.handleSubmit()
    assert.equal(calls.saves.length, 1)
    assert.equal(state.isRefreshingPreview.value, false)
    assert.equal(page.hasUnsavedChanges.value, false)
})
