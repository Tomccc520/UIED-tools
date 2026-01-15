<!--
 * @file ImageToPdf.vue
 * @description 图片转PDF工具，支持批量转换和合并
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-12-22
-->

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount, watch } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import { ElMessage, ElImage } from 'element-plus'
import { genFileId } from 'element-plus'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'
import { jsPDF } from 'jspdf'
// @ts-ignore
import draggable from 'vuedraggable'
import type { UploadRawFile } from 'element-plus'

const route = useRoute()

// 组件配置信息
const info = {
  title: "免费图片转PDF工具",
  subtitle: "轻松将图片转换为PDF文档，支持单独保存或合并为一个文件，让文档处理更加便捷"
}

// 功能特点
const features = [
  {
    title: '多格式支持',
    desc: '支持JPG、PNG格式图片转换为PDF格式',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>`
  },
  {
    title: '批量处理',
    desc: '支持多张图片同时转换，可并或单独生成PDF',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
    </svg>`
  },
  {
    title: '本地处理',
    desc: '所有转换在浏览器本地完成，保护隐私安全',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>`
  },
  {
    title: '简单易用',
    desc: '拖拽排序，一键转换，快速导出所需文档',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>`
  }
]

// 使用场景
const usageScenarios = [
  '学生：将课件、笔记等图片转为PDF，方便阅读和打印',
  '办公：将图片文档转为标准PDF格式，便于归档分享',
  '设计：将设计稿整理为PDF文件，方便展示和发送',
  '日常：将手机相册照片整理为PDF文档，便于保存'
]

// 常见问题
const faqs = [
  {
    question: '支持哪些图片格式？',
    answer: '目前支持JPG（JPEG）和PNG格式的图片转换为PDF。'
  },
  {
    question: '如何选择合适的页面尺寸？',
    answer: '如果要保持图片原始比例，选择"原始尺寸"；如果需要打印，建议选择"竖版A4"或"横版A4"。'
  },
  {
    question: '文件大小有限制吗？',
    answer: '单个图片不超过20MB，建议总文件大小不超过50MB，以确保转换质量和速度。'
  },
  {
    question: '转换后的PDF质量如何？',
    answer: '转换后的PDF将保持原图片的质量，不会降低分辨率。选择A4尺寸时会自动适配页面大小。'
  },
  {
    question: '为什么选择本地转换？',
    answer: '本地转换无需上传下载，转换速度更快，同时可以保护您的隐私，无需担心文件泄露风险。'
  }
]

// 状态管理
interface FileItem {
  id: string
  name: string
  file: File
}

const fileList = ref<FileItem[]>([])
const uploadedFiles = new Set<string>()
const isProcessing = ref(false)
const isDragging = ref(false)
const dataFileRef = ref<HTMLInputElement | null>(null)
const previewUrls = ref<Map<string, string>>(new Map())

// 转换配置
const config = reactive({
  mergeType: 'merge', // merge: 合并文件, separate: 独立文件
  pageSize: 'original', // original: 图像尺寸, a4-portrait: 竖版A4, a4-landscape: 横版A4
})

const guideSteps = [
  { title: '上传图片', description: '点击上传区域或直接拖拽JPG/PNG图片到指定区域，支持批量上传。' },
  { title: '调整顺序', description: '通过拖拽预览图调整图片顺序，这将决定合并后的页面顺序。' },
  { title: '选择配置', description: '选择“合并为一个”或“单独生成”，并设置页面尺寸（原始/A4）。' },
  { title: '开始转换', description: '点击“开始转换”按钮，系统将自动处理并下载PDF文件。' }
]

const guideNotes = [
  '所有转换均在本地浏览器完成，不会上传到服务器，确保隐私安全。',
  '支持JPG和PNG格式，建议单张图片不超过20MB。',
  '合并模式下，所有图片将按顺序合并为一个PDF文件。'
]

// 支持的格式
const supportedFormats = ['image/jpeg', 'image/png', 'image/jpg']

// 处理文件上传
const handleUpload = async (file: File) => {
  try {
    if (!supportedFormats.includes(file.type)) {
      ElMessage.error('仅支持JPG和PNG格式的图片')
      return false
    }

    if (file.size > 20 * 1024 * 1024) {
      ElMessage.error(`文件 ${file.name} 超过20MB，请选择更小的文件`)
      return false
    }

    if (fileList.value.length >= 30) {
      ElMessage.error('最多只能上传30个文件')
      return false
    }

    if (uploadedFiles.has(file.name)) {
      ElMessage.warning('已存在同名文件')
      return false
    }

    const fileId = genFileId().toString()

    // 生成预览URL
    const previewUrl = URL.createObjectURL(file)
    previewUrls.value.set(fileId, previewUrl)

    // 添加到文件列表
    fileList.value.push({
      id: fileId,
      name: file.name,
      file: file
    })

    uploadedFiles.add(file.name)
    return true
  } catch (error) {
    console.error('文件上传错误:', error)
    ElMessage.error('文件上传失败，请重试')
    return false
  }
}

