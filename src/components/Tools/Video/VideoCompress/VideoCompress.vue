<!--
 * @file VideoCompress.vue
 * @description 在线视频压缩工具，支持服务端 FFmpeg H.264 与浏览器本地双引擎
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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import MobileToolActions from '@/components/Common/MobileToolActions.vue'
import VideoProcessStatus from '@/components/Tools/Video/Shared/VideoProcessStatus.vue'
import VideoResultComparison from '@/components/Tools/Video/Shared/VideoResultComparison.vue'
import VideoUploadZone from '@/components/Tools/Video/Shared/VideoUploadZone.vue'
import VideoWorkspaceIntro from '@/components/Tools/Video/Shared/VideoWorkspaceIntro.vue'
import MemberCoreToolTips from '@/components/Common/MemberCoreToolTips.vue'
import { estimateRemainingSeconds, formatEtaText, getFriendlyVideoError } from '@/utils/videoToolFeedback'
import { seekVideoForCompression } from '@/utils/videoCompressionLifecycle'
import { useToolConsume } from '@/composables/useToolConsume'
import {
  compressVideoWithServer,
  getVideoCompressServerConfig,
  type VideoCompressServerConfig,
  type VideoCompressSpeed
} from '@/services/videoCompress'

/**
 * 压缩引擎类型
 */
type CompressionEngine = 'server' | 'browser'

/**
 * 压缩模式类型
 */
type CompressMode = 'ratio' | 'target-size' | 'bitrate'

/**
 * 输出格式类型
 */
type OutputFormat = 'auto' | 'webm' | 'mp4'

/**
 * 视频元数据结构
 */
interface VideoMeta {
  duration: number
  width: number
  height: number
}

/**
 * FAQ 数据结构
 */
interface FaqItem {
  question: string
  answer: string
}

/**
 * 压缩运行时覆盖参数
 */
interface CompressRuntimeOverrides {
  keepAudio?: boolean
  frameRate?: number
  outputFormat?: OutputFormat
  videoBitrateKbps?: number
  audioBitrateKbps?: number
  preferDirectCapture?: boolean
}

const route = useRoute()
const { ensureToolConsume } = useToolConsume()

const fileInput = ref<HTMLInputElement | null>(null)
const previewVideoRef = ref<HTMLVideoElement | null>(null)
const resultVideoRef = ref<HTMLVideoElement | null>(null)

const videoFile = ref<File | null>(null)
const videoUrl = ref('')
const resultVideoUrl = ref('')
const isMobileViewport = useMediaQuery('(max-width: 640px)')
const mobilePreviewSide = ref<'original' | 'compressed'>('original')
const mobileSettingsChanged = ref(false)

/** 结果生成后切换大预览；清理结果时恢复原视频，视频节点始终保留供压缩读取。 */
watch(resultVideoUrl, (url) => {
  mobilePreviewSide.value = url ? 'compressed' : 'original'
  if (url) mobileSettingsChanged.value = false
})
const resultFileExt = ref('webm')
const resultFileSizeMB = ref(0)
const resultDownloadName = ref('')
const serverResultCompressed = ref<boolean | null>(null)
const serverElapsedMs = ref(0)
const serverConfig = ref<VideoCompressServerConfig | null>(null)
const DEFAULT_MAX_FILE_SIZE_MB = 500
const LARGE_FILE_THRESHOLD_MB = 220

const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')
const etaText = ref('')
const errorText = ref('')
const processStartedAt = ref(0)
const taskElapsedSeconds = ref(0)
const serverPhase = ref<'idle' | 'checking' | 'uploading' | 'processing' | 'downloading'>('idle')
let elapsedTimer: number | null = null

/** 停止耗时刷新，取消、完成和卸载后都不留下后台定时器。 */
const clearElapsedTimer = () => {
  if (elapsedTimer !== null) window.clearInterval(elapsedTimer)
  elapsedTimer = null
}

/** 展示真实经过时间；服务端未提供转码进度时不根据耗时伪造百分比。 */
watch(isProcessing, (processing) => {
  clearElapsedTimer()
  if (!processing) return
  const startedAt = Date.now()
  taskElapsedSeconds.value = 0
  elapsedTimer = window.setInterval(() => {
    taskElapsedSeconds.value = Math.floor((Date.now() - startedAt) / 1000)
  }, 1000)
}, { flush: 'sync' })

/** 返回当前阶段的真实进度标签，服务端编码阶段仅显示状态。 */
const serverProgressLabel = computed(() => {
  if (serverPhase.value === 'checking') return '正在准备'
  if (serverPhase.value === 'processing') return '服务端处理中'
  if (serverPhase.value === 'downloading') return progress.value < 0 ? '正在接收结果' : `接收 ${progress.value}%`
  return `上传 ${progress.value}%`
})
/** 能力检查、编码或未知响应长度均不显示伪造百分比。 */
const progressIndeterminate = computed(() => serverPhase.value === 'checking'
  || serverPhase.value === 'processing' || (serverPhase.value === 'downloading' && progress.value < 0))
/** 将阶段说明与实际等待时长合并，便于识别仍在运行的任务。 */
const processingHint = computed(() => `${etaText.value || '正在处理'} · 已用时 ${formatTime(taskElapsedSeconds.value)}`)
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
  engine: 'server' as CompressionEngine,
  serverSpeed: 'fast' as VideoCompressSpeed,
  mode: 'ratio' as CompressMode,
  compressionRatio: 35,
  targetSizeMB: 8,
  customBitrateKbps: 1800,
  keepAudio: true,
  audioBitrateKbps: 128,
  frameRate: 24,
  outputFormat: 'auto' as OutputFormat
})

/** 保留旧输出供检查，但参数变化后手机主操作必须重新压缩，不能把旧文件当作新参数的结果。 */
watch(settings, () => {
  if (resultVideoUrl.value && !isProcessing.value) mobileSettingsChanged.value = true
}, { deep: true })

/** 更换源文件时清除参数变更标记，不继承上一份视频的下载状态。 */
watch(videoFile, () => { mobileSettingsChanged.value = false })

const toolFeatures = [
  '支持多种格式：兼容 MP4、AVI、MOV、MKV、WMV、WebM 等常见视频格式。',
  '专业压缩策略：服务端统一输出 H.264 MP4、AAC 128K，并限制最大 1920 与最高 30fps。',
  '按需选择：默认快速压缩，也可选择标准档争取更小体积；本地模式无需上传。',
  '适配多场景：适用于社交媒体上传、视频存储优化、工作演示、邮件附件分享等场景。'
]

const usageSteps = [
  '上传视频：选择或拖拽视频文件到工具页面。',
  '选择压缩方式：专业模式输出 H.264 MP4，本地模式可自定义比例、目标大小或码率。',
  '开始压缩：点击“开始压缩”按钮并等待处理完成。',
  '下载视频：压缩完成后可直接下载优化后的视频。'
]

const videoCompressExperienceTips = [
  {
    label: '结果验收',
    text: '下载前播放检查首尾、音画同步和关键画面清晰度，确认压缩后仍可交付。'
  },
  {
    label: '失败兜底',
    text: '服务端失败后可重试或手动改用本地模式；本地模式需完整播放视频，请保持页面在前台。'
  },
  {
    label: '会员价值',
    text: '本次结果可直接用于平台上传、社群分享和文件交付；会员账号可按后台策略免积分使用。'
  }
]

const faqList: FaqItem[] = [
  {
    question: '在线压缩视频会影响画质吗？',
    answer: '工具采用码率压缩策略，在减小体积的同时尽可能保留画质。你可按需求调节压缩参数，平衡清晰度与体积。'
  },
  {
    question: '工具支持哪些视频格式？',
    answer: '支持 MP4、AVI、MOV、MKV、WMV、WebM 等常见格式。不同浏览器对个别格式的解码能力可能有差异。'
  },
  {
    question: '在线压缩视频是否安全？',
    answer: '专业模式会将视频临时上传到本站服务器完成 FFmpeg 转码，任务结束后立即清理临时文件；也可切换浏览器本地模式。'
  },
  {
    question: '为什么视频压缩需要等待？',
    answer: '专业模式耗时包括上传、等待和转码，默认快速档优先节省时间，标准档可能得到更小文件。浏览器本地模式需要完整播放视频，通常至少与视频时长相当；体积没有明显下降时直接保留原文件，不会自动重复压缩。'
  },
  {
    question: '是否有文件大小限制？',
    answer: '当前单个视频最大 500MB。更大的视频建议先分段，避免上传超时或浏览器内存不足。'
  }
]

