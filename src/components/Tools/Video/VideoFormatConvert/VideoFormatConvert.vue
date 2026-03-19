<!--
 * @file VideoFormatConvert.vue
 * @description 视频格式转换工具，支持 MP4/WebM/MOV 转换导出
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
 * 输出格式类型
 */
type OutputFormat = 'mp4' | 'webm' | 'mov'

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
const resultFileExt = ref<'mp4' | 'webm'>('webm')
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
  outputFormat: 'mp4' as OutputFormat,
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

const outputFormatText = computed(() => {
  return resultFileExt.value.toUpperCase()
})

/**
 * 格式化时长文本
 * @param seconds 秒数
 * @returns 格式化字符串
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
 * 打开视频选择器
 */
const triggerSelectVideo = () => {
  fileInput.value?.click()
}

/**
 * 清理结果链接
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
 * 停止当前处理流程
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
  isProcessing.value = false
  isFinalizingOutput = false
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 扩展名
 */
const getFileExtension = (filename: string) => {
  const parts = filename.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

/**
 * 校验视频文件
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
 * 加载视频并初始化状态
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
 * 处理文件上传
 * @param event 事件对象
 */
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  loadVideo(file)
  if (input.value) input.value = ''
}

/**
 * 处理拖拽上传
 * @param event 拖拽事件
 */
const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  loadVideo(file)
}

/**
 * 源视频元数据加载回调
 */
const onSourceVideoLoaded = () => {
  const video = previewVideoRef.value
  if (!video) return

  sourceMeta.duration = video.duration || 0
  sourceMeta.width = video.videoWidth || 0
  sourceMeta.height = video.videoHeight || 0
}

/**
 * 结果视频元数据加载回调
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
 * 解析输出格式配置
 * @returns mimeType 与文件扩展名
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

  if (settings.outputFormat === 'mp4' || settings.outputFormat === 'mov') {
    const mp4MimeType = pick(mp4Candidates)
    if (mp4MimeType) {
      return { mimeType: mp4MimeType, ext: 'mp4' as const }
    }

    const webmMimeType = pick(webmCandidates)
    if (webmMimeType) {
      ElMessage.warning('当前浏览器不支持 MP4/MOV 编码，已自动切换为 WebM 输出')
      return { mimeType: webmMimeType, ext: 'webm' as const }
    }
  }

  const webmMimeType = pick(webmCandidates)
  if (webmMimeType) {
    return { mimeType: webmMimeType, ext: 'webm' as const }
  }

  const mp4MimeType = pick(mp4Candidates)
  if (mp4MimeType) {
    return { mimeType: mp4MimeType, ext: 'mp4' as const }
  }

  throw new Error('当前浏览器不支持视频编码，请更换 Chrome / Edge / Safari 最新版再试')
}

/**
 * 取消处理任务
 */
const cancelProcessing = () => {
  if (!isProcessing.value) return

  isCancelRequested.value = true
  statusText.value = '已取消处理'
  etaText.value = ''
  stopCurrentProcessing()
  ElMessage.info('已取消当前转换任务')
}

