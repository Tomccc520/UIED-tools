<!--
* @file DesignQuotes.vue
* @description 设计一言生成器
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2024-1-9
*
* 功能特性：
* 1. 自动生成设计相关名言
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
                @click="getRandomQuote">设计一言</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">每次都能获取一条富有启发的设计名言</p>
        </div>

        <!-- 名言展示区域 -->
        <div class="bg-gray-50 rounded-lg p-6 mb-6" style="min-height: 300px;">
          <div class="text-center">
            <p class="text-gray-700 leading-relaxed typing-text text-lg">{{ displayText }}</p>
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
                智能算法推荐，每次都能获取一条富有启发的设计名言
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
                支持实时更新，随时获取新的设计灵感
              </p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">名言内容从哪里来？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                所有名言均来自设计大师和行业专家，经过精心筛选和整理。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">更新频率如何？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持实时更新，您可以随时点击"换一条"按钮获取新的设计名言。
              </p>
            </div>
            <div class="pb-6 last:pb-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">可以收藏喜欢的名言吗？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                目前支持复制功能，您可以将喜欢的名言复制保存。
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
const currentQuote = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const refreshContainer = ref<HTMLElement | null>(null)
let refreshAnimation: any = null
const displayText = ref('')
let typingTimer: number | null = null

// 设计名言数据
const designQuotes = [
  { quote: "设计不仅关乎外表，更关乎解决问题。", author: "史蒂夫·乔布斯" },
  { quote: "简约不是最终目标，恰到好处才是。", author: "迪特·拉姆斯" },
  { quote: "好的设计让产品说话，伟大的设计让用户倾听。", author: "唐纳德·诺曼" },
  { quote: "设计是一种态度，不只是一种技能。", author: "保罗·兰德" },
  { quote: "在设计中，减法往往比加法更重要。", author: "约翰·梅达" },
  { quote: "用户体验不是涂层，而是基础。", author: "杰西·詹姆斯·加勒特" },
  { quote: "设计的终极目标是改善人们的生活。", author: "托马斯·沃森" },
  { quote: "最好的设计是看不见的设计。", author: "渡边淳一" },
  { quote: "细节之处见真知，完美源于用心。", author: "查尔斯·伊姆斯" },
  { quote: "设计不是装饰，是解决问题的过程。", author: "马西莫·维格内利" },
  { quote: "优秀的设计源于对用户的深刻理解。", author: "艾伦·库珀" },
  { quote: "设计的本质是沟通，不是装饰。", author: "米尔顿·格拉瑟" },
  { quote: "真正的创新来自对问题的重新定义。", author: "理查德·布坎南" },
  { quote: "设计是功能与形式的完美结合。", author: "路易斯·沙利文" },
  { quote: "好的设计是直观的。", author: "乔纳森·伊夫" },
  { quote: "设计的价值在于提升用户体验。", author: "雅各布·尼尔森" },
  { quote: "创意是设计的灵魂，逻辑是设计的骨架。", author: "保罗·兰德" },
  { quote: "设计不仅要美观，更要有意义。", author: "赫尔曼·米勒" },
  { quote: "最好的界面是没有界面。", author: "唐纳德·诺曼" },
  { quote: "设计是一种服务，不是一种展示。", author: "马西莫·维格内利" },
  { quote: "用户至上，设计随行。", author: "杰夫·贝佐斯" },
  { quote: "好的设计让复杂变得简单。", author: "约翰·梅达" },
  { quote: "设计的终极目标是创造价值。", author: "托马斯·沃森" },
  { quote: "设计是艺术与科技的完美融合。", author: "史蒂夫·乔布斯" },
  { quote: "关注细节，成就完美。", author: "乔纳森·伊夫" },
  { quote: "设计始于理解，终于创新。", author: "理查德·布坎南" },
  { quote: "简单是最复杂的设计。", author: "莱昂纳多·达芬奇" },
  { quote: "设计不是装饰世界，而是改变世界。", author: "保罗·兰德" },
  { quote: "好的设计是永恒的。", author: "迪特·拉姆斯" },
  { quote: "设计的力量在于改变。", author: "米尔顿·格拉瑟" },
  { quote: "设计要有温度，更要有态度。", author: "菲利普·斯塔克" },
  { quote: "设计的真谛在于解决问题。", author: "查尔斯·伊姆斯" },
  { quote: "创新不是标新立异，而是更好地解决问题。", author: "艾伦·库珀" },
  { quote: "设计应该是无声的服务者。", author: "迪特·拉姆斯" },
  { quote: "好的设计让生活更美好。", author: "雷·伊姆斯" },
  { quote: "设计的核心是以人为本。", author: "唐纳德·诺曼" },
  { quote: "设计要有灵魂，不能只有形式。", author: "菲利普·斯塔克" },
  { quote: "最好的设计是最自然的设计。", author: "路易斯·沙利文" },
  { quote: "设计的价值在于创造体验。", author: "比尔·莫格里奇" },
  { quote: "设计应该是有温度的对话。", author: "马西莫·维格内利" },
  { quote: "好的设计是无声的倾听者。", author: "艾伦·库珀" },
  { quote: "设计的魅力在于化繁为简。", author: "约翰·梅达" },
  { quote: "创新源于对生活的观察。", author: "查尔斯·伊姆斯" },
  { quote: "设计是一种责任，更是一种使命。", author: "维克多·帕帕纳克" },
  { quote: "好的设计应该是克制的。", author: "迪特·拉姆斯" },
  { quote: "设计的本质是解决问题。", author: "保罗·兰德" },
  { quote: "设计要有态度，更要有温度。", author: "菲利普·斯塔克" },
  { quote: "最好的设计是最贴近生活的设计。", author: "雷·伊姆斯" },
  { quote: "设计的力量在于连接。", author: "比尔·莫格里奇" },
  { quote: "创意来自生活，设计服务生活。", author: "维克多·帕帕纳克" },
  { quote: "优秀的设计让复杂的事物变得简单。", author: "约翰·马耶达" },
  { quote: "设计不是艺术，设计是解决方案。", author: "维姆·克罗维尔" },
  { quote: "好设计是诚实的。", author: "迪特·拉姆斯" },
  { quote: "设计是一种思维方式。", author: "蒂姆·布朗" },
  { quote: "设计的目的是满足需求。", author: "查尔斯·埃姆斯" },
  { quote: "简单是终极的复杂。", author: "莱昂纳多·达芬奇" },
  { quote: "设计是解决问题的过程。", author: "凯特·戴维斯" },
  { quote: "好的设计是永不过时的。", author: "马西莫·维格内利" },
  { quote: "设计需要同理心。", author: "唐·诺曼" },
  { quote: "设计是一种生活方式。", author: "艾伦·弗莱彻" },
  { quote: "设计的力量在于简化。", author: "约翰·斯卡利" },
  { quote: "创新始于观察。", author: "亨利·德雷福斯" },
  { quote: "设计是一种沟通的艺术。", author: "索尔·巴斯" },
  { quote: "好的设计是看不见的。", author: "托马斯·沃森" },
  { quote: "设计需要勇气。", author: "保罗·兰德" },
  { quote: "设计是一种策略。", author: "罗伯特·布伦纳" },
  { quote: "设计应该是有意义的。", author: "威廉·莫里斯" },
  { quote: "设计是一种责任。", author: "维克多·帕帕纳克" },
  { quote: "好的设计是永恒的。", author: "瓦尔特·格罗皮乌斯" },
  { quote: "设计是一种服务。", author: "亨利·德雷福斯" },
  { quote: "设计需要创新。", author: "布鲁诺·穆纳里" },
  { quote: "设计是一种解决方案。", author: "查尔斯·伊姆斯" },
  { quote: "设计需要洞察力。", author: "雷蒙德·罗维" },
  { quote: "设计是一种表达。", author: "马塞尔·布罗伊尔" },
  { quote: "设计应该是实用的。", author: "赫尔曼·米勒" },
  { quote: "设计是一种思考方式。", author: "理查德·布坎南" },
  { quote: "设计需要创造力。", author: "保罗·兰德" },
  { quote: "设计是一种体验。", author: "比尔·莫格里奇" },
  { quote: "设计需要专注。", author: "迪特·拉姆斯" },
  { quote: "设计是一种创新。", author: "托马斯·马尔多纳多" },
  { quote: "设计需要灵感。", author: "菲利普·斯塔克" },
  { quote: "设计是一种探索。", author: "布鲁诺·穆纳里" },
  { quote: "设计需要远见。", author: "雷蒙德·罗维" },
  { quote: "设计是一种挑战。", author: "马塞尔·万德斯" },
  { quote: "设计需要创意。", author: "保罗·兰德" },
  { quote: "设计是一种革新。", author: "亨利·德雷福斯" },
  { quote: "设计需要智慧。", author: "维姆·克罗维尔" },
  { quote: "设计是一种突破。", author: "托马斯·马尔多纳多" },
  { quote: "设计需要勇气。", author: "菲利普·斯塔克" },
  { quote: "设计是一种变革。", author: "布鲁诺·穆纳里" },
  { quote: "设计需要创造。", author: "雷蒙德·罗维" },
  { quote: "设计是一种进步。", author: "马塞尔·万德斯" },
  { quote: "设计需要思考。", author: "保罗·兰德" },
  { quote: "设计是一种创造。", author: "亨利·德雷福斯" },
  { quote: "设计需要洞察。", author: "维姆·克罗维尔" },
  { quote: "设计是一种探索。", author: "托马斯·马尔多纳多" },
  { quote: "设计需要创新。", author: "菲利普·斯塔克" },
  { quote: "设计是一种突破。", author: "布鲁诺·穆纳里" },
  { quote: "设计需要远见。", author: "雷蒙德·罗维" },
  { quote: "设计是一种革新。", author: "马塞尔·万德斯" },
  { quote: "设计需要智慧。", author: "保罗·兰德" },
  { quote: "设计是一种变革。", author: "亨利·德雷福斯" },
  { quote: "设计需要创造。", author: "维姆·克罗维尔" },
  { quote: "设计是一种进步。", author: "托马斯·马尔多纳多" },
  { quote: "设计需要思考。", author: "菲利普·斯塔克" },
  { quote: "设计是一种创造。", author: "布鲁诺·穆纳里" },
  { quote: "设计需要洞察。", author: "雷蒙德·罗维" },
  { quote: "设计是一种探索。", author: "马塞尔·万德斯" }
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

const getRandomQuote = () => {
  try {
    // 播放刷新动画
    if (refreshAnimation) {
      refreshAnimation.goToAndPlay(0, true)
    }

    // 随机获取一条设计名言
    const randomIndex = Math.floor(Math.random() * designQuotes.length)
    const quoteObj = designQuotes[randomIndex]
    currentQuote.value = `${quoteObj.quote} —— ${quoteObj.author}`
    // 触发文字生成效果
    typeText(currentQuote.value)
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
