<!--
 * @file AudioMerge.vue
 * @description 音频合并工具
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
import { ref, computed, onUnmounted } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()

interface AudioItem {
  id: string
  file: File
  name: string
  size: number
  duration: number
  formattedDuration: string
}

const fileInput = ref<HTMLInputElement | null>(null)
const audioList = ref<AudioItem[]>([])
const resultAudioUrl = ref<string>('')
const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')
const isDragOver = ref(false)

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    })
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      resolve(0)
    })
  })
}

const totalDuration = computed(() => {
  return audioList.value.reduce((acc, item) => acc + item.duration, 0)
})

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    await addFiles(Array.from(target.files))
  }
  if (target.value) target.value = ''
}

const handleDrop = async (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files) {
    await addFiles(Array.from(files))
  }
}

const addFiles = async (files: File[]) => {
  for (const file of files) {
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      const duration = await getAudioDuration(file)
      audioList.value.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        duration,
        formattedDuration: formatTime(duration)
      })
    }
  }
}

const removeAudio = (index: number) => {
  audioList.value.splice(index, 1)
  if (resultAudioUrl.value) {
    URL.revokeObjectURL(resultAudioUrl.value)
    resultAudioUrl.value = ''
  }
}

const moveUp = (index: number) => {
  if (index > 0) {
    const item = audioList.value.splice(index, 1)[0]
    audioList.value.splice(index - 1, 0, item)
  }
}

const moveDown = (index: number) => {
  if (index < audioList.value.length - 1) {
    const item = audioList.value.splice(index, 1)[0]
    audioList.value.splice(index + 1, 0, item)
  }
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

  setUint32(0x46464952)
  setUint32(length - 8)
  setUint32(0x45564157)
  setUint32(0x20746d66)
  setUint32(16)
  setUint16(1)
  setUint16(numOfChan)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * numOfChan)
  setUint16(numOfChan * 2)
  setUint16(16)
  setUint32(0x61746164)
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

const processAudio = async () => {
  if (audioList.value.length < 2) {
    ElMessage.warning('请至少添加两个音频文件')
    return
  }

  isProcessing.value = true
  statusText.value = '正在解码音频...'
  progress.value = 0

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const decodedBuffers: AudioBuffer[] = []

    // Decode all files
    for (let i = 0; i < audioList.value.length; i++) {
      statusText.value = `正在解码第 ${i + 1}/${audioList.value.length} 个文件...`
      const arrayBuffer = await audioList.value[i].file.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      decodedBuffers.push(audioBuffer)
      progress.value = Math.round((i / audioList.value.length) * 50)
    }

    statusText.value = '正在合并...'

    // Calculate total length and channels
    const totalLength = decodedBuffers.reduce((acc, buf) => acc + buf.length, 0)
    const numberOfChannels = Math.max(...decodedBuffers.map(buf => buf.numberOfChannels))
    const sampleRate = decodedBuffers[0].sampleRate

    const outputBuffer = audioContext.createBuffer(numberOfChannels, totalLength, sampleRate)

    let offset = 0
    for (const buf of decodedBuffers) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const outputData = outputBuffer.getChannelData(channel)
        if (channel < buf.numberOfChannels) {
          outputData.set(buf.getChannelData(channel), offset)
        } else {
          if (buf.numberOfChannels === 1) {
            outputData.set(buf.getChannelData(0), offset)
          }
        }
      }
      offset += buf.length
    }

    progress.value = 80
    statusText.value = '正在导出...'

    const blob = audioBufferToWav(outputBuffer)
    resultAudioUrl.value = URL.createObjectURL(blob)

    progress.value = 100
    statusText.value = '合并完成！'
    ElMessage.success('合并成功')

  } catch (error) {
    console.error(error)
    ElMessage.error('处理失败，请检查音频文件')
  } finally {
    isProcessing.value = false
  }
}

