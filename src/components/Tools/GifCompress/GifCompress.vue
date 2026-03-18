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
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ $ensureFreeToolTitle(info.title) }}</span>
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

                      <!-- 画质保护模式 -->
                      <div class="mb-6 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-4">
                        <div class="flex items-start justify-between gap-3">
                          <div>
                            <p class="text-sm font-semibold text-gray-900">画质保护模式</p>
                            <p class="text-xs text-gray-500 mt-1">开启后默认保留原尺寸、原帧率与 256 色，仅做逐帧去重压缩。</p>
                          </div>
                          <el-switch v-model="preserveQuality" @change="handlePreserveQualityChange" />
                        </div>
                        <div class="mt-3 flex flex-wrap gap-2">
                          <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                            :class="preserveQuality ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                            {{ preserveQuality ? '当前：画质优先' : '当前：自定义压缩' }}
                          </span>
                          <span class="px-2.5 py-1 rounded-full text-xs text-blue-700 bg-blue-100">建议先尝试画质优先，再按需降低参数</span>
                        </div>
                      </div>

                      <!-- 压缩预设 -->
                      <div class="mb-8">
                        <div class="flex justify-between items-center mb-3">
                          <span class="text-gray-700 font-medium">压缩策略预设</span>
                          <span class="text-xs text-gray-400">可在下方继续微调</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                          <button
                            v-for="(preset, key) in compressionPresets"
                            :key="key"
                            type="button"
                            class="rounded-lg px-3 py-2 text-left transition-all border"
                            :class="activePreset === key
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'"
                            @click="applyCompressionPreset(key)"
                          >
                            <p class="text-sm font-medium leading-none">{{ preset.label }}</p>
                            <p class="text-[11px] mt-1 opacity-80">{{ preset.desc }}</p>
                          </button>
                        </div>
                      </div>

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
                          @input="handleScaleChange" :disabled="preserveQuality" />

                        <div class="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label class="text-xs text-gray-500 mb-1 block">宽度 (px)</label>
                            <el-input-number v-model="customDimensions.width" :min="1" :max="Math.max(originalDimensions.width, 1)"
                              size="small" class="!w-full" @change="handleDimensionChange('width')" :controls="false"
                              :disabled="preserveQuality" />
                          </div>
                          <div>
                            <label class="text-xs text-gray-500 mb-1 block">高度 (px)</label>
                            <el-input-number v-model="customDimensions.height" :min="1" :max="Math.max(originalDimensions.height, 1)"
                              size="small" class="!w-full" @change="handleDimensionChange('height')"
                              :controls="false" :disabled="preserveQuality" />
                          </div>
                        </div>
                        <p v-if="preserveQuality" class="text-xs text-green-600 mt-2">画质保护模式下已锁定为原始尺寸。</p>
                      </div>

                      <!-- 色彩与抖动 -->
                      <div class="mb-8">
                        <div class="flex justify-between items-center mb-3">
                          <span class="text-gray-700 font-medium">色彩与画质</span>
                        </div>
                        <div class="space-y-4">
                          <div>
                            <div class="text-xs text-gray-500 mb-1.5">色彩数量</div>
                            <el-select v-model="options.colors" class="w-full" :disabled="preserveQuality">
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
                            <el-select v-model="options.dither" class="w-full" :disabled="preserveQuality">
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
                          :marks="{ 1: '原', 3: '中', 5: '高' }" :disabled="preserveQuality" />
                        <div class="text-xs text-gray-400 mt-2">值越高丢弃的帧越多，体积越小但动画越卡顿</div>
                        <div v-if="preserveQuality" class="text-xs text-green-600 mt-2">画质保护模式下已锁定全帧输出。</div>
                      </div>

                      <!-- 质量参数 -->
                      <div class="mb-2">
                        <div class="flex justify-between items-center mb-2">
                          <span class="text-gray-700 font-medium">压缩质量 (Quality)</span>
                          <span class="text-blue-600 font-bold">{{ options.quality }}</span>
                        </div>
                        <el-slider v-model="options.quality" :min="1" :max="30" :step="1" :disabled="preserveQuality" />
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
                            <span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">帧 {{
                              compressionStats.encodedFrames
                            }}/{{ compressionStats.decodedFrames }}</span>
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
                            <p class="text-blue-600 mt-4 text-sm font-medium animate-pulse">{{ processingStage || '正在智能压缩每一帧...' }}</p>
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
                <div v-if="compressionStats.decodedFrames > 0"
                  class="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span class="px-2 py-1 rounded bg-white border border-gray-200">解析帧数：{{ compressionStats.decodedFrames }}</span>
                  <span class="px-2 py-1 rounded bg-white border border-gray-200">输出帧数：{{ compressionStats.encodedFrames }}</span>
                  <span class="px-2 py-1 rounded bg-white border border-gray-200">合并重复帧：{{ compressionStats.mergedFrames }}</span>
                  <span class="px-2 py-1 rounded bg-white border border-gray-200">模式：{{ compressionStats.modeLabel || '未开始' }}</span>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 功能说明 -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
