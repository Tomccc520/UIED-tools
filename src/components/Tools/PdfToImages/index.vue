<!--
 * @file PdfToImages.vue
 * @description PDF转图片工具组件，支持PDF文件转换为高质量图片
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-
 *
 * 功能特性：
 * 1. 支持拖拽和点击上传PDF
 * 2. 支持批量转换和单页下载
 * 3. 支持普通(150dpi)和高清(300dpi)两种质量
 * 4. 本地转换，无需上传服务器
 * 5. 支持大文件处理(最大500MB)
 *
 * 主要组件：
 * - 文件上传区域
 * - 转换质量控制
 * - 文件列表展示
 * - 转换进度显示
 * - 常见问题解答
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 更新标题样式 -->
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <!-- 更新上传区域样式 -->
        <div v-if="files.length === 0">
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @dragover.prevent="handleDragover"
            @dragleave.prevent="handleDragleave" @drop.prevent="handleDrop" @click="triggerFileInput">
            <input ref="fileInput" type="file" multiple accept="application/pdf" class="hidden"
              @change="handleFileChange" />
            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽PDF文件到这里</div>
              <p class="text-xs text-gray-400">支持批量上传，单个文件限制 500MB</p>
              <p class="text-xs text-gray-400 mt-1">仅支持 PDF 格式，页数不超过 1000 页</p>
            </div>
          </div>
        </div>

        <!-- 文件列表和选项 -->
        <template v-if="files.length > 0">
          <!-- 文件列表 -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center gap-4">
                <h2 class="text-lg font-medium">已选择的文件</h2>
                <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {{ files.length }} 个文件
                </span>
              </div>
              <button @click="clearFiles" class="text-sm text-gray-500 hover:text-red-500 transition-colors"
                :disabled="converting">
                清空队列
              </button>
            </div>

            <div class="grid grid-cols-1 gap-4">
              <div v-for="(file, index) in files" :key="index"
                class="relative group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p class="text-sm text-gray-700">{{ file.name }}</p>
                      <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                    </div>
                  </div>
                  <button @click="removeFile(index)"
                    class="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                    :disabled="converting">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 转换选项 -->
          <div class="mb-6">
            <h2 class="text-lg font-medium mb-4">转换选项</h2>
            <div class="bg-white rounded-lg border border-gray-200 p-4">
              <h3 class="font-medium mb-2">图片质量</h3>
              <div class="flex flex-wrap gap-2">
                <button class="min-w-24 py-1 px-3 rounded border text-sm font-medium transition-colors" :class="[
                  quality === 150
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500'
                ]" @click="quality = 150">
                  普通 (150dpi)
                </button>
                <button class="min-w-24 py-1 px-3 rounded border text-sm font-medium transition-colors" :class="[
                  quality === 300
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500'
                ]" @click="quality = 300">
                  高清 (300dpi)
                </button>
              </div>
            </div>
          </div>

          <!-- 转换按钮 -->
          <div class="text-center mb-8">
            <button @click="startConversion" :disabled="converting"
              class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <span class="flex items-center justify-center">
                <span class="mr-2">{{ converting ? '⚙️' : '✨' }}</span>
                {{ converting ? '转换中...' : '开始转换' }}
              </span>
            </button>
          </div>
        </template>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 功能点 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">本地处理</h3>
                <p class="text-sm text-gray-500 leading-relaxed">浏览器本地转换，无需上传服务器，快速安全，保护文件隐私</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">高清图片</h3>
                <p class="text-sm text-gray-500 leading-relaxed">支持最高300dpi输出，清晰还原文档内容，满足专业打印需求</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">批量转换</h3>
                <p class="text-sm text-gray-500 leading-relaxed">支持多个PDF同时处理，自动打包下载，提高文档处理效率</p>
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
              <p class="text-sm text-gray-600">学生：将PDF课件转为图片，方便在手机上阅读和分享</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">办公：将PDF文档转为高清图片，便于在社交媒体分享</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">设计：将PDF设计稿转为图片，方便客户预览和反馈</p>
            </div>
            <div class="flex items-start space-x-2">
              <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <p class="text-sm text-gray-600">日常：将PDF文档转为图片，便于存档和快速查看</p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-8 bg-white rounded-lg p-6 border">
          <h2 class="text-lg font-medium text-gray-900 mb-6">常见问题解答</h2>
          <div class="space-y-6">
            <div class="border-b border-gray-100 pb-6">
              <h3 class="text-base font-medium text-gray-800 mb-2">这个工具需要付费吗？</h3>
              <p class="text-sm text-gray-600">完全免费，无需注册，没有次数限制。我们通过适度的广告展示来维持服务器运营，确保工具持续稳定运行。</p>
            </div>
            <div class="border-b border-gray-100 pb-6">
              <h3 class="text-base font-medium text-gray-800 mb-2">转换后的图片质量如何？</h3>
              <p class="text-sm text-gray-600">
                提供两种清晰度选择：普通模式(150dpi)适合屏幕显示和网页浏览，高清模式(300dpi)适合专业打印和细节展示。输出PNG格式图片，保证最佳显示效果。
              </p>
            </div>
            <div class="border-b border-gray-100 pb-6">
              <h3 class="text-base font-medium text-gray-800 mb-2">文件安全性如何保证？</h3>
              <p class="text-sm text-gray-600">所有文件均在您的浏览器本地处理，不会上传到服务器，确保文件安全和隐私。转换完成后自动打包下载，方便管理和使用。</p>
            </div>
            <div class="pb-6">
              <h3 class="text-base font-medium text-gray-800 mb-2">支持哪些PDF文件？</h3>
              <p class="text-sm text-gray-600">支持所有标准PDF文件，单个文件大小限制为500MB，页数不超过1000页。建议上传体积较小的文件以获得更快的转换速度。</p>
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
import { ref, reactive, onMounted } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
// @ts-ignore
import JSZip from 'jszip'
import * as pdfjsLib from 'pdfjs-dist'
import { Document, Upload, Delete } from '@element-plus/icons-vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

