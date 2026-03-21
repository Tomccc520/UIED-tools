<!--
 * @file VideoCrop.vue
 * @description 视频画面裁剪工具，支持拖拽调整裁剪区域
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
 * @createDate 2025-9-22
 */
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import VideoToolNotice from '@/components/Tools/Video/Shared/VideoToolNotice.vue'
import VideoProcessStatus from '@/components/Tools/Video/Shared/VideoProcessStatus.vue'
import VideoResultComparison from '@/components/Tools/Video/Shared/VideoResultComparison.vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { estimateRemainingSeconds, formatEtaText, getFriendlyVideoError } from '@/utils/videoToolFeedback'

const route = useRoute()

const fileInput = ref<HTMLInputElement | null>(null)
const videoFile = ref<File | null>(null)
const videoUrl = ref<string>('')
const resultVideoUrl = ref<string>('')
const videoRef = ref<HTMLVideoElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')
const etaText = ref('')
const errorText = ref('')
const processStartedAt = ref(0)
const isCancelRequested = ref(false)
const resultFileSizeMB = ref(0)
const isDragOver = ref(false)

const sourceMeta = reactive({
  duration: 0,
  width: 0,
  height: 0
})

const resultMeta = reactive({
  duration: 0,
  width: 0,
  height: 0
})

let mediaRecorder: MediaRecorder | null = null
let drawRafId: number | null = null
let activeCanvasStream: MediaStream | null = null
let activeSourceStream: MediaStream | null = null
let activeAudioContext: AudioContext | null = null
let isFinalizingOutput = false

const sourceSizeMB = computed(() => {
  if (!videoFile.value) return 0
  return videoFile.value.size / 1024 / 1024
})

// Crop State (in percentage relative to container)
const crop = reactive({
  x: 10,
  y: 10,
  width: 80,
  height: 80,
  isDragging: false,
  isResizing: false,
  resizeHandle: '' // nw, ne, sw, se
})

// Dragging state
const dragStart = reactive({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 })

/**
 * 格式化时长文本
 * @param seconds 秒数
 * @returns mm:ss 格式文本
 */
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
 * 重置裁剪框为默认状态
 */
const resetCropArea = () => {
  crop.x = 10
  crop.y = 10
  crop.width = 80
  crop.height = 80
}

/**
 * 清理结果链接
 */
const clearResultVideo = () => {
  if (resultVideoUrl.value) {
    URL.revokeObjectURL(resultVideoUrl.value)
  }
  resultVideoUrl.value = ''
  resultFileSizeMB.value = 0
  resultMeta.duration = 0
  resultMeta.width = 0
  resultMeta.height = 0
}

/**
 * 停止并清理媒体流资源
 */
const clearMediaResources = () => {
  activeCanvasStream?.getTracks().forEach(track => track.stop())
  activeSourceStream?.getTracks().forEach(track => track.stop())
  activeCanvasStream = null
  activeSourceStream = null

  if (activeAudioContext) {
    activeAudioContext.close().catch(() => {})
    activeAudioContext = null
  }
}

/**
 * 停止当前处理流程
 */
const stopCurrentProcessing = () => {
  if (drawRafId !== null) {
    cancelAnimationFrame(drawRafId)
    drawRafId = null
  }

  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.onended = null
  }

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  } else {
    clearMediaResources()
  }

  mediaRecorder = null
  isProcessing.value = false
  isFinalizingOutput = false
}

/**
 * 请求结束录制并封装输出
 */
const finalizeRecording = () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive' || isFinalizingOutput) {
    return
  }

  isFinalizingOutput = true
  progress.value = Math.max(progress.value, 99)
  statusText.value = '正在封装输出文件...'
  etaText.value = '预计剩余时间：约 0 秒'
  mediaRecorder.stop()
}

/**
 * 加载视频文件并重置状态
 * @param file 视频文件
 */
const loadVideo = (file: File) => {
  if (!file.type.startsWith('video/')) {
    ElMessage.warning('请选择有效的视频文件')
    return
  }

  isCancelRequested.value = true
  stopCurrentProcessing()

  videoFile.value = file
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  clearResultVideo()
  videoUrl.value = URL.createObjectURL(file)

  sourceMeta.duration = 0
  sourceMeta.width = 0
  sourceMeta.height = 0

  progress.value = 0
  statusText.value = ''
  etaText.value = ''
  errorText.value = ''
  processStartedAt.value = 0
  resetCropArea()
}