/**
 * 执行格式转换
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

  try {
    isCancelRequested.value = false
    isFinalizingOutput = false
    isProcessing.value = true
    progress.value = 0
    statusText.value = '正在准备转换任务...'
    etaText.value = formatEtaText(null)
    errorText.value = ''
    processStartedAt.value = Date.now()

    clearResult()

    sourceVideo.pause()
    await seekVideo(sourceVideo, 0)

    const { mimeType, ext } = resolveRecorderPreset()
    resultFileExt.value = ext

    const targetVideoBitrate = Math.max(220, Math.round((sourceBitrateKbps.value || 1800) * 0.9))
    const recorderOptions: MediaRecorderOptions = {
      mimeType,
      videoBitsPerSecond: targetVideoBitrate * 1000
    }

    const sourceCapture = (sourceVideo as any).captureStream?.() || (sourceVideo as any).mozCaptureStream?.()
    activeSourceCaptureStream = sourceCapture || null

    const chunks: Blob[] = []
    let outputMode = '直录'

    if (sourceCapture?.getVideoTracks?.()?.length) {
      const outputStream = new MediaStream()
      outputStream.addTrack(sourceCapture.getVideoTracks()[0])

      if (settings.keepAudio && sourceCapture.getAudioTracks().length > 0) {
        outputStream.addTrack(sourceCapture.getAudioTracks()[0])
      }

      activeOutputStream = outputStream
      mediaRecorder = new MediaRecorder(outputStream, recorderOptions)
    } else {
      outputMode = 'Canvas'
      const canvas = document.createElement('canvas')
      canvas.width = sourceMeta.width
      canvas.height = sourceMeta.height
      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) {
        throw new Error('无法初始化 Canvas 上下文')
      }

      const canvasStream = canvas.captureStream(settings.frameRate)
      if (settings.keepAudio && sourceCapture?.getAudioTracks?.()?.length) {
        canvasStream.addTrack(sourceCapture.getAudioTracks()[0])
      }

      activeOutputStream = canvasStream
      mediaRecorder = new MediaRecorder(canvasStream, recorderOptions)

      const drawFrame = () => {
        if (!isProcessing.value || !previewVideoRef.value) return
        ctx.drawImage(previewVideoRef.value, 0, 0, canvas.width, canvas.height)
        if (!previewVideoRef.value.ended) {
          drawRafId = requestAnimationFrame(drawFrame)
        }
      }

      drawRafId = requestAnimationFrame(drawFrame)
    }

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
        statusText.value = '转换失败'
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
      statusText.value = '转换完成'
      etaText.value = '预计剩余时间：约 0 秒'
      clearMediaResources()
      mediaRecorder = null
      isFinalizingOutput = false

      if (videoFile.value && blob.size > videoFile.value.size * 1.05) {
        ElMessage.warning('当前参数下文件体积有所增加，可尝试切换 WebM 输出')
      } else {
        ElMessage.success(`格式转换完成（${outputMode}模式）`)
      }
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
      statusText.value = '转换失败'
      etaText.value = ''
      const message = getFriendlyVideoError((event as any)?.error, '视频转换失败，请尝试调整参数后重试')
      errorText.value = message
      ElMessage.error(message)
      mediaRecorder = null
      isFinalizingOutput = false
    }

    statusText.value = '正在转换视频格式...'
    mediaRecorder.start(500)

    await sourceVideo.play()

    const syncProgress = () => {
      if (!isProcessing.value || !previewVideoRef.value) return

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
    statusText.value = '转换失败'
    etaText.value = ''
    const message = getFriendlyVideoError(error, '转换失败，请更换浏览器后重试')
    errorText.value = message
    ElMessage.error(message)
    mediaRecorder = null
    isFinalizingOutput = false
  }
}

/**
 * 下载转换后视频
 */
