<template>
    <div class="setting-drawer">
        <a-drawer
            v-model:visible="showSetting"
            placement="right"
            size="320px"
            title="界面设置"
            :footer="false"
        >
            <a-space direction="vertical" fill :size="18">
                <div class="setting-item">
                    <a-typography-text type="secondary">侧栏风格</a-typography-text>
                    <div class="setting-theme-list">
                        <div
                            class="setting-theme-item"
                            v-for="item in sideThemeList"
                            :key="item.type"
                            @click="sideTheme = item.type"
                        >
                            <img :src="item.image" width="72" height="48" />
                            <icon-check-circle-fill
                                v-if="sideTheme == item.type"
                                class="icon-select"
                            />
                        </div>
                    </div>
                </div>
                <div class="setting-row">
                    <a-typography-text type="secondary">主题色</a-typography-text>
                    <a-color-picker v-model="theme" :preset-colors="predefineColors" />
                </div>
                <div class="setting-row">
                    <a-typography-text type="secondary">开启多页签栏</a-typography-text>
                    <a-switch v-model="openMultipleTabs" />
                </div>
                <div class="setting-row">
                    <a-typography-text type="secondary">仅展开一个一级菜单</a-typography-text>
                    <a-switch v-model="isUniqueOpened" />
                </div>
                <div class="setting-row">
                    <a-typography-text type="secondary">菜单栏宽度</a-typography-text>
                    <a-input-number v-model="sideWidth" :min="180" :max="250" />
                </div>
                <div class="setting-row">
                    <a-typography-text type="secondary">显示面包屑</a-typography-text>
                    <a-switch v-model="showCrumb" />
                </div>
                <a-divider margin="0" />
                <div class="setting-actions">
                    <a-button @click="resetTheme" long>恢复默认主题</a-button>
                </div>
            </a-space>
        </a-drawer>
    </div>
</template>

<script setup lang="ts">
import { IconCheckCircleFill } from '@arco-design/web-vue/es/icon'
import useSettingStore from '@/stores/modules/setting'
import theme_light from '@/assets/images/theme_white.png'
import theme_dark from '@/assets/images/theme_black.png'

const settingStore = useSettingStore()
const predefineColors = ref(['#6C54FF', '#409EFF', '#28C76F', '#EA5455', '#FF9F43', '#01CFE8'])
const sideThemeList = [
    {
        type: 'dark',
        image: theme_dark
    },
    {
        type: 'light',
        image: theme_light
    }
]

const sideTheme = computed({
    get() {
        return settingStore.sideTheme
    },
    set(value) {
        settingStore.setSetting({
            key: 'sideTheme',
            value
        })
    }
})

const openMultipleTabs = computed({
    get() {
        return settingStore.openMultipleTabs
    },
    set(value) {
        settingStore.setSetting({
            key: 'openMultipleTabs',
            value
        })
    }
})

const isUniqueOpened = computed({
    get() {
        return settingStore.isUniqueOpened
    },
    set(value) {
        settingStore.setSetting({
            key: 'isUniqueOpened',
            value
        })
    }
})

const sideWidth = computed({
    get() {
        return settingStore.sideWidth
    },
    set(value) {
        settingStore.setSetting({
            key: 'sideWidth',
            value
        })
    }
})
const showSetting = computed({
    get() {
        return settingStore.showDrawer
    },
    set(value) {
        settingStore.setSetting({
            key: 'showDrawer',
            value
        })
    }
})
const theme = computed({
    get() {
        return settingStore.theme
    },
    set(value) {
        settingStore.setSetting({
            key: 'theme',
            value
        })
        applyTheme()
    }
})

const showCrumb = computed({
    get() {
        return settingStore.showCrumb
    },
    set(value) {
        settingStore.setSetting({
            key: 'showCrumb',
            value
        })
    }
})

/**
 * 函数说明：应用主题变量，固定使用浅色模式，避免出现无业务需求的暗黑模式入口。
 */
const applyTheme = () => {
    settingStore.setTheme(false)
}

/**
 * 函数说明：重置主题配置并应用默认主题变量。
 */
const resetTheme = () => {
    settingStore.resetTheme()
    applyTheme()
}
</script>

<style lang="scss" scoped>
.setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.setting-theme-list {
    margin-top: 10px;
    display: flex;
    gap: 12px;
}

.setting-theme-item {
    position: relative;
    cursor: pointer;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 10px;
    padding: 4px;
    transition: all 0.2s ease;
    &:hover {
        border-color: var(--color-primary-4, #b7a6ff);
    }
}

.setting-actions {
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-select {
    @apply absolute left-1/2 top-1/2;
    transform: translate(-50%, -50%);
}
</style>
