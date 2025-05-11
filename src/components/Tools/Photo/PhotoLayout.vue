<!--
 * @file PhotoLayout.vue
 * @description 证件照排版打印工具
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-01-15
 *
 * 功能特性：
 * 1. 支持多种尺寸组合排版
 * 2. 智能空间利用
 * 3. 一键打印功能
 * 4. 本地处理保护隐私
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

        <!-- 主要功能区域 -->
        <div class="grid grid-cols-1 gap-8">
          <!-- 上传区域 -->
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
              @change="handleFileInputChange" />

            <div class="absolute inset-0 cursor-pointer z-10" @click="triggerFileInput"></div>

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽照片到这里</div>
              <p class="text-xs text-gray-400 mb-1">
                支持 JPG、PNG、WebP 格式，文件大小不超过 10MB
              </p>
              <p class="text-xs text-gray-400">
                建议上传已处理好的证件照，效果更佳
              </p>
            </div>
          </div>

          <!-- 排版设置面板 -->
          <div v-if="currentImage" class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">排版设置</div>
            <div class="space-y-6">
              <!-- 纸张设置 -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button v-for="paper in paperSizes" :key="paper.id"
                  class="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                  :class="selectedPaper === paper.id ? 'border-blue-500' : 'border-gray-200'"
                  @click="selectPaper(paper.id)">
                  <div class="text-sm text-gray-600">{{ paper.name }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ paper.size }}</div>
                </button>
              </div>

              <!-- 排版设置 -->
              <div class="space-y-4">
                <!-- 预设布局选择 -->
                <div class="mb-6">
                  <div class="text-sm text-gray-600 mb-3">快速预设</div>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button v-for="preset in layoutPresets" :key="preset.id"
                      class="p-3 rounded-lg border text-left transition-all duration-200 hover:shadow-md" :class="{
                        'border-blue-500 bg-blue-50': photoCount === preset.photoCount && margin === preset.margin && spacing === preset.spacing,
                        'border-gray-200': !(photoCount === preset.photoCount && margin === preset.margin && spacing === preset.spacing)
                      }" @click="applyLayoutPreset(preset.id)">
                      <div class="text-sm font-medium text-gray-700">{{ preset.name }}</div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ preset.photoCount }}张 / {{ preset.margin }}mm边距
                      </div>
                    </button>
                  </div>
                </div>

                <!-- 照片数量选择 -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">照片数量</span>
                  <el-select v-model="photoCount" size="small" class="w-32">
                    <el-option v-for="item in photoCountPresets" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </div>

                <!-- 边距选择 -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">边距(mm)</span>
                  <el-select v-model="margin" size="small" class="w-32">
                    <el-option v-for="item in marginPresets" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </div>

                <!-- 照片间距选择 -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">照片间距(mm)</span>
                  <el-select v-model="spacing" size="small" class="w-32">
                    <el-option v-for="item in spacingPresets" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="flex space-x-3">
                <el-button type="primary" size="large" :loading="isProcessing" @click="processImage"
                  class="flex-1 !h-10">
                  {{ isProcessing ? '处理中...' : '开始排版' }}
                </el-button>
                <el-button v-if="processedImageUrl" type="success" size="large" @click="downloadImage"
                  class="flex-1 !h-10">
                  <i class="el-icon-download mr-1"></i>下载图片
                </el-button>
              </div>
            </div>
          </div>

          <!-- 预览区域 -->
          <div v-if="currentImage || processedImageUrl" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 原图预览 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-3">原始照片</div>
              <div class="relative aspect-[3/4] bg-white rounded-lg overflow-hidden">
                <img v-if="currentImage" :src="currentImage" class="w-full h-full object-contain"
                  @click="previewOriginalImage" />
              </div>
            </div>

            <!-- 排版预览 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-3">排版预览</div>
              <div class="relative bg-white rounded-lg overflow-hidden"
                :style="{ aspectRatio: getSelectedPaperSize()?.width + '/' + getSelectedPaperSize()?.height }">
                <img v-if="processedImageUrl" :src="processedImageUrl"
                  class="w-full h-full object-contain cursor-pointer" @click="previewProcessedImage" />
                <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
                  等待排版...
                </div>
              </div>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border border-gray-100 rounded-lg p-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h4 class="text-base font-medium text-gray-900">智能排版</h4>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">
                  自动计算最佳排版方案，充分利用纸张空间，节省打印成本
                </p>
              </div>

              <div class="border border-gray-100 rounded-lg p-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </div>
                  <h4 class="text-base font-medium text-gray-900">一键打印</h4>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">
                  支持多种纸张规格，一键生成打印文件，操作简单方便
                </p>
              </div>

              <div class="border border-gray-100 rounded-lg p-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 class="text-base font-medium text-gray-900">隐私保护</h4>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">
                  所有处理均在本地完成，无需上传服务器，保护您的隐私安全
                </p>
              </div>
            </div>
          </div>

          <!-- 常见问题 -->
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
import { ref, reactive } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

