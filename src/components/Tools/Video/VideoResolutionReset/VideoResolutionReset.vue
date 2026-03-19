<!--
 * @file VideoResolutionReset.vue
 * @description 视频分辨率重设工具，支持 1080p/720p/480p 与自定义尺寸导出
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-19
 * @license MIT
-->

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-19
 */
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import VideoToolNotice from '@/components/Tools/Video/Shared/VideoToolNotice.vue'
import VideoProcessStatus from '@/components/Tools/Video/Shared/VideoProcessStatus.vue'
import VideoResultComparison from '@/components/Tools/Video/Shared/VideoResultComparison.vue'
import { estimateRemainingSeconds, formatEtaText, getFriendlyVideoError } from '@/utils/videoToolFeedback'

/**
 * 分辨率预设类型
 */
type ResolutionPreset = '1080p' | '720p' | '480p' | 'custom'

/**
 * 输出格式类型
 */
type OutputFormat = 'auto' | 'webm' | 'mp4'

/**
 * 视频元数据类型
 */
interface VideoMeta {
  duration: number
  width: number
  height: number
}

const route = useRoute()

const fileInput = ref<HTMLInputElement | null>(null)
const previewVideoRef = ref<HTMLVideoElement | null>(null)
const resultVideoRef = ref<HTMLVideoElement | null>(null)

const videoFile = ref<File | null>(null)
const videoUrl = ref('')
const resultVideoUrl = ref('')
const resultFileExt = ref<'webm' | 'mp4'>('webm')
const resultFileSizeMB = ref(0)

const isProcessing = ref(false)
const isDragOver = ref(false)
const progress = ref(0)
const statusText = ref('')
const etaText = ref('')
const errorText = ref('')
const processStartedAt = ref(0)
const isCancelRequested = ref(false)

const sourceMeta = reactive<VideoMeta>({
  duration: 0,
  width: 0,
  height: 0
})

const resultMeta = reactive<VideoMeta>({
  duration: 0,
  width: 0,
  height: 0
})

const settings = reactive({
  preset: '1080p' as ResolutionPreset,
  customWidth: 1280,
  customHeight: 720,
  outputFormat: 'auto' as OutputFormat,
  keepAudio: true,
  frameRate: 24
})

let mediaRecorder: MediaRecorder | null = null
let drawRafId: number | null = null
let activeOutputStream: MediaStream | null = null
let activeSourceCaptureStream: MediaStream | null = null
let isFinalizingOutput = false

const sourceSizeMB = computed(() => {
  if (!videoFile.value) return 0
  return videoFile.value.size / 1024 / 1024
})

const sourceBitrateKbps = computed(() => {
  if (!videoFile.value || !sourceMeta.duration) return 0
  return (videoFile.value.size * 8) / sourceMeta.duration / 1000
})

const presetLabel = computed(() => {
  const map: Record<ResolutionPreset, string> = {
    '1080p': '1080p（1920 × 1080）',
    '720p': '720p（1280 × 720）',
    '480p': '480p（854 × 480）',
    custom: '自定义尺寸'
  }
  return map[settings.preset]
})

/**
 * 格式化时长文本
 * @param seconds 秒数
 * @returns mm:ss 文本
 */
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 小写扩展名
 */
const getFileExtension = (filename: string) => {
  const parts = filename.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

/**
 * 更新 ETA 文案
 * @param currentProgress 当前进度
 */
const updateEtaText = (currentProgress: number) => {
  const remainSeconds = estimateRemainingSeconds(currentProgress, processStartedAt.value)
  etaText.value = formatEtaText(remainSeconds)
}

/**
 * 打开文件选择器
 */
const triggerSelectVideo = () => {
  fileInput.value?.click()
}

/**
 * 释放结果 URL
 */
const clearResult = () => {
  if (resultVideoUrl.value) {
    URL.revokeObjectURL(resultVideoUrl.value)
    resultVideoUrl.value = ''
  }

  resultFileSizeMB.value = 0
  resultMeta.duration = 0
  resultMeta.width = 0
  resultMeta.height = 0
}

/**
 * 清理媒体流资源
 */
const clearMediaResources = () => {
  activeOutputStream?.getTracks().forEach(track => track.stop())
  activeSourceCaptureStream?.getTracks().forEach(track => track.stop())
  activeOutputStream = null
  activeSourceCaptureStream = null
}

/**
 * 停止当前处理任务
 */
const stopCurrentProcessing = () => {
  if (drawRafId !== null) {
    cancelAnimationFrame(drawRafId)
    drawRafId = null
  }

  if (previewVideoRef.value) {
    previewVideoRef.value.pause()
    previewVideoRef.value.onended = null
  }

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  } else {
    clearMediaResources()
  }

  mediaRecorder = null
  isFinalizingOutput = false
  isProcessing.value = false
}

