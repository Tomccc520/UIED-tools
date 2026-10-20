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
import { useMediaQuery } from '@vueuse/core'
import MobileToolActions from '@/components/Common/MobileToolActions.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import VideoProcessStatus from '@/components/Tools/Video/Shared/VideoProcessStatus.vue'
import VideoResultComparison from '@/components/Tools/Video/Shared/VideoResultComparison.vue'
import VideoUploadZone from '@/components/Tools/Video/Shared/VideoUploadZone.vue'
import VideoWorkspaceIntro from '@/components/Tools/Video/Shared/VideoWorkspaceIntro.vue'
import { ensureGifRuntime } from '@/utils/toolRuntimeLoaders'
import { estimateRemainingSeconds, formatEtaText, getFriendlyVideoError } from '@/utils/videoToolFeedback'
import { useToolConsume } from '@/composables/useToolConsume'
import { runVideoGifJob, type VideoGifSettings } from './videoToGifJob'
import { videoGifNumberAria as vGifNumberAria } from './numberInputAria'

const route = useRoute()
const { ensureToolConsume } = useToolConsume()

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
const isLoadingVideo = ref(false)
const isVideoReady = ref(false)
const resultSettings = ref<VideoGifSettings | null>(null)
const isMobileViewport = useMediaQuery('(max-width: 640px)')
const mobileSettingsExpanded = ref(false)
const mobileGuideExpanded = ref(false)
const mobileResultDetailsExpanded = ref(false)
const mobileRecommendationsExpanded = ref(false)
const mobilePreviewSide = ref<'original' | 'gif'>('original')
const isCheckingDownload = ref(false)
let downloadVersion = 0
let disposed = false
let taskVersion = 0
let activeController: AbortController | null = null
let metadataTimeout: ReturnType<typeof setTimeout> | null = null

const MAX_GIF_SOURCE_SIZE_MB = 200
const MAX_GIF_CLIP_SECONDS = 30
const MAX_GIF_FRAMES = 450
const MAX_GIF_PIXEL_WORKLOAD = 80_000_000

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

/**
 * 函数说明：将起止时间映射为范围滑块值，并保证修改后仍保持合法顺序。
 */
const clipRange = computed<[number, number]>({
  get: (): [number, number] => [settings.startTime, settings.endTime],
  set: ([startTime, endTime]) => {
    settings.startTime = Math.max(0, Number(startTime || 0))
    settings.endTime = Math.max(settings.startTime, Number(endTime || 0))
  }
})

const estimatedFrameCount = computed(() => {
  return Math.max(1, Math.ceil(clipDuration.value * settings.fps))
})

const estimatedPixelWorkload = computed(() => {
  return Math.max(0, settings.width * settings.height * estimatedFrameCount.value)
})

const outputResolutionText = computed(() => {
  return settings.width && settings.height ? `${settings.width} × ${settings.height}` : '-'
})

/** 判断当前设置是否与已生成结果一致，修改参数后手机主操作转为重新生成。 */
const hasCurrentGifResult = computed(() => Boolean(gifUrl.value && resultSettings.value
  && (Object.keys(settings) as (keyof VideoGifSettings)[]).every((key) => settings[key] === resultSettings.value![key])))

/** 汇总可展开的输出参数，手机折叠时仍能确认尺寸、帧率与速度。 */
const mobileSettingsSummary = computed(() => `${outputResolutionText.value} · ${settings.fps} 帧/秒 · ${settings.speed} 倍速`)

/** 提供底部主操作状态，生成结果与修改中的设置明确区分。 */
const mobileAction = computed(() => {
  if (isCheckingDownload.value) return { title: '正在确认下载权限', description: '可取消本次下载', label: '准备下载…' }
  if (isProcessing.value) return { title: `正在生成 ${progress.value}%`, description: statusText.value, label: '正在生成…' }
  if (isLoadingVideo.value) return { title: '正在读取视频', description: '读取完成后即可选择片段', label: '生成 GIF' }
  if (hasCurrentGifResult.value) return { title: 'GIF 已生成', description: `${resultGifSizeMB.value.toFixed(2)} MB · ${resultSettings.value!.width} × ${resultSettings.value!.height}`, label: '下载 GIF' }
  return {
    title: gifUrl.value ? '设置已更新' : '已选择视频片段',
    description: `${clipDuration.value.toFixed(1)} 秒片段 · ${settings.width}px · ${settings.fps} 帧/秒`,
    label: gifUrl.value ? '重新生成 GIF' : '生成 GIF'
  }
})

/**
 * 函数说明：格式化源视频体积，统一用于文件摘要与结果对比。
 */
const sourceSizeText = computed(() => {
  return `${((videoFile.value?.size || 0) / 1024 / 1024).toFixed(2)} MB`
})

