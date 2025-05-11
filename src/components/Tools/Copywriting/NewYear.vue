<!--
* @file NewYear.vue
* @description 新年朋友圈文案生成器
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-1-9
*
* 功能特性：
* 1. 使用 DeepSeek AI 生成新年文案
* 2. 一键复制功能
* 3. 历史记录保存
* 4. 优雅的动画效果
* 5. 响应式布局
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-6 md:mb-8 relative">
          <h2 class="text-3xl md:text-4xl font-bold mb-2 md:mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-6 md:px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">新年朋友圈文案</span>
            </div>
          </h2>
          <p class="text-gray-500 text-xs md:text-sm mt-4 md:mt-6">使用 DeepSeek AI 生成走心的新年朋友圈文案</p>
        </div>

        <!-- AI 生成区域 -->
        <div class="mb-4 md:mb-6">
          <div class="flex flex-col md:flex-row items-center gap-3 md:gap-4">
            <input v-model="prompt"
              class="w-full md:flex-1 p-2.5 md:p-3 text-sm md:text-base border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
              placeholder="输入关键词或主题,让 AI 为你生成更个性化的新年祝福(选填)" @keyup.enter="generateText" />
            <button @click="generateText"
              class="w-full md:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center">
              <div ref="refreshContainer" class="w-5 md:w-6 h-5 md:h-6 mr-2"></div>
              生成文案
            </button>
          </div>
        </div>

        <!-- 文案展示区域 -->
        <div class="bg-gray-50 rounded-lg p-4 md:p-6 mb-4 md:mb-6 relative min-h-[180px] md:min-h-[200px]">
          <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/80">
            <div class="flex flex-col items-center">
              <div
                class="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-4 border-red-500 border-t-transparent mb-2 md:mb-3">
              </div>
              <p class="text-xs md:text-sm text-gray-600">{{ loadingText }}</p>
            </div>
          </div>
          <div v-else class="text-center">
            <p
              class="text-gray-700 leading-relaxed typing-text text-base md:text-lg transition-all duration-300 mb-3 md:mb-4">
              {{ displayText }}
            </p>
            <div class="flex justify-center gap-3 md:gap-4 mt-3 md:mt-4">
              <button @click="() => copyText()"
                class="inline-flex items-center px-4 md:px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs md:text-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                复制文案
              </button>
            </div>
          </div>
        </div>

        <!-- 历史记录区域 -->
        <div class="mt-6 md:mt-8">
          <h3 class="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4">历史记录</h3>
          <div class="space-y-3 md:space-y-4">
            <div v-for="(item, index) in history" :key="index"
              class="bg-gray-50 rounded-lg p-3 md:p-4 hover:bg-gray-100 transition-colors group">
              <p class="text-gray-700 text-xs md:text-sm mb-2">{{ item.text }}</p>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span class="text-[10px] md:text-xs">{{ formatDate(item.timestamp) }}</span>
                <div
                  class="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button @click="() => copyText(item.text)"
                    class="text-gray-600 hover:text-gray-900 transition-colors text-[10px] md:text-xs">
                    复制
                  </button>
                  <button @click="() => removeFromHistory(index)"
                    class="text-red-500 hover:text-red-600 transition-colors text-[10px] md:text-xs">
                    删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="mt-8 md:mt-12 space-y-4 md:space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div class="border border-gray-100 rounded-lg p-4 md:p-6">
              <div class="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <svg class="w-5 h-5 md:w-6 md:h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 class="text-sm md:text-base font-medium text-gray-900">AI 生成</h4>
              </div>
              <p class="text-xs md:text-sm text-gray-600 leading-relaxed">
                使用 DeepSeek AI 智能生成新年文案，支持个性化定制
              </p>
            </div>

            <div class="border border-gray-100 rounded-lg p-4 md:p-6">
              <div class="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg class="w-5 h-5 md:w-6 md:h-6 text-green-500" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h4 class="text-sm md:text-base font-medium text-gray-900">历史记录</h4>
              </div>
              <p class="text-xs md:text-sm text-gray-600 leading-relaxed">
                自动保存生成记录，方便后续查看和使用
              </p>
            </div>

            <div class="border border-gray-100 rounded-lg p-4 md:p-6">
              <div class="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                <div class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg class="w-5 h-5 md:w-6 md:h-6 text-purple-500" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h4 class="text-sm md:text-base font-medium text-gray-900">一键分享</h4>
              </div>
              <p class="text-xs md:text-sm text-gray-600 leading-relaxed">
                支持一键复制和收藏，方便分享到社交平台
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

// Declare lottie for TypeScript
declare const lottie: any