/**
 * 源视频元数据加载回调
 * @param event 事件对象
 */
const onSourceVideoLoaded = (event: Event) => {
  const target = event.target as HTMLVideoElement
  sourceMeta.duration = target.duration || 0
  sourceMeta.width = target.videoWidth || 0
  sourceMeta.height = target.videoHeight || 0
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    loadVideo(target.files[0])
  }
  if (target.value) target.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    loadVideo(files[0])
  }
}

// Mouse Event Handlers for Crop Box
const startDrag = (e: MouseEvent) => {
  e.preventDefault()
  crop.isDragging = true
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  dragStart.cropX = crop.x
  dragStart.cropY = crop.y

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!crop.isDragging || !containerRef.value) return

  const containerRect = containerRef.value.getBoundingClientRect()
  const deltaX = ((e.clientX - dragStart.x) / containerRect.width) * 100
  const deltaY = ((e.clientY - dragStart.y) / containerRect.height) * 100

  let newX = dragStart.cropX + deltaX
  let newY = dragStart.cropY + deltaY

  // Boundary checks
  newX = Math.max(0, Math.min(newX, 100 - crop.width))
  newY = Math.max(0, Math.min(newY, 100 - crop.height))

  crop.x = newX
  crop.y = newY
}

const stopDrag = () => {
  crop.isDragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}

// Resize Handlers
const startResize = (e: MouseEvent, handle: string) => {
  e.preventDefault()
  e.stopPropagation()
  crop.isResizing = true
  crop.resizeHandle = handle
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  dragStart.cropX = crop.x
  dragStart.cropY = crop.y
  dragStart.cropW = crop.width
  dragStart.cropH = crop.height

  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
}

const onResize = (e: MouseEvent) => {
  if (!crop.isResizing || !containerRef.value) return

  const containerRect = containerRef.value.getBoundingClientRect()
  const deltaX = ((e.clientX - dragStart.x) / containerRect.width) * 100
  const deltaY = ((e.clientY - dragStart.y) / containerRect.height) * 100

  if (crop.resizeHandle.includes('e')) {
    crop.width = Math.max(5, Math.min(dragStart.cropW + deltaX, 100 - dragStart.cropX))
  }
  if (crop.resizeHandle.includes('s')) {
    crop.height = Math.max(5, Math.min(dragStart.cropH + deltaY, 100 - dragStart.cropY))
  }
  if (crop.resizeHandle.includes('w')) {
    const maxDelta = dragStart.cropW - 5
    const actualDelta = Math.min(deltaX, maxDelta)
    const newX = Math.max(0, dragStart.cropX + actualDelta)
    if (newX !== crop.x) {
      crop.width = dragStart.cropW - (newX - dragStart.cropX)
      crop.x = newX
    }
  }
  if (crop.resizeHandle.includes('n')) {
    const maxDelta = dragStart.cropH - 5
    const actualDelta = Math.min(deltaY, maxDelta)
    const newY = Math.max(0, dragStart.cropY + actualDelta)
    if (newY !== crop.y) {
      crop.height = dragStart.cropH - (newY - dragStart.cropY)
      crop.y = newY
    }
  }
}

const stopResize = () => {
  crop.isResizing = false
  crop.resizeHandle = ''
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
}

/**
 * 等待视频 seek 完成
 * @param video 视频元素
 * @param targetTime 目标时间
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
 * 取消当前处理任务
 */
const cancelProcessing = () => {
  if (!isProcessing.value) return

  isCancelRequested.value = true
  statusText.value = '已取消处理'
  etaText.value = ''
  stopCurrentProcessing()
  ElMessage.info('已取消当前裁剪任务')
}

/**
 * 视频裁剪处理主流程
 */
