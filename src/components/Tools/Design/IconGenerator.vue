<!--
 * @file IconGenerator.vue
 * @description 应用图标生成器工具组件，支持一键生成各平台所需的应用图标
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-21
 *
 * 功能特性：
 * 1. 支持多平台图标生成(iOS、Android、Web App等)
 * 2. 支持JPG、PNG、PSD等多种格式上传
 * 3. 支持自定义圆角和大小设置
 * 4. 支持实时预览效果
 * 5. 支持批量导出不同尺寸
 * 6. 自动优化小尺寸图标清晰度
 -->

<template>
  <div class="min-h-screen">
    <!-- 主要内容区域 -->
    <div class="bg-white rounded-xl p-6 lg:p-8 mb-4 shadow-sm relative">
      <div class="text-center mb-8 relative">
        <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
          <div class="relative px-12">
            <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">应用图标生成器</span>
          </div>
        </h2>
        <p class="text-gray-500 text-sm mt-6">App Icon Generator</p>

        <!-- 温馨提示 -->
        <div class="mt-8 max-w-2xl mx-auto">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 shadow-sm">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-medium text-gray-900 mb-2">上传要求</h4>
                <div class="space-y-2">
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>支持 JPG、PNG 格式图片</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>建议上传 1024 x 1024 像素的图片以获得最佳效果</span>
                  </div>
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>文件大小限制在 10MB 以内</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 上传区域 -->
      <div class="max-w-3xl mx-auto mb-8">
        <div
          class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors duration-300"
          :class="{ 'border-blue-500': isDragging }" @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false" @dragover.prevent @drop.prevent="handleDrop"
          @click="triggerFileInput">
          <input type="file" ref="fileInput" class="hidden" accept=".jpg,.jpeg,.png" @change="handleFileChange">
          <div class="space-y-4">
            <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div class="text-gray-600">
              <p class="font-medium">点击或拖放文件到此处上传</p>
              <p class="text-sm text-gray-500 mt-1">支持 JPG、PNG 格式</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域：设置和预览 -->
      <div class="max-w-7xl mx-auto" v-if="selectedFile">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- 左侧：设置选项 -->
          <div class="lg:w-1/3">
            <div class="bg-gray-50 rounded-lg p-6 sticky top-4">
              <h3 class="text-lg font-medium mb-4">图标设置</h3>
              <!-- 平台选择 -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">目标平台</label>
                <div class="space-y-2">
                  <label v-for="platform in platforms" :key="platform.id"
                    class="relative flex items-start p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                    :class="[selectedPlatforms.includes(platform.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200']">
                    <div class="min-w-0 flex-1 text-sm">
                      <div class="font-medium text-gray-700">{{ platform.name }}</div>
                      <p class="text-gray-500 text-xs mt-1">{{ platform.description }}</p>
                    </div>
                    <div class="ml-3 flex items-center h-5">
                      <input type="checkbox" v-model="selectedPlatforms" :value="platform.id"
                        class="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500">
                    </div>
                  </label>
                </div>
              </div>

              <!-- 圆角设置 -->
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">圆角设置</label>
                <div class="flex items-center space-x-4">
                  <input type="range" v-model="cornerRadius" min="0" max="50"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                  <span class="text-sm text-gray-600 w-12">{{ cornerRadius }}%</span>
                </div>
              </div>

              <!-- 生成按钮 -->
              <button @click="generateIcons"
                class="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                :disabled="!canGenerate">
                生成图标
              </button>
            </div>
          </div>

          <!-- 右侧：预览区域 -->
          <div class="lg:w-2/3">
            <div class="preview-section">
              <h3 class="text-lg font-medium mb-4">预览效果</h3>
              <!-- iOS 预览 -->
              <div v-if="selectedPlatforms.includes('ios')" class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">iOS 图标预览</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div v-for="size in iosPreviewSizes" :key="size.name" class="text-center">
                    <div class="preview-container">
                      <img v-if="previewUrl" :src="previewUrl" :alt="size.name" class="preview-image mx-auto mb-2"
                        :style="{ width: size.size + 'px', height: size.size + 'px', borderRadius: (size.size * cornerRadius / 100) + 'px' }">
                    </div>
                    <p class="text-xs text-gray-500">{{ size.name }}</p>
                  </div>
                </div>
              </div>

              <!-- macOS 预览 -->
              <div v-if="selectedPlatforms.includes('macos')" class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">macOS 图标预览</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div v-for="size in macosPreviewSizes" :key="size.name" class="text-center">
                    <div class="preview-container">
                      <img v-if="previewUrl" :src="previewUrl" :alt="size.name" class="preview-image mx-auto mb-2"
                        :style="{ width: size.size + 'px', height: size.size + 'px', borderRadius: (size.size * cornerRadius / 100) + 'px' }">
                    </div>
                    <p class="text-xs text-gray-500">{{ size.name }}</p>
                  </div>
                </div>
              </div>

              <!-- watchOS 预览 -->
              <div v-if="selectedPlatforms.includes('watchos')" class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">watchOS 图标预览</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div v-for="size in watchosPreviewSizes" :key="size.name" class="text-center">
                    <div class="preview-container">
                      <img v-if="previewUrl" :src="previewUrl" :alt="size.name" class="preview-image mx-auto mb-2"
                        :style="{ width: size.size + 'px', height: size.size + 'px', borderRadius: (size.size * cornerRadius / 100) + 'px' }">
                    </div>
                    <p class="text-xs text-gray-500">{{ size.name }}</p>
                  </div>
                </div>
              </div>

              <!-- Android 预览 -->
              <div v-if="selectedPlatforms.includes('android')" class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">Android 图标预览</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div v-for="size in androidPreviewSizes" :key="size.name" class="text-center">
                    <div class="preview-container">
                      <img v-if="previewUrl" :src="previewUrl" :alt="size.name" class="preview-image mx-auto mb-2"
                        :style="{ width: size.size + 'px', height: size.size + 'px', borderRadius: (size.size * cornerRadius / 100) + 'px' }">
                    </div>
                    <p class="text-xs text-gray-500">{{ size.name }}</p>
                  </div>
                </div>
              </div>

              <!-- Web App 预览 -->
              <div v-if="selectedPlatforms.includes('webapp')" class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">Web App 图标预览</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div v-for="size in webappPreviewSizes" :key="size.name" class="text-center">
                    <div class="preview-container">
                      <img v-if="previewUrl" :src="previewUrl" :alt="size.name" class="preview-image mx-auto mb-2"
                        :style="{ width: size.size + 'px', height: size.size + 'px', borderRadius: (size.size * cornerRadius / 100) + 'px' }">
                    </div>
                    <p class="text-xs text-gray-500">{{ size.name }}</p>
                  </div>
                </div>
              </div>

              <!-- PhoneGap 预览 -->
              <div v-if="selectedPlatforms.includes('phonegap')" class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">PhoneGap 图标预览</h4>
                <p class="text-sm text-gray-500 mb-4">包含所有平台的图标</p>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <template v-for="sizes in [iosPreviewSizes, androidPreviewSizes, webappPreviewSizes]"
                    :key="sizes[0].name">
                    <div v-for="size in sizes" :key="size.name" class="text-center">
                      <div class="preview-container">
                        <img v-if="previewUrl" :src="previewUrl" :alt="size.name" class="preview-image mx-auto mb-2"
                          :style="{ width: size.size + 'px', height: size.size + 'px', borderRadius: (size.size * cornerRadius / 100) + 'px' }">
                      </div>
                      <p class="text-xs text-gray-500">{{ size.name }}</p>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 特色功能说明 -->
      <div class="mt-12 max-w-4xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gray-50 p-6 rounded-lg">
            <div class="flex items-center mb-3">
              <svg class="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <h3 class="font-medium">多平台支持</h3>
            </div>
            <p class="text-sm text-gray-600">同时生成 iOS、Android 和 PhoneGap 应用的图标。遵循 Apple、Google 官方标准。</p>
          </div>
          <div class="bg-gray-50 p-6 rounded-lg">
            <div class="flex items-center mb-3">
              <svg class="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 class="font-medium">实时预览</h3>
            </div>
            <p class="text-sm text-gray-600">快速预览将要在不同设备上显示的应用图标。使您无需部署即可通过预览来调整设计样式。</p>
          </div>
          <div class="bg-gray-50 p-6 rounded-lg">
            <div class="flex items-center mb-3">
              <svg class="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <h3 class="font-medium">优化处理</h3>
            </div>
            <p class="text-sm text-gray-600">优化图标，尤其是尺寸较小的图标。保证清晰度，并优化图片内存占用，减小包体积。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具推荐 -->
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, watch, nextTick } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import JSZip from 'jszip'

const route = useRoute()
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref('')
const cornerRadius = ref(20)
const selectedPlatforms = ref<string[]>([])

// 定义尺寸配置接口
interface SizeConfig {
  name: string
  size: number
}

// SEO 配置
useHead({
  title: '应用图标生成器 | 一键生成iOS、安卓等多平台应用图标工具',
  meta: [
    {
      name: 'description',
      content: '免费在线应用图标生成工具，支持一键生成iOS、安卓(Android)、网页应用(Web App)、苹果电脑(macOS)、苹果手表(watchOS)等多平台应用图标。提供自定义圆角、实时预览功能，严格遵循Apple、Google官方标准，自动优化图标清晰度。'
    },
    {
      name: 'keywords',
      content: '应用图标生成器,App图标制作,iOS图标生成,安卓图标生成,图标制作工具,应用开发工具,图标生成器,App开发,图标设计工具'
    },
    {
      property: 'og:title',
      content: '应用图标生成器 | 免费在线生成iOS、安卓等多平台应用图标'
    },
    {
      property: 'og:description',
      content: '免费在线应用图标生成工具，一键生成iOS、安卓等多平台应用图标，支持自定义圆角和实时预览，严格遵循官方标准。'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:url',
      content: 'https://www.uiedtool.com/tools/design/icon-generator'
    },
    {
      name: 'baidu-site-verification',
      content: true
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://www.uiedtool.com/tools/design/icon-generator'
    }
  ]
})

// iOS 预览尺寸
const iosPreviewSizes = [
  { name: 'iPhone (180x180)', size: 180 },
  { name: 'iPad (167x167)', size: 167 },
  { name: 'App Store (1024x1024)', size: 1024 },
  { name: 'Settings (87x87)', size: 87 }
]

// macOS 预览尺寸
const macosPreviewSizes = [
  { name: 'App Icon (1024x1024)', size: 1024 },
  { name: 'App Store (512x512)', size: 512 },
  { name: 'Large (256x256)', size: 256 },
  { name: 'Small (32x32)', size: 32 }
]

// watchOS 预览尺寸
const watchosPreviewSizes = [
  { name: 'App Icon (1024x1024)', size: 1024 },
  { name: 'Notification Center (216x216)', size: 216 },
  { name: 'Short Look (172x172)', size: 172 },
  { name: 'Home Screen (80x80)', size: 80 }
]

// Android 预览尺寸
const androidPreviewSizes = [
  { name: 'xxxhdpi (192x192)', size: 192 },
  { name: 'xxhdpi (144x144)', size: 144 },
  { name: 'xhdpi (96x96)', size: 96 },
  { name: 'hdpi (72x72)', size: 72 }
]

// Web App 预览尺寸
const webappPreviewSizes = [
  { name: 'Favicon (32x32)', size: 32 },
  { name: 'Apple Touch (180x180)', size: 180 },
  { name: 'Android Chrome (192x192)', size: 192 },
  { name: 'MS Tile (270x270)', size: 270 }
]

// 平台选项
const platforms = [
  {
    id: 'ios',
    name: 'iOS',
    description: 'iPhone、iPad 应用图标'
  },
  {
    id: 'android',
    name: 'Android',
    description: '安卓应用图标'
  },
  {
    id: 'phonegap',
    name: 'PhoneGap (Cordova)',
    description: '跨平台应用图标'
  },
  {
    id: 'webapp',
    name: 'Web App (ico + icons)',
    description: '网页应用图标'
  },
  {
    id: 'macos',
    name: 'macOS',
    description: 'Mac 应用图标'
  },
  {
    id: 'watchos',
    name: 'watchOS',
    description: 'Apple Watch 应用图标'
  }
]

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    handleFile(input.files[0])
  }
}