const resultComparisonMetrics = computed(() => {
  const resultSizeText = gifUrl.value ? `${resultGifSizeMB.value.toFixed(2)} MB` : '-'

  return [
    {
      label: '文件体积',
      before: sourceSizeText.value,
      after: resultSizeText
    },
    {
      label: '分辨率',
      before: videoMeta.width && videoMeta.height ? `${videoMeta.width} × ${videoMeta.height}` : '-',
      after: resultSettings.value ? `${resultSettings.value.width} × ${resultSettings.value.height}` : '-'
    },
    {
      label: '时长',
      before: `${resultSettings.value ? (resultSettings.value.endTime - resultSettings.value.startTime).toFixed(1) : clipDuration.value.toFixed(1)}s`,
      after: resultSettings.value ? `${((resultSettings.value.endTime - resultSettings.value.startTime) / resultSettings.value.speed).toFixed(1)}s` : '-'
    }
  ]
})

/**
 * 函数说明：校验 GIF 源视频格式和浏览器本地处理文件大小上限。
 */
const validateGifSourceFile = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const supportedExtensions = ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v']
  if (!file.type.startsWith('video/') && !supportedExtensions.includes(extension)) {
    ElMessage.warning('请选择 MP4、MOV、WebM、AVI 或 MKV 视频')
    return false
  }
  if (file.size > MAX_GIF_SOURCE_SIZE_MB * 1024 * 1024) {
    ElMessage.warning(`视频大小不能超过 ${MAX_GIF_SOURCE_SIZE_MB}MB`)
    return false
  }
  return true
}

/**
 * 处理文件选择
 * @param event - 事件对象
 */
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (isProcessing.value) { target.value = ''; return }
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (validateGifSourceFile(file)) {
      loadVideo(file)
    }
  }
  target.value = ''
}

/**
 * 加载视频文件
 * @param file - 视频文件对象
 */
const loadVideo = (file: File) => {
  if (isProcessing.value || disposed) return
  if (metadataTimeout) clearTimeout(metadataTimeout)
  videoRef.value?.pause()
  videoFile.value = file
  downloadVersion++
  isCheckingDownload.value = false
  mobilePreviewSide.value = 'original'
  mobileSettingsExpanded.value = false
  mobileResultDetailsExpanded.value = false
  isVideoReady.value = false
  isLoadingVideo.value = true
  videoMeta.duration = 0
  videoMeta.width = 0
  videoMeta.height = 0
  settings.startTime = 0
  settings.endTime = 0
  settings.height = 0
  resultSettings.value = null
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (gifUrl.value) URL.revokeObjectURL(gifUrl.value)

  videoUrl.value = URL.createObjectURL(file)
  gifUrl.value = ''
  progress.value = 0
  statusText.value = ''
  etaText.value = ''
  errorText.value = ''
  resultGifSizeMB.value = 0
  processStartedAt.value = 0
  metadataTimeout = setTimeout(() => {
    metadataTimeout = null
    if (disposed || isVideoReady.value) return
    isLoadingVideo.value = false
    errorText.value = '视频读取超时，请更换为浏览器支持的 MP4 或 WebM 文件'
  }, 15_000)
}

/**
 * 视频加载完成回调
 * 初始化视频元数据和默认设置
 */
const onVideoLoaded = (event: Event) => {
  const video = event.target as HTMLVideoElement
  if (disposed || isProcessing.value || video !== videoRef.value || (video.currentSrc && video.currentSrc !== videoUrl.value)) return
  if (!Number.isFinite(video.duration) || video.duration <= 0 || video.videoWidth <= 0 || video.videoHeight <= 0) {
    onVideoError(event)
    return
  }
  if (metadataTimeout) clearTimeout(metadataTimeout)
  metadataTimeout = null
  isLoadingVideo.value = false
  isVideoReady.value = true
  errorText.value = ''
  videoMeta.duration = video.duration
  videoMeta.width = video.videoWidth
  videoMeta.height = video.videoHeight
  settings.startTime = 0
  settings.endTime = Math.min(video.duration, 5)
  settings.width = Math.min(videoMeta.width, 480)
  settings.height = Math.max(1, Math.round(settings.width * videoMeta.height / videoMeta.width))
}

