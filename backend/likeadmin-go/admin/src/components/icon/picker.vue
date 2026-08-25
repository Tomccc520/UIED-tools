<template>
    <div class="icon-select">
        <a-popover
            trigger="click"
            v-model:popup-visible="state.popoverVisible"
            :content-style="popoverContentStyle"
        >
            <template #content>
                <div class="icon-picker-panel">
                    <div class="panel-header">
                        <span class="panel-title">请选择图标</span>
                        <a-space>
                            <a-link
                                href="https://arco.design/iconbox/libs"
                                target="_blank"
                                class="text-xs"
                            >
                                Arco图标库
                            </a-link>
                            <a-button
                                v-if="state.activeTabKey === 'recent' && state.recentIcons.length"
                                size="mini"
                                type="text"
                                @click="handleClearRecentIcons"
                            >
                                清空最近
                            </a-button>
                        </a-space>
                    </div>

                    <a-input-search
                        v-model="state.searchKeyword"
                        placeholder="搜索图标（支持名称片段）"
                        allow-clear
                        class="mb-3"
                    />

                    <a-radio-group
                        v-model="state.activeTabKey"
                        type="button"
                        size="small"
                        class="tab-group"
                    >
                        <a-radio v-for="item in tabOptions" :key="item.value" :value="item.value">
                            {{ item.label }}
                        </a-radio>
                    </a-radio-group>

                    <a-scrollbar class="icon-scroll">
                        <div v-if="filteredIconList.length > 0" class="icon-grid">
                            <a-tooltip
                                v-for="item in filteredIconList"
                                :key="item"
                                :content="item"
                                position="top"
                            >
                                <a-button
                                    class="icon-btn"
                                    :type="isSelectedIcon(item) ? 'primary' : 'outline'"
                                    @click="handleSelect(item)"
                                >
                                    <icon :name="item" :size="18" />
                                </a-button>
                            </a-tooltip>
                        </div>
                        <a-empty v-else description="暂无匹配图标" />
                    </a-scrollbar>

                    <div class="panel-footer">
                        <div class="selected-value">
                            <icon v-if="selectedIconName" :name="selectedIconName" :size="16" />
                            <span class="selected-text">{{
                                selectedIconName || '未选择图标'
                            }}</span>
                        </div>
                        <a-space>
                            <a-button
                                size="mini"
                                :disabled="!selectedIconName"
                                @click="handleCopySelectedIconName"
                            >
                                复制名称
                            </a-button>
                            <a-button
                                size="mini"
                                :disabled="!selectedIconName"
                                @click="handleClear"
                            >
                                清空
                            </a-button>
                        </a-space>
                    </div>
                </div>
            </template>

            <template #default>
                <a-input
                    ref="inputRef"
                    :model-value="props.modelValue"
                    placeholder="请选择图标"
                    readonly
                    :disabled="props.disabled"
                    @click="openPopover"
                >
                    <template #prepend>
                        <div v-if="props.modelValue" class="trigger-icon-preview">
                            <a-tooltip :content="props.modelValue" position="top">
                                <icon :name="props.modelValue" :size="16" />
                            </a-tooltip>
                        </div>
                        <template v-else>无</template>
                    </template>
                    <template #append>
                        <a-button
                            :disabled="props.disabled || !props.modelValue"
                            @click.stop="handleClear"
                        >
                            <icon-close :size="16" />
                        </a-button>
                    </template>
                </a-input>
            </template>
        </a-popover>
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, shallowRef, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconClose } from '@arco-design/web-vue/es/icon'
import { getLocalIconNames, getSystemIconNames } from './index'

interface Props {
    modelValue: string
    disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    disabled: false
})

const emits = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'change', value: string): void
}>()

type IconTabKey = 'common' | 'system' | 'local' | 'recent'

const RECENT_ICONS_STORAGE_KEY = 'uied_admin_recent_icons'
const MAX_RECENT_ICONS = 16
const COMMON_SYSTEM_ICON_CANDIDATES = [
    'system-icon-Apps',
    'system-icon-Settings',
    'system-icon-Dashboard',
    'system-icon-File',
    'system-icon-Tag',
    'system-icon-Tool',
    'system-icon-Image',
    'system-icon-Calendar',
    'system-icon-Notification',
    'system-icon-User',
    'system-icon-Message',
    'system-icon-Home'
]

const inputRef = shallowRef<{
    $el?: HTMLElement
}>()

const state = reactive({
    popoverVisible: false,
    popoverWidth: 340,
    activeTabKey: 'common' as IconTabKey,
    searchKeyword: '',
    recentIcons: [] as string[]
})

const systemIcons = computed<string[]>(() => getSystemIconNames())
const localIcons = computed<string[]>(() => getLocalIconNames())
const selectedIconName = computed<string>(() => String(props.modelValue || '').trim())

const commonIcons = computed<string[]>(() => {
    const availableSystemIcons = new Set(systemIcons.value)
    return COMMON_SYSTEM_ICON_CANDIDATES.filter((item) => availableSystemIcons.has(item))
})

