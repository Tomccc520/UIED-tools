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
 * 3. 支持多种压缩质量选择（轻度/标准/深度）
 * 4. 混合压缩策略：结构优化与光栅化重绘
 * 5. 支持大文件处理与进度显示
 * 6. 压缩前后体积对比
 *
 * 主要组件：
 * - 文件上传区域
 * - 压缩模式选择
 * - 文件列表展示
 * - 压缩进度条
-->

<script setup lang="ts">
import { ref, reactive, watch, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as JSZip from 'jszip'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { jsPDF } from 'jspdf'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

// 设置 PDF.js worker
// 使用 Vite 的显式 URL 导入功能
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

// 类型定义
interface UploadFile {
  uid: string;
  name: string;
  size: number;
  status: 'ready' | 'processing' | 'success' | 'error';
  progress: number; // 0-100
  raw?: File;
  url?: string;
  previewImage?: string; // 首页预览图
  startTime?: number;
  endTime?: number;
  logs?: string[];
}

interface ProcessedFile {
  blob: Blob;
  url: string;
  size: number;
}

interface AdvancedConfig {
  dpi: number; // 72, 96, 150, 300
  imageQuality: number; // 0-100
  colorMode: 'color' | 'grayscale';
  removeMetadata: boolean;
  filenamePattern: string;
}

const info = reactive({
  title: "免费PDF压缩工具",
  subtitle: "在线压缩PDF文件大小，参考 PDF24 压缩算法，支持 DPI 与图片质量精细调节"
})

const route = useRoute()

// 状态管理
const fileList = ref<UploadFile[]>([])
const isProcessing = ref(false)
const isDragging = ref(false)
const dataFileRef = ref()
const processedFiles = ref<Map<string, ProcessedFile>>(new Map())
const showAdvanced = ref(false)

// 预设配置
const presets = {
  low: {
    name: '低质量 (144 DPI)',
    desc: '体积最小，适合屏幕阅读',
    config: {
      dpi: 144,
      imageQuality: 50,
      colorMode: 'color',
      removeMetadata: true,
      filenamePattern: 'low_{name}'
    }
  },
  medium: {
    name: '中等质量 (150 DPI)',
    desc: '平衡体积与画质，适合网页/办公',
    config: {
      dpi: 150,
      imageQuality: 75,
      colorMode: 'color',
      removeMetadata: true,
      filenamePattern: 'medium_{name}'
    }
  },
  high: {
    name: '高质量 (300 DPI)',
    desc: '高清晰度，适合打印',
    config: {
      dpi: 300,
      imageQuality: 90,
      colorMode: 'color',
      removeMetadata: true,
      filenamePattern: 'high_{name}'
    }
  }
}

const currentPreset = ref<keyof typeof presets>('medium')

// 当前配置（响应式，初始化为默认预设）
const config = reactive<AdvancedConfig>({ ...presets.medium.config } as AdvancedConfig)

// 监听预设变化
watch(currentPreset, (newVal) => {
  Object.assign(config, presets[newVal].config)
})

// 预览相关
const previewDialogVisible = ref(false)
const previewFile = ref<UploadFile | null>(null)
const previewUrl = ref('')
const previewType = ref<'original' | 'compressed'>('original')

// 功能特点
const features = [
  {
    icon: 'Compress',
    title: 'DPI 智能重绘',
    desc: '基于 DPI (72-600) 的智能光栅化重绘技术，精准控制文件清晰度与体积的平衡'
  },
  {
    icon: 'Quality',
    title: '批量处理',
    desc: '支持多线程异步处理多个PDF文件，实时显示压缩进度与体积对比'
  },
  {
    icon: 'Batch',
    title: '灰度模式',
    desc: '支持一键转换为灰度文档，去除冗余色彩信息，对于扫描件可大幅减小体积'
  },
  {
    icon: 'Lock',
    title: '安全隐私',
    desc: '基于浏览器本地计算（WASM/JS），文件无需上传服务器，绝对保障文档安全'
  }
]

// 常见问题
const faqs = [
  {
    question: 'DPI 参数如何选择？',
    answer: 'DPI 决定了文档的分辨率。72 DPI 适合屏幕阅读（体积最小）；150 DPI 适合办公文档（清晰度适中）；300 DPI 以上适合打印输出（高清无损）。'
  },
  {
    question: '灰度模式有什么用？',
    answer: '灰度模式会将文档中的彩色信息移除，转为黑白灰显示。对于合同、发票、书籍扫描件等不依赖颜色的文档，开启灰度模式可以显著减小文件体积。'
  },
  {
    question: '为什么压缩后文本无法复制了？',
    answer: '本工具采用类似于“虚拟打印”的技术（光栅化），将 PDF 页面重新绘制为高压缩率的图片。这能最大程度减小体积，但副作用是文本会变为图像内容。'
  }
]

/**
 * 生成文件缩略图（取第一页）
 */
const generateThumbnail = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
    const page = await pdf.getPage(1)
    const scale = 0.5 // 缩略图不需要太高清
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')

    if (!ctx) return ''

    await page.render({ canvasContext: ctx, viewport }).promise
    return canvas.toDataURL('image/jpeg', 0.8)
  } catch (e) {
    console.error('缩略图生成失败', e)
    return ''
  }
}

