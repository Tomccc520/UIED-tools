<!--
 * @file VideoToGif.vue
 * @description 视频转GIF工具，支持截取片段、调整尺寸和帧率
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.27
 */
import { ref, reactive, onUnmounted, computed } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import FollowWechatVerifyDialog from '@/components/Common/FollowWechatVerifyDialog.vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import VideoToolNotice from '@/components/Tools/Video/Shared/VideoToolNotice.vue'
import VideoProcessStatus from '@/components/Tools/Video/Shared/VideoProcessStatus.vue'
import VideoResultComparison from '@/components/Tools/Video/Shared/VideoResultComparison.vue'
import { ensureGifRuntime } from '@/utils/toolRuntimeLoaders'
import { wechatVerifyConfig } from '@/utils/verify'
import { estimateRemainingSeconds, formatEtaText, getFriendlyVideoError } from '@/utils/videoToolFeedback'

const route = useRoute()

const fileInput = ref<HTMLInputElement | null>(null)
const videoFile = ref<File | null>(null)
const videoUrl = ref<string>('')
const videoRef = ref<HTMLVideoElement | null>(null)
const gifUrl = ref<string>('')
const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')
const etaText = ref('')
const errorText = ref('')
const processStartedAt = ref(0)
const resultGifSizeMB = ref(0)
const isCancelRequested = ref(false)
const usageCount = ref(Number(localStorage.getItem('video_to_gif_usage_count')) || 0)
const isVerified = ref(Boolean(localStorage.getItem('video_to_gif_verified')))
const showVerifyDialog = ref(false)
const maxFreeUsage = ref(wechatVerifyConfig.maxFreeUsage)
const expectedPassword = wechatVerifyConfig.password
let activeGifEncoder: any = null

// Settings
const settings = reactive({
  startTime: 0,
  endTime: 0,
  width: 320,
  height: 0, // auto calculated
  fps: 10,
  quality: 10, // 1-30, lower is better
  speed: 1
})

const videoMeta = reactive({
  duration: 0,
  width: 0,
  height: 0
})

const clipDuration = computed(() => {
  return Math.max(0, settings.endTime - settings.startTime)
})

const outputDuration = computed(() => {
  if (!settings.speed) return 0
  return clipDuration.value / settings.speed
})

const resultComparisonMetrics = computed(() => {
  const sourceSizeText = `${((videoFile.value?.size || 0) / 1024 / 1024).toFixed(2)} MB`
  const resultSizeText = gifUrl.value ? `${resultGifSizeMB.value.toFixed(2)} MB` : '-'

  return [
    {
      label: '文件体积',
      before: sourceSizeText,
      after: resultSizeText
    },
    {
      label: '分辨率',
      before: videoMeta.width && videoMeta.height ? `${videoMeta.width} × ${videoMeta.height}` : '-',
      after: settings.width && settings.height ? `${settings.width} × ${settings.height}` : '-'
    },
    {
      label: '时长',
      before: `${clipDuration.value.toFixed(1)}s`,
      after: `${outputDuration.value.toFixed(1)}s`
    }
  ]
})

/**
 * 处理文件选择
 * @param event - 事件对象
 */
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.type.startsWith('video/')) {
      loadVideo(file)
    } else {
      ElMessage.warning('请选择有效的视频文件')
    }
  }
}

/**
 * 加载视频文件
 * @param file - 视频文件对象
 */
const loadVideo = (file: File) => {
  videoFile.value = file
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (gifUrl.value) URL.revokeObjectURL(gifUrl.value)

  videoUrl.value = URL.createObjectURL(file)
  gifUrl.value = ''
  progress.value = 0
  statusText.value = ''
  etaText.value = ''
  errorText.value = ''
  resultGifSizeMB.value = 0
  isCancelRequested.value = false
  processStartedAt.value = 0
}

/**
 * 视频加载完成回调
 * 初始化视频元数据和默认设置
 */
const onVideoLoaded = () => {
  if (videoRef.value) {
    videoMeta.duration = videoRef.value.duration
    videoMeta.width = videoRef.value.videoWidth
    videoMeta.height = videoRef.value.videoHeight

    // Init settings
    settings.startTime = 0
    settings.endTime = Math.min(videoRef.value.duration, 5) // Default 5s

    // Scale width to max 480 for performance default
    const ratio = videoMeta.width / videoMeta.height
    settings.width = Math.min(videoMeta.width, 480)
    settings.height = Math.round(settings.width / ratio)
  }
}