/**
 * 校验上传文件
 * @param file 文件对象
 * @returns 是否通过
 */
const validateVideoFile = (file: File) => {
  const allowExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'webm', 'm4v']
  const ext = getFileExtension(file.name)
  const byMime = file.type.startsWith('video/')
  const byExt = allowExtensions.includes(ext)

  if (!byMime && !byExt) {
    ElMessage.warning('请选择有效的视频文件（MP4/AVI/MOV/MKV/WMV/WebM）')
    return false
  }

  return true
}

/**
 * 检查自定义尺寸是否合法
 * @returns 是否合法
 */
const validateCustomResolution = () => {
  if (settings.preset !== 'custom') return true

  const width = Math.round(Number(settings.customWidth))
  const height = Math.round(Number(settings.customHeight))

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    ElMessage.warning('请输入有效的自定义分辨率')
    return false
  }

  if (width > 4096 || height > 4096) {
    ElMessage.warning('当前版本建议自定义分辨率不超过 4096 × 4096')
    return false
  }

  settings.customWidth = width
  settings.customHeight = height
  return true
}

/**
 * 根据预设解析目标分辨率
 * @returns 目标宽高
 */
const resolveTargetResolution = () => {
  const map: Record<Exclude<ResolutionPreset, 'custom'>, { width: number; height: number }> = {
    '1080p': { width: 1920, height: 1080 },
    '720p': { width: 1280, height: 720 },
    '480p': { width: 854, height: 480 }
  }

  if (settings.preset === 'custom') {
    return {
      width: Math.max(2, Math.round(settings.customWidth)),
      height: Math.max(2, Math.round(settings.customHeight))
    }
  }

  return map[settings.preset]
}

/**
 * 加载并初始化视频
 * @param file 视频文件
 */
const loadVideo = (file: File) => {
  if (!validateVideoFile(file)) return

  isCancelRequested.value = true
  stopCurrentProcessing()

  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }

  videoFile.value = file
  videoUrl.value = URL.createObjectURL(file)
  clearResult()

  sourceMeta.duration = 0
  sourceMeta.width = 0
  sourceMeta.height = 0
  progress.value = 0
  statusText.value = ''
  etaText.value = ''
  errorText.value = ''
  processStartedAt.value = 0
}

/**
 * 文件选择事件
 * @param event 输入事件
 */
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  loadVideo(file)
  if (input.value) input.value = ''
}

/**
 * 拖拽上传事件
 * @param event 拖拽事件
 */
const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  loadVideo(file)
}

/**
 * 源视频元信息加载完成
 */
const onSourceVideoLoaded = () => {
  const video = previewVideoRef.value
  if (!video) return

  sourceMeta.duration = video.duration || 0
  sourceMeta.width = video.videoWidth || 0
  sourceMeta.height = video.videoHeight || 0
}

/**
 * 结果视频元信息加载完成
 */
const onResultVideoLoaded = () => {
  const video = resultVideoRef.value
  if (!video) return

  resultMeta.duration = video.duration || 0
  resultMeta.width = video.videoWidth || 0
  resultMeta.height = video.videoHeight || 0
}

/**
 * 等待视频跳转完成
 * @param video 视频元素
 * @param time 目标时间
 */
const seekVideo = (video: HTMLVideoElement, time: number) => {
  return new Promise<void>((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked)
      resolve()
    }
    video.addEventListener('seeked', onSeeked)
    video.currentTime = time
  })
}

