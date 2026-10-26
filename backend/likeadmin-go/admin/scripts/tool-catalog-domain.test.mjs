/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import assert from 'node:assert/strict'
import test from 'node:test'
import { buildAppendToolPolicyRules, buildOverwriteToolPolicyRules, collectToolKeyConflicts, deriveToolKeyByUrl, flattenCatalogTools, normalizeToolRouteMatchKey, parseToolConsumeRulesConfig, parseToolsCategoryTree } from '../src/views/setting/website/composables/tool-catalog-domain.ts'

/** 构造包含免费、停用和查询参数工具的真实目录输入，检查拆分后的业务边界。 */
const catalog = () => [{ title: 'AI', list: [{ title: '办公', list: [
    { title: '年度总结', url: '/tools/ai/work-summary?type=annual', consumePoints: 0, memberFree: false, status: 0 },
    { title: '工作总结', url: '/tools/ai/work-summary', toolKey: 'custom-summary' }
] }] }]

test('目录解析保留零积分、会员不免扣和停用语义，不改原始 JSON', () => {
    const source = JSON.stringify(catalog())
    const result = parseToolsCategoryTree(source)
    assert.equal(result.error, '')
    assert.deepEqual(result.items[0].list[0].list[0], catalog()[0].list[0].list[0])
    assert.equal(source, JSON.stringify(catalog()))
})

test('非法 JSON 和非数组输入给出可读错误，不能当作有效空目录', () => {
    for (const source of ['{', '{}', 'null']) {
        const result = parseToolsCategoryTree(source)
        assert.ok(result.error)
        assert.deepEqual(result.items, [])
    }
    assert.deepEqual(parseToolsCategoryTree('[]'), { items: [], error: '' })
})

test('路由身份保留查询参数，兼容年度总结和视频转换历史工具标识', () => {
    assert.equal(normalizeToolRouteMatchKey('/tools/ai/work-summary/?type=annual#result'), '/tools/ai/work-summary?type=annual')
    assert.equal(deriveToolKeyByUrl('/tools/ai/work-summary?type=annual'), 'ai-work-summary-annual')
    assert.equal(deriveToolKeyByUrl('/tools/video/convert'), 'video-format-convert')
    assert.notEqual(deriveToolKeyByUrl('/tools/ai/work-summary'), deriveToolKeyByUrl('/tools/ai/work-summary?type=annual'))
})

test('目录扁平化和冲突报告使用同一身份规则，定位到真实分类和工具', () => {
    const tree = catalog()
    tree[0].list[0].list.push({ title: '重复年度总结', url: '/tools/other', toolKey: 'ai-work-summary-type-annual' })
    const original = JSON.stringify(tree)
    const rows = flattenCatalogTools(tree)
    const conflicts = collectToolKeyConflicts(tree)
    assert.equal(rows[0].toolKey, 'ai-work-summary-annual')
    assert.equal(conflicts.length, 1)
    assert.equal(conflicts[0].count, 2)
    assert.match(conflicts[0].positions[0], /AI.*办公.*年度总结/)
    assert.match(conflicts[0].positions[1], /重复年度总结/)
    assert.equal(JSON.stringify(tree), original)
})

test('旧规则字符串和数组读取结果一致，零值与自定义顺序不丢失', () => {
    const source = [{ toolKey: 'video-convert', name: '视频格式', consumePoints: 0, memberFree: 0, status: 0, sort: 0, remark: '旧规则' }]
    const rows = parseToolConsumeRulesConfig(JSON.stringify(source))
    assert.deepEqual(rows, parseToolConsumeRulesConfig(source))
    assert.equal(rows[0].toolKey, 'video-format-convert')
    assert.deepEqual([rows[0].consumePoints, rows[0].memberFree, rows[0].status, rows[0].sort], [0, 0, 0, 0])
})

test('追加同步保留旧规则，覆盖模式只按目录生成规则，均不修改输入对象', () => {
    const existing = [{ toolKey: 'old', name: '旧工具', consumePoints: 7, memberFree: 0, status: 0, sort: 0, remark: '' }]
    const seeds = [{ toolKey: 'free', name: '免费工具', consumePoints: 0, memberFree: 0, status: 0, sort: 0, remark: '', path: '/tools/free' }]
    const before = JSON.stringify({ existing, seeds })
    const append = buildAppendToolPolicyRules(seeds, existing)
    const overwrite = buildOverwriteToolPolicyRules(seeds, existing)
    assert.deepEqual(append.map(item => item.toolKey), ['old', 'free'])
    assert.deepEqual(append[0], existing[0])
    assert.deepEqual(overwrite.map(item => item.toolKey), ['free'])
    assert.deepEqual([overwrite[0].consumePoints, overwrite[0].memberFree, overwrite[0].status, overwrite[0].sort], [0, 0, 0, 0])
    assert.equal(JSON.stringify({ existing, seeds }), before)
})