let mediaRecorder: MediaRecorder | null = null
let drawRafId: number | null = null
let activeCanvasStream: MediaStream | null = null
let activeSourceCaptureStream: MediaStream | null = null
let isFinalizingOutput = false
let finalizeFallbackTimer: number | null = null
let lastPlaybackTime = 0
let lastPlaybackUpdateAt = 0
let finalizeStartedAt = 0
const FINALIZE_RETRY_INTERVAL_MS = 12000
const FINALIZE_HARD_TIMEOUT_MS = 180000
const PLAYBACK_STALL_TIMEOUT_MS = 30000
const MAX_COMPAT_RETRY_COUNT = 2
const OUTPUT_SIZE_GUARD_RATIO = 0.98
let compatRetryCount = 0
let outputCompleted = false
let latestOutputMimeType = 'video/webm'
let latestRecordedChunks: Blob[] = []
let serverAbortController: AbortController | null = null
let processingRunId = 0
let compatibilityRetryTimer: number | null = null

/** 判断回调是否属于仍在运行的任务，防止取消、换文件或离开后旧回调写入结果。 */
const isCurrentRun = (runId: number) => runId === processingRunId && !isCancelRequested.value

/** 清理待执行的自动重试，确保取消不会在稍后重新启动录制。 */
const clearCompatibilityRetryTimer = () => {
  if (compatibilityRetryTimer !== null) {
    window.clearTimeout(compatibilityRetryTimer)
    compatibilityRetryTimer = null
  }
}

const sourceSizeMB = computed(() => {
  if (!videoFile.value) return 0
  return videoFile.value.size / 1024 / 1024
})

/**
 * 根据源视频大小选择后台计费策略键；大于阈值的视频交给后台的独立规则处理。
 * @returns 当前视频应使用的工具计费策略键
 */
const getVideoCompressConsumeToolKey = () => {
  return sourceSizeMB.value > LARGE_FILE_THRESHOLD_MB ? 'video-compress-large' : 'video-compress'
}

const sourceBitrateKbps = computed(() => {
  if (!videoFile.value || !sourceMeta.duration) return 0
  return (videoFile.value.size * 8) / sourceMeta.duration / 1000
})

const hasLocalVideoMetadata = computed(() => Number.isFinite(sourceMeta.duration)
  && sourceMeta.duration > 0 && sourceMeta.width > 0 && sourceMeta.height > 0)

const estimatedVideoBitrateKbps = computed(() => {
  return calculateTargetVideoBitrateKbps()
})

const estimatedOutputSizeMB = computed(() => {
  if (!sourceMeta.duration) return 0

  const totalBitrate = estimatedVideoBitrateKbps.value + (settings.keepAudio ? settings.audioBitrateKbps : 0)
  const bytes = (totalBitrate * 1000 * sourceMeta.duration) / 8
  return bytes / 1024 / 1024
})

/**
 * 格式化时长展示
 * @param seconds 秒数
 * @returns mm:ss 字符串
 */
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
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
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 小写扩展名
 */
const getFileExtension = (filename: string) => {
  const parts = filename.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

/**
 * 校验是否为可处理的视频文件
 * @param file 上传文件
 * @returns 是否通过校验
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

  const maxSizeMB = serverConfig.value?.maxSizeMB || DEFAULT_MAX_FILE_SIZE_MB
  if (file.size > maxSizeMB * 1024 * 1024) {
    ElMessage.warning(`视频大小不能超过 ${maxSizeMB}MB`)
    return false
  }

  return true
}

/**
 * 清理已有结果链接
 */
const clearResultUrl = () => {
  if (resultVideoUrl.value) {
    URL.revokeObjectURL(resultVideoUrl.value)
    resultVideoUrl.value = ''
  }
  resultFileSizeMB.value = 0
  resultDownloadName.value = ''
  serverResultCompressed.value = null
  serverElapsedMs.value = 0
}

/**
 * 停止并清理捕获流
 */
const clearCaptureStreams = () => {
  activeCanvasStream?.getTracks().forEach(track => track.stop())
  activeSourceCaptureStream?.getTracks().forEach(track => track.stop())
  activeCanvasStream = null
  activeSourceCaptureStream = null
}

/**
 * 清理封装阶段兜底定时器
 */
const clearFinalizeFallbackTimer = () => {
  if (finalizeFallbackTimer !== null) {
    clearTimeout(finalizeFallbackTimer)
    finalizeFallbackTimer = null
  }
}

/**
 * 为兼容重试强制清理当前录制态
 */
const forceCleanupForRetry = () => {
  clearFinalizeFallbackTimer()

  if (drawRafId !== null) {
    cancelAnimationFrame(drawRafId)
    drawRafId = null
  }

  if (previewVideoRef.value) {
    previewVideoRef.value.pause()
    previewVideoRef.value.onended = null
  }

  if (mediaRecorder) {
    mediaRecorder.ondataavailable = null
    mediaRecorder.onstop = null
    mediaRecorder.onerror = null
    if (mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop()
      } catch (error) {
        console.warn('兼容重试 stop 触发失败', error)
      }
    }
  }

  mediaRecorder = null
  clearCaptureStreams()
  isFinalizingOutput = false
  outputCompleted = false
  latestRecordedChunks = []
}

/**
 * 构建兼容模式重试参数
 * @returns 兼容模式覆盖参数
 */
const buildCompatibilityOverrides = (): CompressRuntimeOverrides => {
  const keepAudio = settings.keepAudio
  const frameRate = Math.min(settings.frameRate, 24)
  const outputFormat: OutputFormat = 'webm'
  const audioBitrateKbps = 96
  const videoBitrateKbps = Math.max(
    240,
    Math.min(
      2000,
      calculateTargetVideoBitrateKbps({
        keepAudio,
        audioBitrateKbps
      })
    )
  )

  return {
    keepAudio,
    frameRate,
    outputFormat,
    videoBitrateKbps,
    audioBitrateKbps,
    preferDirectCapture: true
  }
}

/**
 * 触发兼容模式自动重试
 * @param reason 触发重试的原因
 * @returns 是否已触发重试
 */
const triggerCompatibilityRetry = (reason: string) => {
  if (isCancelRequested.value || compatRetryCount >= MAX_COMPAT_RETRY_COUNT || !videoFile.value) {
    return false
  }

  compatRetryCount += 1
  const retryOverrides = buildCompatibilityOverrides()

  statusText.value = '检测到录制异常，正在切换兼容模式重试...'
  etaText.value = '预计剩余时间：正在重试...'
  errorText.value = ''
  ElMessage.warning('录制异常，正在重试；本地模式需要重新播放视频')
  console.warn(`[VideoCompress] 触发兼容重试：${reason}`, retryOverrides)

  forceCleanupForRetry()
  const runId = processingRunId
  clearCompatibilityRetryTimer()
  compatibilityRetryTimer = window.setTimeout(() => {
    compatibilityRetryTimer = null
    if (isCurrentRun(runId)) void runCompressProcess(retryOverrides, true, runId)
  }, 80)

  return true
}

/**
 * 封装超时后的统一失败处理
 */
const handleFinalizeTimeout = () => {
  if (outputCompleted) {
    return
  }

  if (latestRecordedChunks.length > 0) {
    finalizeOutputFromChunks(true)
    return
  }

  if (triggerCompatibilityRetry('finalize-timeout-no-chunks')) {
    return
  }

  isFinalizingOutput = false
  isProcessing.value = false
  statusText.value = '压缩失败'
  etaText.value = ''
  errorText.value = '封装输出超时，请尝试更短视频或降低参数后重试'
  clearCaptureStreams()
  mediaRecorder = null
  ElMessage.error(errorText.value)
}

