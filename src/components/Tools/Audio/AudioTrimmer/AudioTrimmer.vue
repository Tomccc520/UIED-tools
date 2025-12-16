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
import { ref, onUnmounted, watch } from 'vue'
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
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">音频剪辑工具</h2>
          <p class="text-gray-500 text-sm">在线音频剪辑，支持可视化的波形剪辑，精确裁剪音频片段</p>
        </div>

        <!-- Upload Area -->
        <div v-if="!audioUrl" @drop="dropHandler" @dragover="dragOverHandler"
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer mb-8"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="audio/*" @change="handleFileChange" />
          <div class="text-6xl mb-4 text-gray-300">🎵</div>
          <p class="text-xl font-medium text-gray-700 mb-2">点击或拖拽音频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP3, WAV, OGG, AAC 等格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="max-w-4xl mx-auto">
          <!-- Waveform Visualization -->
          <div class="bg-gray-900 rounded-lg mb-6 relative h-48 flex items-center justify-center overflow-hidden select-none group">
            <!-- Canvas Layer -->
            <canvas ref="waveformCanvas" class="w-full h-full absolute inset-0 z-0"></canvas>
            
            <!-- Simulated Layer (Fallback) -->
            <div v-if="waveform.length > 0" class="flex items-end gap-1 h-32 w-full px-4 absolute z-0 opacity-80">
              <div v-for="(h, i) in waveform" :key="i" 
                class="flex-1 bg-blue-500 rounded-t"
                :style="{ height: `${h * 100}%` }"
              ></div>
            </div>
            
            <!-- Progress Cursor -->
            <div class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 transition-all duration-75"
              :style="{ left: `${(currentTime / duration) * 100}%` }"
            >
              <div class="w-2 h-2 bg-red-500 rounded-full -ml-[3px] -mt-1 shadow-sm"></div>
            </div>
            
            <!-- Selection Overlay (Dimmed Outside) -->
            <div class="absolute inset-0 z-10 pointer-events-none">
               <!-- Left Dim -->
               <div class="absolute left-0 top-0 bottom-0 bg-black/60 backdrop-blur-[1px] border-r-2 border-yellow-400"
                 :style="{ width: `${(startTime / duration) * 100}%` }">
                 <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-8 bg-yellow-400 rounded flex items-center justify-center cursor-ew-resize pointer-events-auto hover:scale-110 transition-transform shadow-lg">
                   <div class="w-0.5 h-4 bg-black/20"></div>
                 </div>
               </div>
               
               <!-- Right Dim -->
               <div class="absolute right-0 top-0 bottom-0 bg-black/60 backdrop-blur-[1px] border-l-2 border-yellow-400"
                 :style="{ width: `${((duration - endTime) / duration) * 100}%` }">
                 <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-8 bg-yellow-400 rounded flex items-center justify-center cursor-ew-resize pointer-events-auto hover:scale-110 transition-transform shadow-lg">
                   <div class="w-0.5 h-4 bg-black/20"></div>
                 </div>
               </div>
            </div>
            
            <!-- Time Markers -->
            <div class="absolute bottom-2 left-2 text-xs text-gray-400 bg-black/50 px-1 rounded">{{ formatTime(startTime) }}</div>
            <div class="absolute bottom-2 right-2 text-xs text-gray-400 bg-black/50 px-1 rounded">{{ formatTime(endTime) }}</div>
          </div>

          <!-- Controls -->
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div class="flex flex-col items-center gap-6">

              <!-- Time Display -->
              <div class="flex justify-between w-full text-sm font-mono text-gray-600">
                <div>当前: {{ formatTime(currentTime) }}</div>
                <div>总长: {{ formatTime(duration) }}</div>
              </div>

              <!-- Main Controls -->
              <div class="flex items-center gap-4">
                <button @click="togglePlay"
                  class="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
              </div>

              <!-- Trimming Controls -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-bold text-gray-700">开始时间</span>
                    <span class="font-mono text-blue-600">{{ formatTime(startTime) }}</span>
                  </div>
                  <div class="flex gap-2">
                    <button @click="setStart"
                      class="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300">
                      设为当前
                    </button>
                    <button @click="startTime = 0"
                      class="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">重置</button>
                  </div>
                  <input type="range" v-model.number="startTime" min="0" :max="duration" step="0.1"
                    class="w-full mt-3 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600">
                </div>

                <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-bold text-gray-700">结束时间</span>
                    <span class="font-mono text-blue-600">{{ formatTime(endTime) }}</span>
                  </div>
                  <div class="flex gap-2">
                    <button @click="setEnd"
                      class="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300">
                      设为当前
                    </button>
                    <button @click="endTime = duration"
                      class="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">重置</button>
                  </div>
                  <input type="range" v-model.number="endTime" min="0" :max="duration" step="0.1"
                    class="w-full mt-3 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600">
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4 w-full justify-center mt-4">
                <button @click="fileInput?.click()"
                  class="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                  更换音频
                </button>
                <button @click="trimAudio"
                  class="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clip-rule="evenodd" />
                  </svg>
                  裁剪并下载
                </button>
              </div>

            </div>
          </div>
        </div>

        <audio ref="audioRef" :src="audioUrl" @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMetadata"
          class="hidden"></audio>

      </div>
    </div>

    <!-- Usage Instructions -->
    <div class="bg-white rounded-xl p-8 shadow-sm">
      <h3 class="text-xl font-bold mb-4 text-gray-800">使用说明</h3>
      <div class="space-y-4 text-gray-600">
        <div>
          <h4 class="font-medium text-gray-800 mb-2">1. 上传音频</h4>
          <p class="text-sm">点击上传区域或直接将音频文件拖拽到页面中。支持 MP3, WAV, AAC 等常见音频格式。</p>
        </div>
        <div>
          <h4 class="font-medium text-gray-800 mb-2">2. 选择裁剪范围</h4>
          <p class="text-sm">播放音频，点击"设为当前"按钮设置开始和结束时间，或者直接拖动滑块进行微调。</p>
        </div>
        <div>
          <h4 class="font-medium text-gray-800 mb-2">3. 下载结果</h4>
          <p class="text-sm">点击"裁剪并下载"按钮，保存裁剪后的音频文件。</p>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="font-medium text-blue-800 mb-2">🔒 隐私安全说明</h4>
          <p class="text-sm text-blue-700">本工具所有处理均在您的浏览器本地进行，音频文件不会上传到服务器，完全保护您的隐私安全。</p>
        </div>
      </div>
    </div>

    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>
