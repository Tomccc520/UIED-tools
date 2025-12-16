<!--
 * @file WebUISpec.vue
 * @description Web端设计规范指南，提供Web界面设计的尺寸、布局和组件规范
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 * @license MIT
-->

<script setup lang="ts">
import { ref } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeTab = ref('layout')

const specs = {
  layout: {
    title: '布局 (Layout)',
    items: [
      { label: '桌面端宽度 (Desktop)', value: '1440px / 1920px' },
      { label: '内容区域 (Content)', value: '1200px / 1152px' },
      { label: '栅格系统 (Grid)', value: '12列 / 24列' },
      { label: '槽宽 (Gutter)', value: '24px / 16px' },
    ]
  },
  typography: {
    title: '字体 (Typography)',
    items: [
      { label: '主标题 (H1)', value: '32px - 48px' },
      { label: '副标题 (H2)', value: '24px - 36px' },
      { label: '小标题 (H3)', value: '20px - 24px' },
      { label: '正文 (Body)', value: '14px - 16px' },
      { label: '行高 (Line Height)', value: '1.5 - 1.8' },
    ]
  },
  components: {
    title: '组件 (Components)',
    items: [
      { label: '按钮高度 (Button Height)', value: '32px / 40px / 48px' },
      { label: '输入框高度 (Input Height)', value: '32px / 40px' },
      { label: '圆角 (Border Radius)', value: '4px / 8px' },
      { label: '图标尺寸 (Icon Size)', value: '16px / 24px / 32px' },
    ]
  }
}

const spacings = [4, 8, 12, 16, 24, 32, 48, 64, 80, 96]
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">Web端设计规范</h2>
          <p class="text-gray-500 text-sm">Web 界面设计的标准尺寸和规范参考，助你打造专业的桌面端应用</p>
        </div>

        <div class="max-w-4xl mx-auto">
          <!-- Tabs -->
          <div class="flex justify-center mb-8 border-b border-gray-200">
            <button v-for="(spec, key) in specs" :key="key"
              class="px-6 py-3 text-sm font-medium transition-colors relative"
              :class="activeTab === key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
              @click="activeTab = key">
              {{ spec.title }}
              <div v-if="activeTab === key" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
            </button>
          </div>

          <!-- Content -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div v-for="(item, index) in specs[activeTab as keyof typeof specs].items" :key="index"
              class="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
              <div class="text-gray-500 text-sm mb-2">{{ item.label }}</div>
              <div class="text-gray-800 text-xl font-bold">{{ item.value }}</div>
            </div>
          </div>

          <!-- Spacing Scale (Only show on Layout tab) -->
          <div v-if="activeTab === 'layout'" class="mb-12">
            <h3 class="font-bold text-gray-800 mb-6">间距系统 (Spacing Scale)</h3>
            <div class="flex flex-wrap items-end gap-4">
              <div v-for="space in spacings" :key="space" class="flex flex-col items-center gap-2">
                <div class="bg-blue-100 border border-blue-200 rounded"
                  :style="{ width: '32px', height: `${space}px` }"></div>
                <span class="text-xs text-gray-500 font-mono">{{ space }}px</span>
              </div>
            </div>
          </div>

          <!-- Visual Guide (Simple representation) -->
          <div class="p-8 bg-gray-100 rounded-xl border border-gray-200 text-center relative overflow-hidden">
            <div class="text-gray-400 text-sm mb-4">响应式断点示意 (Breakpoints)</div>

            <div class="relative h-64 w-full flex items-center justify-center">
              <!-- Desktop -->
              <div class="absolute inset-0 border-x-2 border-gray-300 flex items-start justify-center pt-2">
                <span class="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">Desktop (> 1280px)</span>
              </div>

              <!-- Laptop -->
              <div
                class="absolute inset-y-0 w-[1024px] border-x-2 border-blue-300 bg-blue-50/30 flex items-start justify-center pt-10">
                <span class="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">Laptop (1024px)</span>
              </div>

              <!-- Tablet -->
              <div
                class="absolute inset-y-0 w-[768px] border-x-2 border-green-300 bg-green-50/30 flex items-start justify-center pt-20">
                <span class="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">Tablet (768px)</span>
              </div>

              <!-- Mobile -->
              <div
                class="absolute inset-y-0 w-[375px] border-x-2 border-orange-300 bg-orange-50/30 flex items-start justify-center pt-32">
                <span class="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs">Mobile (375px)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>
