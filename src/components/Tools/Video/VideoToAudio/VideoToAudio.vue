<!--
 * @file VideoToAudio.vue
 * @description 视频提取音频工具
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
const resultAudioUrl = ref<string>('')
const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')
const etaText = ref('')
const errorText = ref('')
const processStartedAt = ref(0)
const isCancelRequested = ref(false)
const currentTaskId = ref(0)
const resultAudioSizeMB = ref(0)
const resultDuration = ref(0)
const isDragOver = ref(false)

const sourceMeta = reactive({
  duration: 0,
  width: 0,
  height: 0
})

const sourceSizeMB = computed(() => {
  if (!videoFile.value) return 0
  return videoFile.value.size / 1024 / 1024
})

/**
 * 统一格式化时长文本
 * @param seconds 秒数
 * @returns 格式化后的时长
 */
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '00:00'
  }
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
 * 清理历史结果链接和数据
 */
const clearResultAudio = () => {
  if (resultAudioUrl.value) {
    URL.revokeObjectURL(resultAudioUrl.value)
  }
  resultAudioUrl.value = ''
  resultAudioSizeMB.value = 0
  resultDuration.value = 0
}

/**
 * 重置处理状态
 */
const resetProcessState = () => {
  isProcessing.value = false
  progress.value = 0
  statusText.value = ''
  etaText.value = ''
  errorText.value = ''
  processStartedAt.value = 0
}

/**
 * 判断任务是否已取消或失效
 * @param taskId 当前任务 ID
 * @returns 是否失效
 */
const isTaskInvalid = (taskId: number) => {
  return isCancelRequested.value || currentTaskId.value !== taskId
}

/**
 * 加载视频文件并初始化状态
 * @param file 视频文件
 */
const loadVideo = (file: File) => {
  if (!file.type.startsWith('video/')) {
    ElMessage.warning('请选择有效的视频文件')
    return
  }

  isCancelRequested.value = true
  resetProcessState()

  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }

  videoFile.value = file
  videoUrl.value = URL.createObjectURL(file)
  clearResultAudio()

  sourceMeta.duration = 0
  sourceMeta.width = 0
  sourceMeta.height = 0
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
 * 将 AudioBuffer 转换为 WAV Blob
 * @param buffer 音频缓冲
 * @returns WAV 格式 Blob
 */
const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels
  const length = buffer.length * numOfChan * 2 + 44
  const bufferArr = new ArrayBuffer(length)
  const view = new DataView(bufferArr)
  const channels = []
  let i
  let sample
  let offset = 0
  let pos = 0

  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // file length - 8
  setUint32(0x45564157) // "WAVE"

  setUint32(0x20746d66) // "fmt " chunk
  setUint32(16) // length = 16
  setUint16(1) // PCM (uncompressed)
  setUint16(numOfChan)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * numOfChan)
  setUint16(numOfChan * 2)
  setUint16(16)

  setUint32(0x61746164) // "data" - chunk
  setUint32(length - pos - 4)

  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i))

  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos]))
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0
      view.setInt16(44 + offset, sample, true)
      offset += 2
    }
    pos++
  }

  return new Blob([bufferArr], { type: 'audio/wav' })

  function setUint16(data: any) {
    view.setUint16(pos, data, true)
    pos += 2
  }

  function setUint32(data: any) {
    view.setUint32(pos, data, true)
    pos += 4
  }
}

/**
 * 取消当前提取任务
 */
const cancelProcessing = () => {
  if (!isProcessing.value) return

  isCancelRequested.value = true
  currentTaskId.value = Date.now()
  statusText.value = '已取消处理'
  etaText.value = ''
  isProcessing.value = false
  ElMessage.info('已取消当前提取任务')
}

/**
 * 提取音频主流程
 */
const processVideo = async () => {
  if (!videoFile.value) {
    ElMessage.warning('请先上传视频文件')
    return
  }

  const taskId = Date.now()
  currentTaskId.value = taskId
  isCancelRequested.value = false
  isProcessing.value = true
  errorText.value = ''
  statusText.value = '正在读取视频数据...'
  progress.value = 8
  processStartedAt.value = Date.now()
  etaText.value = formatEtaText(null)
  clearResultAudio()

  let audioContext: AudioContext | null = null

  try {
    const arrayBuffer = await videoFile.value.arrayBuffer()
    if (isTaskInvalid(taskId)) {
      throw new DOMException('用户已取消处理', 'AbortError')
    }

    progress.value = 35
    statusText.value = '正在解码音频轨道...'
    updateEtaText(progress.value)

    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    if (isTaskInvalid(taskId)) {
      throw new DOMException('用户已取消处理', 'AbortError')
    }

    progress.value = 82
    statusText.value = '正在生成音频文件...'
    updateEtaText(progress.value)

    const blob = audioBufferToWav(audioBuffer)
    if (isTaskInvalid(taskId)) {
      throw new DOMException('用户已取消处理', 'AbortError')
    }

    resultAudioUrl.value = URL.createObjectURL(blob)
    resultAudioSizeMB.value = blob.size / 1024 / 1024
    resultDuration.value = audioBuffer.duration || 0

    progress.value = 100
    statusText.value = '提取完成'
    etaText.value = '预计剩余时间：约 0 秒'
    ElMessage.success('提取成功')
  } catch (error) {
    if (isTaskInvalid(taskId)) {
      errorText.value = ''
      statusText.value = '已取消处理'
    } else {
      const message = getFriendlyVideoError(error, '提取失败，视频可能没有音频轨道或格式不支持')
      errorText.value = message
      statusText.value = '提取失败'
      etaText.value = ''
      ElMessage.error(message)
    }
  } finally {
    if (audioContext) {
      audioContext.close().catch(() => {})
    }

    if (currentTaskId.value === taskId) {
      isProcessing.value = false
    }
  }
}

