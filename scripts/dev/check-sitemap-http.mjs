/**
 * @description 逐条校验线上 sitemap 的规范域、真实路由及 HTTP 状态，不依赖浏览器错误页文字。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { extractStaticRouteInfos, readRouterSource } from '../release/lib/vue-router-paths.mjs'

const baseUrl = (process.env.UIEDTOOL_HTTP_BASE_URL || 'https://uiedtool.com').replace(/\/+$/, '')
const canonicalUrl = (process.env.UIEDTOOL_HTTP_CANONICAL_BASE_URL || 'https://uiedtool.com').replace(/\/+$/, '')
const routes = new Set(extractStaticRouteInfos(readRouterSource())
  .filter((info) => !info.isRedirect && info.isIndexable)
  .map((info) => info.path))

/** 函数说明：请求站点资源并限制等待时间；禁止自动跟随重定向，避免过期地址假装通过。 */
const request = (pathname) => fetch(`${baseUrl}${pathname}`, {
  redirect: 'manual',
  signal: AbortSignal.timeout(15000)
})

/** 函数说明：逐条核对 XML 地址是否命中规范路由，并以最多六个并发请求检查 HTTP 200。 */
const main = async () => {
  const response = await request('/sitemap.xml')
  if (response.status !== 200) throw new Error(`sitemap.xml 返回 ${response.status}`)
  const urls = [...(await response.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]))
  if (!urls.length) throw new Error('sitemap.xml 没有任何地址')
  const failures = []
  const seen = new Set()
  for (const url of urls) {
    if (url.origin !== canonicalUrl || !routes.has(url.pathname) || url.search || url.hash || seen.has(url.href)) {
      failures.push(`${url.href} 不是唯一的规范可索引路由`)
    }
    seen.add(url.href)
  }
  let nextIndex = 0
  /** 函数说明：共享索引领取待检查地址；收集错误后继续，便于一次定位全部失效链接。 */
  const checkNext = async () => {
    while (nextIndex < urls.length) {
      const url = urls[nextIndex++]
      try {
        const result = await request(url.pathname)
        await result.body?.cancel()
        if (result.status !== 200) failures.push(`${url.pathname} 返回 ${result.status}`)
      } catch (error) {
        failures.push(`${url.pathname} 请求失败: ${error.message}`)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, urls.length) }, checkNext))
  if (failures.length) throw new Error(failures.join('\n'))
  console.log(`[PASS] sitemap ${urls.length} 条地址均为规范路由，HTTP 状态全部为 200`)
}

main().catch((error) => {
  console.error(`[FAIL] ${error.message}`)
  process.exitCode = 1
})
