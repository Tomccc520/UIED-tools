<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <a-menu-item :key="menuKey" :title="menuTitle" @click="handleMenuClick">
        <template #icon><icon :size="16" :name="menuIcon" /></template>
        <span :title="menuTitle">{{ menuTitle }}</span>
    </a-menu-item>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { normalizeMenuIconName } from '@/components/icon'
import { adminNavigationKey, adminNavigationTitle, isAdminNavigationExternal, type AdminNavigationItem } from '@/utils/admin-navigation'

const props = defineProps<{ item: AdminNavigationItem }>()
const router = useRouter()
const menuKey = computed(() => adminNavigationKey(props.item.path))
const menuTitle = computed(() => adminNavigationTitle(props.item.path, props.item.title))
const menuIcon = computed(() => normalizeMenuIconName(props.item.icon || '') || 'system-icon-Apps')

/** 点击已经授权的原始地址，保留查询参数、锚点和安全外链行为。 */
const handleMenuClick = () => {
    if (isAdminNavigationExternal(props.item.path)) {
        window.open(props.item.path, '_blank', 'noopener,noreferrer')
        return
    }
    void router.push(props.item.path)
}
</script>
