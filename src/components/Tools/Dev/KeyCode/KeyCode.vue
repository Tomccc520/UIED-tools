<!--
 * @file KeyCode.vue
 * @description 键盘键值码查看工具，实时显示键盘按键的 keyCode、key、code 等信息
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

interface KeyInfo {
  key: string
  keyCode: number
  code: string
  location: number
  shiftKey: boolean
  ctrlKey: boolean
  altKey: boolean
  metaKey: boolean
}

const currentKey = ref<KeyInfo | null>(null)
const history = ref<KeyInfo[]>([])
const isListening = ref(true)

const handleKeyDown = (e: KeyboardEvent) => {
  if (!isListening.value) return

  // 阻止默认行为，防止按功能键时触发浏览器快捷键
  e.preventDefault()

  const info: KeyInfo = {
    key: e.key,
    keyCode: e.keyCode,
    code: e.code,
    location: e.location,
    shiftKey: e.shiftKey,
    ctrlKey: e.ctrlKey,
    altKey: e.altKey,
    metaKey: e.metaKey
  }

  currentKey.value = info
  
  // 添加到历史记录，最新的在前面
  history.value.unshift(info)
  if (history.value.length > 10) {
    history.value.pop()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

const toggleListening = () => {
  isListening.value = !isListening.value
}

const clearHistory = () => {
  history.value = []
  currentKey.value = null
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">键盘键值码查看器</h2>
          <p class="text-gray-500 text-sm">按下键盘上的任意键，查看其 KeyCode、Code 和其他详细信息</p>
        </div>

        <!-- Main Display -->
        <div class="flex flex-col items-center justify-center mb-12">
          <div v-if="currentKey" class="relative group">
            <div class="text-[120px] font-bold text-blue-600 leading-none mb-4 transition-all transform group-hover:scale-105">
              {{ currentKey.keyCode }}
            </div>
            <div class="text-2xl text-gray-600 font-medium text-center bg-gray-100 px-6 py-2 rounded-full">
              {{ currentKey.key === ' ' ? 'Space' : currentKey.key }}
            </div>
          </div>
          <div v-else class="text-center py-20 text-gray-400 bg-gray-50 rounded-xl w-full border-2 border-dashed border-gray-200">
            <div class="text-6xl mb-4">⌨️</div>
            <p class="text-xl">请按下键盘上的任意键</p>
          </div>
        </div>

        <!-- Details Grid -->
        <div v-if="currentKey" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div class="text-gray-500 text-sm mb-2">event.key</div>
            <div class="text-gray-800 text-xl font-mono font-bold">{{ currentKey.key }}</div>
            <div class="text-xs text-gray-400 mt-2">按键的可打印值</div>
          </div>
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div class="text-gray-500 text-sm mb-2">event.code</div>
            <div class="text-gray-800 text-xl font-mono font-bold">{{ currentKey.code }}</div>
            <div class="text-xs text-gray-400 mt-2">物理按键代码</div>
          </div>
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div class="text-gray-500 text-sm mb-2">event.which</div>
            <div class="text-gray-800 text-xl font-mono font-bold">{{ currentKey.keyCode }}</div>
            <div class="text-xs text-gray-400 mt-2">已被废弃，但常用</div>
          </div>
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div class="text-gray-500 text-sm mb-2">Location</div>
            <div class="text-gray-800 text-xl font-mono font-bold">{{ currentKey.location }}</div>
            <div class="text-xs text-gray-400 mt-2">按键位置 (0:标准, 1:左, 2:右)</div>
          </div>
        </div>

        <!-- Modifiers -->
        <div v-if="currentKey" class="flex flex-wrap gap-4 justify-center mb-12">
          <div class="px-4 py-2 rounded-lg border transition-colors"
            :class="currentKey.metaKey ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'">
            Meta / Command
          </div>
          <div class="px-4 py-2 rounded-lg border transition-colors"
            :class="currentKey.ctrlKey ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'">
            Control
          </div>
          <div class="px-4 py-2 rounded-lg border transition-colors"
            :class="currentKey.altKey ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'">
            Alt / Option
          </div>
          <div class="px-4 py-2 rounded-lg border transition-colors"
            :class="currentKey.shiftKey ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'">
            Shift
          </div>
        </div>

        <!-- History -->
        <div v-if="history.length > 0" class="border-t border-gray-200 pt-8">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-gray-800">历史记录</h3>
            <button @click="clearHistory" class="text-sm text-red-500 hover:text-red-600">清空历史</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-gray-500">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-2">Key</th>
                  <th scope="col" class="px-4 py-2">Code</th>
                  <th scope="col" class="px-4 py-2">KeyCode</th>
                  <th scope="col" class="px-4 py-2">Modifiers</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in history" :key="index" class="bg-white border-b hover:bg-gray-50">
                  <td class="px-4 py-2 font-medium text-gray-900">{{ item.key === ' ' ? 'Space' : item.key }}</td>
                  <td class="px-4 py-2 font-mono">{{ item.code }}</td>
                  <td class="px-4 py-2 font-mono">{{ item.keyCode }}</td>
                  <td class="px-4 py-2">
                    <span v-if="item.metaKey">⌘ </span>
                    <span v-if="item.ctrlKey">⌃ </span>
                    <span v-if="item.altKey">⌥ </span>
                    <span v-if="item.shiftKey">⇧ </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Controls -->
        <div class="fixed bottom-8 right-8 flex gap-4">
          <button @click="toggleListening" 
            class="p-4 rounded-full shadow-lg transition-colors text-white"
            :class="isListening ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'"
            :title="isListening ? '暂停监听' : '开始监听'">
            <svg v-if="isListening" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>