/**
 * 处理宽度变更，自动计算高度
 */
const handleWidthChange = () => {
  if (videoMeta.width && videoMeta.height) {
    const ratio = videoMeta.width / videoMeta.height
    settings.height = Math.round(settings.width / ratio)
  }
}

/**
 * 格式化时间
 * @param seconds - 秒数
 */
const formatTime = (seconds: number) => {
  return seconds.toFixed(1) + 's'
}

/**
 * 更新 ETA 文本
 * @param currentProgress 当前进度（0-100）
 */
const updateEtaText = (currentProgress: number) => {
  const remainSeconds = estimateRemainingSeconds(currentProgress, processStartedAt.value)
  etaText.value = formatEtaText(remainSeconds)
}

/**
 * 生成 GIF
 */
/**
 * 校验并修正转换参数
 */
const normalizeSettings = () => {
  if (!videoRef.value) return false
  if (!videoMeta.duration) return false

  if (settings.endTime <= 0 || settings.endTime > videoMeta.duration) {
    settings.endTime = Math.min(videoMeta.duration, settings.startTime + 5)
  }
  if (settings.endTime <= settings.startTime) {
    settings.endTime = Math.min(videoMeta.duration, settings.startTime + 0.5)
  }
  if (!settings.height) {
    handleWidthChange()
  }
  return settings.endTime > settings.startTime && settings.width > 0 && settings.height > 0
}

/**
 * 等待视频跳转完成
 * @param video - 视频元素
 * @param targetTime - 目标时间
 */
const waitForSeeked = (video: HTMLVideoElement, targetTime: number) => {
  return new Promise<void>((resolve) => {
    const handleSeeked = () => {
      video.removeEventListener('seeked', handleSeeked)
      resolve()
    }
    video.addEventListener('seeked', handleSeeked)
    video.currentTime = targetTime
  })
}

/**
 * 生成 GIF
 */
const generateGif = async () => {
  if (!videoRef.value) return
  if (!isVerified.value && usageCount.value >= maxFreeUsage.value) {
    showVerifyDialog.value = true
    return
  }
  if (!normalizeSettings()) {
    ElMessage.warning('请先加载视频并设置有效的截取片段')
    return
  }

  try {
    isCancelRequested.value = false
    isProcessing.value = true
    statusText.value = '准备处理...'
    progress.value = 0
    etaText.value = formatEtaText(null)
    errorText.value = ''
    gifUrl.value = ''
    resultGifSizeMB.value = 0
    processStartedAt.value = Date.now()

    if (!isVerified.value) {
      usageCount.value++
      localStorage.setItem('video_to_gif_usage_count', usageCount.value.toString())
    }

    const video = videoRef.value
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx) {
      throw new Error('无法创建 Canvas 上下文')
    }

    canvas.width = settings.width
    canvas.height = settings.height

    const { GIF } = await ensureGifRuntime()
    const GifConstructor = GIF as any
    const gif = new GifConstructor({
      workers: 2,
      quality: settings.quality,
      width: settings.width,
      height: settings.height,
      workerScript: '/workers/gif.worker.js'
    })
    activeGifEncoder = gif

    gif.on('finished', (blob: Blob) => {
      if (isCancelRequested.value) {
        isCancelRequested.value = false
        return
      }

      gifUrl.value = URL.createObjectURL(blob)
      resultGifSizeMB.value = blob.size / 1024 / 1024
      isProcessing.value = false
      progress.value = 100
      etaText.value = '预计剩余时间：约 0 秒'
      statusText.value = '生成完成'
      activeGifEncoder = null
      ElMessage.success('GIF 生成成功')
    })

    gif.on('progress', (p: number) => {
      if (!isProcessing.value || isCancelRequested.value) return

      const currentProgress = Math.max(progress.value, Math.round(p * 100))
      progress.value = currentProgress
      statusText.value = `正在编码 GIF... ${Math.round(p * 100)}%`
      updateEtaText(currentProgress)
    })

    const captureInterval = 1 / settings.fps
    const duration = settings.endTime - settings.startTime
    const totalFrames = Math.max(1, Math.floor(duration * settings.fps))

    let currentFrame = 0
    let currentTime = settings.startTime

    statusText.value = '正在捕获帧...'

    const captureFrame = async () => {
      if (!isProcessing.value || isCancelRequested.value) return

      if (currentFrame >= totalFrames) {
        statusText.value = '开始渲染 GIF...'
        gif.render()
        return
      }

      await waitForSeeked(video, currentTime)

      if (!isProcessing.value || isCancelRequested.value) return

      ctx.drawImage(video, 0, 0, settings.width, settings.height)
      gif.addFrame(ctx, {
        copy: true,
        delay: (1000 / settings.fps) / settings.speed
      })

      currentFrame++
      currentTime += captureInterval

      const captureProgress = Math.min(55, Math.round((currentFrame / totalFrames) * 55))
      progress.value = captureProgress
      updateEtaText(captureProgress)
      requestAnimationFrame(() => captureFrame())
    }

    captureFrame()
  } catch (error) {
    console.error(error)
    isProcessing.value = false
    activeGifEncoder = null
    etaText.value = ''
    const message = getFriendlyVideoError(error, 'GIF 生成失败，请调整参数后重试')
    errorText.value = message
    ElMessage.error(message)
  }
}

