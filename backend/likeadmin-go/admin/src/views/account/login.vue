<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <div class="container">
        <div class="logo">
            <div
                class="logo-icon-shell"
                :class="{ 'logo-icon-shell--inline': brandLogoMode === 'inline-svg' }"
            >
                <div v-if="brandLogoMode === 'inline-svg'" class="logo-inline-svg" v-html="brandLogoSvg"></div>
                <img v-else class="logo-image" :src="brandLogoSrc" :alt="brandTitle" />
            </div>
            <div class="logo-copy">
                <div class="logo-text">{{ brandTitle }}</div>
                <div class="logo-sub-text">商业运营后台</div>
            </div>
        </div>

        <LoginBanner
            :brand-title="brandTitle"
            :fallback-image="bannerImage"
            :slides="bannerSlides"
            :metric-list="bannerMetricList"
        />

        <div class="content">
            <div class="content-inner">
                <LoginFormPanel :brand-title="brandTitle" />
            </div>
            <div class="footer">
                <div class="login-footer">
                    <a
                        class="login-footer__link"
                        href="https://fsuied.com"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        UIED技术团队
                    </a>
                    <span class="login-footer__divider">·</span>
                    <a
                        class="login-footer__link"
                        href="https://uiedtool.com"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {{ brandTitle }}
                    </a>
                    <span class="login-footer__divider">·</span>
                    <span class="login-footer__text">商业运营后台</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import useAppStore from '@/stores/modules/app'
import LoginBanner from './components/login-banner.vue'
import LoginFormPanel from './components/login-form-panel.vue'
import bannerImage from './images/login_bg.png'

const defaultBrandLogoSvg = `<svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>logo-3</title><defs><polygon id="path-9z3bcfbp2n-1" points="4.24080877e-17 0 51 0 51 49 4.24080877e-17 49"></polygon></defs><g id="page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="logo-3"><rect id="background-rect" x="0" y="0" width="204" height="96" rx="48"></rect><g id="logo-copy" transform="translate(19, 24)"><path d="M118,0 L115.645416,11.671646 L89.1332623,11.6686726 L87.7228145,17.840708 L112.989339,17.840708 C113.408529,18.1263717 113.114499,18.8863009 113.032836,19.3722478 C112.438806,22.9040708 111.360981,26.3980885 110.730064,29.9260885 L85.5115139,29.9743009 C84.8626866,30.1945487 84.4307036,35.0482832 83.8848614,35.8938053 L110.750533,35.8938053 L108.191898,48 L68,48 L78.1279318,0 L118,0 Z" class="svg-elem"></path><g id="group"><mask id="mask-9z3bcfbp2n-2" fill="white"><use xlink:href="#path-9z3bcfbp2n-1"></use></mask><g id="Clip-4"></g><path d="M44.5484942,30.672481 C43.6369216,34.1601855 42.3502837,37.0948777 40.1324788,39.9385435 C28.0481786,55.4312424 -2.16172007,50.8094556 0.122748964,27.9765993 L5.84733956,0 L18.8393787,0 L13.1475876,27.5812233 C12.2451734,40.7777001 30.3841898,38.4394988 31.9817846,27.4591408 L37.5819924,0 L51,0" class="svg-elem" mask="url(#mask-9z3bcfbp2n-2)"></path></g><path d="M120.705221,11.6887342 L123.39497,0 L145.56178,0.00424573989 C177.801018,2.69604483 171.345066,47.5474041 141.724125,48 L119,47.8847282 L129.665791,35.9981425 C135.974363,35.4867431 142.366969,37.0738007 147.947383,33.3899845 C154.358119,29.1580432 155.653618,18.4243882 148.929352,13.8476929 C147.754359,13.0480078 144.776461,11.6887342 143.420175,11.6887342 L120.705221,11.6887342 Z" class="svg-elem"></path><polygon points="70 0 59.7432432 48 47 48 56.9459459 0" class="svg-elem"></polygon><polygon points="133 18 130.359061 29.1389362 113 48 119.628981 18" class="svg-elem"></polygon></g></g></g></svg>`

const appStore = useAppStore()
const config = computed(() => appStore.config)

/**
 * 函数说明：规范化内联 SVG 字符串，兼容完整 SVG、仅 g 片段以及包含外层 HTML 的配置内容。
 */
const normalizeInlineSvgLogo = (logoValue: string): string => {
    const rawValue = String(logoValue || '').trim()
    if (!rawValue) {
        return ''
    }
    const svgMatched = rawValue.match(/<svg[\s\S]*<\/svg>/i)
    if (svgMatched?.[0]) {
        return svgMatched[0]
    }
    const groupMatched = rawValue.match(/<g[\s\S]*<\/g>/i)
    if (groupMatched?.[0]) {
        return `<svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${groupMatched[0]}</svg>`
    }
    return ''
}

