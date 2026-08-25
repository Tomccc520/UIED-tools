<template>
    <a-breadcrumb class="app-breadcrumb">
        <a-breadcrumb-item>
            <icon-apps />
        </a-breadcrumb-item>
        <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
            {{ item.meta.title }}
        </a-breadcrumb-item>
    </a-breadcrumb>
</template>
<script setup lang="ts">
import { IconApps } from '@arco-design/web-vue/es/icon'
import { useWatchRoute } from '@/hooks/useWatchRoute'
import type { RouteLocationMatched, RouteLocationNormalizedLoaded } from 'vue-router'
const breadcrumbs = ref<RouteLocationMatched[]>([])

/**
 * 根据当前路由匹配链计算面包屑，仅展示包含标题的路由。
 */
const getBreadcrumb = (route: RouteLocationNormalizedLoaded) => {
    const matched = route.matched.filter((item) => item.meta && item.meta.title)
    breadcrumbs.value = matched
}

useWatchRoute((route) => {
    getBreadcrumb(route)
})
</script>

<style scoped lang="scss">
.app-breadcrumb {
    margin: 0;
    :deep(.arco-breadcrumb-item) {
        color: rgb(var(--gray-6));
        font-size: 12px;
        &:last-child {
            color: rgb(var(--gray-8));
            font-weight: 500;
        }
    }

    :deep(.arco-icon) {
        color: rgb(var(--gray-6));
        font-size: 14px;
    }
}
</style>
