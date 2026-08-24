/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
 */

import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const ROOT_DIR = process.cwd()
const ROUTER_FILE = path.join(ROOT_DIR, 'src/router/router.ts')
const TOOLS_FILE = path.join(ROOT_DIR, 'src/components/Tools/tools.ts')
const STANDALONE_TOOLS_FILE = path.join(ROOT_DIR, 'src/config/standalone-tools.json')

/**
 * 读取文本文件内容
 * 统一做 UTF-8 读取，避免后续正则处理出现编码差异
 */
function readTextFile(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

/**
 * 提取字符串属性
 * 通过 TypeScript 语法树收集目标字段，避免把注释块中的历史配置计入结果
 */
function extractStringPropertyValues(content, fileName, propertyName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  const values = []

  /**
   * 函数说明：遍历 TypeScript 语法树并收集指定字符串属性，自动忽略注释块中的历史配置。
   */
  const visit = (node) => {
    if (ts.isPropertyAssignment(node)) {
      const name = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)
        ? node.name.text
        : ''
      if (name === propertyName && ts.isStringLiteralLike(node.initializer)) {
        values.push(node.initializer.text)
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return values
}

/**
 * 统计重复项
 * 返回重复值和出现次数，便于输出可读的检查结果
 */
function collectDuplicates(values) {
  const counter = new Map()
  for (const value of values) {
    counter.set(value, (counter.get(value) || 0) + 1)
  }
  return [...counter.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
}

/**
 * 规范化工具 URL
 * 去除 query/hash，仅保留路由 path 用于和 router.ts 对齐
 */
function normalizeToolPath(url) {
  return url.split('?')[0].split('#')[0]
}

/**
 * 打印列表信息
 * 统一输出格式，保证命令行可快速扫描问题项
 */
function printSection(title, items) {
  if (!items.length) {
    console.log(`- ${title}: 0`)
    return
  }

  console.log(`- ${title}: ${items.length}`)
  for (const item of items) {
    console.log(`  - ${item}`)
  }
}

/**
 * 主检查入口
 * 汇总路由与工具配置的重复项、缺失项并给出退出码
 */
function main() {
  const routerContent = readTextFile(ROUTER_FILE)
  const toolsContent = readTextFile(TOOLS_FILE)
  const standaloneToolPaths = new Set(
    JSON.parse(readTextFile(STANDALONE_TOOLS_FILE)).tools.map((tool) => tool.basePath)
  )

  const routePaths = extractStringPropertyValues(routerContent, ROUTER_FILE, 'path')
  const routeNames = extractStringPropertyValues(routerContent, ROUTER_FILE, 'name')
  const toolUrls = extractStringPropertyValues(toolsContent, TOOLS_FILE, 'url')
    .filter(url => url.startsWith('/'))
  const normalizedToolPaths = [
    ...new Set([...toolUrls.map(normalizeToolPath), ...standaloneToolPaths])
  ]

  const routePathDuplicates = collectDuplicates(routePaths).map(([value, count]) => `${count}x ${value}`)
  const routeNameDuplicates = collectDuplicates(routeNames).map(([value, count]) => `${count}x ${value}`)
  const toolUrlDuplicates = collectDuplicates(toolUrls).map(([value, count]) => `${count}x ${value}`)

  const routePathSet = new Set(routePaths)
  const missingRouteTools = normalizedToolPaths.filter(
    toolPath => !routePathSet.has(toolPath) && !standaloneToolPaths.has(toolPath)
  )

  console.log('=== 工具与路由一致性检查 ===')
  printSection('重复路由 path', routePathDuplicates)
  printSection('重复路由 name', routeNameDuplicates)
  printSection('重复工具 url', toolUrlDuplicates)
  printSection('工具存在但无路由', missingRouteTools)

  const hasErrors = routePathDuplicates.length > 0
    || routeNameDuplicates.length > 0
    || toolUrlDuplicates.length > 0
    || missingRouteTools.length > 0

  if (hasErrors) {
    console.error('\n检查未通过：请修复以上问题后再提交。')
    process.exit(1)
  }

  console.log('\n检查通过：路由与工具配置一致。')
}

main()
