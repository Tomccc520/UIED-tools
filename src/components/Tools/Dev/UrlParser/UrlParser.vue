<!--
 * @file UrlParser.vue
 * @description URL 解析工具，将 URL 解析为协议、主机、路径、查询参数等部分
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref, watch } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const inputUrl = ref('https://www.example.com:8080/path/to/resource?search=query&id=123#section')
const parsedUrl = ref<any>(null)
const error = ref('')

const parseUrl = () => {
  try {
    if (!inputUrl.value) {
      parsedUrl.value = null
      error.value = ''
      return
    }

    let urlStr = inputUrl.value
    // Add protocol if missing to allow parsing
    if (!urlStr.match(/^[a-zA-Z]+:\/\//)) {
      urlStr = 'http://' + urlStr
    }

    const url = new URL(urlStr)
    const params: Record<string, string> = {}
    url.searchParams.forEach((value, key) => {
      params[key] = value
    })

    parsedUrl.value = {
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      origin: url.origin,
      params: params
    }
    error.value = ''
  } catch (e) {
    parsedUrl.value = null
    error.value = '无效的 URL 格式'
  }
}

watch(inputUrl, parseUrl)

// Initial parse
parseUrl()

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => alert('已复制到剪贴板'))
    .catch(err => console.error('复制失败:', err))
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">URL 解析器</h2>
          <p class="text-gray-500 text-sm">将 URL 解析为协议、主机、路径、查询参数等组成部分</p>
        </div>

        <!-- Input -->
        <div class="mb-8">
          <label class="block text-sm font-medium text-gray-700 mb-2">输入 URL</label>
          <div class="relative">
            <input type="text" v-model="inputUrl"
              class="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入要解析的 URL，例如 https://www.example.com/path?query=1" />
            <div v-if="error" class="absolute right-0 top-full mt-1 text-xs text-red-500">{{ error }}</div>
          </div>
        </div>

        <!-- Result -->
        <div v-if="parsedUrl" class="space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 relative group">
              <div class="text-xs text-gray-400 mb-1">Protocol (协议)</div>
              <div class="font-mono text-gray-800 break-all">{{ parsedUrl.protocol }}</div>
              <button @click="copyText(parsedUrl.protocol)" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-blue-500">复制</button>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 relative group">
              <div class="text-xs text-gray-400 mb-1">Host (主机)</div>
              <div class="font-mono text-gray-800 break-all">{{ parsedUrl.host }}</div>
              <button @click="copyText(parsedUrl.host)" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-blue-500">复制</button>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 relative group">
              <div class="text-xs text-gray-400 mb-1">Port (端口)</div>
              <div class="font-mono text-gray-800 break-all">{{ parsedUrl.port || '(default)' }}</div>
              <button v-if="parsedUrl.port" @click="copyText(parsedUrl.port)" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-blue-500">复制</button>
            </div>
             <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 relative group">
              <div class="text-xs text-gray-400 mb-1">Path (路径)</div>
              <div class="font-mono text-gray-800 break-all">{{ parsedUrl.pathname }}</div>
              <button @click="copyText(parsedUrl.pathname)" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-blue-500">复制</button>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 relative group">
              <div class="text-xs text-gray-400 mb-1">Hash (锚点)</div>
              <div class="font-mono text-gray-800 break-all">{{ parsedUrl.hash || '-' }}</div>
              <button v-if="parsedUrl.hash" @click="copyText(parsedUrl.hash)" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-blue-500">复制</button>
            </div>
             <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 relative group">
              <div class="text-xs text-gray-400 mb-1">Origin (源)</div>
              <div class="font-mono text-gray-800 break-all">{{ parsedUrl.origin }}</div>
              <button @click="copyText(parsedUrl.origin)" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-blue-500">复制</button>
            </div>
          </div>

          <!-- Params -->
          <div v-if="Object.keys(parsedUrl.params).length > 0" class="border rounded-lg overflow-hidden">
            <div class="bg-gray-50 px-4 py-2 border-b text-sm font-medium text-gray-700">查询参数 (Query Params)</div>
            <table class="w-full text-sm text-left">
              <thead class="text-xs text-gray-500 uppercase bg-gray-50/50">
                <tr>
                  <th class="px-4 py-2 w-1/3">Key</th>
                  <th class="px-4 py-2">Value</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(value, key) in parsedUrl.params" :key="key" class="hover:bg-gray-50">
                  <td class="px-4 py-2 font-medium text-gray-900 break-all">{{ key }}</td>
                  <td class="px-4 py-2 text-gray-600 break-all">{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>
