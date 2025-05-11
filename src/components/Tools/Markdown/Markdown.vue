<!--
 * @file Markdown.vue
 * @description Markdown在线编辑器组件，支持实时预览和编辑
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-22
 *
 * 功能特性：
 * 1. 支持实时预览和编辑
 * 2. 支持常用 Markdown 语法
 * 3. 支持代码高亮显示
 * 4. 支持快捷键操作
 * 5. 支持主题切换
-->

<script setup lang="ts">
import { ref } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 组件配置信息
const info = {
  title: "Markdown编辑器",
  subtitle: "简单易用的文档编辑工具，让写作更加优雅"
}

const content = ref('')

// 功能特点
const features = [
  {
    title: '所见即所得',
    desc: '实时预览排版效果，让文档编写更直观'
  },
  {
    title: '简单排版',
    desc: '使用简单的符号实现文本排版，包括标题、列表、引用等'
  },
  {
    title: '格式规范',
    desc: '自动转换为统一的格式，让文档布局更加整洁'
  }
]

// 适用场景
const usageScenarios = [
  '工作汇报：快速编写格式规范的工作总结',
  '会议记录：轻松整理会议要点和讨论内容',
  '知识整理：结构化记录学习笔记和工作经验',
  '文章创作：编写层次分明的文章内容'
]

// 常见问题
const faqs = [
  {
    question: '为什么选择Markdown写作？',
    answer: 'Markdown让您专注于内容创作，通过简单的符号就能实现专业的排版效果，是高效写作的好帮手。'
  },
  {
    question: '新手如何快速上手？',
    answer: '掌握几个基本符号就能开始：# 用于创建标题，- 用于创建列表，> 用于引用内容。工具栏上的按钮也能帮助您快速插入这些格式。'
  },
  {
    question: '支持哪些基本格式？',
    answer: '支持标题、列表、引用、加粗、斜体等常用格式，以及简单的表格语法，满足基础的文档编写需求。'
  },
  {
    question: '如何保存内容？',
    answer: '您可以复制编辑器中的内容保存到本地文本文件中，或直接复制预览区域的格式化内容用于分享。'
  }
]
</script>

<template>
  <div class="min-h-screen py-8 bg-gray-50">
    <div class="max-w-[1440px] mx-auto px-4">
      <!-- 标题区域 -->
      <div class="text-center mb-8">
        <h1 class="text-[32px] font-medium text-gray-900 mb-3">{{ info.title }}</h1>
        <p class="text-base text-gray-500">{{ info.subtitle }}</p>
      </div>

      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-8 shadow-sm">
        <!-- 编辑器区域 -->
        <div class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <h3 class="text-sm font-medium text-gray-700">编辑器</h3>
              <span class="text-xs text-gray-400">支持标准Markdown语法</span>
            </div>
          </div>

          <div class="border rounded-lg overflow-hidden">
            <v-md-editor v-model="content" height="600px" :disabled-menus="[]" @save="() => { }"></v-md-editor>
          </div>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-8 shadow-sm">
        <!-- 功能点 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(feature, index) in features" :key="index" class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">{{ feature.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 适用场景说明 -->
        <div class="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">适用场景</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(text, index) in usageScenarios" :key="index" class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">{{ text }}</p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-8 bg-white rounded-lg p-6 border">
          <h2 class="text-xl font-medium text-gray-900 mb-6">常见问题解答</h2>
          <div class="space-y-6">
            <div v-for="(item, index) in faqs" :key="index"
              class="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <h3 class="text-lg font-medium text-gray-800 mb-2">{{ item.question }}</h3>
              <p class="text-gray-600">{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" class="mt-8" />
    </div>
  </div>
</template>

<style scoped>
:deep(.v-md-editor) {
  border: none !important;
}

:deep(.v-md-editor__toolbar) {
  border-bottom: 1px solid #e5e7eb !important;
}

:deep(.v-md-editor__preview) {
  padding: 1rem !important;
  background-color: #f9fafb !important;
}

:deep(.v-md-editor__editor) {
  padding: 1rem !important;
}
</style>