/**
 * 安全请求输出数据并尝试停止录制
 */
const requestStopRecorder = () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    return
  }

  try {
    mediaRecorder.requestData()
  } catch (error) {
    console.warn('requestData 触发失败', error)
  }

  try {
    mediaRecorder.stop()
  } catch (error) {
    console.warn('stop 触发失败', error)
  }
}

/**
 * 从已采集分片组装输出文件
 * @param isTimeoutFallback 是否为超时兜底导出
 */
const finalizeOutputFromChunks = (isTimeoutFallback = false) => {
  if (outputCompleted) {
    return
  }

  outputCompleted = true
  clearFinalizeFallbackTimer()

  if (drawRafId !== null) {
    cancelAnimationFrame(drawRafId)
    drawRafId = null
  }

  if (previewVideoRef.value) {
    previewVideoRef.value.pause()
    previewVideoRef.value.onended = null
  }

  if (latestRecordedChunks.length === 0) {
    if (triggerCompatibilityRetry('finalize-empty-chunks')) {
      return
    }

    isFinalizingOutput = false
    isProcessing.value = false
    statusText.value = '压缩失败'
    etaText.value = ''
    errorText.value = '输出文件为空，请尝试更换参数后重试'
    clearCaptureStreams()
    mediaRecorder = null
    ElMessage.error(errorText.value)
    return
  }

  const blob = new Blob(latestRecordedChunks, { type: latestOutputMimeType })
  if (!blob.size) {
    if (triggerCompatibilityRetry('finalize-empty-blob')) {
      return
    }

    isFinalizingOutput = false
    isProcessing.value = false
    statusText.value = '压缩失败'
    etaText.value = ''
    errorText.value = '输出文件为空，请尝试更换参数后重试'
    clearCaptureStreams()
    mediaRecorder = null
    ElMessage.error(errorText.value)
    return
  }

  const keepOriginal = Boolean(videoFile.value && blob.size >= videoFile.value.size * OUTPUT_SIZE_GUARD_RATIO)
  if (keepOriginal) {
    ElMessage.warning('压缩后体积没有明显下降，已自动保留原视频')
  }

  const output = keepOriginal && videoFile.value ? videoFile.value : blob
  if (keepOriginal && videoFile.value) resultFileExt.value = getFileExtension(videoFile.value.name)
  resultVideoUrl.value = URL.createObjectURL(output)
  resultFileSizeMB.value = output.size / 1024 / 1024
  resultDownloadName.value = keepOriginal && videoFile.value
    ? videoFile.value.name
    : `${videoFile.value?.name.replace(/\.[^/.]+$/, '') || 'video'}_compressed.${resultFileExt.value}`
  serverResultCompressed.value = keepOriginal ? false : null
  progress.value = 100
  statusText.value = keepOriginal ? '原视频体积更优，已保留原文件' : '压缩完成'
  etaText.value = '预计剩余时间：约 0 秒'
  isProcessing.value = false
  isFinalizingOutput = false
  compatRetryCount = 0
  clearCaptureStreams()
  mediaRecorder = null
  latestRecordedChunks = []

  if (keepOriginal) {
    return
  } else if (isTimeoutFallback) {
    ElMessage.warning('封装耗时较长，已导出当前可用结果')
  } else {
    ElMessage.success('视频压缩完成')
  }
}

/**
 * 轮询检查封装状态，避免误判大文件封装超时
 */
const scheduleFinalizeMonitor = () => {
  clearFinalizeFallbackTimer()
  finalizeFallbackTimer = window.setTimeout(() => {
    if (!isProcessing.value || !isFinalizingOutput) {
      return
    }

    const elapsed = Date.now() - finalizeStartedAt
    if (elapsed >= FINALIZE_HARD_TIMEOUT_MS) {
      handleFinalizeTimeout()
      return
    }

    statusText.value = '正在封装输出文件（大文件可能需要更久）...'
    etaText.value = '预计剩余时间：正在封装...'
    requestStopRecorder()
    scheduleFinalizeMonitor()
  }, FINALIZE_RETRY_INTERVAL_MS)
}

/**
 * 停止当前压缩任务
 */
const stopCurrentProcessing = () => {
  processingRunId += 1
  serverPhase.value = 'idle'
  clearElapsedTimer()
  clearCompatibilityRetryTimer()
  if (serverAbortController) {
    serverAbortController.abort()
    serverAbortController = null
  }

  if (drawRafId !== null) {
    cancelAnimationFrame(drawRafId)
    drawRafId = null
  }

  if (previewVideoRef.value) {
    previewVideoRef.value.pause()
    previewVideoRef.value.onended = null
  }

  if (mediaRecorder) {
    mediaRecorder.ondataavailable = null
    mediaRecorder.onstop = null
    mediaRecorder.onerror = null
    if (mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop()
      } catch {
        // 录制器可能已被浏览器关闭，仍需继续释放捕获流。
      }
    }
  }
  clearCaptureStreams()

  mediaRecorder = null
  isProcessing.value = false
  isFinalizingOutput = false
  compatRetryCount = 0
  outputCompleted = false
  latestRecordedChunks = []
  clearFinalizeFallbackTimer()
}

/**
 * 请求结束录制并进入封装阶段
 */
const finalizeRecording = () => {
  if (!mediaRecorder || mediaRecorder.state === 'inactive' || isFinalizingOutput) {
    return
  }

  isFinalizingOutput = true
  finalizeStartedAt = Date.now()
  progress.value = Math.max(progress.value, 99)
  statusText.value = '正在封装输出文件...'
  etaText.value = '预计剩余时间：正在封装...'
  requestStopRecorder()
  scheduleFinalizeMonitor()
}

/**
 * 取消当前处理任务
 */
const cancelProcessing = () => {
  if (!isProcessing.value) return

  isCancelRequested.value = true
  statusText.value = '已取消处理'
  stopCurrentProcessing()
  etaText.value = ''
  ElMessage.info('已取消当前压缩任务')
}

/**
 * 加载视频文件并重置状态
 * @param file 视频文件
 */
const loadVideoFile = (file: File) => {
  if (!validateVideoFile(file)) return

  isCancelRequested.value = true
  stopCurrentProcessing()

  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }

  videoFile.value = file
  videoUrl.value = URL.createObjectURL(file)
  clearResultUrl()

  sourceMeta.duration = 0
  sourceMeta.width = 0
  sourceMeta.height = 0
  resultMeta.duration = 0
  resultMeta.width = 0
  resultMeta.height = 0

  progress.value = 0
  statusText.value = ''
  etaText.value = ''
  errorText.value = ''
  processStartedAt.value = 0
}

/**
 * 处理文件选择
 * @param event input change 事件
 */
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  loadVideoFile(file)
  if (input.value) input.value = ''
}

/**
 * 处理拖拽上传
 * @param event 拖拽事件
 */
const handleDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  loadVideoFile(file)
}

/**
 * 打开文件选择器，上传其他视频
 */
const triggerSelectVideo = () => {
  fileInput.value?.click()
}

/**
 * 视频元数据加载后初始化参数
 */
const onSourceVideoLoaded = () => {
  const video = previewVideoRef.value
  if (!video || !videoFile.value) return

  sourceMeta.duration = video.duration || 0
  sourceMeta.width = video.videoWidth || 0
  sourceMeta.height = video.videoHeight || 0

  const suggestSize = Math.max(1, sourceSizeMB.value * (1 - settings.compressionRatio / 100))
  settings.targetSizeMB = Number(suggestSize.toFixed(1))
}

/**
 * 结果视频元数据加载回调
 */
const onResultVideoLoaded = () => {
  const video = resultVideoRef.value
  if (!video) return

  resultMeta.duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0
  resultMeta.width = video.videoWidth || 0
  resultMeta.height = video.videoHeight || 0
}

