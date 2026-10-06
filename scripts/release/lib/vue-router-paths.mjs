/**
 * @file vue-router-paths.mjs
 * @description 解析 src/router/router.ts 的静态路由信息，供 Nginx 路由白名单与 sitemap 生成器共用
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-06
 */

import fs from 'node:fs'
import path from 'node:path'

const routerFile = path.resolve(import.meta.dirname, '../../../src/router/router.ts')

/**
 * 函数说明：读取 Vue Router 源码文本。
 * @returns 路由源码字符串
 */
export const readRouterSource = () => fs.readFileSync(routerFile, 'utf8')

/**
 * 函数说明：剥离源码中的块注释与行注释，避免被注释掉的路由混入生成结果；
 *          行注释剥离时排除协议分隔符（如 https://），防止破坏字符串内容。
 * @param source 路由源码文本
 * @returns 去除注释后的源码文本
 */
const stripComments = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1')

/**
 * 函数说明：提取静态注册的路由信息；动态参数、通配符与正则路径无法被站点地图或 Nginx 精确匹配，直接过滤。
 * @param source 路由源码文本
 * @returns 数组元素为 { path, isRedirect }，按路径去重并排序
 */
export const extractStaticRouteInfos = (source) => {
  const matches = [...stripComments(source).matchAll(/path:\s*['"]([^'"]+)['"]([\s\S]*?)(?=path:\s*['"]|$)/g)]
  const infos = matches
    .map((match) => ({
      rawPath: String(match[1] || '').trim(),
      routeBody: String(match[2] || '')
    }))
    .filter((info) => info.rawPath.startsWith('/'))
    .filter((info) => !/[:*()]/.test(info.rawPath))
    .map((info) => ({
      path: info.rawPath === '/' ? '/' : info.rawPath.replace(/\/+$/g, ''),
      isRedirect: /(^|[^\w$])redirect\s*:/.test(info.routeBody)
    }))

  // 同一路径保留首个定义，与 Vue Router 先注册先生效的行为一致。
  const seen = new Set()
  return infos
    .filter((info) => {
      if (seen.has(info.path)) return false
      seen.add(info.path)
      return true
    })
    .sort((left, right) => left.path.localeCompare(right.path, 'zh-CN'))
}

/**
 * 函数说明：提取可被 Nginx 精确匹配的静态路径集合（含跳转路由，放行策略由调用方决定）。
 * @param source 路由源码文本
 * @returns 静态路径数组
 */
export const extractStaticRoutePaths = (source) => extractStaticRouteInfos(source).map((info) => info.path)
