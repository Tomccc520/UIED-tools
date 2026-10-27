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
import ts from 'typescript'
import { computed, reactive, ref, shallowRef } from 'vue'

/** 编译真实页面脚本，只替换网络与弹窗边界，不连接后台或读取真实账号。 */
const execute = (file, bindings, exposure) => {
    const content = fs.readFileSync(new URL('../src/' + file, import.meta.url), 'utf8')
    const source = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? content
    const parsed = ts.createSourceFile('subject.ts', source, ts.ScriptTarget.Latest, true)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item))
        .map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, computed, reactive, ref, shallowRef,
        defineEmits: () => () => {}, defineExpose() {}, ...bindings })
    vm.runInContext(ts.transpileModule(code + '\nthis.page = {' + exposure + '}', {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }
    }).outputText, context)
    return context.page
}

/** 产生可按任意顺序完成的接口，以复现用户切换与保存并发。 */
const deferred = () => {
    let resolve
    let reject
    const promise = new Promise((yes, no) => { resolve = yes; reject = no })
    return { promise, resolve, reject }
}

/** 创建合成用户，ID 与显示资料保持可区分，不涉及实际用户数据。 */
const userFixture = id => ({ id, sn: 'user-' + id, username: 'account-' + id, nickname: '用户' + id })

/** 载入用户详情的生产函数，记录请求目标与错误反馈。 */
const createUserDetail = () => {
    const calls = { reads: [], edits: [], errors: [], successes: [] }
    const io = { read: async ({ id }) => userFixture(id), edit: async () => {} }
    const page = execute('views/consumer/lists/detail-popup.vue', {
        defaultAvatar: 'synthetic-avatar.png',
        getUserDetail: async payload => { calls.reads.push(payload.id); return io.read(payload) },
        userEdit: async payload => { calls.edits.push({ ...payload }); return io.edit(payload) },
        feedback: { msgError: text => calls.errors.push(text), msgSuccess: text => calls.successes.push(text) }
    }, 'open,close,getDetails,handleEdit,formData,detailLoading,currentUserId')
    return { page, calls, io }
}

test('用户A的迟到详情不会覆盖用户B，旧请求完成也不会提前结束B的加载', async () => {
    const { page, io } = createUserDetail()
    const first = deferred()
    const second = deferred()
    io.read = ({ id }) => id === '1' ? first.promise : second.promise
    const openingFirst = page.open('1')
    const openingSecond = page.open('2')
    first.resolve(userFixture('1'))
    await openingFirst
    assert.equal(page.detailLoading.value, true)
    assert.notEqual(page.formData.username, 'account-1')
    second.resolve(userFixture('2'))
    await openingSecond
    assert.equal(page.formData.username, 'account-2')
    assert.equal(page.detailLoading.value, false)
})

test('B先完成后A再返回，详情仍显示B且旧失败不提示当前用户加载失败', async () => {
    const { page, calls, io } = createUserDetail()
    const first = deferred()
    io.read = ({ id }) => id === '1' ? first.promise : Promise.resolve(userFixture(id))
    const openingFirst = page.open('1')
    await page.open('2')
    first.reject(Error('synthetic old failure'))
    await openingFirst
    assert.equal(page.formData.username, 'account-2')
    assert.equal(calls.errors.length, 0)
})

test('新用户读取失败不展示上一用户资料，也不能向新用户提交旧字段', async () => {
    const { page, calls, io } = createUserDetail()
    await page.open('1')
    io.read = async () => { throw Error('synthetic current failure') }
    await page.open('2')
    await page.handleEdit('上一用户的输入', 'realName')
    assert.notEqual(page.formData.username, 'account-1')
    assert.equal(calls.edits.length, 0)
    assert.equal(calls.successes.length, 0)
    assert.ok(calls.errors.length > 0)
    io.read = async ({ id }) => userFixture(id)
    await page.getDetails('2')
    await page.handleEdit('重试成功后的输入', 'realName')
    assert.equal(calls.edits.length, 1)
    assert.equal(calls.edits[0].id, '2')
})

test('单字段保存期间忽略重复提交，失败释放锁后可以重试', async () => {
    const { page, calls, io } = createUserDetail()
    await page.open('1')
    const save = deferred()
    io.edit = () => save.promise
    const first = page.handleEdit('新的姓名', 'realName')
    const second = page.handleEdit('重复姓名', 'realName')
    const pendingCount = calls.edits.length
    save.reject(Error('synthetic write failure'))
    await Promise.all([first, second])
    assert.equal(pendingCount, 1)
    assert.equal(calls.successes.length, 0)
    io.edit = async () => {}
    await page.handleEdit('新的姓名', 'realName')
    assert.equal(calls.edits.length, 2)
    assert.equal(calls.successes.length, 1)
})

test('保存A的响应迟到时不刷新B或覆盖B资料，保存始终使用A的ID快照', async () => {
    const { page, calls, io } = createUserDetail()
    await page.open('1')
    const save = deferred()
    io.edit = () => save.promise
    const first = page.handleEdit('用户A的新姓名', 'realName')
    await page.open('2')
    save.resolve()
    await first
    assert.deepEqual(calls.reads, ['1', '2'])
    assert.equal(calls.edits[0].id, '1')
    assert.equal(page.formData.username, 'account-2')
})

