<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-25
 */
-->
<template>
    <div class="menu" :class="themeClass" :style="isCollapsed ? '' : `--aside-width: ${width}px`">
        <a-scrollbar class="menu-scroll">
            <a-menu
                :collapsed="isCollapsed"
                mode="vertical"
                :selected-keys="selectedKeys"
                :accordion="uniqueOpened"
                :theme="menuTheme"
                :auto-open="false"
                auto-open-selected
                :level-indent="34"
                @menu-item-click="$emit('select')"
            >
                <menu-item
                    v-for="route in routes"
                    :key="route.path"
                    :route="route"
                    :route-path="route.path"
                    :popper-class="themeClass"
                />
            </a-menu>
        </a-scrollbar>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import MenuItem from './menu-item.vue'
import type { RouteRecordRaw } from 'vue-router'

const props = defineProps({
    routes: {
        type: Object as PropType<RouteRecordRaw[]>
    },
    config: {
        type: Object
    },
    isCollapsed: {
        type: Boolean,
        default: false
    },
    uniqueOpened: {
        type: Boolean,
        default: false
    },
    theme: {
        type: String
    },
    width: {
        type: Number,
        default: 200
    }
})

defineEmits(['select'])

const route = useRoute()

/**
 * 函数说明：当前选中菜单，Arco Menu 需要数组格式。
 */
const selectedKeys = computed<string[]>(() => [String(route.meta?.activeMenu || route.path)])

const themeClass = computed(() => `theme-${props.theme}`)
const menuTheme = computed<'dark' | 'light'>(() => (props.theme === 'dark' ? 'dark' : 'light'))
</script>

<style lang="scss" scoped>
.menu {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;
}

.menu-scroll {
    flex: 1;
    min-height: 0;
}

:deep(.arco-menu) {
    width: 100%;
    height: 100%;
    border-right: none;
    background: transparent;
}

:deep(.arco-menu-inner) {
    padding: 8px;
}

:deep(.arco-menu-item),
:deep(.arco-menu-inline-header) {
    min-height: 40px;
    line-height: 40px;
    border-radius: 8px;
    transition: all 0.2s ease;
}

:deep(.arco-menu-item .arco-menu-icon),
:deep(.arco-menu-inline-header .arco-menu-icon) {
    font-size: 18px;
    color: inherit;
    transition: color 0.2s ease;
}

.theme-light {
    :deep(.arco-menu-item:hover),
    :deep(.arco-menu-inline-header:hover) {
        color: var(--color-primary-6, #6c54ff);
        background: var(--color-primary-light-1, #f2edff);
    }

    :deep(.arco-menu-item.arco-menu-selected) {
        color: var(--color-primary-6, #6c54ff);
        background: var(--color-primary-light-1, #f2edff);
    }

    :deep(.arco-menu-inline-header.arco-menu-selected),
    :deep(.arco-menu-inline-header.arco-menu-open) {
        color: var(--color-primary-6, #6c54ff);
    }

    :deep(.arco-menu-pop-header),
    :deep(.arco-menu-inline-header.arco-menu-selected),
    :deep(.arco-menu-inline-header.arco-menu-open) {
        background: var(--color-primary-light-1, #f2edff);
        border-radius: 8px;
    }
}

.theme-dark {
    :deep(.arco-menu-item:hover),
    :deep(.arco-menu-inline-header:hover) {
        color: #fff;
        background: rgba(255, 255, 255, 0.14);
    }

    :deep(.arco-menu-item:hover .arco-menu-icon),
    :deep(.arco-menu-inline-header:hover .arco-menu-icon) {
        color: #fff;
    }

    :deep(.arco-menu-item.arco-menu-selected),
    :deep(.arco-menu-inline-header.arco-menu-selected),
    :deep(.arco-menu-inline-header.arco-menu-open) {
        color: #fff;
        background: rgba(255, 255, 255, 0.2);
    }
}
</style>
