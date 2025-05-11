<!--
* @file DogDiary.vue
* @description 舔狗日记生成器
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2024-1-9
*
* 功能特性：
* 1. 自动获取舔狗日记
* 2. 一键复制功能
* 3. 优雅的动画效果
* 4. 响应式布局
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
                @click="getRandomDiary">舔狗日记</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">每次都能获取一篇舔狗日记</p>
        </div>

        <!-- 日记展示区域 -->
        <div class="bg-gray-50 rounded-lg p-6 mb-6" style="min-height: 300px;">
          <div class="text-center">
            <div class="diary-content text-lg leading-loose mt-8">
              <p class="mb-3 text-gray-700 transition-all duration-300">{{ displayText }}</p>
            </div>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="flex justify-center gap-4">
          <button @click="getRandomDiary"
            class="inline-flex items-center px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-base transition-colors">
            <div ref="refreshContainer" class="w-6 h-6 mr-2"></div>
            换一篇
          </button>
          <button @click="copyText"
            class="inline-flex items-center px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-base transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            复制文案
          </button>
        </div>

        <!-- 功能说明区域 -->
        <div class="mt-12 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">智能生成</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                智能算法生成，每次都能获取一篇有趣的舔狗日记
              </p>
            </div>

            <div class="border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">一键复制</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持一键复制功能，方便分享到各种社交平台
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
                支持实时更新，随时获取新的日记内容
              </p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">日记内容从哪里来？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                所有日记均来自网络精选，经过筛选和整理，确保内容的趣味性。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">更新频率如何？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持实时更新，您可以随时点击"换一篇"按钮获取新的日记内容。
              </p>
            </div>
            <div class="pb-6 last:pb-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">可以收藏喜欢的日记吗？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                目前支持复制功能，您可以将喜欢的日记复制保存。
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
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { copy } from '@/utils/copy'

declare const lottie: any

// 本地备用数据
const backupDiaries = [
  '今天你依旧没有回我消息，我发了32条消息给你，你终于回了我一个\'滚\'字，我开心极了，这是你回复我最长的一句话，我截图发给我妈看，她让我别做舔狗了。我说：妈，你不懂爱情。',
  '今天你说你想吃草莓，我立马买了一斤最贵的草莓送到你家楼下，你说你不在家，在和男朋友约会，让我把草莓送给门卫大爷。我知道你是在考验我，我毫不犹豫的把草莓送给了大爷。',
  '今天我还是照常给你发消息，汇报日常工作，我们之间的关系一直都是这样，你从不回我，我也不觉得尴尬，因为我知道你是在忙，每天晚上我都会看着你的头像，故事里的那一只可爱的猫咪，幻想着我们以后的生活。',
  '今天你把我删了，我看着红色感叹号陷入了久久的沉思，我想这其中一定有什么含义，红色代表热情，你一定是在向我表达你的爱意。',
  '今天你又跟别人约会了，没关系，我在你楼下等你，你一定是在考验我的忠心，我会一直等下去，在你的楼下，我给你的爱永远不变。'
]

const route = useRoute()

const displayText = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const refreshContainer = ref<HTMLElement | null>(null)
let refreshAnimation: any = null
let typingTimer: number | null = null

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
})

const showMessage = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 文字生成效果函数
const typeText = (text: string) => {
  if (typingTimer) {
    clearTimeout(typingTimer)
  }

  displayText.value = ''

  typingTimer = window.setTimeout(() => {
    displayText.value = text
  }, 300)
}

const getRandomDiary = async () => {
  try {
    // 播放刷新动画
    if (refreshAnimation) {
      refreshAnimation.goToAndPlay(0, true)
    }

    // 尝试从API获取数据
    try {
      const response = await fetch('https://api.pearktrue.cn/api/jdyl/tiangou.php')
      const data = await response.text()

      if (data && data.trim()) {
        typeText(data.trim())
        return
      }
    } catch (apiError) {
      console.warn('API请求失败，使用备用数据:', apiError)
    }

    // 如果API失败，使用本地备用数据
    const randomIndex = Math.floor(Math.random() * backupDiaries.length)
    const backupDiary = backupDiaries[randomIndex]
    typeText(backupDiary)

  } catch (error) {
    console.error('获取舔狗日记失败:', error)
    showMessage('获取舔狗日记失败，请稍后重试', 'error')
    displayText.value = ''
  }
}

const copyText = async () => {
  try {
    const success = await copy(displayText.value)
    if (success) {
      showMessage('复制成功', 'success')
    } else {
      showMessage('复制失败，请手动复制', 'error')
    }
  } catch (error) {
    console.error('复制失败:', error)
    showMessage('复制失败，请手动复制', 'error')
  }
}

// 初始化时生成一篇舔狗日记
getRandomDiary()
</script>

<style scoped>
.diary-content {
  font-family: "STKaiti", "KaiTi", serif;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.diary-content p {
  animation: fadeIn 0.5s ease-out forwards;
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
</style>
