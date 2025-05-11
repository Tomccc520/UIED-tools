<!--
 * @file HtmlEntity.vue
 * @description HTML实体转换工具，支持HTML和实体编码的双向转换
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持HTML转实体编码
 * 2. 支持实体编码转HTML
 * 3. 支持一键复制结果
 * 4. 实时预览转换效果
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
          <p class="text-gray-500 text-sm mt-6">专业的HTML实体转换工具，支持HTML和实体编码的双向转换</p>
        </div>

        <!-- 输入和转换区域 -->
        <div class="space-y-6">
          <!-- 输入区域 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">输入内容</h3>
            </div>
            <div class="border rounded-lg overflow-hidden bg-white">
              <el-input v-model="content" :rows="8" type="textarea" placeholder="请输入需要转换的内容..." @change="parser" />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-wrap gap-3">
            <el-button type="primary" @click="parser('toEntity')" class="px-6 h-10">HTML转实体</el-button>
            <el-button type="primary" @click="parser('toHTML')" class="px-6 h-10">实体转HTML</el-button>
            <el-button type="primary" @click="copyResult" class="px-6 h-10">复制结果</el-button>
            <el-button @click="clear" class="px-6 h-10">清空输入</el-button>
          </div>

          <!-- 转换结果 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">转换结果</h3>
            </div>
            <div class="border rounded-lg overflow-hidden bg-white p-4">
              <el-input v-model="cleanContent" type="textarea" :rows="8" readonly placeholder="转换结果将在这里显示" />
            </div>
            <div v-if="cleanContent" class="mt-4">
              <h4 class="text-base font-medium text-gray-700 mb-3">预览效果：</h4>
              <div class="bg-white rounded-lg p-4 prose prose-sm max-w-none border" v-html="cleanContent"></div>
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

        <!-- HTML实体说明 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">HTML实体说明</h3>
          <div class="space-y-6">
            <div class="border-b border-gray-100 pb-6">
              <h4 class="text-base font-medium text-gray-800 mb-3">什么是HTML实体？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                HTML实体是一段以连字号(&)开头、以分号(;)结尾的字符串。用于在HTML中显示特殊字符，如 &lt; 表示小于号，&gt; 表示大于号等。
              </p>
            </div>
            <div class="pb-6">
              <h4 class="text-base font-medium text-gray-800 mb-3">常用HTML实体</h4>
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p>&lt; → &amp;lt;</p>
                  <p>&gt; → &amp;gt;</p>
                  <p>&amp; → &amp;amp;</p>
                </div>
                <div>
                  <p>" → &amp;quot;</p>
                  <p>' → &amp;apos;</p>
                  <p>空格 → &amp;nbsp;</p>
                </div>
              </div>
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
import { ref, reactive } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { escape, unescape } from 'lodash'
import { copy } from '@/utils/string'
import { ElMessage } from 'element-plus'

const route = useRoute()

const info = reactive({
  title: "HTML实体转换工具"
})

const content = ref('')
const cleanContent = ref('')

// 功能特点
const features = [
  {
    title: '双向转换',
    desc: '支持HTML和实体编码的双向转换'
  },
  {
    title: '实时预览',
    desc: '直观展示转换前后的效果对比'
  },
  {
    title: '便捷操作',
    desc: '一键转换，一键复制转换结果'
  }
]

// 适用场景
const usageScenarios = [
  'Web开发：处理HTML特殊字符',
  '内容编辑：确保特殊字符正确显示',
  '模板开发：处理模板中的特殊字符',
  '数据处理：清理和转换HTML内容'
]

// 转换处理
const parser = (type: string = 'toEntity') => {
  if (!content.value.trim()) {
    ElMessage({
      message: "请输入需要转换的内容",
      type: "warning",
      duration: 1500
    })
    return
  }

  if (type === 'toHTML') {
    // 转HTML
    cleanContent.value = unescape(content.value)
  } else {
    // 转实体
    cleanContent.value = escape(content.value)
  }

  ElMessage({
    message: "转换成功",
    type: "success",
    duration: 1500
  })
}

// 复制结果
const copyResult = async () => {
  if (!cleanContent.value.trim()) {
    ElMessage({
      message: "没有可复制的内容",
      type: "warning",
      duration: 1500
    })
    return
  }

  copy(cleanContent.value)
  ElMessage({
    message: "复制成功",
    type: "success",
    duration: 1500
  })
}

// 清空输入
const clear = () => {
  content.value = ''
  cleanContent.value = ''
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

.prose {
  color: #374151;
}

.prose :where(p):not(:where([class~="not-prose"] *)) {
  margin: 0;
}
</style>
