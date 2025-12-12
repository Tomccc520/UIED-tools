<!--
 * @file Pomodoro.vue
 * @description 番茄钟工具组件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-26
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">番茄钟</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">基于番茄工作法的专注时钟，支持自定义工作/休息时长，助您保持专注高效。</p>
        </div>

        <div class="max-w-2xl mx-auto text-center">
          <!-- 模式切换 -->
          <div class="inline-flex bg-gray-100 p-1 rounded-lg mb-12">
            <button v-for="mode in modes" :key="mode.value" @click="switchMode(mode.value)"
              class="px-6 py-2 rounded-md text-sm font-medium transition-all duration-200"
              :class="currentMode === mode.value ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
              {{ mode.label }}
            </button>
          </div>

          <!-- 计时器显示 -->
          <div class="relative w-64 h-64 mx-auto mb-12">
            <!-- 进度圆环 -->
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="120" stroke="currentColor" stroke-width="8" fill="transparent"
                class="text-gray-100" />
              <circle cx="128" cy="128" r="120" stroke="currentColor" stroke-width="8" fill="transparent"
                :class="currentMode === 'work' ? 'text-red-500' : 'text-green-500'" :stroke-dasharray="circumference"
                :stroke-dashoffset="dashOffset" class="transition-all duration-1000 ease-linear" />
            </svg>
            <!-- 时间文本 -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-6xl font-bold text-gray-800 tabular-nums tracking-wider">
                {{ formattedTime }}
              </span>
              <span class="text-sm text-gray-500 mt-2 font-medium">
                {{ isRunning ? (currentMode === 'work' ? '专注中...' : '休息中...') : (isPaused ? '已暂停' : '准备开始') }}
              </span>
            </div>
          </div>

          <!-- 控制按钮 -->
          <div class="flex justify-center gap-6 mb-12">
            <button @click="toggleTimer"
              class="px-8 py-3 rounded-full text-white font-medium text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center"
              :class="currentMode === 'work' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-green-500 hover:bg-green-600 shadow-green-200'">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!isRunning" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6" />
              </svg>
              {{ isRunning ? '暂停' : (isPaused ? '继续' : '开始') }}
            </button>
            <button @click="resetTimer"
              class="px-8 py-3 rounded-full bg-gray-100 text-gray-600 font-medium text-lg hover:bg-gray-200 transition-colors flex items-center">
              <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重置
            </button>
          </div>

          <!-- 设置区域 -->
          <div class="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
            <h3 class="text-gray-700 font-medium mb-4 flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              时长设置 (分钟)
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-gray-500 mb-2">专注时长</label>
                <input type="number" v-model.number="settings.work" min="1" max="60"
                  class="w-full px-3 py-2 border rounded-md text-center focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                  @change="updateSettings" />
              </div>
              <div>
                <label class="block text-sm text-gray-500 mb-2">休息时长</label>
                <input type="number" v-model.number="settings.break" min="1" max="30"
                  class="w-full px-3 py-2 border rounded-md text-center focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                  @change="updateSettings" />
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
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElNotification } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()

// 状态定义
type Mode = 'work' | 'break'
const currentMode = ref<Mode>('work')
const isRunning = ref(false)
const isPaused = ref(false)
const timeLeft = ref(25 * 60)
const totalTime = ref(25 * 60)
let timer: number | null = null

// 设置
const settings = ref({
  work: 25,
  break: 5
})

// 加载设置
onMounted(() => {
  const savedSettings = localStorage.getItem('pomodoro-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      settings.value = { ...settings.value, ...parsed }
      // 应用设置
      if (!isRunning.value) {
        resetTimer()
      }
    } catch (e) {
      console.error('Failed to load settings', e)
    }
  }
})

// 监听设置变化保存到本地存储
watch(settings, (newSettings) => {
  localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings))
}, { deep: true })

// 常量
const circumference = 2 * Math.PI * 120
const modes: { label: string; value: Mode }[] = [
  { label: '专注模式', value: 'work' },
  { label: '休息模式', value: 'break' }
]

// 计算属性
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const dashOffset = computed(() => {
  return circumference - (timeLeft.value / totalTime.value) * circumference
})

// 方法
const switchMode = (mode: Mode) => {
  currentMode.value = mode
  resetTimer()
}

const updateSettings = () => {
  // 确保值在合理范围内
  if (settings.value.work < 1) settings.value.work = 1
  if (settings.value.work > 60) settings.value.work = 60
  if (settings.value.break < 1) settings.value.break = 1
  if (settings.value.break > 30) settings.value.break = 30

  // 如果计时器未运行，直接应用新设置
  if (!isRunning.value && !isPaused.value) {
    resetTimer()
  }
}

const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

const startTimer = () => {
  isRunning.value = true
  isPaused.value = false
  timer = window.setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      completeTimer()
    }
  }, 1000)
}

const pauseTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  isRunning.value = false
  isPaused.value = true
}

const resetTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  isRunning.value = false
  isPaused.value = false

  const duration = currentMode.value === 'work' ? settings.value.work : settings.value.break
  totalTime.value = duration * 60
  timeLeft.value = totalTime.value
}

const completeTimer = () => {
  pauseTimer()
  playNotificationSound()

  const title = currentMode.value === 'work' ? '专注完成！' : '休息结束！'
  const message = currentMode.value === 'work' ? '休息一下吧，你真棒！' : '准备开始新的专注吧！'

  ElNotification({
    title,
    message,
    type: 'success',
    duration: 0 // 不自动关闭
  })

  // 自动切换模式
  currentMode.value = currentMode.value === 'work' ? 'break' : 'work'
  resetTimer()
}

const playNotificationSound = () => {
  // 这里可以添加提示音逻辑，目前仅使用浏览器通知
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(currentMode.value === 'work' ? '专注完成' : '休息结束')
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission()
  }
}

// 监听浏览器标题变化
watch(timeLeft, () => {
  if (isRunning.value) {
    document.title = `${formattedTime.value} - ${currentMode.value === 'work' ? '专注中' : '休息中'}`
  } else {
    document.title = '番茄钟 - 在线专注工具'
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  document.title = 'Tools Web' // 恢复默认标题
})

const guideSteps = [
  { title: '设置时长', description: '在下方设置区域调整专注时长和休息时长，建议使用默认的25+5分钟模式。' },
  { title: '开始专注', description: '点击"开始"按钮启动计时器，此时请全身心投入工作或学习中。' },
  { title: '完成休息', description: '计时结束后会收到通知，请停下工作进行短暂休息，劳逸结合效率更高。' }
]

const guideNotes = [
  '番茄工作法建议每专注25分钟休息5分钟，连续4个番茄钟后进行一次较长的休息。',
  '计时过程中请尽量避免干扰，保持专注。',
  '支持浏览器桌面通知，请允许网站发送通知以获得更好的体验。',
  '刷新页面会重置计时器状态，请小心操作。'
]
</script>
