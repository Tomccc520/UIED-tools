<!--
 * @file UrlEncode.vue
 * @description URL编码解码工具，支持批量处理和双向转换
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2025-01-14
 *
 * 功能特性：
 * 1. 支持URL编码和解码双向转换
 * 2. 支持批量处理多行URL
 * 3. 实时转换和结果预览
 * 4. 一键复制转换结果
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">快速便捷的URL编码解码工具，支持批量处理</p>
        </div>

        <!-- 输入区域 -->
        <div class="space-y-6">
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">输入内容</h3>
              <span class="text-sm text-gray-500">支持批量处理，每行一个URL</span>
            </div>
            <el-input type="textarea" :rows="8" v-model="info.content" class="font-mono bg-white" />
          </div>

          <div class="flex flex-wrap gap-4">
            <el-button type="primary" @click="toEncode" class="px-6 h-10">URL编码</el-button>
            <el-button type="primary" @click="toDecode" class="px-6 h-10">URL解码</el-button>
            <el-button type="primary" plain @click="copyRes" class="px-6 h-10">复制结果</el-button>
            <el-button type="danger" plain @click="clear" class="px-6 h-10">清空内容</el-button>
          </div>

          <!-- 结果显示 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">转换结果</h3>
            </div>
            <el-input type="textarea" :rows="8" v-model="info.tranRes" class="font-mono bg-white" />
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="mt-12 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(feature, index) in features" :key="index" class="border border-gray-100 rounded-lg p-6">
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
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">适用场景</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(text, index) in usageScenarios" :key="index" class="flex items-start space-x-3">
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
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">什么是URL编码？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">URL编码是将URL中的非ASCII字符转换为可以安全传输的格式，避免特殊字符造成的问题。</p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">什么时候需要URL编码？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">当URL中包含中文、特殊字符或空格等非ASCII字符时，需要进行URL编码以确保URL能够正确传输和解析。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { copy } from '@/utils/string'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

const route = useRoute()

const info = reactive({
  title: "URL编码/解码",
  content: '',
  tranRes: '',
})

// 功能特点
const features = [
  {
    title: '双向转换',
    desc: '支持URL编码和解码双向转换'
  },
  {
    title: '批量处理',
    desc: '支持多行URL同时处理，提高效率'
  },
  {
    title: '即时转换',
    desc: '快速准确的编码解码，实时查看结果'
  }
]

// 适用场景
const usageScenarios = [
  'Web开发：处理URL中的特殊字符',
  'API调用：确保参数正确传输',
  '数据处理：处理含特殊字符的数据',
  '网页抓取：处理各类URL地址'
]

//编码
const toEncode = () => {
  if (!info.content) {
    ElMessage({
      message: "请输入需要编码的内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  info.tranRes = ''
  info.tranRes = encodeURIComponent(info.content)
}

//解码
const toDecode = () => {
  if (!info.content) {
    ElMessage({
      message: "请输入需要解码的内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  info.tranRes = ''
  info.tranRes = decodeURIComponent(info.content)
}

//clear
const clear = () => {
  info.content = ''
  info.tranRes = ''
}

//copy
const copyRes = async () => {
  if (!info.tranRes) {
    ElMessage({
      message: "没有可复制的内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  copy(info.tranRes)
}
</script>

<style scoped>
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
