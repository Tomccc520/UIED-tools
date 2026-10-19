<!--
 * @file ImageCompress.vue
 * @description 图片压缩工具组件，支持JPG、PNG、WebP格式的图片压缩
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-22
 *
 * 功能特性：
 * 1. 支持拖拽和点击上传图片
 * 2. 支持批量压缩和打包下载
 * 3. 支持压缩质量调节
 * 4. 支持JPG、PNG、WebP格式
 * 5. 本地压缩，无需上传服务器
 *
 * 主要组件：
 * - 文件上传区域
 * - 压缩质量控制
 * - 文件列表展示
 * - 压缩效果示例
 * - 常见问题解答
 -->

<template>
  <div>
    <StandardToolPageTemplate
      eyebrow="图片工具"
      title="图片压缩"
      description="在浏览器本地批量压缩 JPG、PNG 和 WebP，保留预览、质量调节与打包下载能力。"
      workspace-label="图片 / 01"
    >
      <template #meta>
        <span class="image-meta">本地处理</span>
        <span class="image-meta">最多 {{ IMAGE_COMPRESS_MAX_FILE_COUNT }} 个文件</span>
        <span class="image-meta">单个不超过 {{ IMAGE_COMPRESS_MAX_FILE_SIZE_MB }}MB</span>
      </template>

      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-4 sm:p-8 mb-4 shadow-sm">
        <!-- 配置区域 -->
        <div class="grid grid-cols-1 gap-8">
          <!-- 上传区域 -->
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" multiple accept="image/jpeg,image/png,image/webp" class="hidden"
              @change="handleFileInputChange" />

            <div class="absolute inset-0 cursor-pointer z-10" @click="triggerFileInput"></div>

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片到这里</div>
              <p class="text-xs text-gray-400 mb-1">
                最多选择 {{ IMAGE_COMPRESS_MAX_FILE_COUNT }} 个图片，单个文件最大 {{ IMAGE_COMPRESS_MAX_FILE_SIZE_MB }}MB
              </p>
              <p class="text-xs text-gray-400">
                支持 {{ IMAGE_COMPRESS_SUPPORTED_FORMATS }} 格式
              </p>
            </div>
          </div>

          <!-- 压缩质量控制面板 -->
          <div v-if="fileList.length > 0" class="bg-gray-50 rounded-lg p-3 sm:p-6">
            <div class="mb-4 text-gray-700 font-medium">压缩设置</div>
            <div class="space-y-6">
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-600">压缩质量</span>
                  <span class="text-sm text-gray-500">{{ quality }}%</span>
                </div>
                <el-slider v-model="quality" :min="1" :max="100" :step="1" :disabled="isBusy" />
              </div>
              <div class="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  data-smoke="image-compress-start"
                  :disabled="isBusy"
                  @click="compressAll"
                  class="image-action image-action--primary flex-1 !h-10"
                >
                  {{ isCompressing ? '压缩中...' : '开始压缩' }}
                </button>
                <button v-if="fileList.length > 0" type="button" :disabled="isBusy" @click="recompress" class="image-action flex-1 !h-10">
                  重新压缩
                </button>
                <button
                  v-if="fileList.length > 0"
                  type="button"
                  data-smoke="image-compress-download"
                  :disabled="isBusy"
                  @click="downloadAll"
                  class="image-action image-action--success flex-1 !h-10"
                >
                  {{ isPackaging ? '打包中...' : '打包下载' }}
                </button>
              </div>
            </div>
          </div>

          <!-- 文件列表展示区域 -->
          <div v-if="fileList.length > 0" class="bg-gray-50 rounded-lg p-3 sm:p-6">
            <div class="mb-4 text-gray-700 font-medium">文件列表</div>
            <div class="border border-gray-100 rounded-lg divide-y divide-gray-100 bg-white shadow-sm">
              <div v-for="(file, index) in fileList" :key="index" class="p-3 hover:bg-gray-50" data-smoke="image-compress-file">
                <!-- 文件名称和删除按钮 -->
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2 min-w-0">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm text-gray-600 break-all">{{ file.name }}</span>
                  </div>
                  <button type="button" :aria-label="`移除 ${file.name}`" @click="removeFile(index)" :disabled="isBusy"
                    class="text-gray-400 hover:text-red-500 transition-colors duration-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- 压缩进度和结果展示 -->
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <!-- 左侧：原始文件大小和预览 -->
                  <div class="flex flex-col min-w-[120px]">
                    <span class="text-xs text-gray-400 mb-1">压缩前</span>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-500">
                        {{ formatFileSize(file.size) }}
                      </span>
                      <el-image v-if="file.previewUrl" class="w-8 h-8 rounded object-cover cursor-pointer"
                        :src="file.previewUrl" :preview-src-list="[file.previewUrl]" fit="cover" hide-on-click-modal />
                    </div>
                  </div>

                  <!-- 中间：箭头或加载状态 -->
                  <div class="hidden sm:flex items-center px-4">
                    <template v-if="processingIndex === index">
                      <svg class="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </template>
                    <template v-else>
                      <svg class="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </template>
                  </div>

                  <!-- 右：压缩后大小和预览 -->
                  <div class="flex flex-col sm:min-w-[180px] sm:items-end">
                    <span class="text-xs text-gray-400 mb-1">压缩后</span>
                    <div class="flex items-center space-x-4">
                      <template v-if="file.compressedSize">
                        <div class="flex items-center space-x-2">
                          <div class="flex flex-col">
                            <span class="text-sm text-blue-500">
                              {{ formatFileSize(file.compressedSize) }}
                            </span>
                            <span v-if="file.compressionRatio && file.compressionRatio > 0"
                              class="text-xs text-green-500 whitespace-nowrap">
                              (-{{ file.compressionRatio.toFixed(0) }}%)
                            </span>
                          </div>
                        </div>
                        <a v-if="file.compressedUrl" :href="file.compressedUrl" :download="downloadNames[index]" :aria-label="`下载 ${file.name}`"
                          class="text-blue-500 hover:text-blue-600">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </template>
                      <p v-else-if="file.error" class="text-xs text-red-600" role="alert">{{ file.error }}</p>
                      <template v-else>
                        <span class="text-xs text-gray-400">
                          {{ processingIndex === index ? '压缩中...' : '等待压缩' }}
                        </span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 底部操作栏 -->
              <div class="p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                <div class="text-sm text-gray-500">
                  共 {{ fileList.length }} 个文件
                  <span v-if="compressedCount > 0" class="ml-2 text-blue-500">
                    已完成: {{ compressedCount }}
                  </span>
                </div>
                <div class="flex space-x-3 w-full sm:w-auto">
                  <el-button @click="clearFiles" :disabled="isBusy" size="large" class="flex-1 sm:flex-none !h-10">
                    清空文件列表
                  </el-button>
                  <el-button data-smoke="image-compress-download" v-if="compressedCount > 0" :disabled="isBusy" type="success" size="large" @click="downloadAll"
                    class="flex-1 sm:flex-none !h-10">
                    打包下载 ({{ compressedCount }})
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 压缩效果说明 -->
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border border-gray-100 rounded-lg p-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                    </svg>
                  </div>
                  <h4 class="text-base font-medium text-gray-900">JPG/JPEG</h4>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">
                  使用智能压缩算法，在保持图片清晰度的同时，压缩效果取决于原图，适合照片等复杂图像
                </p>
              </div>

              <div class="border border-gray-100 rounded-lg p-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                    </svg>
                  </div>
                  <h4 class="text-base font-medium text-gray-900">PNG</h4>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">
                  通过颜色量化减小文件，保留透明通道；100% 质量使用无损编码，适合图标、截图等图像
                </p>
              </div>

              <div class="border border-gray-100 rounded-lg p-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                    </svg>
                  </div>
                  <h4 class="text-base font-medium text-gray-900">WebP</h4>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">
                  采用先进的WebP格式压缩，可通过质量调节减小体积，压缩效果取决于原图，适合网页图片
                </p>
              </div>
            </div>

            <!-- 功能说明 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="flex items-start space-x-2">
                <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <p class="text-sm text-gray-600 leading-relaxed">智能压缩算法：保持图片清晰度的同时，最大程度减小文件体积</p>
              </div>
              <div class="flex items-start space-x-2">
                <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <p class="text-sm text-gray-600 leading-relaxed">灵活压缩选项：提供多档压缩质量，满足不同场景需求</p>
              </div>
              <div class="flex items-start space-x-2">
                <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <p class="text-sm text-gray-600 leading-relaxed">安全本地处理：所有压缩过程在浏览器本地完成，保数据安全</p>
              </div>
            </div>
          </div>

          <!-- 常见问题解答 -->
          <div class="bg-white rounded-xl p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="(item, index) in faq" :key="index"
                class="pb-6 last:pb-0 border-b border-gray-200 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.q }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ item.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #actions>
        <el-button @click="clearFiles" :disabled="isBusy" size="large">清空文件列表</el-button>
        <el-button v-if="compressedCount > 0" data-smoke="image-compress-download" :disabled="isBusy" type="success" size="large" @click="downloadAll">
          打包下载 ({{ compressedCount }})
        </el-button>
      </template>
    </StandardToolPageTemplate>
    <!-- 工具推荐 -->
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
/**
 * 组件依赖导入
 */
