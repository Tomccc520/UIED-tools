<!--
 * @file VideoToAudio.vue
 * @description 视频提取音频工具
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
import { ref, reactive, onUnmounted } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()

const fileInput = ref<HTMLInputElement | null>(null)
const videoFile = ref<File | null>(null)
const videoUrl = ref<string>('')
const resultAudioUrl = ref<string>('')
const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')
const isDragOver = ref(false)

const settings = reactive({
  format: 'wav' as 'wav' | 'webm'
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.type.startsWith('video/')) {
      loadVideo(file)
    } else {
      ElMessage.warning('请选择有效的视频文件')
    }
  }
  if (target.value) target.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('video/')) {
      loadVideo(file)
    } else {
      ElMessage.warning('请选择有效的视频文件')
    }
  }
}

const loadVideo = (file: File) => {
  videoFile.value = file
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (resultAudioUrl.value) URL.revokeObjectURL(resultAudioUrl.value)

  videoUrl.value = URL.createObjectURL(file)
  resultAudioUrl.value = ''
  progress.value = 0
  statusText.value = ''
}

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

  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // file length - 8
  setUint32(0x45564157) // "WAVE"

  setUint32(0x20746d66) // "fmt " chunk
  setUint32(16) // length = 16
  setUint16(1) // PCM (uncompressed)
  setUint16(numOfChan)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * numOfChan)
  setUint16(numOfChan * 2)
  setUint16(16)

  setUint32(0x61746164) // "data" - chunk
  setUint32(length - pos - 4)

  for (i = 0; i < buffer.numberOfChannels; i++)
    channels.push(buffer.getChannelData(i))

  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos]))
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0
      view.setInt16(44 + offset, sample, true)
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

const processVideo = async () => {
  if (!videoFile.value) return

  isProcessing.value = true
  statusText.value = '正在提取音频...'
  progress.value = 10

  try {
    const arrayBuffer = await videoFile.value.arrayBuffer()
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    statusText.value = '正在解码音频轨道...'
    progress.value = 30
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    statusText.value = '正在生成文件...'
    progress.value = 80

    let blob: Blob | null = null

    // Currently we only support WAV export reliably without external libs (ffmpeg.wasm)
    // For WebM we would need MediaRecorder which is real-time and slow for this
    blob = audioBufferToWav(audioBuffer)

    resultAudioUrl.value = URL.createObjectURL(blob)
    progress.value = 100
    statusText.value = '提取完成'
    ElMessage.success('提取成功')

  } catch (error) {
    console.error(error)
    ElMessage.error('提取失败，视频可能没有音频轨道或格式不支持')
  } finally {
    isProcessing.value = false
  }
}

const downloadResult = () => {
  if (!resultAudioUrl.value || !videoFile.value) return
  const a = document.createElement('a')
  a.href = resultAudioUrl.value
  const originalName = videoFile.value.name.replace(/\.[^/.]+$/, "")
  a.download = `${originalName}_audio.wav`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onUnmounted(() => {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (resultAudioUrl.value) URL.revokeObjectURL(resultAudioUrl.value)
})
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">视频提取音频</h2>
          <p class="text-gray-500 text-sm">从视频中提取高品质音频，支持 MP4, WebM, MOV 等格式</p>
        </div>

        <!-- Upload Area -->
        <div
          class="border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-8 relative overflow-hidden group"
          :class="[isDragOver ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50']"
          @click="fileInput?.click()" @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="text-6xl mb-4 text-blue-500 transition-transform group-hover:scale-110 duration-300">🎼</div>
          <p class="text-xl font-bold text-gray-700 mb-2">点击或拖拽视频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP4, MOV, WebM, AVI 等格式</p>
        </div>

        <!-- Editor Area -->
        <div v-if="videoUrl" class="max-w-3xl mx-auto space-y-6 animate-fade-in">
          <div
            class="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center shadow-lg ring-1 ring-gray-900/5">
            <video :src="videoUrl" controls class="max-w-full max-h-[400px]"></video>
          </div>

          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  📹
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">{{ videoFile?.name }}</h3>
                  <p class="text-xs text-gray-500">{{ (videoFile?.size ? (videoFile.size / 1024 / 1024).toFixed(2) : 0)
                    }} MB</p>
                </div>
              </div>
              <button @click="fileInput?.click()"
                class="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                更换视频
              </button>
            </div>

            <!-- Processing Status -->
            <div v-if="isProcessing" class="mb-4">
              <div class="flex justify-between text-xs font-medium text-gray-600 mb-1">
                <span>{{ statusText }}</span>
                <span>{{ progress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${progress}%` }"></div>
              </div>
            </div>

            <button @click="processVideo" :disabled="isProcessing"
              class="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center">
              <span v-if="!isProcessing" class="mr-2">🎵</span>
              {{ isProcessing ? '处理中...' : '开始提取音频 (WAV)' }}
            </button>
          </div>

          <div v-if="resultAudioUrl"
            class="bg-green-50 border border-green-100 rounded-xl p-8 text-center animate-fade-in shadow-sm">
            <div
              class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h3 class="text-xl text-gray-800 font-bold mb-6">提取成功！</h3>
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
              <audio :src="resultAudioUrl" controls class="w-full"></audio>
            </div>
            <button @click="downloadResult"
              class="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center mx-auto">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              下载音频文件
            </button>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>
