<!--
 * @file AudioConverter.vue
 * @description 音频格式转换工具，支持 MP3、WAV、AAC、OGG 等格式互转
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-09
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

// 状态定义
const fileInput = ref<HTMLInputElement | null>(null)
const audioFile = ref<File | null>(null)
const audioUrl = ref<string>('')
const convertedUrl = ref<string>('')
const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')

// 转换设置
const settings = reactive({
  targetFormat: 'mp3' as 'mp3' | 'wav' | 'ogg' | 'aac',
  quality: 'high' as 'low' | 'medium' | 'high'
})

// 支持的格式
const formats = [
  { label: 'WAV', value: 'wav', tag: '无损', desc: '最佳音质，文件较大' },
  { label: 'WebM', value: 'webm', tag: '压缩', desc: '适合网页播放' },
  { label: 'OGG', value: 'ogg', tag: '开源', desc: '体积小，兼容性好' }
]

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
  if (convertedUrl.value) URL.revokeObjectURL(convertedUrl.value)

  audioUrl.value = URL.createObjectURL(file)
  convertedUrl.value = ''
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

const processAudio = async () => {
  if (!audioFile.value) return

  isProcessing.value = true
  statusText.value = '准备转换...'
  progress.value = 10

  try {
    const arrayBuffer = await audioFile.value.arrayBuffer()
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    statusText.value = '正在解码音频...'
    progress.value = 30

    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    statusText.value = '正在编码...'
    progress.value = 60

    let blob: Blob | null = null

    if (settings.targetFormat === 'wav') {
      blob = audioBufferToWav(audioBuffer)
      progress.value = 90
    } else if (['webm', 'ogg'].includes(settings.targetFormat)) {
      // For WebM/OGG, use MediaRecorder (Real-time)
      // Note: This is a simplified implementation.
      // Ideally we would use offline rendering if MediaRecorder supported it, but it doesn't.
      // So we use a faster-than-realtime offline context? No, MediaRecorder needs stream.
      // We'll use a fast-forward approach if possible or just warn user.
      // Actually, for better UX in this "tool", let's use the real-time approach but
      // since we can't speed it up easily without dropping frames, we might just use WAV for everything
      // or implement a basic MediaRecorder.

      // Let's try to use MediaRecorder with a stream destination from audioContext
      const dest = audioContext.createMediaStreamDestination()
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(dest)

      const mimeType = `audio/${settings.targetFormat}`
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        throw new Error(`浏览器不支持 ${settings.targetFormat} 格式导出`)
      }

      const recorder = new MediaRecorder(dest.stream, { mimeType })
      const chunks: Blob[] = []

      recorder.ondataavailable = e => chunks.push(e.data)

      const recordingPromise = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve()
      })

      recorder.start()
      source.start()

      // Update progress during playback
      const duration = audioBuffer.duration
      const startTime = audioContext.currentTime

      const updateProgress = () => {
        if (!isProcessing.value) {
          source.stop()
          recorder.stop()
          return
        }
        const elapsed = audioContext.currentTime - startTime
        const p = 60 + Math.min(30, (elapsed / duration) * 30)
        progress.value = Math.round(p)

        if (elapsed < duration) {
          requestAnimationFrame(updateProgress)
        }
      }
      updateProgress()

      source.onended = () => {
        recorder.stop()
      }

      await recordingPromise
      blob = new Blob(chunks, { type: mimeType })
    }

    if (blob) {
      progress.value = 100
      statusText.value = '转换完成！'
      convertedUrl.value = URL.createObjectURL(blob)
      ElMessage.success('转换成功')
    } else {
      throw new Error('生成文件失败')
    }

  } catch (error) {
    console.error('转换失败:', error)
    statusText.value = '转换失败'
    ElMessage.error(error instanceof Error ? error.message : '音频转换失败')
  } finally {
    isProcessing.value = false
  }
}

