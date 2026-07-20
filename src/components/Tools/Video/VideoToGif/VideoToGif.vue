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
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import VideoProcessStatus from '@/components/Tools/Video/Shared/VideoProcessStatus.vue'
import VideoResultComparison from '@/components/Tools/Video/Shared/VideoResultComparison.vue'
import VideoUploadZone from '@/components/Tools/Video/Shared/VideoUploadZone.vue'
import VideoWorkspaceIntro from '@/components/Tools/Video/Shared/VideoWorkspaceIntro.vue'
import { ensureGifRuntime } from '@/utils/toolRuntimeLoaders'
import { estimateRemainingSeconds, formatEtaText, getFriendlyVideoError } from '@/utils/videoToolFeedback'
import { useToolConsume } from '@/composables/useToolConsume'

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
const isCancelRequested = ref(false)
let activeGifEncoder: any = null

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
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (validateGifSourceFile(file)) {
      loadVideo(file)
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
  return new Promise<void>((resolve, reject) => {
    if (Math.abs(video.currentTime - targetTime) < 0.02 && video.readyState >= 2) {
      resolve()
      return
    }

    const timeoutId = window.setTimeout(() => {
      video.removeEventListener('seeked', handleSeeked)
      reject(new Error('视频定位超时，请更换编码格式后重试'))
    }, 5000)
    const handleSeeked = () => {
      window.clearTimeout(timeoutId)
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

  const canConsume = await ensureToolConsume({
    toolKey: 'video-to-gif',
    action: 'generate',
    loginWarningText: '请先登录后再使用视频转 GIF',
    showConsumeSuccessToast: true
  })
  if (!canConsume) {
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
const downloadGif = async () => {
  if (!gifUrl.value) return
  const canDownload = await ensureToolConsume({
    toolKey: 'video-to-gif',
    action: 'download',
    mode: 'check-login',
    loginWarningText: '请先登录后再下载 GIF'
  })
  if (!canDownload) {
    return
  }
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
  const file = ev.dataTransfer?.files?.[0]
  if (file && validateGifSourceFile(file)) {
    loadVideo(file)
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
  <div class="gif-tool-page min-h-screen">
    <div class="mx-auto">
      <section class="gif-workspace mb-4">
        <VideoWorkspaceIntro
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
          @change="handleFileChange"
        >

        <VideoUploadZone
          v-if="!videoUrl"
          title="上传需要转换的视频"
          formats="支持 MP4、MOV、WebM、AVI、MKV，最大 200MB"
          @select="fileInput?.click()"
          @drop="dropHandler"
        />

        <div v-else class="gif-editor grid grid-cols-1 lg:grid-cols-12">
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
                <el-slider v-model="clipRange" range :min="0" :max="videoMeta.duration" :step="0.1" />
                <div class="gif-range-inputs">
                  <el-input-number v-model="settings.startTime" :min="0" :max="settings.endTime" :step="0.1" size="small" />
                  <span>至</span>
                  <el-input-number v-model="settings.endTime" :min="settings.startTime" :max="videoMeta.duration" :step="0.1" size="small" />
                </div>
              </div>

              <div class="gif-control-section">
                <div class="gif-control-label"><span>输出宽度</span><strong>{{ outputResolutionText }}</strong></div>
                <el-input-number v-model="settings.width" :min="80" :max="960" :step="20" @change="handleWidthChange" />
              </div>

              <div class="gif-control-section">
                <div class="gif-control-label"><span>帧率</span><strong>{{ settings.fps }} FPS</strong></div>
                <el-slider v-model="settings.fps" :min="1" :max="30" :step="1" />
              </div>

              <div class="gif-control-section">
                <div class="gif-control-label"><span>播放速度</span><strong>{{ settings.speed }}x</strong></div>
                <div class="gif-speed-options">
                  <button
                    v-for="speed in [0.5, 1, 1.5, 2]"
                    :key="speed"
                    type="button"
                    :class="{ 'is-active': settings.speed === speed }"
                    @click="settings.speed = speed"
                  >
                    {{ speed }}x
                  </button>
                </div>
              </div>

              <div class="gif-control-section">
                <div class="gif-control-label"><span>画质</span><strong>{{ settings.quality }}</strong></div>
                <el-slider v-model="settings.quality" :min="1" :max="30" :step="1" />
                <p class="gif-control-hint">数值越小越清晰，处理时间与文件体积也会增加。</p>
              </div>

              <div class="gif-output-estimate">
                <div><span>输出尺寸</span><strong>{{ outputResolutionText }}</strong></div>
                <div><span>预计帧数</span><strong>{{ estimatedFrameCount }} 帧</strong></div>
                <div><span>输出时长</span><strong>{{ outputDuration.toFixed(1) }}s</strong></div>
              </div>

              <VideoProcessStatus
                v-if="isProcessing"
                :progress="progress"
                :status-text="statusText"
                :eta-text="etaText"
                @cancel="cancelProcessing"
              />

              <div v-if="errorText" class="gif-error">{{ errorText }}</div>

              <button type="button" class="gif-primary" :disabled="isProcessing" @click="generateGif">
                {{ isProcessing ? '正在生成...' : '生成 GIF' }}
              </button>
            </div>
          </aside>

          <div class="gif-preview-column lg:col-span-8">
            <div class="gif-preview-panel">
              <video
                ref="videoRef"
                :src="videoUrl"
                controls
                class="gif-preview-video"
                @loadedmetadata="onVideoLoaded"
              ></video>
            </div>

            <section v-if="gifUrl" class="gif-result-panel animate-fade-in">
              <div class="gif-result-head">
                <div>
                  <span class="gif-result-status">处理完成</span>
                  <h3>GIF 已生成</h3>
                </div>
                <button type="button" class="gif-download" @click="downloadGif">下载 GIF</button>
              </div>

              <VideoResultComparison :metrics="resultComparisonMetrics" class="mb-4" />

              <div class="gif-result-preview">
                <img :src="gifUrl" alt="生成后的 GIF 预览">
                <p>可直接下载，移动端也可长按图片保存。</p>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section class="gif-guide mb-4">
        <h3>使用说明</h3>
        <div class="gif-guide-grid">
          <div><strong>1. 选择片段</strong><p>拖动范围滑块或输入起止时间，单次最多处理 30 秒。</p></div>
          <div><strong>2. 控制体积</strong><p>优先降低宽度与帧率；帧数越少，生成速度越快。</p></div>
          <div><strong>3. 预览下载</strong><p>生成后检查尺寸、时长和体积，再下载最终 GIF。</p></div>
        </div>
      </section>

    <ToolsRecommend :currentPath="route.path" />
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
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.gif-range-inputs span {
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
  border-left: 4px solid #22c55e;
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
</style>
