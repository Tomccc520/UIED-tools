/**
 * @description 通过 curl 检查首个工具 HTML 与真实 404，不执行 JavaScript。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { load } from 'cheerio'
import { validatePrerenderHtml } from '../build/prerender-tools.mjs'

const root = path.resolve(import.meta.dirname, '../..')
const baseUrl = (process.env.UIED_TOOL_SEO_BASE_URL || 'https://uiedtool.com').replace(/\/+$/, '')
const canonicalOrigin = process.env.UIED_TOOL_SEO_CANONICAL_ORIGIN || 'https://uiedtool.com'
const routes = JSON.parse(fs.readFileSync(path.join(root, 'src/config/prerender-routes.json'), 'utf8'))
const overrides = JSON.parse(fs.readFileSync(path.join(root, 'src/config/tool-seo-overrides.json'), 'utf8'))

/** 函数说明：保存 curl 的状态、响应头与原始 HTML 至独立临时目录，避免浏览器执行脚本干扰验收。 */
const readHttp = (routePath, directory) => {
  const headers = path.join(directory, 'headers')
  const body = path.join(directory, 'body')
  const status = execFileSync('curl', [
    '-sS', '--connect-timeout', '5', '--max-time', '15', '-D', headers, '-o', body,
    '-w', '%{http_code}', `${baseUrl}${routePath}`
  ], { encoding: 'utf8' }).trim()
  return { status: Number(status), headers: fs.readFileSync(headers, 'utf8'), body: fs.readFileSync(body, 'utf8') }
}

/** 函数说明：检查两种地址形式的工具首 HTML，并确认未知地址和快照内部地址都返回真实 404。 */
const main = () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'uied-tool-seo-'))
  try {
    const results = []
    for (const route of routes) {
      for (const variant of [route.path, `${route.path}/?source=seo-check`]) {
        const response = readHttp(variant, directory)
        if (response.status !== 200 || !/content-type:\s*text\/html/i.test(response.headers)) {
          throw new Error(`${variant} 期望 HTML 200，实际为 ${response.status}`)
        }
        const meta = validatePrerenderHtml(response.body, route, overrides[route.path], canonicalOrigin)
        results.push({ path: variant, status: response.status, ...meta })
      }
    }
    for (const routePath of ['/tools/qa-missing-20261025', '/404', '/_prerender/tools/qrcode.html']) {
      const response = readHttp(routePath, directory)
      const $ = load(response.body)
      if (response.status !== 404 || !/x-robots-tag:.*noindex/i.test(response.headers) ||
          !/noindex/i.test($('meta[name="robots"]').attr('content') || '') || !$('h1').text().includes('页面不存在')) {
        throw new Error(`${routePath} 未保持明确的 HTTP 404 与 noindex`)
      }
      results.push({ path: routePath, status: 404, robots: 'noindex' })
    }
    process.stdout.write(`${JSON.stringify({ baseUrl, javascriptExecuted: false, results }, null, 2)}\n`)
  } finally { fs.rmSync(directory, { recursive: true, force: true }) }
}

try { main() } catch (error) {
  process.stderr.write(`[FAIL] 工具首个 HTML 验收失败：${error.message}\n`)
  process.exitCode = 1
}
