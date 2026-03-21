<!--
 * @file VideoMerge.vue
 * @description 视频拼接工具，支持多段视频顺序合并导出
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
type OutputFormat = 'auto' | 'webm' | 'mp4'

/**
 * 输出分辨率模式
 */
type ResolutionMode = 'source-max' | 'source-first' | '1080p' | '720p'

/**
 * 视频片段数据结构
 */
interface MergeClip {
  id: string
  file: File
  name: string
  sizeMB: number
  duration: number
  width: number
  height: number
  url: string
}

/**
 * 结果视频元数据
 */
interface VideoMeta {
  duration: number
  width: number
  height: number
}

const route = useRoute()

const fileInput = ref<HTMLInputElement | null>(null)
const resultVideoRef = ref<HTMLVideoElement | null>(null)
const previewVideoRef = ref<HTMLVideoElement | null>(null)

const clips = ref<MergeClip[]>([])
const activeClipId = ref('')
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

const resultMeta = reactive<VideoMeta>({
  duration: 0,
  width: 0,
  height: 0
})

const settings = reactive({
  outputFormat: 'auto' as OutputFormat,
  resolutionMode: 'source-max' as ResolutionMode,
  frameRate: 24
})

let mediaRecorder: MediaRecorder | null = null
let drawRafId: number | null = null
let playbackVideo: HTMLVideoElement | null = null
let canvasStream: MediaStream | null = null
let isFinalizingOutput = false

const totalSourceSizeMB = computed(() => {
  return clips.value.reduce((total, clip) => total + clip.sizeMB, 0)
})

const totalDuration = computed(() => {
  return clips.value.reduce((total, clip) => total + clip.duration, 0)
})

const activePreviewUrl = computed(() => {
  if (!clips.value.length) return ''
  const activeClip = clips.value.find(item => item.id === activeClipId.value)
  return activeClip?.url || clips.value[0].url
})

/**
 * 格式化时长
 * @param seconds 秒数
 * @returns mm:ss
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
 * @returns 扩展名
 */
const getFileExtension = (filename: string) => {
  const parts = filename.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

/**
 * 更新 ETA 信息
 * @param currentProgress 当前进度
 */
const updateEtaText = (currentProgress: number) => {
  const remainSeconds = estimateRemainingSeconds(currentProgress, processStartedAt.value)
  etaText.value = formatEtaText(remainSeconds)
}

/**
 * 触发文件选择
 */
const triggerSelectVideos = () => {
  fileInput.value?.click()
}

/**
 * 清理结果资源
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
 * 停止当前处理
 */
const stopCurrentProcessing = () => {
  if (drawRafId !== null) {
    cancelAnimationFrame(drawRafId)
    drawRafId = null
  }

  if (playbackVideo) {
    playbackVideo.pause()
    playbackVideo.src = ''
    playbackVideo.load()
    playbackVideo = null
  }

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  canvasStream?.getTracks().forEach(track => track.stop())
  canvasStream = null
  mediaRecorder = null
  isFinalizingOutput = false
  isProcessing.value = false
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
    ElMessage.warning(`文件 ${file.name} 不是可用的视频格式`)
    return false
  }

  return true
}

/**
 * 读取文件的元数据
 * @param file 视频文件
 * @param url 对应 URL
 * @returns 元数据
 */
const readVideoMeta = (file: File, url: string) => {
  return new Promise<{ duration: number; width: number; height: number }>((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = url

    const clearEvents = () => {
      video.onloadedmetadata = null
      video.onerror = null
    }

    video.onloadedmetadata = () => {
      clearEvents()
      resolve({
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0
      })
    }

    video.onerror = () => {
      clearEvents()
      reject(new Error(`无法读取视频信息：${file.name}`))
    }
  })
}

/**
 * 批量添加视频片段
 * @param fileList 文件列表
 */
const appendVideos = async (fileList: FileList | File[]) => {
  const files = Array.from(fileList)
  if (!files.length) return

  const nextClips: MergeClip[] = []

  for (const file of files) {
    if (!validateVideoFile(file)) continue

    const url = URL.createObjectURL(file)

    try {
      const meta = await readVideoMeta(file, url)
      nextClips.push({
        id: `${Date.now()}_${Math.random().toString(16).slice(2, 10)}`,
        file,
        name: file.name,
        sizeMB: file.size / 1024 / 1024,
        duration: meta.duration,
        width: meta.width,
        height: meta.height,
        url
      })
    } catch (error) {
      URL.revokeObjectURL(url)
      ElMessage.warning(getFriendlyVideoError(error, `无法解析文件：${file.name}`))
    }
  }

  if (!nextClips.length) return

  clips.value = [...clips.value, ...nextClips]
  if (!activeClipId.value) {
    activeClipId.value = clips.value[0].id
  }

  clearResult()
  errorText.value = ''
  statusText.value = ''
  progress.value = 0
  etaText.value = ''
}

