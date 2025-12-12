<!--
 * @file index.vue
 * @description 年龄计算器工具组件
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
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">年龄计算器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">在线计算您的精确年龄，包括周岁、虚岁、生肖、星座以及距离下一个生日的天数。</p>
        </div>

        <div class="max-w-2xl mx-auto">
          <!-- 输入区域 -->
          <div class="bg-gray-50 p-6 rounded-lg mb-8">
            <div class="flex flex-col md:flex-row gap-4 items-end">
              <div class="flex-1 w-full">
                <label class="block text-sm font-medium text-gray-700 mb-2">出生日期</label>
                <input type="date" v-model="birthDate" :max="today"
                  class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
              </div>
              <button @click="calculateAge"
                class="w-full md:w-auto px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                开始计算
              </button>
            </div>
          </div>

          <!-- 结果展示 -->
          <div v-if="result" class="space-y-6">
            <!-- 核心卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white text-center">
                <div class="text-sm opacity-80 mb-1">周岁</div>
                <div class="text-4xl font-bold">{{ result.age }}</div>
                <div class="text-xs opacity-60 mt-1">Years Old</div>
              </div>
              <div class="bg-white border border-gray-100 shadow-sm rounded-xl p-6 text-center">
                <div class="text-sm text-gray-500 mb-1">虚岁</div>
                <div class="text-4xl font-bold text-gray-800">{{ result.nominalAge }}</div>
                <div class="text-xs text-gray-400 mt-1">Nominal Age</div>
              </div>
              <div class="bg-white border border-gray-100 shadow-sm rounded-xl p-6 text-center">
                <div class="text-sm text-gray-500 mb-1">下一个生日</div>
                <div class="text-4xl font-bold text-green-500">{{ result.nextBirthdayDays }}</div>
                <div class="text-xs text-gray-400 mt-1">天后 (Days)</div>
              </div>
            </div>

            <!-- 详细信息 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-xs text-gray-500 mb-1">生肖</div>
                <div class="text-xl font-medium text-gray-800">{{ result.zodiac }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-xs text-gray-500 mb-1">星座</div>
                <div class="text-xl font-medium text-gray-800">{{ result.constellation }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-xs text-gray-500 mb-1">出生天数</div>
                <div class="text-xl font-medium text-gray-800">{{ result.totalDays }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-xs text-gray-500 mb-1">出生星期</div>
                <div class="text-xl font-medium text-gray-800">{{ result.weekDay }}</div>
              </div>
            </div>

            <!-- 时间详情 -->
            <div class="bg-white border border-gray-100 rounded-xl p-6">
              <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                您在这个世界上已经存在了
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-y-4 text-center">
                <div>
                  <div class="text-2xl font-bold text-gray-800">{{ result.detail.months }}</div>
                  <div class="text-xs text-gray-500">个月</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-gray-800">{{ result.detail.weeks }}</div>
                  <div class="text-xs text-gray-500">周</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-gray-800">{{ result.detail.hours }}</div>
                  <div class="text-xs text-gray-500">小时</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-gray-800">{{ result.detail.minutes }}</div>
                  <div class="text-xs text-gray-500">分钟</div>
                </div>
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
const today = new Date().toISOString().split('T')[0]
const birthDate = ref('')

interface CalculationResult {
  age: number
  nominalAge: number
  zodiac: string
  constellation: string
  nextBirthdayDays: number
  totalDays: number
  weekDay: string
  detail: {
    months: string
    weeks: string
    hours: string
    minutes: string
  }
}

const result = ref<CalculationResult | null>(null)

// 星座数据
const constellations = [
  { name: "摩羯座", startMonth: 1, startDay: 1, endMonth: 1, endDay: 19 },
  { name: "水瓶座", startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: "双鱼座", startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { name: "白羊座", startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: "金牛座", startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: "双子座", startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
  { name: "巨蟹座", startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
  { name: "狮子座", startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: "处女座", startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: "天秤座", startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
  { name: "天蝎座", startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
  { name: "射手座", startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
  { name: "摩羯座", startMonth: 12, startDay: 22, endMonth: 12, endDay: 31 }
]

// 生肖数据
const zodiacs = ['猴', '鸡', '狗', '猪', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊']
const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const getZodiac = (year: number) => {
  return zodiacs[year % 12]
}

const getConstellation = (month: number, day: number) => {
  const match = constellations.find(c =>
    (month === c.startMonth && day >= c.startDay) ||
    (month === c.endMonth && day <= c.endDay)
  )
  return match ? match.name : ''
}

const calculateAge = () => {
  if (!birthDate.value) {
    ElMessage.warning('请选择出生日期')
    return
  }

  const birth = new Date(birthDate.value)
  const now = new Date()

  if (birth > now) {
    ElMessage.warning('出生日期不能晚于今天')
    return
  }

  // 基础计算
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--
  }

  // 虚岁 (当前年份 - 出生年份 + 1)
  const nominalAge = now.getFullYear() - birth.getFullYear() + 1

  // 总天数
  const diffTime = Math.abs(now.getTime() - birth.getTime())
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // 下一个生日
  const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
  if (now > nextBirthday) {
    nextBirthday.setFullYear(now.getFullYear() + 1)
  }
  const diffNextBirthday = Math.abs(nextBirthday.getTime() - now.getTime())
  const nextBirthdayDays = Math.ceil(diffNextBirthday / (1000 * 60 * 60 * 24))

  // 详细时间
  const totalMonths = (age * 12) + (now.getMonth() - birth.getMonth()) + (now.getDate() < birth.getDate() ? -1 : 0)
  const totalWeeks = Math.floor(totalDays / 7)
  const totalHours = Math.floor(diffTime / (1000 * 60 * 60))
  const totalMinutes = Math.floor(diffTime / (1000 * 60))

  result.value = {
    age,
    nominalAge,
    zodiac: getZodiac(birth.getFullYear()),
    constellation: getConstellation(birth.getMonth() + 1, birth.getDate()),
    nextBirthdayDays,
    totalDays,
    weekDay: weekDays[birth.getDay()],
    detail: {
      months: totalMonths.toLocaleString(),
      weeks: totalWeeks.toLocaleString(),
      hours: totalHours.toLocaleString(),
      minutes: totalMinutes.toLocaleString()
    }
  }

  ElMessage.success('计算成功')
}

const guideSteps = [
  { title: '选择日期', description: '点击日期输入框，在弹出的日历中选择您的出生日期。' },
  { title: '获取结果', description: '点击“开始计算”按钮，系统将自动计算您的各项年龄数据。' },
  { title: '查看详情', description: '结果包含周岁、虚岁、生肖星座以及精确的生存时间统计。' }
]

const guideNotes = [
  '虚岁按照中国传统算法：出生即为1岁，每过春节加1岁（此处简化为年份差+1）。',
  '计算结果仅供参考，精确时间基于当前系统时间。',
  '所有计算均在本地进行，不会上传您的隐私数据。'
]
</script>
