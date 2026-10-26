<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <a-drawer
        v-if="isMobile"
        v-model:visible="showMenuDrawer"
        placement="left"
        :size="drawderSize"
        :title="''"
        :footer="false"
        :body-style="{ padding: 0 }"
    >
        <side />
    </a-drawer>
    <aside v-else class="sidebar h-full"><side /></aside>
</template>

<script setup lang="ts">
import Side from './side.vue'
import useAppStore from '@/stores/modules/app'
import useSettingStore from '@/stores/modules/setting'

const appStore = useAppStore()
const settingStore = useSettingStore()
const isMobile = computed(() => appStore.isMobile)
const showMenuDrawer = computed({
    get() {
        return !appStore.isCollapsed && isMobile.value
    },
    set(value) {
        appStore.toggleCollapsed(!value)
    }
})

const drawderSize = computed(() => {
    return `${settingStore.sideWidth + 1}px`
})
</script>
