/**
 * @file audit-member-core-experience.mjs
 * @description 审计 20 个会员核心工具前台体验配置，确保卖点展示、首屏说明和失败兜底不漏配
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
 */

import fs from 'node:fs'
import path from 'node:path'
import { MEMBER_CORE_TOOL_PRESETS, normalizeToolRouteMatchKey } from './lib/tool-commercial-policy.mjs'

const projectRoot = process.cwd()
const experienceConfigFile = path.resolve(projectRoot, 'src/config/memberCoreTools.ts')
const appFile = path.resolve(projectRoot, 'src/App.vue')
const routerFile = path.resolve(projectRoot, 'src/router/router.ts')
const memberCoreRouteComponentChecks = [
  { route: '/tools/photo/background', toolKey: 'photo-background', component: 'src/components/Tools/Photo/PhotoBackground.vue' },
  { route: '/tools/photo/transparent', toolKey: 'photo-transparent', component: 'src/components/Tools/Photo/PhotoTransparent.vue' },
  { route: '/tools/photo/crop', toolKey: 'photo-crop', component: 'src/components/Tools/Photo/PhotoCrop.vue' },
  { route: '/tools/photo/layout', toolKey: 'photo-layout', component: 'src/components/Tools/Photo/PhotoLayout.vue' },
  { route: '/tools/ai/deepseek-r1', toolKey: 'ai-deepseek-r1', component: 'src/components/Tools/AI/DeepSeekR1.vue' },
  { route: '/tools/ai/deepseek', toolKey: 'ai-deepseek', component: 'src/components/Tools/AI/DeepSeek.vue' },
  { route: '/tools/ai/ocr', toolKey: 'ai-ocr', component: 'src/components/Tools/AI/OCRRecognition.vue' },
  { route: '/tools/ai/image-enhance', toolKey: 'ai-image-enhance', component: 'src/components/Tools/AI/ImageEnhance.vue' },
  { route: '/tools/ai/remove-watermark', toolKey: 'ai-remove-watermark', component: 'src/components/Tools/AI/RemoveWatermark.vue' },
  { route: '/tools/ai/work-summary', toolKey: 'ai-work-summary', component: 'src/components/Tools/AI/Writing/AIWorkSummary.vue' },
  { route: '/tools/ai/work-summary?type=annual', toolKey: 'ai-work-summary-annual', component: 'src/components/Tools/AI/Writing/AIWorkSummary.vue' },
  { route: '/tools/ai/office/custom-summary', toolKey: 'ai-office-custom-summary', component: 'src/components/Tools/AI/Office/CustomSummary.vue' },
  { route: '/tools/ai/office/resume-creation', toolKey: 'ai-office-resume-creation', component: 'src/components/Tools/AI/Office/ResumeCreation.vue' },
  { route: '/tools/ai/office/meeting-minutes', toolKey: 'ai-office-meeting-minutes', component: 'src/components/Tools/AI/Office/MeetingMinutes.vue' },
  { route: '/tools/ai/analysis/research-report', toolKey: 'ai-analysis-research-report', component: 'src/components/Tools/AI/Analysis/ResearchReport.vue' },
  { route: '/tools/ai/analysis/business-plan', toolKey: 'ai-analysis-business-plan', component: 'src/components/Tools/AI/Analysis/BusinessPlan.vue' },
  { route: '/tools/ai/article-generator', toolKey: 'ai-article-generator', component: 'src/components/Tools/AI/Writing/AIArticleGenerator.vue' },
  { route: '/tools/ai/xiaohongshu-note', toolKey: 'ai-xiaohongshu-note', component: 'src/components/Tools/AI/Writing/XiaohongshuNote.vue' },
  { route: '/tools/video/compress', toolKey: 'video-compress', component: 'src/components/Tools/Video/VideoCompress/VideoCompress.vue' },
  { route: '/tools/video/convert', toolKey: 'video-format-convert', component: 'src/components/Tools/Video/VideoFormatConvert/VideoFormatConvert.vue' }
]
const requiredExperienceFields = [
  'valuePoint',
  'inputHint',
  'sampleInput',
  'outputHint',
  'deliverableExample',
  'failureHint',
  'qualityHint'
]

/**
 * 函数说明：读取源码文本，读取失败时返回空字符串并交由审计结果输出。
 */
const readTextFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
}

/**
 * 函数说明：解析 router.ts 中的路由与组件 import 映射，用于校验 20 个核心工具路由真实落点。
 */
const parseRouteComponentMap = (routerText) => {
  const routeMap = new Map()
  const lines = routerText.split('\n')
  let currentPath = ''
  let inBlockComment = false

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('/*')) {
      inBlockComment = true
    }
    if (inBlockComment) {
      if (trimmed.includes('*/')) {
        inBlockComment = false
      }
      return
    }
    if (trimmed.startsWith('//')) {
      return
    }

    const pathMatch = trimmed.match(/^path:\s*'([^']+)'/)
    if (pathMatch) {
      currentPath = pathMatch[1]
      return
    }

    const componentMatch = trimmed.match(/^component:\s*\(\)\s*=>\s*import\('([^']+)'\)/)
    if (currentPath && componentMatch) {
      routeMap.set(currentPath, componentMatch[1])
      return
    }

    if (trimmed.startsWith('},') || trimmed === '}') {
      currentPath = ''
    }
  })

  return routeMap
}

/**
 * 函数说明：将 router.ts 中的 import 路径转成本地相对路径，便于和预期组件文件做稳定对比。
 */
const resolveRouterImportPath = (importPath) => {
  const absolutePath = importPath.startsWith('@/')
    ? path.resolve(projectRoot, 'src', importPath.slice(2))
    : path.resolve(path.dirname(routerFile), importPath)
  return path.relative(projectRoot, absolutePath).replace(/\\/g, '/')
}

