<!--
* @file InspiringQuotes.vue
* @description 励志一言生成器
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-1-9
*
* 功能特性：
* 1. 自动获取励志一言
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
                @click="getRandomQuote">励志一言</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">每次都能获取一句激励人心的话语</p>
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
                <h4 class="text-base font-medium text-gray-900">智能推荐</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                智能算法推荐，每次都能获取一句激励人心的话语
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
                支持实时更新，随时获取新的励志语录
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
                支持实时更新，您可以随时点击"换一条"按钮获取新的语录内容。
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

// Declare lottie for TypeScript
declare const lottie: any

const route = useRoute()
const currentQuote = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const refreshContainer = ref<HTMLElement | null>(null)
let refreshAnimation: any = null
let typingTimer: number | null = null
const displayText = ref('')

// 本地备用数据
const localInspiringQuotes = [
  "成功不是将来才有的，而是从决定去做的那一刻起，持续累积而成。",
  "当你感到疲惫的时候，就是你在成长的时候。",
  "没有人能替你承担人生的修行，每一步都需要自己走。",
  "生活不是等待暴风雨过去，而是学会在雨中翩翩起舞。",
  "不要让未来的你，讨厌现在的自己。",
  "成功的秘诀是坚持做正确的事情，而不是做容易的事情。",
  "每一个优秀的人，都有一段沉默的时光。那段时光，是付出了很多努力，忍受了很多孤独和寂寞。",
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
  "不要因为现实的残酷，而放弃内心的温柔。",
  "人生就像一场旅行，重要的不是目的地，而是沿途的风景。",
  "不要因为道路的艰难，而放弃前进的脚步。",
  "成功的人生，不在于你拥有什么，而在于你成为什么样的人。",
  "不要因为别人的成功，而忽视自己的进步。",
  "人生最大的财富，不是金钱，而是经历。",
  "不要因为一时的挫折，而否定自己的价值。",
  "成功的道路上，没有偶然，只有必然。",
  "不要因为环境的限制，而放弃对梦想的追求。",
  "人生就像一场比赛，重要的不是名次，而是尽力。",
  "不要因为别人的否定，而放弃对自己的肯定。",
  "成功的背后，都是无数次的失败和坚持。",
  "不要因为一时的失意，而放弃对生活的热爱。",
  "人生最大的勇气，就是面对自己的不足。",
  "不要因为起步的晚，而放弃前进的决心。",
  "成功的路上，没有休息的驿站，只有不断的前进。",
  "不要因为别人的评价，而改变自己的初心。",
  "人生就像一幅画，重要的不是技巧，而是坚持。",
  "不要因为道路的曲折，而放弃对目标的追求。",
  "成功的人生，不在于你比别人强，而在于你超越了自己。",
  "不要因为现实的压力，而放弃对理想的坚持。",
  "人生最大的成就，就是成为一个更好的自己。",
  "不要因为一时的困境，而放弃对未来的憧憬。",
  "成功的秘诀，就是永不放弃的决心。",
  "不要因为别人的目光，而放弃自己的选择。",
  "人生就像一首歌，重要的不是长度，而是韵味。",
  "不要因为道路的漫长，而放弃对梦想的追逐。",
  "成功的道路上，没有巧合，只有努力。",
  "不要因为环境的艰难，而放弃对生活的热情。",
  "人生最大的敌人，不是别人，而是自己的懒惰。",
  "不要因为一时的失落，而放弃对希望的期待。",
  "成功的背后，都是无数个日夜的坚持。",
  "不要因为别人的成就，而否定自己的价值。",
  "人生就像一场戏，重要的不是角色，而是演技。",
  "不要因为道路的坎坷，而放弃对理想的追求。",
  "成功的人生，不在于你走了多远，而在于你克服了多少困难。",
  "不要因为现实的无奈，而放弃对梦想的执着。",
  "人生最大的胜利，就是战胜了自己。",
  "不要因为一时的迷惘，而放弃对方向的寻找。",
  "成功的秘诀，就是把简单的事情做好。",
  "不要因为别人的质疑，而动摇自己的信念。",
  "人生就像一次冒险，重要的不是结果，而是过程。",
  "不要因为道路的艰辛，而放弃对目标的追求。",
  "成功的道路上，没有侥幸，只有付出。",
  "不要因为环境的困难，而放弃对梦想的向往。",
  "人生最大的快乐，就是实现自己的价值。",
  "不要因为一时的挫折，而放弃对成功的渴望。",
  "成功的背后，都是不为人知的努力。",
  "不要因为别人的眼光，而迷失自己的方向。",
  "人生就像一场考试，重要的不是分数，而是收获。",
  "不要因为道路的崎岖，而放弃对梦想的追求。",
  "成功的人生，不在于你有多少财富，而在于你帮助了多少人。",
  "不要因为现实的困难，而放弃对理想的追求。",
  "人生最大的财富，就是拥有一颗永不放弃的心。",
  "不要因为一时的失败，而放弃对成功的向往。",
  "成功的秘诀，就是永远保持学习的心态。",
  "不要因为别人的成功，而放弃自己的节奏。"
]

