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
import { reactive, ref, shallowRef } from 'vue'

/** 隔离运行真实素材 hook，仅将文件与分组接口换成可控样例，不操作磁盘文件或真实后台。 */
const createHooks = () => {
    const source = fs.readFileSync(new URL('../src/components/material/hook.ts', import.meta.url), 'utf8')
    const parsed = ts.createSourceFile('material-hook.ts', source, ts.ScriptTarget.Latest, true)
    const code = parsed.statements.filter(statement => ts.isFunctionDeclaration(statement)).map(statement => statement.getText(parsed)).join('\n') + '\nthis.hooks = {useFile, useCate};'
    const pager = reactive({ page: 2, lists: [{ id: 2 }, { id: 3 }], loading: false })
    const io = { list: async () => ({}), categories: async () => [{ id: 1, name: '样例分组' }], confirm: async () => {}, remove: async () => ({}), move: async () => ({}), rename: async () => ({}) }
    const calls = { deleted: [], moved: [], renamed: [], confirms: 0, reads: 0 }
    const context = vm.createContext({
        exports: {}, reactive, ref, shallowRef, setTimeout: callback => callback(), fileList: () => {},
        usePaging: () => ({ pager, getLists: async () => { calls.reads++; return io.list() } }),
        fileCateLists: () => io.categories(),
        fileDelete: async payload => { calls.deleted.push(structuredClone(payload)); return io.remove(payload) },
        fileMove: async payload => { calls.moved.push(structuredClone(payload)); return io.move(payload) },
        fileRename: payload => { calls.renamed.push(structuredClone(payload)); return io.rename(payload) },
        feedback: { confirm: async () => { calls.confirms++; return io.confirm() } },
        Message: { warning: () => {} }
    })
    vm.runInContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    const files = context.hooks.useFile(ref(''), ref(10), ref(-1), 20)
    files.select.value = [{ id: 2 }, { id: 3 }]
    return { files, categories: context.hooks.useCate(10), calls, io, pager }
}

test('读取失败明确记录错误并保留旧素材，刷新从第一页重试', async () => {
    const { files, io, pager } = createHooks()
    io.list = async () => { throw new Error('fixture unavailable') }
    assert.equal(await files.getFileList(), false)
    assert.match(files.fileLoadError.value, /加载失败/)
    assert.equal(pager.lists.length, 2)
    io.list = async () => ({})
    assert.equal(await files.refresh(), true)
    assert.equal(pager.page, 1)
    assert.equal(files.fileLoadError.value, '')
})

test('删除失败保留选中项，取消确认不发送请求', async () => {
    const { files, io, calls } = createHooks()
    io.confirm = async () => { throw new Error('cancel') }
    assert.equal(await files.batchFileDelete(), false)
    assert.equal(calls.deleted.length, 0)
    io.confirm = async () => ({})
    io.remove = async () => { throw new Error('fixture denied') }
    assert.equal(await files.batchFileDelete(), false)
    assert.deepEqual(files.select.value.map(item => item.id), [2, 3])
    assert.match(files.fileActionError.value, /删除失败/)
    assert.equal(files.isProcessingFiles.value, false)
})

test('删除确认前锁定目标，连点不重复请求，后到选择不被删除', async () => {
    const { files, io, calls } = createHooks()
    let confirm
    io.confirm = () => new Promise(resolve => { confirm = resolve })
    const pending = files.batchFileDelete()
    assert.equal(files.isProcessingFiles.value, true)
    await files.batchFileDelete()
    files.select.value = [{ id: 4 }]
    confirm()
    await pending
    assert.equal(calls.confirms, 1)
    assert.deepEqual(calls.deleted, [{ ids: [2, 3] }])
    assert.deepEqual(files.select.value.map(item => item.id), [4])
})

test('移动失败保留选择和目标，写入成功但刷新失败只报告读取失败', async () => {
    const { files, io, calls } = createHooks()
    files.moveId.value = 7
    io.move = async () => { throw new Error('fixture denied') }
    assert.equal(await files.batchFileMove(), false)
    assert.equal(files.moveId.value, 7)
    assert.equal(files.select.value.length, 2)
    io.move = async () => ({})
    io.list = async () => { throw new Error('fixture unavailable') }
    assert.equal(await files.batchFileMove(), true)
    assert.equal(files.fileActionError.value, '')
    assert.match(files.fileLoadError.value, /加载失败/)
    assert.deepEqual(calls.moved.at(-1), { ids: [2, 3], cid: 7 })
    assert.equal(files.select.value.length, 0)
})

test('分组读取失败保留已有分组并显示明确状态', async () => {
    const { categories, io } = createHooks()
    await categories.getCateLists()
    io.categories = async () => { throw new Error('fixture unavailable') }
    assert.equal(await categories.getCateLists(), false)
    assert.equal(categories.cateLists.value[0].name, '样例分组')
    assert.match(categories.cateLoadError.value, /分组加载失败/)
})

test('重命名尚未完成时锁定素材操作，不交错删除、移动或重复重命名', async () => {
    const { files, io, calls } = createHooks()
    let finishRename
    io.rename = () => new Promise(resolve => { finishRename = resolve })
    const pending = files.handleFileRename('新文件名', 2)
    assert.equal(files.isProcessingFiles.value, true)
    assert.equal(await files.handleFileRename('另一个文件名', 3), false)
    assert.equal(await files.batchFileDelete(), false)
    assert.equal(await files.batchFileMove(), false)
    assert.equal(calls.confirms, 0)
    assert.equal(calls.deleted.length, 0)
    assert.equal(calls.moved.length, 0)
    assert.deepEqual(calls.renamed, [{ id: 2, name: '新文件名' }])
    finishRename()
    assert.equal(await pending, true)
    assert.equal(files.isProcessingFiles.value, false)
    assert.deepEqual(files.select.value.map(item => item.id), [2, 3])
})

test('重命名失败释放锁可重试，写入成功后的读取失败不会误报重命名失败', async () => {
    const { files, io, calls } = createHooks()
    io.rename = async () => { throw new Error('fixture denied') }
    assert.equal(await files.handleFileRename('新名称', 2), false)
    assert.match(files.fileActionError.value, /重命名失败/)
    assert.equal(files.isProcessingFiles.value, false)
    assert.equal(calls.reads, 0)
    assert.deepEqual(files.select.value.map(item => item.id), [2, 3])
    io.rename = async () => ({})
    io.list = async () => { throw new Error('fixture unavailable') }
    assert.equal(await files.handleFileRename('新名称', 2), true)
    assert.equal(files.fileActionError.value, '')
    assert.match(files.fileLoadError.value, /列表加载失败/)
    assert.equal(files.isProcessingFiles.value, false)
    assert.deepEqual(calls.renamed, [{ id: 2, name: '新名称' }, { id: 2, name: '新名称' }])
})
