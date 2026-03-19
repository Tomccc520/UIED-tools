<!--
 * @file VideoTrimmer.vue
 * @description 视频时长剪辑工具，支持截取视频片段
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
import { ref, reactive, onUnmounted, watch } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import VideoToolNotice from '@/components/Tools/Video/Shared/VideoToolNotice.vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()

const fileInput = ref<HTMLInputElement | null>(null)
const videoFile = ref<File | null>(null)
const videoUrl = ref<string>('')
const resultVideoUrl = ref<string>('')
const videoRef = ref<HTMLVideoElement | null>(null)

const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')
const isDragOver = ref(false)

const duration = ref(0)
const currentTime = ref(0)
const isPlaying = ref(false)
const timeRange = ref<[number, number]>([0, 10]) // Start, End in seconds

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`
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

const loadVideo = (file: File) => {
  if (!file.type.startsWith('video/')) {
    ElMessage.warning('请选择有效的视频文件')
    return
  }

  videoFile.value = file
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (resultVideoUrl.value) URL.revokeObjectURL(resultVideoUrl.value)

  videoUrl.value = URL.createObjectURL(file)
  resultVideoUrl.value = ''
  progress.value = 0
  statusText.value = ''

  // Reset state
  duration.value = 0
  currentTime.value = 0
  isPlaying.value = false
}

const onVideoLoaded = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
    timeRange.value = [0, Math.min(videoRef.value.duration, 10)] // Default 10s or full length
  }
}

const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    // Loop preview within range
    if (isPlaying.value && currentTime.value >= timeRange.value[1]) {
      videoRef.value.currentTime = timeRange.value[0]
      // Optional: pause at end
      // videoRef.value.pause()
      // isPlaying.value = false
    }
  }
}

const togglePlay = () => {
  if (videoRef.value) {
    if (videoRef.value.paused) {
      // If outside range, start from beginning of range
      if (currentTime.value < timeRange.value[0] || currentTime.value >= timeRange.value[1]) {
        videoRef.value.currentTime = timeRange.value[0]
      }
      videoRef.value.play()
    } else {
      videoRef.value.pause()
    }
  }
}

const onPlay = () => { isPlaying.value = true }
const onPause = () => { isPlaying.value = false }

// Watch range changes to seek video
watch(timeRange, (newVal, oldVal) => {
  if (!videoRef.value) return
  // If start time changed, seek to start
  if (Math.abs(newVal[0] - oldVal[0]) > 0.1) {
    videoRef.value.currentTime = newVal[0]
  }
})

const processVideo = async () => {
  if (!videoRef.value || !videoFile.value) return

  isProcessing.value = true
  progress.value = 0
  statusText.value = '准备处理...'
  resultVideoUrl.value = ''

  const startTime = timeRange.value[0]
  const endTime = timeRange.value[1]
  const trimDuration = endTime - startTime

  // Use MediaRecorder to capture the played video
  // Note: This captures played content, so it happens in real-time (1x speed)
  // For faster processing, we'd need ffmpeg.wasm, but this is a pure JS/Browser API implementation

  const stream = (videoRef.value as any).captureStream() as MediaStream
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9'
  })

  const chunks: Blob[] = []

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' })
    resultVideoUrl.value = URL.createObjectURL(blob)
    isProcessing.value = false
    progress.value = 100
    statusText.value = '剪辑完成'
    ElMessage.success('剪辑完成')
  }

  // Start recording process
  const video = videoRef.value
  video.currentTime = startTime
  // Wait for seek
  await new Promise(r => setTimeout(r, 200))

  mediaRecorder.start()
  video.play()
  statusText.value = '正在录制剪辑片段...'

  const checkTime = () => {
    if (!isProcessing.value) return // Aborted

    progress.value = Math.min(99, Math.round(((video.currentTime - startTime) / trimDuration) * 100))

    if (video.currentTime >= endTime || video.ended) {
      video.pause()
      mediaRecorder.stop()
    } else {
      requestAnimationFrame(checkTime)
    }
  }

  requestAnimationFrame(checkTime)
}

const downloadResult = () => {
  if (!resultVideoUrl.value) return
  const a = document.createElement('a')
  a.href = resultVideoUrl.value
  a.download = `trimmed_${new Date().getTime()}.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onUnmounted(() => {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (resultVideoUrl.value) URL.revokeObjectURL(resultVideoUrl.value)
})

