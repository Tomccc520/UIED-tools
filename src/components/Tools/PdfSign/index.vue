<!--
 * @file PdfSign.vue
 * @description PDF签名工具组件
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
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">PDF签名</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">在线为PDF文件添加手写签名，支持拖拽位置，支持多页应用，本地处理更安全。</p>
        </div>

        <div v-if="!file">
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept=".pdf,application/pdf"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileInputChange" />

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽PDF文件到这里</div>
              <p class="text-xs text-gray-400">单个文件最大 50MB</p>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col gap-8">
          <!-- 签名区域 -->
          <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
              <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-2">1</span>
              创建签名
            </h3>
            <div class="flex flex-col md:flex-row gap-6">
              <div class="border-2 border-dashed border-gray-300 bg-white rounded-lg shadow-sm hover:border-blue-400 transition-colors"
                style="width: 100%; max-width: 400px; height: 200px; position: relative;">
                <canvas ref="signatureCanvas" width="400" height="200" class="cursor-crosshair w-full h-full touch-none"
                  @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing"
                  @touchstart.prevent="startDrawing" @touchmove.prevent="draw" @touchend.prevent="stopDrawing"></canvas>
                <div v-if="isEmptySignature"
                  class="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 select-none">
                  在此处手写签名
                </div>
              </div>
              <div class="flex flex-col gap-3 justify-center min-w-[150px]">
                <el-button @click="clearSignature">
                  <template #icon>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </template>
                  清除
                </el-button>
                <el-button type="primary" @click="confirmSignature" :disabled="isEmptySignature">
                  <template #icon>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  </template>
                  使用此签名
                </el-button>
              </div>
            </div>
          </div>

          <!-- 预览和放置区域 -->
          <div v-if="signatureImage" class="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div class="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h3 class="font-bold text-gray-800 flex items-center">
                <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-2">2</span>
                放置签名
              </h3>
              <div class="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border shadow-sm">
                <el-button size="small" circle @click="changePage(-1)" :disabled="currentPage <= 1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                </el-button>
                <span class="text-sm font-medium text-gray-700 min-w-[80px] text-center">第 {{ currentPage }} / {{ totalPages }} 页</span>
                <el-button size="small" circle @click="changePage(1)" :disabled="currentPage >= totalPages">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </el-button>
              </div>
            </div>

            <p class="text-sm text-gray-500 mb-4">拖动签名调整位置，拖动右下角调整大小。签名位置将基于当前预览页面。</p>

            <div class="relative overflow-hidden border bg-gray-200 mx-auto shadow-lg"
              :style="{ width: pdfViewportWidth + 'px', height: pdfViewportHeight + 'px' }">
              <canvas ref="pdfCanvas" class="block"></canvas>
              <!-- 签名拖拽层 -->
              <div v-if="signatureImage"
                class="absolute cursor-move border-2 border-dashed border-blue-500 hover:bg-blue-500/10 transition-colors group" :style="{
                  left: signaturePos.x + 'px',
                  top: signaturePos.y + 'px',
                  width: signatureSize.width + 'px',
                  height: signatureSize.height + 'px'
                }" @mousedown="startDragSignature" @touchstart.prevent="startDragSignature">
                <img :src="signatureImage" class="w-full h-full object-contain pointer-events-none select-none" draggable="false" />
                <!-- 缩放手柄 -->
                <div class="absolute bottom-[-6px] right-[-6px] w-5 h-5 bg-blue-500 rounded-full cursor-se-resize flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  @mousedown.stop="startResizeSignature" @touchstart.stop.prevent="startResizeSignature">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20h16a1 1 0 001-1V4M4 20l16-16" /></svg>
                </div>
              </div>
            </div>

            <div class="mt-6 flex flex-col sm:flex-row justify-end items-center gap-4 border-t pt-4">
              <label class="flex items-center cursor-pointer select-none">
                <input type="checkbox" v-model="applyToAllPages" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500">
                <span class="ml-2 text-gray-700">应用到每一页 (相同位置)</span>
              </label>
              <div class="flex gap-3 w-full sm:w-auto">
                 <el-button class="flex-1 sm:flex-none" @click="clearFile">重新上传</el-button>
                 <el-button type="primary" class="flex-1 sm:flex-none" :loading="processing" @click="saveSignedPdf">生成并下载PDF</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />
      <UsageGuide :steps="guideSteps" :notes="guideNotes" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

// 设置 PDF.js worker
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const route = useRoute()
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const file = ref<File | null>(null)
const processing = ref(false)

// Signature Pad
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const isEmptySignature = ref(true)
const ctx = ref<CanvasRenderingContext2D | null>(null)

// PDF Preview
const pdfCanvas = ref<HTMLCanvasElement | null>(null)
const currentPage = ref(1)
const totalPages = ref(0)
const pdfDocProxy = ref<any>(null)
const pdfViewportWidth = ref(0)
const pdfViewportHeight = ref(0)
const scale = ref(1) // 缩放比例，用于显示