import { ref, computed, onBeforeUnmount } from 'vue'
import { UploadRawFile } from 'element-plus'
import Compressor from 'compressorjs'
import { autoDown } from '@/utils/file'
import { ElMessage } from 'element-plus'
import * as UPNG from 'upng-js'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import StandardToolPageTemplate from '@/components/Common/PageTemplates/StandardToolPageTemplate.vue'
import { useRoute } from 'vue-router'
import JSZip from 'jszip'
import { createImageArchiveEntries, createImageArchiveNames } from '@/utils/imageCompressionArchive'
import {
  IMAGE_COMPRESS_MAX_FILE_COUNT,
  IMAGE_COMPRESS_MAX_FILE_SIZE_MB,
  IMAGE_COMPRESS_SUPPORTED_FORMATS
} from '@/constants/imageCompress'

/**
 * 工具函数：URL对象管理
 */
const createObjectURL = (file: Blob): string => {
  return window.URL.createObjectURL(file)
}

/**
 * 延迟释放打包下载地址，确保浏览器已经开始读取文件后再回收 Blob URL。
 */
const DOWNLOAD_URL_REVOKE_DELAY_MS = 1000

/** 释放预览或下载使用的对象地址。 */
const revokeObjectURL = (url: string) => {
  window.URL.revokeObjectURL(url)
}

