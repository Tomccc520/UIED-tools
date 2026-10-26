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
import { usePaging } from '../src/hooks/usePaging.ts'

/** 手动完成请求，验证乱序响应、过期错误和补查不会覆盖新查询。 */
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
/** 推进等待中的异步请求，不依赖固定网络延时。 */
const flush = () => new Promise(resolve => setImmediate(resolve))

test('resetParams恢复原筛选并从第一页请求，仍保留接口参数与字符串去空格契约', async () => {
    const params = reactive({ keyword: ' 初始词 ', status: '' })
    const requests = []
    const { pager, resetParams } = usePaging({ fetchFun: async args => { requests.push(args); return { lists: [], count: 0 } }, params })
    pager.page = 4
    params.keyword = '新筛选'
    params.status = ' paid '
    await resetParams()
    assert.equal(pager.page, 1)
    assert.deepEqual(requests, [{ pageNo: 1, pageSize: 15, keyword: '初始词', status: '' }])
})

test('失败显式拒绝且保留旧列表/总数；成功空数据与首次失败可以区分', async () => {
    let failing = false
    const failure = Error('内部堆栈不应展示')
    const paging = usePaging({ fetchFun: async () => { if (failing) throw failure; return { rows: [{ id: 1 }], total: 8 } } })
    assert.equal(paging.pager.loaded, false)
    await paging.getLists()
    failing = true
    await assert.rejects(paging.getLists(), error => error === failure)
    assert.equal(paging.pager.loaded, true)
    assert.equal(paging.pager.error, '列表加载失败，请重试')
    assert.equal(paging.pager.count, 8)
    assert.deepEqual(Array.from(paging.pager.lists), [{ id: 1 }])
    assert.equal(paging.pager.loading, false)
    const empty = usePaging({ fetchFun: async () => ({ lists: [], count: 0 }) })
    await empty.getLists()
    assert.equal(empty.pager.loaded, true)
    assert.equal(empty.pager.error, '')
    const firstFailure = usePaging({ fetchFun: async () => { throw failure } })
    await assert.rejects(firstFailure.getLists())
    assert.equal(firstFailure.pager.loaded, false)
    assert.ok(firstFailure.pager.error)
})

test('快速连续查询旧成功和旧失败不覆盖最新数据或加载状态', async () => {
    const first = deferred(), second = deferred(), third = deferred()
    let index = 0
    const { pager, getLists } = usePaging({ fetchFun: () => [first, second, third][index++].promise })
    const a = getLists(), b = getLists()
    second.resolve({ lists: [{ id: '最新' }], count: 1 })
    await b
    first.resolve({ lists: [{ id: '旧请求' }], count: 90 })
    await a
    assert.equal(pager.lists[0].id, '最新')
    assert.equal(pager.count, 1)
    assert.equal(pager.error, '')
    const c = getLists()
    third.reject(Error('最新失败'))
    await assert.rejects(c)
    assert.ok(pager.error)
    const old = deferred(), latest = deferred()
    let order = 0
    const next = usePaging({ fetchFun: () => [old, latest][order++].promise })
    const oldRequest = next.getLists(), newRequest = next.getLists()
    old.reject(Error('过期错误'))
    assert.equal(await oldRequest, undefined)
    assert.equal(next.pager.loading, true)
    assert.equal(next.pager.error, '')
    latest.resolve({ list: [{ id: 2 }], totalCount: 1 })
    await newRequest
    assert.equal(next.pager.loaded, true)
    assert.equal(next.pager.loading, false)
})

test('删除末页后空页自动回退最后有效页，只补查一次并保留筛选', async () => {
    const calls = []
    const paging = usePaging({ page: 4, size: 10, params: { keyword: ' 目标 ' }, fetchFun: async args => {
        calls.push(args)
        return args.pageNo === 4 ? { lists: [], count: 21 } : { lists: [{ id: 21 }], count: 21 }
    } })
    await paging.getLists()
    assert.deepEqual(calls, [{ pageNo: 4, pageSize: 10, keyword: '目标' }, { pageNo: 3, pageSize: 10, keyword: '目标' }])
    assert.equal(paging.pager.page, 3)
    assert.equal(paging.pager.lists[0].id, 21)
    assert.equal(paging.pager.loaded, true)
})

test('总数为零回第一页；补查仍为空最多两次请求，不递归失控', async () => {
    let count = 0
    const zero = usePaging({ page: 5, fetchFun: async () => { count++; return { lists: [], count: 0 } } })
    await zero.getLists()
    assert.equal(zero.pager.page, 1)
    assert.ok(count <= 2)
    let retries = 0
    const shrinking = usePaging({ page: 5, size: 10, fetchFun: async () => ({ lists: [], count: ++retries === 1 ? 31 : 21 }) })
    await shrinking.getLists()
    assert.equal(retries, 2)
    assert.equal(shrinking.pager.page, 3)
})

