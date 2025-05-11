<script setup lang="ts">
/**
 * @file RandomAvatar.vue
 * @description 随机头像生成工具，支持多种风格的头像生成
 *
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @copyright 2024-2025 All Rights Reserved.
 *
 * @author Tomda
 * @createDate 2025-01-12
 * @lastUpdate 2025-01-12
 * @version Beta 1.0.0
 *
 * 功能特性：
 * 1. 自动获取随机头像
 * 2. 一键下载功能
 * 3. 优雅的动画效果
 * 4. 响应式布局
 */

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { copy } from '@/utils/copy'

declare const lottie: any

const route = useRoute()
const avatarUrl = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const refreshContainer = ref<HTMLElement | null>(null)
let refreshAnimation: any = null
const loading = ref(false)
const avatarType = ref('normal')

const refreshAnimationData = { "v": "5.6.5", "fr": 30, "ip": 0, "op": 60, "w": 32, "h": 32, "nm": "refresh-cw", "ddd": 0, "assets": [], "layers": [{ "ddd": 0, "ind": 1, "ty": 4, "nm": "refresh-cw", "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 1, "k": [{ "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 0, "s": [0] }, { "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 10, "s": [-20] }, { "i": { "x": [0.355], "y": [1] }, "o": { "x": [0.334], "y": [0] }, "t": 13, "s": [-20] }, { "t": 59, "s": [720] }], "ix": 10 }, "p": { "a": 0, "k": [16, 16, 0], "ix": 2 }, "a": { "a": 0, "k": [16, 16, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [-3.5, 3.5], [-0.4, 1.3]], "o": [[0, 0], [3.5, 3.5], [0.9, -0.9], [0, 0]], "v": [[-11, 2.1], [-6.4, 6.5], [6.3, 6.5], [8.4, 3.1]], "c": false }, "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 1, "ty": "sh", "ix": 2, "ks": { "a": 0, "k": { "i": [[0, 0], [-4.7, -1.6], [-1, -0.9], [0, 0]], "o": [[1.7, -4.7], [1.3, 0.4], [0, 0], [0, 0]], "v": [[-8.5, -2.9], [3, -8.4], [6.4, -6.3], [11, -1.9]], "c": false }, "ix": 2 }, "nm": "Path 2", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 2, "ty": "sh", "ix": 3, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [0, 0]], "o": [[0, 0], [0, 0], [0, 0]], "v": [[-11, 8.1], [-11, 2.1], [-5, 2.1]], "c": false }, "ix": 2 }, "nm": "Path 3", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 3, "ty": "sh", "ix": 4, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [0, 0]], "o": [[0, 0], [0, 0], [0, 0]], "v": [[11, -7.9], [11, -1.9], [5, -1.9]], "c": false }, "ix": 2 }, "nm": "Path 4", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "mm", "mm": 1, "nm": "Merge Paths 1", "mn": "ADBE Vector Filter - Merge", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [1, 1, 1, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 2, "ix": 5 }, "lc": 2, "lj": 2, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [16, 15.9], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "arrow", "np": 6, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 60, "st": 0, "bm": 0 }], "markers": [] }

onMounted(() => {
  // 动态加载lottie-web
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js'
  script.onload = () => {
    // 初始化刷新动画
    if (refreshContainer.value) {
      refreshAnimation = lottie.loadAnimation({
        container: refreshContainer.value,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: refreshAnimationData
      })
    }
  }
  document.head.appendChild(script)
})

const showMessage = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

const getRandomAvatar = async () => {
  try {
    // 播放刷新动画
    if (refreshAnimation) {
      refreshAnimation.goToAndPlay(0, true)
    }
    loading.value = true

    // 根据选择的类型使用不同的 API
    const apiUrl = avatarType.value === 'normal'
      ? 'https://v2.api-m.com/api/head?return=302'
      : 'https://www.wudada.online/Api/SjTx'

    const response = await fetch(apiUrl)
    if (response.ok) {
      if (avatarType.value === 'normal') {
        avatarUrl.value = response.url
      } else {
        const data = await response.json()
        avatarUrl.value = data.imgurl || data.url || data.data
      }
      showMessage('获取成功', 'success')
    } else {
      showMessage('获取失败，请重试', 'error')
    }
  } catch (error) {
    console.error('获取头像失败:', error)
    showMessage('获取失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

const downloadAvatar = async () => {
  if (!avatarUrl.value) {
    showMessage('请先生成头像', 'error')
    return
  }

  try {
    const response = await fetch(avatarUrl.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `avatar-${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    showMessage('下载成功', 'success')
  } catch (error) {
    console.error('下载失败:', error)
    showMessage('下载失败，请重试', 'error')
  }
}

// 添加标题点击效果
const handleTitleClick = () => {
  // 触发一次随机生成
  getRandomAvatar()

  // 播放点击波纹动画
  const ripple = document.createElement('div')
  ripple.className = 'absolute bg-blue-500/20 rounded-full animate-ripple'
  ripple.style.width = '100px'
  ripple.style.height = '100px'
  ripple.style.left = '50%'
  ripple.style.top = '50%'
  ripple.style.transform = 'translate(-50%, -50%)'

  const title = document.querySelector('.group')
  if (title) {
    title.appendChild(ripple)
    setTimeout(() => ripple.remove(), 1000)
  }
}

// 初始化时生成一个头像
getRandomAvatar()
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300 cursor-pointer"
                @click="handleTitleClick">随机头像生成器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">每次都能获取一个独特的头像</p>

          <!-- 头像类型选择 -->
          <div class="flex justify-center gap-4 mt-4">
            <button @click="avatarType = 'normal'" class="px-4 py-2 rounded-lg text-sm transition-colors duration-300"
              :class="avatarType === 'normal' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
              随机头像
            </button>
            <button @click="avatarType = 'anime'" class="px-4 py-2 rounded-lg text-sm transition-colors duration-300"
              :class="avatarType === 'anime' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'">
              动漫头像
            </button>
          </div>
        </div>

        <!-- 头像预览区域 -->
        <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div class="flex justify-center items-center min-h-[300px]">
            <div class="avatar-preview" v-loading="loading">
              <img v-if="avatarUrl" :src="avatarUrl" alt="随机头像"
                class="avatar-image rounded-lg shadow-md transition-transform duration-300 hover:scale-105" />
              <div v-else class="w-48 h-48 rounded-lg bg-gray-50 flex items-center justify-center">
                <el-icon class="text-4xl text-gray-300">
                  <Picture />
                </el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <div class="flex justify-center gap-4">
            <button @click="getRandomAvatar"
              class="inline-flex items-center px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-base transition-colors duration-300">
              <div ref="refreshContainer" class="w-6 h-6 mr-2"></div>
              换一个
            </button>
            <button @click="downloadAvatar"
              class="inline-flex items-center px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-base transition-colors duration-300">
              <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              下载头像
            </button>
          </div>
        </div>
      </div>

      <!-- 工具推荐区域 -->
      <ToolsRecommend :currentPath="route.path" />

      <!-- 提示信息 -->
      <div v-if="showToast"
        class="fixed top-4 right-4 px-4 py-2 rounded-lg text-sm text-white shadow-lg transition-all duration-300"
        :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'">
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.avatar-preview {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

@keyframes ripple {
  from {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }

  to {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 1s ease-out forwards;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .avatar-preview {
    width: 150px;
    height: 150px;
  }
}
</style>
