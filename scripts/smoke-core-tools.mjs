/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT_DIR = process.cwd()
const ROUTER_FILE = path.join(ROOT_DIR, 'src/router/router.ts')
const TOOLS_FILE = path.join(ROOT_DIR, 'src/components/Tools/tools.ts')

const CORE_TOOL_SPECS = [
  {
    route: '/tools/qrcode',
    checks: [/data-smoke="qrcode-generate"/, /data-smoke="qrcode-download"/, /@click="gen"/, /@click="downloadQRCode"/]
  },
  {
    route: '/tools/image-compress',
    checks: [/data-smoke="image-compress-start"/, /data-smoke="image-compress-download"/, /@click="compressAll"/, /@click="downloadAll"/]
  },
  {
    route: '/tools/pdf-merge',
    checks: [/data-smoke="pdf-merge-start"/, /@click="mergePDFs"/, /@click="clearFiles"/]
  },
  {
    route: '/tools/markdown',
    checks: [/<v-md-editor/, /data-smoke="markdown-editor"/, /编辑器/]
  },
  {
    route: '/tools/mobile-ui-spec',
    checks: [/DeviceSelectorPanel/, /SpecsTable/, /PlatformComparisonSection/]
  }
]

/**
 * 读取文本文件
 * 统一 UTF-8 编码读取，便于后续做正则匹配
 */
function readFileText(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

/**
 * 解析路由和组件映射
 * 从 router.ts 中提取 path 与对应的异步组件 import 路径
 */
function parseRouteComponentMap(routerContent) {
  const routeMap = new Map()
  const lines = routerContent.split('\n')
  let currentPath = ''
  let inBlockComment = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('/*')) {
      inBlockComment = true
    }
    if (inBlockComment) {
      if (trimmed.endsWith('*/') || trimmed.includes('*/')) {
        inBlockComment = false
      }
      continue
    }
    if (trimmed.startsWith('//')) {
      continue
    }

    const pathMatch = trimmed.match(/^path:\s*'([^']+)'/)
    if (pathMatch) {
      currentPath = pathMatch[1]
      continue
    }

    const componentMatch = trimmed.match(/^component:\s*\(\)\s*=>\s*import\('([^']+)'\)/)
    if (currentPath && componentMatch) {
      routeMap.set(currentPath, componentMatch[1])
      continue
    }

    if (trimmed.startsWith('},') || trimmed === '}') {
      currentPath = ''
    }
  }

  return routeMap
}

/**
 * 解析 tools 配置中的 URL
 * 用于检查核心工具是否在导航配置里可达
 */
function parseToolUrls(toolsContent) {
  return new Set([...toolsContent.matchAll(/url:\s*'([^']+)'/g)].map(match => match[1]))
}

/**
 * 解析 import 路径为绝对路径
 * 兼容 @ 别名和相对路径，统一映射到本地文件系统
 */
function resolveComponentPath(importPath) {
  if (importPath.startsWith('@/')) {
    return path.join(ROOT_DIR, 'src', importPath.slice(2))
  }
  return path.resolve(path.dirname(ROUTER_FILE), importPath)
}

/**
 * 执行单个工具页冒烟检查
 * 检查路由、导航配置、组件文件和关键交互标记
 */
function runToolSmokeCheck(routeMap, toolUrlSet, toolSpec) {
  const errors = []
  const importPath = routeMap.get(toolSpec.route)

  if (!importPath) {
    errors.push(`缺少路由定义: ${toolSpec.route}`)
    return errors
  }

  if (!toolUrlSet.has(toolSpec.route)) {
    errors.push(`tools 配置缺少入口: ${toolSpec.route}`)
  }

  const componentFile = resolveComponentPath(importPath)
  if (!fs.existsSync(componentFile)) {
    errors.push(`路由组件文件不存在: ${componentFile}`)
    return errors
  }

  const componentContent = readFileText(componentFile)
  for (const checkRule of toolSpec.checks) {
    if (!checkRule.test(componentContent)) {
      errors.push(`关键能力缺失: ${toolSpec.route} 未匹配 ${checkRule}`)
    }
  }

  return errors
}

/**
 * 输出检查结果
 * 将错误列表按条目打印，便于终端快速定位问题
 */
function printResult(errors) {
  if (!errors.length) {
    console.log('✅ 核心工具冒烟检查通过（路由可达 + 关键按钮可用）')
    return
  }

  console.error('❌ 核心工具冒烟检查失败：')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
}

/**
 * 主入口
 * 聚合路由、工具配置和核心工具页检查并返回退出码
 */
function main() {
  const routerContent = readFileText(ROUTER_FILE)
  const toolsContent = readFileText(TOOLS_FILE)
  const routeMap = parseRouteComponentMap(routerContent)
  const toolUrlSet = parseToolUrls(toolsContent)

  const allErrors = CORE_TOOL_SPECS.flatMap(spec => runToolSmokeCheck(routeMap, toolUrlSet, spec))
  printResult(allErrors)

  if (allErrors.length > 0) {
    process.exit(1)
  }
}

main()
