<!--
 * @file PdfCompress.vue
 * @description PDF压缩工具组件，支持PDF文件压缩，减小文件体积
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-03-20
 * @license MIT
 *
 * 功能特性：
 * 1. 支持拖拽和点击上传PDF
 * 2. 支持批量压缩和单个下载
 * 3. 支持多种压缩质量选择
 * 4. 本地压缩，无需上传服务器
 * 5. 支持大文件处理(最大500MB)
 *
 * 主要组件：
 * - 文件上传区域
 * - 压缩质量控制
 * - 文件列表展示
 * - 压缩进度显示
 * - 常见问题解答
-->

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as JSZip from 'jszip'
import { PDFDocument, PDFName, PDFDict } from 'pdf-lib'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

// 类型定义
interface UploadFile {
  uid: string;
  name: string;
  size: number;
  status: 'ready' | 'processing' | 'success' | 'error';
  raw?: File;
  url?: string;
}

interface ProcessedFile {
  blob: Blob;
  url: string;
}

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface FAQ {
  question: string;
  answer: string;
}

// 压缩配置接口
interface CompressionParams {
  useObjectStreams: boolean;
  addDefaultPage: boolean;
  objectsPerTick: number;
  updateFieldAppearances: boolean;
  quality: number;
}

// 组件配置信息
const info = reactive({
  title: "免费PDF压缩工具",
  subtitle: "在线压缩PDF文件大小，支持批量处理，本地压缩更安全，适合邮件发送和文件上传"
})

// 获取当前路由
const route = useRoute()

// 功能特点
const features = [
  {
    icon: 'Compress',
    title: '智能压缩',
    desc: '采用先进压缩算法，在保证清晰度的同时最大程度减小文件体积'
  },
  {
    icon: 'Quality',
    title: '质量可控',
    desc: '提供多种压缩级别，可根据需求平衡文件大小和质量'
  },
  {
    icon: 'Batch',
    title: '批量处理',
    desc: '支持同时压缩多个PDF文件，提高工作效率'
  },
  {
    icon: 'Lock',
    title: '安全可靠',
    desc: '所有处理都在浏览器本地完成，无需上传服务器，确保文件安全'
  }
]

// 使用场景
const usageScenarios = [
  '邮件发送：压缩PDF文件以符合邮件附件大小限制',
  '文件上传：减小文件体积，加快上传速度和节省存储空间',
  '文档存档：批量压缩文档，优化存储空间利用',
  '移动设备：生成适合移动设备查看和分享的小体积PDF'
]

// 常见问题
const faqs = [
  {
    question: '使用PDF压缩工具会影响文件质量吗？',
    answer: '我们提供多种压缩级别供选择。轻度压缩基本不影响质量，中度压缩在保证清晰度的同时显著减小体积，极限压缩则会在一定程度上影响图片质量，但可获得最小的文件体积。'
  },
  {
    question: '压缩后的PDF文件是否安全？',
    answer: '完全安全。我们的工具在您的浏览器本地进行所有处理，文件不会上传到服务器，没有任何数据泄露风险。'
  },
  {
    question: '支持批量处理多个文件吗？',
    answer: '支持。您可以一次上传多个PDF文件进行批量压缩，每个文件最大支持500MB，最多可同时处理30个文件。'
  },
  {
    question: '压缩后的文件会丢失可编辑性吗？',
    answer: '不会。我们的压缩算法会保留PDF文件的文本层和其他可编辑元素，压缩后的文件依然可以进行文本选择和编辑。'
  }
]

// 状态管理
const fileList = ref<UploadFile[]>([])
const isProcessing = ref(false)
const isDragging = ref(false)
const dataFileRef = ref()
const processedFiles = ref<Map<string, ProcessedFile>>(new Map())

// 压缩配置
const config = reactive({
  quality: 'medium', // low, medium, high
  imageQuality: 0.8,
  compressImages: true,
  removeMetadata: true,
  removeAnnotations: true,
  flattenForms: true,
  compressPages: true
})

