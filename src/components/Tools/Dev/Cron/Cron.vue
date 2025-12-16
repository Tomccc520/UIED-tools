<!--
 * @file Cron.vue
 * @description Cron 表达式生成器，可视化生成和解析 Cron 表达式
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Simple Cron implementation for demonstration
// A full implementation would require a complex library or lots of logic
// Here we provide a simplified visual builder

const second = ref('*')
const minute = ref('*')
const hour = ref('*')
const dayOfMonth = ref('*')
const month = ref('*')
const dayOfWeek = ref('?')
const year = ref('*')

const cronExpression = computed(() => {
  return `${second.value} ${minute.value} ${hour.value} ${dayOfMonth.value} ${month.value} ${dayOfWeek.value} ${year.value}`.trim()
})

const tabs = ['秒', '分', '时', '日', '月', '周', '年']
const activeTab = ref('秒')

const setSimple = (type: string, val: string) => {
  switch (type) {
    case '秒': second.value = val; break;
    case '分': minute.value = val; break;
    case '时': hour.value = val; break;
    case '日': dayOfMonth.value = val; dayOfWeek.value = '?'; break;
    case '月': month.value = val; break;
    case '周': dayOfWeek.value = val; dayOfMonth.value = '?'; break;
    case '年': year.value = val; break;
  }
}

const copyCron = () => {
  navigator.clipboard.writeText(cronExpression.value)
    .then(() => alert('已复制到剪贴板'))
    .catch(err => console.error('复制失败:', err))
}

const presets = [
  { label: '每秒执行一次', value: '* * * * * ? *' },
  { label: '每分钟执行一次', value: '0 * * * * ? *' },
  { label: '每天凌晨1点执行', value: '0 0 1 * * ? *' },
  { label: '每月1号凌晨1点执行', value: '0 0 1 1 * ? *' },
  { label: '每周一凌晨1点执行', value: '0 0 1 ? * MON *' },
]

const applyPreset = (val: string) => {
  const parts = val.split(' ')
  if (parts.length >= 6) {
    second.value = parts[0]
    minute.value = parts[1]
    hour.value = parts[2]
    dayOfMonth.value = parts[3]
    month.value = parts[4]
    dayOfWeek.value = parts[5]
    year.value = parts[6] || '*'
  }
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">Cron 表达式生成器</h2>
          <p class="text-gray-500 text-sm">可视化生成 Cron 表达式，支持 Quartz 和 Linux Crontab 格式</p>
        </div>

        <!-- Result Display -->
        <div class="bg-gray-800 rounded-lg p-6 mb-8 text-center relative group">
          <div class="text-xs text-gray-400 mb-2 uppercase tracking-wider">Cron Expression</div>
          <div class="text-3xl font-mono text-green-400 font-bold tracking-wide">{{ cronExpression }}</div>
          <button @click="copyCron" class="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs transition-colors">
            复制
          </button>
        </div>

        <!-- Presets -->
        <div class="mb-8">
          <h3 class="font-bold text-gray-800 mb-4 text-sm">常用示例</h3>
          <div class="flex flex-wrap gap-2">
            <button v-for="(preset, index) in presets" :key="index"
              @click="applyPreset(preset.value)"
              class="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-md text-xs transition-colors border border-gray-200 hover:border-blue-200">
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Builder -->
        <div class="border border-gray-200 rounded-lg overflow-hidden">
          <!-- Tabs -->
          <div class="flex border-b border-gray-200 bg-gray-50">
            <button v-for="tab in tabs" :key="tab"
              @click="activeTab = tab"
              class="flex-1 py-3 text-sm font-medium transition-colors relative"
              :class="activeTab === tab ? 'text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'">
              {{ tab }}
              <div v-if="activeTab === tab" class="absolute top-0 left-0 w-full h-0.5 bg-blue-600"></div>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 bg-white min-h-[300px]">
            <!-- Seconds -->
            <div v-if="activeTab === '秒'" class="space-y-4">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" v-model="second" value="*" class="text-blue-600 focus:ring-blue-500" />
                <span>每秒 允许的通配符[, - * /]</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" v-model="second" value="0" class="text-blue-600 focus:ring-blue-500" />
                <span>周期从 0 秒开始</span>
              </label>
              <!-- More complex options could be added here -->
            </div>

            <!-- Minutes -->
            <div v-if="activeTab === '分'" class="space-y-4">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" v-model="minute" value="*" class="text-blue-600 focus:ring-blue-500" />
                <span>每分 允许的通配符[, - * /]</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" v-model="minute" value="0" class="text-blue-600 focus:ring-blue-500" />
                <span>周期从 0 分开始</span>
              </label>
            </div>

            <!-- Hours -->
            <div v-if="activeTab === '时'" class="space-y-4">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" v-model="hour" value="*" class="text-blue-600 focus:ring-blue-500" />
                <span>每小时 允许的通配符[, - * /]</span>
              </label>
               <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" v-model="hour" value="0" class="text-blue-600 focus:ring-blue-500" />
                <span>周期从 0 时开始</span>
              </label>
            </div>
            
            <!-- Other tabs simplified for this demo -->
             <div v-if="['日', '月', '周', '年'].includes(activeTab)" class="text-center text-gray-500 py-10">
               <p>当前仅提供基础配置，更多高级配置开发中...</p>
               <div class="mt-4">
                 <input type="text" 
                  :value="activeTab === '日' ? dayOfMonth : activeTab === '月' ? month : activeTab === '周' ? dayOfWeek : year"
                  @input="(e: any) => setSimple(activeTab, e.target.value)"
                  class="border border-gray-300 rounded px-3 py-2 w-full max-w-xs text-center"
                  placeholder="手动输入值" />
               </div>
             </div>

          </div>
        </div>

      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>