/**
 * 取消当前 GIF 生成任务
 */
const cancelProcessing = () => {
  if (!isProcessing.value) return

  isCancelRequested.value = true
  isProcessing.value = false
  statusText.value = '已取消处理'
  progress.value = 0
  etaText.value = ''

  if (activeGifEncoder && typeof activeGifEncoder.abort === 'function') {
    activeGifEncoder.abort()
  }
  activeGifEncoder = null
  ElMessage.info('已取消当前 GIF 生成任务')
}

/**
 * 下载 GIF
 */
const downloadGif = () => {
  if (!gifUrl.value) return
  const a = document.createElement('a')
  a.href = gifUrl.value
  const originalName = videoFile.value?.name.replace(/\.[^/.]+$/, "") || "video"
  a.download = `${originalName}.gif`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * 拖拽处理
 */
const dropHandler = (ev: DragEvent) => {
  ev.preventDefault()
  if (ev.dataTransfer?.items) {
    [...ev.dataTransfer.items].forEach((item, i) => {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file && file.type.startsWith('video/')) {
          loadVideo(file)
        }
      }
    })
  }
}

const dragOverHandler = (ev: DragEvent) => {
  ev.preventDefault()
}

const handleVerify = (password: string) => {
  if (password.trim().toLowerCase() === expectedPassword) {
    isVerified.value = true
    localStorage.setItem('video_to_gif_verified', 'true')
    showVerifyDialog.value = false
    ElMessage.success('验证成功，您可以继续使用了')
  } else {
    ElMessage.error('密码错误，请关注公众号获取正确的密码')
  }
}