/** 视频无法读取时清理旧元数据并给出明确原因，避免带着上一份文件的设置生成。 */
const onVideoError = (event: Event) => {
  const video = event.target as HTMLVideoElement
  if (disposed || video !== videoRef.value || (video.currentSrc && video.currentSrc !== videoUrl.value)) return
  if (metadataTimeout) clearTimeout(metadataTimeout)
  metadataTimeout = null
  isLoadingVideo.value = false
  isVideoReady.value = false
  videoMeta.duration = 0
  videoMeta.width = 0
  videoMeta.height = 0
  activeController?.abort()
  errorText.value = '视频解码失败，请检查文件是否损坏，或更换为浏览器支持的 MP4 / WebM 编码'
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

/** 校验并修正转换参数，拒绝尚未读取、非有限数值或超出片段范围的任务。 */
const normalizeSettings = () => {
  if (!videoRef.value || !isVideoReady.value || isLoadingVideo.value) return false
  if (!Object.values(settings).every(Number.isFinite) || !Number.isFinite(videoMeta.duration) || videoMeta.duration <= 0) return false
  if (settings.startTime < 0 || settings.startTime >= videoMeta.duration || settings.width < 1 || settings.width > 960 || settings.fps < 1 || settings.fps > 30 || settings.speed <= 0 || settings.quality < 1 || settings.quality > 30) return false
  settings.width = Math.round(settings.width)
  settings.fps = Math.round(settings.fps)
  settings.quality = Math.round(settings.quality)
  settings.endTime = Math.min(videoMeta.duration, settings.endTime)
  handleWidthChange()
  return settings.endTime > settings.startTime && settings.height > 0
}

/** 生成 GIF；在权限请求前锁定页面并固定参数，取帧和编码异常统一由当前任务处理。 */
const generateGif = async () => {
  if (isProcessing.value || isCheckingDownload.value || disposed) return
  if (!normalizeSettings()) {
    ElMessage.warning('请先加载视频并设置有效的截取片段')
    return
  }
  if (clipDuration.value > MAX_GIF_CLIP_SECONDS) {
    ElMessage.warning(`单次 GIF 片段请控制在 ${MAX_GIF_CLIP_SECONDS} 秒以内`)
    return
  }
  if (estimatedFrameCount.value > MAX_GIF_FRAMES) {
    ElMessage.warning(`当前预计 ${estimatedFrameCount.value} 帧，请缩短片段或降低帧率至 ${MAX_GIF_FRAMES} 帧以内`)
    return
  }
  if (estimatedPixelWorkload.value > MAX_GIF_PIXEL_WORKLOAD) {
    ElMessage.warning('当前尺寸与帧数占用内存过高，请降低宽度、帧率或片段时长')
    return
  }

  const currentTask = ++taskVersion
  const snapshot = { ...settings }
  const video = videoRef.value!
  const controller = new AbortController()
  activeController = controller
  isProcessing.value = true
  mobilePreviewSide.value = 'original'
  progress.value = 0
  errorText.value = ''
  statusText.value = '正在确认使用权限...'
  etaText.value = formatEtaText(null)

  try {
    const canConsume = await ensureToolConsume({
      toolKey: 'video-to-gif',
      action: 'generate',
      loginWarningText: '请先登录后再使用视频转 GIF',
      showConsumeSuccessToast: true
    })
    if (!canConsume || disposed || currentTask !== taskVersion || controller.signal.aborted) return
    video.pause()
    if (gifUrl.value) URL.revokeObjectURL(gifUrl.value)
    gifUrl.value = ''
    resultSettings.value = null
    resultGifSizeMB.value = 0
    processStartedAt.value = Date.now()
    statusText.value = '准备处理...'
    const { GIF } = await ensureGifRuntime()
    if (disposed || currentTask !== taskVersion || controller.signal.aborted) return
    const GifConstructor = GIF as any
    const encoder = new GifConstructor({
      workers: 2,
      quality: snapshot.quality,
      width: snapshot.width,
      height: snapshot.height,
      workerScript: '/workers/gif.worker.js'
    })
    const blob = await runVideoGifJob({
      video, settings: snapshot, encoder, signal: controller.signal,
      onProgress: (value, message) => {
        if (disposed || currentTask !== taskVersion || controller.signal.aborted) return
        progress.value = value
        statusText.value = message
        updateEtaText(value)
      }
    })
    if (disposed || currentTask !== taskVersion || controller.signal.aborted) return
    gifUrl.value = URL.createObjectURL(blob)
    resultGifSizeMB.value = blob.size / 1024 / 1024
    resultSettings.value = snapshot
    mobilePreviewSide.value = 'gif'
    mobileResultDetailsExpanded.value = false
    progress.value = 100
    etaText.value = '预计剩余时间：约 0 秒'
    statusText.value = '生成完成'
    ElMessage.success('GIF 生成成功')
  } catch (error) {
    if (disposed || currentTask !== taskVersion || controller.signal.aborted) return
    console.error('[视频转 GIF] 处理失败', error instanceof Error ? error.message : '未知错误')
    etaText.value = ''
    const message = getFriendlyVideoError(error, 'GIF 生成失败，请调整参数后重试')
    errorText.value = message
    ElMessage.error(message)
  } finally {
    if (!disposed && currentTask === taskVersion) {
      isProcessing.value = false
      activeController = null
    }
  }
}

/** 取消当前生成任务并失效其异步回调，不再接受旧任务的结果。 */
const cancelProcessing = () => {
  if (!isProcessing.value) return
  taskVersion++
  activeController?.abort()
  activeController = null
  isProcessing.value = false
  statusText.value = '已取消处理'
  progress.value = 0
  etaText.value = ''
  ElMessage.info('已取消当前 GIF 生成任务')
}

/** 下载现有 GIF，保留原权限检查；锁定重复请求并允许取消等待中的下载。 */
const downloadGif = async () => {
  if (!gifUrl.value || isProcessing.value || isCheckingDownload.value || disposed) return
  const resultUrl = gifUrl.value
  const originalName = videoFile.value?.name.replace(/\.[^/.]+$/, '') || 'video'
  const currentDownload = ++downloadVersion
  isCheckingDownload.value = true
  try {
    const canDownload = await ensureToolConsume({
      toolKey: 'video-to-gif',
      action: 'download',
      mode: 'check-login',
      loginWarningText: '请先登录后再下载 GIF'
    })
    if (!canDownload || disposed || currentDownload !== downloadVersion || gifUrl.value !== resultUrl || isProcessing.value) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `${originalName}.gif`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (error) {
    if (disposed || currentDownload !== downloadVersion) return
    console.error('[视频转 GIF] 下载检查失败', error instanceof Error ? error.message : '未知错误')
    ElMessage.error('下载暂时失败，请稍后重试')
  } finally {
    if (currentDownload === downloadVersion) isCheckingDownload.value = false
  }
}

/** 手机固定栏复用既有生成和下载入口，不另建编码或扣费流程。 */
const handleMobileAction = async () => {
  if (hasCurrentGifResult.value) await downloadGif()
  else await generateGif()
}

/** 取消生成沿用任务 Abort；取消下载只忽略待返回的授权结果，避免晚到回调触发下载。 */
const cancelMobileAction = () => {
  if (isProcessing.value) {
    cancelProcessing()
    return
  }
  if (isCheckingDownload.value) {
    downloadVersion++
    isCheckingDownload.value = false
    ElMessage.info('已取消本次下载')
  }
}

/**
 * 拖拽处理
 */
const dropHandler = (ev: DragEvent) => {
  if (isProcessing.value || disposed) return
  const file = ev.dataTransfer?.files?.[0]
  if (file && validateGifSourceFile(file)) {
    loadVideo(file)
  }
}

onUnmounted(() => {
  disposed = true
  taskVersion++
  downloadVersion++
  activeController?.abort()
  activeController = null
  if (metadataTimeout) clearTimeout(metadataTimeout)
  metadataTimeout = null
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (gifUrl.value) URL.revokeObjectURL(gifUrl.value)
})
</script>

<template>
  <div class="video-mobile-page gif-tool-page min-h-screen">
    <div class="mx-auto">
      <section class="video-mobile-workspace gif-workspace mb-4">
        <VideoWorkspaceIntro
          heading-tag="h1"
          title="视频转 GIF"
          description="截取视频片段并导出 GIF，可调整尺寸、帧率和播放速度。"
          :specs="['本地处理', '最长 30 秒', '最多 450 帧']"
          :notices="['视频仅在当前浏览器处理，不会上传服务器', '建议优先使用 480px、10fps 获得更小体积']"
        />

        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept="video/*,.mp4,.mov,.webm,.avi,.mkv,.m4v"
          :disabled="isProcessing"
          @change="handleFileChange"
        >

        <VideoUploadZone
          v-if="!videoUrl"
          title="上传需要转换的视频"
          formats="最大 200MB，建议 MP4 / WebM；其他格式取决于浏览器解码支持"
          @select="fileInput?.click()"
          @drop="dropHandler"
        />

        <div v-else class="video-mobile-editor gif-editor grid grid-cols-1 lg:grid-cols-12">
          <aside class="lg:col-span-4">
            <div class="gif-controls">
              <div class="gif-controls__head">
                <h3>GIF 设置</h3>
                <button type="button" :disabled="isProcessing" @click="fileInput?.click()">更换视频</button>
              </div>

              <dl class="gif-source-summary">
                <div><dt>文件</dt><dd :title="videoFile?.name">{{ videoFile?.name }}</dd></div>
                <div><dt>体积</dt><dd>{{ sourceSizeText }}</dd></div>
                <div><dt>源尺寸</dt><dd>{{ videoMeta.width || '-' }} × {{ videoMeta.height || '-' }}</dd></div>
                <div><dt>时长</dt><dd>{{ formatTime(videoMeta.duration) }}</dd></div>
              </dl>

              <div class="gif-control-section">
                <div class="gif-control-label">
                  <span>截取片段</span>
                  <strong>{{ clipDuration.toFixed(1) }}s</strong>
                </div>
                <el-slider v-model="clipRange" :disabled="isProcessing || !isVideoReady" range :min="0" :max="videoMeta.duration" :step="0.1" />
                <div class="gif-range-inputs">
                  <label class="gif-range-field"><span>开始时间（秒）</span>
                  <el-input-number v-gif-number-aria="{ disabled: isProcessing || !isVideoReady, min: 0, max: settings.endTime }" aria-label="开始时间（秒）" :disabled="isProcessing || !isVideoReady" v-model="settings.startTime" :controls="!isMobileViewport" :min="0" :max="settings.endTime" :step="0.1" size="small" />
                  </label>
                  <label class="gif-range-field"><span>结束时间（秒）</span>
                  <el-input-number v-gif-number-aria="{ disabled: isProcessing || !isVideoReady, min: settings.startTime, max: videoMeta.duration }" aria-label="结束时间（秒）" :disabled="isProcessing || !isVideoReady" v-model="settings.endTime" :controls="!isMobileViewport" :min="settings.startTime" :max="videoMeta.duration" :step="0.1" size="small" />
                  </label>
                </div>
                <p class="gif-clip-hint">源视频 {{ formatTime(videoMeta.duration) }}，单次最多截取 30 秒。</p>
              </div>

              <button type="button" class="gif-mobile-toggle" :aria-expanded="mobileSettingsExpanded" aria-controls="gif-advanced-settings" @click="mobileSettingsExpanded = !mobileSettingsExpanded">
                <strong>更多参数 <span>{{ mobileSettingsExpanded ? '收起' : '展开' }}</span></strong>
                <span>{{ mobileSettingsSummary }}</span>
              </button>
              <div id="gif-advanced-settings" v-show="!isMobileViewport || mobileSettingsExpanded" class="gif-advanced-settings">
                <div class="gif-control-section">
                  <div class="gif-control-label"><span>输出宽度</span><strong>{{ outputResolutionText }}</strong></div>
                  <el-input-number v-gif-number-aria="{ disabled: isProcessing || !isVideoReady, min: 80, max: 960 }" aria-label="输出宽度（像素）" :disabled="isProcessing || !isVideoReady" v-model="settings.width" :controls="!isMobileViewport" :min="80" :max="960" :step="20" @change="handleWidthChange" />
                </div>

                <div class="gif-control-section">
                  <div class="gif-control-label"><span>帧率</span><strong>{{ settings.fps }} FPS</strong></div>
                  <el-slider :disabled="isProcessing || !isVideoReady" v-model="settings.fps" :min="1" :max="30" :step="1" />
                </div>

                <div class="gif-control-section">
                  <div class="gif-control-label"><span>播放速度</span><strong>{{ settings.speed }}x</strong></div>
                  <div class="gif-speed-options">
                    <button
                      v-for="speed in [0.5, 1, 1.5, 2]"
                      :key="speed"
                      type="button"
                      :class="{ 'is-active': settings.speed === speed }"
                      :disabled="isProcessing || !isVideoReady"
                      @click="settings.speed = speed"
                    >
                      {{ speed }}x
                    </button>
                  </div>
                </div>

                <div class="gif-control-section">
                  <div class="gif-control-label"><span>画质</span><strong>{{ settings.quality }}</strong></div>
                  <el-slider :disabled="isProcessing || !isVideoReady" v-model="settings.quality" :min="1" :max="30" :step="1" />
                  <p class="gif-control-hint">数值越小越清晰，处理时间与文件体积也会增加。</p>
                </div>

                <div class="gif-output-estimate">
                  <div><span>输出尺寸</span><strong>{{ outputResolutionText }}</strong></div>
                  <div><span>预计帧数</span><strong>{{ estimatedFrameCount }} 帧</strong></div>
                  <div><span>输出时长</span><strong>{{ outputDuration.toFixed(1) }}s</strong></div>
                </div>

              </div>

              <VideoProcessStatus
                v-if="isProcessing"
                :progress="progress"
                :status-text="statusText"
                :eta-text="etaText"
                @cancel="cancelProcessing"
              />

              <p v-if="isLoadingVideo" class="gif-control-hint" role="status">正在读取视频信息...</p>
              <div v-if="errorText" class="gif-error" role="alert">{{ errorText }}</div>

              <button type="button" class="gif-primary" :disabled="isProcessing || isCheckingDownload || !isVideoReady || isLoadingVideo" @click="generateGif">
                {{ isProcessing ? '正在生成...' : '生成 GIF' }}
              </button>
            </div>
          </aside>

          <div class="gif-preview-column lg:col-span-8">
            <div class="gif-mobile-preview-tabs" role="group" aria-label="预览内容">
              <button type="button" :aria-pressed="mobilePreviewSide === 'original'" @click="mobilePreviewSide = 'original'">原视频</button>
              <button type="button" :aria-pressed="mobilePreviewSide === 'gif'" :disabled="!gifUrl || isProcessing" @click="mobilePreviewSide = 'gif'">生成的 GIF</button>
            </div>
            <div v-show="!isMobileViewport || mobilePreviewSide === 'original'" class="gif-preview-panel">
              <video
                ref="videoRef"
                :src="videoUrl"
                :controls="!isProcessing"
                preload="auto"
                class="gif-preview-video"
                @loadedmetadata="onVideoLoaded"
                @error="onVideoError"
              ></video>
            </div>

            <section v-if="gifUrl" v-show="!isMobileViewport || mobilePreviewSide === 'gif'" class="gif-result-panel animate-fade-in">
              <div class="gif-result-head">
                <div>
                  <span class="gif-result-status">处理完成</span>
                  <h3>GIF 已生成</h3>
                </div>
                <button type="button" class="gif-download" :disabled="isCheckingDownload || isProcessing" @click="downloadGif">下载 GIF</button>
              </div>

              <p v-if="!hasCurrentGifResult" class="gif-control-hint gif-stale-result">参数已修改，当前预览为上次生成的 GIF。</p>
              <button type="button" class="gif-result-details-toggle" :aria-expanded="mobileResultDetailsExpanded" aria-controls="video-gif-result-details" @click="mobileResultDetailsExpanded = !mobileResultDetailsExpanded">结果详情 <span>{{ mobileResultDetailsExpanded ? '收起' : '展开' }}</span></button>
              <div id="video-gif-result-details" v-show="!isMobileViewport || mobileResultDetailsExpanded"><VideoResultComparison :metrics="resultComparisonMetrics" class="mb-4" /></div>

              <div class="gif-result-preview">
                <img :src="gifUrl" alt="生成后的 GIF 预览">
                <p>可直接下载，移动端也可长按图片保存。</p>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section class="gif-guide mb-4">
        <h3><button type="button" class="gif-guide-toggle" :aria-expanded="!isMobileViewport || mobileGuideExpanded" aria-controls="video-gif-guide" @click="mobileGuideExpanded = !mobileGuideExpanded">使用说明 <span>{{ mobileGuideExpanded ? '收起' : '展开' }}</span></button></h3>
        <div id="video-gif-guide" v-show="!isMobileViewport || mobileGuideExpanded" class="gif-guide-grid">
          <div><strong>1. 选择片段</strong><p>拖动范围滑块或输入起止时间，单次最多处理 30 秒。</p></div>
          <div><strong>2. 控制体积</strong><p>优先降低宽度与帧率；帧数越少，生成速度越快。</p></div>
          <div><strong>3. 预览下载</strong><p>生成后检查尺寸、时长和体积，再下载最终 GIF。</p></div>
        </div>
      </section>

      <button type="button" class="gif-recommend-toggle" :aria-expanded="mobileRecommendationsExpanded" aria-controls="video-gif-recommendations" @click="mobileRecommendationsExpanded = !mobileRecommendationsExpanded">相关工具 <span>{{ mobileRecommendationsExpanded ? '收起' : '展开' }}</span></button>
      <div id="video-gif-recommendations" v-show="!isMobileViewport || mobileRecommendationsExpanded"><ToolsRecommend :currentPath="route.path" /></div>
      <MobileToolActions
        :hidden="!videoUrl"
        :title="mobileAction.title"
        :description="mobileAction.description"
        :action-label="mobileAction.label"
        :disabled="!hasCurrentGifResult && (!isVideoReady || isLoadingVideo || clipDuration <= 0)"
        :busy="isProcessing || isCheckingDownload"
        :cancel-label="isCheckingDownload ? '取消下载' : '取消处理'"
        aria-label="视频转 GIF 操作"
        @action="handleMobileAction"
        @cancel="cancelMobileAction"
      />
    </div>
  </div>
</template>

<style scoped>
.gif-tool-page {
  --gif-primary: #2563eb;
  --gif-border: #e2e8f0;
  --gif-muted: #64748b;
  color: #0f172a;
}

.gif-workspace {
  border: 1px solid var(--gif-border);
  border-radius: 8px;
  background: #ffffff;
  padding: 24px;
}

.gif-editor {
  gap: 20px;
  margin-top: 20px;
}

.gif-controls {
  position: sticky;
  top: 16px;
  border: 1px solid var(--gif-border);
  border-radius: 8px;
  background: #f8fafc;
  padding: 20px;
}

.gif-controls__head,
.gif-control-label,
.gif-result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.gif-controls__head h3,
.gif-result-head h3,
.gif-guide h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0;
}

.gif-controls__head button {
  border: 0;
  background: transparent;
  color: var(--gif-primary);
  cursor: pointer;
  font-size: 13px;
}

.gif-controls__head button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.gif-source-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  margin: 16px 0 0;
  border-top: 1px solid var(--gif-border);
  padding-top: 16px;
}

