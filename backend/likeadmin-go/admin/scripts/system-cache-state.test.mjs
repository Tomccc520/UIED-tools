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
import { reactive, ref } from 'vue'

/** 提取真实缓存计算和读取函数，以样例接口验证单位、边界和失败状态。 */
const createPage = () => {
    const script = fs.readFileSync(new URL('../src/views/setting/system/cache.vue', import.meta.url), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('cache.ts', script, ts.ScriptTarget.Latest, true)
    const names = new Set(['chartOptions', 'resolveMemoryGauge', 'getSystemCache'])
    const code = parsed.statements.filter(statement => ts.isVariableStatement(statement) && statement.declarationList.declarations.some(item => names.has(item.name.getText(parsed)))).map(statement => statement.getText(parsed)).join('\n') + '\nthis.page = {chartOptions, resolveMemoryGauge, getSystemCache};'
    const state = { loading: ref(false), baseInfo: ref({}), cacheLoadError: ref(''), hasLoadedCache: ref(false) }
    const io = { read: async () => ({ info: { used_memory: 160 * 1024 * 1024, maxmemory: 0 }, dbSize: 0, commandStats: [] }) }
    let reads = 0
    const context = vm.createContext({ exports: {}, reactive, ref, ...state, systemCache: async () => { reads++; return io.read() } })
    vm.runInContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, context)
    return { page: context.page, state, io, reads: () => reads }
}

test('160MiB 显示为160MB，表盘容量和提示单位一致，不再显示160%', async () => {
    const { page, state } = createPage()
    await page.getSystemCache()
    const chart = page.chartOptions.memoryChartOption
    assert.equal(chart.series[0].data[0].value, 160)
    assert.equal(chart.series[0].max, 200)
    assert.match(chart.tooltip.formatter, /MB/)
    assert.doesNotMatch(chart.tooltip.formatter, /%/)
    assert.match(chart.series[0].detail.formatter, /MB/)
    assert.equal(state.baseInfo.value.dbSize, 0)
})

test('零、非法内存和已配置容量均得到有限正上限', () => {
    const { page } = createPage()
    for (const [used, max] of [[0, 0], ['bad', Infinity], [-1, -5]]) {
        const result = page.resolveMemoryGauge(used, max)
        assert.equal(result.value, 0)
        assert.equal(result.max, 1)
    }
    assert.equal(page.resolveMemoryGauge(160 * 1024 * 1024, 1024 * 1024 * 1024).max, 1024)
})

test('刷新失败保留真实旧数据，显式报告失败，重试后清除错误', async () => {
    const { page, state, io } = createPage()
    await page.getSystemCache()
    io.read = async () => { throw new Error('fixture unavailable') }
    await page.getSystemCache()
    assert.equal(state.baseInfo.value.used_memory, 160 * 1024 * 1024)
    assert.match(state.cacheLoadError.value, /仍显示上次数据/)
    assert.equal(state.loading.value, false)
    io.read = async () => ({ info: { used_memory: 0 }, dbSize: 0 })
    await page.getSystemCache()
    assert.equal(state.cacheLoadError.value, '')
})

test('首次失败不声明已取得监控，连续刷新只发送一个请求', async () => {
    const { page, state, io, reads } = createPage()
    io.read = async () => { throw new Error('fixture unavailable') }
    await page.getSystemCache()
    assert.equal(state.hasLoadedCache.value, false)
    assert.match(state.cacheLoadError.value, /加载失败/)
    let finish
    io.read = () => new Promise(resolve => { finish = resolve })
    const loading = page.getSystemCache()
    await page.getSystemCache()
    assert.equal(reads(), 2)
    finish({ info: {}, dbSize: 0 })
    await loading
})