/**
 * 获取结果摘要文本
 * @returns 摘要文案
 */
const getResultSummary = () => {
  if (!videoFile.value || !resultAudioUrl.value) return '-'

  const delta = sourceSizeMB.value - resultAudioSizeMB.value
  const ratio = sourceSizeMB.value > 0 ? (delta / sourceSizeMB.value) * 100 : 0
  const label = delta >= 0 ? '体积减少' : '体积增加'
  return `${label} ${Math.abs(delta).toFixed(2)}MB（${Math.abs(ratio).toFixed(1)}%）`
}

/**
 * 结果对比指标
 */
const resultComparisonMetrics = computed(() => {
  const sourceExt = videoFile.value ? getFileExtension(videoFile.value.name).toUpperCase() || '视频' : '-'
  return [
    {
      label: '文件体积',
      before: `${sourceSizeMB.value.toFixed(2)} MB`,
      after: resultAudioUrl.value ? `${resultAudioSizeMB.value.toFixed(2)} MB` : '-'
    },
    {
      label: '时长',
      before: formatTime(sourceMeta.duration),
      after: resultDuration.value ? formatTime(resultDuration.value) : '-'
    },
    {
      label: '格式',
      before: sourceExt,
      after: 'WAV'
    }
  ]
})

const downloadResult = () => {
  if (!resultAudioUrl.value || !videoFile.value) return
  const a = document.createElement('a')
  a.href = resultAudioUrl.value
  const originalName = videoFile.value.name.replace(/\.[^/.]+$/, "")
  a.download = `${originalName}_audio.wav`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * 浏览器关闭或刷新前提醒
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
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  clearResultAudio()
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const dragOverHandler = (ev: DragEvent) => {
  ev.preventDefault()
  isDragOver.value = true
}

const dragLeaveHandler = (ev: DragEvent) => {
  ev.preventDefault()
  isDragOver.value = false
}

onBeforeRouteLeave((to, from, next) => {
  if (!isProcessing.value) {
    next()
    return
  }

  const shouldLeave = window.confirm('音频提取仍在处理中，离开页面会中断任务。确定要离开吗？')
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
        <div class="text-center mb-8">
          <h2
            class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            免费视频提取音频
          </h2>
          <p class="text-gray-500 text-sm">
            从视频中提取高品质音频，支持 MP4, WebM, MOV 等格式，本地处理保护隐私
          </p>
        </div>
        <VideoToolNotice class="mb-8" />

        <!-- Initial Upload Area -->
        <div v-if="!videoUrl"
          class="border-2 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer mb-8 relative overflow-hidden group"
          :class="[isDragOver ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50']"
          @click="fileInput?.click()"
          @dragover="dragOverHandler"
          @dragleave="dragLeaveHandler"
          @drop.prevent="handleDrop">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
            点击或拖拽视频文件到此处
          </h3>
          <p class="text-gray-500">支持 MP4, MOV, WebM, AVI 等格式</p>
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
                    <div class="text-xs text-gray-500">{{ (videoFile?.size ? videoFile.size / 1024 / 1024 : 0).toFixed(2) }}
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

                <button @click="processVideo" :disabled="isProcessing"
                  class="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]">
                  <span v-if="!isProcessing" class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    开始提取音频 (WAV)
                  </span>
                  <span v-else class="flex items-center">
                    <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            <div class="border border-gray-200 rounded-xl overflow-hidden bg-black flex items-center justify-center relative group">
              <video :src="videoUrl" controls class="w-full max-h-[500px]" @loadedmetadata="onSourceVideoLoaded"></video>
            </div>

            <!-- Result -->
            <div v-if="resultAudioUrl" class="bg-white rounded-xl border border-green-200 p-6 animate-fade-in relative overflow-hidden">
               <div class="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
               <div class="flex flex-col md:flex-row items-center gap-6">
                  <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl shrink-0">
                    ✓
                  </div>
                  <div class="flex-1 w-full text-center md:text-left">
                     <h3 class="text-xl font-bold text-gray-800 mb-2">提取成功！</h3>
                     <VideoResultComparison
                       class="mb-4 text-left"
                       :metrics="resultComparisonMetrics"
                       :summary="getResultSummary()"
                     />
                     <audio :src="resultAudioUrl" controls class="w-full mb-4"></audio>
                     <button @click="downloadResult"
                       class="inline-flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
                       <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                       下载音频文件
                     </button>
                  </div>
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
              <h4 class="font-medium text-gray-900">1. 上传视频</h4>
              <p>支持 MP4, WebM, MOV 等格式。文件处理完全在本地进行。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">2. 提取音频</h4>
              <p>点击开始提取按钮，系统将自动从视频中分离出音频轨道并转换为 WAV 格式。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">3. 下载保存</h4>
              <p>提取完成后可在线试听，确认无误后下载音频文件。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
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
