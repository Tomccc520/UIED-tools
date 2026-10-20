<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
-->
<!--
  @file ImageCrop.vue
  @description 图片裁切工具组件，支持自由裁切和预设比例裁切
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2024-12-22

  功能特性：
  1. 支持拖拽和点击上传图片
  2. 支持自由裁切和预设比例裁切
  3. 支持旋转、缩放和调整亮度对比度
  4. 支持键盘快捷键操作
  5. 本地处理，无需上传服务器
-->

<template>
  <div class="min-h-screen uied-file-tool">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="file-tool-card bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="file-tool-heading text-center mb-8 relative">
          <h1 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="file-tool-heading__title relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ $ensureFreeToolTitle(info.title) }}</span>
            </div>
          </h1>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <!-- 文件上传区域 -->
        <div v-if="!currentFile">
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept="image/*"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" aria-label="选择要裁剪的图片" @change="handleFileChange" />

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片到这里</div>
              <p class="text-xs text-gray-400">支持 JPG、PNG、WebP 格式</p>
            </div>
          </div>
        </div>

        <!-- 裁切工具区域 -->
        <div v-else class="space-y-4">
          <div class="file-tool-panel border rounded-lg p-6 bg-white">
            <!-- 顶部工具栏 -->
            <div class="mb-6 space-y-4">
              <div class="file-tool-toolbar flex items-center justify-between">
                <div class="file-tool-toolbar flex items-center space-x-2">
                  <h3 class="text-sm font-medium text-gray-700">裁切工具</h3>
                  <span class="file-tool-filename text-xs text-gray-400">{{ currentFile?.name }}</span>
                </div>
                <div class="file-tool-toolbar flex items-center space-x-3">
                  <!-- 格式选择 -->
                  <div class="flex rounded-lg border overflow-hidden shadow-sm">
                    <button v-for="format in ['JPG', 'PNG', 'WebP']" :key="format" @click="selectedFormat = format"
                      class="px-4 py-2 text-sm font-medium transition-colors relative" :class="[
                        selectedFormat === format
                          ? 'bg-blue-500 text-white shadow-inner'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      ]">
                      {{ format }}
                      <span v-if="selectedFormat === format"
                        class="absolute -bottom-px left-0 w-full h-0.5 bg-blue-600"></span>
                    </button>
                  </div>
                  <!-- 下载按钮 -->
                  <button type="button" :disabled="!cropReady || isDownloading" @click="handleDownload"
                    class="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{{ isDownloading ? '导出中…' : '下载' }}</span>
                  </button>
                </div>
              </div>

              <p v-if="exportError" role="alert" class="text-sm text-red-600">{{ exportError }}</p>

              <!-- 裁切比例按钮组 -->
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                <button v-for="preset in cropPresets" :key="preset.value" @click="setAspectRatio(preset.value)" :class="[
                  'px-3 py-2 text-sm rounded-lg transition-all',
                  (aspectRatio === undefined && preset.value === 'free') ||
                    (aspectRatio === Number(preset.value))
                    ? 'bg-blue-500 text-white shadow-sm transform scale-[1.02]'
                    : 'border hover:bg-gray-50 text-gray-700'
                ]" :title="preset.desc">
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <!-- 裁切区域 -->
            <div class="relative bg-white rounded-lg overflow-hidden border">
              <vue-cropper ref="cropperRef" :src="imageUrl" :aspect-ratio="aspectRatio" :view-mode="2" :guides="true"
                :background="true" :rotatable="true" :scalable="true" :zoomable="true" :movable="true" :crop="onCrop" :ready="onCrop"
                class="image-crop-preview max-h-[600px]" :style="{ '--crop-brightness': brightness + '%', '--crop-contrast': contrast + '%' }" />

              <!-- 图片调整控制面板 -->
              <div
                class="file-tool-crop-adjustments absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-4 min-w-[200px]">
                <div>
                  <label class="text-sm text-gray-600 mb-1 block">亮度</label>
                  <div class="flex items-center space-x-2">
                    <input type="range" v-model="brightness" min="0" max="200" class="flex-1 accent-blue-500" />
                    <span class="text-xs text-gray-500 w-8 text-right">{{ brightness }}%</span>
                  </div>
                </div>
                <div>
                  <label class="text-sm text-gray-600 mb-1 block">对比度</label>
                  <div class="flex items-center space-x-2">
                    <input type="range" v-model="contrast" min="0" max="200" class="flex-1 accent-blue-500" />
                    <span class="text-xs text-gray-500 w-8 text-right">{{ contrast }}%</span>
                  </div>
                </div>
              </div>

              <!-- 缩放和旋转控制 -->
              <div
                class="file-tool-crop-controls absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 flex items-center space-x-6">
                <!-- 缩放控制 -->
                <div class="flex items-center space-x-3">
                  <button @click="zoom(-0.1)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="缩小">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span class="text-sm font-medium w-16 text-center">{{ Math.round(scale * 100) }}%</span>
                  <button @click="zoom(0.1)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="放大">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div class="w-px h-6 bg-gray-200"></div>

                <!-- 旋转控制 -->
                <div class="flex items-center space-x-3">
                  <button @click="rotate(-90)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="向左旋转90°">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v7h7M4 11C4 15.4183 7.58172 19 12 19c4.4183 0 8-3.5817 8-8" />
                    </svg>
                  </button>
                  <span class="text-sm font-medium w-12 text-center">{{ rotateAngle }}°</span>
                  <button @click="rotate(90)" class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="向右旋转90°">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M20 4v7h-7M20 11c0 4.4183-3.5817 8-8 8-4.4183 0-8-3.5817-8-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 操作提示 -->
            <div class="mt-4 flex justify-between items-center px-2">
              <button @click="clearImage" class="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>清除图片</span>
              </button>
              <div class="text-xs text-gray-400 flex items-center space-x-4">
                <span>⌨️ 方向键微调位置</span>
                <span>💡 双击重置裁切框</span>
                <span>⇧ Shift + 方向键快速移动</span>
              </div>
            </div>
          </div>
        </div>
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
                <h4 class="text-base font-medium text-gray-900">专业裁切</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">支持8种预设比例和自由裁切，满足社交媒体、证件照等多种场景需求</p>
            </div>

            <div class="bg-white border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">图像调整</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">支持旋转、缩放、亮度和对比度调节，让图片达到最佳效果</p>
            </div>

            <div class="bg-white border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">多格式导出</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">支持JPG、PNG、WebP格式导出，保持原图质量，满足不同用途</p>
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
import '@/styles/file-tool-responsive.css'
import { ref, reactive, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { encodeImageCanvas } from '@/utils/imageFormatConversion'

// 获取当前路由
const route = useRoute()

// 组件配置信息
const info = reactive({
  title: "免费在线图片裁切工具",
  subtitle: "免费专业的图片裁切工具，支持自由裁切和多种预设比例"
})

// 状态管理
const currentFile = ref<File | null>(null)
const imageUrl = ref('')
const cropReady = ref(false)
const isDownloading = ref(false)
const exportError = ref('')
let activeExportId = 0
const isDragging = ref(false)
const selectedFormat = ref('JPG')
const aspectRatio = ref<number | undefined>(undefined)
const brightness = ref(100)
const contrast = ref(100)
const scale = ref(1)
const rotateAngle = ref(0)
const cropperRef = ref<any>(null)

// 预裁切比例
const cropPresets = [
  { label: '自由裁切', value: 'free', desc: '自由调整裁切区域大小和位置' },
  { label: '1:1 正方形', value: '1', desc: '适用于社交媒体头像、产品图片' },
  { label: '16:9 宽屏', value: '1.7778', desc: '适用于视频封面、横幅广告' },
  { label: '9:16 竖屏', value: '0.5625', desc: '适用于手机壁纸、竖版视频' },
  { label: '4:3 标准', value: '1.3333', desc: '适用于文档配图、演示文稿' },
  { label: '3:2 照片', value: '1.5', desc: '适用于标准照片、打印尺寸' },
  { label: '2:3 证件', value: '0.6667', desc: '适用于证件照、人像照片' },
  { label: '21:9 超宽', value: '2.3333', desc: '适用于电影海报、全景图片' }
]

// 常见问题
const faq = [
  {
    q: '支持哪些图片格式？',
    a: '支持上传JPG、PNG、WebP等常见图片格式，导出时可选择这三种格式的任意一种。'
  },
  {
    q: '如何保持图片透明背景？',
    a: '对于带有透明背景的PNG图片，选择PNG格式导出即可保持透明背景。'
  },
  {
    q: '裁切后的图片质量如何？',
    a: '我们采用高质量的图片处理算法，确保裁切后的图片清晰度不会降低。'
  },
  {
    q: '有文件大小限制吗？',
    a: '为了保证处理性能，建议上传小于10MB的图片。如果需要处理更大的图片，建议先进行压缩。'
  }
]

/** 从文件选择事件读取首张图片并交给统一加载入口。 */
const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  handleFile(file)
}

