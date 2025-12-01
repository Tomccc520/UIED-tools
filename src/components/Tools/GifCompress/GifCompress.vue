<!--
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 -->
<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-6 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-3xl md:text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-4 max-w-2xl mx-auto">{{ info.subtitle }}</p>
        </div>

        <!-- 主要操作区域 -->
        <div class="space-y-8">
          <!-- 上传区域 -->
          <transition name="fade" mode="out-in">
            <div v-if="!file"
              class="relative border-2 border-dashed rounded-xl min-h-[320px] flex flex-col items-center justify-center transition-all duration-300 bg-gray-50/50 group cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 hover:shadow-md"
              :class="isDragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-300'"
              @click="triggerFileInput" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop" role="button" tabindex="0" aria-label="上传GIF文件区域，点击或拖拽文件至此"
              @keydown.enter="triggerFileInput" @keydown.space.prevent="triggerFileInput">
              <input type="file" ref="fileInput" class="hidden" accept="image/gif" @change="handleFileChange" />
              <div class="text-center px-4 transform transition-transform duration-300 group-hover:scale-105">
                <div
                  class="w-24 h-24 mb-6 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center text-blue-500 group-hover:text-blue-600 transition-colors">
                  <el-icon :size="48">
                    <UploadFilled />
                  </el-icon>
                </div>
                <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-3">点击或拖拽 GIF 文件到这里</h3>
                <p class="text-gray-500 text-sm mb-2">支持最大 50MB 的 GIF 文件</p>
                <div class="flex items-center justify-center gap-2 text-gray-400 text-xs mt-4">
                  <el-icon>
                    <Lock />
                  </el-icon>
                  <span>所有处理均在本地完成，保护您的隐私安全</span>
                </div>
              </div>
            </div>

            <!-- 编辑预览区域 -->
            <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <!-- 顶部工具栏 -->
              <div
                class="flex flex-wrap items-center justify-between gap-4 p-4 md:p-6 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <el-button @click="reset" size="large"
                    class="!h-10 !px-4 md:!px-6 hover:!scale-105 transition-transform" icon="ArrowLeft"
                    plain>重新上传</el-button>
                  <div
                    class="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm hidden md:flex">
                    <el-icon class="text-blue-500">
                      <Document />
                    </el-icon>
                    <span class="font-medium max-w-[200px] truncate" :title="file.name">{{ file.name }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <el-button type="primary" size="large" class="!h-10 !px-6 md:!px-8 shadow-sm transition-all"
                    @click="startCompression" :loading="isProcessing">
                    {{ isProcessing ? '正在压缩...' : '开始压缩' }}
                  </el-button>
                  <el-button v-if="compressedSrc" type="success" size="large"
                    class="!h-10 !px-6 shadow-sm transition-all animate-fade-in" @click="downloadFile" icon="Download">
                    下载
                  </el-button>
                </div>
              </div>

              <div class="p-4 md:p-8">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <!-- 左侧：设置面板 -->
                  <div class="lg:col-span-4 space-y-6">
                    <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
                      <h3
                        class="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg border-b border-gray-200 pb-4">
                        <el-icon class="text-blue-500">
                          <Setting />
                        </el-icon> 压缩参数设置
                      </h3>

                      <!-- 尺寸设置 (Scale & Input) -->
                      <div class="mb-8">
                        <div class="flex justify-between items-center mb-3">
                          <span class="text-gray-700 font-medium flex items-center gap-1">
                            尺寸调整
                            <el-tooltip content="缩小尺寸能显著减少文件体积" placement="top">
                              <el-icon class="text-gray-400 cursor-help text-xs">
                                <InfoFilled />
                              </el-icon>
                            </el-tooltip>
                          </span>
                          <span class="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded text-xs">{{
                            Math.round(options.scale * 100) }}%</span>
                        </div>
                        <el-slider v-model="options.scale" :min="0.1" :max="1" :step="0.05" show-stops
                          @input="handleScaleChange" />

                        <div class="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label class="text-xs text-gray-500 mb-1 block">宽度 (px)</label>
                            <el-input-number v-model="customDimensions.width" :min="1" :max="originalDimensions.width"
                              size="small" class="!w-full" @change="handleDimensionChange('width')" :controls="false" />
                          </div>
                          <div>
                            <label class="text-xs text-gray-500 mb-1 block">高度 (px)</label>
                            <el-input-number v-model="customDimensions.height" :min="1" :max="originalDimensions.height"
                              size="small" class="!w-full" @change="handleDimensionChange('height')"
                              :controls="false" />
                          </div>
                        </div>
                      </div>

                      <!-- 色彩与抖动 -->
                      <div class="mb-8">
                        <div class="flex justify-between items-center mb-3">
                          <span class="text-gray-700 font-medium">色彩与画质</span>
                        </div>
                        <div class="space-y-4">
                          <div>
                            <div class="text-xs text-gray-500 mb-1.5">色彩数量</div>
                            <el-select v-model="options.colors" class="w-full">
                              <el-option label="256 色 (原画)" :value="256" />
                              <el-option label="128 色" :value="128" />
                              <el-option label="64 色" :value="64" />
                              <el-option label="32 色" :value="32" />
                              <el-option label="16 色" :value="16" />
                              <el-option label="8 色" :value="8" />
                            </el-select>
                          </div>

                          <div>
                            <div class="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                              抖动算法 (Dithering)
                              <el-tooltip content="抖动可以平滑色彩过渡，但可能会增加噪点和文件体积" placement="top">
                                <el-icon class="text-gray-400 cursor-help text-xs">
                                  <InfoFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                            <el-select v-model="options.dither" class="w-full">
                              <el-option label="无抖动 (文件最小)" :value="false" />
                              <el-option label="Floyd-Steinberg" value="FloydSteinberg" />
                              <el-option label="False Floyd-Steinberg" value="FalseFloydSteinberg" />
                              <el-option label="Stucki" value="Stucki" />
                              <el-option label="Atkinson" value="Atkinson" />
                            </el-select>
                          </div>
                        </div>
                      </div>

                      <!-- 帧率优化 -->
                      <div class="mb-8">
                        <div class="flex justify-between items-center mb-3">
                          <span class="text-gray-700 font-medium">抽帧处理</span>
                          <span class="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded">
                            {{ options.fpsReduction === 1 ? '保留全帧' : `1/${options.fpsReduction} 帧` }}
                          </span>
                        </div>
                        <el-slider v-model="options.fpsReduction" :min="1" :max="5" :step="1" show-stops
                          :marks="{ 1: '原', 3: '中', 5: '高' }" />
                        <div class="text-xs text-gray-400 mt-2">值越高丢弃的帧越多，体积越小但动画越卡顿</div>
                      </div>

                      <!-- 质量参数 -->
                      <div class="mb-2">
                        <div class="flex justify-between items-center mb-2">
                          <span class="text-gray-700 font-medium">压缩质量 (Quality)</span>
                          <span class="text-blue-600 font-bold">{{ options.quality }}</span>
                        </div>
                        <el-slider v-model="options.quality" :min="1" :max="30" :step="1" />
                        <div class="text-xs text-gray-400 mt-1">1 (最佳画质/最慢) - 30 (最低画质/最快)</div>
                      </div>
                    </div>
                  </div>

                  <!-- 右侧：预览区域 -->
                  <div class="lg:col-span-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                      <!-- 原始图片 -->
                      <div class="flex flex-col h-full">
                        <div
                          class="text-sm font-medium text-gray-500 text-center mb-3 flex flex-col items-center justify-center gap-1">
                          <div>原始图片</div>
                          <div class="flex items-center gap-2 text-xs">
                            <span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{{ originalDimensions.width
                            }}x{{ originalDimensions.height }}</span>
                            <span v-if="originalSize > 0" class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{{
                              formatSize(originalSize) }}</span>
                          </div>
                        </div>
                        <div
                          class="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center flex-1 min-h-[300px] relative group p-4">
                          <div class="absolute inset-0 opacity-10 pointer-events-none"
                            style="background-image: linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px;">
                          </div> <!-- 透明背景纹理 -->
                          <el-image :src="originalSrc" class="max-w-full max-h-[400px] rounded-lg z-0"
                            :preview-src-list="[originalSrc]" fit="contain">
                            <template #error>
                              <div class="flex flex-col items-center justify-center text-gray-400">
                                <el-icon :size="30">
                                  <Picture />
                                </el-icon>
                                <span class="mt-2 text-xs">加载失败</span>
                              </div>
                            </template>
                          </el-image>
                        </div>
                      </div>

                      <!-- 压缩后图片 -->
                      <div class="flex flex-col h-full">
                        <div
                          class="text-sm font-medium text-gray-500 text-center mb-3 flex flex-col items-center justify-center gap-1">
                          <div>压缩预览</div>
                          <div class="flex items-center gap-2 text-xs" v-if="compressedSrc">
                            <span class="bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">{{
                              customDimensions.width
                            }}x{{ customDimensions.height }}</span>
                            <span class="bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">{{
                              formatSize(compressedSize)
                            }}</span>
                            <span class="bg-green-500 text-white px-2 py-0.5 rounded font-bold">-{{ calculateReduction()
                            }}%</span>
                          </div>
                        </div>
                        <div
                          class="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center flex-1 min-h-[300px] relative p-4"
                          :class="{ 'bg-blue-50/30 border-blue-200': isProcessing, 'border-green-200 bg-green-50/10': compressedSrc }">

                          <!-- 加载状态 -->
                          <div v-if="isProcessing" class="flex flex-col items-center justify-center w-full h-full z-10">
                            <div class="relative">
                              <el-progress type="circle" :percentage="progress" :width="80" :stroke-width="6"
                                color="#3b82f6" />
                              <div class="absolute inset-0 flex items-center justify-center">
                                <span class="text-xs font-bold text-blue-600">{{ progress }}%</span>
                              </div>
                            </div>
                            <p class="text-blue-600 mt-4 text-sm font-medium animate-pulse">正在智能压缩每一帧...</p>
                            <p class="text-gray-400 text-xs mt-1">大文件可能需要几秒钟，请耐心等待</p>
                          </div>

                          <!-- 结果展示 -->
                          <template v-else-if="compressedSrc">
                            <el-image :src="compressedSrc"
                              class="max-w-full max-h-[400px] rounded-lg z-0 cursor-zoom-in"
                              :preview-src-list="[compressedSrc]" fit="contain" />
                          </template>

                          <!-- 空状态 -->
                          <div v-else class="text-center">
                            <div
                              class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                              <el-icon :size="32">
                                <MagicStick />
                              </el-icon>
                            </div>
                            <p class="text-gray-400 text-sm">点击"开始压缩"查看效果</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 功能说明 -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(feature, index) in features" :key="index"
            class="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {{ index + 1 }}
            </div>
            <div>
              <h4 class="font-bold text-gray-900 mb-1">{{ feature.title }}</h4>
              <p class="text-sm text-gray-600 leading-relaxed">{{ feature.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-4">常见问题</h3>
          <div class="space-y-4">
            <div v-for="(item, index) in faq" :key="index"
              class="pb-4 last:pb-0 border-b border-gray-200 last:border-0">
              <h4 class="font-medium text-gray-900 mb-2">{{ item.q }}</h4>
              <p class="text-sm text-gray-600">{{ item.a }}</p>
            </div>
          </div>
        </div>

        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { UploadFilled, Setting, DataLine, ArrowLeft, Download, Document, Picture, MagicStick, InfoFilled, Lock } from '@element-plus/icons-vue'
import {
  ElMessage,
  ElIcon,
  ElButton,
  ElTooltip,
  ElSlider,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElProgress,
  ElImage
} from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
// 引入 GIF 处理库
import GIF from 'gif.js'
import { parseGIF, decompressFrames } from 'gifuct-js'

const route = useRoute()
const info = {
  title: "免费在线 GIF 动图压缩工具",
  subtitle: "专业级 GIF 压缩方案，支持帧率调整、色彩优化与尺寸缩放，纯本地处理保护隐私"
}

const features = [
  { title: '智能压缩算法', desc: '保持动画流畅度的同时，最大程度减小文件体积' },
  { title: '灵活参数调节', desc: '支持自定义尺寸、色彩数量、抖动算法和抽帧策略' },
  { title: '安全本地处理', desc: '所有压缩过程在浏览器本地完成，保护数据安全' }
]

const faq = [
  { q: '为什么压缩后变模糊了？', a: '减少色彩数量或尺寸会导致画质损失，请尝试增加色彩数或使用抖动算法。' },
  { q: '支持多大的文件？', a: '理论上支持任意大小，但受浏览器内存限制，建议不超过 50MB。' },
  { q: '压缩需要多久？', a: '取决于文件大小和电脑性能，通常只需几秒钟。' }
]

// SEO 配置
useHead({
  title: '免费在线 GIF 压缩工具 - 批量压缩 GIF 动图 - UIED Tools',
  meta: [
    {
      name: 'description',
      content: 'UIED Tools 提供免费在线 GIF 压缩工具，支持调整 GIF 尺寸、色彩数量、抖动算法和帧率。纯前端本地压缩，无需上传服务器，保护隐私。支持实时预览和对比，快速降低 GIF 文件体积。'
    },
    {
      name: 'keywords',
      content: 'GIF压缩,在线GIF压缩,GIF动图压缩,GIF优化,GIF瘦身,GIF大小调整,免费工具,UIED Tools,抖动算法'
    }
  ]
})

// 状态变量
const file = ref<File | null>(null)
const originalSrc = ref('')
const compressedSrc = ref('')
const isDragging = ref(false)
const isProcessing = ref(false)
const progress = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)
const originalSize = ref(0)
const compressedSize = ref(0)
const originalDimensions = reactive({ width: 0, height: 0 })
const customDimensions = reactive({ width: 0, height: 0 })

// 压缩选项
const options = reactive({
  scale: 1,
  colors: 256,
  fpsReduction: 1,
  quality: 10,
  dither: false as boolean | string
})

/**
 * 处理缩放比例变化
 * @param val 新的缩放比例 (0-1)
 */
const handleScaleChange = (val: any) => {
  const scale = Number(val)
  customDimensions.width = Math.round(originalDimensions.width * scale)
  customDimensions.height = Math.round(originalDimensions.height * scale)
}

/**
 * 处理自定义尺寸输入变化
 * 根据输入的一边自动计算另一边，保持宽高比，并更新 scale 值
 * @param type 变化的维度 'width' | 'height'
 */
const handleDimensionChange = (type: 'width' | 'height') => {
  if (originalDimensions.width === 0 || originalDimensions.height === 0) return

  if (type === 'width') {
    const ratio = customDimensions.width / originalDimensions.width
    options.scale = Number(ratio.toFixed(2))
    customDimensions.height = Math.round(originalDimensions.height * ratio)
  } else {
    const ratio = customDimensions.height / originalDimensions.height
    options.scale = Number(ratio.toFixed(2))
    customDimensions.width = Math.round(originalDimensions.width * ratio)
  }
}

/**
 * 触发隐藏的文件输入框点击事件
 */
const triggerFileInput = () => {
  fileInput.value?.click()
}

/**
 * 处理文件拖拽上传
 * @param e 拖拽事件对象
 */
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const droppedFile = e.dataTransfer?.files[0]
  if (droppedFile && droppedFile.type === 'image/gif') {
    processFile(droppedFile)
  } else {
    ElMessage.warning('请上传 GIF 格式的文件')
  }
}

/**
 * 处理文件输入框变更事件
 * @param e 事件对象
 */
const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    processFile(input.files[0])
  }
}

