<template>
  <div class="min-h-screen flex flex-col transition-colors duration-500" :class="isFullscreen ? 'bg-black' : ''">
    <div class="mx-auto w-full max-w-7xl flex-1 flex flex-col">
      <div class="rounded-xl p-4 md:p-8 mb-4 transition-all duration-300 flex-1 flex flex-col"
        :class="isFullscreen ? 'fixed inset-0 z-50 rounded-none h-full bg-black m-0 p-0 justify-center items-center' : 'bg-white shadow-sm'">

        <!-- Header -->
        <div class="text-center mb-12 relative" v-if="!isFullscreen">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">全屏翻页时钟</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">极简风格全屏翻页时钟，支持 12/24 小时制</p>
        </div>

        <!-- 时钟容器 -->
        <div class="flex flex-col items-center justify-center transition-all duration-300 flex-1">
          <div
            class="flex gap-4 md:gap-6 items-center justify-center transform transition-transform duration-300 select-none"
            :class="isFullscreen ? 'scale-[0.8] md:scale-125 lg:scale-150' : 'scale-75 md:scale-100'">

            <!-- 小时 -->
            <div class="flip-unit-container">
              <div class="flip-card" :class="{ 'flip': flipping.hours }">
                <div class="top">{{ nextHours }}</div>
                <div class="bottom">{{ nextHours }}</div>
                <div class="top-flip">{{ hours }}</div>
                <div class="bottom-flip">{{ nextHours }}</div>
              </div>
            </div>

            <div class="text-6xl md:text-8xl font-bold pb-4" :class="isFullscreen ? 'text-[#333]' : 'text-gray-200'">:
            </div>

            <!-- 分钟 -->
            <div class="flip-unit-container">
              <div class="flip-card" :class="{ 'flip': flipping.minutes }">
                <div class="top">{{ nextMinutes }}</div>
                <div class="bottom">{{ nextMinutes }}</div>
                <div class="top-flip">{{ minutes }}</div>
                <div class="bottom-flip">{{ nextMinutes }}</div>
              </div>
            </div>

            <div class="text-6xl md:text-8xl font-bold pb-4" :class="isFullscreen ? 'text-[#333]' : 'text-gray-200'">:
            </div>

            <!-- 秒 -->
            <div class="flip-unit-container">
              <div class="flip-card" :class="{ 'flip': flipping.seconds }">
                <div class="top">{{ nextSeconds }}</div>
                <div class="bottom">{{ nextSeconds }}</div>
                <div class="top-flip">{{ seconds }}</div>
                <div class="bottom-flip">{{ nextSeconds }}</div>
              </div>
            </div>
          </div>

          <!-- 日期显示 -->
          <div class="mt-12 text-lg md:text-2xl font-light tracking-widest opacity-80"
            :class="isFullscreen ? 'text-gray-400' : 'text-gray-500'">
            {{ currentDate }}
          </div>
        </div>

        <!-- 控制栏 -->
        <div class="mt-auto flex gap-6 justify-center pb-8"
          :class="{ 'fixed bottom-10 left-0 right-0 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300': isFullscreen }">
          <button @click="toggleFullscreen"
            class="px-8 py-3 rounded-full transition-all flex items-center gap-2 border shadow-sm hover:shadow-md"
            :class="isFullscreen ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                clip-rule="evenodd" />
            </svg>
            {{ isFullscreen ? '退出全屏' : '全屏模式' }}
          </button>

          <button @click="toggleFormat" class="px-8 py-3 rounded-full transition-all border shadow-sm hover:shadow-md"
            :class="isFullscreen ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'">
            {{ is24Hour ? '24小时制' : '12小时制' }}
          </button>
        </div>
      </div>

      <!-- 推荐工具 -->
      <ToolsRecommend v-if="!isFullscreen" :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 */
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const hours = ref('00')
const minutes = ref('00')
const seconds = ref('00')
const nextHours = ref('00')
const nextMinutes = ref('00')
const nextSeconds = ref('00')

const is24Hour = ref(true)
const isFullscreen = ref(false)

