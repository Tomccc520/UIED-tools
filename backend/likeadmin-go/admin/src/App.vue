<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<script setup lang="ts">
import zhCn from '@arco-design/web-vue/es/locale/lang/zh-cn'
import useAppStore from './stores/modules/app'
import useSettingStore from './stores/modules/setting'

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

let viewportInitialized = false
/** 根据实际窗口同步桌面/抽屉布局；仅跨断点时重置折叠状态，普通缩放保留用户选择。 */
const syncLayoutViewport = () => {
    const isMobile = window.innerWidth <= mobileLayoutBreakpoint
    if (!viewportInitialized || appStore.isMobile !== isMobile) {
        appStore.setMobile(isMobile)
        appStore.toggleCollapsed(isMobile)
        viewportInitialized = true
    }
}
syncLayoutViewport()
onMounted(() => window.addEventListener('resize', syncLayoutViewport, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('resize', syncLayoutViewport))
</script>

<template>
    <a-config-provider :locale="arcoConfig.locale">
        <router-view />
    </a-config-provider>
</template>

<style></style>
