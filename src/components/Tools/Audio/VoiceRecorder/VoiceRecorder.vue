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
import { ref, onUnmounted, onMounted } from 'vue'
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
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[500px] flex flex-col items-center justify-center">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">在线录音机</h2>
          <p class="text-gray-500 text-sm">简单的在线录音工具，支持波形可视化和本地保存</p>
        </div>

        <!-- Timer Display -->
        <div class="text-6xl font-mono font-bold text-gray-700 mb-8 tracking-wider">
          {{ formatTime(recordingTime) }}
        </div>

        <!-- Visualizer -->
        <div class="w-full max-w-2xl h-32 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 mb-8 relative">
          <canvas ref="canvasRef" width="800" height="128" class="w-full h-full"></canvas>
          <div v-if="!isRecording && !audioUrl"
            class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            点击开始录音以显示波形
          </div>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-6 mb-8">
          <button v-if="!isRecording && !audioUrl" @click="startRecording"
            class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clip-rule="evenodd" />
            </svg>
          </button>

          <template v-else-if="isRecording">
            <button v-if="!isPaused" @click="pauseRecording"
              class="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors"
              title="暂停">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
            </button>
            <button v-else @click="resumeRecording"
              class="w-12 h-12 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors"
              title="继续">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clip-rule="evenodd" />
              </svg>
            </button>

            <button @click="stopRecording"
              class="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 animate-pulse"
              title="停止">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </template>

          <template v-else>
            <button @click="audioUrl = ''; isRecording = false; recordingTime = 0"
              class="px-6 py-2 border border-gray-300 rounded-full text-gray-600 hover:bg-gray-50 transition-colors">
              重新录制
            </button>
            <button @click="downloadAudio"
              class="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
              下载录音
            </button>
          </template>
        </div>

        <!-- Audio Player -->
        <div v-if="audioUrl" class="w-full max-w-md bg-gray-50 p-4 rounded-xl border border-gray-200">
          <audio :src="audioUrl" controls class="w-full"></audio>
        </div>

      </div>

      <!-- Usage Instructions -->
      <div class="bg-white rounded-xl p-8 shadow-sm">
        <h3 class="text-xl font-bold mb-4 text-gray-800">使用说明</h3>
        <div class="space-y-4 text-gray-600">
          <div>
            <h4 class="font-medium text-gray-800 mb-2">1. 授权麦克风</h4>
            <p class="text-sm">首次使用需要允许浏览器访问您的麦克风。请在弹出的提示框中点击"允许"。</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-800 mb-2">2. 开始录制</h4>
            <p class="text-sm">点击红色的麦克风按钮开始录音。录制过程中可以看到实时的声波变化。</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-800 mb-2">3. 暂停与停止</h4>
            <p class="text-sm">录制过程中可以随时暂停。完成后点击停止按钮结束录音。</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-800 mb-2">4. 试听与下载</h4>
            <p class="text-sm">录音结束后可以直接在线试听。满意后点击"下载录音"按钮保存为 WebM 格式文件。</p>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg">
            <h4 class="font-medium text-blue-800 mb-2">🔒 隐私安全说明</h4>
            <p class="text-sm text-blue-700">录音数据仅在您的浏览器本地处理，不会上传到任何服务器。关闭页面后录音数据将自动清除。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>
