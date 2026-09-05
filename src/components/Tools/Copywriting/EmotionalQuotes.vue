<!--
* @file EmotionalQuotes.vue
* @description 随机一言生成器
* @author UIED技术团队
* @copyright Tomda (https://www.tomda.top)
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
  <div class="quotes-page">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="quotes-shell uied-tool-card bg-white border border-gray-100 mb-4">
        <div class="text-center mb-8 relative">
          <h1 class="text-2xl sm:text-[32px] font-bold mb-3">随机一言</h1>
          <p class="text-gray-500 text-sm">每次随机获取一条精选一言</p>
        </div>

        <!-- 语录展示区域 -->
        <div class="quote-panel mb-6">
          <div class="text-center">
            <p class="text-gray-700 leading-relaxed typing-text text-lg" :class="{ 'is-typing': isTyping }"
              role="status" aria-live="polite" aria-atomic="true">
              {{ isLoading ? '正在获取语录…' : displayText }}
            </p>
          </div>
        </div>

        <!-- 操作按钮区域 -->
        <div class="quote-actions">
          <button type="button" @click="getRandomQuote" :disabled="isLoading || isTyping" class="quote-action quote-action--primary"
            aria-label="换一条随机一言">
            <div ref="refreshContainer" class="w-6 h-6 mr-2" aria-hidden="true"></div>
            {{ isLoading || isTyping ? '获取中…' : '换一个' }}
          </button>
          <button type="button" @click="copyText" :disabled="!currentQuote" class="quote-action quote-action--quiet"
            aria-label="复制当前随机一言">
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
                <h4 class="text-base font-medium text-gray-900">多源可用</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                后台统一请求上游，异常时自动切换本地精选语录
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
                优先由后台同域接口获取公开语录，上游异常时会自动使用项目内置精选语录。
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
        :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'" role="status" aria-live="polite">
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { copy } from '@/utils/copy'
import { fetchCopywritingText } from '@/services/copywriting'

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
const isLoading = ref(false)
const isTyping = ref(false)
let typingTimer: number | null = null
let toastTimer: number | null = null
let lottieScript: HTMLScriptElement | null = null
let quoteRequestId = 0

const refreshAnimationData = { "v": "5.6.5", "fr": 30, "ip": 0, "op": 60, "w": 32, "h": 32, "nm": "refresh-cw", "ddd": 0, "assets": [], "layers": [{ "ddd": 0, "ind": 1, "ty": 4, "nm": "refresh-cw", "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 1, "k": [{ "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 0, "s": [0] }, { "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 10, "s": [-20] }, { "i": { "x": [0.355], "y": [1] }, "o": { "x": [0.334], "y": [0] }, "t": 13, "s": [-20] }, { "t": 59, "s": [720] }], "ix": 10 }, "p": { "a": 0, "k": [16, 16, 0], "ix": 2 }, "a": { "a": 0, "k": [16, 16, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [-3.5, 3.5], [-0.4, 1.3]], "o": [[0, 0], [3.5, 3.5], [0.9, -0.9], [0, 0]], "v": [[-11, 2.1], [-6.4, 6.5], [6.3, 6.5], [8.4, 3.1]], "c": false }, "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 1, "ty": "sh", "ix": 2, "ks": { "a": 0, "k": { "i": [[0, 0], [-4.7, -1.6], [-1, -0.9], [0, 0]], "o": [[1.7, -4.7], [1.3, 0.4], [0, 0], [0, 0]], "v": [[-8.5, -2.9], [3, -8.4], [6.4, -6.3], [11, -1.9]], "c": false }, "ix": 2 }, "nm": "Path 2", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 2, "ty": "sh", "ix": 3, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [0, 0]], "o": [[0, 0], [0, 0], [0, 0]], "v": [[-11, 8.1], [-11, 2.1], [-5, 2.1]], "c": false }, "ix": 2 }, "nm": "Path 3", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 3, "ty": "sh", "ix": 4, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [0, 0]], "o": [[0, 0], [0, 0], [0, 0]], "v": [[11, -7.9], [11, -1.9], [5, -1.9]], "c": false }, "ix": 2 }, "nm": "Path 4", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "mm", "mm": 1, "nm": "Merge Paths 1", "mn": "ADBE Vector Filter - Merge", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [1, 1, 1, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 2, "ix": 5 }, "lc": 2, "lj": 2, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [16, 15.9], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "arrow", "np": 6, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 60, "st": 0, "bm": 0 }], "markers": [] }