import { ref, reactive, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { UploadFilled, Setting, ArrowLeft, Download, Document, Picture, MagicStick, InfoFilled, Lock } from '@element-plus/icons-vue'
import {
  ElMessage,
  ElIcon,
  ElButton,
  ElTooltip,
  ElSwitch,
  ElSlider,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElProgress,
  ElImage
} from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { ensureGifRuntime } from '@/utils/toolRuntimeLoaders'

const route = useRoute()
const info = {
  title: "免费在线 GIF 动图压缩工具",
  subtitle: "专业级 GIF 压缩方案，支持帧率调整、色彩优化与尺寸缩放，纯本地处理保护隐私"
}

const features = [
  { title: '画质优先模式', desc: '默认保留原尺寸、原帧率与 256 色，优先保证动画观感一致性' },
  { title: '逐帧智能压缩', desc: '支持帧合成与 disposal 还原，并自动合并重复帧减少体积' },
  { title: '灵活参数调节', desc: '支持自定义尺寸、色彩数量、抖动算法和抽帧策略' },
  { title: '安全本地处理', desc: '所有压缩过程在浏览器本地完成，保护数据安全' }
]

const faq = [
  { q: '为什么压缩后变模糊了？', a: '减少色彩数量、尺寸或抽帧都会带来画质损失。建议先开启“画质保护模式”再压缩。' },
  { q: '支持多大的文件？', a: '理论上支持任意大小，但受浏览器内存限制，建议不超过 50MB。' },
  { q: '压缩需要多久？', a: '取决于文件大小和电脑性能，通常只需几秒钟。' },
  { q: '为什么有时“压缩后更大”？', a: '某些原图已经高度优化，重复编码可能变大。工具会自动保留原图，避免负优化。' }
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
const MAX_GIF_FILE_SIZE = 50 * 1024 * 1024

// 压缩选项
const options = reactive({
  scale: 1,
  colors: 256,
  fpsReduction: 1,
  quality: 1,
  dither: false as boolean | string
})

const compressionPresets = {
  quality: {
    label: '画质优先',
    desc: '保画质',
    scale: 1,
    colors: 256,
    fpsReduction: 1,
    quality: 1,
    dither: false as boolean | string,
    preserveQuality: true
  },
  balanced: {
    label: '平衡',
    desc: '体积/画质',
    scale: 1,
    colors: 128,
    fpsReduction: 1,
    quality: 8,
    dither: 'FalseFloydSteinberg' as boolean | string,
    preserveQuality: false
  },
  strong: {
    label: '高压缩',
    desc: '明显减小',
    scale: 0.85,
    colors: 64,
    fpsReduction: 2,
    quality: 12,
    dither: false as boolean | string,
    preserveQuality: false
  },
  extreme: {
    label: '极限',
    desc: '体积优先',
    scale: 0.7,
    colors: 32,
    fpsReduction: 3,
    quality: 18,
    dither: false as boolean | string,
    preserveQuality: false
  }
} as const

const activePreset = ref<keyof typeof compressionPresets>('quality')
const preserveQuality = ref(true)
const processingStage = ref('')

const compressionStats = reactive({
  decodedFrames: 0,
  encodedFrames: 0,
  mergedFrames: 0,
  modeLabel: ''
})

/**
 * 按缩放比例更新尺寸
 * @description 统一维护 scale 与自定义宽高，避免多处重复计算
 * @param scale 缩放比例
 */
const updateDimensionsByScale = (scale: number) => {
  options.scale = Number(scale.toFixed(2))
  if (!originalDimensions.width || !originalDimensions.height) return
  customDimensions.width = Math.max(1, Math.round(originalDimensions.width * options.scale))
  customDimensions.height = Math.max(1, Math.round(originalDimensions.height * options.scale))
}

/**
 * 应用压缩预设
 * @description 一键切换压缩参数组合，用户仍可继续手动微调
 * @param preset 预设名称
 */
const applyCompressionPreset = (preset: keyof typeof compressionPresets | string) => {
  const normalizedPreset = (preset in compressionPresets ? preset : 'balanced') as keyof typeof compressionPresets
  activePreset.value = normalizedPreset
  const target = compressionPresets[normalizedPreset]
  preserveQuality.value = target.preserveQuality
  updateDimensionsByScale(target.scale)
  options.colors = target.colors
  options.fpsReduction = target.fpsReduction
  options.quality = target.quality
  options.dither = target.dither
}

/**
 * 处理画质保护模式切换
 * @description 开启后切换到画质优先方案；关闭后切回平衡方案便于继续调参
 * @param enabled 是否启用画质保护
 */
const handlePreserveQualityChange = (enabled: boolean) => {
  applyCompressionPreset(enabled ? 'quality' : 'balanced')
}

// 默认应用画质优先，优先保证观感一致性
applyCompressionPreset(activePreset.value)

/**
 * 释放 blob URL 资源
 * @description 统一回收 URL.createObjectURL 创建的临时地址，避免内存泄漏
 * @param objectUrl blob URL
 */
const revokeObjectUrl = (objectUrl: string) => {
  if (objectUrl && objectUrl.startsWith('blob:')) {
    URL.revokeObjectURL(objectUrl)
  }
}

/**
 * 校验 GIF 文件
 * @description 校验文件格式与大小，防止不可用输入触发后续压缩异常
 * @param inputFile 用户上传文件
 * @returns 错误信息，空字符串表示校验通过
 */
const getGifFileError = (inputFile: File) => {
  if (inputFile.type !== 'image/gif' && !inputFile.name.toLowerCase().endsWith('.gif')) {
    return '请上传 GIF 格式文件'
  }
  if (inputFile.size > MAX_GIF_FILE_SIZE) {
    return 'GIF 文件不能超过 50MB'
  }
  return ''
}

/**
 * 获取 GIF 编码 worker 数量
 * @description 根据设备并发能力动态分配 worker，兼顾性能与资源占用
 * @returns worker 数量
 */
const getGifWorkerCount = () => {
  const concurrency = navigator.hardwareConcurrency || 4
  return Math.min(4, Math.max(2, Math.floor(concurrency / 2)))
}

/**
 * 归一化帧延迟
 * @description 保障帧延时在合理范围，避免极小/异常值导致动画闪烁
 * @param delay 原始延时（毫秒）
 * @returns 归一化后的延时（毫秒）
 */
const normalizeFrameDelay = (delay: number) => {
  const safeDelay = Number(delay) || 100
  return Math.max(20, safeDelay)
}

/**
 * 计算 RGB 三通道的量化位数
 * @description 将目标颜色数映射为 r/g/b 位深组合，确保总颜色数不超过用户设置
 * @param maxColors 目标最大颜色数
 * @returns RGB 三通道量化位数
 */
const getRgbQuantizeBits = (maxColors: number) => {
  const safeColors = Math.min(256, Math.max(8, Math.round(maxColors)))
  const totalBits = Math.max(3, Math.floor(Math.log2(safeColors)))
  const baseBits = Math.floor(totalBits / 3)
  const remainder = totalBits % 3
  return {
    rBits: baseBits + (remainder > 0 ? 1 : 0),
    gBits: baseBits + (remainder > 1 ? 1 : 0),
    bBits: baseBits
  }
}

/**
 * 将单通道值映射到指定位深
 * @description 通过均匀量化压缩颜色空间，降低编码复杂度与最终体积
 * @param value 原始通道值
 * @param bits 通道位深
 * @returns 量化后的通道值
 */
const quantizeColorChannel = (value: number, bits: number) => {
  if (bits >= 8) return value
  const levels = (1 << bits) - 1
  const normalized = Math.round((value / 255) * levels)
  return Math.round((normalized / levels) * 255)
}

/**
 * 对当前画布进行颜色量化
 * @description 真正消费“色彩数量”参数，按帧降色后再进入 GIF 编码
 * @param ctx 目标画布上下文
 * @param width 画布宽度
 * @param height 画布高度
 * @param maxColors 目标最大颜色数
 */
const applyColorQuantization = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  maxColors: number
) => {
  if (maxColors >= 256 || width <= 0 || height <= 0) return
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const { rBits, gBits, bBits } = getRgbQuantizeBits(maxColors)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = quantizeColorChannel(data[i], rBits)
    data[i + 1] = quantizeColorChannel(data[i + 1], gBits)
    data[i + 2] = quantizeColorChannel(data[i + 2], bBits)
  }
  ctx.putImageData(imageData, 0, 0)
}

