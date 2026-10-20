<!--
 * @file PdfDelete.vue
 * @description PDF页面删除工具组件，支持删除页面、调整顺序、旋转页面等功能
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-30
 * @license MIT
-->

<template>
  <div class="min-h-screen pdf-workspace">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm pdf-workspace-panel">
        <!-- 标题区域 -->
        <div class="text-center mb-8 relative">
          <h1 class="pdf-workspace-title text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12 pdf-workspace-title-inner">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ $ensureFreeToolTitle(info.title) }}</span>
            </div>
          </h1>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <!-- 上传区域 -->
        <div v-if="!currentFile">
          <div
            class="pdf-upload-area relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" aria-label="选择 PDF 文件" accept=".pdf,application/pdf"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileInputChange" />

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽PDF文件到这里</div>
              <p class="text-xs text-gray-400">单个文件最大 {{ maxFileSizeMB }}MB</p>
              <p class="text-xs text-gray-400 mt-1">支持 PDF 格式</p>
            </div>
          </div>
        </div>

        <p v-if="loading" role="status" class="mt-4 text-sm text-gray-500">正在加载 PDF 页面预览...</p>
        <button v-if="loading" class="mt-2 text-sm text-blue-600" @click="clearFile">取消加载</button>

        <!-- PDF页面预览和操作区域 -->
        <div v-if="currentFile && pdfPages.length > 0" class="mt-6">
          <div class="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 mb-4 pdf-file-summary">
            <div class="flex flex-wrap items-center gap-3 min-w-0">
              <span class="text-sm font-medium text-gray-700 truncate pdf-file-name">{{ currentFile.name }}</span>
              <span class="text-xs text-gray-500">{{ formatFileSize(currentFile.size) }}</span>
            </div>
            <span class="text-xs text-gray-500">共 {{ pdfPages.length }} 页</span>
          </div>
          <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
            <div class="flex flex-wrap items-center gap-4">
              <h2 class="text-lg font-medium">已选择的页面</h2>
              <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                共 {{ pdfPages.length }} 页，已标记删除 {{pdfPages.filter(p => p.deleted).length}} 页
              </span>
            </div>
            <div class="flex flex-wrap gap-2 pdf-actions">
              <button @click="rotateSelectedPages(-90)" :disabled="!hasSelectedPages || saving || loading"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                逆时针旋转
              </button>
              <button @click="rotateSelectedPages(90)" :disabled="!hasSelectedPages || saving || loading"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9" />
                </svg>
                顺时针旋转
              </button>

              <div class="flex-1"></div>

              <button @click="clearFile" :disabled="saving"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                清除文件
              </button>
              <button @click="savePDF" :disabled="saving || loading"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {{ saving ? '保存中...' : '保存PDF' }}
              </button>
            </div>
          </div>

          <!-- 页面网格 -->
          <draggable v-model="pdfPages" item-key="pageIndex"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pdf-page-grid" handle=".drag-handle"
            :disabled="saving || loading" @start="drag = true" @end="drag = false">
            <template #item="{ element }">
              <div class="relative group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all" :data-source-page="element.pageIndex + 1"
                :class="{
                  'ring-2 ring-blue-500': element.selected,
                  'opacity-50': element.deleted
                }">
                <!-- 页面预览 -->
                <div class="relative aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden">
                  <canvas :ref="el => setCanvasRef(el, element.pageIndex)" :aria-label="`源 PDF 第 ${element.pageIndex + 1} 页预览`" class="w-full h-full object-contain"></canvas>

                  <!-- 删除标记和操作按钮 -->
                  <div v-if="element.deleted"
                    class="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                    <span class="text-white font-medium mb-3">已标记删除</span>
                    <button
                      :aria-label="`恢复源第 ${element.pageIndex + 1} 页`"
                      class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-full shadow-sm transition-colors"
                      :disabled="saving || loading" @click.stop="restoreDeletedPage(element)">
                      恢复页面
                    </button>
                  </div>

                  <!-- 悬浮操作按钮 -->
                  <div v-else
                    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus-within:opacity-100 pdf-page-delete-action">
                    <button
                      :aria-label="`标记删除源第 ${element.pageIndex + 1} 页`"
                      class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-full shadow-sm transition-colors"
                      :disabled="saving || loading" @click.stop="deleteSelectedPage(element)">
                      标记删除
                    </button>
                  </div>

                  <!-- 拖拽手柄 -->
                  <div
                    class="drag-handle absolute top-2 left-2 cursor-move p-1.5 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pdf-page-drag-handle">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                    </svg>
                  </div>

                  <!-- 选择框 -->
                  <button type="button" role="checkbox" :aria-checked="element.selected" :aria-label="`选择源第 ${element.pageIndex + 1} 页`"
                    :disabled="saving || loading" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity pdf-page-selection"
                    @click.stop="togglePageSelection(element)">
                    <div
                      class="w-6 h-6 rounded-lg border-2 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all"
                      :class="element.selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'">
                      <svg v-if="element.selected" class="w-4 h-4 text-white" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </button>
                </div>

                <!-- 页面信息 -->
                <div class="mt-3 text-center">
                  <span class="text-sm font-medium text-gray-700">第 {{ element.pageIndex + 1 }} 页</span>
                  <span v-if="element.deleted" class="text-xs text-red-500 ml-1">(已标记删除)</span>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm pdf-workspace-panel">
        <!-- 功能特点 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div v-for="feature in features" :key="feature.title" class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path v-if="feature.icon === 'Delete'" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                <path v-else-if="feature.icon === 'Sort'" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                <path v-else-if="feature.icon === 'Rotate'" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                <path v-else-if="feature.icon === 'Lock'" stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4" />
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

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />

      <!-- 使用说明 -->
      <UsageGuide :steps="guideSteps" :notes="guideNotes" />
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/components/Tools/PdfCompress/pdfWorkspaceResponsive.css'
import { ref, shallowRef, reactive, computed, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'
import { formatFileSize } from '@/utils/file'
import { getPdfFileError, ensurePdfjsRuntime, ensurePdfLibRuntime } from '@/utils/pdf'
import { cancelPdfPagePreview, getPdfPageRotation, renderPdfPagePreview } from '@/utils/pdfPagePreview'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { PDFDocument as PdfDocument } from 'pdf-lib'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()

const info = reactive({
  title: "PDF页面删除",
  subtitle: "选择删除PDF中的页面，可同时修改页面顺序、旋转页面，本地处理更安全"
})

const maxFileSizeMB = 200
const guideSteps = [
  { title: '上传PDF文件', description: `点击上传区域或直接拖拽PDF文件到指定区域，文件大小限制为${maxFileSizeMB}MB。` },
  { title: '选择页面', description: '鼠标悬停在页面预览图上，点击“标记删除”按钮即可删除该页面。您也可以拖拽调整页面顺序。' },
  { title: '保存并下载', description: '完成编辑后，点击“保存PDF”按钮，系统将自动生成并下载新的PDF文件。' }
]

const guideNotes = [
  '删除的页面在保存前可以点击“恢复页面”撤销删除。',
  '支持批量旋转页面，方便调整文档方向。',
  '所有文件处理均在本地浏览器完成，不会上传到服务器，确保您的文件安全。'
]

// 功能特点
const features = [
  {
    icon: 'Delete',
    title: '删除页面',
    desc: '轻松选择并删除PDF文档中的任意页面，支持批量删除操作'
  },
  {
    icon: 'Sort',
    title: '调整顺序',
    desc: '通过拖拽操作调整PDF页面顺序，快速重新组织文档内容'
  },
  {
    icon: 'Rotate',
    title: '旋转页面',
    desc: '支持90度旋转页面方向，可单个或批量旋转选中页面'
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
    question: '这款PDF页面删除工具是否免费？',
    answer: '是的，我们的PDF页面删除工具完全免费使用，并且没有使用次数限制。我们致力于为用户提供高质量的在线工具服务。'
  },
  {
    question: '使用这款在线PDF页面删除工具是否有数据泄露风险？',
    answer: '完全不用担心这个问题，我们的PDF页面删除工具采用了浏览器端处理技术，您的文件无需上传至云端服务器，在本地即可完成PDF页面删除。'
  }
]

interface EditablePage {
  pageIndex: number
  selected: boolean
  rotation: number
  deleted: boolean
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const currentFile = ref<File | null>(null)
const pdfDoc = shallowRef<PdfDocument | null>(null)
const pdfPages = ref<EditablePage[]>([])
const saving = ref(false)
const loading = ref(false)
const drag = ref(false)
const canvasRefs = new Map<number, HTMLCanvasElement>()
let previewDocument: PDFDocumentProxy | null = null
let documentVersion = 0

const hasSelectedPages = computed(() => pdfPages.value.some(page => page.selected && !page.deleted))

/** 从拖放事件加载首个文件，保存期间不更换编辑中的文档。 */
const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file && !saving.value) await handleFile(file)
}

