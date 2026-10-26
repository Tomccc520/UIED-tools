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
    resolveAdminNavigationTarget,
    adminNavigationKey,
    adminNavigationTitle,
    getAdminQuickNavigation,
    findActiveAdminNavigation
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

test('日常任务直接平铺，其他授权叶子归入低频组；未知和外链不丢失', () => {
    const nodes = [
        { ...menu('/permission', '权限', 'M'), children: [menu('admin', '管理员')] },
        { ...menu('/official_site', '官网设置', 'M'), children: [menu('seo', 'SEO设置'), menu('tools_catalog', '工具主数据'), menu('custom', '站点扩展')] },
        { ...menu('/operation', '运营管理', 'M'), children: [menu('advertising', '广告管理'), menu('custom', '运营扩展')] },
        menu('/material/index', '素材中心'), menu('/workbench', '工作台'), menu('/custom', '自定义'),
        menu('/consumer/order', '订单管理'), menu('/ai_model_manage/ai_provider', 'Provider'),
        menu('https://example.com/help#topic', '帮助')
    ]
    const original = JSON.stringify(nodes)
    const groups = groupAdminNavigation(nodes)
    assert.deepEqual(groups.map(group => group.title), ['日常运营', '网站设置', '用户与订单', 'AI服务', '系统与渠道', '其他功能'])
    assert.deepEqual(groups[0].items.map(item => item.path), ['/workbench', '/official_site/tools_catalog', '/operation/advertising', '/material/index'])
    assert.deepEqual(groups.find(group => group.key === 'website').items.map(item => item.path), ['/official_site/seo', '/official_site/custom'])
    const all = groups.flatMap(group => group.items)
    assert.deepEqual(new Set(all.map(item => item.path)), new Set(flattenAdminNavigation(nodes).map(item => item.path)))
    assert.equal(all.length, 12)
    assert.equal(JSON.stringify(nodes), original, '分组不能修改原菜单结构或元数据')
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

test('隐藏父级、按钮和未授权任务不会进入任何任务组或快捷入口', () => {
    const nodes = [{ ...menu('/official_site', '隐藏配置', 'M', { hidden: true }), children: [menu('tools_catalog', '工具')] }, menu('/save', '保存', 'A'), menu('/consumer/order', '订单')]
    const groups = groupAdminNavigation(nodes)
    assert.deepEqual(groups.map(group => group.title), ['用户与订单'])
    assert.deepEqual(groups.flatMap(group => group.items).map(item => item.path), ['/consumer/order'])
    assert.deepEqual(getAdminQuickNavigation(flattenAdminNavigation(nodes)), [])
})

test('侧栏完整目标可精确区分同路由参数和锚点，不会误选另一个专用入口', () => {
    const items = flattenAdminNavigation([menu('/tools', '基础工具'), menu('/tools?scope=images&mode=edit#panel', '图片专用'), menu('/tools?scope=video#panel', '视频专用')])
    assert.equal(findActiveAdminNavigation(items, '/tools?mode=edit&scope=images#panel'), items[1])
    assert.equal(findActiveAdminNavigation(items, '/tools?scope=video#panel'), items[2])
    assert.equal(findActiveAdminNavigation(items, '/tools?scope=unknown'), items[0])
    assert.equal(findActiveAdminNavigation(items.slice(1), '/tools?scope=unknown'), undefined)
    assert.equal(findActiveAdminNavigation(items, '/tools/detail/123', '/tools'), items[0])
    assert.notEqual(adminNavigationKey(items[1].path), adminNavigationKey(items[2].path))
    assert.equal(adminNavigationKey('/tools/?mode=edit&scope=images#panel'), adminNavigationKey(items[1].path))
})

test('规范名称与历史别名共存，参数专用标题、锚点和外链保持管理员配置', () => {
    const items = flattenAdminNavigation([menu('/official_site/frontend_layout', '前端布局'), menu('/official_site/frontend_layout?tab=updates#editor', '版本专用')])
    assert.equal(adminNavigationTitle(items[0].path, items[0].title), '学习与更新')
    assert.equal(adminNavigationTitle(items[1].path, items[1].title), '版本专用')
    assert.equal(adminNavigationTitle('https://example.com/official_site/frontend_layout', '外部文档'), '外部文档')
    assert.equal(searchAdminNavigation(items, '首页内容')[0], items[0])
    assert.equal(searchAdminNavigation(items, '学习与更新')[0], items[0])
    assert.equal(searchAdminNavigation(items, '版本专用')[0], items[1])
    assert.equal(items[0].title, '前端布局')
})

test('搜索和工作台快捷入口复用日常任务顺序，优先基础入口但保留仅授权的参数入口', () => {
    const items = flattenAdminNavigation([menu('/official_site/tools_catalog?scope=images#panel', '图片专用'), menu('/official_site/tools_catalog', '工具目录'), menu('/material/index', '附件'), menu('/workbench', '后台首页'), menu('/official_site/frontend_layout?tab=updates', '版本专用'), menu('/permission/admin', '管理员')])
    const quick = getAdminQuickNavigation(items)
    assert.deepEqual(quick.map(item => item.path), ['/workbench', '/official_site/tools_catalog', '/official_site/frontend_layout?tab=updates', '/material/index'])
    assert.equal(quick[2].title, '版本专用')
    assert.equal(getAdminQuickNavigation(items, 2).length, 2)
    assert.deepEqual(getAdminQuickNavigation([], 6), [])
})

test('系统分组中的公众号菜单与权限菜单具有明确归属，参数专用名称仍保持原值', () => {
    assert.equal(adminNavigationTitle('/channel/wx_oa/menu', '菜单管理'), '公众号菜单')
    assert.equal(adminNavigationTitle('/permission/menu', '菜单管理'), '权限菜单')
    assert.equal(adminNavigationTitle('/permission/menu?mode=custom', '自定义菜单入口'), '自定义菜单入口')
})