const tabOptions = computed(() => [
    {
        label: `常用(${commonIcons.value.length})`,
        value: 'common'
    },
    {
        label: `Arco图标(${systemIcons.value.length})`,
        value: 'system'
    },
    {
        label: `本地图标(${localIcons.value.length})`,
        value: 'local'
    },
    {
        label: `最近使用(${state.recentIcons.length})`,
        value: 'recent'
    }
])

const popoverContentStyle = computed(() => ({
    width: `${state.popoverWidth}px`,
    padding: '12px'
}))

/**
 * 函数说明：读取本地最近使用图标列表，兼容解析失败场景。
 */
const readRecentIconsFromStorage = (): string[] => {
    try {
        const rawValue = localStorage.getItem(RECENT_ICONS_STORAGE_KEY)
        if (!rawValue) {
            return []
        }
        const parsedValue = JSON.parse(rawValue)
        if (!Array.isArray(parsedValue)) {
            return []
        }
        return parsedValue
            .map((item) => String(item || '').trim())
            .filter(Boolean)
            .slice(0, MAX_RECENT_ICONS)
    } catch (error) {
        return []
    }
}

/**
 * 函数说明：把最近使用图标列表持久化到本地存储。
 */
const persistRecentIcons = () => {
    localStorage.setItem(RECENT_ICONS_STORAGE_KEY, JSON.stringify(state.recentIcons))
}

/**
 * 函数说明：将图标写入最近使用列表，按“最新在前、去重”维护顺序。
 */
const addRecentIcon = (iconName: string, shouldPersist = true) => {
    const normalizedIconName = String(iconName || '').trim()
    if (!normalizedIconName) {
        return
    }
    state.recentIcons = [
        normalizedIconName,
        ...state.recentIcons.filter((item) => item !== normalizedIconName)
    ].slice(0, MAX_RECENT_ICONS)
    if (shouldPersist) {
        persistRecentIcons()
    }
}

/**
 * 函数说明：返回当前标签页原始图标集合。
 */
const rawIconList = computed<string[]>(() => {
    if (state.activeTabKey === 'system') {
        return systemIcons.value
    }
    if (state.activeTabKey === 'local') {
        return localIcons.value
    }
    if (state.activeTabKey === 'recent') {
        return state.recentIcons
    }
    return commonIcons.value
})

/**
 * 函数说明：按关键词过滤图标集合，支持大小写不敏感匹配。
 */
const filteredIconList = computed<string[]>(() => {
    const keyword = state.searchKeyword.trim().toLowerCase()
    if (!keyword) {
        return rawIconList.value
    }
    return rawIconList.value.filter((item) => item.toLowerCase().includes(keyword))
})

/**
 * 函数说明：判断图标是否为当前选中值，用于按钮高亮态。
 */
const isSelectedIcon = (iconName: string): boolean => {
    return selectedIconName.value === iconName
}

/**
 * 函数说明：打开图标选择弹层，并同步输入框宽度到弹层宽度。
 */
const openPopover = () => {
    if (props.disabled) {
        return
    }
    state.popoverVisible = true
    nextTick(() => {
        const inputWidth = inputRef.value?.$el?.offsetWidth ?? 340
        state.popoverWidth = inputWidth < 340 ? 340 : inputWidth
    })
}

/**
 * 函数说明：选中图标并回写到父组件，同时更新最近使用记录。
 */
const handleSelect = (iconName: string) => {
    emits('update:modelValue', iconName)
    emits('change', iconName)
    addRecentIcon(iconName)
    state.popoverVisible = false
}

/**
 * 函数说明：清空当前已选图标并关闭弹层。
 */
const handleClear = () => {
    emits('update:modelValue', '')
    emits('change', '')
    state.popoverVisible = false
}

/**
 * 函数说明：清空最近使用图标列表，方便运营重置选择历史。
 */
const handleClearRecentIcons = () => {
    state.recentIcons = []
    persistRecentIcons()
    Message.success('已清空最近使用图标')
}

/**
 * 函数说明：复制当前选中图标名称，便于在菜单配置中手动粘贴。
 */
const handleCopySelectedIconName = async () => {
    if (!selectedIconName.value) {
        return
    }
    try {
        await navigator.clipboard.writeText(selectedIconName.value)
        Message.success('图标名称已复制')
    } catch (error) {
        Message.error('复制失败，请手动复制')
    }
}

watch(
    () => props.modelValue,
    (value) => {
        if (!value) {
            return
        }
        addRecentIcon(String(value), false)
    },
    { immediate: true }
)

watch(
    () => state.activeTabKey,
    () => {
        state.searchKeyword = ''
    }
)

onMounted(() => {
    state.recentIcons = readRecentIconsFromStorage()
    if (selectedIconName.value) {
        addRecentIcon(selectedIconName.value, false)
    }
})
</script>

<style lang="scss" scoped>
.icon-picker-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.panel-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1, #1d2129);
}

.tab-group {
    width: 100%;
    :deep(.arco-radio-group-button) {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

.icon-scroll {
    height: 300px;
}

.icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
    gap: 8px;
}

.icon-btn {
    width: 44px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
}

.panel-footer {
    border-top: 1px solid var(--color-border-1, #f2f3f5);
    padding-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.selected-value {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.selected-text {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.trigger-icon-preview {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
</style>
