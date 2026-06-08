/**
 * @file audit-tool-consume-coverage.mjs
 * @description 审计工具积分拦截覆盖率：统计路由、手动接入、白名单清单与待补项
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-31
 */

import fs from 'node:fs'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()
const ROUTER_FILE = path.resolve(PROJECT_ROOT, 'src/router/router.ts')
const TOOLS_DIR = path.resolve(PROJECT_ROOT, 'src/components/Tools')
const MANUAL_CONFIG_FILE = path.resolve(PROJECT_ROOT, 'src/config/toolConsumeGuard.ts')

/**
 * 函数说明：读取 UTF-8 文本文件，若文件不存在则返回空字符串并打印提示。
 */
const readTextFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (error) {
    console.error(`[error] 读取文件失败: ${filePath}`)
    console.error(error instanceof Error ? error.message : String(error))
    return ''
  }
}

/**
 * 函数说明：规范化路由路径（剔除 query/hash 与末尾斜杠），用于集合比较。
 */
const normalizeRoutePath = (rawPath) => {
  const value = String(rawPath || '').trim()
  if (!value) {
    return ''
  }
  const stripped = value.split('?')[0].split('#')[0].trim()
  if (!stripped || stripped === '/') {
    return stripped || '/'
  }
  return stripped.replace(/\/+$/g, '')
}

/**
 * 函数说明：解析 router.ts 中 path + component import 映射，仅提取工具路由。
 */
const parseToolRoutes = (routerText) => {
  const routeReg = /path:\s*'([^']+)'[\s\S]*?component:\s*\(\)\s*=>\s*import\('([^']+)'\)/g
  const routes = []
  let match = routeReg.exec(routerText)
  while (match) {
    const routePath = normalizeRoutePath(match[1])
    const componentImportPath = String(match[2] || '').trim()
    if (routePath.startsWith('/tools/')) {
      routes.push({
        path: routePath,
        component: componentImportPath
      })
    }
    match = routeReg.exec(routerText)
  }
  return routes
}

/**
 * 函数说明：将路由组件 import 路径转换为统一的 Tools 组件相对路径，兼容 @ 别名和 router.ts 内的相对路径。
 */
const resolveToolComponentRelativePath = (importPath) => {
  const cleaned = String(importPath || '').trim()
  if (!cleaned) {
    return ''
  }
  const absolutePath = cleaned.startsWith('@/')
    ? path.resolve(PROJECT_ROOT, 'src', cleaned.slice(2))
    : path.resolve(path.dirname(ROUTER_FILE), cleaned)
  const relativePath = path.relative(PROJECT_ROOT, absolutePath).split(path.sep).join('/')
  if (!relativePath.startsWith('src/components/Tools/')) {
    return ''
  }
  return relativePath
}

/**
 * 函数说明：递归扫描 Tools 目录，找出手动调用 ensureToolConsume 的组件文件集合。
 */
const scanManualConsumeComponents = (toolsDir) => {
  const resultSet = new Set()

  /**
   * 函数说明：深度遍历目录并识别 .vue 文件中的手动积分接入调用。
   */
  const walk = (currentDir) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    entries.forEach((entry) => {
      const absolutePath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(absolutePath)
        return
      }
      if (!entry.isFile() || !entry.name.endsWith('.vue')) {
        return
      }
      const fileText = readTextFile(absolutePath)
      if (!fileText) {
        return
      }
      if (fileText.includes('ensureToolConsume(') || fileText.includes('useToolConsume')) {
        const relativePath = path.relative(PROJECT_ROOT, absolutePath).split(path.sep).join('/')
        resultSet.add(relativePath)
      }
    })
  }

  if (fs.existsSync(toolsDir)) {
    walk(toolsDir)
  }
  return resultSet
}

/**
 * 函数说明：解析手动路由清单配置，读取 path: '/tools/**' 条目。
 */
