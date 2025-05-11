<!--
* @file MomentsQuotes.vue
* @description 朋友圈一言生成器
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2024-1-9
*
* 功能特性：
* 1. 自动获取朋友圈文案
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
                @click="getRandomQuote">朋友圈一言</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">每次都能获取一条走心的朋友圈文案</p>
        </div>

        <!-- 文案展示区域 -->
        <div class="bg-gray-50 rounded-lg p-6 mb-6" style="min-height: 300px;">
          <div class="text-center">
            <p class="text-gray-700 leading-relaxed typing-text text-lg transition-all duration-300">{{ displayText }}
            </p>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="flex justify-center gap-4">
          <button @click="getRandomQuote"
            class="inline-flex items-center px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-base transition-colors">
            <div ref="refreshContainer" class="w-6 h-6 mr-2"></div>
            换一条
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
                智能算法生成，每次都能获取一条走心的朋友圈文案
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
                支持实时更新，随时获取新的朋友圈文案
              </p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">文案内容从哪里来？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                所有文案均来自网络精选，经过筛选和整理，确保内容的质量。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">更新频率如何？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持实时更新，您可以随时点击"换一条"按钮获取新的文案内容。
              </p>
            </div>
            <div class="pb-6 last:pb-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">可以收藏喜欢的文案吗？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                目前支持复制功能，您可以将喜欢的文案复制保存。
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
import { getHotTools, getNewTools, getUtilityTools, getRelatedTools } from '@/components/Tools/tools'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { copy } from '@/utils/copy'

declare const lottie: any

const route = useRoute()
const hotTools = getHotTools(8)
const newTools = getNewTools(8)
const utilityTools = getUtilityTools(8)
const relatedTools = getRelatedTools(route.path, 6, 2)

const currentQuote = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const refreshContainer = ref<HTMLElement | null>(null)
let refreshAnimation: any = null
let typingTimer: number | null = null
const displayText = ref('')

