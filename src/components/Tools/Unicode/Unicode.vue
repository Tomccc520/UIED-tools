<!--
 * @file Unicode.vue
 * @description Unicode编码转换工具，支持Unicode和中文互转
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持Unicode编码转中文
 * 2. 支持中文转Unicode编码
 * 3. 支持一键复制转换结果
 * 4. 实时编辑和预览
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
          <p class="text-gray-500 text-sm mt-6">专业的Unicode编码转换工具，支持Unicode和中文的双向转换</p>
        </div>

        <div class="space-y-6">
          <!-- 输入区域 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">输入内容</h3>
            </div>
            <div class="border rounded-lg overflow-hidden bg-white">
              <codemirror v-model="info.content" placeholder="请输入需要转换的内容..." :style="{ height: '200px' }"
                :autofocus="true" :indent-with-tab="true" :tabSize="2" />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-wrap gap-3">
            <el-button type="primary" @click="toZH" class="px-6 h-10">Unicode转中文</el-button>
            <el-button type="primary" @click="toUnicode" class="px-6 h-10">中文转Unicode</el-button>
            <el-button type="primary" @click="copyRes" class="px-6 h-10">复制结果</el-button>
          </div>

          <!-- 转换结果 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">转换结果</h3>
            </div>
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <el-input v-model="info.tranRes" type="textarea" :rows="8" readonly placeholder="转换结果将在这里显示" />
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
              <h4 class="text-base font-medium text-gray-900 mb-3">什么是Unicode编码？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                Unicode是计算机科学领域里的一项业界标准，它为世界上大部分的文字系统进行了编码，使得电脑能够以统一的方式处理和显示各种语言文字。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">为什么需要Unicode转换？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                在跨平台开发、国际化应用、数据传输等场景中，经常需要对文本进行Unicode编码转换，以确保文字能够正确显示和处理。
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
import { Codemirror } from "vue-codemirror"
import { copy } from '@/utils/string'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

const route = useRoute()

const info = reactive({
  title: "Unicode转换工具",
  content: '',
  tranRes: '',
})

// 功能特点
const features = [
  {
    title: '双向转换',
    desc: '支持Unicode和中文的双向转换功能'
  },
  {
    title: '实时预览',
    desc: '转换结果实时显示，方便对比查看'
  },
  {
    title: '便捷操作',
    desc: '一键转换，一键复制转换结果'
  }
]

// 适用场景
const usageScenarios = [
  '国际化开发：处理多语言文本编码',
  '数据传输：确保特殊字符正确传输',
  '网页开发：处理特殊字符显示问题',
  '调试工具：分析和转换编码问题'
]

const clearRes = () => {
  info.tranRes = ''
}

//Unicode转中文
const toZH = () => {
  if (!info.content.trim()) {
    ElMessage({
      message: "请输入需要转换的内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  clearRes()
  let str = info.content
  str = str.replace(/\\/g, "%")
  // 转换中文
  str = unescape(str)
  info.tranRes = str
  ElMessage({
    message: "转换成功",
    type: "success",
    duration: 1500
  })
}

//中文转Unicode
const toUnicode = () => {
  if (!info.content.trim()) {
    ElMessage({
      message: "请输入需要转换的内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  clearRes()
  //只转换中文
  for (let i = 0; i < info.content.length; i++) {
    if (/^[\u4E00-\u9FA5\uF900-\uFA2D]+$/.test(info.content[i])) {
      let code = info.content.charCodeAt(i).toString(16)
      info.tranRes += '\\u' + code
    } else {
      info.tranRes += info.content[i]
    }
  }
  ElMessage({
    message: "转换成功",
    type: "success",
    duration: 1500
  })
}

//复制结果
const copyRes = async () => {
  if (!info.tranRes.trim()) {
    ElMessage({
      message: "没有可复制的内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  copy(info.tranRes)
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
