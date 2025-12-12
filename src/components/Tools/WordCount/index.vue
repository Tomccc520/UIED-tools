<!--
 * @file WordCount.vue
 * @description 在线字数统计工具，支持字符数、单词数、行数、段落数等统计
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-30
 * @license MIT
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
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
          <!-- 左侧编辑区域 -->
          <div class="flex-1 flex flex-col gap-4">
            <!-- 工具栏 -->
            <div class="flex flex-wrap gap-2 items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div class="flex gap-2">
                <button @click="triggerFileInput" class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center">
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  导入文本
                </button>
                <input ref="fileInputRef" type="file" accept=".txt,.md" class="hidden" @change="handleFileInputChange" />
                <button @click="copyText" class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center">
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  复制
                </button>
                <button @click="clearText" class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-red-500 hover:text-red-600">
                  清空
                </button>
              </div>
            </div>

            <!-- 输入框 -->
            <textarea
              v-model="textContent"
              class="w-full h-[500px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm leading-relaxed"
              placeholder="请输入或粘贴需要统计的文本内容..."
            ></textarea>
          </div>

          <!-- 右侧统计区域 -->
          <div class="w-full lg:w-80 flex flex-col gap-6">
            <!-- 核心数据 -->
            <div class="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <h3 class="font-medium text-blue-900 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                核心数据
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-3 rounded-lg text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ stats.chars }}</div>
                  <div class="text-xs text-gray-500 mt-1">总字符数</div>
                </div>
                <div class="bg-white p-3 rounded-lg text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ stats.charsNoSpace }}</div>
                  <div class="text-xs text-gray-500 mt-1">不含空格</div>
                </div>
              </div>
            </div>

            <!-- 详细统计 -->
            <div class="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 class="font-medium text-gray-900 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                详细统计
              </h3>
              
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <span class="text-sm text-gray-600">中文字数</span>
                  <span class="font-mono font-medium text-gray-900">{{ stats.chinese }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <span class="text-sm text-gray-600">英文字数</span>
                  <span class="font-mono font-medium text-gray-900">{{ stats.english }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <span class="text-sm text-gray-600">数字</span>
                  <span class="font-mono font-medium text-gray-900">{{ stats.numbers }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <span class="text-sm text-gray-600">标点符号</span>
                  <span class="font-mono font-medium text-gray-900">{{ stats.punctuation }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <span class="text-sm text-gray-600">行数</span>
                  <span class="font-mono font-medium text-gray-900">{{ stats.lines }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                  <span class="text-sm text-gray-600">段落数</span>
                  <span class="font-mono font-medium text-gray-900">{{ stats.paragraphs }}</span>
                </div>
              </div>
            </div>

            <!-- 阅读预估 -->
            <div class="bg-orange-50 p-5 rounded-xl border border-orange-100">
              <h3 class="font-medium text-orange-900 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                阅读预估
              </h3>
              <div class="text-sm text-orange-800">
                预计阅读时间：<span class="font-bold">{{ readTime }}</span> 分钟
              </div>
              <div class="text-xs text-orange-600 mt-2 opacity-80">
                按 400字/分钟 计算
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="feature in features" :key="feature.title" class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 flex-shrink-0">
                <span v-html="feature.icon"></span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">{{ feature.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />

      <!-- 使用说明 -->
      <UsageGuide :steps="guideSteps" :notes="guideNotes" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()
const { toClipboard } = useClipboard()

const info = reactive({
  title: "在线字数统计工具",
  subtitle: "实时统计文本字符数、单词数、段落数等详细信息，支持中英文混合统计"
})

const textContent = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const stats = computed(() => {
  const text = textContent.value
  return {
    chars: text.length,
    charsNoSpace: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    lines: text ? text.split(/\r\n|\r|\n/).length : 0,
    paragraphs: text ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0,
    chinese: (text.match(/[\u4e00-\u9fa5]/g) || []).length,
    english: (text.match(/[a-zA-Z]+/g) || []).length,
    numbers: (text.match(/[0-9]+/g) || []).length,
    punctuation: (text.match(/[^\w\s\u4e00-\u9fa5]/g) || []).length
  }
})

const readTime = computed(() => {
  return Math.ceil(stats.value.chars / 400)
})

const features = [
  {
    title: '实时统计',
    desc: '输入文本即时显示统计结果，无需点击按钮，高效便捷',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`
  },
  {
    title: '多维分析',
    desc: '提供字符数、单词数、行数、段落数、中英文统计等全方位数据',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>`
  },
  {
    title: '隐私安全',
    desc: '所有统计均在浏览器本地完成，文本内容不会上传至服务器',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>`
  }
]

const guideSteps = [
  { title: '输入文本', description: '在输入框中输入、粘贴文本，或点击“导入文本”上传TXT/MD文件。' },
  { title: '查看结果', description: '右侧面板将实时显示各项统计数据，包括字数、行数、阅读时间等。' },
  { title: '复制结果', description: '如果需要，您可以直接查看数据或复制文本内容。' }
]

const guideNotes = [
  '支持中英文混合统计，准确识别汉字、单词和标点符号。',
  '阅读时间按一般成年人平均阅读速度（400字/分钟）估算。'
]

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    textContent.value = e.target?.result as string
  }
  reader.readAsText(file)
  input.value = ''
}

const copyText = async () => {
  if (!textContent.value) return
  try {
    await toClipboard(textContent.value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const clearText = () => {
  textContent.value = ''
}
</script>