/**
 * 类型定义
 */
interface CompressedFile {
  source: File
  name: string
  type: string
  size: number
  compressedSize?: number
  compressedUrl?: string
  compressionRatio?: number
  originalSize?: number
  previewUrl?: string
  compressedBlob?: Blob
  error?: string
}

/**
 * 常见问题
 */
const faq = [
  {
    q: '支持哪些图片格式？',
    a: '支持上传JPG、PNG、WebP等常见图片格式，压缩后可以选择导出为相同格式。'
  },
  {
    q: '压缩后的图片质量如何？',
    a: '我们采用智能压缩算法，在保证视觉效果的同时最大程度减小文件体积，您可以通过调节压缩质量来平衡大小和清晰度。'
  },
  {
    q: '如何保持图片透明背景？',
    a: '对于带有透明背景的PNG图片，压缩时会自动保留透明通道，无需额外设置。'
  },
  {
    q: '有文件大小限制吗？',
    a: `单个文件不能超过${IMAGE_COMPRESS_MAX_FILE_SIZE_MB}MB，如果需要压缩更大的图片，建议先裁剪或调整分辨率。`
  }
]

/**
 * 状态管理
 */
const fileList = ref<CompressedFile[]>([])
const downloadNames = computed(() => createImageArchiveNames(fileList.value))
const quality = ref(80)
const isCompressing = ref(false)
const isPackaging = ref(false)
const isBusy = computed(() => isCompressing.value || isPackaging.value)
let disposed = false
const isDragging = ref(false)
const processingIndex = ref(-1)

