<!--
 * @file TextRemoveDuplicate.vue
 * @description 文本去重工具，支持按行去除重复内容
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-22
 *
 * 功能特性：
 * 1. 支持按行去重
 * 2. 实时处理结果
 * 3. 一键复制结果
 * 4. 支持批量文本处理
 * 5. 保持原文本格式
-->

<script setup lang="ts">
import { ref, computed } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { copy } from '@/utils/string'

const route = useRoute()

// 组件配置信息
const info = {
  title: "文本去重工具",
  subtitle: "快速去除文本中的重复内容，提高文本质量"
}

const content = ref('')
const result = computed(() => {
  if (!content.value) return ''
  const lines = content.value.split('\n')
  const uniqueLines = Array.from(new Set(lines))
  return uniqueLines.join('\n')
})

// 清空内容
const clear = () => {
  content.value = ''
}

// 复制结果
const copyResult = async () => {
  await copy(result.value)
}

// 功能特点
const features = [
  {
    title: '智能去重',
    desc: '自动识别并删除重复行，保持文本整洁'
  },
  {
    title: '实时处理',
    desc: '输入即时处理，立即查看去重效果'
  },
  {
    title: '便捷操作',
    desc: '一键清空内容，快速复制结果'
  }
]

// 适用场景
const usageScenarios = [
  '数据整理：清理Excel复制出的重复数据',
  '名单处理：去除重复的姓名或ID列表',
  '文本优化：清理重复的段落或句子',
  '日志处理：去除重复的日志记录'
]

// 常见问题
const faqs = [
  {
    question: '如何使用文本去重工具？',
    answer: '只需将文本粘贴到输入框中，工具会自动去除重复的行，您可以在下方实时查看处理结果，并一键复制。'
  },
  {
    question: '会改变文本的顺序吗？',
    answer: '去重过程会保持原文本的顺序，只删除后面出现的重复内容，确保文本的连贯性。'
  },
  {
    question: '支持多大的文本处理？',
    answer: '支持处理大量文本内容，但建议单次处理不超过10万行，以获得最佳的处理效果。'
  },
  {
    question: '处理后如何使用结果？',
    answer: '处理后的结果会实时显示在下方，您可以直接点击"复制结果"按钮复制到剪贴板，方便粘贴使用。'
  }
]
</script>

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
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <!-- 输入区域 -->
        <div class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <h3 class="text-base font-medium text-gray-700">原始文本</h3>
              <span class="text-sm text-gray-500">输入或粘贴需要去重的文本</span>
            </div>
          </div>

          <div class="border rounded-lg overflow-hidden shadow-sm">
            <el-input type="textarea" :rows="8" v-model="content" placeholder="请输入需要去重的文本，每行一个内容..." class="w-full" />
          </div>

          <!-- 操作按钮 -->
          <div class="flex space-x-4 mt-6">
            <el-button type="primary" @click="copyResult" :disabled="!result" class="px-6 h-10">复制结果</el-button>
            <el-button type="danger" @click="clear" :disabled="!content" class="px-6 h-10">清空内容</el-button>
          </div>

          <!-- 结果展示 -->
          <div class="mt-8 border rounded-lg p-6 bg-gray-50">
            <div class="flex items-center space-x-2 mb-4">
              <h3 class="text-base font-medium text-gray-700">处理结果</h3>
              <span class="text-sm text-gray-500">已去除重复内容</span>
            </div>
            <div class="border rounded-lg overflow-hidden bg-white shadow-sm">
              <el-input type="textarea" :rows="8" v-model="result" readonly placeholder="去重后的结果将显示在这里..."
                class="w-full" />
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
            <div v-for="(item, index) in faqs" :key="index" class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.question }}</h4>
              <p class="text-sm text-gray-600 leading-relaxed">{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
.el-textarea :deep(.el-textarea__inner) {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  padding: 1.5rem;
  border: none;
  background-color: #fff;
}

.el-textarea :deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

.el-textarea.readonly :deep(.el-textarea__inner) {
  background-color: #f9fafb;
  cursor: default;
}

.el-button {
  font-weight: 500;
  transition: all 0.2s;
}

.el-button:hover:not(:disabled) {
  transform: translateY(-1px);
}
</style>
