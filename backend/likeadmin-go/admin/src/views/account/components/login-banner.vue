<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <div class="banner">
        <div class="banner-inner">
            <a-carousel class="carousel" animation-name="fade" indicator-type="line">
                <a-carousel-item v-for="item in slides" :key="item.slogan">
                    <div class="carousel-item">
                        <div class="carousel-copy">
                            <div class="carousel-kicker">{{ item.kicker }}</div>
                            <div class="carousel-title">{{ item.slogan }}</div>
                            <div class="carousel-sub-title">{{ item.subSlogan }}</div>
                            <div class="carousel-tag-row">
                                <a-tag
                                    v-for="metric in metricList"
                                    :key="metric.label"
                                    size="small"
                                    bordered
                                    color="arcoblue"
                                >
                                    {{ metric.value }}
                                </a-tag>
                            </div>
                        </div>
                        <div class="preview-card">
                            <div class="preview-card__head">
                                <div class="preview-card__brand">{{ brandTitle }}</div>
                                <a-tag size="small" bordered color="arcoblue">运营后台</a-tag>
                            </div>
                            <div class="preview-card__title">{{ item.kicker }}</div>
                            <div class="preview-card__desc">{{ item.slogan }}</div>
                            <div class="preview-card__list">
                                <div class="preview-card__item">
                                    <span>官网配置</span>
                                    <strong>菜单 / 头部 / 页脚 / SEO</strong>
                                </div>
                                <div class="preview-card__item">
                                    <span>AI能力</span>
                                    <strong>Provider / 模型 / 工具能力</strong>
                                </div>
                                <div class="preview-card__item">
                                    <span>可选能力</span>
                                    <strong>会员 / 订单 / 支付</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </a-carousel-item>
            </a-carousel>
            <div class="banner-foot">
                <div class="banner-foot-title">{{ brandTitle }}</div>
                <div class="banner-foot-desc">官网配置、AI 模型与运营能力在同一后台内收口。</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

interface BannerSlideItem {
    kicker: string
    slogan: string
    subSlogan: string
    image?: string
}

interface BannerMetricItem {
    label: string
    value: string
}

defineProps({
    brandTitle: {
        type: String,
        default: 'UIED-Tools'
    },
    fallbackImage: {
        type: String,
        default: ''
    },
    slides: {
        type: Array as PropType<BannerSlideItem[]>,
        default: () => []
    },
    metricList: {
        type: Array as PropType<BannerMetricItem[]>,
        default: () => []
    }
})
</script>

<style lang="scss" scoped>
.banner {
    width: 548px;
    min-width: 548px;
    height: 100vh;
    padding: 20px;
    background: linear-gradient(180deg, #101827 0%, #182338 100%);
}

.banner-inner {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.carousel {
    flex: 1;
    min-height: 0;
    height: 100%;
}

.carousel-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 0 52px;
    text-align: center;
}

.carousel-copy {
    max-width: 420px;
}

.carousel-kicker {
    color: rgba(255, 255, 255, 0.72);
    font-size: 13px;
    line-height: 20px;
    letter-spacing: 0.08em;
}

.carousel-title {
    margin-top: 12px;
    color: #fff;
    font-weight: 500;
    font-size: 28px;
    line-height: 1.3;
}

.carousel-sub-title {
    margin-top: 10px;
    color: rgba(255, 255, 255, 0.72);
    font-size: 14px;
    line-height: 24px;
}

.carousel-tag-row {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 18px;
}

.preview-card {
    width: min(360px, 100%);
    margin-top: 28px;
    padding: 18px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%);
    text-align: left;
    box-shadow: 0 18px 48px rgba(10, 18, 36, 0.22);
}

.preview-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.preview-card__brand {
    font-size: 13px;
    line-height: 20px;
    font-weight: 700;
    color: #fff;
}

.preview-card__title {
    margin-top: 18px;
    font-size: 12px;
    line-height: 18px;
    color: rgba(255, 255, 255, 0.6);
}

.preview-card__desc {
    margin-top: 6px;
    font-size: 18px;
    line-height: 1.45;
    font-weight: 600;
    color: #fff;
}

.preview-card__list {
    margin-top: 18px;
    display: grid;
    gap: 10px;
}

.preview-card__item {
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.preview-card__item span {
    display: block;
    font-size: 12px;
    line-height: 18px;
    color: rgba(255, 255, 255, 0.58);
}

.preview-card__item strong {
    display: block;
    margin-top: 2px;
    font-size: 13px;
    line-height: 20px;
    color: #fff;
}

.banner-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 20px 32px 0;
    margin-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.banner-foot-title {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
}

.banner-foot-desc {
    color: rgba(255, 255, 255, 0.62);
    font-size: 13px;
    line-height: 20px;
    text-align: right;
}

:deep(.arco-carousel-arrow) {
    display: none;
}

:deep(.arco-carousel-indicator-wrapper) {
    bottom: 18px;
}

:deep(.arco-carousel-indicator-item) {
    background: rgba(255, 255, 255, 0.28);
}

@media (max-width: 1280px) {
    .banner {
        width: 420px;
        min-width: 420px;
    }

    .carousel-title {
        font-size: 24px;
    }

    .carousel-item {
        padding: 0 32px;
    }
}

@media (max-width: 992px) {
    .banner {
        display: none;
    }
}
</style>
