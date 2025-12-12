<!--
 * @file PdfPageNumber.vue
 * @description PDF添加页码工具组件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-26
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">{{ info.title }}</h2>
          <p class="text-gray-500 text-sm">{{ info.subtitle }}</p>
        </div>

        <div v-if="!file">
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
              <p class="text-sm text-gray-400">单个文件最大 100MB</p>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col lg:flex-row gap-8">
          <!-- 预览区域 -->
          <div
            class="flex-1 bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden border border-gray-100">
            <div v-if="rendering" class="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            <div class="relative shadow-lg max-w-full bg-white transition-all duration-300">
              <canvas ref="pdfPreviewCanvas" class="max-w-full h-auto block"></canvas>
              <!-- 页码预览层 -->
              <div class="absolute inset-0 pointer-events-none font-sans"
                :style="{ fontSize: (settings.fontSize * previewScale) + 'px' }">
                <div class="absolute" :style="pageNumberStyle">
                  {{ previewText }}
                </div>
              </div>
            </div>

            <div class="mt-6 flex gap-4 items-center">
              <button @click="changePage(-1)" :disabled="currentPage <= 1"
                class="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 text-sm">上一页</button>
              <span class="text-sm text-gray-600 font-medium">第 {{ currentPage }} / {{ totalPages }} 页</span>
              <button @click="changePage(1)" :disabled="currentPage >= totalPages"
                class="px-3 py-1 bg-white border rounded hover:bg-gray-50 disabled:opacity-50 text-sm">下一页</button>
            </div>
          </div>

          <!-- 设置区域 -->
          <div class="w-full lg:w-80 space-y-6">
            <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h3 class="font-medium text-gray-900 mb-4">页码设置</h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">页码位置</label>
                  <el-select v-model="settings.position" class="w-full">
                    <el-option label="底部居中" value="bottomCenter" />
                    <el-option label="底部左侧" value="bottomLeft" />
                    <el-option label="底部右侧" value="bottomRight" />
                    <el-option label="顶部居中" value="topCenter" />
                    <el-option label="顶部左侧" value="topLeft" />
                    <el-option label="顶部右侧" value="topRight" />
                  </el-select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">起始页码</label>
                  <el-input-number v-model="settings.startNumber" :min="1" class="w-full" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">字体大小 ({{ settings.fontSize }}px)</label>
                  <el-slider v-model="settings.fontSize" :min="8" :max="72" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">边距 ({{ settings.margin }}px)</label>
                  <el-slider v-model="settings.margin" :min="0" :max="100" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">页码格式</label>
                  <el-radio-group v-model="settings.format" class="flex flex-col gap-2">
                    <el-radio label="number">1</el-radio>
                    <el-radio label="dash">- 1 -</el-radio>
                    <el-radio label="page">Page 1</el-radio>
                    <el-radio label="fraction">1 / n</el-radio>
                  </el-radio-group>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <el-button type="primary" class="w-full !h-10 text-base" :loading="processing" @click="addPageNumbers">
                添加页码并下载
              </el-button>
              <el-button class="w-full !h-10" @click="clearFile">
                重新上传
              </el-button>
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
              <svg v-if="feature.icon === 'Layout'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <svg v-else-if="feature.icon === 'Style'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
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

        <!-- 使用说明 -->
        <UsageGuide :steps="guideSteps" :notes="guideNotes" />
      </div>

      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

// 设置 PDF.js worker
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const route = useRoute()

const info = reactive({
  title: "PDF添加页码",
  subtitle: "在线为PDF文件添加页码，支持自定义位置、格式和字体样式，实时预览，本地处理更安全。"
})

const features = [
  {
    icon: 'Layout',
    title: '位置灵活',
    desc: '内置6种常用页码位置（如底部居中、顶部右侧等），支持自定义边距，满足各种排版需求'
  },
  {
    icon: 'Style',
    title: '样式丰富',
    desc: '支持自定义字体大小、起始页码，提供多种页码格式（如 "1", "- 1 -", "Page 1" 等）'
  },
  {
    icon: 'Preview',
    title: '实时预览',
    desc: '提供所见即所得的实时预览功能，调整参数后立即查看效果，确保输出完美'
  },
  {
    icon: 'Safety',
    title: '本地处理',
    desc: '所有处理均在浏览器本地完成，文件无需上传服务器，保护您的文档安全'
  }
]

const faqs = [
  {
    question: '会覆盖原有的页码吗？',
    answer: '新添加的页码会浮在页面最上层。如果位置与原有页码重叠，可能会遮挡或重叠显示。建议选择空白区域添加页码。'
  },
  {
    question: '支持中文字体吗？',
    answer: '目前页码主要支持标准的 Helvetica 字体（数字和英文）。对于复杂的中文页码格式，可能会受限。'
  },
  {
    question: '可以只给部分页面添加页码吗？',
    answer: '目前版本默认给所有页面添加连续的页码。我们正在开发指定页面范围的功能。'
  }
]

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const file = ref<File | null>(null)
const processing = ref(false)
const rendering = ref(false)
const pdfPreviewCanvas = ref<HTMLCanvasElement | null>(null)
const pdfDoc = ref<any>(null)
const currentPage = ref(1)
const totalPages = ref(0)
const previewScale = ref(1)