// 组件配置信息
const info = reactive({
  title: "证件照排版打印工具",
  subtitle: "智能排版证件照，支持多种尺寸组合，一键打印更省钱"
})

// 纸张规格
const paperSizes = [
  { id: 1, name: 'A4纸', size: '210×297mm', width: 210, height: 297, dpi: 300 },
  { id: 2, name: '6寸相纸', size: '152×102mm', width: 152, height: 102, dpi: 300 },
  { id: 3, name: '5寸相纸', size: '127×89mm', width: 127, height: 89, dpi: 300 },
  { id: 4, name: '7寸相纸', size: '178×127mm', width: 178, height: 127, dpi: 300 }
]

// 状态管理
const currentImage = ref<string>('')
const processedImageUrl = ref<string>('')
const selectedPaper = ref(1)
const photoCount = ref(8)
const margin = ref(10)
const spacing = ref(5)
const isProcessing = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const imageWidth = ref(0)
const imageHeight = ref(0)

// 排版预设配置
const layoutPresets = [
  { id: 1, name: '标准证件照', photoCount: 8, margin: 10, spacing: 5 },
  { id: 2, name: '护照签证照', photoCount: 6, margin: 15, spacing: 8 },
  { id: 3, name: '简历照', photoCount: 12, margin: 8, spacing: 4 },
  { id: 4, name: '紧凑排版', photoCount: 16, margin: 5, spacing: 3 }
]

// 照片数量预设
const photoCountPresets = [
  { value: 1, label: '1张' },
  { value: 2, label: '2张' },
  { value: 4, label: '4张' },
  { value: 6, label: '6张' },
  { value: 8, label: '8张' },
  { value: 12, label: '12张' },
  { value: 16, label: '16张' }
]

// 边距预设
const marginPresets = [
  { value: 5, label: '5mm (紧凑)' },
  { value: 10, label: '10mm (标准)' },
  { value: 15, label: '15mm (宽松)' },
  { value: 20, label: '20mm (超宽)' }
]

// 间距预设
const spacingPresets = [
  { value: 3, label: '3mm (紧凑)' },
  { value: 5, label: '5mm (标准)' },
  { value: 8, label: '8mm (宽松)' },
  { value: 10, label: '10mm (超宽)' }
]

// 应用预设布局
const applyLayoutPreset = (presetId: number) => {
  const preset = layoutPresets.find(p => p.id === presetId)
  if (preset) {
    photoCount.value = preset.photoCount
    margin.value = preset.margin
    spacing.value = preset.spacing
  }
}

// 常见问题
const faq = [
  {
    q: '支持哪些照片格式？',
    a: '支持JPG、PNG、WebP等常见图片格式，建议上传已处理好的证件照。'
  },
  {
    q: '打印效果如何保证？',
    a: '系统会自动计算最佳排版方案，确保打印效果。建议使用照片打印机和相纸以获得最佳效果。'
  },
  {
    q: '照片会上传到服务器吗？',
    a: '不会，所有处理都在您的浏览器本地完成，保护您的隐私安全。'
  },
  {
    q: '如何调整照片间距？',
    a: '您可以通过设置面板调整照片之间的间距和边距，以获得最适合的排版效果。'
  }
]

// 工具函数
const mmToPixels = (mm: number, dpi: number) => Math.round((mm * dpi) / 25.4)
const getSelectedPaperSize = () => paperSizes.find(p => p.id === selectedPaper.value)

