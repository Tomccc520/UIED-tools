<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">在线图片压缩</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">Image Compressor</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 左侧：上传和设置 -->
          <div class="lg:col-span-1 space-y-6">
            <!-- 上传区域 -->
            <div
              class="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer text-center group"
              @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange" />
              <div class="py-8">
                <div class="mb-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p class="text-gray-600 font-medium group-hover:text-blue-600 transition-colors">点击或拖拽图片到这里</p>
                <p class="text-xs text-gray-400 mt-2">支持 JPG, PNG, WEBP 格式</p>
              </div>
            </div>

            <!-- 压缩设置 -->
            <div class="bg-gray-50 p-6 rounded-xl" v-if="originalImage">
              <h3 class="text-lg font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">压缩设置</h3>

              <div class="space-y-6">
                <div>
                  <label class="flex justify-between text-sm text-gray-600 mb-2">
                    <span>压缩质量</span>
                    <span class="text-blue-600 font-medium">{{ Math.round(quality * 100) }}%</span>
                  </label>
                  <input type="range" v-model.number="quality" min="0.1" max="1" step="0.01"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    @input="compressImage" />
                </div>

                <div>
                  <label class="flex justify-between text-sm text-gray-600 mb-2">
                    <span>缩放比例</span>
                    <span class="text-blue-600 font-medium">{{ Math.round(scale * 100) }}%</span>
                  </label>
                  <input type="range" v-model.number="scale" min="0.1" max="1" step="0.1"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    @input="compressImage" />
                </div>

                <div>
                  <label class="block text-sm text-gray-600 mb-2">输出格式</label>
                  <div class="flex space-x-2">
                    <button v-for="fmt in formats" :key="fmt" @click="format = fmt; compressImage()"
                      class="px-3 py-1.5 text-sm rounded-lg border transition-all duration-200"
                      :class="format === fmt ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'">
                      {{ fmt.toUpperCase() }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 信息统计 -->
            <div class="bg-blue-50 p-6 rounded-xl border border-blue-100" v-if="compressedUrl">
              <h3 class="text-lg font-bold text-blue-900 mb-4 border-l-4 border-blue-500 pl-3">压缩结果</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between items-center p-2 bg-white/60 rounded">
                  <span class="text-gray-500">原始大小</span>
                  <span class="font-mono text-gray-700">{{ formatSize(originalSize) }}</span>
                </div>
                <div class="flex justify-between items-center p-2 bg-white/60 rounded">
                  <span class="text-gray-500">压缩后大小</span>
                  <span class="font-mono text-blue-600 font-bold">{{ formatSize(compressedSize) }}</span>
                </div>
                <div class="flex justify-between items-center p-2 bg-green-100 rounded">
                  <span class="text-green-700">压缩率</span>
                  <span class="font-bold text-green-700">-{{ compressionRate }}%</span>
                </div>
              </div>

              <button @click="downloadImage"
                class="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 transform active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载图片
              </button>
            </div>
          </div>

          <!-- 右侧：预览 -->
          <div class="lg:col-span-2 space-y-6">
            <div
              class="bg-gray-100 rounded-xl shadow-inner border border-gray-200 overflow-hidden min-h-[500px] flex items-center justify-center bg-checkered relative">
              <div v-if="!originalImage" class="text-center text-gray-400">
                <p>暂无预览</p>
              </div>
              <div v-else class="relative w-full h-full p-4 flex flex-col items-center">
                <div
                  class="flex items-center space-x-2 mb-4 bg-white/90 backdrop-blur rounded-lg p-1.5 shadow-sm border border-gray-200">
                  <button @click="viewMode = 'compare'" class="px-4 py-1.5 text-sm rounded-md transition-all"
                    :class="viewMode === 'compare' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'">
                    对比模式
                  </button>
                  <button @click="viewMode = 'preview'" class="px-4 py-1.5 text-sm rounded-md transition-all"
                    :class="viewMode === 'preview' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'">
                    仅预览结果
                  </button>
                </div>

                <div class="relative max-w-full max-h-[600px] overflow-auto shadow-2xl rounded-lg">
                  <div v-if="viewMode === 'preview'" class="relative">
                    <img :src="compressedUrl" class="max-w-full h-auto block" />
                  </div>

                  <div v-else class="relative group cursor-ew-resize select-none" @mousemove="handleCompareMove"
                    @touchmove="handleCompareMove" ref="compareContainer">
                    <!-- 底层：压缩图 -->
                    <img :src="compressedUrl" class="max-w-full h-auto block pointer-events-none" />

                    <!-- 顶层：原图 (通过clip-path裁剪) -->
                    <div class="absolute inset-0 overflow-hidden pointer-events-none"
                      :style="{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }">
                      <img :src="originalImage" class="max-w-full h-auto" :style="{ width: '100%', height: '100%' }" />
                      <div
                        class="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                        原图</div>
                    </div>

                    <!-- 分割线 -->
                    <div
                      class="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10"
                      :style="{ left: `${comparePosition}%` }">
                      <div
                        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-blue-600 border-2 border-blue-50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                      </div>
                    </div>

                    <div
                      class="absolute top-4 right-4 bg-blue-600/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                      压缩后</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToolsRecommend />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 */
import { ref, computed } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const fileInput = ref<HTMLInputElement | null>(null)
const originalImage = ref<string>('')
const compressedUrl = ref<string>('')
const originalSize = ref(0)
const compressedSize = ref(0)
const quality = ref(0.8)
const scale = ref(1)
const format = ref('jpeg')
const formats = ['jpeg', 'png', 'webp']
const viewMode = ref<'compare' | 'preview'>('compare')
const comparePosition = ref(50)
const compareContainer = ref<HTMLElement | null>(null)

const compressionRate = computed(() => {
  if (!originalSize.value || !compressedSize.value) return 0
  return Math.round((1 - compressedSize.value / originalSize.value) * 100)
})

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const handleDrop = (e: DragEvent) => {
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('请上传图片文件')
    return
  }

  originalSize.value = file.size
  const reader = new FileReader()
  reader.onload = (e) => {
    originalImage.value = e.target?.result as string
    compressImage()
  }
  reader.readAsDataURL(file)
}