test('补查失败保留上次成功的数据并拒绝；补查被新查询替代时不能倒退页码', async () => {
    let mode = 'initial'
    const pending = deferred()
    const paging = usePaging({ size: 10, fetchFun: async args => {
        if (mode === 'initial') return { lists: [{ id: '上次成功' }], count: 40 }
        if (args.pageNo === 4) return { lists: [], count: 21 }
        if (mode === 'fail') throw Error('补查失败')
        if (args.pageNo === 3) return pending.promise
        return { lists: [{ id: '新筛选' }], count: 1 }
    } })
    await paging.getLists()
    paging.pager.page = 4
    mode = 'fail'
    await assert.rejects(paging.getLists())
    assert.equal(paging.pager.lists[0].id, '上次成功')
    assert.equal(paging.pager.count, 40)
    assert.equal(paging.pager.page, 4)
    mode = 'race'
    const old = paging.getLists()
    await flush()
    const current = paging.resetPage()
    await current
    pending.resolve({ lists: [{ id: '旧补查' }], count: 21 })
    await old
    assert.equal(paging.pager.page, 1)
    assert.equal(paging.pager.lists[0].id, '新筛选')
    assert.equal(paging.pager.error, '')
})

test('同步抛出的接口异常仍会结束loading并拒绝', async () => {
    const paging = usePaging({ fetchFun: () => { throw Error('同步错误') } })
    await assert.rejects(async () => paging.getLists())
    assert.equal(paging.pager.loading, false)
    assert.ok(paging.pager.error)
})

test('订单路由带新筛选时从第一页请求，不沿用第4页', async () => {
    const file = new URL('../src/views/consumer/order/index.vue', import.meta.url)
    const source = fs.readFileSync(file, 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('order.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const route = { fullPath: '/consumer/order?orderSn=SN1', query: { orderSn: 'SN1' } }
    const requests = []
    let routeChanged
    const context = vm.createContext({ exports: {}, computed, reactive, ref,
        useRoute: () => route, useRouter: () => ({}), getRoutePath: () => '', feedback: {},
        usePaging: options => usePaging({ ...options, fetchFun: async args => { requests.push(args); return { lists: [{ orderSn: 'SN1' }], count: 1 } } }),
        getOrderList: () => {}, getOrderLinkageSummary: async () => ({}), onActivated() {},
        watch: (_source, callback) => { routeChanged = callback }
    })
    const compiled = ts.transpileModule(code + '\nthis.page={pager,queryParams};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText
    vm.runInContext(compiled, context)
    context.page.pager.page = 4
    await routeChanged()
    assert.equal(requests[0].pageNo, 1)
    assert.equal(requests[0].keyword, 'SN1')
})

/** 载入真实列表页面，在接口边界模拟故障与恢复，不操作真实用户或日志。 */
const createReadOnlyList = (type) => {
    const relativePath = type === 'users' ? 'consumer/lists/index.vue' : 'setting/system/journal.vue'
    const source = fs.readFileSync(new URL('../src/views/' + relativePath, import.meta.url), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('list.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const io = { read: async () => { throw Error('模拟API失败') } }
    const messages = []
    const context = vm.createContext({ exports: {}, computed, reactive, ref, shallowRef: ref,
        usePaging: options => usePaging({ ...options, fetchFun: () => io.read() }),
        getUserList() {}, systemLogLists() {}, ClientMap: {}, defaultAvatar: '/avatar.png',
        useRoute: () => ({ query: {}, path: '/list' }), useRouter: () => ({ replace: async () => {} }),
        feedback: { msgSuccess: message => messages.push(message) }, onActivated() {}, watch() {}, nextTick: async () => {}
    })
    const loader = type === 'users' ? 'loadUserList' : 'loadLogs'
    const compiled = ts.transpileModule(code + `\nthis.page={pager,load:${loader},handleSearch,handleResetFilters};`, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText
    vm.runInContext(compiled, context)
    return { page: context.page, io, messages }
}

for (const type of ['users', 'journal']) {
    test(`${type} 页面失败不报查询成功，重试后清除错误；旧数据刷新失败仍保留`, async () => {
        const { page, io, messages } = createReadOnlyList(type)
        await flush()
        assert.equal(page.pager.loaded, false)
        assert.ok(page.pager.error)
        assert.equal(messages.length, 0)
        io.read = async () => ({ lists: [], count: 0 })
        await page.load()
        assert.equal(page.pager.loaded, true)
        assert.equal(page.pager.error, '')
        io.read = async () => ({ lists: [{ id: 1 }], count: 10 })
        await page.load()
        io.read = async () => { throw Error('后续更新失败') }
        await page.handleSearch()
        assert.equal(page.pager.lists[0].id, 1)
        assert.equal(page.pager.count, 10)
        assert.ok(page.pager.error)
        assert.equal(messages.length, 0)
    })
}
