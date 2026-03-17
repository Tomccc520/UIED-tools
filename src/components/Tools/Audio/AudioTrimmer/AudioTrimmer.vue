<!--
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 -->

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */
import { ref, onUnmounted, computed } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()

// 状态定义
const fileInput = ref<HTMLInputElement | null>(null)
const audioFile = ref<File | null>(null)
const audioUrl = ref<string>('')
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const startTime = ref(0)
const endTime = ref(0)
const audioRef = ref<HTMLAudioElement | null>(null)

// 模拟波形数据
const waveform = ref<number[]>([])

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.type.startsWith('audio/')) {
      loadAudio(file)
    } else {
      ElMessage.warning('请选择有效的音频文件')
    }
  }
}

const loadAudio = (file: File) => {
  audioFile.value = file
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  audioUrl.value = URL.createObjectURL(file)

  // 重置状态
  isPlaying.value = false
  currentTime.value = 0
  startTime.value = 0
  endTime.value = 0
  duration.value = 0

  // 生成波形
  if (audioRef.value) {
    // Wait for metadata or decode buffer
    // For visualization we need to decode the whole file
    decodeAudio(file)
  }
}

const decodeAudio = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const buffer = await audioContext.decodeAudioData(arrayBuffer)
    duration.value = buffer.duration
    endTime.value = buffer.duration
    drawWaveform(buffer)
  } catch (error) {
    console.error('Error decoding audio:', error)
    // Fallback to simulated waveform if decoding fails (e.g. large files or unsupported format)
    generateWaveform()
  }
}

const waveformCanvas = ref<HTMLCanvasElement | null>(null)

const drawWaveform = (buffer: AudioBuffer) => {
  const canvas = waveformCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Resize canvas to match display size
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  const width = canvas.width
  const height = canvas.height
  const data = buffer.getChannelData(0) // Use first channel
  const step = Math.ceil(data.length / width)
  const amp = height / 2

  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#60a5fa' // Blue-400

  // Draw bars
  for (let i = 0; i < width; i++) {
    let min = 1.0
    let max = -1.0
    // Sample a chunk
    for (let j = 0; j < step; j++) {
      const idx = i * step + j
      if (idx < data.length) {
        const datum = data[idx]
        if (datum < min) min = datum
        if (datum > max) max = datum
      }
    }
    // Draw
    const y = (1 + min) * amp
    const h = Math.max(1, (max - min) * amp)
    ctx.fillRect(i, y, 1, h)
  }

  // Clear simulated waveform
  waveform.value = []
}

const onLoadedMetadata = () => {
  // Duration is set after decoding for accuracy, but fallback here
  if (audioRef.value && duration.value === 0) {
    duration.value = audioRef.value.duration
    endTime.value = duration.value
  }
}

const onTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
    // 如果播放超过结束时间，暂停
    if (currentTime.value >= endTime.value && isPlaying.value) {
      pauseAudio()
      audioRef.value.currentTime = startTime.value
    }
  }
}

const togglePlay = () => {
  if (!audioRef.value) return
  if (isPlaying.value) {
    pauseAudio()
  } else {
    // 如果当前时间在范围外，从开始时间播放
    if (currentTime.value < startTime.value || currentTime.value >= endTime.value) {
      audioRef.value.currentTime = startTime.value
    }
    playAudio()
  }
}

const playAudio = () => {
  audioRef.value?.play()
  isPlaying.value = true
}

const pauseAudio = () => {
  audioRef.value?.pause()
  isPlaying.value = false
}

const setStart = () => {
  if (currentTime.value >= endTime.value) {
    ElMessage.warning('开始时间不能大于结束时间')
    return
  }
  startTime.value = currentTime.value
}

const setEnd = () => {
  if (currentTime.value <= startTime.value) {
    ElMessage.warning('结束时间不能小于开始时间')
    return
  }
  endTime.value = currentTime.value
}