// Signature Placement
const signatureImage = ref<string | null>(null)
const signaturePos = reactive({ x: 50, y: 50 })
const signatureSize = reactive({ width: 150, height: 75 })
const isDraggingSignature = ref(false)
const isResizingSignature = ref(false)
const dragStart = reactive({ x: 0, y: 0 })
const initialPos = reactive({ x: 0, y: 0 })
const initialSize = reactive({ width: 0, height: 0 })

const applyToAllPages = ref(false)

const guideSteps = [
  { title: '上传PDF', description: '上传需要签名的PDF文件。' },
  { title: '创建签名', description: '在签名板上手写您的签名。确认后签名将出现在PDF预览上。' },
  { title: '调整位置', description: '在PDF预览中拖动签名到合适的位置，拖动右下角调整大小。' },
  { title: '生成下载', description: '选择是否应用到所有页面，点击生成按钮下载已签名的PDF文件。' }
]

const guideNotes = [
  '签名操作完全在本地进行，您的签名和文件不会上传到服务器。',
  '支持多页PDF，可选择只签当前页或应用到每一页。'
]

// Signature Canvas Logic
const startDrawing = (e: MouseEvent | TouchEvent) => {
  isDrawing.value = true
  isEmptySignature.value = false
  if (!ctx.value) return
  ctx.value.beginPath()
  const { offsetX, offsetY } = getCoordinates(e)
  ctx.value.moveTo(offsetX, offsetY)
}

const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !ctx.value) return
  const { offsetX, offsetY } = getCoordinates(e)
  ctx.value.lineTo(offsetX, offsetY)
  ctx.value.stroke()
}

const stopDrawing = () => {
  isDrawing.value = false
}

const getCoordinates = (e: MouseEvent | TouchEvent) => {
  if (!signatureCanvas.value) return { offsetX: 0, offsetY: 0 }
  const rect = signatureCanvas.value.getBoundingClientRect()
  if (e instanceof MouseEvent) {
    return { offsetX: e.offsetX, offsetY: e.offsetY }
  } else {
    const touch = e.touches[0]
    return { offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top }
  }
}

const clearSignature = () => {
  if (!ctx.value || !signatureCanvas.value) return
  ctx.value.clearRect(0, 0, signatureCanvas.value.width, signatureCanvas.value.height)
  isEmptySignature.value = true
  signatureImage.value = null
}

const confirmSignature = () => {
  if (!signatureCanvas.value) return
  signatureImage.value = signatureCanvas.value.toDataURL('image/png')
  // Reset position to center or sensible default
  if (pdfViewportWidth.value > 0) {
     signaturePos.x = (pdfViewportWidth.value - signatureSize.width) / 2
     signaturePos.y = (pdfViewportHeight.value - signatureSize.height) / 2
  } else {
     signaturePos.x = 50
     signaturePos.y = 50
  }
}

// PDF Handling
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles && droppedFiles.length > 0) {
    const droppedFile = droppedFiles[0]
    if (droppedFile.type === 'application/pdf') {
      loadPdf(droppedFile)
    } else {
      ElMessage.error('请上传PDF文件')
    }
  }
}

const handleFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    loadPdf(target.files[0])
  }
}

const loadPdf = async (f: File) => {
  file.value = f
  const arrayBuffer = await f.arrayBuffer()

  pdfDocProxy.value = await pdfjsLib.getDocument(arrayBuffer).promise
  totalPages.value = pdfDocProxy.value.numPages
  currentPage.value = 1
  await renderPage(1)

  // Init signature canvas context
  nextTick(() => {
    if (signatureCanvas.value) {
      ctx.value = signatureCanvas.value.getContext('2d')
      if (ctx.value) {
        ctx.value.lineWidth = 3
        ctx.value.lineCap = 'round'
        ctx.value.lineJoin = 'round'
        ctx.value.strokeStyle = '#000'
      }
    }
  })
}

const renderPage = async (num: number) => {
  if (!pdfDocProxy.value || !pdfCanvas.value) return
  const page = await pdfDocProxy.value.getPage(num)

  // Determine scale to fit width (max 800px)
  const unscaledViewport = page.getViewport({ scale: 1 })
  const maxWidth = 800
  scale.value = unscaledViewport.width > maxWidth ? maxWidth / unscaledViewport.width : 1

  const viewport = page.getViewport({ scale: scale.value })
  pdfCanvas.value.width = viewport.width
  pdfCanvas.value.height = viewport.height
  pdfViewportWidth.value = viewport.width
  pdfViewportHeight.value = viewport.height

  const renderContext = {
    canvasContext: pdfCanvas.value.getContext('2d')!,
    viewport: viewport
  }
  await page.render(renderContext).promise
}

