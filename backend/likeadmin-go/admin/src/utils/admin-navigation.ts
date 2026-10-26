/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import type { RouteRecordRaw } from 'vue-router'

export interface AdminNavigationItem {
    title: string
    path: string
    breadcrumb: string
    external: boolean
    keywords: string
}

export interface AdminNavigationGroup {
    key: string
    title: string
    routes: RouteRecordRaw[]
}

const navigationAliases: Record<string, string> = {
    frontend_layout: '首页 内容 首页内容 每日学习 RSS 更新记录',
    advertising: '广告 banner 横幅 热门推荐 推荐工具 运营位',
    tools_catalog: '工具 工具管理 目录 分类 上架 下架 配额 收费 工具上架 工具下架 工具分类',
    sidebar: '侧栏 侧边栏 导航 菜单 前台菜单 前台品牌',
    header: '顶部 顶栏 页头 搜索 一言 顶部与搜索',
    footer: '底部 页脚 友情链接 页脚链接',
    tool_ranking_config: '排行榜 榜单 规则 周榜 热门 榜单展示',
    tool_ranking_manage: '排行榜 榜单 数据 点击 统计 热门 榜单数据',
    seo: '搜索引擎 收录 seo geo 结构化 全站SEO',
    information: '站点 网站 名称 标志 logo 图标 后台品牌 基础资料',
    filing: '备案 icp 公安 备案版权',
    protocol: '协议 隐私 条款 政策协议',
    ai_ability: 'AI 能力 场景',
    ai_provider: 'AI 提供商 服务商 密钥 接口',
    ai_model: 'AI 模型 参数'
}

/** 识别后台原有外链协议及协议相对地址，保持侧栏与搜索使用相同跳转方式。 */
export const isAdminNavigationExternal = (path: string): boolean =>
    /^(?:https?:|mailto:|tel:|\/\/)/i.test(path)

/** 根据父路径解析菜单地址，绝对路径和外链保持原样，不改动已注册路由。 */
export const resolveAdminNavigationPath = (parentPath: string, routePath: string): string => {
    if (!routePath) return parentPath
    if (isAdminNavigationExternal(routePath)) return routePath
    if (routePath.startsWith('/')) return routePath
    return `/${`${parentPath}/${routePath}`.split('/').filter(Boolean).join('/')}`
}

/** 将菜单参数转换成查询串，兼容历史 JSON 对象及原始查询串，保留已有参数。 */
export const resolveAdminNavigationTarget = (path: string, rawQuery: unknown): string => {
    const raw = String(rawQuery || '').trim()
    if (!raw) return path
    let query = raw.replace(/^[?&]/, '')
    try {
        const value = JSON.parse(raw)
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            const params = new URLSearchParams()
            Object.entries(value).forEach(([key, item]) => {
                if (item !== null && item !== undefined) params.set(key, String(item))
            })
            query = params.toString()
        }
    } catch {
        // 历史菜单允许直接保存查询串。
    }
    if (!query) return path
    const hashIndex = path.indexOf('#')
    const base = hashIndex < 0 ? path : path.slice(0, hashIndex)
    const hash = hashIndex < 0 ? '' : path.slice(hashIndex)
    return `${base}${base.includes('?') ? '&' : '?'}${query}${hash}`
}

/** 从当前用户已授权的菜单生成入口；隐藏目录整棵排除，不推测或补造任何权限菜单。 */
export const flattenAdminNavigation = (routes: RouteRecordRaw[]): AdminNavigationItem[] => {
    const items: AdminNavigationItem[] = []
    const seen = new Set<string>()
    /** 递归展开可见菜单，保留面包屑和菜单参数，按钮权限永远不作为导航入口。 */
    const visit = (nodes: RouteRecordRaw[], parentPath = '', parents: string[] = []) => {
        for (const node of nodes) {
            if (node.meta?.hidden || node.meta?.type === 'A') continue
            const fullPath = resolveAdminNavigationPath(parentPath, node.path)
            const title = String(node.meta?.title || '').trim()
            const titles = title ? [...parents, title] : parents
            if (node.meta?.type === 'C' && title && fullPath) {
                const path = resolveAdminNavigationTarget(fullPath, node.meta?.query)
                if (!seen.has(path)) {
                    seen.add(path)
                    const routeKey = fullPath.split(/[/?#]/).filter(Boolean).pop() || ''
                    items.push({
                        title,
                        path,
                        breadcrumb: titles.join(' / '),
                        external: isAdminNavigationExternal(fullPath),
                        keywords: navigationAliases[routeKey] || ''
                    })
                }
            }
            if (node.children?.length) visit(node.children, fullPath, titles)
        }
    }
    visit(routes)
    return items
}

/** 按使用任务分组原有根菜单，同组保留服务端排序和原路由对象，未知模块保留在其他功能。 */
export const groupAdminNavigation = (routes: RouteRecordRaw[]): AdminNavigationGroup[] => {
    const groups: AdminNavigationGroup[] = [
        { key: 'overview', title: '总览', routes: [] },
        { key: 'operation', title: '业务运营', routes: [] },
        { key: 'system', title: '系统管理', routes: [] },
        { key: 'other', title: '其他功能', routes: [] }
    ]
    const operationKeys = new Set([
        'consumer',
        'channel',
        'operation',
        'material',
        'official_site',
        'ai_model_manage'
    ])
    const systemKeys = new Set([
        'organization',
        'permission',
        'setting',
        'system',
        'dev',
        'dev_tools',
        'develop'
    ])
    for (const route of routes) {
        if (route.meta?.hidden || route.meta?.type === 'A') continue
        const root = route.path.split('/').filter(Boolean)[0] || ''
        const index =
            root === 'workbench' ? 0 : operationKeys.has(root) ? 1 : systemKeys.has(root) ? 2 : 3
        groups[index].routes.push(route)
    }
    return groups.filter((group) => group.routes.length > 0)
}

/** 按名称、用途、面包屑和地址查找授权入口；多个词须同时匹配，精确名称优先。 */
export const searchAdminNavigation = (
    items: AdminNavigationItem[],
    keyword: string
): AdminNavigationItem[] => {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) return items
    const terms = normalized.split(/\s+/)
    return items
        .filter((item) =>
            terms.every((term) =>
                `${item.title} ${item.breadcrumb} ${item.path} ${item.keywords}`
                    .toLowerCase()
                    .includes(term)
            )
        )
        .sort(
            (a, b) =>
                Number(b.title.toLowerCase() === normalized) -
                Number(a.title.toLowerCase() === normalized)
        )
}
