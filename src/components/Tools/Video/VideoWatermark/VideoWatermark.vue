<!--
 * @file VideoWatermark.vue
 * @description 视频加水印工具，支持文字和图片水印，支持拖拽调节位置
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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import VideoToolNotice from '@/components/Tools/Video/Shared/VideoToolNotice.vue'
import VideoProcessStatus from '@/components/Tools/Video/Shared/VideoProcessStatus.vue'
import VideoResultComparison from '@/components/Tools/Video/Shared/VideoResultComparison.vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useDraggable } from '@vueuse/core'
import { estimateRemainingSeconds, formatEtaText, getFriendlyVideoError } from '@/utils/videoToolFeedback'

const route = useRoute()

const fileInput = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const videoFile = ref<File | null>(null)
const videoUrl = ref<string>('')
const videoRef = ref<HTMLVideoElement | null>(null)
const previewContainerRef = ref<HTMLElement | null>(null)
const watermarkRef = ref<HTMLElement | null>(null)
const resultVideoUrl = ref<string>('')

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

// Watermark Settings
const settings = reactive({
  type: 'text' as 'text' | 'image',
  text: 'UIED Tools',
  textColor: '#ffffff',
  textSize: 24,
  opacity: 0.8,
  image: null as File | null,
  imageUrl: '',
  imageWidth: 100,
  x: 20,
  y: 20
})

let mediaRecorder: MediaRecorder | null = null
let drawRafId: number | null = null
let activeOutputStream: MediaStream | null = null
let activeSourceStream: MediaStream | null = null
let isFinalizingOutput = false

const sourceSizeMB = computed(() => {
  if (!videoFile.value) return 0
  return videoFile.value.size / 1024 / 1024
})

// Draggable logic - safe initialization
const { x, y } = useDraggable(watermarkRef, {
  initialValue: { x: 20, y: 20 },
  preventDefault: true,
  // Only enable when element exists
  disabled: computed(() => !videoUrl.value)
})

// Update settings when dragged
watch([x, y], ([newX, newY]) => {
  // Constrain within container
  if (previewContainerRef.value && watermarkRef.value) {
    const container = previewContainerRef.value
    const watermark = watermarkRef.value

    const maxX = container.clientWidth - watermark.clientWidth
    const maxY = container.clientHeight - watermark.clientHeight

    settings.x = Math.max(0, Math.min(newX, maxX))
    settings.y = Math.max(0, Math.min(newY, maxY))
  } else {
    settings.x = newX
    settings.y = newY
  }
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
 * 更新 ETA 文本
 * @param currentProgress 当前进度
 */
const updateEtaText = (currentProgress: number) => {
  const remainSeconds = estimateRemainingSeconds(currentProgress, processStartedAt.value)
  etaText.value = formatEtaText(remainSeconds)
}

/**
 * 清理结果视频链接与元数据
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
 * 停止流资源
 */
const clearStreams = () => {
  activeOutputStream?.getTracks().forEach(track => track.stop())
  activeSourceStream?.getTracks().forEach(track => track.stop())
  activeOutputStream = null
  activeSourceStream = null
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
    clearStreams()
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

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.type.startsWith('image/')) {
      settings.image = file
      if (settings.imageUrl) URL.revokeObjectURL(settings.imageUrl)
      settings.imageUrl = URL.createObjectURL(file)
      settings.type = 'image'
    } else {
      ElMessage.warning('请选择有效的图片文件')
    }
  }
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('video/')) {
      loadVideo(file)
    } else {
      ElMessage.warning('请选择有效的视频文件')
    }
  }
}

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

  settings.x = 20
  settings.y = 20
  x.value = 20
  y.value = 20
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

/**
 * 等待视频定位完成
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
 * 预加载水印图片
 * @returns 图片对象或 null
 */
const loadWatermarkImage = async () => {
  if (settings.type !== 'image' || !settings.imageUrl) {
    return null
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('水印图片加载失败'))
    image.src = settings.imageUrl
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
  ElMessage.info('已取消当前加水印任务')
}

/**
 * 视频加水印主流程
 */
