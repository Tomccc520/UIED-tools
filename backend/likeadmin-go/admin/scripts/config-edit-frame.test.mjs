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
import * as Vue from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parse, compileScript } from '@vue/compiler-sfc'

const filename = new URL('../src/components/config-edit-frame/index.vue', import.meta.url)
const { descriptor } = parse(fs.readFileSync(filename, 'utf8'), { filename: filename.pathname })
const script = compileScript(descriptor, { id: 'config-edit-frame-test', inlineTemplate: true })
const compiled = ts.transpileModule(script.content, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }
}).outputText
const module = { exports: {} }
/** 编译真实组件，仅允许既有 Vue 运行时；组件本身没有 API 或浏览器依赖。 */
const requireRuntime = name => {
    if (name === 'vue') return Vue
    throw Error(`组件引入了未声明依赖：${name}`)
}
vm.runInNewContext(compiled, { exports: module.exports, module, require: requireRuntime })
const Frame = module.exports.default

/** 提取插槽可见文字，供测试定位真实渲染出的重新加载按钮。 */
const vnodeText = value => Array.isArray(value)
    ? value.map(vnodeText).join('')
    : typeof value === 'string' ? value : value?.children ? vnodeText(value.children) : ''

/** 渲染真实配置骨架，只把 Arco 的视觉边界替换为原生元素；保留插槽、事件、条件和计算属性。 */
const renderFrame = async (props = {}) => {
    const buttons = []
    let retries = 0
    const app = Vue.createSSRApp({
        render: () => Vue.h(Frame, {
            loading: false, ready: true, dirty: false, saving: false,
            ...props, onRetry: () => retries++
        }, {
            default: () => Vue.h('input', { name: 'business-content' }),
            actions: () => Vue.h('button', { class: 'business-save' }, '保存配置')
        })
    })
    app.component('a-alert', Vue.defineComponent({
        inheritAttrs: false,
        /** 消息边界保留错误角色与重试插槽，不伪造加载或保存结果。 */
        setup: (_, { attrs, slots }) => () => Vue.h('div', attrs, [slots.default?.(), slots.action?.()])
    }))
    app.component('a-spin', Vue.defineComponent({
        inheritAttrs: false,
        /** 加载视觉只透传内容，禁用与 inert 继续由真实配置骨架生成。 */
        setup: (_, { slots }) => () => Vue.h('div', slots.default?.())
    }))
    app.component('a-button', Vue.defineComponent({
        inheritAttrs: false,
        /** 记录组件生成的按钮事件，不自行实现重试逻辑。 */
        setup: (_, { attrs, slots }) => () => {
            const children = slots.default?.()
            buttons.push({ ...attrs, text: vnodeText(children) })
            return Vue.h('button', attrs, children)
        }
    }))
    const html = await renderToString(app)
    return { html, buttons, retries: () => retries }
}

test('默认配置页仍有唯一保存区和业务操作，不因新属性改变旧页面', async () => {
    const { html } = await renderFrame()
    assert.equal((html.match(/<footer\b/g) || []).length, 1)
    assert.match(html, /class="config-edit-frame" data-state="ready" aria-busy="false"/)
    assert.match(html, /当前没有未保存更改/)
    assert.match(html, /business-save/)
})

test('无草稿的列表可隐藏空闲保存区，保留业务内容和可观测读取状态', async () => {
    const { html } = await renderFrame({ showSaveBar: false })
    assert.doesNotMatch(html, /<footer\b/)
    assert.doesNotMatch(html, /business-save/)
    assert.match(html, /name="business-content"/)
    assert.match(html, /data-state="ready"/)
})

test('保存条被请求收起时，真实草稿、保存中和保存失败仍强制显示操作与状态', async () => {
    for (const [props, state, text] of [
        [{ dirty: true }, 'dirty', '有未保存的更改'],
        [{ saving: true }, 'saving', '正在保存更改'],
        [{ saveError: '保存失败，修改已保留' }, 'error', '保存未成功，修改已保留']
    ]) {
        const { html } = await renderFrame({ showSaveBar: false, ...props })
        assert.match(html, /<footer\b/)
        assert.match(html, new RegExp(`data-state="${state}"`))
        assert.ok(html.includes(text))
        assert.match(html, /business-save/)
    }
})

test('读取失败即使收起保存区仍显示错误和有效重试入口，不能编辑默认值', async () => {
    const { html, buttons, retries } = await renderFrame({ showSaveBar: false, ready: false, error: '读取失败，请重试' })
    assert.match(html, /role="alert"/)
    assert.match(html, /读取失败，请重试/)
    assert.match(html, /<fieldset[^>]*disabled[^>]*inert/)
    const retry = buttons.find(button => button.text === '重新加载')
    assert.ok(retry)
    assert.equal(retry.disabled, false)
    retry.onClick()
    assert.equal(retries(), 1)
    assert.doesNotMatch(html, /<footer\b/)
})

test('收起空闲保存区不会放开加载期间编辑，保存成功后可重新回到轻量列表', async () => {
    const loading = await renderFrame({ showSaveBar: false, loading: true, ready: false })
    assert.match(loading.html, /data-state="loading" aria-busy="true"/)
    assert.match(loading.html, /<fieldset[^>]*disabled[^>]*inert/)
    const saved = await renderFrame({ showSaveBar: false, savedAt: '2026-10-26 12:00:00' })
    assert.match(saved.html, /data-state="saved"/)
    assert.doesNotMatch(saved.html, /<footer\b/)
})
