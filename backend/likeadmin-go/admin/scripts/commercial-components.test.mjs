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
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'

const sourceRoot = path.resolve(import.meta.dirname, '../src')
const commercialRoot = path.join(sourceRoot, 'views/setting/user/components/commercial')

/** 从渲染中的 VNode 读取按钮文本，避免在组件渲染外调用插槽。 */
const vnodeText = (value) =>
    Array.isArray(value)
        ? value.map(vnodeText).join('')
        : typeof value === 'string'
        ? value
        : value?.children
        ? vnodeText(value.children)
        : ''

/** 使用内存宿主挂载真实 Vue 组件，不启动浏览器或连接真实接口。 */
const createRenderer = () => {
    /** 创建宿主节点，记录 Vue 条件渲染所需的父子关系。 */
    const node = (tag, text = '') => ({ tag, text, props: {}, children: [], parent: null })
    /** 移除宿主元素，组件状态和生命周期仍由真实 Vue 管理。 */
    const remove = (element) => {
        if (!element.parent) return
        const siblings = element.parent.children
        const index = siblings.indexOf(element)
        if (index >= 0) siblings.splice(index, 1)
        element.parent = null
    }
    const renderer = Vue.createRenderer({
        createElement: (tag) => node(tag),
        createText: (text) => node('#text', text),
        createComment: (text) => node('#comment', text),
        setText: (element, text) => {
            element.text = text
        },
        setElementText: (element, text) => {
            element.children = []
            element.text = text
        },
        parentNode: (element) => element.parent,
        nextSibling: (element) =>
            element.parent?.children[element.parent.children.indexOf(element) + 1] || null,
        patchProp: (element, key, previous, value) => {
            element.props[key] = value
        },
        remove,
        insert: (element, parent, anchor = null) => {
            remove(element)
            const index = anchor ? parent.children.indexOf(anchor) : -1
            if (index < 0) parent.children.push(element)
            else parent.children.splice(index, 0, element)
            element.parent = parent
        }
    })
    return { renderer, root: node('root') }
}

