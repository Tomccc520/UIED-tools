<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">扫雷</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">Minesweeper</p>

          <!-- 温馨提示 -->
          <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">经典的扫雷游戏，运用逻辑推理避开地雷，锻炼大脑。</p>
            </div>
          </div>
        </div>

        <div
          class="minesweeper-container w-full flex flex-col items-center justify-center font-sans select-none overflow-y-auto">
          <!-- 游戏主界面 -->
          <div
            class="relative z-10 p-6 bg-gray-200 rounded-xl shadow-xl border-4 border-white border-b-gray-400 border-r-gray-400 my-8 overflow-x-auto max-w-full">
            <div class="min-w-fit">

              <!-- 顶部信息栏 -->
              <div
                class="flex justify-between items-center mb-6 bg-gray-800 p-3 border-4 border-gray-400 border-b-white border-r-white inset-shadow">
                <!-- 剩余地雷数 -->
                <div class="font-mono text-3xl text-red-600 bg-black px-2 border-2 border-gray-600 shadow-inner">
                  {{ String(minesLeft).padStart(3, '0') }}
                </div>

                <!-- 表情按钮 (重置) -->
                <button @click="initGame"
                  class="w-12 h-12 flex items-center justify-center text-2xl bg-gray-300 border-4 border-white border-b-gray-500 border-r-gray-500 active:border-gray-500 active:border-b-white active:border-r-white active:translate-y-0.5">
                  {{ face }}
                </button>

                <!-- 计时器 -->
                <div class="font-mono text-3xl text-red-600 bg-black px-2 border-2 border-gray-600 shadow-inner">
                  {{ String(timer).padStart(3, '0') }}
                </div>
              </div>

              <!-- 游戏网格 -->
              <div class="grid gap-0 bg-gray-400 border-4 border-gray-400 border-b-white border-r-white"
                :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }" @contextmenu.prevent>
                <div v-for="(cell, index) in grid" :key="index" @mousedown="handleMouseDown(index)"
                  @mouseup="handleMouseUp(index)" @mouseleave="handleMouseLeave" @click="handleClick(index)"
                  @contextmenu.prevent="handleRightClick(index)" @touchstart="handleTouchStart(index)"
                  @touchend="handleTouchEnd(index)"
                  class="w-8 h-8 flex items-center justify-center text-lg font-bold cursor-default select-none"
                  :class="getCellClass(cell)">
                  {{ getCellContent(cell) }}
                </div>
              </div>

              <!-- 难度选择 -->
              <div class="mt-4 flex justify-center gap-2">
                <button v-for="diff in difficulties" :key="diff.name" @click="setDifficulty(diff)"
                  class="px-3 py-1 text-sm bg-gray-300 border-2 border-white border-b-gray-500 border-r-gray-500 active:border-gray-500 active:border-b-white active:translate-y-px"
                  :class="{ 'font-bold bg-blue-200': currentDifficulty.name === diff.name }">
                  {{ diff.name }}
                </button>
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
import { ref, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

// 配置
interface Difficulty {
  name: string
  rows: number
  cols: number
  mines: number
}

const difficulties: Difficulty[] = [
  { name: '初级', rows: 9, cols: 9, mines: 10 },
  { name: '中级', rows: 16, cols: 16, mines: 40 },
  { name: '高级', rows: 16, cols: 30, mines: 99 }
]

// 单元格状态
interface Cell {
  isMine: boolean
  isOpen: boolean
  isFlagged: boolean
  isQuestion: boolean // 可选：问号标记
  neighborMines: number
  isExploded: boolean // 踩雷时标记
}

// 状态
const currentDifficulty = ref(difficulties[0])
const rows = computed(() => currentDifficulty.value.rows)
const cols = computed(() => currentDifficulty.value.cols)
const totalMines = computed(() => currentDifficulty.value.mines)

const grid = ref<Cell[]>([])
const gameState = ref<'ready' | 'playing' | 'won' | 'lost'>('ready')
const timer = ref(0)
const face = ref('🙂') // 🙂 😮 😎 😵
let timerId: any = null

// 计算剩余地雷显示
const minesLeft = computed(() => {
  const flaggedCount = grid.value.filter(c => c.isFlagged).length
  return Math.max(0, totalMines.value - flaggedCount)
})

// 初始化游戏
const initGame = () => {
  stopTimer()
  timer.value = 0
  gameState.value = 'ready'
  face.value = '🙂'

  // 生成空网格
  const count = rows.value * cols.value
  grid.value = Array.from({ length: count }, () => ({
    isMine: false,
    isOpen: false,
    isFlagged: false,
    isQuestion: false,
    neighborMines: 0,
    isExploded: false
  }))
}

// 放置地雷 (第一次点击后触发，保证首发不炸)
const placeMines = (safeIndex: number) => {
  let placed = 0
  while (placed < totalMines.value) {
    const idx = Math.floor(Math.random() * grid.value.length)
    // 不在已有点雷处放置，且不在首发位置放置
    if (!grid.value[idx].isMine && idx !== safeIndex) {
      grid.value[idx].isMine = true
      placed++
    }
  }

  // 计算邻居雷数
  calculateNeighbors()
}

const calculateNeighbors = () => {
  for (let i = 0; i < grid.value.length; i++) {
    if (grid.value[i].isMine) continue

    const neighbors = getNeighbors(i)
    grid.value[i].neighborMines = neighbors.filter(idx => grid.value[idx].isMine).length
  }
}

const getNeighbors = (index: number) => {
  const neighbors = []
  const r = Math.floor(index / cols.value)
  const c = index % cols.value

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < rows.value && nc >= 0 && nc < cols.value) {
        neighbors.push(nr * cols.value + nc)
      }
    }
  }
  return neighbors
}

