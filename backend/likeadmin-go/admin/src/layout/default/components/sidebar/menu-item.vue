<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
-->
<template>
    <template v-if="!route.meta?.hidden && route.meta?.type !== 'A'">
        <a-menu-item
            v-if="!hasShowChild"
            :key="routePath"
            :title="menuTitle"
            @click="handleMenuClick"
        >
            <template #icon>
                <icon class="menu-item-icon" :size="16" :name="menuIcon" />
            </template>
            <span :title="menuTitle">{{ menuTitle }}</span>
        </a-menu-item>
        <a-sub-menu v-else :key="routePath">
            <template #title>
                <span :title="menuTitle">{{ menuTitle }}</span>
            </template>
            <template #icon>
                <icon class="menu-item-icon" :size="16" :name="menuIcon" />
            </template>
            <template v-if="configurationMenuGroups.length">
                <a-menu-item-group v-for="group in configurationMenuGroups" :key="`configuration-${group.key}`" :title="group.title">
                    <menu-item v-for="(item, index) in group.items" :key="`${index}:${item.target}`" :route="item.route" :route-path="resolvePath(item.route.path)" :display-title="item.label" :popper-class="popperClass" />
                </a-menu-item-group>
            </template>
            <template v-else>
                <menu-item
                    v-for="item in route?.children"
                    :key="resolvePath(item.path)"
                    :route="item"
                    :route-path="resolvePath(item.path)"
                    :popper-class="popperClass"
                />
            </template>
        </a-sub-menu>
    </template>
</template>

<script lang="ts" setup>
import { normalizeMenuIconName } from '@/components/icon'
import {
    isAdminNavigationExternal,
    resolveAdminNavigationPath,
    resolveAdminNavigationTarget
} from '@/utils/admin-navigation'
import type { RouteRecordRaw } from 'vue-router'
import { buildConfigurationMenuGroups, configurationPath, configurationTitle } from '@/utils/site-configuration'

interface Props {
    route: RouteRecordRaw
    routePath: string
    popperClass: string
    displayTitle?: string
}

const props = defineProps<Props>()
const router = useRouter()

const hasShowChild = computed(() => {
    const children: RouteRecordRaw[] = props.route.children ?? []
    return !!children.filter((item) => !item.meta?.hidden && item.meta?.type !== 'A').length
})

const routeMeta = computed(() => {
    return props.route.meta
})
/** 规范名称只影响菜单展示，服务端标题、路由元数据和权限保持原值。 */
const menuTitle = computed(() => props.displayTitle ?? configurationTitle(
    resolveAdminNavigationTarget(props.routePath, routeMeta.value?.query), routeMeta.value?.title, hasShowChild.value
))
/** 官网目录内直接展示任务分组标题，不再增加可点击的任务目录层。 */
const configurationMenuGroups = computed(() => {
    if (configurationPath(props.routePath) !== '/official_site' || isAdminNavigationExternal(props.routePath)) return []
    return buildConfigurationMenuGroups((props.route.children || []).map(route => ({
        route,
        target: resolveAdminNavigationTarget(resolvePath(route.path), route.meta?.query)
    })))
})
/**
 * 函数说明：统一菜单图标字段并做历史前缀兼容，避免迁移后菜单图标丢失。
 */
const menuIcon = computed(() => {
    const normalizedIconName = normalizeMenuIconName(String(routeMeta.value?.icon || ''))
    return normalizedIconName || 'system-icon-Apps'
})

/**
 * 解析子路由路径，兼容外链地址与多级目录拼接。
 */
const resolvePath = (path: string) => {
    return resolveAdminNavigationPath(props.routePath, path)
}
const routeTo = computed(() =>
    resolveAdminNavigationTarget(props.routePath, props.route.meta?.query)
)

/**
 * 函数说明：点击菜单后执行路由跳转，兼容外链与内部页面。
 */
const handleMenuClick = () => {
    const target = routeTo.value
    if (isAdminNavigationExternal(target)) {
        window.open(target, '_blank', 'noopener,noreferrer')
        return
    }
    router.push(target)
}
</script>
<style lang="scss" scoped>
:deep(.arco-menu-item),
:deep(.arco-menu-inline-header),
:deep(.arco-menu-pop-header) {
    .menu-item-icon {
        color: inherit;
        margin-right: 8px;
        width: 16px;
        text-align: center;
        vertical-align: middle;
    }
}
</style>