const settings = reactive({
  position: 'bottomCenter',
  startNumber: 1,
  fontSize: 12,
  format: 'number',
  margin: 20
})

const previewText = computed(() => {
  const num = currentPage.value + settings.startNumber - 1
  if (settings.format === 'dash') return `- ${num} -`
  if (settings.format === 'page') return `Page ${num}`
  if (settings.format === 'fraction') return `${num} / ${totalPages.value}`
  return `${num}`
})

const pageNumberStyle = computed(() => {
  const margin = settings.margin * previewScale.value
  const style: any = {
    position: 'absolute',
    color: '#000',
    lineHeight: 1,
  }

  // Vertical
  if (settings.position.startsWith('top')) {
    style.top = `${margin}px`
  } else {
    style.bottom = `${margin}px`
  }

  // Horizontal
  if (settings.position.endsWith('Left')) {
    style.left = `${margin}px`
  } else if (settings.position.endsWith('Right')) {
    style.right = `${margin}px`
  } else {
    style.left = '50%'
    style.transform = 'translateX(-50%)'
  }

  return style
})

const guideSteps = [
  { title: '上传PDF文件', description: '点击上传区域或直接拖拽PDF文件到指定区域，文件大小限制为100MB。' },
  { title: '设置页码样式', description: '选择页码位置（如底部居中）、起始页码、字体大小和显示格式。实时预览效果。' },
  { title: '添加并下载', description: '点击“添加页码并下载”按钮，系统将自动处理并在处理完成后下载带页码的PDF文件。' }
]

const guideNotes = [
  '页码将默认使用 Helvetica 字体。',
  '如果页面已有页码，新页码将覆盖在原有内容之上（如果位置重叠）。'
]

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles && droppedFiles.length > 0) {
    const droppedFile = droppedFiles[0]
    if (droppedFile.type === 'application/pdf') {
      handleFile(droppedFile)
    } else {
      ElMessage.error('请上传PDF文件')
    }
  }
}

const handleFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0])
  }
}

const handleFile = async (f: File) => {
  file.value = f
  currentPage.value = 1
  await loadPdfPreview(f)
}

const loadPdfPreview = async (f: File) => {
  rendering.value = true
  try {
    const arrayBuffer = await f.arrayBuffer()
    pdfDoc.value = await pdfjsLib.getDocument(arrayBuffer).promise
    totalPages.value = pdfDoc.value.numPages
    await renderPage(currentPage.value)
  } catch (error) {
    console.error(error)
    ElMessage.error('PDF加载失败')
  } finally {
    rendering.value = false
  }
}

const renderPage = async (pageNum: number) => {
  if (!pdfDoc.value || !pdfPreviewCanvas.value) return

  const page = await pdfDoc.value.getPage(pageNum)
  const viewport = page.getViewport({ scale: 1.0 })

  const maxWidth = 600
  const scale = maxWidth / viewport.width
  previewScale.value = scale

  const scaledViewport = page.getViewport({ scale })

  pdfPreviewCanvas.value.width = scaledViewport.width
  pdfPreviewCanvas.value.height = scaledViewport.height

  const context = pdfPreviewCanvas.value.getContext('2d')
  if (context) {
    await page.render({
      canvasContext: context,
      viewport: scaledViewport
    }).promise
  }
}

const changePage = async (delta: number) => {
  const newPage = currentPage.value + delta
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
    await renderPage(newPage)
  }
}

const clearFile = () => {
  file.value = null
  pdfDoc.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const addPageNumbers = async () => {
  if (!file.value) return

  processing.value = true
  try {
    const arrayBuffer = await file.value.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const pages = pdfDoc.getPages()
    const totalPages = pages.length

    for (let i = 0; i < totalPages; i++) {
      const page = pages[i]
      const { width, height } = page.getSize()
      const pageNum = i + settings.startNumber

      let text = `${pageNum}`
      if (settings.format === 'dash') text = `- ${pageNum} -`
      else if (settings.format === 'page') text = `Page ${pageNum}`
      else if (settings.format === 'fraction') text = `${pageNum} / ${totalPages}`

      const textWidth = helveticaFont.widthOfTextAtSize(text, settings.fontSize)
      const textHeight = helveticaFont.heightAtSize(settings.fontSize)

      let x = 0, y = 0
      const margin = settings.margin

      // Calculate X position
      if (settings.position.includes('Center')) {
        x = width / 2 - textWidth / 2
      } else if (settings.position.includes('Left')) {
        x = margin
      } else if (settings.position.includes('Right')) {
        x = width - textWidth - margin
      }

      // Calculate Y position
      if (settings.position.includes('bottom')) {
        y = margin
      } else if (settings.position.includes('top')) {
        y = height - textHeight - margin
      }

      page.drawText(text, {
        x,
        y,
        size: settings.fontSize,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      })
    }

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `numbered_${file.value.name}`
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success('添加页码成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('添加页码失败，请重试')
  } finally {
    processing.value = false
  }
}
</script>
