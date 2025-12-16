<!--
 * @file DateCalculator.vue
 * @description 日期计算器工具组件，支持日期差计算和日期推算
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-30
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <div class="max-w-3xl mx-auto">
          <!-- 选项卡切换 -->
          <div class="flex justify-center mb-8">
            <div class="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                @click="currentTab = tab.value"
                class="px-6 py-2 rounded-md text-sm font-medium transition-all duration-200"
                :class="currentTab === tab.value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- 日期差计算 -->
          <div v-if="currentTab === 'diff'" class="bg-gray-50 p-8 rounded-xl border border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
                <el-date-picker
                  v-model="startDate"
                  type="date"
                  placeholder="选择开始日期"
                  class="w-full"
                  size="large"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
                <el-date-picker
                  v-model="endDate"
                  type="date"
                  placeholder="选择结束日期"
                  class="w-full"
                  size="large"
                />
              </div>
            </div>

            <div v-if="diffResult" class="bg-white p-6 rounded-lg border border-blue-100 shadow-sm text-center">
              <div class="text-gray-500 text-sm mb-2">相差天数</div>
              <div class="text-4xl font-bold text-blue-600 mb-4">{{ diffResult.days }} <span class="text-base font-normal text-gray-500">天</span></div>
              
              <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <div class="text-xl font-semibold text-gray-800">{{ diffResult.weeks }}</div>
                  <div class="text-xs text-gray-500">周数</div>
                </div>
                <div>
                  <div class="text-xl font-semibold text-gray-800">{{ diffResult.months }}</div>
                  <div class="text-xs text-gray-500">月数</div>
                </div>
                <div>
                  <div class="text-xl font-semibold text-gray-800">{{ diffResult.years }}</div>
                  <div class="text-xs text-gray-500">年数</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 日期推算 -->
          <div v-if="currentTab === 'calc'" class="bg-gray-50 p-8 rounded-xl border border-gray-200">
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">基准日期</label>
                <el-date-picker
                  v-model="calcBaseDate"
                  type="date"
                  placeholder="选择基准日期"
                  class="w-full"
                  size="large"
                />
              </div>

              <div class="flex items-center gap-4">
                <el-radio-group v-model="calcType">
                  <el-radio-button label="add">往后推</el-radio-button>
                  <el-radio-button label="subtract">往前推</el-radio-button>
                </el-radio-group>
              </div>

              <div class="flex gap-4">
                <div class="flex-1">
                  <el-input-number v-model="calcAmount" :min="1" size="large" class="w-full" />
                </div>
                <div class="w-32">
                  <el-select v-model="calcUnit" size="large">
                    <el-option label="天" value="day" />
                    <el-option label="周" value="week" />
                    <el-option label="月" value="month" />
                    <el-option label="年" value="year" />
                  </el-select>
                </div>
              </div>

              <div v-if="calcResult" class="bg-white p-6 rounded-lg border border-green-100 shadow-sm text-center mt-6">
                <div class="text-gray-500 text-sm mb-2">计算结果</div>
                <div class="text-3xl font-bold text-green-600">{{ calcResult }}</div>
                <div class="text-sm text-gray-500 mt-2">{{ calcResultWeek }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="feature in features" :key="feature.title" class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 flex-shrink-0">
                <span v-html="feature.icon"></span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">{{ feature.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />

      <!-- 使用说明 -->
      <UsageGuide :steps="guideSteps" :notes="guideNotes" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

dayjs.locale('zh-cn')

const route = useRoute()

const info = reactive({
  title: "在线日期计算器",
  subtitle: "计算两个日期之间的天数间隔，或根据日期推算未来/过去的日期"
})

const tabs = [
  { label: '日期间隔计算', value: 'diff' },
  { label: '日期推算', value: 'calc' }
]

const currentTab = ref('diff')

// 日期差计算状态
const startDate = ref(dayjs().toDate())
const endDate = ref(dayjs().add(1, 'month').toDate())

const diffResult = computed(() => {
  if (!startDate.value || !endDate.value) return null
  const start = dayjs(startDate.value)
  const end = dayjs(endDate.value)
  const diffDays = Math.abs(end.diff(start, 'day'))
  
  return {
    days: diffDays,
    weeks: (diffDays / 7).toFixed(1),
    months: Math.abs(end.diff(start, 'month', true)).toFixed(1),
    years: Math.abs(end.diff(start, 'year', true)).toFixed(1)
  }
})

// 日期推算状态
const calcBaseDate = ref(dayjs().toDate())
const calcType = ref('add')
const calcAmount = ref(1)
const calcUnit = ref('day')

const calcResultDate = computed(() => {
  if (!calcBaseDate.value) return null
  const base = dayjs(calcBaseDate.value)
  if (calcType.value === 'add') {
    return base.add(calcAmount.value, calcUnit.value as any)
  } else {
    return base.subtract(calcAmount.value, calcUnit.value as any)
  }
})

const calcResult = computed(() => {
  return calcResultDate.value?.format('YYYY年MM月DD日')
})

const calcResultWeek = computed(() => {
  return calcResultDate.value?.format('dddd')
})

const features = [
  {
    title: '日期相差计算',
    desc: '快速计算两个日期之间相差的天数、周数、月数和年数',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`
  },
  {
    title: '日期推算',
    desc: '根据基准日期，往前或往后推算指定天数、周数或月数后的日期',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
  },
  {
    title: '精准可靠',
    desc: '基于标准日历算法，自动处理闰年、大小月等复杂情况',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
  }
]

const guideSteps = [
  { title: '选择模式', description: '在顶部切换“日期间隔计算”或“日期推算”模式。' },
  { title: '输入日期', description: '选择开始日期/结束日期，或输入基准日期和推算时间。' },
  { title: '查看结果', description: '系统将实时计算并显示结果，无需点击按钮。' }
]

const guideNotes = [
  '计算结果已包含起始日期当天。',
  '支持公元1900年以后的日期计算。'
]
</script>