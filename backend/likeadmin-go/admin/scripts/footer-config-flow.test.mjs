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
import * as links from '../src/views/setting/website/composables/config-links.ts'
const root = new URL('../src/', import.meta.url)
/** 编译真实生产脚本，网络、权限和生命周期通过可控边界注入。 */
const execute = (source, bindings, exposure) => {
    const parsed = ts.createSourceFile('subject.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const statements = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, computed, reactive, ref, console, Error, URL, ...bindings })
    vm.runInContext(ts.transpileModule(statements + '\nthis.subject = {' + exposure + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return context.subject
}
/** 读取公开源码，不导入实际请求客户端或读取后台账号。 */
const source = name => fs.readFileSync(new URL(name, root), 'utf8')
/** 构造含零值、扩展字段及其他页面字段的独立配置样例。 */
const fixture = () => ({ toolsFooterIntro: '原始介绍', toolsFooterQuickTitle: '快捷工具', toolsFooterFriendTitle: '友链', toolsOfficialMediaTitle: '媒体', toolsFooterSupportLabel: '支持', toolsFooterSupportLinks: '[{"name":"支持","link":"/help","nofollow":true}]', toolsFooterRecordLinks: '[]', toolsOfficialMediaLinks: '[{"name":"社区","link":"https://example.com","status":0}]', toolsFooterQuickSections: '[{"title":"设计","status":0,"extra":{"keep":true},"items":[{"name":"工具A","link":"/tools/a","nofollow":true}]}]', toolsFooterFriendSections: '[{"title":"伙伴","items":[{"name":"官网","link":"https://example.com"}]}]', toolsCategoryTree: '其他页面不能提交' })
/** 组装真实公共配置控制器与页脚脚本，所有写请求仅记录到内存。 */
const createPage = async (data = fixture(), permissions = ['*']) => {
    const calls = { reads: 0, saves: [], errors: [], successes: [] }
    const io = { read: async () => data, save: async () => {} }
    const user = reactive({ perms: permissions })
    const feedback = { msgSuccess: value => calls.successes.push(value), msgError: value => calls.errors.push(value), confirm: async () => {} }
    const bindings = { feedback, onMounted() {}, onBeforeUnmount() {}, onBeforeRouteLeave() {}, onActivated() {}, onDeactivated() {}, window: { addEventListener() {}, removeEventListener() {}, open() {} } }
    const useConfigLoad = execute(source('composables/use-config-load.ts'), bindings, 'useConfigLoad').useConfigLoad
    const useOperateSubmit = execute(source('composables/use-operate-submit.ts'), bindings, 'useOperateSubmit').useOperateSubmit
    const useConfigEditor = execute(source('composables/use-config-editor.ts'), { ...bindings, useConfigLoad, useOperateSubmit }, 'useConfigEditor').useConfigEditor
    const content = execute(source('views/setting/website/composables/frontend-content.ts'), {}, 'isContentLink')
    const defaults = execute(source('views/setting/website/defaults/officialSite.ts'), {}, 'OFFICIAL_SITE_DEFAULT_FOOTER')
    const script = source('views/setting/website/footer.vue').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const page = execute(script, { ...bindings, ...links, ...content, ...defaults, useConfigEditor, useUserStore: () => user, useAppStore: () => ({ config: {} }), resolveToolsPreviewUrl: () => 'https://example.com', getWebsite: async () => { calls.reads++; return io.read() }, setWebsite: async payload => { calls.saves.push(JSON.parse(JSON.stringify(payload))); return io.save(payload) } }, 'getData,handleSubmit,formData,hasUnsavedChanges,loadErrorMessage,activeFooterSection,runFooterHealthCheck,formatIssues')
    await page.getData()
    return { page, calls, io, user }
}

test('损坏分组原文保留，修改介绍仅提交介绍，不覆盖坏字段或其他页面', async () => {
    const data = fixture(); data.toolsFooterQuickSections = '{ broken'
    const { page, calls } = await createPage(data)
    assert.equal(page.formData.toolsFooterQuickSections, '{ broken')
    assert.equal(page.formatIssues.value.length, 1)
    assert.equal(page.hasUnsavedChanges.value, false)
    page.formData.toolsFooterIntro = '新介绍'
    assert.equal(await page.handleSubmit(), true)
    assert.deepEqual(calls.saves, [{ toolsFooterIntro: '新介绍' }])
    assert.equal(page.formData.toolsFooterQuickSections, '{ broken')
})

test('分组可视化修改后保留组级、链接级及其他分组扩展数据', async () => {
    const { page, calls } = await createPage()
    page.formData.toolsFooterQuickSections = links.updateConfigLinkGroup(page.formData.toolsFooterQuickSections, 0, { title: '设计工具' })
    await page.handleSubmit()
    const saved = JSON.parse(calls.saves[0].toolsFooterQuickSections)[0]
    assert.equal(saved.title, '设计工具'); assert.equal(saved.status, 0)
    assert.deepEqual(saved.extra, { keep: true }); assert.equal(saved.items[0].nofollow, true)
    assert.deepEqual(Object.keys(calls.saves[0]), ['toolsFooterQuickSections'])
})

test('修复无效JSON失败时定位对应分组，保留原文且不发送保存', async () => {
    const { page, calls } = await createPage()
    page.formData.toolsFooterFriendSections = '{'
    assert.equal(await page.handleSubmit(), false)
    assert.equal(page.activeFooterSection.value, 'friends')
    assert.equal(page.formData.toolsFooterFriendSections, '{')
    assert.equal(calls.saves.length, 0); assert.match(calls.errors[0], /JSON/)
})

test('明确清空为[]是合法补丁，不被当成未填写而忽略', async () => {
    const { page, calls } = await createPage()
    page.formData.toolsOfficialMediaLinks = '[]'
    assert.equal(await page.handleSubmit(), true)
    assert.deepEqual(calls.saves, [{ toolsOfficialMediaLinks: '[]' }])
})

test('保存失败保留草稿和基线，重试只提交改动字段且不重复读取', async () => {
    const { page, calls, io } = await createPage()
    page.formData.toolsFooterIntro = '待保存'
    io.save = async () => { throw Error('failure') }
    assert.equal(await page.handleSubmit(), false)
    assert.equal(page.formData.toolsFooterIntro, '待保存'); assert.equal(page.hasUnsavedChanges.value, true)
    io.save = async () => {}
    assert.equal(await page.handleSubmit(), true)
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.equal(calls.reads, 1); assert.deepEqual(calls.saves[1], { toolsFooterIntro: '待保存' })
})

test('只读权限和读取失败都不能提交展示用默认内容', async () => {
    const readonly = await createPage(fixture(), [])
    readonly.page.formData.toolsFooterIntro = '脚本模拟非法编辑'
    assert.equal(await readonly.page.handleSubmit(), false); assert.equal(readonly.calls.saves.length, 0)
    const failed = await createPage([])
    assert.match(failed.page.loadErrorMessage.value, /失败/)
    failed.page.formData.toolsFooterIntro = '不能提交'
    assert.equal(await failed.page.handleSubmit(), false); assert.equal(failed.calls.saves.length, 0)
})

test('提交后的新草稿不冒充已保存，下一次保存补丁仍能准确比较', async () => {
    const { page, calls, io } = await createPage()
    page.formData.toolsFooterIntro = '本次提交'
    io.save = async () => { page.formData.toolsFooterIntro = '随后编辑' }
    assert.equal(await page.handleSubmit(), true)
    assert.equal(page.hasUnsavedChanges.value, true)
    io.save = async () => {}
    await page.handleSubmit()
    assert.deepEqual(calls.saves, [{ toolsFooterIntro: '本次提交' }, { toolsFooterIntro: '随后编辑' }])
})

test('全页检查会定位隐藏的媒体错误，检查本身不会改变任何原文', async () => {
    const data = fixture(); data.toolsOfficialMediaLinks = '[{"name":"错误","link":"javascript:alert(1)"}]'
    const { page, calls } = await createPage(data)
    const original = JSON.stringify(page.formData)
    assert.equal(page.runFooterHealthCheck(), false)
    assert.equal(page.activeFooterSection.value, 'media')
    assert.equal(JSON.stringify(page.formData), original); assert.equal(calls.saves.length, 0)
})
