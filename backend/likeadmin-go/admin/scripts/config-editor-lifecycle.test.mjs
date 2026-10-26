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

/** 执行实际 TypeScript 函数，只替换弹窗、生命周期和浏览器边界，不替换编辑器逻辑。 */
const execute = (url, bindings, name) => {
    const source = fs.readFileSync(url, 'utf8')
    const parsed = ts.createSourceFile('subject.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, computed, ref, ...bindings })
    vm.runInContext(ts.transpileModule(code + '\nthis.subject=' + name, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return context.subject
}

/** 创建独立草稿和可控制的确认结果，三个被测函数均取自生产源文件。 */
const createEditor = () => {
    const form = ref({ title: '原始值' })
    const editable = ref(true)
    const calls = { success: [], errors: [], confirms: 0 }
    const hooks = { mounted: [], unmount: [], activate: [], deactivate: [], leave: null }
    const listeners = new Map()
    const io = { confirm: async () => {} }
    const feedback = { msgSuccess: message => calls.success.push(message), msgError: message => calls.errors.push(message), confirm: async () => { calls.confirms++; return io.confirm() } }
    const boundaries = {
        feedback,
        onMounted: callback => hooks.mounted.push(callback), onBeforeUnmount: callback => hooks.unmount.push(callback), onBeforeRouteLeave: callback => { hooks.leave = callback },
        onActivated: callback => hooks.activate.push(callback), onDeactivated: callback => hooks.deactivate.push(callback),
        window: { addEventListener: (name, listener) => listeners.set(name, listener), removeEventListener: (name, listener) => { if (listeners.get(name) === listener) listeners.delete(name) } }
    }
    const sharedRoot = new URL('../src/composables/', import.meta.url)
    const useConfigLoad = execute(new URL('use-config-load.ts', sharedRoot), boundaries, 'useConfigLoad')
    const useOperateSubmit = execute(new URL('use-operate-submit.ts', sharedRoot), boundaries, 'useOperateSubmit')
    const useConfigEditor = execute(new URL('../src/composables/use-config-editor.ts', import.meta.url), { ...boundaries, useConfigLoad, useOperateSubmit }, 'useConfigEditor')
    const editor = useConfigEditor({ canEdit: computed(() => editable.value), snapshot: () => JSON.stringify(form.value), successText: '样例配置已保存' })
    return { editor, form, editable, calls, io, hooks, listeners }
}

/** 手动结束异步过程，复现读取、确认和保存交错。 */
const deferred = () => { let resolve; let reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }

test('未读取成功不能保存；读取失败与重试由统一门禁管理', async () => {
    const { editor, form, calls } = createEditor()
    let writes = 0
    const write = async () => { writes++ }
    assert.equal(await editor.submitConfiguration(write), false)
    assert.equal(await editor.loadConfiguration(async () => { throw Error('网络失败') }), false)
    form.value.title = '手填有效值'
    assert.equal(await editor.submitConfiguration(write), false)
    assert.equal(writes, 0)
    assert.equal(await editor.loadConfiguration(async () => { form.value.title = '接口原值' }), true)
    assert.equal(editor.hasUnsavedChanges.value, false)
    assert.equal(editor.submitError.value, '')
    form.value.title = '用户修改'
    assert.equal(await editor.submitConfiguration(write), true)
    assert.equal(editor.hasUnsavedChanges.value, false)
    assert.equal(writes, 1)
    assert.equal(calls.success.length, 1)
})

test('读取中不启动重复读取，也不允许保存默认表单', async () => {
    const { editor } = createEditor()
    const waiting = deferred()
    let reads = 0
    const reading = editor.loadConfiguration(async () => { reads++; await waiting.promise })
    assert.equal(editor.isLoadingData.value, true)
    assert.equal(await editor.loadConfiguration(async () => { reads++ }), false)
    assert.equal(await editor.submitConfiguration(async () => { throw Error('不应执行') }), false)
    waiting.resolve()
    assert.equal(await reading, true)
    assert.equal(reads, 1)
})

test('保存失败保留草稿与旧基线，重试成功后才确认已保存', async () => {
    const { editor, form, calls } = createEditor()
    await editor.loadConfiguration(async () => {})
    form.value.title = '未保存内容'
    assert.equal(await editor.submitConfiguration(async () => { throw Error('写入失败') }), false)
    assert.equal(editor.hasUnsavedChanges.value, true)
    assert.ok(editor.submitError.value)
    assert.equal(editor.lastSavedAt.value, '')
    assert.equal(calls.success.length, 0)
    assert.equal(await editor.submitConfiguration(async () => {}), true)
    assert.equal(editor.hasUnsavedChanges.value, false)
    assert.equal(editor.submitError.value, '')
})

test('提交快照不吸收后续草稿，保存中不允许并发写入、重载或离开', async () => {
    const { editor, form, hooks } = createEditor()
    await editor.loadConfiguration(async () => {})
    form.value.title = '本次提交'
    const waiting = deferred()
    let writes = 0
    const saving = editor.submitConfiguration(async () => { writes++; await waiting.promise })
    assert.equal(await editor.submitConfiguration(async () => { writes++ }), false)
    assert.equal(await editor.reloadConfiguration(async () => { throw Error('不应重读') }), false)
    assert.equal(await hooks.leave(), false)
    form.value.title = '后续草稿'
    waiting.resolve()
    assert.equal(await saving, true)
    assert.equal(writes, 1)
    assert.equal(editor.hasUnsavedChanges.value, true)
    assert.equal(form.value.title, '后续草稿')
})

test('取消重载保留草稿，双击只确认一次，确认期间开始保存后不再读取', async () => {
    const { editor, form, io, calls } = createEditor()
    await editor.loadConfiguration(async () => {})
    form.value.title = '用户草稿'
    io.confirm = async () => { throw Error('取消') }
    assert.equal(await editor.reloadConfiguration(async () => { throw Error('不应读取') }), false)
    assert.equal(editor.hasUnsavedChanges.value, true)
    const confirming = deferred()
    const savingWait = deferred()
    let reloads = 0
    io.confirm = () => confirming.promise
    const reloading = editor.reloadConfiguration(async () => { reloads++; return true })
    assert.equal(await editor.reloadConfiguration(async () => { reloads++; return true }), false)
    const saving = editor.submitConfiguration(() => savingWait.promise)
    confirming.resolve()
    assert.equal(await reloading, false)
    assert.equal(reloads, 0)
    assert.equal(calls.confirms, 2)
    savingWait.resolve()
    await saving
})

test('只读不能写入，离开取消保留草稿，刷新保护只在有草稿时触发', async () => {
    const { editor, form, editable, hooks, listeners, io } = createEditor()
    hooks.mounted.forEach(callback => callback())
    await editor.loadConfiguration(async () => {})
    let prevented = 0
    const event = { preventDefault() { prevented++ }, returnValue: undefined }
    listeners.get('beforeunload')(event)
    assert.equal(prevented, 0)
    form.value.title = '只读场景中的本地草稿'
    editable.value = false
    assert.equal(await editor.submitConfiguration(async () => { throw Error('不应写入') }), false)
    io.confirm = async () => { throw Error('取消离开') }
    assert.equal(await hooks.leave(), false)
    listeners.get('beforeunload')(event)
    assert.equal(prevented, 1)
    assert.equal(event.returnValue, '')
})

test('卸载移除同一个刷新守卫，并阻止已失效页面再次读取、确认或保存', async () => {
    const { editor, form, hooks, listeners, calls } = createEditor()
    hooks.mounted.forEach(callback => callback())
    assert.equal(listeners.has('beforeunload'), true)
    await editor.loadConfiguration(async () => {})
    form.value.title = '未保存值'
    hooks.unmount.forEach(callback => callback())
    assert.equal(listeners.has('beforeunload'), false)
    assert.equal(editor.canOperate(), false)
    assert.equal(await editor.loadConfiguration(async () => { throw Error('不应读取') }), false)
    assert.equal(await editor.reloadConfiguration(async () => true), false)
    assert.equal(await editor.submitConfiguration(async () => { throw Error('不应写入') }), false)
    assert.equal(calls.confirms, 0)
})

test('页面可提供实际提交的规范化快照，未提交的原文差异仍保持为草稿', async () => {
    const { editor, form } = createEditor()
    await editor.loadConfiguration(async () => {})
    form.value.title = '  用户输入  '
    const normalized = JSON.stringify({ title: form.value.title.trim() })
    await editor.submitConfiguration(async () => {}, normalized)
    assert.equal(editor.hasUnsavedChanges.value, true)
    form.value.title = form.value.title.trim()
    assert.equal(editor.hasUnsavedChanges.value, false)
})

test('KeepAlive离开缓存页后移除刷新守卫，再激活恢复同一草稿且不重复绑定', async () => {
    const { editor, form, hooks, listeners } = createEditor()
    hooks.mounted.forEach(callback => callback())
    hooks.activate.forEach(callback => callback())
    assert.equal(listeners.size, 1)
    const originalListener = listeners.get('beforeunload')
    await editor.loadConfiguration(async () => {})
    form.value.title = '缓存中的草稿'
    hooks.deactivate.forEach(callback => callback())
    assert.equal(listeners.size, 0)
    assert.equal(editor.canOperate(), false)
    assert.equal(await editor.submitConfiguration(async () => { throw Error('失活页不应写入') }), false)
    hooks.activate.forEach(callback => callback())
    hooks.activate.forEach(callback => callback())
    assert.equal(listeners.size, 1)
    assert.equal(listeners.get('beforeunload'), originalListener)
    assert.equal(editor.canOperate(), true)
    assert.equal(editor.hasUnsavedChanges.value, true)
    assert.equal(form.value.title, '缓存中的草稿')
    hooks.unmount.forEach(callback => callback())
    hooks.activate.forEach(callback => callback())
    assert.equal(listeners.size, 0)
})