const brandTitle = computed(() =>
    String(config.value?.toolsSidebarBrandText || config.value?.webName || 'UIED-Tools')
)
const brandLogoRaw = computed(() => String(config.value?.toolsSidebarBrandLogo || '').trim())
const brandLogoMode = computed<'image' | 'inline-svg'>(() => {
    if (!brandLogoRaw.value) {
        return 'inline-svg'
    }
    return normalizeInlineSvgLogo(brandLogoRaw.value) ? 'inline-svg' : 'image'
})
const brandLogoSvg = computed(() => {
    if (!brandLogoRaw.value) {
        return defaultBrandLogoSvg
    }
    return brandLogoMode.value === 'inline-svg' ? normalizeInlineSvgLogo(brandLogoRaw.value) : ''
})
const brandLogoSrc = computed(() => {
    return brandLogoMode.value === 'inline-svg' ? '' : brandLogoRaw.value
})
const bannerSlides = computed(() => [
    {
        kicker: '运营配置',
        slogan: '统一管理官网内容与运营入口',
        subSlogan: '头部、页脚、左侧菜单和热门工具统一从后台维护，减少前后端重复修改。',
        image: String(config.value?.webBackdrop || '').trim() || bannerImage
    },
    {
        kicker: '模型能力',
        slogan: 'AI Provider 与工具能力集中管理',
        subSlogan: '模型开关、默认提供商、工具能力映射统一沉淀到后台，前端只消费策略。',
        image: bannerImage
    },
    {
        kicker: '商业交付',
        slogan: '支付、授权、订单与交付闭环',
        subSlogan: '围绕用户、订单、授权和交付状态建立后台工作台，支撑商业售卖与售后处理。',
        image: bannerImage
    }
])
const bannerMetricList = computed(() => [
    { label: 'UI 库', value: 'Arco Pro' },
    { label: '后台能力', value: 'Go API' },
    { label: '当前版本', value: 'v3.0.1' }
])
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    min-height: 100vh;
    background: var(--color-fill-2, #f7f8fa);
}

.content {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    padding: 80px 56px 40px;
    overflow: hidden;
    background:
        radial-gradient(circle at top right, rgba(108, 84, 255, 0.08) 0, rgba(108, 84, 255, 0) 28%),
        linear-gradient(180deg, #ffffff 0%, #fafbff 100%);
}

.content-inner {
    position: relative;
    z-index: 1;
}

.footer {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 100%;
}

.login-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 16px 18px;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.login-footer__link {
    color: inherit;
    text-decoration: none;
}

.login-footer__link:hover {
    color: var(--color-primary-6, #6c54ff);
}

.login-footer__divider {
    color: var(--color-text-4, #c9cdd4);
}

.login-footer__text {
    color: inherit;
}

.logo {
    position: fixed;
    top: 24px;
    left: 22px;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    gap: 12px;
}

.logo-icon-shell {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg-1, #fff);
    border: 1px solid var(--color-border-2, #e5e6eb);
}

.logo-icon-shell--inline {
    width: 66px;
    height: 30px;
    border: 0;
    border-radius: 0;
    background: transparent;
}

.logo-inline-svg {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(svg) {
        width: 100%;
        height: 100%;
        display: block;
    }

    :deep(.svg-elem) {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        stroke-width: 1;
        fill: transparent;
        stroke: #fff;
        stroke-linejoin: round;
        stroke-linecap: round;
        animation: draw 2s linear forwards, fill-color 2s linear forwards;
    }

    :deep(#background-rect) {
        fill: #6c54ff;
    }
}

.logo-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.logo-copy {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.logo-text {
    color: rgba(255, 255, 255, 0.96);
    font-size: 18px;
    font-weight: 600;
    line-height: 24px;
}

.logo-sub-text {
    margin-top: 2px;
    color: rgba(255, 255, 255, 0.62);
    font-size: 12px;
    line-height: 18px;
}

@keyframes draw {
    from {
        stroke-dashoffset: 1000;
    }
    to {
        stroke-dashoffset: 0;
    }
}

@keyframes fill-color {
    0% {
        fill: transparent;
    }
    100% {
        fill: #fff;
    }
}

@media (max-width: 992px) {
    .content {
        padding: 96px 24px 56px;
    }

    .logo {
        left: 18px;
    }

    .logo-text {
        color: var(--color-text-1);
    }

    .logo-sub-text {
        color: var(--color-text-3);
    }
}
</style>
