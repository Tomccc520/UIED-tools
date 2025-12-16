<!--
 * @file PdfExtractText.vue
 * @description PDF文本提取工具组件，支持提取PDF中的文本内容
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
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">{{ info.title }}</h2>
          <p class="text-gray-500 text-sm">{{ info.subtitle }}</p>
        </div>

        <!-- 上传区域 -->
        <div v-if="!file">
          <div
            class="relative border-2 border-dashed rounded-xl min-h-[240px] flex flex-col items-center justify-center transition-all duration-300"
            :class="isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'"
            @drop.prevent="handleDrop" @dragover.prevent="handleDragover" @dragleave.prevent="handleDragleave">
            <input ref="fileInputRef" type="file" accept=".pdf,application/pdf"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileInputChange" />

            <div class="text-center px-4">
              <div class="w-16 h-16 mb-4 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="text-lg font-medium text-gray-700 mb-2">点击或拖拽PDF文件到这里</div>
              <p class="text-sm text-gray-400">单个文件最大 100MB</p>
            </div>
          </div>
        </div>

        <!-- 提取结果区域 -->
        <div v-else class="flex flex-col gap-6">
          <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div class="flex items-center gap-3 overflow-hidden">
              <div class="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative border border-gray-300">
                <canvas ref="thumbnailCanvas" class="w-full h-full object-contain"></canvas>
                <div v-if="!hasThumbnail" class="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div class="min-w-0">
                <h3 class="font-medium text-gray-900 truncate">{{ file.name }}</h3>
                <p class="text-sm text-gray-500">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="clearFile"
                class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                重新上传
              </button>
              <button v-if="!extractedText && !processing" @click="extractText"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                开始提取
              </button>
            </div>
          </div>

          <!-- 处理中状态 -->
          <div v-if="processing" class="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
            <div
              class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-4">
            </div>
            <p class="text-gray-900 font-medium text-lg">正在提取文本...</p>
            <p class="text-gray-500 mt-2">已处理 {{ progress }}%</p>
          </div>

          <!-- 提取结果 -->
          <div v-if="extractedText" class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="font-medium text-gray-900 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                提取结果
              </h3>
              <div class="flex gap-2">
                <button @click="copyText"
                  class="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  复制文本
                </button>
                <button @click="downloadText"
                  class="flex items-center px-3 py-1.5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下载 TXT
                </button>
              </div>
            </div>
            <div class="relative group">
              <textarea readonly
                class="w-full h-[600px] p-6 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-700 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
                :value="extractedText"></textarea>
              <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="bg-gray-800 text-white text-xs px-2 py-1 rounded">只读预览</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 功能特点 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="feature in features" :key="feature.title"
            class="bg-gray-50 p-6 rounded-xl hover:shadow-sm transition-shadow">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <svg v-if="feature.icon === 'Text'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-else-if="feature.icon === 'Preview'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else-if="feature.icon === 'Export'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-900 mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>

        <!-- 常见问题 -->
        <div class="mt-12">
          <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <svg class="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            常见问题
          </h3>
          <div class="space-y-4">
            <div v-for="(faq, index) in faqs" :key="index" class="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <h4 class="font-bold text-gray-800 mb-2">{{ faq.question }}</h4>
              <p class="text-sm text-gray-600">{{ faq.answer }}</p>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <UsageGuide :steps="guideSteps" :notes="guideNotes" />
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as pdfjsLib from 'pdfjs-dist'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

// 设置 PDF.js worker
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const route = useRoute()

const info = reactive({
  title: "PDF文本提取",
  subtitle: "免费在线提取PDF文件中的文本内容，智能识别段落，支持复制和导出TXT，本地处理更安全。"
})

const features = [
  {
    icon: 'Text',
    title: '智能提取',
    desc: '采用先进的文本识别算法，能够准确提取PDF中的文本内容，并尝试保留段落结构'
  },
  {
    icon: 'Preview',
    title: '内容预览',
    desc: '提供提取结果的实时预览功能，方便您快速检查提取内容的准确性'
  },
  {
    icon: 'Export',
    title: '多种导出',
    desc: '支持一键复制提取内容到剪贴板，或将内容导出为TXT文本文件，方便后续编辑'
  },
  {
    icon: 'Lock',
    title: '安全隐私',
    desc: '所有提取过程均在浏览器本地完成，文件无需上传服务器，保护您的数据安全'
  }
]

