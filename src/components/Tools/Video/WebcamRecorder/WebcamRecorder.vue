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
import VideoToolNotice from '@/components/Tools/Video/Shared/VideoToolNotice.vue'
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
      <div class="bg-white rounded-xl shadow-sm min-h-[600px] p-6 sm:p-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">免费摄像头录制</h2>
          <p class="text-gray-500 text-sm">在线录制摄像头视频，支持高清录制和音频采集</p>
        </div>
        <VideoToolNotice class="mb-8" />

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left: Configuration Panel -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                录制设置
              </h3>

              <div class="space-y-6">
                <!-- Settings (Only when not recording and no result) -->
                <div v-if="!isRecording && !recordedVideoURL && !stream" class="bg-white rounded-lg p-4 border border-gray-200">
                   <label class="flex items-center gap-3 cursor-pointer hover:text-indigo-600 transition-colors">
                     <div class="relative flex items-center">
                       <input type="checkbox" v-model="settings.audio" class="peer sr-only">
                       <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                     </div>
                     <span class="text-sm font-medium text-gray-700">录制麦克风声音</span>
                   </label>
                </div>

                <div class="space-y-3">
                  <!-- Initial State -->
                  <button v-if="!stream && !recordedVideoURL" @click="startCamera"
                    class="w-full py-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    开启摄像头
                  </button>

                  <!-- Ready to Record -->
                  <button v-if="stream && !isRecording" @click="startRecording"
                    class="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center animate-pulse">
                    <div class="w-4 h-4 bg-white rounded-full mr-2"></div>
                    开始录制
                  </button>

                  <!-- Recording -->
                  <button v-if="isRecording" @click="stopRecording"
                    class="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-all shadow-md hover:shadow-lg flex items-center justify-center">
                    <div class="w-4 h-4 bg-white rounded-sm mr-2"></div>
                    停止录制
                  </button>

                  <!-- Result Actions -->
                  <template v-if="recordedVideoURL">
                    <button @click="downloadVideo"
                      class="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      下载视频
                    </button>
                    <button @click="reset"
                      class="w-full py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                      重新录制
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Preview/Playback Area -->
          <div class="lg:col-span-8 space-y-6">
             <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div class="relative aspect-video bg-black flex items-center justify-center group">
                  <!-- Live Camera Preview -->
                  <video v-if="stream && !recordedVideoURL" ref="previewVideo" autoplay muted playsinline
                    class="w-full h-full object-contain transform scale-x-[-1]"></video>

                  <!-- Recorded Video Playback -->
                  <video v-else-if="recordedVideoURL" ref="playbackVideo" controls :src="recordedVideoURL"
                    class="w-full h-full object-contain"></video>

                  <!-- Placeholder -->
                  <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                    <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p class="text-xl font-medium text-gray-700 mb-2">点击左侧"开启摄像头"开始</p>
                    <p class="text-sm text-gray-500">支持高清视频录制与音频采集</p>
                  </div>

                  <!-- Recording Timer -->
                  <div v-if="isRecording"
                    class="absolute top-4 right-4 bg-red-600/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-mono animate-pulse flex items-center shadow-lg border border-white/20">
                    <div class="w-2 h-2 bg-white rounded-full mr-2"></div>
                    {{ formatTime(recordingTime) }}
                  </div>
                </div>
             </div>
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-12">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
             <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             使用说明
           </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">1</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">开启权限</h4>
                <p>点击"开启摄像头"按钮，允许浏览器访问您的摄像头和麦克风权限。</p>
              </div>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">2</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">录制视频</h4>
                <p>点击开始录制，支持长达 60 分钟的高清视频录制。录制过程中请保持页面在前台。</p>
              </div>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">3</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">保存分享</h4>
                <p>录制完成后可直接预览，点击下载即可保存 WebM 格式视频到本地。</p>
              </div>
            </div>
          </div>
          <div class="mt-6 pt-6 border-t border-gray-200">
             <div class="flex items-center text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200">
               <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </svg>
               <span class="text-gray-700 font-medium mr-2">隐私安全说明:</span>
               本工具所有录制过程均在您的浏览器本地完成，视频数据不会上传至任何服务器。
             </div>
           </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>