/**
 * 根据模式计算目标视频码率
 * @returns 视频码率（kbps）
 */
const calculateTargetVideoBitrateKbps = (runtime?: { keepAudio?: boolean; audioBitrateKbps?: number }) => {
  const minVideoBitrate = 120
  const runtimeKeepAudio = runtime?.keepAudio ?? settings.keepAudio
  const runtimeAudioBitrateKbps = runtime?.audioBitrateKbps ?? settings.audioBitrateKbps
  const audioBitrate = runtimeKeepAudio ? runtimeAudioBitrateKbps : 0

  if (!sourceMeta.duration || !sourceBitrateKbps.value) {
    return Math.max(minVideoBitrate, settings.customBitrateKbps)
  }

  if (settings.mode === 'ratio') {
    const ratio = Math.min(90, Math.max(5, settings.compressionRatio))
    const totalTarget = sourceBitrateKbps.value * (1 - ratio / 100)
    return Math.max(minVideoBitrate, totalTarget - audioBitrate)
  }

  if (settings.mode === 'target-size') {
    const targetMB = Math.max(1, settings.targetSizeMB)
    const totalTarget = (targetMB * 1024 * 1024 * 8) / sourceMeta.duration / 1000
    return Math.max(minVideoBitrate, totalTarget - audioBitrate)
  }

  return Math.max(minVideoBitrate, settings.customBitrateKbps)
}

/**
 * 选择 MediaRecorder 输出配置
 * @returns 输出 mimeType 与扩展名
 */
const resolveRecorderPreset = (outputFormat: OutputFormat = settings.outputFormat) => {
  const mp4Candidates = ['video/mp4;codecs=h264,aac', 'video/mp4']
  const webmCandidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm'
  ]

  const pick = (list: string[]) => list.find(item => MediaRecorder.isTypeSupported(item))

  if (outputFormat === 'mp4') {
    const mp4MimeType = pick(mp4Candidates)
    if (mp4MimeType) {
      return { mimeType: mp4MimeType, ext: 'mp4' }
    }

    const webmMimeType = pick(webmCandidates)
    if (webmMimeType) {
      ElMessage.warning('当前浏览器不支持 MP4 编码，已自动切换为 WebM 输出')
      return { mimeType: webmMimeType, ext: 'webm' }
    }
  }

  if (outputFormat === 'webm') {
    const webmMimeType = pick(webmCandidates)
    if (webmMimeType) {
      return { mimeType: webmMimeType, ext: 'webm' }
    }
  }

  const autoMimeType = pick([...webmCandidates, ...mp4Candidates])
  if (autoMimeType) {
    return {
      mimeType: autoMimeType,
      ext: autoMimeType.includes('mp4') ? 'mp4' : 'webm'
    }
  }

  throw new Error('当前浏览器不支持视频编码，请更换 Chrome / Edge / Safari 最新版再试')
}

/**
 * 执行视频压缩流程
 * @param runtimeOverrides 运行时覆盖参数
 * @param isAutoRetry 是否为兼容模式自动重试
 */
const runCompressProcess = async (runtimeOverrides: CompressRuntimeOverrides | null = null, isAutoRetry = false, runId = processingRunId) => {
  if (!isCurrentRun(runId)) return
  const sourceVideo = previewVideoRef.value
  if (!sourceVideo || !videoFile.value) {
    ElMessage.warning('请先上传视频文件')
    return
  }

  if (!hasLocalVideoMetadata.value) {
    isProcessing.value = false
    errorText.value = '浏览器尚无法读取此视频，请等待加载完成，或使用专业 H.264 模式重试'
    ElMessage.warning(errorText.value)
    return
  }

  try {
    isCancelRequested.value = false
    isFinalizingOutput = false
    outputCompleted = false
    latestRecordedChunks = []
    isProcessing.value = true
    progress.value = 0
    statusText.value = isAutoRetry ? '正在准备兼容模式重试...' : '正在准备压缩任务...'
    etaText.value = formatEtaText(null)
    errorText.value = ''
    processStartedAt.value = Date.now()
    lastPlaybackTime = 0
    lastPlaybackUpdateAt = performance.now()

    clearResultUrl()

    sourceVideo.pause()
    sourceVideo.playbackRate = 1
    const controller = serverAbortController
    if (!controller) return
    await seekVideoForCompression(sourceVideo, 0, controller.signal)
    if (!isCurrentRun(runId)) return

    const runtimeKeepAudio = runtimeOverrides?.keepAudio ?? settings.keepAudio
    const runtimeFrameRate = runtimeOverrides?.frameRate ?? settings.frameRate
    const runtimeOutputFormat = runtimeOverrides?.outputFormat ?? settings.outputFormat
    const runtimeAudioBitrateKbps = runtimeOverrides?.audioBitrateKbps ?? settings.audioBitrateKbps
    const runtimePreferDirectCapture = runtimeOverrides?.preferDirectCapture ?? false
    const runtimeVideoBitrateKbps = Math.max(
      120,
      Math.round(
        runtimeOverrides?.videoBitrateKbps
          ?? calculateTargetVideoBitrateKbps({
            keepAudio: runtimeKeepAudio,
            audioBitrateKbps: runtimeAudioBitrateKbps
          })
      )
    )

    const sourceCapture = (sourceVideo as any).captureStream?.() || (sourceVideo as any).mozCaptureStream?.()
    activeSourceCaptureStream = sourceCapture || null
    const hasDirectVideoTrack = Boolean(sourceCapture?.getVideoTracks?.().length)
    const audioTracks = sourceCapture?.getAudioTracks?.() || []
    let outputStream: MediaStream
    let drawCtx: CanvasRenderingContext2D | null = null
    let renderModeLabel = '直录'

    if (runtimePreferDirectCapture && hasDirectVideoTrack) {
      const directStream = new MediaStream()
      const videoTrack = sourceCapture!.getVideoTracks()[0]
      directStream.addTrack(videoTrack)

      if (runtimeKeepAudio && audioTracks.length > 0) {
        directStream.addTrack(audioTracks[0])
      }

      outputStream = directStream
      activeCanvasStream = directStream
    } else {
      const canvas = document.createElement('canvas')
      canvas.width = sourceMeta.width
      canvas.height = sourceMeta.height

      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) {
        throw new Error('无法初始化 Canvas 上下文')
      }

      const canvasStream = canvas.captureStream(runtimeFrameRate)
      if (runtimeKeepAudio && audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0])
      }

      outputStream = canvasStream
      activeCanvasStream = canvasStream
      drawCtx = ctx
      renderModeLabel = 'Canvas'
    }

    const { mimeType, ext } = resolveRecorderPreset(runtimeOutputFormat)
    latestOutputMimeType = mimeType

    const recorderOptions: MediaRecorderOptions = {
      mimeType,
      videoBitsPerSecond: runtimeVideoBitrateKbps * 1000
    }

    if (runtimeKeepAudio && audioTracks.length > 0) {
      recorderOptions.audioBitsPerSecond = Math.round(runtimeAudioBitrateKbps * 1000)
    }

    const chunks: Blob[] = []
    latestRecordedChunks = chunks

    mediaRecorder = new MediaRecorder(outputStream, recorderOptions)
    resultFileExt.value = ext

    mediaRecorder.ondataavailable = (event) => {
      if (!isCurrentRun(runId)) return
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      if (!isCurrentRun(runId)) return
      clearFinalizeFallbackTimer()

      finalizeOutputFromChunks(false)
    }

    mediaRecorder.onerror = (event) => {
      if (!isCurrentRun(runId)) return
      if (triggerCompatibilityRetry('recorder-error')) {
        return
      }

      if (drawRafId !== null) {
        cancelAnimationFrame(drawRafId)
        drawRafId = null
      }
      clearFinalizeFallbackTimer()
      sourceVideo.pause()
      sourceVideo.onended = null
      clearCaptureStreams()

      isProcessing.value = false
      statusText.value = '压缩失败'
      etaText.value = ''
      const message = getFriendlyVideoError((event as any)?.error, '视频压缩失败，请尝试调整参数后重试')
      errorText.value = message
      ElMessage.error(message)
      mediaRecorder = null
      isFinalizingOutput = false
      outputCompleted = false
      latestRecordedChunks = []
    }

    const drawFrame = () => {
      if (!isCurrentRun(runId) || !isProcessing.value || !previewVideoRef.value) return

      if (drawCtx) {
        drawCtx.drawImage(previewVideoRef.value, 0, 0, sourceMeta.width, sourceMeta.height)
      }

      const current = previewVideoRef.value.currentTime
      const currentProgress = Math.min(99, Math.round((current / sourceMeta.duration) * 99))
      progress.value = currentProgress
      updateEtaText(currentProgress)

      const now = performance.now()
      if (current > lastPlaybackTime + 0.001) {
        lastPlaybackTime = current
        lastPlaybackUpdateAt = now
      }
      const stalledMs = now - lastPlaybackUpdateAt

      if (stalledMs >= PLAYBACK_STALL_TIMEOUT_MS) {
        if (triggerCompatibilityRetry('playback-stalled')) return
        forceCleanupForRetry()
        isProcessing.value = false
        statusText.value = '压缩失败'
        etaText.value = ''
        errorText.value = '视频播放长时间中断，请保持视频播放，或使用专业 H.264 模式重试'
        ElMessage.error(errorText.value)
        return
      }

      // 进度四舍五入为 99% 不代表已结束，长视频必须等 ended 才能保留最后几秒。
      if (previewVideoRef.value.ended) {
        finalizeRecording()
        return
      }

      if (!previewVideoRef.value.ended) {
        drawRafId = requestAnimationFrame(drawFrame)
      }
    }

    statusText.value = `正在压缩视频（${renderModeLabel}模式，${runtimeVideoBitrateKbps}kbps）...`
    mediaRecorder.start(500)

    drawRafId = requestAnimationFrame(drawFrame)

    sourceVideo.onended = () => {
      if (isCurrentRun(runId)) finalizeRecording()
    }
    await sourceVideo.play()
  } catch (error) {
    if (!isCurrentRun(runId)) return
    if (triggerCompatibilityRetry('compress-catch-error')) {
      return
    }

    console.error(error)
    clearFinalizeFallbackTimer()
    clearCaptureStreams()
    isProcessing.value = false
    statusText.value = '压缩失败'
    etaText.value = ''
    const message = getFriendlyVideoError(error, '压缩失败，请更换浏览器后重试')
    errorText.value = message
    ElMessage.error(message)
    mediaRecorder = null
    isFinalizingOutput = false
  }
}

