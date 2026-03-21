<!--
 * @file VideoCompress.vue
 * @description 在线视频压缩工具，支持在不改变分辨率的前提下压缩视频体积
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
import FollowWechatVerifyDialog from '@/components/Common/FollowWechatVerifyDialog.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import VideoToolNotice from '@/components/Tools/Video/Shared/VideoToolNotice.vue'
import VideoProcessStatus from '@/components/Tools/Video/Shared/VideoProcessStatus.vue'
import VideoResultComparison from '@/components/Tools/Video/Shared/VideoResultComparison.vue'
import { wechatVerifyConfig } from '@/utils/verify'
import { estimateRemainingSeconds, formatEtaText, getFriendlyVideoError } from '@/utils/videoToolFeedback'

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

const fileInput = ref<HTMLInputElement | null>(null)
const previewVideoRef = ref<HTMLVideoElement | null>(null)
const resultVideoRef = ref<HTMLVideoElement | null>(null)

const videoFile = ref<File | null>(null)
const videoUrl = ref('')
const resultVideoUrl = ref('')
const resultFileExt = ref('webm')
const resultFileSizeMB = ref(0)

const isProcessing = ref(false)
const isDragOver = ref(false)
const progress = ref(0)
const statusText = ref('')
const etaText = ref('')
const errorText = ref('')
const processStartedAt = ref(0)
const isCancelRequested = ref(false)
const usageCount = ref(Number(localStorage.getItem('video_compress_usage_count')) || 0)
const isVerified = ref(Boolean(localStorage.getItem('video_compress_verified')))
const showVerifyDialog = ref(false)
const maxFreeUsage = ref(3)
const expectedPassword = wechatVerifyConfig.password
const verifyTips = [
  `当前工具免费可用 ${maxFreeUsage.value} 次，已达到上限。`,
  '请关注我们的公众号并回复“密码”获取验证密码。',
  '验证后可继续免费使用。'
]

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
  mode: 'ratio' as CompressMode,
  compressionRatio: 35,
  targetSizeMB: 8,
  customBitrateKbps: 1800,
  keepAudio: true,
  audioBitrateKbps: 128,
  frameRate: 24,
  outputFormat: 'auto' as OutputFormat
})

const toolFeatures = [
  '支持多种格式：兼容 MP4、AVI、MOV、MKV、WMV、WebM 等常见视频格式。',
  '智能压缩策略：在不降低分辨率的前提下，优先通过码率优化减小文件体积。',
  '无需安装软件：直接在浏览器中处理，不依赖本地安装程序。',
  '适配多场景：适用于社交媒体上传、视频存储优化、工作演示、邮件附件分享等场景。'
]

const usageSteps = [
  '上传视频：选择或拖拽视频文件到工具页面。',
  '设置压缩参数：可选择压缩比例、目标大小或自定义码率。',
  '开始压缩：点击“开始压缩”按钮并等待处理完成。',
  '下载视频：压缩完成后可直接下载优化后的视频。'
]