onMounted(() => {
  // 动态加载lottie-web
  const script = document.createElement('script')
  lottieScript = script
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

/**
 * 函数说明：显示有时限的操作反馈，新消息会覆盖上一个计时器。
 */
const showMessage = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  if (toastTimer) {
    window.clearTimeout(toastTimer)
  }
  toastTimer = window.setTimeout(() => {
    showToast.value = false
  }, 2000)
}

/**
 * 函数说明：逐字展示语录，开始新任务前会清理上一个打字计时器。
 */
const typeText = (text: string) => {
  let index = 0
  displayText.value = ''
  isTyping.value = true

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
        typingTimer = null
      }
      isTyping.value = false
    }
  }, 50) // 每个字符的打印间隔，可以调整
}

/**
 * 函数说明：从同域后台获取随机一言，上游或网络异常时回退本地语录，并忽略过期响应。
 */
const getRandomQuote = async () => {
  const requestId = ++quoteRequestId
  isLoading.value = true
  if (refreshAnimation) {
    refreshAnimation.goToAndPlay(0)
  }

  try {
    const result = await fetchCopywritingText('yiyan')
    if (requestId !== quoteRequestId) {
      return
    }
    currentQuote.value = result.text
    typeText(result.text)
  } catch {
    if (requestId !== quoteRequestId) {
      return
    }
    const randomIndex = Math.floor(Math.random() * localInspiringQuotes.length)
    const quote = localInspiringQuotes[randomIndex]
    currentQuote.value = quote
    typeText(quote)
  } finally {
    if (requestId === quoteRequestId) {
      isLoading.value = false
    }
  }
}

/**
 * 函数说明：复制当前完整语录，并显示成功或失败反馈。
 */
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

onBeforeUnmount(() => {
  quoteRequestId++
  if (typingTimer) {
    window.clearInterval(typingTimer)
  }
  isTyping.value = false
  if (toastTimer) {
    window.clearTimeout(toastTimer)
  }
  refreshAnimation?.destroy?.()
  lottieScript?.remove()
})
</script>

<style scoped>
.quotes-page {
  width: 100%;
}

.quotes-shell {
  padding: clamp(20px, 4vw, 32px);
}

.quote-panel {
  min-height: 200px;
  display: grid;
  place-items: center;
  padding: clamp(20px, 4vw, 32px);
  border: 1px solid var(--uied-color-border);
  border-radius: var(--uied-radius-lg);
  background: var(--uied-color-surface-subtle);
}

.quote-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.quote-action {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 28px;
  color: var(--uied-color-text);
  font-size: 15px;
  font-weight: 600;
  border: 1px solid var(--uied-color-border);
  border-radius: var(--uied-radius-md);
  background: var(--uied-color-surface);
  transition: color var(--uied-motion-fast) ease, border-color var(--uied-motion-fast) ease, background-color var(--uied-motion-fast) ease;
}

.quote-action--primary {
  color: #fff;
  border-color: var(--uied-color-primary);
  background: var(--uied-color-primary);
}

.quote-action--primary:hover:not(:disabled) {
  border-color: var(--uied-color-primary-hover);
  background: var(--uied-color-primary-hover);
}

.quote-action--quiet:hover:not(:disabled) {
  border-color: var(--uied-color-primary);
}

.quote-action:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

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

.typing-text:not(.is-typing)::after {
  display: none;
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

@media screen and (max-width: 640px) {
  .quote-panel {
    min-height: 160px;
  }

  .quote-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quote-action {
    width: 100%;
    padding-right: 12px;
    padding-left: 12px;
  }
}
</style>
