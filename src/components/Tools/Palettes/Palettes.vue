<!--
 * @file Palettes.vue
 * @description 色板工具，提供优质配色方案
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center py-8 px-4 relative">
          <h2 class="text-3xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-4">精选配色方案，让你的设计更出彩</p>
        </div>

        <!-- 主要内容区域 -->
        <div class="px-8 pb-8">
          <!-- 色板展示区域 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="grid grid-cols-1 gap-6">
              <div v-for="(palette, index) in info.palettes" :key="index"
                class="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                <!-- 色板标题 -->
                <h3 class="text-base font-medium text-gray-900 mb-4">{{ palette.theme }}</h3>

                <!-- 色板展示 -->
                <div class="flex h-28 rounded-lg overflow-hidden">
                  <div v-for="(color, colorIndex) in palette.item" :key="colorIndex"
                    class="relative flex-1 group cursor-pointer transition-all duration-300 hover:flex-[1.2]"
                    :style="{ backgroundColor: color }" @click="copyColor(color)">
                    <!-- 颜色代码显示 -->
                    <div
                      class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                      <span class="text-white font-mono text-sm px-3 py-1.5 bg-black/40 rounded-lg backdrop-blur-sm">
                        {{ color }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="px-8 pb-12">
          <!-- 功能点 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(feature, index) in features" :key="index"
              class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">{{ feature.desc }}</p>
            </div>
          </div>

          <!-- 适用场景说明 -->
          <div class="mt-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">适用场景</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(text, index) in usageScenarios" :key="index"
                class="flex items-start space-x-3 bg-white rounded-lg p-4 shadow-sm">
                <div class="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p class="text-sm text-gray-600">{{ text }}</p>
              </div>
            </div>
          </div>

          <!-- 使用说明 -->
          <div class="mt-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">使用说明</h3>
            <div class="space-y-6">
              <div class="bg-white rounded-lg p-6 shadow-sm">
                <h4 class="text-base font-medium text-gray-800 mb-3">如何使用？</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>1. 浏览不同主题的配色方案</p>
                  <p>2. 将鼠标悬停在颜色块上查看颜色代码</p>
                  <p>3. 点击颜色块即可复制颜色代码</p>
                  <p>4. 将复制的颜色代码应用到你的设计中</p>
                </div>
              </div>
              <div class="bg-white rounded-lg p-6 shadow-sm">
                <h4 class="text-base font-medium text-gray-800 mb-3">注意事项</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>- 颜色代码支持直接复制使用</p>
                  <p>- 建议根据实际场景选择合适的配色</p>
                  <p>- 可以调整颜色的使用比例来达到不同效果</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <div class="mt-8">
        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from '@vue/runtime-core'
import { useRoute } from "vue-router"
import { copy } from '@/utils/string'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = reactive({
  title: "配色方案",
  palettes: [
    {
      theme: 'Last Summer Day',
      item: ['#A7C5C5', '#DEE0D5', '#E2AC48', '#B96028', '#983C2D'],
    },
    {
      theme: 'Hazy Summer Afternoon',
      item: ['#26C4A5', '#54D99F', '#ACE08C', '#E8E284', '#F2B652'],
    },
    {
      theme: 'Summering',
      item: ['#FFBE4C', '#B33127', '#93EDFF', '#648FAD', '#FFFFFF'],
    },
    {
      theme: 'Bare August',
      item: ['#F2636F', '#F2858E', '#F2AEB4', '#F27999', '#F2D9D0'],
    },
    {
      theme: 'Big Vilnius Summer',
      item: ['#D90416', '#BF2A45', '#528C49', '#BF7B54', '#F28D8D'],
    },
    {
      theme: 'Illustration Design',
      item: ['#D9D2D6', '#010326', '#4C5D73', '#808C65', '#F2E750'],
    },
    {
      theme: 'Beautiful Tropical',
      item: ['#04B2D9', '#CEECF2', '#04C4D9', '#15BFBF', '#D9D0C7'],
    },
  ]
})

// 功能特点
const features = [
  {
    title: '精选配色',
    desc: '精心挑选的主题配色方案，适合各种设计场景'
  },
  {
    title: '便捷复制',
    desc: '一键复制颜色代码，轻松应用到设计中'
  },
  {
    title: '主题分类',
    desc: '按主题分类的配色方案，帮助快速找到合适的配色'
  }
]

// 适用场景
const usageScenarios = [
  'UI设计：网页、App等界面设计配色',
  '平面设计：海报、宣传材料等设计',
  '品牌设计：品牌视觉识别系统配色',
  '插画设计：数字插画、艺术创作等'
]

// 复制颜色代码
const copyColor = async (color: string) => {
  await copy(color)
  ElMessage.success(`颜色代码 ${color} 已复制到剪贴板`)
}
</script>

<style scoped>
.el-button--primary {
  --el-button-bg-color: #3b82f6;
  --el-button-border-color: #3b82f6;
  --el-button-hover-bg-color: #60a5fa;
  --el-button-hover-border-color: #60a5fa;
  --el-button-active-bg-color: #2563eb;
  --el-button-active-border-color: #2563eb;
}
</style>
