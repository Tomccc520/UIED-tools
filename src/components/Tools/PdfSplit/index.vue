<!--
 * @file PdfSplit.vue
 * @description PDF分割工具组件，支持将PDF拆分为每页一个独立文件
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
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <!-- 上传区域 -->
        <div v-if="files.length === 0">
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" multiple accept=".pdf,application/pdf"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileInputChange" />

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽PDF文件到这里</div>
              <p class="text-xs text-gray-400">最多选择 10 个文件，单个文件最大 500MB，少于1000页</p>
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
              <div class="flex items-center space-x-3">
                <button @click="clearFiles" class="text-sm text-gray-500 hover:text-red-500 transition-colors"
                  :disabled="processing">
                  清空队列
                </button>
                <button @click="splitAll" :disabled="processing"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  <span class="flex items-center justify-center">
                    <span class="mr-2">{{ processing ? '⚙️' : '✨' }}</span>
                    {{ processing ? '处理中...' : '开始分割' }}
                  </span>
                </button>
                <button v-if="files.length > 0" @click="downloadAllSplitFiles"
                  class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow transition-all">
                  打包下载全部
                </button>
              </div>
            </div>

            <!-- 文件列表 -->
            <div class="space-y-4">
              <div v-for="(file, index) in files" :key="file.name"
                class="relative group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p class="text-sm text-gray-700">{{ file.name }}</p>
                      <div class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</span>
                        <span v-if="file.pageCount" class="text-xs text-gray-500">{{ file.pageCount }}页</span>
                        <span v-if="file.status === 'processing'" class="text-xs text-blue-500">处理中...</span>
                        <span v-if="file.status === 'completed'" class="text-xs text-green-500">已完成</span>
                        <span v-if="file.status === 'error'" class="text-xs text-red-500">处理失败</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <!-- 操作按钮组 -->
                    <button @click="previewPDF(file)"
                      class="text-gray-400 hover:text-blue-500 p-1.5 rounded-full hover:bg-blue-50 transition-colors"
                      :disabled="processing">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button v-if="file.status === 'completed'" @click="downloadSplitFiles(file)"
                      class="text-gray-400 hover:text-green-500 p-1.5 rounded-full hover:bg-green-50 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button @click="removeFile(index)"
                      class="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      :disabled="processing">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
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
              <p class="text-sm text-gray-600">学生：分割课件和讲义，便于分享和学习</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">办公：拆分合同和报告，方便单独处理</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">设计：提取设计稿中的特定页面，便于修改</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">日常：分割扫描文件，整理归档更方便</p>
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

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>

    <!-- PDF预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="previewFile?.name" width="80%" destroy-on-close
      class="pdf-preview-dialog">
      <div class="w-full h-[70vh]">
        <iframe v-if="previewUrl" :src="previewUrl" class="w-full h-full border-0"></iframe>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { PDFDocument } from 'pdf-lib'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import { formatFileSize } from '@/utils/file'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import JSZip from 'jszip'

const route = useRoute()

interface ProcessedFile extends File {
  pageCount?: number
  status?: 'pending' | 'processing' | 'completed' | 'error'
  splitFiles?: Blob[]
}

const info = reactive({
  title: "免费在线PDF分割工具",
  subtitle: "将PDF文件拆分为单页，支持批量处理多个文件，本地处理更安全"
})

const files = ref<ProcessedFile[]>([])
const processing = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 功能特点
const features = [
  {
    icon: 'Split',
    title: '智能分割',
    desc: '自动将PDF文档拆分为单页文件，完整保留原有质量和格式'
  },
  {
    icon: 'Batch',
    title: '批量处理',
    desc: '支持同时处理多个PDF文件，大幅提升工作效率'
  },
  {
    icon: 'Lock',
    title: '安全可靠',
    desc: '所有处理都在浏览器本地完成，无需上传服务器，确保文件安全'
  },
  {
    icon: 'Download',
    title: '便捷下载',
    desc: '支持单个下载或打包下载所有分割后的文件，满足不同需求'
  }
]

// 常见问题
const faqs = [
  {
    question: '这款PDF分割工具是否免费？',
    answer: '是的，我们的PDF分割工具完全免费使用，没有任何使用次数的限制。我们致力于为用户提供高质量的在线工具服务。'
  },
  {
    question: '为什么分割出来的打包文件体积变大了？',
    answer: '这是由PDF文件格式特性决定的。对于包含字体嵌入的PDF，每个分割后的文件都需要单独存储相关信息，因此打包后的总体积会大于原始文件。而对于扫描生成的PDF文档，分割后的文件总体积与原始文件相近。'
  },
  {
    question: '使用这款PDF分割工具是否有数据泄露风险？',
    answer: '完全不用担心数据安全问题。我们的PDF分割工具采用纯浏览器本地处理技术，所有文件都在您的设备上处理，不会上传到任何服务器，确保您的文件安全和隐私。'
  }
]

// 计算已完成的文件
const completedFiles = computed(() => {
  return files.value.filter((file: ProcessedFile) =>
    file.status === 'completed' && file.splitFiles && file.splitFiles.length > 0
  )
})

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