/**
 * 文件选择处理
 * @param event 事件
 */
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  await appendVideos(input.files)
  if (input.value) input.value = ''
}

/**
 * 拖拽上传处理
 * @param event 拖拽事件
 */
const handleDrop = async (event: DragEvent) => {
  isDragOver.value = false
  const fileList = event.dataTransfer?.files
  if (!fileList?.length) return
  await appendVideos(fileList)
}

/**
 * 删除片段
 * @param clipId 片段 ID
 */
const removeClip = (clipId: string) => {
  if (isProcessing.value) return

  const target = clips.value.find(item => item.id === clipId)
  if (target) {
    URL.revokeObjectURL(target.url)
  }

  clips.value = clips.value.filter(item => item.id !== clipId)

  if (!clips.value.length) {
    activeClipId.value = ''
  } else if (!clips.value.find(item => item.id === activeClipId.value)) {
    activeClipId.value = clips.value[0].id
  }

  clearResult()
}

/**
 * 上移片段
 * @param clipId 片段 ID
 */
const moveClipUp = (clipId: string) => {
  if (isProcessing.value) return
  const index = clips.value.findIndex(item => item.id === clipId)
  if (index <= 0) return

  const next = [...clips.value]
  const [item] = next.splice(index, 1)
  next.splice(index - 1, 0, item)
  clips.value = next
  clearResult()
}

/**
 * 下移片段
 * @param clipId 片段 ID
 */
const moveClipDown = (clipId: string) => {
  if (isProcessing.value) return
  const index = clips.value.findIndex(item => item.id === clipId)
  if (index < 0 || index >= clips.value.length - 1) return

  const next = [...clips.value]
  const [item] = next.splice(index, 1)
  next.splice(index + 1, 0, item)
  clips.value = next
  clearResult()
}

/**
 * 解析目标分辨率
 * @returns 目标宽高
 */
const resolveTargetResolution = () => {
  const presetMap: Record<Exclude<ResolutionMode, 'source-max' | 'source-first'>, { width: number; height: number }> = {
    '1080p': { width: 1920, height: 1080 },
    '720p': { width: 1280, height: 720 }
  }

  if (settings.resolutionMode === '1080p' || settings.resolutionMode === '720p') {
    return presetMap[settings.resolutionMode]
  }

  if (!clips.value.length) {
    return { width: 1280, height: 720 }
  }

  if (settings.resolutionMode === 'source-first') {
    const first = clips.value[0]
    return {
      width: Math.max(2, first.width || 1280),
      height: Math.max(2, first.height || 720)
    }
  }

  const width = Math.max(...clips.value.map(item => item.width || 0), 1280)
  const height = Math.max(...clips.value.map(item => item.height || 0), 720)
  return {
    width: Math.max(2, width),
    height: Math.max(2, height)
  }
}

/**
 * 解析输出编码
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
 * 将视频帧按等比绘制到画布
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
 * 等待单个视频可播放
 * @param video 视频元素
 * @param url 视频 URL
 */
const loadVideoSource = (video: HTMLVideoElement, url: string) => {
  return new Promise<void>((resolve, reject) => {
    video.preload = 'auto'
    video.src = url

    const clearEvents = () => {
      video.onloadedmetadata = null
      video.onerror = null
      video.oncanplay = null
    }

    video.onloadedmetadata = () => {
      clearEvents()
      resolve()
    }

    video.oncanplay = () => {
      clearEvents()
      resolve()
    }

    video.onerror = () => {
      clearEvents()
      reject(new Error('视频解码失败，请检查文件是否损坏'))
    }
  })
}

/**
 * 逐帧渲染单个片段
 * @param clip 片段
 * @param elapsedBefore 该片段前已处理时长
 * @param ctx 画布上下文
 * @param width 目标宽度
 * @param height 目标高度
 */
