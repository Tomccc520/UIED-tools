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
import { computed, effectScope, nextTick, reactive, ref, watch } from 'vue'
import * as links from '../src/views/setting/website/composables/config-links.ts'
import { readContentArray, updateContentItem } from '../src/views/setting/website/composables/frontend-content.ts'
const root = new URL('../src/views/setting/website/components/', import.meta.url)
/** 创建包含组级和链接级未知字段的真实形态样本。 */
const fixture = () => JSON.stringify([{ title: '设计', status: 0, extra: { keep: true }, items: [{ name: 'A', link: '/a', nofollow: true }, { name: 'B', link: '/b', extra: ['keep'] }] }, { title: '图片', isOpen: false, items: [] }])
/** 读取真实组件的操作代码，Vue响应式保持真实，只替换props和父级v-model事件边界。 */
const createEditor = (name, modelValue, exposure, options = {}, onUpdate) => {
    const text = fs.readFileSync(new URL(name, root), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('editor.ts', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const script = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const props = reactive({ modelValue, label: '测试链接', disabled: false, sortable: true, ...options })
    const calls = []
    const context = vm.createContext({ computed, reactive, ref, watch, Error, ...links, readContentArray, updateContentItem,
        defineProps: () => props,
        withDefaults: (value, defaults) => { for (const key of Object.keys(defaults)) if (!(key in value)) value[key] = defaults[key]; return value },
        defineEmits: () => (event, value) => { calls.push({ event, value }); props.modelValue = value; onUpdate?.(value) }
    })
    const scope = effectScope()
    scope.run(() => vm.runInContext(ts.transpileModule(script + '\nthis.subject={' + exposure + '};', { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, context))
    return { props, calls, page: context.subject, dispose: () => scope.stop() }
}

/** 连接两个真实组件脚本的父子事件和响应式属性，保留同一子实例以复现分组复用。 */
const createNestedEditors = (value, t) => {
    const groups = createEditor('config-link-groups-editor.vue', value, 'selectGroup,activeIndex,linksContext,selectedGroup,updateLinks,updateTitle,removeGroup,moveGroup')
    const currentItems = () => JSON.stringify(groups.page.selectedGroup.value?.items ?? [], null, 2)
    const items = createEditor('content-links-editor.vue', currentItems(), 'remove,undoRemove,canUndo,update', { contextKey: groups.page.linksContext.value }, next => groups.page.updateLinks(next))
    const stop = watch([() => groups.page.linksContext.value, currentItems], ([contextKey, modelValue]) => {
        items.props.contextKey = contextKey
        items.props.modelValue = modelValue
    }, { flush: 'sync' })
    t.after(() => { stop(); items.dispose(); groups.dispose() })
    return { groups, items }
}

test('严格解析拒绝坏JSON、null、非对象数组及损坏的items，不回退为[]', () => {
    for (const value of ['{', 'null', '{}', '[null]', '[1]', '[[1]]']) assert.throws(() => links.readConfigObjectArray(value))
    for (const value of ['[{"title":"A","items":null}]', '[{"title":"A","items":{}}]', '[{"title":1,"items":[]}]']) assert.throws(() => links.readConfigLinkGroups(value))
    assert.deepEqual(links.readConfigObjectArray(''), [])
})

test('分组改名和排序保留零值、布尔值、嵌套扩展及未改分组，不修改输入', () => {
    const original = fixture()
    const changed = links.updateConfigLinkGroup(original, 0, { title: '新设计' })
    const moved = links.readConfigLinkGroups(links.moveConfigLinkGroup(changed, 0, 1))
    assert.equal(moved[1].status, 0); assert.equal(moved[1].items[0].nofollow, true)
    assert.deepEqual(moved[1].extra, { keep: true }); assert.deepEqual(moved[0], JSON.parse(original)[1])
    assert.equal(fixture(), original)
})

test('字段补丁仅包含差异，合法空值保留，未编辑损坏字段不被重写', () => {
    assert.deepEqual(links.buildConfigFieldPatch({ text: '', links: '[]', broken: '{' }, { text: 'old', links: '[1]', broken: '{' }), { text: '', links: '[]' })
    assert.deepEqual(links.buildConfigFieldPatch({ zero: '0' }, { zero: '0' }), {})
    assert.throws(() => links.updateConfigLinkGroup(fixture(), -1, { title: 'bad' }))
    assert.throws(() => links.removeConfigLinkGroup(fixture(), 9))
})

test('分组新增后选择新组，编辑不丢已有组；移动后选择跟随原分组', async t => {
    const editor = createEditor('config-link-groups-editor.vue', fixture(), 'addGroup,activeIndex,updateTitle,moveGroup,parsed')
    t.after(editor.dispose)
    editor.page.addGroup(); await nextTick()
    assert.equal(editor.page.activeIndex.value, 2)
    editor.page.updateTitle('新增')
    assert.equal(JSON.parse(editor.props.modelValue)[0].status, 0)
    editor.page.moveGroup(-1); await nextTick()
    assert.equal(editor.page.activeIndex.value, 1)
    assert.equal(editor.page.parsed.value.items[1].title, '新增')
})

test('分组删除可撤销；后续编辑或外部重载后不允许用旧撤销覆盖新数据', async t => {
    const editor = createEditor('config-link-groups-editor.vue', fixture(), 'removeGroup,undoRemove,canUndo,replaceRaw,parsed')
    t.after(editor.dispose)
    const before = editor.props.modelValue
    editor.page.removeGroup(); await nextTick()
    assert.equal(editor.page.canUndo.value, true)
    editor.page.undoRemove(); await nextTick()
    assert.equal(editor.props.modelValue, before)
    editor.page.removeGroup(); editor.page.replaceRaw('[]')
    editor.page.undoRemove(); assert.equal(editor.props.modelValue, '[]')
})

test('分组只读时允许查看其他组，但编辑、添加、移除、原文替换均不发事件', async t => {
    const editor = createEditor('config-link-groups-editor.vue', fixture(), 'selectGroup,activeIndex,updateTitle,updateLinks,addGroup,moveGroup,removeGroup,replaceRaw', { disabled: true })
    t.after(editor.dispose)
    editor.page.selectGroup(1); await nextTick()
    assert.equal(editor.page.activeIndex.value, 1)
    editor.page.updateTitle('不能写'); editor.page.updateLinks('[]'); editor.page.addGroup(); editor.page.moveGroup(-1); editor.page.removeGroup(); editor.page.replaceRaw('[]')
    assert.equal(editor.calls.length, 0)
})

test('分组原文损坏时保留输入，普通动作不提交默认值；修复后恢复编辑', async t => {
    const editor = createEditor('config-link-groups-editor.vue', '{', 'parsed,addGroup,replaceRaw,updateTitle')
    t.after(editor.dispose)
    assert.match(editor.page.parsed.value.error, /JSON/)
    editor.page.addGroup(); assert.equal(editor.calls.length, 0); assert.equal(editor.props.modelValue, '{')
    editor.page.replaceRaw(fixture()); await nextTick()
    editor.page.updateTitle('已修复')
    assert.equal(JSON.parse(editor.props.modelValue)[0].title, '已修复')
})

test('链接排序、修改和移除撤销保留扩展字段，分组父级重新序列化也可撤销', t => {
    const list = JSON.stringify(JSON.parse(fixture())[0].items, null, 2)
    const editor = createEditor('content-links-editor.vue', list, 'move,update,remove,undoRemove,canUndo')
    t.after(editor.dispose)
    editor.page.move(0, 1)
    assert.equal(JSON.parse(editor.props.modelValue)[1].nofollow, true)
    editor.page.update(1, 'name', 'A新')
    assert.deepEqual(JSON.parse(editor.props.modelValue)[0].extra, ['keep'])
    const beforeRemove = editor.props.modelValue
    editor.page.remove(1)
    // 模拟可视化分组父级采用相同格式回写链接子组件，不能破坏撤销条件。
    editor.props.modelValue = JSON.stringify(links.readConfigLinks(editor.props.modelValue), null, 2)
    assert.equal(editor.page.canUndo.value, true)
    editor.page.undoRemove(); assert.equal(editor.props.modelValue, beforeRemove)
})

test('链接只读、非法内容与排序边界不会发出意外修改事件', t => {
    const readonly = createEditor('content-links-editor.vue', '[{"name":"A","link":"/a"}]', 'add,update,remove,move,replaceRaw', { disabled: true })
    t.after(readonly.dispose)
    readonly.page.add(); readonly.page.update(0, 'name', 'bad'); readonly.page.remove(0); readonly.page.move(0, 1); readonly.page.replaceRaw('[]')
    assert.equal(readonly.calls.length, 0)
    const broken = createEditor('content-links-editor.vue', '{', 'add,update,remove,move')
    t.after(broken.dispose)
    broken.page.add(); broken.page.update(0, 'name', 'bad'); broken.page.remove(0); broken.page.move(0, 1)
    assert.equal(broken.calls.length, 0); assert.equal(broken.props.modelValue, '{')
})

test('切换到另一空分组不能撤销上一组的链接删除，切回也不恢复旧撤销', t => {
    const { groups, items } = createNestedEditors(JSON.stringify([{ title: 'A', items: [{ name: 'A链接', link: '/a' }] }, { title: 'B', items: [] }]), t)
    items.page.remove(0)
    assert.equal(items.page.canUndo.value, true)
    groups.page.selectGroup(1)
    assert.equal(items.page.canUndo.value, false)
    const before = groups.props.modelValue
    items.page.undoRemove()
    assert.equal(groups.props.modelValue, before)
    assert.deepEqual(JSON.parse(groups.props.modelValue)[1].items, [])
    groups.page.selectGroup(0)
    assert.equal(items.page.canUndo.value, false)
})

test('删除分组后相同索引复用子实例，不能把被删分组的链接撤销到新组', t => {
    const { groups, items } = createNestedEditors(JSON.stringify([{ title: 'A', items: [{ name: 'A链接', link: '/a' }] }, { title: 'B', items: [] }]), t)
    items.page.remove(0)
    assert.equal(items.page.canUndo.value, true)
    groups.page.removeGroup()
    assert.equal(groups.page.activeIndex.value, 0)
    assert.equal(items.page.canUndo.value, false)
    items.page.undoRemove()
    assert.deepEqual(JSON.parse(groups.props.modelValue), [{ title: 'B', items: [] }])
})

test('同一分组改名和编辑链接不重建上下文，当前组仍可撤销自身删除', t => {
    const { groups, items } = createNestedEditors(JSON.stringify([{ title: 'A', items: [{ name: 'A链接', link: '/a' }, { name: 'B链接', link: '/b' }] }]), t)
    const contextKey = groups.page.linksContext.value
    items.page.update(0, 'name', '更新名称')
    assert.equal(groups.page.linksContext.value, contextKey)
    items.page.remove(0)
    groups.page.updateTitle('新组名')
    assert.equal(groups.page.linksContext.value, contextKey)
    assert.equal(items.page.canUndo.value, true)
    items.page.undoRemove()
    assert.equal(JSON.parse(groups.props.modelValue)[0].title, '新组名')
    assert.equal(JSON.parse(groups.props.modelValue)[0].items[0].name, '更新名称')
})

test('不可逆的扩展数字拒绝可视编辑，超大整数、指数和长小数原文保留', t => {
    for (const number of ['9007199254740993', '-9007199254740993', '1e400', '1e-400', '0.123456789012345678901']) {
        const raw = `[{"name":"A","link":"/a","extension":${number}}]`
        assert.throws(() => links.readConfigLinks(raw))
        const editor = createEditor('content-links-editor.vue', raw, 'parsed,add,update,remove,move')
        t.after(editor.dispose)
        assert.match(editor.page.parsed.value.error, /无法无损保存/)
        editor.page.add(); editor.page.update(0, 'name', '不应修改'); editor.page.remove(0); editor.page.move(0, 1)
        assert.equal(editor.calls.length, 0)
        assert.equal(editor.props.modelValue, raw)
    }
})

test('可逆指数数值和数字字符串仍可编辑，扩展内容保留', t => {
    const raw = '[{"name":"A","link":"/a","extension":1e3,"id":"9007199254740993"}]'
    const editor = createEditor('content-links-editor.vue', raw, 'parsed,update')
    t.after(editor.dispose)
    assert.equal(editor.page.parsed.value.error, '')
    editor.page.update(0, 'name', '新名称')
    assert.equal(JSON.parse(editor.props.modelValue)[0].extension, 1000)
    assert.equal(JSON.parse(editor.props.modelValue)[0].id, '9007199254740993')
})
