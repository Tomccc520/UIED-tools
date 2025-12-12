<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">打字雨</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">Typing Rain</p>

          <!-- 温馨提示 -->
          <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">经典的打字雨游戏，锻炼你的打字速度和反应能力。</p>
            </div>
          </div>
        </div>

        <div ref="gameContainer"
          class="typing-rain-container relative w-full overflow-y-auto bg-gray-900 flex flex-col items-center justify-center font-sans text-white select-none rounded-xl py-8 min-h-[600px]">
          <!-- 背景图层 -->
          <div
            class="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 opacity-80 z-0 pointer-events-none rounded-xl">
          </div>
          <div
            class="city-skyline absolute bottom-0 left-0 right-0 h-1/3 bg-repeat-x z-0 opacity-40 pointer-events-none rounded-b-xl">
          </div>

          <!-- 游戏区域 -->
          <div class="relative w-full h-[600px] max-w-6xl z-10 flex flex-col">
            <!-- 顶部信息栏 -->
            <div
              class="flex justify-between items-center p-6 text-xl font-bold tracking-wider shadow-md bg-black/20 backdrop-blur-sm rounded-b-xl mx-4">
              <div class="flex items-center gap-6">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-400 uppercase">Score</span>
                  <span class="text-yellow-400 text-2xl">{{ score }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-400 uppercase">Lives</span>
                  <div class="flex text-red-500 text-2xl">
                    <span v-for="n in lives" :key="n">❤</span>
                    <span v-for="n in (maxLives - lives)" :key="`lost-${n}`" class="text-gray-600">❤</span>
                  </div>
                </div>
              </div>

              <div class="absolute left-1/2 transform -translate-x-1/2 text-center">
                <h1 class="text-2xl text-white font-extrabold tracking-widest drop-shadow-lg">
                  {{ language === 'cn' ? '打字雨' : 'TYPING RAIN' }}
                </h1>
                <div class="text-xs text-blue-300 mt-1">{{ language === 'cn' ? '中文版' : 'English Ver.' }}</div>
              </div>

              <div class="flex items-center gap-6">
                <div class="flex flex-col text-right">
                  <span class="text-xs text-gray-400 uppercase">Difficulty</span>
                  <span class="text-blue-400 text-xl">{{ getDifficultyLabel() }}</span>
                </div>
                <div class="flex flex-col text-right">
                  <span class="text-xs text-gray-400 uppercase">Accuracy</span>
                  <span class="text-green-400 text-xl">{{ accuracy }}%</span>
                </div>
                <!-- 全屏按钮 -->
                <button @click="toggleFullscreen" class="text-white hover:text-blue-300 transition-colors" title="全屏模式">
                  <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 游戏主画面 -->
            <div class="flex-1 relative overflow-hidden" ref="gameArea">
              <!-- 下落的单词 -->
              <transition-group name="fade">
                <div v-for="word in activeWords" :key="word.id"
                  class="absolute transform -translate-x-1/2 transition-top duration-100 ease-linear flex flex-col items-center"
                  :style="{ top: word.y + 'px', left: word.x + '%' }">
                  <!-- 雨滴效果 -->
                  <div class="w-0.5 h-8 bg-blue-400/50 mb-1 rounded-full animate-pulse"></div>
                  <!-- 单词文本 -->
                  <div
                    class="px-3 py-1 rounded-lg backdrop-blur-md shadow-lg border border-white/10 text-lg font-bold transition-all duration-200"
                    :class="[
                      word.isMatched ? 'bg-green-500/80 text-white scale-110' : 'bg-blue-600/40 text-blue-100',
                      word.isError ? 'bg-red-500/80 animate-shake' : ''
                    ]">
                    {{ word.text }}
                  </div>
                </div>
              </transition-group>

              <!-- 开始/结束 遮罩层 -->
              <div v-if="gameStatus !== 'playing'"
                class="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 rounded-xl">
                <div
                  class="bg-white/10 p-8 rounded-2xl border border-white/20 shadow-2xl text-center max-w-md w-full mx-4 backdrop-blur-md">
                  <h2
                    class="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {{ gameStatus === 'start' ? (language === 'cn' ? '准备好了吗？' : 'Ready to Type?') : (language === 'cn' ?
                      '游戏结束' : 'Game Over') }}
                  </h2>

                  <div v-if="gameStatus === 'gameover'" class="my-6 space-y-2">
                    <div class="text-gray-300 text-sm uppercase tracking-wider">Final Score</div>
                    <div class="text-6xl font-bold text-yellow-400 mb-4">{{ score }}</div>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div class="bg-white/5 p-2 rounded">
                        <div class="text-gray-400">Max Combo</div>
                        <div class="text-white font-bold">{{ maxCombo }}</div>
                      </div>
                      <div class="bg-white/5 p-2 rounded">
                        <div class="text-gray-400">Accuracy</div>
                        <div class="text-white font-bold">{{ accuracy }}%</div>
                      </div>
                    </div>
                  </div>

                  <p v-else class="text-gray-300 my-6 text-lg">
                    {{ language === 'cn' ? '输入屏幕上掉落的文字，不要让它们落地！' : 'Type the falling words before they hit the ground!'
                    }}
                  </p>

                  <button @click="startGame"
                    class="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-blue-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95">
                    <span
                      class="absolute inset-0 w-full h-full -mt-1 rounded-full opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
                    <span class="relative flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ gameStatus === 'start' ? (language === 'cn' ? '开始游戏' : 'Start Game') : (language === 'cn' ?
                        '再玩一次' :
                        'Play Again') }}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 输入框区域 -->
            <div class="p-6 bg-black/40 backdrop-blur-md border-t border-white/10 relative z-20">
              <div class="max-w-2xl mx-auto relative">
                <input ref="inputField" type="text" v-model="inputValue" @input="handleInput"
                  @compositionstart="handleCompositionStart" @compositionend="handleCompositionEnd"
                  class="w-full bg-gray-800/80 border-2 border-blue-500/50 rounded-xl px-6 py-4 text-2xl text-center text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-inner"
                  :placeholder="gameStatus === 'playing' ? (language === 'cn' ? '在此输入...' : 'Type here...') : ''"
                  :disabled="gameStatus !== 'playing'" autocomplete="off">
                <div class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm hidden md:block">
                  {{ language === 'cn' ? '回车/空格 清空' : 'Auto Clear' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { englishWords, chineseWords } from './wordData'

const route = useRoute()

// 游戏状态类型定义
type GameStatus = 'start' | 'playing' | 'gameover'
interface Word {
  id: number
  text: string
  x: number // 百分比 0-100
  y: number // 像素
  speed: number
  isMatched: boolean
  isError: boolean
}

// 核心状态
const language = ref<'cn' | 'en'>('en')
const gameStatus = ref<GameStatus>('start')
const score = ref(0)
const lives = ref(5)
const maxLives = 5
const inputValue = ref('')
const activeWords = ref<Word[]>([])
const gameArea = ref<HTMLElement | null>(null)
const gameContainer = ref<HTMLElement | null>(null)
const inputField = ref<HTMLInputElement | null>(null)
const isFullscreen = ref(false)

// 统计数据
const totalTyped = ref(0)
const correctTyped = ref(0)
const combo = ref(0)
const maxCombo = ref(0)

// 游戏配置
let animationFrameId: number
let spawnIntervalId: any
let wordIdCounter = 0
let difficultyLevel = 1
let isComposing = false // 输入法状态

// 全屏切换
const toggleFullscreen = () => {
  if (!gameContainer.value) return

  if (!document.fullscreenElement) {
    gameContainer.value.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`)
    })
  } else {
    document.exitFullscreen()
  }
}

// 监听全屏变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 计算属性
const accuracy = computed(() => {
  if (totalTyped.value === 0) return 100
  return Math.round((correctTyped.value / totalTyped.value) * 100)
})

const getDifficultyLabel = () => {
  if (difficultyLevel < 3) return 'Easy'
  if (difficultyLevel < 6) return 'Normal'
  if (difficultyLevel < 9) return 'Hard'
  return 'Insane'
}

// 游戏逻辑
const resetGame = () => {
  gameStatus.value = 'start'
  score.value = 0
  lives.value = maxLives
  activeWords.value = []
  inputValue.value = ''
  difficultyLevel = 1
  combo.value = 0
  maxCombo.value = 0
  totalTyped.value = 0
  correctTyped.value = 0
}

const startGame = () => {
  resetGame()
  gameStatus.value = 'playing'
  wordIdCounter = 0

  // 聚焦输入框
  setTimeout(() => {
    inputField.value?.focus()
  }, 100)

  // 启动循环
  lastTime = performance.now()
  gameLoop()
  spawnWord() // 立即生成一个

  // 设置生成定时器（动态调整）
  scheduleNextSpawn()
}

const scheduleNextSpawn = () => {
  if (gameStatus.value !== 'playing') return

  const baseInterval = 2000
  const minInterval = 500
  const interval = Math.max(minInterval, baseInterval - (difficultyLevel * 100))

  spawnIntervalId = setTimeout(() => {
    spawnWord()
    scheduleNextSpawn()
  }, interval)
}

const spawnWord = () => {
  const wordList = language.value === 'cn' ? chineseWords : englishWords
  const text = wordList[Math.floor(Math.random() * wordList.length)]

  // 随机位置 (10% - 90%)
  const x = 10 + Math.random() * 80

  // 基础速度
  const baseSpeed = 1
  const speed = baseSpeed + (difficultyLevel * 0.2) + (Math.random() * 0.5)

  activeWords.value.push({
    id: wordIdCounter++,
    text,
    x,
    y: -50,
    speed,
    isMatched: false,
    isError: false
  })
}

let lastTime = 0
const gameLoop = () => {
  if (gameStatus.value !== 'playing') return

  const now = performance.now()
  const deltaTime = (now - lastTime) / 16.67 // Normalize to ~60fps
  lastTime = now

  const gameHeight = gameArea.value?.clientHeight || 600

  // 更新位置
  activeWords.value.forEach(word => {
    word.y += word.speed * deltaTime
  })

  // 检查是否落地
  for (let i = activeWords.value.length - 1; i >= 0; i--) {
    const word = activeWords.value[i]
    if (word.y > gameHeight) {
      // 落地扣分扣血
      lives.value--
      combo.value = 0
      activeWords.value.splice(i, 1)

      if (lives.value <= 0) {
        endGame()
        return
      }
    }
  }

  // 难度随分数提升
  difficultyLevel = 1 + Math.floor(score.value / 100)

  animationFrameId = requestAnimationFrame(gameLoop)
}

const endGame = () => {
  gameStatus.value = 'gameover'
  clearTimeout(spawnIntervalId)
  cancelAnimationFrame(animationFrameId)
}

// 输入处理
const handleCompositionStart = () => {
  isComposing = true
}

const handleCompositionEnd = (e: CompositionEvent) => {
  isComposing = false
  // 重新触发输入检测，因为 compositionend 后 v-model 才会更新
  handleInput()
}

const handleInput = () => {
  if (isComposing) return

  const val = inputValue.value.trim()
  if (!val) return

  // 检查是否有匹配
  const matchIndex = activeWords.value.findIndex(w => w.text === val)

  if (matchIndex !== -1) {
    // 匹配成功
    const word = activeWords.value[matchIndex]
    word.isMatched = true

    // 增加分数
    const points = 10 + (difficultyLevel * 2) + (word.text.length)
    score.value += points

    // 连击
    combo.value++
    if (combo.value > maxCombo.value) maxCombo.value = combo.value

    // 统计
    correctTyped.value++
    totalTyped.value++

    // 移除单词 (稍微延迟一点让用户看到绿色高亮)
    setTimeout(() => {
      const idx = activeWords.value.findIndex(w => w.id === word.id)
      if (idx !== -1) activeWords.value.splice(idx, 1)
    }, 100)

    // 清空输入框
    inputValue.value = ''
  } else {
    // 检查是否是部分匹配（可选：如果想做逐字匹配的话）
    // 这里我们只做整词匹配，所以如果输入长度超过且未匹配，可能就是错了
    // 但对于拼音输入法，中间状态不应该算错
    // 简单起见，只有当用户按下回车或者明确输入完成但没匹配时才算错？
    // 现在的逻辑是：只要输入框内容等于某个单词，就消除。不等于就继续输。

    // 如果是英文模式，可以检查是否有前缀匹配，如果没有，则标红输入框（这里简化处理）
  }
}

// 键盘事件监听：回车清空（可选，防止卡死）
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === 'Escape') {
    inputValue.value = ''
  }
}

// 监听路由变化设置语言
watch(() => route.path, (path) => {
  if (path.includes('cn')) {
    language.value = 'cn'
  } else {
    language.value = 'en'
  }
  resetGame()
}, { immediate: true })

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  clearTimeout(spawnIntervalId)
  cancelAnimationFrame(animationFrameId)
})

</script>

<style scoped>
.city-skyline {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 320' preserveAspectRatio='none'%3E%3Cpath fill='%23111827' d='M0,320V120h40v60h40v-40h50v80h30v-90h60v50h40v-70h50v100h30v-40h60v80h40v-60h50v90h30v-30h60v70h40v-80h50v110h30v-50h60v90h40v-40h50v80h30v-100h60v60h40v-50h50v90h30v-70h60v100h40v-30h50v80z'/%3E%3C/svg%3E");
  background-size: 1200px 100%;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(-50%);
  }

  25% {
    transform: translateX(calc(-50% - 5px));
  }

  75% {
    transform: translateX(calc(-50% + 5px));
  }
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}

/* 隐藏滚动条 */
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
</style>
