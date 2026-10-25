/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'

/** 编译真实主题工具并挂载最小 DOM，验证生成的是 Arco 实际消费的 RGB 通道变量。 */
const createTheme = () => {
    const styles = []
    const document = {
        documentElement: { style: { setProperty() {} } },
        head: { append: style => styles.push(style) },
        getElementById: id => styles.find(style => style.id === id),
        createElement: () => ({ innerHTML: '', setAttribute(key, value) { this[key] = value } })
    }
    const source = fs.readFileSync(new URL('../src/utils/theme.ts', import.meta.url), 'utf8')
    const compiled = ts.transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true }
    }).outputText
    const context = vm.createContext({ exports: {}, require: createRequire(import.meta.url), document })
    vm.runInContext(compiled, context)
    return { ...context.exports, styles }
}

test('品牌紫同时桥接自定义变量和 Arco 主色通道，覆盖 body 上的默认蓝', () => {
    const subject = createTheme()
    subject.setTheme({ primary: '#6C54FF', success: '#67c23a', danger: '#f56c6c' })
    const css = subject.styles[0].innerHTML
    assert.match(css, /--ui-color-primary:/)
    assert.match(css, /--primary-6:108,\s*84,\s*255;/)
    assert.match(css, /--link-6:108,\s*84,\s*255;/)
    assert.match(css, /body/)
    assert.match(css, /--success-6:103,\s*194,\s*58;/)
    assert.match(css, /--danger-6:245,\s*108,\s*108;/)
})

test('再次切换主题更新同一个样式节点，深色模式仍输出完整色阶', () => {
    const subject = createTheme()
    subject.setTheme({ primary: '#6C54FF' })
    subject.setTheme({ primary: '#123456' }, true)
    assert.equal(subject.styles.length, 1)
    const css = subject.styles[0].innerHTML
    assert.match(css, /--primary-6:18,\s*52,\s*86;/)
    for (let level = 1; level <= 10; level++) assert.match(css, new RegExp(`--primary-${level}:`))
    assert.match(css, /body\[arco-theme=['"]dark['"]\]/)
})