const changePage = (delta: number) => {
  const newPage = currentPage.value + delta
  if (newPage >= 1 && newPage <= totalPages.value) {
    currentPage.value = newPage
    renderPage(newPage)
  }
}

const clearFile = () => {
  file.value = null
  pdfDocProxy.value = null
  signatureImage.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// Dragging Signature Logic
const startDragSignature = (e: MouseEvent | TouchEvent) => {
  isDraggingSignature.value = true
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
  dragStart.x = clientX
  dragStart.y = clientY
  initialPos.x = signaturePos.x
  initialPos.y = signaturePos.y

  document.addEventListener('mousemove', onDragSignature)
  document.addEventListener('touchmove', onDragSignature)
  document.addEventListener('mouseup', stopDragSignature)
  document.addEventListener('touchend', stopDragSignature)
}

const onDragSignature = (e: MouseEvent | TouchEvent) => {
  if (!isDraggingSignature.value) return
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
  const dx = clientX - dragStart.x
  const dy = clientY - dragStart.y
  
  // Boundary checks
  let newX = initialPos.x + dx
  let newY = initialPos.y + dy
  
  newX = Math.max(0, Math.min(newX, pdfViewportWidth.value - signatureSize.width))
  newY = Math.max(0, Math.min(newY, pdfViewportHeight.value - signatureSize.height))

  signaturePos.x = newX
  signaturePos.y = newY
}

const stopDragSignature = () => {
  isDraggingSignature.value = false
  document.removeEventListener('mousemove', onDragSignature)
  document.removeEventListener('touchmove', onDragSignature)
  document.removeEventListener('mouseup', stopDragSignature)
  document.removeEventListener('touchend', stopDragSignature)
}

// Resizing Signature Logic
const startResizeSignature = (e: MouseEvent | TouchEvent) => {
  isResizingSignature.value = true
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
  dragStart.x = clientX
  dragStart.y = clientY
  initialSize.width = signatureSize.width
  initialSize.height = signatureSize.height

  document.addEventListener('mousemove', onResizeSignature)
  document.addEventListener('touchmove', onResizeSignature)
  document.addEventListener('mouseup', stopResizeSignature)
  document.addEventListener('touchend', stopResizeSignature)
}

const onResizeSignature = (e: MouseEvent | TouchEvent) => {
  if (!isResizingSignature.value) return
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
  const dx = clientX - dragStart.x
  const dy = clientY - dragStart.y
  
  // Limit min size
  signatureSize.width = Math.max(50, initialSize.width + dx)
  signatureSize.height = Math.max(25, initialSize.height + dy)
}

const stopResizeSignature = () => {
  isResizingSignature.value = false
  document.removeEventListener('mousemove', onResizeSignature)
  document.removeEventListener('touchmove', onResizeSignature)
  document.removeEventListener('mouseup', stopResizeSignature)
  document.removeEventListener('touchend', stopResizeSignature)
}

// Save Signed PDF
const saveSignedPdf = async () => {
  if (!file.value || !signatureImage.value) return
  processing.value = true

  try {
    const arrayBuffer = await file.value.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pages = pdfDoc.getPages()

    // Embed signature image
    const signatureImageBytes = await fetch(signatureImage.value).then(res => res.arrayBuffer())
    const embeddedImage = await pdfDoc.embedPng(signatureImageBytes)

    const targetPages = applyToAllPages.value ? pages : [pages[currentPage.value - 1]]

    for (const page of targetPages) {
      const { width, height } = page.getSize()
      // Current logic:
      // pdf_x = canvas_x / scale
      // pdf_y = height - (canvas_y + canvas_h) / scale
      // Wait, is pdf-lib y from bottom? Yes.
      // Canvas y is from top.
      // So if canvas y is 0 (top), pdf y should be near height.
      // Correct.
      
      const x = signaturePos.x / scale.value
      const w = signatureSize.width / scale.value
      const h = signatureSize.height / scale.value
      const y = height - (signaturePos.y / scale.value) - h

      page.drawImage(embeddedImage, {
        x,
        y,
        width: w,
        height: h,
      })
    }

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `signed_${file.value.name}`
    link.click()
    URL.revokeObjectURL(url)
    ElMessage.success('签名添加成功')

  } catch (error) {
    console.error(error)
    ElMessage.error('生成PDF失败')
  } finally {
    processing.value = false
  }
}

onUnmounted(() => {
  // Clean up listeners if any left
  document.removeEventListener('mousemove', onDragSignature)
  document.removeEventListener('touchmove', onDragSignature)
  document.removeEventListener('mouseup', stopDragSignature)
  document.removeEventListener('touchend', stopDragSignature)
  document.removeEventListener('mousemove', onResizeSignature)
  document.removeEventListener('touchmove', onResizeSignature)
  document.removeEventListener('mouseup', stopResizeSignature)
  document.removeEventListener('touchend', stopResizeSignature)
})
</script>
