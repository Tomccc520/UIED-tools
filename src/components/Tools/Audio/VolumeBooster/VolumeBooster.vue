<!--
 * @file VolumeBooster.vue
 * @description 音频音量放大工具，支持调整增益并导出
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
const audioFile = ref<File | null>(null)
const audioUrl = ref<string>('')
const resultAudioUrl = ref<string>('')

const isProcessing = ref(false)
const isPlaying = ref(false)
const progress = ref(0)
const statusText = ref('')

// Audio Context State
let audioContext: AudioContext | null = null
let sourceNode: AudioBufferSourceNode | null = null
let gainNode: GainNode | null = null
let audioBuffer: AudioBuffer | null = null
let startTime = 0
let pauseTime = 0

const settings = reactive({
  volume: 150 // percentage, 100 is original
})

// Watch volume change to update realtime
watch(() => settings.volume, (newVal) => {
  if (gainNode) {
    gainNode.gain.value = newVal / 100
  }
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      loadAudio(file)
    } else {
      ElMessage.warning('请选择有效的音频文件')
    }
  }
}

const loadAudio = async (file: File) => {
  audioFile.value = file
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  if (resultAudioUrl.value) URL.revokeObjectURL(resultAudioUrl.value)
  
  audioUrl.value = URL.createObjectURL(file)
  resultAudioUrl.value = ''
  progress.value = 0
  statusText.value = '正在加载音频...'
  
  try {
    const arrayBuffer = await file.arrayBuffer()
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    statusText.value = '加载完成'
  } catch (error) {
    console.error(error)
    ElMessage.error('音频加载失败')
  }
}

const togglePlay = () => {
  if (!audioContext || !audioBuffer) return

  if (isPlaying.value) {
    // Stop
    if (sourceNode) {
      sourceNode.stop()
      sourceNode = null
    }
    pauseTime = audioContext.currentTime - startTime
    isPlaying.value = false
  } else {
    // Play
    sourceNode = audioContext.createBufferSource()
    sourceNode.buffer = audioBuffer
    gainNode = audioContext.createGain()
    gainNode.gain.value = settings.volume / 100
    
    sourceNode.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Handle loop/offset if needed, but for preview simple play is enough
    // Ideally should track position, but let's just restart for simplicity or implement seek later if needed
    // Simple implementation: restart from 0 or paused position?
    // Since AudioBufferSourceNode is one-time use, we create new one.
    
    sourceNode.onended = () => {
      isPlaying.value = false
      pauseTime = 0
    }

    sourceNode.start(0, pauseTime % audioBuffer.duration)
    startTime = audioContext.currentTime - (pauseTime % audioBuffer.duration)
    isPlaying.value = true
  }
}

const processAudio = async () => {
  if (!audioBuffer) return

  try {
    isProcessing.value = true
    statusText.value = '正在渲染...'
    progress.value = 0

    // Offline Rendering
    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    )

    const source = offlineCtx.createBufferSource()
    source.buffer = audioBuffer
    const gain = offlineCtx.createGain()
    gain.gain.value = settings.volume / 100

    source.connect(gain)
    gain.connect(offlineCtx.destination)
    source.start()

    const renderedBuffer = await offlineCtx.startRendering()
    
    statusText.value = '正在编码...'
    progress.value = 80
    
    // Convert to WAV
    const wavBlob = audioBufferToWav(renderedBuffer)
    resultAudioUrl.value = URL.createObjectURL(wavBlob)
    
    progress.value = 100
    statusText.value = '处理完成！'
    isProcessing.value = false
    ElMessage.success('处理成功')

  } catch (error) {
    console.error(error)
    ElMessage.error('处理失败')
    isProcessing.value = false
  }
}

const downloadAudio = () => {
  if (!resultAudioUrl.value) return
  const a = document.createElement('a')
  a.href = resultAudioUrl.value
  a.download = `boosted_${settings.volume}%_${new Date().getTime()}.wav`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// WAV Encoder Helper
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

  // write WAVE header
  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // file length - 8
  setUint32(0x45564157) // "WAVE"

  setUint32(0x20746d66) // "fmt " chunk
  setUint32(16) // length = 16
  setUint16(1) // PCM (uncompressed)
  setUint16(numOfChan)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * numOfChan) // avg. bytes/sec
  setUint16(numOfChan * 2) // block-align
  setUint16(16) // 16-bit (hardcoded in this example)

  setUint32(0x61746164) // "data" - chunk
  setUint32(length - pos - 4) // chunk length

  // write interleaved data
  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i))

  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][pos])) // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0 // scale to 16-bit signed int
      view.setInt16(44 + offset, sample, true) // write 16-bit sample
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