/**
 * 处理文件变更
 */
const handleChange = async (uploadFile: any, uploadFiles: any[]) => {
  try {
    if (uploadFile.status !== 'ready') return

    const file = uploadFile.raw
    if (!file || !(file instanceof File)) return

    if (!validateFile(file)) {
      const index = fileList.value.findIndex(f => f.uid === uploadFile.uid)
      if (index !== -1) fileList.value.splice(index, 1)
      return
    }

    // 转换为自定义 UploadFile 对象
    const newFile: UploadFile = {
      uid: uploadFile.uid,
      name: file.name,
      size: file.size,
      status: 'ready',
      progress: 0,
      raw: file,
      url: URL.createObjectURL(file),
      previewImage: '',
      logs: []
    }

    // 生成预览图
    generateThumbnail(file).then(img => {
      newFile.previewImage = img
    })

    const existingIndex = fileList.value.findIndex(f => f.uid === newFile.uid)
    if (existingIndex === -1) {
      fileList.value.push(newFile)
    }

  } catch (error) {
    console.error('文件处理失败:', error)
    ElMessage.error('文件加载失败')
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
}

const handleRemove = (file: UploadFile) => {
  const index = fileList.value.findIndex(item => item.uid === file.uid)
  if (index !== -1) {
    processedFiles.value.delete(file.uid)
    if (file.url) URL.revokeObjectURL(file.url)
    fileList.value.splice(index, 1)
  }
}

/**
 * 验证文件
 */
const validateFile = (file: File): boolean => {
  if (file.size > 100 * 1024 * 1024) {
    ElMessage.error('文件大小超过100MB限制，请压缩或选择较小文件')
    return false
  }
  if (file.type !== 'application/pdf') {
    ElMessage.error(`文件 ${file.name} 不是PDF格式`)
    return false
  }
  return true
}

/**
 * 核心压缩逻辑
 */
const compressFile = async (file: UploadFile): Promise<ProcessedFile> => {
  file.startTime = Date.now()
  file.logs = []
  file.logs.push(`[${new Date().toLocaleTimeString()}] 开始处理文件: ${file.name}`)
  file.progress = 10

  const rawFile = file.raw!
  const arrayBuffer = await rawFile.arrayBuffer()

  // 策略：基于 DPI 的光栅化 (PDF24 风格)
  // 72 DPI is standard screen resolution.
  // Scale factor = Target DPI / 72
  const scaleFactor = config.dpi / 72

  file.logs.push(`策略: DPI 光栅化 (DPI: ${config.dpi}, Scale: ${scaleFactor.toFixed(2)}, Quality: ${config.imageQuality}%)`)

  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
  const totalPages = pdf.numPages

  const firstPage = await pdf.getPage(1)
  const firstViewport = firstPage.getViewport({ scale: 1.0 })

  const doc = new jsPDF({
    orientation: firstViewport.width > firstViewport.height ? 'l' : 'p',
    unit: 'pt',
    format: [firstViewport.width, firstViewport.height]
  })

  for (let i = 1; i <= totalPages; i++) {
    file.progress = 10 + Math.floor((i / totalPages) * 80)

    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: scaleFactor })
    const originalViewport = page.getViewport({ scale: 1.0 })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('Canvas Context creation failed')

    // 颜色模式处理
    if (config.colorMode === 'grayscale') {
      ctx.filter = 'grayscale(100%)'
    }

    await page.render({ canvasContext: ctx, viewport }).promise

    const imgData = canvas.toDataURL('image/jpeg', config.imageQuality / 100)

    if (i > 1) {
      doc.addPage([originalViewport.width, originalViewport.height], originalViewport.width > originalViewport.height ? 'l' : 'p')
    }

    doc.addImage(imgData, 'JPEG', 0, 0, originalViewport.width, originalViewport.height)
  }

  const blob = doc.output('blob')
  file.endTime = Date.now()
  file.logs.push(`处理完成，耗时 ${(file.endTime - file.startTime!) / 1000}s`)

  // 体积检查
  if (blob.size >= file.size) {
    file.logs.push('警告: 压缩后体积未减小，回退至原文件')
    ElMessage.warning(`文件 ${file.name} 已是最佳压缩状态，保留原文件`)
    file.progress = 100
    return {
      blob: file.raw!,
      url: URL.createObjectURL(file.raw!),
      size: file.size
    }
  }

  file.progress = 100
  return { blob, url: URL.createObjectURL(blob), size: blob.size }
}