/**
 * 函数说明：调用服务端 H.264 压缩，失败后停止并让用户选择是否切换本地。
 * @returns 是否已在服务端完成或被用户取消
 */
const runServerCompressProcess = async (runId: number) => {
  if (!videoFile.value) {
    return false
  }

  const currentFile = videoFile.value
  const speed = settings.serverSpeed
  const controller = serverAbortController
  if (!controller) return true
  const config = await getVideoCompressServerConfig(controller.signal)
  if (!isCurrentRun(runId)) return true
  serverConfig.value = config
  if (!config.available) {
    if (!hasLocalVideoMetadata.value) {
      isProcessing.value = false
      statusText.value = '压缩服务暂不可用'
      errorText.value = '专业压缩服务暂不可用，浏览器也无法读取此视频，请稍后重试或更换为 MP4 视频'
      ElMessage.error(errorText.value)
      return true
    }
    isProcessing.value = false
    statusText.value = '压缩服务暂不可用'
    errorText.value = '专业压缩服务暂不可用，请稍后重试，或改用浏览器本地压缩'
    return true
  }

  isCancelRequested.value = false
  isProcessing.value = true
  progress.value = 0
  serverPhase.value = 'uploading'
  processStartedAt.value = Date.now()
  statusText.value = '正在上传视频...'
  etaText.value = '上传完成后将自动进行 H.264 转码'
  errorText.value = ''
  clearResultUrl()

  try {
    const result = await compressVideoWithServer(currentFile, {
      signal: controller.signal,
      speed,
      onUploadProgress: (uploadProgress) => {
        if (!isCurrentRun(runId) || !isProcessing.value || serverPhase.value === 'downloading') return
        progress.value = uploadProgress
        if (uploadProgress >= 100) {
          serverPhase.value = 'processing'
          statusText.value = '上传完成，服务端正在处理视频...'
          etaText.value = `${speed === 'balanced' ? '标准压缩' : '快速压缩'} · 等待与转码耗时取决于视频长度及服务器负载`
        } else {
          statusText.value = `正在上传视频（${uploadProgress}%）...`
        }
      },
      onDownloadProgress: (downloadProgress) => {
        if (!isCurrentRun(runId) || !isProcessing.value) return
        serverPhase.value = 'downloading'
        progress.value = downloadProgress ?? -1
        statusText.value = '转码完成，正在接收视频...'
        etaText.value = '接收完成后即可预览和下载'
      }
    })

    if (!isCurrentRun(runId)) return true

    resultVideoUrl.value = URL.createObjectURL(result.blob)
    resultFileSizeMB.value = result.outputSize / 1024 / 1024
    resultDownloadName.value = result.fileName
    resultFileExt.value = getFileExtension(result.fileName) || getFileExtension(currentFile.name) || 'mp4'
    serverResultCompressed.value = result.compressed
    serverElapsedMs.value = result.elapsedMs
    progress.value = 100
    statusText.value = result.compressed ? 'H.264 视频压缩完成' : '原视频体积更优，已保留原文件'
    etaText.value = '预计剩余时间：约 0 秒'
    isProcessing.value = false

    if (result.compressed) {
      ElMessage.success('视频已压缩为 H.264 MP4')
    } else {
      ElMessage.warning('压缩后体积没有明显下降，已自动保留原视频')
    }
    return true
  } catch (error) {
    if (!isCurrentRun(runId)) return true
    if (controller.signal.aborted) {
      isProcessing.value = false
      progress.value = 0
      etaText.value = ''
      statusText.value = '已取消处理'
      return true
    }

    console.warn('[VideoCompress] 服务端压缩失败', error)
    isProcessing.value = false
    progress.value = 0
    etaText.value = ''
    if (!hasLocalVideoMetadata.value) {
      statusText.value = '压缩失败'
      errorText.value = '专业压缩失败，浏览器也无法读取此视频，请检查文件是否损坏或稍后重试'
      ElMessage.error(errorText.value)
      return true
    }
    statusText.value = '压缩失败'
    errorText.value = getFriendlyVideoError(error, '专业压缩失败，请稍后重试')
    ElMessage.error(errorText.value)
    return true
  }
}

/** 切换到本地参数，由用户再次开始任务，避免服务失败后无提示地追加整段播放。 */
const switchToLocalCompression = () => {
  if (isProcessing.value || !hasLocalVideoMetadata.value) return
  settings.engine = 'browser'
  serverPhase.value = 'idle'
  errorText.value = ''
}

/**
 * 开始执行视频压缩
 */
const compressVideo = async () => {
  if (isProcessing.value) return
  if (!previewVideoRef.value || !videoFile.value) {
    ElMessage.warning('请先上传视频文件')
    return
  }
  const engine = settings.engine
  if (engine === 'browser' && !hasLocalVideoMetadata.value) {
    ElMessage.warning('视频还在加载中，请稍后再试')
    return
  }

  const runId = ++processingRunId
  isCancelRequested.value = false
  serverAbortController = new AbortController()
  serverPhase.value = engine === 'server' ? 'checking' : 'idle'
  isProcessing.value = true
  statusText.value = '正在检查压缩任务...'
  errorText.value = ''
  progress.value = 0
  etaText.value = ''
  try {
    const canConsume = await ensureToolConsume({
      toolKey: getVideoCompressConsumeToolKey(),
      action: 'compress',
      loginWarningText: '请先登录后再使用视频压缩',
      showConsumeSuccessToast: true
    })
    if (!isCurrentRun(runId)) return
    if (!canConsume) {
      isProcessing.value = false
      return
    }

    if (engine === 'server') {
      const completedByServer = await runServerCompressProcess(runId)
      if (completedByServer) {
        return
      }
    }

    compatRetryCount = 0
    await runCompressProcess(null, false, runId)
  } catch (error) {
    if (!isCurrentRun(runId)) return
    isProcessing.value = false
    errorText.value = getFriendlyVideoError(error, '压缩失败，请稍后重试')
    statusText.value = '压缩失败'
    ElMessage.error(errorText.value)
  }
}

