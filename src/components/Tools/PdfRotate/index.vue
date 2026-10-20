<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.27
 */
-->

<template>
  <div class="min-h-screen pdf-workspace">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm pdf-workspace-panel">
        <!-- 标题区域 -->
        <div class="text-center mb-8">
          <h1 class="pdf-workspace-title text-4xl font-bold mb-3 text-gray-800">{{ $ensureFreeToolTitle(info.title) }}</h1>
          <p class="text-gray-500 text-sm">{{ info.subtitle }}</p>
        </div>

        <!-- 上传区域 -->
        <FileUploadZone
          v-if="!currentFile"
          title="点击或拖拽 PDF 文件到这里"
          aria-label="选择 PDF 文件"
          accept=".pdf,application/pdf"
          description="本地处理，不上传文件"
          :hint="`支持 PDF 格式 · 单个文件最大 ${maxFileSizeMB}MB`"
          :disabled="processing"
          @files="handleFiles"
        />

        <!-- 文件预览和操作区域 -->
        <div v-if="currentFile" class="mt-6">
          <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-4 pdf-file-summary">
            <div class="flex flex-wrap items-center gap-3 min-w-0">
              <span class="text-sm font-medium text-gray-700 truncate pdf-file-name">{{ currentFile.name }}</span>
              <span class="text-xs text-gray-500">{{ formatFileSize(currentFile.size) }}</span>
            </div>
            <span class="text-xs text-gray-500">共 {{ pageCount }} 页</span>
          </div>
          <!-- 操作按钮 -->
          <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div class="flex flex-wrap items-center gap-4">
              <h2 class="text-lg font-medium">已选择的页面</h2>
              <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                共 {{ pageCount }} 页，已旋转 {{ rotatedPages }} 页
              </span>
            </div>
            <div class="flex flex-wrap gap-2 pdf-actions">
              <button @click="rotateAll(-90)" :disabled="processing || loading"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                逆时针旋转 90°
              </button>
              <button @click="resetRotation" :disabled="processing || loading"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重置
              </button>
              <button @click="rotateAll(90)" :disabled="processing || loading"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9" />
                </svg>
                顺时针旋转 90°
              </button>

              <div class="flex-1"></div>

              <button @click="clearFile" :disabled="processing"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                清除文件
              </button>
              <button @click="savePDF" :disabled="processing || loading || !pages.length"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {{ processing ? '处理中...' : '保存并下载' }}
              </button>
            </div>
          </div>

          <p v-if="loading" role="status" class="mb-4 text-sm text-gray-500">正在加载 PDF 页面预览...</p>

          <!-- 页面网格 -->
          <VueDraggable v-model="pages" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 pdf-page-grid" :item-key="'id'"
            :animation="300" :disabled="processing || loading">
            <template #item="{ element, index }">
              <div class="relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all group" :data-source-page="element.id + 1">
                <!-- 页面预览 -->
                <div class="relative aspect-[1/1.414] bg-gray-50 rounded-lg overflow-hidden cursor-move">
                  <canvas :ref="(el) => setCanvasRef(el, element.id)"
                    :aria-label="`源 PDF 第 ${element.id + 1} 页预览`"
                    class="w-full h-full object-contain"></canvas>
                  <div class="absolute inset-0 flex items-center justify-center text-gray-500 text-sm font-medium">
                    源第 {{ element.id + 1 }} 页
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity pdf-page-actions">
                  <button @click="rotatePage(index, -90)" :disabled="processing || loading"
                    :aria-label="`将源第 ${element.id + 1} 页逆时针旋转 90°`"
                    class="p-2 rounded-lg bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
                    title="逆时针旋转">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button @click="rotatePage(index, 90)" :disabled="processing || loading"
                    :aria-label="`将源第 ${element.id + 1} 页顺时针旋转 90°`"
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
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm pdf-workspace-panel">
        <!-- 功能特点 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div v-for="feature in features" :key="feature.title" class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-brand mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
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
import '@/components/Tools/PdfCompress/pdfWorkspaceResponsive.css'
import { ref, reactive, computed, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { formatFileSize } from '@/utils/file'
import VueDraggable from 'vuedraggable'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'
import FileUploadZone from '@/components/Common/FileUploadZone.vue'
import { getPdfFileError, ensurePdfjsRuntime, ensurePdfLibRuntime } from '@/utils/pdf'
import { cancelPdfPagePreview, getPdfPageRotation, renderPdfPagePreview } from '@/utils/pdfPagePreview'
import type { PDFDocumentProxy } from 'pdfjs-dist'

const route = useRoute()

interface Page {
  /** 不随拖拽顺序变化的源 PDF 零基页索引。 */
  id: number
  /** 用户相对源页面的旋转增量。 */
  rotation: number
}

const info = reactive({
  title: "PDF页面旋转",
  subtitle: "可批量旋转、单独旋转页面，同时可调整页面顺序、删除页面"
})

const maxFileSizeMB = 200
const guideSteps = [
  { title: '上传PDF文件', description: `点击上传区域或直接拖拽PDF文件到指定区域，文件大小限制为${maxFileSizeMB}MB。` },
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
const loading = ref(false)
const pageCanvases = new Map<number, HTMLCanvasElement>()
let previewDocument: PDFDocumentProxy | null = null
let documentVersion = 0

const rotatedPages = computed(() => pages.value.filter(page => page.rotation !== 0).length)

/** 按源页面 ID 保存画布引用，拖拽后不因列表位置改变关联。 */
const setCanvasRef = (element: unknown, id: number) => {
  if (element instanceof HTMLCanvasElement) pageCanvases.set(id, element)
  else pageCanvases.delete(id)
}

/** 接收公共上传区交付的首个文件，格式、大小及文档生命周期仍由本工具管理。 */
const handleFiles = (files: File[]) => {
  if (files[0] && !processing.value) void handleFile(files[0])
}

/** 取消旧预览并释放文档，使清除、换文件及离开页面后的异步结果失效。 */
const releasePreview = () => {
  documentVersion += 1
  pageCanvases.forEach(canvas => cancelPdfPagePreview(canvas))
  pageCanvases.clear()
  const previous = previewDocument
  previewDocument = null
  void previous?.destroy().catch(error => console.error('释放 PDF 预览失败:', error))
}

/** 打开 PDF 并按源页面创建稳定标识，DOM 就绪后绘制原始方向的预览。 */
const handleFile = async (file: File) => {
  if (processing.value) return
  const error = getPdfFileError(file, maxFileSizeMB)
  if (error) { ElMessage.error(error); return }
  releasePreview()
  const version = documentVersion
  currentFile.value = file
  pages.value = []
  pageCount.value = 0
  loading.value = true
  try {
    const bytes = await file.arrayBuffer()
    const pdfjs = await ensurePdfjsRuntime()
    if (version !== documentVersion) return
    const pdf = await pdfjs.getDocument({ data: bytes }).promise
    if (version !== documentVersion) { await pdf.destroy(); return }
    previewDocument = pdf
    pageCount.value = pdf.numPages
    pages.value = Array.from({ length: pdf.numPages }, (_, id) => ({ id, rotation: 0 }))
    await nextTick()
    await renderPages()
  } catch (error) {
    if (version !== documentVersion) return
    console.error('加载PDF失败:', error)
    ElMessage.error('PDF文件加载失败，请确保文件未损坏')
    clearFile()
  } finally {
    if (version === documentVersion) loading.value = false
  }
}

/** 使用源页面及增量的快照渲染预览，过时任务不会覆盖新角度或新文件。 */
const renderPages = async (selected = pages.value) => {
  const pdf = previewDocument
  const version = documentVersion
  if (!pdf) return
  const snapshot = selected.map(({ id, rotation }) => ({ id, rotation }))
  try {
    await Promise.all(snapshot.map(async ({ id, rotation }) => {
      const canvas = pageCanvases.get(id)
      if (canvas) await renderPdfPagePreview(pdf, id, rotation, canvas, () => version === documentVersion)
    }))
  } catch (error) {
    if (version !== documentVersion) return
    console.error('渲染PDF预览失败:', error)
    ElMessage.error('PDF预览加载失败，请重试')
  }
}

/** 旋转当前位置对应的稳定源页面，预览只通过 PDF.js 绘制一次旋转。 */
const rotatePage = async (index: number, angle: number) => {
  if (processing.value || loading.value) return
  const page = pages.value[index]
  if (!page) return
  page.rotation = getPdfPageRotation(page.rotation, angle)
  await renderPages([page])
}

/** 批量更新页面旋转增量，再绘制最新快照。 */
const rotateAll = async (angle: number) => {
  if (processing.value || loading.value) return
  pages.value.forEach(page => { page.rotation = getPdfPageRotation(page.rotation, angle) })
  await renderPages()
}

/** 在首次异步等待前快照文件、源页顺序和角度，按快照顺序串行生成 PDF。 */
const savePDF = async () => {
  if (!currentFile.value || processing.value || loading.value || !pages.value.length) return
  const file = currentFile.value
  const snapshot = pages.value.map(({ id, rotation }) => ({ id, rotation }))
  processing.value = true
  try {
    const { PDFDocument, degrees } = await ensurePdfLibRuntime()
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer())
    const newPdfDoc = await PDFDocument.create()
    for (const { id, rotation } of snapshot) {
      const [page] = await newPdfDoc.copyPages(pdfDoc, [id])
      page.setRotation(degrees(getPdfPageRotation(page.getRotation().angle, rotation)))
      newPdfDoc.addPage(page)
    }
    const bytes = await newPdfDoc.save()
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${file.name.replace(/\.pdf$/i, '')}_旋转.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    ElMessage.success('PDF保存成功')
  } catch (error) {
    console.error('保存PDF失败:', error)
    ElMessage.error('PDF保存失败，请重试')
  } finally {
    processing.value = false
  }
}

/** 清空用户的旋转增量并重绘，保留源 PDF 自身已有的页面方向。 */
const resetRotation = async () => {
  if (processing.value || loading.value) return
  pages.value.forEach(page => { page.rotation = 0 })
  await renderPages()
}

/** 清除当前文件并使未完成的预览任务失效。 */
const clearFile = () => {
  if (processing.value) return
  releasePreview()
  currentFile.value = null
  pages.value = []
  pageCount.value = 0
  loading.value = false
}

onUnmounted(releasePreview)
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
