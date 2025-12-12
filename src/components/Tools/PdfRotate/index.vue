<!--
 * @file PdfRotate.vue
 * @description PDF页面旋转工具组件，支持批量旋转、单独旋转页面，调整页面顺序、删除页面
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-27
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

        <!-- 文件预览和操作区域 -->
        <div v-if="currentFile" class="mt-6">
          <!-- 操作按钮 -->
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-4">
              <h2 class="text-lg font-medium">已选择的页面</h2>
              <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                共 {{ pageCount }} 页，已旋转 {{ rotatedPages }} 页
              </span>
            </div>
            <div class="flex space-x-3">
              <button @click="rotateAll(-90)"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                逆时针旋转 90°
              </button>
              <button @click="resetRotation"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重置
              </button>
              <button @click="rotateAll(90)"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9" />
                </svg>
                顺时针旋转 90°
              </button>

              <div class="flex-1"></div>

              <button @click="clearFile"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                清除文件
              </button>
              <button @click="savePDF" :disabled="processing"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {{ processing ? '处理中...' : '保存并下载' }}
              </button>
            </div>
          </div>

          <!-- 页面网格 -->
          <VueDraggable v-model="pages" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" :item-key="'id'"
            :animation="300" @start="isDragging = true" @end="isDragging = false">
            <template #item="{ element, index }">
              <div class="relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all group">
                <!-- 页面预览 -->
                <div class="relative aspect-[1/1.414] bg-gray-50 rounded-lg overflow-hidden cursor-move">
                  <canvas :ref="(el) => { if (el) pageCanvases[index] = el as HTMLCanvasElement }"
                    class="w-full h-full object-contain transition-transform duration-300"
                    :style="{ transform: `rotate(${element.rotation}deg)` }"></canvas>
                  <div class="absolute inset-0 flex items-center justify-center text-gray-500 text-sm font-medium">
                    第 {{ index + 1 }} 页
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="rotatePage(index, -90)"
                    class="p-2 rounded-lg bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
                    title="逆时针旋转">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button @click="rotatePage(index, 90)"
                    class="p-2 rounded-lg bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
                    title="顺时针旋转">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9" />
                    </svg>
                  </button>
                </div>
              </div>
            </template>
          </VueDraggable>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 功能特点 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div v-for="feature in features" :key="feature.title" class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path v-if="feature.icon === 'Rotate'" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                <path v-else-if="feature.icon === 'Order'" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5" d="M4 6h16M4 12h16m-7 6h7" />
                <path v-else-if="feature.icon === 'Lock'" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4" />
                <path v-else-if="feature.icon === 'Delete'" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">{{ feature.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 常见问题 -->
        <div class="mt-8">
          <h3 class="text-lg font-medium text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-4">
            <div v-for="faq in faqs" :key="faq.question" class="bg-white rounded-lg p-6 border border-gray-100">
              <h4 class="text-base font-medium text-gray-800 mb-2">{{ faq.question }}</h4>
              <p class="text-sm text-gray-600">{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <UsageGuide :steps="guideSteps" :notes="guideNotes" />
    </div>

    <!-- 工具推荐 -->
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { PDFDocument, degrees } from 'pdf-lib'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import { formatFileSize } from '@/utils/file'
import VueDraggable from 'vuedraggable'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'
import * as pdfjsLib from 'pdfjs-dist'

// 设置 PDF.js worker
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const route = useRoute()

// 初始化状态
const pdfJsReady = ref(true)

// 注册组件
const components = {
  'vue-draggable': VueDraggable
}

interface Page {
  id: number
  rotation: number
  canvas: HTMLCanvasElement | null
}

const info = reactive({
  title: "免费在线PDF页面旋转工具",
  subtitle: "可批量旋转、单独旋转页面，同时可调整页面顺序、删除页面"
})

const guideSteps = [
  { title: '上传PDF文件', description: '点击上传区域或直接拖拽PDF文件到指定区域，文件大小限制为200MB。' },
  { title: '旋转页面', description: '点击页面右上角的旋转按钮单独旋转，或使用上方工具栏批量旋转所有页面。' },
  { title: '保存并下载', description: '调整完成后，点击“保存并下载”按钮，系统将自动生成新的PDF文件。' }
]

const guideNotes = [
  '支持拖拽调整页面顺序。',
  '删除的页面将不会包含在最终生成的PDF文件中。',
  '所有文件处理均在本地浏览器完成，不会上传到服务器，确保您的文件安全。'
]

// 功能特点
const features = [
  {
    icon: 'Rotate',
    title: '灵活旋转',
    desc: '支持批量旋转所有页面或单独旋转某个页面，操作简单直观'
  },
  {
    icon: 'Order',
    title: '页面排序',
    desc: '支持拖拽调整页面顺序，轻松实现页面重新排列'
  },
  {
    icon: 'Delete',
    title: '删除页面',
    desc: '可以删除不需要的页面，快速精简文档内容'
  },
  {
    icon: 'Lock',
    title: '安全可靠',
    desc: '所有处理都在浏览器本地完成，无需上传服务器，确保文件安全'
  }
]

// 常见问题
const faqs = [
  {
    question: '这款PDF页面旋转工具是否免费？',
    answer: '是的，我们的PDF页面旋转工具完全免费使用，没有任何使用次数的限制。我们致力于为用户提供高质量的在线工具服务。'
  },
  {
    question: '使用这款PDF页面旋转工具是否有数据泄露风险？',
    answer: '完全不用担心数据安全问题。我们的PDF页面旋转工具采用纯浏览器本地处理技术，所有文件都在您的设备上处理，不会上传到任何服务器，确保您的文件安全和隐私。'
  }
]

const currentFile = ref<File | null>(null)
const pages = ref<Page[]>([])
const pageCount = ref(0)
const processing = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const pageCanvases = ref<{ [key: number]: HTMLCanvasElement }>({})

// 计算属性
const deletedPages = computed(() => {
  return pageCount.value - pages.value.length
})

const rotatedPages = computed(() => {
  return pages.value.filter(page => page.rotation !== 0).length
})

// 处理文件拖放
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (!droppedFiles || droppedFiles.length === 0) return

  const file = droppedFiles[0]
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    ElMessage.error('只能上传PDF文件')
    return
  }

  handleFile(file)
}

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  handleFile(file)

  // 清空 input 值，允许重复选择文件
  input.value = ''
}