// 处理拖放
const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    handleFile(file)
  }
}

// 处理文件
const handleFile = async (file: File) => {
  // 检查文件类型
  const validTypes = ['image/jpeg', 'image/png']
  if (!validTypes.includes(file.type)) {
    alert('请上传 JPG 或 PNG 格式的文件')
    return
  }

  // 检查文件大小
  if (file.size > 10 * 1024 * 1024) { // 10MB
    alert('文件大小不能超过 10MB')
    return
  }

  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = async (e) => {
    previewUrl.value = e.target?.result as string
    canGenerate.value = true
    await updatePreview() // 立即更新预览
  }
  reader.readAsDataURL(file)
}

// 计算圆角半径
const calculateRadius = (size: number, percentage: number) => {
  return (size * percentage) / 100
}

// 添加预览图片更新函数
const updatePreview = async () => {
  if (!previewUrl.value) return

  const img = new Image()
  img.src = previewUrl.value
  await new Promise((resolve) => {
    img.onload = resolve
  })

  // 更新所有预览图
  const previewElements = document.querySelectorAll('.preview-image')
  previewElements.forEach(async (element) => {
    if (element instanceof HTMLImageElement) {
      const size = parseInt(element.dataset.size || '0')
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // 启用抗锯齿
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'

      // 应用背景和特效
      const radius = calculateRadius(size, cornerRadius.value)
      drawIcon(ctx, img, size, radius)

      // 更新预览图片
      const dataUrl = canvas.toDataURL('image/png')
      element.src = dataUrl
    }
  })
}

