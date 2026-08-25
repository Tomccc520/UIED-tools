import { markRaw } from 'vue'
import { createRouter, createWebHistory, RouterView, type RouteRecordRaw } from 'vue-router'
import { MenuEnum } from '@/enums/appEnums'
import { isExternal } from '@/utils/validate'
import { constantRoutes, INDEX_ROUTE_NAME, LAYOUT } from './routes'
import { normalizeMenuIconName } from '@/components/icon'
import useUserStore from '@/stores/modules/user'

// 匹配views里面所有的.vue文件，动态引入
const modules = import.meta.glob('/src/views/**/*.vue')

//
export function getModulesKey() {
    return Object.keys(modules).map((item) => item.replace('/src/views/', '').replace('.vue', ''))
}

// 过滤路由所需要的数据
export function filterAsyncRoutes(routes: any[], firstRoute = true) {
    return routes.map((route) => {
        const routeRecord = createRouteRecord(route, firstRoute)
        if (route.children != null && route.children && route.children.length) {
            routeRecord.children = filterAsyncRoutes(route.children, false)
        }
        return routeRecord
    })
}

type RouteComponentType = NonNullable<RouteRecordRaw['component']>

/**
 * 函数说明：将路由组件标记为非响应式，避免组件对象被 Pinia/Reactive 代理导致控制台警告。
 */
const resolveRawRouteComponent = <T extends RouteComponentType>(component: T): T => {
    return markRaw(component as object) as T
}

// 创建一条路由记录
export function createRouteRecord(route: any, firstRoute: boolean): RouteRecordRaw {
    /**
     * 函数说明：目录/菜单缺失图标时统一回退到 Apps，确保侧栏可视化一致。
     */
    const iconName =
        route.menuType === MenuEnum.BUTTON ? '' : normalizeMenuIconName(route.menuIcon || 'Apps')
    //@ts-ignore
    const routeRecord: RouteRecordRaw = {
        path: isExternal(route.paths) ? route.paths : firstRoute ? `/${route.paths}` : route.paths,
        name: Symbol(route.paths),
        meta: {
            hidden: !route.isShow,
            keepAlive: !!route.isCache,
            title: route.menuName,
            perms: route.perms,
            query: route.params,
            icon: iconName,
            type: route.menuType,
            activeMenu: route.selected
        }
    }
    switch (route.menuType) {
        case MenuEnum.CATALOGUE:
            routeRecord.component = resolveRawRouteComponent(firstRoute ? LAYOUT : RouterView)
            if (!route.children) {
                routeRecord.component = resolveRawRouteComponent(RouterView)
            }
            break
        case MenuEnum.MENU:
            routeRecord.component = resolveRawRouteComponent(loadRouteView(route.component))
            break
    }
    return routeRecord
}

// 动态加载组件
export function loadRouteView(component: string) {
    try {
        const key = Object.keys(modules).find((key) => {
            return key.includes(`${component}.vue`)
        })
        if (key) {
            return resolveRawRouteComponent(modules[key] as RouteComponentType)
        }
        throw Error(`找不到组件${component}，请确保组件路径正确`)
    } catch (error) {
        console.error(error)
        return resolveRawRouteComponent(RouterView as RouteComponentType)
    }
}

// 找到第一个有效的路由
export function findFirstValidRoute(routes: RouteRecordRaw[]): string | undefined {
    for (const route of routes) {
        if (route.meta?.type == MenuEnum.MENU && !route.meta?.hidden && !isExternal(route.path)) {
            return route.name as string
        }
        if (route.children) {
            const name = findFirstValidRoute(route.children)
            if (name) {
                return name
            }
        }
    }
}
/**
 * 函数说明：通过权限标识查询已注册路由路径，统一使用全局 router 实例，避免在 setup 外误调 useRouter 导致控制台告警。
 */
export function getRoutePath(perms: string) {
    return router.getRoutes().find((item) => item.meta?.perms == perms)?.path || ''
}

// 重置路由
export function resetRouter() {
    router.removeRoute(INDEX_ROUTE_NAME)
    const { routes } = useUserStore()
    routes.forEach((route) => {
        const name = route.name
        if (name && router.hasRoute(name)) {
            router.removeRoute(name)
        }
    })
}

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: constantRoutes
})

export default router
