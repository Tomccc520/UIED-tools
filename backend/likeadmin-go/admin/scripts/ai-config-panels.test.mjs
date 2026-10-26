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
/** 转换沙箱值用于比较，不访问真实配置和凭据。 */
const clone = value => JSON.parse(JSON.stringify(value))
/** 运行真实页面、面板与组合式函数，只替换浏览器、通知及网络边界。 */
const execute = (source, bindings, names) => {
    const parsed = ts.createSourceFile('subject.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, computed, reactive, ref, ...bindings })
    vm.runInContext(ts.transpileModule(code + '\nthis.subject={' + names.join(',') + '}', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return context.subject
}
/** 读取生产 SFC 的实际脚本，模板继续由构建与浏览器回归验证。 */
const script = name => fs.readFileSync(new URL(name, website), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
/** 构造不同标识的完整模块，区分切换、隐藏字段和跨模块误写。 */
const fixture = () => ({
    currentModelId: 'koukoutu',
    mattingProviders: [{ provider: 'koukoutu', label: '样例抠图', description: '', apiUrl: 'https://matting.example.test', apiKey: 'synthetic-matting', accessKeyId: '', accessKeySecret: '', endpoint: '', timeoutSeconds: 30, available: true }],
    providers: [
        { provider: 'openai', label: '样例一', description: '', enabled: true, isDefault: true, baseUrl: 'https://one.example.test/v1', apiKey: 'synthetic-one', defaultModel: 'original-one', models: [{ label: '原始模型', value: 'original-one', desc: '', maxTokens: 10 }] },
        { provider: 'deepseek', label: '样例二', description: '', enabled: true, isDefault: false, baseUrl: 'https://two.example.test/v1', apiKey: 'synthetic-two', defaultModel: 'original-two', models: [] }
    ],
    imageAbilities: [{ ability: 'ocr', label: '样例识别', description: '', enabled: true, method: 'POST', upstreamUrl: 'https://ocr.example.test', apiKeyHeader: 'X-Test', apiKey: 'synthetic-ability', timeoutSeconds: 30 }]
})
/** 生产父页负责 API 与保存；返回可控制模型响应的测试实例。 */
const createPage = (mode = 'ai_provider') => {
    const calls = { reads: 0, writes: [], modelRequests: [], warnings: [], errors: [] }
    const route = reactive({ path: '/ai_model_manage/' + mode })
    const hooks = { mounted: [], activated: [], deactivated: [], unmounted: [] }
    const unloadListeners = new Set()
    const io = { read: async () => fixture(), models: async () => ({ models: [] }), save: async () => {} }
    const feedback = { msgSuccess() {}, msgWarning: text => calls.warnings.push(text), msgError: text => calls.errors.push(text), confirm: async () => {} }
    const useConfigLoad = execute(fs.readFileSync(new URL('../src/composables/use-config-load.ts', import.meta.url), 'utf8'), { feedback }, ['useConfigLoad']).useConfigLoad
    const useOperateSubmit = execute(fs.readFileSync(new URL('../src/composables/use-operate-submit.ts', import.meta.url), 'utf8'), { feedback }, ['useOperateSubmit']).useOperateSubmit
    const page = execute(script('ai_model.vue'), {
        feedback, useConfigLoad, useOperateSubmit, useRoute: () => route,
        onMounted: callback => hooks.mounted.push(callback),
        onActivated: callback => hooks.activated.push(callback),
        onDeactivated: callback => hooks.deactivated.push(callback),
        onBeforeUnmount: callback => hooks.unmounted.push(callback),
        onBeforeRouteLeave() {},
        window: { addEventListener: (name, callback) => unloadListeners.add(callback), removeEventListener: (name, callback) => unloadListeners.delete(callback) },
        getAiModelDetail: async () => { calls.reads++; return io.read() },
        saveAiModel: async payload => { calls.writes.push(clone(payload)); await io.save(payload) },
        fetchAiProviderModels: async payload => { calls.modelRequests.push(clone(payload)); return io.models(payload) }
    }, ['getData', 'formData', 'currentProviderForm', 'currentAbilityForm', 'currentMattingProviderForm', 'selectedProviderKey', 'fetchingProviderKey', 'patchMattingProvider', 'patchTextProvider', 'patchToolAbility', 'setCurrentProviderAsDefault', 'handleFetchProviderModels', 'handleSave', 'buildSavePayload', 'hasUnsavedChanges'])
    return { page, calls, io, route, hooks, unloadListeners }
}
/** 执行真实面板脚本，检查子组件事件不直接修改父级对象。 */
const createPanel = (name, props, names = ['updateField']) => {
    const emitted = []
    const subject = execute(script('components/' + name), { defineProps: () => props, defineEmits: () => (...args) => emitted.push(args) }, names)
    return { subject, emitted }
}
/** 控制模型请求先后次序，不使用实际服务商网络。 */
const deferred = () => { let resolve; let reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }

test('缓存 AI 页保持自身 scope，失活不拦截其他页刷新，激活保留草稿且不重复读取', async () => {
    const { page, calls, route, hooks, unloadListeners } = createPage()
    for (const callback of hooks.mounted) callback()
    await new Promise(resolve => setImmediate(resolve))
    for (const callback of hooks.activated) callback()
    assert.equal(calls.reads, 1)
    assert.equal(unloadListeners.size, 1)
    assert.equal(page.hasUnsavedChanges.value, false)
    page.patchTextProvider('openai', { label: '保留缓存草稿' })
    const draft = clone(page.buildSavePayload())
    for (const callback of hooks.deactivated) callback()
    route.path = '/ai_model_manage/ai_ability'
    assert.equal(unloadListeners.size, 0)
    assert.deepEqual(clone(page.buildSavePayload()), draft)
    assert.equal(page.buildSavePayload().scope, 'provider')
    page.patchTextProvider('openai', { label: '失活迟到补丁' })
    await page.handleSave()
    await page.handleFetchProviderModels()
    await page.getData()
    assert.deepEqual(clone(page.buildSavePayload()), draft)
    assert.equal(calls.writes.length, 0)
    assert.equal(calls.modelRequests.length, 0)
    assert.equal(calls.reads, 1)
    route.path = '/ai_model_manage/ai_provider'
    for (const callback of hooks.activated) callback()
    for (const callback of hooks.activated) callback()
    assert.equal(unloadListeners.size, 1)
    assert.equal(calls.reads, 1)
    assert.equal(page.formData.providers[0].label, '保留缓存草稿')
    assert.equal(page.hasUnsavedChanges.value, true)
    let blocked = false
    for (const callback of unloadListeners) callback({ preventDefault() { blocked = true }, returnValue: undefined })
    assert.equal(blocked, true)
    for (const callback of hooks.unmounted) callback()
    assert.equal(unloadListeners.size, 0)
    for (const callback of hooks.activated) callback()
    assert.equal(unloadListeners.size, 0)
})

test('未编辑的缓存 AI 页不因切换其他模块变脏', async () => {
    const { page, route, hooks } = createPage('ai_model')
    await page.getData()
    route.path = '/ai_model_manage/ai_ability'
    for (const callback of hooks.deactivated) callback()
    assert.equal(page.buildSavePayload().scope, 'matting')
    assert.equal(page.hasUnsavedChanges.value, false)
})

test('共用选择器只接受当前配置中的标识，不创建未知服务商或改写选项', () => {
    const props = reactive({ modelValue: 'one', options: [{ value: 'one', label: '一' }, { value: 'two', label: '二' }] })
    const { subject, emitted } = createPanel('ai-config-panel.vue', props, ['selectOption'])
    const before = clone(props)
    for (const invalid of ['missing', 1, null, {}]) subject.selectOption(invalid)
    subject.selectOption('two')
    assert.deepEqual(clone(emitted), [['update:modelValue', 'two']])
    assert.deepEqual(clone(props), before)
})

test('抠图面板仅发送带标识的补丁；未加载、隐藏模块和未知服务商不能修改父级草稿', async () => {
    const { page, calls } = createPage('ai_model')
    page.patchMattingProvider('koukoutu', { apiUrl: 'https://not-yet.example.test' })
    assert.equal(page.formData.mattingProviders.length, 0)
    await page.getData()
    const props = reactive({ currentProvider: page.currentMattingProviderForm.value, providers: page.formData.mattingProviders })
    const { subject, emitted } = createPanel('ai-matting-panel.vue', props)
    subject.updateField('timeoutSeconds', 60)
    assert.equal(page.formData.mattingProviders[0].timeoutSeconds, 30)
    assert.deepEqual(clone(emitted), [['patch', 'koukoutu', { timeoutSeconds: 60 }]])
    page.patchMattingProvider(emitted[0][1], emitted[0][2])
    assert.equal(page.formData.mattingProviders[0].timeoutSeconds, 60)
    page.patchMattingProvider('missing', { apiUrl: 'https://invalid.example.test' })
    const providersBefore = clone(page.formData.providers)
    page.patchTextProvider('openai', { label: '隐藏模块不应更改' })
    assert.deepEqual(clone(page.formData.providers), providersBefore)
    assert.equal(calls.writes.length, 0)
})

test('文本面板补丁按原服务商标识更新，切换选项不把旧字段写到新服务商', async () => {
    const { page, calls } = createPage()
    await page.getData()
    const props = reactive({ currentProvider: page.currentProviderForm.value, providers: page.formData.providers })
    const { subject, emitted } = createPanel('ai-provider-panel.vue', props)
    subject.updateField('label', '修改第一服务商')
    assert.equal(page.formData.providers[0].label, '样例一')
    page.selectedProviderKey.value = 'deepseek'
    page.patchTextProvider(emitted[0][1], emitted[0][2])
    assert.equal(page.formData.providers[0].label, '修改第一服务商')
    assert.equal(page.formData.providers[1].label, '样例二')
    const modelsBefore = clone(page.formData.providers[0].models)
    page.patchTextProvider('openai', { provider: 'changed-identity', models: [], isDefault: false })
    assert.equal(page.formData.providers[0].provider, 'openai')
    assert.equal(page.formData.providers[0].isDefault, true)
    assert.deepEqual(clone(page.formData.providers[0].models), modelsBefore)
    assert.equal(calls.writes.length, 0)
})

test('工具能力面板编辑关闭状态时不直接写 API，父级保留能力标识和其它模块', async () => {
    const { page, calls } = createPage('ai_ability')
    await page.getData()
    const props = reactive({ currentAbility: page.currentAbilityForm.value, abilities: page.formData.imageAbilities })
    const { subject, emitted } = createPanel('ai-ability-panel.vue', props)
    const others = clone({ providers: page.formData.providers, matting: page.formData.mattingProviders })
    subject.updateField('enabled', false)
    assert.equal(page.formData.imageAbilities[0].enabled, true)
    page.patchToolAbility(emitted[0][1], emitted[0][2])
    assert.equal(page.formData.imageAbilities[0].enabled, false)
    page.patchToolAbility('ocr', { ability: 'changed-identity' })
    assert.equal(page.formData.imageAbilities[0].ability, 'ocr')
    assert.deepEqual(clone({ providers: page.formData.providers, matting: page.formData.mattingProviders }), others)
    assert.equal(calls.writes.length, 0)
    assert.equal(page.hasUnsavedChanges.value, true)
})

test('获取模型中修改连接地址，迟到模型结果不能覆盖原模型库', async () => {
    const { page, calls, io } = createPage()
    await page.getData()
    const before = clone(page.formData.providers[0].models)
    const waiting = deferred()
    io.models = () => waiting.promise
    const fetching = page.handleFetchProviderModels()
    page.patchTextProvider('openai', { baseUrl: 'https://changed.example.test/v1' })
    waiting.resolve({ models: [{ value: 'late-model', label: '迟到模型' }] })
    await fetching
    assert.deepEqual(clone(page.formData.providers[0].models), before)
    assert.equal(page.fetchingProviderKey.value, '')
    assert.equal(calls.warnings.length, 1)
    assert.equal(calls.writes.length, 0)
})

test('获取模型后切到另一服务商，返回结果只归属原服务商且不自动保存', async () => {
    const { page, calls, io } = createPage()
    await page.getData()
    const waiting = deferred()
    io.models = () => waiting.promise
    const fetching = page.handleFetchProviderModels()
    page.selectedProviderKey.value = 'deepseek'
    await page.handleFetchProviderModels()
    assert.equal(calls.modelRequests.length, 1)
    waiting.resolve({ models: [{ value: 'new-one', label: '服务商一模型' }] })
    await fetching
    assert.equal(page.formData.providers[0].models[0].value, 'new-one')
    assert.equal(page.formData.providers[1].models.length, 0)
    assert.equal(page.formData.providers[1].defaultModel, 'original-two')
    assert.equal(calls.writes.length, 0)
    assert.equal(page.hasUnsavedChanges.value, true)
})

test('模型请求失败释放忙碌状态并保留原库，修正后能够重新请求', async () => {
    const { page, calls, io } = createPage()
    await page.getData()
    const before = clone(page.formData.providers[0])
    io.models = async () => { throw Error('模拟模型服务失败') }
    await assert.rejects(page.handleFetchProviderModels())
    assert.equal(page.fetchingProviderKey.value, '')
    assert.deepEqual(clone(page.formData.providers[0]), before)
    io.models = async () => ({ models: [] })
    await page.handleFetchProviderModels()
    assert.equal(calls.modelRequests.length, 2)
})

test('模型快捷区限制为12项但保留完整模型库，默认服务商仍由父级唯一设置', async () => {
    const { page } = createPage()
    await page.getData()
    page.formData.providers[0].models = Array.from({ length: 40 }, (_, index) => ({ value: 'model-' + index, label: '模型' + index }))
    const { subject } = createPanel('ai-provider-panel.vue', reactive({ currentProvider: page.formData.providers[0], providers: page.formData.providers }), ['displayedModels'])
    assert.equal(subject.displayedModels.value.length, 12)
    assert.equal(page.formData.providers[0].models.length, 40)
    page.selectedProviderKey.value = 'deepseek'
    page.setCurrentProviderAsDefault()
    assert.equal(page.formData.providers[0].isDefault, false)
    assert.equal(page.formData.providers[1].isDefault, true)
})

for (const [route, scope, edit] of [
    ['ai_model', 'matting', (page, late) => page.patchMattingProvider('koukoutu', { timeoutSeconds: late ? 90 : 60 })],
    ['ai_provider', 'provider', (page, late) => page.patchTextProvider('openai', { label: late ? '迟到的面板草稿' : '面板草稿' })],
    ['ai_ability', 'ability', (page, late) => page.patchToolAbility('ocr', { description: late ? '迟到的面板草稿' : '面板草稿' })]
]) {
    test(`拆分后的 ${scope} 面板保存继续只提交当前模块，保存中迟到补丁不覆盖提交快照`, async () => {
        const { page, calls, io } = createPage(route)
        await page.getData()
        edit(page)
        const pending = deferred()
        io.save = () => pending.promise
        const saving = page.handleSave()
        const before = clone(page.buildSavePayload())
        edit(page, true)
        assert.deepEqual(clone(page.buildSavePayload()), before)
        pending.resolve()
        await saving
        assert.equal(calls.writes[0].scope, scope)
        assert.equal(page.hasUnsavedChanges.value, false)
        const keys = Object.keys(calls.writes[0])
        assert.equal(keys.includes(scope === 'provider' ? 'mattingProviders' : 'providers'), false)
    })
}