const refreshAnimationData = { "v": "5.6.5", "fr": 30, "ip": 0, "op": 60, "w": 32, "h": 32, "nm": "refresh-cw", "ddd": 0, "assets": [], "layers": [{ "ddd": 0, "ind": 1, "ty": 4, "nm": "refresh-cw", "sr": 1, "ks": { "o": { "a": 0, "k": 100, "ix": 11 }, "r": { "a": 1, "k": [{ "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 0, "s": [0] }, { "i": { "x": [0.7], "y": [1] }, "o": { "x": [0.7], "y": [0] }, "t": 10, "s": [-20] }, { "i": { "x": [0.355], "y": [1] }, "o": { "x": [0.334], "y": [0] }, "t": 13, "s": [-20] }, { "t": 59, "s": [720] }], "ix": 10 }, "p": { "a": 0, "k": [16, 16, 0], "ix": 2 }, "a": { "a": 0, "k": [16, 16, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100, 100], "ix": 6 } }, "ao": 0, "shapes": [{ "ty": "gr", "it": [{ "ind": 0, "ty": "sh", "ix": 1, "ks": { "a": 0, "k": { "i": [[0, 0], [0, 0], [-3.5, 3.5], [-0.4, 1.3]], "o": [[0, 0], [3.5, 3.5], [0.9, -0.9], [0, 0]], "v": [[-11, 2.1], [-6.4, 6.5], [6.3, 6.5], [8.4, 3.1]], "c": false }, "ix": 2 }, "nm": "Path 1", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ind": 1, "ty": "sh", "ix": 2, "ks": { "a": 0, "k": { "i": [[0, 0], [-4.7, -1.6], [-1, -0.9], [0, 0]], "o": [[1.7, -4.7], [1.3, 0.4], [0, 0], [0, 0]], "v": [[-8.5, -2.9], [3, -8.4], [6.4, -6.3], [11, -1.9]], "c": false }, "ix": 2 }, "nm": "Path 2", "mn": "ADBE Vector Shape - Group", "hd": false }, { "ty": "st", "c": { "a": 0, "k": [1, 1, 1, 1], "ix": 3 }, "o": { "a": 0, "k": 100, "ix": 4 }, "w": { "a": 0, "k": 2, "ix": 5 }, "lc": 2, "lj": 2, "bm": 0, "nm": "Stroke 1", "mn": "ADBE Vector Graphic - Stroke", "hd": false }, { "ty": "tr", "p": { "a": 0, "k": [16, 15.9], "ix": 2 }, "a": { "a": 0, "k": [0, 0], "ix": 1 }, "s": { "a": 0, "k": [100, 100], "ix": 3 }, "r": { "a": 0, "k": 0, "ix": 6 }, "o": { "a": 0, "k": 100, "ix": 7 }, "sk": { "a": 0, "k": 0, "ix": 4 }, "sa": { "a": 0, "k": 0, "ix": 5 }, "nm": "Transform" }], "nm": "arrow", "np": 4, "cix": 2, "bm": 0, "ix": 1, "mn": "ADBE Vector Group", "hd": false }], "ip": 0, "op": 60, "st": 0, "bm": 0 }], "markers": [] }

onMounted(() => {
  // 动态加载lottie-web
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js'
  script.onload = () => {
    // 只初始化刷新动画
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
 * 获取随机励志一言
 * API: https://zj.v.api.aa1.cn/api/wenan-zl/
 */
const getRandomQuote = async () => {
  try {
    // 播放刷新动画
    if (refreshAnimation) {
      refreshAnimation.goToAndPlay(0, true)
    }

    try {
      const response = await fetch('https://zj.v.api.aa1.cn/api/wenan-zl/?type=json')
      const data = await response.json()
      if (data && data.msg) {
        currentQuote.value = data.msg
        // 触发文字生成效果
        typeText(data.msg)
        return
      }
    } catch (error) {
      console.log('API请求失败,使用本地数据')
    }

    // 如果API失败,使用本地数据
    const randomIndex = Math.floor(Math.random() * localInspiringQuotes.length)
    const quote = localInspiringQuotes[randomIndex]
    currentQuote.value = quote
    // 触发文字生成效果
    typeText(quote)

  } catch (error) {
    console.error('获取文案失败:', error)
    showMessage(`获取文案失败: ${error instanceof Error ? error.message : '请稍后重试'}`, 'error')
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
