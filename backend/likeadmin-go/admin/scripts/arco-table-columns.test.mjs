/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-20
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { parse } from 'vue/compiler-sfc'

/** 枚举后台页面和组件，跳过无列声明的模板。 */
function* columnTemplates(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name)
        if (entry.isDirectory()) yield* columnTemplates(file)
        else if (entry.name.endsWith('.vue')) {
            const source = fs.readFileSync(file, 'utf8')
            if (source.includes('<a-table-column')) yield [file, parse(source).descriptor.template.ast]
        }
    }
}

/** 查找写在默认插槽中的列；Arco 会将默认插槽当成自定义表体，导致整张表空白。 */
function checkTable(node, file) {
    if (node.tag === 'a-table' && node.children.some(child => child.tag === 'a-table-column')) {
        assert.ok(node.props.some(prop => prop.name === 'slot' && prop.arg?.content === 'columns'),
            file + ':' + node.loc.start.line + ' 的列必须放入 columns 插槽')
    }
    if (Array.isArray(node.children)) {
        for (const child of node.children) checkTable(child, file)
    }
}

test('Arco 表格声明的列不会误入自定义表体插槽', () => {
    const root = fileURLToPath(new URL('../src/', import.meta.url))
    for (const [file, template] of columnTemplates(root)) checkTable(template, file)
})
