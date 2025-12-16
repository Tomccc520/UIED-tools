<!--
 * @file UserAgent.vue
 * @description User Agent 解析工具，查看当前浏览器、操作系统、设备等信息
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const uaString = ref('')
const parsedInfo = ref<any>({})

const parseUA = (ua: string) => {
  // 简单的 UA 解析逻辑，实际项目中可以使用 ua-parser-js 库
  const result = {
    browser: { name: 'Unknown', version: '' },
    os: { name: 'Unknown', version: '' },
    device: { type: 'Desktop', vendor: '', model: '' },
    engine: { name: '', version: '' }
  }

  // Browser
  if (ua.match(/Chrome\/([\d.]+)/)) {
    result.browser.name = 'Chrome'
    result.browser.version = RegExp.$1
  } else if (ua.match(/Firefox\/([\d.]+)/)) {
    result.browser.name = 'Firefox'
    result.browser.version = RegExp.$1
  } else if (ua.match(/Safari\/([\d.]+)/) && !ua.match(/Chrome/)) {
    result.browser.name = 'Safari'
    result.browser.version = RegExp.$1
  } else if (ua.match(/Edge\/([\d.]+)/)) {
    result.browser.name = 'Edge'
    result.browser.version = RegExp.$1
  }

  // OS
  if (ua.match(/Mac OS X ([\d_]+)/)) {
    result.os.name = 'macOS'
    result.os.version = RegExp.$1.replace(/_/g, '.')
  } else if (ua.match(/Windows NT ([\d.]+)/)) {
    result.os.name = 'Windows'
    result.os.version = RegExp.$1
  } else if (ua.match(/Android ([\d.]+)/)) {
    result.os.name = 'Android'
    result.os.version = RegExp.$1
    result.device.type = 'Mobile'
  } else if (ua.match(/iPhone OS ([\d_]+)/)) {
    result.os.name = 'iOS'
    result.os.version = RegExp.$1.replace(/_/g, '.')
    result.device.type = 'Mobile'
    result.device.vendor = 'Apple'
    result.device.model = 'iPhone'
  } else if (ua.match(/Linux/)) {
    result.os.name = 'Linux'
  }

  return result
}

onMounted(() => {
  uaString.value = navigator.userAgent
  parsedInfo.value = parseUA(uaString.value)
})

const copyUA = () => {
  navigator.clipboard.writeText(uaString.value)
    .then(() => alert('已复制到剪贴板'))
    .catch(err => console.error('复制失败:', err))
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">User Agent 解析</h2>
          <p class="text-gray-500 text-sm">查看您的浏览器 User Agent 字符串及解析结果</p>
        </div>

        <!-- UA String Box -->
        <div class="mb-10">
          <label class="block text-sm font-medium text-gray-700 mb-2">User Agent String</label>
          <div class="relative">
            <textarea readonly
              class="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3" :value="uaString"></textarea>
            <button @click="copyUA"
              class="absolute top-2 right-2 px-3 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
              复制
            </button>
          </div>
        </div>

        <!-- Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Browser -->
          <div class="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-white rounded-lg shadow-sm mr-3 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 class="font-bold text-gray-800">浏览器 (Browser)</h3>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">名称</span>
                <span class="font-medium text-gray-900">{{ parsedInfo.browser?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">版本</span>
                <span class="font-medium text-gray-900">{{ parsedInfo.browser?.version }}</span>
              </div>
            </div>
          </div>

          <!-- OS -->
          <div class="bg-green-50 p-6 rounded-xl border border-green-100">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-white rounded-lg shadow-sm mr-3 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="font-bold text-gray-800">操作系统 (OS)</h3>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">系统</span>
                <span class="font-medium text-gray-900">{{ parsedInfo.os?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">版本</span>
                <span class="font-medium text-gray-900">{{ parsedInfo.os?.version }}</span>
              </div>
            </div>
          </div>

          <!-- Device -->
          <div class="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <div class="flex items-center mb-4">
              <div class="p-2 bg-white rounded-lg shadow-sm mr-3 text-purple-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="font-bold text-gray-800">设备 (Device)</h3>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">类型</span>
                <span class="font-medium text-gray-900">{{ parsedInfo.device?.type }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-sm">厂商</span>
                <span class="font-medium text-gray-900">{{ parsedInfo.device?.vendor || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>
