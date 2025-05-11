<!--
 * @file Random.vue
 * @description 随机数生成工具，支持自定义范围的随机数生成
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
          <p class="text-gray-500 text-sm mt-4">支持自定义范围的随机数生成，适用于抽奖、点名等多种场景</p>
        </div>

        <!-- 输入区域 -->
        <div class="px-8 pb-8">
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex flex-col items-center space-y-8">
              <div class="flex items-center space-x-8">
                <div class="flex items-center space-x-3">
                  <span class="text-sm font-medium text-gray-700">最小值</span>
                  <el-input-number v-model="info.startNum" :min="0" size="large" class="w-[120px]" />
                </div>
                <div class="flex items-center space-x-3">
                  <span class="text-sm font-medium text-gray-700">最大值</span>
                  <el-input-number v-model="info.endNum" :min="0" size="large" class="w-[120px]" />
                </div>
              </div>

              <!-- 结果展示 -->
              <div class="w-full py-16 flex justify-center items-center bg-white rounded-lg shadow-sm">
                <span class="text-8xl font-bold text-gray-900 transition-all duration-300">{{ info.resNum }}</span>
              </div>

              <!-- 操作按钮 -->
              <div>
                <el-button @click="random" type="primary" size="large" :disabled="info.genStatus"
                  class="w-[120px] !h-[44px] font-medium transition-all duration-300 hover:shadow-md">
                  {{ info.genStatus ? '生成中...' : '开始生成' }}
                </el-button>
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
                  <p>1. 设置随机数的范围（最小值和最大值）</p>
                  <p>2. 点击"开始生成"按钮</p>
                  <p>3. 等待动画效果结束，获得最终的随机数</p>
                </div>
              </div>
              <div class="bg-white rounded-lg p-6 shadow-sm">
                <h4 class="text-base font-medium text-gray-800 mb-3">注意事项</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>- 最小值必须小于或等于最大值</p>
                  <p>- 生成过程中会有动画效果，请等待动画结束</p>
                  <p>- 每次生成的结果都是随机的，不会受到上一次结果的影响</p>
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
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = reactive({
  title: "随机数生成器",
  startNum: 1,
  endNum: 100,
  resNum: 0,
  genStatus: false,
})

// 功能特点
const features = [
  {
    title: '范围可控',
    desc: '支持自定义最小值和最大值，灵活设置随机范围'
  },
  {
    title: '动态效果',
    desc: '生成过程带有动画效果，提供更好的视觉体验'
  },
  {
    title: '即时生成',
    desc: '点击即可生成，操作简单直观'
  }
]

// 适用场景
const usageScenarios = [
  '抽奖活动：随机抽取幸运号码',
  '课堂点名：随机选择学生回答问题',
  '游戏环节：生成随机数值',
  '测试数据：生成随机测试用例'
]

const random = () => {
  info.genStatus = true
  let count = 0
  const genInterval = setInterval(() => {
    info.resNum = Math.floor(Math.random() * (info.endNum - info.startNum + 1)) + info.startNum
    count++
    if (count > 10) {
      clearTimeout(genInterval)
      info.genStatus = false
    }
  }, 50)
}
</script>

<style scoped>
.el-input-number {
  width: auto;
}

.el-input-number :deep(.el-input__inner) {
  border-color: #e5e7eb;
}

.el-input-number :deep(.el-input__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.el-button {
  --el-button-bg-color: #3b82f6;
  --el-button-border-color: #3b82f6;
  --el-button-hover-bg-color: #60a5fa;
  --el-button-hover-border-color: #60a5fa;
  --el-button-active-bg-color: #2563eb;
  --el-button-active-border-color: #2563eb;
  font-weight: 500;
  transition: all 0.2s;
}

.el-button:hover:not(:disabled) {
  transform: translateY(-1px);
}
</style>