/** 编译真实父页和业务组件，Arco 只替换控件边界，数据与保存逻辑使用生产源码。 */
const mountCommercial = async (options = {}) => {
    const calls = { reads: 0, saves: [], certificates: 0, errors: [], successes: [] }
    const controls = []
    const route = options.route ?? Vue.reactive({ query: {} })
    const messages = {
        msgSuccess: (value) => calls.successes.push(value),
        msgError: (value) => calls.errors.push(value),
        msgWarning() {},
        confirm: async () => {}
    }
    const cache = new Map()
    const io = { read: null, save: async () => {}, ...options }
    const api = {
        getLogin: async () => {
            calls.reads++
            return io.read
                ? io.read()
                : {
                      ...load(
                          path.join(commercialRoot, 'commercial-config.ts')
                      ).createCommercialDraft(),
                      userCenterEnabled: 1,
                      userCenterLink: '/user-center'
                  }
        },
        setLogin: async (value) => {
            calls.saves.push(JSON.parse(JSON.stringify(value)))
            return io.save(value)
        },
        syncWechatPlatformCert: async () => {
            calls.certificates++
            return {}
        }
    }
    /** 在固定源码边界内解析模块；接口与消息统一替换，禁止加载实际请求客户端。 */
    const resolve = (specifier, from) => {
        if (specifier === 'vue') return Vue
        if (specifier === 'vue-router') return { onBeforeRouteLeave() {}, useRoute: () => route }
        if (specifier === '@/api/setting/user') return api
        if (specifier === '@/utils/feedback') return { default: messages }
        if (specifier.endsWith('/page-header/index.vue'))
            return {
                default: Vue.defineComponent({
                    props: ['title'],
                    setup:
                        (props, { slots }) =>
                        () =>
                            Vue.h('header', [
                                Vue.h('h1', props.title),
                                slots.subtitle?.(),
                                slots.extra?.()
                            ])
                })
            }
        const base = specifier.startsWith('@/')
            ? path.join(sourceRoot, specifier.slice(2))
            : path.resolve(path.dirname(from), specifier)
        const filename = [base, base + '.ts', base + '.vue'].find(
            (value) => fs.existsSync(value) && fs.statSync(value).isFile()
        )
        if (!filename || !filename.startsWith(sourceRoot))
            throw Error('测试边界没有提供模块：' + specifier)
        return load(filename)
    }
    /** 转译真实代码并连接已声明导入，不重写父页业务行为。 */
    const execute = (source, filename) => {
        const ast = ts.createSourceFile(
            filename,
            source,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TS
        )
        const bindings = { ...Vue, window: { addEventListener() {}, removeEventListener() {} } }
        for (const statement of ast.statements) {
            if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly) continue
            const module = resolve(statement.moduleSpecifier.text, filename)
            const clause = statement.importClause
            if (clause?.name) bindings[clause.name.text] = module.default
            for (const binding of clause?.namedBindings?.elements || []) {
                if (!binding.isTypeOnly)
                    bindings[binding.name.text] =
                        module[binding.propertyName?.text || binding.name.text]
            }
        }
        const body = ast.statements
            .filter((statement) => !ts.isImportDeclaration(statement))
            .map((statement) => statement.getText(ast))
            .join('\n')
        const context = vm.createContext({
            ...bindings,
            exports: {},
            console,
            require: (specifier) => resolve(specifier, filename)
        })
        vm.runInContext(
            ts.transpileModule(body, {
                compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }
            }).outputText,
            context,
            { filename }
        )
        return context.exports
    }
    /** 编译所需 Vue 文件，挂载和销毁均交给真实 Vue 渲染器。 */
    function load(filename) {
        if (cache.has(filename)) return cache.get(filename)
        const source = fs.readFileSync(filename, 'utf8')
        if (!filename.endsWith('.vue')) {
            const module = execute(source, filename)
            cache.set(filename, module)
            return module
        }
        const { descriptor } = parse(source, { filename })
        const id = 'commercial-test-' + path.basename(filename, '.vue')
        const script = compileScript(descriptor, { id })
        const component = execute(script.content, filename).default
        const template = compileTemplate({
            source: descriptor.template.content,
            filename,
            id,
            compilerOptions: { bindingMetadata: script.bindings }
        })
        assert.equal(template.errors.length, 0, filename + ' 模板应成功编译')
        component.render = execute(template.code, filename).render
        const module = { default: component }
        cache.set(filename, module)
        return module
    }
    /** 保留控件事件与插槽，用轻量节点观测实际 v-model 传播。 */
    const arco = (name) =>
        Vue.defineComponent({
            name: 'Fixture' + name,
            inheritAttrs: false,
            props: [
                'modelValue',
                'activeKey',
                'disabled',
                'loading',
                'placeholder',
                'inputAttrs',
                'textareaAttrs',
                'title'
            ],
            emits: ['update:modelValue', 'update:activeKey', 'click'],
            setup(props, { attrs, slots, emit }) {
                const control = { name, props, attrs, emit, active: true }
                controls.push(control)
                Vue.onBeforeUnmount(() => {
                    control.active = false
                })
                return () => {
                    const children = Object.values(slots).flatMap((slot) => slot())
                    control.text = vnodeText(children).trim()
                    return Vue.h(name === 'a-button' ? 'button' : 'div', attrs, children)
                }
            }
        })
    const { renderer, root } = createRenderer()
    const parent = load(path.join(sourceRoot, 'views/setting/user/login_register.vue')).default
    const app = renderer.createApp(parent)
    const sources = [...cache.keys()]
        .filter((filename) => filename.endsWith('.vue'))
        .map((filename) => fs.readFileSync(filename, 'utf8'))
        .join('\n')
    const tags = [...new Set([...sources.matchAll(/<(a-[a-z-]+)\b/g)].map((match) => match[1]))]
    for (const name of tags) app.component(name, arco(name))
    app.directive('perms', { mounted() {} })
    app.config.warnHandler = (message) => {
        throw Error(message)
    }
    const instance = app.mount(root)
    await new Promise((resolve) => setImmediate(resolve))
    await Vue.nextTick()
    const state = instance.$.setupState
    /** 定位当前挂载的字段，卸载面板控件不能参与操作。 */
    const field = (label) =>
        controls.find(
            (control) =>
                control.active &&
                (control.attrs['aria-label'] === label ||
                    control.props.inputAttrs?.['aria-label'] === label ||
                    control.props.textareaAttrs?.['aria-label'] === label ||
                    control.props.placeholder === label)
        )
    /** 通过控件事件更新真实草稿，不直接写草稿伪造字段操作。 */
    const edit = async (label, value) => {
        const target = field(label)
        assert.ok(target, '应找到字段：' + label)
        target.emit('update:modelValue', value)
        await Vue.nextTick()
    }
    /** 通过当前仍挂载按钮的真实事件执行草稿操作。 */
    const click = async (text) => {
        const target = controls.find(
            (control) => control.active && control.name === 'a-button' && control.text === text
        )
        assert.ok(target, '应找到按钮：' + text)
        target.emit('click')
        await Vue.nextTick()
    }
    /** 切换实际父页模块，触发生产模板的条件挂载与卸载。 */
    const section = async (name) => {
        state.activeSection = name
        await Vue.nextTick()
    }
    return {
        state,
        calls,
        controls,
        field,
        edit,
        click,
        section,
        io,
        createDraft: load(path.join(commercialRoot, 'commercial-config.ts')).createCommercialDraft,
        resolveSection: load(path.join(commercialRoot, 'commercial-config.ts')).resolveCommercialSection,
        unmount: () => app.unmount()
    }
}