/** 接收拖入的首张图片，并结束拖拽高亮。 */
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const file = e.dataTransfer?.files[0]
  if (file) handleFile(file)
}

/** 校验图片类型，释放上一张本地资源并初始化当前图片。 */
const handleFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请只选择图片文件')
    return
  }

  clearImage()
  currentFile.value = file
  imageUrl.value = URL.createObjectURL(file)
}

/** 更新裁切比例，实际导出始终读取 Cropper 的当前区域。 */
const setAspectRatio = (value: string | number) => {
  aspectRatio.value = value === 'free' ? undefined : Number(value)
  if (cropperRef.value) {
    cropperRef.value.setAspectRatio(aspectRatio.value)
  }
}

/** 使用 Cropper 事件 detail 或当前数据判断是否可导出，不在每次拖动时重复编码大图。 */
const onCrop = (event?: { detail?: { width?: number; height?: number } }) => {
  const data = event?.detail?.width ? event.detail : cropperRef.value?.getData(true)
  cropReady.value = Number(data?.width) > 0 && Number(data?.height) > 0
  exportError.value = ''
}

/** 获取当前裁切画布并应用与预览一致的亮度和对比度，返回待编码画布。 */
const createExportCanvas = (format: string): HTMLCanvasElement => {
  const canvas = cropperRef.value?.getCroppedCanvas({
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    fillColor: format === 'jpg' ? '#fff' : 'transparent'
  }) as HTMLCanvasElement | null
  if (!canvas || !canvas.width || !canvas.height) throw new Error('裁切区域尚未就绪，请调整后重试')
  if (Number(brightness.value) === 100 && Number(contrast.value) === 100) return canvas
  const adjusted = document.createElement('canvas')
  adjusted.width = canvas.width
  adjusted.height = canvas.height
  const context = adjusted.getContext('2d')
  if (!context) throw new Error('图片绘制失败，请重试')
  context.filter = `brightness(${brightness.value}%) contrast(${contrast.value}%)`
  context.drawImage(canvas, 0, 0)
  return adjusted
}