/**
 * 函数说明：检查会员核心工具路由、组件和页内提示接入是否完整。
 */
const collectMemberCorePageErrors = (routeMap) => {
  return memberCoreRouteComponentChecks.flatMap((item) => {
    const errors = []
    const routerPath = normalizeToolRouteMatchKey(item.route).split('?')[0]
    const importPath = routeMap.get(routerPath)

    if (!importPath) {
      errors.push(`${item.route}: router.ts 缺少路由定义`)
      return errors
    }

    const actualComponent = resolveRouterImportPath(importPath)
    if (actualComponent !== item.component) {
      errors.push(`${item.route}: 路由组件不一致，期望 ${item.component}，实际 ${actualComponent}`)
    }

    const pageText = readTextFile(path.resolve(projectRoot, item.component))
    if (!pageText) {
      errors.push(`${item.component}: 页面不存在或不可读`)
      return errors
    }
    if (!pageText.includes('MemberCoreToolTips')) {
      errors.push(`${item.component}: 未接入 MemberCoreToolTips 页内体验提示`)
    }

    const hasStaticToolKey = pageText.includes(`tool-key="${item.toolKey}"`)
    const hasDynamicToolKey = pageText.includes(':tool-key="currentMemberCoreExperience.toolKey"')
    if (!hasStaticToolKey && !hasDynamicToolKey) {
      errors.push(`${item.component}: 未绑定 ${item.toolKey} 的页内体验提示`)
    }

    return errors
  })
}

/**
 * 函数说明：从 TypeScript 配置源码中解析会员核心工具体验项，避免审计脚本依赖额外 TS 运行器。
 */
const parseExperienceEntries = (sourceText) => {
  const entryReg = /\{\s*route:\s*'([^']+)'[\s\S]*?toolKey:\s*'([^']+)'[\s\S]*?\}/g
  const entries = []
  let match = entryReg.exec(sourceText)
  while (match) {
    const block = match[0]
    entries.push({
      route: normalizeToolRouteMatchKey(match[1]),
      toolKey: String(match[2] || '').trim(),
      consumePoints: Number(block.match(/consumePoints:\s*(\d+)/)?.[1] || Number.NaN),
      fields: requiredExperienceFields.reduce((result, fieldName) => {
        const fieldReg = new RegExp(`${fieldName}:\\s*'([^']+)'`)
        const fieldMatch = block.match(fieldReg)
        result[fieldName] = String(fieldMatch?.[1] || '').trim()
        return result
      }, {})
    })
    match = entryReg.exec(sourceText)
  }
  return entries
}

/**
 * 函数说明：输出审计错误并设置退出码，便于本地和 CI 统一判断。
 */
const printAuditResult = (errors, entries) => {
  if (errors.length > 0) {
    console.error('会员核心工具体验配置审计未通过：')
    errors.forEach((error) => console.error(`- ${error}`))
    process.exitCode = 1
    return
  }
  console.log(`会员核心工具体验配置审计通过：${entries.length} 个工具。`)
}

const experienceText = readTextFile(experienceConfigFile)
const appText = readTextFile(appFile)
const routerText = readTextFile(routerFile)
const entries = parseExperienceEntries(experienceText)
const entryByRoute = new Map(entries.map((entry) => [entry.route, entry]))
const routeMap = parseRouteComponentMap(routerText)
const errors = []

if (!experienceText) {
  errors.push(`体验配置文件不存在或不可读：${experienceConfigFile}`)
}

if (!appText) {
  errors.push(`App.vue 不可读：${appFile}`)
}

if (!routerText) {
  errors.push(`router.ts 不可读：${routerFile}`)
}

if (entries.length !== MEMBER_CORE_TOOL_PRESETS.length) {
  errors.push(`会员核心体验配置数量应为 ${MEMBER_CORE_TOOL_PRESETS.length} 个，当前为 ${entries.length} 个。`)
}

MEMBER_CORE_TOOL_PRESETS.forEach((preset) => {
  const routeKey = normalizeToolRouteMatchKey(preset.matchUrl)
  const entry = entryByRoute.get(routeKey)
  if (!entry) {
    errors.push(`缺少会员核心体验配置：${preset.title}（${preset.matchUrl}）`)
    return
  }
  if (entry.toolKey !== preset.toolKey) {
    errors.push(`${preset.title}: toolKey 不一致，体验配置=${entry.toolKey}，商业策略=${preset.toolKey}`)
  }
  if (entry.consumePoints !== preset.consumePoints) {
    errors.push(`${preset.title}: consumePoints 不一致，体验配置=${entry.consumePoints}，商业策略=${preset.consumePoints}`)
  }
  requiredExperienceFields.forEach((fieldName) => {
    if (!entry.fields[fieldName]) {
      errors.push(`${preset.title}: 缺少 ${fieldName} 文案`)
    }
  })
})

if (!appText.includes('resolveMemberCoreToolExperience')) {
  errors.push('App.vue 未接入 resolveMemberCoreToolExperience')
}

if (!appText.includes('member-core-runtime-panel')) {
  errors.push('App.vue 未渲染会员核心工具首屏体验面板')
}

if (!appText.includes('member-core-runtime-panel__policy')) {
  errors.push('App.vue 未渲染会员核心工具运行扣分策略说明')
}

if (!appText.includes('currentMemberCoreExperience.sampleInput')) {
  errors.push('App.vue 未渲染会员核心工具示例输入')
}

if (!appText.includes('currentMemberCoreExperience.deliverableExample')) {
  errors.push('App.vue 未渲染会员核心工具交付样例')
}

errors.push(...collectMemberCorePageErrors(routeMap))

printAuditResult(errors, entries)
