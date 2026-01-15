<!--
 * @file ScreenRecorder.vue
 * @description 在线屏幕录制工具，支持录制屏幕、窗口或标签页，支持系统声音
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-30
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <div class="max-w-4xl mx-auto">
          <!-- 录制控制区域 -->
          <div class="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center">
            <!-- 视频预览 -->
            <div v-show="stream || recordedVideoURL" class="mb-8 relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                v-if="stream"
                ref="previewVideo"
                autoplay
                muted
                class="w-full h-full object-contain"
              ></video>
              <video
                v-else-if="recordedVideoURL"
                ref="playbackVideo"
                controls
                :src="recordedVideoURL"
                class="w-full h-full object-contain"
              ></video>
              <div v-else class="text-gray-500">
                预览区域
              </div>
              
              <!-- 录制计时器 -->
              <div v-if="isRecording" class="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-mono animate-pulse">
                {{ formatTime(recordingTime) }}
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="!stream && !recordedVideoURL" class="mb-8 py-12 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400">
              <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p>点击下方按钮开始录制</p>
            </div>

            <!-- 控制按钮 -->
            <div class="flex flex-wrap justify-center gap-4">
              <button
                v-if="!isRecording && !stream"
                @click="startCapture"
                class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                开始录制
              </button>

              <button
                v-if="isRecording"
                @click="stopRecording"
                class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                停止录制
              </button>

              <button
                v-if="recordedVideoURL"
                @click="downloadVideo"
                class="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载视频
              </button>

              <button
                v-if="recordedVideoURL"
                @click="reset"
                class="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                重新录制
              </button>
            </div>
            
            <div class="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
               <label class="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" v-model="recordAudio" class="rounded text-blue-600 focus:ring-blue-500" :disabled="isRecording">
                 <span>录制系统声音</span>
               </label>
               <label class="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" v-model="recordMic" class="rounded text-blue-600 focus:ring-blue-500" :disabled="isRecording">
                 <span>录制麦克风</span>
               </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="feature in features" :key="feature.title" class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 flex-shrink-0">
                <span v-html="feature.icon"></span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">{{ feature.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />

      <!-- 使用说明 -->
      <UsageGuide :steps="guideSteps" :notes="guideNotes" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()

const info = reactive({
  title: "在线屏幕录制",
  subtitle: "免费在线录制屏幕、窗口或标签页，无需安装插件，支持录制系统声音"
})

const stream = ref<MediaStream | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const recordedChunks = ref<Blob[]>([])
const isRecording = ref(false)
const recordingTime = ref(0)
const timerInterval = ref<any>(null)
const recordedVideoURL = ref('')
const previewVideo = ref<HTMLVideoElement | null>(null)

const recordAudio = ref(false)
const recordMic = ref(false)

const features = [
  {
    title: '无需安装',
    desc: '直接在浏览器中运行，无需下载安装任何软件或插件',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>`
  },
  {
    title: '高清录制',
    desc: '支持录制高清视频，可选择整个屏幕、应用窗口或浏览器标签页',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`
  },
  {
    title: '隐私安全',
    desc: '录制过程在本地完成，视频文件不经过服务器，绝对安全',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>`
  }
]

const guideSteps = [
  { title: '开始录制', description: '点击“开始录制”按钮，选择要录制的屏幕、窗口或标签页。如果需要录制声音，请勾选相应选项。' },
  { title: '进行录制', description: '浏览器将开始录制您选择的内容，您可以随时点击“停止录制”结束。' },
  { title: '下载保存', description: '录制完成后，您可以预览视频并点击“下载视频”保存到本地。' }
]

const guideNotes = [
  '录制系统声音功能通常仅在录制整个屏幕或标签页时可用。',
  '支持的视频格式取决于您的浏览器，通常为 WebM 格式。'
]

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startCapture = async () => {
  try {
    const displayMediaOptions: DisplayMediaStreamOptions = {
      video: true,
      audio: recordAudio.value
    }

    const displayStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
    
    let tracks = [...displayStream.getTracks()]

    if (recordMic.value) {
        try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
            tracks = [...tracks, ...micStream.getAudioTracks()]
        } catch (err) {
            ElMessage.warning('无法获取麦克风权限')
        }
    }
    
    const combinedStream = new MediaStream(tracks)
    stream.value = combinedStream
    
    // Preview
    if (previewVideo.value) {
      previewVideo.value.srcObject = combinedStream
    }

    // Start Recording
    recordedChunks.value = []
    mediaRecorder.value = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9' })

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = () => {
      stopTimer()
      const blob = new Blob(recordedChunks.value, { type: 'video/webm' })
      recordedVideoURL.value = URL.createObjectURL(blob)
      stream.value?.getTracks().forEach(track => track.stop())
      stream.value = null
      isRecording.value = false
    }

    // Handle user clicking "Stop sharing" in browser UI
    displayStream.getVideoTracks()[0].onended = () => {
        if (isRecording.value) {
            stopRecording()
        }
    }

    mediaRecorder.value.start()
    isRecording.value = true
    startTimer()

  } catch (err) {
    console.error("Error: " + err)
    ElMessage.error('无法开始录制，请检查权限')
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
  }
}

const downloadVideo = () => {
  if (!recordedVideoURL.value) return
  const a = document.createElement('a')
  a.href = recordedVideoURL.value
  a.download = `screen-recording-${new Date().getTime()}.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const reset = () => {
  if (recordedVideoURL.value) {
    URL.revokeObjectURL(recordedVideoURL.value)
    recordedVideoURL.value = ''
  }
  recordedChunks.value = []
  recordingTime.value = 0
}

const startTimer = () => {
  recordingTime.value = 0
  timerInterval.value = setInterval(() => {
    recordingTime.value++
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

onBeforeUnmount(() => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
  if (recordedVideoURL.value) {
    URL.revokeObjectURL(recordedVideoURL.value)
  }
  stopTimer()
})
</script>