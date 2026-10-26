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

/** 仅加载真实素材组件的配置与附件保存函数，接口均替换为可控内存边界。 */
const createSubject = () => {
    const source = fs.readFileSync(new URL('../src/components/material/index.vue', import.meta.url), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('material.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const names = new Set(['compressConfigVisible', 'compressConfigSaving', 'compressConfigLoaded', 'compressConfigLoading', 'compressConfigError', 'compressConfigSaveError', 'compressConfigBaseline', 'compressConfigForm', 'normalizeCompressConfig', 'loadCompressConfig', 'retryCompressConfig', 'openCompressConfigModal', 'canCloseCompressConfig', 'saveCompressConfig', 'materialMetaForm', 'materialMetaSaving', 'saveMaterialMeta'])
    const statements = parsed.statements.filter(statement => ts.isVariableStatement(statement) && statement.declarationList.declarations.some(item => names.has(item.name.getText(parsed))))
    const calls = { reads: 0, saves: [], metadata: [], success: [], errors: [], confirms: 0, syncs: 0 }
    const io = { read: async () => ({ enabled: 0, minSizeKB: 0, jpegQuality: 81, pngCompressionLevel: 'speed' }), save: async () => {}, confirm: async () => {}, meta: async payload => ({ ...payload }) }
    const activeMaterial = ref({ id: 1 })
    const pager = reactive({ lists: [{ id: 1, title: 'A' }, { id: 2, title: 'B' }] })
    const bindings = { exports: {}, reactive, ref, props: { type: 'image' }, activeMaterial, pager, isProcessingFiles: ref(false),
        fileCompressConfigDetail: async () => { calls.reads++; return io.read() },
        fileCompressConfigSave: async payload => { calls.saves.push(structuredClone(payload)); return io.save(payload) },
        fileMetaSave: async payload => { calls.metadata.push(structuredClone(payload)); return io.meta(payload) },
        feedback: { confirm: async () => { calls.confirms++; return io.confirm() } },
        Message: { success: text => calls.success.push(text), error: text => calls.errors.push(text), warning() {} },
        syncMetaFormByActive: () => { calls.syncs++ }
    }
    const context = vm.createContext(bindings)
    const code = statements.map(item => item.getText(parsed)).join('\n') + '\nthis.subject = {' + [...names].join(',') + '};'
    vm.runInContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return { page: context.subject, calls, io, activeMaterial, pager }
}

test('首次读取失败显示错误和弹窗，不允许默认压缩策略写回', async () => {
    const { page, calls, io } = createSubject()
    io.read = async () => { throw Error('fixture unavailable') }
    await page.openCompressConfigModal()
    assert.equal(page.compressConfigVisible.value, true)
    assert.equal(page.compressConfigLoaded.value, false)
    assert.match(page.compressConfigError.value, /读取失败/)
    assert.equal(await page.saveCompressConfig(), false)
    assert.equal(calls.saves.length, 0)
    io.read = async () => ({ enabled: 0, minSizeKB: 0, jpegQuality: 90, pngCompressionLevel: 'best' })
    await page.retryCompressConfig()
    assert.equal(page.compressConfigForm.enabled, false)
    assert.equal(page.compressConfigForm.minSizeKB, 0)
    assert.equal(await page.saveCompressConfig(), true)
    assert.deepEqual(calls.saves[0], { enabled: 0, minSizeKB: 0, jpegQuality: 90, pngCompressionLevel: 'best' })
    assert.equal(calls.reads, 2)
})

test('重新读取取消或失败保留原输入，失败后必须成功重读才可保存', async () => {
    const { page, calls, io } = createSubject()
    await page.loadCompressConfig()
    page.compressConfigForm.jpegQuality = 95
    io.confirm = async () => { throw Error('cancel') }
    assert.equal(await page.retryCompressConfig(), false)
    assert.equal(calls.reads, 1)
    io.confirm = async () => {}
    io.read = async () => { throw Error('fixture unavailable') }
    assert.equal(await page.retryCompressConfig(), false)
    assert.equal(page.compressConfigForm.jpegQuality, 95)
    assert.equal(await page.saveCompressConfig(), false)
    assert.equal(calls.saves.length, 0)
})

test('无效响应不局部覆盖旧配置，也不会恢复成可保存默认值', async () => {
    const { page, io } = createSubject()
    await page.loadCompressConfig()
    page.compressConfigForm.minSizeKB = 44
    for (const source of [{}, null, { enabled: 1, minSizeKB: 5, jpegQuality: 0, pngCompressionLevel: 'best' }, { enabled: '', minSizeKB: '', jpegQuality: 82, pngCompressionLevel: 'best' }]) {
        io.read = async () => source
        await page.loadCompressConfig()
        assert.equal(page.compressConfigForm.minSizeKB, 44)
        assert.equal(page.compressConfigLoaded.value, false)
        assert.match(page.compressConfigError.value, /读取失败/)
    }
})

test('读取和保存进行中都禁止重复请求，失败释放锁并保留草稿供重试', async () => {
    const { page, calls, io } = createSubject()
    let readDone, rejectSave
    io.read = () => new Promise(resolve => { readDone = resolve })
    const reading = page.loadCompressConfig()
    assert.equal(await page.loadCompressConfig(), false)
    assert.equal(await page.saveCompressConfig(), false)
    assert.equal(calls.reads, 1)
    readDone({ enabled: 1, minSizeKB: 25, jpegQuality: 88, pngCompressionLevel: 'default' })
    await reading
    page.compressConfigForm.minSizeKB = 40
    io.save = () => new Promise((_, reject) => { rejectSave = reject })
    const saving = page.saveCompressConfig()
    assert.equal(page.canCloseCompressConfig(), false)
    assert.equal(await page.saveCompressConfig(), false)
    assert.equal(await page.loadCompressConfig(), false)
    assert.equal(calls.saves.length, 1)
    rejectSave(Error('fixture denied'))
    assert.equal(await saving, false)
    assert.equal(page.compressConfigSaving.value, false)
    assert.equal(page.compressConfigForm.minSizeKB, 40)
    assert.match(page.compressConfigSaveError.value, /保存失败/)
    assert.equal(calls.success.length, 0)
    io.save = async () => {}
    assert.equal(await page.saveCompressConfig(), true)
})

test('保存使用提交快照，等待期间的新输入保留且弹窗继续打开', async () => {
    const { page, calls, io } = createSubject()
    await page.openCompressConfigModal()
    let done
    io.save = () => new Promise(resolve => { done = resolve })
    const saving = page.saveCompressConfig()
    page.compressConfigForm.jpegQuality = 99
    done()
    await saving
    assert.equal(calls.saves[0].jpegQuality, 81)
    assert.equal(page.compressConfigForm.jpegQuality, 99)
    assert.equal(page.compressConfigVisible.value, true)
    assert.equal(JSON.parse(page.compressConfigBaseline.value).jpegQuality, 81)
    assert.equal(calls.reads, 1)
})

test('保存前拒绝范围外输入，保留原字段和未保存弹窗', async () => {
    const { page, calls } = createSubject()
    await page.openCompressConfigModal()
    page.compressConfigForm.jpegQuality = 200
    assert.equal(await page.saveCompressConfig(), false)
    assert.equal(calls.saves.length, 0)
    assert.equal(page.compressConfigVisible.value, true)
    assert.match(page.compressConfigSaveError.value, /检查/)
})

test('保存素材A后切到B，A响应只更新A行，不覆盖B行或B草稿', async () => {
    const { page, calls, io, activeMaterial, pager } = createSubject()
    let done
    io.meta = () => new Promise(resolve => { done = resolve })
    page.materialMetaForm.title = 'A已编辑'
    const saving = page.saveMaterialMeta()
    activeMaterial.value = { id: 2 }
    page.materialMetaForm.title = 'B未保存'
    done({ id: 1, title: 'A服务器结果' })
    assert.equal(await saving, true)
    assert.equal(pager.lists[0].title, 'A服务器结果')
    assert.equal(pager.lists[1].id, 2)
    assert.equal(pager.lists[1].title, 'B')
    assert.equal(page.materialMetaForm.title, 'B未保存')
    assert.equal(calls.syncs, 0)
    assert.equal(calls.metadata[0].id, 1)
})

test('附件保存连点只发一次；失败保留输入，成功后新编辑也不会被同步回填覆盖', async () => {
    const { page, calls, io } = createSubject()
    let done
    io.meta = () => new Promise(resolve => { done = resolve })
    page.materialMetaForm.title = '旧草稿'
    const saving = page.saveMaterialMeta()
    assert.equal(await page.saveMaterialMeta(), false)
    page.materialMetaForm.title = '新草稿'
    done({ id: 1, title: '旧草稿' })
    await saving
    assert.equal(page.materialMetaForm.title, '新草稿')
    assert.equal(calls.metadata.length, 1)
    assert.equal(calls.syncs, 0)
    io.meta = async () => { throw Error('fixture denied') }
    assert.equal(await page.saveMaterialMeta(), false)
    assert.equal(page.materialMetaSaving.value, false)
    assert.equal(page.materialMetaForm.title, '新草稿')
    assert.match(calls.errors[0], /保存失败/)
})
