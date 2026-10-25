/**
 * @description 发布路由解析与生成产物回归，防止旧地址、noindex 页和注释混入 sitemap。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { extractStaticRouteInfos, readRouterSource } from './vue-router-paths.mjs'

test('解析静态路由，不受注释、协议字符串和相邻跳转属性影响', () => {
  const infos = extractStaticRouteInfos(`export const routes = [
    // { path: '/commented', redirect: '/' },
    { path: '/tool', meta: { description: 'https://example.com/a//b' } },
    { path: '/old', redirect: '/tool' },
    { path: '/private', meta: { robots: 'noindex,nofollow' } },
    { path: '/dynamic/:id', component: () => null },
    { path: '/tool/', component: () => null }
  ]`)
  assert.deepEqual(infos, [
    { path: '/old', isRedirect: true, redirectTo: '/tool', isIndexable: true },
    { path: '/private', isRedirect: false, redirectTo: null, isIndexable: false },
    { path: '/tool', isRedirect: false, redirectTo: null, isIndexable: true }
  ])
})

test('生成的 sitemap 全部命中可索引页面，旧链接生成保留参数的 HTTP 301', () => {
  const temporaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uied-route-test-'))
  const rootDir = path.resolve(import.meta.dirname, '../../..')
  try {
    const sitemapPath = path.join(temporaryDir, 'sitemap.xml')
    const allowlistPath = path.join(temporaryDir, 'routes.conf')
    execFileSync(process.execPath, [path.join(rootDir, 'scripts/release/generate-sitemap.mjs'), sitemapPath])
    execFileSync(process.execPath, [path.join(rootDir, 'scripts/release/generate-frontend-route-allowlist.mjs'), allowlistPath])
    const routeInfos = extractStaticRouteInfos(readRouterSource())
    const expected = routeInfos.filter((info) => !info.isRedirect && info.isIndexable).map((info) => info.path)
    const urls = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]))
    assert.deepEqual(urls.map((url) => url.pathname), expected)
    assert.ok(urls.every((url) => url.origin === 'https://uiedtool.com'))
    const allowlist = fs.readFileSync(allowlistPath, 'utf8')
    for (const info of routeInfos.filter((item) => item.redirectTo && item.redirectTo !== '/404')) {
      assert.ok(allowlist.includes(`location = ${info.path} {\n    return 301 ${info.redirectTo}$is_args$args;\n}`), info.path)
    }
    assert.match(allowlist, /location = \/404 \{\s+add_header X-Robots-Tag "noindex, nofollow" always;\s+return 404;/)
    assert.match(allowlist, /location = \/tools\/json\/ \{\s+try_files \$uri \$uri\/ \/index.html;/)
    const prerenderRoutes = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/config/prerender-routes.json'), 'utf8'))
    for (const { path: routePath } of prerenderRoutes) {
      assert.ok(routeInfos.some((info) => info.path === routePath && !info.isRedirect && info.isIndexable), routePath)
      for (const variant of [routePath, `${routePath}/`]) {
        assert.ok(allowlist.includes(`location = ${variant} {\n    try_files /_prerender${routePath}.html =404;\n}`), variant)
      }
    }
  } finally {
    fs.rmSync(temporaryDir, { recursive: true, force: true })
  }
})
