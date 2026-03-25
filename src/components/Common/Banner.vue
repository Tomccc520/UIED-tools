<script setup lang="ts">
/**
 * @file Banner.vue
 * @description 广告横幅组件，用于展示广告内容
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-03-21
 */

import { onMounted, onUnmounted, ref, watch } from 'vue'
import { getDefaultSitePublicConfig, getSitePublicConfig, type SiteBannerSlideItem } from '@/services/siteConfig'

/**
 * 广告项数据类型
 */
interface BannerItem extends SiteBannerSlideItem {
  id: number
}

const slideDurationMs = 4000
const activeIndex = ref(0)
const bannerList = ref<BannerItem[]>([])
let autoPlayTimer: number | null = null

/**
 * 函数说明：把站点配置中的 Banner 项转换为组件可渲染结构并补齐 id
 */
const mapBannerList = (slides: SiteBannerSlideItem[]): BannerItem[] => {
  return slides.map((item, index) => ({
    id: index + 1,
    badge: item.badge,
    text: item.text,
    link: item.link,
    gradient: item.gradient
  }))
}

/**
 * 函数说明：清理轮播自动播放定时器，避免重复创建导致切换错乱
 */
const clearAutoPlayTimer = () => {
  if (autoPlayTimer) {
    window.clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

/**
 * 函数说明：根据当前 Banner 数量重建自动轮播定时器，仅多条数据时自动轮播
 */
const resetAutoPlayTimer = () => {
  clearAutoPlayTimer()
  if (bannerList.value.length <= 1) {
    activeIndex.value = 0
    return
  }
  autoPlayTimer = window.setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % bannerList.value.length
  }, slideDurationMs)
}

/**
 * 函数说明：初始化默认 Banner 配置，确保接口失败时仍可正常展示
 */
const initDefaultBannerList = () => {
  bannerList.value = mapBannerList(getDefaultSitePublicConfig().bannerSlides)
}

/**
 * 函数说明：读取后台 Banner 配置并替换本地展示列表
 */
const loadSiteConfig = async () => {
  const siteConfig = await getSitePublicConfig({ forceRefresh: true })
  bannerList.value = mapBannerList(siteConfig.bannerSlides)
}

/**
 * 获取广告项的行内样式
 * @param item 广告项
 * @returns 行内样式对象
 */
const getSlideStyle = (item: BannerItem) => {
  return { backgroundImage: item.gradient }
}

watch(
  () => bannerList.value.length,
  () => {
    if (activeIndex.value >= bannerList.value.length) {
      activeIndex.value = 0
    }
    resetAutoPlayTimer()
  }
)

onMounted(() => {
  initDefaultBannerList()
  resetAutoPlayTimer()
  void loadSiteConfig()
})

onUnmounted(() => {
  clearAutoPlayTimer()
})
</script>

<template>
  <div class="uied-banner-carousel">
    <a
      v-for="(item, index) in bannerList"
      :key="item.id"
      class="uied-banner-slide"
      :class="{ 'is-active': index === activeIndex }"
      :href="item.link"
      target="_blank"
      rel="noopener noreferrer"
      :style="getSlideStyle(item)"
    >
      <span class="uied-banner-content">
        <span class="uied-banner-badge">{{ item.badge }}</span>
        <span class="uied-banner-text">{{ item.text }}</span>
      </span>
    </a>
  </div>
</template>

<style scoped>
.uied-banner-carousel {
  width: 100%;
  height: 48px;
  overflow: hidden;
  position: relative;
  border-radius: 12px;
}

.uied-banner-slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background-size: cover;
  background-position: center;
  padding: 0 8px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 320ms ease;
  pointer-events: none;
}

.uied-banner-slide.is-active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.uied-banner-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 40px;
}

.uied-banner-badge {
  background: rgba(255, 255, 255, 0.5);
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 700;
  color: #1f2937;
}

.uied-banner-text {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
}
</style>