/**
 * 浏览器关闭或刷新时提醒用户处理中任务
 * @param event 浏览器事件
 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!isProcessing.value) {
    return
  }

  event.preventDefault()
  event.returnValue = ''
}

/**
 * 下载压缩后视频
 */
const downloadResult = async () => {
  const currentUrl = resultVideoUrl.value
  const currentFile = videoFile.value
  if (!currentUrl || !currentFile) return
  const currentDownloadName = resultDownloadName.value || `${currentFile.name.replace(/\.[^/.]+$/, '')}_compressed.${resultFileExt.value}`
  const canDownload = await ensureToolConsume({
    toolKey: getVideoCompressConsumeToolKey(),
    action: 'download',
    mode: 'check-login',
    loginWarningText: '请先登录后再下载压缩视频'
  })
  if (!canDownload || currentUrl !== resultVideoUrl.value || currentFile !== videoFile.value) {
    return
  }

  const link = document.createElement('a')
  link.href = currentUrl
  link.download = currentDownloadName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 获取压缩百分比文本
 */
const getCompressionText = () => {
  if (!videoFile.value || !resultVideoUrl.value || resultFileSizeMB.value <= 0) return '-'

  const savedMB = sourceSizeMB.value - resultFileSizeMB.value
  const savedRate = sourceSizeMB.value > 0 ? (savedMB / sourceSizeMB.value) * 100 : 0
  const label = savedMB >= 0 ? '节省' : '增加'

  return `${label} ${Math.abs(savedMB).toFixed(2)}MB（${Math.abs(savedRate).toFixed(1)}%）`
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
      after: resultMeta.duration ? formatTime(resultMeta.duration) : resultVideoUrl.value ? '容器未提供时长' : '-'
    },
    {
      label: '输出编码',
      before: '原始编码',
      after: serverResultCompressed.value === true
        ? 'H.264 + AAC'
        : serverResultCompressed.value === false
          ? '保持原编码'
          : resultVideoUrl.value
            ? `浏览器 ${resultFileExt.value.toUpperCase()}`
            : '-'
    },
    {
      label: '处理耗时',
      before: '-',
      after: serverElapsedMs.value > 0 ? `${(serverElapsedMs.value / 1000).toFixed(1)} 秒` : '-'
    }
  ]
})