onUnmounted(() => {
  if (sourceNode) sourceNode.stop()
  if (audioContext) audioContext.close()
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  if (resultAudioUrl.value) URL.revokeObjectURL(resultAudioUrl.value)
})
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">音频音量放大</h2>
          <p class="text-gray-500 text-sm">在线调整音频音量，支持最大 300% 增益，本地处理保护隐私</p>
        </div>

        <!-- Upload Area -->
        <div v-if="!audioUrl"
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer mb-8"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="audio/*,video/*" @change="handleFileChange" />
          <div class="text-6xl mb-4 text-gray-300">🔊</div>
          <p class="text-xl font-medium text-gray-700 mb-2">点击或拖拽音频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP3, WAV, OGG 等常见格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="max-w-2xl mx-auto space-y-8">
          <!-- File Info -->
          <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                🎵
              </div>
              <div>
                <h3 class="font-bold text-gray-800 truncate max-w-xs">{{ audioFile?.name }}</h3>
                <p class="text-sm text-gray-500">{{ (audioFile?.size ? (audioFile.size / 1024 / 1024).toFixed(2) : 0) }} MB</p>
              </div>
            </div>
            <button @click="fileInput?.click()" class="text-sm text-blue-600 hover:text-blue-800">更换文件</button>
          </div>

          <!-- Volume Control -->
          <div class="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div class="mb-6 text-center">
              <span class="text-5xl font-bold text-blue-600">{{ settings.volume }}%</span>
              <p class="text-gray-500 mt-2">音量增益</p>
            </div>
            
            <div class="relative pt-1">
              <input type="range" v-model.number="settings.volume" min="0" max="300" step="10"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              <div class="flex justify-between text-xs text-gray-400 mt-2">
                <span>0% (静音)</span>
                <span>100% (原声)</span>
                <span>200%</span>
                <span>300% (最大)</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-2 gap-4">
            <button @click="togglePlay"
              class="py-3 rounded-lg font-bold transition-colors flex items-center justify-center"
              :class="isPlaying ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'">
              <span class="mr-2">{{ isPlaying ? '⏸️' : '▶️' }}</span>
              {{ isPlaying ? '停止预览' : '试听效果' }}
            </button>
            
            <button @click="processAudio" :disabled="isProcessing"
              class="py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
              {{ isProcessing ? '处理中...' : '开始处理' }}
            </button>
          </div>

          <!-- Result -->
          <div v-if="resultAudioUrl" class="bg-green-50 border border-green-100 rounded-xl p-6 text-center animate-fade-in">
            <h3 class="text-green-800 font-bold mb-2">🎉 处理成功！</h3>
            <p class="text-green-600 text-sm mb-4">您的音频已完成增益处理，可以下载了。</p>
            <button @click="downloadAudio"
              class="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md flex items-center justify-center mx-auto">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载 WAV 音频
            </button>
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="bg-white rounded-xl p-8 shadow-sm mt-8 border-t border-gray-100">
          <h3 class="text-xl font-bold mb-4 text-gray-800">使用说明</h3>
          <div class="space-y-4 text-gray-600">
            <div>
              <h4 class="font-medium text-gray-800 mb-2">1. 调节音量</h4>
              <p class="text-sm">拖动滑块调整音量百分比，大于100%为放大，小于100%为减小。</p>
            </div>
            <div>
              <h4 class="font-medium text-gray-800 mb-2">2. 试听确认</h4>
              <p class="text-sm">点击"试听效果"按钮，实时感受调整后的音量大小，避免爆音。</p>
            </div>
            <div>
              <h4 class="font-medium text-gray-800 mb-2">3. 导出保存</h4>
              <p class="text-sm">点击"开始处理"生成新的音频文件，支持下载为高品质 WAV 格式。</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-medium text-blue-800 mb-2">🔒 隐私安全说明</h4>
              <p class="text-sm text-blue-700">本工具基于 Web Audio API 开发，音频处理完全在本地进行，文件不会上传服务器。</p>
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
</style>