/**
 * 根据 MIME 类型和文件后缀解析图片格式，兼容拖拽文件没有正确 MIME 的浏览器场景。
 * @param file 待校验的文件对象
 * @returns 统一后的图片 MIME 类型，不支持时返回 null
 */
const resolveImageMimeType = (file: Pick<File, 'type' | 'name'>): 'image/jpeg' | 'image/png' | 'image/webp' | null => {
  const mimeType = file.type.toLowerCase()
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'image/jpeg'
  if (mimeType === 'image/png') return 'image/png'
  if (mimeType === 'image/webp') return 'image/webp'

  const extension = file.name.toLowerCase().split('.').pop() || ''
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg'
  if (extension === 'png') return 'image/png'
  if (extension === 'webp') return 'image/webp'
  return null
}

/**
 * 计算已压缩文件数量
 */
const compressedCount = computed(() => {
  return fileList.value.filter((file: CompressedFile) => file.compressedSize).length
})

/**
 * 处理文件上传
 */
const handleUpload = (file: UploadRawFile) => {
  if (isBusy.value) {
    ElMessage.info('图片正在处理，请稍候')
    return false
  }

  if (!file) {
    return false
  }

  if (!resolveImageMimeType(file)) {
    ElMessage.warning(`仅支持${IMAGE_COMPRESS_SUPPORTED_FORMATS}格式图片`)
    return false
  }

  if (file.size > IMAGE_COMPRESS_MAX_FILE_SIZE_MB * 1024 * 1024) {
    ElMessage.warning(`文件 ${file.name} 超过${IMAGE_COMPRESS_MAX_FILE_SIZE_MB}MB，请选择更小的文件`)
    return false
  }

  if (fileList.value.length >= IMAGE_COMPRESS_MAX_FILE_COUNT) {
    ElMessage.warning(`最多只能上传${IMAGE_COMPRESS_MAX_FILE_COUNT}个文件`)
    return false
  }

  try {
    // 使用普通响应式条目保存状态，File 的自定义属性不会被 Vue 追踪。
    fileList.value.push({ source: file, name: file.name, type: file.type, size: file.size, previewUrl: createObjectURL(file) })
    return false
  } catch (error) {
    console.error('Error handling file upload:', error)
    ElMessage.error('文件上传失败，请重试')
    return false
  }
}

/**
 * 处理文件拖放
 */
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  if (isBusy.value) return

  const files = e.dataTransfer?.files
  if (!files) {
    return
  }

  Array.from(files).forEach((file: File) => {
    handleUpload(file as UploadRawFile)
  })
}

/**
 * 移除文件
 */
const removeFile = (index: number) => {
  if (isBusy.value) return
  const file = fileList.value[index]
  if (file.previewUrl) {
    revokeObjectURL(file.previewUrl)
  }
  if (file.compressedUrl) {
    revokeObjectURL(file.compressedUrl)
  }
  fileList.value.splice(index, 1)
}

/**
 * 清空文件列表
 */
const clearFiles = () => {
  if (isBusy.value) return
  fileList.value.forEach((file: CompressedFile) => {
    if (file.previewUrl) {
      revokeObjectURL(file.previewUrl)
    }
    if (file.compressedUrl) {
      revokeObjectURL(file.compressedUrl)
    }
  })
  fileList.value = []
}

/**
 * 压缩PNG图片
 */
const compressPNG = async (file: File, batchQuality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const img = new Image()
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (!ctx) {
              reject(new Error('无法创建canvas上下文'))
              return
            }

            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

            // 根据质量选择颜色数量
            let colors = 256
            if (batchQuality < 30) colors = 32
            else if (batchQuality < 50) colors = 64
            else if (batchQuality < 70) colors = 128
            else if (batchQuality < 100) colors = 256
            else colors = 0

            const pngData = UPNG.encode(
              [imageData.data.buffer],
              canvas.width,
              canvas.height,
              colors
            )

            resolve(new Blob([pngData as BlobPart], { type: 'image/png' }))
          } catch (err) {
            reject(err)
          }
        }
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = e.target?.result as string
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

