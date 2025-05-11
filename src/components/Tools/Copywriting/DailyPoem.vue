<!--
* @file DailyPoem.vue
* @description 今日诗词生成器
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2024-1-9
*
* 功能特性：
* 1. 自动获取今日诗词
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
                @click="getRandomPoem">今日诗词</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">每次都能获取一首优美的诗词</p>
        </div>

        <!-- 诗词展示区域 -->
        <div class="bg-gray-50 rounded-lg p-6 mb-6" style="min-height: 300px;">
          <div class="text-center">
            <h3 class="text-2xl font-bold mb-4 text-gray-800">{{ displayText.title }}</h3>
            <div class="poem-content text-lg leading-loose mt-8">
              <p v-for="(line, index) in displayText.content" :key="index"
                class="mb-3 text-gray-700 transition-all duration-300">{{ line }}</p>
            </div>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="flex justify-center gap-4">
          <button @click="getRandomPoem"
            class="inline-flex items-center px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-base transition-colors">
            <div ref="refreshContainer" class="w-6 h-6 mr-2"></div>
            换一首
          </button>
          <button @click="copyText"
            class="inline-flex items-center px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-base transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            复制诗词
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
                <h4 class="text-base font-medium text-gray-900">智能推荐</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                智能算法推荐，每次都能获取一首优美的诗词
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
                支持实时更新，随时获取新的诗词内容
              </p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">诗词内容从哪里来？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                所有诗词均来自古诗文数据库，经过筛选和整理，确保内容的准确性和文学价值。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">更新频率如何？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持实时更新，您可以随时点击"换一首"按钮获取新的诗词内容。
              </p>
            </div>
            <div class="pb-6 last:pb-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">可以收藏喜欢的诗词吗？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                目前支持复制功能，您可以将喜欢的诗词复制保存。
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

const route = useRoute()

interface PoemData {
  title: string
  content: string[]
}

const currentPoem = ref<PoemData>({
  title: '',
  content: []
})

const displayText = ref<PoemData>({
  title: '',
  content: []
})

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const lottieContainer = ref<HTMLElement | null>(null)
const refreshContainer = ref<HTMLElement | null>(null)
let copyAnimation: any = null
let refreshAnimation: any = null
let typingTimer: number | null = null

const copyAnimationData = {
  v: "5.6.5",
  fr: 30,
  ip: 0,
  op: 60,
  w: 24,
  h: 24,
  nm: "copy",
  ddd: 0,
  assets: [],
  layers: [{
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: "copy",
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [12, 12, 0] },
      a: { a: 0, k: [12, 12, 0] },
      s: { a: 0, k: [100, 100, 100] }
    },
    ao: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          {
            ty: "rc",
            d: 1,
            p: { a: 0, k: [15.5, 15.5] },
            s: { a: 0, k: [13, 13] },
            r: { a: 0, k: 2 }
          },
          {
            ty: "st",
            c: { a: 0, k: [0, 0, 0, 1] },
            o: { a: 0, k: 100 },
            w: { a: 0, k: 2 },
            lc: 2,
            lj: 2
          },
          {
            ty: "tr",
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 }
          }
        ]
      },
      {
        ty: "gr",
        it: [
          {
            ty: "ph",
            d: 1,
            ks: {
              a: 0,
              k: {
                i: [[0, 0], [0, 0], [0, 0]],
                o: [[0, 0], [0, 0], [0, 0]],
                v: [[5, 15], [4, 15], [4, 4], [13, 4], [13, 5]],
                c: false
              }
            }
          },
          {
            ty: "st",
            c: { a: 0, k: [0, 0, 0, 1] },
            o: { a: 0, k: 100 },
            w: { a: 0, k: 2 },
            lc: 2,
            lj: 2
          },
          {
            ty: "tr",
            p: { a: 0, k: [0, 0] },
            a: { a: 0, k: [0, 0] },
            s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 },
            o: { a: 0, k: 100 }
          }
        ]
      }
    ],
    ip: 0,
    op: 60,
    st: 0,
    bm: 0
  }],
  markers: []
}

