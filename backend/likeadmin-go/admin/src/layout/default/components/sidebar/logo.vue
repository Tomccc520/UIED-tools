<template>
    <div class="logo">
        <div
            class="logo-icon-shell"
            :class="{ 'logo-icon-shell--inline': brandLogoMode === 'inline-svg' }"
            :style="logoShellStyle"
        >
            <div
                v-if="brandLogoMode === 'inline-svg'"
                class="logo-inline-svg"
                v-html="brandLogoSvg"
            ></div>
            <image-contain v-else :width="props.szie" :height="props.szie" :src="brandLogoSrc" />
        </div>
        <transition name="title-width">
            <div
                v-show="props.showTitle"
                class="logo-title overflow-hidden whitespace-nowrap"
                :class="{ 'text-white': props.theme == ThemeEnum.DARK }"
                :style="{ left: `${titleOffset}px` }"
            >
                <overflow-tooltip
                    :content="props.title || brandTitle"
                    :teleported="true"
                    placement="bottom"
                    overflo-type="unset"
                >
                </overflow-tooltip>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import useAppStore from '@/stores/modules/app'
import { ThemeEnum } from '@/enums/appEnums'

const defaultBrandLogoSvg = `<svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>logo-3</title><defs><polygon id="path-9z3bcfbp2n-1" points="4.24080877e-17 0 51 0 51 49 4.24080877e-17 49"></polygon></defs><g id="page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="logo-3"><rect id="background-rect" x="0" y="0" width="204" height="96" rx="48"></rect><g id="logo-copy" transform="translate(19, 24)"><path d="M118,0 L115.645416,11.671646 L89.1332623,11.6686726 L87.7228145,17.840708 L112.989339,17.840708 C113.408529,18.1263717 113.114499,18.8863009 113.032836,19.3722478 C112.438806,22.9040708 111.360981,26.3980885 110.730064,29.9260885 L85.5115139,29.9743009 C84.8626866,30.1945487 84.4307036,35.0482832 83.8848614,35.8938053 L110.750533,35.8938053 L108.191898,48 L68,48 L78.1279318,0 L118,0 Z" class="svg-elem"></path><g id="group"><mask id="mask-9z3bcfbp2n-2" fill="white"><use xlink:href="#path-9z3bcfbp2n-1"></use></mask><g id="Clip-4"></g><path d="M44.5484942,30.672481 C43.6369216,34.1601855 42.3502837,37.0948777 40.1324788,39.9385435 C28.0481786,55.4312424 -2.16172007,50.8094556 0.122748964,27.9765993 L5.84733956,0 L18.8393787,0 L13.1475876,27.5812233 C12.2451734,40.7777001 30.3841898,38.4394988 31.9817846,27.4591408 L37.5819924,0 L51,0" class="svg-elem" mask="url(#mask-9z3bcfbp2n-2)"></path></g><path d="M120.705221,11.6887342 L123.39497,0 L145.56178,0.00424573989 C177.801018,2.69604483 171.345066,47.5474041 141.724125,48 L119,47.8847282 L129.665791,35.9981425 C135.974363,35.4867431 142.366969,37.0738007 147.947383,33.3899845 C154.358119,29.1580432 155.653618,18.4243882 148.929352,13.8476929 C147.754359,13.0480078 144.776461,11.6887342 143.420175,11.6887342 L120.705221,11.6887342 Z" class="svg-elem"></path><polygon points="70 0 59.7432432 48 47 48 56.9459459 0" class="svg-elem"></polygon><polygon points="133 18 130.359061 29.1389362 113 48 119.628981 18" class="svg-elem"></polygon></g></g></g></svg>`

/**
 * 函数说明：规范化内联 SVG 字符串，兼容完整 <svg>、仅 <g> 片段，以及包含外层 div 的整段 HTML。
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

const props = defineProps({
    szie: { type: Number, default: 34 },
    title: { type: String },
    theme: { type: String },
    showTitle: { type: Boolean, default: true }
})

const appStore = useAppStore()
const config = computed(() => appStore.config)

/**
 * 函数说明：根据 Logo 渲染模式输出容器尺寸，内联 SVG 使用横向尺寸避免品牌图形被压缩变形。
 */
const logoShellStyle = computed(() => {
    if (brandLogoMode.value === 'inline-svg') {
        return {
            width: '66px',
            height: '30px'
        }
    }
    return {
        width: `${props.szie}px`,
        height: `${props.szie}px`
    }
})

/**
 * 函数说明：根据 Logo 实际宽度计算标题偏移，保证侧栏收起/展开时文案不重叠。
 */
const titleOffset = computed(() => {
    return brandLogoMode.value === 'inline-svg' ? 82 : props.szie + 16
})

/**
 * 函数说明：统一输出侧边栏品牌文案，优先使用运营配置，未配置时回退站点名称。
 */
const brandTitle = computed(() =>
    String(config.value?.toolsSidebarBrandText || config.value?.webName || 'UIED-Tools')
)

/**
 * 函数说明：统一输出侧边栏品牌 Logo，优先使用运营配置，未配置时回退站点 Logo。
 */
const brandLogoRaw = computed(() => String(config.value?.toolsSidebarBrandLogo || '').trim())

/**
 * 函数说明：识别品牌 Logo 渲染模式，支持图片地址与内联 SVG 两种形态。
 */
const brandLogoMode = computed<'image' | 'inline-svg'>(() => {
    if (!brandLogoRaw.value) {
        return 'inline-svg'
    }
    return normalizeInlineSvgLogo(brandLogoRaw.value) ? 'inline-svg' : 'image'
})

/**
 * 函数说明：输出内联 SVG 字符串，仅在 SVG 模式下渲染。
 */
const brandLogoSvg = computed(() => {
    if (!brandLogoRaw.value) {
        return defaultBrandLogoSvg
    }
    return brandLogoMode.value === 'inline-svg' ? normalizeInlineSvgLogo(brandLogoRaw.value) : ''
})

/**
 * 函数说明：输出图片 Logo 地址，空值时回退默认占位图避免图标缺失。
 */
const brandLogoSrc = computed(() => {
    if (brandLogoMode.value === 'inline-svg') {
        return ''
    }
    return brandLogoRaw.value
})
</script>
<style lang="scss" scoped>
.logo {
    height: var(--navbar-height);
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    position: relative;
    border-bottom: 1px solid var(--color-border-2, #e5e6eb);

    .logo-icon-shell {
        flex-shrink: 0;
        border-radius: 8px;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--color-fill-2, #f2f3f5);
    }

    .logo-icon-shell--inline {
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

    .logo-title {
        width: 70%;
        position: absolute;
        font-size: 17px;
        font-weight: 600;
        line-height: 1.3;
        color: var(--color-text-1, #1d2129);
    }

    .title-width-enter-active {
        opacity: 0;
        transition: all 0.3s ease-out;
    }

    .title-width-leave-active {
        transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
    }

    .title-width-enter-from,
    .title-width-leave-to {
        width: 0;
        opacity: 0;
    }
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
</style>
