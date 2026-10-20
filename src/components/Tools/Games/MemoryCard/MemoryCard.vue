<template>
  <div class="min-h-screen memory-card-page">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="memory-card-panel bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h1 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">记忆翻牌</span>
            </div>
          </h1>
          <p class="text-gray-500 text-sm mt-6">翻牌配对小游戏</p>

          <!-- 温馨提示 -->
          <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">翻开卡片寻找相同的图案，考验你的瞬间记忆力！</p>
            </div>
          </div>
        </div>

        <div ref="gameContainer"
          class="memory-game-container w-full bg-slate-100 flex flex-col items-center justify-center font-sans select-none rounded-xl py-8 min-h-[600px] relative overflow-hidden">
          
          <!-- 背景装饰 -->
          <div class="absolute inset-0 opacity-5 pointer-events-none" 
               style="background-image: radial-gradient(#6366f1 1px, transparent 1px); background-size: 24px 24px;">
          </div>

          <!-- 游戏控制栏 -->
          <div class="relative z-10 w-full max-w-4xl px-4 mb-8 flex flex-wrap justify-between items-center gap-4">
            
            <div class="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div class="flex flex-col items-center min-w-[60px]">
                <span class="text-xs text-gray-400 uppercase font-bold">步数</span>
                <span class="text-xl font-bold text-slate-700">{{ moves }}</span>
              </div>
              <div class="w-px h-8 bg-gray-200"></div>
              <div class="flex flex-col items-center min-w-[60px]">
                <span class="text-xs text-gray-400 uppercase font-bold">用时</span>
                <span class="text-xl font-bold text-slate-700">{{ formatTime(timer) }}</span>
              </div>
            </div>

            <div class="memory-game-actions flex flex-wrap items-center gap-2">
              <select v-model="difficulty" aria-label="游戏难度" @change="initGame"
                class="bg-white border-none rounded-lg px-4 py-2 text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                <option value="easy">简单 (4x4)</option>
                <option value="hard">困难 (6x6)</option>
              </select>
              
              <button type="button" @click="initGame"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>重置</span>
              </button>

              <button type="button" @click="toggleFullscreen" class="bg-white hover:bg-gray-50 text-slate-600 p-2 rounded-lg shadow-sm transition-colors" title="全屏模式" aria-label="切换游戏全屏模式">
                <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 游戏卡片网格 -->
          <div class="memory-board-viewport relative z-10 w-full max-w-4xl px-4" role="region" aria-label="记忆翻牌棋盘，可横向滚动" tabindex="0">
            <div class="memory-card-grid grid transition-all duration-300"
              :class="difficulty === 'easy' ? 'memory-card-grid--easy grid-cols-4' : 'memory-card-grid--hard grid-cols-6'">
              
              <button v-for="card in cards" :key="card.id" type="button"
                class="memory-card aspect-square perspective-1000 cursor-pointer"
                :aria-label="card.isFlipped || card.isMatched ? '卡片 ' + (card.id + 1) + '：' + card.content : '翻开第 ' + (card.id + 1) + ' 张卡片'"
                :aria-pressed="card.isFlipped || card.isMatched"
                @click="flipCard(card)">
                <div class="relative w-full h-full transition-transform duration-500 transform-style-3d shadow-md rounded-xl"
                  :class="{ 'rotate-y-180': card.isFlipped || card.isMatched }">
                  
                  <!-- 背面 (未翻开) -->
                  <div class="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center border-2 border-white/20">
                    <span class="text-2xl text-white opacity-50">?</span>
                  </div>
                  
                  <!-- 正面 (已翻开) -->
                  <div class="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl flex items-center justify-center border-2"
                    :class="card.isMatched ? 'border-green-400 bg-green-50' : 'border-indigo-200'">
                    <span class="text-3xl sm:text-4xl select-none transform transition-transform" 
                      :class="{ 'scale-125': card.isMatched }">
                      {{ card.content }}
                    </span>
                  </div>

                </div>
              </button>

            </div>
          </div>
          <p v-if="difficulty === 'hard'" class="memory-board-hint relative z-10 mt-3 px-4 text-xs text-slate-500">屏幕较窄时，可在棋盘内横向滑动查看全部卡片。</p>

          <!-- 胜利弹窗 -->
          <div v-if="isWon" class="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl animate-bounce-in">
              <div class="text-6xl mb-4">🎉</div>
              <h3 class="text-2xl font-bold text-slate-800 mb-2">恭喜胜利!</h3>
              <p class="text-slate-500 mb-6">你用 {{ moves }} 步在 {{ formatTime(timer) }} 内完成了挑战！</p>
              <button type="button" @click="initGame"
                class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                再玩一次
              </button>
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
 * @createDate 2025-12-12
 */
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

