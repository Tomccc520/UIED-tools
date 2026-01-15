<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">变量命名转换</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">支持 Camel, Pascal, Snake, Kebab 等多种命名风格互转。</p>
        </div>

        <div class="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 输入区 -->
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <label class="text-gray-700 font-bold">输入文本</label>
              <button @click="input = ''" class="text-xs text-gray-500 hover:text-red-500">清空</button>
            </div>
            <textarea v-model="input"
              class="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="输入变量名，如: helloWorld 或 hello_world"></textarea>
          </div>

          <!-- 输出区 -->
          <div class="flex flex-col gap-4">
            <label class="text-gray-700 font-bold">转换结果</label>
            <div class="space-y-3 h-64 overflow-y-auto pr-2">

              <div v-for="(result, type) in results" :key="type"
                class="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors group">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs text-gray-500 uppercase font-semibold">{{ typeLabels[type] }}</span>
                  <button @click="copy(result || '')"
                    class="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    复制
                  </button>
                </div>
                <div class="font-mono text-sm break-all text-gray-800 select-all">{{ result || '...' }}</div>
              </div>

            </div>
          </div>
        </div>

        <!-- 说明 -->
        <div class="mt-8 bg-gray-50 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 class="font-bold text-gray-800 mb-2">支持的格式</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>Camel Case: <code class="bg-white px-1 rounded">helloWorld</code></div>
            <div>Pascal Case: <code class="bg-white px-1 rounded">HelloWorld</code></div>
            <div>Snake Case: <code class="bg-white px-1 rounded">hello_world</code></div>
            <div>Kebab Case: <code class="bg-white px-1 rounded">hello-world</code></div>
            <div>Constant: <code class="bg-white px-1 rounded">HELLO_WORLD</code></div>
            <div>Path: <code class="bg-white px-1 rounded">hello/world</code></div>
          </div>
        </div>

      </div>
      <ToolsRecommend :currentPath="route.path" />
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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElNotification } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const input = ref('')

const typeLabels: Record<string, string> = {
  camel: 'Camel Case (小驼峰)',
  pascal: 'Pascal Case (大驼峰)',
  snake: 'Snake Case (下划线)',
  kebab: 'Kebab Case (中划线)',
  constant: 'Constant Case (常量)',
  path: 'Path Case (路径)',
  sentence: 'Sentence Case (句子)',
  dot: 'Dot Case (点连接)'
}

const splitWords = (str: string): string[] => {
  if (!str) return []
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
    .replace(/[_-]/g, ' ') // split snake_case and kebab-case
    .replace(/\//g, ' ') // split path
    .replace(/\./g, ' ') // split dot
    .trim()
    .split(/\s+/)
}

const results = computed(() => {
  if (!input.value.trim()) return {}

  // 只处理第一行或者合并处理？这里按行处理还是整体？
  // 假设用户输入单个变量名。如果有多行，取第一行非空
  const text = input.value.split('\n').filter(l => l.trim())[0] || ''
  const words = splitWords(text)
  const lowerWords = words.map(w => w.toLowerCase())

  return {
    camel: lowerWords.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(''),
    pascal: lowerWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
    snake: lowerWords.join('_'),
    kebab: lowerWords.join('-'),
    constant: lowerWords.join('_').toUpperCase(),
    path: lowerWords.join('/'),
    sentence: lowerWords.map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(' '),
    dot: lowerWords.join('.')
  }
})

const copy = (text: string) => {
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    ElNotification({
      title: '复制成功',
      message: text,
      type: 'success',
      duration: 2000
    })
  })
}
</script>
