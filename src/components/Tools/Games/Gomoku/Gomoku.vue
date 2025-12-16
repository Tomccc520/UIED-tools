<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">五子棋</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">经典的双人对弈游戏，五子连珠即可获胜。</p>
        </div>

        <div class="flex flex-col items-center gap-6">
          <!-- 游戏状态栏 -->
          <div class="flex justify-between items-center w-full max-w-[600px] px-4 py-3 bg-gray-50 rounded-lg shadow-inner">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full bg-black shadow-sm"></div>
              <span :class="{'font-bold text-blue-600': currentPlayer === 1}">黑方</span>
              <span v-if="currentPlayer === 1" class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">思考中...</span>
            </div>
            <div class="text-lg font-bold text-gray-700">
              <span v-if="winner">
                {{ winner === 1 ? '黑方' : '白方' }} 获胜！🎉
              </span>
              <span v-else>
                第 {{ stepCount }} 手
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="currentPlayer === 2" class="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">思考中...</span>
              <span :class="{'font-bold text-orange-600': currentPlayer === 2}">白方</span>
              <div class="w-4 h-4 rounded-full bg-white border border-gray-300 shadow-sm"></div>
            </div>
          </div>

          <!-- 棋盘区域 -->
          <div class="relative bg-[#DEB887] p-4 rounded shadow-xl select-none touch-none overflow-hidden">
             <!-- 棋盘网格 -->
            <div class="grid grid-cols-15 gap-0 border-2 border-black relative z-0" 
                 style="width: min(90vw, 600px); height: min(90vw, 600px); grid-template-columns: repeat(15, 1fr); grid-template-rows: repeat(15, 1fr);">
              <div v-for="(cell, index) in 225" :key="index" 
                   class="relative border-[0.5px] border-black/30 flex items-center justify-center cursor-pointer hover:bg-black/5"
                   @click="handleMove(index)">
                   
                <!-- 天元和星位点缀 -->
                <div v-if="isStarPoint(index)" class="absolute w-1.5 h-1.5 bg-black rounded-full"></div>

                <!-- 棋子 -->
                <div v-if="board[index] !== 0" 
                     class="w-[80%] h-[80%] rounded-full shadow-lg transform transition-all duration-200 ease-out scale-100"
                     :class="[
                       board[index] === 1 
                         ? 'bg-gradient-to-br from-gray-700 to-black' 
                         : 'bg-gradient-to-br from-white to-gray-200'
                     ]">
                  <!-- 最新落子标记 -->
                  <div v-if="lastMove === index" class="absolute inset-0 flex items-center justify-center">
                    <div class="w-2 h-2 rounded-full" :class="board[index] === 1 ? 'bg-white/50' : 'bg-black/50'"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 控制按钮 -->
          <div class="flex gap-4">
            <button @click="resetGame" 
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
              重新开始
            </button>
            <button @click="undoMove" :disabled="history.length === 0 || !!winner"
                    class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
              悔棋
            </button>
          </div>
        </div>

        <!-- 规则说明 -->
        <div class="mt-8 bg-yellow-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 class="font-bold text-yellow-800 mb-2">💡 游戏规则</h3>
          <ul class="list-disc list-inside text-sm text-yellow-800 space-y-1">
            <li>黑方先手，白方后手，交替落子。</li>
            <li>任一方在横、竖、斜任意方向连成五子（或以上）即获胜。</li>
            <li>支持双人同屏对战。</li>
          </ul>
        </div>

      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

// 15x15 棋盘，0: 空, 1: 黑, 2: 白
const BOARD_SIZE = 15
const board = ref<number[]>(new Array(BOARD_SIZE * BOARD_SIZE).fill(0))
const currentPlayer = ref<1 | 2>(1) // 1: 黑, 2: 白
const winner = ref<1 | 2 | null>(null)
const history = ref<number[]>([]) // 记录落子位置，用于悔棋
const lastMove = computed(() => history.value[history.value.length - 1] ?? -1)
const stepCount = computed(() => history.value.length)

// 星位坐标 (15x15)
const starPoints = [
  3 * 15 + 3, 3 * 15 + 11,
  7 * 15 + 7,
  11 * 15 + 3, 11 * 15 + 11
]

const isStarPoint = (index: number) => {
  return starPoints.includes(index)
}

const handleMove = (index: number) => {
  if (winner.value || board.value[index] !== 0) return

  // 落子
  board.value[index] = currentPlayer.value
  history.value.push(index)

  // 检查胜负
  if (checkWin(index, currentPlayer.value)) {
    winner.value = currentPlayer.value
  } else {
    // 切换选手
    currentPlayer.value = currentPlayer.value === 1 ? 2 : 1
  }
}

const checkWin = (index: number, player: number): boolean => {
  const x = index % BOARD_SIZE
  const y = Math.floor(index / BOARD_SIZE)
  const directions = [
    [1, 0],   // 横向
    [0, 1],   // 纵向
    [1, 1],   // 右下斜
    [1, -1]   // 左下斜
  ]

  for (const [dx, dy] of directions) {
    let count = 1
    
    // 向正方向查
    let i = 1
    while (true) {
      const nx = x + dx * i
      const ny = y + dy * i
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break
      if (board.value[ny * BOARD_SIZE + nx] !== player) break
      count++
      i++
    }

    // 向反方向查
    i = 1
    while (true) {
      const nx = x - dx * i
      const ny = y - dy * i
      if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break
      if (board.value[ny * BOARD_SIZE + nx] !== player) break
      count++
      i++
    }

    if (count >= 5) return true
  }

  return false
}

const undoMove = () => {
  if (history.value.length === 0 || winner.value) return
  
  const lastIndex = history.value.pop()
  if (lastIndex !== undefined) {
    board.value[lastIndex] = 0
    currentPlayer.value = currentPlayer.value === 1 ? 2 : 1
  }
}

const resetGame = () => {
  board.value = new Array(BOARD_SIZE * BOARD_SIZE).fill(0)
  currentPlayer.value = 1
  winner.value = null
  history.value = []
}

</script>

<style scoped>
/* 棋盘样式微调 */
</style>
