<script setup lang="ts">
/**
 * @file Banner.vue
 * @description 广告横幅组件，用于展示广告内容
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-03-21
 */

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  getDefaultSitePublicConfig,
  getSitePublicConfig,
  SITE_CONFIG_REFRESH_STORAGE_KEY,
  type SiteBannerSlideItem
} from '@/services/siteConfig'
import { sanitizeAdvertisingHtml } from '@/utils/safeAdvertisingHtml'

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
let isLoadingSiteConfig = false

/**
 * 函数说明：把站点配置中的 Banner 项转换为组件可渲染结构并补齐 id
 */
const mapBannerList = (slides: SiteBannerSlideItem[]): BannerItem[] => {
  return slides.map((item, index) => ({
    id: index + 1,
    renderMode: item.renderMode,
    text: item.text,
    image: item.image,
    htmlCode: item.htmlCode,
    link: item.link,
    target: item.target,
    height: item.height
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
  if (isLoadingSiteConfig) return
  isLoadingSiteConfig = true
  try {
    const siteConfig = await getSitePublicConfig({ forceRefresh: true })
    bannerList.value = mapBannerList(siteConfig.bannerSlides)
  } finally {
    isLoadingSiteConfig = false
  }
}

/**
 * 函数说明：页面重新获得焦点时刷新广告配置，让后台刚发布的内容无需手动刷新即可生效。
 */
const handleWindowFocus = () => {
  void loadSiteConfig()
}

/**
 * 函数说明：标签页恢复可见时刷新广告配置，兼容从管理端切回前台的使用场景。
 */
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    void loadSiteConfig()
  }
}

/**
 * 函数说明：接收同源管理端发布通知并立即刷新顶部广告。
 */
const handleSiteConfigStorage = (event: StorageEvent) => {
  if (event.key === SITE_CONFIG_REFRESH_STORAGE_KEY) {
    void loadSiteConfig()
  }
}

const activeBanner = computed(() => bannerList.value[activeIndex.value] || bannerList.value[0] || null)

/**
 * 函数说明：根据当前广告的配置高度调整轮播容器。
 */
const getCarouselStyle = (): Record<string, string> => ({
  height: `${Math.min(600, Math.max(32, Number(activeBanner.value?.height) || 48))}px`
})

/**
 * 函数说明：净化 HTML 广告内容，防止后台配置携带可执行脚本。
 */
const getSafeHtmlCode = (item: BannerItem): string => sanitizeAdvertisingHtml(item.htmlCode)

/**
 * 函数说明：为新窗口广告链接补齐安全 rel 属性。
 */
const getLinkRel = (item: BannerItem): string | undefined =>
  item.target === '_blank' ? 'noopener noreferrer' : undefined

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
  window.addEventListener('focus', handleWindowFocus)
  window.addEventListener('storage', handleSiteConfigStorage)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  clearAutoPlayTimer()
  window.removeEventListener('focus', handleWindowFocus)
  window.removeEventListener('storage', handleSiteConfigStorage)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div class="uied-banner-carousel" :style="getCarouselStyle()">
    <div
      v-for="(item, index) in bannerList"
      :key="item.id"
      class="uied-banner-slide"
      :class="{ 'is-active': index === activeIndex }"
    >
      <div
        v-if="item.renderMode === 'html'"
        class="uied-banner-html"
        v-html="getSafeHtmlCode(item)"
      />
      <a
        v-else-if="item.link"
        class="uied-banner-image-link"
        :href="item.link"
        :target="item.target"
        :rel="getLinkRel(item)"
        :title="item.text"
      >
        <img :src="item.image" :alt="item.text || '广告图'" loading="lazy" decoding="async" />
      </a>
      <div v-else class="uied-banner-image-link" :title="item.text">
        <img :src="item.image" :alt="item.text || '广告图'" loading="lazy" decoding="async" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.uied-banner-carousel {
  width: 100%;
  overflow: hidden;
  position: relative;
  border-radius: 8px;
  transition: height 240ms ease;
}

.uied-banner-slide {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #f8fafc;
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

.uied-banner-html,
.uied-banner-image-link {
  display: block;
  width: 100%;
  height: 100%;
}

.uied-banner-html :deep(> *) {
  max-width: 100%;
}

.uied-banner-image-link img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
