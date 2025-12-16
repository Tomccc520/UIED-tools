<!--
 * @file Weather.vue
 * @description 天气查询工具组件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-26
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">天气查询</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">免费天气预报查询，支持全球城市，提供实时温度、湿度、风速及未来预报。</p>
        </div>

        <div class="max-w-3xl mx-auto">
          <!-- 搜索区域 -->
          <div class="flex flex-col md:flex-row gap-4 mb-8">
            <div class="flex-1 relative">
              <input v-model="city" @keyup.enter="searchWeather" type="text" placeholder="输入城市名称（如：Beijing, Shanghai）"
                class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
            </div>
            <button @click="searchWeather" :disabled="loading"
              class="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              {{ loading ? '查询中...' : '查询' }}
            </button>
          </div>

          <!-- 天气展示区域 -->
          <div v-if="weatherData" class="space-y-6">
            <!-- 当前天气 -->
            <div
              class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div class="relative z-10 flex justify-between items-center">
                <div>
                  <h3 class="text-3xl font-bold mb-2">{{ weatherData.current_condition[0].temp_C }}°C</h3>
                  <p class="text-blue-100 text-lg mb-4">{{ weatherData.current_condition[0].weatherDesc[0].value }}</p>
                  <div class="flex gap-6 text-sm text-blue-100">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      体感 {{ weatherData.current_condition[0].FeelsLikeC }}°C
                    </span>
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      湿度 {{ weatherData.current_condition[0].humidity }}%
                    </span>
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      风速 {{ weatherData.current_condition[0].windspeedKmph }} km/h
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold">{{ weatherData.request[0].query }}</div>
                  <div class="text-blue-100 mt-1">{{ formatDate(new Date()) }}</div>
                </div>
              </div>
            </div>

            <!-- 未来预报 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-for="(day, index) in weatherData.weather" :key="index"
                class="bg-gray-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <div class="text-gray-500 text-sm mb-2">{{ day.date }}</div>
                <div class="text-gray-800 font-bold text-lg mb-2">{{ day.mintempC }}° - {{ day.maxtempC }}°</div>
                <div class="text-blue-500 text-sm font-medium mb-2">{{ day.hourly[4].weatherDesc[0].value }}</div>
                <div class="text-gray-400 text-xs">
                  紫外线: {{ day.uvIndex }}
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="!loading && !weatherData && hasSearched" class="text-center py-12 text-gray-400">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>未找到该城市的天气信息，请尝试使用拼音或英文名称</p>
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()
const city = ref('')
const loading = ref(false)
const weatherData = ref<any>(null)
const hasSearched = ref(false)

const searchWeather = async () => {
  if (!city.value.trim()) {
    ElMessage.warning('请输入城市名称')
    return
  }

  loading.value = true
  hasSearched.value = true
  weatherData.value = null

  try {
    // 使用 wttr.in 接口，format=j1 返回 JSON 格式
    const response = await fetch(`https://wttr.in/${encodeURIComponent(city.value)}?format=j1`)
    if (!response.ok) throw new Error('Network response was not ok')

    const data = await response.json()
    weatherData.value = data
  } catch (error) {
    console.error('Failed to fetch weather:', error)
    ElMessage.error('获取天气信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 自动定位或默认查询
onMounted(() => {
  // 默认查询上海
  if (!city.value) {
    city.value = 'Shanghai'
    searchWeather()
  }
})

const guideSteps = [
  { title: '输入城市', description: '在搜索框中输入您想查询的城市名称，支持中文拼音（如：Beijing）或英文名称。' },
  { title: '查看详情', description: '查询成功后，将显示当前实时天气、温度、湿度等信息，以及未来几天的天气预报。' },
  { title: '多语言支持', description: '虽然接口主要支持英文城市名，但部分大城市也支持中文拼音输入。' }
]

const guideNotes = [
  '数据来源于开源天气服务 wttr.in。',
  '如果中文城市名查询失败，请尝试使用该城市的拼音或英文名称。',
  '建议使用Chrome或Firefox等现代浏览器以获得最佳体验。',
  '天气数据仅供参考，请以当地气象台发布为准。'
]
</script>