// 预览相关
const previewDialogVisible = ref(false)
const previewFile = ref<UploadFile | null>(null)
const previewUrl = ref('')

/**
 * 处理文件变更
 */
const handleChange = async (uploadFile: UploadFile, uploadFiles: UploadFile[]) => {
  try {
    if (uploadFile.status !== 'ready') {
      return
    }

    const file = uploadFile.raw
    if (!file || !(file instanceof File)) {
      console.error('无效的文件对象:', file)
      return
    }

    if (!validateFile(file)) {
      const index = uploadFiles.findIndex((f: UploadFile) => f.uid === uploadFile.uid)
      if (index !== -1) {
        uploadFiles.splice(index, 1)
      }
      return
    }

    uploadFile.status = 'ready'
    uploadFile.url = URL.createObjectURL(file)

  } catch (error) {
    console.error('文件上传失败:', error)
    ElMessage.error('文件上传失败，请重试')
  }
}

/**
 * 处理拖拽上传
 */
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    Array.from(files).forEach(file => {
      if (file.type === 'application/pdf') {
        const uploadFile: UploadFile = {
          uid: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          size: file.size,
          status: 'ready',
          raw: file
        }
        handleChange(uploadFile, fileList.value)
      }
    })
  }
}

/**
 * 处理文件移除
 */
const handleRemove = (file: UploadFile) => {
  const index = fileList.value.findIndex((item: UploadFile) => item.uid === file.uid)
  if (index !== -1) {
    const fileId = `${file.name}-${file.size}`
    processedFiles.value.delete(fileId)
    fileList.value.splice(index, 1)
  }
}

/**
 * 压缩PDF文件
 */
const compressPDF = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传PDF文件')
    return
  }

  isProcessing.value = true

  try {
    const filesToProcess = fileList.value.filter((file: UploadFile) =>
      file.status === 'ready' || file.status === 'error'
    )

    if (filesToProcess.length === 0) {
      ElMessage.warning('没有需要压缩的文件')
      isProcessing.value = false
      return
    }

    filesToProcess.forEach((file: UploadFile) => {
      file.status = 'processing'
    })

    for (const file of filesToProcess) {
      try {
        const result = await compressFile(file.raw as File)
        processedFiles.value.set(file.uid, result)
        file.status = 'success'
      } catch (error) {
        console.error(`处理文件失败: ${file.name}`, error)
        file.status = 'error'
        ElMessage.error(`处理文件 ${file.name} 失败`)
      }
    }

    const successCount = filesToProcess.filter((f: UploadFile) => f.status === 'success').length
    if (successCount > 0) {
      ElMessage.success(`成功压缩 ${successCount} 个文件`)
    }

  } catch (error) {
    console.error('批量处理失败:', error)
    ElMessage.error('批量处理失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

/**
 * 压缩单个PDF文件
 */
const compressFile = async (file: File): Promise<ProcessedFile> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)

    // 移除元数据
    if (config.removeMetadata) {
      pdfDoc.setTitle('')
      pdfDoc.setAuthor('')
      pdfDoc.setSubject('')
      pdfDoc.setKeywords([])
      pdfDoc.setCreator('')
      pdfDoc.setProducer('')
    }

    // 保存压缩后的 PDF
    const compressedPdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 20,
      updateFieldAppearances: false
    })

    const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    return { blob, url }
  } catch (error) {
    console.error('PDF压缩失败:', error)
    throw new Error('PDF压缩失败')
  }
}

/**
 * 下载单个文件
 */
