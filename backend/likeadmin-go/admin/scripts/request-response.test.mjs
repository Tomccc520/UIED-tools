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

/** 执行真实请求响应钩子，替换消息、路由和 Axios 实例边界，不读取凭据或发送请求。 */
const createHooks = () => {
    const calls = { errors: [], successes: [], routes: [], cleared: 0 }
    const enums = { exports: {} }
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(new URL('../src/enums/requestEnums.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, enums)
    const source = fs.readFileSync(new URL('../src/utils/request/index.ts', import.meta.url), 'utf8')
    const parsed = ts.createSourceFile('request.ts', source, ts.ScriptTarget.Latest, true)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item) && !ts.isExportAssignment(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({
        exports: {}, Error, Number, ...enums.exports,
        configs: { baseUrl: '/', timeout: 10000, version: 'test', urlPrefix: 'api' },
        Axios: class { constructor(options) { this.options = options } },
        AxiosError: { ERR_NETWORK: 'ERR_NETWORK', ERR_CANCELED: 'ERR_CANCELED' },
        merge: (target, ...items) => Object.assign(target, ...items),
        feedback: { msgError: message => calls.errors.push(message), msgSuccess: message => calls.successes.push(message) },
        NProgress: { start() {}, done() {} },
        getToken: () => 'test-only', clearAuthInfo: () => { calls.cleared++ },
        router: { push: path => calls.routes.push(path) }, PageEnum: { LOGIN: '/login' }
    })
    vm.runInContext(ts.transpileModule(code + '\nthis.hooks = axiosHooks;', { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context)
    return { hooks: context.hooks, calls }
}

/** 构造实际 Axios 响应包；数据和模式可独立修改，验证下载与普通业务接口的边界。 */
const response = (data, options = {}) => ({ data, config: { requestOptions: { isTransformResponse: true, isReturnDefaultResponse: false, ...options } } })

test('业务成功保留真实数据，合法空结果不被判为协议失败', async () => {
    const { hooks, calls } = createHooks()
    const data = { count: 0, lists: [] }
    assert.equal(await hooks.responseInterceptorsHook(response({ code: 200, msg: '成功', show: 1, data })), data)
    assert.equal(await hooks.responseInterceptorsHook(response({ code: 200, data: null })), null)
    assert.deepEqual(calls.errors, [])
    assert.deepEqual(calls.successes, ['成功'])
})

test('HTTP200中的接口404必须拒绝，不能把失败当成保存成功', async () => {
    const { hooks, calls } = createHooks()
    await assert.rejects(hooks.responseInterceptorsHook(response({ code: 404, msg: '请求接口不存在', data: null })), error => error.code === 404 && error.notified === true)
    assert.deepEqual(calls.errors, ['请求接口不存在'])
    assert.deepEqual(calls.successes, [])
})

test('未知业务错误码及缺失文案仍拒绝，保留错误码且只提示一次', async () => {
    const { hooks, calls } = createHooks()
    await assert.rejects(hooks.responseInterceptorsHook(response({ code: 429, msg: '', data: { retry: true } })), error => error.code === 429 && error.notified === true)
    assert.equal(calls.errors.length, 1)
    assert.match(calls.errors[0], /请求失败/)
    assert.deepEqual(calls.successes, [])
})

test('代理HTML、空包、数组及错误code类型不能静默成功或暴露原文', async () => {
    for (const body of ['<html>proxy detail</html>', null, [], {}, { code: '200', data: {} }, { code: NaN }, { code: 200.5 }]) {
        const { hooks, calls } = createHooks()
        await assert.rejects(hooks.responseInterceptorsHook(response(body)), error => error instanceof Error && /响应格式异常/.test(error.message))
        assert.equal(calls.errors.length, 1)
        assert.doesNotMatch(calls.errors[0], /proxy detail|<html>/)
        assert.deepEqual(calls.successes, [])
    }
})

test('既有业务失败和登录失效继续拒绝，登录失效保留清理与跳转', async () => {
    const { hooks, calls } = createHooks()
    await assert.rejects(hooks.responseInterceptorsHook(response({ code: 300, msg: '保存失败' })), error => error.code === 300)
    await assert.rejects(hooks.responseInterceptorsHook(response({ code: 333, msg: '登录失效' })))
    assert.deepEqual(calls.errors, ['保存失败'])
    assert.equal(calls.cleared, 1)
    assert.deepEqual(calls.routes, ['/login'])
})

test('明确要求原始响应或原始数据的下载接口不强制套业务协议', async () => {
    const { hooks, calls } = createHooks()
    const raw = response('file-content', { isReturnDefaultResponse: true })
    assert.equal(await hooks.responseInterceptorsHook(raw), raw)
    assert.equal(await hooks.responseInterceptorsHook(response('file-content', { isTransformResponse: false })), 'file-content')
    assert.deepEqual(calls.errors, [])
})
