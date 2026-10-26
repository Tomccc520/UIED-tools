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
    icon?: string
}

export interface AdminNavigationGroup {
    key: string
    title: string
    icon: string
    items: AdminNavigationItem[]
}

interface AdminTaskDefinition {
    path: string
    label: string
    description: string
    primary?: boolean
}

/** 侧栏、搜索和工作台共用任务名称与说明；只有已经下发的授权菜单才会成为入口。 */
export const adminTaskDefinitions: AdminTaskDefinition[] = [
    { path: '/workbench', primary: true, label: '工作台', description: '查看日常任务与访问概况。' },
    { path: '/official_site/tools_catalog', primary: true, label: '工具管理', description: '编辑工具、分类及工具 SEO / GEO。' },
    { path: '/official_site/frontend_layout', primary: true, label: '学习与更新', description: '维护每日学习和版本更新记录。' },
    { path: '/operation/advertising', primary: true, label: '广告与推荐', description: '维护横幅、推荐工具与运营广告。' },
    { path: '/material/index', primary: true, label: '素材中心', description: '上传图片、视频并维护附件资料。' },
    { path: '/official_site/tool_ranking_manage', primary: true, label: '工具排行', description: '查看工具访问、使用与下载数据。' },
    { path: '/official_site/sidebar', label: '前台菜单', description: '维护前台品牌、菜单和导航顺序。' },
    { path: '/official_site/header', label: '顶部与搜索', description: '维护顶部链接与搜索快捷入口。' },
    { path: '/official_site/footer', label: '页脚链接', description: '维护页脚分组、友情链接和媒体入口。' },
    { path: '/official_site/tool_ranking_config', label: '榜单展示', description: '设置榜单开关、周期和展示入口。' },
    { path: '/official_site/seo', label: '全站SEO', description: '维护全站默认及固定页面 SEO。' },
    { path: '/official_site/information', label: '后台品牌', description: '维护后台名称、图标和登录页视觉。' },
    { path: '/official_site/filing', label: '备案版权', description: '维护网站备案号与版权资料。' },
    { path: '/official_site/protocol', label: '政策协议', description: '维护服务协议与隐私政策。' },
    { path: '/consumer/lists', label: '用户列表', description: '查询账号及用户资料。' },
    { path: '/consumer/login_commerce', label: '登录与会员', description: '配置登录、积分、会员与支付接入。' },
    { path: '/consumer/order', label: '订单管理', description: '核对支付、交付状态和订单资料。' },
    { path: '/ai_model_manage/ai_provider', label: '模型服务商', description: '配置文本模型连接、密钥和默认模型。' },
    { path: '/ai_model_manage/ai_model', label: 'AI抠图接口', description: '配置抠图服务商和访问参数。' },
    { path: '/ai_model_manage/ai_ability', label: 'AI工具能力', description: '配置各工具的 AI 请求代理。' },
    { path: '/channel/wx_oa/menu', label: '公众号菜单', description: '维护微信公众号的自定义菜单。' },
    { path: '/permission/menu', label: '权限菜单', description: '维护后台菜单与按钮权限。' }
]

const dailyTaskPaths = adminTaskDefinitions.filter(task => task.primary).map(task => task.path)
const navigationAliases: Record<string, string> = {
    frontend_layout: '首页 内容 首页内容 学习与更新 每日学习 RSS 更新记录 前端布局',
    advertising: '广告 banner 横幅 热门推荐 推荐工具 运营位',
    tools_catalog: '工具 工具管理 目录 分类 上架 下架 配额 收费 工具上架 工具下架 工具分类',
    sidebar: '侧栏 侧边栏 导航 菜单 前台菜单 前台品牌 前台品牌与导航',
    header: '顶部 顶栏 页头 搜索 一言 顶部与搜索',
    footer: '底部 页脚 友情链接 页脚链接',
    tool_ranking_config: '排行榜 榜单 规则 周榜 热门 榜单展示',
    tool_ranking_manage: '排行榜 榜单 数据 点击 统计 热门 榜单数据 工具访问排行 工具排行',
    seo: '搜索引擎 收录 seo geo 结构化 全站SEO 全站搜索优化',
    information: '站点 网站 名称 标志 logo 图标 后台品牌 基础资料',
    filing: '备案 icp 公安 备案版权',
    protocol: '协议 隐私 条款 政策协议',
    login_commerce: '登录 商业化 会员 积分 支付 登录与商业化',
    ai_ability: 'AI 能力 场景 AI工具能力代理',
    ai_provider: 'AI 提供商 服务商 密钥 接口 AI Provider 管理',
    ai_model: 'AI 模型 参数 AI抠图 API'
}

