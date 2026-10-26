/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

/** 从页面实际导入递归读取 Vue 子组件；限定项目 src，跳过类型导入并处理循环引用。 */
export const collectVueSourceGraph = (root, entries) => {
    const sourceRoot = path.resolve(root, 'src')
    const visited = new Set()
    const result = []
    /** 校验解析路径始终位于当前项目源码内，避免读取外部路径或依赖目录。 */
    const withinSource = file => {
        const relative = path.relative(sourceRoot, file)
        return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative)
    }
    /** 读取组件脚本中的静态与异步 Vue 导入，不把注释或普通字符串当依赖。 */
    const visit = file => {
        if (!withinSource(file) || visited.has(file)) return
        visited.add(file)
        let text = ''
        try { text = fs.readFileSync(file, 'utf8') } catch { /* 保留缺失文件，由冒烟给出具体错误。 */ }
        result.push({ file: path.relative(root, file).split(path.sep).join('/'), text })
        for (const match of text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
            const ast = ts.createSourceFile(file + '.ts', match[1], ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
            /** 仅解析受支持的站内别名和相对组件地址，保持检查与真实组件边界一致。 */
            const visitImport = value => {
                if (!value.endsWith('.vue')) return
                const next = value.startsWith('@/') ? path.resolve(sourceRoot, value.slice(2)) : value.startsWith('.') ? path.resolve(path.dirname(file), value) : null
                if (next) visit(next)
            }
            /** 递归检查语法节点，支持 defineAsyncComponent 中的字面量 import。 */
            const walk = node => {
                if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly && ts.isStringLiteral(node.moduleSpecifier)) visitImport(node.moduleSpecifier.text)
                if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) visitImport(node.arguments[0].text)
                ts.forEachChild(node, walk)
            }
            walk(ast)
        }
    }
    for (const entry of entries.filter(Boolean)) visit(path.resolve(root, entry))
    return result
}