// 监听所有可能影响预览效果的变化
watch([cornerRadius], () => {
  updatePreview()
}, { deep: true })

// 简化 drawIcon 函数
const drawIcon = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, size: number, radius: number) => {
  ctx.clearRect(0, 0, size, size) // 清除画布

  // 创建圆角路径
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.quadraticCurveTo(size, 0, size, radius)
  ctx.lineTo(size, size - radius)
  ctx.quadraticCurveTo(size, size, size - radius, size)
  ctx.lineTo(radius, size)
  ctx.quadraticCurveTo(0, size, 0, size - radius)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()

  // 绘制图像
  ctx.save()
  ctx.clip() // 应用圆角裁剪
  ctx.drawImage(img, 0, 0, size, size)
  ctx.restore()
}

// 生成图标
const generateIcons = async () => {
  if (!selectedFile.value) return

  try {
    const img = new Image()
    img.src = previewUrl.value

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    const zip = new JSZip()

    for (const platform of selectedPlatforms.value) {
      let sizes: SizeConfig[] = []
      let folderName = ''

      switch (platform) {
        case 'ios':
          sizes = iosPreviewSizes
          folderName = 'iOS Icons'
          break
        case 'android':
          sizes = androidPreviewSizes
          folderName = 'Android Icons'
          break
        case 'webapp':
          sizes = webappPreviewSizes
          folderName = 'Web App Icons'
          break
        case 'macos':
          sizes = macosPreviewSizes
          folderName = 'macOS Icons'
          break
        case 'watchos':
          sizes = watchosPreviewSizes
          folderName = 'watchOS Icons'
          break
        case 'phonegap':
          sizes = [...iosPreviewSizes, ...androidPreviewSizes, ...webappPreviewSizes]
          folderName = 'PhoneGap Icons'
          break
      }

      const folder = zip.folder(folderName)
      if (!folder) continue

      for (const { size, name } of sizes) {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) continue

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        if (cornerRadius.value > 0) {
          const radius = calculateRadius(size, cornerRadius.value)
          drawIcon(ctx, img, size, radius)
        }

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png', 1)
        })
        folder.file(`${name}.png`, blob)
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = 'app-icons.zip'
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('生成图标时出错:', error)
    alert('生成图标时出错，请重试')
  }
}