/**
 * 处理文件加载与初始化
 * 读取文件信息，加载预览图，获取原始尺寸
 * @param f 上传的文件对象
 */
const processFile = (f: File) => {
  file.value = f
  originalSize.value = f.size
  originalSrc.value = URL.createObjectURL(f)
  compressedSrc.value = ''
  compressedSize.value = 0

  // 获取图片尺寸
  const img = new Image()
  img.onload = () => {
    originalDimensions.width = img.width
    originalDimensions.height = img.height
    // 初始化自定义尺寸
    customDimensions.width = img.width
    customDimensions.height = img.height
    options.scale = 1
  }
  img.src = originalSrc.value
}

/**
 * 格式化文件大小显示
 * @param bytes 字节数
 * @returns 格式化后的字符串 (e.g. "1.5 MB")
 */
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 计算压缩体积减少百分比
 * @returns 减少的百分比整数
 */
const calculateReduction = () => {
  if (!originalSize.value || !compressedSize.value) return 0
  return Math.round(((originalSize.value - compressedSize.value) / originalSize.value) * 100)
}

/**
 * 重置所有状态，准备重新上传
 */
const reset = () => {
  file.value = null
  originalSrc.value = ''
  compressedSrc.value = ''
  isProcessing.value = false
  progress.value = 0
  if (fileInput.value) fileInput.value.value = ''
}

