/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/utils/site-configuration.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext }
}).outputText
const navigationSource = fs.readFileSync(new URL('../src/utils/admin-navigation.ts', import.meta.url), 'utf8')
const navigationCode = ts.transpileModule(navigationSource, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext } }).outputText
const navigationUrl = `data:text/javascript;base64,${Buffer.from(navigationCode).toString('base64')}`
const withDependencies = compiled.replace(/from ['"]\.\/admin-navigation['"]/g, `from '${navigationUrl}'`)
const { buildConfigurationGroups, configurationPath, findConfigurationEntry, configurationTitle } = await import(`data:text/javascript;base64,${Buffer.from(withDependencies).toString('base64')}`)

/** 创建已授权的导航条目，用于验证任务分组不增加权限入口。 */
const entry = (path, title = path, external = false) => ({ path, title, external, keywords: title })

test('空权限集合和外部入口不生成配置任务', () => {
    assert.deepEqual(buildConfigurationGroups([]), [])
    assert.deepEqual(buildConfigurationGroups([entry('https://example.com/official_site/seo', '外链', true)]), [])
})

test('只展示已授权项目并正确区分前台内容、前台品牌与后台品牌', () => {
    const groups = buildConfigurationGroups([
        entry('/official_site/sidebar'),
        entry('/official_site/tools_catalog'),
        entry('/official_site/information')
    ])
    assert.deepEqual(groups.map(group => group.title), ['内容与工具', '导航与外观', '站点与收录'])
    assert.deepEqual(groups.flatMap(group => group.items.map(item => item.label)), ['工具管理', '前台菜单', '后台品牌'])
    assert.equal(groups.flatMap(group => group.items).some(item => item.path === '/official_site/seo'), false)
})

test('匹配时移除参数但实际跳转地址保留查询和锚点', () => {
    const path = '/official_site/seo/?tab=geo#detail'
    assert.equal(configurationPath(path), '/official_site/seo')
    assert.equal(buildConfigurationGroups([entry(path)])[0].items[0].path, path)
})

test('去重相同入口但保留不同参数及未知扩展配置，不混入系统权限页', () => {
    const groups = buildConfigurationGroups([
        entry('/official_site/tools_catalog'),
        entry('/official_site/tools_catalog'),
        entry('/official_site/tools_catalog?scope=images'),
        entry('/official_site/custom', '自定义设置'),
        entry('/permission/admin', '账号管理')
    ])
    assert.equal(groups[0].items.length, 2)
    assert.equal(groups[1].key, 'other')
    assert.equal(groups[1].items[0].label, '自定义设置')
    assert.equal(groups.flatMap(group => group.items).length, 3)
})

test('相同路径的参数入口只选择一个当前项，参数顺序变化仍能精确匹配', () => {
    const groups = buildConfigurationGroups([
        entry('/official_site/tools_catalog'),
        entry('/official_site/tools_catalog?scope=images&mode=edit#panel')
    ])
    assert.equal(findConfigurationEntry(groups, '/official_site/tools_catalog?mode=edit&scope=images#panel'), groups[0].items[1])
    assert.equal(findConfigurationEntry(groups, '/official_site/tools_catalog?unknown=value'), groups[0].items[0])
    assert.equal(findConfigurationEntry(groups, '/official_site/no-access'), undefined)
})

test('侧栏、面包屑、页签和搜索共享任务名称，不改变带参数和扩展入口', () => {
    assert.equal(configurationTitle('/official_site', '官网设置', true), '网站管理')
    assert.equal(configurationTitle('/official_site/frontend_layout', '前端布局'), '学习与更新')
    assert.equal(configurationTitle('/official_site/tools_catalog/', '工具主数据'), '工具管理')
    assert.equal(configurationTitle('/official_site/information', '网站信息'), '后台品牌')
    assert.equal(configurationTitle('/official_site/frontend_layout?scope=extra', '自定义首页'), '自定义首页')
    assert.equal(configurationTitle('/official_site/seo#geo', 'GEO规则'), 'GEO规则')
    assert.equal(configurationTitle('/official_site/tools_catalog', '工具自定义目录', true), '工具自定义目录')
    assert.equal(configurationTitle('/official_site/custom', '自定义名称'), '自定义名称')
    assert.equal(configurationTitle('https://example.com/official_site/seo', '帮助文档'), '帮助文档')
    assert.equal(configurationTitle('//example.com/official_site/seo', '帮助文档'), '帮助文档')
    assert.equal(configurationTitle('/permission/role', '角色权限'), '角色权限')
})