/**
 * 组件配置信息
 */
const info = reactive({
  title: "免费PDF转图片工具",
  subtitle: "在线将PDF文档转换为高清图片，支持批量处理，本地转换更安全"
})

const files = ref<File[]>([])
const quality = ref(150)
const converting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const guideSteps = [
  { title: '上传PDF文件', description: '点击上传区域或直接拖拽PDF文件到指定区域，支持批量上传。' },
  { title: '选择质量', description: '选择普通(150dpi)或高清(300dpi)图片质量。' },
  { title: '转换下载', description: '点击“开始转换”按钮，系统将自动转换并打包下载所有图片。' }
]

const guideNotes = [
  '转换过程完全在本地进行，不会消耗您的流量，也不会上传文件。',
  '单个文件限制500MB，页数不超过1000页。',
  '转换后的图片格式为PNG。'
]

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return

  const newFiles = Array.from(input.files)

  // 验证文件
  for (const file of newFiles) {
    if (file.size > 500 * 1024 * 1024) {
      ElMessage.error(`文件 ${file.name} 超过500MB限制`)
      continue
    }
    if (!file.type.includes('pdf')) {
      ElMessage.error(`文件 ${file.name} 不是PDF格式`)
      continue
    }
    files.value.push(file)
  }

  // 清空input
  input.value = ''
}

// 移除文件
const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

// 开始转换
const startConversion = async () => {
  if (files.value.length === 0) {
    ElMessage.warning('请先选择要转换的PDF文件')
    return
  }

  converting.value = true
  try {
    for (const file of files.value) {
      await convertPdfToImages(file)
    }
    ElMessage.success('转换完成')
  } catch (error) {
    console.error('转换失败:', error)
    ElMessage.error('转换失败,请重试')
  } finally {
    converting.value = false
  }
}

// PDF转图片
const convertPdfToImages = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
  const zip = new JSZip()

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: quality.value / 72 }) // dpi转换为scale

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) continue

    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise

    // 获取图片数据，统一使用PNG格式
    const imgData = canvas.toDataURL('image/png')
    const base64Data = imgData.replace('data:image/png;base64,', '')

    // 添加到压缩包
    zip.file(`${file.name}_第${i}页.png`, base64Data, { base64: true })
  }

  // 生成并下载压缩包
  const content = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.download = `${file.name}_转换结果.zip`
  link.href = URL.createObjectURL(content)
  link.click()
  URL.revokeObjectURL(link.href)
}

// 拖放处理
onMounted(async () => {
  // const dropZone = document.querySelector('.border-dashed')
  // if (!dropZone) return

  // dropZone.addEventListener('dragover', ((e: Event) => {
  //   e.preventDefault()
  //   if (e instanceof DragEvent) {
  //     dropZone.classList.add('border-blue-500')
  //   }
  // }) as EventListener)

  // dropZone.addEventListener('dragleave', () => {
  //   dropZone.classList.remove('border-blue-500')
  // })

  // dropZone.addEventListener('drop', ((e: Event) => {
  //   e.preventDefault()
  //   if (e instanceof DragEvent && e.dataTransfer) {
  //     dropZone.classList.remove('border-blue-500')
  //     const droppedFiles = e.dataTransfer.files
  //     const pdfFiles = Array.from(droppedFiles).filter((file: File) => file.type.includes('pdf'))
  //     files.value.push(...pdfFiles)
  //   }
  // }) as EventListener)

  // 动态加载 PDF Worker
  // @ts-ignore
  const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.js')
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default
})

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * 清空文件列表
 */
const clearFiles = () => {
  files.value = []
}

// 添加拖拽状态
const isDragging = ref(false)

const handleDragover = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragleave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

// 在 script setup 部分添加 handleDrop 方法
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (!files) return

  Array.from(files).forEach(file => {
    if (file.type === 'application/pdf') {
      handleUpload(file)
    }
  })
}

// 添加 handleUpload 方法
const handleUpload = (file: File) => {
  if (files.value.length >= 10) {
    ElMessage.warning('最多只能选择10个文件')
    return
  }

  if (file.size > 500 * 1024 * 1024) {
    ElMessage.warning(`文件 ${file.name} 超过500MB限制`)
    return
  }

  files.value.push(file)
}
</script>

<style scoped>
.min-w-24 {
  min-width: 6rem;
}

/* 禁用图片拖动 */
img {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
