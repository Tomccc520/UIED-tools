<!--
 * @file WritingGuide.vue
 * @description AI写作工具使用说明组件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 -->

<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
    <div class="flex items-center mb-4 cursor-pointer" @click="isExpanded = !isExpanded">
      <div class="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center mr-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-800 flex-1">工具使用说明</h3>
      <svg class="w-5 h-5 text-gray-400 transform transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <div v-show="isExpanded" class="space-y-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-gray-800 mb-2 flex items-center">
            <span class="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
            基础生成
          </h4>
          <ul class="space-y-2 pl-4 list-disc list-outside text-gray-500">
            <li>在左侧配置区域填写必要的主题、关键词等信息。</li>
            <li>根据需要选择文章类型、风格和篇幅长度。</li>
            <li>点击"开始生成"按钮，AI将根据您的要求自动创作。</li>
            <li>生成过程中请耐心等待，内容会实时显示在右侧编辑器中。</li>
          </ul>
        </div>



        <div>
          <h4 class="font-medium text-gray-800 mb-2 flex items-center">
            <span class="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
            辅助编辑
          </h4>
          <ul class="space-y-2 pl-4 list-disc list-outside text-gray-500">
            <li><strong>扩写</strong>：对现有内容进行丰富，增加细节描写。</li>
            <li><strong>续写</strong>：根据当前结尾继续创作后续内容。</li>
            <li><strong>简写</strong>：提炼核心观点，压缩篇幅。</li>
            <li><strong>润色</strong>：优化语言表达，修正语病，提升文采。</li>
          </ul>
        </div>

        <div>
          <h4 class="font-medium text-gray-800 mb-2 flex items-center">
            <span class="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></span>
            注意事项
          </h4>
          <ul class="space-y-2 pl-4 list-disc list-outside text-gray-500">
            <li>AI生成的内容仅供参考，建议人工审核后使用。</li>
            <li>请勿生成违反法律法规或社会公德的内容。</li>
            <li>编辑器支持Markdown语法，可直接进行排版调整。</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isExpanded = ref(true)
</script>
