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

const views = new URL('../src/views/setting/', import.meta.url)
/** 编译真实脚本并注入可控接口，所有密钥均为测试合成值，不读取真实配置。 */
const execute = (source, bindings, exposure) => {
    const parsed = ts.createSourceFile('subject.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, computed, reactive, ref, console: { log() {}, error() {} }, ...bindings })
    vm.runInContext(ts.transpileModule(code + '\nthis.subject = {' + exposure + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return context.subject
}
/** 读取页面生产实现，避免测试另写保存逻辑。 */
const script = file => fs.readFileSync(new URL(file, views), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
/** 创建失败、延迟、重复操作均可控制的网络边界。 */
const contextFor = () => {
    const calls = { reads: 0, saves: [], successes: [], errors: [], confirms: 0 }
    const io = { read: async () => ({}), save: async () => {}, confirm: async () => {} }
    const feedback = { msgSuccess: message => calls.successes.push(message), msgError: message => calls.errors.push(message), msgWarning() {}, confirm: async () => { calls.confirms++; return io.confirm() } }
    const composable = (file, name) => execute(fs.readFileSync(new URL('website/composables/' + file, views), 'utf8'), { feedback }, name)[name]
    const bindings = {
        feedback, onMounted() {}, onBeforeUnmount() {}, onBeforeRouteLeave() {},
        window: { addEventListener() {}, removeEventListener() {} },
        useConfigLoad: composable('use-config-load.ts', 'useConfigLoad'),
        useOperateSubmit: composable('use-operate-submit.ts', 'useOperateSubmit'),
        useRouter: () => ({ push() {} }),
        read: async () => { calls.reads++; return io.read() },
        save: async payload => { calls.saves.push(JSON.parse(JSON.stringify(payload))); return io.save(payload) }
    }
    return { calls, io, bindings }
}
/** 构造可保存的商业化设置，保留真实形态的零值、套餐与合成凭据。 */
const loginFixture = () => ({ frontendLoginEnabled: 0, memberEnabled: 0, dailyGiftPoints: 0, toolConsumeRules: [{ toolKey: 'free', consumePoints: 0, memberFree: 1, status: 1 }], memberPlans: [{ code: 'monthly', name: '月度会员', price: 19, memberDays: 30, status: 1 }], pointsPacks: [{ code: 'pack', name: '积分包', price: 9, points: 100, status: 1 }], paymentChannels: ['mock'], wechatAppSecret: 'synthetic-login-secret', paymentRequestToken: 'synthetic-request-token' })
/** 等待页面首次自动读取完成。 */
const settle = () => new Promise(resolve => setImmediate(resolve))
/** 载入真实登录设置或头像设置页，不触发实际 API。 */
const createUserPage = async (file = 'login_register.vue', read = async () => loginFixture()) => {
    const state = contextFor()
    state.io.read = read
    const page = execute(script('user/' + file), { ...state.bindings, getLogin: state.bindings.read, setLogin: state.bindings.save, getUserSetup: state.bindings.read, setUserSetup: state.bindings.save }, 'getData,handleSubmit,formData,reload:typeof reloadLoginConfig === "undefined" ? reloadUserSetup : reloadLoginConfig,dirty:typeof hasUnsavedChanges === "undefined" ? undefined : hasUnsavedChanges,error:typeof submitError === "undefined" ? undefined : submitError')
    await settle()
    return { ...state, page }
}

test('商业化读取失败不能提交默认开关、计费或空凭据，重试失败不提示成功', async () => {
    const { page, calls } = await createUserPage('login_register.vue', async () => { throw Error('read failed') })
    await page.handleSubmit()
    await page.reload()
    assert.equal(calls.saves.length, 0)
    assert.equal(calls.successes.length, 0)
})

test('重新加载取消后保留商业化草稿，保存失败也不覆盖凭据或清除 dirty', async () => {
    const { page, calls, io } = await createUserPage()
    page.formData.userCenterTitle = '新的入口标题'
    io.confirm = async () => { throw Error('cancel') }
    await page.reload()
    assert.equal(calls.reads, 1)
    assert.equal(page.formData.userCenterTitle, '新的入口标题')
    io.save = async () => { throw Error('save failed') }
    await page.handleSubmit()
    assert.equal(page.dirty.value, true)
    assert.equal(page.formData.wechatAppSecret, 'synthetic-login-secret')
    assert.match(page.error.value, /保存失败/)
    assert.equal(calls.successes.length, 0)
})

test('保存成功只更新已提交基线，不再次读取并覆盖新草稿或误报失败', async () => {
    const { page, calls, io } = await createUserPage()
    page.formData.userCenterTitle = '已保存入口'
    io.read = async () => { throw Error('refresh failed') }
    await page.handleSubmit()
    assert.equal(calls.saves.length, 1)
    assert.equal(calls.saves[0].wechatAppSecret, 'synthetic-login-secret')
    assert.equal(calls.saves[0].paymentRequestToken, 'synthetic-request-token')
    assert.equal(calls.saves[0].dailyGiftPoints, 0)
    assert.equal(calls.saves[0].toolConsumeRules[0].consumePoints, 0)
    assert.equal(calls.reads, 1)
    assert.equal(page.dirty.value, false)
    assert.equal(calls.successes.length, 1)
})

test('读取和保存进行中均阻止重复保存，失败后原草稿可以重试', async () => {
    let completeRead
    const state = await createUserPage('login_register.vue', () => new Promise(resolve => { completeRead = resolve }))
    await state.page.handleSubmit()
    assert.equal(state.calls.saves.length, 0)
    completeRead(loginFixture())
    await settle()
    state.page.formData.userCenterTitle = '待保存入口'
    let rejectSave
    state.io.save = () => new Promise((_, reject) => { rejectSave = reject })
    const pending = state.page.handleSubmit()
    await state.page.handleSubmit()
    assert.equal(state.calls.saves.length, 1)
    rejectSave(Error('save failed'))
    await pending
    state.io.save = async () => {}
    await state.page.handleSubmit()
    assert.equal(state.calls.saves.length, 2)
    assert.equal(state.page.dirty.value, false)
})

test('用户头像首次读取失败时不能以空值覆盖原配置', async () => {
    const { page, calls } = await createUserPage('setup.vue', async () => { throw Error('read failed') })
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
})

/** 构造彼此独立的三个 AI 模块，凭据只用于检查原值透传。 */
const aiFixture = () => ({ currentModelId: 'koukoutu', current: { modelName: '抠图' }, supported: [], mattingProviders: [{ provider: 'koukoutu', label: '抠图', apiUrl: 'https://matting.example.test', apiKey: 'synthetic-matting', timeoutSeconds: 30 }], providers: [{ provider: 'openai', label: '文本', enabled: true, isDefault: true, baseUrl: 'https://ai.example.test/v1', apiKey: 'synthetic-provider', defaultModel: 'model-original', models: [] }], imageAbilities: [{ ability: 'ocr', label: '识别', enabled: true, method: 'POST', upstreamUrl: 'https://ocr.example.test', apiKeyHeader: 'X-Test', apiKey: 'synthetic-ability', timeoutSeconds: 30 }] })
/** 加载实际 AI 页面并选择对应任务路由，不读取敏感的后台详情接口。 */
const createAiPage = (mode) => {
    const state = contextFor()
    state.io.read = async () => aiFixture()
    const page = execute(script('website/ai_model.vue'), { ...state.bindings, useRoute: () => ({ path: '/ai_model_manage/' + mode }), getAiModelDetail: state.bindings.read, saveAiModel: state.bindings.save }, 'getData,handleSave,formData,reload:typeof reloadAiModel === "undefined" ? getData : reloadAiModel,dirty:hasUnsavedChanges')
    return { ...state, page }
}

for (const [mode, scope, keys] of [['ai_model', 'matting', ['scope', 'modelId', 'mattingProviders']], ['ai_provider', 'provider', ['scope', 'providers']], ['ai_ability', 'ability', ['scope', 'imageAbilities']]]) {
    test(`AI ${scope} 页面只提交本模块，不能把其他菜单的旧快照写回`, async () => {
        const { page, calls } = createAiPage(mode)
        await page.getData()
        await page.handleSave()
        assert.equal(calls.saves.length, 1)
        assert.equal(calls.saves[0].scope, scope)
        assert.deepEqual(Object.keys(calls.saves[0]).sort(), keys.sort())
        assert.equal(calls.reads, 1)
        assert.equal(page.dirty.value, false)
    })
}

test('AI 持久化成功不依赖二次读取；失败仍保留当前模型和未保存状态', async () => {
    const { page, calls, io } = createAiPage('ai_provider')
    await page.getData()
    page.formData.providers[0].defaultModel = 'new-model'
    io.save = async () => { throw Error('save failed') }
    await page.handleSave()
    assert.equal(page.dirty.value, true)
    assert.equal(page.formData.providers[0].defaultModel, 'new-model')
    io.save = async () => {}
    io.read = async () => { throw Error('refresh failed') }
    await page.handleSave()
    assert.equal(calls.successes.length, 1)
    assert.equal(calls.reads, 1)
    assert.equal(page.dirty.value, false)
})

test('AI 首次读取失败无法保存，重载取消时不覆盖当前模块草稿', async () => {
    const { page, calls, io } = createAiPage('ai_provider')
    io.read = async () => { throw Error('read failed') }
    await page.getData()
    await page.handleSave()
    assert.equal(calls.saves.length, 0)
    io.read = async () => aiFixture()
    await page.getData()
    page.formData.providers[0].defaultModel = 'unsaved-model'
    const reads = calls.reads
    io.confirm = async () => { throw Error('cancel') }
    await page.reload()
    assert.equal(calls.reads, reads)
    assert.equal(page.formData.providers[0].defaultModel, 'unsaved-model')
    assert.equal(page.dirty.value, true)
})
