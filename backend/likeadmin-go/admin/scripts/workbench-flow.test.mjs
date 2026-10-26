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
import * as Vue from 'vue'

/** 执行生产 SFC 的真实脚本，只替换 API、模块加载、时间与生命周期边界。 */
const execute = (file, bindings, exposure) => {
    const source = fs.readFileSync(new URL('../src/views/workbench/' + file, import.meta.url), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('workbench.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, ...Vue, console: { error() {} }, ...bindings })
    const scope = Vue.effectScope()
    scope.run(() => vm.runInContext(ts.transpileModule(code + '\nthis.subject={' + exposure + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context))
    return { page: context.subject, dispose: () => scope.stop() }
}

/** 构造可手动完成的真实 Promise，复现迟到响应与重新激活的交错。 */
const deferred = () => { let resolve; let reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
/** 等待 Vue 与模块加载微任务，不依赖真实网络或固定睡眠。 */
const settle = async () => { await Vue.nextTick(); await new Promise(resolve => setImmediate(resolve)); await Vue.nextTick() }

/** 注册可控时钟、定时器与生产生命周期，不访问真实账号或页面。 */
const boundaries = () => {
    const hooks = { mounted: [], activated: [], deactivated: [], unmount: [] }
    const timers = new Map()
    let timerID = 0
    const clock = { now: 1000 }
    const bindings = {
        Date: { now: () => clock.now },
        setTimeout: (callback, ms) => { const id = ++timerID; timers.set(id, { callback, ms }); return id },
        clearTimeout: id => timers.delete(id),
        onMounted: callback => hooks.mounted.push(callback), onActivated: callback => hooks.activated.push(callback),
        onDeactivated: callback => hooks.deactivated.push(callback), onBeforeUnmount: callback => hooks.unmount.push(callback)
    }
    return { hooks, timers, clock, bindings }
}

/** 提供独立工作台样例，合法零值不会变成未知或虚构健康分。 */
const fixture = (visits = 0) => ({ version: { version: '3.0.6' }, today: { todayVisits: visits, totalVisits: visits, todayOrder: 0, todaySales: 0, todayUsers: 0, time: '样例时间' }, visitor: { date: ['2026-10-26'], list: [visits] } })
/** 挂载工作台脚本，接口、导航与消息均限制在内存边界。 */
const workbench = (options = {}) => {
    const state = boundaries()
    const calls = { reads: 0 }
    const io = { read: async () => fixture(), ...options }
    const result = execute('index.vue', {
        ...state.bindings, getWorkbench: () => { calls.reads++; return io.read() },
        useUserStore: () => ({ routes: [], userInfo: {} }), flattenAdminNavigation: () => [], getAdminQuickNavigation: () => [],
        adminNavigationTitle: () => '', getAdminTaskDefinition: () => undefined,
        Message: { success() {} }, qqGroup: 'sample-qq', customerService: 'sample-support'
    }, 'getData,activateWorkbench,deactivateWorkbench,loading,hasLoaded,errorMessage,workbenchData,hasMetrics,hasVisitorData,todayCards,readMetric')
    return { ...state, ...result, calls, io }
}

/** 挂载真实趋势脚本，动态模块仅返回测试组件，不加载实际图表或资源。 */
const trend = (options = {}) => {
    const state = boundaries()
    const calls = { imports: 0 }
    const props = Vue.reactive({ hasData: true, option: {}, ...options.props })
    const io = { chart: async () => ({ default: { name: 'SampleChart' } }), ...options }
    const result = execute('components/trend-panel.vue', {
        ...state.bindings, defineProps: () => props,
        require: name => { assert.equal(name, 'vue-echarts'); calls.imports++; return io.chart() }
    }, 'expanded,loadChart,loading,errorMessage,chartComponent,active,handleToggle,activateTrend,deactivateTrend')
    return { ...state, ...result, calls, io, props }
}

test('首次挂载和首次激活共用一次统计请求，合法0保留为0', async t => {
    const state = workbench(); t.after(state.dispose)
    state.hooks.mounted.forEach(callback => callback())
    state.hooks.activated.forEach(callback => callback())
    await settle()
    assert.equal(state.calls.reads, 1)
    assert.equal(state.page.hasLoaded.value, true)
    assert.equal(state.page.hasMetrics.value, true)
    assert.equal(state.page.todayCards.value[0].value, '0')
    assert.equal(state.page.todayCards.value[3].value, '¥0.00')
    for (const invalid of [undefined, null, '', '  ', false, NaN, Infinity, -1]) assert.equal(state.page.readMetric(invalid), null)
})

test('五分钟内返回复用统计，过期会重读，手动刷新始终可用', async t => {
    const state = workbench(); t.after(state.dispose)
    state.page.activateWorkbench(); await settle()
    state.page.deactivateWorkbench(); state.clock.now += 299999; state.page.activateWorkbench(); await settle()
    assert.equal(state.calls.reads, 1)
    await state.page.getData(); assert.equal(state.calls.reads, 2)
    state.page.deactivateWorkbench(); state.clock.now += 300000; state.page.activateWorkbench(); await settle()
    assert.equal(state.calls.reads, 3)
})

test('失活旧响应不能覆盖新统计，也不能清除重新激活后的超时保护', async t => {
    const first = deferred(); const second = deferred()
    const state = workbench({ read: () => state.calls.reads === 1 ? first.promise : second.promise }); t.after(state.dispose)
    state.page.activateWorkbench(); state.page.deactivateWorkbench(); state.page.activateWorkbench()
    assert.equal(state.calls.reads, 2)
    first.resolve(fixture(900)); await settle()
    assert.equal(state.page.loading.value, true)
    assert.equal(state.page.hasLoaded.value, false)
    assert.equal(state.timers.size, 1)
    second.resolve(fixture(7)); await settle()
    assert.equal(state.page.workbenchData.today.todayVisits, 7)
    assert.equal(state.page.loading.value, false)
    assert.equal(state.timers.size, 0)
})

test('刷新失败保留旧统计，重新激活可立即重试而不被缓存挡住', async t => {
    const state = workbench({ read: async () => fixture(4) }); t.after(state.dispose)
    await state.page.getData()
    const waiting = deferred(); state.io.read = () => waiting.promise
    const refresh = state.page.getData()
    assert.equal(state.page.workbenchData.today.todayVisits, 4)
    assert.equal(state.page.loading.value, true)
    waiting.reject(Error('network failed')); await refresh
    assert.match(state.page.errorMessage.value, /加载失败/)
    assert.equal(state.page.workbenchData.today.todayVisits, 4)
    state.io.read = async () => fixture(8)
    state.page.deactivateWorkbench(); state.page.activateWorkbench(); await settle()
    assert.equal(state.page.workbenchData.today.todayVisits, 8)
    assert.equal(state.page.errorMessage.value, '')
})

test('统计超时结束loading，重试成功后迟到网络结果不改写新数据', async t => {
    const waiting = deferred(); const state = workbench({ read: () => waiting.promise }); t.after(state.dispose)
    const reading = state.page.getData()
    const timeout = [...state.timers.values()].find(item => item.ms === 12000)
    assert.ok(timeout); timeout.callback(); await reading
    assert.equal(state.page.loading.value, false)
    assert.match(state.page.errorMessage.value, /请重试/)
    state.io.read = async () => fixture(5); await state.page.getData()
    waiting.resolve(fixture(99)); await settle()
    assert.equal(state.page.workbenchData.today.todayVisits, 5)
})

test('真实趋势不受缺失概况指标影响；卸载后拒绝激活与迟到回填', async t => {
    const state = workbench({ read: async () => ({ visitor: { date: ['2026-10-26'], list: [3] } }) }); t.after(state.dispose)
    await state.page.getData()
    assert.equal(state.page.hasMetrics.value, false)
    assert.equal(state.page.hasVisitorData.value, true)
    state.hooks.unmount.forEach(callback => callback())
    state.page.activateWorkbench(); await state.page.getData()
    assert.equal(state.calls.reads, 1); assert.equal(state.timers.size, 0)
})

test('趋势默认收起不加载图表，零访问展开也不加载', async t => {
    const state = trend({ props: { hasData: false } }); t.after(state.dispose)
    await settle(); assert.equal(state.calls.imports, 0)
    state.page.handleToggle({ currentTarget: { open: true } }); await settle()
    assert.equal(state.page.expanded.value, true)
    assert.equal(state.calls.imports, 0); assert.equal(state.page.loading.value, false)
})

test('有数据的趋势展开后按需加载，收起再展开复用模块', async t => {
    const state = trend(); t.after(state.dispose)
    state.page.handleToggle({ currentTarget: { open: true } }); await settle()
    assert.equal(state.calls.imports, 1); assert.equal(state.page.chartComponent.value.name, 'SampleChart')
    state.page.handleToggle({ currentTarget: { open: false } }); await settle()
    state.page.handleToggle({ currentTarget: { open: true } }); await settle()
    assert.equal(state.calls.imports, 1)
})

test('图表模块失败保留错误和重试；八秒超时不会无限loading', async t => {
    const state = trend({ chart: async () => { throw Error('module unavailable') } }); t.after(state.dispose)
    state.page.handleToggle({ currentTarget: { open: true } }); await settle()
    assert.equal(state.page.loading.value, false); assert.match(state.page.errorMessage.value, /重试/)
    const waiting = deferred(); state.io.chart = () => waiting.promise
    const retry = state.page.loadChart()
    const timeout = [...state.timers.values()].find(item => item.ms === 8000)
    assert.ok(timeout); timeout.callback(); await retry
    assert.equal(state.page.loading.value, false); assert.match(state.page.errorMessage.value, /重试/)
    state.io.chart = async () => ({ default: { name: 'RecoveredChart' } }); await state.page.loadChart()
    assert.equal(state.page.chartComponent.value.name, 'RecoveredChart')
    waiting.resolve({ default: { name: 'StaleChart' } }); await settle()
    assert.equal(state.page.chartComponent.value.name, 'RecoveredChart')
})

test('缓存趋势失活后旧模块结果失效，重新激活仍可加载且卸载不能复活', async t => {
    const first = deferred(); const second = deferred()
    const state = trend({ chart: () => state.calls.imports === 1 ? first.promise : second.promise }); t.after(state.dispose)
    state.page.handleToggle({ currentTarget: { open: true } }); await Vue.nextTick()
    state.page.deactivateTrend(); state.page.activateTrend(); await Vue.nextTick()
    first.resolve({ default: { name: 'OldChart' } }); await settle()
    assert.equal(state.page.loading.value, true); assert.equal(state.timers.size, 1)
    second.resolve({ default: { name: 'NewChart' } }); await settle()
    assert.equal(state.page.chartComponent.value.name, 'NewChart')
    state.hooks.unmount.forEach(callback => callback()); state.page.activateTrend()
    assert.equal(state.page.active.value, false); assert.equal(state.calls.imports, 2)
})
