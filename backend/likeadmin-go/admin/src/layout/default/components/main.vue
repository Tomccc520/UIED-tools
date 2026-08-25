<template>
    <main class="layout-main-wrap">
        <div class="layout-main-inner">
            <router-view v-slot="{ Component, route }">
                <template v-if="isRouteShow">
                    <keep-alive :include="includeList" :max="20">
                        <component
                            v-if="shouldKeepAlive(route, Component)"
                            :is="Component"
                            :key="route.fullPath"
                        />
                    </keep-alive>
                    <component
                        v-if="!shouldKeepAlive(route, Component)"
                        :is="Component"
                        :key="route.fullPath"
                    />
                </template>
            </router-view>
        </div>
    </main>
</template>

<script setup lang="ts">
import { MenuEnum } from '@/enums/appEnums'
import useAppStore from '@/stores/modules/app'
import useTabsStore from '@/stores/modules/multipleTabs'
import useSettingStore from '@/stores/modules/setting'
import { RouterView } from 'vue-router'
const appStore = useAppStore()
const tabsStore = useTabsStore()
const settingStore = useSettingStore()
const isRouteShow = computed(() => appStore.isRouteShow)
const includeList = computed(() => (settingStore.openMultipleTabs ? tabsStore.getCacheTabList : []))

/**
 * 函数说明：判断当前页面是否允许进入 keep-alive，目录节点与 RouterView 占位组件直接跳过缓存，避免 Vue Router 警告。
 */
const shouldKeepAlive = (route: any, component: any) => {
    const isRouterViewPlaceholder =
        component === RouterView || component?.name === 'RouterView' || component?.__name === 'RouterView'
    const hasNestedRouterView =
        Array.isArray(route?.matched) &&
        route.matched.some((item: any) => {
            const defaultComponent = item?.components?.default
            return (
                defaultComponent === RouterView ||
                defaultComponent?.name === 'RouterView' ||
                defaultComponent?.__name === 'RouterView'
            )
        })

    return (
        settingStore.openMultipleTabs &&
        route?.meta?.type === MenuEnum.MENU &&
        !isRouterViewPlaceholder &&
        !hasNestedRouterView
    )
}
</script>

<style scoped lang="scss">
.layout-main-wrap {
    min-height: 100%;
    height: auto;
    background: transparent;
}

.layout-main-inner {
    padding: 0;
    min-height: 100%;
}

@media (max-width: 900px) {
    .layout-main-inner {
        padding: 0;
    }
}
</style>