// 游戏配置
const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', 'cow', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦']
// 替换 cow 为 🐮
EMOJIS[11] = '🐮'

interface Card {
  id: number
  content: string
  isFlipped: boolean
  isMatched: boolean
}

// 状态
const difficulty = ref<'easy' | 'hard'>('easy')
const cards = ref<Card[]>([])
const moves = ref(0)
const timer = ref(0)
const isWon = ref(false)
const isFullscreen = ref(false)
const gameContainer = ref<HTMLElement | null>(null)

let timerId: any = null
let flippedCards: Card[] = []
let isLocking = false // 锁定点击，防止一次翻多张

// 初始化游戏
const initGame = () => {
  // 重置状态
  moves.value = 0
  timer.value = 0
  isWon.value = false
  flippedCards = []
  isLocking = false
  clearInterval(timerId)
  
  // 生成卡片
  const pairCount = difficulty.value === 'easy' ? 8 : 18 // 16张 或 36张
  const selectedEmojis = EMOJIS.slice(0, pairCount)
  const cardContents = [...selectedEmojis, ...selectedEmojis]
  
  // 洗牌
  for (let i = cardContents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cardContents[i], cardContents[j]] = [cardContents[j], cardContents[i]]
  }
  
  cards.value = cardContents.map((emoji, index) => ({
    id: index,
    content: emoji,
    isFlipped: false,
    isMatched: false
  }))
  
  // 启动计时器
  timerId = setInterval(() => {
    timer.value++
  }, 1000)
}

// 翻牌逻辑
const flipCard = (card: Card) => {
  if (isLocking || card.isFlipped || card.isMatched || isWon.value) return
  
  card.isFlipped = true
  flippedCards.push(card)
  
  if (flippedCards.length === 2) {
    moves.value++
    isLocking = true
    
    const [card1, card2] = flippedCards
    
    if (card1.content === card2.content) {
      // 匹配成功
      card1.isMatched = true
      card2.isMatched = true
      flippedCards = []
      isLocking = false
      checkWin()
    } else {
      // 匹配失败
      setTimeout(() => {
        card1.isFlipped = false
        card2.isFlipped = false
        flippedCards = []
        isLocking = false
      }, 1000)
    }
  }
}

// 检查胜利
const checkWin = () => {
  if (cards.value.every(c => c.isMatched)) {
    isWon.value = true
    clearInterval(timerId)
  }
}

// 格式化时间
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// 全屏
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

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  initGame()
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  clearInterval(timerId)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})

</script>

<style scoped>
.memory-card-page { container-type: inline-size; container-name: memory-game; min-width: 0; }
.memory-board-viewport { max-width: 100%; overflow-x: auto; padding-block: 4px 12px; }
.memory-board-viewport:focus-visible, .memory-game-container button:focus-visible { outline: 2px solid var(--uied-color-primary); outline-offset: 3px; }
.memory-card-grid { margin-inline: auto; gap: 12px; }
.memory-card-grid--easy { width: 300px; max-width: 100%; min-width: 200px; }
.memory-card-grid--hard { width: 340px; max-width: 100%; min-width: 284px; }
.memory-card { min-width: 44px; min-height: 44px; padding: 0; background: transparent; border: 0; }
.memory-game-actions button, .memory-game-actions select { min-height: 44px; }
.memory-board-hint { display: none; }
@media (min-width: 640px) {
  .memory-card-grid { gap: 16px; }
  .memory-card-grid--easy { width: 400px; }
  .memory-card-grid--hard { width: 500px; }
}
@container memory-game (max-width: 600px) {
  .memory-card-panel { padding: 20px 12px; }
  .memory-card-panel h1 { font-size: 28px; line-height: 1.3; }
  .memory-card-panel h1 > div { padding-inline: 0; }
  .memory-game-actions { width: 100%; gap: 8px; }
  .memory-game-actions select { min-width: 0; flex: 1; font-size: 16px; padding-inline: 8px; }
  .memory-game-actions button { padding-inline: 10px; }
  .memory-card-grid { gap: 4px; }
  .memory-card-grid--hard { width: 340px; }
  .memory-card-grid--easy { min-width: 188px; }
  .memory-card span { font-size: 24px; }
  .memory-game-container { min-height: 0; padding-block: 24px; }
  .memory-board-viewport { padding-inline: 8px; }
  .memory-board-hint { display: block; }
}

.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
}
</style>
