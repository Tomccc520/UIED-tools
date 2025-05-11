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
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
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
                最多选择 30 个图片，单个文件最大 25MB
              </p>
              <p class="text-xs text-gray-400">
                支持 JPG、PNG、WebP 格式
              </p>
            </div>
          </div>

          <!-- 压缩质量控制面板 -->
          <div v-if="fileList.length > 0" class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">压缩设置</div>
            <div class="space-y-6">
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-600">压缩质量</span>
                  <span class="text-sm text-gray-500">{{ quality }}%</span>
                </div>
                <el-slider v-model="quality" :min="1" :max="100" :step="1" />
              </div>
              <div class="flex space-x-3">
                <el-button type="primary" size="large" :loading="isCompressing" @click="compressAll"
                  class="flex-1 !h-10">
                  {{ isCompressing ? '压缩中...' : '开始压缩' }}
                </el-button>
                <el-button v-if="fileList.length > 0" size="large" @click="recompress" class="flex-1 !h-10">
                  重新压缩
                </el-button>
                <el-button v-if="fileList.length > 0" type="success" size="large" @click="downloadAll"
                  class="flex-1 !h-10">
                  打包下载
                </el-button>
              </div>
            </div>
          </div>

          <!-- 文件列表展示区域 -->
          <div v-if="fileList.length > 0" class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">文件列表</div>
            <div class="border border-gray-100 rounded-lg divide-y divide-gray-100 bg-white shadow-sm">
              <div v-for="(file, index) in fileList" :key="index" class="p-3 hover:bg-gray-50">
                <!-- 文件名称和删除按钮 -->
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center space-x-2">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm text-gray-600">{{ file.name }}</span>
                  </div>
                  <button @click="removeFile(index)"
                    class="text-gray-400 hover:text-red-500 transition-colors duration-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <!-- 压缩进度和结果展示 -->
                <div class="flex items-center justify-between">
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
                  <div class="flex items-center px-4">
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
                  <div class="flex flex-col min-w-[180px] items-end">
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
                        <a v-if="file.compressedUrl" :href="file.compressedUrl" :download="`uied_${file.name}`"
                          class="text-blue-500 hover:text-blue-600">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </template>
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
                  <el-button @click="clearFiles" size="large" class="flex-1 sm:flex-none !h-10">
                    清空文件列表
                  </el-button>
                  <el-button v-if="compressedCount > 0" type="success" size="large" @click="downloadAll"
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
                  使用智能压缩算法，在保持图片清晰度的同时，可实现60%-80%的压缩率，适合照片等复杂图像
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
                  通过优化颜色数量和无损压缩，可实现40%-60%的压缩率，适合图标、截图等简单图像
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
                  采用先进的WebP格式压缩，在保持原有质量的同时，可实现30%-50%的压缩率，适合网页图片
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

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 组件依赖导入
 */
import { ref, reactive, computed, watch } from '@vue/runtime-core'
import { UploadRawFile } from 'element-plus'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import Compressor from 'compressorjs'
import { autoDown } from '@/utils/file'
import { ElMessage } from 'element-plus'
import * as UPNG from 'upng-js'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import JSZip from 'jszip'

interface JSZipInstance {
  file: (path: string, data: Blob, options?: { binary: boolean }) => void;
  generateAsync: (options: { type: string; compression?: string; compressionOptions?: { level: number } }) => Promise<Blob>;
}

interface JSZipConstructor {
  new(): JSZipInstance;
}

/**
 * 工具函数：URL对象管理
 */
const createObjectURL = (file: Blob): string => {
  return window.URL.createObjectURL(file)
}

const revokeObjectURL = (url: string) => {
  window.URL.revokeObjectURL(url)
}

/**
 * 类型定义
 */
interface CompressedFile extends File {
  compressedSize?: number
  compressedUrl?: string
  compressionRatio?: number
  originalSize?: number
  previewUrl?: string
}

/**
 * 组件配置信息
 */
const info = reactive({
  title: "免费在线压缩图片",
  subtitle: "免费在线图片压缩工具，支持批量压缩、格式转换等多种功能"
})

/**
 * 功能特点描述
 */
const features = [
  '智能压缩算法：保持图片清晰度的同时，最大程度减小文件体积',
  '灵活压缩选项：提供多档压缩质量，满足不同场景需求',
  '安全本地处理：所有压缩过程在浏览器本地完成，保数据安全'
]

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
    a: '单个文件建议不超过20MB，如果需要压缩更大的图片，建议先裁剪或调整分辨率。'
  }
]

/**
 * 状态管理
 */
const fileList = ref<CompressedFile[]>([])
const quality = ref(80)
const isCompressing = ref(false)
const isDragging = ref(false)
const processingIndex = ref(-1)

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
  console.log('handleUpload called with file:', file)

  if (!file) {
    console.log('No file provided')
    return false
  }

  if (!file.type.startsWith('image/')) {
    console.log('Invalid file type:', file.type)
    ElMessage.warning('请只选择图片文件')
    return false
  }

  if (file.size > 25 * 1024 * 1024) {
    console.log('File too large:', file.size)
    ElMessage.warning(`文件 ${file.name} 超过25MB，请选择更小的文件`)
    return false
  }

  if (fileList.value.length >= 30) {
    ElMessage.warning('最多只能上传30个文件')
    return false
  }

  try {
    console.log('Creating preview URL for file:', file.name)
    const uploadedFile = file as CompressedFile
    uploadedFile.previewUrl = createObjectURL(file)
    fileList.value.push(uploadedFile)
    console.log('File added to list:', uploadedFile)
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
  console.log('handleDrop called')
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (!files) {
    console.log('No files in drop event')
    return
  }

  console.log('Dropped files:', files)
  Array.from(files).forEach((file: File) => {
    if (file.type.startsWith('image/')) {
      console.log('Processing dropped file:', file.name)
      handleUpload(file as UploadRawFile)
    } else {
      console.log('Skipping non-image file:', file.name, file.type)
    }
  })
}

