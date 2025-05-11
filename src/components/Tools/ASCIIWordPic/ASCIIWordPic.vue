<!--
 * @file ASCIIWordPic.vue
 * @description ASCII字符画生成工具，支持多种字体风格
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-22
 *
 * 功能特性：
 * 1. 支持多种字体风格
 * 2. 实时预览效果
 * 3. 一键复制结果
 * 4. 支持自定义文本
 * 5. 快速清空重置
-->

<script setup lang="ts">
import { ref, onMounted } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { copy } from '@/utils/string'
import figlet from 'figlet'

const route = useRoute()

// 组件配置信息
const info = {
  title: "ASCII字符画生成器",
  subtitle: "将文本转换为艺术字符画，让文字更有创意"
}

// 配置 figlet 字体路径
figlet.defaults({ fontPath: '//unpkg.com/figlet@1.6.0/fonts/' })

const content = ref('UIED-Tools')
const result = ref('')
const fontStyle = ref('Big')

// 字体风格选项
const fontOptions = [
  { value: 'Alpha', label: 'Alpha' },
  { value: 'Avatar', label: 'Avatar' },
  { value: 'Banner', label: 'Banner' },
  { value: 'Banner3-D', label: 'Banner3-D' },
  { value: 'Basic', label: 'Basic' },
  { value: 'Bear', label: 'Bear' },
  { value: 'Big Money-ne', label: 'Big Money-ne' },
  { value: 'Big', label: 'Big' },
  { value: 'Block', label: 'Block' },
  { value: 'Epic', label: 'Epic' },
  { value: 'Ghost', label: 'Ghost' },
  { value: 'Knob', label: 'Knob' },
  { value: 'Linux', label: 'Linux' },
  { value: 'Mini', label: 'Mini' },
  { value: 'Mirror', label: 'Mirror' },
  { value: 'Peaks', label: 'Peaks' },
  { value: 'Slant', label: 'Slant' },
  { value: 'Small', label: 'Small' },
  { value: 'Stellar', label: 'Stellar' },
  { value: 'Thin', label: 'Thin' },
  { value: 'Wow', label: 'Wow' }
]

// 生成字符画
const generateAscii = () => {
  figlet(content.value, {
    font: fontStyle.value,
    width: 120,
    horizontalLayout: "default",
    verticalLayout: "default",
    whitespaceBreak: true,
  }, (err, data) => {
    if (err) {
      console.error('生成失败:', err)
      return
    }
    result.value = data || ''
  })
}

// 清空内容
const clear = () => {
  content.value = ''
  result.value = ''
}

// 功能特点
const features = [
  {
    title: '多种风格',
    desc: '提供20多种字体风格，满足不同创意需求'
  },
  {
    title: '即时生成',
    desc: '快速生成字符画效果，实时预览结果'
  },
  {
    title: '便捷操作',
    desc: '一键生成、复制和清空，操作简单直观'
  }
]

// 适用场景
const usageScenarios = [
  '个性签名：制作独特的文字签名',
  '注释装饰：为代码添加醒目的注释',
  '文本装饰：创作特殊的文字效果',
  '趣味创作：制作有趣的字符艺术'
]

// 常见问题
const faqs = [
  {
    question: '支持中文字符吗？',
    answer: '目前主要支持英文字母、数字和基本符号，中文字符可能无法正确显示。建议使用英文字母和数字获得最佳效果。'
  },
  {
    question: '如何选择合适的字体风格？',
    answer: '可以通过下拉菜单选择不同的字体风格，点击生成后即可预览效果。建议多尝试几种风格，选择最适合的一种。'
  },
  {
    question: '生成的字符画太大或太小怎么办？',
    answer: '字符画的大小主要取决于输入的文本长度和选择的字体风格。如果显示效果不理想，可以尝试调整文本长度或更换字体风格。'
  },
  {
    question: '如何使用生成的结果？',
    answer: '生成的字符画可以通过"复制结果"按钮复制到剪贴板，然后粘贴到任何文本编辑器中使用。注意保持等宽字体以获得最佳显示效果。'
  }
]

onMounted(() => {
  generateAscii()
})
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
              <h3 class="text-base font-medium text-gray-700">文本输入</h3>
              <span class="text-sm text-gray-500">输入需要转换的文本</span>
            </div>
          </div>

          <div class="border rounded-lg overflow-hidden shadow-sm">
            <el-input v-model="content" type="textarea" :rows="4" placeholder="请输入需要转换的文本（建议使用英文字母和数字）"
              class="w-full" />
          </div>

          <!-- 控制面板 -->
          <div class="flex flex-wrap items-center gap-4 mt-6">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">字体风格</span>
              <el-select v-model="fontStyle" size="default" @change="generateAscii" class="w-48">
                <el-option v-for="item in fontOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </div>
            <div class="flex space-x-3">
              <el-button type="primary" @click="generateAscii" class="px-6 h-10">生成</el-button>
              <el-button type="primary" @click="copy(result)" :disabled="!result" class="px-6 h-10">复制结果</el-button>
              <el-button type="danger" @click="clear" :disabled="!content" class="px-6 h-10">清空</el-button>
            </div>
          </div>

          <!-- 结果展示 -->
          <div class="mt-8 border rounded-lg p-6 bg-gray-50">
            <div class="flex items-center space-x-2 mb-4">
              <h3 class="text-base font-medium text-gray-700">生成结果</h3>
              <span class="text-sm text-gray-500">ASCII字符画效果</span>
            </div>
            <div class="border rounded-lg p-6 bg-white shadow-sm font-mono overflow-x-auto">
              <pre class="whitespace-pre"><code>{{ result }}</code></pre>
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

pre {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
}

.el-button {
  font-weight: 500;
  transition: all 0.2s;
}

.el-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.el-select {
  width: auto;
  min-width: 160px;
}
</style>