test('模块按需挂载，字段事件更新唯一草稿，往返切换保留商业化及凭据编辑', async () => {
    const fixture = await mountCommercial()
    const { state, calls, field, edit, section } = fixture
    assert.ok(field('请输入入口文案，如：用户中心 / 会员中心'))
    assert.equal(field('每日赠送积分'), undefined)
    assert.equal(field('请输入支付网关鉴权令牌'), undefined)
    await edit('请输入入口文案，如：用户中心 / 会员中心', '新的入口')
    await section('billing')
    assert.equal(field('请输入入口文案，如：用户中心 / 会员中心'), undefined)
    await edit('每日赠送积分', 0)
    await edit('第1个会员套餐名称', '新的会员名称')
    await section('payment')
    await edit('可选：后端调用支付网关下单时用于签名', 'synthetic-only-secret')
    await section('access')
    assert.equal(field('请输入入口文案，如：用户中心 / 会员中心').props.modelValue, '新的入口')
    assert.equal(state.formData.dailyGiftPoints, 0)
    assert.equal(state.formData.memberPlans[0].name, '新的会员名称')
    assert.equal(state.formData.paymentRequestSecret, 'synthetic-only-secret')
    assert.equal(state.hasUnsavedChanges, true)
    assert.equal(calls.reads, 1)
    assert.equal(calls.saves.length, 0)
    assert.equal(calls.certificates, 0)
    fixture.unmount()
})

test('共享套餐字段事件不改邻行、扩展字段及积分包', async () => {
    const fixture = await mountCommercial()
    await fixture.section('billing')
    fixture.state.formData.memberPlans[0].extension = { keep: 'yes' }
    const neighbor = JSON.stringify(fixture.state.formData.memberPlans[1])
    const packs = JSON.stringify(fixture.state.formData.pointsPacks)
    await fixture.edit('第1个会员套餐价格', 0)
    assert.equal(fixture.state.formData.memberPlans[0].price, 0)
    assert.equal(fixture.state.formData.memberPlans[0].extension.keep, 'yes')
    assert.equal(JSON.stringify(fixture.state.formData.memberPlans[1]), neighbor)
    assert.equal(JSON.stringify(fixture.state.formData.pointsPacks), packs)
    fixture.unmount()
})

test('读取失败后切换模块仍不能提交默认值，重试成功前保持保存门禁', async () => {
    const fixture = await mountCommercial({
        read: async () => {
            throw Error('synthetic read failure')
        }
    })
    await fixture.section('payment')
    await fixture.state.handleSubmit()
    await fixture.section('billing')
    await fixture.state.handleSubmit()
    assert.equal(fixture.calls.saves.length, 0)
    assert.equal(fixture.calls.successes.length, 0)
    assert.match(fixture.state.loadErrorMessage, /加载失败/)
    fixture.unmount()
})

test('面板卸载不保存，保存失败重试保留全部模块草稿', async () => {
    const fixture = await mountCommercial({
        save: async () => {
            throw Error('synthetic write failure')
        }
    })
    await fixture.section('billing')
    await fixture.edit('每日赠送积分', 0)
    await fixture.edit('第1个积分包名称', '新的积分包')
    await fixture.section('payment')
    await fixture.edit('可选：后端调用支付网关下单时用于签名', 'synthetic-retry-secret')
    await fixture.state.handleSubmit()
    assert.equal(fixture.calls.saves.length, 1)
    assert.equal(fixture.state.hasUnsavedChanges, true)
    assert.match(fixture.state.submitError, /保存失败/)
    await fixture.section('access')
    fixture.io.save = async () => {}
    await fixture.state.handleSubmit()
    assert.equal(fixture.calls.saves.length, 2)
    assert.equal(fixture.calls.saves[1].pointsPacks[0].name, '新的积分包')
    assert.equal(fixture.calls.saves[1].dailyGiftPoints, 0)
    assert.equal(fixture.calls.saves[1].paymentRequestSecret, 'synthetic-retry-secret')
    assert.equal(fixture.state.hasUnsavedChanges, false)
    fixture.unmount()
})

