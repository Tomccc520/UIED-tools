<!--
 * @file VoiceRecorder.vue
 * @description 在线录音工具，支持录制、播放、下载及波形可视化
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()

// State
const isRecording = ref(false)
const isPaused = ref(false)
const recordingTime = ref(0)
const audioUrl = ref('')
const audioBlob = ref<Blob | null>(null)
const audioChunks = ref<Blob[]>([])

// Audio Context & Analyzer
let mediaRecorder: MediaRecorder | null = null
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let dataArray: Uint8Array | null = null
let source: MediaStreamAudioSourceNode | null = null
let animationId: number | null = null
let timerInterval: any = null

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Format time
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // Setup Audio Context for visualization
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)
    analyser.fftSize = 2048
    const bufferLength = analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)

    // Setup MediaRecorder
    mediaRecorder = new MediaRecorder(stream)
    audioChunks.value = []

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunks.value.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      audioBlob.value = new Blob(audioChunks.value, { type: 'audio/webm' })
      audioUrl.value = URL.createObjectURL(audioBlob.value)

      // Stop all tracks to release microphone
      stream.getTracks().forEach(track => track.stop())
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close()
      }
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }

    mediaRecorder.start()
    isRecording.value = true
    isPaused.value = false
    recordingTime.value = 0

    // Start timer
    timerInterval = setInterval(() => {
      if (!isPaused.value) {
        recordingTime.value++
      }
    }, 1000)

    drawVisualizer()

  } catch (error) {
    console.error('Error accessing microphone:', error)
    ElMessage.error('无法访问麦克风，请检查权限设置')
  }
}

const pauseRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause()
    isPaused.value = true
  }
}

const resumeRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'paused') {
    mediaRecorder.resume()
    isPaused.value = false
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
    isRecording.value = false
    isPaused.value = false
    clearInterval(timerInterval)
  }
}

const downloadAudio = () => {
  if (!audioUrl.value) return
  const a = document.createElement('a')
  a.href = audioUrl.value
  a.download = `recording_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const drawVisualizer = () => {
  if (!canvasRef.value || !analyser || !dataArray) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  const draw = () => {
    if (!isRecording.value && !isPaused.value) return // Stop drawing if stopped

    animationId = requestAnimationFrame(draw)

    analyser!.getByteTimeDomainData(dataArray as any)

    ctx.fillStyle = 'rgb(249, 250, 251)' // bg-gray-50
    ctx.fillRect(0, 0, width, height)

    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgb(37, 99, 235)' // blue-600

    ctx.beginPath()

    const sliceWidth = width * 1.0 / dataArray!.length
    let x = 0

    for (let i = 0; i < dataArray!.length; i++) {
      const v = dataArray![i] / 128.0
      const y = v * height / 2

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()
  }

  draw()
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  if (audioContext && audioContext.state !== 'closed') audioContext.close()
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-xl p-8 mb-8 shadow-sm">
      <!-- Header -->
      <div class="text-center mb-10 relative">
        <div class="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div class="w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
          <div class="w-64 h-64 bg-indigo-400 rounded-full blur-3xl -ml-20"></div>
        </div>
        <h1
          class="text-4xl font-extrabold mb-4 relative inline-block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          在线录音机
        </h1>
        <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">
          简单的在线录音工具，支持实时波形可视化，本地录制保护隐私
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left Sidebar: Controls -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
            <div class="flex items-center space-x-2 mb-6">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-800">录音控制</h2>
            </div>

            <div class="space-y-8 text-center">
              <!-- Timer Display -->
              <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div class="text-xs text-gray-400 mb-2 uppercase tracking-widest font-semibold">Recording Time</div>
                <div class="text-5xl font-mono font-bold text-blue-600 tracking-wider tabular-nums">
                  {{ formatTime(recordingTime) }}
                </div>
                <div
                  class="mt-4 flex items-center justify-center space-x-2 bg-gray-50 rounded-full py-1.5 px-4 inline-flex">
                  <span v-if="isRecording && !isPaused"
                    class="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                  <span class="text-xs text-gray-500 font-medium">
                    {{ isRecording ? (isPaused ? '已暂停' : '正在录音...') : '准备就绪' }}
                  </span>
                </div>
              </div>

              <!-- Control Buttons -->
              <div class="flex items-center justify-center gap-6">
                <button v-if="!isRecording && !audioUrl" @click="startRecording"
                  class="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all hover:scale-105 active:scale-95 group">
                  <svg class="w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor"
                    viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                      clip-rule="evenodd" />
                  </svg>
                </button>

                <template v-else-if="isRecording">
                  <button v-if="!isPaused" @click="pauseRecording"
                    class="w-14 h-14 rounded-full bg-white border border-gray-200 text-amber-500 hover:bg-amber-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                    title="暂停">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button v-else @click="resumeRecording"
                    class="w-14 h-14 rounded-full bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                    title="继续">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>

                  <button @click="stopRecording"
                    class="w-14 h-14 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                    title="停止">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </template>

                <template v-else>
                  <button @click="audioUrl = ''; isRecording = false; recordingTime = 0"
                    class="px-6 py-3 border border-gray-200 bg-white rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>重新录制</span>
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Usage Guide -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              使用说明
            </h3>
            <ul class="space-y-3 text-sm text-gray-600">
              <li class="flex items-start">
                <span
                  class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                <span>点击麦克风按钮并允许浏览器访问权限</span>
              </li>
              <li class="flex items-start">
                <span
                  class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                <span>录制过程中可暂停，观察实时波形</span>
              </li>
              <li class="flex items-start">
                <span
                  class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                <span>点击停止完成录制，可试听并下载</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right Content: Visualization & Result -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Visualizer -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 class="font-medium text-gray-700">实时波形</h3>
              </div>
            </div>

            <div class="w-full h-80 bg-gray-50 relative flex items-center justify-center">
              <canvas ref="canvasRef" width="800" height="320" class="w-full h-full"></canvas>
              <div v-if="!isRecording && !audioUrl"
                class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm flex-col bg-white/50 backdrop-blur-sm">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <span>点击左侧麦克风开始录音</span>
              </div>
            </div>
          </div>

          <!-- Result Area -->
          <transition name="fade">
            <div v-if="audioUrl" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all">
              <h3 class="font-bold text-gray-800 mb-6 flex items-center">
                <svg class="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                录音完成
              </h3>

              <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
                <audio :src="audioUrl" controls class="w-full h-12 rounded-lg"></audio>
              </div>

              <button @click="downloadAudio"
                class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>下载录音文件 (WebM)</span>
              </button>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