/**
 * 压缩JPEG/JPG图片
 */
const compressJPEG = async (file: File, batchQuality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    new Compressor(new Blob([file], { type: resolveImageMimeType(file) || file.type }), {
      quality: batchQuality / 100,
      maxWidth: 4096,
      maxHeight: 4096,
      convertSize: 5000000,
      mimeType: 'image/jpeg',
      success(result) {
        resolve(result)
      },
      error(err) {
        reject(err)
      }
    })
  })
}

/**
 * 压缩WebP图片
 */
const compressWebP = async (file: File, batchQuality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    new Compressor(new Blob([file], { type: resolveImageMimeType(file) || file.type }), {
      quality: batchQuality / 100,
      maxWidth: 4096,
      maxHeight: 4096,
      convertSize: 5000000,
      mimeType: 'image/webp',
      success(result) {
        resolve(result)
      },
      error(err) {
        reject(err)
      }
    })
  })
}

/**
 * 压缩单个文件
 */
const compressFile = async (file: CompressedFile, batchQuality: number): Promise<boolean> => {
  const fileIndex = fileList.value.indexOf(file)
  if (fileIndex < 0) return false
  processingIndex.value = fileIndex
  file.error = undefined

  try {
    let result: Blob
    const mimeType = resolveImageMimeType(file)
    if (!mimeType) {
      throw new Error('不支持的图片格式')
    }

    // 根据文件类型选择压缩方法
    switch (mimeType) {
      case 'image/png':
        result = await compressPNG(file.source, batchQuality)
        break
      case 'image/jpeg':
        result = await compressJPEG(file.source, batchQuality)
        break
      case 'image/webp':
        result = await compressWebP(file.source, batchQuality)
        break
      default:
        throw new Error('不支持的图片格式')
    }

    if (disposed) return false

    // 检查压缩结果
    if (result.size >= file.size) {
      result = file.source
    }

    // 更新文件状态
    const compressedFile = fileList.value.find((item) => item === file)
    if (!compressedFile) {
      throw new Error('文件不存在')
    }

    // 更新压缩信息
    compressedFile.compressedBlob = result
    compressedFile.compressedSize = result.size
    compressedFile.originalSize = file.size
    compressedFile.compressionRatio = ((file.size - result.size) / file.size) * 100

    // 更新压缩后的URL
    if (compressedFile.compressedUrl) {
      revokeObjectURL(compressedFile.compressedUrl)
    }
    compressedFile.compressedUrl = createObjectURL(result)
    return true
  } catch (error) {
    if (disposed) return false
    console.error('[图片压缩] 文件处理失败', error instanceof Error ? error.message : '未知错误')
    clearCompressedResult(file)
    file.error = '压缩失败，图片可能已损坏，请移除后重新选择或重试'
    ElMessage.error(`文件 ${file.name} 压缩失败，请重试`)
    return false
  } finally {
    processingIndex.value = -1
  }
}

/** 清理单张图片的旧结果，避免重试失败后仍下载上次结果。 */
const clearCompressedResult = (file: CompressedFile) => {
  if (file.compressedUrl) revokeObjectURL(file.compressedUrl)
  file.compressedUrl = undefined
  file.compressedBlob = undefined
  file.compressedSize = undefined
  file.compressionRatio = undefined
}

/** 按顺序压缩给定图片，并固定本批质量，避免中途修改导致不同图片使用不同设置。 */
const compressBatch = async (files: CompressedFile[]) => {
  isCompressing.value = true
  const batchQuality = quality.value
  let failedCount = 0
  try {
    for (const file of files) {
      if (disposed) break
      if (!(await compressFile(file, batchQuality))) failedCount += 1
    }
  } finally {
    isCompressing.value = false
    processingIndex.value = -1
  }
  return failedCount
}

