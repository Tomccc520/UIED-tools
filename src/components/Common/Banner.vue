<script setup lang="ts">
/**
 * @file Banner.vue
 * @description 广告横幅组件，用于展示广告内容
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-03-21
 */

import { ref } from 'vue'

/**
 * 广告项数据类型
 */
interface BannerItem {
  id: number
  link: string
  gradient: string
  text: string
  badge: string
}

/**
 * 横幅广告数据
 */
const bannerList = ref<BannerItem[]>([
  {
    id: 1,
    link: 'https://fsuied.com',
    gradient: 'linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)',
    badge: '推荐',
    text: '一人企业Vibe Coding社区！'
  },
  {
    id: 2,
    link: 'https://nf.video/mbx1u6/?gid=18',
    gradient: 'linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)',
    badge: '热门',
    text: 'GPT-5.4重回巅峰 智能对话'
  },
  {
    id: 3,
    link: 'https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied',
    gradient: 'linear-gradient(to right,#a855f7,#f3e8ff,#f5f3ff,#c084fc)',
    badge: '新品',
    text: '免费AI编程工具 Trae - 智能编码助手'
  },
  {
    id: 4,
    link: 'https://yuanbao.paluai.com/uied',
    gradient: 'linear-gradient(to right,#ffc800,#ffed99,#fff8cc,#ffaa00)',
    badge: '新品',
    text: '腾讯元宝 智能对话新体验'
  },
  {
    id: 5,
    link: 'https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047',
    gradient: 'linear-gradient(to right,#10b981,#d1fae5,#ecfdf5,#34d399)',
    badge: '高效',
    text: '免费AI生成PPT - 一键生成演示文稿'
  },
  {
    id: 6,
    link: 'https://universalbus.cn/?s=lPLG02aydo',
    gradient: 'linear-gradient(to right,#f97316,#ffedd5,#fff7ed,#fb923c)',
    badge: '特惠',
    text: 'Adobe 正版全家桶可用AI'
  },
  {
    id: 7,
    link: 'https://universalbus.cn/?s=lPLG02aydo',
    gradient: 'linear-gradient(to right,#0ea5e9,#e0f2fe,#f0f9ff,#38bdf8)',
    badge: '新品',
    text: 'Gemini3 可用 nanobanana'
  }
])

/**
 * 获取广告项的行内样式
 * @param item 广告项
 * @returns 行内样式对象
 */
const getSlideStyle = (item: BannerItem) => {
  return { backgroundImage: item.gradient }
}
</script>

<template>
  <div class="uied-banner-carousel">
    <a
      v-for="item in bannerList"
      :key="item.id"
      class="uied-banner-slide"
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
  animation: banner 28s infinite;
}

.uied-banner-slide:nth-child(1) { animation-delay: 0s; }
.uied-banner-slide:nth-child(2) { animation-delay: 4s; }
.uied-banner-slide:nth-child(3) { animation-delay: 8s; }
.uied-banner-slide:nth-child(4) { animation-delay: 12s; }
.uied-banner-slide:nth-child(5) { animation-delay: 16s; }
.uied-banner-slide:nth-child(6) { animation-delay: 20s; }
.uied-banner-slide:nth-child(7) { animation-delay: 24s; }

@keyframes banner {
  0% {
    opacity: 0;
    visibility: hidden;
  }

  3% {
    opacity: 1;
    visibility: visible;
  }

  20% {
    opacity: 1;
    visibility: visible;
  }

  23% {
    opacity: 0;
    visibility: hidden;
  }

  100% {
    opacity: 0;
    visibility: hidden;
  }
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
