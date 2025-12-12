<!--
 * @file PdfSplit.vue
 * @description PDF拆分工具组件，支持按范围拆分、提取页面、每一页单独拆分
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-10
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">PDF拆分</h2>
          <p class="text-gray-500 text-sm">将PDF文件拆分为多个文件，支持按页面范围拆分或提取每一页</p>
        </div>

        <!-- 上传区域 -->
        <div v-if="!currentFile">
          <div
            class="relative border-2 border-dashed rounded-xl min-h-[240px] flex flex-col items-center justify-center transition-all duration-300"
            :class="isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'"
            @drop.prevent="handleDrop" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept=".pdf,application/pdf"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileInputChange" />

            <div class="text-center px-4">
              <div class="w-16 h-16 mb-4 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-lg font-medium text-gray-700 mb-2">点击或拖拽PDF文件到这里</div>
              <p class="text-sm text-gray-400">单个文件最大 200MB</p>
              <p class="text-xs text-gray-400 mt-1">支持 PDF 格式</p>
            </div>
          </div>
        </div>

        <!-- PDF页面预览和操作区域 -->
        <div v-if="currentFile && pdfPages.length > 0" class="mt-6">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- 左侧设置区域 -->
            <div class="w-full md:w-1/3 space-y-6">
              <div class="bg-gray-50 p-6 rounded-lg">
                <h3 class="font-medium text-gray-900 mb-4">拆分设置</h3>

                <!-- 拆分模式选择 -->
                <div class="space-y-3">
                  <label class="flex items-center space-x-3 cursor-pointer">
                    <input type="radio" v-model="splitMode" value="extract"
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                    <span class="text-gray-700">提取为单个PDF</span>
                  </label>
                  <p class="text-xs text-gray-500 ml-7">将选中的页面或指定范围的页面合并为一个新的PDF文件。</p>

                  <label class="flex items-center space-x-3 cursor-pointer mt-4">
                    <input type="radio" v-model="splitMode" value="split_every"
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                    <span class="text-gray-700">每一页单独拆分</span>
                  </label>
                  <p class="text-xs text-gray-500 ml-7">将PDF的每一页保存为一个单独的PDF文件，打包下载。</p>

                  <label class="flex items-center space-x-3 cursor-pointer mt-4">
                    <input type="radio" v-model="splitMode" value="split_range"
                      class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
                    <span class="text-gray-700">按范围拆分为多个PDF</span>
                  </label>
                  <p class="text-xs text-gray-500 ml-7">根据输入的范围，每个范围生成一个PDF文件，打包下载。</p>
                </div>

                <!-- 范围输入 -->
                <div v-if="splitMode !== 'split_every'" class="mt-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">页面范围</label>
                  <input type="text" v-model="rangeInput" placeholder="例如: 1-3, 5, 8-10"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <p class="text-xs text-gray-500 mt-2">
                    输入要提取/拆分的页面页码或范围，用逗号分隔。
                    <br>
                    例如 "1-3, 5" 表示提取第1到3页和第5页。
                  </p>
                </div>

                <!-- 操作按钮 -->
                <div class="mt-8 space-y-3">
                  <button @click="processPdf"
                    :disabled="processing || (splitMode !== 'split_every' && !rangeInput.trim())"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <svg v-if="processing" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    {{ processing ? '处理中...' : '开始拆分/提取' }}
                  </button>

                  <button @click="clearFile"
                    class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    清除文件
                  </button>
                </div>
              </div>
            </div>

            <!-- 右侧预览区域 -->
            <div class="w-full md:w-2/3">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-medium text-gray-900">页面预览 ({{ pdfPages.length }}页)</h3>
                <div class="text-sm text-gray-500">
                  点击页面可快速添加到范围输入框
                </div>
              </div>

              <div
                class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto p-2 bg-gray-50 rounded-lg">
                <div v-for="page in pdfPages" :key="page.pageIndex" class="relative group cursor-pointer"
                  @click="togglePageSelection(page.pageNumber)">
                  <div class="aspect-[1/1.4] bg-white shadow-sm rounded border border-gray-200 overflow-hidden relative"
                    :class="{ 'ring-2 ring-blue-500': isPageSelected(page.pageNumber) }">
                    <img :src="page.thumbnail" class="w-full h-full object-contain" />
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity">
                    </div>

                    <!-- 页码 -->
                    <div
                      class="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                      {{ page.pageNumber }}
                    </div>

                    <!-- 选中标记 -->
                    <div v-if="isPageSelected(page.pageNumber)"
                      class="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
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
              <svg v-if="feature.icon === 'Split'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <svg v-else-if="feature.icon === 'Extract'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else-if="feature.icon === 'Preview'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

        <!-- 使用指南 -->
        <UsageGuide :steps="guideSteps" :notes="guideNotes" />
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'
import JSZip from 'jszip'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

// 设置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const route = useRoute()

