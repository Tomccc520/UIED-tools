<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-25
 */
-->
<template>
    <a-layout class="layout" :class="{ mobile: appStore.isMobile }">
        <div class="layout-navbar" :style="{ height: headerHeight }">
            <layout-header />
        </div>

        <a-layout>
            <a-layout-sider
                class="layout-sider"
                :collapsed="isCollapsed"
                :width="sideWidth"
                :collapsed-width="collapsedWidth"
                :hide-trigger="true"
                :style="{ paddingTop: headerHeight }"
            >
                <div class="menu-wrapper">
                    <layout-sidebar />
                </div>
            </a-layout-sider>

            <a-layout class="layout-content" :style="layoutContentStyle">
                <a-layout-content>
                    <layout-main />
                </a-layout-content>
            </a-layout>
        </a-layout>
    </a-layout>
</template>

<script setup lang="ts">
import useAppStore from '@/stores/modules/app'
import useSettingStore from '@/stores/modules/setting'
import LayoutMain from './components/main.vue'
import LayoutSidebar from './components/sidebar/index.vue'
import LayoutHeader from './components/header/index.vue'

const appStore = useAppStore()
const settingStore = useSettingStore()
const navbarBaseHeight = 60
const tabBarHeight = 40

/**
 * 函数说明：根据是否启用多标签页计算顶部固定区总高度，避免标签栏遮挡主内容。
 */
const headerHeight = computed(() => {
    const extraHeight = settingStore.openMultipleTabs ? tabBarHeight : 0
    return `${navbarBaseHeight + extraHeight}px`
})

/**
 * 函数说明：同步侧栏折叠状态，保证布局壳与原有菜单交互一致。
 */
const isCollapsed = computed(() => (appStore.isMobile ? true : appStore.isCollapsed))

/**
 * 函数说明：读取后台配置的侧栏宽度，避免迁移 Arco Pro 壳后出现宽度突变。
 */
const sideWidth = computed(() => settingStore.sideWidth)

/**
 * 函数说明：统一折叠宽度，贴近 Arco Pro 的紧凑侧栏视觉。
 */
const collapsedWidth = computed(() => (appStore.isMobile ? 0 : 64))

/**
 * 函数说明：根据导航栏与侧边栏状态计算内容区内边距，按官方 Pro 骨架为内容区让位。
 */
const layoutContentStyle = computed(() => {
    const currentSideWidth = isCollapsed.value ? collapsedWidth.value : sideWidth.value
    if (appStore.isMobile) {
        return {
            '--layout-header-height': headerHeight.value,
            paddingTop: headerHeight.value,
            paddingLeft: '0px'
        }
    }
    return {
        '--layout-header-height': headerHeight.value,
        paddingTop: headerHeight.value,
        paddingLeft: `${currentSideWidth}px`
    }
})
</script>

<style lang="scss" scoped>
.layout {
    width: 100%;
    height: 100vh;
    min-height: 100vh;
    overflow: hidden;
    background: var(--color-fill-2, #f5f6fa);
}

.layout-navbar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
}

.layout-sider {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    height: 100%;
    background: var(--color-bg-2, #fff);
    transition: all 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);

    &::after {
        position: absolute;
        top: 0;
        right: -1px;
        display: block;
        width: 1px;
        height: 100%;
        background-color: var(--color-border, #e5e6eb);
        content: '';
    }
}

.menu-wrapper {
    height: 100%;
    overflow: auto;
    overflow-x: hidden;
}

.layout-content {
    box-sizing: border-box;
    min-height: 100vh;
    height: 100vh;
    overflow: hidden;
    background: var(--color-fill-2, #f5f6fa);
    transition: padding 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
}

:deep(.layout-content > .arco-layout-content) {
    min-height: calc(100vh - var(--layout-header-height));
    height: calc(100vh - var(--layout-header-height));
    overflow-y: auto;
    overflow-x: hidden;
}

@media (max-width: 900px) {
    .layout-navbar {
        width: 100%;
    }

    .layout-sider {
        top: 0 !important;
        left: 0 !important;
        height: 100% !important;
        &::after {
            display: none;
        }
    }

    .layout-content {
        padding-left: 0 !important;
    }
}
</style>
