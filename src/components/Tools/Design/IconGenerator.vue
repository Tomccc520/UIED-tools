<!--
 * @file IconGenerator.vue
 * @description 应用图标生成器工具组件，支持一键生成各平台所需的应用图标
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-21
 * @lastUpdate 2025-01-23
 -->

<template>
  <div class="min-h-screen">
    <!-- 头部区域 -->
    <div class="bg-white rounded-xl p-6 lg:p-8 mb-4 shadow-sm relative">
      <div class="text-center mb-8 relative">
        <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
          <div class="relative px-12">
            <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">免费应用图标生成器</span>
          </div>
        </h2>
        <p class="text-gray-500 text-sm mt-2">支持多平台尺寸、实时预览和批量导出</p>
      </div>

      <!-- 主要工作区 -->
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col lg:flex-row gap-8">

          <!-- 左侧：编辑器 -->
          <div class="lg:w-5/12 space-y-6">
            <!-- 图层编辑卡片 -->
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-gray-800 flex items-center">
                  <el-icon class="mr-2">
                    <Edit />
                  </el-icon> 图标设计
                </h3>
                <div class="flex gap-2">
                  <el-tooltip content="重置" placement="top">
                    <el-button circle size="small" @click="resetConfig">
                      <el-icon>
                        <RefreshRight />
                      </el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="撤销" placement="top">
                    <el-button circle size="small" :disabled="historyIndex <= 0" @click="undo">
                      <el-icon>
                        <ArrowLeft />
                      </el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="重做" placement="top">
                    <el-button circle size="small" :disabled="historyIndex >= history.length - 1" @click="redo">
                      <el-icon>
                        <ArrowRight />
                      </el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>

              <!-- 快速预设 -->
              <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
                <el-button size="small" round @click="applyPreset('ios')">iOS 风格</el-button>
                <el-button size="small" round @click="applyPreset('android')">Android 风格</el-button>
                <el-button size="small" round @click="applyPreset('circle')">圆形图标</el-button>
                <el-button size="small" round @click="applyPreset('fill')">充满画布</el-button>
              </div>

              <!-- 上传区域 -->
              <div
                class="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all duration-300 group"
                :class="{ 'border-blue-500 bg-blue-50': isDragging }" @dragenter.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false" @dragover.prevent @drop.prevent="handleDrop"
                @click="triggerFileInput" @keydown.enter.prevent="triggerFileInput" @keydown.space.prevent="triggerFileInput"
                role="button" tabindex="0" aria-label="上传图标素材">
                <input type="file" ref="fileInput" class="hidden" accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  @change="handleFileChange">
                <div v-if="!config.image" class="space-y-2">
                  <el-icon class="text-4xl text-gray-400 group-hover:text-blue-500 transition-colors">
                    <UploadFilled />
                  </el-icon>
                  <p class="text-sm text-gray-600 font-medium">点击或拖拽上传图标素材</p>
                  <p class="text-xs text-gray-400">支持 PNG, JPG, SVG (推荐 1024x1024)</p>
                </div>
                <div v-else class="relative group">
                  <img :src="config.image" class="h-24 mx-auto object-contain rounded shadow-sm" />
                  <div
                    class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                    <p class="text-white text-xs">点击更换图片</p>
                  </div>
                </div>
              </div>

              <!-- 样式设置 -->
              <div class="mt-6 space-y-5">
                <!-- 背景设置 -->
                <div>
                  <label class="text-sm font-medium text-gray-700 mb-2 block">背景样式</label>
                  <div class="flex items-center gap-4">
                    <el-color-picker v-model="config.backgroundColor" show-alpha @change="saveHistory" />
                    <span class="text-xs text-gray-500">{{ config.backgroundColor }}</span>
                    <el-checkbox v-model="config.transparentBg" label="透明背景" @change="handleTransparentChange" />
                  </div>
                </div>

                <!-- 缩放与圆角 -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs text-gray-500 mb-1 block">图标缩放 ({{ config.scale }}%)</label>
                    <el-slider v-model="config.scale" :min="10" :max="200" size="small" @change="saveHistory" />
                  </div>
                  <div>
                    <label class="text-xs text-gray-500 mb-1 block">圆角半径 ({{ config.radius }}%)</label>
                    <el-slider v-model="config.radius" :min="0" :max="50" size="small" @change="saveHistory" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 导出设置 -->
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <el-icon class="mr-2">
                  <Setting />
                </el-icon> 导出配置
              </h3>

              <!-- 平台选择 -->
              <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                  <label class="text-sm font-medium text-gray-700">目标平台</label>
                  <el-button type="primary" link size="small" @click="selectAllPlatforms">全选</el-button>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <el-checkbox v-for="p in platforms" :key="p.id" v-model="selectedPlatforms" :label="p.id" border
                    size="small">
                    {{ p.name }}
                  </el-checkbox>
                </div>
              </div>

              <!-- 自定义尺寸 -->
              <div class="mb-4">
                <label class="text-sm font-medium text-gray-700 mb-2 block">自定义尺寸</label>
                <div class="flex gap-2">
                  <el-input-number v-model="customSize" :min="16" :max="1024" size="small" placeholder="大小" />
                  <el-button type="primary" plain size="small" @click="addCustomSize">添加</el-button>
                </div>
                <div class="flex flex-wrap gap-2 mt-2">
                  <el-tag v-for="(size, index) in customSizes" :key="index" closable @close="removeCustomSize(index)"
                    size="small">
                    {{ size }}x{{ size }}
                  </el-tag>
                </div>
              </div>

              <!-- 格式选择 -->
              <div class="mb-4">
                <label class="text-sm font-medium text-gray-700 mb-2 block">导出格式</label>
                <el-radio-group v-model="exportFormat" size="small">
                  <el-radio-button label="png">PNG</el-radio-button>
                  <el-radio-button label="ico">ICO (Win)</el-radio-button>
                  <el-radio-button label="svg" :disabled="!config.image">SVG</el-radio-button>
                </el-radio-group>
              </div>

              <el-button type="primary" size="large" class="w-full mt-2" @click="generateIcons" :loading="isGenerating"
                :disabled="!config.image">
                <el-icon class="mr-2">
                  <Download />
                </el-icon> 生成并下载图标包
              </el-button>
            </div>
          </div>

          <!-- 右侧：预览 -->
          <div class="lg:w-7/12">
            <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden sticky top-6">
              <div class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 class="font-bold text-gray-800">实时预览</h3>
                <div class="text-xs text-gray-500">1024x1024 基准渲染</div>
              </div>

              <!-- 主预览画布 -->
              <div class="p-8 flex items-center justify-center bg-checkered min-h-[300px]">
                <canvas ref="mainCanvasRef" width="512" height="512"
                  class="shadow-lg rounded-xl max-w-full h-auto"></canvas>
              </div>

              <!-- 多尺寸预览 -->
              <div class="p-6 bg-gray-50 border-t border-gray-100">
                <h4 class="text-sm font-bold text-gray-700 mb-4">各平台效果预览</h4>
                <el-tabs v-model="activePreviewTab">
                  <el-tab-pane label="iOS" name="ios">
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div v-for="size in getPlatformSizes('ios')" :key="size.name" class="text-center">
                        <div class="bg-white rounded p-2 shadow-sm mb-2 inline-block">
                          <img :src="previewDataUrl" :style="getPreviewStyle(size.size)"
                            class="mx-auto object-contain bg-checkered rounded-[18%]" />
                        </div>
                        <p class="text-xs text-gray-500">{{ size.size }}x</p>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="Android" name="android">
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div v-for="size in getPlatformSizes('android')" :key="size.name" class="text-center">
                        <div class="bg-white rounded p-2 shadow-sm mb-2 inline-block">
                          <img :src="previewDataUrl" :style="getPreviewStyle(size.size)"
                            class="mx-auto object-contain bg-checkered"
                            :class="config.radius > 0 ? 'rounded-lg' : 'rounded-none'" />
                        </div>
                        <p class="text-xs text-gray-500">{{ size.size }}x</p>
                      </div>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane label="Web" name="webapp">
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div v-for="size in getPlatformSizes('webapp')" :key="size.name" class="text-center">
                        <div class="bg-white rounded p-2 shadow-sm mb-2 inline-block">
                          <img :src="previewDataUrl" :style="getPreviewStyle(size.size)"
                            class="mx-auto object-contain bg-checkered" />
                        </div>
                        <p class="text-xs text-gray-500">{{ size.size }}x</p>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { UploadFilled, Edit, Setting, Download, ArrowLeft, ArrowRight, RefreshRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import JSZip from 'jszip'

// --- 类型定义 ---
interface IconConfig {
  image: string | null
  backgroundColor: string
  transparentBg: boolean
  scale: number // 10-200%
  radius: number // 0-50%
}

interface Platform {
  id: string
  name: string
  sizes: { name: string; size: number }[]
}

// --- 状态管理 ---
const route = useRoute()
const fileInput = ref<HTMLInputElement | null>(null)
const mainCanvasRef = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
const isGenerating = ref(false)
const activePreviewTab = ref('ios')
const previewDataUrl = ref('')

// 配置状态
const config = reactive<IconConfig>({
  image: null,
  backgroundColor: '#3b82f6',
  transparentBg: false,
  scale: 80,
  radius: 20
})

// 导出配置
const selectedPlatforms = ref(['ios', 'android', 'webapp'])
const customSize = ref(1024)
const customSizes = ref<number[]>([])
const exportFormat = ref('png')

// 历史记录 (简单的状态快照)
const history = ref<string[]>([])
const historyIndex = ref(-1)

const MAX_ICON_SOURCE_SIZE_BYTES = 10 * 1024 * 1024
let renderTimer: number | null = null
let renderToken = 0
let cachedImageSource = ''
let cachedImage: HTMLImageElement | null = null

// --- 平台数据 ---
const platforms: Platform[] = [
  {
    id: 'ios',
    name: 'iOS',
    sizes: [
      { name: 'iPhone Notification 2x', size: 40 },
      { name: 'iPhone Notification 3x', size: 60 },
      { name: 'iPhone Settings 2x', size: 58 },
      { name: 'iPhone Settings 3x', size: 87 },
      { name: 'iPhone Spotlight 2x', size: 80 },
      { name: 'iPhone Spotlight 3x', size: 120 },
      { name: 'iPhone App 2x', size: 120 },
      { name: 'iPhone App 3x', size: 180 },
      { name: 'iPad Notification', size: 20 },
      { name: 'iPad Settings', size: 29 },
      { name: 'iPad Spotlight', size: 40 },
      { name: 'iPad App', size: 76 },
      { name: 'iPad Pro App 2x', size: 167 },
      { name: 'App Store', size: 1024 }
    ]
  },
  {
    id: 'android',
    name: 'Android',
    sizes: [
      { name: 'mdpi', size: 48 },
      { name: 'hdpi', size: 72 },
      { name: 'xhdpi', size: 96 },
      { name: 'xxhdpi', size: 144 },
      { name: 'xxxhdpi', size: 192 },
      { name: 'Play Store', size: 512 }
    ]
  },
  {
    id: 'webapp',
    name: 'Web App',
    sizes: [
      { name: 'favicon-16', size: 16 },
      { name: 'favicon-32', size: 32 },
      { name: 'apple-touch-icon', size: 180 },
      { name: 'android-chrome-192', size: 192 },
      { name: 'android-chrome-512', size: 512 }
    ]
  },
  {
    id: 'macos',
    name: 'macOS',
    sizes: [
      { name: '16', size: 16 },
      { name: '32', size: 32 },
      { name: '64', size: 64 },
      { name: '128', size: 128 },
      { name: '256', size: 256 },
      { name: '512', size: 512 },
      { name: '1024', size: 1024 }
    ]
  },
  {
    id: 'watchos',
    name: 'watchOS',
    sizes: [
      { name: 'Notification', size: 48 },
      { name: 'Home Screen', size: 80 },
      { name: 'Short Look', size: 172 },
      { name: 'App Store', size: 1024 }
    ]
  }
]

// --- SEO ---
useHead({
  title: '免费应用图标生成器 - 一键生成iOS/Android/Web图标 - UIED Tools',
  meta: [
    { name: 'description', content: 'UIED Tools 提供免费在线应用图标制作工具，支持自定义圆角、背景、尺寸。一键导出iOS、Android、Web App、macOS等全平台图标包，支持PNG/SVG/ICO格式。纯前端处理，保护隐私。' },
    { name: 'keywords', content: '免费图标生成器,App Icon Generator,iOS图标生成,Android图标制作,favicon在线生成,应用图标设计,免费在线工具,UIED Tools' },
    { property: 'og:title', content: '免费应用图标生成器 - UIED Tools' },
    { property: 'og:description', content: '一键生成 iOS、Android、Web App 等多平台应用图标，支持自定义设计与实时预览。' },
    { property: 'og:type', content: 'website' }
  ]
})

// --- 逻辑实现 ---

// 1. 历史记录管理
const saveHistory = () => {
  const snapshot = JSON.stringify(config)
  if (history.value[historyIndex.value] === snapshot) return
  // 删除当前指针之后的历史
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(snapshot)
  historyIndex.value = history.value.length - 1

  // 限制历史记录长度
  if (history.value.length > 20) {
    history.value.shift()
    historyIndex.value--
  }
}

const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    const state = JSON.parse(history.value[historyIndex.value])
    Object.assign(config, state)
  }
}