/**
 * 批量压缩
 */
const compressPDF = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传PDF文件')
    return
  }

  isProcessing.value = true
  const filesToProcess = fileList.value.filter(f => f.status === 'ready' || f.status === 'error')

  if (filesToProcess.length === 0) {
    ElMessage.warning('没有待处理的文件')
    isProcessing.value = false
    return
  }

  filesToProcess.forEach(f => {
    f.status = 'processing'
    f.progress = 0
  })

  for (const file of filesToProcess) {
    try {
      const result = await compressFile(file)
      processedFiles.value.set(file.uid, result)
      file.status = 'success'
    } catch (error) {
      console.error(error)
      file.status = 'error'
      file.progress = 0
      file.logs?.push(`错误: ${error}`)
      ElMessage.error(`文件 ${file.name} 压缩失败`)
    }
  }

  isProcessing.value = false
  ElMessage.success('处理完成')
}

/**
 * 重新压缩
 */
const recompressFile = async (file: UploadFile) => {
  if (file.status === 'processing') return

  file.status = 'processing'
  file.progress = 0
  processedFiles.value.delete(file.uid)

  try {
    const result = await compressFile(file)
    processedFiles.value.set(file.uid, result)
    file.status = 'success'
    ElMessage.success(`文件 ${file.name} 重新压缩完成`)
  } catch (error) {
    console.error(error)
    file.status = 'error'
    file.progress = 0
    ElMessage.error(`文件 ${file.name} 重新压缩失败`)
  }
}

/**
 * 获取输出文件名
 */
const getOutputFilename = (originalName: string) => {
  const nameWithoutExt = originalName.replace(/\.pdf$/i, '')
  const date = new Date().toISOString().split('T')[0]

  let pattern = config.filenamePattern || 'compressed_{name}'
  let finalName = pattern
    .replace('{name}', nameWithoutExt)
    .replace('{date}', date)

  if (!finalName.toLowerCase().endsWith('.pdf')) {
    finalName += '.pdf'
  }
  return finalName
}

/**
 * 下载单个文件
 */
