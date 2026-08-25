<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<script setup lang="ts">
import { useWindowSize, useThrottleFn } from '@vueuse/core'
import zhCn from '@arco-design/web-vue/es/locale/lang/zh-cn'
import useAppStore from './stores/modules/app'
import useSettingStore from './stores/modules/setting'
import { ScreenEnum } from './enums/appEnums'

const appStore = useAppStore()
const settingStore = useSettingStore()
const arcoConfig = {
    locale: zhCn
}
const mobileLayoutBreakpoint = 900

/**
 * 函数说明：初始化主题与站点图标，后台固定使用浅色主题风格。
 */
onMounted(async () => {
    settingStore.setTheme(false)
    try {
        const data: any = await appStore.getConfig()
        let favicon: HTMLLinkElement = document.querySelector('link[rel="icon"]')!
        if (favicon) {
            favicon.href = data.webFavicon
            return
        }
        favicon = document.createElement('link')
        favicon.rel = 'icon'
        favicon.href = data.webFavicon
        document.head.appendChild(favicon)
    } catch {
        /**
         * 函数说明：后端不可达时保留默认 favicon，避免 mounted 阶段抛出未捕获异常影响登录页渲染。
         */
        return
    }
})

const { width } = useWindowSize()
watch(
    width,
    useThrottleFn((value) => {
        const isMobileLayout = value <= mobileLayoutBreakpoint
        if (!isMobileLayout) {
            appStore.setMobile(false)
            appStore.toggleCollapsed(false)
        } else {
            appStore.setMobile(true)
            appStore.toggleCollapsed(true)
        }
        if (value < ScreenEnum.MD) {
            appStore.toggleCollapsed(true)
        }
    }),
    {
        immediate: true
    }
)
</script>

<template>
    <a-config-provider :locale="arcoConfig.locale">
        <router-view />
    </a-config-provider>
</template>

<style></style>
