<!--
 * @file Morse.vue
 * @description 摩尔斯电码转换工具
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
          <p class="text-gray-500 text-sm mt-4">支持中英文与摩尔斯电码的双向转换</p>
        </div>

        <!-- 转换区域 -->
        <div class="px-8 pb-8">
          <div class="bg-gray-50 rounded-lg p-6">
            <!-- 输入区域 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
              <el-input v-model="info.input" type="textarea" :rows="4" placeholder="请输入要转换的文本" class="w-full" />
            </div>

            <!-- 按钮区域 -->
            <div class="flex justify-center space-x-4 mb-6">
              <el-button @click="toMorse" class="px-6 h-10">转换为摩尔斯电码</el-button>
              <el-button @click="toText" class="px-6 h-10">转换为文本</el-button>
              <el-button @click="clear" class="px-6 h-10">清空</el-button>
            </div>

            <!-- 输出区域 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">转换结果</label>
              <el-input v-model="info.output" type="textarea" :rows="4" readonly placeholder="转换结果将显示在这里"
                class="w-full" />
            </div>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="px-8 pb-12">
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
        </div>

        <!-- 适用场景说明 -->
        <div class="px-8 pb-12">
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

        <!-- 常见问题解答 -->
        <div class="px-8 pb-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题解答</h3>
          <div class="space-y-6">
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h4 class="text-base font-medium text-gray-800 mb-3">什么是摩尔斯电码？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                摩尔斯电码是一种通过点和划的组合来表示字母和数字的编码方式，广泛应用于早期的电报通信中。
              </p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h4 class="text-base font-medium text-gray-800 mb-3">支持哪些字符的转换？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持英文字母、数字、常用标点符号的转换，同时也支持中文字符的转换。
              </p>
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
import { useRoute } from 'vue-router'
import { toMorse as convertToMorse, toText as convertToText } from '@/utils/morse'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = reactive({
  title: '摩尔斯电码转换',
  input: '',
  output: ''
})

//功能特点
const features = [
  {
    title: '双向转换',
    desc: '支持文本到摩尔斯电码的转换，也支持摩尔斯电码到文本的转换'
  },
  {
    title: '多字符支持',
    desc: '支持英文字母、数字、标点符号和中文字符的转换'
  },
  {
    title: '便捷操作',
    desc: '简单直观的界面，一键完成转换，支持批量处理'
  }
]

//适用场景
const usageScenarios = [
  '通信学习：了解早期电报通信的编码方式',
  '密码游戏：制作有趣的密码信息',
  '教育教学：电子通信原理的教学演示',
  '兴趣爱好：摩尔斯电码爱好者的日常使用'
]

const toMorse = () => {
  info.output = convertToMorse(info.input)
}

const toText = () => {
  info.output = convertToText(info.input)
}

const clear = () => {
  info.input = ''
  info.output = ''
}
</script>

<style scoped>
.el-input {
  width: auto;
}

.el-input :deep(.el-input__inner) {
  border-color: #e5e7eb;
}

.el-input :deep(.el-input__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.el-textarea :deep(.el-textarea__inner) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 1rem;
  border-color: #e5e7eb;
}

.el-textarea :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.el-button {
  font-weight: 500;
  transition: all 0.2s;
}

.el-button:hover:not(:disabled) {
  transform: translateY(-1px);
}
</style>