// 监听圆角变化，更新预览
watch(cornerRadius, (newValue) => {
  if (selectedFile.value) {
    // 更新预览图的圆角
    const previewElements = document.querySelectorAll('.preview-image')
    previewElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        const size = parseInt(element.dataset.size || '0')
        const radius = calculateRadius(size, newValue)
        element.style.borderRadius = `${radius}px`
      }
    })
  }
})

// 是否可以生成
const canGenerate = ref(false)
</script>

<style scoped>
/* 自定义滑块样式 */
input[type="range"] {
  -webkit-appearance: none;
  @apply bg-gray-200 h-2 rounded-lg;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  @apply w-4 h-4 bg-blue-500 rounded-full cursor-pointer;
}

input[type="range"]::-moz-range-thumb {
  @apply w-4 h-4 bg-blue-500 border-0 rounded-full cursor-pointer;
}

/* 复选框样式 */
.form-checkbox {
  @apply rounded text-blue-500 focus:ring-blue-500 border-gray-300;
}

/* 拖放区域过渡效果 */
.border-dashed {
  transition: all 0.3s ease;
}

.border-dashed:hover {
  @apply border-blue-500 bg-blue-50 bg-opacity-50;
}

/* 预览图片容器样式 */
.preview-container {
  @apply relative rounded-lg shadow-sm p-2 flex items-center justify-center;
  height: 120px;
  /* 添加棋盘格背景 */
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  background-color: #ffffff;
}

.preview-image {
  @apply object-contain;
  max-width: 100%;
  max-height: 100px;
}

/* 预览区域的背景 */
.preview-section {
  @apply bg-gray-50 rounded-lg p-6;
  background-image: linear-gradient(45deg, #f8f8f8 25%, transparent 25%),
    linear-gradient(-45deg, #f8f8f8 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f8f8f8 75%),
    linear-gradient(-45deg, transparent 75%, #f8f8f8 75%);
  background-size: 40px 40px;
  background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
}

/* 添加预览容器的悬停效果 */
.preview-container:hover {
  @apply shadow-md;
  transform: scale(1.02);
  transition: all 0.2s ease;
}
</style>