test('工具规则预设保留免费零积分，过滤后的删除仍定位原数组索引', async () => {
    const fixture = await mountCommercial()
    await fixture.section('billing')
    await fixture.click('新增空规则')
    await fixture.edit('第1条规则工具标识', 'unrelated-tool')
    await fixture.click('新增空规则')
    await fixture.edit('第2条规则工具标识', 'video-compress')
    await fixture.edit('从常用工具预设快速新增', 'video-compress')
    await fixture.click('添加预设')
    assert.equal(fixture.state.formData.toolConsumeRules.length, 2)
    assert.equal(fixture.state.formData.toolConsumeRules[1].consumePoints, 0)
    assert.equal(fixture.field('第1条规则工具标识'), undefined)
    assert.ok(fixture.field('第2条规则工具标识'))
    await fixture.click('删除')
    assert.equal(fixture.state.formData.toolConsumeRules.length, 1)
    assert.equal(fixture.state.formData.toolConsumeRules[0].toolKey, 'unrelated-tool')
    assert.equal(fixture.calls.saves.length, 0)
    fixture.unmount()
})

test('同一商业化模型创建的不同草稿不共享套餐、积分包或风控对象', async () => {
    const fixture = await mountCommercial()
    const first = fixture.createDraft()
    const second = fixture.createDraft()
    first.memberPlans[0].name = '只修改第一份会员套餐'
    first.pointsPacks[0].points = 1
    first.consumeRiskRules.perMinute = 0
    assert.notEqual(second.memberPlans[0].name, first.memberPlans[0].name)
    assert.notEqual(second.pointsPacks[0].points, first.pointsPacks[0].points)
    assert.equal(second.consumeRiskRules.perMinute, 30)
    fixture.unmount()
})

test('初始分区仅接受白名单单值，非法或重复参数安全回到访问设置', async () => {
    const fixture = await mountCommercial()
    for (const value of ['access', 'billing', 'payment']) assert.equal(fixture.resolveSection(value), value)
    for (const value of [undefined, null, '', 'Billing', ' billing ', 'constructor', ['billing'], ['billing', 'payment'], {}, 0])
        assert.equal(fixture.resolveSection(value), 'access')
    assert.equal(fixture.state.activeSection, 'access')
    assert.equal(fixture.calls.saves.length, 0)
    fixture.unmount()
})

test('计费设置链接首次直达会员页，其他标签路由变化不切走当前面板或草稿', async () => {
    const route = Vue.reactive({ query: { section: 'billing' } })
    const fixture = await mountCommercial({ route })
    assert.equal(fixture.state.activeSection, 'billing')
    assert.ok(fixture.field('每日赠送积分'))
    assert.equal(fixture.field('请输入入口文案，如：用户中心 / 会员中心'), undefined)
    await fixture.edit('每日赠送积分', 17)
    route.query.section = 'payment'
    await Vue.nextTick()
    assert.equal(fixture.state.activeSection, 'billing')
    assert.equal(fixture.state.formData.dailyGiftPoints, 17)
    assert.equal(fixture.state.hasUnsavedChanges, true)
    assert.equal(fixture.calls.reads, 1)
    assert.equal(fixture.calls.saves.length, 0)
    fixture.unmount()
})

test('支付分区可直达，重复section参数仍只挂载访问设置', async () => {
    const payment = await mountCommercial({ route: { query: { section: 'payment' } } })
    assert.equal(payment.state.activeSection, 'payment')
    assert.ok(payment.field('可选：后端调用支付网关下单时用于签名'))
    payment.unmount()
    const duplicated = await mountCommercial({ route: { query: { section: ['billing', 'payment'] } } })
    assert.equal(duplicated.state.activeSection, 'access')
    assert.ok(duplicated.field('请输入入口文案，如：用户中心 / 会员中心'))
    assert.equal(duplicated.calls.saves.length, 0)
    duplicated.unmount()
})