const processVideo = async () => {
  if (!videoRef.value || !videoFile.value) {
    ElMessage.warning('请先上传视频文件')
    return
  }

  const video = videoRef.value
  if (!video.videoWidth || !video.videoHeight || !video.duration) {
    ElMessage.warning('视频元数据尚未加载完成，请稍后重试')
    return
  }

  // Calculate actual crop coordinates
  const sx = (crop.x / 100) * video.videoWidth
  const sy = (crop.y / 100) * video.videoHeight
  const sWidth = (crop.width / 100) * video.videoWidth
  const sHeight = (crop.height / 100) * video.videoHeight

  // Validate dimensions
  if (sWidth < 10 || sHeight < 10) {
    ElMessage.warning('裁剪区域太小')
    return
  }

  isCancelRequested.value = false
  isFinalizingOutput = false
  isProcessing.value = true
  statusText.value = '正在准备裁剪任务...'
  progress.value = 0
  etaText.value = formatEtaText(null)
  errorText.value = ''
  processStartedAt.value = Date.now()
  clearResultVideo()

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    ElMessage.error('无法创建 Canvas 上下文')
    isProcessing.value = false
    return
  }

  // Set canvas size to crop size
  canvas.width = sWidth
  canvas.height = sHeight

  try {
    const canvasStream = canvas.captureStream(30)
    activeCanvasStream = canvasStream

    const sourceCapture = (video as any).captureStream?.() || (video as any).mozCaptureStream?.()
    activeSourceStream = sourceCapture || null
    const audioTracks = sourceCapture?.getAudioTracks?.() || []
    if (audioTracks.length > 0) {
      canvasStream.addTrack(audioTracks[0])
    } else {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      activeAudioContext = audioCtx
      const source = audioCtx.createMediaElementSource(video)
      const dest = audioCtx.createMediaStreamDestination()
      source.connect(dest)
      source.connect(audioCtx.destination)
      if (dest.stream.getAudioTracks().length > 0) {
        canvasStream.addTrack(dest.stream.getAudioTracks()[0])
      }
    }

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm'

    const chunks: Blob[] = []
    mediaRecorder = new MediaRecorder(canvasStream, { mimeType })

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      if (drawRafId !== null) {
        cancelAnimationFrame(drawRafId)
        drawRafId = null
      }

      video.pause()
      video.onended = null
      clearMediaResources()

      if (isCancelRequested.value) {
        isCancelRequested.value = false
        progress.value = 0
        statusText.value = '已取消处理'
        etaText.value = ''
        mediaRecorder = null
        isFinalizingOutput = false
        return
      }

      const blob = new Blob(chunks, { type: mimeType })
      resultVideoUrl.value = URL.createObjectURL(blob)
      resultFileSizeMB.value = blob.size / 1024 / 1024
      resultMeta.duration = sourceMeta.duration
      resultMeta.width = Math.round(sWidth)
      resultMeta.height = Math.round(sHeight)
      isProcessing.value = false
      progress.value = 100
      statusText.value = '裁剪完成'
      etaText.value = '预计剩余时间：约 0 秒'
      mediaRecorder = null
      isFinalizingOutput = false
      ElMessage.success('裁剪完成')
    }

    mediaRecorder.onerror = (event) => {
      if (drawRafId !== null) {
        cancelAnimationFrame(drawRafId)
        drawRafId = null
      }
      video.pause()
      video.onended = null
      clearMediaResources()

      isProcessing.value = false
      statusText.value = '裁剪失败'
      etaText.value = ''
      const message = getFriendlyVideoError((event as any)?.error, '裁剪失败，请稍后重试')
      errorText.value = message
      ElMessage.error(message)
      mediaRecorder = null
      isFinalizingOutput = false
    }

    await waitForSeeked(video, 0)
    mediaRecorder.start(500)
    statusText.value = '正在裁剪视频...'
    await video.play()

    const drawFrame = () => {
      if (!isProcessing.value || !videoRef.value) return

      ctx.drawImage(videoRef.value, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight)
      const currentProgress = Math.min(99, Math.round((videoRef.value.currentTime / sourceMeta.duration) * 99))
      progress.value = currentProgress
      updateEtaText(currentProgress)

      if (videoRef.value.currentTime >= sourceMeta.duration - 0.2 || videoRef.value.ended) {
        finalizeRecording()
        return
      }

      drawRafId = requestAnimationFrame(drawFrame)
    }

    drawRafId = requestAnimationFrame(drawFrame)
    video.onended = () => {
      finalizeRecording()
    }
  } catch (error) {
    clearMediaResources()
    isProcessing.value = false
    statusText.value = '裁剪失败'
    etaText.value = ''
    const message = getFriendlyVideoError(error, '裁剪失败，请稍后重试')
    errorText.value = message
    ElMessage.error(message)
    mediaRecorder = null
    isFinalizingOutput = false
  }
}

