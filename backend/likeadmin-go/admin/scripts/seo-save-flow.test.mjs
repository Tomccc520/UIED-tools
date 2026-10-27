/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { computed, reactive, ref } from 'vue'
import { readConfigObjectArray, buildConfigFieldPatch } from '../src/views/setting/website/composables/config-links.ts'
import { OFFICIAL_SITE_DEFAULT_SEO } from '../src/views/setting/website/defaults/officialSite.ts'

/** 执行真实页面与公共控制器，读写网络边界在内存中运行。 */
const execute = (source, bindings, names) => {
    const script = source.includes('<script') ? source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1] : source
    const parsed = ts.createSourceFile('seo-subject.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const code = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, Error, computed, reactive, ref, ...bindings })
    vm.runInContext(ts.transpileModule(code + '\nthis.subject = {' + names.join(',') + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return context.subject
}
/** 构造完整服务器基线，验证实际增量保存与草稿行为，不替换业务函数。 */
const createPage = async () => {
    const calls = { saved: [], reads: 0, refreshes: 0, errors: 0 }
    const initial = { toolsSeoDefaultTitle: '', toolsSeoDefaultKeywords: '关键词', toolsSeoDefaultDescription: '站点说明', toolsSeoDefaultImage: '', toolsSeoPages: '[{"path":"/","title":"首页","keywords":"","description":"首页说明","image":""}]' }
    const io = { save: async () => {} }
    const feedback = { msgSuccess() {}, msgError() { calls.errors++ }, confirm: async () => {} }
    const boundaries = { feedback, onMounted() {}, onActivated() {}, onDeactivated() {}, onBeforeUnmount() {}, onBeforeRouteLeave() {} }
    const composable = (file, name, bindings = {}) => execute(fs.readFileSync(new URL('../src/composables/' + file, import.meta.url), 'utf8'), { ...boundaries, ...bindings }, [name])[name]
    const useConfigLoad = composable('use-config-load.ts', 'useConfigLoad')
    const useOperateSubmit = composable('use-operate-submit.ts', 'useOperateSubmit')
    const useConfigEditor = composable('use-config-editor.ts', 'useConfigEditor', { useConfigLoad, useOperateSubmit })
    const page = execute(fs.readFileSync(new URL('../src/views/setting/website/seo.vue', import.meta.url), 'utf8'), {
        ...boundaries, useConfigEditor, readConfigObjectArray, buildConfigFieldPatch, OFFICIAL_SITE_DEFAULT_SEO,
        useUserStore: () => ({ perms: ['*'] }),
        useAppStore: () => ({ config: {}, getConfig: async () => { calls.refreshes++; throw new Error('refresh failed') } }),
        getWebsite: async () => { calls.reads++; if (calls.reads > 1) throw new Error('reload failed'); return initial },
        setWebsite: async payload => { calls.saved.push(JSON.parse(JSON.stringify(payload))); await io.save() }
    }, ['getData', 'handleSubmit', 'formData', 'baselineSeoPayload', 'hasUnsavedChanges'])
    await page.getData()
    page.formData.toolsSeoDefaultTitle = '新的站点标题'
    return { ...page, submit: page.handleSubmit, calls, io }
}

test('SEO写入成功后无需重复读取，基线来自已提交快照', async () => {
    const page = await createPage()
    await page.submit()
    assert.deepEqual(page.calls.saved, [{ toolsSeoDefaultTitle: '新的站点标题' }])
    assert.equal(page.calls.reads, 1)
    assert.equal(page.calls.refreshes, 0)
    assert.equal(page.calls.errors, 0)
    assert.equal(page.baselineSeoPayload.value.toolsSeoDefaultTitle, page.formData.toolsSeoDefaultTitle)
    assert.equal(page.hasUnsavedChanges.value, false)
})

test('SEO接口失败保留草稿和旧基线，重试可成功保存', async () => {
    const page = await createPage()
    const baseline = JSON.stringify(page.baselineSeoPayload.value)
    page.io.save = async () => { throw new Error('save failed') }
    await page.submit()
    assert.equal(JSON.stringify(page.baselineSeoPayload.value), baseline)
    assert.equal(page.formData.toolsSeoDefaultTitle, '新的站点标题')
    assert.equal(page.hasUnsavedChanges.value, true)
    page.io.save = async () => {}
    await page.submit()
    assert.equal(page.baselineSeoPayload.value.toolsSeoDefaultTitle, page.formData.toolsSeoDefaultTitle)
    assert.deepEqual(page.calls.saved[0], page.calls.saved[1])
    assert.equal(page.hasUnsavedChanges.value, false)
})

test('保存期间的新编辑不冒充已经持久化', async () => {
    const page = await createPage()
    const submittedTitle = page.formData.toolsSeoDefaultTitle
    page.io.save = async () => { page.formData.toolsSeoDefaultTitle = '提交后的新编辑' }
    await page.submit()
    assert.equal(page.baselineSeoPayload.value.toolsSeoDefaultTitle, submittedTitle)
    assert.notEqual(page.baselineSeoPayload.value.toolsSeoDefaultTitle, page.formData.toolsSeoDefaultTitle)
    assert.equal(page.hasUnsavedChanges.value, true)
})