const downloadResult = () => {
  if (!resultAudioUrl.value) return
  const a = document.createElement('a')
  a.href = resultAudioUrl.value
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  a.download = `merged_${timestamp}.wav`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onUnmounted(() => {
  if (resultAudioUrl.value) URL.revokeObjectURL(resultAudioUrl.value)
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
          免费音频合并
        </h1>
        <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">
          免费在线合并多个音频文件，支持 MP3、WAV 等格式拼接，可自由调整顺序
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left Sidebar: Actions & Result -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
            <div class="flex items-center space-x-2 mb-6">
              <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-gray-800">合并操作</h2>
            </div>

            <div class="space-y-5">
              <!-- Info Summary -->
              <div class="bg-white rounded-xl p-4 border border-gray-200">
                <div class="flex justify-between items-center text-sm mb-2">
                  <span class="text-gray-600">文件数量</span>
                  <span class="font-bold text-gray-900">{{ audioList.length }} 个</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-600">预计时长</span>
                  <span class="font-bold text-blue-600">{{ formatTime(totalDuration) }}</span>
                </div>
              </div>

              <!-- Action Button -->
              <div>
                <button v-if="!isProcessing && !resultAudioUrl" @click="processAudio" :disabled="audioList.length < 2"
                  class="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>开始合并</span>
                </button>

                <div v-else-if="isProcessing" class="space-y-4">
                  <div class="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{{ statusText }}</span>
                    <span class="font-mono">{{ progress }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      class="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                      :style="{ width: `${progress}%` }"></div>
                  </div>
                </div>

                <div v-else class="space-y-3 animate-fade-in">
                  <div class="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                    <audio :src="resultAudioUrl" controls class="w-full h-10 rounded-lg mb-2"></audio>
                    <p class="text-center text-green-700 text-sm font-medium">合并成功！</p>
                  </div>

                  <button @click="downloadResult"
                    class="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>下载合并音频</span>
                  </button>
                  <button @click="resultAudioUrl = ''"
                    class="w-full py-3 text-gray-600 bg-white border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    继续合并
                  </button>
                </div>
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
                <span>上传多个需要合并的音频文件</span>
              </li>
              <li class="flex items-start">
                <span
                  class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                <span>调整文件顺序（支持拖拽或点击箭头）</span>
              </li>
              <li class="flex items-start">
                <span
                  class="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                <span>点击开始合并，生成新的音频文件</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right Content: File List & Upload -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Upload Area -->
          <div
            class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm p-6 transition-all hover:shadow-md">
            <div @drop="handleDrop" @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false"
              class="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group relative overflow-hidden"
              :class="[isDragOver ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50']"
              @click="fileInput?.click()">
              <input type="file" ref="fileInput" class="hidden" accept="audio/*" multiple @change="handleFileChange" />
              <div
                class="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p class="text-xl font-bold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">点击或拖拽添加音频</p>
              <p class="text-sm text-gray-500">支持批量上传，MP3/WAV/OGG 等格式</p>
            </div>
          </div>

          <!-- File List -->
          <div v-if="audioList.length > 0" class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <h3 class="font-medium text-gray-700">文件列表</h3>
              </div>
              <span class="text-sm text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{{ audioList.length
                }}
                个文件</span>
            </div>

            <div class="p-6">
              <transition-group name="list" tag="ul" class="space-y-3">
                <li v-for="(item, index) in audioList" :key="item.id"
                  class="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                  <div class="flex items-center overflow-hidden flex-1 mr-4">
                    <div
                      class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors cursor-move">
                      {{ index + 1 }}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span
                        class="truncate text-gray-800 font-medium mb-0.5 group-hover:text-blue-700 transition-colors">{{
                          item.name }}</span>
                      <div class="flex items-center text-xs text-gray-500 space-x-3">
                        <span>{{ (item.size / 1024 / 1024).toFixed(2) }} MB</span>
                        <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>{{ item.formattedDuration }}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    class="flex items-center space-x-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button @click="moveUp(index)" :disabled="index === 0"
                      class="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="上移">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    </button>
                    <button @click="moveDown(index)" :disabled="index === audioList.length - 1"
                      class="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      title="下移">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    <div class="w-px h-6 bg-gray-200 mx-1"></div>
                    <button @click="removeAudio(index)"
                      class="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="删除">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                        </path>
                      </svg>
                    </button>
                  </div>
                </li>
              </transition-group>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<style scoped>
.list-move,
/* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* ensure leaving items are taken out of layout flow so that moving
   items can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