/**
 * 根据设置选择输出编码
 * @returns 编码配置
 */
const resolveRecorderPreset = () => {
  const mp4Candidates = ['video/mp4;codecs=h264,aac', 'video/mp4']
  const webmCandidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm'
  ]

  const pick = (list: string[]) => list.find(item => MediaRecorder.isTypeSupported(item))

  if (settings.outputFormat === 'mp4') {
    const mp4MimeType = pick(mp4Candidates)
    if (mp4MimeType) return { mimeType: mp4MimeType, ext: 'mp4' as const }

    const webmMimeType = pick(webmCandidates)
    if (webmMimeType) {
      ElMessage.warning('当前浏览器不支持 MP4 编码，已自动回退为 WebM 输出')
      return { mimeType: webmMimeType, ext: 'webm' as const }
    }
  }

  if (settings.outputFormat === 'webm') {
    const webmMimeType = pick(webmCandidates)
    if (webmMimeType) return { mimeType: webmMimeType, ext: 'webm' as const }

    const mp4MimeType = pick(mp4Candidates)
    if (mp4MimeType) {
      ElMessage.warning('当前浏览器不支持 WebM 编码，已自动回退为 MP4 输出')
      return { mimeType: mp4MimeType, ext: 'mp4' as const }
    }
  }

  const webmMimeType = pick(webmCandidates)
  if (webmMimeType) return { mimeType: webmMimeType, ext: 'webm' as const }

  const mp4MimeType = pick(mp4Candidates)
  if (mp4MimeType) return { mimeType: mp4MimeType, ext: 'mp4' as const }

  throw new Error('当前浏览器不支持视频编码，请更换 Chrome / Edge / Safari 最新版再试')
}

/**
 * 取消当前任务
 */
const cancelProcessing = () => {
  if (!isProcessing.value) return

  isCancelRequested.value = true
  statusText.value = '已取消处理'
  etaText.value = ''
  stopCurrentProcessing()
  ElMessage.info('已取消当前任务')
}

/**
 * 以等比方式将源画面绘制到目标画布
 * @param ctx 画布上下文
 * @param video 视频元素
 * @param width 目标宽度
 * @param height 目标高度
 */
const drawContainFrame = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, width: number, height: number) => {
  const sourceWidth = video.videoWidth || width
  const sourceHeight = video.videoHeight || height

  const scale = Math.min(width / sourceWidth, height / sourceHeight)
  const drawWidth = Math.max(1, Math.round(sourceWidth * scale))
  const drawHeight = Math.max(1, Math.round(sourceHeight * scale))
  const offsetX = Math.floor((width - drawWidth) / 2)
  const offsetY = Math.floor((height - drawHeight) / 2)

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(video, 0, 0, sourceWidth, sourceHeight, offsetX, offsetY, drawWidth, drawHeight)
}

/**
 * 开始重设分辨率
 */
