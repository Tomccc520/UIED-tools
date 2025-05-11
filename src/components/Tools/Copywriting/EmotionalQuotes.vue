<!--
* @file EmotionalQuotes.vue
* @description 随机一言生成器
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-1-9
*
* 功能特性：
* 1. 自动获取最新随机一言
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
                @click="getRandomQuote">随机一言</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">每次都能获取最新的随机一言</p>
        </div>

        <!-- 语录展示区域 -->
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
            换一个
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
                <h4 class="text-base font-medium text-gray-900">智能推荐</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                智能算法推荐，每次都能获取一条富有感情的语录
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
                支持实时更新，随时获取新的情感语录
              </p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">语录内容从哪里来？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                所有语录均来自网络精选，经过筛选和整理，确保内容的质量。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">更新频率如何？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持实时更新，您可以随时点击"换一个"按钮获取新的语录内容。
              </p>
            </div>
            <div class="pb-6 last:pb-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">可以收藏喜欢的语录吗？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                目前支持复制功能，您可以将喜欢的语录复制保存。
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

// 本地备用数据
const localInspiringQuotes = [
  "生活中最重要的不是你所处的位置，而是你所朝的方向。",
  "每一个不曾起舞的日子，都是对生命的辜负。",
  "不要等待机会，而要创造机会。",
  "生命不是要超越别人，而是要超越自己。",
  "没有人能替你承担人生的修行，每一步都需要自己走。",
  "生活不是等待暴风雨过去，而是学会在雨中翩翩起舞。",
  "不要让未来的你，讨厌现在的自己。",
  "成功的秘诀是坚持做正确的事情，而不是做容易的事情。",
  "每一个优秀的人，都有一段沉默的时光。",
  "你的努力程度之低，根本轮不到拼天赋。",
  "不要因为走得太远，而忘记为什么出发。",
  "人生最大的敌人不是失败，而是舒适。",
  "不要等待机会，而要创造机会。",
  "成功的道路上并不拥挤，因为坚持的人不多。",
  "你必须非常努力，才能看起来毫不费力。",
  "没有人能随随便便成功，也没有人能轻轻松松获得幸福。",
  "不要让懒惰的现在，毁掉你的美好未来。",
  "与其用泪水悔恨昨天，不如用汗水拼搏今天。",
  "人生没有白走的路，每一步都算数。",
  "不要因为没有掌声，而放弃你的梦想。",
  "成功的路上，只有脚印，没有轮印。",
  "不要因为别人的否定，而质疑自己的价值。",
  "你的选择，决定你的命运。",
  "不要因为一时的挫折，而放弃追求梦想的脚步。",
  "成功不是一蹴而就的，而是日积月累的结果。",
  "不要在最能吃苦的年纪选择了安逸。",
  "人生就像爬山，看起来走了弯路，也许是捷径。",
  "不要因为走得慢而放弃，只要你在走，就会有希望。",
  "成功的关键在于相信自己有这个能力。",
  "不要用战术上的勤奋，掩饰战略上的懒惰。",
  "人生最重要的不是所站的位置，而是所朝的方向。",
  "不要因为别人的质疑，而放弃自己的梦想。",
  "成功不是偶然的，而是必然的。只要你足够努力。",
  "不要在该奋斗的年纪选择了安逸。",
  "人生就像一场马拉松，重要的不是速度，而是坚持。",
  "不要因为一时的失败，而否定自己的一生。",
  "成功的道路上，没有捷径可走，只有脚踏实地。",
  "不要因为环境的不好，而放弃对自己的要求。",
  "人生最大的成功，不是赚多少钱，而是成为一个更好的人。",
  "不要因为别人的成功，而焦虑自己的现状。",
  "成功的背后，都是默默付出的努力。",
  "不要因为一时的困难，而放弃自己的理想。",
  "人生就像一本书，重要的不是有多厚，而是有多精彩。",
  "不要因为起点的不同，而放弃对终点的追求。",
  "成功的路上，没有平坦的道路，只有不断的攀登。",
  "不要因为别人的眼光，而改变自己的方向。",
  "人生最大的对手，永远是自己。",
  "不要因为一时的迷茫，而放弃对未来的期待。",
  "成功的秘诀，就是坚持做别人不愿意做的事。",
  "不要因为现实的残酷，而放弃内心的温柔。"
]

const currentQuote = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const refreshContainer = ref<HTMLElement | null>(null)
let refreshAnimation: any = null
const displayText = ref('')
const textContainer = ref<HTMLElement | null>(null)
let typingTimer: number | null = null

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
  }, 50) // 每个字符的打印间隔，可以调整
}

/**
 * 获取随机一言
 * API: https://api.52vmy.cn/api/wl/yan/yiyan
 */
const getRandomQuote = async () => {
  try {
    // 播放刷新动画
    if (refreshAnimation) {
      refreshAnimation.goToAndPlay(0)
    }

    // 使用代理地址
    const response = await fetch('/api/yiyan')
    const data = await response.json()

    // 检查响应格式
    if (data.code === 200 && data.data?.hitokoto) {
      currentQuote.value = data.data.hitokoto
      typeText(data.data.hitokoto)
    } else {
      throw new Error('Invalid response format')
    }
  } catch (error) {
    console.log('API请求失败，使用本地数据:', error)
    // 使用本地数据
    const randomIndex = Math.floor(Math.random() * localInspiringQuotes.length)
    const quote = localInspiringQuotes[randomIndex]
    currentQuote.value = quote
    typeText(quote)
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
