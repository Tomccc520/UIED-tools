/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { computed, reactive, ref } from 'vue'

const viewUrl = new URL('../src/views/setting/website/', import.meta.url)

/** 读取真实页面脚本，测试实际提交逻辑而非另写一份实现。 */
const readPageScript = (file) => {
    const source = fs.readFileSync(new URL(file, viewUrl), 'utf8')
    return source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
}

/** 移除模块导入后编译真实 TypeScript，依赖由可控接口和 Vue 响应式能力注入。 */
const executeScript = (source, bindings, exposed) => {
    const parsed = ts.createSourceFile('subject.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const script = parsed.statements.filter((statement) => !ts.isImportDeclaration(statement))
        .map((statement) => statement.getText(parsed)).join('\n')
    const compiled = ts.transpileModule(script + '\nthis.subject = {' + exposed.join(', ') + '};', {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }
    }).outputText
    const context = vm.createContext({ exports: {}, computed, reactive, ref, ...bindings })
    vm.runInContext(compiled, context)
    return context.subject
}

/** 编译现有配置组合式函数，保留真实的加载、提交和重复请求保护。 */
const readComposable = (file, name, feedback) => executeScript(
    fs.readFileSync(new URL('composables/' + file, viewUrl), 'utf8'), { feedback }, [name]
)[name]

/** 构造仅替换网络与消息边界的榜单配置页，不发送真实请求或写数据库。 */
const createRankingPage = () => {
    const calls = { read: 0, saves: [], success: [], errors: [], confirm: 0 }
    const feedback = {
        msgSuccess: (message) => calls.success.push(message),
        msgError: (message) => calls.errors.push(message),
        confirm: async () => { calls.confirm++ }
    }
    const io = {
        read: async () => ({ enabled: 0, pageTitle: '实际已保存的榜单', pageDescription: '真实说明', defaultPeriod: 'month', pageLimit: 7, showOnSidebar: 0, sidebarTitle: '实际侧栏', sidebarPeriod: 'day' }),
        save: async () => {}
    }
    const page = executeScript(readPageScript('tool_ranking_config.vue'), {
        feedback,
        useRouter: () => ({ push() {} }),
        useAppStore: () => ({ getConfig: async () => {} }),
        useOperateSubmit: readComposable('use-operate-submit.ts', 'useOperateSubmit', feedback),
        useConfigLoad: readComposable('use-config-load.ts', 'useConfigLoad', feedback),
        getToolRankingConfigDetail: async () => { calls.read++; return io.read() },
        saveToolRankingConfigDetail: async (payload) => { calls.saves.push({ ...payload }); await io.save() },
        onMounted: () => {},
        onBeforeRouteLeave: () => {}
    }, ['loadData', 'reloadRankingConfig', 'handleSubmit', 'formData'])
    return { page, io, calls, feedback }
}

/** 创建可手动完成的请求，用于确认处理中重复操作不会越过保存门禁。 */
const deferred = () => {
    let resolve
    let reject
    const promise = new Promise((yes, no) => { resolve = yes; reject = no })
    return { promise, resolve, reject }
}

test('仅新增同步保留免费工具的 0 分，并保持已有工具规则原样', () => {
    const source = readPageScript('tools_catalog.vue')
    const parsed = ts.createSourceFile('catalog.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const declaration = parsed.statements.find((statement) => ts.isVariableStatement(statement)
        && statement.declarationList.declarations.some((item) => item.name.getText(parsed) === 'buildAppendToolPolicyRules'))
    const { buildAppendToolPolicyRules } = executeScript(declaration.getText(parsed), {}, ['buildAppendToolPolicyRules'])
    const existing = [{ toolKey: 'existing', consumePoints: 5, memberFree: 0, status: 1, sort: 3 }]
    const actual = buildAppendToolPolicyRules([
        { toolKey: 'existing', consumePoints: 0 },
        { toolKey: 'free', name: '免费工具', consumePoints: 0, memberFree: 1, status: 1 },
        { toolKey: 'paid', consumePoints: 3 },
        { toolKey: 'missing' }
    ], existing)
    assert.equal(JSON.stringify(actual[0]), JSON.stringify(existing[0]))
    assert.deepEqual(Array.from(actual, (item) => item.consumePoints), [5, 0, 3, 1])
    assert.equal(existing.length, 1)
})

