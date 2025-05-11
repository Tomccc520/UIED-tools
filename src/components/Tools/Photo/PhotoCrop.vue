<!--
 * @file PhotoCrop.vue
 * @description 证件照尺寸裁剪工具
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-01-15
 *
 * 功能特性：
 * 1. 支持多种标准尺寸裁剪
 * 2. 支持旋转和缩放调整
 * 3. 实时预览效果
 * 4. 本地处理保护隐私
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3">证件照尺寸裁剪工具</h2>
          <p class="text-gray-500 text-sm">一键生成标准尺寸证件照，支持多种规格</p>
        </div>

        <!-- 文件上传区域 -->
        <div v-if="!imageUrl" class="mb-6">
          <div
            class="relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept="image/*"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileChange" />
            <div class="text-center">
              <div class="w-16 h-16 mb-4 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-lg font-medium text-gray-700 mb-2">点击或拖拽上传照片</div>
              <p class="text-sm text-gray-500">支持 JPG、PNG、WebP 格式</p>
            </div>
          </div>
        </div>

        <template v-else>
          <!-- 尺寸选择 -->
          <div class="mb-6">
            <div class="mb-4">
              <h3 class="text-lg font-medium text-gray-800 mb-2">选择证件照尺寸</h3>
              <p class="text-sm text-gray-500">请选择需要的证件照尺寸规格</p>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button v-for="size in photoSizes" :key="size.name"
                class="relative p-4 rounded-lg border-2 transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                :class="selectedSize === size ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200'"
                @click="handleSizeSelect(size)">
                <div class="text-base font-medium" :class="selectedSize === size ? 'text-blue-600' : 'text-gray-700'">
                  {{ size.name }}
                </div>
                <div class="text-xs mt-1" :class="selectedSize === size ? 'text-blue-500' : 'text-gray-500'">
                  {{ size.description }}
                </div>
                <div class="text-[10px] mt-1" :class="selectedSize === size ? 'text-blue-400' : 'text-gray-400'">
                  {{ size.width }}×{{ size.height }}
                </div>
                <div v-if="selectedSize === size" class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full">
                </div>
              </button>
            </div>
          </div>

          <!-- 裁剪区域 -->
          <div class="border rounded-lg p-4">
            <vue-cropper ref="cropperRef" :src="imageUrl" :aspect-ratio="selectedSize.width / selectedSize.height"
              :view-mode="2" :guides="true" :background="true" :rotatable="true" :scalable="true" :zoomable="true"
              :movable="true" :crop="onCrop" class="max-h-[600px]" />

            <!-- 操作按钮 -->
            <div class="mt-4 flex justify-between items-center">
              <div class="flex items-center space-x-4">
                <button @click="rotate(-90)" class="p-2 hover:bg-gray-100 rounded-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v7h7M4 11C4 15.4183 7.58172 19 12 19c4.4183 0 8-3.5817 8-8" />
                  </svg>
                </button>
                <button @click="rotate(90)" class="p-2 hover:bg-gray-100 rounded-lg">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M20 4v7h-7M20 11c0 4.4183-3.5817 8-8 8-4.4183 0-8-3.5817-8-8" />
                  </svg>
                </button>
                <div class="w-px h-6 bg-gray-200 mx-2"></div>
                <button @click="resetImage"
                  class="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 16v-2a4 4 0 014-4h12.8M7 8l-4 4 4 4m4-12v2a4 4 0 01-4 4H3" />
                  </svg>
                  <span class="text-sm">重新选择照片</span>
                </button>
              </div>
              <button v-if="croppedImageUrl" @click="handleDownload"
                class="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>下载</span>
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8">
        <div class="space-y-6">
          <!-- 功能点展示 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">标准尺寸</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">支持一寸、二寸等多种标准证件照尺寸</p>
            </div>

            <div class="bg-white border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">专业调整</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">支持旋转、缩放、亮度调节等专业功能，轻松获得完美证件照</p>
            </div>

            <div class="bg-white border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">隐私保护</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">所有处理均在本地完成，无需上传服务器，保护您的隐私安全</p>
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
      <ToolsRecommend :currentPath="route.path" class="mt-8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

// 获取当前路由
const route = useRoute()

// 组件配置信息
const info = {
  title: "证件照尺寸裁剪工具",
  subtitle: "一键生成标准尺寸证件照，支持多种规格，严格符合国家标准要求"
}

interface PhotoSize {
  name: string
  width: number
  height: number
  description: string
}

// 预设尺寸
const photoSizes: PhotoSize[] = [
  { name: '一寸', width: 295, height: 413, description: '25×35mm' },
  { name: '小一寸', width: 260, height: 378, description: '22×32mm' },
  { name: '二寸', width: 413, height: 579, description: '35×49mm' },
  { name: '小二寸', width: 413, height: 531, description: '35×45mm' },
  { name: '大二寸', width: 413, height: 626, description: '35×53mm' },
  { name: '三寸', width: 649, height: 991, description: '55×84mm' },
  { name: '四寸', width: 1050, height: 1499, description: '89×127mm' },
  { name: '五寸', width: 1499, height: 2150, description: '127×182mm' }
]

// 状态管理
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const cropperRef = ref<any>(null)
const selectedSize = ref<PhotoSize>(photoSizes[0])
const imageUrl = ref('')
const croppedImageUrl = ref('')

// 文件处理方法
const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  const file = input.files[0]
  handleFile(file)
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

const handleFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('请只选择图片文件')
    return
  }
  imageUrl.value = URL.createObjectURL(file)
}

// 处理尺寸选择
const handleSizeSelect = (size: PhotoSize) => {
  selectedSize.value = size
  if (cropperRef.value) {
    cropperRef.value.setAspectRatio(size.width / size.height)
  }
}

// 裁剪相关方法
const onCrop = (data: any) => {
  if (!cropperRef.value) return

  const canvas = cropperRef.value.getCroppedCanvas({
    width: selectedSize.value.width,
    height: selectedSize.value.height,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  })

  if (canvas) {
    croppedImageUrl.value = canvas.toDataURL('image/jpeg', 0.9)
  }
}

const rotate = (angle: number) => {
  if (!cropperRef.value) return
  cropperRef.value.rotate(angle)
}

// 下载处理
const handleDownload = () => {
  if (!croppedImageUrl.value) return

  const link = document.createElement('a')
  link.href = croppedImageUrl.value
  link.download = `证件照_${selectedSize.value.name}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 重置方法
const resetImage = () => {
  imageUrl.value = ''
  croppedImageUrl.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// 常见问题
const faq = [
  {
    q: '支持哪些尺寸的证件照？',
    a: '支持一寸、二寸、小一寸等常见证件照尺寸，可用于办理各类证件。'
  },
  {
    q: '如何调整照片效果？',
    a: '可以通过旋转按钮调整角度，拖动图片调整位置，滚轮或手势可以缩放图片大小。'
  },
  {
    q: '生成的照片清晰度如何？',
    a: '采用高质量图片处理算法，确保导出的证件照清晰度良好。建议上传高清原图以获得最佳效果。'
  },
  {
    q: '照片是否安全？',
    a: '所有处理都在本地完成，不会上传到服务器，完全保护您的隐私。'
  }
]
</script>

<style scoped>
/* 禁用图片拖动 */
img {
  user-select: none;
  -webkit-user-drag: none;
}

.cropper-container {
  max-height: 600px;
}
</style>
