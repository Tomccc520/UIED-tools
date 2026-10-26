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
import { computed, reactive, ref, shallowRef, watch } from 'vue'

const viewUrl = new URL('../src/views/setting/website/', import.meta.url)
/** 执行真实页面或组合式函数，仅替换网络和浏览器边界。 */
const execute = (source, bindings, names) => {
    const parsed = ts.createSourceFile('subject.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const script = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const context = vm.createContext({ exports: {}, computed, reactive, ref, Error, ...bindings })
    vm.runInContext(ts.transpileModule(script + '\nthis.subject={' + names.join(',') + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return context.subject
}
/** 提供含完整协议原文的样例，不读取或修改真实法务资料。 */
const fixtures = {
    information: { name: '原后台名称', favicon: '/favicon.png', logo: '/logo.png', backdrop: '/backdrop.png', shopName: '原商城', shopLogo: '/shop.png', toolsCategoryTree: '不应提交', toolsSiteSlogan: '不应覆盖' },
    filing: [{ name: '备案一', link: 'https://beian.miit.gov.cn/' }, { name: '版权说明', link: '' }],
    protocol: { service: { name: '服务协议', content: '  <p>样例服务协议&nbsp;原文</p>\n' }, privacy: { name: '隐私政策', content: '\n<p>样例隐私政策</p>  ' } }
}
/** 克隆可控测试值，避免多个页面和接口模拟共享引用。 */
const clone = value => JSON.parse(JSON.stringify(value))
/** 创建三页实际脚本，复用生产加载/提交函数并截获权限、确认和写入快照。 */
const createPage = (type, perms = ['*']) => {
    const calls = { reads: 0, writes: [], refreshes: 0, confirms: 0, successes: [], errors: [] }
    const io = { read: async () => clone(fixtures[type]), save: async () => {}, refresh: async () => {} }
    const feedback = { msgSuccess: message => calls.successes.push(message), msgError: message => calls.errors.push(message), confirm: async () => { calls.confirms++ } }
    const composable = (file, name) => execute(fs.readFileSync(new URL('../src/composables/' + file, import.meta.url), 'utf8'), { feedback }, [name])[name]
    const hooks = { leave: null }
    const bindings = {
        feedback, useUserStore: () => ({ perms }), useRouter: () => ({ push() {} }),
        useAppStore: () => ({ config: {}, getConfig: async () => { calls.refreshes++; await io.refresh() } }),
        useOperateSubmit: composable('use-operate-submit.ts', 'useOperateSubmit'), useConfigLoad: composable('use-config-load.ts', 'useConfigLoad'),
        onMounted() {}, onBeforeUnmount() {}, onActivated() {}, onDeactivated() {}, onBeforeRouteLeave: callback => { hooks.leave = callback },
        window: { addEventListener() {}, removeEventListener() {} },
        resolveToolsPreviewUrl: () => 'https://example.invalid/'
    }
    for (const name of ['getWebsite', 'getCopyright', 'getProtocol']) bindings[name] = async () => { calls.reads++; return io.read() }
    for (const name of ['setWebsite', 'setCopyright', 'setProtocol']) bindings[name] = async payload => { calls.writes.push(clone(payload)); await io.save(payload) }
    bindings.useConfigEditor = execute(fs.readFileSync(new URL('../src/composables/use-config-editor.ts', import.meta.url), 'utf8'), bindings, ['useConfigEditor']).useConfigEditor
    const script = fs.readFileSync(new URL(type + '.vue', viewUrl), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const page = execute(script, bindings, ['getData', 'reloadData', type === 'protocol' ? 'handleSave' : 'handleSubmit', 'formData', 'hasUnsavedChanges', 'hasLoadedData', 'loadErrorMessage', 'submitError', 'isSubmitting', 'canEdit', ...(type === 'information' ? ['refreshConfig', 'refreshWarning'] : []), ...(type === 'filing' ? ['addItem', 'moveItem', 'handleDelete'] : []), ...(type === 'protocol' ? ['editingBodies', 'startBodyEditing', 'updateProtocolBody'] : [])])
    page.save = type === 'protocol' ? page.handleSave : page.handleSubmit
    return { page, calls, io, feedback, hooks }
}
/** 修改一个当前页负责的字段，形成必须显式保存的有效草稿。 */
const change = (type, page, suffix = '新') => {
    if (type === 'information') page.formData.name += suffix
    else if (type === 'filing') page.formData.value[0].name += suffix
    else page.formData.value.service.content += suffix
}
/** 在未成功读取前填充可保存数据，确认门禁不是仅依赖必填校验。 */
const fillValid = (type, page) => {
    if (type === 'information') Object.assign(page.formData, fixtures.information)
    else page.formData.value = clone(fixtures[type])
}
/** 手动完成写入以确认重复提交与编辑快照保护。 */
const deferred = () => { let resolve; const promise = new Promise(yes => { resolve = yes }); return { promise, resolve } }

for (const type of ['information', 'filing', 'protocol']) {
    test(`${type} 首读失败不能保存默认值，重试成功后才可发布当前页字段`, async () => {
        const { page, io, calls } = createPage(type)
        io.read = async () => { throw Error('首读失败') }
        assert.equal(await page.getData(), false)
        fillValid(type, page)
        await page.save()
        assert.equal(calls.writes.length, 0)
        assert.equal(page.hasLoadedData.value, false)
        io.read = async () => clone(fixtures[type])
        await page.getData()
        change(type, page)
        assert.equal(await page.save(), true)
        assert.equal(calls.writes.length, 1)
        assert.equal(page.hasUnsavedChanges.value, false)
        if (type === 'information') assert.deepEqual(Object.keys(calls.writes[0]).sort(), ['backdrop', 'favicon', 'logo', 'name', 'shopLogo', 'shopName'])
    })
    test(`${type} 取消重载不丢草稿；确认后才读取新值`, async () => {
        const { page, calls, feedback } = createPage(type)
        await page.getData()
        change(type, page)
        feedback.confirm = async () => { calls.confirms++; throw Error('取消') }
        assert.equal(await page.reloadData(), false)
        assert.equal(calls.reads, 1)
        assert.equal(page.hasUnsavedChanges.value, true)
        feedback.confirm = async () => { calls.confirms++ }
        assert.equal(await page.reloadData(), true)
        assert.equal(calls.reads, 2)
        assert.equal(page.hasUnsavedChanges.value, false)
    })
    test(`${type} POST成功后不再GET表单，后续读取失败不误报保存失败`, async () => {
        const { page, io, calls } = createPage(type)
        await page.getData()
        change(type, page)
        io.read = async () => { throw Error('后续GET失败') }
        if (type === 'information') io.refresh = async () => { throw Error('展示刷新失败') }
        assert.equal(await page.save(), true)
        assert.equal(calls.reads, 1)
        assert.equal(calls.successes.length, 1)
        assert.equal(page.submitError.value, '')
        assert.equal(page.hasUnsavedChanges.value, false)
        if (type === 'information') {
            assert.match(page.refreshWarning.value, /已保存.*刷新失败/)
            io.refresh = async () => {}
            await page.refreshConfig()
            assert.equal(page.refreshWarning.value, '')
            assert.equal(calls.writes.length, 1)
        }
    })
    test(`${type} 保存失败保留原草稿，重试成功才更新基线`, async () => {
        const { page, io, calls } = createPage(type)
        await page.getData()
        change(type, page)
        io.save = async () => { throw Error('模拟保存失败') }
        assert.equal(await page.save(), false)
        assert.equal(page.hasUnsavedChanges.value, true)
        assert.equal(calls.successes.length, 0)
        io.save = async () => {}
        assert.equal(await page.save(), true)
        assert.deepEqual(calls.writes[0], calls.writes[1])
        assert.equal(page.hasUnsavedChanges.value, false)
    })
    test(`${type} 保存中不重复写入或重读，保存快照不包含后来修改`, async () => {
        const { page, io, calls, hooks } = createPage(type)
        await page.getData()
        change(type, page)
        const pending = deferred()
        io.save = () => pending.promise
        const saving = page.save()
        await page.save()
        await page.reloadData()
        assert.equal(await hooks.leave(), false)
        assert.equal(calls.writes.length, 1)
        assert.equal(calls.reads, 1)
        change(type, page, '后来的草稿')
        pending.resolve()
        await saving
        assert.equal(page.hasUnsavedChanges.value, true, '保存基线只代表实际提交的快照')
    })
    test(`${type} 只读用户不可绕过按钮直接写入，离开仍保护编辑`, async () => {
        const { page, calls, feedback, hooks } = createPage(type, [])
        await page.getData()
        change(type, page)
        await page.save()
        assert.equal(calls.writes.length, 0)
        feedback.confirm = async () => { throw Error('取消离开') }
        assert.equal(await hooks.leave(), false)
    })
    test(`${type} 再次加载失败保留已有草稿并暂停保存，成功重载后恢复`, async () => {
        const { page, io, calls } = createPage(type)
        await page.getData()
        change(type, page)
        io.read = async () => { throw Error('重新读取失败') }
        assert.equal(await page.reloadData(), false)
        assert.equal(page.hasLoadedData.value, true)
        assert.equal(page.hasUnsavedChanges.value, true)
        await page.save()
        assert.equal(calls.writes.length, 0)
        io.read = async () => clone(fixtures[type])
        await page.reloadData()
        change(type, page)
        assert.equal(await page.save(), true)
    })
    test(`${type} 异常响应不能作为空配置成功加载`, async () => {
        const { page, io, calls } = createPage(type)
        io.read = async () => null
        assert.equal(await page.getData(), false)
        assert.equal(page.hasLoadedData.value, false)
        assert.ok(page.loadErrorMessage.value)
        await page.save()
        assert.equal(calls.writes.length, 0)
    })
}

test('备案新增、删除与排序可用，非法索引与只读调用不能误删内容', async () => {
    const { page, calls } = createPage('filing')
    page.addItem()
    assert.equal(page.formData.value.length, 0)
    await page.getData()
    page.addItem()
    assert.equal(page.formData.value.length, 3)
    page.formData.value[2] = { name: '新增版权', link: '/about' }
    page.moveItem(2, -1)
    page.handleDelete(-1)
    assert.equal(page.formData.value.length, 3)
    assert.equal(page.formData.value[1].name, '新增版权')
    page.handleDelete(2)
    await page.save()
    assert.deepEqual(calls.writes[0], [{ name: '备案一', link: 'https://beian.miit.gov.cn/' }, { name: '新增版权', link: '/about' }])
    const readonly = createPage('filing', [])
    await readonly.page.getData()
    readonly.page.addItem()
    readonly.page.handleDelete(0)
    readonly.page.moveItem(0, 1)
    assert.deepEqual(clone(readonly.page.formData.value), fixtures.filing)
})

test('协议正文包含HTML和空白时原样往返，未编辑的另一份协议不改变', async () => {
    const { page, calls } = createPage('protocol')
    await page.getData()
    page.formData.value.service.name += '（修订标题）'
    await page.save()
    assert.equal(calls.writes[0].service.content, fixtures.protocol.service.content)
    assert.deepEqual(calls.writes[0].privacy, fixtures.protocol.privacy)
    page.formData.value.service.content += ' '
    assert.equal(page.hasUnsavedChanges.value, true)
})


test('协议编辑器初始化和只读回调不能改写正文或产生未保存提示', async () => {
    const { page, calls, hooks } = createPage('protocol')
    await page.getData()
    page.updateProtocolBody('service', '<p>归一化后的服务协议</p>')
    page.updateProtocolBody('privacy', '<p>归一化后的隐私政策</p>')
    assert.deepEqual(clone(page.formData.value), fixtures.protocol)
    assert.equal(page.hasUnsavedChanges.value, false)
    assert.equal(await hooks.leave(), true)
    assert.equal(calls.confirms, 0)
    assert.deepEqual(clone(page.editingBodies), { service: false, privacy: false })
})

test('协议正文必须明确开启对应编辑，另一份协议仍忽略更新', async () => {
    const { page } = createPage('protocol')
    page.startBodyEditing('service')
    assert.equal(page.editingBodies.service, false, '未加载不能开启编辑')
    await page.getData()
    page.startBodyEditing('service')
    assert.equal(page.formData.value.service.content, fixtures.protocol.service.content, '开启编辑不应自动改写HTML')
    page.updateProtocolBody('service', '<p>用户明确编辑的正文</p>')
    page.updateProtocolBody('privacy', '<p>另一份编辑器的初始化回调</p>')
    assert.equal(page.formData.value.service.content, '<p>用户明确编辑的正文</p>')
    assert.equal(page.formData.value.privacy.content, fixtures.protocol.privacy.content)
    assert.equal(page.hasUnsavedChanges.value, true)
    await page.reloadData()
    assert.deepEqual(clone(page.editingBodies), { service: false, privacy: false })
    page.updateProtocolBody('service', '<p>重载后的归一化回调</p>')
    assert.deepEqual(clone(page.formData.value), fixtures.protocol)
    assert.equal(page.hasUnsavedChanges.value, false)
})

test('仅修改协议标题时忽略编辑器回调，提交中两份原HTML逐字保留', async () => {
    const { page, calls } = createPage('protocol')
    await page.getData()
    page.updateProtocolBody('service', '<p>编辑器移除了空白和实体</p>')
    page.formData.value.service.name = '用户修改的协议标题'
    page.updateProtocolBody('privacy', '<p>编辑器格式化后的正文</p>')
    assert.equal(await page.handleSave(), true)
    assert.equal(calls.writes[0].service.content, fixtures.protocol.service.content)
    assert.deepEqual(calls.writes[0].privacy, fixtures.protocol.privacy)
})

test('无保存权限的协议页面不能开启正文编辑或接受回调', async () => {
    const { page } = createPage('protocol', [])
    await page.getData()
    page.startBodyEditing('service')
    page.updateProtocolBody('service', '<p>非法回调</p>')
    assert.equal(page.editingBodies.service, false)
    assert.deepEqual(clone(page.formData.value), fixtures.protocol)
    assert.equal(page.hasUnsavedChanges.value, false)
})

/** 运行共享编辑器脚本，模拟组件实例以验证真实只读门禁和动态切换。 */
const createEditor = (readonly = false) => {
    const source = fs.readFileSync(new URL('../src/components/editor/index.vue', import.meta.url), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const props = reactive({ modelValue: '  <p>原文&nbsp;</p>  ', readonly, mode: 'default', height: 480, width: 'auto', toolbarConfig: {} })
    const calls = { emitted: [], enabled: 0, disabled: 0, inserted: [] }
    const subject = execute(source, {
        shallowRef, watch, defineProps: () => props, withDefaults: value => value,
        defineEmits: () => (...args) => calls.emitted.push(args), onBeforeUnmount() {}, addUnit: value => value
    }, ['editorConfig', 'valueHtml', 'handleCreated', 'selectChange'])
    subject.handleCreated({ enable: () => { calls.enabled++ }, disable: () => { calls.disabled++ }, destroy() {} })
    return { subject, props, calls }
}

test('共享编辑器默认可编辑；只读初始化不向父组件发送归一化HTML', () => {
    const readonly = createEditor(true)
    assert.equal(readonly.subject.editorConfig.readOnly, true)
    readonly.subject.valueHtml.value = '<p>归一化后的内容</p>'
    assert.equal(readonly.calls.emitted.length, 0)
    assert.equal(readonly.calls.disabled, 1)
    const editable = createEditor()
    assert.equal(editable.subject.editorConfig.readOnly, false)
    editable.subject.valueHtml.value = '<p>正常编辑</p>'
    assert.deepEqual(clone(editable.calls.emitted), [['update:modelValue', '<p>正常编辑</p>']])
})

test('共享编辑器只读切换调用enable/disable，关闭编辑后忽略延迟更新和素材选择', () => {
    const { subject, props, calls } = createEditor(true)
    props.readonly = false
    assert.equal(calls.enabled, 1)
    subject.valueHtml.value = '<p>用户修改</p>'
    assert.equal(calls.emitted.length, 1)
    props.readonly = true
    assert.equal(calls.disabled, 2)
    subject.valueHtml.value = '<p>延迟回调</p>'
    subject.selectChange(['/late-image.png'])
    assert.equal(calls.emitted.length, 1)
})