// 游戏操作
const startTimer = () => {
  timerId = setInterval(() => {
    timer.value++
    if (timer.value >= 999) stopTimer()
  }, 1000)
}

const stopTimer = () => {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

const setDifficulty = (diff: Difficulty) => {
  currentDifficulty.value = diff
  initGame()
}

// 鼠标交互
const handleMouseDown = (index: number) => {
  if (gameState.value !== 'playing' && gameState.value !== 'ready') return
  if (!grid.value[index].isOpen) face.value = '😮'
}

const handleMouseUp = (index: number) => {
  if (gameState.value !== 'playing' && gameState.value !== 'ready') return
  face.value = '🙂'
}

const handleMouseLeave = () => {
  if (gameState.value === 'playing') face.value = '🙂'
}

// 触摸事件处理 (长按插旗)
let longPressTimer: any = null
let isLongPress = false

const handleTouchStart = (index: number) => {
  isLongPress = false
  longPressTimer = setTimeout(() => {
    isLongPress = true
    // 震动反馈
    if (navigator.vibrate) navigator.vibrate(50)
    handleRightClick(index)
  }, 500)
}

const handleTouchEnd = (index: number) => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  // 如果触发了长按，需要阻止后续的点击事件（通过在 click handler 中判断）
}

const handleClick = (index: number) => {
  if (isLongPress) {
    isLongPress = false
    return
  }

  if (gameState.value === 'won' || gameState.value === 'lost') return

  const cell = grid.value[index]
  if (cell.isFlagged || cell.isOpen) return

  // 第一次点击
  if (gameState.value === 'ready') {
    gameState.value = 'playing'
    startTimer()
    placeMines(index)
  }

  if (cell.isMine) {
    // 踩雷
    gameOver(index)
  } else {
    openCell(index)
    checkWin()
  }
}

const handleRightClick = (index: number) => {
  if (gameState.value === 'won' || gameState.value === 'lost') return

  const cell = grid.value[index]
  if (cell.isOpen) return

  cell.isFlagged = !cell.isFlagged
}

const openCell = (index: number) => {
  const cell = grid.value[index]
  if (cell.isOpen || cell.isFlagged) return

  cell.isOpen = true

  // 空白格自动扩散
  if (cell.neighborMines === 0) {
    const neighbors = getNeighbors(index)
    neighbors.forEach(nIdx => openCell(nIdx))
  }
}

const gameOver = (index: number) => {
  gameState.value = 'lost'
  face.value = '😵'
  stopTimer()

  grid.value[index].isExploded = true

  // 显示所有雷
  grid.value.forEach(c => {
    if (c.isMine) c.isOpen = true
  })
}

const checkWin = () => {
  const openCount = grid.value.filter(c => c.isOpen).length
  const safeCount = grid.value.length - totalMines.value

  if (openCount === safeCount) {
    gameState.value = 'won'
    face.value = '😎'
    stopTimer()
    // 标记所有剩余雷为旗子
    grid.value.forEach(c => {
      if (c.isMine) c.isFlagged = true
    })
  }
}

// 样式辅助
const getCellClass = (cell: Cell) => {
  if (!cell.isOpen) {
    return 'bg-gray-300 border-4 border-white border-b-gray-500 border-r-gray-500 hover:bg-gray-200 active:border-gray-400'
  }

  if (cell.isExploded) return 'bg-red-500 border border-gray-400'
  if (cell.isMine) return 'bg-gray-300 border border-gray-400'

  // 打开的数字格
  const colors = [
    '', 'text-blue-600', 'text-green-600', 'text-red-600', 'text-purple-800',
    'text-red-800', 'text-teal-600', 'text-black', 'text-gray-600'
  ]
  return `bg-gray-200 border border-gray-400 ${colors[cell.neighborMines]}`
}

const getCellContent = (cell: Cell) => {
  if (cell.isFlagged) return '🚩'
  if (!cell.isOpen) return ''
  if (cell.isMine) return '💣'
  return cell.neighborMines > 0 ? cell.neighborMines : ''
}

// 初始化
initGame()

onUnmounted(() => {
  stopTimer()
})

</script>

<style scoped>
.inset-shadow {
  box-shadow: inset 2px 2px 2px 0px rgba(0, 0, 0, 0.2);
}
</style>
