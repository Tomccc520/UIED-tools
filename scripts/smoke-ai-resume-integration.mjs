/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-11
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(SCRIPT_DIR, '..')
const standaloneConfig = JSON.parse(
  fs.readFileSync(path.join(ROOT_DIR, 'src/config/standalone-tools.json'), 'utf8')
)
const resumeTool = standaloneConfig.tools.find((tool) => tool.toolKey === 'ai-resume')
const smokeOrigin = String(process.env.UIED_RESUME_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')
const resumeSmokeEnabled = String(
  process.env.UIED_RESUME_SMOKE_REQUIRED || process.env.VITE_ENABLE_AI_RESUME || ''
).trim() === '1' || String(process.env.VITE_ENABLE_AI_RESUME || '').trim().toLowerCase() === 'true'

/**
 * 函数说明：在超时时间内请求集成地址，避免发布检查因服务无响应而卡住。
 */
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12_000)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * 函数说明：断言条件成立，失败时输出可直接定位的集成错误。
 */
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

/**
 * 函数说明：组装主站同域路径，确保子页均保留 Next.js basePath。
 */
const buildUrl = (suffix = '') => `${smokeOrigin}${resumeTool.basePath}${suffix}`

const wordSmokeResume = {
  personalInfo: {
    name: 'UIED 测试简历',
    title: '前端工程师',
    email: 'resume@example.com',
    phone: '13800000000',
    location: '深圳',
    summary: '用于验证同域 Word 导出链路。'
  },
  experience: [],
  education: [],
  skills: [],
  projects: []
}

/**
 * 函数说明：检查 Next.js HTML 页面可访问且没有使用 iframe 嵌入。
 */
const checkPage = async (suffix, label) => {
  const response = await fetchWithTimeout(buildUrl(suffix), { redirect: 'follow' })
  const html = await response.text()
  assert(response.ok, `${label} 返回 ${response.status}: ${response.url}`)
  assert(html.includes('/tools/ai-resume/_next/'), `${label} 未加载 basePath 下的 _next 资源`)
  assert(!/<iframe\b/i.test(html), `${label} 不应使用 iframe`)
  return html
}

/**
 * 函数说明：执行 AI 简历同域接入冒烟，覆盖页面、静态资源和 API 路由。
 */
const main = async () => {
  assert(resumeTool?.basePath === '/tools/ai-resume', '独立工具配置缺少 AI 简历 basePath')

  if (!resumeSmokeEnabled) {
    console.log('AI 简历本期未开启，已跳过独立 Next.js 集成冒烟。')
    return
  }

  const homeHtml = await checkPage('', '简历首页')
  await checkPage('/editor', '简历编辑器')
  await checkPage('/updates', '简历更新页')

  const assetMatch = homeHtml.match(/(?:src|href)="([^"?]*\/tools\/ai-resume\/_next\/static\/[^"?]+)["?]/)
  assert(assetMatch?.[1], '简历首页未找到可验证的 _next 静态资源')
  const assetResponse = await fetchWithTimeout(new URL(assetMatch[1], smokeOrigin))
  assert(assetResponse.ok, `_next 静态资源返回 ${assetResponse.status}`)

  const apiResponse = await fetchWithTimeout(buildUrl('/api/ai'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{'
  })
  assert(apiResponse.status === 400, `AI API 无效 JSON 应返回 400，实际为 ${apiResponse.status}`)

  const wordResponse = await fetchWithTimeout(buildUrl('/api/export/docx'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeData: wordSmokeResume, resumeName: 'UIED 测试简历', locale: 'zh' })
  })
  assert(wordResponse.ok, `Word 导出 API 返回 ${wordResponse.status}`)
  assert(
    wordResponse.headers.get('content-type')?.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    'Word 导出 API 返回了错误的 Content-Type'
  )
  const wordBytes = new Uint8Array(await wordResponse.arrayBuffer())
  assert(wordBytes.length > 4, 'Word 导出文件为空')
  assert(wordBytes[0] === 0x50 && wordBytes[1] === 0x4b, 'Word 导出文件不是有效的 DOCX ZIP 容器')

  console.log(`AI 简历同域集成冒烟通过: ${buildUrl('')}`)
}

main().catch((error) => {
  console.error(`AI 简历同域集成冒烟失败: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
