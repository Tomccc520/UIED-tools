<!--
 * @file WebcamRecorder.vue
 * @description 在线摄像头录制工具，支持录制视频和音频
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
import { ref, onUnmounted, reactive } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { ElMessage } from 'element-plus'

import { useRoute } from 'vue-router'

const route = useRoute()
const previewVideo = ref<HTMLVideoElement | null>(null)
const playbackVideo = ref<HTMLVideoElement | null>(null)

const stream = ref<MediaStream | null>(null)
const mediaRecorder = ref<MediaRecorder | null>(null)
const recordedChunks = ref<Blob[]>([])
const recordedVideoURL = ref<string>('')
const isRecording = ref(false)
const recordingTime = ref(0)
const timerInterval = ref<number | null>(null)

// Settings
const settings = reactive({
  audio: true,
  video: true
})

/**
 * 格式化时间
 */
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/**
 * 开启摄像头
 */
const startCamera = async () => {
  try {
    const constraints = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: settings.audio
    }

    stream.value = await navigator.mediaDevices.getUserMedia(constraints)

    if (previewVideo.value) {
      previewVideo.value.srcObject = stream.value
    }

    // Clear previous recording
    if (recordedVideoURL.value) {
      URL.revokeObjectURL(recordedVideoURL.value)
      recordedVideoURL.value = ''
    }
  } catch (err) {
    console.error('Error accessing camera:', err)
    ElMessage.error('无法访问摄像头或麦克风，请检查权限设置')
  }
}

/**
 * 停止摄像头
 */
const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
  if (previewVideo.value) {
    previewVideo.value.srcObject = null
  }
}

/**
 * 开始录制
 */
const startRecording = () => {
  if (!stream.value) return

  recordedChunks.value = []
  const options = { mimeType: 'video/webm;codecs=vp9' }

  try {
    mediaRecorder.value = new MediaRecorder(stream.value, options)
  } catch (e) {
    // Fallback if vp9 not supported
    mediaRecorder.value = new MediaRecorder(stream.value)
  }

  if (!mediaRecorder.value) return

  mediaRecorder.value.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.value.push(event.data)
    }
  }

  mediaRecorder.value.onstop = () => {
    const blob = new Blob(recordedChunks.value, { type: 'video/webm' })
    recordedVideoURL.value = URL.createObjectURL(blob)
    stopCamera() // Stop camera after recording to show preview
  }

  mediaRecorder.value.start()
  isRecording.value = true
  recordingTime.value = 0

  timerInterval.value = window.setInterval(() => {
    recordingTime.value++
  }, 1000)
}

/**
 * 停止录制
 */
const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }
}

/**
 * 下载视频
 */
const downloadVideo = () => {
  if (!recordedVideoURL.value) return

  const a = document.createElement('a')
  a.href = recordedVideoURL.value
  a.download = `webcam-recording-${new Date().getTime()}.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * 重新开始
 */
const reset = () => {
  stopCamera()
  if (recordedVideoURL.value) {
    URL.revokeObjectURL(recordedVideoURL.value)
    recordedVideoURL.value = ''
  }
  startCamera()
}

onUnmounted(() => {
  stopCamera()
  if (recordedVideoURL.value) {
    URL.revokeObjectURL(recordedVideoURL.value)
  }
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">摄像头录制</h2>
          <p class="text-gray-500 text-sm">在线录制摄像头视频，支持高清录制和音频采集</p>
        </div>

        <div class="max-w-4xl mx-auto">
          <!-- Preview/Playback Area -->
          <div class="relative aspect-video bg-black rounded-lg overflow-hidden mb-6 group shadow-lg">
            <!-- Live Camera Preview -->
            <video v-if="stream && !recordedVideoURL" ref="previewVideo" autoplay muted playsinline
              class="w-full h-full object-contain transform scale-x-[-1]"></video>

            <!-- Recorded Video Playback -->
            <video v-else-if="recordedVideoURL" ref="playbackVideo" controls :src="recordedVideoURL"
              class="w-full h-full object-contain"></video>

            <!-- Placeholder -->
            <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <div class="text-6xl mb-4 text-gray-300">📹</div>
              <p class="text-xl font-medium text-gray-700 mb-2">点击下方按钮开启摄像头</p>
              <p class="text-sm text-gray-500">支持高清视频录制与音频采集</p>
            </div>

            <!-- Recording Timer -->
            <div v-if="isRecording"
              class="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-mono animate-pulse flex items-center shadow-lg">
              <div class="w-2 h-2 bg-white rounded-full mr-2"></div>
              {{ formatTime(recordingTime) }}
            </div>
          </div>

          <!-- Controls -->
          <div class="flex flex-col items-center gap-6 mb-12">
            <!-- Settings (Only when not recording and no result) -->
            <div v-if="!isRecording && !recordedVideoURL && !stream" class="flex gap-6 text-sm text-gray-600">
              <label class="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
                <input type="checkbox" v-model="settings.audio" class="rounded text-blue-600 focus:ring-blue-500">
                录制麦克风声音
              </label>
            </div>

            <div class="flex gap-4">
              <!-- Initial State -->
              <button v-if="!stream && !recordedVideoURL" @click="startCamera"
                class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                开启摄像头
              </button>

              <!-- Ready to Record -->
              <button v-if="stream && !isRecording" @click="startRecording"
                class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center">
                <div class="w-4 h-4 bg-white rounded-full mr-2"></div>
                开始录制
              </button>

              <!-- Recording -->
              <button v-if="isRecording" @click="stopRecording"
                class="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center">
                <div class="w-4 h-4 bg-white rounded-sm mr-2"></div>
                停止录制
              </button>

              <!-- Result Actions -->
              <template v-if="recordedVideoURL">
                <button @click="downloadVideo"
                  class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center shadow-md">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下载视频
                </button>
                <button @click="reset"
                  class="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                  重新录制
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Instructions -->
      <div class="bg-white rounded-xl p-8 shadow-sm">
        <h3 class="text-xl font-bold mb-4 text-gray-800">使用说明</h3>
        <div class="space-y-4 text-gray-600">
          <div>
            <h4 class="font-medium text-gray-800 mb-2">1. 开启权限</h4>
            <p class="text-sm">点击"开启摄像头"按钮，允许浏览器访问您的摄像头和麦克风权限。</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-800 mb-2">2. 录制视频</h4>
            <p class="text-sm">点击开始录制，支持长达 60 分钟的高清视频录制。录制过程中请保持页面在前台。</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-800 mb-2">3. 保存分享</h4>
            <p class="text-sm">录制完成后可直接预览，点击下载即可保存 WebM 格式视频到本地。</p>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg">
            <h4 class="font-medium text-blue-800 mb-2">🔒 隐私安全说明</h4>
            <p class="text-sm text-blue-700">本工具所有录制过程均在您的浏览器本地完成，视频数据不会上传至任何服务器。</p>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>
