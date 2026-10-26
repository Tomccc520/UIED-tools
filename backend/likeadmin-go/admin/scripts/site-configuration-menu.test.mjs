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
import { computed, reactive, ref, watch, nextTick, effectScope } from 'vue'

/** 编译真实纯函数工具，类型导入会被剥离，不访问账号或数据库。 */
const loadUtils = async file => {
    const source = fs.readFileSync(new URL('../src/utils/' + file, import.meta.url), 'utf8')
    let code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText
    if (file === 'site-configuration.ts') {
        const navigation = fs.readFileSync(new URL('../src/utils/admin-navigation.ts', import.meta.url), 'utf8')
        const dependency = ts.transpileModule(navigation, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText
        const url = `data:text/javascript;base64,${Buffer.from(dependency).toString('base64')}`
        code = code.replace(/from ['"]\.\/admin-navigation['"]/g, `from '${url}'`)
    }
    return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}
const { buildConfigurationMenuGroups, configurationPath, configurationTitle } = await loadUtils('site-configuration.ts')
const { resolveAdminNavigationPath, resolveAdminNavigationTarget, isAdminNavigationExternal, adminNavigationTitle, adminNavigationKey, groupAdminNavigation, findActiveAdminNavigation } = await loadUtils('admin-navigation.ts')
/** 创建原始授权菜单节点；分组必须保留这些对象，不写回规范标题。 */
const menu = (path, title, meta = {}, children) => ({ path, meta: { title, type: 'C', ...meta }, ...(children ? { children } : {}) })
/** 使用侧栏相同解析规则准备实际跳转地址，保留 query、锚点与外链。 */
const entries = nodes => nodes.map(route => ({ route, target: resolveAdminNavigationTarget(resolveAdminNavigationPath('/official_site', route.path), route.meta.query) }))

test('官网任务分组只整理当前已授权子节点，不注入广告或未授权配置', () => {
    const routes = [menu('tools_catalog', '工具主数据')]
    const groups = buildConfigurationMenuGroups(entries(routes))
    assert.equal(groups.length, 1)
    assert.equal(groups[0].title, '内容与工具')
    assert.equal(groups[0].items[0].label, '工具管理')
    assert.equal(groups[0].items[0].route, routes[0])
    assert.equal(groups.flatMap(group => group.items).length, 1)
    assert.equal(groups.some(group => Object.hasOwn(group, 'path')), false, '任务组是标题而非额外目录路由')
    assert.deepEqual(buildConfigurationMenuGroups([]), [])
})

test('三组规范叶子名称简化，组内保留服务端顺序，原菜单字段不变', () => {
    const routes = [menu('header', '顶部配置'), menu('tools_catalog', '工具目录'), menu('sidebar', '菜单配置'), menu('seo', 'SEO配置'), menu('information', '网站信息'), menu('frontend_layout', '前端布局'), menu('footer', '页脚配置')]
    const before = JSON.stringify(routes)
    const groups = buildConfigurationMenuGroups(entries(routes))
    assert.deepEqual(groups.map(group => group.title), ['内容与工具', '导航与外观', '站点与收录'])
    assert.deepEqual(groups.map(group => group.items.map(item => item.label)), [['工具管理', '学习与更新'], ['顶部与搜索', '前台菜单', '页脚链接'], ['全站SEO', '后台品牌']])
    assert.equal(JSON.stringify(routes), before)
    assert.equal(groups[1].items[0].route, routes[0])
})

test('未知、外链、原始查询串及JSON菜单参数全部保留，不能被展示映射改名或丢失', () => {
    const routes = [menu('seo', 'GEO规则', { query: '{"scope":"geo","mode":"edit"}' }), menu('tools_catalog?scope=images#editor', '图片工具专用'), menu('custom?mode=1#detail', '自定义页'), menu('https://example.com/official_site/seo?x=1#page', '外部帮助'), menu('//example.com/help', '协议相对外链'), menu('/operation/advertising', '已有跨模块链接')]
    const original = entries(routes)
    const groups = buildConfigurationMenuGroups(original)
    const items = groups.flatMap(group => group.items)
    assert.equal(items.length, routes.length)
    for (const entry of original) {
        const item = items.find(item => item.route === entry.route)
        assert.equal(item.target, entry.target)
        assert.equal(item.label, entry.route.meta.title)
    }
    assert.deepEqual(groups.at(-1).items.map(item => item.label), ['自定义页', '外部帮助', '协议相对外链', '已有跨模块链接'])
    assert.equal(groups.at(-1).title, '其他')
})

test('隐藏菜单与按钮不成为导航入口，重复目标与自定义嵌套目录仍保留原对象', () => {
    const nested = menu('custom-folder', '自定义目录', { type: 'M' }, [menu('child', '目录子页')])
    const routes = [menu('seo', '隐藏', { hidden: true }), menu('save', '保存权限', { type: 'A' }), menu('tools_catalog', '原始入口'), menu('tools_catalog', '第二个已授权入口'), nested]
    const groups = buildConfigurationMenuGroups(entries(routes))
    assert.equal(groups.flatMap(group => group.items).length, 3)
    assert.equal(groups[0].items.length, 2)
    assert.equal(groups.at(-1).items[0].route, nested)
    assert.equal(groups.at(-1).items[0].route.children, nested.children)
})

/** 执行真实菜单组件脚本，验证展示分组不会改变原点击目标和外链处理。 */
const createMenuComponent = props => {
    const script = fs.readFileSync(new URL('../src/layout/default/components/sidebar/menu-item.vue', import.meta.url), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('menu.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const source = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const calls = { pushed: [], opened: [] }
    const context = vm.createContext({ exports: {}, computed, defineProps: () => props,
        useRouter: () => ({ push: target => calls.pushed.push(target) }), window: { open: (...args) => calls.opened.push(args) },
        normalizeMenuIconName: value => value, adminNavigationKey, adminNavigationTitle, isAdminNavigationExternal
    })
    vm.runInContext(ts.transpileModule(source + '\nthis.subject={handleMenuClick,menuTitle,menuKey};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return { component: context.subject, calls }
}

test('真实侧栏叶子直接使用共享名称和完整地址，不再生成原目录套娃', () => {
    const item = reactive({ path: '/official_site/tools_catalog', title: '工具主数据', external: false, breadcrumb: '官网设置 / 工具主数据' })
    const { component } = createMenuComponent({ item })
    assert.equal(component.menuTitle.value, '工具管理')
    assert.equal(component.menuKey.value, '/official_site/tools_catalog')
    assert.equal(item.title, '工具主数据')
})

test('侧栏点击原样保留参数和锚点；展示名称与完整key随条目变化，外链安全打开', () => {
    const props = reactive({ item: { path: '/official_site/seo?scope=geo#editor', title: '自定义GEO', external: false } })
    const { component, calls } = createMenuComponent(props)
    assert.equal(component.menuTitle.value, '自定义GEO')
    assert.equal(component.menuKey.value, '/official_site/seo?scope=geo#editor')
    component.handleMenuClick()
    assert.deepEqual(calls.pushed, ['/official_site/seo?scope=geo#editor'])
    props.item = { path: 'https://example.com/help#topic', title: '外链', external: true }
    component.handleMenuClick()
    assert.deepEqual(calls.opened, [['https://example.com/help#topic', '_blank', 'noopener,noreferrer']])
})

/** 执行真实侧栏脚本与 Vue 响应式，检查分组自动展开及参数选中，不模拟菜单实现。 */
const createSidebarMenu = (routes, current) => {
    const script = fs.readFileSync(new URL('../src/layout/default/components/sidebar/menu.vue', import.meta.url), 'utf8').match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile('sidebar.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const source = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const props = reactive({ routes, uniqueOpened: false, isCollapsed: false, theme: 'light' })
    const route = reactive({ fullPath: current, meta: {} })
    const calls = { selected: 0, searches: 0 }
    const context = vm.createContext({ exports: {}, computed, reactive, ref, watch, defineProps: () => props,
        defineEmits: () => () => calls.selected++, useRoute: () => route, navigator: { platform: 'Mac' },
        groupAdminNavigation, findActiveAdminNavigation, adminNavigationKey,
        window: { dispatchEvent: () => calls.searches++ }, Event: class Event {}
    })
    const scope = effectScope()
    scope.run(() => vm.runInContext(ts.transpileModule(source + '\nthis.subject={selectedKeys,openGroupKeys,updateOpenGroups,openNavigationSearch};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context))
    return { menu: context.subject, route, props, calls, dispose: () => scope.stop() }
}

test('真实侧栏自动展开当前低频组，参数切换精确高亮，手动收起不改变页面', async t => {
    const state = createSidebarMenu([menu('/official_site/seo', 'SEO'), menu('/official_site/seo?scope=geo#panel', 'GEO专用'), menu('/consumer/order', '订单'), menu('/workbench', '工作台')], '/official_site/seo?scope=geo#panel')
    t.after(state.dispose)
    assert.deepEqual(Array.from(state.menu.selectedKeys.value), ['/official_site/seo?scope=geo#panel'])
    assert.deepEqual(Array.from(state.menu.openGroupKeys.value), ['admin-group:website'])
    state.menu.updateOpenGroups([])
    assert.equal(state.route.fullPath, '/official_site/seo?scope=geo#panel')
    state.route.fullPath = '/official_site/seo'
    await nextTick()
    assert.deepEqual(Array.from(state.menu.openGroupKeys.value), ['admin-group:website'], '从搜索进入同组其他页面也要展开当前组')
    state.props.uniqueOpened = true
    state.route.fullPath = '/consumer/order'
    await nextTick()
    assert.deepEqual(Array.from(state.menu.openGroupKeys.value), ['admin-group:users'])
    assert.deepEqual(Array.from(state.menu.selectedKeys.value), ['/consumer/order'])
    state.route.fullPath = '/workbench'
    await nextTick()
    assert.deepEqual(Array.from(state.menu.selectedKeys.value), ['/workbench'])
})

test('折叠侧栏恢复时展开当前分组；移动端搜索继续通知父级关闭抽屉', async t => {
    const state = createSidebarMenu([menu('/official_site/seo', 'SEO')], '/official_site/seo')
    t.after(state.dispose)
    state.props.isCollapsed = true
    state.menu.updateOpenGroups([])
    await nextTick()
    assert.deepEqual(Array.from(state.menu.openGroupKeys.value), [])
    state.props.isCollapsed = false
    await nextTick()
    assert.deepEqual(Array.from(state.menu.openGroupKeys.value), ['admin-group:website'])
    state.menu.openNavigationSearch()
    assert.equal(state.calls.searches, 1)
    assert.equal(state.calls.selected, 1)
})

/** 注册真实导航钩子但不执行登录流程，验证标题展示不会修改权限或菜单元数据。 */
const createNavigationHooks = () => {
    const source = fs.readFileSync(new URL('../src/permission.ts', import.meta.url), 'utf8')
    const parsed = ts.createSourceFile('permission.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const script = parsed.statements.filter(item => !ts.isImportDeclaration(item)).map(item => item.getText(parsed)).join('\n')
    const hooks = {}
    const document = { title: '当前页面' }
    const context = vm.createContext({ exports: {}, document, configurationTitle, config: { title: '后台管理系统' },
        NProgress: { configure() {}, done() {} }, PageEnum: { LOGIN: '/login', INDEX: '/workbench', ERROR_403: '/403' },
        router: { beforeEach: handler => { hooks.before = handler }, afterEach: handler => { hooks.after = handler } }
    })
    vm.runInContext(ts.transpileModule(script, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return { hooks, document }
}

test('浏览器标题与侧栏共享规范名，保留参数专用名称和原始meta', () => {
    const { hooks, document } = createNavigationHooks()
    const target = { fullPath: '/official_site/tools_catalog', meta: { title: '工具主数据' } }
    hooks.after(target, {}, undefined)
    assert.equal(document.title, '工具管理')
    assert.equal(target.meta.title, '工具主数据')
    hooks.after({ fullPath: '/official_site/frontend_layout', meta: { title: '前端布局' } }, {}, undefined)
    assert.equal(document.title, '学习与更新')
    hooks.after({ fullPath: '/official_site/tools_catalog?scope=images#edit', meta: { title: '图片专用' } }, {}, undefined)
    assert.equal(document.title, '图片专用')
})

test('导航取消不会把当前浏览器标题改为未到达的页面', () => {
    const { hooks, document } = createNavigationHooks()
    hooks.after({ fullPath: '/official_site/seo', meta: { title: 'SEO设置' } }, {}, new Error('cancelled'))
    assert.equal(document.title, '当前页面')
})
