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

const dragOverHandler = (ev: DragEvent) => {
  ev.preventDefault()
  isDragOver.value = true
}

const dragLeaveHandler = (ev: DragEvent) => {
  ev.preventDefault()
  isDragOver.value = false
}
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2
            class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            免费视频提取音频
          </h2>
          <p class="text-gray-500 text-sm">
            从视频中提取高品质音频，支持 MP4, WebM, MOV 等格式，本地处理保护隐私
          </p>
        </div>

        <!-- Initial Upload Area -->
        <div v-if="!videoUrl"
          class="border-2 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer mb-8 relative overflow-hidden group"
          :class="[isDragOver ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50']"
          @click="fileInput?.click()"
          @dragover="dragOverHandler"
          @dragleave="dragLeaveHandler"
          @drop.prevent="handleDrop">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
            点击或拖拽视频文件到此处
          </h3>
          <p class="text-gray-500">支持 MP4, MOV, WebM, AVI 等格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left: Configuration Panel -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </span>
                操作面板
              </h3>

              <!-- File Info -->
              <div class="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="overflow-hidden flex-1">
                    <div class="text-sm font-medium text-gray-800 truncate">{{ videoFile?.name }}</div>
                    <div class="text-xs text-gray-500">{{ (videoFile?.size ? videoFile.size / 1024 / 1024 : 0).toFixed(2) }}
                      MB</div>
                  </div>
                  <button @click="fileInput?.click()" class="text-xs text-indigo-600 hover:text-indigo-800">
                    更换
                  </button>
                  <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
                </div>
              </div>

              <!-- Controls -->
              <div class="space-y-4">
                <div v-if="isProcessing" class="bg-white p-4 rounded-xl border border-gray-200">
                   <div class="flex justify-between text-xs font-medium text-gray-600 mb-2">
                      <span>{{ statusText }}</span>
                      <span>{{ progress }}%</span>
                   </div>
                   <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
                   </div>
                </div>

                <button @click="processVideo" :disabled="isProcessing"
                  class="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform active:scale-[0.98]">
                  <span v-if="!isProcessing" class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    开始提取音频 (WAV)
                  </span>
                  <span v-else class="flex items-center">
                    <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    处理中...
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Preview & Result -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Video Player -->
            <div class="border border-gray-200 rounded-xl overflow-hidden bg-black shadow-sm flex items-center justify-center relative group">
              <video :src="videoUrl" controls class="w-full max-h-[500px]"></video>
            </div>

            <!-- Result -->
            <div v-if="resultAudioUrl" class="bg-white rounded-xl border border-green-200 p-6 shadow-sm animate-fade-in relative overflow-hidden">
               <div class="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
               <div class="flex flex-col md:flex-row items-center gap-6">
                  <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl shrink-0">
                    ✓
                  </div>
                  <div class="flex-1 w-full text-center md:text-left">
                     <h3 class="text-xl font-bold text-gray-800 mb-2">提取成功！</h3>
                     <audio :src="resultAudioUrl" controls class="w-full mb-4"></audio>
                     <button @click="downloadResult"
                       class="inline-flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                       <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                       下载音频文件
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            使用说明
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">1. 上传视频</h4>
              <p>支持 MP4, WebM, MOV 等格式。文件处理完全在本地进行。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">2. 提取音频</h4>
              <p>点击开始提取按钮，系统将自动从视频中分离出音频轨道并转换为 WAV 格式。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">3. 下载保存</h4>
              <p>提取完成后可在线试听，确认无误后下载音频文件。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
