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
  if (!videoRef.value) return
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    // If current time is out of range, jump to start
    if (videoRef.value.currentTime < timeRange.value[0] || videoRef.value.currentTime >= timeRange.value[1]) {
      videoRef.value.currentTime = timeRange.value[0]
    }
    videoRef.value.play()
  }
}

const onPlay = () => isPlaying.value = true
const onPause = () => isPlaying.value = false

// Watch range changes to seek video for preview
watch(timeRange, (newVal, oldVal) => {
  if (!videoRef.value) return
  // If start time changed, seek to start
  if (newVal[0] !== oldVal[0]) {
    videoRef.value.currentTime = newVal[0]
  }
  // If end time changed, seek to end (preview frame)
  else if (newVal[1] !== oldVal[1]) {
    videoRef.value.currentTime = newVal[1]
  }
})

const processVideo = async () => {
  if (!videoRef.value) return
  
  const startTime = timeRange.value[0]
  const endTime = timeRange.value[1]
  const trimDuration = endTime - startTime
  
  if (trimDuration < 0.5) {
    ElMessage.warning('剪辑片段太短，请至少选择 0.5 秒')
    return
  }

  isProcessing.value = true
  statusText.value = '准备处理...'
  progress.value = 0
  
  const video = videoRef.value
  
  // Use MediaRecorder to record the segment
  // We need to play the video from start to end
  
  // Create a stream from the video element (captureStream)
  // Note: captureStream might not capture audio in some browsers if not playing
  // But usually it works.
  
  let stream: MediaStream | null = null
  
  try {
    // @ts-ignore
    stream = video.captureStream ? video.captureStream() : (video.mozCaptureStream ? video.mozCaptureStream() : null)
  } catch (e) {
    console.warn('captureStream failed', e)
  }
  
  if (!stream) {
    ElMessage.error('您的浏览器不支持视频录制')
    isProcessing.value = false
    return
  }
  
  // Ensure audio track exists if video has audio
  // If captureStream doesn't include audio (sometimes happens if muted or not playing), try to get it
  // But usually for local video file playback it works fine.
  
  const mimeType = 'video/webm;codecs=vp9,opus'
  const options = MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : { mimeType: 'video/webm' }
  const mediaRecorder = new MediaRecorder(stream, options)
  const chunks: Blob[] = []
  
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }
  
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' })
    resultVideoUrl.value = URL.createObjectURL(blob)
    isProcessing.value = false
    progress.value = 100
    statusText.value = '处理完成！'
    ElMessage.success('剪辑完成')
    
    // Restore video state
    video.currentTime = startTime
    video.pause()
  }
  
  // Start recording process
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
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">视频时长剪辑</h2>
          <p class="text-gray-500 text-sm">在线截取视频片段，精准控制开始和结束时间</p>
        </div>

        <!-- Upload Area -->
        <div class="border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-8 relative overflow-hidden group"
          :class="[isDragOver ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50']"
          v-if="!videoUrl"
          @click="fileInput?.click()"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="text-6xl mb-4 text-blue-500 transition-transform group-hover:scale-110 duration-300">✂️</div>
          <p class="text-xl font-bold text-gray-700 mb-2">点击或拖拽视频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP4, WebM, MOV 等格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="max-w-4xl mx-auto space-y-8 animate-fade-in">
          <!-- Preview Player -->
          <div class="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center shadow-lg relative group">
            <video 
              ref="videoRef" 
              :src="videoUrl" 
              class="max-w-full max-h-[500px]" 
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
                <svg class="w-8 h-8 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg>
              </div>
            </div>
          </div>
          
          <!-- Controls -->
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div class="flex items-center justify-between mb-6">
               <h3 class="font-bold text-gray-800 flex items-center">
                 <span class="w-1 h-5 bg-blue-600 rounded-full mr-2"></span>
                 剪辑设置
               </h3>
               <div class="text-sm font-mono text-gray-600 bg-white px-3 py-1 rounded border border-gray-200">
                 当前时间: {{ formatTime(currentTime) }}
               </div>
            </div>

            <!-- Range Slider -->
            <div class="px-4 mb-8">
              <el-slider 
                v-model="timeRange" 
                range 
                :max="duration" 
                :step="0.1"
                :format-tooltip="formatTime"
                class="mb-2"
              />
              <div class="flex justify-between text-sm text-gray-500 font-mono">
                <div>Start: {{ formatTime(timeRange[0]) }}</div>
                <div>Duration: {{ formatTime(timeRange[1] - timeRange[0]) }}</div>
                <div>End: {{ formatTime(timeRange[1]) }}</div>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
               <button @click="fileInput?.click()" class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition-colors">
                 更换视频
               </button>
               <button @click="processVideo" :disabled="isProcessing"
                 class="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                 <span v-if="isProcessing" class="mr-2 animate-spin">⏳</span>
                 {{ isProcessing ? `正在剪辑 (${progress}%)` : '开始剪辑并导出' }}
               </button>
            </div>
            
            <!-- Hidden inputs -->
            <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          </div>

          <!-- Result -->
          <div v-if="resultVideoUrl" class="bg-green-50 border border-green-100 rounded-xl p-8 text-center animate-fade-in shadow-sm">
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h3 class="text-xl text-gray-800 font-bold mb-6">剪辑完成！</h3>
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 max-w-2xl mx-auto">
               <video :src="resultVideoUrl" controls class="w-full rounded-lg"></video>
            </div>
            <button @click="downloadResult"
              class="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center mx-auto">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              下载剪辑后的视频
            </button>
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
</style>