const route = useRoute()
const displayText = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const refreshContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const prompt = ref('')
const history = ref<{ text: string; timestamp: number }[]>([])
const loadingText = ref('正在生成文案...')

// 添加 API 限制相关的状态
const API_LIMIT_KEY = 'newyear_api_limit'
const API_LIMIT_PER_DAY = 20  // 每天限制请求20次
const lastRequestTime = ref<number>(0)
const todayRequestCount = ref<number>(0)

let refreshAnimation: any = null
let typingTimer: number | null = null

// 刷新动画数据
const refreshAnimationData = { "v": "5.6.5", "fr": 30, "ip": 0, "op": 60, "w": 32, "h": 32, "nm": "refresh-cw", "ddd": 0, "assets": [], "layers": [{ "ddd": 0, "ind": 1, "ty": 4, "nm": "refresh-cw", "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 1, "k": [{ "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 0, "s": [0] }, { "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 10, "s": [-20] }, { "i": { "x": [0.355], "y": [1] }, "o": { "x": [0.334], "y": [0] }, "t": 13, "s": [-20] }, { "t": 59, "s": [720] }], "ix": 10 }, "p": { "a": 0, "k": [16, 16, 0], "ix": 2 }, "a": { "a": 0, "k": [16, 16, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [-3.5, 3.5], [-0.4, 1.3]], "o": [[0, 0], [3.5, 3.5], [0.9, -0.9], [0, 0]], "v": [[-11, 2.1], [-6.4, 6.5], [6.3, 6.5], [8.4, 3.1]], "c": false }, "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 1, "ty": "sh", "ix": 2, "ks": { "a": 0, "k": { "i": [[0, 0], [-4.7, -1.6], [-1, -0.9], [0, 0]], "o": [[1.7, -4.7], [1.3, 0.4], [0, 0], [0, 0]], "v": [[-8.5, -2.9], [3, -8.4], [6.4, -6.3], [11, -1.9]], "c": false }, "ix": 2 }, "nm": "Path 2", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [1, 1, 1, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 2, "ix": 5 }, "lc": 2, "lj": 2, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [16, 15.9], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "arrow", "np": 4, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 60, "st": 0, "bm": 0 }], "markers": [] }

// 在 localNewYearTexts 数组定义后添加
const STORAGE_KEY = 'generated_newyear_texts'

// 从localStorage加载已生成的文案
const loadGeneratedTexts = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : []
}

// 保存生成的文案到localStorage
const saveGeneratedText = (text: string) => {
  const savedTexts = loadGeneratedTexts()
  if (!savedTexts.includes(text)) {
    savedTexts.push(text)
    if (savedTexts.length > 50) {
      savedTexts.shift()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTexts))
  }
}

