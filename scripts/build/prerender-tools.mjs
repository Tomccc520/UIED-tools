/**
 * @description 构建时预渲染真实工具页面，离线生成所有访客共用的首个 HTML。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { load } from 'cheerio'

const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.wasm': 'application/wasm'
}

/** 函数说明：校验预渲染清单，要求路径唯一、安全，并有独立 SEO 与页面就绪条件。 */
export const validatePrerenderRoutes = (routes, seoOverrides) => {
  const seen = new Set()
  for (const route of routes) {
    if (!/^\/tools\/[a-z0-9/-]+$/.test(route.path) || route.path.includes('//') || seen.has(route.path)) {
      throw new Error(`预渲染路由无效或重复：${route.path}`)
    }
    if (!route.readySelector || !route.headingIncludes || !seoOverrides[route.path]?.title || !seoOverrides[route.path]?.description) {
      throw new Error(`预渲染缺少页面就绪条件或独立 SEO：${route.path}`)
    }
    seen.add(route.path)
  }
}

/** 函数说明：仅在回环地址临时提供本次构建文件；已登记的工具入口读取 SPA 源模板，其他未知地址返回 404。 */
const startSourceServer = async (outDir, routes) => {
  const routePaths = new Set(routes.map((route) => route.path))
  const server = http.createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
      const normalized = pathname.replace(/\/+$/, '') || '/'
      const relative = routePaths.has(normalized) || normalized === '/' ? '/index.html' : pathname
      const file = path.resolve(outDir, `.${relative}`)
      if (!file.startsWith(`${outDir}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        response.writeHead(404).end('Not found')
        return
      }
      response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(file)] || 'application/octet-stream' })
      response.end(fs.readFileSync(file))
    } catch {
      response.writeHead(400).end('Bad request')
    }
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  return { server, origin: `http://127.0.0.1:${server.address().port}` }
}

/** 函数说明：使用已安装的 Playwright 浏览器；本机缺少托管 Chromium 时可使用已有官方 Chrome。 */
const launchBuildBrowser = async () => {
  const { chromium } = await import('playwright')
  const configuredPath = process.env.UIED_PRERENDER_BROWSER
  if (configuredPath) return chromium.launch({ headless: true, executablePath: configuredPath })
  const bundledPath = chromium.executablePath()
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  if (!fs.existsSync(bundledPath) && fs.existsSync(chromePath)) {
    return chromium.launch({ headless: true, executablePath: chromePath })
  }
  return chromium.launch({ headless: true })
}

/** 函数说明：验证捕获内容确有工具正文、正确独立 SEO 和自身 canonical，避免将首页或加载占位误当成功。 */
export const validatePrerenderHtml = (html, route, seo, canonicalOrigin) => {
  const $ = load(html)
  const canonical = new URL(route.path, `${canonicalOrigin}/`).href
  const bodyText = $('#app .uied-tool-view').text().replace(/\s+/g, ' ').trim()
  const headings = $('#app .uied-tool-view h1')
  const heading = headings.first().text().trim()
  if (headings.length !== 1 || !heading.includes(route.headingIncludes) || bodyText.length < 100 || !$(route.readySelector).length) {
    throw new Error(`工具正文尚未渲染完成：${route.path}`)
  }
  if ($('head > title').length !== 1 || $('head meta[name="description"]').length !== 1 ||
      $('head link[rel="canonical"]').length !== 1 || !$('head > title').text().startsWith(seo.title) ||
      $('head meta[name="description"]').attr('content') !== seo.description ||
      $('head link[rel="canonical"]').attr('href') !== canonical || $('head meta[property="og:url"]').attr('content') !== canonical) {
    throw new Error(`工具 SEO 与路由不一致：${route.path}`)
  }
  if (/noindex/i.test($('head meta[name="robots"]').attr('content') || '')) {
    throw new Error(`可索引工具页意外包含 noindex：${route.path}`)
  }
  return { title: $('head > title').text(), description: seo.description, canonical, heading, bodyTextLength: bodyText.length }
}

/** 函数说明：从生产构建启动隔离浏览器，禁用外部网络与真实 API，捕获页面内容并在成功后写出完整清单。 */
export const prerenderToolPages = async ({ rootDir, outDir, canonicalOrigin = 'https://uiedtool.com' }) => {
  const routes = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/config/prerender-routes.json'), 'utf8'))
  const overrides = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/config/tool-seo-overrides.json'), 'utf8'))
  validatePrerenderRoutes(routes, overrides)
  const snapshotDir = path.join(outDir, '_prerender')
  fs.rmSync(snapshotDir, { recursive: true, force: true })
  const { server, origin } = await startSourceServer(outDir, routes)
  let browser
  try {
    browser = await launchBuildBrowser()
    const snapshots = []
    for (const route of routes) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN', reducedMotion: 'reduce' })
      // 函数说明：构建期间仅允许读取本次静态产物，公共配置使用稳定的本地默认值，禁止真实埋点或外部 AI 请求。
      await context.route('**/*', async (requestRoute) => {
        const url = new URL(requestRoute.request().url())
        if (url.origin !== origin) return requestRoute.abort()
        if (url.pathname.startsWith('/api/') || url.pathname.endsWith('-proxy')) {
          const data = url.pathname === '/api/common/index/config'
            ? { webName: 'UIED-Tools', loginEnabled: false }
            : {}
          return requestRoute.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 200, data }) })
        }
        return requestRoute.continue()
      })
      const page = await context.newPage()
      const pageErrors = []
      page.on('pageerror', (error) => pageErrors.push(error.message))
      try {
        await page.goto(`${origin}${route.path}`, { waitUntil: 'networkidle', timeout: 20000 })
        await page.waitForSelector(route.readySelector, { timeout: 10000 })
        await page.waitForFunction((expected) => document.querySelector('link[rel="canonical"]')?.href === expected,
          new URL(route.path, `${canonicalOrigin}/`).href, { timeout: 10000 })
        if (pageErrors.length) throw new Error(`工具预渲染出现运行异常：${route.path} ${pageErrors.slice(0, 3).join('; ')}`)
        const $ = load(await page.content())
        // 函数说明：移除首次挂载产生的空浮层宿主，避免浏览器再次启动时复用过期的 Element Plus 容器。
        $('body > div[id^="el-popper-container-"]').remove()
        $('body').append('<noscript><p>当前显示工具界面和使用说明；启用 JavaScript 后可进行本地处理。</p></noscript>')
        const html = $.html()
        const meta = validatePrerenderHtml(html, route, overrides[route.path], canonicalOrigin)
        const relativeFile = `_prerender${route.path}.html`
        const file = path.join(outDir, relativeFile)
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, html)
        snapshots.push({ path: route.path, file: relativeFile, ...meta, sha256: crypto.createHash('sha256').update(html).digest('hex') })
        process.stdout.write(`工具首个 HTML 已预渲染：${route.path}\n`)
      } finally { await context.close() }
    }
    const appVersion = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version
    fs.writeFileSync(path.join(snapshotDir, 'manifest.json'), JSON.stringify({ schemaVersion: 1, appVersion, generatedAt: new Date().toISOString(), routes: snapshots }, null, 2) + '\n')
    execFileSync(process.execPath, [path.join(rootDir, 'scripts/release/generate-frontend-route-allowlist.mjs'), path.join(outDir, 'frontend-route-allowlist.conf')])
  } catch (error) {
    fs.rmSync(snapshotDir, { recursive: true, force: true })
    throw error
  } finally {
    try { if (browser) await browser.close() }
    finally {
      await new Promise((resolve) => {
        server.close(resolve)
        server.closeAllConnections?.()
      })
    }
  }
}

/** 函数说明：在 Vite 写完生产资源后自动生成工具静态 HTML，失败会阻断构建。 */
export const toolPrerenderPlugin = () => {
  let config
  let buildFailed = false
  return {
    name: 'uied-tool-prerender', apply: 'build',
    /** 函数说明：保存 Vite 本次构建的根目录、输出目录与公开规范域。 */
    configResolved(resolved) { config = resolved },
    /** 函数说明：已有构建错误时不再启动预渲染，避免错误被后续流程覆盖。 */
    buildEnd(error) { buildFailed = Boolean(error) },
    /** 函数说明：静态资源写入完成后生成工具 HTML，并将失败传递给构建命令。 */
    async closeBundle() {
      if (buildFailed) return
      await prerenderToolPages({
        rootDir: config.root,
        outDir: path.resolve(config.root, config.build.outDir),
        canonicalOrigin: String(config.env.VITE_APP_URL || 'https://uiedtool.com').replace(/\/+$/, '')
      })
    }
  }
}
