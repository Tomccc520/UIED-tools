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
const requiredExperienceFields = ['valuePoint', 'inputHint', 'outputHint', 'failureHint', 'qualityHint']

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
const entries = parseExperienceEntries(experienceText)
const entryByRoute = new Map(entries.map((entry) => [entry.route, entry]))
const errors = []

if (!experienceText) {
  errors.push(`体验配置文件不存在或不可读：${experienceConfigFile}`)
}

if (!appText) {
  errors.push(`App.vue 不可读：${appFile}`)
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

printAuditResult(errors, entries)
