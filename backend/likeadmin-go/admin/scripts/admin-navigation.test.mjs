/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/utils/admin-navigation.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext }
}).outputText
const {
    flattenAdminNavigation,
    groupAdminNavigation,
    searchAdminNavigation,
    resolveAdminNavigationPath,
    resolveAdminNavigationTarget
} = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

/** 创建最小权限菜单样本，测试只关心服务端已下发的入口。 */
const menu = (path, title, type = 'C', extra = {}) => ({ path, meta: { title, type, ...extra } })

test('隐藏父目录的可见子菜单和按钮权限不会泄漏到搜索结果', () => {
    const nodes = [
        {
            ...menu('/hidden', '隐藏目录', 'M', { hidden: true }),
            children: [menu('child', '不可访问')]
        },
        menu('/button', '删除权限', 'A'),
        {
            ...menu('/official_site', '官网设置', 'M'),
            children: [
                menu('seo', 'SEO / GEO设置'),
                menu('secret', '隐藏菜单', 'C', { hidden: true })
            ]
        }
    ]
    assert.deepEqual(
        flattenAdminNavigation(nodes).map((item) => item.path),
        ['/official_site/seo']
    )
})

test('相对路径、绝对路径和外链解析与菜单跳转一致', () => {
    assert.equal(resolveAdminNavigationPath('/official_site', 'seo'), '/official_site/seo')
    assert.equal(resolveAdminNavigationPath('/official_site', '/material/index'), '/material/index')
    assert.equal(
        resolveAdminNavigationPath('/official_site', 'https://example.com/path'),
        'https://example.com/path'
    )
    assert.equal(
        resolveAdminNavigationPath('/official_site', '//example.com/path'),
        '//example.com/path'
    )
})

test('搜索保留 JSON 菜单参数和已有查询串、锚点', () => {
    const [item] = flattenAdminNavigation([
        menu('/tools?view=all#list', '工具', 'C', { query: '{"category":"图片","page":2}' })
    ])
    assert.equal(item.path, '/tools?view=all&category=%E5%9B%BE%E7%89%87&page=2#list')
    assert.equal(resolveAdminNavigationTarget('/tools', '?mode=edit'), '/tools?mode=edit')
    assert.equal(resolveAdminNavigationTarget('/tools', ''), '/tools')
})

test('只为已授权菜单增加用途别名，不凭关键词补造入口', () => {
    const items = flattenAdminNavigation([
        {
            ...menu('/official_site', '官网设置', 'M'),
            children: [menu('frontend_layout', '首页布局配置'), menu('filing', '网站备案')]
        },
        { ...menu('/operation', '运营管理', 'M'), children: [menu('advertising', '广告管理')] }
    ])
    assert.equal(searchAdminNavigation(items, '广告')[0].path, '/operation/advertising')
    assert.equal(searchAdminNavigation(items, '广告').length, 1)
    assert.equal(searchAdminNavigation(items, '官网 备案')[0].path, '/official_site/filing')
    assert.deepEqual(searchAdminNavigation(items, '模型'), [])
})

test('业务与系统分组不丢菜单，同组保留原对象和后端顺序', () => {
    const nodes = [
        menu('/permission', '权限', 'M'),
        menu('/material', '素材', 'M'),
        menu('/workbench', '工作台'),
        menu('/custom', '自定义'),
        menu('/official_site', '官网设置', 'M'),
        menu('/setting', '设置', 'M')
    ]
    const groups = groupAdminNavigation(nodes)
    assert.deepEqual(
        groups.map((item) => item.title),
        ['总览', '业务运营', '系统管理', '其他功能']
    )
    assert.deepEqual(groups[1].routes, [nodes[1], nodes[4]])
    assert.equal(groups[1].routes[0], nodes[1])
    assert.equal(groups.flatMap((item) => item.routes).length, nodes.length)
})

test('重复入口去重但不同菜单参数仍保留', () => {
    const items = flattenAdminNavigation([
        menu('/tools', '工具'),
        menu('/tools', '工具副本'),
        menu('/tools', '工具编辑', 'C', { query: 'mode=edit' })
    ])
    assert.deepEqual(
        items.map((item) => item.path),
        ['/tools', '/tools?mode=edit']
    )
})

test('空权限集合不生成菜单、快捷入口和分组', () => {
    assert.deepEqual(flattenAdminNavigation([]), [])
    assert.deepEqual(groupAdminNavigation([]), [])
    assert.deepEqual(searchAdminNavigation([], '广告'), [])
})

test('新版简短名称和历史用途都能查到原已授权入口，不生成额外权限', () => {
    const records = [
        ['tools_catalog', '工具主数据', ['工具管理', '工具上架']],
        ['frontend_layout', '前端布局', ['首页内容', '每日学习']],
        ['sidebar', '侧栏配置', ['前台菜单', '前台品牌', '侧边栏']],
        ['header', '顶部配置', ['顶部与搜索', '一言']],
        ['footer', '底部配置', ['页脚链接', '友情链接']],
        ['tool_ranking_config', '排行展示配置', ['榜单展示', '周榜']],
        ['tool_ranking_manage', '排行管理', ['榜单数据', '统计']],
        ['seo', 'SEO/GEO设置', ['全站SEO', '收录']],
        ['information', '网站信息', ['后台品牌', '基础资料', 'logo']],
        ['filing', '网站备案', ['备案版权', 'icp']]
    ]
    const items = flattenAdminNavigation([{ ...menu('/official_site', '官网设置', 'M'), children: records.map(([path, title]) => menu(path, title)) }])
    for (const [path, title, keywords] of records) {
        for (const keyword of keywords) {
            const result = searchAdminNavigation(items, keyword)
            assert.ok(result.some(item => item.path === `/official_site/${path}`), `${keyword} 应找到原入口`)
        }
        assert.equal(items.find(item => item.path === `/official_site/${path}`).title, title, '检索别名不能写回服务端菜单标题')
    }
    assert.equal(items.length, records.length)
    assert.deepEqual(searchAdminNavigation(items, 'AI模型'), [])
})
