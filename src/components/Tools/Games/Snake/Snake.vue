<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">贪吃蛇</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">Snake Game</p>

          <!-- 温馨提示 -->
          <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">经典的贪吃蛇游戏，控制蛇吃食物变长，挑战最高分。</p>
            </div>
          </div>
        </div>

        <div
          class="snake-game-container w-full flex flex-col items-center justify-center bg-gray-900 font-sans select-none text-white overflow-y-auto relative rounded-xl py-8">
          <!-- 背景网格装饰 -->
          <div class="absolute inset-0 z-0 opacity-10 pointer-events-none"
            style="background-image: radial-gradient(circle, #ffffff 1px, transparent 1px); background-size: 20px 20px;">
          </div>

          <!-- 游戏主界面 -->
          <div class="relative z-10 w-full max-w-2xl px-4 flex flex-col items-center">

            <!-- 顶部状态栏 -->
            <div
              class="w-full flex justify-between items-center mb-6 bg-gray-800/80 backdrop-blur rounded-xl p-4 border border-gray-700 shadow-lg">
              <div class="flex items-center gap-2">
                <div class="text-3xl font-bold text-green-400">贪吃蛇</div>
                <span class="text-xs text-gray-400 px-2 py-1 bg-gray-700 rounded">Classic</span>
              </div>

              <div class="flex items-center gap-6">
                <div class="text-center">
                  <div class="text-xs text-gray-400 uppercase tracking-wider">Score</div>
                  <div class="text-2xl font-mono text-yellow-400 font-bold">{{ score }}</div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-gray-400 uppercase tracking-wider">Best</div>
                  <div class="text-2xl font-mono text-gray-300 font-bold">{{ bestScore }}</div>
                </div>
              </div>
            </div>

            <!-- 游戏画布容器 -->
            <div class="relative rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700 bg-black">
              <canvas ref="canvas" :width="canvasSize" :height="canvasSize" class="block bg-gray-900"></canvas>

              <!-- 遮罩层：开始/暂停/结束 -->
              <div v-if="gameState !== 'playing'"
                class="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 z-20">

                <h2
                  class="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-blue-500">
                  {{ gameState === 'start' ? 'SNAKE' : (gameState === 'paused' ? 'PAUSED' : 'GAME OVER') }}
                </h2>

                <p v-if="gameState === 'gameover'" class="text-gray-300 mb-6 text-lg">
                  最终得分: <span class="text-yellow-400 font-bold text-2xl">{{ score }}</span>
                </p>
                <p v-else class="text-gray-400 mb-8 text-sm max-w-xs">
                  {{ gameState === 'start' ? '使用方向键或滑动屏幕控制移动' : '游戏暂停中' }}
                </p>

                <button @click="startGame"
                  class="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2">
                  <svg v-if="gameState === 'paused'" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ gameState === 'paused' ? '继续游戏' : (gameState === 'start' ? '开始游戏' : '再玩一次') }}
                </button>
              </div>
            </div>

            <!-- 移动端控制提示 / 底部操作栏 -->
            <div class="mt-6 flex gap-4 text-sm text-gray-500">
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-1 bg-gray-700 rounded text-gray-300 font-mono text-xs">Space</kbd>
                <span>暂停/开始</span>
              </div>
              <div class="flex items-center gap-1">
                <kbd class="px-2 py-1 bg-gray-700 rounded text-gray-300 font-mono text-xs">↑↓←→</kbd>
                <span>移动</span>
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

// 常量配置
const GRID_SIZE = 20 // 网格大小 (像素)
const TILE_COUNT = 20 // 地图格子数量 (20x20)
const CANVAS_SIZE = GRID_SIZE * TILE_COUNT
const BASE_SPEED = 150 // 基础速度 (ms)

// 类型定义
type GameState = 'start' | 'playing' | 'paused' | 'gameover'
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
interface Point { x: number, y: number }

// 状态
const canvas = ref<HTMLCanvasElement | null>(null)
const gameState = ref<GameState>('start')
const score = ref(0)
const bestScore = ref(0)

// 游戏核心数据
let ctx: CanvasRenderingContext2D | null = null
let snake: Point[] = []
let food: Point = { x: 0, y: 0 }
let direction: Direction = 'RIGHT'
let nextDirection: Direction = 'RIGHT' // 缓冲下一步方向，防止快速按键导致自杀
let gameLoopId: any = null
let lastTime = 0
let speed = BASE_SPEED

// 计算属性
const canvasSize = computed(() => CANVAS_SIZE)

// 初始化游戏
const initGame = () => {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ]
  direction = 'RIGHT'
  nextDirection = 'RIGHT'
  score.value = 0
  speed = BASE_SPEED
  spawnFood()

  // 读取最高分
  const savedBest = localStorage.getItem('snake_best_score')
  if (savedBest) bestScore.value = parseInt(savedBest)
}

// 生成食物
const spawnFood = () => {
  let newFood: Point
  let isColliding
  do {
    isColliding = false
    newFood = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT)
    }
    // 确保食物不生成在蛇身上
    for (const segment of snake) {
      if (segment.x === newFood.x && segment.y === newFood.y) {
        isColliding = true
        break
      }
    }
  } while (isColliding)
  food = newFood
}

// 开始游戏
const startGame = () => {
  if (gameState.value === 'paused') {
    gameState.value = 'playing'
    lastTime = performance.now()
    requestAnimationFrame(gameLoop)
    return
  }

  initGame()
  gameState.value = 'playing'
  lastTime = performance.now()
  requestAnimationFrame(gameLoop)
}

