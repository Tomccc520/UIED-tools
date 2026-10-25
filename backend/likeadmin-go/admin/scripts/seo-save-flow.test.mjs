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
import { ref } from 'vue'

/** 抽取真实页面提交函数，网络与表单边界用可控状态替代，不访问真实配置。 */
const createPage = () => {
    const source = fs.readFileSync(new URL('../src/views/setting/website/seo.vue', import.meta.url), 'utf8')
    const script = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('seo.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const declaration = parsed.statements.find(statement => ts.isVariableStatement(statement) && statement.declarationList.declarations.some(item => item.name.getText(parsed) === 'handleSubmit'))
    const compiled = ts.transpileModule(declaration.getText(parsed) + '\nthis.submit = handleSubmit;', { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText
    const calls = { saved: [], reads: 0, refreshes: 0, errors: 0 }
    const formData = { toolsSeoDefaultTitle: '新的站点标题', toolsSeoDefaultKeywords: '关键词', toolsSeoDefaultDescription: '站点说明', toolsSeoDefaultImage: '' }
    const baselineSnapshot = ref('原基线')
    const io = { save: async () => {} }
    const context = vm.createContext({
        formData, baselineSnapshot, seoPages: ref([]),
        isLoadingData: ref(false), hasLoadedData: ref(true), loadErrorMessage: ref(''), isSubmitting: ref(false),
        validateSeoConfig: () => true,
        buildSeoSnapshot: () => JSON.stringify(formData),
        setWebsite: async payload => { calls.saved.push(payload); await io.save() },
        runSubmit: async executor => { try { await executor(); return true } catch { calls.errors++; return false } },
        // 如果提交重新读取配置，这些边界会故意失败，用于验证不会把读失败当作写失败。
        appStore: { getConfig: async () => { calls.refreshes++; throw new Error('refresh failed') } },
        getData: async () => { calls.reads++; throw new Error('reload failed') }
    })
    vm.runInContext(compiled, context)
    return { submit: context.submit, calls, formData, baselineSnapshot, io }
}

test('SEO写入成功后无需重复读取，基线来自已提交快照', async () => {
    const page = createPage()
    await page.submit()
    assert.equal(page.calls.saved.length, 1)
    assert.equal(page.calls.reads + page.calls.refreshes, 0)
    assert.equal(page.calls.errors, 0)
    assert.equal(page.baselineSnapshot.value, JSON.stringify(page.formData))
})

test('SEO接口失败保留草稿和旧基线，重试可成功保存', async () => {
    const page = createPage()
    page.io.save = async () => { throw new Error('save failed') }
    await page.submit()
    assert.equal(page.baselineSnapshot.value, '原基线')
    assert.equal(page.formData.toolsSeoDefaultTitle, '新的站点标题')
    page.io.save = async () => {}
    await page.submit()
    assert.equal(page.baselineSnapshot.value, JSON.stringify(page.formData))
})

test('保存期间的新编辑不冒充已经持久化', async () => {
    const page = createPage()
    const submittedSnapshot = JSON.stringify(page.formData)
    page.io.save = async () => { page.formData.toolsSeoDefaultTitle = '提交后的新编辑' }
    await page.submit()
    assert.equal(page.baselineSnapshot.value, submittedSnapshot)
    assert.notEqual(page.baselineSnapshot.value, JSON.stringify(page.formData))
})