/** 识别后台原有外链协议及协议相对地址，保持侧栏与搜索使用相同跳转方式。 */
export const isAdminNavigationExternal = (path: string): boolean =>
    /^(?:https?:|mailto:|tel:|\/\/)/i.test(path)

/** 读取路径用于任务匹配，不改变实际跳转地址里的查询参数或锚点。 */
export const adminNavigationPath = (target: string): string =>
    target.split(/[?#]/)[0].replace(/\/+$/, '') || '/'

/** 根据真实目标查找规范任务资料；未知地址、外链和参数专用入口仍保留原名。 */
export const getAdminTaskDefinition = (target: string): AdminTaskDefinition | undefined =>
    !isAdminNavigationExternal(target)
        ? adminTaskDefinitions.find(task => task.path === adminNavigationPath(target))
        : undefined

/** 输出共享任务名称；不覆盖管理员配置的参数入口、外链或自定义目录名称。 */
export const adminNavigationTitle = (target: string, fallback: unknown, hasChildren = false): string => {
    if (hasChildren || /[?#]/.test(target) || isAdminNavigationExternal(target)) return String(fallback || '')
    return getAdminTaskDefinition(target)?.label || String(fallback || '')
}

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

/** 以完整内部地址生成稳定标识，参数顺序不影响选中，锚点和不同参数仍保持区分。 */
export const adminNavigationKey = (target: string): string => {
    if (isAdminNavigationExternal(target)) return target
    const url = new URL(target, 'https://admin.invalid')
    url.searchParams.sort()
    return adminNavigationPath(url.pathname) + url.search + url.hash
}

/** 从当前用户已授权的菜单生成入口；隐藏目录整棵排除，不推测或补造任何权限菜单。 */
export const flattenAdminNavigation = (routes: RouteRecordRaw[]): AdminNavigationItem[] => {
    const items: AdminNavigationItem[] = []
    const seen = new Set<string>()
    /** 递归展开授权入口，保留原面包屑、图标和参数，目录本身不伪造成页面。 */
    const visit = (nodes: RouteRecordRaw[], parentPath = '', parents: string[] = []) => {
        for (const node of nodes) {
            if (node.meta?.hidden || node.meta?.type === 'A') continue
            const fullPath = resolveAdminNavigationPath(parentPath, node.path)
            const title = String(node.meta?.title || '').trim()
            const titles = title ? [...parents, title] : parents
            if (node.meta?.type === 'C' && title && fullPath) {
                const path = resolveAdminNavigationTarget(fullPath, node.meta?.query)
                const key = adminNavigationKey(path)
                if (!seen.has(key)) {
                    seen.add(key)
                    const routeKey = adminNavigationPath(fullPath).split('/').filter(Boolean).pop() || ''
                    items.push({ title, path, breadcrumb: titles.join(' / '), external: isAdminNavigationExternal(fullPath),
                        keywords: navigationAliases[routeKey] || '', icon: String(node.meta?.icon || '') })
                }
            }
            if (node.children?.length) visit(node.children, fullPath, titles)
        }
    }
    visit(routes)
    return items
}

/** 将已授权页面按日常任务归类；常用项平铺，未知、跨模块和外链入口全部保留。 */
export const groupAdminNavigation = (routes: RouteRecordRaw[]): AdminNavigationGroup[] => {
    const groups: AdminNavigationGroup[] = [
        { key: 'daily', title: '日常运营', icon: 'system-icon-Home', items: [] },
        { key: 'website', title: '网站设置', icon: 'system-icon-Desktop', items: [] },
        { key: 'users', title: '用户与订单', icon: 'system-icon-User', items: [] },
        { key: 'ai', title: 'AI服务', icon: 'system-icon-Robot', items: [] },
        { key: 'system', title: '系统与渠道', icon: 'system-icon-Settings', items: [] },
        { key: 'other', title: '其他功能', icon: 'system-icon-Apps', items: [] }
    ]
    for (const item of flattenAdminNavigation(routes)) {
        const path = adminNavigationPath(item.path)
        const root = path.split('/').filter(Boolean)[0] || ''
        const group = item.external ? 'other' : dailyTaskPaths.includes(path) ? 'daily'
            : root === 'official_site' ? 'website' : root === 'consumer' ? 'users'
            : root === 'ai_model_manage' ? 'ai'
            : path === '/material/icons' || ['channel', 'organization', 'permission', 'setting', 'system', 'dev', 'dev_tools', 'develop'].includes(root) ? 'system'
            : 'other'
        groups.find(candidate => candidate.key === group)!.items.push(item)
    }
    groups[0].items.sort((left, right) => dailyTaskPaths.indexOf(adminNavigationPath(left.path)) - dailyTaskPaths.indexOf(adminNavigationPath(right.path)))
    return groups.filter(group => group.items.length > 0)
}

/** 只选实际授权的高频任务供搜索和工作台复用；同任务有基础入口时优先基础入口。 */
export const getAdminQuickNavigation = (items: AdminNavigationItem[], limit = 6): AdminNavigationItem[] => {
    const picked: AdminNavigationItem[] = []
    for (const path of dailyTaskPaths) {
        const candidates = items.filter(item => !item.external && adminNavigationPath(item.path) === path)
        const item = candidates.find(candidate => !/[?#]/.test(candidate.path)) || candidates[0]
        if (item) picked.push(item)
    }
    return picked.slice(0, Math.max(0, limit))
}

/** 精确选择参数或锚点入口；没有精确项时只回退基础入口，绝不选中另一个参数专用页。 */
export const findActiveAdminNavigation = (
    items: AdminNavigationItem[], currentTarget: string, activeMenu?: string
): AdminNavigationItem | undefined => {
    const internal = items.filter(item => !item.external)
    const exact = internal.find(item => adminNavigationKey(item.path) === adminNavigationKey(currentTarget))
    if (exact) return exact
    if (activeMenu) {
        const active = internal.find(item => adminNavigationKey(item.path) === adminNavigationKey(activeMenu))
        if (active) return active
    }
    return internal.find(item => !/[?#]/.test(item.path) && adminNavigationPath(item.path) === adminNavigationPath(currentTarget))
}

/** 按规范名称、原菜单名、用途和地址查找授权入口；多个词须同时匹配，精确名称优先。 */
export const searchAdminNavigation = (items: AdminNavigationItem[], keyword: string): AdminNavigationItem[] => {
    const normalized = keyword.trim().toLowerCase()
    if (!normalized) return items
    const terms = normalized.split(/\s+/)
    return items.filter(item => terms.every(term =>
        `${adminNavigationTitle(item.path, item.title)} ${item.title} ${item.breadcrumb} ${item.path} ${item.keywords}`.toLowerCase().includes(term)
    )).sort((a, b) =>
        Number(adminNavigationTitle(b.path, b.title).toLowerCase() === normalized) - Number(adminNavigationTitle(a.path, a.title).toLowerCase() === normalized)
        || Number(b.title.toLowerCase() === normalized) - Number(a.title.toLowerCase() === normalized)
    )
}
