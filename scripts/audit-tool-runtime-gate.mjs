/**
 * @file audit-tool-runtime-gate.mjs
 * @description 前台工具入口统一门禁审计，防止榜单、搜索、推荐和工具卡片绕过停用/登录/计费策略
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
 */

import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()

const requiredGateFiles = [
  'src/components/Home/Home.vue',
  'src/components/Tools/ToolList.vue',
  'src/components/Tools/AI/AIToolboxHub.vue',
  'src/components/Tools/RandomTools/RandomTools.vue',
  'src/components/Common/ToolRankingBoard.vue',
  'src/components/Common/ToolsRecommend.vue',
  'src/components/Search/Search.vue',
  'src/components/Layout/Right/Right.vue'
]

const policyMergeFiles = [
  {
    file: 'src/store/modules/tools.ts',
    snippets: ['findToolByUrl', 'toolKey:', 'consumePoints:', 'status:', 'needLogin:']
  },
  {
    file: 'src/components/Common/ToolsRecommend.vue',
    snippets: ['findToolByUrl', 'toolKey:', 'consumePoints:', 'status:', 'needLogin:']
  },
  {
    file: 'src/components/Search/Search.vue',
    snippets: ['buildToolRuntimeEntryMap', 'resolveSearchRuntimeEntry', 'toolKey:', 'status:', 'needLogin:']
  }
]

const forbiddenDirectNavigationChecks = [
  {
    file: 'src/components/Home/Home.vue',
    patterns: [/window\.open\s*\(/, /router\.push\s*\(/, /location\.href\s*=/]
  },
  {
    file: 'src/components/Tools/ToolList.vue',
    patterns: [/window\.open\s*\(/, /router\.push\s*\(/, /location\.href\s*=/]
  },
  {
    file: 'src/components/Tools/AI/AIToolboxHub.vue',
    patterns: [/window\.open\s*\(/, /router\.push\s*\(/, /location\.href\s*=/]
  },
  {
    file: 'src/components/Tools/RandomTools/RandomTools.vue',
    patterns: [/window\.open\s*\(/, /router\.push\s*\(/, /location\.href\s*=/]
  },
  {
    file: 'src/components/Common/ToolRankingBoard.vue',
    patterns: [/window\.open\s*\(/, /router\.push\s*\(/, /location\.href\s*=/]
  },
  {
    file: 'src/components/Common/ToolsRecommend.vue',
    patterns: [/window\.open\s*\(/, /router\.push\s*\(/, /location\.href\s*=/]
  },
  {
    file: 'src/components/Search/Search.vue',
    patterns: [/router\.push\s*\(/, /location\.href\s*=/]
  },
  {
    file: 'src/components/Layout/Right/Right.vue',
    patterns: [/window\.open\s*\(/, /router\.push\s*\(/, /location\.href\s*=/]
  }
]

/**
 * 函数说明：读取源码文本，读取失败时返回空字符串并由审计项输出错误。
 */
const readSourceFile = (relativePath) => {
  try {
    return fs.readFileSync(path.resolve(projectRoot, relativePath), 'utf8')
  } catch {
    return ''
  }
}

/**
 * 函数说明：检查关键工具入口组件是否接入 useToolRuntimeGate 和 openToolEntry。
 */
const collectMissingGateUsage = () => {
  return requiredGateFiles.flatMap((file) => {
    const text = readSourceFile(file)
    if (!text) {
      return [`${file}: 文件不存在或不可读`]
    }
    const errors = []
    if (!text.includes('useToolRuntimeGate')) {
      errors.push(`${file}: 未引入 useToolRuntimeGate`)
    }
    if (!text.includes('openToolEntry')) {
      errors.push(`${file}: 未调用 openToolEntry`)
    }
    return errors
  })
}

/**
 * 函数说明：检查榜单、搜索和推荐是否保留工具主数据策略字段合并能力。
 */
const collectPolicyMergeErrors = () => {
  return policyMergeFiles.flatMap(({ file, snippets }) => {
    const text = readSourceFile(file)
    if (!text) {
      return [`${file}: 文件不存在或不可读`]
    }
    return snippets
      .filter((snippet) => !text.includes(snippet))
      .map((snippet) => `${file}: 缺少策略字段合并片段 ${snippet}`)
  })
}

/**
 * 函数说明：检查工具入口组件是否仍存在绕过统一门禁的直接跳转逻辑。
 */
const collectDirectNavigationErrors = () => {
  return forbiddenDirectNavigationChecks.flatMap(({ file, patterns }) => {
    const text = readSourceFile(file)
    if (!text) {
      return [`${file}: 文件不存在或不可读`]
    }
    return patterns
      .filter((pattern) => pattern.test(text))
      .map((pattern) => `${file}: 存在可能绕过 openToolEntry 的直接跳转 ${pattern}`)
  })
}

const errors = [
  ...collectMissingGateUsage(),
  ...collectPolicyMergeErrors(),
  ...collectDirectNavigationErrors()
]

if (errors.length > 0) {
  console.error('前台工具入口统一门禁审计未通过：')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else {
  console.log(`前台工具入口统一门禁审计通过：${requiredGateFiles.length} 个入口组件。`)
}
