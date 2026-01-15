<!--
 * @file DecisionMaker.vue
 * @description 帮我决定工具组件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-12
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">帮我决定</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">选择困难症福音！输入选项，让运气帮你做决定。</p>
        </div>

        <div class="max-w-3xl mx-auto">
          <!-- 输入区域 -->
          <div class="bg-gray-50 rounded-xl p-6 mb-8">
            <div class="flex gap-4 mb-4">
              <input v-model="newOption" @keyup.enter="addOption" type="text" placeholder="输入选项（如：吃火锅、看电影）"
                class="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              <button @click="addOption"
                class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex-shrink-0">
                添加
              </button>
            </div>

            <!-- 选项列表 -->
            <div class="flex flex-wrap gap-3 mb-6">
              <div v-for="(option, index) in options" :key="index"
                class="bg-white px-4 py-2 rounded-full border border-gray-200 flex items-center gap-2 group hover:border-blue-300 transition-colors">
                <span>{{ option }}</span>
                <button @click="removeOption(index)" class="text-gray-400 hover:text-red-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div v-if="options.length === 0" class="text-gray-400 text-sm py-2">
                暂无选项，请添加...
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-center gap-4">
              <button @click="clearOptions" v-if="options.length > 0"
                class="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                清空
              </button>
              <button @click="makeDecision" :disabled="options.length < 2 || isDeciding"
                class="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center gap-2">
                <svg v-if="isDeciding" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isDeciding ? '随机选择中...' : '开始决定' }}
              </button>
            </div>
          </div>

          <!-- 结果展示 -->
          <div v-if="result" class="text-center animate-bounce-in">
            <div class="inline-block relative">
              <div class="absolute inset-0 bg-blue-400 blur-2xl opacity-20 rounded-full"></div>
              <div class="relative bg-white border-2 border-blue-100 rounded-2xl p-8 shadow-xl">
                <div class="text-gray-500 mb-2 font-medium">命运的选择是</div>
                <div class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  {{ result }}
                </div>
                <div class="mt-6 flex justify-center gap-2">
                  <button @click="result = ''" class="text-sm text-gray-400 hover:text-gray-600 underline">
                    重试
                  </button>
                </div>
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const newOption = ref('')
const options = ref<string[]>(['吃火锅', '喝奶茶', '去散步', '睡大觉'])
const isDeciding = ref(false)
const result = ref('')

const addOption = () => {
  const val = newOption.value.trim()
  if (!val) return
  if (options.value.includes(val)) {
    ElMessage.warning('该选项已存在')
    return
  }
  options.value.push(val)
  newOption.value = ''
}

const removeOption = (index: number) => {
  options.value.splice(index, 1)
}

const clearOptions = () => {
  options.value = []
  result.value = ''
}

const makeDecision = () => {
  if (options.value.length < 2) return
  
  isDeciding.value = true
  result.value = ''
  
  // 模拟随机动画
  let count = 0
  const maxCount = 20
  const interval = setInterval(() => {
    const randomIndex = Math.floor(Math.random() * options.value.length)
    result.value = options.value[randomIndex]
    count++
    
    if (count >= maxCount) {
      clearInterval(interval)
      isDeciding.value = false
      // 最终结果
      const finalIndex = Math.floor(Math.random() * options.value.length)
      result.value = options.value[finalIndex]
      confettiEffect()
    }
  }, 100)
}

const confettiEffect = () => {
  // 简单的礼花效果逻辑可以加在这里，或者仅仅依靠CSS动画
}

</script>

<style scoped>
@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
}
</style>
