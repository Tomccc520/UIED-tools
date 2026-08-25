<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <a-menu
        class="w-[160px] min-h-[668px] pages-menu"
        mode="vertical"
        :selected-keys="[modelValue]"
        @menu-item-click="handleSelect"
    >
        <a-menu-item v-for="(item, key) in menus" :key="key">
            <span>{{ item.name }}</span>
        </a-menu-item>
    </a-menu>
</template>
<script lang="ts" setup>
import type { PropType } from 'vue'

defineProps({
    menus: {
        type: Object as PropType<Record<string, any>>,
        default: () => ({})
    },
    modelValue: {
        type: String,
        default: '1'
    }
})
const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void
}>()

/**
 * 函数说明：切换装修页面菜单
 */
const handleSelect = (index: string) => {
    emit('update:modelValue', index)
}
</script>

<style lang="scss" scoped>
.pages-menu {
    :deep(.arco-menu-item) {
        border-color: transparent;
        &.arco-menu-selected {
            border-right-width: 2px;
            border-color: var(--color-primary-6, #6c54ff);
            background-color: var(--color-primary-light-1, #eef0ff);
        }
    }
}
</style>
