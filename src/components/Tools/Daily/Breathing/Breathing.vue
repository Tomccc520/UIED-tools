<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">呼吸冥想</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">跟随指引进行深呼吸，放松身心，缓解压力。</p>
        </div>

        <div class="flex flex-col items-center justify-center py-12">
          
          <!-- 动画区域 -->
          <div class="relative w-80 h-80 flex items-center justify-center mb-12">
            <!-- 外圈扩散动画 -->
            <div class="absolute inset-0 rounded-full bg-blue-100 opacity-50 transition-all duration-[4000ms] ease-in-out"
                 :class="{'scale-100': phase === 'inhale' || phase === 'hold', 'scale-50': phase === 'exhale' || phase === 'idle'}">
            </div>
            
            <!-- 中间圈 -->
            <div class="absolute w-64 h-64 rounded-full bg-blue-200 opacity-60 transition-all duration-[4000ms] ease-in-out delay-75"
                 :class="{'scale-100': phase === 'inhale' || phase === 'hold', 'scale-50': phase === 'exhale' || phase === 'idle'}">
            </div>

            <!-- 核心圈 -->
            <div class="relative w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-2xl flex items-center justify-center text-white text-2xl font-bold transition-all duration-[4000ms] ease-in-out z-10"
                 :class="{'scale-110': phase === 'inhale' || phase === 'hold', 'scale-90': phase === 'exhale' || phase === 'idle'}">
              <div class="flex flex-col items-center">
                <span class="text-3xl mb-2">{{ instructionText }}</span>
                <span v-if="isActive" class="text-sm font-normal opacity-80">{{ timeLeftFormatted }}</span>
              </div>
            </div>

            <!-- 粒子装饰 (可选) -->
          </div>

          <!-- 控制区域 -->
          <div v-if="!isActive" class="flex flex-col items-center gap-6 animate-fade-in">
            <div class="flex gap-4">
              <button v-for="t in [1, 3, 5]" :key="t"
                      @click="duration = t"
                      class="px-4 py-2 rounded-lg border transition-all"
                      :class="duration === t ? 'bg-blue-50 border-blue-500 text-blue-600 font-bold' : 'border-gray-200 text-gray-600 hover:border-blue-300'">
                {{ t }} 分钟
              </button>
            </div>
            
            <button @click="startSession" 
                    class="px-12 py-4 bg-blue-600 text-white text-xl rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              开始练习
            </button>
          </div>

          <div v-else class="flex flex-col items-center gap-6 animate-fade-in">
            <button @click="stopSession" 
                    class="px-8 py-2 border-2 border-gray-300 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              结束练习
            </button>
            <p class="text-gray-400 text-sm">专注于你的呼吸，感受空气的流动</p>
          </div>

        </div>

        <!-- 说明 -->
        <div class="mt-8 bg-blue-50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 class="font-bold text-blue-800 mb-2">💡 4-7-8 呼吸法</h3>
          <p class="text-sm text-blue-800 mb-2">此工具采用经典的放松呼吸节奏：</p>
          <ul class="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li><strong>吸气 (4秒)</strong>：用鼻子平静地吸气。</li>
            <li><strong>保持 (7秒)</strong>：屏住呼吸，让氧气充满身体。</li>
            <li><strong>呼气 (8秒)</strong>：用嘴缓慢呼气，发出"呼"的声音。</li>
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
import { ref, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale'

const isActive = ref(false)
const duration = ref(1) // 分钟
const timeLeft = ref(0)
const phase = ref<Phase>('idle')
const instructionText = ref('准备')

let sessionTimer: any = null
let cycleTimer: any = null
let countdownTimer: any = null

const timeLeftFormatted = computed(() => {
  const m = Math.floor(timeLeft.value / 60)
  const s = timeLeft.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

const startSession = () => {
  isActive.value = true
  timeLeft.value = duration.value * 60
  
  // 倒计时
  countdownTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      stopSession()
    }
  }, 1000)

  runCycle()
}

const runCycle = async () => {
  if (!isActive.value) return

  // 吸气 4秒
  phase.value = 'inhale'
  instructionText.value = '吸气'
  await wait(4000)
  if (!isActive.value) return

  // 保持 7秒
  phase.value = 'hold'
  instructionText.value = '保持'
  await wait(7000)
  if (!isActive.value) return

  // 呼气 8秒
  phase.value = 'exhale'
  instructionText.value = '呼气'
  await wait(8000)
  if (!isActive.value) return

  // 循环
  runCycle()
}

const wait = (ms: number) => {
  return new Promise(resolve => {
    cycleTimer = setTimeout(resolve, ms)
  })
}

const stopSession = () => {
  isActive.value = false
  phase.value = 'idle'
  instructionText.value = '完成'
  
  clearInterval(countdownTimer)
  clearTimeout(cycleTimer)
  
  setTimeout(() => {
    if (!isActive.value) instructionText.value = '准备'
  }, 2000)
}

onUnmounted(() => {
  stopSession()
})
</script>

<style scoped>
.scale-100 { transform: scale(1); }
.scale-50 { transform: scale(0.5); }
.scale-110 { transform: scale(1.1); }
.scale-90 { transform: scale(0.9); }
</style>
