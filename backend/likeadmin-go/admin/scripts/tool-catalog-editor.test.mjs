/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { flattenCatalogEditorTree, readCatalogEditorTree, updateCatalogEditorTool } from '../src/views/setting/website/composables/tool-catalog-editor.ts'

/** 创建含扩展字段与重复工具名称的目录，验证位置编辑不会误改其它工具。 */
const fixture = () => JSON.stringify([{ title: '图片', customCategory: 1, list: [{ title: '处理', list: [{ title: '压缩', url: '/tools/a', extra: { keep: '原文' }, seoTitle: '旧标题' }, { title: '压缩', url: '/tools/b', desc: '不应改动' }] }] }])
test('展开保留分类、分组和各自位置，不依赖名称唯一', () => {
    const rows = flattenCatalogEditorTree(fixture())
    assert.deepEqual(rows.map(row => [row.key, row.tool.url, row.category, row.group]), [['0:0:0', '/tools/a', '图片', '处理'], ['0:0:1', '/tools/b', '图片', '处理']])
})
test('编辑单工具保留未知字段、分类属性和其它工具', () => {
    const before = readCatalogEditorTree(fixture())
    const next = readCatalogEditorTree(updateCatalogEditorTool(fixture(), '0:0:0', JSON.stringify(before[0].list[0].list[0]), { title: '图片压缩', seoTitle: '新标题' }))
    assert.equal(next[0].list[0].list[0].seoTitle, '新标题')
    assert.deepEqual(next[0].list[0].list[0].extra, { keep: '原文' })
    assert.deepEqual(next[0].list[0].list[1], before[0].list[0].list[1])
    assert.equal(next[0].customCategory, 1)
})
test('目录在抽屉打开后发生变化时拒绝覆盖', () => {
    const baseline = JSON.stringify(readCatalogEditorTree(fixture())[0].list[0].list[0])
    const changed = fixture().replace('旧标题', '其他人修改')
    assert.throws(() => updateCatalogEditorTool(changed, '0:0:0', baseline, { title: '覆盖' }), /已发生变化/)
})
test('清除显式计费值可恢复继承，不写字符串或默认零', () => {
    const rows = readCatalogEditorTree(fixture())
    Object.assign(rows[0].list[0].list[0], { consumePoints: 2, memberFree: false })
    const original = JSON.stringify(rows)
    const next = readCatalogEditorTree(updateCatalogEditorTool(original, '0:0:0', JSON.stringify(rows[0].list[0].list[0]), { consumePoints: undefined, memberFree: undefined }))
    assert.equal(Object.hasOwn(next[0].list[0].list[0], 'consumePoints'), false)
    assert.equal(Object.hasOwn(next[0].list[0].list[0], 'memberFree'), false)
})
test('非法层级、位置和不支持字段明确失败，不静默丢数据', () => {
    for (const source of ['{}', '[{}]', '[{"list":[{"list":[null]}]}]', '[']) assert.throws(() => readCatalogEditorTree(source))
    const baseline = JSON.stringify(readCatalogEditorTree(fixture())[0].list[0].list[0])
    assert.throws(() => updateCatalogEditorTool(fixture(), '0:0:0', baseline, { url: '/other' }), /不支持/)
    assert.throws(() => updateCatalogEditorTool(fixture(), '0:0:0', baseline, { title: '' }), /名称/)
    assert.throws(() => updateCatalogEditorTool(fixture(), '0:0:1:0', baseline, {}), /位置/)
})
