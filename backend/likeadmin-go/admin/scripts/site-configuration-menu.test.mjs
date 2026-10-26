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
import { computed, reactive } from 'vue'

/** 编译真实纯函数工具，类型导入会被剥离，不访问账号或数据库。 */
const loadUtils = async file => {
    const source = fs.readFileSync(new URL('../src/utils/' + file, import.meta.url), 'utf8')
    const code = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText
    return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}
const { buildConfigurationMenuGroups, configurationPath, configurationTitle } = await loadUtils('site-configuration.ts')
const { resolveAdminNavigationPath, resolveAdminNavigationTarget, isAdminNavigationExternal } = await loadUtils('admin-navigation.ts')
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
    assert.deepEqual(groups.map(group => group.items.map(item => item.label)), [['工具管理', '首页内容'], ['顶部与搜索', '前台菜单', '页脚链接'], ['全站SEO', '后台品牌']])
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
        normalizeMenuIconName: value => value, resolveAdminNavigationPath, resolveAdminNavigationTarget, isAdminNavigationExternal, buildConfigurationMenuGroups, configurationPath, configurationTitle
    })
    vm.runInContext(ts.transpileModule(source + '\nthis.subject={handleMenuClick,configurationMenuGroups,menuTitle};', { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText, context)
    return { component: context.subject, calls }
}

test('真实官网菜单直接提供分组叶子，其他父菜单不被重新分组', () => {
    const child = menu('tools_catalog', '工具主数据')
    const { component } = createMenuComponent({ route: menu('/official_site', '官网设置', { type: 'M' }, [child]), routePath: '/official_site', popperClass: '' })
    assert.equal(component.configurationMenuGroups.value[0].items[0].label, '工具管理')
    assert.equal(component.configurationMenuGroups.value[0].items[0].route, child)
    const other = createMenuComponent({ route: menu('/custom', '自定义目录', { type: 'M' }, [child]), routePath: '/custom', popperClass: '' })
    assert.deepEqual(Array.from(other.component.configurationMenuGroups.value), [])
})

test('展示名称覆盖不修改meta；点击仍保留JSON参数、锚点及安全外链行为', () => {
    const route = menu('seo#editor', '自定义GEO', { query: '{"tab":"geo"}' })
    const props = reactive({ route, routePath: '/official_site/seo#editor', popperClass: '', displayTitle: '展示名称' })
    const { component, calls } = createMenuComponent(props)
    assert.equal(component.menuTitle.value, '展示名称')
    assert.equal(route.meta.title, '自定义GEO')
    component.handleMenuClick()
    assert.deepEqual(calls.pushed, ['/official_site/seo?tab=geo#editor'])
    props.routePath = 'https://example.com/help#topic'
    props.route = menu('https://example.com/help#topic', '外链')
    component.handleMenuClick()
    assert.deepEqual(calls.opened, [['https://example.com/help#topic', '_blank', 'noopener,noreferrer']])
})
