<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">屏幕测试</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">全屏纯色显示，检测屏幕坏点、漏光和色彩表现。</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
          <button v-for="color in colors" :key="color.name"
                  @click="enterTest(color.value)"
                  class="aspect-square rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all flex flex-col items-center justify-center gap-2 border border-gray-100 group"
                  :style="{ backgroundColor: color.preview || color.value }">
             <span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800 shadow-sm group-hover:bg-white">
               {{ color.name }}
             </span>
          </button>
        </div>

        <!-- 说明 -->
        <div class="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto text-center">
          <h3 class="font-bold text-gray-800 mb-4">使用说明</h3>
          <p class="text-gray-600 text-sm mb-4">
            点击上方任意颜色块进入全屏测试模式。<br>
            在测试模式下，<strong>点击屏幕</strong> 或 <strong>按空格键</strong> 切换颜色。<br>
            <strong>按 ESC 键</strong> 或 <strong>双击</strong> 退出测试。
          </p>
          <button @click="enterTest('white')" 
                  class="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg">
            开始测试
          </button>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>

    <!-- 全屏测试层 -->
    <div v-if="isTesting" 
         class="fixed inset-0 z-50 cursor-none transition-colors duration-300"
         :style="{ backgroundColor: currentColor }"
         @click="nextColor"
         @dblclick="exitTest"
         ref="testLayer">
       
       <!-- 初始提示 (3秒后消失) -->
       <div v-if="showTip" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/50 text-2xl font-light pointer-events-none select-none mix-blend-difference">
         点击切换颜色 | 双击退出
       </div>
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

const isTesting = ref(false)
const currentColor = ref('#FFFFFF')
const showTip = ref(false)
const testLayer = ref<HTMLElement | null>(null)

const colors = [
  { name: '纯白', value: '#FFFFFF', preview: '#FFFFFF' },
  { name: '纯黑', value: '#000000', preview: '#000000' },
  { name: '纯红', value: '#FF0000', preview: '#FF0000' },
  { name: '纯绿', value: '#00FF00', preview: '#00FF00' },
  { name: '纯蓝', value: '#0000FF', preview: '#0000FF' },
  { name: '50%灰', value: '#808080', preview: '#808080' },
  { name: '渐变', value: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)', preview: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)' },
  { name: '网格', value: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #000 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #000 20px) #fff', preview: 'repeating-linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%, #ddd), repeating-linear-gradient(45deg, #ddd 25%, #fff 25%, #fff 75%, #ddd 75%, #ddd)' }
]

let colorIndex = 0

const enterTest = (color: string) => {
  isTesting.value = true
  currentColor.value = color
  colorIndex = colors.findIndex(c => c.value === color)
  if (colorIndex === -1) colorIndex = 0
  
  showTip.value = true
  setTimeout(() => { showTip.value = false }, 3000)

  document.documentElement.requestFullscreen().catch(e => {
    console.log('Fullscreen denied:', e)
  })
}

const nextColor = () => {
  colorIndex = (colorIndex + 1) % colors.length
  currentColor.value = colors[colorIndex].value
}

const exitTest = () => {
  isTesting.value = false
  if (document.fullscreenElement) {
    document.exitFullscreen()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!isTesting.value) return
  
  if (e.key === 'Escape') {
    exitTest()
  } else if (e.key === ' ' || e.key === 'ArrowRight') {
    nextColor()
  } else if (e.key === 'ArrowLeft') {
    colorIndex = (colorIndex - 1 + colors.length) % colors.length
    currentColor.value = colors[colorIndex].value
  }
}

// 监听全屏退出
const handleFullscreenChange = () => {
  if (!document.fullscreenElement) {
    isTesting.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>
