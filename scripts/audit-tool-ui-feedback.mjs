/**
 * @file audit-tool-ui-feedback.mjs
 * @description 审计工具页面的用户反馈方式，禁止原生 alert 阻塞页面交互
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-24
 */

import fs from 'node:fs'
import path from 'node:path'

const toolsDirectory = path.resolve(process.cwd(), 'src/components/Tools')

/**
 * 函数说明：递归收集工具目录中的前端源码文件。
 */
const collectToolSourceFiles = (directory) => {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      return collectToolSourceFiles(absolutePath)
    }
    return entry.isFile() && /\.(?:vue|[jt]sx?)$/.test(entry.name) ? [absolutePath] : []
  })
}

/**
 * 函数说明：查找原生 alert 调用，排除 ElMessageBox.alert 等对象方法。
 */
const collectNativeAlertErrors = (files) => {
  return files.flatMap((filePath) => {
    const source = fs.readFileSync(filePath, 'utf8')
    const lines = source.split(/\r?\n/)
    return lines.flatMap((line, index) => {
      if (!/(?<![.\w])alert\s*\(/.test(line)) {
        return []
      }
      return [`${path.relative(process.cwd(), filePath)}:${index + 1}`]
    })
  })
}

const errors = collectNativeAlertErrors(collectToolSourceFiles(toolsDirectory))
if (errors.length > 0) {
  console.error('工具 UI 反馈审计失败：以下工具源码仍使用原生 alert：')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log('工具 UI 反馈审计通过：工具源码未使用原生 alert。')