const dragOverHandler = (ev: DragEvent) => {
  ev.preventDefault()
  isDragOver.value = true
}

const dragLeaveHandler = (ev: DragEvent) => {
  ev.preventDefault()
  isDragOver.value = false
}
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2
            class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            免费视频时长剪辑
          </h2>
          <p class="text-gray-500 text-sm">在线截取视频片段，精准控制开始和结束时间，本地处理保护隐私</p>
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
            点击或拖拽视频文件到此处
          </h3>
          <p class="text-gray-500">支持 MP4, WebM, MOV 等格式</p>
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
                <!-- Range Inputs -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">截取时间 (秒)</label>
                  <div class="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <span class="text-xs text-gray-500">开始</span>
                      <el-input-number v-model="timeRange[0]" :min="0" :max="timeRange[1]" :step="0.1" size="small" class="w-full" />
                    </div>
                    <div>
                      <span class="text-xs text-gray-500">结束</span>
                      <el-input-number v-model="timeRange[1]" :min="timeRange[0]" :max="duration" :step="0.1" size="small" class="w-full" />
                    </div>
                  </div>
                  <div class="flex justify-between text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
                    <span>时长: {{ formatTime(timeRange[1] - timeRange[0]) }}</span>
                    <span>总长: {{ formatTime(duration) }}</span>
                  </div>
                </div>

                <div v-if="isProcessing" class="bg-white p-4 rounded-xl border border-gray-200">
                   <div class="flex justify-between text-xs font-medium text-gray-600 mb-2">
                      <span>{{ statusText }}</span>
                      <span>{{ progress }}%</span>
                   </div>
                   <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
                   </div>
                </div>

                <button @click="processVideo" :disabled="isProcessing"
                  class="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform active:scale-[0.98]">
                  <span v-if="!isProcessing" class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    开始剪辑并导出
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
            <!-- Video Player with Range Slider -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div class="bg-black aspect-video flex items-center justify-center relative group">
                <video
                  ref="videoRef"
                  :src="videoUrl"
                  class="w-full max-h-[500px]"
                  @loadedmetadata="onVideoLoaded"
                  @timeupdate="onTimeUpdate"
                  @play="onPlay"
                  @pause="onPause"
                  @click="togglePlay"
                ></video>

                <!-- Play Button Overlay -->
                <div
                  v-if="!isPlaying"
                  class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors cursor-pointer"
                  @click="togglePlay"
                >
                  <div class="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:scale-110 transition-transform">
                    <svg class="w-8 h-8 text-indigo-600 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
                  </div>
                </div>
              </div>

              <!-- Timeline/Slider -->
              <div class="p-6 bg-gray-50 border-t border-gray-100">
                <div class="mb-2 flex justify-between text-xs text-gray-500">
                  <span>{{ formatTime(timeRange[0]) }}</span>
                  <span>当前: {{ formatTime(currentTime) }}</span>
                  <span>{{ formatTime(timeRange[1]) }}</span>
                </div>
                <el-slider
                  v-model="timeRange"
                  range
                  :max="duration"
                  :step="0.1"
                  :format-tooltip="formatTime"
                  class="mb-2"
                />
              </div>
            </div>

            <!-- Result -->
            <div v-if="resultVideoUrl" class="bg-white rounded-xl border border-green-200 p-6 shadow-sm animate-fade-in">
               <div class="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                 <div class="flex items-center space-x-2">
                   <div class="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                     ✓
                   </div>
                   <h3 class="font-bold text-gray-800">剪辑完成</h3>
                 </div>
                 <button @click="downloadResult"
                   class="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors">
                   <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                   下载视频
                 </button>
               </div>

               <div class="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                  <video :src="resultVideoUrl" controls class="w-full max-h-[400px]"></video>
               </div>
            </div>
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
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
              <h4 class="font-medium text-gray-900">2. 选择片段</h4>
              <p>使用下方的时间轴滑块或左侧输入框，精确选择视频的开始和结束时间。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">3. 剪辑下载</h4>
              <p>点击开始剪辑，系统将录制选定片段。完成后可预览并下载新视频。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

:deep(.el-slider__runway) {
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>