// 计算最佳排版方案
const calculateLayout = (paperWidth: number, paperHeight: number, photoWidth: number, photoHeight: number, count: number, marginMm: number, spacingMm: number, dpi: number) => {
  const margin = mmToPixels(marginMm, dpi)
  const spacing = mmToPixels(spacingMm, dpi)

  const availableWidth = mmToPixels(paperWidth, dpi) - 2 * margin
  const availableHeight = mmToPixels(paperHeight, dpi) - 2 * margin

  // 计算照片的宽高比
  const aspectRatio = photoWidth / photoHeight

  // 尝试不同的行列组合，找到最佳方案
  let bestLayout = null
  let maxPhotoSize = 0

  // 尝试从1行到最大可能行数
  for (let rows = 1; rows <= count; rows++) {
    // 计算每行需要的列数
    const cols = Math.ceil(count / rows)

    // 计算在当前行列数下，每张照片的最大可能尺寸
    const maxWidthPerPhoto = (availableWidth - (cols - 1) * spacing) / cols
    const maxHeightPerPhoto = (availableHeight - (rows - 1) * spacing) / rows

    // 根据宽高比确定实际照片尺寸
    let photoWidth, photoHeight
    if (maxWidthPerPhoto / maxHeightPerPhoto > aspectRatio) {
      // 高度限制
      photoHeight = maxHeightPerPhoto
      photoWidth = photoHeight * aspectRatio
    } else {
      // 宽度限制
      photoWidth = maxWidthPerPhoto
      photoHeight = photoWidth / aspectRatio
    }

    // 检查是否是更好的方案
    const photoSize = photoWidth * photoHeight
    if (photoSize > maxPhotoSize &&
      photoWidth <= maxWidthPerPhoto &&
      photoHeight <= maxHeightPerPhoto) {
      maxPhotoSize = photoSize
      bestLayout = {
        rows,
        cols,
        margin,
        spacing,
        photoWidth: Math.floor(photoWidth),
        photoHeight: Math.floor(photoHeight),
        canvasWidth: mmToPixels(paperWidth, dpi),
        canvasHeight: mmToPixels(paperHeight, dpi)
      }
    }
  }

  return bestLayout || {
    rows: 1,
    cols: 1,
    margin,
    spacing,
    photoWidth: Math.min(availableWidth, photoWidth),
    photoHeight: Math.min(availableHeight, photoHeight),
    canvasWidth: mmToPixels(paperWidth, dpi),
    canvasHeight: mmToPixels(paperHeight, dpi)
  }
}

// 创建排版预览图
const createLayoutPreview = async (layout: any, image: HTMLImageElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = layout.canvasWidth
  canvas.height = layout.canvasHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // 设置白色背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 计算起始位置，使照片组居中
  const totalWidth = layout.cols * layout.photoWidth + (layout.cols - 1) * layout.spacing
  const totalHeight = layout.rows * layout.photoHeight + (layout.rows - 1) * layout.spacing
  const startX = (canvas.width - totalWidth) / 2
  const startY = (canvas.height - totalHeight) / 2

  // 绘制照片
  let count = 0
  for (let row = 0; row < layout.rows && count < photoCount.value; row++) {
    for (let col = 0; col < layout.cols && count < photoCount.value; col++) {
      const x = startX + col * (layout.photoWidth + layout.spacing)
      const y = startY + row * (layout.photoHeight + layout.spacing)

      ctx.drawImage(image, x, y, layout.photoWidth, layout.photoHeight)
      count++
    }
  }

  return canvas.toDataURL('image/jpeg', 0.95)
}

// 文件上传处理
const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  handleImageUpload(file)
  input.value = '' // 清空input值，允许重复选择同一文件
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (!files?.length) return

  const file = files[0]
  if (file.type.startsWith('image/')) {
    handleImageUpload(file)
  } else {
    ElMessage.warning('请上传图片文件')
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 图片处理相关函数
const handleImageUpload = (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      imageWidth.value = img.width
      imageHeight.value = img.height
      currentImage.value = e.target?.result as string
      processedImageUrl.value = '' // 清除之前的处理结果
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const selectPaper = (paperId: number) => {
  selectedPaper.value = paperId
}

const processImage = async () => {
  if (!currentImage.value) {
    ElMessage.warning('请先上传照片')
    return
  }

  isProcessing.value = true
  try {
    const paper = getSelectedPaperSize()
    if (!paper) {
      throw new Error('未选择纸张规格')
    }

    // 加载图片
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = currentImage.value
    })

    // 计算排版布局
    const layout = calculateLayout(
      paper.width,
      paper.height,
      imageWidth.value,
      imageHeight.value,
      photoCount.value,
      margin.value,
      spacing.value,
      paper.dpi
    )

    // 生成预览图
    const preview = await createLayoutPreview(layout, img)
    if (preview) {
      processedImageUrl.value = preview
      ElMessage.success('排版完成')
    } else {
      throw new Error('生成预览图失败')
    }
  } catch (error) {
    ElMessage.error('处理失败，请重试')
    console.error(error)
  } finally {
    isProcessing.value = false
  }
}

const downloadImage = () => {
  if (!processedImageUrl.value) return

  // 创建下载链接
  const link = document.createElement('a')
  link.href = processedImageUrl.value
  link.download = '证件照排版.jpg'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 预览原始图片
const previewOriginalImage = () => {
  if (!currentImage.value) return
  window.open(currentImage.value, '_blank')
}

// 预览排版后的图片
const previewProcessedImage = () => {
  if (!processedImageUrl.value) return
  window.open(processedImageUrl.value, '_blank')
}

// 获取当前路由
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
</style>