const compressImage = () => {
  if (!originalImage.value) return

  const img = new Image()
  img.src = originalImage.value
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = img.width * scale.value
    const h = img.height * scale.value

    canvas.width = w
    canvas.height = h

    // Fill white background for JPEG (transparency turns black otherwise)
    if (format.value === 'jpeg') {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, w, h)
    }

    ctx.drawImage(img, 0, 0, w, h)

    const mimeType = `image/${format.value}`
    const dataUrl = canvas.toDataURL(mimeType, quality.value)

    compressedUrl.value = dataUrl

    // Calculate approximate size
    const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1)
    const padding = (dataUrl.charAt(dataUrl.length - 2) === '=') ? 2 : ((dataUrl.charAt(dataUrl.length - 1) === '=') ? 1 : 0)
    compressedSize.value = base64Length * 0.75 - padding
  }
}

const handleCompareMove = (e: MouseEvent | TouchEvent) => {
  if (!compareContainer.value) return

  const rect = compareContainer.value.getBoundingClientRect()
  let clientX = 0

  if (e instanceof MouseEvent) {
    clientX = e.clientX
  } else if (e instanceof TouchEvent) {
    clientX = e.touches[0].clientX
  }

  let pos = ((clientX - rect.left) / rect.width) * 100
  pos = Math.max(0, Math.min(100, pos))
  comparePosition.value = pos
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadImage = () => {
  if (!compressedUrl.value) return
  const link = document.createElement('a')
  link.download = `compressed_${Date.now()}.${format.value}`
  link.href = compressedUrl.value
  link.click()
}
</script>

<style scoped>
.bg-checkered {
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}
</style>