/** 读取文件选择结果并清空 input，以便再次选择同一文件。 */
const handleFileInputChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file && !saving.value) await handleFile(file)
}

/** 取消现有画布渲染并释放预览文档，使旧文件的异步结果失效。 */
const releasePreview = () => {
  documentVersion += 1
  canvasRefs.forEach(canvas => cancelPdfPagePreview(canvas))
  canvasRefs.clear()
  const previous = previewDocument
  previewDocument = null
  pdfDoc.value = null
  void previous?.destroy().catch(error => console.error('释放 PDF 预览失败:', error))
}

/** 一次加载编辑文档与预览文档，源页索引始终随页面保留，不随拖拽顺序改变。 */
const handleFile = async (file: File) => {
  if (saving.value) return
  const error = getPdfFileError(file, maxFileSizeMB)
  if (error) { ElMessage.error(error); return }
  releasePreview()
  const version = documentVersion
  currentFile.value = file
  pdfPages.value = []
  loading.value = true
  try {
    const bytes = await file.arrayBuffer()
    const { PDFDocument } = await ensurePdfLibRuntime()
    const source = await PDFDocument.load(bytes.slice(0))
    const pdfjs = await ensurePdfjsRuntime()
    if (version !== documentVersion) return
    const preview = await pdfjs.getDocument({ data: bytes }).promise
    if (version !== documentVersion) { await preview.destroy(); return }
    pdfDoc.value = source
    previewDocument = preview
    pdfPages.value = Array.from({ length: source.getPageCount() }, (_, pageIndex) => ({
      pageIndex, selected: false, rotation: 0, deleted: false,
    }))
    await nextTick()
    await renderPagePreviews()
  } catch (error) {
    if (version !== documentVersion) return
    console.error('加载PDF文件失败:', error)
    ElMessage.error('加载PDF文件失败，请重试')
    clearFile()
  } finally {
    if (version === documentVersion) loading.value = false
  }
}

