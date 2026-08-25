<template>
    <template v-if="!route.meta?.hidden">
        <a-menu-item v-if="!hasShowChild" :key="routePath" @click="handleMenuClick">
            <template #icon>
                <icon class="menu-item-icon" :size="16" :name="menuIcon" />
            </template>
            <span>{{ routeMeta?.title }}</span>
        </a-menu-item>
        <a-sub-menu v-else :key="routePath">
            <template #title>
                <span>{{ routeMeta?.title }}</span>
            </template>
            <template #icon>
                <icon class="menu-item-icon" :size="16" :name="menuIcon" />
            </template>
            <menu-item
                v-for="item in route?.children"
                :key="resolvePath(item.path)"
                :route="item"
                :route-path="resolvePath(item.path)"
                :popper-class="popperClass"
            />
        </a-sub-menu>
    </template>
</template>

<script lang="ts" setup>
import { normalizeMenuIconName } from '@/components/icon'
import { getNormalPath, objectToQuery } from '@/utils/util'
import { isExternal } from '@/utils/validate'
import type { RouteRecordRaw } from 'vue-router'

interface Props {
    route: RouteRecordRaw
    routePath: string
    popperClass: string
}

const props = defineProps<Props>()
const router = useRouter()

const hasShowChild = computed(() => {
    const children: RouteRecordRaw[] = props.route.children ?? []
    return !!children.filter((item) => !item.meta?.hidden).length
})

const routeMeta = computed(() => {
    return props.route.meta
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
    if (isExternal(path)) {
        return path
    }
    const newPath = getNormalPath(`${props.routePath}/${path}`)
    return newPath
}
const queryStr = computed<string>(() => {
    const query = props.route.meta?.query as string
    try {
        const queryObj = JSON.parse(query)
        return objectToQuery(queryObj)
    } catch (error) {
        // console.log(error)

        return query
    }
})

const routeTo = computed(() => {
    const query = queryStr.value?.trim()
    if (!query) {
        return props.routePath
    }
    return `${props.routePath}${props.routePath.includes('?') ? '&' : '?'}${query}`
})

/**
 * 函数说明：点击菜单后执行路由跳转，兼容外链与内部页面。
 */
const handleMenuClick = () => {
    const target = routeTo.value
    if (isExternal(target)) {
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
