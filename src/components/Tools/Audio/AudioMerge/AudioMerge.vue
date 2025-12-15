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
  a.download = `merged_${new Date().getTime()}.wav`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onUnmounted(() => {
  if (resultAudioUrl.value) URL.revokeObjectURL(resultAudioUrl.value)
})
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">音频合并</h2>
          <p class="text-gray-500 text-sm">免费在线合并多个音频文件，支持 MP3, WAV 等格式拼接</p>
        </div>

        <!-- Upload Area -->
        <div class="border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer mb-8 relative overflow-hidden group"
          :class="[isDragOver ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50']"
          @click="fileInput?.click()"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop">
          <input type="file" ref="fileInput" class="hidden" accept="audio/*,video/*" multiple @change="handleFileChange" />
          <div class="text-5xl mb-4 text-blue-500 transition-transform group-hover:scale-110 duration-300">🎵</div>
          <p class="font-bold text-lg text-gray-700 mb-2">点击或拖拽音频文件到这里</p>
          <p class="text-sm text-gray-500">支持批量上传，可调整顺序</p>
        </div>

        <!-- List -->
        <div v-if="audioList.length > 0" class="max-w-3xl mx-auto space-y-6">
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div class="flex justify-between items-center mb-4 px-2">
              <h3 class="font-bold text-gray-800 flex items-center">
                <span class="w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
                已添加文件 ({{ audioList.length }})
              </h3>
              <span class="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                预计总时长: {{ formatTime(totalDuration) }}
              </span>
            </div>
            
            <ul class="space-y-3">
              <li v-for="(item, index) in audioList" :key="item.id"
                class="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
                <div class="flex items-center overflow-hidden flex-1 mr-4">
                  <span class="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold mr-4 flex-shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    {{ index + 1 }}
                  </span>
                  <div class="flex flex-col min-w-0">
                    <span class="truncate text-gray-800 font-medium mb-0.5">{{ item.name }}</span>
                    <div class="flex items-center text-xs text-gray-500 space-x-3">
                      <span>{{ (item.size / 1024 / 1024).toFixed(2) }} MB</span>
                      <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{{ item.formattedDuration }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-1 flex-shrink-0">
                  <button @click="moveUp(index)" :disabled="index === 0"
                    class="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors" title="上移">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                  </button>
                  <button @click="moveDown(index)" :disabled="index === audioList.length - 1"
                    class="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors" title="下移">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  <div class="w-px h-6 bg-gray-200 mx-1"></div>
                  <button @click="removeAudio(index)" class="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="删除">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </li>
            </ul>
          </div>
          
          <!-- Processing Status -->
          <div v-if="isProcessing" class="bg-blue-50 rounded-xl p-6 border border-blue-100 text-center animate-fade-in">
             <div class="flex items-center justify-between mb-2 text-sm text-blue-800 font-medium">
                <span>{{ statusText }}</span>
                <span>{{ progress }}%</span>
             </div>
             <div class="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden">
                <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
             </div>
          </div>

          <div class="flex justify-center pt-4">
            <button @click="processAudio" :disabled="isProcessing || audioList.length < 2"
              class="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none min-w-[200px] overflow-hidden">
              <div class="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full"></div>
              <span class="relative flex items-center justify-center">
                <span v-if="!isProcessing" class="mr-2">⚡</span>
                {{ isProcessing ? '处理中...' : '开始合并音频' }}
              </span>
            </button>
          </div>

          <div v-if="resultAudioUrl" class="bg-green-50 border border-green-100 rounded-xl p-8 text-center animate-fade-in shadow-sm">
            <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ✓
            </div>
            <h3 class="text-xl text-gray-800 font-bold mb-6">合并完成！</h3>
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
               <audio :src="resultAudioUrl" controls class="w-full"></audio>
            </div>
            <button @click="downloadResult"
              class="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center mx-auto">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              下载合并后的音频
            </button>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>