/**
 * 下载压缩后的 GIF 文件
 */
const downloadFile = () => {
  if (!compressedSrc.value) return
  const link = document.createElement('a')
  link.href = compressedSrc.value
  link.download = `uiedtool_${file.value?.name || 'image.gif'}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 开始压缩过程
 * 1. 解析 GIF 帧
 * 2. 根据参数重绘每一帧 (缩放、抽帧)
 * 3. 使用 gif.js 重新编码
 */
const startCompression = async () => {
  if (!file.value) return

  isProcessing.value = true
  progress.value = 0

  try {
    // 1. 读取文件 ArrayBuffer
    const arrayBuffer = await file.value.arrayBuffer()

    // 2. 解析 GIF
    const gif = parseGIF(arrayBuffer)
    const frames = decompressFrames(gif, true)

    console.log('Parsed frames:', frames.length)

    // 3. 准备 GIF 编码器
    const gifEncoder = new GIF({
      workers: 2,
      quality: options.quality,
      width: customDimensions.width,
      height: customDimensions.height,
      workerScript: '/workers/gif.worker.js',
      dither: options.dither
    })

    // 4. 处理每一帧
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('Canvas context not supported')

    // 设置画布尺寸为原始尺寸（绘制帧）
    canvas.width = originalDimensions.width
    canvas.height = originalDimensions.height

    // 用于缩放的临时画布
    const scaleCanvas = document.createElement('canvas')
    const scaleCtx = scaleCanvas.getContext('2d')
    scaleCanvas.width = customDimensions.width
    scaleCanvas.height = customDimensions.height

    // 异步处理帧，避免阻塞主线程
    const processFrames = async () => {
      for (let i = 0; i < frames.length; i++) {
        // 每处理 5 帧让出一次主线程，保证 UI 响应
        if (i % 5 === 0) await new Promise(resolve => setTimeout(resolve, 0))

        // 抽帧逻辑
        if (i % options.fpsReduction !== 0) continue

        const frame = frames[i]

        // 绘制当前帧像素数据到 canvas
        const frameImageData = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height
        )

        // 创建临时 canvas 来绘制当前帧 patch (处理偏移)
        const patchCanvas = document.createElement('canvas')
        patchCanvas.width = frame.dims.width
        patchCanvas.height = frame.dims.height
        const patchCtx = patchCanvas.getContext('2d')
        patchCtx?.putImageData(frameImageData, 0, 0)

        // 将 patch 绘制到主 canvas
        ctx.drawImage(patchCanvas, frame.dims.left, frame.dims.top)

        // 缩放并添加到编码器
        if (scaleCtx) {
          scaleCtx.clearRect(0, 0, scaleCanvas.width, scaleCanvas.height)
          scaleCtx.drawImage(canvas, 0, 0, scaleCanvas.width, scaleCanvas.height)

          gifEncoder.addFrame(scaleCtx, {
            delay: frame.delay * options.fpsReduction,
            copy: true
          })
        }

        // 处理 disposal (简化版)
        if (frame.disposalType === 2) {
          ctx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height)
        }

        // 更新进度
        progress.value = Math.round(((i + 1) / frames.length) * 50)
      }
    }

    await processFrames()

    // 5. 渲染
    gifEncoder.on('progress', (p: number) => {
      progress.value = 50 + Math.round(p * 50)
    })

    gifEncoder.on('finished', (blob: Blob) => {
      compressedSrc.value = URL.createObjectURL(blob)
      compressedSize.value = blob.size
      isProcessing.value = false
      ElMessage.success('压缩完成！')
    })

    gifEncoder.render()

  } catch (error) {
    console.error(error)
    ElMessage.error('压缩失败，请检查文件是否损坏')
    isProcessing.value = false
  }
}

onUnmounted(() => {
  if (originalSrc.value) URL.revokeObjectURL(originalSrc.value)
  if (compressedSrc.value) URL.revokeObjectURL(compressedSrc.value)
})
</script>

<style scoped>
:deep(.el-slider__runway) {
  margin: 16px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