const processVideo = async () => {
  const sourceVideo = previewVideoRef.value
  if (!sourceVideo || !videoFile.value) {
    ElMessage.warning('请先上传视频文件')
    return
  }

  if (!sourceMeta.duration || !sourceMeta.width || !sourceMeta.height) {
    ElMessage.warning('视频还在加载中，请稍后再试')
    return
  }

  if (!validateCustomResolution()) {
    return
  }

  try {
    isCancelRequested.value = false
    isFinalizingOutput = false
    isProcessing.value = true
    progress.value = 0
    statusText.value = '正在准备重设任务...'
    etaText.value = formatEtaText(null)
    errorText.value = ''
    processStartedAt.value = Date.now()

    clearResult()

    sourceVideo.pause()
    await seekVideo(sourceVideo, 0)

    const { width: targetWidth, height: targetHeight } = resolveTargetResolution()
    const { mimeType, ext } = resolveRecorderPreset()
    resultFileExt.value = ext

    const targetVideoBitrate = Math.max(220, Math.round((sourceBitrateKbps.value || 1800) * 0.92))
    const recorderOptions: MediaRecorderOptions = {
      mimeType,
      videoBitsPerSecond: targetVideoBitrate * 1000
    }

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) {
      throw new Error('无法初始化 Canvas 上下文')
    }

    const outputStream = canvas.captureStream(settings.frameRate)

    const sourceCapture = (sourceVideo as any).captureStream?.() || (sourceVideo as any).mozCaptureStream?.()
    activeSourceCaptureStream = sourceCapture || null

    if (settings.keepAudio && sourceCapture?.getAudioTracks?.()?.length) {
      sourceCapture.getAudioTracks().forEach((track: MediaStreamTrack) => outputStream.addTrack(track))
    }

    activeOutputStream = outputStream
    mediaRecorder = new MediaRecorder(outputStream, recorderOptions)

    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      if (drawRafId !== null) {
        cancelAnimationFrame(drawRafId)
        drawRafId = null
      }

      if (isCancelRequested.value) {
        isCancelRequested.value = false
        isProcessing.value = false
        progress.value = 0
        statusText.value = '已取消处理'
        etaText.value = ''
        clearMediaResources()
        mediaRecorder = null
        isFinalizingOutput = false
        return
      }

      const blob = new Blob(chunks, { type: mimeType })
      if (!blob.size) {
        isProcessing.value = false
        statusText.value = '处理失败'
        etaText.value = ''
        errorText.value = '输出文件为空，请尝试更换参数后重试'
        clearMediaResources()
        mediaRecorder = null
        isFinalizingOutput = false
        ElMessage.error(errorText.value)
        return
      }

      resultVideoUrl.value = URL.createObjectURL(blob)
      resultFileSizeMB.value = blob.size / 1024 / 1024
      isProcessing.value = false
      progress.value = 100
      statusText.value = '重设完成'
      etaText.value = '预计剩余时间：约 0 秒'
      clearMediaResources()
      mediaRecorder = null
      isFinalizingOutput = false
      ElMessage.success('分辨率重设完成')
    }

    mediaRecorder.onerror = (event) => {
      if (drawRafId !== null) {
        cancelAnimationFrame(drawRafId)
        drawRafId = null
      }

      sourceVideo.pause()
      sourceVideo.onended = null
      clearMediaResources()

      isProcessing.value = false
      statusText.value = '处理失败'
      etaText.value = ''
      const message = getFriendlyVideoError((event as any)?.error, '分辨率重设失败，请尝试调整参数后重试')
      errorText.value = message
      ElMessage.error(message)
      mediaRecorder = null
      isFinalizingOutput = false
    }

    statusText.value = '正在重设分辨率...'
    mediaRecorder.start(500)

    await sourceVideo.play()

    const syncProgress = () => {
      if (!isProcessing.value || !previewVideoRef.value) return

      drawContainFrame(ctx, previewVideoRef.value, targetWidth, targetHeight)

      const current = previewVideoRef.value.currentTime
      const currentProgress = Math.min(99, Math.round((current / sourceMeta.duration) * 99))
      progress.value = currentProgress
      updateEtaText(currentProgress)

      if (currentProgress >= 99 || previewVideoRef.value.ended || current >= sourceMeta.duration - 0.08) {
        if (mediaRecorder && mediaRecorder.state !== 'inactive' && !isFinalizingOutput) {
          isFinalizingOutput = true
          statusText.value = '正在封装输出文件...'
          etaText.value = '预计剩余时间：正在封装...'
          mediaRecorder.stop()
        }
        return
      }

      drawRafId = requestAnimationFrame(syncProgress)
    }

    drawRafId = requestAnimationFrame(syncProgress)

    sourceVideo.onended = () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive' && !isFinalizingOutput) {
        isFinalizingOutput = true
        statusText.value = '正在封装输出文件...'
        etaText.value = '预计剩余时间：正在封装...'
        mediaRecorder.stop()
      }
    }
  } catch (error) {
    if (drawRafId !== null) {
      cancelAnimationFrame(drawRafId)
      drawRafId = null
    }

    clearMediaResources()
    isProcessing.value = false
    statusText.value = '处理失败'
    etaText.value = ''
    const message = getFriendlyVideoError(error, '分辨率重设失败，请更换浏览器后重试')
    errorText.value = message
    ElMessage.error(message)
    mediaRecorder = null
    isFinalizingOutput = false
  }
}