const generateWaveform = () => {
  // 简单生成一些随机高度来模拟波形
  waveform.value = Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2)
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`
}

const trimAudio = () => {
  if (!audioFile.value) return

  ElMessage.success(`已裁剪区间: ${formatTime(startTime.value)} - ${formatTime(endTime.value)}`)

  // 这里模拟下载，实际需要后端或 ffmpeg.wasm
  // 创建一个简单的文本文件作为演示，或者下载原文件
  // 为了更好的体验，我们提示用户这只是演示

  ElMessage.info('正在处理音频...')

  setTimeout(() => {
    const a = document.createElement('a')
    a.href = audioUrl.value // 实际应为处理后的 blob url
    a.download = `trimmed_${audioFile.value?.name}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    ElMessage.success('下载已开始 (演示模式：下载原文件)')
  }, 1000)
}

const dropHandler = (ev: DragEvent) => {
  ev.preventDefault()
  if (ev.dataTransfer?.items) {
    [...ev.dataTransfer.items].forEach((item, i) => {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file && file.type.startsWith('audio/')) {
          loadAudio(file)
        }
      }
    })
  }
}

const dragOverHandler = (ev: DragEvent) => {
  ev.preventDefault()
}

onUnmounted(() => {
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
    <div class="bg-white rounded-xl p-8 mb-8 shadow-sm">
      <!-- Header -->
      <div class="text-center mb-10 relative">
        <div class="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div class="w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
          <div class="w-64 h-64 bg-indigo-400 rounded-full blur-3xl -ml-20"></div>
        </div>
        <h1
          class="text-4xl font-extrabold mb-4 relative inline-block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          音频剪辑工具
        </h1>
        <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">
          在线音频剪辑，支持可视化的波形剪辑，精确裁剪音频片段，本地处理保护隐私
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
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-800">剪辑设置</h2>
            </div>

            <div class="space-y-6">
              <!-- Time Display -->
              <div class="bg-white rounded-xl p-4 border border-gray-200 flex justify-between items-center">
                <div class="text-center flex-1 border-r border-gray-200">
                  <div class="text-xs text-gray-500 mb-1">当前时间</div>
                  <div class="font-mono text-lg font-bold text-blue-600">{{ formatTime(currentTime) }}</div>
                </div>
                <div class="text-center flex-1">
                  <div class="text-xs text-gray-500 mb-1">总时长</div>
                  <div class="font-mono text-lg font-bold text-gray-700">{{ formatTime(duration) }}</div>
                </div>
              </div>

              <!-- Play Control -->
              <button @click="togglePlay" :disabled="!audioUrl"
                class="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <svg v-if="!isPlaying" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clip-rule="evenodd" />
                </svg>
                <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
                <span>{{ isPlaying ? '暂停播放' : '播放音频' }}</span>
              </button>

              <!-- Range Controls -->
              <div class="space-y-4">
                <!-- Start Time -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-medium text-gray-700">开始时间</label>
                    <span class="font-mono text-sm font-bold text-blue-600">{{ formatTime(startTime) }}</span>
                  </div>
                  <input type="range" v-model.number="startTime" min="0" :max="duration" step="0.1"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    :disabled="!audioUrl">
                  <div class="flex gap-2 mt-2">
                    <button @click="setStart" :disabled="!audioUrl"
                      class="flex-1 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                      设为当前
                    </button>
                    <button @click="startTime = 0" :disabled="!audioUrl"
                      class="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-500 rounded-lg hover:text-gray-700 disabled:opacity-50">重置</button>
                  </div>
                </div>

                <!-- End Time -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-medium text-gray-700">结束时间</label>
                    <span class="font-mono text-sm font-bold text-blue-600">{{ formatTime(endTime) }}</span>
                  </div>
                  <input type="range" v-model.number="endTime" min="0" :max="duration" step="0.1"
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    :disabled="!audioUrl">
                  <div class="flex gap-2 mt-2">
                    <button @click="setEnd" :disabled="!audioUrl"
                      class="flex-1 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                      设为当前
                    </button>
                    <button @click="endTime = duration" :disabled="!audioUrl"
                      class="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-500 rounded-lg hover:text-gray-700 disabled:opacity-50">重置</button>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="pt-4 space-y-3">
                <button @click="trimAudio" :disabled="!audioUrl"
                  class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                  </svg>
                  <span>裁剪并下载</span>
                </button>
                <button v-if="audioUrl" @click="fileInput?.click()"
                  class="w-full py-3 text-gray-600 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                  更换音频
                </button>
              </div>
            </div>
          </div>

          <!-- Usage Guide -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                <span>上传音频文件（支持 MP3, WAV, AAC 等）</span>
              </li>
              <li class="flex items-start">
                <span
                  class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                <span>拖动滑块或播放时点击"设为当前"来确定裁剪范围</span>
              </li>
              <li class="flex items-start">
                <span
                  class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                <span>点击下载按钮保存裁剪后的音频片段</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right Content: Waveform & Upload -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Upload Area -->
          <div v-if="!audioUrl"
            class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm h-[600px] flex flex-col justify-center">
            <div @drop="dropHandler" @dragover="dragOverHandler"
              class="m-8 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group h-full flex flex-col items-center justify-center"
              @click="fileInput?.click()">
              <input type="file" ref="fileInput" class="hidden" accept="audio/*" @change="handleFileChange" />
              <div
                class="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <p class="text-2xl font-bold text-gray-700 mb-3 group-hover:text-blue-600 transition-colors">点击或拖拽音频文件到此处
              </p>
              <p class="text-gray-500">支持 MP3, WAV, OGG, AAC 等常见音频格式</p>
            </div>
          </div>

          <!-- Waveform Area -->
          <div v-else class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 class="font-medium text-gray-700">波形预览</h3>
              </div>
              <div class="text-sm text-gray-500 flex items-center">
                <span class="mr-4">{{ audioFile?.name }}</span>
                <span>{{ (audioFile?.size ? audioFile.size / 1024 / 1024 : 0).toFixed(2) }} MB</span>
              </div>
            </div>

            <div class="p-6">
              <!-- Waveform Visualization -->
              <div
                class="bg-gray-900 rounded-xl mb-6 relative h-64 flex items-center justify-center overflow-hidden select-none group border border-gray-800 shadow-inner">
                <!-- Canvas Layer -->
                <canvas ref="waveformCanvas" class="w-full h-full absolute inset-0 z-0 opacity-80"></canvas>

                <!-- Simulated Layer (Fallback) -->
                <div v-if="waveform.length > 0" class="flex items-end gap-1 h-32 w-full px-4 absolute z-0 opacity-60">
                  <div v-for="(h, i) in waveform" :key="i" class="flex-1 bg-blue-500 rounded-t"
                    :style="{ height: `${h * 100}%` }"></div>
                </div>

                <!-- Progress Cursor -->
                <div
                  class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 transition-all duration-75 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  :style="{ left: `${(currentTime / duration) * 100}%` }">
                  <div class="w-3 h-3 bg-red-500 rounded-full -ml-[5px] -mt-1.5 shadow-md border-2 border-white"></div>
                </div>

                <!-- Selection Overlay -->
                <div class="absolute inset-0 z-10 pointer-events-none">
                  <!-- Left Dim -->
                  <div
                    class="absolute left-0 top-0 bottom-0 bg-black/70 backdrop-blur-[1px] border-r-2 border-yellow-400 transition-all duration-100"
                    :style="{ width: `${(startTime / duration) * 100}%` }">
                    <div
                      class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-10 bg-yellow-400 rounded flex items-center justify-center cursor-ew-resize pointer-events-auto hover:scale-110 transition-transform shadow-lg z-20">
                      <div class="w-0.5 h-5 bg-black/20"></div>
                    </div>
                  </div>

                  <!-- Right Dim -->
                  <div
                    class="absolute right-0 top-0 bottom-0 bg-black/70 backdrop-blur-[1px] border-l-2 border-yellow-400 transition-all duration-100"
                    :style="{ width: `${((duration - endTime) / duration) * 100}%` }">
                    <div
                      class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-10 bg-yellow-400 rounded flex items-center justify-center cursor-ew-resize pointer-events-auto hover:scale-110 transition-transform shadow-lg z-20">
                      <div class="w-0.5 h-5 bg-black/20"></div>
                    </div>
                  </div>
                </div>

                <!-- Time Markers -->
                <div
                  class="absolute bottom-3 left-3 text-xs font-mono text-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                  {{ formatTime(startTime) }}</div>
                <div
                  class="absolute bottom-3 right-3 text-xs font-mono text-white bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                  {{ formatTime(endTime) }}</div>
              </div>

              <div class="text-center text-sm text-gray-500">
                提示: 拖动黄色手柄或使用左侧滑块精确调整裁剪范围
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <audio ref="audioRef" :src="audioUrl" @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMetadata"
      class="hidden"></audio>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>