/**
 * 移除文件
 */
const removeFile = (index: number) => {
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
const compressPNG = async (file: File): Promise<Blob> => {
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
            if (quality.value < 30) colors = 32
            else if (quality.value < 50) colors = 64
            else if (quality.value < 70) colors = 128
            else if (quality.value < 90) colors = 256

            const pngData = UPNG.encode(
              [imageData.data.buffer],
              canvas.width,
              canvas.height,
              colors
            )

            resolve(new Blob([pngData], { type: 'image/png' }))
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
const compressJPEG = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: quality.value / 100,
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
const compressWebP = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: quality.value / 100,
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
const compressFile = async (file: File, index: number) => {
  processingIndex.value = index

  try {
    let result: Blob

    // 根据文件类型选择压缩方法
    switch (file.type.toLowerCase()) {
      case 'image/png':
        result = await compressPNG(file)
        break
      case 'image/jpeg':
      case 'image/jpg':
        result = await compressJPEG(file)
        break
      case 'image/webp':
        result = await compressWebP(file)
        break
      default:
        throw new Error('不支持的图片格式')
    }

    // 检查压缩结果
    if (result.size >= file.size) {
      console.log(`文件 ${file.name} 无法进一步压缩，将保持原始大小`)
      result = file
    }

    // 更新文件状态
    const compressedFile = fileList.value[index] as CompressedFile
    if (!compressedFile) {
      throw new Error('文件不存在')
    }

    // 更新压缩信息
    compressedFile.compressedSize = result.size
    compressedFile.originalSize = file.size
    compressedFile.compressionRatio = ((file.size - result.size) / file.size) * 100

    // 更新压缩后的URL
    if (compressedFile.compressedUrl) {
      revokeObjectURL(compressedFile.compressedUrl)
    }
    compressedFile.compressedUrl = createObjectURL(result)

  } catch (error) {
    console.error('压缩失败:', error)
    ElMessage.error(`文件 ${file.name} 压缩失败: ${error}`)
  } finally {
    processingIndex.value = -1
  }
}

/**
 * 批量压缩
 */
const compressAll = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要压缩的图片')
    return
  }

  isCompressing.value = true
  processingIndex.value = -1

  try {
    const promises = fileList.value.map((file: CompressedFile, index: number) => compressFile(file, index))
    await Promise.all(promises)
    ElMessage.success('所有图片压缩完成')
  } catch (error) {
    console.error('压缩错误:', error)
    ElMessage.error('压缩过程中出现错误')
  } finally {
    isCompressing.value = false
    processingIndex.value = -1
  }
}

/**
 * 打包下载
 */
const downloadAll = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要压缩的图片')
    return
  }

  // 如果还没有压缩，先进行压缩
  if (compressedCount.value === 0) {
    await compressAll()
  }

  try {
    const zip = new JSZip()
    const compressedFiles = fileList.value.filter((file: CompressedFile) => file.compressedUrl)

    if (compressedFiles.length === 0) {
      ElMessage.warning('没有可下载的压缩文件')
      return
    }

    // 逐个添加文件
    for (const file of compressedFiles) {
      if (file.compressedUrl) {
        try {
          const response = await fetch(file.compressedUrl)
          const blob = await response.blob()
          zip.file(`uied_${file.name}`, blob, { binary: true })
        } catch (error) {
          console.error('添加文件到压缩包失败:', error)
          continue
        }
      }
    }

    // 生成压缩包
    console.log('开始生成压缩包...')
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })
    console.log('压缩包生成完成')

    // 下载
    console.log('准备下载...')
    const zipUrl = URL.createObjectURL(content)
    autoDown(zipUrl, 'uied_compressed_images.zip')
    URL.revokeObjectURL(zipUrl)

    ElMessage.success('打包下载成功')
  } catch (error) {
    console.error('打包下载失败:', error)
    ElMessage.error('打包下载失败，请重试')
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
 * 图片对比相关
 */
const comparePosition = ref(50)
const isDraggingSlider = ref(false)
const sliderRef = ref<HTMLElement | null>(null)

const startDragging = (e: MouseEvent | TouchEvent) => {
  e.preventDefault()
  isDraggingSlider.value = true

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingSlider.value || !sliderRef.value) return

    const container = sliderRef.value.parentElement
    if (!container) return

    const rect = container.getBoundingClientRect()
    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
    const x = clientX - rect.left
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100)

    comparePosition.value = percentage
  }

  const stopDragging = () => {
    isDraggingSlider.value = false
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('mouseup', stopDragging)
    document.removeEventListener('touchend', stopDragging)
  }

  document.addEventListener('mousemove', handleMove)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('mouseup', stopDragging)
  document.addEventListener('touchend', stopDragging)
}

/**
 * 添加新的文件上传处理方法
 */
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

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
  if (fileList.value.length === 0) {
    ElMessage.warning('没有可压缩的图片')
    return
  }

  // 清除之前的压缩结果
  fileList.value.forEach((file: CompressedFile) => {
    if (file.compressedUrl) {
      revokeObjectURL(file.compressedUrl)
      file.compressedUrl = undefined
      file.compressedSize = undefined
      file.compressionRatio = undefined
    }
  })

  // 重新压缩
  await compressAll()
}

// Get current route
const route = useRoute()
</script>

<style scoped>
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
