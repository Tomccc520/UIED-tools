<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">反应速度测试</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">测试你的神经反射速度，看看你能有多快！</p>
        </div>

        <div 
          class="w-full h-[500px] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 select-none relative overflow-hidden"
          :class="stateClass"
          @mousedown="handleClick"
          @touchstart.prevent="handleClick"
        >
          <!-- 图标/状态指示 -->
          <div class="text-white text-center z-10 p-8">
            <div v-if="gameState === 'waiting'" class="space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 class="text-4xl font-bold">点击开始</h3>
              <p class="text-xl opacity-80">当背景变绿时，尽快点击屏幕</p>
            </div>

            <div v-else-if="gameState === 'ready'" class="space-y-4">
              <div class="text-8xl mb-4">...</div>
              <h3 class="text-4xl font-bold">等待变绿...</h3>
            </div>

            <div v-else-if="gameState === 'now'" class="space-y-4">
              <div class="text-8xl mb-4">!!!</div>
              <h3 class="text-5xl font-bold">点击！！！</h3>
            </div>

            <div v-else-if="gameState === 'result'" class="space-y-6">
              <div class="text-2xl font-medium uppercase tracking-wider opacity-80">你的反应时间</div>
              <div class="text-8xl font-bold font-mono">{{ reactionTime }}<span class="text-4xl">ms</span></div>
              <p class="text-xl">点击继续尝试</p>
              
              <!-- 评价 -->
              <div class="inline-block px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm mt-4">
                {{ getRank(reactionTime) }}
              </div>
            </div>

            <div v-else-if="gameState === 'too-early'" class="space-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-4xl font-bold">太早了！</h3>
              <p class="text-xl">请等待背景变绿后再点击</p>
            </div>
          </div>
        </div>

        <!-- 历史记录 -->
        <div v-if="history.length > 0" class="mt-8 max-w-md mx-auto">
          <div class="flex justify-between items-center mb-4">
             <h3 class="text-lg font-bold text-gray-700">最近成绩</h3>
             <div class="text-sm text-gray-500">平均: {{ averageTime }}ms</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="flex gap-2 flex-wrap justify-center">
              <span 
                v-for="(time, index) in history.slice().reverse().slice(0, 10)" 
                :key="index"
                class="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-600 font-mono text-sm shadow-sm"
              >
                {{ time }}ms
              </span>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="mt-8 bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 class="font-bold text-gray-800 mb-2 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            关于反应速度
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            人类的平均视觉反应速度约为 250ms (0.25秒)。<br>
            职业电竞选手的反应速度通常在 150-200ms 之间。<br>
            你能达到多少呢？多试几次取平均值更准确哦！
          </p>
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

type GameState = 'waiting' | 'ready' | 'now' | 'result' | 'too-early'

const gameState = ref<GameState>('waiting')
const startTime = ref(0)
const reactionTime = ref(0)
const timer = ref<any>(null)
const history = ref<number[]>([])

// 计算背景颜色
const stateClass = computed(() => {
  switch (gameState.value) {
    case 'waiting': return 'bg-blue-600 hover:bg-blue-500'
    case 'ready': return 'bg-red-500 cursor-wait'
    case 'now': return 'bg-green-500'
    case 'result': return 'bg-blue-600 hover:bg-blue-500'
    case 'too-early': return 'bg-blue-600 hover:bg-blue-500'
    default: return 'bg-blue-600'
  }
})

const averageTime = computed(() => {
  if (history.value.length === 0) return 0
  const sum = history.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / history.value.length)
})

const handleClick = () => {
  switch (gameState.value) {
    case 'waiting':
    case 'result':
    case 'too-early':
      startGame()
      break
    case 'ready':
      tooEarly()
      break
    case 'now':
      endGame()
      break
  }
}

const startGame = () => {
  gameState.value = 'ready'
  const delay = 2000 + Math.random() * 3000 // 2-5秒随机延迟
  
  timer.value = setTimeout(() => {
    gameState.value = 'now'
    startTime.value = performance.now()
  }, delay)
}

const tooEarly = () => {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
  gameState.value = 'too-early'
}

const endGame = () => {
  const endTime = performance.now()
  reactionTime.value = Math.round(endTime - startTime.value)
  gameState.value = 'result'
  history.value.push(reactionTime.value)
}

const getRank = (ms: number) => {
  if (ms < 150) return '⚡️ 神一样的速度！'
  if (ms < 200) return '🚀 职业选手级别！'
  if (ms < 250) return '🔥 非常快！'
  if (ms < 300) return '👍 正常发挥'
  if (ms < 400) return '🐢 稍微有点慢...'
  return '🐌 该醒醒了...'
}
</script>