const downloadResult = () => {
  if (!resultVideoUrl.value || !videoFile.value) return

  const originalName = videoFile.value.name.replace(/\.[^/.]+$/, '')
  const link = document.createElement('a')
  link.href = resultVideoUrl.value
  link.download = `${originalName}_converted.${resultFileExt.value}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 获取结果摘要文本
 * @returns 摘要文案
 */
const getResultSummary = () => {
  if (!videoFile.value || !resultVideoUrl.value || resultFileSizeMB.value <= 0) return '-'

  const savedMB = sourceSizeMB.value - resultFileSizeMB.value
  const savedRate = sourceSizeMB.value > 0 ? (savedMB / sourceSizeMB.value) * 100 : 0
  const label = savedMB >= 0 ? '体积变化' : '体积变化'

  return `${label} ${savedMB.toFixed(2)}MB（${savedRate.toFixed(1)}%）`
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
    },
    {
      label: '格式',
      before: getFileExtension(videoFile.value?.name || '').toUpperCase() || '-',
      after: outputFormatText.value
    }
  ]
})

/**
 * 浏览器刷新关闭时处理提醒
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

  const shouldLeave = window.confirm('视频仍在转换中，离开页面会中断处理。确定要离开吗？')
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
      <div class="bg-white rounded-xl p-8 mb-4">
        <div class="text-center mb-6">
          <h2 class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
            免费视频格式转换
          </h2>
          <p class="text-gray-500 text-sm sm:text-base max-w-3xl mx-auto">
            在线转换 MP4、WebM、MOV 等常见格式，支持本地处理与快速导出。
          </p>
        </div>
        <VideoToolNotice class="mb-8" />

        <div
          v-if="!videoUrl"
          class="border-2 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer mb-8 relative overflow-hidden group"
          :class="[
            isDragOver
              ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
              : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
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
          <div class="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
            点击或拖拽视频文件到此处
          </h3>
          <p class="text-gray-500">支持 MP4、AVI、MOV、MKV、WMV、WebM 等格式</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6">转换参数</h3>

              <div class="bg-white rounded-lg p-4 border border-gray-200 mb-6 space-y-3">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-500">文件名</span>
                  <span class="text-gray-800 max-w-[170px] truncate text-right">{{ videoFile?.name }}</span>
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">目标格式</label>
                  <el-select v-model="settings.outputFormat" class="w-full">
                    <el-option value="mp4" label="MP4" />
                    <el-option value="webm" label="WebM" />
                    <el-option value="mov" label="MOV（实验）" />
                  </el-select>
                </div>

                <div class="flex items-center justify-between rounded-lg bg-white border border-gray-200 p-3">
                  <span class="text-sm text-gray-700">保留音频</span>
                  <el-switch v-model="settings.keepAudio" />
                </div>

                <div class="rounded-lg bg-indigo-50 border border-indigo-100 p-4 text-xs text-indigo-700 leading-6">
                  提示：MOV 输出在部分浏览器会自动回退为 MP4 / WebM，属于浏览器编码能力限制。
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
                  class="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="isProcessing"
                  @click="processVideo"
                >
                  <span v-if="!isProcessing">开始转换</span>
                  <span v-else>转换中...</span>
                </button>

                <button
                  class="w-full py-3 px-4 bg-white border border-gray-300 hover:border-indigo-400 hover:text-indigo-700 text-gray-700 font-medium rounded-xl transition-all duration-200 flex items-center justify-center"
                  :disabled="isProcessing"
                  @click="triggerSelectVideo"
                >
                  上传其他视频
                </button>
              </div>
            </div>
          </div>

          <div class="lg:col-span-8 space-y-6">
            <div class="border border-gray-200 rounded-xl overflow-hidden bg-black flex items-center justify-center relative group">
              <video
                ref="previewVideoRef"
                :src="videoUrl"
                controls
                class="w-full max-h-[500px]"
                @loadedmetadata="onSourceVideoLoaded"
              />
            </div>

            <div v-if="resultVideoUrl" class="bg-white rounded-xl border border-green-200 p-6 animate-fade-in relative overflow-hidden">
              <div class="absolute top-0 left-0 w-1 h-full bg-green-500" />
              <div class="flex flex-col gap-5">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <h3 class="text-xl font-bold text-gray-800">转换完成</h3>
                  <div class="flex items-center gap-2">
                    <button
                      class="inline-flex items-center px-4 py-2 border border-gray-300 hover:border-indigo-400 hover:text-indigo-700 text-gray-700 font-medium rounded-lg transition-colors"
                      @click="triggerSelectVideo"
                    >
                      上传其他视频
                    </button>
                    <button
                      class="inline-flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      @click="downloadResult"
                    >
                      下载转换结果
                    </button>
                  </div>
                </div>

                <VideoResultComparison :metrics="resultComparisonMetrics" :summary="getResultSummary()" />

                <div class="bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  <video
                    ref="resultVideoRef"
                    :src="resultVideoUrl"
                    controls
                    class="w-full max-h-[500px]"
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
</style>