const parseManualRoutePathsFromConfig = (configText) => {
  const pathReg = /path:\s*'([^']+)'/g
  const resultSet = new Set()
  let match = pathReg.exec(configText)
  while (match) {
    const normalizedPath = normalizeRoutePath(match[1])
    if (normalizedPath.startsWith('/tools/')) {
      resultSet.add(normalizedPath)
    }
    match = pathReg.exec(configText)
  }
  return resultSet
}

/**
 * 函数说明：打印审计结果，输出覆盖率与待补清单，便于后续 P0/P1 拆分任务。
 */
const printAuditReport = (payload) => {
  const {
    totalToolRoutes,
    manualByCodeRoutes,
    manualConfigRoutes,
    uncoveredRoutes,
    configMissingRoutes,
    configOrphanRoutes
  } = payload

  const manualConfigCoverage = totalToolRoutes > 0
    ? ((manualConfigRoutes.length / totalToolRoutes) * 100).toFixed(2)
    : '0.00'
  const manualCodeCoverage = totalToolRoutes > 0
    ? ((manualByCodeRoutes.length / totalToolRoutes) * 100).toFixed(2)
    : '0.00'

  console.log('=== 工具积分拦截覆盖审计 ===')
  console.log(`工具路由总数: ${totalToolRoutes}`)
  console.log(`手动接入(代码识别): ${manualByCodeRoutes.length} (${manualCodeCoverage}%)`)
  console.log(`手动接入(配置清单): ${manualConfigRoutes.length} (${manualConfigCoverage}%)`)
  console.log(`全局守卫覆盖候选: ${uncoveredRoutes.length}`)
  console.log('')

  console.log('--- 待补到手动配置清单（代码已接入但配置缺失）---')
  if (configMissingRoutes.length === 0) {
    console.log('无')
  } else {
    configMissingRoutes.forEach((item) => console.log(item))
  }
  console.log('')

  console.log('--- 需排查配置孤儿（清单中有但路由/代码未命中）---')
  if (configOrphanRoutes.length === 0) {
    console.log('无')
  } else {
    configOrphanRoutes.forEach((item) => console.log(item))
  }
  console.log('')

  console.log('--- 当前全局守卫兜底路由（前 60 项）---')
  if (uncoveredRoutes.length === 0) {
    console.log('无')
  } else {
    uncoveredRoutes.slice(0, 60).forEach((item) => console.log(item))
    if (uncoveredRoutes.length > 60) {
      console.log(`... 其余 ${uncoveredRoutes.length - 60} 项已省略`)
    }
  }
}

const routerText = readTextFile(ROUTER_FILE)
const configText = readTextFile(MANUAL_CONFIG_FILE)
if (!routerText) {
  process.exit(1)
}

const toolRoutes = parseToolRoutes(routerText)
const routePathSet = new Set(toolRoutes.map((item) => item.path))
const manualComponentSet = scanManualConsumeComponents(TOOLS_DIR)
const manualConfigPathSet = parseManualRoutePathsFromConfig(configText)

const manualByCodeRouteSet = new Set()
toolRoutes.forEach((routeItem) => {
  const relativeComponentPath = resolveToolComponentRelativePath(routeItem.component)
  if (!relativeComponentPath) {
    return
  }
  if (manualComponentSet.has(relativeComponentPath)) {
    manualByCodeRouteSet.add(routeItem.path)
  }
})

const uncoveredRoutes = toolRoutes
  .map((item) => item.path)
  .filter((routePath) => !manualConfigPathSet.has(routePath))
  .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))

const configMissingRoutes = Array.from(manualByCodeRouteSet)
  .filter((routePath) => !manualConfigPathSet.has(routePath))
  .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))

const configOrphanRoutes = Array.from(manualConfigPathSet)
  .filter((routePath) => !routePathSet.has(routePath) || !manualByCodeRouteSet.has(routePath))
  .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))

printAuditReport({
  totalToolRoutes: toolRoutes.length,
  manualByCodeRoutes: Array.from(manualByCodeRouteSet),
  manualConfigRoutes: Array.from(manualConfigPathSet),
  uncoveredRoutes,
  configMissingRoutes,
  configOrphanRoutes
})