const features = [
  {
    icon: 'Split',
    title: '多种拆分模式',
    desc: '提供按每一页拆分、提取选中页面、按范围拆分等多种灵活的拆分模式'
  },
  {
    icon: 'Extract',
    title: '精准提取',
    desc: '可以精确提取指定的单页或多页，并合并为一个新的PDF文件'
  },
  {
    icon: 'Preview',
    title: '实时预览',
    desc: '上传后可查看每一页的缩略图，方便确认页面内容和页码'
  },
  {
    icon: 'Lock',
    title: '安全隐私',
    desc: '所有拆分和提取过程均在浏览器本地完成，文件无需上传服务器，保护您的数据安全'
  }
]

const faqs = [
  {
    question: '拆分后的文件质量会下降吗？',
    answer: '不会。我们使用无损拆分技术，拆分后的文件将保持与原文件完全一致的质量和清晰度。'
  },
  {
    question: '可以直接删除某些页面吗？',
    answer: '可以通过“提取”模式，只选择您需要保留的页面，变相实现删除不需要页面的效果。'
  },
  {
    question: '支持多大的文件？',
    answer: '为了保证浏览器运行流畅，建议处理200MB以内的PDF文件。'
  }
]

interface PdfPage {
  pageIndex: number
  pageNumber: number
  thumbnail: string
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const currentFile = ref<File | null>(null)
const pdfPages = ref<PdfPage[]>([])
const isDragging = ref(false)
const processing = ref(false)
const splitMode = ref<'extract' | 'split_every' | 'split_range'>('extract')
const rangeInput = ref('')

// 指南内容
const guideSteps = [
  { title: '上传文件', description: '点击上传区域或拖拽PDF文件到指定位置。' },
  { title: '选择模式', description: '选择"提取为单个PDF"、"每一页单独拆分"或"按范围拆分"模式。' },
  { title: '设置范围', description: '如果需要，输入要提取或拆分的页面范围（如 1-3, 5）。' },
  { title: '下载文件', description: '点击"开始拆分/提取"按钮，处理完成后将自动下载文件（多个文件将打包为ZIP）。' }
]

const guideNotes = [
  '支持的范围格式：单页（如 5）、连续范围（如 1-3）。',
  '多个范围请用逗号分隔，例如：1-3, 5, 8-10。',
  '文件处理在本地进行，保障您的数据安全。'
]

// 处理文件拖拽
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type === 'application/pdf') {
      processFile(file)
    } else {
      ElMessage.warning('请上传PDF文件')
    }
  }
}

// 处理文件选择
const handleFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFile(target.files[0])
  }
}

// 处理文件加载和预览
const processFile = async (file: File) => {
  currentFile.value = file
  pdfPages.value = []

  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdf = await loadingTask.promise

    // 生成缩略图
    const scale = 0.3 // 缩略图比例

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale })

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({
        canvasContext: context!,
        viewport: viewport
      }).promise

      pdfPages.value.push({
        pageIndex: i - 1,
        pageNumber: i,
        thumbnail: canvas.toDataURL('image/jpeg')
      })
    }

    // 默认全选范围
    rangeInput.value = `1-${pdf.numPages}`

  } catch (error) {
    console.error('Error loading PDF:', error)
    ElMessage.error('PDF文件加载失败，可能是文件损坏或加密')
    clearFile()
  }
}

// 清除文件
const clearFile = () => {
  currentFile.value = null
  pdfPages.value = []
  rangeInput.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 解析范围字符串
const parseRange = (rangeStr: string, totalPages: number): number[][] => {
  const ranges: number[][] = []
  const parts = rangeStr.split(/[,，]/) // 支持中文逗号

  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue

    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n))
      if (!isNaN(start) && !isNaN(end)) {
        const validStart = Math.max(1, Math.min(start, totalPages))
        const validEnd = Math.max(1, Math.min(end, totalPages))
        // 生成该范围内的所有页码
        const rangePages = []
        for (let i = Math.min(validStart, validEnd); i <= Math.max(validStart, validEnd); i++) {
          rangePages.push(i)
        }
        ranges.push(rangePages)
      }
    } else {
      const page = parseInt(trimmed)
      if (!isNaN(page)) {
        if (page >= 1 && page <= totalPages) {
          ranges.push([page])
        }
      }
    }
  }
  return ranges
}

// 判断页面是否在当前输入范围内
const isPageSelected = (pageNumber: number) => {
  if (splitMode.value === 'split_every') return true
  if (!rangeInput.value) return false

  const ranges = parseRange(rangeInput.value, pdfPages.value.length)
  // Flatten ranges and check if pageNumber is in it
  return ranges.some(range => range.includes(pageNumber))
}

