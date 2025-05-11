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

        <!-- 上传区域 -->
        <div v-if="!currentFile">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽PDF文件到这里</div>
              <p class="text-xs text-gray-400">单个文件最大 200MB</p>
              <p class="text-xs text-gray-400 mt-1">支持 PDF 格式</p>
            </div>
          </div>
        </div>

        <!-- PDF页面预览和操作区域 -->
        <div v-if="currentFile && pdfPages.length > 0" class="mt-6">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-4">
              <h2 class="text-lg font-medium">已选择的页面</h2>
              <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                共 {{ pdfPages.length }} 页，已标记删除 {{ pdfPages.filter(p => p.deleted).length }} 页
              </span>
            </div>
            <div class="flex space-x-3">
              <button @click="rotateSelectedPages(-90)" :disabled="!hasSelectedPages"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                逆时针旋转
              </button>
              <button @click="rotateSelectedPages(90)" :disabled="!hasSelectedPages"
                class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9" />
                </svg>
                顺时针旋转
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
              <button @click="savePDF" :disabled="saving"
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
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" handle=".drag-handle"
            @start="drag = true" @end="drag = false">
            <template #item="{ element }">
              <div class="relative group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                :class="{
                  'ring-2 ring-blue-500': element.selected,
                  'opacity-50': element.deleted
                }">
                <!-- 页面预览 -->
                <div class="relative aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden">
                  <canvas :ref="el => setCanvasRef(el, element.pageIndex)" class="w-full h-full object-contain"
                    :style="{ transform: `rotate(${element.rotation}deg)` }"></canvas>

                  <!-- 删除标记和操作按钮 -->
                  <div v-if="element.deleted"
                    class="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
                    <span class="text-white font-medium mb-3">已标记删除</span>
                    <button
                      class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-full shadow-sm transition-colors"
                      @click.stop="restoreDeletedPage(element)">
                      恢复页面
                    </button>
                  </div>

                  <!-- 悬浮操作按钮 -->
                  <div v-else
                    class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                    <button
                      class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-full shadow-sm transition-colors"
                      @click.stop="deleteSelectedPage(element)">
                      标记删除
                    </button>
                  </div>

                  <!-- 拖拽手柄 -->
                  <div
                    class="drag-handle absolute top-2 left-2 cursor-move p-1.5 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                    </svg>
                  </div>

                  <!-- 选择框 -->
                  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click.stop="togglePageSelection(element)">
                    <div
                      class="w-6 h-6 rounded-lg border-2 flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-all"
                      :class="element.selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'">
                      <svg v-if="element.selected" class="w-4 h-4 text-white" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
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
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { PDFDocument } from 'pdf-lib'
import draggable from 'vuedraggable'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import { formatFileSize } from '@/utils/file'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = reactive({
  title: "免费在线删除PDF页面工具",
  subtitle: "选择删除PDF中的页面，可同时修改页面顺序、旋转页面，本地处理更安全"
})

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

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const currentFile = ref<File | null>(null)
const pdfDoc = ref<any>(null)
const pdfPages = ref<any[]>([])
const saving = ref(false)
const drag = ref(false)
const canvasRefs = ref<Map<number, HTMLCanvasElement>>(new Map())

// 计算属性：是否有选中的页面
const hasSelectedPages = computed(() => {
  return pdfPages.value.some(page => page.selected)
})

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件拖放
const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (!droppedFiles || droppedFiles.length === 0) return

  const file = droppedFiles[0]
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    await handleFile(file)
  } else {
    ElMessage.error('请选择PDF文件')
  }
}

// 处理文件选择
const handleFileInputChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  await handleFile(file)

  // 清空input值，允许重复选择同一文件
  input.value = ''
}

// 初始化页面数据
const initializePages = (pageCount: number) => {
  return Array.from({ length: pageCount }, (_, i) => ({
    pageIndex: i,
    selected: false,
    rotation: 0,
    deleted: false
  }))
}

// 处理文件
const handleFile = async (file: File) => {
  if (file.size > 200 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过200MB')
    return
  }

  try {
    currentFile.value = file
    const arrayBuffer = await file.arrayBuffer()
    pdfDoc.value = await PDFDocument.load(arrayBuffer)

    // 初始化页面数据
    pdfPages.value = initializePages(pdfDoc.value.getPageCount())

    // 等待DOM更新后再渲染预览
    await nextTick()
    await renderPagePreviews()
  } catch (error) {
    console.error('加载PDF文件失败:', error)
    ElMessage.error('加载PDF文件失败，请重试')
  }
}

