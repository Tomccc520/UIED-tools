<!--
 * @file Bmi.vue
 * @description BMI计算器工具组件
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
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">BMI计算器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">在线计算身体质量指数(BMI)，快速评估您的身体健康状况。</p>
        </div>

        <div class="max-w-3xl mx-auto">
          <!-- 计算区域 -->
          <div class="flex flex-col md:flex-row gap-8 mb-8">
            <div class="flex-1 space-y-6">
              <div>
                <label class="block text-gray-700 font-medium mb-2">身高 (cm)</label>
                <input v-model.number="height" type="number" placeholder="请输入身高"
                  class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
              <div>
                <label class="block text-gray-700 font-medium mb-2">体重 (kg)</label>
                <input v-model.number="weight" type="number" placeholder="请输入体重"
                  class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
              <button @click="calculateBMI"
                class="w-full px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg">
                开始计算
              </button>
            </div>

            <!-- 结果展示 -->
            <div class="flex-1 bg-gray-50 rounded-xl p-6 flex flex-col justify-center items-center text-center">
              <div v-if="bmiResult" class="w-full">
                <div class="text-gray-500 mb-2">您的BMI指数为</div>
                <div class="text-5xl font-bold text-blue-600 mb-4">{{ bmiResult }}</div>
                <div class="text-xl font-medium mb-6" :class="bmiColorClass">{{ bmiStatus }}</div>
                
                <div class="w-full bg-gray-200 rounded-full h-4 mb-2 relative overflow-hidden">
                  <div class="h-full absolute left-0 top-0 transition-all duration-500"
                    :class="bmiColorBgClass"
                    :style="{ width: bmiPercent + '%' }"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-400">
                  <span>偏瘦</span>
                  <span>正常</span>
                  <span>偏胖</span>
                  <span>肥胖</span>
                </div>
              </div>
              <div v-else class="text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>请输入身高和体重进行计算</p>
              </div>
            </div>
          </div>

          <!-- BMI标准参考 -->
          <div class="bg-blue-50 rounded-xl p-6">
            <h3 class="font-bold text-gray-800 mb-4">BMI 中国标准参考</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-400">
                <div class="text-gray-500 mb-1">偏瘦</div>
                <div class="font-medium">&lt; 18.5</div>
              </div>
              <div class="bg-white p-3 rounded-lg shadow-sm border-l-4 border-green-500">
                <div class="text-gray-500 mb-1">正常</div>
                <div class="font-medium">18.5 - 23.9</div>
              </div>
              <div class="bg-white p-3 rounded-lg shadow-sm border-l-4 border-yellow-500">
                <div class="text-gray-500 mb-1">偏胖</div>
                <div class="font-medium">24.0 - 27.9</div>
              </div>
              <div class="bg-white p-3 rounded-lg shadow-sm border-l-4 border-red-500">
                <div class="text-gray-500 mb-1">肥胖</div>
                <div class="font-medium">≥ 28.0</div>
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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()
const height = ref<number | null>(null)
const weight = ref<number | null>(null)
const bmiResult = ref<string>('')
const bmiValue = ref<number>(0)

const calculateBMI = () => {
  if (!height.value || !weight.value) {
    ElMessage.warning('请输入身高和体重')
    return
  }
  
  if (height.value <= 0 || weight.value <= 0) {
    ElMessage.warning('请输入有效的数值')
    return
  }

  const h = height.value / 100 // 转换为米
  const bmi = weight.value / (h * h)
  bmiValue.value = bmi
  bmiResult.value = bmi.toFixed(1)
}

const bmiStatus = computed(() => {
  if (!bmiValue.value) return ''
  if (bmiValue.value < 18.5) return '偏瘦'
  if (bmiValue.value < 24) return '正常'
  if (bmiValue.value < 28) return '偏胖'
  return '肥胖'
})

const bmiColorClass = computed(() => {
  if (!bmiValue.value) return ''
  if (bmiValue.value < 18.5) return 'text-blue-500'
  if (bmiValue.value < 24) return 'text-green-500'
  if (bmiValue.value < 28) return 'text-yellow-500'
  return 'text-red-500'
})

const bmiColorBgClass = computed(() => {
  if (!bmiValue.value) return ''
  if (bmiValue.value < 18.5) return 'bg-blue-500'
  if (bmiValue.value < 24) return 'bg-green-500'
  if (bmiValue.value < 28) return 'bg-yellow-500'
  return 'bg-red-500'
})

const bmiPercent = computed(() => {
  if (!bmiValue.value) return 0
  // 简单的进度条映射，最大35
  const percent = (bmiValue.value / 35) * 100
  return Math.min(Math.max(percent, 0), 100)
})

const guideSteps = [
  { title: '输入数据', description: '输入您的身高(cm)和体重(kg)。' },
  { title: '点击计算', description: '点击"开始计算"按钮，系统将自动计算您的BMI指数。' },
  { title: '查看结果', description: '查看您的BMI数值以及对应的健康状态评估。' }
]

const guideNotes = [
  'BMI（Body Mass Index）是国际上常用的衡量人体胖瘦程度以及是否健康的一个标准。',
  '计算公式：BMI = 体重(kg) / (身高(m) * 身高(m))。',
  '本工具采用中国成人的BMI标准：<18.5偏瘦，18.5-23.9正常，24.0-27.9偏胖，≥28.0肥胖。',
  'BMI仅作为健康参考，不适用于未成年人、孕妇、运动员等特殊人群。'
]
</script>
