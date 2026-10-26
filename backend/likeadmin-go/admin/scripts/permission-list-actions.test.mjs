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
import { computed, ref } from 'vue'

/** 抽取页面真实动作函数，以样例请求验证刷新反馈与删除队列；不连接后台、不读取凭据。 */
const createPage = (kind, realLoader = false) => {
    const title = kind[0].toUpperCase() + kind.slice(1)
    const loader = kind === 'menu' ? 'getLists' : `fetch${title}Lists`
    const script = fs.readFileSync(new URL(`../src/views/permission/${kind}/index.vue`, import.meta.url), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('permission.ts', script, ts.ScriptTarget.Latest, true)
    const names = new Set(['handleBatchDelete', 'buildMenuDepthMap', 'refreshLists', ...(realLoader ? [loader] : [])])
    const code = parsed.statements.filter(statement => ts.isVariableStatement(statement) && statement.declarationList.declarations.some(item => names.has(item.name.getText(parsed)))).map(statement => statement.getText(parsed)).join('\n') + '\nthis.page = {handleBatchDelete, refreshLists};'
    const rows = [{ id: 2, _rowKey: 'row-2' }, { id: 3, _rowKey: 'row-3' }, { id: 4, _rowKey: 'row-4' }]
    const keys = ref(kind === 'menu' ? ['row-2', 'row-3'] : [2, 3])
    const selected = computed(() => rows.filter(row => keys.value.includes(kind === 'menu' ? row._rowKey : row.id)))
    const busy = ref(false)
    const calls = { confirms: 0, deleted: [], feedback: [], refresh: 0 }
    const io = { read: async () => { throw new Error('fixture read failure') }, menuRead: async () => { throw new Error('fixture read failure') }, confirm: async () => {}, remove: async id => { if (id === 3) throw new Error('fixture denied') }, refresh: async () => true }
    const context = vm.createContext({
        exports: {}, computed, ref, isBatchDeleting: busy,
        [`selected${title}Keys`]: keys, [`selected${title}Rows`]: selected,
        [`${kind}Delete`]: async ({ id }) => { calls.deleted.push(id); return io.remove(id) },
        queryForm: { role: -1, keyword: '', memberScope: 'all' },
        pager: { lists: rows, count: rows.length, page: 1 },
        adminTableData: ref(rows), roleTableData: ref(rows), allRows: ref(rows),
        lists: ref(rows), expandedKeys: ref([]), loading: ref(false), menuDataSourceMode: ref('route'),
        tableRows: ref(rows), getToken: () => null, collectExpandableKeys: () => [],
        loadMenuRowsByDataSource: () => io.menuRead(),
        loadMenuRowsFromRouteFallback: async () => [],
        getLists: () => io.read(), actionFeedback: { message: '' },
        setActionFeedback: (type, message) => calls.feedback.push({ type, message }),
        clearActionFeedback: () => {},
        feedback: { confirm: async () => { calls.confirms++; return io.confirm() }, msgSuccess: () => {}, msgWarning: () => {}, msgError: () => {}, alertWarning: () => {} },
        ...(!realLoader ? { [loader]: async () => { calls.refresh++; return io.refresh() } } : {})
    })
    vm.runInContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return { page: context.page, keys, busy, rows, calls, io }
}

for (const kind of ['admin', 'role', 'menu']) {
    test(`${kind} 刷新失败后不会覆盖为成功反馈`, async () => {
        const { page, calls } = createPage(kind, true)
        await page.refreshLists()
        assert.ok(calls.feedback.length > 0)
        assert.notEqual(calls.feedback.at(-1).type, 'success')
    })

    test(`${kind} 真实读取成功后才提示刷新成功`, async () => {
        const { page, calls, io, rows } = createPage(kind, true)
        io.read = async () => ({ lists: rows, count: rows.length })
        io.menuRead = async () => rows
        await page.refreshLists()
        assert.equal(calls.feedback.at(-1).type, 'success')
    })

    test(`${kind} 批量动作只确认一次、使用提交快照，失败项保留选中`, async () => {
        const { page, keys, busy, calls, io } = createPage(kind)
        const confirmations = []
        io.confirm = () => new Promise(resolve => confirmations.push(resolve))
        const first = page.handleBatchDelete()
        const second = page.handleBatchDelete()
        const busyDuringConfirmation = busy.value
        keys.value = kind === 'menu' ? ['row-4'] : [4]
        for (const resolve of confirmations) resolve()
        await Promise.all([first, second])
        assert.equal(busyDuringConfirmation, true)
        assert.equal(calls.confirms, 1)
        assert.deepEqual(calls.deleted.sort(), [2, 3])
        assert.deepEqual([...keys.value], kind === 'menu' ? ['row-3'] : [3])
        assert.equal(calls.feedback.at(-1).type, 'warning')
        assert.equal(busy.value, false)
    })
}

test('管理员批量删除仍跳过系统管理员，不改变既有保护规则', async () => {
    const { page, keys, rows, calls } = createPage('admin')
    rows.push({ id: 1, _rowKey: 'row-1' })
    keys.value = [1, 2]
    await page.handleBatchDelete()
    assert.deepEqual(calls.deleted, [2])
    assert.equal(calls.feedback.at(-1).type, 'warning')
})