const processVideo = async () => {
  if (!videoRef.value || !previewContainerRef.value) return

  if (!videoFile.value) {
    ElMessage.warning('请先上传视频文件')
    return
  }

  const video = videoRef.value
  if (!video.videoWidth || !video.videoHeight || !video.duration) {
    ElMessage.warning('视频元数据尚未加载完成，请稍后重试')
    return
  }

  isCancelRequested.value = false
  isFinalizingOutput = false
  isProcessing.value = true
  statusText.value = '正在准备处理任务...'
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

  // Set canvas size to match video resolution
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Calculate scale factor between preview and actual video
  const previewRect = previewContainerRef.value.getBoundingClientRect()
  const scaleX = previewRect.width > 0 ? video.videoWidth / previewRect.width : 1
  const scaleY = previewRect.height > 0 ? video.videoHeight / previewRect.height : 1

  try {
    const watermarkImage = await loadWatermarkImage()
    const outputStream = canvas.captureStream(30)
    activeOutputStream = outputStream

    const sourceCapture = (video as any).captureStream?.() || (video as any).mozCaptureStream?.()
    activeSourceStream = sourceCapture || null
    const audioTracks = sourceCapture?.getAudioTracks?.() || []
    if (audioTracks.length > 0) {
      outputStream.addTrack(audioTracks[0])
    }

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm'

    const chunks: Blob[] = []
    mediaRecorder = new MediaRecorder(outputStream, { mimeType })

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data)
      }
    }

    const originalMuted = video.muted

    mediaRecorder.onstop = () => {
      if (drawRafId !== null) {
        cancelAnimationFrame(drawRafId)
        drawRafId = null
      }

      video.pause()
      video.onended = null
      video.muted = originalMuted
      clearStreams()

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
      resultMeta.width = sourceMeta.width
      resultMeta.height = sourceMeta.height
      isProcessing.value = false
      statusText.value = '处理完成'
      progress.value = 100
      etaText.value = '预计剩余时间：约 0 秒'
      mediaRecorder = null
      isFinalizingOutput = false
      ElMessage.success('水印添加成功')
    }

    mediaRecorder.onerror = (event) => {
      if (drawRafId !== null) {
        cancelAnimationFrame(drawRafId)
        drawRafId = null
      }

      video.pause()
      video.onended = null
      video.muted = originalMuted
      clearStreams()

      isProcessing.value = false
      statusText.value = '处理失败'
      etaText.value = ''
      const message = getFriendlyVideoError((event as any)?.error, '加水印失败，请稍后重试')
      errorText.value = message
      ElMessage.error(message)
      mediaRecorder = null
      isFinalizingOutput = false
    }

    await waitForSeeked(video, 0)
    mediaRecorder.start(500)
    video.muted = true
    statusText.value = '正在渲染水印...'
    await video.play()

    const draw = () => {
      if (!isProcessing.value || !videoRef.value) return

      ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)

      ctx.globalAlpha = settings.opacity
      const watermarkX = settings.x * scaleX
      const watermarkY = settings.y * scaleY

      if (settings.type === 'text') {
        ctx.font = `${settings.textSize * scaleX}px Arial`
        ctx.fillStyle = settings.textColor
        ctx.textBaseline = 'top'
        ctx.fillText(settings.text, watermarkX, watermarkY)
      } else if (watermarkImage) {
        const width = settings.imageWidth * scaleX
        const height = (settings.imageWidth * watermarkImage.height / watermarkImage.width) * scaleY
        ctx.drawImage(watermarkImage, watermarkX, watermarkY, width, height)
      }

      ctx.globalAlpha = 1

      const currentProgress = Math.min(99, Math.round((videoRef.value.currentTime / sourceMeta.duration) * 99))
      progress.value = currentProgress
      updateEtaText(currentProgress)

      if (videoRef.value.currentTime >= sourceMeta.duration - 0.2 || videoRef.value.ended) {
        finalizeRecording()
        return
      }

      drawRafId = requestAnimationFrame(draw)
    }

    drawRafId = requestAnimationFrame(draw)
    video.onended = () => {
      finalizeRecording()
    }
  } catch (error) {
    clearStreams()
    isProcessing.value = false
    statusText.value = '处理失败'
    etaText.value = ''
    const message = getFriendlyVideoError(error, '加水印失败，请稍后重试')
    errorText.value = message
    ElMessage.error(message)
    mediaRecorder = null
    isFinalizingOutput = false
  }
}

