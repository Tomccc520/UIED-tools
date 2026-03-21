<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">电子木鱼</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">Electronic Wooden Fish</p>

          <!-- 温馨提示 -->
          <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">在线敲木鱼，积攒功德，放松心情，净化心灵。</p>
            </div>
          </div>
        </div>

        <div
          class="woodfish-container w-full h-[600px] bg-black flex flex-col items-center justify-center overflow-hidden relative select-none rounded-xl">

          <!-- 背景文字/装饰 -->
          <div class="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <span class="text-[20rem] font-serif font-bold text-white">禅</span>
          </div>

          <!-- 计数器 -->
          <div class="z-10 text-center mb-12">
            <div class="text-gray-400 text-sm mb-2 tracking-widest uppercase">功德 Merit</div>
            <div class="text-6xl font-mono font-bold text-white tracking-wider">{{ count }}</div>
          </div>

          <!-- 木鱼主体 -->
          <div class="relative z-20 cursor-pointer transition-transform duration-100" :class="{ 'scale-95': isActive }"
            @mousedown="knock" @touchstart.prevent="knock" @mouseup="isActive = false" @touchend="isActive = false">
            <!-- 木鱼 SVG -->
            <svg width="240" height="200" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M120 180C175.228 180 220 135.228 220 80C220 24.7715 175.228 -20 120 -20C64.7715 -20 20 24.7715 20 80C20 135.228 64.7715 180 120 180Z"
                fill="#3E3E3E" />
              <path d="M20 80C20 135.228 64.7715 180 120 180C175.228 180 220 135.228 220 80" stroke="#5C5C5C"
                stroke-width="4" />
              <!-- 木鱼纹理 -->
              <path d="M50 80C50 118.66 81.3401 150 120 150C158.66 150 190 118.66 190 80" stroke="#2A2A2A"
                stroke-width="4" stroke-linecap="round" />
              <circle cx="120" cy="60" r="10" fill="#1A1A1A" />
              <path d="M120 200L140 220H100L120 200Z" fill="#2A2A2A" />
            </svg>

            <!-- 敲击光效 -->
            <div v-if="isActive" class="absolute inset-0 bg-white/10 rounded-full blur-xl transform scale-125"></div>
          </div>

          <!-- 浮动文字 -->
          <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <transition-group name="float-up">
              <div v-for="item in floatingTexts" :key="item.id" class="absolute text-white font-bold text-xl"
                :style="{ left: item.x + 'px', top: item.y + 'px' }">
                功德 +1
              </div>
            </transition-group>
          </div>

          <!-- 底部提示 -->
          <div class="absolute bottom-10 text-gray-600 text-xs tracking-widest">
            点击屏幕积攒功德 · 心诚则灵
          </div>

          <!-- 音效开关 -->
          <div class="absolute top-6 right-6">
            <button @click="toggleSound" class="text-gray-500 hover:text-white transition-colors">
              <svg v-if="soundEnabled" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </button>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const count = ref(0)
const isActive = ref(false)
const soundEnabled = ref(true)
const floatingTexts = ref<any[]>([])
let textId = 0

// 音频上下文（懒加载）
let audioCtx: AudioContext | null = null

const initAudio = () => {
  if (!audioCtx && window.AudioContext) {
    audioCtx = new window.AudioContext()
  }
}

// 合成木鱼声音
const playSound = () => {
  if (!soundEnabled.value || !audioCtx) return

  // 恢复音频上下文（如果被暂停）
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }

  const oscillator = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(800, audioCtx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1)

  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1)

  oscillator.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  oscillator.start()
  oscillator.stop(audioCtx.currentTime + 0.1)
}

const knock = (e: MouseEvent | TouchEvent) => {
  if (!audioCtx) initAudio()

  isActive.value = true
  count.value++
  playSound()

  // 添加浮动文字
  let clientX, clientY
  if ('touches' in e) {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = (e as MouseEvent).clientX
    clientY = (e as MouseEvent).clientY
  }

  const id = textId++
  floatingTexts.value.push({
    id,
    x: clientX,
    y: clientY - 50
  })

  // 移除浮动文字
  setTimeout(() => {
    const index = floatingTexts.value.findIndex(t => t.id === id)
    if (index !== -1) floatingTexts.value.splice(index, 1)
  }, 1000)

  // 保存到本地存储
  localStorage.setItem('woodfish_count', count.value.toString())
}

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
}

onMounted(() => {
  const saved = localStorage.getItem('woodfish_count')
  if (saved) count.value = parseInt(saved)
})

</script>

<style scoped>
.woodfish-container {
  /* 防止移动端回弹 */
  overscroll-behavior: none;
}

.float-up-enter-active,
.float-up-leave-active {
  transition: all 1s ease-out;
}

.float-up-enter-from {
  opacity: 1;
  transform: translateY(0);
}

.float-up-leave-to {
  opacity: 0;
  transform: translateY(-100px);
}
</style>