.gif-source-summary div {
  min-width: 0;
}

.gif-source-summary dt {
  margin-bottom: 3px;
  color: var(--gif-muted);
  font-size: 12px;
}

.gif-source-summary dd {
  margin: 0;
  overflow: hidden;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gif-control-section {
  margin-top: 18px;
  border-top: 1px solid var(--gif-border);
  padding-top: 16px;
}

.gif-control-label {
  margin-bottom: 8px;
  color: #334155;
  font-size: 13px;
}

.gif-control-label strong {
  color: #0f172a;
  font-size: 12px;
}

.gif-range-inputs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  gap: 8px;
}

.gif-range-field { display: grid; min-width: 0; gap: 6px; }
.gif-range-field > span {
  color: #94a3b8;
  font-size: 12px;
}

.gif-speed-options {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.gif-speed-options button {
  min-height: 34px;
  border: 1px solid var(--gif-border);
  border-radius: 6px;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  font-size: 12px;
}

.gif-speed-options button.is-active {
  border-color: var(--gif-primary);
  background: var(--gif-primary);
  color: #ffffff;
}

.gif-control-hint {
  margin: 4px 0 0;
  color: var(--gif-muted);
  font-size: 12px;
  line-height: 1.55;
}

.gif-output-estimate {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
  border-left: 3px solid #60a5fa;
  background: #eff6ff;
  padding: 12px;
}

.gif-output-estimate span,
.gif-output-estimate strong {
  display: block;
}

.gif-output-estimate span {
  margin-bottom: 4px;
  color: #64748b;
  font-size: 11px;
}

.gif-output-estimate strong {
  color: #1e3a8a;
  font-size: 12px;
}

.gif-error {
  margin-top: 14px;
  border: 1px solid #fecdd3;
  border-radius: 6px;
  background: #fff1f2;
  padding: 10px 12px;
  color: #be123c;
  font-size: 13px;
}

.gif-primary,
.gif-download {
  min-height: 42px;
  border: 1px solid var(--gif-primary);
  border-radius: 6px;
  background: var(--gif-primary);
  color: #ffffff;
  cursor: pointer;
  font-size: 14px;
  font-weight: 650;
}

.gif-primary {
  width: 100%;
  margin-top: 16px;
}

.gif-primary:hover,
.gif-download:hover {
  border-color: #1d4ed8;
  background: #1d4ed8;
}

.gif-primary:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.gif-preview-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.gif-preview-panel {
  display: flex;
  min-height: 320px;
  border: 1px solid #1e293b;
  border-radius: 8px;
  background: #020617;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.gif-preview-video {
  width: 100%;
  max-height: 500px;
}

.gif-result-panel {
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #ffffff;
  padding: 22px;
}

.gif-result-status {
  display: block;
  margin-bottom: 4px;
  color: #15803d;
  font-size: 12px;
  font-weight: 650;
}

.gif-download {
  min-width: 96px;
  padding: 0 14px;
}

.gif-result-preview {
  display: flex;
  min-height: 220px;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  padding: 16px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.gif-result-preview img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.gif-result-preview p {
  margin: 10px 0 0;
  color: var(--gif-muted);
  font-size: 12px;
}

.gif-guide {
  border-top: 1px solid var(--gif-border);
  background: #ffffff;
  padding: 28px 24px;
}

.gif-guide-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin-top: 18px;
}

.gif-guide-grid strong {
  color: #1e293b;
  font-size: 14px;
}

.gif-guide-grid p {
  margin: 6px 0 0;
  color: var(--gif-muted);
  font-size: 13px;
  line-height: 1.7;
}

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

:deep(.el-input-number) {
  width: 100%;
}

@media (max-width: 900px) {
  .gif-controls {
    position: static;
  }
}

@media (max-width: 640px) {
  .gif-workspace,
  .gif-controls,
  .gif-result-panel {
    padding: 16px;
  }

  .gif-output-estimate,
  .gif-guide-grid {
    grid-template-columns: 1fr;
  }

  .gif-preview-panel {
    min-height: 220px;
  }

  .gif-guide {
    padding: 22px 16px;
  }

  .gif-result-head {
    align-items: flex-start;
    flex-direction: column;
  }
}

@container video-mobile (max-width: 600px) {
  .gif-controls,
  .gif-result-panel {
    padding: 16px 12px;
  }

  .gif-controls__head button,
  .gif-speed-options button,
  .gif-primary,
  .gif-download {
    min-height: 44px;
  }

  .gif-source-summary dd {
    overflow: visible;
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .gif-output-estimate {
    gap: 10px;
    padding: 10px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gif-result-head {
    align-items: stretch;
    flex-direction: column;
  }

  .gif-preview-panel {
    min-height: 180px;
  }

  .gif-guide-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* 手机保留一个大预览，参数与说明按需展开；桌面继续使用完整双栏。 */
.gif-mobile-toggle,
.gif-mobile-preview-tabs,
.gif-result-details-toggle,
.gif-recommend-toggle { display: none; }
.gif-guide-toggle { width: 100%; text-align: left; cursor: default; }
.gif-guide-toggle > span { display: none; }
.gif-clip-hint { margin: 10px 0 0; color: var(--gif-muted); font-size: 12px; line-height: 1.6; }
.gif-stale-result { margin-block: 12px; }

@media (max-width: 640px) {
  .gif-tool-page { --gif-primary: var(--uied-color-primary); }
  .gif-workspace :deep(.video-workspace-intro__notices) { display: none; }
  .gif-editor { gap: 18px; }
  .gif-controls { padding: 16px 12px; }
  .gif-controls__head h3 { font-size: 16px; }
  .gif-source-summary { grid-template-columns: minmax(0, 1fr) auto; gap: 12px; margin-top: 12px; padding-top: 12px; }
  .gif-source-summary div:nth-child(n+3) { display: none; }
  .gif-source-summary dd { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: normal; overflow-wrap: anywhere; }
  .gif-control-section { margin-top: 16px; padding-top: 16px; }
  .gif-control-label { font-size: 14px; margin-bottom: 12px; }
  .gif-range-inputs { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .gif-range-field > span { color: var(--gif-muted); font-size: 12px; }
  .gif-range-field :deep(.el-input__inner), .gif-advanced-settings :deep(.el-input__inner) { font-size: 16px; }
  .gif-mobile-toggle { display: grid; width: 100%; gap: 8px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--gif-border); color: #334155; text-align: left; }
  .gif-mobile-toggle strong { display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
  .gif-mobile-toggle strong > span, .gif-mobile-toggle > span { color: var(--gif-muted); font-size: 12px; line-height: 1.6; font-weight: 400; }
  .gif-advanced-settings .gif-control-section { padding-top: 20px; margin-top: 20px; }
  .gif-output-estimate { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding: 12px; }
  .gif-output-estimate > div:last-child { grid-column: 1 / -1; }
  .gif-primary, .gif-result-head .gif-download { display: none; }
  .gif-mobile-preview-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .gif-mobile-preview-tabs button { min-height: 44px; border: 1px solid var(--gif-border); border-radius: 8px; color: #475569; font-size: 14px; background: #fff; }
  .gif-mobile-preview-tabs button[aria-pressed="true"] { border-color: var(--gif-primary); color: var(--gif-primary); background: var(--uied-color-primary-soft); font-weight: 600; }
  .gif-mobile-preview-tabs button:disabled { opacity: .45; cursor: not-allowed; }
  .gif-preview-column { gap: 12px; }
  .gif-preview-panel { min-height: 200px; }
  .gif-preview-video { max-height: 360px; }
  .gif-result-panel { display: flex; flex-direction: column; padding: 16px 12px; }
  .gif-result-head { order: 0; margin-bottom: 16px; }
  .gif-result-preview { order: 1; }
  .gif-result-details-toggle { display: flex; align-items: center; justify-content: space-between; order: 2; min-height: 44px; margin-top: 12px; color: #334155; font-size: 14px; text-align: left; }
  .gif-result-details-toggle span { color: var(--gif-muted); font-size: 12px; }
  #video-gif-result-details { order: 3; }
  .gif-stale-result { order: 4; }
  .gif-result-head h3 { font-size: 17px; }
  .gif-result-preview { min-height: 200px; padding: 12px; }
  .gif-result-preview img { width: 100%; max-height: 360px; }
  .gif-result-preview p { line-height: 1.6; }
  .gif-guide { margin-top: 16px; padding: 16px 12px; border: 1px solid var(--gif-border); border-radius: 8px; }
  .gif-guide-toggle, .gif-recommend-toggle { display: flex; min-height: 44px; align-items: center; justify-content: space-between; width: 100%; gap: 12px; font-size: 15px; font-weight: 600; cursor: pointer; }
  .gif-guide-toggle > span, .gif-recommend-toggle > span { display: inline; font-size: 12px; font-weight: 400; color: var(--gif-muted); }
  .gif-recommend-toggle { padding: 16px 12px; border: 1px solid var(--gif-border); border-radius: 8px; background: #fff; }
  .gif-tool-page button:focus-visible { outline: 2px solid var(--gif-primary); outline-offset: 3px; }
}
</style>

<style scoped src="../Shared/videoMobile.css"></style>