// 点击页面切换选中状态 (简单实现：添加到范围字符串或移除)
// 这是一个比较复杂的交互，为了简单起见，这里只做追加逻辑，或者不做复杂交互
// 更好的做法是维护一个 selectedPages 数组，然后同步到 rangeInput
// 但这里 rangeInput 是主数据源。
// 让我们做一个简单的交互：点击页面，如果不在范围内，则追加 ", N"。如果在，则不处理或尝试移除（移除很难解析）。
// 简化：点击页面将其页码追加到输入框
const togglePageSelection = (pageNumber: number) => {
  if (splitMode.value === 'split_every') return

  const currentRanges = parseRange(rangeInput.value, pdfPages.value.length)
  const isSelected = currentRanges.some(range => range.includes(pageNumber))

  if (!isSelected) {
    if (rangeInput.value.trim()) {
      rangeInput.value += `, ${pageNumber}`
    } else {
      rangeInput.value = `${pageNumber}`
    }
  } else {
    // 尝试移除比较复杂，暂时不做，或者提示用户手动修改
    // 为了更好的体验，可以解析整个字符串，移除该页码，重新生成字符串
    // 这里简单实现一下移除
    const allSelectedPages = new Set<number>()
    currentRanges.forEach(range => range.forEach(p => allSelectedPages.add(p)))
    allSelectedPages.delete(pageNumber)

    // 重新生成范围字符串（简化为逗号分隔）
    const sortedPages = Array.from(allSelectedPages).sort((a, b) => a - b)
    // 尝试合并连续页码
    let newStr = ''
    if (sortedPages.length > 0) {
      let start = sortedPages[0]
      let end = start

      const ranges = []
      for (let i = 1; i < sortedPages.length; i++) {
        if (sortedPages[i] === end + 1) {
          end = sortedPages[i]
        } else {
          ranges.push(start === end ? `${start}` : `${start}-${end}`)
          start = sortedPages[i]
          end = start
        }
      }
      ranges.push(start === end ? `${start}` : `${start}-${end}`)
      newStr = ranges.join(', ')
    }
    rangeInput.value = newStr
  }
}

// 处理PDF拆分/提取
const processPdf = async () => {
  if (!currentFile.value) return

  processing.value = true
  try {
    const arrayBuffer = await currentFile.value.arrayBuffer()
    const srcDoc = await PDFDocument.load(arrayBuffer)
    const totalPages = srcDoc.getPageCount()

    // 准备要处理的页面组
    let pageGroups: number[][] = []

    if (splitMode.value === 'split_every') {
      for (let i = 1; i <= totalPages; i++) {
        pageGroups.push([i])
      }
    } else if (splitMode.value === 'split_range') {
      // 解析输入，每个逗号分隔的部分作为一个组
      // parseRange 返回的是 number[][]，每个元素是一个组包含的页码数组
      // 但我之前的 parseRange 实现是将所有解析出的页码都扁平化处理了吗？
      // 并没有，parseRange 返回的是 number[][]，其中每个子数组是一个范围块解析出的页码
      // 例如 "1-3, 5" -> [[1,2,3], [5]]
      // 这正好符合 split_range 的需求：每个范围块生成一个文件
      const ranges = parseRange(rangeInput.value, totalPages)
      if (ranges.length === 0) {
        ElMessage.warning('请输入有效的页面范围')
        processing.value = false
        return
      }
      pageGroups = ranges
    } else {
      // extract: 所有选中的页面合并为一个组
      const ranges = parseRange(rangeInput.value, totalPages)
      const allPages = new Set<number>()
      ranges.forEach(range => range.forEach(p => allPages.add(p)))
      if (allPages.size === 0) {
        ElMessage.warning('请输入有效的页面范围')
        processing.value = false
        return
      }
      pageGroups = [Array.from(allPages).sort((a, b) => a - b)]
    }

    // 如果只有一个组，直接下载PDF
    if (pageGroups.length === 1) {
      const pages = pageGroups[0]
      const newDoc = await PDFDocument.create()
      // page indices are 0-based
      const pageIndices = pages.map(p => p - 1)
      const copiedPages = await newDoc.copyPages(srcDoc, pageIndices)
      copiedPages.forEach(page => newDoc.addPage(page))

      const pdfBytes = await newDoc.save()
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `extracted_${currentFile.value.name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      ElMessage.success('提取成功')
    } else {
      // 多个组，生成ZIP
      const zip = new JSZip()
      const folder = zip.folder('split_files')

      for (let i = 0; i < pageGroups.length; i++) {
        const pages = pageGroups[i]
        const newDoc = await PDFDocument.create()
        const pageIndices = pages.map(p => p - 1)
        const copiedPages = await newDoc.copyPages(srcDoc, pageIndices)
        copiedPages.forEach(page => newDoc.addPage(page))

        const pdfBytes = await newDoc.save()
        // 文件名：如果是单页，用页码；如果是范围，用 start-end
        let filename = ''
        if (pages.length === 1) {
          filename = `page_${pages[0]}.pdf`
        } else {
          filename = `pages_${pages[0]}-${pages[pages.length - 1]}.pdf`
        }

        // 避免重名
        if (folder?.file(filename)) {
          filename = `part_${i + 1}_${filename}`
        }

        folder?.file(filename, pdfBytes)
      }

      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `split_${currentFile.value.name.replace('.pdf', '')}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      ElMessage.success('拆分成功')
    }

  } catch (error) {
    console.error('Split error:', error)
    ElMessage.error('处理失败，请重试')
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