// 暂停游戏
const togglePause = () => {
  if (gameState.value === 'playing') {
    gameState.value = 'paused'
  } else if (gameState.value === 'paused') {
    startGame()
  }
}

// 游戏结束
const gameOver = () => {
  gameState.value = 'gameover'
  if (score.value > bestScore.value) {
    bestScore.value = score.value
    localStorage.setItem('snake_best_score', score.value.toString())
  }
}

// 游戏主循环
const gameLoop = (timestamp: number) => {
  if (gameState.value !== 'playing') return

  const deltaTime = timestamp - lastTime
  if (deltaTime >= speed) {
    update()
    lastTime = timestamp
  }

  draw()

  if (gameState.value === 'playing') {
    requestAnimationFrame(gameLoop)
  }
}

// 更新逻辑
const update = () => {
  direction = nextDirection

  // 计算新头部位置
  const head = { ...snake[0] }
  switch (direction) {
    case 'UP': head.y--; break
    case 'DOWN': head.y++; break
    case 'LEFT': head.x--; break
    case 'RIGHT': head.x++; break
  }

  // 检查撞墙
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    gameOver()
    return
  }

  // 检查撞自己
  for (const segment of snake) {
    if (head.x === segment.x && head.y === segment.y) {
      gameOver()
      return
    }
  }

  snake.unshift(head) // 添加新头部

  // 检查吃食物
  if (head.x === food.x && head.y === food.y) {
    score.value += 10
    // 速度随分数增加略微变快，最快 50ms
    speed = Math.max(50, BASE_SPEED - Math.floor(score.value / 50) * 5)
    spawnFood()
  } else {
    snake.pop() // 移除尾部
  }
}

// 绘制逻辑
const draw = () => {
  if (!ctx || !canvas.value) return

  // 清空画布
  ctx.fillStyle = '#111827' // bg-gray-900
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

  // 绘制网格线 (可选，淡淡的)
  ctx.strokeStyle = '#1F2937' // bg-gray-800
  ctx.lineWidth = 1
  for (let i = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath()
    ctx.moveTo(i * GRID_SIZE, 0)
    ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * GRID_SIZE)
    ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE)
    ctx.stroke()
  }

  // 绘制食物
  ctx.fillStyle = '#FBBF24' // text-yellow-400
  ctx.shadowBlur = 10
  ctx.shadowColor = '#FBBF24'
  ctx.beginPath()
  ctx.arc(
    food.x * GRID_SIZE + GRID_SIZE / 2,
    food.y * GRID_SIZE + GRID_SIZE / 2,
    GRID_SIZE / 2 - 2,
    0, Math.PI * 2
  )
  ctx.fill()
  ctx.shadowBlur = 0

  // 绘制蛇
  snake.forEach((segment, index) => {
    // 蛇头颜色不同
    if (index === 0) {
      ctx!.fillStyle = '#34D399' // green-400
    } else {
      // 渐变色
      ctx!.fillStyle = `rgba(52, 211, 153, ${1 - index / (snake.length + 5)})`
    }

    // 稍微小一点，留出间隙
    ctx!.fillRect(
      segment.x * GRID_SIZE + 1,
      segment.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    )
  })
}

// 键盘控制
const handleKeydown = (e: KeyboardEvent) => {
  // 阻止方向键滚动页面
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault()
  }

  if (e.key === ' ' || e.code === 'Space') {
    togglePause()
    return
  }

  if (gameState.value !== 'playing') return

  switch (e.key) {
    case 'ArrowUp':
      if (direction !== 'DOWN') nextDirection = 'UP'
      break
    case 'ArrowDown':
      if (direction !== 'UP') nextDirection = 'DOWN'
      break
    case 'ArrowLeft':
      if (direction !== 'RIGHT') nextDirection = 'LEFT'
      break
    case 'ArrowRight':
      if (direction !== 'LEFT') nextDirection = 'RIGHT'
      break
  }
}

onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    // 初始绘制一次背景
    draw()
  }
  window.addEventListener('keydown', handleKeydown)
  // 添加触摸事件监听
  if (canvas.value) {
    canvas.value.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.value.addEventListener('touchmove', handleTouchMove, { passive: false })
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (canvas.value) {
    canvas.value.removeEventListener('touchstart', handleTouchStart)
    canvas.value.removeEventListener('touchmove', handleTouchMove)
  }
  cancelAnimationFrame(gameLoopId)
})

// 触摸控制
let touchStartX = 0
let touchStartY = 0

const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault()
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  if (!touchStartX || !touchStartY) return

  const touchEndX = e.touches[0].clientX
  const touchEndY = e.touches[0].clientY

  const dx = touchEndX - touchStartX
  const dy = touchEndY - touchStartY

  // 最小滑动距离
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return

  // 判断滑动方向
  if (Math.abs(dx) > Math.abs(dy)) {
    // 水平滑动
    if (dx > 0 && direction !== 'LEFT') nextDirection = 'RIGHT'
    else if (dx < 0 && direction !== 'RIGHT') nextDirection = 'LEFT'
  } else {
    // 垂直滑动
    if (dy > 0 && direction !== 'UP') nextDirection = 'DOWN'
    else if (dy < 0 && direction !== 'DOWN') nextDirection = 'UP'
  }

  // 重置起始点，防止连续触发
  touchStartX = 0
  touchStartY = 0
}

</script>