onUnmounted(() => {
  if (activeGifEncoder && typeof activeGifEncoder.abort === 'function') {
    activeGifEncoder.abort()
  }
  activeGifEncoder = null

  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (gifUrl.value) URL.revokeObjectURL(gifUrl.value)
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4">
        <div class="text-center mb-6">
          <h2
            class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
            免费视频转 GIF
          </h2>
          <p class="text-gray-500 text-sm">
            在线将视频转换为 GIF 动图，支持截取片段、调整尺寸和帧率，本地处理保护隐私
          </p>
        </div>
        <VideoToolNotice class="mb-8" />

        <!-- Initial Upload Area -->
        <div v-if="!videoUrl" @drop="dropHandler" @dragover="dragOverHandler"
          class="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer mb-8 group"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div
            class="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
            点击或拖拽视频文件到此处
          </h3>
          <p class="text-gray-500">支持 MP4, WebM, MOV 等常见视频格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left: Configuration Panel -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </span>
                操作面板
              </h3>

              <!-- File Info -->
              <div class="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="overflow-hidden flex-1">
                    <div class="text-sm font-medium text-gray-800 truncate">{{ videoFile?.name }}</div>
                    <div class="text-xs text-gray-500">{{ (videoFile?.size ? videoFile.size / 1024 / 1024 :
                      0).toFixed(2) }}
                      MB</div>
                  </div>
                  <button @click="fileInput?.click()" class="text-xs text-indigo-600 hover:text-indigo-800">
                    更换
                  </button>
                  <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
                </div>
              </div>

              <!-- Controls -->
              <div class="space-y-4">
                <!-- Time Range -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    截取片段 ({{ formatTime(settings.startTime) }} - {{ formatTime(settings.endTime) }})
                    <span class="text-xs text-gray-500 ml-2">时长: {{ (settings.endTime - settings.startTime).toFixed(1)
                      }}s</span>
                  </label>
                  <div class="flex items-center gap-2 mb-2">
                    <el-input-number v-model="settings.startTime" :min="0" :max="settings.endTime" :step="0.1"
                      size="small" class="w-full" />
                    <span class="text-gray-400">-</span>
                    <el-input-number v-model="settings.endTime" :min="settings.startTime" :max="videoMeta.duration"
                      :step="0.1" size="small" class="w-full" />
                  </div>
                  <el-slider v-model="settings.startTime" :max="videoMeta.duration" :step="0.1" size="small" />
                  <el-slider v-model="settings.endTime" :max="videoMeta.duration" :step="0.1" size="small" />
                </div>

                <!-- Size -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">宽度 (px)</label>
                  <el-input-number v-model="settings.width" :min="50" :max="1920" @change="handleWidthChange"
                    class="w-full" />
                  <p class="text-xs text-gray-500 mt-1">高度将自动按比例调整: {{ settings.height }}px</p>
                </div>

                <!-- FPS -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">帧率 (FPS): {{ settings.fps }}</label>
                  <el-slider v-model="settings.fps" :min="1" :max="30" :step="1" />
                </div>

                <!-- Speed -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">播放速度</label>
                  <div class="grid grid-cols-4 gap-2">
                    <button v-for="speed in [0.5, 1, 1.5, 2]" :key="speed" @click="settings.speed = speed"
                      :class="[settings.speed === speed ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
                      class="py-1.5 rounded-lg text-xs font-medium transition-colors">
                      {{ speed }}x
                    </button>
                  </div>
                </div>

                <!-- Quality -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">画质 ({{ settings.quality }})</label>
                  <el-slider v-model="settings.quality" :min="1" :max="30" :step="1" />
                  <p class="text-xs text-gray-500 mt-1">数值越小画质越好，但处理越慢</p>
                </div>

                <VideoProcessStatus
                  v-if="isProcessing"
                  :progress="progress"
                  :status-text="statusText"
                  :eta-text="etaText"
                  @cancel="cancelProcessing"
                />

                <div v-if="errorText" class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {{ errorText }}
                </div>

                <button @click="generateGif" :disabled="isProcessing"
                  class="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]">
                  <span v-if="!isProcessing" class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    生成 GIF
                  </span>
                  <span v-else class="flex items-center">
                    <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                      viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    处理中...
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Preview & Result -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Video Player -->
            <div
              class="border border-gray-200 rounded-xl overflow-hidden bg-black flex items-center justify-center relative group">
              <video ref="videoRef" :src="videoUrl" controls class="w-full max-h-[500px]"
                @loadedmetadata="onVideoLoaded"></video>
            </div>

            <!-- Result -->
            <div v-if="gifUrl" class="bg-white rounded-xl border border-gray-200 p-6 animate-fade-in">
              <div class="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                    ✓
                  </div>
                  <h3 class="font-bold text-gray-800">生成成功</h3>
                </div>
                <button @click="downloadGif"
                  class="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  下载 GIF
                </button>
              </div>

              <VideoResultComparison :metrics="resultComparisonMetrics" class="mb-4" />

              <div
                class="flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 p-4">
                <img :src="gifUrl" class="max-w-full max-h-[400px] object-contain rounded" />
                <p class="text-xs text-gray-500 mt-2">长按图片可保存或拖拽到桌面</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="bg-white rounded-xl p-6 border border-gray-100 mt-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            使用说明
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">1. 调整片段</h4>
              <p>使用滑块选择要转换的视频起止时间。建议片段不要过长，以免生成时间过久。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">2. 设置参数</h4>
              <p>调整宽度会自动按比例计算高度。帧率越高画面越流畅但文件越大。画质数值越小越清晰。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">3. 生成下载</h4>
              <p>点击生成按钮，等待处理完成后即可预览和下载。GIF 生成完全在本地进行，不消耗流量。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
    <FollowWechatVerifyDialog v-model="showVerifyDialog" @confirm="handleVerify" />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

:deep(.el-slider__runway) {
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>