const redo = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    const state = JSON.parse(history.value[historyIndex.value])
    Object.assign(config, state)
  }
}

const resetConfig = () => {
  config.image = null
  config.backgroundColor = '#3b82f6'
  config.transparentBg = false
  config.scale = 80
  config.radius = 20
  saveHistory()
}

const applyPreset = (type: 'ios' | 'android' | 'circle' | 'fill') => {
  if (type === 'ios') {
    config.radius = 22
    config.scale = 100
    config.transparentBg = false
  } else if (type === 'android') {
    config.radius = 0
    config.scale = 75
    config.transparentBg = true
  } else if (type === 'circle') {
    config.radius = 50
    config.scale = 65
    config.transparentBg = false
  } else if (type === 'fill') {
    config.radius = 0
    config.scale = 100
    config.transparentBg = false
  }
  saveHistory()
}

// 2. 核心渲染引擎
const renderCanvas = async () => {
  if (!mainCanvasRef.value) return

  const canvas = mainCanvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const currentToken = ++renderToken

  // 设置画布尺寸（基准 1024x1024）
  const size = 1024
  // 实际显示尺寸可能被CSS缩放，但Canvas内部分辨率保持高以供导出
  if (canvas.width !== size) {
    canvas.width = size
    canvas.height = size
  }

  ctx.clearRect(0, 0, size, size)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // 绘制背景
  if (!config.transparentBg) {
    ctx.save()
    // 应用圆角裁切
    const r = (size * config.radius) / 100
    ctx.beginPath()
    // 兼容性处理: 手动绘制圆角矩形
    ctx.moveTo(r, 0)
    ctx.lineTo(size - r, 0)
    ctx.quadraticCurveTo(size, 0, size, r)
    ctx.lineTo(size, size - r)
    ctx.quadraticCurveTo(size, size, size - r, size)
    ctx.lineTo(r, size)
    ctx.quadraticCurveTo(0, size, 0, size - r)
    ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()
    ctx.clip()

    ctx.fillStyle = config.backgroundColor
    ctx.fillRect(0, 0, size, size)
    ctx.restore()
  }

  // 绘制图标图片
  if (config.image) {
    try {
      const img = await loadImage(config.image)
      if (currentToken !== renderToken) return
      const scale = config.scale / 100

      const imgW = size * scale
      const imgH = (img.height / img.width) * imgW

      const x = (size - imgW) / 2
      const y = (size - imgH) / 2

      ctx.save()
      // 如果背景是透明的，圆角裁切应该应用在图片上吗？
      // 通常App图标如果背景透明，意味着图标本身是不规则的。
      // 如果有背景色，圆角切背景。
      // 策略：如果透明背景且设置了圆角，则裁切图片。
      if (config.transparentBg && config.radius > 0) {
        const r = (size * config.radius) / 100
        ctx.beginPath()
        ctx.moveTo(r, 0)
        ctx.lineTo(size - r, 0)
        ctx.quadraticCurveTo(size, 0, size, r)
        ctx.lineTo(size, size - r)
        ctx.quadraticCurveTo(size, size, size - r, size)
        ctx.lineTo(r, size)
        ctx.quadraticCurveTo(0, size, 0, size - r)
        ctx.lineTo(0, r)
        ctx.quadraticCurveTo(0, 0, r, 0)
        ctx.closePath()
        ctx.clip()
      } else if (!config.transparentBg) {
        // 背景已经切过圆角了，这里还需要切吗？
        // 图片应该被限制在圆角区域内
        const r = (size * config.radius) / 100
        ctx.beginPath()
        ctx.moveTo(r, 0)
        ctx.lineTo(size - r, 0)
        ctx.quadraticCurveTo(size, 0, size, r)
        ctx.lineTo(size, size - r)
        ctx.quadraticCurveTo(size, size, size - r, size)
        ctx.lineTo(r, size)
        ctx.quadraticCurveTo(0, size, 0, size - r)
        ctx.lineTo(0, r)
        ctx.quadraticCurveTo(0, 0, r, 0)
        ctx.closePath()
        ctx.clip()
      }

      ctx.drawImage(img, x, y, imgW, imgH)
      ctx.restore()
    } catch (e) {
      console.error('Failed to load image', e)
    }
  }

  // 更新预览图 URL
  previewDataUrl.value = canvas.toDataURL('image/png')
}