/** 按比例缩放当前图片，使用 vue-cropperjs 实际提供的 relativeZoom 方法。 */
const zoom = (delta: number) => {
  if (!cropperRef.value) return
  scale.value = Math.max(0.5, Math.min(3, scale.value + delta))
  cropperRef.value.relativeZoom(delta)
}

/** 在当前裁切区域中旋转图片并更新角度提示。 */
const rotate = (angle: number) => {
  if (!cropperRef.value) return
  rotateAngle.value = (rotateAngle.value + angle) % 360
  cropperRef.value.rotate(angle)
}

/** 点击时重新生成当前格式的真实编码结果；失败给出反馈，清除或换图后取消旧下载。 */
const handleDownload = async () => {
  if (!currentFile.value || !cropReady.value || isDownloading.value) return
  const source = currentFile.value
  const format = selectedFormat.value.toLowerCase()
  const exportId = ++activeExportId
  isDownloading.value = true
  exportError.value = ''
  try {
    const canvas = createExportCanvas(format)
    const blob = await encodeImageCanvas(canvas, format, format === 'png' ? 1 : 0.9)
    if (exportId !== activeExportId || source !== currentFile.value) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${source.name.replace(/\.[^/.]+$/, '')}_cropped.${format}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 30000)
  } catch (error) {
    if (exportId !== activeExportId) return
    console.error('[ImageCrop] 图片导出失败', error)
    exportError.value = error instanceof Error && /裁切|图片|格式|不支持/.test(error.message)
      ? error.message : '图片导出失败，请调整裁切范围或更换格式后重试'
    ElMessage.error(exportError.value)
  } finally {
    if (exportId === activeExportId) isDownloading.value = false
  }
}

/** 清除当前图片并释放对象地址，同时使未完成的旧导出失效。 */
const clearImage = () => {
  activeExportId++
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  currentFile.value = null
  imageUrl.value = ''
  cropReady.value = false
  isDownloading.value = false
  exportError.value = ''
  aspectRatio.value = undefined
  brightness.value = 100
  contrast.value = 100
  scale.value = 1
  rotateAngle.value = 0
}

/** 在裁切工具就绪时响应方向键微调，Shift 可扩大移动步长。 */
const handleKeyDown = (e: KeyboardEvent) => {
  if (!cropperRef.value) return

  const step = e.shiftKey ? 10 : 1

  switch (e.key) {
    case 'ArrowLeft':
      cropperRef.value.move(-step, 0)
      break
    case 'ArrowRight':
      cropperRef.value.move(step, 0)
      break
    case 'ArrowUp':
      cropperRef.value.move(0, -step)
      break
    case 'ArrowDown':
      cropperRef.value.move(0, step)
      break
  }
}

// 添加键盘事件监听
window.addEventListener('keydown', handleKeyDown)

/** 离开页面时释放图片与键盘监听，避免后续页面仍响应裁切操作。 */
onBeforeUnmount(() => {
  clearImage()
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.image-crop-preview :deep(.cropper-canvas img),
.image-crop-preview :deep(.cropper-view-box img) {
  filter: brightness(var(--crop-brightness, 100%)) contrast(var(--crop-contrast, 100%));
}
.file-tool-toolbar button:disabled { opacity: .5; cursor: not-allowed; }

.cropper-container {
  max-height: 600px;
}

/* 禁用图片拖动 */
img {
  user-select: none;
  -webkit-user-drag: none;
}
</style>