// 处理文件
const handleFile = async (file: File) => {
  if (file.size > 200 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过200MB')
    return
  }

  if (!pdfJsReady.value) {
    ElMessage.error('PDF.js 正在加载中，请稍后再试')
    return
  }

  try {
    currentFile.value = file
    const arrayBuffer = await file.arrayBuffer()

    // 先用 pdf.js 检查文件是否可以正常打开
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdfDoc = await loadingTask.promise
    pageCount.value = pdfDoc.numPages

    // 初始化页面数据
    pages.value = Array(pageCount.value).fill(null).map((_, index) => ({
      id: index,
      rotation: 0,
      canvas: null
    }))

    // 渲染页面预览
    await renderPages(pdfDoc)
  } catch (error) {
    console.error('加载PDF失败:', error)
    ElMessage.error('PDF文件加载失败，请确保文件未损坏')
    currentFile.value = null
    pages.value = []
    pageCount.value = 0
  }
}

// 渲染页面预览
const renderPages = async (pdfDoc: any) => {
  try {
    for (let i = 0; i < pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i + 1)
      const canvas = pageCanvases.value[i]
      if (!canvas) continue

      // 获取原始页面尺寸
      const viewport = page.getViewport({ scale: 1.0, rotation: pages.value[i].rotation })

      // 计算缩放比例以适应预览区域
      const containerSize = 200 // 预览容器的大小
      const scale = Math.min(
        containerSize / viewport.width,
        containerSize / viewport.height
      )

      // 设置画布尺寸
      const scaledViewport = page.getViewport({ scale, rotation: pages.value[i].rotation })
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height

      // 渲染页面
      const context = canvas.getContext('2d')
      if (!context) continue

      try {
        await page.render({
          canvasContext: context,
          viewport: scaledViewport
        }).promise
      } catch (renderError) {
        console.error('渲染页面失败:', renderError)
        // 清除画布
        context.clearRect(0, 0, canvas.width, canvas.height)
        // 显示错误提示
        context.fillStyle = '#f56c6c'
        context.font = '14px Arial'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText('页面渲染失败', canvas.width / 2, canvas.height / 2)
      }
    }
  } catch (error) {
    console.error('渲染PDF预览失败:', error)
    ElMessage.error('PDF预览加载失败，请确保文件未损坏')
  }
}

// 旋转单个页面
const rotatePage = async (index: number, angle: number) => {
  if (!pdfJsReady.value) {
    ElMessage.error('PDF.js 正在加载中，请稍后再试')
    return
  }

  if (index >= 0 && index < pages.value.length) {
    pages.value[index].rotation = (pages.value[index].rotation + angle) % 360

    // 重新渲染该页面
    try {
      const arrayBuffer = await currentFile.value?.arrayBuffer()
      if (!arrayBuffer) return

      const loadingTask = pdfjsLib.getDocument(arrayBuffer)
      const pdfDoc = await loadingTask.promise
      const page = await pdfDoc.getPage(index + 1)
      const canvas = pageCanvases.value[index]
      if (!canvas) return

      const viewport = page.getViewport({ scale: 1.0, rotation: pages.value[index].rotation })
      const containerSize = 200
      const scale = Math.min(
        containerSize / viewport.width,
        containerSize / viewport.height
      )

      const scaledViewport = page.getViewport({ scale, rotation: pages.value[index].rotation })
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height

      const context = canvas.getContext('2d')
      if (!context) return

      await page.render({
        canvasContext: context,
        viewport: scaledViewport
      }).promise
    } catch (error) {
      console.error('重新渲染页面失败:', error)
      ElMessage.error('页面旋转失败')
    }
  }
}