const renderOneClip = async (
  clip: MergeClip,
  elapsedBefore: number,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  if (!playbackVideo) {
    throw new Error('播放实例未初始化')
  }

  await loadVideoSource(playbackVideo, clip.url)
  playbackVideo.currentTime = 0
  await playbackVideo.play()

  return new Promise<void>((resolve, reject) => {
    const tick = () => {
      if (!isProcessing.value || isCancelRequested.value) {
        resolve()
        return
      }

      if (!playbackVideo) {
        reject(new Error('播放实例已释放'))
        return
      }

      drawContainFrame(ctx, playbackVideo, width, height)

      const currentTime = Math.min(playbackVideo.currentTime || 0, clip.duration || 0)
      const mergedElapsed = elapsedBefore + currentTime
      const currentProgress = totalDuration.value > 0
        ? Math.min(99, Math.round((mergedElapsed / totalDuration.value) * 99))
        : 0

      progress.value = currentProgress
      updateEtaText(currentProgress)

      const isEnded = playbackVideo.ended || currentTime >= Math.max(0, clip.duration - 0.05)
      if (isEnded) {
        resolve()
        return
      }

      drawRafId = requestAnimationFrame(tick)
    }

    drawRafId = requestAnimationFrame(tick)
  })
}

/**
 * 取消处理
 */
const cancelProcessing = () => {
  if (!isProcessing.value) return

  isCancelRequested.value = true
  statusText.value = '已取消处理'
  etaText.value = ''
  stopCurrentProcessing()
  ElMessage.info('已取消当前拼接任务')
}

/**
 * 执行视频拼接
 */
const processMerge = async () => {
  if (clips.value.length < 2) {
    ElMessage.warning('请至少上传 2 个视频片段')
    return
  }

  try {
    isCancelRequested.value = false
    isFinalizingOutput = false
    isProcessing.value = true
    progress.value = 0
    statusText.value = '正在准备拼接任务...'
    etaText.value = formatEtaText(null)
    errorText.value = ''
    processStartedAt.value = Date.now()
    clearResult()

    const { width: targetWidth, height: targetHeight } = resolveTargetResolution()
    const { mimeType, ext } = resolveRecorderPreset()
    resultFileExt.value = ext

    const totalSourceSize = clips.value.reduce((sum, item) => sum + item.file.size, 0)
    const totalSourceDuration = Math.max(1, totalDuration.value)
    const sourceBitrateKbps = (totalSourceSize * 8) / totalSourceDuration / 1000

    const targetVideoBitrate = Math.max(320, Math.round(sourceBitrateKbps * 0.9))
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

    playbackVideo = document.createElement('video')
    playbackVideo.muted = true
    playbackVideo.playsInline = true
    playbackVideo.crossOrigin = 'anonymous'

    canvasStream = canvas.captureStream(settings.frameRate)
    mediaRecorder = new MediaRecorder(canvasStream, recorderOptions)

    const chunks: Blob[] = []

    const finalized = new Promise<Blob>((resolve, reject) => {
      if (!mediaRecorder) {
        reject(new Error('录制器初始化失败'))
        return
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onerror = (event) => {
        reject((event as any)?.error || new Error('视频拼接失败'))
      }

      mediaRecorder.onstop = () => {
        if (drawRafId !== null) {
          cancelAnimationFrame(drawRafId)
          drawRafId = null
        }

        if (isCancelRequested.value) {
          reject(new DOMException('处理已取消', 'AbortError'))
          return
        }

        const blob = new Blob(chunks, { type: mimeType })
        if (!blob.size) {
          reject(new Error('输出文件为空，请尝试降低分辨率后重试'))
          return
        }

        resolve(blob)
      }
    })

    mediaRecorder.start(500)

    let elapsedBefore = 0

    for (let index = 0; index < clips.value.length; index += 1) {
      const clip = clips.value[index]
      if (isCancelRequested.value) {
        break
      }

      statusText.value = `正在处理第 ${index + 1}/${clips.value.length} 段：${clip.name}`
      await renderOneClip(clip, elapsedBefore, ctx, targetWidth, targetHeight)
      elapsedBefore += clip.duration
    }

    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      throw new Error('录制流程意外终止，请重试')
    }

    if (!isFinalizingOutput) {
      isFinalizingOutput = true
      statusText.value = '正在封装输出文件...'
      etaText.value = '预计剩余时间：正在封装...'
      mediaRecorder.stop()
    }

    const blob = await finalized
    resultVideoUrl.value = URL.createObjectURL(blob)
    resultFileSizeMB.value = blob.size / 1024 / 1024

    isProcessing.value = false
    progress.value = 100
    statusText.value = '拼接完成'
    etaText.value = '预计剩余时间：约 0 秒'

    ElMessage.success('视频拼接完成')
  } catch (error) {
    const message = getFriendlyVideoError(error, '视频拼接失败，请尝试降低分辨率后重试')

    if (message === '处理已取消') {
      statusText.value = '已取消处理'
    } else {
      statusText.value = '拼接失败'
      errorText.value = message
      ElMessage.error(message)
    }
  } finally {
    isProcessing.value = false
    isFinalizingOutput = false

    if (drawRafId !== null) {
      cancelAnimationFrame(drawRafId)
      drawRafId = null
    }

    if (playbackVideo) {
      playbackVideo.pause()
      playbackVideo.src = ''
      playbackVideo.load()
      playbackVideo = null
    }

    canvasStream?.getTracks().forEach(track => track.stop())
    canvasStream = null
    mediaRecorder = null
  }
}