const downloadFile = (file: UploadFile) => {
  const processed = processedFiles.value.get(file.uid)
  if (!processed) return

  const link = document.createElement('a')
  link.href = processed.url
  link.download = getOutputFilename(file.name)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 打包下载
 */
const downloadAllFiles = async () => {
  const successFiles = fileList.value.filter(f => f.status === 'success')
  if (successFiles.length === 0) return

  if (successFiles.length === 1) {
    downloadFile(successFiles[0])
    return
  }

  const zip = new JSZip()
  const folder = zip.folder('compressed_pdfs')

  successFiles.forEach(file => {
    const processed = processedFiles.value.get(file.uid)
    if (processed && folder) {
      folder.file(getOutputFilename(file.name), processed.blob)
    }
  })

  const content = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(content)
  link.download = `batch_compressed_${Date.now()}.zip`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const clearAll = () => {
  fileList.value.forEach(f => {
    if (f.url) URL.revokeObjectURL(f.url)
  })
  processedFiles.value.forEach(p => URL.revokeObjectURL(p.url))
  fileList.value = []
  processedFiles.value.clear()
  if (dataFileRef.value) dataFileRef.value.clearFiles()
}

const formatSize = (size: number) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

// 预览功能
const showPreview = (file: UploadFile) => {
  previewFile.value = file
  if (file.status === 'success' && processedFiles.value.has(file.uid)) {
    previewType.value = 'compressed'
    previewUrl.value = processedFiles.value.get(file.uid)!.url
  } else {
    previewType.value = 'original'
    previewUrl.value = file.url || ''
  }
  previewDialogVisible.value = true
}

const switchPreviewType = (type: 'original' | 'compressed') => {
  if (!previewFile.value) return
  previewType.value = type
  if (type === 'original') {
    previewUrl.value = previewFile.value.url || ''
  } else {
    previewUrl.value = processedFiles.value.get(previewFile.value.uid)?.url || ''
  }
}

const getCompressionRatio = (file: UploadFile) => {
  if (file.status !== 'success') return '-'
  const processed = processedFiles.value.get(file.uid)
  if (!processed) return '-'
  const ratio = ((1 - processed.size / file.size) * 100).toFixed(1)
  return `${ratio}%`
}

const showLogs = (file: UploadFile) => {
  ElMessageBox.alert(
    (file.logs || []).join('<br>'),
    '处理日志',
    {
      dangerouslyUseHTMLString: true,
      customClass: 'log-message-box'
    }
  )
}

</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 标题区域 -->
      <div class="bg-white rounded-xl p-8 mb-4">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">{{ info.title }}</h2>
          <p class="text-gray-500 text-sm">{{ info.subtitle }}</p>
        </div>

        <!-- 上传区域 -->
        <div
          class="relative border-2 border-dashed rounded-xl min-h-[240px] flex flex-col items-center justify-center transition-all duration-300"
          :class="isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'"
          @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop="handleDrop">
          <el-upload v-model:file-list="fileList" class="upload-area w-full h-full absolute inset-0" ref="dataFileRef"
            accept="application/pdf" :auto-upload="false" :on-change="handleChange" :show-file-list="false" multiple
            drag>
            <div class="flex flex-col items-center justify-center h-full py-10">
              <div class="w-16 h-16 mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div class="text-lg font-medium text-gray-700 mb-2">
                点击或拖拽 PDF 文件到此处
              </div>
              <p class="text-sm text-gray-400">支持批量上传，单个文件最大 100MB</p>
            </div>
          </el-upload>
        </div>

        <!-- 控制面板 -->
        <div v-if="fileList.length > 0" class="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
          <div class="flex flex-col gap-6">

            <!-- 预设选择 -->
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-gray-700">压缩模式：</span>
                <div class="flex bg-gray-100 rounded-lg p-1">
                  <button v-for="(preset, key) in presets" :key="key" @click="currentPreset = key"
                    class="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
                    :class="currentPreset === key ? 'bg-white text-blue-600' : 'text-gray-500 hover:text-gray-700'">
                    {{ preset.name }}
                  </button>
                </div>
                <span class="text-xs text-gray-500 ml-2 hidden sm:inline-block">{{ presets[currentPreset].desc }}</span>
              </div>
            </div>

            <!-- 高级设置 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              <!-- DPI 设置 -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 flex justify-between">
                  DPI (分辨率)
                  <span class="text-blue-600">{{ config.dpi }}</span>
                </label>
                <el-input-number v-model="config.dpi" :min="72" :max="600" :step="10" class="w-full" />
                <p class="text-xs text-gray-400">屏幕72，Web 150，打印300+</p>
              </div>

              <!-- 图片质量 -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 flex justify-between">
                  图片质量
                  <span class="text-blue-600">{{ config.imageQuality }}%</span>
                </label>
                <el-slider v-model="config.imageQuality" :min="10" :max="100" :step="5" />
                <p class="text-xs text-gray-400">数值越低体积越小，建议 50-85</p>
              </div>

              <!-- 颜色模式 -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">颜色模式</label>
                <el-select v-model="config.colorMode" class="w-full">
                  <el-option label="彩色 (Color)" value="color" />
                  <el-option label="灰度 (Grayscale)" value="grayscale" />
                </el-select>
                <p class="text-xs text-gray-400">灰度模式可进一步减小体积</p>
              </div>

              <!-- 文件命名 -->
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">输出文件名规则</label>
                <el-input v-model="config.filenamePattern" placeholder="例如: compressed_{name}" />
                <p class="text-xs text-gray-400">支持变量: {name}, {date}</p>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-4 justify-end border-t border-gray-100 pt-4">
              <button @click="clearAll" :disabled="isProcessing"
                class="px-6 py-2.5 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium transition-colors disabled:opacity-50">
                清空列表
              </button>
              <button @click="compressPDF" :disabled="isProcessing"
                class="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center disabled:opacity-60 disabled:cursor-not-allowed">
                <svg v-if="isProcessing" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
                {{ isProcessing ? '正在处理...' : '开始压缩' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 文件列表 -->
        <div v-if="fileList.length > 0" class="mt-6 space-y-4">
          <div v-for="file in fileList" :key="file.uid"
            class="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">

            <!-- 缩略图 -->
            <div
              class="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 group relative">
              <img v-if="file.previewImage" :src="file.previewImage" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                  </path>
                </svg>
              </div>
            </div>

            <!-- 文件信息 -->
            <div class="flex-1 w-full">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-md" :title="file.name">{{
                    file.name }}
                  </h4>
                  <div class="flex items-center text-xs text-gray-500 mt-1 gap-3">
                    <span>原始: {{ formatSize(file.size) }}</span>
                    <span v-if="file.status === 'success'" class="text-green-600 font-medium">
                      压缩后: {{ formatSize(processedFiles.get(file.uid)?.size || 0) }}
                    </span>
                  </div>
                </div>

                <!-- 状态标签 -->
                <div class="flex items-center gap-2">
                  <button v-if="file.logs && file.logs.length > 0" @click="showLogs(file)"
                    class="text-gray-400 hover:text-blue-600" title="查看日志">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                      </path>
                    </svg>
                  </button>
                  <span v-if="file.status === 'success'"
                    class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    减小 {{ getCompressionRatio(file) }}
                  </span>
                  <span v-else-if="file.status === 'error'"
                    class="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">失败</span>
                  <span v-else-if="file.status === 'processing'"
                    class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">处理中</span>
                  <span v-else class="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">待处理</span>
                </div>
              </div>

              <!-- 进度条 -->
              <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div class="h-full bg-blue-500 transition-all duration-300 rounded-full"
                  :style="{ width: `${file.progress}%` }"
                  :class="{ 'bg-green-500': file.status === 'success', 'bg-red-500': file.status === 'error' }"></div>
              </div>
            </div>

            <!-- 操作 -->
            <div class="flex gap-2 w-full sm:w-auto justify-end">
              <button @click="showPreview(file)"
                class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="预览">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z">
                  </path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                  </path>
                </svg>
              </button>
              <button v-if="file.status === 'success'" @click="recompressFile(file)"
                class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="重新压缩">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
                  </path>
                </svg>
              </button>
              <button v-if="file.status === 'success'" @click="downloadFile(file)"
                class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="下载">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
              </button>
              <button @click="handleRemove(file)"
                class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                  </path>
                </svg>
              </button>
            </div>
          </div>

          <!-- 底部批量下载 -->
          <div v-if="fileList.some(f => f.status === 'success')" class="flex justify-center pt-4">
            <button @click="downloadAllFiles"
              class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              打包下载全部 ({{fileList.filter(f => f.status === 'success').length}})
            </button>
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
              <svg v-if="feature.icon === 'Compress'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3">
                </path>
              </svg>
              <svg v-else-if="feature.icon === 'Quality'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <svg v-else-if="feature.icon === 'Batch'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2">
                </path>
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                </path>
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
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
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" :title="previewFile?.name" width="90%" top="5vh" destroy-on-close
      class="preview-dialog">
      <div class="h-[80vh] flex flex-col">
        <!-- 顶部切换栏 -->
        <div class="flex justify-center gap-4 mb-4">
          <button @click="switchPreviewType('original')"
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="previewType === 'original' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            原始文件
          </button>
          <button v-if="previewFile?.status === 'success'" @click="switchPreviewType('compressed')"
            class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            :class="previewType === 'compressed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            压缩后
          </button>
        </div>

        <!-- 预览内容 -->
        <div class="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
          <iframe v-if="previewUrl" :src="previewUrl" class="w-full h-full border-0"></iframe>
          <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
            无法预览
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0;
}

.upload-area :deep(.el-upload) {
  width: 100%;
  height: 100%;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 隐藏滚动条但保留功能 */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
