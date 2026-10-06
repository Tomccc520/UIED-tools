/**
 * @file generate-frontend-route-allowlist.mjs
 * @description 根据 Vue Router 静态路由生成 Nginx 前台路由白名单，避免未知路径被 SPA 回退成软 404
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-05
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { extractStaticRoutePaths, readRouterSource } from './lib/vue-router-paths.mjs'

const outputFile = path.resolve(process.argv[2] || path.join(import.meta.dirname, '../../output/frontend-route-allowlist.conf'))

/**
 * 函数说明：生成 Nginx 精确 location 配置，让已注册的 Vue 路由继续使用 SPA 入口。
 * @param routePaths 已注册的静态路由路径
 * @returns Nginx 配置文本
 */
const buildNginxAllowlist = (routePaths) => {
  const generatedAt = new Date().toISOString()
  const locations = routePaths
    .map((routePath) => {
      if (['/404', '/login', '/register'].includes(routePath)) {
        return `location = ${routePath} {\n    add_header X-Robots-Tag "noindex, nofollow" always;\n    return 404;\n}`
      }
      return `location = ${routePath} {\n    try_files $uri $uri/ /index.html;\n}`
    })
    .join('\n\n')

  return `# 此文件由 scripts/release/generate-frontend-route-allowlist.mjs 自动生成，请勿手工编辑。\n# 生成时间: ${generatedAt}\n\n${locations}\n`
}

/**
 * 函数说明：生成并写入路由白名单文件，供正式 Nginx 配置 include。
 */
const main = () => {
  const routePaths = extractStaticRoutePaths(readRouterSource())
  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, buildNginxAllowlist(routePaths), 'utf8')
  process.stdout.write(`前台 Nginx 路由白名单已生成：${routePaths.length} 条 -> ${outputFile}\n`)
}

main()
