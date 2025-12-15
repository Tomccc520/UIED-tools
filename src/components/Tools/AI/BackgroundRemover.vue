<!--
 * @file BackgroundRemover.vue
 * @description AI智能抠图工具，使用 @imgly/background-removal 在浏览器端直接去除背景
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-15
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">AI智能抠图</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">一键移除图片背景，生成透明PNG，完全在本地处理，保护您的隐私</p>
        </div>

        <!-- 维护中提示 -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div
            class="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-yellow-800 mb-2">系统维护中</h3>
          <p class="text-yellow-700 mb-4">为了提供更好的服务体验，该功能正在进行技术升级和维护。</p>
          <p class="text-yellow-600 text-sm">我们会尽快恢复服务，感谢您的理解与支持。</p>
        </div>

        <!-- 上传区域 (隐藏) -->
        <div class="grid grid-cols-1 gap-8 hidden">
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div v-if="!originalImage"
              class="relative border-2 border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-gray-50 cursor-pointer"
              :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'"
              @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false">
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
              <div class="text-center px-4">
                <div
                  class="w-12 h-12 mb-4 mx-auto text-blue-500 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-700 mb-2">点击或拖拽图片到这里</h3>
                <p class="text-sm text-gray-500 mb-1">支持 JPG, PNG, WebP 等常见格式</p>
                <p class="text-xs text-gray-400">建议上传清晰的主体图片</p>
              </div>
            </div>

            <!-- Toolbar when image selected -->
            <div v-else class="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div class="flex items-center gap-3">
                <button @click="reset"
                  class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  重新上传
                </button>
                <span class="text-sm text-gray-500" v-if="fileInfo">
                  {{ fileInfo.name }} ({{ formatSize(fileInfo.size) }})
                </span>
              </div>
              <div class="flex items-center gap-3">
                <button @click="processImage" :disabled="isProcessing || !!processedImage"
                  class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                  <svg v-if="isProcessing" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  {{ isProcessing ? `处理中 ${progress}%` : (processedImage ? '处理完成' : '开始抠图') }}
                </button>
                <button v-if="processedImage" @click="downloadImage"
                  class="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下载图片
                </button>
              </div>
            </div>

            <!-- 预览和处理区域 -->
            <div v-if="originalImage" class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              <!-- 左侧：原图预览 -->
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="mb-3 text-gray-700 font-medium flex items-center justify-between">
                  <span>原始图片</span>
                </div>
                <div
                  class="relative w-full h-[300px] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                  <img :src="originalImage" class="max-w-full max-h-full object-contain" alt="Original" />
                </div>
              </div>

              <!-- 右侧：处理结果 -->
              <div class="bg-white border border-gray-200 rounded-lg p-4">
                <div class="mb-3 text-gray-700 font-medium flex items-center justify-between">
                  <span>处理结果</span>
                  <span v-if="processTime" class="text-xs text-gray-400">耗时: {{ processTime }}s</span>
                </div>
                <div
                  class="relative w-full h-[300px] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center bg-checkerboard">
                  <div v-if="isProcessing"
                    class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                    <div class="w-16 h-1 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: `${progress}%` }">
                      </div>
                    </div>
                    <p class="text-sm text-gray-600">正在智能识别主体...</p>
                  </div>
                  <img v-if="processedImage" :src="processedImage" class="max-w-full max-h-full object-contain z-0"
                    alt="Processed" />
                  <div v-else-if="!isProcessing" class="text-gray-400 text-sm flex flex-col items-center">
                    <svg class="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>点击"开始抠图"查看结果</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 class="text-lg font-medium text-blue-900 mb-3">功能说明</h3>
          <ul class="list-disc list-inside text-sm text-blue-800 space-y-2">
            <li>支持人物、动物、商品等多种主体识别</li>
            <li>纯本地处理，图片不会上传到服务器，确保隐私安全</li>
            <li>首次使用需要加载 AI 模型（约 20MB），请耐心等待</li>
            <li>建议上传背景清晰、主体突出的图片以获得最佳效果</li>
          </ul>
        </div>


      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { removeBackground } from '@imgly/background-removal'

const route = useRoute()
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const originalImage = ref('')
const processedImage = ref('')
const isProcessing = ref(false)
const progress = ref(0)
const processTime = ref(0)
const fileInfo = ref<{ name: string; size: number } | null>(null)
let startTime = 0

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFile(target.files[0])
  }
  // Reset input value to allow selecting the same file again
  if (target.value) target.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择有效的图片文件')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  // Clear previous results
  if (originalImage.value) URL.revokeObjectURL(originalImage.value)
  if (processedImage.value) URL.revokeObjectURL(processedImage.value)

  processedImage.value = ''
  processTime.value = 0
  progress.value = 0

  fileInfo.value = {
    name: file.name,
    size: file.size
  }

  originalImage.value = URL.createObjectURL(file)
}

const processImage = async () => {
  if (!originalImage.value) return

  try {
    isProcessing.value = true
    progress.value = 0
    startTime = Date.now()

    // 配置 imgly
    const config = {
      progress: (key: string, current: number, total: number) => {
        // 简单的进度估算
        if (key.includes('fetch')) {
          progress.value = Math.min(30 + Math.round((current / total) * 30), 60)
        } else if (key.includes('compute')) {
          progress.value = Math.min(60 + Math.round((current / total) * 30), 90)
        }
      },
      debug: true
    }

    // 使用 blob URL 作为输入
    // 注意：imgly 默认会尝试从 CDN 加载模型
    // 如果本地没有配置 public/static/js/model，它会去 fetch unpkg.com
    // 这通常是可行的，除非网络限制
    const blob = await removeBackground(originalImage.value, {
      model: 'isnet', // 使用完整版模型以获得更好效果，默认为 isnet_fp16 (量化版)
      progress: (key: string, current: number, total: number) => {
        // Calculate percentage based on phase
        // Simple mapping: fetch phase 0-50%, inference phase 50-100%
        // Note: The library's progress callback signature might vary slightly by version,
        // but usually provides key/current/total
        const p = Math.round((current / total) * 100);
        progress.value = p;
      }
    })

    processedImage.value = URL.createObjectURL(blob)
    processTime.value = Number(((Date.now() - startTime) / 1000).toFixed(2))
    progress.value = 100
    ElMessage.success('抠图完成')

  } catch (error) {
    console.error('Processing failed:', error)
    ElMessage.error('处理失败，请重试或检查网络连接（需要加载AI模型）')
  } finally {
    isProcessing.value = false
  }
}

const downloadImage = () => {
  if (!processedImage.value) return

  const link = document.createElement('a')
  link.href = processedImage.value
  link.download = `removed-bg-${fileInfo.value?.name || 'image'}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const reset = () => {
  if (originalImage.value) URL.revokeObjectURL(originalImage.value)
  if (processedImage.value) URL.revokeObjectURL(processedImage.value)
  originalImage.value = ''
  processedImage.value = ''
  fileInfo.value = null
  processTime.value = 0
  progress.value = 0
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onUnmounted(() => {
  if (originalImage.value) URL.revokeObjectURL(originalImage.value)
  if (processedImage.value) URL.revokeObjectURL(processedImage.value)
})
</script>

<style scoped>
.bg-checkerboard {
  background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
    linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
</style>
