<!--
* @file Funny.vue
* @description 随机搞笑文案生成器
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-1-9
*
* 功能特性：
* 1. 自动获取最新搞笑文案
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
                @click="getRandomCopy">随机搞笑文案</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">每次都能获取最新的文案</p>
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
          <button @click="getRandomCopy"
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
                <h4 class="text-base font-medium text-gray-900">智能生成</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                智能算法生成，每次都能获取一篇有趣的搞笑文案
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
                支持实时更新，随时获取新的搞笑文案
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
                所有文案均来自网络精选，经过筛选和整理，确保内容的趣味性。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">更新频率如何？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持实时更新，您可以随时点击"换一个"按钮获取新的文案内容。
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
const hotTools = getHotTools(8)  // 获取8个热门工具
const newTools = getNewTools(8)  // 获取8个新品工具
const utilityTools = getUtilityTools(8)  // 获取8个实用工具
const relatedTools = getRelatedTools(route.path, 6, 2)  // 获取6个同类工具和2个其他类工具，总共8个

const currentCopy = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const refreshContainer = ref<HTMLElement | null>(null)
let refreshAnimation: any = null
const displayText = ref('')
const textContainer = ref<HTMLElement | null>(null)
let typingTimer: number | null = null

// 本地备用数据
const localFunnyQuotes = [
  "你知道投资和喝酒的共同点吗？一开始都会觉得自己很清醒。",
  "别人的生活就像你的手机屏幕一样，看起来都很高清，但擦一擦全是指纹。",
  "减肥就是要让嘴巴和胃想吃的时候，告诉他们大脑在控制。",
  "有时候我很想运动，但我的沙发总是挽留我。",
  "我的钱包就像洋葱，每打开一次就会哭一次。",
  "我不是懒，我只是在充电，可惜充电器是个冒牌货。",
  "熬夜对身体不好，但是不熬夜对心情不好。",
  "我的社交恐惧症主要表现在，一看到信息就秒回，就怕别人觉得我不想回。",
  "我不是胖，只是在给自己的快乐加个外壳。",
  "有时候觉得自己很可爱，照照镜子发现是错觉。",
  "我的脑子里住着一个段子手，可惜他经常罢工。",
  "我的存款就像一个美丽的误会，转眼就成了上个月的事。",
  "我不是宅，我只是在家里发展得太好了。",
  "别人的朋友圈都在发美食，我的朋友圈都在发表情包。",
  "我的生活很规律，规律地乱七八糟。",
  "我不是选择困难症，我只是怕选错了后悔。",
  "我的购物车就像一个许愿池，很多东西都躺在里面等奇迹发生。",
  "我不是不想努力，只是还没找到适合我的努力方向。",
  "我的厨艺水平就是，连泡面都能煮出不同的味道。",
  "有时候觉得自己很厉害，直到遇到一道数学题。",
  "我的衣柜就像一个平行时空，永远找不到想穿的那件衣服。",
  "我不是起床困难，只是被子太有魅力了。",
  "我的工作效率就像WiFi信号，时强时弱。",
  "别人都在晒朋友圈，我在研究怎么点赞不露痕迹。",
  "我的运动细胞都用来玩手机了。",
  "我不是不想谈恋爱，只是我的脱单技能点歪了。",
  "我的记性很好，就是有时候忘记自己记性很好。",
  "别人都在为房子发愁，我连房子的愁都想不起来愁。",
  "我的理财能力就是，能让钱包瘦得很快。",
  "我不是不想早起，只是我的被子太会挽留我了。",
  "我的社交圈就像一个点，除了自己谁都不认识。",
  "别人都在晒旅游照片，我在研究怎么P图。",
  "我的厨艺水平就是，连方便面都能煮出文艺范。",
  "我不是懒得化妆，只是觉得素颜也挺好看的。",
  "我的购物车就像一个博物馆，收藏了各种想买买不起的东西。",
  "别人都在秀恩爱，我在研究怎么屏蔽朋友圈。",
  "我的运动细胞都用来打游戏了。",
  "我不是不想减肥，只是我的意志力太弱了。",
  "我的存款就像一个童话故事，越听越觉得不真实。",
  "别人都在发朋友圈，我在研究怎么悄悄点赞。",
  "我的工作效率就像手机电量，总是在关键时刻不够用。",
  "我不是不想运动，只是我的沙发太舒服了。",
  "我的社交能力就像WiFi信号，时有时无。",
  "别人都在晒美食，我在研究怎么P图让泡面看起来更高级。",
  "我的理财能力就是，能让钱包保持苗条。",
  "我不是不想早睡，只是我的手机太会聊天了。",
  "我的朋友圈就像一个表情包博物馆。",
  "别人都在发自拍，我在研究怎么找最佳角度。",
  "我的生活很简单，就是每天都在想怎么让生活不简单。",
  "我不是不想谈恋爱，只是我的脱单技能树点错了方向。"
]

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

const getRandomCopy = async () => {
  try {
    // 播放刷新动画
    if (refreshAnimation) {
      refreshAnimation.goToAndPlay(0, true)
    }

    try {
      const response = await fetch('https://zj.v.api.aa1.cn/api/wenan-gaoxiao/?type=json')
      const data = await response.json()
      if (data && data.msg) {
        currentCopy.value = data.msg
        // 触发文字生成效果
        typeText(data.msg)
        return
      }
    } catch (error) {
      console.log('API请求失败,使用本地数据')
    }

    // 如果API失败,使用本地数据
    const randomIndex = Math.floor(Math.random() * localFunnyQuotes.length)
    const quote = localFunnyQuotes[randomIndex]
    currentCopy.value = quote
    // 触发文字生成效果
    typeText(quote)

  } catch (error) {
    console.error('获取文案失败:', error)
    showMessage('获取文案失败，请稍后重试', 'error')
  }
}

const copyText = async () => {
  try {
    const success = await copy(currentCopy.value)
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

// 添加标题点击效果
const handleTitleClick = () => {
  // 触发一次随机生成
  getRandomCopy()

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

// 初始化时生成一条文案
getRandomCopy()
</script>

<style scoped>
.typing-text {
  white-space: pre-wrap;
  word-break: break-word;
}

@keyframes blink-cursor {

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
  animation: blink-cursor 1s infinite;
  margin-left: 2px;
}
</style>