/**
 * 下载结果文件
 */
const downloadResult = () => {
  if (!resultVideoUrl.value || !videoFile.value) return

  const originalName = videoFile.value.name.replace(/\.[^/.]+$/, '')
  const link = document.createElement('a')
  link.href = resultVideoUrl.value
  link.download = `${originalName}_resolution.${resultFileExt.value}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 获取结果摘要
 * @returns 摘要文本
 */
const getResultSummary = () => {
  if (!videoFile.value || !resultVideoUrl.value || resultFileSizeMB.value <= 0) return '-'

  const target = resolveTargetResolution()
  const sizeDiff = sourceSizeMB.value - resultFileSizeMB.value
  const sizeRate = sourceSizeMB.value > 0 ? (sizeDiff / sourceSizeMB.value) * 100 : 0
  return `目标分辨率 ${target.width} × ${target.height}，体积变化 ${sizeDiff.toFixed(2)}MB（${sizeRate.toFixed(1)}%）`
}

/**
 * 结果对比数据
 */
const resultComparisonMetrics = computed(() => {
  return [
    {
      label: '文件体积',
      before: `${sourceSizeMB.value.toFixed(2)} MB`,
      after: resultVideoUrl.value ? `${resultFileSizeMB.value.toFixed(2)} MB` : '-'
    },
    {
      label: '分辨率',
      before: sourceMeta.width && sourceMeta.height ? `${sourceMeta.width} × ${sourceMeta.height}` : '-',
      after: resultMeta.width && resultMeta.height ? `${resultMeta.width} × ${resultMeta.height}` : '-'
    },
    {
      label: '时长',
      before: formatTime(sourceMeta.duration),
      after: resultMeta.duration ? formatTime(resultMeta.duration) : '-'
    },
    {
      label: '输出格式',
      before: getFileExtension(videoFile.value?.name || '').toUpperCase() || '-',
      after: resultFileExt.value.toUpperCase()
    }
  ]
})

/**
 * 页面离开前提醒
 * @param event 浏览器事件
 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!isProcessing.value) return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  isCancelRequested.value = true
  stopCurrentProcessing()
  clearMediaResources()
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  clearResult()
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave((to, from, next) => {
  if (!isProcessing.value) {
    next()
    return
  }

  const shouldLeave = window.confirm('视频仍在处理中，离开页面会中断任务。确定要离开吗？')
  if (!shouldLeave) {
    next(false)
    return
  }

  cancelProcessing()
  next()
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="rounded-xl bg-white p-8 mb-4">
        <div class="mb-6 text-center">
          <h2 class="mb-3 bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            免费视频分辨率重设
          </h2>
          <p class="mx-auto max-w-3xl text-sm text-gray-500 sm:text-base">
            一键将视频重设为 1080p / 720p / 480p 或自定义尺寸，默认等比缩放并本地处理。
          </p>
        </div>

        <VideoToolNotice
          class="mb-8"
          formats="格式支持：MP4、AVI、MOV、MKV、WMV、WebM（具体以浏览器解码能力为准）"
          compatibility="浏览器兼容：推荐 Chrome / Edge / Safari 最新版，Firefox 对部分编码支持有限"
          privacy="隐私说明：处理在本地浏览器完成，不上传视频文件"
        />

        <div
          v-if="!videoUrl"
          class="group relative mb-8 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-16 text-center transition-all"
          :class="[
            isDragOver
              ? 'border-sky-500 bg-sky-50 scale-[1.01]'
              : 'border-gray-300 hover:border-sky-400 hover:bg-sky-50'
          ]"
          @click="triggerSelectVideo"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept="video/*,.mp4,.avi,.mov,.mkv,.wmv,.webm,.m4v"
            @change="handleFileChange"
          >
          <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 transition-transform duration-300 group-hover:scale-110">
            <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 class="mb-2 text-xl font-bold text-gray-800 transition-colors group-hover:text-sky-600">点击或拖拽视频文件到此处</h3>
          <p class="text-gray-500">支持 MP4、AVI、MOV、MKV、WMV、WebM 等格式</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div class="space-y-6 lg:col-span-4">
            <div class="sticky top-4 rounded-xl border border-gray-100 bg-gray-50 p-6">
              <h3 class="mb-6 text-lg font-semibold text-gray-800">重设参数</h3>

              <div class="mb-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">文件名</span>
                  <span class="max-w-[170px] truncate text-right text-gray-800">{{ videoFile?.name }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">原始大小</span>
                  <span class="font-medium text-gray-800">{{ sourceSizeMB.toFixed(2) }} MB</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">分辨率</span>
                  <span class="font-medium text-gray-800">{{ sourceMeta.width }} × {{ sourceMeta.height }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">时长</span>
                  <span class="font-medium text-gray-800">{{ formatTime(sourceMeta.duration) }}</span>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700">目标分辨率</label>
                  <el-select v-model="settings.preset" class="w-full">
                    <el-option value="1080p" label="1080p（1920 × 1080）" />
                    <el-option value="720p" label="720p（1280 × 720）" />
                    <el-option value="480p" label="480p（854 × 480）" />
                    <el-option value="custom" label="自定义尺寸" />
                  </el-select>
                </div>

                <div v-if="settings.preset === 'custom'" class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="mb-1 block text-xs text-gray-500">宽度</label>
                    <el-input-number v-model="settings.customWidth" :min="2" :max="4096" :step="2" class="w-full" controls-position="right" />
                  </div>
                  <div>
                    <label class="mb-1 block text-xs text-gray-500">高度</label>
                    <el-input-number v-model="settings.customHeight" :min="2" :max="4096" :step="2" class="w-full" controls-position="right" />
                  </div>
                </div>

                <div>
                  <label class="mb-2 block text-sm font-medium text-gray-700">输出格式</label>
                  <el-select v-model="settings.outputFormat" class="w-full">
                    <el-option value="auto" label="自动（推荐）" />
                    <el-option value="webm" label="WebM" />
                    <el-option value="mp4" label="MP4" />
                  </el-select>
                </div>

                <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                  <span class="text-sm text-gray-700">保留音频</span>
                  <el-switch v-model="settings.keepAudio" />
                </div>

                <div class="rounded-lg border border-sky-100 bg-sky-50 p-4 text-xs leading-6 text-sky-700">
                  当前目标：{{ presetLabel }}。处理时会按等比缩放并居中填充，避免画面拉伸变形。
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

                <button
                  class="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 px-4 py-3.5 font-medium text-white transition-all duration-200 hover:from-sky-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="isProcessing"
                  @click="processVideo"
                >
                  <span v-if="!isProcessing">开始重设分辨率</span>
                  <span v-else>处理中...</span>
                </button>

                <button
                  class="flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-all duration-200 hover:border-sky-400 hover:text-sky-700"
                  :disabled="isProcessing"
                  @click="triggerSelectVideo"
                >
                  上传其他视频
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-6 lg:col-span-8">
            <div class="relative flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-black">
              <video
                ref="previewVideoRef"
                :src="videoUrl"
                controls
                class="max-h-[500px] w-full"
                @loadedmetadata="onSourceVideoLoaded"
              />
            </div>

            <div v-if="resultVideoUrl" class="relative overflow-hidden rounded-xl border border-green-200 bg-white p-6">
              <div class="absolute left-0 top-0 h-full w-1 bg-green-500" />
              <div class="flex flex-col gap-5">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <h3 class="text-xl font-bold text-gray-800">处理完成</h3>
                  <div class="flex items-center gap-2">
                    <button
                      class="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:border-sky-400 hover:text-sky-700"
                      @click="triggerSelectVideo"
                    >
                      上传其他视频
                    </button>
                    <button
                      class="inline-flex items-center rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700"
                      @click="downloadResult"
                    >
                      下载处理结果
                    </button>
                  </div>
                </div>

                <VideoResultComparison :metrics="resultComparisonMetrics" :summary="getResultSummary()" />

                <div class="flex items-center justify-center overflow-hidden rounded-lg bg-black">
                  <video
                    ref="resultVideoRef"
                    :src="resultVideoUrl"
                    controls
                    class="max-h-[500px] w-full"
                    @loadedmetadata="onResultVideoLoaded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>