// 移除文件
const handleRemove = (file: FileItem) => {
  try {
    const index = fileList.value.findIndex((item: FileItem) => item.id === file.id)
    if (index > -1) {
      // 释放预览URL
      if (previewUrls.value.has(file.id)) {
        URL.revokeObjectURL(previewUrls.value.get(file.id)!)
        previewUrls.value.delete(file.id)
      }
      uploadedFiles.delete(file.name)
      fileList.value.splice(index, 1)
    }
  } catch (error) {
    console.error('文件删除错误:', error)
    ElMessage.error('文件删除失败，请重试')
  }
}

// 组件载时清理预览URL
onBeforeUnmount(() => {
  previewUrls.value.forEach((url: string) => {
    URL.revokeObjectURL(url)
  })
  previewUrls.value.clear()
})

// 处理拖拽状态
const handleDragover = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragleave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDrop = async (e: DragEvent) => {
  try {
    e.preventDefault()
    isDragging.value = false

    const files = e.dataTransfer?.files
    if (!files) return

    for (const file of Array.from(files)) {
      await handleUpload(file)
    }
  } catch (error) {
    console.error('文件拖放错误:', error)
    ElMessage.error('文件上传失败，请重试')
  }
}

// 转换为PDF
const convertToPdf = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择图片')
    return
  }

  isProcessing.value = true
  try {
    if (config.mergeType === 'merge') {
      await convertMergedPdf()
    } else {
      await convertSeparatePdfs()
    }
    ElMessage.success('转换成功')
  } catch (error) {
    console.error('转换过程中错误:', error)
    ElMessage.error('转换失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

// 合并为单个PDF
const convertMergedPdf = async () => {
  const pdf = new jsPDF({
    orientation: config.pageSize === 'a4-landscape' ? 'landscape' : 'portrait',
    unit: 'mm',
  })

  for (let i = 0; i < fileList.value.length; i++) {
    if (i > 0) pdf.addPage()

    const file = fileList.value[i].file
    const imgData = await fileToDataUrl(file)

    if (config.pageSize === 'original') {
      const img = await loadImage(imgData)
      const { width, height } = calculateDimensions(img)
      pdf.addImage(imgData, 'JPEG', 0, 0, width, height)
    } else {
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight)
    }
  }

  pdf.save('converted.pdf')
}

// 转换为独立PDF
const convertSeparatePdfs = async () => {
  for (const item of fileList.value) {
    const pdf = new jsPDF({
      orientation: config.pageSize === 'a4-landscape' ? 'landscape' : 'portrait',
      unit: 'mm',
    })

    const imgData = await fileToDataUrl(item.file)

    if (config.pageSize === 'original') {
      const img = await loadImage(imgData)
      const { width, height } = calculateDimensions(img)
      pdf.addImage(imgData, 'JPEG', 0, 0, width, height)
    } else {
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight)
    }

    const fileName = item.file.name.replace(/\.[^/.]+$/, '')
    pdf.save(`${fileName}.pdf`)
  }
}

// 工具函数
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

const calculateDimensions = (img: HTMLImageElement) => {
  const aspectRatio = img.width / img.height
  let width = 210 // A4 width in mm
  let height = width / aspectRatio

  if (height > 297) { // A4 height in mm
    height = 297
    width = height * aspectRatio
  }

  return { width, height }
}

// 清空文件列表
const clearFiles = () => {
  try {
    // 清理预览URL
    previewUrls.value.forEach((url: string) => {
      URL.revokeObjectURL(url)
    })
    previewUrls.value.clear()

    // 清理文件列表
    fileList.value = []
    uploadedFiles.clear()

    ElMessage.success('已清空文件列表')
  } catch (error) {
    console.error('清理文件列表失败:', error)
    ElMessage.error('清理失败，请重试')
  }
}

