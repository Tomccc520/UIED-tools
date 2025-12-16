<!--
 * @file PdfMerge.vue
 * @description PDF合并工具组件，支持多个PDF文件合并为一个，可拖拽调整顺序
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-26
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
        <div v-if="files.length === 0">
          <div
            class="relative border-2 border-dashed rounded-xl min-h-[240px] flex flex-col items-center justify-center transition-all duration-300"
            :class="isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'"
            @drop.prevent="handleDrop" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" multiple accept=".pdf,application/pdf"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileInputChange" />

            <div class="text-center px-4">
              <div class="w-16 h-16 mb-4 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-lg font-medium text-gray-700 mb-2">点击或拖拽PDF文件到这里</div>
              <p class="text-sm text-gray-400">请选择 2 至 30 个文件，单个文件最大 500MB</p>
              <p class="text-xs text-gray-400 mt-1">支持 PDF 格式</p>
            </div>
          </div>
        </div>

        <!-- 文件列表和操作按钮 -->
        <template v-if="files.length > 0">
          <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center gap-4">
                <h2 class="text-lg font-medium">已选择的文件</h2>
                <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {{ files.length }} 个文件
                </span>
              </div>
              <button @click="clearFiles" class="text-sm text-gray-500 hover:text-red-500 transition-colors"
                :disabled="merging">
                清空队列
              </button>
            </div>

            <!-- 文件列表 -->
            <draggable v-model="files" item-key="id" @start="drag = true" @end="drag = false" class="space-y-4"
              handle=".drag-handle">
              <template #item="{ element }">
                <div
                  class="relative group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                  :class="{ 'border-2 border-blue-500 shadow-lg': drag }">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <!-- 拖拽手柄 -->
                      <div class="drag-handle cursor-move p-1 hover:bg-gray-100 rounded">
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                        </svg>
                      </div>

                      <div
                        class="w-12 h-16 bg-gray-100 rounded overflow-hidden border border-gray-200 flex-shrink-0 relative">
                        <img v-if="element.thumbnail" :src="element.thumbnail" class="w-full h-full object-contain" />
                        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p class="text-sm text-gray-700 font-medium">{{ element.name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(element.size) }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <!-- 预览按钮 -->
                      <button @click="previewPDF(element)"
                        class="text-gray-400 hover:text-blue-500 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                        :disabled="merging">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <!-- 删除按钮 -->
                      <button @click="removeFile(element)"
                        class="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                        :disabled="merging">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>

            <!-- 合并按钮 -->
            <div class="text-center mt-8">
              <button @click="mergePDFs" :disabled="merging"
                class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                <span class="flex items-center justify-center">
                  <span class="mr-2">{{ merging ? '⚙️' : '✨' }}</span>
                  {{ merging ? '合并中...' : '开始合并' }}
                </span>
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 功能特点 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div v-for="feature in features" :key="feature.title" class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">{{ feature.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 适用场景说明 -->
        <div class="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">适用场景</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">学生：合并课件、笔记和作业，方便整理和提交</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">办公：合并报告、合同和文档，提高工作效率</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">设计：合并设计稿和素材，便于项目展示和存档</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">日常：合并电子票据和文件，方便归档和管理</p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-8 bg-white rounded-lg p-6 border">
          <h2 class="text-lg font-medium text-gray-900 mb-6">常见问题解答</h2>
          <div class="space-y-6">
            <div v-for="faq in faqs" :key="faq.question" class="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <h3 class="text-base font-medium text-gray-800 mb-2">{{ faq.question }}</h3>
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

    <!-- PDF预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="previewFile?.name" width="80%" destroy-on-close
      class="pdf-preview-dialog">
      <div class="w-full h-[70vh]">
        <iframe v-if="previewUrl" :src="previewUrl" class="w-full h-full border-0" type="application/pdf"></iframe>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { PDFDocument } from 'pdf-lib'
import draggable from 'vuedraggable'
import * as pdfjsLib from 'pdfjs-dist'
import { formatFileSize } from '@/utils/file'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

// 设置 PDF.js worker
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const route = useRoute()

const info = reactive({
  title: "免费在线PDF合并工具",
  subtitle: "将多个PDF文件合并为一个，支持拖拽调整顺序，本地处理更安全"
})

const files = ref<File[]>([])
const merging = ref(false)
const uploadRef = ref()
const drag = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const guideSteps = [
  { title: '上传PDF文件', description: '点击上传区域或直接拖拽多个PDF文件到指定区域，支持批量上传。' },
  { title: '调整顺序', description: '通过拖拽文件列表中的项目，调整合并后的页面顺序。' },
  { title: '合并下载', description: '点击“开始合并”按钮，系统将自动合并文件并在处理完成后下载。' }
]

const guideNotes = [
  '所有文件处理均在本地浏览器完成，不会上传到服务器，确保您的文件安全。',
  '合并加密的PDF文件前，请先移除密码。',
  '建议单次合并文件总大小不超过500MB，以免浏览器内存不足。'
]

// 功能特点
const features = [
  {
    icon: 'Upload',
    title: '轻松上传',
    desc: '支持拖拽或点击上传，单次可处理2-30个PDF文件，每个文件最大支持500MB'
  },
  {
    icon: 'Sort',
    title: '灵活排序',
    desc: '通过直观的拖拽操作，轻松调整PDF文件的合并顺序，帮助您快速组织文档'
  },
  {
    icon: 'Lock',
    title: '安全可靠',
    desc: '所有处理都在浏览器本地完成，无需上传服务器，确保您的文件安全和隐私'
  },
  {
    icon: 'Download',
    title: '快速下载',
    desc: '合并完成后立即下载，无需等待，为您省宝贵时间'
  }
]

// 常见问题
const faqs = [
  {
    question: '这款PDF文件合并工具是否免费？',
    answer: '是的，我们的PDF合并工具完全免费使用，并且没有任何使用次数的限制。我们致力于为用户提供高质量的在线工具服务。'
  },
  {
    question: '使用这款PDF合并工具是否有数据泄露风险？',
    answer: '完全不用担心数据安全问题。我们的PDF合并工具采用纯浏览器本地处理技术，所有文件都在您的设备上进行处理，不会上传任何服务器，确保您的文件安全和隐私。'
  },
  {
    question: '合并后的PDF文件质量如何？',
    answer: '我们使用专业的PDF处理库，确保合并后的文件保持原有的质量和格式。无论是文字、图片还是其他元素都能保持原有的清晰度和布局。'
  }
]

// 处理文件拖放
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (!droppedFiles) return

  const pdfFiles = Array.from(droppedFiles).filter(file =>
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  )
  handleFiles(pdfFiles)
}

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return

  const selectedFiles = Array.from(input.files).filter(file =>
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  )
  handleFiles(selectedFiles)

  // 清空 input 值，允许重复选择同一文件
  input.value = ''
}

