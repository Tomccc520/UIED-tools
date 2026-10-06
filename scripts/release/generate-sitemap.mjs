/**
 * @file generate-sitemap.mjs
 * @description 根据 Vue Router 静态路由生成 sitemap.xml，保证站点地图与真实前台路由一致
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-06
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { extractStaticRouteInfos, readRouterSource } from './lib/vue-router-paths.mjs'

const outputFile = path.resolve(process.argv[2] || path.join(import.meta.dirname, '../../output/sitemap.xml'))
const baseUrl = (process.env.UIEDTOOL_SITEMAP_BASE_URL || 'https://uiedtool.com').replace(/\/+$/g, '')

// noindex 的 404 页与登录、个人中心等功能页不进入站点地图；跳转路由由 redirect 规则统一排除。
const EXCLUDED_PATHS = new Set(['/404', '/user/login', '/user/center'])

/**
 * 函数说明：根据路由路径推导抓取频率与优先级。
 * @param routePath 站内路由路径
 * @returns changefreq 抓取频率，priority 权重
 */
const resolveSchedule = (routePath) => {
  if (routePath === '/') {
    return { changefreq: 'daily', priority: '1.0' }
  }
  if (routePath === '/changelog') {
    return { changefreq: 'weekly', priority: '0.8' }
  }
  if (routePath.startsWith('/tools/')) {
    return { changefreq: 'weekly', priority: '0.6' }
  }
  return { changefreq: 'monthly', priority: '0.5' }
}

/**
 * 函数说明：转义 XML 特殊字符，保证生成的 sitemap 合法。
 * @param value 原始文本
 * @returns 转义后的文本
 */
const escapeXml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

/**
 * 函数说明：用静态路由路径组装 sitemap XML 文本。
 * @param routePaths 参与收录的路由路径
 * @returns sitemap XML 文本
 */
const buildSitemapXml = (routePaths) => {
  const urlEntries = routePaths.map((routePath) => {
    const { changefreq, priority } = resolveSchedule(routePath)
    return [
      '  <url>',
      `    <loc>${escapeXml(`${baseUrl}${routePath}`)}</loc>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>'
    ].join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- 此文件由 scripts/release/generate-sitemap.mjs 自动生成，请勿手工编辑。 -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries.join('\n'),
    '</urlset>',
    ''
  ].join('\n')
}

/**
 * 函数说明：提取参与收录的路由并写出 sitemap 文件。
 */
const main = () => {
  const routePaths = extractStaticRouteInfos(readRouterSource())
    .filter((info) => !info.isRedirect)
    .map((info) => info.path)
    .filter((routePath) => !EXCLUDED_PATHS.has(routePath))

  fs.mkdirSync(path.dirname(outputFile), { recursive: true })
  fs.writeFileSync(outputFile, buildSitemapXml(routePaths), 'utf8')
  process.stdout.write(`sitemap 已生成：${routePaths.length} 条 -> ${outputFile}\n`)
}

main()