const downloadResult = () => {
  if (!resultVideoUrl.value || !videoFile.value) return
  const a = document.createElement('a')
  a.href = resultVideoUrl.value
  const originalName = videoFile.value.name.replace(/\.[^/.]+$/, '')
  a.download = `${originalName}_watermarked.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * 获取处理结果摘要
 * @returns 摘要文案
 */
const getResultSummary = () => {
  if (!videoFile.value || !resultVideoUrl.value) return '-'
  const delta = sourceSizeMB.value - resultFileSizeMB.value
  const ratio = sourceSizeMB.value > 0 ? (delta / sourceSizeMB.value) * 100 : 0
  const label = delta >= 0 ? '节省' : '增加'
  return `${label} ${Math.abs(delta).toFixed(2)}MB（${Math.abs(ratio).toFixed(1)}%）`
}

/**
 * 处理结果对比指标
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
  clearStreams()
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  clearResultVideo()
  if (settings.imageUrl) URL.revokeObjectURL(settings.imageUrl)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave((to, from, next) => {
  if (!isProcessing.value) {
    next()
    return
  }

  const shouldLeave = window.confirm('视频加水印仍在处理中，离开页面会中断任务。确定要离开吗？')
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
        <div class="text-center mb-8">
          <h2
            class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            免费视频加水印</h2>
          <p class="text-gray-500 text-sm">在线为视频添加文字或图片水印，支持拖拽调节位置，本地处理保护隐私</p>
        </div>
        <VideoToolNotice class="mb-8" />

        <!-- Upload Area -->
        <div v-if="!videoUrl"
          class="border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-8 group"
          :class="[isDragOver ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50']"
          @click="fileInput?.click()" @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div
            class="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <p class="text-xl font-medium text-gray-700 mb-2">点击 or 拖拽视频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP4, WebM, MOV 等常见视频格式</p>
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                水印设置
              </h3>

              <div class="space-y-6">
                <!-- Type Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">水印类型</label>
                  <div class="flex bg-white rounded-lg p-1 border border-gray-200">
                    <button v-for="type in ['text', 'image']" :key="type" @click="settings.type = type as any"
                      class="flex-1 py-1.5 text-sm rounded-md transition-all duration-200 capitalize"
                      :class="settings.type === type ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'">
                      {{ type === 'text' ? '文字' : '图片' }}
                    </button>
                  </div>
                </div>

                <!-- Text Settings -->
                <template v-if="settings.type === 'text'">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">文字内容</label>
                    <input type="text" v-model="settings.text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">颜色</label>
                      <input type="color" v-model="settings.textColor"
                        class="w-full h-10 rounded cursor-pointer border border-gray-200" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">大小 (px)</label>
                      <input type="number" v-model="settings.textSize" min="12" max="100"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                  </div>
                </template>

                <!-- Image Settings -->
                <template v-else>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">上传图片</label>
                    <div @click="imageInput?.click()"
                      class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all bg-white group">
                      <span class="text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">{{
                        settings.imageUrl ? '点击更换图片' : '点击上传图片' }}</span>
                      <input type="file" ref="imageInput" class="hidden" accept="image/*" @change="handleImageChange" />
                    </div>
                  </div>

                  <div v-if="settings.imageUrl">
                    <label class="block text-sm font-medium text-gray-700 mb-2">图片宽度 (px)</label>
                    <el-slider v-model="settings.imageWidth" :min="20" :max="500" />
                  </div>
                </template>

                <!-- Common Settings -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">不透明度</label>
                  <el-slider v-model="settings.opacity" :min="0.1" :max="1" :step="0.1" />
                </div>

                <!-- Actions -->
                <div class="pt-6 border-t border-gray-200 space-y-3">
                  <button v-if="!resultVideoUrl" @click="processVideo" :disabled="isProcessing"
                    class="w-full py-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    <span v-if="isProcessing" class="mr-2 animate-spin">
                      <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                    </span>
                    {{ isProcessing ? '处理中...' : '开始生成视频' }}
                  </button>

                  <button v-if="resultVideoUrl" @click="downloadResult"
                    class="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载视频
                  </button>

                  <button @click="fileInput?.click()"
                    class="w-full py-2 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium">
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

          <!-- Right: Preview -->
          <div class="lg:col-span-8 space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div ref="previewContainerRef"
                class="bg-black aspect-video flex items-center justify-center relative group select-none">
                <video ref="videoRef" :src="videoUrl" controls class="w-full h-full object-contain" @loadedmetadata="onSourceVideoLoaded"></video>

                <!-- Watermark Overlay -->
                <div ref="watermarkRef"
                  class="absolute cursor-move hover:ring-2 hover:ring-indigo-500 hover:ring-dashed p-1 rounded"
                  :style="{
                    left: `${x}px`,
                    top: `${y}px`,
                    opacity: settings.opacity
                  }">
                  <span v-if="settings.type === 'text'" :style="{
                    color: settings.textColor,
                    fontSize: `${settings.textSize}px`,
                    fontFamily: 'Arial'
                  }">{{ settings.text }}</span>

                  <img v-else-if="settings.imageUrl" :src="settings.imageUrl"
                    :style="{ width: `${settings.imageWidth}px` }" class="pointer-events-none block" />
                </div>
              </div>
            </div>

            <div v-if="resultVideoUrl" class="bg-white rounded-xl border border-green-200 p-6 space-y-4">
              <h3 class="text-lg font-semibold text-gray-800">加水印结果</h3>
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            使用说明
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div class="flex items-start">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">1</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">设置水印</h4>
                <p>选择"文字"或"图片"模式，在预览区域直接拖拽水印到合适的位置。</p>
              </div>
            </div>
            <div class="flex items-start">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">2</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">生成视频</h4>
                <p>点击"开始生成视频"，工具将逐帧录制视频并合成水印。请耐心等待处理完成。</p>
              </div>
            </div>
            <div class="flex items-start">
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">3</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">下载保存</h4>
                <p>处理完成后点击"下载视频"按钮，保存 WebM 格式文件。本地处理，不消耗流量。</p>
              </div>
            </div>
          </div>
          <div class="mt-6 pt-6 border-t border-gray-200">
            <div class="flex items-center text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200">
              <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
