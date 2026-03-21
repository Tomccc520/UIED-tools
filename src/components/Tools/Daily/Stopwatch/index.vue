<!--
 * @file Stopwatch.vue
 * @description 在线秒表工具组件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">在线秒表</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">简单好用的在线秒表工具，支持毫秒级计时和计次功能。</p>
        </div>

        <div class="max-w-3xl mx-auto">
          <!-- 计时器显示 -->
          <div class="bg-gray-900 rounded-2xl p-8 mb-8 text-center shadow-lg relative overflow-hidden">
             <!-- 装饰光效 -->
             <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
             
             <div class="relative z-10 font-mono text-white">
               <div class="text-6xl md:text-8xl font-bold tracking-wider mb-2">
                 {{ formatTime(time) }}
               </div>
               <div class="text-xl md:text-2xl text-gray-400">
                 .{{ formatMilliseconds(time) }}
               </div>
             </div>
          </div>

          <!-- 控制按钮 -->
          <div class="flex justify-center gap-4 mb-8">
            <button v-if="!isRunning" @click="startTimer"
              class="w-24 h-24 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center transform hover:scale-105 active:scale-95">
              {{ time === 0 ? '开始' : '继续' }}
            </button>
            <button v-else @click="pauseTimer"
              class="w-24 h-24 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center transform hover:scale-105 active:scale-95">
              暂停
            </button>
            
            <button @click="recordLap" :disabled="!isRunning && time === 0"
              class="w-24 h-24 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              计次
            </button>
            
            <button @click="resetTimer" :disabled="time === 0"
              class="w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
              复位
            </button>
          </div>

          <!-- 计次列表 -->
          <div v-if="laps.length > 0" class="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
            <div class="flex justify-between text-gray-400 text-sm mb-2 px-4">
              <span>计次</span>
              <span>时间</span>
              <span>总计</span>
            </div>
            <div class="space-y-2">
              <div v-for="(lap, index) in laps" :key="index" 
                class="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                <span class="font-bold text-gray-500">#{{ laps.length - index }}</span>
                <span class="font-mono text-gray-800">{{ formatFullTime(lap.lapTime) }}</span>
                <span class="font-mono text-gray-400 text-sm">{{ formatFullTime(lap.totalTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <UsageGuide :steps="guideSteps" :notes="guideNotes" />
      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()
const time = ref(0)
const isRunning = ref(false)
const timerInterval = ref<number | null>(null)
const startTime = ref(0)
const laps = ref<Array<{ lapTime: number, totalTime: number }>>([])
const lastLapTime = ref(0)

const startTimer = () => {
  if (isRunning.value) return
  
  isRunning.value = true
  const now = Date.now()
  startTime.value = now - time.value
  
  timerInterval.value = window.setInterval(() => {
    time.value = Date.now() - startTime.value
  }, 10)
}

const pauseTimer = () => {
  isRunning.value = false
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const resetTimer = () => {
  pauseTimer()
  time.value = 0
  laps.value = []
  lastLapTime.value = 0
}

const recordLap = () => {
  if (time.value === 0) return
  
  const currentTotal = time.value
  const currentLap = currentTotal - lastLapTime.value
  
  laps.value.unshift({
    lapTime: currentLap,
    totalTime: currentTotal
  })
  
  lastLapTime.value = currentTotal
}

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(minutes)}:${pad(seconds)}`
}

const formatMilliseconds = (ms: number) => {
  return Math.floor((ms % 1000) / 10).toString().padStart(2, '0')
}

const formatFullTime = (ms: number) => {
  return `${formatTime(ms)}.${formatMilliseconds(ms)}`
}

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})

const guideSteps = [
  { title: '开始计时', description: '点击绿色"开始"按钮开始计时，再次点击"暂停"按钮暂停计时。' },
  { title: '计次功能', description: '在计时过程中，点击蓝色"计次"按钮记录当前时间点（圈速）。' },
  { title: '复位清零', description: '点击红色"复位"按钮将时间清零并清空计次记录。' }
]

const guideNotes = [
  '计时精度为10毫秒（百分之一秒）。',
  '支持记录无限次圈速，最新记录显示在最上方。',
  '关闭页面后计时会停止，请保持页面开启。'
]
</script>