// 文件上传相关
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return

  Array.from(input.files).forEach(file => {
    handleUpload(file)
  })

  // 清空 input 值，允许重复选择同一文件
  input.value = ''
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}
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

        <!-- 配置区域 -->
        <div class="grid grid-cols-1 gap-8">
          <!-- 上传区域 -->
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @dragover.prevent="handleDragover"
            @dragleave.prevent="handleDragleave" @drop.prevent="handleDrop" @click="triggerFileInput">
            <input ref="fileInputRef" type="file" multiple accept=".jpg,.jpeg,.png" class="hidden"
              @change="handleFileInputChange" />
            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片到这里</div>
              <p class="text-xs text-gray-400">支持JPG和PNG格式，单个文件不超过20MB</p>
            </div>
          </div>

          <!-- 转换选项面板 -->
          <div v-if="fileList.length > 0" class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">转换设置</div>
            <div class="space-y-6">
              <!-- 合并方式 -->
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-600">合并方式</span>
                </div>
                <div class="flex space-x-3">
                  <button class="min-w-24 py-1 px-3 rounded border text-sm font-medium transition-colors"
                    :class="[config.mergeType === 'merge' ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500']"
                    @click="config.mergeType = 'merge'">
                    合并为一个
                  </button>
                  <button class="min-w-24 py-1 px-3 rounded border text-sm font-medium transition-colors"
                    :class="[config.mergeType === 'separate' ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500']"
                    @click="config.mergeType = 'separate'">
                    单独生成
                  </button>
                </div>
              </div>

              <!-- 页面尺寸 -->
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-600">页面尺寸</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button class="min-w-24 py-1 px-3 rounded border text-sm font-medium transition-colors"
                    :class="[config.pageSize === 'original' ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500']"
                    @click="config.pageSize = 'original'">
                    原始尺寸
                  </button>
                  <button class="min-w-24 py-1 px-3 rounded border text-sm font-medium transition-colors"
                    :class="[config.pageSize === 'a4-portrait' ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500']"
                    @click="config.pageSize = 'a4-portrait'">
                    竖版A4
                  </button>
                  <button class="min-w-24 py-1 px-3 rounded border text-sm font-medium transition-colors"
                    :class="[config.pageSize === 'a4-landscape' ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500']"
                    @click="config.pageSize = 'a4-landscape'">
                    横版A4
                  </button>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex space-x-3">
                <el-button type="primary" size="large" :loading="isProcessing" @click="convertToPdf"
                  class="flex-1 !h-10">
                  {{ isProcessing ? '转换中...' : '开始转换' }}
                </el-button>
                <el-button v-if="fileList.length > 0" size="large" @click="clearFiles" class="flex-1 !h-10">
                  清空文件
                </el-button>
              </div>
            </div>
          </div>

          <!-- 文件列表展示区域 -->
          <div v-if="fileList.length > 0" class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-base font-medium text-gray-700">文件列表</span>
                <span class="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {{ fileList.length }}/30
                </span>
              </div>
              <button @click="clearFiles" class="text-sm text-gray-500 hover:text-red-500 transition-colors">
                清空队列
              </button>
            </div>

            <draggable v-model="fileList" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              item-key="id" :animation="200" ghost-class="ghost">
              <template #item="{ element }">
                <div
                  class="relative group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-move">
                  <!-- 预览图片 -->
                  <div class="relative pt-[75%] overflow-hidden">
                    <img :src="previewUrls.get(element.id)" :alt="element.name"
                      class="absolute inset-0 w-full h-full object-contain bg-gray-50" draggable="false" />
                  </div>
                  <!-- 文件信息 -->
                  <div class="p-2">
                    <div class="text-xs text-gray-600 truncate">{{ element.name }}</div>
                    <div class="text-xs text-gray-400">{{ formatFileSize(element.file.size) }}</div>
                  </div>
                  <!-- 删除按钮 -->
                  <button @click.stop="handleRemove(element)"
                    class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </template>
            </draggable>

            <div class="mt-2 text-center text-sm text-gray-500">
              拖动图片可调整PDF中的页面顺序
            </div>
          </div>

          <!-- 功能说明区域 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(feature, index) in features" :key="index" class="border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                  <span v-html="feature.icon"></span>
                </div>
                <h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">{{ feature.desc }}</p>
            </div>
          </div>

          <!-- 使用场景说明 -->
          <div class="bg-gray-50 rounded-lg p-6">
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

          <!-- 常见问题解答 -->
          <div class="bg-white rounded-lg p-6 border">
            <h3 class="text-base font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="(item, index) in faqs" :key="index"
                class="pb-6 last:pb-0 border-b border-gray-200 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.question }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ item.answer }}</p>
              </div>
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

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
  cursor: move;
}

.min-w-24 {
  min-width: 6rem;
}

/* 禁用图片拖动和选择 */
img {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  /* 禁用图片拖动 */
  pointer-events: none;
}

/* 禁用文本选择 */
.select-none {
  user-select: none;
}
</style>