/** 仅记录源页面的画布引用，避免 Vue 重排时重复打开 PDF 及并发争用画布。 */
const setCanvasRef = (element: unknown, pageIndex: number) => {
  if (element instanceof HTMLCanvasElement) canvasRefs.set(pageIndex, element)
  else canvasRefs.delete(pageIndex)
}

/** 从源页面角度叠加用户旋转增量绘制；使用渲染版本隔离旧任务。 */
const renderPagePreviews = async (selected = pdfPages.value) => {
  const pdf = previewDocument
  const version = documentVersion
  if (!pdf) return
  const snapshot = selected.map(({ pageIndex, rotation }) => ({ pageIndex, rotation }))
  try {
    await Promise.all(snapshot.map(async ({ pageIndex, rotation }) => {
      const canvas = canvasRefs.get(pageIndex)
      if (canvas) await renderPdfPagePreview(pdf, pageIndex, rotation, canvas, () => version === documentVersion)
    }))
  } catch (error) {
    if (version !== documentVersion) return
    console.error('渲染页面预览失败:', error)
    ElMessage.error('PDF预览加载失败，请重试')
  }
}

/** 切换未删除页面的选择状态。 */
const togglePageSelection = (page: EditablePage) => {
  if (!saving.value && !loading.value && !page.deleted) page.selected = !page.selected
}

/** 标记删除指定页面，同时取消选择，保存前仍可恢复。 */
const deleteSelectedPage = (page: EditablePage) => {
  if (saving.value || loading.value) return
  page.deleted = true
  page.selected = false
  ElMessage.success('已标记删除该页面')
}

/** 恢复已标记删除的页面，不改变它的源页索引或旋转增量。 */
const restoreDeletedPage = (page: EditablePage) => {
  if (saving.value || loading.value) return
  page.deleted = false
  ElMessage.success('已恢复该页面')
}

/** 旋转已选择且保留的页面，预览和导出共享同一套叠加角度语义。 */
const rotateSelectedPages = async (angle: number) => {
  if (saving.value || loading.value) return
  const selected = pdfPages.value.filter(page => page.selected && !page.deleted)
  selected.forEach(page => { page.rotation = getPdfPageRotation(page.rotation, angle) })
  await renderPagePreviews(selected)
}

/** 在异步操作前快照保留页和旋转量，串行复制保证导出顺序与用户排列一致。 */
const savePDF = async () => {
  if (!pdfDoc.value || !currentFile.value || saving.value || loading.value) return
  const source = pdfDoc.value
  const file = currentFile.value
  const snapshot = pdfPages.value.filter(page => !page.deleted).map(({ pageIndex, rotation }) => ({ pageIndex, rotation }))
  if (!snapshot.length) { ElMessage.warning('请至少保留一页后再保存'); return }
  saving.value = true
  try {
    const { PDFDocument, degrees } = await ensurePdfLibRuntime()
    const newPdf = await PDFDocument.create()
    for (const { pageIndex, rotation } of snapshot) {
      const [page] = await newPdf.copyPages(source, [pageIndex])
      page.setRotation(degrees(getPdfPageRotation(page.getRotation().angle, rotation)))
      newPdf.addPage(page)
    }
    const bytes = await newPdf.save()
    const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${file.name.replace(/\.pdf$/i, '')}_edited.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    ElMessage.success('PDF保存成功')
  } catch (error) {
    console.error('保存PDF失败:', error)
    ElMessage.error('保存PDF失败，请重试')
  } finally {
    saving.value = false
  }
}

/** 清空当前编辑文档并取消尚未完成的加载与预览。 */
const clearFile = () => {
  if (saving.value) return
  releasePreview()
  currentFile.value = null
  pdfPages.value = []
  loading.value = false
}

onUnmounted(releasePreview)
</script>

<style scoped>
.pdf-preview-dialog :deep(.el-dialog__body) {
  padding: 16px;
}

/* 拖拽时的样式 */
.sortable-drag {
  opacity: 0.5;
  background: #e5e7eb;
}

.sortable-ghost {
  opacity: 0.5;
  background: #dbeafe;
}
</style>
