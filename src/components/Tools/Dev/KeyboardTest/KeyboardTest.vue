<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">键盘按键测试</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">按下键盘任意键，查看其 KeyCode 和详细信息。</p>
        </div>

        <!-- 核心展示区 -->
        <div class="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
          
          <div v-if="!lastEvent" class="text-center text-gray-400 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <p class="text-2xl">请按下键盘上的任意键...</p>
          </div>

          <div v-else class="w-full animate-fade-in-up">
            <!-- 主要 KeyCode 显示 -->
            <div class="flex justify-center mb-12">
              <div class="relative group">
                <div class="text-[120px] font-bold text-blue-600 font-mono leading-none tracking-tighter">
                  {{ lastEvent.keyCode }}
                </div>
                <div class="absolute -bottom-6 left-0 right-0 text-center text-gray-400 text-sm font-medium uppercase tracking-widest">
                  keyCode
                </div>
              </div>
            </div>

            <!-- 详细信息卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div class="text-xs text-gray-500 uppercase mb-2">event.key</div>
                <div class="text-2xl font-bold text-gray-800 font-mono break-all">{{ lastEvent.key === ' ' ? '(Space)' : lastEvent.key }}</div>
              </div>
              
              <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div class="text-xs text-gray-500 uppercase mb-2">event.code</div>
                <div class="text-2xl font-bold text-gray-800 font-mono text-green-600">{{ lastEvent.code }}</div>
              </div>

              <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center hover:shadow-md transition-shadow">
                <div class="text-xs text-gray-500 uppercase mb-2">Modifiers</div>
                <div class="flex justify-center gap-2">
                  <span :class="['px-2 py-1 rounded text-xs font-bold', lastEvent.ctrlKey ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-400']">Ctrl</span>
                  <span :class="['px-2 py-1 rounded text-xs font-bold', lastEvent.altKey ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-400']">Alt</span>
                  <span :class="['px-2 py-1 rounded text-xs font-bold', lastEvent.shiftKey ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-400']">Shift</span>
                  <span :class="['px-2 py-1 rounded text-xs font-bold', lastEvent.metaKey ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-400']">Meta</span>
                </div>
              </div>
            </div>

            <!-- 历史记录 -->
            <div class="mt-12">
              <h3 class="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">最近按键</h3>
              <div class="flex flex-wrap gap-2">
                <span v-for="(k, i) in history.slice().reverse().slice(0, 10)" :key="i"
                      class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-600 shadow-sm">
                  {{ k.key === ' ' ? 'Space' : k.key }} <span class="text-gray-300 text-xs ml-1">{{ k.keyCode }}</span>
                </span>
              </div>
            </div>
          </div>

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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

interface KeyEventInfo {
  key: string
  keyCode: number
  code: string
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
  metaKey: boolean
  timestamp: number
}

const lastEvent = ref<KeyEventInfo | null>(null)
const history = ref<KeyEventInfo[]>([])

const handleKeydown = (e: KeyboardEvent) => {
  e.preventDefault() // 防止触发浏览器默认快捷键
  
  const info: KeyEventInfo = {
    key: e.key,
    keyCode: e.keyCode,
    code: e.code,
    ctrlKey: e.ctrlKey,
    altKey: e.altKey,
    shiftKey: e.shiftKey,
    metaKey: e.metaKey,
    timestamp: Date.now()
  }
  
  lastEvent.value = info
  history.value.push(info)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
