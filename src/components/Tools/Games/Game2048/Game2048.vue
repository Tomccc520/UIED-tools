<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">2048</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">2048 Game</p>

          <!-- 温馨提示 -->
          <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">经典的2048数字合成游戏，移动方块合并数字，挑战合成2048！</p>
            </div>
          </div>
        </div>

        <div
          class="game-2048-container w-full min-h-[600px] bg-[#faf8ef] flex flex-col items-center justify-center font-sans select-none overflow-y-auto touch-pan-y rounded-xl py-8">

          <!-- 顶部 -->
          <div class="w-full max-w-md px-4 mb-8 flex justify-between items-end">
            <div>
              <h1 class="text-6xl font-bold text-[#776e65]">2048</h1>
              <p class="text-[#776e65] text-sm mt-2">合并方块，得到 2048！</p>
            </div>
            <div class="flex gap-2">
              <div class="bg-[#bbada0] rounded px-4 py-2 text-center min-w-[80px]">
                <div class="text-[#eee4da] text-xs font-bold uppercase">SCORE</div>
                <div class="text-white text-xl font-bold">{{ score }}</div>
              </div>
              <div class="bg-[#bbada0] rounded px-4 py-2 text-center min-w-[80px]">
                <div class="text-[#eee4da] text-xs font-bold uppercase">BEST</div>
                <div class="text-white text-xl font-bold">{{ bestScore }}</div>
              </div>
            </div>
          </div>

          <!-- 游戏控制栏 -->
          <div class="w-full max-w-md px-4 mb-4 flex justify-end">
            <button @click="initGame"
              class="bg-[#8f7a66] text-white font-bold py-2 px-6 rounded hover:bg-[#806c59] transition-colors active:scale-95 transform">
              新游戏
            </button>
          </div>

          <!-- 游戏棋盘 -->
          <div class="relative bg-[#bbada0] p-3 rounded-lg w-[340px] h-[340px] sm:w-[400px] sm:h-[400px]"
            @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
            <!-- 背景格子 -->
            <div class="grid grid-cols-4 grid-rows-4 gap-3 w-full h-full">
              <div v-for="n in 16" :key="n" class="bg-[#cdc1b4]/50 rounded"></div>
            </div>

            <!-- 数字方块 -->
            <div class="absolute inset-0 p-3">
              <transition-group name="tile">
                <div v-for="tile in tiles" :key="tile.id"
                  class="absolute flex items-center justify-center rounded font-bold transition-all duration-100"
                  :class="getTileClass(tile.value)" :style="getTileStyle(tile)">
                  {{ tile.value }}
                </div>
              </transition-group>
            </div>

            <!-- 游戏结束遮罩 -->
            <div v-if="gameOver"
              class="absolute inset-0 bg-[#faf8ef]/70 flex flex-col items-center justify-center rounded-lg z-20 animate-fade-in">
              <div class="text-4xl font-bold text-[#776e65] mb-4">游戏结束!</div>
              <button @click="initGame"
                class="bg-[#8f7a66] text-white font-bold py-3 px-6 rounded hover:bg-[#806c59] transition-colors shadow-lg">
                再试一次
              </button>
            </div>
          </div>

          <!-- 说明 -->
          <div class="mt-8 text-[#776e65] text-sm max-w-md px-4 text-center">
            <p class="mb-2"><strong>玩法:</strong> 使用 <strong>方向键</strong> 或 <strong>滑动屏幕</strong> 移动方块。</p>
            <p>当两个数字相同的方块撞在一起时，它们会合并成一个！</p>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

interface Tile {
  id: number
  value: number
  row: number
  col: number
  isNew?: boolean
  isMerged?: boolean
}

const GRID_SIZE = 4
const score = ref(0)
const bestScore = ref(0)
const tiles = ref<Tile[]>([])
const gameOver = ref(false)

let tileIdCounter = 0

// 计算方块样式
const getTileStyle = (tile: Tile) => {
  const gap = 12 // gap-3 is 0.75rem ~ 12px
  // 动态计算宽高
  // 340px - 2*12(padding) - 3*12(gap) = 280 / 4 = 70px (mobile)
  // 400px - 2*12 - 3*12 = 340 / 4 = 85px (desktop)

  // 使用百分比定位以适应响应式
  const percentage = 100 / GRID_SIZE
  // 这里的 gap 处理比较麻烦，简化处理：假设容器是固定的，用 CSS 变量或简单的 calc
  // 实际上为了流畅动画，绝对定位是必须的

  // 简单起见，我们在 CSS 中处理响应式尺寸
  // Mobile: cell size ~70px, gap ~12px
  // Desktop: cell size ~85px, gap ~12px

  const isDesktop = window.innerWidth >= 640
  const cellSize = isDesktop ? 87.5 : 72.5 // approximate
  const gutter = 12

  const x = tile.col * (cellSize + gutter)
  const y = tile.row * (cellSize + gutter)

  return {
    transform: `translate(${x}px, ${y}px)`,
    width: `${cellSize}px`,
    height: `${cellSize}px`
  }
}

// 方块颜色配置
const getTileClass = (value: number) => {
  const base = 'text-[#776e65]'
  const lightText = 'text-[#f9f6f2]'

  if (value === 2) return 'bg-[#eee4da] ' + base
  if (value === 4) return 'bg-[#ede0c8] ' + base
  if (value === 8) return 'bg-[#f2b179] ' + lightText
  if (value === 16) return 'bg-[#f59563] ' + lightText
  if (value === 32) return 'bg-[#f67c5f] ' + lightText
  if (value === 64) return 'bg-[#f65e3b] ' + lightText
  if (value === 128) return 'bg-[#edcf72] ' + lightText + ' text-3xl'
  if (value === 256) return 'bg-[#edcc61] ' + lightText + ' text-3xl'
  if (value === 512) return 'bg-[#edc850] ' + lightText + ' text-3xl'
  if (value === 1024) return 'bg-[#edc53f] ' + lightText + ' text-2xl'
  if (value === 2048) return 'bg-[#edc22e] ' + lightText + ' text-2xl'

  return 'bg-[#3c3a32] ' + lightText + ' text-xl'
}