// 旋转所有页面
const rotateAll = async (angle: number) => {
  if (!pdfJsReady.value) {
    ElMessage.error('PDF.js 正在加载中，请稍后再试')
    return
  }

  pages.value.forEach((page, index) => {
    page.rotation = (page.rotation + angle) % 360
  })

  // 重新渲染所有页面
  try {
    const arrayBuffer = await currentFile.value?.arrayBuffer()
    if (!arrayBuffer) return

    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdfDoc = await loadingTask.promise

    for (let i = 0; i < pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i + 1)
      const canvas = pageCanvases.value[i]
      if (!canvas) continue

      const viewport = page.getViewport({ scale: 1.0, rotation: pages.value[i].rotation })
      const containerSize = 200
      const scale = Math.min(
        containerSize / viewport.width,
        containerSize / viewport.height
      )

      const scaledViewport = page.getViewport({ scale, rotation: pages.value[i].rotation })
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height

      const context = canvas.getContext('2d')
      if (!context) continue

      try {
        await page.render({
          canvasContext: context,
          viewport: scaledViewport
        }).promise
      } catch (renderError) {
        console.error('渲染页面失败:', renderError)
        // 清除画布
        context.clearRect(0, 0, canvas.width, canvas.height)
        // 显示错误提示
        context.fillStyle = '#f56c6c'
        context.font = '14px Arial'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText('页面渲染失败', canvas.width / 2, canvas.height / 2)
      }
    }
  } catch (error) {
    console.error('重新渲染页面失败:', error)
    ElMessage.error('页面旋转失败')
  }
}

// 删除页面
const deletePage = async (index: number) => {
  if (!pdfJsReady.value) {
    ElMessage.error('PDF.js 正在加载中，请稍后再试')
    return
  }

  if (index >= 0 && index < pages.value.length) {
    // 删除页面数据
    pages.value.splice(index, 1)

    // 重新渲染所有页面
    try {
      const arrayBuffer = await currentFile.value?.arrayBuffer()
      if (!arrayBuffer) return

      const loadingTask = pdfjsLib.getDocument(arrayBuffer)
      const pdfDoc = await loadingTask.promise

      // 清除所有画布
      Object.values(pageCanvases.value).forEach(canvas => {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      })
      pageCanvases.value = {}

      // 重新渲染剩余页面
      for (let i = 0; i < pages.value.length; i++) {
        const page = await pdfDoc.getPage(i + 1)
        const canvas = pageCanvases.value[i]
        if (!canvas) continue

        const viewport = page.getViewport({ scale: 1.0, rotation: pages.value[i].rotation })
        const containerSize = 200
        const scale = Math.min(
          containerSize / viewport.width,
          containerSize / viewport.height
        )

        const scaledViewport = page.getViewport({ scale, rotation: pages.value[i].rotation })
        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height

        const context = canvas.getContext('2d')
        if (!context) continue

        try {
          await page.render({
            canvasContext: context,
            viewport: scaledViewport
          }).promise
        } catch (renderError) {
          console.error('渲染页面失败:', renderError)
          // 清除画布
          context.clearRect(0, 0, canvas.width, canvas.height)
          // 显示错误提示
          context.fillStyle = '#f56c6c'
          context.font = '14px Arial'
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText('页面渲染失败', canvas.width / 2, canvas.height / 2)
        }
      }
    } catch (error) {
      console.error('重新渲染页面失败:', error)
      ElMessage.error('页面删除失败')
    }
  }
}

// 保存PDF
const savePDF = async () => {
  if (!currentFile.value) return

  processing.value = true
  try {
    const arrayBuffer = await currentFile.value.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)

    // 创建新的PDF文档
    const newPdfDoc = await PDFDocument.create()

    // 复制页面到新文档
    for (let i = 0; i < pages.value.length; i++) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i])
      copiedPage.setRotation(degrees(pages.value[i].rotation))
      newPdfDoc.addPage(copiedPage)
    }

    const pdfBytes = await newPdfDoc.save()
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = currentFile.value.name.replace('.pdf', '') + '_旋转.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('PDF保存成功')
  } catch (error) {
    console.error('保存PDF失败:', error)
    ElMessage.error('PDF保存失败')
  } finally {
    processing.value = false
  }
}

// 重置旋转
const resetRotation = () => {
  pages.value.forEach(page => {
    page.rotation = 0
  })
}

// 清除文件
const clearFile = () => {
  currentFile.value = null
  pages.value = []
  pageCount.value = 0
  Object.values(pageCanvases.value).forEach(canvas => {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  })
  pageCanvases.value = {}
}

// 清理资源
onUnmounted(() => {
  Object.values(pageCanvases.value).forEach(canvas => {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  })
})
</script>

<style scoped>
.page-preview {
  transition: transform 0.3s ease;
}

canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
