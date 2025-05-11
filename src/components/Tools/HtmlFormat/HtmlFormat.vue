<!--
 * @file HtmlFormat.vue
 * @description HTML格式化工具，支持HTML代码的格式化和压缩
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持HTML代码格式化
 * 2. 支持代码高亮显示
 * 3. 支持一键复制结果
 * 4. 实时语法错误提示
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
          <p class="text-gray-500 text-sm mt-6">专业的HTML格式化工具，支持代码美化和压缩</p>
        </div>

        <!-- 代码编辑区域 -->
        <div class="space-y-6">
          <!-- 代码编辑器 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">HTML代码</h3>
            </div>
            <div class="border rounded-lg overflow-hidden bg-white">
              <codemirror v-model="info.code" placeholder="请输入需要格式化的HTML代码..." :style="{ height: '400px' }"
                :autofocus="true" :indent-with-tab="true" :tabSize="2" />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-wrap gap-3">
            <el-button type="primary" @click="formatCode" class="px-6 h-10">格式化代码</el-button>
            <el-button type="primary" @click="minifyCode" class="px-6 h-10">压缩代码</el-button>
            <el-button type="primary" @click="copyResult" class="px-6 h-10">复制结果</el-button>
            <el-button @click="clear" class="px-6 h-10">清空输入</el-button>
          </div>

          <!-- 错误提示 -->
          <div v-if="info.isParseErr" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <div class="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg class="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">语法错误</h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ info.parseErr }}
                </div>
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

        <!-- 使用说明 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">使用说明</h3>
          <div class="space-y-6">
            <div class="border-b border-gray-100 pb-6">
              <h4 class="text-base font-medium text-gray-800 mb-3">格式化功能</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                代码格式化功能会自动调整HTML代码的缩进、换行和空格，使代码结构更加清晰易读。支持处理各种HTML标签、属性和注释。
              </p>
            </div>
            <div class="pb-6">
              <h4 class="text-base font-medium text-gray-800 mb-3">代码压缩</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                代码压缩功能会移除HTML代码中的多余空格、换行和注释，生成体积更小的代码，适合用于生产环境。
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
import { useRoute } from 'vue-router'
import { copy } from '@/utils/string'
import { Codemirror } from "vue-codemirror"
import '@codemirror/search'
import '@codemirror/state'
import '@codemirror/commands'
import * as prettier from "prettier/standalone"
import * as parserHtml from 'prettier/plugins/html'
import { ElMessage } from 'element-plus'

const route = useRoute()

const info = reactive({
  title: "HTML格式化工具",
  code: '',
  isParseErr: false,
  parseErr: '',
})

// 功能特点
const features = [
  {
    title: '智能格式化',
    desc: '自动调整代码缩进和换行'
  },
  {
    title: '代码高亮',
    desc: '支持语法高亮显示'
  },
  {
    title: '错误提示',
    desc: '实时显示代码语法错误'
  }
]

// 适用场景
const usageScenarios = [
  'Web开发：格式化HTML代码',
  '代码审查：提高代码可读性',
  '调试优化：快速定位代码问题',
  '文档编写：美化HTML示例'
]

// 格式化代码
const formatCode = async () => {
  if (!info.code.trim()) {
    ElMessage({
      message: "请输入需要格式化的代码",
      type: "warning",
      duration: 1500
    })
    return
  }

  try {
    info.isParseErr = false
    info.parseErr = ''
    info.code = await prettier.format(info.code, {
      parser: "html",
      plugins: [parserHtml],
      printWidth: 120,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: false,
      bracketSpacing: true,
    })
    ElMessage({
      message: "格式化成功",
      type: "success",
      duration: 1500
    })
  } catch (err: any) {
    info.isParseErr = true
    info.parseErr = err.message
    ElMessage({
      message: "代码格式错误",
      type: "error",
      duration: 1500
    })
  }
}

// 压缩代码
const minifyCode = async () => {
  if (!info.code.trim()) {
    ElMessage({
      message: "请输入需要压缩的代码",
      type: "warning",
      duration: 1500
    })
    return
  }

  try {
    info.isParseErr = false
    info.parseErr = ''
    info.code = await prettier.format(info.code, {
      parser: "html",
      plugins: [parserHtml],
      printWidth: 999999,
      tabWidth: 0,
      useTabs: false,
      semi: false,
      singleQuote: false,
      bracketSpacing: false,
    })
    ElMessage({
      message: "压缩成功",
      type: "success",
      duration: 1500
    })
  } catch (err: any) {
    info.isParseErr = true
    info.parseErr = err.message
    ElMessage({
      message: "代码格式错误",
      type: "error",
      duration: 1500
    })
  }
}

// 复制结果
const copyResult = async () => {
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

// 清空输入
const clear = () => {
  info.code = ''
  info.isParseErr = false
  info.parseErr = ''
}
</script>

<style scoped>
.cm-editor {
  height: 100%;
}

.cm-editor.cm-focused {
  outline: none;
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

.el-input :deep(.el-input__inner) {
  border-color: #e5e7eb;
}

.el-input :deep(.el-input__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
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