// 渲染页面预览
const renderPagePreviews = async () => {
  if (!pdfDoc.value) return

  try {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    const pdfBytes = await pdfDoc.value.save()
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise

    // 使用Promise.all并行渲染所有页面
    const renderPromises = Array.from({ length: pdf.numPages }, async (_, i) => {
      const canvas = canvasRefs.value.get(i)
      if (!canvas) return

      const page = await pdf.getPage(i + 1)
      const viewport = page.getViewport({ scale: 0.5 })
      canvas.width = viewport.width
      canvas.height = viewport.height

      return page.render({
        canvasContext: canvas.getContext('2d')!,
        viewport
      }).promise
    })

    await Promise.all(renderPromises)
  } catch (error) {
    console.error('渲染页面预览失败:', error)
  }
}

// 设置canvas引用
const setCanvasRef = (el: any, pageIndex: number) => {
  if (el) {
    canvasRefs.value.set(pageIndex, el)
    renderPage(pageIndex)
  }
}

// 渲染单个页面
const renderPage = async (pageIndex: number) => {
  if (!pdfDoc.value || !canvasRefs.value.has(pageIndex)) return

  try {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    const pdfBytes = await pdfDoc.value.save()
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise
    const page = await pdf.getPage(pageIndex + 1)
    const canvas = canvasRefs.value.get(pageIndex)
    if (!canvas) return

    const viewport = page.getViewport({ scale: 0.5 })
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: canvas.getContext('2d')!,
      viewport
    }).promise
  } catch (error) {
    console.error('渲染页面失败:', error)
  }
}

// 切换页面选择状态
const togglePageSelection = (page: any) => {
  page.selected = !page.selected
}

// 删除单个页面
const deleteSelectedPage = (page: any) => {
  page.deleted = true
  page.selected = false
  ElMessage.success('已标记删除该页面')
}

// 恢复单个页面
const restoreDeletedPage = (page: any) => {
  page.deleted = false
  ElMessage.success('已恢复该页面')
}

// 批量删除选中页面（保留此方法用于快捷键等功能）
const deleteSelectedPages = () => {
  const selectedPages = pdfPages.value.filter(page => page.selected)
  if (selectedPages.length === 0) return

  selectedPages.forEach(page => {
    page.deleted = true
    page.selected = false
  })

  ElMessage.success('标记删除成功，可以继续编辑或保存')
}

// 批量恢复删除的页面（保留此方法用于快捷键等功能）
const restoreDeletedPages = () => {
  const deletedPages = pdfPages.value.filter(page => page.deleted)
  if (deletedPages.length === 0) return

  deletedPages.forEach(page => {
    page.deleted = false
  })

  ElMessage.success('已恢复删除的页面')
}

// 旋转选中的页面
const rotateSelectedPages = async (angle: number) => {
  const selectedPages = pdfPages.value.filter(page => page.selected)
  if (selectedPages.length === 0) return

  try {
    // 批量更新旋转状态
    selectedPages.forEach(page => {
      page.rotation = (page.rotation + angle + 360) % 360
    })

    // 重新渲染受影响的页面
    const renderPromises = selectedPages.map(page => renderPage(page.pageIndex))
    await Promise.all(renderPromises)
  } catch (error) {
    console.error('旋转页面失败:', error)
    ElMessage.error('旋转页面失败，请重试')
  }
}

// 保存PDF
const savePDF = async () => {
  if (!pdfDoc.value || pdfPages.value.length === 0) return

  try {
    saving.value = true
    const newPdf = await PDFDocument.create()

    // 只复制未删除的页面
    const remainingPages = pdfPages.value.filter(page => !page.deleted)
    const copyPromises = remainingPages.map(async (page) => {
      const [copiedPage] = await newPdf.copyPages(pdfDoc.value, [page.pageIndex])
      if (page.rotation !== 0) {
        copiedPage.setRotation(page.rotation)
      }
      newPdf.addPage(copiedPage)
    })

    await Promise.all(copyPromises)

    const pdfBytes = await newPdf.save()
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const fileName = currentFile.value?.name.replace('.pdf', '') || 'document'
    link.href = url
    link.download = `${fileName}_edited.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('PDF保存成功')
  } catch (error) {
    console.error('保存PDF失败:', error)
    ElMessage.error('保存PDF失败，请重试')
  } finally {
    saving.value = false
  }
}

// 清除文件
const clearFile = () => {
  currentFile.value = null
  pdfPages.value = []
  Object.values(canvasRefs.value).forEach(canvas => {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  })
  canvasRefs.value = new Map()
}

// 清理资源
onUnmounted(() => {
  if (pdfDoc.value) {
    pdfDoc.value = null
  }
})
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