// 从localStorage加载历史记录和API限制信息
onMounted(() => {
  const savedHistory = localStorage.getItem('newyear_history')
  if (savedHistory) {
    history.value = JSON.parse(savedHistory)
  }

  // 加载API限制信息
  const limitInfo = localStorage.getItem(API_LIMIT_KEY)
  if (limitInfo) {
    const { count, timestamp } = JSON.parse(limitInfo)
    // 如果是同一天，恢复计数
    if (isSameDay(timestamp, Date.now())) {
      todayRequestCount.value = count
      lastRequestTime.value = timestamp
    } else {
      // 不是同一天，重置计数
      resetApiLimit()
    }
  }

  // 动态加载lottie-web
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js'
  script.onload = () => {
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

// 检查是否是同一天
const isSameDay = (timestamp1: number, timestamp2: number) => {
  const date1 = new Date(timestamp1)
  const date2 = new Date(timestamp2)
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
}

// 重置API限制
const resetApiLimit = () => {
  todayRequestCount.value = 0
  lastRequestTime.value = Date.now()
  localStorage.setItem(API_LIMIT_KEY, JSON.stringify({
    count: 0,
    timestamp: lastRequestTime.value
  }))
}

// 更新API请求计数
const updateApiLimit = () => {
  todayRequestCount.value++
  lastRequestTime.value = Date.now()
  localStorage.setItem(API_LIMIT_KEY, JSON.stringify({
    count: todayRequestCount.value,
    timestamp: lastRequestTime.value
  }))
}

// 检查是否可以请求API
const canRequestApi = () => {
  // 如果不是同一天，重置计数
  if (!isSameDay(lastRequestTime.value, Date.now())) {
    resetApiLimit()
    return true
  }
  return todayRequestCount.value < API_LIMIT_PER_DAY
}

// 文字生成效果函数
const typeText = (text: string) => {
  let index = 0
  displayText.value = ''

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
  }, 50)
}

// 本地备用数据
const localNewYearTexts = [
  " ",
  "愿新年的阳光，洒满你的生活；愿新年的微风，吹散你的烦恼；愿新年的幸福，温暖你的心窝。",
  "新的一年，愿你眉眼带笑，岁月静好，平安喜乐，万事胜意。",
  "愿你新年事事顺遂，所愿皆成，所念皆如，平安喜乐，万事胜意。",
  "新的一年，愿你活成自己喜欢的样子，遇见想遇见的人，走过想走过的路。",
  "愿新的一年里，你的生活如茶般清香，你的日子如酒般醇厚，你的心情如花般绚烂。",
  "新年快乐，愿你的生活如同璀璨的烟花，绽放出最美的光彩。",
  "愿新的一年里，你的快乐比糖甜，你的幸福比蜜浓，你的生活比花香。",
  "新的一年，愿你所有的期待都能成真，所有的梦想都能实现，所有的付出都有收获。",
  "愿新的一年里，你的生活充满阳光，你的心情永远明媚，你的未来一片光明。"
]

// 添加获取本地保存的文案的功能
const getLocalGeneratedText = () => {
  const savedTexts = loadGeneratedTexts()
  if (savedTexts.length > 0) {
    const randomIndex = Math.floor(Math.random() * savedTexts.length)
    return savedTexts[randomIndex]
  }
  return null
}

// 添加消息提示函数
const showMessage = (message: string, type: 'success' | 'error' | 'warning') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

/**
 * 使用 DeepSeek API 生成新年文案
 */
const generateText = async () => {
  try {
    isLoading.value = true
    loadingText.value = '正在生成文案...'

    try {
      // 检查 API Key 是否配置
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
      if (!apiKey) {
        loadingText.value = 'API Key 未配置，正在切换到本地数据...'
        await new Promise(resolve => setTimeout(resolve, 500))
        console.error('DeepSeek API Key 未配置')
        throw new Error('API Key 未配置')
      }

      loadingText.value = '正在请求 AI 生成...'
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个擅长写朋友圈文案的写手，请以朋友的口吻生成一条走心的2025年新年文案。要求：1. 字数在50字以内；2. 语气要像发朋友圈一样自然随性，避免过于正式；3. 要有新年的喜悦和对朋友的真诚祝福；4. 可以适当融入蛇年元素，但不要太刻意；5. 文案要有温度，像是在跟好朋友聊天。'
            },
            {
              role: 'user',
              content: prompt.value ?
                `请根据"${prompt.value}"这个主题，生成一条2025蛇年新年朋友圈文案` :
                '请生成一条2025蛇年新年朋友圈文案'
            }
          ],
          temperature: 0.7,
          max_tokens: 200,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`)
      }

      loadingText.value = '正在处理生成结果...'
      const data = await response.json()

      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        loadingText.value = '正在应用生成结果...'
        const text = data.choices[0].message.content.trim()
        saveGeneratedText(text)
        typeText(text)
        addToHistory(text)
        return
      } else {
        throw new Error('API 响应数据格式不正确')
      }
    } catch (error) {
      showMessage(`API 请求失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error')
      // 使用本地数据
      const randomIndex = Math.floor(Math.random() * localNewYearTexts.length)
      const text = localNewYearTexts[randomIndex]
      typeText(text)
      addToHistory(text)
    }
  } catch (error) {
    showMessage(`获取文案失败: ${error instanceof Error ? error.message : '请稍后重试'}`, 'error')
  } finally {
    setTimeout(() => {
      isLoading.value = false
      loadingText.value = '正在生成文案...'
    }, 500)
  }
}

const copyText = async (textToCopy?: string) => {
  try {
    const finalText = textToCopy || displayText.value
    if (!finalText) {
      showMessage('没有可复制的内容', 'error')
      return
    }

    // 使用 navigator.clipboard API
    await navigator.clipboard.writeText(finalText)
    showMessage('复制成功', 'success')
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案：使用传统的复制方法
    try {
      const textarea = document.createElement('textarea')
      textarea.value = textToCopy || displayText.value
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      showMessage('复制成功', 'success')
    } catch (fallbackError) {
      console.error('降级复制也失败:', fallbackError)
      showMessage('复制失败，请手动复制', 'error')
    }
  }
}

const addToHistory = (text: string) => {
  history.value.unshift({
    text,
    timestamp: Date.now()
  })
  // 限制历史记录数量
  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10)
  }
  // 保存到localStorage
  localStorage.setItem('newyear_history', JSON.stringify(history.value))
}

const removeFromHistory = (index: number) => {
  history.value.splice(index, 1)
  localStorage.setItem('newyear_history', JSON.stringify(history.value))
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
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