// 本地备用数据
const localMomentsQuotes = [
  "生活就像咖啡，喝起来苦涩，回味起来甘甜。",
  "有时候，简单的生活才是最奢侈的享受。",
  "愿你的生活，既有诗意也有远方。",
  "不是所有的坚持都有结果，但是所有的结果都需要坚持。",
  "生活不是选择题，而是一道必答题。",
  "时光不语，静待花开。",
  "愿你眼里有光，心中有爱，前方有路。",
  "岁月静好，现世安稳。",
  "愿你的世界里，永远充满阳光。",
  "生活不止眼前的苟且，还有诗和远方。",
  "愿你走出半生，归来仍是少年。",
  "不要因为天气晴朗就放弃带伞，不要因为有人爱你就放弃爱自己。",
  "愿你成为自己喜欢的样子，遇见想遇见的人。",
  "生活就像一杯白水，你想要什么味道的，就加什么料。",
  "愿你的生活，既有诗和远方，也有眼前的苟且。",
  "不要因为走得太远，而忘记为什么出发。",
  "愿你的快乐与岁月无关，愿你的纯真与经历无关。",
  "生活不是等待暴风雨过去，而是学会在雨中翩翩起舞。",
  "愿你的生活，既有温度也有光芒。",
  "不要因为天气晴朗就忘记带伞，不要因为生活美好就忘记坚强。",
  "愿你的心里装着温暖，眼里有光，手里有爱。",
  "生活就像一本书，翻开的每一页都是新的开始。",
  "愿你的生活，既有诗意也有烟火气。",
  "不要因为生活的压力而放弃对美好的向往。",
  "愿你的世界里，既有阳光也有雨露。",
  "生活不是选择题，而是一道填空题，需要你自己去填写。",
  "愿你的生活，既有诗和远方，也有眼前的茶米油盐。",
  "不要因为生活的琐碎而忘记了最初的梦想。",
  "愿你的心里有光，照亮自己也温暖他人。",
  "生活就像一杯茶，需要慢慢品味才能感受其中的韵味。",
  "愿你的生活，既有诗意也有生活气息。",
  "不要因为生活的忙碌而忘记了享受生活。",
  "愿你的世界里，既有诗和远方，也有柴米油盐。",
  "生活不是一场比赛，而是一次旅行，享受过程比结果更重要。",
  "愿你的生活，既有诗意也有烟火气息。",
  "不要因为生活的艰难而放弃对美好的追求。",
  "愿你的心里有阳光，照亮自己也温暖他人。",
  "生活就像一首诗，需要用心去感受才能体会其中的美。",
  "愿你的生活，既有诗和远方，也有眼前的烟火。",
  "不要因为生活的平淡而失去对美好的期待。",
  "愿你的世界里，既有诗意也有生活的气息。",
  "生活不是一场独角戏，而是一场合奏，需要与他人和谐共处。",
  "愿你的生活，既有诗意也有生活的味道。",
  "不要因为生活的压力而忘记了微笑。",
  "愿你的心里有光，照亮前方的路。",
  "生活就像一幅画，需要用心去描绘才能呈现美好。",
  "愿你的生活，既有诗和远方，也有眼前的温暖。",
  "不要因为生活的艰辛而失去对美好的向往。",
  "愿你的世界里，既有诗意也有生活的色彩。",
  "生活不是一场独奏，而是一场合唱，需要与他人共同谱写。",
  "愿你的生活，既有诗意也有生活的韵味。",
  "不要因为生活的忙碌而忘记了停下来欣赏风景。",
  "愿你的心里有光，照亮自己的路。",
  "生活就像一首歌，需要用心去聆听才能感受其中的美妙。",
  "愿你的生活，既有诗和远方，也有眼前的幸福。",
  "不要因为生活的平凡而失去对美好的追求。",
  "愿你的世界里，既有诗意也有生活的温度。",
  "生活不是一场独舞，而是一场群舞，需要与他人共同舞动。",
  "愿你的生活，既有诗意也有生活的滋味。",
  "不要因为生活的压力而失去对美好的期待。",
  "愿你的心里有光，照亮前行的路。",
  "生活就像一部电影，需要用心去体验才能感受其中的精彩。",
  "愿你的生活，既有诗和远方，也有眼前的欢乐。",
  "不要因为生活的艰难而失去对美好的向往。",
  "愿你的世界里，既有诗意也有生活的芬芳。",
  "生活不是一场独唱，而是一场合奏，需要与他人共同演绎。",
  "愿你的生活，既有诗意也有生活的情调。",
  "不要因为生活的忙碌而失去对美好的感知。",
  "愿你的心里有光，照亮人生的路。",
  "生活就像一本画册，需要用心去翻阅才能欣赏其中的美好。",
  "愿你的生活，既有诗和远方，也有眼前的甜蜜。",
  "不要因为生活的平淡而失去对美好的追求。",
  "愿你的世界里，既有诗意也有生活的馨香。",
  "生活不是一场独白，而是一场对话，需要与他人共同交流。",
  "愿你的生活，既有诗意也有生活的况味。",
  "不要因为生活的压力而失去对美好的憧憬。",
  "愿你的心里有光，照亮前方的道路。",
  "生活就像一幅水墨画，需要用心去描绘才能展现其中的韵味。",
  "愿你的生活，既有诗和远方，也有眼前的欢笑。",
  "不要因为生活的艰辛而失去对美好的期待。",
  "愿你的世界里，既有诗意也有生活的暖意。",
  "生活不是一场独角戏，而是一场群戏，需要与他人共同演绎。",
  "愿你的生活，既有诗意也有生活的意境。",
  "不要因为生活的忙碌而失去对美好的感悟。",
  "愿你的心里有光，照亮人生的道路。",
  "生活就像一首小诗，需要用心去吟诵才能体会其中的意境。",
  "愿你的生活，既有诗和远方，也有眼前的温馨。",
  "不要因为生活的平凡而失去对美好的向往。",
  "愿你的世界里，既有诗意也有生活的芳香。",
  "生活不是一场独奏，而是一场交响，需要与他人共同演奏。",
  "愿你的生活，既有诗意也有生活的况味。",
  "不要因为生活的压力而失去对美好的向往。",
  "愿你的心里有光，照亮前行的道路。",
  "生活就像一幅油画，需要用心去描绘才能呈现其中的色彩。",
  "愿你的生活，既有诗和远方，也有眼前的欢愉。",
  "不要因为生活的艰难而失去对美好的追求。",
  "愿你的世界里，既有诗意也有生活的芬芳。",
  "生活不是一场独舞，而是一场群舞，需要与他人共同起舞。",
  "愿你的生活，既有诗意也有生活的况味。",
  "不要因为生活的忙碌而失去对美好的感知。",
  "愿你的心里有光，照亮人生的道路。",
  "生活就像一首歌谣，需要用心去聆听才能感受其中的美好。",
  "愿你的生活，既有诗和远方，也有眼前的温暖。",
  "不要因为生活的平淡而失去对美好的期待。",
  "愿你的世界里，既有诗意也有生活的馨香。",
  "生活不是一场独白，而是一场对话，需要与他人共同交流。",
  "愿你的生活，既有诗意也有生活的况味。",
  "不要因为生活的压力而失去对美好的憧憬。",
  "愿你的心里有光，照亮前方的道路。"
]

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
  let index = 0
  displayText.value = ''

  // 清除之前的定时器
  if (typingTimer) {
    clearInterval(typingTimer)
  }

  typingTimer = window.setInterval(() => {
    if (index < text.length) {
      displayText.value += text[index]
      index++
    } else {
      if (typingTimer) {
        clearInterval(typingTimer)
      }
    }
  }, 50) // 每个字符的打印间隔
}

/**
 * 获取随机朋友圈文案
 * API: https://v.api.aa1.cn/api/pyq/index.php?aa1=json
 * 返回格式：{"pyq": "文案内容"}
 * 注意：API返回的内容中包含script标签，需要先清理后再解析JSON
 */
const getRandomQuote = async () => {
  try {
    // 播放刷新动画
    if (refreshAnimation) {
      refreshAnimation.goToAndPlay(0, true)
    }

    try {
      const response = await fetch('https://v.api.aa1.cn/api/pyq/index.php?aa1=json')
      const text = await response.text()
      const cleanText = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      const jsonStart = cleanText.indexOf('{')
      if (jsonStart === -1) {
        throw new Error('未找到有效的JSON数据')
      }
      const jsonStr = cleanText.slice(jsonStart)
      const data = JSON.parse(jsonStr)

      if (data && data.pyq && data.pyq.trim()) {
        currentQuote.value = data.pyq.trim()
        typeText(data.pyq.trim())
        return
      }
    } catch (error) {
      console.log('API请求失败,使用本地数据')
    }

    // 如果API失败,使用本地数据
    const randomIndex = Math.floor(Math.random() * localMomentsQuotes.length)
    const quote = localMomentsQuotes[randomIndex]
    currentQuote.value = quote
    // 触发文字生成效果
    typeText(quote)

  } catch (error) {
    console.error('获取文案失败:', error)
    showMessage('获取文案失败，请稍后重试', 'error')
  }
}
const copyText = async () => {
  try {
    const success = await copy(currentQuote.value)
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

// 初始化时生成一条文案
getRandomQuote()
</script>

<style scoped>
.typing-text {
  white-space: pre-wrap;
  word-break: break-word;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.typing-text::after {
  content: '|';
  animation: blink 1s infinite;
  margin-left: 2px;
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