const faqs = [
  {
    question: '支持扫描版PDF吗？',
    answer: '目前主要支持标准PDF文档的文本提取。对于图片型或扫描版PDF，可能无法直接提取文本，需要使用OCR功能（后续版本支持）。'
  },
  {
    question: '提取的格式会乱吗？',
    answer: '我们会尽力还原文档的段落结构，但由于PDF文件本身的复杂性，复杂的排版（如多栏布局）可能会导致提取顺序与原文略有差异。'
  },
  {
    question: '有文件大小限制吗？',
    answer: '建议处理100MB以内的文件，过大的文件可能会导致浏览器响应变慢。'
  }
]

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const file = ref<File | null>(null)
const processing = ref(false)
const progress = ref(0)
const extractedText = ref('')
const thumbnailCanvas = ref<HTMLCanvasElement | null>(null)
const hasThumbnail = ref(false)

const generateThumbnail = async (f: File) => {
  try {
    const arrayBuffer = await f.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 0.5 })

    if (thumbnailCanvas.value) {
      thumbnailCanvas.value.width = viewport.width
      thumbnailCanvas.value.height = viewport.height
      const context = thumbnailCanvas.value.getContext('2d')
      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise
        hasThumbnail.value = true
      }
    }
  } catch (e) {
    console.error('Thumbnail generation failed', e)
    hasThumbnail.value = false
  }
}

watch(file, async (newFile) => {
  hasThumbnail.value = false
  if (newFile) {
    // Wait for DOM update so canvas is available
    setTimeout(() => generateThumbnail(newFile), 100)
  }
})

const guideSteps = [
  { title: '上传PDF文件', description: '点击上传区域或直接拖拽PDF文件到指定区域，文件大小限制为100MB。' },
  { title: '提取文本', description: '点击“开始提取”按钮，系统将自动识别并提取PDF文件中的所有文本内容。' },
  { title: '复制或下载', description: '提取完成后，您可以直接复制文本内容，或将其下载为TXT文件。' }
]

const guideNotes = [
  '仅支持提取标准PDF文档中的文本，扫描版PDF（图片型）可能无法提取。',
  '系统会尝试保留段落结构，但复杂排版可能会有所偏差。'
]

const handleDragover = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragleave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles && droppedFiles.length > 0) {
    const droppedFile = droppedFiles[0]
    if (droppedFile.type === 'application/pdf') {
      file.value = droppedFile
      extractedText.value = ''
    } else {
      ElMessage.error('请上传PDF文件')
    }
  }
}

const handleFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    file.value = target.files[0]
    extractedText.value = ''
  }
}

const clearFile = () => {
  file.value = null
  extractedText.value = ''
  progress.value = 0
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const extractText = async () => {
  if (!file.value) return

  processing.value = true
  progress.value = 0
  extractedText.value = ''

  try {
    const arrayBuffer = await file.value.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdf = await loadingTask.promise
    const totalPages = pdf.numPages

    let fullText = ''

    for (let i = 1; i <= totalPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()

      // Simple layout reconstruction
      let pageStr = ''
      let lastY = -1

      // Sort items by Y (desc) then X (asc)
      // transform[5] is Y translation.
      // Note: PDF coordinates origin is bottom-left, so higher Y is higher on page.
      // We want to read from top to bottom, so sort by Y descending.
      const items = textContent.items.map((item: any) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
        height: item.height || 0 // item.height might be undefined in some versions
      })).sort((a, b) => {
        if (Math.abs(a.y - b.y) > 5) { // Threshold for same line
          return b.y - a.y // Top to bottom
        }
        return a.x - b.x // Left to right
      })

      for (const item of items) {
        if (lastY !== -1 && Math.abs(item.y - lastY) > 10) { // New line threshold
          pageStr += '\n'
        } else if (lastY !== -1) {
          pageStr += ' ' // Space between words on same line
        }
        pageStr += item.str
        lastY = item.y
      }

      fullText += `--- 第 ${i} 页 ---\n\n${pageStr}\n\n`

      progress.value = Math.round((i / totalPages) * 100)
    }

    extractedText.value = fullText
    ElMessage.success('文本提取成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('提取文本失败，可能是加密文件或扫描件')
  } finally {
    processing.value = false
  }
}

const copyText = async () => {
  if (!extractedText.value) return
  try {
    await navigator.clipboard.writeText(extractedText.value)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const downloadText = () => {
  if (!extractedText.value || !file.value) return

  const blob = new Blob([extractedText.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${file.value.name.replace('.pdf', '')}_extracted.txt`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/* Add any specific styles here */
</style>
