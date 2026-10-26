/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'
import Arco from '@arco-design/web-vue'

const layoutRoot = path.resolve(import.meta.dirname, '../src/layout/default')

/** 使用真实 Arco Menu 观测公开 LayoutSider 的折叠注入，不导入或修改组件库内部 context。 */
const menuContent = () => Vue.h(Arco.Menu, { collapsed: false }, () =>
    Vue.h(Arco.SubMenu, { key: 'ai', title: 'AI服务' }, () =>
        Vue.h(Arco.MenuItem, { key: 'provider' }, () => '模型服务商')))

/** 编译生产 Layout 与 Sidebar，仅隔离页面、账号和抽屉 ClientOnly 边界，真实保留组件祖先关系。 */
const renderLayout = async ({ mobile, collapsed }) => {
    const appStore = Vue.reactive({ isMobile: mobile, isCollapsed: collapsed, toggleCollapsed(value) { this.isCollapsed = value } })
    const settingStore = Vue.reactive({ openMultipleTabs: true, sideWidth: 200 })
    const cache = new Map()
    let sideCount = 0
    const side = Vue.defineComponent({ setup() { sideCount++; return menuContent } })
    const blank = Vue.defineComponent({ render: () => null })
    /** 限制测试导入边界，不载入真实用户、页面数据或网络客户端。 */
    const resolve = (specifier, from) => {
        if (specifier === 'vue') return Vue
        if (specifier === '@/stores/modules/app') return { default: () => appStore }
        if (specifier === '@/stores/modules/setting') return { default: () => settingStore }
        if (specifier.endsWith('/components/main.vue') || specifier.endsWith('/components/header/index.vue')) return { default: blank }
        if (specifier === './side.vue') return { default: side }
        const target = path.resolve(path.dirname(from), specifier)
        if (target !== path.join(layoutRoot, 'components/sidebar/index.vue')) throw Error('未声明的测试模块：' + specifier)
        return { default: load(target) }
    }
    /** 执行 SFC 编译产物，保留真实 setup、条件分支与插槽组件层级。 */
    const execute = (source, filename) => {
        const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
        const bindings = { ...Vue }
        for (const statement of ast.statements) {
            if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly) continue
            const module = resolve(statement.moduleSpecifier.text, filename)
            const clause = statement.importClause
            if (clause?.name) bindings[clause.name.text] = module.default
            for (const item of clause?.namedBindings?.elements || []) {
                if (!item.isTypeOnly) bindings[item.name.text] = module[item.propertyName?.text || item.name.text]
            }
        }
        const body = ast.statements.filter(statement => !ts.isImportDeclaration(statement)).map(statement => statement.getText(ast)).join('\n')
        const context = vm.createContext({ ...bindings, exports: {} })
        vm.runInContext(ts.transpileModule(body, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
        return context.exports
    }
    /** 读取真实布局文件，不复制布局模板或覆盖其条件渲染。 */
    function load(filename) {
        if (cache.has(filename)) return cache.get(filename)
        const { descriptor, errors } = parse(fs.readFileSync(filename, 'utf8'), { filename })
        assert.equal(errors.length, 0)
        const script = compileScript(descriptor, { id: filename })
        const component = execute(script.content, filename).default
        const template = compileTemplate({ source: descriptor.template.content, filename, id: filename, compilerOptions: { bindingMetadata: script.bindings } })
        assert.equal(template.errors.length, 0)
        component.render = execute(template.code, filename).render
        cache.set(filename, component)
        return component
    }
    const app = Vue.createSSRApp(load(path.join(layoutRoot, 'index.vue')))
    app.component('a-layout', Arco.Layout)
    app.component('a-layout-sider', Arco.LayoutSider)
    app.component('a-layout-content', Arco.LayoutContent)
    // 抽屉的 ClientOnly 在 SSR 不输出内容；用无注入的插槽边界保留真实 Vue 祖先关系。
    app.component('a-drawer', Vue.defineComponent({ props: ['visible'], setup: (props, { slots }) => () => Vue.h('div', { 'data-test-drawer': String(props.visible) }, slots.default?.()) }))
    const html = await renderToString(app)
    return { html, sideCount, collapsed: appStore.isCollapsed, sideWidth: settingStore.sideWidth }
}

test('真实 Arco Sider 注入会强制覆盖 Menu 的显式不折叠参数，回归场景有效', async () => {
    const app = Vue.createSSRApp({ render: () => Vue.h(Arco.LayoutSider, { collapsed: true, hideTrigger: true }, menuContent) })
    const html = await renderToString(app)
    assert.ok(html.includes('arco-menu-collapsed'))
})

test('手机生产布局只有一个菜单实例且不继承桌面 Sider 的强制折叠', async () => {
    const { html, sideCount, collapsed, sideWidth } = await renderLayout({ mobile: true, collapsed: false })
    assert.equal(sideCount, 1)
    assert.ok(html.includes('data-test-drawer="true"'))
    assert.ok(html.includes('模型服务商'))
    assert.equal(html.includes('arco-layout-sider'), false)
    assert.equal(html.includes('arco-menu-collapsed'), false)
    assert.equal(collapsed, false)
    assert.equal(sideWidth, 200)
})

test('手机关闭抽屉仍没有隐藏的第二份桌面菜单或 Sider 实例', async () => {
    const { html, sideCount } = await renderLayout({ mobile: true, collapsed: true })
    assert.equal(sideCount, 1)
    assert.ok(html.includes('data-test-drawer="false"'))
    assert.equal(html.includes('arco-layout-sider'), false)
    assert.equal(html.includes('arco-menu-collapsed'), false)
})

test('桌面保持唯一菜单与原有折叠偏好，不挂手机抽屉', async () => {
    for (const collapsed of [false, true]) {
        const result = await renderLayout({ mobile: false, collapsed })
        assert.equal(result.sideCount, 1)
        assert.equal(result.html.includes('data-test-drawer'), false)
        assert.ok(result.html.includes('arco-layout-sider'))
        assert.equal(result.html.includes('arco-menu-collapsed'), collapsed)
        assert.equal(result.collapsed, collapsed)
    }
})
