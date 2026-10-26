/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import type { AdminNavigationItem } from './admin-navigation'
import type { RouteRecordRaw } from 'vue-router'

export interface ConfigurationEntry extends AdminNavigationItem { label: string; description: string }
export interface ConfigurationGroup { key: string; title: string; items: ConfigurationEntry[] }

const configurationTasks = [
    { key: 'content', title: '内容与工具', items: [
        { path: '/official_site/tools_catalog', label: '工具管理', description: '修改单个工具的信息、SEO、GEO 和计费种子。' },
        { path: '/official_site/frontend_layout', label: '首页内容', description: '维护每日学习与更新记录；广告和推荐在广告管理中维护。' },
        { path: '/operation/advertising', label: '广告与推荐', description: '维护首页横幅、热门推荐与运营广告位。' },
        { path: '/official_site/tool_ranking_config', label: '榜单展示', description: '设置榜单开关、展示周期和侧栏入口。' },
        { path: '/official_site/tool_ranking_manage', label: '榜单数据', description: '查看真实访问与使用排行，处理榜单数据。' }
    ] },
    { key: 'appearance', title: '导航与外观', items: [
        { path: '/official_site/sidebar', label: '前台菜单', description: '维护前台品牌文案、分类导航与菜单顺序。' },
        { path: '/official_site/header', label: '顶部与搜索', description: '维护顶部链接、搜索快捷入口与推荐内容。' },
        { path: '/official_site/footer', label: '页脚链接', description: '维护页脚分组、友情链接和官方媒体入口。' }
    ] },
    { key: 'foundation', title: '站点与收录', items: [
        { path: '/official_site/seo', label: '全站SEO', description: '维护全站默认及固定页面的 SEO；单个工具在工具管理中编辑。' },
        { path: '/official_site/information', label: '后台品牌', description: '管理后台品牌与基础资料；前台品牌在前台菜单中维护。' },
        { path: '/official_site/filing', label: '备案版权', description: '维护网站备案号与版权资料。' },
        { path: '/official_site/protocol', label: '政策协议', description: '维护服务协议与隐私政策。' }
    ] }
]

/** 读取入口规范路径仅用于匹配，不改变实际跳转地址中的菜单参数。 */
export const configurationPath = (value: string): string => value.split(/[?#]/)[0].replace(/\/+$/, '') || '/'

/** 根据现有任务表读取统一显示名称；带参数、外链和自定义目录保留服务端名称，不修改原始菜单。 */
export const configurationTitle = (target: string, fallback: unknown, hasChildren = false): string => {
    const original = String(fallback || '')
    if (!target.startsWith('/') || target.startsWith('//') || /[?#]/.test(target)) return original
    const path = configurationPath(target)
    if (path === '/official_site') return '网站管理'
    if (hasChildren) return original
    return configurationTasks.flatMap(group => group.items).find(item => item.path === path)?.label || original
}

/** 对已授权入口增加任务说明，保留真实查询参数和扩展菜单，不补造权限入口。 */
export const buildConfigurationGroups = (entries: AdminNavigationItem[]): ConfigurationGroup[] => {
    const used = new Set<string>()
    const groups: ConfigurationGroup[] = configurationTasks.map(group => ({
        key: group.key, title: group.title,
        items: group.items.flatMap(task => entries.filter(entry => !entry.external && configurationPath(entry.path) === task.path)
            .filter(entry => { if (used.has(entry.path)) return false; used.add(entry.path); return true })
            .map(entry => ({ ...entry, label: /[?#]/.test(entry.path) ? entry.title : task.label, description: task.description })))
    })).filter(group => group.items.length)
    const extra = entries.filter(entry => !entry.external && entry.path.startsWith('/official_site/') && !used.has(entry.path))
        .map(entry => ({ ...entry, label: entry.title, description: '站点扩展配置，按页面说明编辑和保存。' }))
    if (extra.length) groups.push({ key: 'other', title: '其他配置', items: extra })
    return groups
}

/** 规范化当前入口用于精确比较，查询参数排序只影响匹配，不改变实际跳转地址。 */
const configurationTargetKey = (value: string): string => {
    const url = new URL(value, 'https://admin.invalid')
    url.searchParams.sort()
    return configurationPath(url.pathname) + url.search + url.hash
}

/** 优先匹配带参数的实际入口，再回退到同路径基础入口，避免多个入口同时高亮。 */
export const findConfigurationEntry = (groups: ConfigurationGroup[], currentPath: string): ConfigurationEntry | undefined => {
    const entries = groups.flatMap(group => group.items)
    const currentKey = configurationTargetKey(currentPath)
    return entries.find(entry => configurationTargetKey(entry.path) === currentKey)
        || entries.find(entry => configurationPath(entry.path) === configurationPath(currentPath) && !/[?#]/.test(entry.path))
        || entries.find(entry => configurationPath(entry.path) === configurationPath(currentPath))
}

export interface ConfigurationMenuEntry<T> { route: T; target: string; label: string }
export interface ConfigurationMenuGroup<T> { key: string; title: string; items: ConfigurationMenuEntry<T>[] }

/** 把官网子菜单原有授权节点按任务分组；仅改变展示，不新增路由、不修改菜单对象或查询参数。 */
export const buildConfigurationMenuGroups = <T extends RouteRecordRaw>(entries: { route: T; target: string }[]): ConfigurationMenuGroup<T>[] => {
    const groups: ConfigurationMenuGroup<T>[] = configurationTasks.map(group => ({ key: group.key, title: group.title, items: [] }))
    const other: ConfigurationMenuGroup<T> = { key: 'other', title: '其他', items: [] }
    for (const entry of entries) {
        if (entry.route.meta?.hidden || entry.route.meta?.type === 'A') continue
        const path = configurationPath(entry.target)
        const groupIndex = configurationTasks.findIndex(group => group.items.some(task => task.path.startsWith('/official_site/') && task.path === path))
        const task = groupIndex >= 0 ? configurationTasks[groupIndex].items.find(item => item.path === path) : undefined
        const hasChildren = entry.route.children?.some(child => !child.meta?.hidden && child.meta?.type !== 'A')
        // 带参数、自定义目录和外链保留原名；基础工具叶子才使用简短规范名称。
        const label = task && !hasChildren && !/[?#]/.test(entry.target) ? task.label : String(entry.route.meta?.title || '')
        const targetGroup = groupIndex >= 0 ? groups[groupIndex] : other
        targetGroup.items.push({ ...entry, label })
    }
    return [...groups, other].filter(group => group.items.length)
}
