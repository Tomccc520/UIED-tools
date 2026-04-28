/**
 * @file audit-tool-strategy-contract.mjs
 * @description 审计工具主数据中心与执行策略中心的契约一致性，输出可交付前的结构性风险
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-28
 */

import fs from 'node:fs'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()
const PORTS_ENV_PATH = path.resolve(PROJECT_ROOT, '.runtime/ports.env')
const ROUTER_FILE = path.resolve(PROJECT_ROOT, 'src/router/router.ts')
const DEFAULT_API_PORT = '8003'
const TOOL_KEY_PATTERN = /^[a-z0-9_-]+$/

/**
 * 函数说明：读取环境文件中的键值，避免审计脚本写死端口。
 */
const readEnvValue = (filePath, key, defaultValue) => {
  try {
    const rawText = fs.readFileSync(filePath, 'utf8')
    const matchedLine = rawText
      .split(/\r?\n/)
      .find((line) => line.startsWith(`${key}=`))
    if (!matchedLine) {
      return defaultValue
    }
    return matchedLine.slice(key.length + 1).trim() || defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * 函数说明：读取 UTF-8 文本文件，失败时返回空字符串。
 */
const readTextFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
}

/**
 * 函数说明：规范化工具路径，统一去掉 query、hash 与末尾斜杠。
 */
const normalizeToolRoutePath = (value) => {
  const rawPath = String(value || '').trim().split('?')[0].split('#')[0]
  if (!rawPath) {
    return ''
  }
  if (rawPath === '/') {
    return '/'
  }
  return rawPath.replace(/\/+$/g, '')
}

/**
 * 函数说明：规范化 toolKey，统一小写并清理首尾空格。
 */
const normalizeToolKey = (value) => {
  return String(value || '').trim().toLowerCase()
}

/**
 * 函数说明：当工具项未显式填写 toolKey 时，根据 /tools/** 路由推导稳定 key。
 */
const deriveToolKeyByUrl = (url) => {
  const normalizedPath = normalizeToolRoutePath(url)
    .replace(/^\/tools\//, '')
    .replace(/^\/+|\/+$/g, '')
  const key = normalizedPath.replace(/[\/_]+/g, '-').trim()
  return normalizeToolKey(key)
}

/**
 * 函数说明：递归拍平工具分类树，便于统一检查 toolKey、路由和策略字段。
 */
const flattenTools = (categories) => {
  if (!Array.isArray(categories)) {
    return []
  }
  return categories.flatMap((category) => {
    const subList = Array.isArray(category?.list) ? category.list : []
    return subList.flatMap((subCategory) => {
      const toolList = Array.isArray(subCategory?.list) ? subCategory.list : []
      return toolList.map((tool) => ({
        categoryTitle: String(category?.title || '').trim(),
        subCategoryTitle: String(subCategory?.title || '').trim(),
        tool,
      }))
    })
  })
}

/**
 * 函数说明：解析 router.ts 中的工具路由集合，用于校验工具主数据链接是否可达。
 */
const parseToolRoutes = (routerText) => {
  const routeReg = /path:\s*'([^']+)'[\s\S]*?component:\s*\(\)\s*=>\s*import\('([^']+)'\)/g
  const routeMap = new Map()
  let match = routeReg.exec(routerText)
  while (match) {
    const routePath = normalizeToolRoutePath(match[1])
    const componentPath = String(match[2] || '').trim()
    if (routePath.startsWith('/tools/')) {
      routeMap.set(routePath, componentPath)
    }
    match = routeReg.exec(routerText)
  }
  return routeMap
}

/**
 * 函数说明：读取公共配置接口，获取当前运行态的工具主数据与登录策略。
 */
const loadSiteConfig = async (apiBaseUrl) => {
  const response = await fetch(`${apiBaseUrl}/api/common/index/config`)
  if (!response.ok) {
    throw new Error(`公共配置接口请求失败（HTTP ${response.status}）`)
  }
  const payload = await response.json()
  if (Number(payload?.code) !== 200) {
    throw new Error(String(payload?.msg || payload?.message || '公共配置接口返回失败'))
  }
  return payload?.data || {}
}

/**
 * 函数说明：打印摘要，并按错误级别决定退出码，方便在 CI 或交付脚本中直接使用。
 */
const printReport = (report) => {
  console.log('=== 工具主数据 / 策略中心契约审计 ===')
  console.log(`一级分类: ${report.categoryCount}`)
  console.log(`二级分类: ${report.subCategoryCount}`)
  console.log(`工具总数: ${report.toolCount}`)
  console.log(`前端 /tools 路由数: ${report.toolRouteCount}`)
  console.log(`显式 toolKey: ${report.explicitToolKeyCount}`)
  console.log(`策略规则数: ${report.ruleCount}`)
  console.log(`停用工具数: ${report.disabledToolCount}`)
  console.log(`带策略字段工具数: ${report.strategyFieldToolCount}`)
  console.log('')

  if (report.hardErrors.length > 0) {
    console.log('--- 阻断问题 ---')
    report.hardErrors.forEach((item) => console.log(`- ${item}`))
    console.log('')
  }

  if (report.warnings.length > 0) {
    console.log('--- 提示项 ---')
    report.warnings.forEach((item) => console.log(`- ${item}`))
    console.log('')
  }

  if (report.hardErrors.length > 0) {
    console.log('[RESULT] 工具主数据契约未通过，请先修复阻断问题。')
    process.exitCode = 1
    return
  }

  console.log('[RESULT] 工具主数据契约通过。')
}

const apiPort = process.env.GO_API_PORT || readEnvValue(PORTS_ENV_PATH, 'GO_API_PORT', DEFAULT_API_PORT)
const apiBaseUrl = `http://127.0.0.1:${apiPort}`
const routerText = readTextFile(ROUTER_FILE)
const routerMap = parseToolRoutes(routerText)
const siteConfig = await loadSiteConfig(apiBaseUrl)
const toolCategories = Array.isArray(siteConfig.toolCategories) ? siteConfig.toolCategories : []
const loginToolConsumeRules = Array.isArray(siteConfig.loginToolConsumeRules) ? siteConfig.loginToolConsumeRules : []
const flatTools = flattenTools(toolCategories)
const toolRouteCount = routerMap.size

const resolvedToolKeyMap = new Map()
const duplicateToolKeyMap = new Map()
const explicitToolKeyCount = flatTools.filter((item) => normalizeToolKey(item.tool?.toolKey)).length
const strategyFieldToolCount = flatTools.filter((item) => {
  const tool = item.tool || {}
  return Number.isFinite(Number(tool.consumePoints)) || typeof tool.memberFree === 'boolean' || Number.isFinite(Number(tool.status))
}).length
const disabledToolCount = flatTools.filter((item) => Number(item.tool?.status ?? 1) === 0).length
const invalidToolRouteRows = []
const invalidToolKeyRows = []

flatTools.forEach((entry) => {
  const tool = entry.tool || {}
  const title = String(tool.title || '').trim() || '(未命名工具)'
  const url = String(tool.url || '').trim()
  const resolvedToolKey = normalizeToolKey(tool.toolKey) || deriveToolKeyByUrl(url)
  const routePath = /^https?:\/\//i.test(url) ? '' : normalizeToolRoutePath(url)

  if (resolvedToolKey && !TOOL_KEY_PATTERN.test(resolvedToolKey)) {
    invalidToolKeyRows.push(`${title} -> ${resolvedToolKey}`)
  }

  if (routePath.startsWith('/tools/') && !routerMap.has(routePath)) {
    invalidToolRouteRows.push(`${title} -> ${routePath}`)
  }

  if (!resolvedToolKey) {
    return
  }

  const positions = resolvedToolKeyMap.get(resolvedToolKey) || []
  positions.push(`${entry.categoryTitle}/${entry.subCategoryTitle}/${title}`)
  resolvedToolKeyMap.set(resolvedToolKey, positions)
})

for (const [toolKey, positions] of resolvedToolKeyMap.entries()) {
  if (positions.length > 1) {
    duplicateToolKeyMap.set(toolKey, positions)
  }
}

const orphanRules = loginToolConsumeRules
  .map((item) => normalizeToolKey(item?.toolKey))
  .filter(Boolean)
  .filter((toolKey) => !resolvedToolKeyMap.has(toolKey))

const missingExplicitToolKeys = flatTools
  .filter((entry) => !normalizeToolKey(entry.tool?.toolKey))
  .map((entry) => `${entry.categoryTitle}/${entry.subCategoryTitle}/${String(entry.tool?.title || '').trim()}`)

const hardErrors = []
const warnings = []

if (duplicateToolKeyMap.size > 0) {
  for (const [toolKey, positions] of duplicateToolKeyMap.entries()) {
    hardErrors.push(`toolKey 冲突：${toolKey}（${positions.join('；')}）`)
  }
}

if (invalidToolRouteRows.length > 0) {
  invalidToolRouteRows.forEach((item) => {
    hardErrors.push(`内部工具链接未命中路由：${item}`)
  })
}

if (invalidToolKeyRows.length > 0) {
  invalidToolKeyRows.forEach((item) => {
    hardErrors.push(`toolKey 格式非法：${item}`)
  })
}

if (orphanRules.length > 0) {
  warnings.push(`登录扣分策略存在孤儿 toolKey：${orphanRules.join('、')}`)
}

if (flatTools.length === 0) {
  warnings.push(`当前公共配置中的 toolsCategoryTree 为空，尚未形成可运营的工具主数据中心；前端实际 /tools 路由数为 ${toolRouteCount}。`)
}

if (missingExplicitToolKeys.length > 0) {
  warnings.push(`仍有 ${missingExplicitToolKeys.length} 个工具未显式填写 toolKey，当前依赖链接推导。`)
}

if (strategyFieldToolCount === 0) {
  warnings.push('当前工具分类树里还没有任何工具显式配置 consumePoints/memberFree/status，策略中心仍主要依赖登录规则。')
}

printReport({
  categoryCount: toolCategories.length,
  subCategoryCount: toolCategories.reduce((sum, category) => sum + (Array.isArray(category?.list) ? category.list.length : 0), 0),
  toolCount: flatTools.length,
  explicitToolKeyCount,
  toolRouteCount,
  ruleCount: loginToolConsumeRules.length,
  disabledToolCount,
  strategyFieldToolCount,
  hardErrors,
  warnings,
})