// 游戏逻辑
const initGame = () => {
  tiles.value = []
  score.value = 0
  gameOver.value = false
  tileIdCounter = 0

  const savedBest = localStorage.getItem('2048_best_score')
  if (savedBest) bestScore.value = parseInt(savedBest)

  addRandomTile()
  addRandomTile()
}

const addRandomTile = () => {
  const emptyCells = []
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!tiles.value.find(t => t.row === r && t.col === c)) {
        emptyCells.push({ row: r, col: c })
      }
    }
  }

  if (emptyCells.length > 0) {
    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    tiles.value.push({
      id: tileIdCounter++,
      value: Math.random() < 0.9 ? 2 : 4,
      row,
      col,
      isNew: true
    })
  }
}

// 移动逻辑
const move = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
  if (gameOver.value) return

  let hasMoved = false
  let mergedIds = new Set<number>() // 本轮已合并过的方块 ID

  // 定义遍历顺序
  const rows = Array.from({ length: GRID_SIZE }, (_, i) => i)
  const cols = Array.from({ length: GRID_SIZE }, (_, i) => i)

  // 根据方向调整遍历顺序，确保先处理靠边的方块
  if (direction === 'DOWN') rows.reverse()
  if (direction === 'RIGHT') cols.reverse()

  for (const r of rows) {
    for (const c of cols) {
      const tile = tiles.value.find(t => t.row === r && t.col === c)
      if (!tile) continue

      let nextR = r
      let nextC = c

      // 寻找最远可移动位置
      while (true) {
        let testR = nextR
        let testC = nextC

        if (direction === 'UP') testR--
        else if (direction === 'DOWN') testR++
        else if (direction === 'LEFT') testC--
        else if (direction === 'RIGHT') testC++

        // 越界检查
        if (testR < 0 || testR >= GRID_SIZE || testC < 0 || testC >= GRID_SIZE) break

        const target = tiles.value.find(t => t.row === testR && t.col === testC)

        // 空位，继续移动
        if (!target) {
          nextR = testR
          nextC = testC
          continue
        }

        // 有方块，检查合并
        if (target.value === tile.value && !mergedIds.has(target.id) && !mergedIds.has(tile.id)) {
          // 合并
          tile.row = testR
          tile.col = testC

          // 移除被合并的方块
          // 实际上应该先移动到位，然后合并。为了简单，直接移除 target，更新 tile
          // 这里为了动画效果，最好保留两个方块一瞬间。
          // 简化实现：移除旧的，更新当前的 value
          const targetIndex = tiles.value.findIndex(t => t.id === target.id)
          tiles.value.splice(targetIndex, 1)

          tile.value *= 2
          score.value += tile.value
          mergedIds.add(tile.id)
          hasMoved = true
        }

        // 遇到方块（无论是否合并）都停止循环
        break
      }

      // 如果位置改变
      if (nextR !== r || nextC !== c) {
        tile.row = nextR
        tile.col = nextC
        hasMoved = true
      }
    }
  }

  if (hasMoved) {
    // 播放动画后生成新方块
    setTimeout(() => {
      addRandomTile()
      checkGameOver()
      if (score.value > bestScore.value) {
        bestScore.value = score.value
        localStorage.setItem('2048_best_score', score.value.toString())
      }
    }, 150)
  }
}

const checkGameOver = () => {
  // 还有空位
  if (tiles.value.length < 16) return

  // 检查是否还能合并
  for (const tile of tiles.value) {
    const directions = [
      { r: tile.row - 1, c: tile.col },
      { r: tile.row + 1, c: tile.col },
      { r: tile.row, c: tile.col - 1 },
      { r: tile.row, c: tile.col + 1 }
    ]

    for (const dir of directions) {
      const neighbor = tiles.value.find(t => t.row === dir.r && t.col === dir.c)
      if (neighbor && neighbor.value === tile.value) return // 还能合并
    }
  }

  gameOver.value = true
}

// 键盘控制
const handleKeydown = (e: KeyboardEvent) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
    if (e.key === 'ArrowUp') move('UP')
    else if (e.key === 'ArrowDown') move('DOWN')
    else if (e.key === 'ArrowLeft') move('LEFT')
    else if (e.key === 'ArrowRight') move('RIGHT')
  }
}

// 触摸控制
let touchStartX = 0
let touchStartY = 0

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault() // 防止滚动
}

const handleTouchEnd = (e: TouchEvent) => {
  if (!touchStartX || !touchStartY) return

  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY

  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > 30) {
      if (dx > 0) move('RIGHT')
      else move('LEFT')
    }
  } else {
    if (Math.abs(dy) > 30) {
      if (dy > 0) move('DOWN')
      else move('UP')
    }
  }

  touchStartX = 0
  touchStartY = 0
}

onMounted(() => {
  initGame()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

</script>

<style scoped>
.game-2048-container {
  font-family: "Clear Sans", "Helvetica Neue", Arial, sans-serif;
}

.tile-enter-active,
.tile-leave-active {
  transition: all 0.1s ease-in-out;
}

.tile-enter-from {
  opacity: 0;
  transform: scale(0);
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