/**
 * 下载结果
 */
const downloadResult = () => {
  if (!resultVideoUrl.value || !clips.value.length) return

  const firstName = clips.value[0].name.replace(/\.[^/.]+$/, '')
  const link = document.createElement('a')
  link.href = resultVideoUrl.value
  link.download = `${firstName}_merged.${resultFileExt.value}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 结果视频加载完成
 */
const onResultVideoLoaded = () => {
  const video = resultVideoRef.value
  if (!video) return

  resultMeta.duration = video.duration || 0
  resultMeta.width = video.videoWidth || 0
  resultMeta.height = video.videoHeight || 0
}

/**
 * 获取结果摘要
 * @returns 摘要文本
 */
const getResultSummary = () => {
  if (!resultVideoUrl.value) return '-'

  const sizeDiff = totalSourceSizeMB.value - resultFileSizeMB.value
  const sizeRate = totalSourceSizeMB.value > 0 ? (sizeDiff / totalSourceSizeMB.value) * 100 : 0
  return `合并 ${clips.value.length} 段视频，体积变化 ${sizeDiff.toFixed(2)}MB（${sizeRate.toFixed(1)}%）`
}

/**
 * 结果对比指标
 */
const resultComparisonMetrics = computed(() => {
  const firstExt = clips.value.length ? getFileExtension(clips.value[0].name).toUpperCase() : '-'

  return [
    {
      label: '片段数量',
      before: `${clips.value.length} 段`,
      after: resultVideoUrl.value ? '1 段（已合并）' : '-'
    },
    {
      label: '文件体积',
      before: `${totalSourceSizeMB.value.toFixed(2)} MB`,
      after: resultVideoUrl.value ? `${resultFileSizeMB.value.toFixed(2)} MB` : '-'
    },
    {
      label: '总时长',
      before: formatTime(totalDuration.value),
      after: resultMeta.duration ? formatTime(resultMeta.duration) : '-'
    },
    {
      label: '输出格式',
      before: firstExt || '-',
      after: resultFileExt.value.toUpperCase()
    }
  ]
})

/**
 * 浏览器刷新关闭提醒
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
  clips.value.forEach(item => URL.revokeObjectURL(item.url))
  clips.value = []
  clearResult()
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave((to, from, next) => {
  if (!isProcessing.value) {
    next()
    return
  }

  const shouldLeave = window.confirm('视频仍在拼接中，离开页面会中断处理。确定要离开吗？')
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
      <div class="mb-4 rounded-xl bg-white p-8">
        <div class="mb-6 text-center">
          <h2 class="mb-3 bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            免费视频拼接
          </h2>
          <p class="mx-auto max-w-3xl text-sm text-gray-500 sm:text-base">
            支持多段视频按顺序合并导出，拖拽调整顺序即可一键生成合集视频。
          </p>
        </div>

        <VideoToolNotice
          class="mb-8"
          formats="格式支持：MP4、AVI、MOV、MKV、WMV、WebM（建议同分辨率片段优先处理）"
          compatibility="浏览器兼容：推荐 Chrome / Edge / Safari 最新版；不同浏览器编码能力存在差异"
          privacy="隐私说明：拼接过程在本地浏览器完成，不上传视频文件"
        />

        <div
          class="group relative mb-6 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-10 text-center transition-all"
          :class="[
            isDragOver
              ? 'border-sky-500 bg-sky-50 scale-[1.01]'
              : 'border-gray-300 hover:border-sky-400 hover:bg-sky-50'
          ]"
          @click="triggerSelectVideos"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            multiple
            accept="video/*,.mp4,.avi,.mov,.mkv,.wmv,.webm,.m4v"
            @change="handleFileChange"
          >
          <h3 class="mb-2 text-lg font-bold text-gray-800 transition-colors group-hover:text-sky-600">点击或拖拽上传多个视频</h3>
          <p class="text-sm text-gray-500">至少上传 2 个片段，支持批量追加</p>
        </div>

        <div v-if="clips.length" class="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div class="space-y-4 lg:col-span-5">
            <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div class="mb-3 flex items-center justify-between">
                <h3 class="text-base font-semibold text-gray-800">片段列表（{{ clips.length }}）</h3>
                <button
                  class="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 transition-colors hover:border-sky-400 hover:text-sky-700"
                  type="button"
                  :disabled="isProcessing"
                  @click="triggerSelectVideos"
                >
                  继续添加
                </button>
              </div>

              <div class="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                <article
                  v-for="(clip, index) in clips"
                  :key="clip.id"
                  class="rounded-lg border bg-white p-3"
                  :class="activeClipId === clip.id ? 'border-sky-300' : 'border-gray-200'"
                >
                  <div class="mb-2 flex items-start justify-between gap-2">
                    <button
                      type="button"
                      class="min-w-0 text-left"
                      @click="activeClipId = clip.id"
                    >
                      <p class="truncate text-sm font-medium text-gray-800">{{ index + 1 }}. {{ clip.name }}</p>
                      <p class="text-xs text-gray-500">{{ clip.width }} × {{ clip.height }} · {{ formatTime(clip.duration) }} · {{ clip.sizeMB.toFixed(2) }} MB</p>
                    </button>
                    <button
                      type="button"
                      class="rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                      :disabled="isProcessing"
                      @click="removeClip(clip.id)"
                    >
                      删除
                    </button>
                  </div>

                  <div class="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      class="rounded-md border border-gray-300 px-2 py-1 text-gray-600 hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="isProcessing || index === 0"
                      @click="moveClipUp(clip.id)"
                    >
                      上移
                    </button>
                    <button
                      type="button"
                      class="rounded-md border border-gray-300 px-2 py-1 text-gray-600 hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                      :disabled="isProcessing || index === clips.length - 1"
                      @click="moveClipDown(clip.id)"
                    >
                      下移
                    </button>
                  </div>
                </article>
              </div>
            </div>

            <div class="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
              <h3 class="text-base font-semibold text-gray-800">拼接设置</h3>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">输出分辨率</label>
                <el-select v-model="settings.resolutionMode" class="w-full">
                  <el-option value="source-max" label="按最大分辨率（推荐）" />
                  <el-option value="source-first" label="按首段分辨率" />
                  <el-option value="1080p" label="1080p（1920 × 1080）" />
                  <el-option value="720p" label="720p（1280 × 720）" />
                </el-select>
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700">输出格式</label>
                <el-select v-model="settings.outputFormat" class="w-full">
                  <el-option value="auto" label="自动（推荐）" />
                  <el-option value="webm" label="WebM" />
                  <el-option value="mp4" label="MP4" />
                </el-select>
              </div>

              <div class="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-700">
                当前版本优先保障多段画面合并稳定性，跨片段音轨无缝拼接将在后续版本继续优化。
              </div>

              <div class="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
                <p>合计片段：{{ clips.length }} 段</p>
                <p>总时长：{{ formatTime(totalDuration) }}</p>
                <p>总大小：{{ totalSourceSizeMB.toFixed(2) }} MB</p>
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
                :disabled="isProcessing || clips.length < 2"
                @click="processMerge"
              >
                <span v-if="!isProcessing">开始拼接</span>
                <span v-else>拼接中...</span>
              </button>
            </div>
          </div>

          <div class="space-y-4 lg:col-span-7">
            <div class="rounded-xl border border-gray-200 bg-black overflow-hidden">
              <video
                ref="previewVideoRef"
                :src="activePreviewUrl"
                controls
                class="w-full max-h-[340px]"
              />
            </div>

            <div v-if="resultVideoUrl" class="rounded-xl border border-green-200 bg-white p-5">
              <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 class="text-lg font-semibold text-gray-800">拼接完成</h3>
                <button
                  class="inline-flex items-center rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                  @click="downloadResult"
                >
                  下载拼接结果
                </button>
              </div>

              <VideoResultComparison :metrics="resultComparisonMetrics" :summary="getResultSummary()" />

              <div class="mt-4 overflow-hidden rounded-lg bg-black">
                <video
                  ref="resultVideoRef"
                  :src="resultVideoUrl"
                  controls
                  class="w-full max-h-[340px]"
                  @loadedmetadata="onResultVideoLoaded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>