/**
 * 判断两帧像素是否一致
 * @description 用于识别重复帧，重复帧仅累积延时而不重复编码，减少体积且不损失画质
 * @param currentPixels 当前帧像素
 * @param previousPixels 上一已编码帧像素
 * @returns 是否为相同帧
 */
const isSameFramePixels = (currentPixels: Uint8ClampedArray, previousPixels: Uint8ClampedArray | null) => {
  if (!previousPixels || previousPixels.length !== currentPixels.length) return false
  for (let i = 0; i < currentPixels.length; i++) {
    if (currentPixels[i] !== previousPixels[i]) return false
  }
  return true
}

/**
 * 主线程让渡
 * @description 分帧处理时主动让出控制权，减少长任务造成的页面卡顿
 */
const yieldToMainThread = async () => {
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

/**
 * 处理缩放比例变化
 * @param val 新的缩放比例 (0-1)
 */
const handleScaleChange = (val: any) => {
  updateDimensionsByScale(Number(val))
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
  if (droppedFile) {
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
  const error = getGifFileError(f)
  if (error) {
    ElMessage.warning(error)
    return
  }

  // 释放上一次处理残留的 URL，避免频繁上传造成内存占用增长
  if (compressedSrc.value && compressedSrc.value !== originalSrc.value) {
    revokeObjectUrl(compressedSrc.value)
  }
  if (originalSrc.value) {
    revokeObjectUrl(originalSrc.value)
  }

  file.value = f
  originalSize.value = f.size
  originalSrc.value = URL.createObjectURL(f)
  compressedSrc.value = ''
  compressedSize.value = 0
  processingStage.value = ''
  compressionStats.decodedFrames = 0
  compressionStats.encodedFrames = 0
  compressionStats.mergedFrames = 0
  compressionStats.modeLabel = ''

  // 获取图片尺寸
  const img = new Image()
  img.onload = () => {
    originalDimensions.width = img.width
    originalDimensions.height = img.height
    // 根据当前模式初始化参数，确保首次压缩行为可预期
    applyCompressionPreset(activePreset.value)
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
  if (compressedSrc.value && compressedSrc.value !== originalSrc.value) {
    revokeObjectUrl(compressedSrc.value)
  }
  if (originalSrc.value) {
    revokeObjectUrl(originalSrc.value)
  }

  file.value = null
  originalSrc.value = ''
  compressedSrc.value = ''
  compressedSize.value = 0
  originalSize.value = 0
  originalDimensions.width = 0
  originalDimensions.height = 0
  customDimensions.width = 0
  customDimensions.height = 0
  processingStage.value = ''
  compressionStats.decodedFrames = 0
  compressionStats.encodedFrames = 0
  compressionStats.mergedFrames = 0
  compressionStats.modeLabel = ''
  applyCompressionPreset('quality')
  options.scale = 1
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
  const sourceName = file.value?.name || 'image.gif'
  const safeName = sourceName.toLowerCase().endsWith('.gif') ? sourceName : `${sourceName}.gif`
  link.download = `uiedtool_${safeName}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

interface DecodedGifFrame {
  patch: Uint8ClampedArray
  dims: {
    width: number
    height: number
    top: number
    left: number
  }
  delay: number
  disposalType: number
}

/**
 * 开始压缩过程
 * 1. 解析 GIF 帧
 * 2. 根据参数重绘每一帧 (缩放、抽帧)
 * 3. 使用 gif.js 重新编码
 */
const startCompression = async () => {
  if (!file.value || isProcessing.value) return
  if (!customDimensions.width || !customDimensions.height) {
    ElMessage.warning('请等待 GIF 预览加载完成后再压缩')
    return
  }

  isProcessing.value = true
  progress.value = 0
  processingStage.value = '正在解析 GIF 帧...'
  compressionStats.decodedFrames = 0
  compressionStats.encodedFrames = 0
  compressionStats.mergedFrames = 0
  compressionStats.modeLabel = preserveQuality.value ? '画质优先' : '自定义压缩'

  try {
    const { GIF: GIFEncoder, parseGIF, decompressFrames } = await ensureGifRuntime()
    const arrayBuffer = await file.value.arrayBuffer()
    const gif = parseGIF(arrayBuffer)
    const frames = decompressFrames(gif, true) as DecodedGifFrame[]
    compressionStats.decodedFrames = frames.length

    if (!frames.length) {
      throw new Error('未解析到可用帧')
    }

    // 准备 GIF 编码器
    const gifEncoder = new GIFEncoder({
      workers: getGifWorkerCount(),
      quality: options.quality,
      width: customDimensions.width,
      height: customDimensions.height,
      workerScript: '/workers/gif.worker.js',
      dither: options.dither
    })

    // 主画布用于还原 GIF 每一帧，缩放画布用于输出目标尺寸
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('浏览器不支持 Canvas 上下文')

    canvas.width = originalDimensions.width
    canvas.height = originalDimensions.height
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const scaleCanvas = document.createElement('canvas')
    const scaleCtx = scaleCanvas.getContext('2d')
    if (!scaleCtx) throw new Error('浏览器不支持缩放画布上下文')
    scaleCanvas.width = customDimensions.width
    scaleCanvas.height = customDimensions.height

    // 逐帧合成时累积跳过帧的延时，保持整体动画时长不漂移
    let pendingDelay = 0
    let encodedFrameCount = 0
    let mergedFrameCount = 0
    const enableDuplicateMerge = preserveQuality.value
    let previousEncodedPixels: Uint8ClampedArray | null = null
    let hasTrailingDuplicateDelay = false
    processingStage.value = '正在逐帧合成与分析...'

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i]
      pendingDelay += normalizeFrameDelay(frame.delay)

      let restoreSnapshot: ImageData | null = null
      if (frame.disposalType === 3) {
        restoreSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height)
      }

      const frameImageData = new ImageData(
        new Uint8ClampedArray(frame.patch),
        frame.dims.width,
        frame.dims.height
      )
      ctx.putImageData(frameImageData, frame.dims.left, frame.dims.top)

      const isLastFrame = i === frames.length - 1
      const shouldEncode = i % options.fpsReduction === 0 || isLastFrame

      if (shouldEncode) {
        scaleCtx.clearRect(0, 0, scaleCanvas.width, scaleCanvas.height)
        scaleCtx.drawImage(canvas, 0, 0, scaleCanvas.width, scaleCanvas.height)
        if (!preserveQuality.value) {
          applyColorQuantization(scaleCtx, scaleCanvas.width, scaleCanvas.height, options.colors)
        }

        if (enableDuplicateMerge) {
          const scaledImageData = scaleCtx.getImageData(0, 0, scaleCanvas.width, scaleCanvas.height)
          const currentPixels = scaledImageData.data
          if (isSameFramePixels(currentPixels, previousEncodedPixels)) {
            mergedFrameCount += 1
            compressionStats.mergedFrames = mergedFrameCount
            hasTrailingDuplicateDelay = true
          } else {
            gifEncoder.addFrame(scaleCtx, {
              delay: pendingDelay,
              copy: true
            })
            pendingDelay = 0
            encodedFrameCount += 1
            compressionStats.encodedFrames = encodedFrameCount
            previousEncodedPixels = new Uint8ClampedArray(currentPixels)
            hasTrailingDuplicateDelay = false
          }
        } else {
          gifEncoder.addFrame(scaleCtx, {
            delay: pendingDelay,
            copy: true
          })
          pendingDelay = 0
          encodedFrameCount += 1
          compressionStats.encodedFrames = encodedFrameCount
          hasTrailingDuplicateDelay = false
        }
      }

      // 处理 disposal 逻辑，确保下一帧合成基底正确
      if (frame.disposalType === 2) {
        ctx.clearRect(frame.dims.left, frame.dims.top, frame.dims.width, frame.dims.height)
      } else if (frame.disposalType === 3 && restoreSnapshot) {
        ctx.putImageData(restoreSnapshot, 0, 0)
      }

      progress.value = Math.round(((i + 1) / frames.length) * 45)
      if (i % 6 === 0) {
        await yieldToMainThread()
      }
    }

    if (pendingDelay > 0 && encodedFrameCount > 0) {
      gifEncoder.addFrame(scaleCtx, {
        delay: pendingDelay,
        copy: true
      })
      pendingDelay = 0
      encodedFrameCount += 1
      compressionStats.encodedFrames = encodedFrameCount
      if (hasTrailingDuplicateDelay && mergedFrameCount > 0) {
        mergedFrameCount -= 1
        compressionStats.mergedFrames = mergedFrameCount
      }
    }

    if (encodedFrameCount === 0) {
      throw new Error('没有可编码的 GIF 帧')
    }

    // 渲染阶段进度
    processingStage.value = '正在编码输出 GIF...'
    gifEncoder.on('progress', (p: number) => {
      progress.value = 45 + Math.round(p * 55)
    })

    const resultBlob = await new Promise<Blob>((resolve, reject) => {
      gifEncoder.on('finished', (blob: Blob) => resolve(blob))
      gifEncoder.on('abort', () => reject(new Error('GIF 编码已中断')))
      gifEncoder.render()
    })

    if (compressedSrc.value && compressedSrc.value !== originalSrc.value) {
      revokeObjectUrl(compressedSrc.value)
    }

    // 如果体积未减小，保留原图，避免“压缩后更大”的反效果
    if (resultBlob.size >= originalSize.value) {
      compressedSrc.value = originalSrc.value
      compressedSize.value = originalSize.value
      progress.value = 100
      processingStage.value = '已保留原图'
      ElMessage.warning('当前参数未减小体积，已保留原图。可尝试提高抽帧或降低色彩数量。')
      return
    }

    compressedSrc.value = URL.createObjectURL(resultBlob)
    compressedSize.value = resultBlob.size
    progress.value = 100
    compressionStats.encodedFrames = encodedFrameCount
    compressionStats.mergedFrames = mergedFrameCount
    processingStage.value = '压缩完成'
    ElMessage.success('压缩完成！')

  } catch (error) {
    console.error(error)
    processingStage.value = ''
    ElMessage.error('压缩失败，请尝试降低尺寸、降低色彩数量或减少文件大小')
  } finally {
    isProcessing.value = false
  }
}

onUnmounted(() => {
  if (compressedSrc.value && compressedSrc.value !== originalSrc.value) {
    revokeObjectUrl(compressedSrc.value)
  }
  if (originalSrc.value) {
    revokeObjectUrl(originalSrc.value)
  }
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