test('关闭弹窗后迟到详情失效，失效状态不能编辑', async () => {
    const { page, calls, io } = createUserDetail()
    const read = deferred()
    io.read = () => read.promise
    const opening = page.open('1')
    page.close()
    read.resolve(userFixture('1'))
    await opening
    await page.handleEdit('已关闭弹窗的输入', 'realName')
    assert.notEqual(page.formData.username, 'account-1')
    assert.equal(calls.edits.length, 0)
    assert.equal(page.detailLoading.value, false)
})

test('错误用户或不完整详情响应不会开放编辑，修正接口后可重试', async () => {
    const { page, calls, io } = createUserDetail()
    for (const value of [{}, [], null, userFixture('9')]) {
        io.read = async () => value
        await page.open('1')
        await page.handleEdit('错误详情后的输入', 'realName')
    }
    assert.equal(calls.edits.length, 0)
    assert.equal(calls.successes.length, 0)
    io.read = async ({ id }) => userFixture(id)
    await page.getDetails('1')
    await page.handleEdit(0, 'sex')
    assert.equal(calls.edits.length, 1)
    assert.equal(calls.edits[0].value, 0)
})

/** 提供完整但独立的AI模块，所有凭据与地址均为合成样例。 */
const aiFixture = () => ({
    currentModelId: 'koukoutu',
    mattingProviders: [{ provider: 'koukoutu', apiUrl: 'https://matting.example.test', apiKey: 'synthetic-matting' }],
    providers: [{ provider: 'openai', label: '样例文本', enabled: true, isDefault: true, baseUrl: 'https://ai.example.test', apiKey: 'synthetic-provider', defaultModel: 'test-model', models: [] }],
    imageAbilities: [{ ability: 'ocr', label: '样例识别', enabled: true, upstreamUrl: 'https://ocr.example.test', method: 'POST' }]
})

/** 载入AI实际保存页与配置加载组合函数，不调用模型服务或真实配置API。 */
const createAiPage = (mode = 'ai_ability') => {
    const calls = { writes: [], errors: [] }
    const io = { read: async () => aiFixture() }
    const feedback = { msgError: text => calls.errors.push(text), msgSuccess() {}, confirm: async () => {} }
    const useConfigLoad = execute('composables/use-config-load.ts', { feedback }, 'useConfigLoad').useConfigLoad
    const useOperateSubmit = execute('composables/use-operate-submit.ts', { feedback }, 'useOperateSubmit').useOperateSubmit
    const page = execute('views/setting/website/ai_model.vue', {
        feedback, useConfigLoad, useOperateSubmit,
        onMounted() {}, onActivated() {}, onDeactivated() {}, onBeforeUnmount() {}, onBeforeRouteLeave() {},
        useRoute: () => ({ path: '/ai_model_manage/' + mode }),
        getAiModelDetail: () => io.read(),
        saveAiModel: async payload => { calls.writes.push(JSON.parse(JSON.stringify(payload))) }
    }, 'getData,handleSave,formData,loadErrorMessage,hasUnsavedChanges,buildSavePayload')
    return { page, calls, io }
}

test('AI能力缺失模块响应不能被当成空配置保存，完整合法空数组仍可读取', async () => {
    const { page, calls, io } = createAiPage()
    io.read = async () => ({})
    await page.getData()
    await page.handleSave()
    assert.equal(calls.writes.length, 0)
    assert.match(page.loadErrorMessage.value, /加载失败/)
    io.read = async () => ({ ...aiFixture(), imageAbilities: [] })
    await page.getData()
    await page.handleSave()
    assert.equal(calls.writes.length, 1)
    assert.equal(calls.writes[0].imageAbilities.length, 0)
})

for (const mode of ['ai_model', 'ai_provider', 'ai_ability']) {
    test(`${mode}重读不完整或畸形模块时保留全部原草稿和未保存状态`, async () => {
        const { page, calls, io } = createAiPage(mode)
        await page.getData()
        page.formData.mattingProviders[0].apiKey = 'synthetic-unsaved-matting'
        page.formData.providers[0].defaultModel = 'unsaved-model'
        page.formData.imageAbilities[0].label = '未保存识别配置'
        const original = JSON.stringify(page.formData)
        for (const mutation of [
            value => { delete value.imageAbilities },
            value => { value.imageAbilities = {} },
            value => { value.providers[0].models = {} },
            value => { value.imageAbilities = [null] },
            value => { value.providers[0].provider = '' }
        ]) {
            const value = aiFixture()
            value.currentModelId = 'aliyun'
            mutation(value)
            io.read = async () => value
            await page.getData()
            assert.equal(JSON.stringify(page.formData), original)
            assert.equal(page.hasUnsavedChanges.value, true)
            assert.match(page.loadErrorMessage.value, /加载失败/)
            await page.handleSave()
        }
        assert.equal(calls.writes.length, 0)
    })
}