/** 按顺序压缩全部图片；单张失败不会阻止后续图片，并保留可重试的错误状态。 */
const compressAll = async () => {
  if (isBusy.value) return
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要压缩的图片')
    return
  }
  const failedCount = await compressBatch([...fileList.value])
  if (disposed) return
  if (failedCount > 0) ElMessage.warning(`压缩完成，${failedCount} 个文件失败，请重试`)
  else ElMessage.success('所有图片压缩完成')
}

/** 打包全部有效结果；先压缩新增图片，并锁定文件列表直到下载文件生成完毕。 */
const downloadAll = async () => {
  if (isBusy.value) return
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要压缩的图片')
    return
  }
  isPackaging.value = true
  try {
    const pendingFiles = fileList.value.filter((file) => !file.compressedBlob)
    if (pendingFiles.length > 0) await compressBatch(pendingFiles)
    if (disposed) return
    const compressedFiles = fileList.value.filter((file) => file.compressedBlob)
    if (compressedFiles.length === 0) {
      ElMessage.warning('没有可下载的压缩文件，请检查图片后重试')
      return
    }
    const zip = new JSZip()
    for (const entry of createImageArchiveEntries(fileList.value)) {
      zip.file(entry.name, entry.blob)
    }
    const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
    if (disposed) return
    const zipUrl = URL.createObjectURL(content)
    autoDown(zipUrl, 'uied_compressed_images.zip')
    window.setTimeout(() => revokeObjectURL(zipUrl), DOWNLOAD_URL_REVOKE_DELAY_MS)
    const failedCount = fileList.value.length - compressedFiles.length
    if (failedCount > 0) ElMessage.warning(`已下载 ${compressedFiles.length} 张图片，${failedCount} 张失败未打包，请检查列表后重试`)
    else ElMessage.success('打包下载成功')
  } catch (error) {
    if (disposed) return
    console.error('[图片压缩] 打包失败', error instanceof Error ? error.message : '未知错误')
    ElMessage.error('打包下载失败，请重试')
  } finally {
    isPackaging.value = false
  }
}

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
 * 添加新的文件上传处理方法
 */
const fileInputRef = ref<HTMLInputElement | null>(null)

/** 打开文件选择器，处理任务期间禁止修改批次。 */
const triggerFileInput = () => {
  if (isBusy.value) return
  fileInputRef.value?.click()
}

/** 接收整批选择并重置 input，使移除后可以再次选择同一图片。 */
const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return

  Array.from(input.files).forEach((file: File) => {
    handleUpload(file as UploadRawFile)
  })

  // 清空 input 值，允许重复选择同一文件
  input.value = ''
}

/**
 * 添加重新压缩功能
 */
const recompress = async () => {
  if (isBusy.value) return
  if (fileList.value.length === 0) {
    ElMessage.warning('没有可压缩的图片')
    return
  }

  // 清除之前的压缩结果。
  fileList.value.forEach(clearCompressedResult)

  // 重新压缩
  await compressAll()
}

/** 页面卸载时释放预览及结果地址，并阻止未完成任务回写和继续处理下一张。 */
onBeforeUnmount(() => {
  disposed = true
  for (const file of fileList.value) {
    if (file.previewUrl) revokeObjectURL(file.previewUrl)
    clearCompressedResult(file)
  }
})

const route = useRoute()
</script>

<style scoped>
.image-meta {
  padding: 5px 9px;
  border: 1px solid #dfe2ea;
  color: #687083;
  font-size: 11px;
}

.image-action {
  border: 1px solid #d9dde7;
  color: #475467;
  background: #fff;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
  transition: filter .2s ease, opacity .2s ease;
}

.image-action:hover:not(:disabled) { filter: brightness(.97); }
.image-action:disabled { opacity: .55; cursor: not-allowed; }
.image-action--primary { border-color: #409eff; color: #fff; background: #409eff; }
.image-action--success { border-color: #67c23a; color: #fff; background: #67c23a; }

/* 禁用图片拖动 */
img {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 滑块容器样式 */
.slider-container {
  touch-action: none;
}
</style>