// 处理文件
const handleFiles = (newFiles: File[]) => {
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

  // 添加文件到列表
  const processedFiles = newFiles.map(file => {
    const processedFile = new File([file], file.name, { type: file.type }) as ProcessedFile
    processedFile.status = 'pending'
    processedFile.splitFiles = []
    processedFile.pageCount = undefined
    return processedFile
  })

  files.value.push(...processedFiles)

  // 检查文件数量
  if (files.value.length > 10) {
    files.value = files.value.slice(0, 10)
    ElMessage.warning('最多只能选择10个文件')
  }

  // 获取页数
  processedFiles.forEach(checkPageCount)
}

// 检查PDF页数
const checkPageCount = async (file: ProcessedFile) => {
  try {
    const reader = new FileReader()
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        } else {
          reject(new Error('读取文件失败'))
        }
      }
      reader.onerror = () => reject(new Error('读取文件失败'))
      reader.readAsArrayBuffer(file)
    })

    const pdf = await PDFDocument.load(arrayBuffer)
    const pageCount = pdf.getPageCount()

    if (pageCount > 1000) {
      ElMessage.error(`文件 ${file.name} 页数超过1000页限制`)
      removeFile(files.value.indexOf(file))
      return
    }

    file.pageCount = pageCount
  } catch (error) {
    console.error('获取PDF页数失败:', error)
    ElMessage.error(`文件 ${file.name} 解析失败`)
    removeFile(files.value.indexOf(file))
  }
}

// 移除文件
const removeFile = (index: number) => {
  if (index > -1) {
    files.value.splice(index, 1)
  }
}

// 清空文件列表
const clearFiles = () => {
  files.value = []
}

// 分割单个PDF文件
const splitPDF = async (file: ProcessedFile) => {
  if (!file) return

  try {
    file.status = 'processing'
    const reader = new FileReader()
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        } else {
          reject(new Error('读取文件失败'))
        }
      }
      reader.onerror = () => reject(new Error('读取文件失败'))
      reader.readAsArrayBuffer(file)
    })

    const pdf = await PDFDocument.load(arrayBuffer)
    const pageCount = pdf.getPageCount()

    file.splitFiles = []

    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create()
      const [page] = await newPdf.copyPages(pdf, [i])
      newPdf.addPage(page)
      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      file.splitFiles.push(blob)
    }

    file.status = 'completed'
  } catch (error) {
    console.error('PDF分割失败:', error)
    file.status = 'error'
    throw error
  }
}

// 分割所有文件
const splitAll = async () => {
  if (files.value.length === 0) {
    ElMessage.warning('请先选择要分割的PDF文件')
    return
  }

  processing.value = true

  try {
    const pendingFiles = files.value.filter(file => file.status !== 'completed')
    if (pendingFiles.length === 0) {
      ElMessage.warning('所有文件已处理完成')
      processing.value = false
      return
    }

    for (const file of pendingFiles) {
      await splitPDF(file)
    }
    ElMessage.success('PDF分割完成')
  } catch (error) {
    console.error('批量分割失败:', error)
    ElMessage.error('部分文件分割失败，请重试')
  } finally {
    processing.value = false
  }
}

// 下载单个文件的分割结果
const downloadSplitFiles = async (file: ProcessedFile) => {
  if (!file.splitFiles || file.splitFiles.length === 0) {
    ElMessage.error('没有可下载的文件')
    return
  }

  try {
    const zip = new JSZip()
    const folder = zip.folder(file.name.replace('.pdf', ''))

    if (!folder) {
      throw new Error('创建文件夹失败')
    }

    file.splitFiles.forEach((blob, index) => {
      folder.file(`第${index + 1}页.pdf`, blob)
    })

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = `${file.name.replace('.pdf', '')}_分割.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

// 打包下载所有分割后的文件
const downloadAllSplitFiles = async () => {
  const completedFiles = files.value.filter(file =>
    file.status === 'completed' && file.splitFiles && file.splitFiles.length > 0
  )

  if (completedFiles.length === 0) {
    ElMessage.warning('请先点击开始分割按钮处理文件')
    return
  }

  try {
    const zip = new JSZip()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

    for (const file of completedFiles) {
      const fileName = file.name.replace('.pdf', '')
      const folder = zip.folder(fileName)
      if (!folder) continue

      // 添加原始PDF文件
      folder.file(file.name, file)

      // 创建分割后的文件夹
      const splitFolder = folder.folder('分割页面')
      if (!splitFolder) continue

      // 添加分割后的文件
      file.splitFiles?.forEach((blob, index) => {
        const pageNum = String(index + 1).padStart(3, '0')
        splitFolder.file(`${fileName}_第${pageNum}页.pdf`, blob)
      })
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = `PDF分割结果_${timestamp}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('打包下载成功')
  } catch (error) {
    console.error('打包下载失败:', error)
    ElMessage.error('打包下载失败，请重试')
  }
}

// 预览相关
const previewDialogVisible = ref(false)
const previewFile = ref<File | null>(null)
const previewUrl = ref('')

// 预览PDF
const previewPDF = (file: File) => {
  previewFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  previewDialogVisible.value = true
}

// 监听预览对话框关闭
watch(previewDialogVisible, (newVal) => {
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

.pdf-preview-dialog :deep(.el-dialog__body) {
  padding: 16px;
}
</style>