// 辅助：加载图片
const loadImage = (src: string): Promise<HTMLImageElement> => {
  if (cachedImageSource === src && cachedImage) return Promise.resolve(cachedImage)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      cachedImageSource = src
      cachedImage = img
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

// 3. 事件处理
const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    handleDrop({ dataTransfer: { files: input.files } } as any)
  }
  input.value = ''
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }

  if (file.size > MAX_ICON_SOURCE_SIZE_BYTES) {
    ElMessage.error('图片大小不能超过 10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    config.image = event.target?.result as string
    saveHistory()
  }
  reader.onerror = () => ElMessage.error('读取图片失败，请重新选择')
  reader.readAsDataURL(file)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleTransparentChange = (val: boolean) => {
  if (val) {
    // 如果设为透明，可能需要提示用户圆角在某些平台（如iOS）是系统自动加的，这里生成的透明PNG在iOS上会显示黑色背景
    // 但为了灵活性，允许透明
  }
  saveHistory()
}

const selectAllPlatforms = () => {
  if (selectedPlatforms.value.length === platforms.length) {
    selectedPlatforms.value = []
  } else {
    selectedPlatforms.value = platforms.map(p => p.id)
  }
}

const addCustomSize = () => {
  if (customSizes.value.includes(customSize.value)) return
  customSizes.value.push(customSize.value)
  customSizes.value.sort((a, b) => a - b)
}

const removeCustomSize = (index: number) => {
  customSizes.value.splice(index, 1)
}

// 4. 导出逻辑
/**
 * 将 PNG 数据封装为浏览器可识别的单图标 ICO 文件。
 * @param pngBlob 已渲染的 PNG 数据
 * @param size 图标边长
 * @returns 标准 ICO Blob
 */
const createIcoBlob = async (pngBlob: Blob, size: number): Promise<Blob> => {
  const pngBuffer = await pngBlob.arrayBuffer()
  const output = new ArrayBuffer(22 + pngBuffer.byteLength)
  const view = new DataView(output)
  view.setUint16(0, 0, true)
  view.setUint16(2, 1, true)
  view.setUint16(4, 1, true)
  view.setUint8(6, size >= 256 ? 0 : size)
  view.setUint8(7, size >= 256 ? 0 : size)
  view.setUint8(8, 0)
  view.setUint8(9, 0)
  view.setUint16(10, 1, true)
  view.setUint16(12, 32, true)
  view.setUint32(14, pngBuffer.byteLength, true)
  view.setUint32(18, 22, true)
  new Uint8Array(output, 22).set(new Uint8Array(pngBuffer))
  return new Blob([output], { type: 'image/x-icon' })
}

/**
 * 从主画布导出指定尺寸的 PNG 数据。
 * @param baseCanvas 已渲染的基准画布
 * @param size 输出图标边长
 * @returns PNG Blob，无法创建时返回 null
 */
const renderExportBlob = async (baseCanvas: HTMLCanvasElement, size: number): Promise<Blob | null> => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(baseCanvas, 0, 0, size, size)
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

/**
 * 根据当前配置生成并下载图标压缩包。
 * @returns 异步任务，无返回值
 */
const generateIcons = async () => {
  if (!config.image) {
    ElMessage.warning('请先上传图标素材')
    return
  }
  if (exportFormat.value !== 'svg' && !selectedPlatforms.value.length && !customSizes.value.length) {
    ElMessage.warning('请至少选择一个平台或添加一个自定义尺寸')
    return
  }

  isGenerating.value = true
  try {
    const zip = new JSZip()
    const baseCanvas = mainCanvasRef.value
    if (!baseCanvas) throw new Error('预览画布尚未准备好')

    const tasks: { folder: string, name: string, size: number }[] = []
    selectedPlatforms.value.forEach(pid => {
      const platform = platforms.find(p => p.id === pid)
      platform?.sizes.forEach(s => tasks.push({ folder: platform.name, name: s.name, size: s.size }))
    })
    customSizes.value.forEach(s => tasks.push({ folder: 'Custom', name: `icon-${s}`, size: s }))

    if (exportFormat.value === 'png') {
      for (const task of tasks) {
        const blob = await renderExportBlob(baseCanvas, task.size)
        if (blob) zip.folder(task.folder)?.file(`${task.name}.png`, blob)
      }
    } else if (exportFormat.value === 'ico') {
      const pngBlob = await renderExportBlob(baseCanvas, 32)
      if (pngBlob) zip.file('favicon.ico', await createIcoBlob(pngBlob, 32))
    } else {
      const svgContent = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${!config.transparentBg ? `<rect width="1024" height="1024" rx="${(1024 * config.radius) / 100}" fill="${config.backgroundColor}" />` : ''}
  <image href="${config.image}" x="0" y="0" width="1024" height="1024" preserveAspectRatio="xMidYMid meet" />
</svg>`
      zip.file('icon.svg', svgContent)
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = exportFormat.value === 'ico' ? 'favicon-package.zip' : 'app-icons.zip'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    ElMessage.success('图标包已生成')
  } catch (e) {
    console.error(e)
    ElMessage.error('生成失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

// 5. 辅助函数
const getPlatformSizes = (pid: string) => {
  return platforms.find(p => p.id === pid)?.sizes || []
}

const getPreviewStyle = (size: number) => {
  // 预览图最大显示 64px，防止过大
  const displaySize = Math.min(size, 64)
  return {
    width: `${displaySize}px`,
    height: `${displaySize}px`
  }
}

/**
 * 调度画布渲染，合并连续滑块变更，避免拖动过程中重复解码和绘制。
 * @returns 无返回值
 */
const scheduleRenderCanvas = () => {
  if (renderTimer !== null) window.clearTimeout(renderTimer)
  renderTimer = window.setTimeout(() => {
    renderTimer = null
    void renderCanvas()
  }, 24)
}

// --- 监听与生命周期 ---
watch(config, scheduleRenderCanvas, { deep: true })

onMounted(() => {
  saveHistory() // 初始状态
  nextTick(() => {
    void renderCanvas()
  })
})

onUnmounted(() => {
  if (renderTimer !== null) window.clearTimeout(renderTimer)
  renderTimer = null
  renderToken++
})

</script>

<style scoped>
.bg-checkered {
  background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
    linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  background-color: #fff;
}
</style>