const downloadVideo = () => {
  if (!resultVideoUrl.value || !videoFile.value) return
  const a = document.createElement('a')
  a.href = resultVideoUrl.value
  const originalName = videoFile.value.name.replace(/\.[^/.]+$/, '')
  a.download = `${originalName}_cropped.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * 获取结果摘要文案
 * @returns 摘要字符串
 */
const getResultSummary = () => {
  if (!videoFile.value || !resultVideoUrl.value) return '-'
  const delta = sourceSizeMB.value - resultFileSizeMB.value
  const ratio = sourceSizeMB.value > 0 ? (delta / sourceSizeMB.value) * 100 : 0
  const label = delta >= 0 ? '节省' : '增加'
  return `${label} ${Math.abs(delta).toFixed(2)}MB（${Math.abs(ratio).toFixed(1)}%）`
}

/**
 * 结果对比指标
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
    }
  ]
})

/**
 * 浏览器刷新/关闭提醒
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
  clearResultVideo()
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave((to, from, next) => {
  if (!isProcessing.value) {
    next()
    return
  }

  const shouldLeave = window.confirm('视频裁剪仍在处理中，离开页面会中断任务。确定要离开吗？')
  if (!shouldLeave) {
    next(false)
    return
  }

  cancelProcessing()
  next()
})
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl min-h-[600px] p-6 sm:p-8">
        <!-- 头部区域 -->
        <div class="text-center mb-8">
          <h2
            class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            免费视频画面裁剪
          </h2>
          <p class="text-gray-500 text-sm">在线裁剪视频画面区域，支持自由调整比例，本地处理保护隐私</p>
        </div>
        <VideoToolNotice class="mb-8" />

        <!-- Upload Area -->
        <div v-if="!videoUrl"
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer mb-8 group"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <p class="text-xl font-medium text-gray-700 mb-2">点击 or 拖拽视频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP4, WebM, MOV 等常见视频格式</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- 左侧：配置区域 -->
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

              <div class="space-y-6">
                <!-- Crop Info -->
                <div class="bg-white rounded-xl p-4 border border-gray-200">
                  <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    裁剪参数
                  </h4>
                  <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div class="flex justify-between p-2 bg-gray-50 rounded"><span>X:</span> <span class="font-mono font-medium text-indigo-600">{{ Math.round(crop.x) }}%</span></div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded"><span>Y:</span> <span class="font-mono font-medium text-indigo-600">{{ Math.round(crop.y) }}%</span></div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded"><span>宽:</span> <span class="font-mono font-medium text-indigo-600">{{ Math.round(crop.width) }}%</span></div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded"><span>高:</span> <span class="font-mono font-medium text-indigo-600">{{ Math.round(crop.height) }}%</span></div>
                  </div>
                </div>

                <!-- Process Button -->
                <div class="space-y-3">
                  <button @click="processVideo" :disabled="isProcessing"
                    class="w-full py-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    <span v-if="isProcessing" class="mr-2 animate-spin">
                      <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    {{ isProcessing ? '处理中...' : '开始裁剪' }}
                  </button>

                  <button v-if="resultVideoUrl" @click="downloadVideo"
                    class="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载视频
                  </button>

                  <button @click="fileInput?.click()"
                    class="w-full py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    更换视频
                  </button>
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
              </div>
            </div>
          </div>

          <!-- 右侧：预览区域 -->
          <div class="lg:col-span-8 space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 class="font-medium text-gray-700">预览 & 裁剪</h3>
                </div>
              </div>

              <div class="flex-1 p-6 flex items-center justify-center bg-gray-50 relative min-h-[400px]">
                <!-- Video Preview -->
                <div ref="containerRef"
                  class="bg-black rounded-lg overflow-hidden relative flex items-center justify-center select-none max-w-full"
                  style="max-height: 600px;">
                  <video ref="videoRef" :src="videoUrl" class="max-w-full max-h-[600px]" controls @loadedmetadata="onSourceVideoLoaded"></video>

                  <!-- Crop Overlay -->
                  <div class="absolute inset-0 pointer-events-none">
                    <!-- Dimmed Areas -->
                    <div class="absolute bg-black/50 transition-all duration-75" :style="{ top: 0, left: 0, right: 0, height: `${crop.y}%` }"></div>
                    <div class="absolute bg-black/50 transition-all duration-75" :style="{ bottom: 0, left: 0, right: 0, height: `${100 - crop.y - crop.height}%` }"></div>
                    <div class="absolute bg-black/50 transition-all duration-75" :style="{ top: `${crop.y}%`, left: 0, width: `${crop.x}%`, height: `${crop.height}%` }"></div>
                    <div class="absolute bg-black/50 transition-all duration-75" :style="{ top: `${crop.y}%`, right: 0, width: `${100 - crop.x - crop.width}%`, height: `${crop.height}%` }"></div>

                    <!-- Crop Box -->
                    <div
                      class="absolute border-2 border-white pointer-events-auto cursor-move transition-all duration-75"
                      :style="{
                        left: `${crop.x}%`,
                        top: `${crop.y}%`,
                        width: `${crop.width}%`,
                        height: `${crop.height}%`
                      }" @mousedown.stop="startDrag">
                      <!-- Grid Lines -->
                      <div class="absolute top-1/3 left-0 right-0 h-px bg-white/30 pointer-events-none"></div>
                      <div class="absolute top-2/3 left-0 right-0 h-px bg-white/30 pointer-events-none"></div>
                      <div class="absolute left-1/3 top-0 bottom-0 w-px bg-white/30 pointer-events-none"></div>
                      <div class="absolute left-2/3 top-0 bottom-0 w-px bg-white/30 pointer-events-none"></div>

                      <!-- Resize Handles -->
                      <div class="absolute -top-1.5 -left-1.5 w-3 h-3 bg-indigo-500 border border-white cursor-nw-resize hover:scale-125 transition-transform"
                        @mousedown.stop="startResize($event, 'nw')"></div>
                      <div class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-indigo-500 border border-white cursor-ne-resize hover:scale-125 transition-transform"
                        @mousedown.stop="startResize($event, 'ne')"></div>
                      <div class="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-indigo-500 border border-white cursor-sw-resize hover:scale-125 transition-transform"
                        @mousedown.stop="startResize($event, 'sw')"></div>
                      <div class="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-indigo-500 border border-white cursor-se-resize hover:scale-125 transition-transform"
                        @mousedown.stop="startResize($event, 'se')"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="resultVideoUrl" class="bg-white rounded-xl border border-green-200 p-6 space-y-4">
              <h3 class="text-lg font-semibold text-gray-800">裁剪结果</h3>
              <VideoResultComparison :metrics="resultComparisonMetrics" :summary="getResultSummary()" />
              <div class="rounded-lg overflow-hidden bg-black flex items-center justify-center">
                <video :src="resultVideoUrl" controls class="w-full max-h-[420px]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-12">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
             <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             使用说明
           </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">1</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">调整区域</h4>
                <p>直接在预览画面中拖动裁剪框调整位置，拖动四个角调整裁剪大小。</p>
              </div>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">2</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">开始裁剪</h4>
                <p>设置好裁剪区域后，点击"开始裁剪"按钮，工具将自动处理视频画面。</p>
              </div>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">3</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">保存视频</h4>
                <p>处理完成后，点击"下载视频"即可保存裁剪后的视频文件。</p>
              </div>
            </div>
          </div>
          <div class="mt-6 pt-6 border-t border-gray-200">
             <div class="flex items-center text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200">
               <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </svg>
               <span class="text-gray-700 font-medium mr-2">隐私安全说明:</span>
               本工具所有处理均在您的浏览器本地进行，视频文件不会上传到服务器。
             </div>
           </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>