test('首次读取失败后保存不会发送默认配置；重试成功后按真实配置保存', async () => {
    const { page, io, calls } = createRankingPage()
    const successfulRead = io.read
    io.read = async () => { throw Error('模拟加载失败') }
    await page.loadData()
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
    io.read = successfulRead
    await page.loadData()
    await page.handleSubmit()
    assert.equal(calls.saves.length, 1)
    assert.equal(calls.saves[0].enabled, 0)
    assert.equal(calls.saves[0].pageTitle, '实际已保存的榜单')
    assert.equal(calls.saves[0].pageLimit, 7)
    assert.equal(calls.saves[0].showOnSidebar, 0)
})

test('读取进行中不重复读取，也不允许提前保存', async () => {
    const { page, io, calls } = createRankingPage()
    const pending = deferred()
    io.read = () => pending.promise
    const firstLoad = page.loadData()
    const repeatedLoad = page.loadData()
    try {
        await page.handleSubmit()
        assert.equal(calls.read, 1)
        assert.equal(calls.saves.length, 0)
    } finally {
        pending.resolve({ pageTitle: '读取完成' })
        await Promise.all([firstLoad, repeatedLoad])
    }
})

test('重新读取失败保留编辑，禁止用旧表单继续覆盖；重试后恢复', async () => {
    const { page, io, calls } = createRankingPage()
    await page.loadData()
    page.formData.pageTitle = '尚未保存的编辑'
    const successfulRead = io.read
    io.read = async () => { throw Error('模拟重新加载失败') }
    await page.loadData()
    assert.equal(page.formData.pageTitle, '尚未保存的编辑')
    await page.handleSubmit()
    assert.equal(calls.saves.length, 0)
    io.read = successfulRead
    await page.loadData()
    await page.handleSubmit()
    assert.equal(calls.saves.length, 1)
})

test('保存进行中不重复提交或重读覆盖当前编辑', async () => {
    const { page, io, calls } = createRankingPage()
    await page.loadData()
    const pending = deferred()
    io.save = () => pending.promise
    const firstSave = page.handleSubmit()
    await page.handleSubmit()
    await page.loadData()
    assert.equal(calls.saves.length, 1)
    assert.equal(calls.read, 1)
    pending.resolve()
    await firstSave
})

test('保存接口失败保留编辑且不报成功，重试使用原编辑内容', async () => {
    const { page, io, calls } = createRankingPage()
    await page.loadData()
    page.formData.pageTitle = '等待保存的标题'
    io.save = async () => { throw Error('模拟保存失败') }
    await page.handleSubmit()
    assert.equal(calls.success.length, 0)
    assert.equal(page.formData.pageTitle, '等待保存的标题')
    assert.equal(calls.errors.length, 1)
    io.save = async () => {}
    await page.handleSubmit()
    assert.equal(calls.saves[1].pageTitle, '等待保存的标题')
    assert.equal(calls.success.length, 1)
})

test('取消重新加载不会丢失未保存编辑，确认后才读取最新配置', async () => {
    const { page, calls, feedback } = createRankingPage()
    await page.loadData()
    page.formData.pageTitle = '尚未保存的标题'
    feedback.confirm = async () => { calls.confirm++; throw Error('用户取消') }
    await page.reloadRankingConfig()
    assert.equal(calls.read, 1)
    assert.equal(page.formData.pageTitle, '尚未保存的标题')
    feedback.confirm = async () => { calls.confirm++ }
    await page.reloadRankingConfig()
    assert.equal(calls.read, 2)
    assert.equal(calls.confirm, 2)
    assert.equal(page.formData.pageTitle, '实际已保存的榜单')
})
