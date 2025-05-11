<!--
 * @file JsonTran.vue
 * @description JSON在线转换工具，支持格式化、压缩、转义等功能
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持JSON格式化和校验
 * 2. 支持JSON压缩和美化
 * 3. 支持字符串转义和去转义
 * 4. 实时语法高亮显示
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
          <p class="text-gray-500 text-sm mt-6">专业的JSON格式化工具，支持语法高亮、校验、压缩等功能</p>
        </div>

        <div class="space-y-6">
          <!-- 编辑器区域 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">JSON内容</h3>
            </div>
            <div class="border rounded-lg overflow-hidden bg-white">
              <codemirror v-model="info.code" placeholder="在此输入JSON内容..." :style="{ height: '400px' }" :autofocus="true"
                :indent-with-tab="true" :tabSize="2" :extensions="info.extensions" />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-wrap gap-3">
            <el-button type="primary" @click="formatJson" class="px-6 h-10">校验/格式化</el-button>
            <el-button type="primary" @click="compress" class="px-6 h-10">压缩</el-button>
            <el-button type="primary" @click="tran" class="px-6 h-10">转义</el-button>
            <el-button type="primary" @click="unTransferred" class="px-6 h-10">去转义</el-button>
            <el-button type="primary" @click="copyRes" class="px-6 h-10">复制</el-button>
            <el-button type="danger" plain @click="clear" class="px-6 h-10">清空</el-button>
          </div>

          <!-- 错误提示 -->
          <div v-show="info.isParseErr" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <div class="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">{{ info.parseErr }}</p>
              </div>
            </div>
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
              <h4 class="text-base font-medium text-gray-900 mb-3">什么是JSON格式？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                JSON（JavaScript Object Notation）是一种轻量级的数据交换格式。它基于JavaScript的一个子集，但与语言无关，因此在多种编程环境中广泛使用。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">为什么需要JSON格式化？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                格式化JSON可以使数据结构更清晰易读，便于开发人员查看和编辑。同时，格式化还可以帮助发现JSON中的语法错误。
              </p>
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
import { transferred, copy } from '@/utils/string'
import { Codemirror } from "vue-codemirror"
import { json } from '@codemirror/lang-json'
import '@codemirror/search'
import '@codemirror/state'
import '@codemirror/commands'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

const route = useRoute()

const info = reactive({
  title: "JSON在线转换",
  code: '',
  extensions: [json()],
  isParseErr: false,
  parseErr: ''
})

// 功能特点
const features = [
  {
    title: '实时语法高亮',
    desc: '支持JSON语法实时高亮显示，提高代码可读性'
  },
  {
    title: '多种操作',
    desc: '支持格式化、压缩、转义、去转义等功能'
  },
  {
    title: '语法校验',
    desc: '自动检测JSON语法错误，提供错误提示'
  }
]

// 适用场景
const usageScenarios = [
  'API调试：检查和格式化API响应数据',
  '数据处理：转换和清理JSON数据',
  '开发调试：验证JSON语法正确性',
  '文档编写：生成格式化的JSON示例'
]

//格式化json
const formatJson = () => {
  if (!info.code.trim()) {
    ElMessage({
      message: "请输入需要格式化的JSON内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  try {
    //初始化错误信息
    info.isParseErr = false
    info.parseErr = ''
    // 1、JSON.parse：把JSON字符串转换为JSON对象
    // 2、JSON.stringify：把JSON对象 转换为 有缩进的 JSON字符串格式
    info.code = JSON.stringify(JSON.parse(info.code), null, '\t')
    ElMessage({
      message: "格式化成功",
      type: "success",
      duration: 1500
    })
  } catch (error) {
    info.isParseErr = true
    info.parseErr = '无效的JSON格式，请检查语法'
  }
}

//压缩
const compress = () => {
  if (!info.code.trim()) {
    ElMessage({
      message: "请输入需要压缩的JSON内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  try {
    const parsed = JSON.parse(info.code)
    info.code = JSON.stringify(parsed)
    ElMessage({
      message: "压缩成功",
      type: "success",
      duration: 1500
    })
  } catch (error) {
    info.isParseErr = true
    info.parseErr = '无效的JSON格式，请检查语法'
  }
}

//转义
const tran = () => {
  if (!info.code.trim()) {
    ElMessage({
      message: "请输入需要转义的内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  info.code = transferred(info.code, "\"")
  ElMessage({
    message: "转义成功",
    type: "success",
    duration: 1500
  })
}

//去转义
const unTransferred = () => {
  if (!info.code.trim()) {
    ElMessage({
      message: "请输入需要去转义的内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  info.code = info.code.replace(/[\\]/g, ``)
  ElMessage({
    message: "去转义成功",
    type: "success",
    duration: 1500
  })
}

//清空输入框
const clear = () => {
  info.code = ''
  info.isParseErr = false
  info.parseErr = ''
  ElMessage({
    message: "已清空内容",
    type: "success",
    duration: 1500
  })
}

//copy
const copyRes = async () => {
  if (!info.code.trim()) {
    ElMessage({
      message: "没有可复制的内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  copy(info.code)
  ElMessage({
    message: "复制成功",
    type: "success",
    duration: 1500
  })
}
</script>

<style scoped>
.cm-editor {
  height: 100%;
}

.cm-editor.cm-focused {
  outline: none;
}

.el-input :deep(.el-input__inner) {
  border-color: #e5e7eb;
}

.el-input :deep(.el-input__inner:focus) {
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

.el-input {
  width: auto;
}

.el-input :deep(.el-input-group__append) {
  padding: 0;
}

.el-input :deep(.el-input-group__append .el-button) {
  border: none;
  margin: 0;
  height: 100%;
  padding: 0 1rem;
}
</style>
