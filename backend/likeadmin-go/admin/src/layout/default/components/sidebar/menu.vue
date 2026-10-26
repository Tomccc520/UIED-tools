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
        <button
            type="button"
            class="menu-search"
            :class="{ 'menu-search--collapsed': isCollapsed }"
            aria-label="查找后台功能"
            title="查找后台功能（⌘ / Ctrl + K）"
            data-admin-navigation="search"
            @click="openNavigationSearch"
        >
            <icon-search :size="16" />
            <span v-if="!isCollapsed">查找功能</span>
            <kbd v-if="!isCollapsed">{{ searchHotkey }}</kbd>
        </button>
        <a-scrollbar class="menu-scroll">
            <a-menu
                :collapsed="isCollapsed"
                mode="vertical"
                :selected-keys="selectedKeys"
                :open-keys="openGroupKeys"
                @update:open-keys="updateOpenGroups"
                :accordion="uniqueOpened"
                :theme="menuTheme"
                :auto-open="false"
                :auto-open-selected="false"
                :level-indent="24"
                @menu-item-click="$emit('select')"
            >
                <template v-for="group in navigationGroups" :key="group.key">
                    <template v-if="group.key === 'daily'">
                        <div v-if="!isCollapsed" class="menu-group-title" aria-hidden="true">{{ group.title }}</div>
                        <menu-item v-for="item in group.items" :key="item.path" :item="item" />
                    </template>
                    <a-sub-menu v-else :key="`admin-group:${group.key}`">
                        <template #icon><icon :name="group.icon" :size="16" /></template>
                        <template #title>{{ group.title }}</template>
                        <menu-item v-for="item in group.items" :key="item.path" :item="item" />
                    </a-sub-menu>
                </template>
            </a-menu>
        </a-scrollbar>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import MenuItem from './menu-item.vue'
import type { RouteRecordRaw } from 'vue-router'
import { IconSearch } from '@arco-design/web-vue/es/icon'
import { groupAdminNavigation, findActiveAdminNavigation, adminNavigationKey } from '@/utils/admin-navigation'

const props = defineProps({
    routes: {
        type: Array as PropType<RouteRecordRaw[]>,
        default: () => []
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

const emit = defineEmits(['select'])

const route = useRoute()

/**
 * 函数说明：当前选中菜单，Arco Menu 需要数组格式。
 */
const activeItem = computed(() => findActiveAdminNavigation(navigationGroups.value.flatMap(group => group.items), route.fullPath, String(route.meta?.activeMenu || '')))
const selectedKeys = computed<string[]>(() => activeItem.value ? [adminNavigationKey(activeItem.value.path)] : [])

const themeClass = computed(() => `theme-${props.theme}`)
const menuTheme = computed<'dark' | 'light'>(() => (props.theme === 'dark' ? 'dark' : 'light'))
const navigationGroups = computed(() => groupAdminNavigation(props.routes))
const openGroupKeys = ref<string[]>([])
const activeGroupKey = computed(() => navigationGroups.value.find(group => group.items.includes(activeItem.value!))?.key)

/** 当前页面所在分组随导航展开；普通浏览不打开其他低频设置，保留用户的手动展开。 */
watch([activeGroupKey, () => props.isCollapsed, () => route.fullPath], ([key, collapsed]) => {
    if (!key || key === 'daily' || collapsed) return
    const groupKey = `admin-group:${key}`
    openGroupKeys.value = props.uniqueOpened ? [groupKey] : [...new Set([...openGroupKeys.value, groupKey])]
}, { immediate: true })

/** 接受 Arco 的展开操作，关闭或打开分组不会改变页面和用户持久偏好。 */
const updateOpenGroups = (keys: string[]) => {
    openGroupKeys.value = keys
}

const searchHotkey = /mac/i.test(navigator.platform) ? '⌘ K' : 'Ctrl K'

/** 复用顶栏功能搜索，手机抽屉和折叠侧栏使用同一个入口与权限范围。 */
const openNavigationSearch = () => {
    window.dispatchEvent(new Event('uied:admin-navigation-search'))
    emit('select')
}
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

.menu-search {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    margin: 12px 12px 4px;
    padding: 0 9px;
    border: 1px solid var(--color-border-2);
    border-radius: 6px;
    background: var(--color-fill-1);
    color: var(--color-text-2);
    cursor: pointer;
    font: inherit;
    font-size: 12px;

    kbd {
        margin-left: auto;
        color: var(--color-text-3);
        font-family: inherit;
        font-size: 11px;
    }

    &:hover {
        border-color: rgb(var(--primary-6));
        color: rgb(var(--primary-6));
    }

    &:focus-visible {
        outline: 2px solid rgb(var(--primary-6));
        outline-offset: 2px;
    }
}

.menu-search--collapsed {
    justify-content: center;
    margin: 12px 8px 4px;
    padding: 0;
}

.menu-group-title {
    padding: 12px 8px 4px;
    color: var(--color-text-3);
    font-size: 11px;
    line-height: 24px;
}

.theme-dark .menu-search {
    background: transparent;
    color: rgba(255, 255, 255, 0.8);
    border-color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 900px) {
    .menu-search {
        min-height: 44px;
    }
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
    transition: color 160ms ease, background-color 160ms ease;
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
