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
import ts from 'typescript'

const routerFile = path.resolve(import.meta.dirname, '../../../src/router/router.ts')

/**
 * 函数说明：读取 Vue Router 源码文本。
 * @returns 路由源码字符串
 */
export const readRouterSource = () => fs.readFileSync(routerFile, 'utf8')

/**
 * 函数说明：读取对象的指定静态属性，避免注释、函数体或相邻路由中的属性污染解析结果。
 * @param object 对象语法节点；name 属性名
 * @returns 属性值语法节点，不存在时返回 undefined
 */
const readProperty = (object, name) => object.properties
  .find((property) => ts.isPropertyAssignment(property) && property.name.getText().replace(/['"]/g, '') === name)
  ?.initializer

/**
 * 函数说明：提取静态注册的路由信息；动态参数、通配符与正则路径无法被站点地图或 Nginx 精确匹配，直接过滤。
 * @param source 路由源码文本
 * @returns 静态路由、跳转目标与可索引状态，按路径去重并排序
 */
export const extractStaticRouteInfos = (source) => {
  const sourceFile = ts.createSourceFile('router.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const infos = []

  /** 函数说明：递归收集带静态绝对 path 的路由对象，跳过动态参数路径。 */
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const pathNode = readProperty(node, 'path')
      if (pathNode && ts.isStringLiteralLike(pathNode)) {
        const rawPath = pathNode.text.trim()
        if (rawPath.startsWith('/') && !/[:*()]/.test(rawPath)) {
          const redirectNode = readProperty(node, 'redirect')
          const metaNode = readProperty(node, 'meta')
          const robotsNode = metaNode && ts.isObjectLiteralExpression(metaNode)
            ? readProperty(metaNode, 'robots')
            : undefined
          infos.push({
            path: rawPath === '/' ? '/' : rawPath.replace(/\/+$/g, ''),
            isRedirect: Boolean(redirectNode),
            redirectTo: redirectNode && ts.isStringLiteralLike(redirectNode) ? redirectNode.text : null,
            isIndexable: !(robotsNode && ts.isStringLiteralLike(robotsNode) && /\bnoindex\b/i.test(robotsNode.text))
          })
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)

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
