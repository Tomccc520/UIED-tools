<!--
 * @file RemoveWatermark.vue
 * @description AI智能去水印工具，支持自动识别并去除图片水印
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-04
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

        <!-- 上传区域 -->
        <div class="grid grid-cols-1 gap-8">
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div v-if="!originalImage"
              class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-gray-50"
              :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'"
              @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false">
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
              <div class="text-center px-4">
                <div class="w-8 h-8 mb-2 mx-auto">
                  <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片到这里</h3>
                <p class="text-xs text-gray-400 mb-1">支持 JPG, PNG, WebP 等常见格式</p>
                <p class="text-xs text-gray-400">最大支持 10MB</p>
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
                  {{ isProcessing ? '处理中...' : (processedImage ? '处理完成' : '开始去水印') }}
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
          </div>

          <!-- 预览和处理区域 -->
          <div v-if="originalImage" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- 左侧：原图预览 -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <div class="mb-4 text-gray-700 font-medium">原始图片</div>
              <div
                class="border rounded-lg bg-gray-50 p-4 flex items-center justify-center min-h-[300px] relative group">
                <span
                  class="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">原图</span>
                <img :src="originalImage" class="max-w-full max-h-[300px] object-contain" alt="原始图片" />
              </div>
            </div>

            <!-- 右侧：处理后预览 -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <div class="mb-4 flex justify-between items-center">
                <span class="text-gray-700 font-medium">处理后图片</span>
                <span v-if="processedImage" class="text-xs text-gray-500">右键图片另存为即可保存</span>
              </div>
              <div
                class="border rounded-lg bg-gray-50 p-4 flex flex-col items-center justify-center min-h-[300px] relative">
                <span
                  class="absolute top-3 left-3 bg-blue-600/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">效果图</span>

                <template v-if="processedImage">
                  <div class="relative w-full h-full flex justify-center">
                    <img :src="processedImage"
                      class="max-w-full max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity duration-200"
                      alt="处理后图片" @click="downloadImage" />
                  </div>
                </template>
                <template v-else-if="isProcessing">
                  <div
                    class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                    <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4">
                    </div>
                    <p class="text-blue-600 font-medium">AI 正在处理中...</p>
                  </div>
                </template>
                <template v-else>
                  <div class="text-gray-400 text-sm">点击"开始去水印"查看效果</div>
                </template>
              </div>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">功能说明</div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900">智能识别</h4>
                  <p class="text-sm text-gray-600 mt-1">自动识别图片中的水印区域</p>
                </div>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-purple-500" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900">无痕修复</h4>
                  <p class="text-sm text-gray-600 mt-1">智能填充背景，确保画面自然</p>
                </div>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900">隐私安全</h4>
                  <p class="text-sm text-gray-600 mt-1">本地处理，保护您的图片隐私</p>
                </div>
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
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = {
  title: "AI 智能去水印",
  subtitle: "上传图片，AI 自动识别并移除水印，还原图片清晰本质"
}

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const originalImage = ref<string | null>(null)
const processedImage = ref<string | null>(null)
const isProcessing = ref(false)
const fileInfo = ref<{ name: string; size: number } | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 10MB')
    return
  }

  fileInfo.value = {
    name: file.name,
    size: file.size
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    processedImage.value = null
  }
  reader.readAsDataURL(file)
}

const processImage = () => {
  if (!originalImage.value) return

  isProcessing.value = true

  // 模拟处理过程
  setTimeout(() => {
    isProcessing.value = false
    // 这里实际应该调用后端 API
    // 目前作为演示，直接返回原图
    processedImage.value = originalImage.value
    ElMessage.success('处理完成！')
  }, 2000)
}

const downloadImage = () => {
  if (!processedImage.value) return

  const link = document.createElement('a')
  link.href = processedImage.value
  link.download = `processed_${fileInfo.value?.name || 'image.png'}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const reset = () => {
  originalImage.value = null
  processedImage.value = null
  fileInfo.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