const generateThumbnail = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 0.5 })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = viewport.height
    canvas.width = viewport.width

    if (context) {
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
      return canvas.toDataURL('image/jpeg')
    }
  } catch (error) {
    console.error('Thumbnail generation failed:', error)
  }
  return ''
}

// 处理文件
const handleFiles = async (newFiles: File[]) => {
  // 检查文件类型
  const invalidFiles = newFiles.filter(file =>
    !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
  )
  if (invalidFiles.length > 0) {
    ElMessage.error('只能上传PDF文件')
    return
  }

  // 检查文件大小
  const oversizedFiles = newFiles.filter(file => file.size > 500 * 1024 * 1024)
  if (oversizedFiles.length > 0) {
    ElMessage.error('文件大小不能超过500MB')
    return
  }

  // 处理每个文件，生成缩略图
  const filesWithThumbnails = await Promise.all(newFiles.map(async (file) => {
    const thumbnail = await generateThumbnail(file)
    return {
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      thumbnail
    }
  }))

  // 添加文件到列表
  // @ts-ignore
  files.value.push(...filesWithThumbnails)

  // 检查文件数量
  if (files.value.length > 30) {
    files.value = files.value.slice(0, 30)
    ElMessage.warning('最多只能选择30个文件')
  }
}

// 移除文件
const removeFile = (item: any) => {
  const index = files.value.indexOf(item)
  if (index > -1) {
    files.value.splice(index, 1)
  }
}

// 清空文件列表
const clearFiles = () => {
  files.value = []
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 合并PDF
const mergePDFs = async () => {
  if (files.value.length < 2) {
    ElMessage.warning('请至少选择2个PDF文件')
    return
  }

  try {
    merging.value = true
    const mergedPdf = await PDFDocument.create()

    for (const item of files.value) {
      // @ts-ignore
      const file = item.file
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer)
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
      })
    }

    const mergedPdfFile = await mergedPdf.save()

    // 创建下载链接
    const blob = new Blob([mergedPdfFile as BlobPart], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'merged.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('PDF合并成功')
    clearFiles()
  } catch (error) {
    console.error('PDF合并失败:', error)
    ElMessage.error('PDF合并失败，请重试')
  } finally {
    merging.value = false
  }
}

// 预览相关
const previewDialogVisible = ref(false)
const previewFile = ref<File | null>(null)
const previewUrl = ref('')

// 预览PDF
const previewPDF = (item: any) => {
  previewFile.value = item.file
  previewUrl.value = URL.createObjectURL(item.file)
  previewDialogVisible.value = true
}

// 监听预览对话框关闭
watch(previewDialogVisible, (newVal: boolean) => {
  if (!newVal && previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
    previewFile.value = null
  }
})
</script>

<style scoped>
.min-w-24 {
  min-width: 6rem;
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

.pdf-preview-dialog :deep(.el-dialog__body) {
  padding: 16px;
}
</style>
