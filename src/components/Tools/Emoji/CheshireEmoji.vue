<!--
* @file CheshireEmoji.vue
* @description 随机柴郡表情包组件
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-1-22
*
* 功能特性：
* 1. 自动获取柴郡表情包
* 2. 一键下载功能
* 3. 优雅的动画效果
* 4. 响应式布局
*
* 主要组件：
* - 表情包展示区域
* - 操作按钮区域
* - 功能说明区域
* - 常见问题解答
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300 cursor-pointer"
                @click="getNewEmoji">随机柴郡表情包</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">每次刷新都能获取一张可爱的柴郡猫表情包</p>
        </div>

        <!-- 表情包展示区域 -->
        <div class="bg-gray-50 rounded-lg p-6 mb-6 relative flex justify-center items-center"
          style="min-height: 300px;">
          <div class="emoji-display w-full h-full relative" v-show="emojiUrl && !loading">
            <img :src="emojiUrl" alt="随机柴郡表情包" @load="handleImageLoad"
              class="w-auto h-auto max-w-full max-h-[300px] mx-auto rounded-lg shadow-md transition-all duration-500 ease-in-out hover:shadow-xl hover:scale-[1.02]" />
          </div>
          <div
            class="loading-placeholder absolute inset-0 flex justify-center items-center bg-gray-50 bg-opacity-90 backdrop-blur-sm transition-opacity duration-300"
            :class="{ 'opacity-100': loading, 'opacity-0 pointer-events-none': !loading }">
            <div class="text-center transform transition-transform duration-300" :class="{ 'scale-95': !loading }">
              <div class="loading-animation mb-4 relative">
                <div class="loading-spinner">
                  <div class="loading-circle"></div>
                  <div class="loading-circle"></div>
                  <div class="loading-circle"></div>
                </div>
              </div>
              <p class="text-gray-600 text-base font-medium animate-pulse">获取表情包中...</p>
            </div>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="flex justify-center gap-4">
          <button @click="getNewEmoji"
            class="inline-flex items-center px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-base transition-colors">
            <div ref="refreshContainer" class="w-6 h-6 mr-2"></div>
            换一张
          </button>
          <button @click="downloadEmoji"
            class="inline-flex items-center px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-base transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            下载表情
          </button>
        </div>

        <!-- 功能说明区域 -->
        <div class="mt-12 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">可爱表情</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                精选可爱的柴郡猫表情包，让聊天更有趣
              </p>
            </div>

            <div class="border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">一键下载</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持一键下载功能，方便保存喜欢的表情包
              </p>
            </div>

            <div class="border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">实时更新</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持实时更新，每次刷新都能获取新的表情包
              </p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">表情包来源是什么？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                所有表情包均来自精选的柴郡猫表情包资源，经过筛选和优化。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">更新频率如何？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持实时更新，您可以随时点击"换一张"按钮获取新的表情包。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">表情包质量如何？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                所有表情包都经过优化处理，确保清晰度和观感。
              </p>
            </div>
            <div class="pb-6 last:pb-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">温馨提示</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                本工具所有内容均来源于互联网，仅供个人聊天娱乐使用。如有侵权请联系我们删除。
              </p>
            </div>
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

<script setup lang="ts">
import { ref, onMounted } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

// 声明 lottie 类型，用于处理刷新按钮动画
declare const lottie: any

// 状态变量
const emojiUrl = ref('')
const loading = ref(false)
const route = useRoute()
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const refreshContainer = ref<HTMLElement | null>(null)
let refreshAnimation: any = null

// 刷新按钮动画数据
const refreshAnimationData = { "v": "5.6.5", "fr": 30, "ip": 0, "op": 60, "w": 32, "h": 32, "nm": "refresh-cw", "ddd": 0, "assets": [], "layers": [{ "ddd": 0, "ind": 1, "ty": 4, "nm": "refresh-cw", "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 1, "k": [{ "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 0, "s": [0] }, { "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 10, "s": [-20] }, { "i": { "x": [0.355], "y": [1] }, "o": { "x": [0.334], "y": [0] }, "t": 13, "s": [-20] }, { "t": 59, "s": [720] }], "ix": 10 }, "p": { "a": 0, "k": [16, 16, 0], "ix": 2 }, "a": { "a": 0, "k": [16, 16, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [-3.5, 3.5], [-0.4, 1.3]], "o": [[0, 0], [3.5, 3.5], [0.9, -0.9], [0, 0]], "v": [[-11, 2.1], [-6.4, 6.5], [6.3, 6.5], [8.4, 3.1]], "c": false }, "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 1, "ty": "sh", "ix": 2, "ks": { "a": 0, "k": { "i": [[0, 0], [-4.7, -1.6], [-1, -0.9], [0, 0]], "o": [[1.7, -4.7], [1.3, 0.4], [0, 0], [0, 0]], "v": [[-8.5, -2.9], [3, -8.4], [6.4, -6.3], [11, -1.9]], "c": false }, "ix": 2 }, "nm": "Path 2", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [1, 1, 1, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 2, "ix": 5 }, "lc": 2, "lj": 2, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [16, 15.9], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "arrow", "np": 4, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 60, "st": 0, "bm": 0 }], "markers": [] }

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

  // 获取第一张表情包
  getNewEmoji()
})

const showMessage = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 获取新表情包
const getNewEmoji = async () => {
  try {
    loading.value = true
    // 播放刷新动画
    if (refreshAnimation) {
      refreshAnimation.goToAndPlay(0, true)
    }

    // 清空当前表情包URL，触发加载状态
    emojiUrl.value = ''

    const response = await fetch('https://api.lolimi.cn/API/chaiq/c.php', {
      method: 'GET',
      headers: {
        'Accept': 'image/*'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const blob = await response.blob()
    emojiUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    showMessage(error instanceof Error ? error.message : '获取表情包失败，请稍后重试', 'error')
    console.error('获取表情包错误:', error)
  } finally {
    loading.value = false
  }
}

// 处理图片加载完成
const handleImageLoad = () => {
  loading.value = false
  // 停止刷新动画
  if (refreshAnimation) {
    refreshAnimation.goToAndStop(refreshAnimation.totalFrames - 1, true)
  }
}

// 下载表情包
const downloadEmoji = async () => {
  if (!emojiUrl.value) return

  try {
    const response = await fetch(emojiUrl.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = '柴郡表情_' + new Date().getTime() + '.jpg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    showMessage('下载成功', 'success')
  } catch (error) {
    showMessage('下载失败，请稍后重试', 'error')
    console.error('下载错误:', error)
  }
}
</script>

<style scoped>
@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.loading-ripple {
  animation: ripple 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* 新的加载动画效果 */
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-circle {
  width: 12px;
  height: 12px;
  background-color: #ef4444;
  border-radius: 50%;
  animation: bounce 0.8s infinite;
}

.loading-circle:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-circle:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

/* 优化现有动画 */
.loading-animation {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.loading-animation::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #ef4444;
  opacity: 0.3;
  animation: ripple 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes ripple {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* 图片淡入效果 */
.emoji-display {
  opacity: 0;
  animation: fadeIn 0.5s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 加载状态过渡效果 */
.loading-placeholder {
  transition: all 0.3s ease-in-out;
}

.loading-placeholder.opacity-0 {
  visibility: hidden;
}

.loading-placeholder.opacity-100 {
  visibility: visible;
}
</style>