onUnmounted(() => {
  isCancelRequested.value = true
  stopCurrentProcessing()
  clearCaptureStreams()
  clearFinalizeFallbackTimer()

  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  clearResultUrl()
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave((to, from, next) => {
  if (!isProcessing.value) {
    next()
    return
  }

  const shouldLeave = window.confirm('视频仍在压缩中，离开页面会中断处理。确定要离开吗？')
  if (!shouldLeave) {
    next(false)
    return
  }

  cancelProcessing()
  next()
})
</script>

<template>
  <div class="video-mobile-page video-compress-page min-h-screen">
    <div class="mx-auto">
      <section class="video-mobile-workspace video-compress-workspace mb-4">
        <VideoWorkspaceIntro heading-tag="h1"
          title="视频压缩"
          description="自动输出兼容性更好的 H.264 MP4，压缩后可直接预览并下载。"
          :specs="[`最大 ${serverConfig?.maxSizeMB || DEFAULT_MAX_FILE_SIZE_MB}MB`, 'H.264 + AAC', '最高 30fps']"
          :notices="['默认快速压缩，标准档可争取更小体积', '专业模式临时上传转码，本地模式无需上传']"
        />

        <template v-if="!videoUrl">
          <input ref="fileInput" type="file" class="hidden" accept="video/*,.mp4,.avi,.mov,.mkv,.wmv,.webm,.m4v" @change="handleFileChange">
          <VideoUploadZone
            title="上传需要压缩的视频"
            formats="支持 MP4、MOV、WebM、AVI、MKV、WMV"
            @select="triggerSelectVideo"
            @drop="handleDrop"
          />
        </template>

        <div v-else class="video-mobile-editor video-compress-editor grid grid-cols-1 lg:grid-cols-12">
          <div class="lg:col-span-4 space-y-6">
            <div class="video-mobile-controls video-compress-controls sticky top-4">
              <div class="video-compress-controls__head">
                <h3>压缩设置</h3>
                <button type="button" :disabled="isProcessing" @click="triggerSelectVideo">更换视频</button>
              </div>

              <div class="video-source-summary">
                <div class="video-source-summary__name flex items-center justify-between text-sm">
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
                <input ref="fileInput" type="file" class="hidden" accept="video/*,.mp4,.avi,.mov,.mkv,.wmv,.webm,.m4v" @change="handleFileChange">
              </div>

              <div class="space-y-4">
                <details class="video-compress-settings" :open="!isMobileViewport">
                  <summary><strong>压缩参数</strong><span>{{ settings.engine === 'server' ? '专业 H.264' : '浏览器本地' }} · 点击调整</span></summary>
                  <div class="video-compress-settings__body space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">压缩方式</label>
                  <el-radio-group v-model="settings.engine" :disabled="isProcessing" class="w-full">
                    <el-radio-button value="server">专业 H.264</el-radio-button>
                    <el-radio-button value="browser">浏览器本地</el-radio-button>
                  </el-radio-group>
                </div>

                <div v-if="settings.engine === 'server'" class="video-server-specs">
                  <div class="video-server-specs__head">
                    <span>专业输出参数</span>
                    <span>串行处理</span>
                  </div>
                  <el-radio-group v-model="settings.serverSpeed" :disabled="isProcessing" aria-label="专业压缩速度" class="mt-3 mb-3">
                    <el-radio-button value="fast">快速压缩</el-radio-button>
                    <el-radio-button value="balanced">标准压缩</el-radio-button>
                  </el-radio-group>
                  <p class="mb-3 text-xs leading-5">{{ settings.serverSpeed === 'fast' ? '优先节省处理时间，文件可能略大。' : '沿用原标准编码，处理更慢，文件可能更小。' }}</p>
                  <div class="video-server-specs__list">
                    <span>H.264 MP4 · CRF {{ serverConfig?.crf || 26 }}</span>
                    <span>最长边 1920 · 最高 30fps</span>
                    <span>AAC 128K · Fast Start</span>
                  </div>
                </div>

                <template v-if="settings.engine === 'browser'">
                <p class="text-xs leading-5 text-slate-600" role="note">本地模式需要完整播放视频{{ hasLocalVideoMetadata ? `，至少需要约 ${formatTime(sourceMeta.duration)}` : '' }}。请保持页面在前台；体积未下降时直接保留原文件，不自动重压。</p>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">压缩模式</label>
                  <el-radio-group v-model="settings.mode" :disabled="isProcessing" class="w-full">
                    <el-radio-button value="ratio">按压缩比例</el-radio-button>
                    <el-radio-button value="target-size">按目标大小</el-radio-button>
                    <el-radio-button value="bitrate">按目标码率</el-radio-button>
                  </el-radio-group>
                </div>

                <div v-if="settings.mode === 'ratio'">
                  <div class="flex justify-between text-sm text-gray-600 mb-2">
                    <span>压缩比例</span>
                    <span>{{ settings.compressionRatio }}%</span>
                  </div>
                  <el-slider v-model="settings.compressionRatio" :min="5" :max="90" :disabled="isProcessing" />
                </div>

                <div v-if="settings.mode === 'target-size'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">目标大小（MB）</label>
                  <el-input-number v-model="settings.targetSizeMB" :min="1" :max="Math.max(2, Number(sourceSizeMB.toFixed(0)))" :step="1" :disabled="isProcessing" class="w-full" />
                </div>

                <div v-if="settings.mode === 'bitrate'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">目标视频码率（kbps）</label>
                  <el-input-number v-model="settings.customBitrateKbps" :min="120" :max="20000" :step="100" :disabled="isProcessing" class="w-full" />
                </div>

                <div class="video-mobile-pair grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">帧率</label>
                    <el-select v-model="settings.frameRate" :disabled="isProcessing" class="w-full">
                      <el-option :value="24" label="24 fps" />
                      <el-option :value="30" label="30 fps" />
                      <el-option :value="60" label="60 fps" />
                    </el-select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
                    <el-select v-model="settings.outputFormat" :disabled="isProcessing" class="w-full">
                      <el-option value="auto" label="自动" />
                      <el-option value="webm" label="WebM" />
                      <el-option value="mp4" label="MP4（实验）" />
                    </el-select>
                  </div>
                </div>

                <div class="flex items-center justify-between rounded-lg bg-white border border-gray-200 p-3">
                  <span class="text-sm text-gray-700">保留音频</span>
                  <el-switch v-model="settings.keepAudio" :disabled="isProcessing" />
                </div>

                <div v-if="settings.keepAudio">
                  <label class="block text-sm font-medium text-gray-700 mb-2">音频码率（kbps）</label>
                  <el-input-number v-model="settings.audioBitrateKbps" :min="64" :max="320" :step="32" :disabled="isProcessing" class="w-full" />
                </div>

                <div class="rounded-lg bg-brand-soft border border-brand-border p-4 text-sm space-y-1">
                  <div class="flex justify-between">
                    <span class="text-brand-hover">预计视频码率</span>
                    <span class="font-semibold text-brand-hover">{{ Math.round(estimatedVideoBitrateKbps) }} kbps</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-brand-hover">预计输出大小</span>
                    <span class="font-semibold text-brand-hover">{{ estimatedOutputSizeMB.toFixed(2) }} MB</span>
                  </div>
                </div>
                </template>
                  </div>
                </details>

                <p v-if="mobileSettingsChanged && resultVideoUrl" class="video-compress-stale" role="status">参数已修改，当前预览仍是上次结果；重新压缩后生效。</p>

                <VideoProcessStatus
                  v-if="isProcessing"
                  :progress="progress"
                  :status-text="statusText"
                  :eta-text="processingHint"
                  :indeterminate="progressIndeterminate"
                  :progress-label="serverPhase !== 'idle' ? serverProgressLabel : undefined"
                  @cancel="cancelProcessing"
                />

                <div v-if="errorText" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  <p>{{ errorText }}</p>
                  <button v-if="settings.engine === 'server' && hasLocalVideoMetadata && !isProcessing"
                    type="button" data-test="use-local-compression" class="mt-2 underline underline-offset-4"
                    @click="switchToLocalCompression">改用浏览器本地压缩</button>
                </div>

                <button
                  class="video-compress-primary"
                  :disabled="isProcessing"
                  @click="compressVideo"
                >
                  <span v-if="!isProcessing">开始压缩</span>
                  <span v-else>压缩中...</span>
                </button>

              </div>
            </div>
          </div>

          <div class="video-compress-output lg:col-span-8 space-y-6">
            <div class="video-compress-preview-tabs" role="group" aria-label="视频预览对比">
              <button type="button" :aria-pressed="mobilePreviewSide === 'original'" @click="mobilePreviewSide = 'original'">原视频</button>
              <button type="button" :aria-pressed="mobilePreviewSide === 'compressed'" :disabled="!resultVideoUrl || isProcessing" @click="mobilePreviewSide = 'compressed'">压缩后</button>
            </div>
            <div class="video-preview-panel" :class="{ 'video-compress-preview--mobile-hidden': mobilePreviewSide !== 'original' }">
              <video
                ref="previewVideoRef"
                :src="videoUrl"
                :controls="!isProcessing"
                playsinline
                aria-label="原视频预览"
                class="w-full max-h-[500px]"
                @loadedmetadata="onSourceVideoLoaded"
              />
            </div>

            <div v-if="resultVideoUrl" class="video-result-panel animate-fade-in">
              <div class="flex flex-col gap-5">
                <div class="video-compress-result-heading flex items-center justify-between gap-3 flex-wrap">
                  <div class="video-mobile-actions flex items-center gap-2">
                    <h3 class="text-xl font-bold text-gray-800">压缩完成</h3>
                    <span
                      v-if="serverResultCompressed !== null"
                      class="rounded px-2 py-1 text-xs font-medium"
                      :class="serverResultCompressed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                    >{{ serverResultCompressed ? 'H.264 MP4' : '已保留原视频' }}</span>
                  </div>
                  <div class="video-mobile-actions flex items-center gap-2">
                    <button
                      class="inline-flex items-center px-4 py-2 border border-gray-300 hover:border-brand hover:text-brand-hover text-gray-700 font-medium rounded-lg transition-colors"
                      @click="triggerSelectVideo"
                    >
                      上传其他视频
                    </button>
                    <button
                      class="inline-flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      @click="downloadResult"
                    >
                      下载压缩视频
                    </button>
                  </div>
                </div>

                <VideoResultComparison class="video-compress-result-metrics" :metrics="resultComparisonMetrics" :summary="getCompressionText()" />

                <MemberCoreToolTips
                  class="video-compress-result-tips"
                  tool-key="video-compress"
                  eyebrow="完成提醒"
                  title="下载前请检查压缩结果"
                  :items="videoCompressExperienceTips"
                />

                <div class="video-compress-result-preview bg-black rounded-lg overflow-hidden flex items-center justify-center" :class="{ 'video-compress-preview--mobile-hidden': mobilePreviewSide !== 'compressed' }">
                  <video
                    ref="resultVideoRef"
                    :src="resultVideoUrl"
                    controls
                    playsinline
                    aria-label="压缩视频预览"
                    class="w-full max-h-[500px]"
                    @loadedmetadata="onResultVideoLoaded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <details class="video-compress-guide mb-4" :open="!isMobileViewport">
        <summary class="video-compress-guide__summary">使用指南与常见问题 <span aria-hidden="true">⌄</span></summary>
        <div class="video-guide-intro">
          <h3>关于视频压缩</h3>
          <p>
            支持在线压缩 MP4、AVI、MOV、MKV 等常见视频。专业模式通过 FFmpeg 输出 H.264 MP4，
            在最大 1920 范围内保持原始比例，适合平台上传、文件共享和存储优化。
          </p>
        </div>

        <div class="video-guide-grid">
          <div>
            <h4>使用步骤</h4>
            <ol>
              <li v-for="step in usageSteps" :key="step">{{ step }}</li>
            </ol>
          </div>
          <div>
            <h4>输出与兼容</h4>
            <ul>
              <li v-for="item in toolFeatures" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div class="video-guide-faq">
          <h4>常见问题</h4>
          <details v-for="faq in faqList" :key="faq.question">
            <summary>{{ faq.question }}</summary>
            <p>{{ faq.answer }}</p>
          </details>
        </div>
      </details>

      <MobileToolActions v-if="videoFile"
        aria-label="视频压缩操作"
        :title="isProcessing ? '正在压缩视频' : mobileSettingsChanged && resultVideoUrl ? '参数已修改' : resultVideoUrl ? '压缩已完成' : '已选择视频'"
        :description="isProcessing ? `${serverPhase !== 'idle' ? serverProgressLabel : `${Math.round(progress)}%`} · ${statusText}` : resultVideoUrl && !mobileSettingsChanged ? getCompressionText() : '可展开参数调整，预览保留原视频'"
        :action-label="isProcessing ? '压缩中…' : resultVideoUrl && !mobileSettingsChanged ? '下载视频' : mobileSettingsChanged ? '重新压缩' : '开始压缩'"
        :busy="isProcessing" cancel-label="取消"
        @action="resultVideoUrl && !mobileSettingsChanged ? downloadResult() : compressVideo()"
        @cancel="cancelProcessing" />

      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
.video-compress-page {
  --video-border: #e2e8f0;
  --video-muted: #64748b;
  --video-strong: #0f172a;
  --video-primary: var(--uied-color-primary);
  color: var(--video-strong);
}

.video-compress-workspace {
  border: 1px solid var(--video-border);
  border-radius: 8px;
  background: #ffffff;
  padding: 24px;
}

.video-compress-editor {
  gap: 20px;
  margin-top: 20px;
}

.video-compress-controls {
  border: 1px solid var(--video-border);
  border-radius: 8px;
  background: #f8fafc;
  padding: 20px;
}

.video-compress-controls__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.video-compress-controls__head h3 {
  margin: 0;
  color: var(--video-strong);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0;
}

.video-compress-controls__head button {
  border: 0;
  background: transparent;
  color: var(--video-primary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 0;
}

.video-compress-controls__head button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.video-source-summary {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
  border-top: 1px solid var(--video-border);
  border-bottom: 1px solid var(--video-border);
  padding: 14px 0;
}

.video-server-specs {
  border-left: 3px solid var(--uied-color-primary-border);
  background: var(--uied-color-primary-soft);
  padding: 12px 14px;
}

.video-server-specs__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--uied-color-primary-hover);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
}

.video-server-specs__head span:last-child {
  color: var(--uied-color-primary);
  font-weight: 500;
}

.video-server-specs__list {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  color: #475569;
  font-size: 12px;
  line-height: 1.5;
}

.video-compress-primary {
  display: flex;
  width: 100%;
  min-height: 44px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 650;
  transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease;
}

.video-compress-primary {
  border: 1px solid var(--video-primary);
  background: var(--video-primary);
  color: #ffffff;
}

.video-compress-primary:hover {
  border-color: var(--uied-color-primary-hover);
  background: var(--uied-color-primary-hover);
}

.video-compress-primary:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.video-preview-panel {
  display: flex;
  min-height: 320px;
  border: 1px solid #1e293b;
  border-radius: 8px;
  background: #020617;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-compress-settings > summary { display: none; }
.video-compress-preview-tabs { display: none; }
.video-compress-stale { margin: 0; color: var(--uied-color-text-secondary); font-size: 13px; line-height: 1.7; }
.video-compress-guide__summary { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 48px; margin-bottom: 16px; list-style: none; color: var(--uied-color-text); font-size: 16px; font-weight: 600; cursor: pointer; }
.video-compress-guide__summary::-webkit-details-marker { display: none; }
.video-compress-guide:not([open]) > summary { margin-bottom: 0; }
.video-compress-guide[open] > summary span { transform: rotate(180deg); }

.video-result-panel {
  border: 1px solid #bbf7d0;
  border-left: 4px solid #22c55e;
  border-radius: 8px;
  background: #ffffff;
  padding: 22px;
  overflow: hidden;
}

.video-compress-guide {
  border-top: 1px solid var(--video-border);
  background: #ffffff;
  padding: 28px 24px;
}

.video-guide-intro h3,
.video-guide-grid h4,
.video-guide-faq h4 {
  margin: 0;
  color: var(--video-strong);
  letter-spacing: 0;
}

.video-guide-intro h3 {
  font-size: 18px;
  font-weight: 700;
}

.video-guide-intro p {
  max-width: 900px;
  margin: 8px 0 0;
  color: var(--video-muted);
  font-size: 14px;
  line-height: 1.75;
}

.video-guide-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  margin-top: 24px;
  border-top: 1px solid var(--video-border);
  border-bottom: 1px solid var(--video-border);
}

.video-guide-grid > div {
  padding: 20px 22px 20px 0;
}

.video-guide-grid > div + div {
  border-left: 1px solid var(--video-border);
  padding-right: 0;
  padding-left: 22px;
}

.video-guide-grid h4,
.video-guide-faq h4 {
  font-size: 15px;
  font-weight: 700;
}

.video-guide-grid ol,
.video-guide-grid ul {
  display: grid;
  gap: 8px;
  margin: 12px 0 0;
  padding-left: 20px;
  color: var(--video-muted);
  font-size: 13px;
  line-height: 1.65;
}

.video-guide-faq {
  margin-top: 24px;
}

.video-guide-faq details {
  border-bottom: 1px solid var(--video-border);
  padding: 12px 0;
}

.video-guide-faq summary {
  color: #334155;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.video-guide-faq details p {
  margin: 8px 0 0;
  color: var(--video-muted);
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 900px) {
  .video-compress-controls {
    position: static;
  }
}

@media (max-width: 640px) {
  .video-compress-settings { border-top: 1px solid var(--uied-color-border); }
  .video-compress-settings > summary { display: grid; gap: 4px; min-height: 64px; padding: 12px 0; list-style: none; cursor: pointer; }
  .video-compress-settings > summary::-webkit-details-marker { display: none; }
  .video-compress-settings > summary strong { font-size: 15px; }
  .video-compress-settings > summary span { color: var(--uied-color-text-secondary); font-size: 13px; }
  .video-compress-settings__body { padding-top: 16px; }
  .video-compress-settings__body > * + * { margin-top: 24px; }
  .video-compress-primary { display: none; }
  .video-source-summary { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 0; border-bottom: 0; }
  .video-source-summary > div { flex-direction: column; align-items: flex-start; gap: 4px; min-width: 0; font-size: 13px; }
  .video-source-summary__name { grid-column: 1 / -1; }
  .video-source-summary__name > span:last-child { max-width: 100%; text-align: left; white-space: normal; overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
  .video-compress-output { display: grid; gap: 16px; }
  .video-compress-output > * { margin-top: 0 !important; }
  .video-compress-preview-tabs { display: grid; order: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; padding: 4px; border-radius: 8px; background: var(--uied-color-page); }
  .video-compress-preview-tabs button { min-height: 44px; border: 1px solid transparent; border-radius: 6px; color: var(--uied-color-text-secondary); background: transparent; font-size: 14px; cursor: pointer; }
  .video-compress-preview-tabs button[aria-pressed='true'] { border-color: var(--uied-color-border); background: var(--uied-color-surface); color: var(--uied-color-primary); font-weight: 600; }
  .video-compress-preview-tabs button:disabled { opacity: .5; cursor: not-allowed; }
  .video-preview-panel, .video-compress-result-preview { order: 1; min-height: 200px; }
  .video-preview-panel video, .video-compress-result-preview video { min-height: 200px; max-height: 320px; background: #020617; }
  .video-compress-output > .video-result-panel,
  .video-compress-output > .video-result-panel > .flex { display: contents; }
  .video-compress-result-heading { order: 2; }
  .video-compress-result-heading .video-mobile-actions:last-child { display: none; }
  .video-compress-result-metrics { order: 3; }
  .video-compress-result-tips { order: 4; }
  .video-compress-preview--mobile-hidden { display: none !important; }
  .video-compress-workspace {
    padding: 16px;
  }

  .video-compress-controls,
  .video-result-panel {
    padding: 16px;
  }

  .video-preview-panel {
    min-height: 220px;
  }

  .video-compress-guide {
    padding: 22px 16px;
  }

  .video-guide-grid {
    grid-template-columns: 1fr;
  }

  .video-guide-grid > div,
  .video-guide-grid > div + div {
    border-left: 0;
    padding: 18px 0;
  }

  .video-guide-grid > div + div {
    border-top: 1px solid var(--video-border);
  }
}

@container video-mobile (max-width: 600px) {
  .video-compress-controls,
  .video-result-panel {
    padding: 16px 12px;
  }

  .video-compress-controls__head button,
  .video-guide-faq summary {
    min-height: 44px;
    align-content: center;
  }

  .video-server-specs__head {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 6px;
  }

  .video-source-summary .truncate {
    max-width: 100%;
    white-space: normal;
    overflow-wrap: anywhere;
  }
}
</style>

<style scoped src="../Shared/videoMobile.css"></style>
