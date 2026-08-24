/**
 * @file audit-tool-result-actions.mjs
 * @description 审计 AI 文本工具编辑器保存动作，禁止保留无实际交付的占位实现
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-24
 */

import fs from 'node:fs'
import path from 'node:path'

const toolsDirectory = path.resolve(process.cwd(), 'src/components/Tools')

/**
 * 函数说明：递归收集工具目录中的 Vue 页面文件。
 */
const collectVueFiles = (directory) => {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      return collectVueFiles(absolutePath)
    }
    return entry.isFile() && entry.name.endsWith('.vue') ? [absolutePath] : []
  })
}

/**
 * 函数说明：检查带编辑器保存事件的页面是否接入真实 Markdown 下载能力。
 */
const collectSaveActionErrors = (files) => {
  return files.flatMap((filePath) => {
    const source = fs.readFileSync(filePath, 'utf8')
    if (!source.includes('@save="save"')) {
      return []
    }
    const relativePath = path.relative(process.cwd(), filePath)
    const errors = []
    if (source.includes("console.log('save', text, html)")) {
      errors.push(`${relativePath}: 保存动作仍是 console.log 占位实现`)
    }
    if (!source.includes('downloadMarkdownResult(text)')) {
      errors.push(`${relativePath}: 保存动作未接入 Markdown 文件下载`)
    }
    return errors
  })
}

const files = collectVueFiles(toolsDirectory)
const editorSavePages = files.filter((filePath) => fs.readFileSync(filePath, 'utf8').includes('@save="save"'))
const errors = collectSaveActionErrors(files)

if (errors.length > 0) {
  console.error('工具结果交付动作审计失败：')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log(`工具结果交付动作审计通过：${editorSavePages.length} 个 AI 文本工具支持 Markdown 下载。`)
