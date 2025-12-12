<!--
 * @file index.vue
 * @description 人生进度条工具组件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">人生进度条</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">可视化您的人生进度，珍惜当下，规划未来。</p>
        </div>

        <div class="max-w-2xl mx-auto">
          <!-- 输入区域 -->
          <div class="bg-gray-50 p-6 rounded-lg mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">出生日期</label>
                <input type="date" v-model="birthDate" :max="today"
                  class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">预期寿命 (岁)</label>
                <input type="number" v-model="lifeExpectancy" min="1" max="150"
                  class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
              </div>
            </div>
            <button @click="calculateProgress"
              class="w-full mt-4 px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
              查看进度
            </button>
          </div>

          <!-- 结果展示 -->
          <div v-if="result" class="space-y-8">
            <!-- 进度条 -->
            <div class="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div class="flex justify-between items-end mb-2">
                <span class="text-lg font-bold text-gray-800">人生进度</span>
                <span class="text-3xl font-bold text-green-500">{{ result.percentage }}%</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <div class="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out relative"
                  :style="{ width: `${result.percentage}%` }">
                  <div class="absolute right-0 top-0 bottom-0 w-1 bg-white/20"></div>
                </div>
              </div>
              <div class="flex justify-between text-xs text-gray-400 mt-2">
                <span>0岁</span>
                <span>{{ lifeExpectancy }}岁</span>
              </div>
            </div>

            <!-- 电量电池风格展示 -->
            <div class="flex justify-center py-8">
              <div class="relative w-32 h-64 border-4 border-gray-300 rounded-2xl p-2">
                <!-- 电池头 -->
                <div class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gray-300 rounded-t-sm">
                </div>
                <!-- 电量 -->
                <div class="w-full h-full bg-gray-100 rounded-lg flex flex-col justify-end overflow-hidden relative">
                  <div
                    class="w-full transition-all duration-1000 ease-out flex items-center justify-center text-white font-bold"
                    :class="getBatteryColor(100 - parseFloat(result.percentage))"
                    :style="{ height: `${100 - parseFloat(result.percentage)}%` }">
                    <span class="drop-shadow-md">余 {{ (100 - parseFloat(result.percentage)).toFixed(1) }}%</span>
                  </div>
                  <!-- 波动效果 -->
                  <div class="absolute w-full h-2 bg-white/20 animate-pulse"
                    :style="{ bottom: `${100 - parseFloat(result.percentage)}%` }"></div>
                </div>
              </div>
            </div>

            <!-- 详细数据 -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blue-50 p-4 rounded-lg text-center">
                <div class="text-sm text-blue-600 mb-1">已度过</div>
                <div class="text-xl font-bold text-blue-800">{{ result.passedDays }} 天</div>
                <div class="text-xs text-blue-400 mt-1">{{ result.passedYears }} 年</div>
              </div>
              <div class="bg-orange-50 p-4 rounded-lg text-center">
                <div class="text-sm text-orange-600 mb-1">剩余</div>
                <div class="text-xl font-bold text-orange-800">{{ result.remainingDays }} 天</div>
                <div class="text-xs text-orange-400 mt-1">{{ result.remainingYears }} 年</div>
              </div>
            </div>

            <!-- 激励语 -->
            <div class="text-center text-gray-500 text-sm italic">
              "{{ getQuote(parseFloat(result.percentage)) }}"
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()
const today = new Date().toISOString().split('T')[0]
const birthDate = ref('')
const lifeExpectancy = ref(80)

interface ProgressResult {
  percentage: string
  passedDays: string
  passedYears: string
  remainingDays: string
  remainingYears: string
}

const result = ref<ProgressResult | null>(null)

const getBatteryColor = (percentage: number) => {
  if (percentage > 60) return 'bg-green-500'
  if (percentage > 20) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getQuote = (percentage: number) => {
  if (percentage < 30) return '青春正当时，未来犹可期。'
  if (percentage < 60) return '人生中场，精彩继续。'
  if (percentage < 90) return '岁月沉淀智慧，夕阳无限好。'
  return '每一天都是上天的馈赠。'
}

const calculateProgress = () => {
  if (!birthDate.value) {
    ElMessage.warning('请选择出生日期')
    return
  }
  
  if (lifeExpectancy.value <= 0) {
    ElMessage.warning('请输入有效的预期寿命')
    return
  }

  const birth = new Date(birthDate.value)
  const now = new Date()
  const end = new Date(birth.getFullYear() + lifeExpectancy.value, birth.getMonth(), birth.getDate())

  if (birth > now) {
    ElMessage.warning('出生日期不能晚于今天')
    return
  }

  const totalTime = end.getTime() - birth.getTime()
  const passedTime = now.getTime() - birth.getTime()
  
  let percentage = (passedTime / totalTime) * 100
  if (percentage > 100) percentage = 100
  if (percentage < 0) percentage = 0

  const passedDays = Math.floor(passedTime / (1000 * 60 * 60 * 24))
  const totalDays = Math.floor(totalTime / (1000 * 60 * 60 * 24))
  const remainingDays = totalDays - passedDays

  result.value = {
    percentage: percentage.toFixed(1),
    passedDays: passedDays.toLocaleString(),
    passedYears: (passedDays / 365).toFixed(1),
    remainingDays: remainingDays > 0 ? remainingDays.toLocaleString() : '0',
    remainingYears: remainingDays > 0 ? (remainingDays / 365).toFixed(1) : '0'
  }

  ElMessage.success('计算完成')
}

const guideSteps = [
  { title: '设置信息', description: '输入您的出生日期和预期的寿命目标（默认为80岁）。' },
  { title: '查看进度', description: '点击按钮，系统将以进度条和电池的形式直观展示您的人生进度。' },
  { title: '数据解读', description: '结果包含已度过的时间百分比、剩余天数等详细数据。' }
]

const guideNotes = [
  '本工具仅供娱乐和自我激励，不代表真实寿命预测。',
  '珍惜当下，过好每一天才是最重要的。',
  '数据仅在本地计算，保护您的隐私安全。'
]
</script>