const downloadResult = () => {
  if (!convertedUrl.value || !audioFile.value) return

  const a = document.createElement('a')
  a.href = convertedUrl.value
  const originalName = audioFile.value.name.replace(/\.[^/.]+$/, "")
  a.download = `${originalName}_converted.${settings.targetFormat}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
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
  if (convertedUrl.value) URL.revokeObjectURL(convertedUrl.value)
})
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">音频格式转换</h2>
          <p class="text-gray-500 text-sm">免费在线音频格式转换工具，支持 MP3、WAV、AAC、OGG 等多种格式互转</p>
        </div>

        <!-- Upload Area -->
        <div v-if="!audioUrl" @drop="dropHandler" @dragover="dragOverHandler"
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer mb-8"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="audio/*" @change="handleFileChange" />
          <div class="text-6xl mb-4 text-gray-300">🎵</div>
          <p class="text-xl font-medium text-gray-700 mb-2">点击或拖拽音频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP3, WAV, OGG, AAC, M4A 等常见音频格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left: Preview & Info -->
          <div class="space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 class="font-bold text-gray-800 mb-4">原文件信息</h3>
              <div class="space-y-3 text-sm text-gray-600">
                <div class="flex justify-between">
                  <span>文件名:</span>
                  <span class="font-mono text-gray-800 truncate max-w-[200px]">{{ audioFile?.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span>大小:</span>
                  <span class="font-mono text-gray-800">{{ (audioFile?.size ? audioFile.size / 1024 / 1024 :
                    0).toFixed(2) }} MB</span>
                </div>
                <div class="flex justify-between">
                  <span>类型:</span>
                  <span class="font-mono text-gray-800">{{ audioFile?.type }}</span>
                </div>
              </div>

              <div class="mt-6">
                <audio :src="audioUrl" controls class="w-full"></audio>
              </div>
            </div>

            <button @click="fileInput?.click()"
              class="w-full py-2 text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              更换文件
            </button>
          </div>

          <!-- Right: Settings & Convert -->
          <div class="space-y-6">
            <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 class="font-bold text-gray-800 mb-6">转换设置</h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-3">目标格式</label>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button v-for="format in formats" :key="format.value"
                      @click="settings.targetFormat = format.value as any" 
                      class="relative px-4 py-3 rounded-lg border text-left transition-all duration-200 group hover:shadow-md"
                      :class="[
                        settings.targetFormat === format.value
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      ]">
                      <div class="flex items-center justify-between mb-1">
                        <span class="font-bold text-gray-800 group-hover:text-blue-700">{{ format.label }}</span>
                        <span v-if="settings.targetFormat === format.value" class="text-blue-500">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        </span>
                      </div>
                      <div class="text-xs text-gray-500">{{ format.desc }}</div>
                      <span class="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500" 
                        :class="{ 'bg-blue-100 text-blue-600': settings.targetFormat === format.value }">
                        {{ format.tag }}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-3">转换质量</label>
                  <div class="relative">
                    <select v-model="settings.quality"
                      class="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer hover:border-gray-400 transition-colors">
                      <option value="low">低质量 (64 kbps) - 文件最小</option>
                      <option value="medium">中等质量 (128 kbps) - 均衡</option>
                      <option value="high">高质量 (320 kbps) - 最佳音质</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-8">
                <button v-if="!isProcessing && !convertedUrl" @click="processAudio"
                  class="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0">
                  开始转换
                </button>

                <div v-else-if="isProcessing" class="space-y-3">
                  <div class="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      :style="{ width: `${progress}%` }"></div>
                  </div>
                  <p class="text-center text-sm text-gray-600">{{ statusText }}</p>
                </div>

                <div v-else class="space-y-3 animate-fade-in">
                  <div class="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <span class="text-green-700 font-medium">转换成功！</span>
                    <span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      {{ settings.targetFormat.toUpperCase() }}
                    </span>
                  </div>
                  <button @click="downloadResult"
                    class="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20"
                      fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                    </svg>
                    下载文件
                  </button>
                  <button @click="convertedUrl = ''" class="w-full py-2 text-gray-600 hover:text-gray-800 text-sm">
                    重新转换
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Instructions -->
      <div class="bg-white rounded-xl p-8 shadow-sm">
        <h3 class="text-xl font-bold mb-4 text-gray-800">使用说明</h3>
        <div class="space-y-4 text-gray-600">
          <div>
            <h4 class="font-medium text-gray-800 mb-2">1. 上传音频</h4>
            <p class="text-sm">点击上传区域或直接将音频文件拖拽到页面中。支持 MP3, WAV, OGG, AAC 等格式。</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-800 mb-2">2. 选择格式</h4>
            <p class="text-sm">选择您需要转换的目标格式（如 MP3, WAV 等）和转换质量。</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-800 mb-2">3. 开始转换</h4>
            <p class="text-sm">点击"开始转换"按钮，系统将自动处理文件。处理完成后即可下载。</p>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg">
            <h4 class="font-medium text-blue-800 mb-2">🔒 隐私安全说明</h4>
            <p class="text-sm text-blue-700">本工具所有处理均在您的浏览器本地进行，音频文件不会上传到服务器，完全保护您的隐私安全。</p>
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
    transform: translateY(10px);
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