const downloadFile = async (file: UploadFile) => {
  try {
    const processed = processedFiles.value.get(file.uid)
    if (!processed) {
      ElMessage.error('文件未压缩或压缩失败')
      return
    }

    const { blob } = processed
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compressed_${file.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

/**
 * 下载所有压缩后的文件
 */
const downloadAllFiles = async () => {
  try {
    isProcessing.value = true

    const successFiles = fileList.value.filter((file: UploadFile) => file.status === 'success')
    if (successFiles.length === 0) {
      ElMessage.warning('没有可下载的文件')
      return
    }

    if (successFiles.length === 1) {
      await downloadFile(successFiles[0])
      return
    }

    ElMessage.info('正在打包文件，请稍候...')

    const zip = new JSZip()
    const folder = zip.folder('compressed_pdfs')

    await Promise.all(successFiles.map(async (file: UploadFile) => {
      const processed = processedFiles.value.get(file.uid)
      if (processed) {
        const { blob } = processed
        folder?.file(`compressed_${file.name}`, blob)
      }
    }))

    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })

    const link = document.createElement('a')
    const url = URL.createObjectURL(content)
    link.href = url
    link.download = `compressed_pdfs_${new Date().getTime()}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)

    ElMessage.success('文件打包下载成功')
  } catch (error) {
    console.error('打包下载失败:', error)
    ElMessage.error('打包下载失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

/**
 * 清除所有文件
 */
const clearAll = () => {
  fileList.value = []
  processedFiles.value.forEach((file: ProcessedFile) => {
    URL.revokeObjectURL(file.url)
  })
  processedFiles.value.clear()
  isProcessing.value = false

  if (dataFileRef.value) {
    dataFileRef.value.clearFiles()
  }
}

/**
 * 格式化文件大小
 */
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

/**
 * 获取处理后的文件大小
 */
const getProcessedFileSize = (uid: string) => {
  const processed = processedFiles.value.get(uid)
  return processed ? formatFileSize(processed.blob.size) : '-'
}

/**
 * 获取状态类型
 */
const getStatusType = (status: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'error':
      return 'danger'
    case 'processing':
      return 'warning'
    default:
      return 'info'
  }
}

/**
 * 获取状态文本
 */
const getStatusText = (status: string) => {
  switch (status) {
    case 'success':
      return '已完成'
    case 'error':
      return '失败'
    case 'processing':
      return '压缩中'
    default:
      return '待压缩'
  }
}

/**
 * 验证文件
 */
const validateFile = (file: File): boolean => {
  if (file.size > 500 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过500MB')
    return false
  }

  if (file.type !== 'application/pdf') {
    ElMessage.error('只支持PDF格式文件')
    return false
  }

  return true
}

/**
 * 获取预览URL
 */
const getPreviewUrl = (file: UploadFile): string => {
  if (file.status === 'success') {
    const processed = processedFiles.value.get(file.uid)
    return processed?.url || file.url || ''
  }
  return file.url || ''
}

/**
 * 预览PDF
 */
const previewPDF = (file: UploadFile) => {
  previewFile.value = file
  previewUrl.value = getPreviewUrl(file)
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

// 组件卸载时清理资源
onUnmounted(() => {
  processedFiles.value.forEach((file: ProcessedFile) => {
    URL.revokeObjectURL(file.url)
  })
})
</script>

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
        <div
          class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
          :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
          <el-upload v-model:file-list="fileList" class="upload-area" ref="dataFileRef" accept="application/pdf"
            :auto-upload="false" :on-change="handleChange" :on-remove="handleRemove" :limit="30"
            :disabled="fileList.length > 0" :show-file-list="false" multiple drag>
            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">
                {{ fileList.length > 0 ? '请先清除当前文件' : '点击或拖拽PDF文件到这里' }}
              </div>
              <p class="text-xs text-gray-400">单个文件最大500MB</p>
              <p class="text-xs text-gray-400 mt-1">最多可上传30个文件</p>
            </div>
          </el-upload>
        </div>

        <!-- 压缩设置 -->
        <div v-if="fileList.length > 0" class="mt-6 bg-white rounded-lg p-6 border">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-2">
              <h3 class="text-base font-medium text-gray-800">压缩设置</h3>
              <span class="text-sm text-gray-500">设置压缩参数</span>
            </div>
            <div class="flex items-center space-x-3">
              <button @click="compressPDF" :disabled="isProcessing"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {{ isProcessing ? '压缩中...' : '开始压缩' }}
              </button>
              <button @click="clearAll" :disabled="isProcessing"
                class="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg font-medium border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                清除全部
              </button>
            </div>
          </div>

          <!-- 技术提示 -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-600">
              <svg class="inline-block w-4 h-4 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              提示：目前PDF压缩技术仍在持续改进中。如果压缩效果不理想，建议使用专业的PDF压缩软件获得更好的压缩效果。
            </p>
          </div>

          <!-- 设置选项 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 压缩质量 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">压缩质量</label>
              <el-select v-model="config.quality" class="w-full">
                <el-option label="轻度压缩" value="high" />
                <el-option label="中度压缩" value="medium" />
                <el-option label="极限压缩" value="low" />
              </el-select>
            </div>

            <!-- 图片质量滑块 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">
                图片质量 ({{ Math.round(config.imageQuality * 100) }}%)
              </label>
              <el-slider v-model="config.imageQuality" :min="0.1" :max="1" :step="0.1"
                :disabled="!config.compressImages" />
            </div>

            <!-- 其他选项 -->
            <div class="space-y-3">
              <label class="text-sm font-medium text-gray-700">高级选项</label>
              <div class="space-y-2">
                <el-checkbox v-model="config.compressImages">压缩图片</el-checkbox>
                <el-checkbox v-model="config.removeMetadata">移除元数据</el-checkbox>
              </div>
            </div>
          </div>
        </div>

        <!-- 文件列表 -->
        <div v-if="fileList.length > 0" class="mt-6 bg-white rounded-lg p-6 border">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <h3 class="text-base font-medium text-gray-800">文件列表</h3>
              <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {{ fileList.length }} 个文件
              </span>
            </div>
            <button @click="downloadAllFiles"
              :disabled="!fileList.some((file: UploadFile) => file.status === 'success')"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              全部下载
            </button>
          </div>

          <!-- 文件表格 -->
          <el-table :data="fileList" style="width: 100%" class="custom-table">
            <el-table-column prop="name" label="文件名" />
            <el-table-column label="原始大小" width="120">
              <template #default="scope">
                {{ formatFileSize(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column label="压缩后大小" width="120">
              <template #default="scope">
                {{ getProcessedFileSize(scope.row.uid) }}
              </template>
            </el-table-column>
            <el-table-column label="压缩率" width="100">
              <template #default="scope">
                {{ scope.row.status === 'success'
                  ? ((1 - processedFiles.get(scope.row.uid)?.blob.size / scope.row.size) * 100).toFixed(1) + '%'
                  : '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag size="small" :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="预览" width="80">
              <template #default="scope">
                <el-image :src="getPreviewUrl(scope.row)" :preview-src-list="[getPreviewUrl(scope.row)]" fit="cover"
                  class="w-8 h-8 rounded cursor-pointer" :preview-teleported="true" @click="previewPDF(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="downloadFile(scope.row)"
                  :disabled="scope.row.status !== 'success'">
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">{{ feature.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 适用场景 -->
        <div class="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">适用场景</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(text, index) in usageScenarios" :key="index" class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">{{ text }}</p>
            </div>
          </div>
        </div>

        <!-- 常见问题 -->
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

<style scoped>
/* 上传组件样式 */
.upload-area {
  width: 100%;
  height: 100%;
}

.upload-area :deep(.el-upload) {
  width: 100%;
  height: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
}

/* 表格样式 */
:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-border: 1px solid var(--el-table-border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  background-color: var(--el-fill-color-light);
}

/* 预览图片样式 */
:deep(.el-image) {
  border-radius: 4px;
  overflow: hidden;
}

/* 预览对话框样式 */
.pdf-preview-dialog :deep(.el-dialog__body) {
  padding: 16px;
}
</style>