const whyChoose = [
  '免安装：无需下载软件，即开即用。',
  '高效安全：所有任务在浏览器本地处理，保护用户隐私。',
  '跨设备支持：兼容 Windows、Mac、iOS、Android 的现代浏览器。'
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
    answer: '是的，处理在浏览器本地进行，不会上传到服务器。关闭页面后，本地生成的临时链接也会失效。'
  },
  {
    question: '是否有文件大小限制？',
    answer: '理论上支持大文件，但浏览器内存和设备性能会影响体验。超大文件建议分段处理或提高压缩比例。'
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
const MAX_COMPAT_RETRY_COUNT = 2
const OUTPUT_SIZE_GUARD_RATIO = 0.98
let compatRetryCount = 0
let outputCompleted = false
let latestOutputMimeType = 'video/webm'
let latestRecordedChunks: Blob[] = []
let activeVideoBitrateKbps = 0
let activeAudioBitrateKbps = 0
let activeKeepAudio = true
let activeFrameRate = 24

const sourceSizeMB = computed(() => {
  if (!videoFile.value) return 0
  return videoFile.value.size / 1024 / 1024
})

const sourceBitrateKbps = computed(() => {
  if (!videoFile.value || !sourceMeta.duration) return 0
  return (videoFile.value.size * 8) / sourceMeta.duration / 1000
})

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

  const maxSizeMB = 1024
  if (file.size > maxSizeMB * 1024 * 1024) {
    ElMessage.warning(`当前版本建议单次处理不超过 ${maxSizeMB}MB`) 
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
  isProcessing.value = false
  outputCompleted = false
  latestRecordedChunks = []
}

/**
 * 构建兼容模式重试参数
 * @returns 兼容模式覆盖参数
 */
const buildCompatibilityOverrides = (): CompressRuntimeOverrides => {
  const keepAudio = false
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
 * 构建体积未下降时的二次压缩参数
 * @returns 更激进的压缩参数
 */
const buildSmallerSizeRetryOverrides = (): CompressRuntimeOverrides => {
  const estimatedSourceTotal = sourceBitrateKbps.value || activeVideoBitrateKbps + (activeKeepAudio ? activeAudioBitrateKbps : 0)
  const estimatedSourceVideo = Math.max(180, estimatedSourceTotal - (activeKeepAudio ? activeAudioBitrateKbps : 0))
  const reducedVideoBitrate = Math.max(160, Math.floor(Math.min(activeVideoBitrateKbps * 0.58, estimatedSourceVideo * 0.62)))
  const reducedAudioBitrate = Math.min(activeAudioBitrateKbps || settings.audioBitrateKbps, 96)

  return {
    keepAudio: false,
    frameRate: Math.min(activeFrameRate || settings.frameRate, 24),
    outputFormat: 'webm',
    videoBitrateKbps: reducedVideoBitrate,
    audioBitrateKbps: reducedAudioBitrate,
    preferDirectCapture: false
  }
}

/**
 * 触发兼容模式自动重试
 * @param reason 触发重试的原因
 * @returns 是否已触发重试
 */
const triggerCompatibilityRetry = (reason: string, customOverrides?: CompressRuntimeOverrides) => {
  if (isCancelRequested.value || compatRetryCount >= MAX_COMPAT_RETRY_COUNT || !videoFile.value) {
    return false
  }

  compatRetryCount += 1
  const retryOverrides = customOverrides || buildCompatibilityOverrides()

  statusText.value = reason === 'output-size-not-reduced'
    ? '检测到体积未下降，正在自动优化压缩参数重试...'
    : '检测到封装异常，正在切换兼容模式自动重试...'
  etaText.value = '预计剩余时间：正在重试...'
  errorText.value = ''
  ElMessage.warning(
    reason === 'output-size-not-reduced'
      ? '检测到压缩后体积未下降，已自动优化参数重试'
      : '检测到封装异常，已自动切换兼容模式重试'
  )
  console.warn(`[VideoCompress] 触发兼容重试：${reason}`, retryOverrides)

  forceCleanupForRetry()
  window.setTimeout(() => {
    void runCompressProcess(retryOverrides, true)
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

  if (videoFile.value && blob.size >= videoFile.value.size * OUTPUT_SIZE_GUARD_RATIO) {
    if (triggerCompatibilityRetry('output-size-not-reduced', buildSmallerSizeRetryOverrides())) {
      return
    }

    ElMessage.warning('当前参数下压缩体积未明显下降，建议提高压缩比例或关闭保留音频后再试')
  }

  resultVideoUrl.value = URL.createObjectURL(blob)
  resultFileSizeMB.value = blob.size / 1024 / 1024
  progress.value = 100
  statusText.value = '压缩完成'
  etaText.value = '预计剩余时间：约 0 秒'
  isProcessing.value = false
  isFinalizingOutput = false
  compatRetryCount = 0
  clearCaptureStreams()
  mediaRecorder = null

  if (isTimeoutFallback) {
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
    clearCaptureStreams()
  }

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
  isDragOver.value = false
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

  resultMeta.duration = video.duration || 0
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
 * 等待视频定位完成
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
 * 执行视频压缩流程
 * @param runtimeOverrides 运行时覆盖参数
 * @param isAutoRetry 是否为兼容模式自动重试
 */
const runCompressProcess = async (runtimeOverrides: CompressRuntimeOverrides | null = null, isAutoRetry = false) => {
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

    if (!isAutoRetry && !isVerified.value) {
      usageCount.value++
      localStorage.setItem('video_compress_usage_count', usageCount.value.toString())
    }

    clearResultUrl()

    sourceVideo.pause()
    await seekVideo(sourceVideo, 0)

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
    activeVideoBitrateKbps = runtimeVideoBitrateKbps
    activeAudioBitrateKbps = runtimeAudioBitrateKbps
    activeKeepAudio = runtimeKeepAudio
    activeFrameRate = runtimeFrameRate

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
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      clearFinalizeFallbackTimer()

      if (isCancelRequested.value) {
        isCancelRequested.value = false
        progress.value = 0
        statusText.value = '已取消处理'
        etaText.value = ''
        mediaRecorder = null
        isFinalizingOutput = false
        outputCompleted = false
        latestRecordedChunks = []
        clearCaptureStreams()
        return
      }
      finalizeOutputFromChunks(false)
    }

    mediaRecorder.onerror = (event) => {
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
      if (!isProcessing.value || !previewVideoRef.value) return

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

      const reachedTailByProgress = currentProgress >= 99
      const reachedTailByTime = sourceMeta.duration > 0 && current >= sourceMeta.duration - 0.08
      const severeTailStall = currentProgress >= 98 && stalledMs >= 12000

      if (reachedTailByProgress || reachedTailByTime || severeTailStall) {
        finalizeRecording()
        return
      }

      if (!previewVideoRef.value.ended) {
        drawRafId = requestAnimationFrame(drawFrame)
      }
    }

    statusText.value = `正在压缩视频（${renderModeLabel}模式，${activeVideoBitrateKbps}kbps）...`
    mediaRecorder.start(500)

    drawRafId = requestAnimationFrame(drawFrame)

    await sourceVideo.play()

    sourceVideo.onended = () => {
      finalizeRecording()
    }
  } catch (error) {
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
 * 开始执行视频压缩
 */
const compressVideo = async () => {
  if (!isVerified.value && usageCount.value >= maxFreeUsage.value) {
    showVerifyDialog.value = true
    return
  }

  compatRetryCount = 0
  await runCompressProcess(null, false)
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
const downloadResult = () => {
  if (!resultVideoUrl.value || !videoFile.value) return

  const originalName = videoFile.value.name.replace(/\.[^/.]+$/, '')
  const link = document.createElement('a')
  link.href = resultVideoUrl.value
  link.download = `${originalName}_compressed.${resultFileExt.value}`
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
 * 处理公众号密码验证
 * @param password 用户输入的验证密码
 */
const handleVerify = (password: string) => {
  if (password.trim().toLowerCase() === expectedPassword) {
    isVerified.value = true
    localStorage.setItem('video_compress_verified', 'true')
    showVerifyDialog.value = false
    ElMessage.success('验证成功，您可以继续使用了')
  } else {
    ElMessage.error('密码错误，请关注公众号获取正确的密码')
  }
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
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4">
        <div class="text-center mb-6">
          <h2 class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
            免费在线视频压缩工具
          </h2>
          <p class="text-gray-500 text-sm sm:text-base max-w-3xl mx-auto">
            在线压缩 MP4、AVI、MOV、MKV 等视频格式，压缩视频大小、减小视频体积、提升上传速度，并尽量保持原始分辨率。
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
          <input ref="fileInput" type="file" class="hidden" accept="video/*,.mp4,.avi,.mov,.mkv,.wmv,.webm,.m4v" @change="handleFileChange">
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
              <h3 class="text-lg font-semibold text-gray-800 mb-6">压缩参数</h3>

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
                <button class="text-xs text-indigo-600 hover:text-indigo-800" @click="triggerSelectVideo">
                  上传其他视频
                </button>
                <input ref="fileInput" type="file" class="hidden" accept="video/*,.mp4,.avi,.mov,.mkv,.wmv,.webm,.m4v" @change="handleFileChange">
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">压缩模式</label>
                  <el-radio-group v-model="settings.mode" class="w-full">
                    <el-radio-button label="ratio">按压缩比例</el-radio-button>
                    <el-radio-button label="target-size">按目标大小</el-radio-button>
                    <el-radio-button label="bitrate">按目标码率</el-radio-button>
                  </el-radio-group>
                </div>

                <div v-if="settings.mode === 'ratio'">
                  <div class="flex justify-between text-sm text-gray-600 mb-2">
                    <span>压缩比例</span>
                    <span>{{ settings.compressionRatio }}%</span>
                  </div>
                  <el-slider v-model="settings.compressionRatio" :min="5" :max="90" />
                </div>

                <div v-if="settings.mode === 'target-size'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">目标大小（MB）</label>
                  <el-input-number v-model="settings.targetSizeMB" :min="1" :max="Math.max(2, Number(sourceSizeMB.toFixed(0)))" :step="1" class="w-full" />
                </div>

                <div v-if="settings.mode === 'bitrate'">
                  <label class="block text-sm font-medium text-gray-700 mb-2">目标视频码率（kbps）</label>
                  <el-input-number v-model="settings.customBitrateKbps" :min="120" :max="20000" :step="100" class="w-full" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">帧率</label>
                    <el-select v-model="settings.frameRate" class="w-full">
                      <el-option :value="24" label="24 fps" />
                      <el-option :value="30" label="30 fps" />
                      <el-option :value="60" label="60 fps" />
                    </el-select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">输出格式</label>
                    <el-select v-model="settings.outputFormat" class="w-full">
                      <el-option value="auto" label="自动" />
                      <el-option value="webm" label="WebM" />
                      <el-option value="mp4" label="MP4（实验）" />
                    </el-select>
                  </div>
                </div>

                <div class="flex items-center justify-between rounded-lg bg-white border border-gray-200 p-3">
                  <span class="text-sm text-gray-700">保留音频</span>
                  <el-switch v-model="settings.keepAudio" />
                </div>

                <div v-if="settings.keepAudio">
                  <label class="block text-sm font-medium text-gray-700 mb-2">音频码率（kbps）</label>
                  <el-input-number v-model="settings.audioBitrateKbps" :min="64" :max="320" :step="32" class="w-full" />
                </div>

                <div class="rounded-lg bg-indigo-50 border border-indigo-100 p-4 text-sm space-y-1">
                  <div class="flex justify-between">
                    <span class="text-indigo-700">预计视频码率</span>
                    <span class="font-semibold text-indigo-900">{{ Math.round(estimatedVideoBitrateKbps) }} kbps</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-indigo-700">预计输出大小</span>
                    <span class="font-semibold text-indigo-900">{{ estimatedOutputSizeMB.toFixed(2) }} MB</span>
                  </div>
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
                  @click="compressVideo"
                >
                  <span v-if="!isProcessing">开始压缩</span>
                  <span v-else>压缩中...</span>
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
                  <h3 class="text-xl font-bold text-gray-800">压缩完成</h3>
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
                      下载压缩视频
                    </button>
                  </div>
                </div>

                <VideoResultComparison :metrics="resultComparisonMetrics" :summary="getCompressionText()" />

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

      <div class="bg-white rounded-xl p-8 mb-4 space-y-7">
        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">什么是在线视频压缩工具？</h3>
          <p class="text-gray-600 leading-7">
            在线视频压缩工具是一款可在线压缩 MP4、AVI、MOV、MKV 等视频格式的工具，
            可在不降低分辨率的前提下缩小视频文件大小。无需下载软件，即可快速压缩，
            适用于社交媒体上传、视频存储优化、工作演示、文件共享等多种场景。
          </p>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">在线视频压缩工具的特点</h3>
          <ul class="list-disc pl-5 text-gray-600 space-y-2 leading-7">
            <li v-for="item in toolFeatures" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">如何使用在线视频压缩工具？</h3>
          <ol class="list-decimal pl-5 text-gray-600 space-y-2 leading-7">
            <li v-for="step in usageSteps" :key="step">{{ step }}</li>
          </ol>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">为什么选择我们的在线视频压缩工具？</h3>
          <ul class="list-disc pl-5 text-gray-600 space-y-2 leading-7">
            <li v-for="item in whyChoose" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold text-gray-900 mb-3">视频压缩常见问答（FAQ）</h3>
          <div class="space-y-4">
            <article v-for="faq in faqList" :key="faq.question" class="rounded-lg border border-gray-200 p-4">
              <h4 class="font-semibold text-gray-900 mb-1">{{ faq.question }}</h4>
              <p class="text-gray-600 leading-7">{{ faq.answer }}</p>
            </article>
          </div>
        </section>
      </div>

      <ToolsRecommend :currentPath="route.path" />
      <FollowWechatVerifyDialog v-model="showVerifyDialog" :tips="verifyTips" @confirm="handleVerify" />
    </div>
  </div>
</template>