const flipping = ref({
  hours: false,
  minutes: false,
  seconds: false
})

const currentDate = computed(() => {
  const date = new Date()
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return date.toLocaleDateString('zh-CN', options)
})

let timer: any

const updateTime = () => {
  const now = new Date()
  let h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()

  if (!is24Hour.value) {
    h = h % 12 || 12
  }

  const hStr = h.toString().padStart(2, '0')
  const mStr = m.toString().padStart(2, '0')
  const sStr = s.toString().padStart(2, '0')

  // Update logic for flip animation
  if (hStr !== hours.value) {
    nextHours.value = hStr
    flipping.value.hours = true
    setTimeout(() => {
      hours.value = hStr
      flipping.value.hours = false
    }, 600)
  } else {
    nextHours.value = hStr
  }

  if (mStr !== minutes.value) {
    nextMinutes.value = mStr
    flipping.value.minutes = true
    setTimeout(() => {
      minutes.value = mStr
      flipping.value.minutes = false
    }, 600)
  } else {
    nextMinutes.value = mStr
  }

  if (sStr !== seconds.value) {
    nextSeconds.value = sStr
    flipping.value.seconds = true
    setTimeout(() => {
      seconds.value = sStr
      flipping.value.seconds = false
    }, 600)
  } else {
    nextSeconds.value = sStr
  }
}

const toggleFormat = () => {
  is24Hour.value = !is24Hour.value
  // Immediate update without animation for format change
  const now = new Date()
  let h = now.getHours()
  if (!is24Hour.value) h = h % 12 || 12
  const hStr = h.toString().padStart(2, '0')
  hours.value = hStr
  nextHours.value = hStr
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

onMounted(() => {
  // Initialize values immediately
  const now = new Date()
  let h = now.getHours()
  if (!is24Hour.value) h = h % 12 || 12
  const hStr = h.toString().padStart(2, '0')
  const mStr = now.getMinutes().toString().padStart(2, '0')
  const sStr = now.getSeconds().toString().padStart(2, '0')

  hours.value = hStr
  minutes.value = mStr
  seconds.value = sStr
  nextHours.value = hStr
  nextMinutes.value = mStr
  nextSeconds.value = sStr

  timer = setInterval(updateTime, 1000)

  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@700&display=swap');

.flip-unit-container {
  display: block;
  position: relative;
  width: 140px;
  height: 200px;
  perspective: 1000px;
  font-family: 'Roboto Mono', monospace;
}

.flip-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
}

.top,
.bottom,
.top-flip,
.bottom-flip {
  height: 50%;
  width: 100%;
  position: absolute;
  left: 0;
  overflow: hidden;
  text-align: center;
  background: #1f2937;
  /* gray-800 */
  color: #f3f4f6;
  /* gray-100 */
  font-size: 150px;
  line-height: 200px;
  font-weight: bold;
  border-radius: 12px;
  backface-visibility: hidden;
}

.top,
.top-flip {
  top: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  border-radius: 12px 12px 0 0;
  transform-origin: 50% 100%;
}

.bottom,
.bottom-flip {
  bottom: 0;
  border-radius: 0 0 12px 12px;
  transform-origin: 50% 0%;
  line-height: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.top {
  z-index: 1;
}

.bottom {
  z-index: 2;
  /* Shows next value bottom */
}

.top-flip {
  z-index: 3;
  /* Shows current value top */
  transform: rotateX(0deg);
}

.bottom-flip {
  z-index: 4;
  /* Hidden initially, flips down */
  transform: rotateX(90deg);
}

.flip .top-flip {
  animation: flip-top 0.6s ease-in both;
}

.flip .bottom-flip {
  animation: flip-bottom 0.6s ease-in both;
}

@keyframes flip-top {
  0% {
    transform: rotateX(0deg);
  }

  100% {
    transform: rotateX(-90deg);
  }
}

@keyframes flip-bottom {
  0% {
    transform: rotateX(90deg);
  }

  100% {
    transform: rotateX(0deg);
  }
}
</style>
