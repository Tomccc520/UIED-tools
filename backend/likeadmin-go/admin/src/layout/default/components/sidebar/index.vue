<template>
    <aside class="sidebar h-full">
        <a-drawer
            v-model:visible="showMenuDrawer"
            placement="left"
            :size="drawderSize"
            :title="''"
            :footer="false"
        >
            <side />
        </a-drawer>
        <side v-show="!isMobile" />
    </aside>
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

<style lang="scss" scoped>
.sidebar {
    :deep(.arco-drawer-body) {
        padding: 0;
    }
}
</style>