const refreshAnimationData = { "v": "5.6.5", "fr": 30, "ip": 0, "op": 60, "w": 32, "h": 32, "nm": "refresh-cw", "ddd": 0, "assets": [], "layers": [{ "ddd": 0, "ind": 1, "ty": 4, "nm": "refresh-cw", "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 1, "k": [{ "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 0, "s": [0] }, { "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 10, "s": [-20] }, { "i": { "x": [0.355], "y": [1] }, "o": { "x": [0.334], "y": [0] }, "t": 13, "s": [-20] }, { "t": 59, "s": [720] }], "ix": 10 }, "p": { "a": 0, "k": [16, 16, 0], "ix": 2 }, "a": { "a": 0, "k": [16, 16, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [-3.5, 3.5], [-0.4, 1.3]], "o": [[0, 0], [3.5, 3.5], [0.9, -0.9], [0, 0]], "v": [[-11, 2.1], [-6.4, 6.5], [6.3, 6.5], [8.4, 3.1]], "c": false }, "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 1, "ty": "sh", "ix": 2, "ks": { "a": 0, "k": { "i": [[0, 0], [-4.7, -1.6], [-1, -0.9], [0, 0]], "o": [[1.7, -4.7], [1.3, 0.4], [0, 0], [0, 0]], "v": [[-8.5, -2.9], [3, -8.4], [6.4, -6.3], [11, -1.9]], "c": false }, "ix": 2 }, "nm": "Path 2", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [1, 1, 1, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 2, "ix": 5 }, "lc": 2, "lj": 2, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [16, 15.9], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "arrow", "np": 4, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 60, "st": 0, "bm": 0 }], "markers": [] }

onMounted(() => {
  // 动态加载lottie-web
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js'
  script.onload = () => {
    // 初始化复制动画
    if (lottieContainer.value) {
      copyAnimation = lottie.loadAnimation({
        container: lottieContainer.value,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: copyAnimationData
      })

      const copyButton = lottieContainer.value.parentElement
      if (copyButton) {
        copyButton.addEventListener('mouseenter', () => {
          copyAnimation.goToAndPlay(0, true)
        })
        copyButton.addEventListener('mouseleave', () => {
          copyAnimation.goToAndStop(0, true)
        })
      }
    }

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
const typeText = (poem: PoemData) => {
  let index = 0
  const steps = [
    () => { displayText.value.title = poem.title },
    ...poem.content.map((line, i) => () => {
      if (!displayText.value.content[i]) {
        displayText.value.content[i] = ''
      }
      displayText.value.content[i] = line
    })
  ]

  // 清除之前的定时器
  if (typingTimer) {
    clearInterval(typingTimer)
  }

  // 重置显示内容
  displayText.value = {
    title: '',
    content: []
  }

  typingTimer = window.setInterval(() => {
    if (index < steps.length) {
      steps[index]()
      index++
    } else {
      if (typingTimer) {
        clearInterval(typingTimer)
      }
    }
  }, 300) // 每个部分的显示间隔
}

const getRandomPoem = async () => {
  try {
    // 播放刷新动画
    if (refreshAnimation) {
      refreshAnimation.goToAndPlay(0, true)
    }

    // 使用新的 API
    const response = await fetch('https://v1.jinrishici.com/all.json')
    const data = await response.json()
    console.log('获取到的原始数据:', data) // 调试日志

    // 添加详细的数据验证
    if (!data) {
      throw new Error('API返回数据为空')
    }

    // 解析诗词内容
    const content = data.content || ''
    const title = data.origin || '未知'
    const author = data.author || '佚名'

    // 处理文本内容，按句号分割
    const contentLines = content.split(/[。？！]/)
      .filter((line: string) => line.trim())
      .map((line: string) => line.trim() + '。')

    const poem: PoemData = {
      title: `${title}·${author}`,
      content: contentLines.length > 0 ? contentLines : [content]
    }

    console.log('处理后的诗词数据:', poem) // 调试日志
    currentPoem.value = poem
    typeText(poem)
  } catch (error) {
    console.error('获取诗词失败:', error)
    showMessage(`获取诗词失败: ${error instanceof Error ? error.message : '请稍后重试'}`, 'error')

    // 重置显示内容
    displayText.value = {
      title: '',
      content: []
    }
  }
}

const copyText = async () => {
  try {
    const poemText = `${currentPoem.value.title}\n\n${currentPoem.value.content.join('\n')}`
    const success = await copy(poemText)
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

// 初始化时生成一首诗词
getRandomPoem()
</script>

<style scoped>
.poem-content {
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

.poem-content p {
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
