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
          音频音量放大
        </h1>
        <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">
          在线调整音频音量，支持最大 300% 增益，本地处理保护隐私
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
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-800">音量设置</h2>
            </div>

            <div class="space-y-8">
              <!-- Volume Slider -->
              <div class="bg-white rounded-xl p-6 border border-gray-200 text-center shadow-sm">
                <div class="text-5xl font-bold text-blue-600 mb-2 tabular-nums">{{ settings.volume }}%</div>
                <div class="text-sm text-gray-500 mb-6 font-medium">音量增益</div>

                <div class="relative px-2">
                  <input type="range" v-model.number="settings.volume" min="0" max="300" step="10"
                    class="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    :disabled="!audioUrl">
                  <div class="flex justify-between text-xs text-gray-400 mt-3 font-mono">
                    <span>0%</span>
                    <span>100%</span>
                    <span>200%</span>
                    <span>300%</span>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-3">
                  <button @click="togglePlay" :disabled="!audioUrl"
                    class="py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    :class="isPlaying ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-200'">
                    <span v-if="isPlaying">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clip-rule="evenodd" />
                      </svg>
                    </span>
                    <span v-else>
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clip-rule="evenodd" />
                      </svg>
                    </span>
                    <span>{{ isPlaying ? '停止' : '试听' }}</span>
                  </button>

                  <button @click="processAudio" :disabled="!audioUrl || isProcessing"
                    class="py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    <span v-if="isProcessing" class="animate-spin mr-2">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                    </span>
                    <span>{{ isProcessing ? '处理中' : '开始处理' }}</span>
                  </button>
                </div>

                <button v-if="audioUrl" @click="fileInput?.click()"
                  class="w-full py-3 text-gray-600 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm">
                  更换音频
                </button>
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
                <span>上传音频文件（MP3, WAV, OGG 等）</span>
              </li>
              <li class="flex items-start">
                <span
                  class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                <span>拖动滑块调整增益（100%为原声，最大300%）</span>
              </li>
              <li class="flex items-start">
                <span
                  class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                <span>先试听确认效果，避免爆音，满意后处理并下载</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right Content: Upload & Result -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Upload Area -->
          <div v-if="!audioUrl"
            class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm h-[600px] flex flex-col justify-center">
            <div @click="fileInput?.click()"
              class="m-8 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group h-full flex flex-col items-center justify-center">
              <input type="file" ref="fileInput" class="hidden" accept="audio/*,video/*" @change="handleFileChange" />
              <div
                class="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <p class="text-2xl font-bold text-gray-700 mb-3 group-hover:text-blue-600 transition-colors">点击或拖拽音频文件到此处
              </p>
              <p class="text-gray-500">支持 MP3, WAV, OGG, AAC 等常见格式</p>
            </div>
          </div>

          <!-- Info Area -->
          <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-bold text-gray-800 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                文件信息
              </h3>
            </div>

            <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 flex items-center mb-8">
              <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                <span class="text-2xl">🎵</span>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-gray-900 truncate mb-1 text-lg">{{ audioFile?.name }}</h4>
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{{ (audioFile?.size ? audioFile.size / 1024 / 1024 : 0).toFixed(2) }} MB</span>
                  <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{{ audioFile?.type }}</span>
                </div>
              </div>
            </div>

            <!-- Processing Status / Result -->
            <transition name="fade">
              <div v-if="resultAudioUrl" class="bg-green-50 border border-green-100 rounded-xl p-8 text-center">
                <div
                  class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  ✓
                </div>
                <h3 class="text-xl text-green-800 font-bold mb-2">处理成功！</h3>
                <p class="text-green-600 mb-6">您的音频已完成增益处理，可以下载了。</p>

                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 max-w-md mx-auto">
                  <audio :src="resultAudioUrl" controls class="w-full"></audio>
                </div>

                <button @click="downloadAudio"
                  class="px-8 py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center mx-auto space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>下载增强后的音频</span>
                </button>
              </div>
            </transition>
          </div>
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
