<!--
 * @file VideoRotate.vue
 * @description 视频旋转与翻转工具
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
const resultVideoUrl = ref<string>('')
const videoRef = ref<HTMLVideoElement | null>(null)

const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')
const isDragOver = ref(false)

const settings = reactive({
  rotate: 0, // 0, 90, 180, 270
  flipH: false,
  flipV: false
})

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    loadVideo(target.files[0])
  }
  if (target.value) target.value = ''
}

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    loadVideo(files[0])
  }
}

const loadVideo = (file: File) => {
  if (!file.type.startsWith('video/')) {
    ElMessage.warning('请选择有效的视频文件')
    return
  }

  videoFile.value = file
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (resultVideoUrl.value) URL.revokeObjectURL(resultVideoUrl.value)

  videoUrl.value = URL.createObjectURL(file)
  resultVideoUrl.value = ''
  progress.value = 0
  statusText.value = ''

  // Reset settings
  settings.rotate = 0
  settings.flipH = false
  settings.flipV = false
}

const rotateLeft = () => {
  settings.rotate = (settings.rotate - 90 + 360) % 360
}

const rotateRight = () => {
  settings.rotate = (settings.rotate + 90) % 360
}

const toggleFlipH = () => {
  settings.flipH = !settings.flipH
}

const toggleFlipV = () => {
  settings.flipV = !settings.flipV
}

const processVideo = async () => {
  if (!videoRef.value) return

  const video = videoRef.value

  isProcessing.value = true
  statusText.value = '准备处理...'
  progress.value = 0

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    ElMessage.error('无法创建 Canvas 上下文')
    isProcessing.value = false
    return
  }

  // Calculate canvas size
  // If rotated 90 or 270, swap width and height
  if (settings.rotate % 180 !== 0) {
    canvas.width = video.videoHeight
    canvas.height = video.videoWidth
  } else {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
  }

  // Capture stream
  let stream: MediaStream | null = null
  try {
    // @ts-ignore
    const videoStream = video.captureStream ? video.captureStream() : (video.mozCaptureStream ? video.mozCaptureStream() : null)
    stream = canvas.captureStream(30)

    // Try to add audio track
    if (videoStream) {
      const audioTracks = videoStream.getAudioTracks()
      if (audioTracks.length > 0) stream.addTrack(audioTracks[0])
    }
  } catch (e) {
    console.warn('Stream capture failed', e)
  }

  if (!stream) {
    ElMessage.error('浏览器不支持')
    isProcessing.value = false
    return
  }

  const mimeType = 'video/webm;codecs=vp9,opus'
  const options = MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : { mimeType: 'video/webm' }
  const mediaRecorder = new MediaRecorder(stream, options)
  const chunks: Blob[] = []

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' })
    resultVideoUrl.value = URL.createObjectURL(blob)
    isProcessing.value = false
    progress.value = 100
    statusText.value = '处理完成！'
    ElMessage.success('处理成功')

    video.currentTime = 0
    video.pause()
  }

  // Start processing
  video.currentTime = 0
  await new Promise(r => setTimeout(r, 200))

  mediaRecorder.start()
  video.play()
  statusText.value = '正在转换...'

  const drawFrame = () => {
    if (!isProcessing.value) return

    if (video.ended) {
      mediaRecorder.stop()
    } else {
      ctx.save()

      // Move to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2)

      // Rotate
      ctx.rotate((settings.rotate * Math.PI) / 180)

      // Scale (Flip)
      ctx.scale(settings.flipH ? -1 : 1, settings.flipV ? -1 : 1)

      // Draw image centered
      // Note: when drawing, we draw at -width/2, -height/2 relative to the UNROTATED video dimensions
      ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2)

      ctx.restore()

      progress.value = Math.round((video.currentTime / video.duration) * 100)
      requestAnimationFrame(drawFrame)
    }
  }

  requestAnimationFrame(drawFrame)
}

const downloadResult = () => {
  if (!resultVideoUrl.value) return
  const a = document.createElement('a')
  a.href = resultVideoUrl.value
  a.download = `rotated_${new Date().getTime()}.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onUnmounted(() => {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (resultVideoUrl.value) URL.revokeObjectURL(resultVideoUrl.value)
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 头部区域 -->
        <div class="text-center mb-8">
          <h2
            class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            免费视频旋转/翻转
          </h2>
          <p class="text-gray-500 text-sm">在线旋转视频角度或镜像翻转，修复拍摄方向错误</p>
        </div>

        <!-- Upload Area -->
        <div v-if="!videoUrl"
          class="border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-8 group"
          :class="[isDragOver ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50']"
          @click="fileInput?.click()" @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div
            class="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <p class="text-xl font-medium text-gray-700 mb-2">点击 or 拖拽视频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP4, WebM, MOV 等常见视频格式</p>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- 左侧：配置区域 -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </span>
                操作面板
              </h3>

              <div class="space-y-5">
                <!-- Upload/Change Button -->
                <div>
                  <button @click="fileInput?.click()"
                    class="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center"
                    @drop.prevent="handleDrop" @dragover.prevent="isDragOver = true"
                    @dragleave.prevent="isDragOver = false">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {{ videoUrl ? '更换视频' : '上传视频' }}
                  </button>
                  <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
                </div>

                <!-- Transform Controls -->
                <div v-if="videoUrl" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">旋转角度</label>
                    <div class="grid grid-cols-2 gap-3">
                      <button @click="rotateLeft"
                        class="py-3 px-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all flex flex-col items-center justify-center gap-1 group">
                        <svg class="w-6 h-6 group-hover:-rotate-90 transition-transform duration-300" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                        </svg>
                        <span class="text-xs">向左 90°</span>
                      </button>
                      <button @click="rotateRight"
                        class="py-3 px-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-all flex flex-col items-center justify-center gap-1 group">
                        <svg class="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path>
                        </svg>
                        <span class="text-xs">向右 90°</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">镜像翻转</label>
                    <div class="grid grid-cols-2 gap-3">
                      <button @click="toggleFlipH"
                        class="py-3 px-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center gap-1 transition-all"
                        :class="settings.flipH ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-600'">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                        </svg>
                        <span class="text-xs">水平翻转</span>
                      </button>
                      <button @click="toggleFlipV"
                        class="py-3 px-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center gap-1 transition-all"
                        :class="settings.flipV ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-600'">
                        <svg class="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                        </svg>
                        <span class="text-xs">垂直翻转</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Process Button -->
                <div v-if="videoUrl">
                  <button @click="processVideo" :disabled="isProcessing"
                    class="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform active:scale-[0.98]">
                    <span v-if="!isProcessing" class="flex items-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      开始转换并导出
                    </span>
                    <span v-else class="flex items-center">
                      <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                      {{ statusText || '处理中...' }}
                    </span>
                  </button>
                </div>

                <!-- Progress -->
                <div v-if="isProcessing" class="space-y-2">
                  <div class="flex justify-between text-xs font-medium text-gray-600">
                    <span>{{ statusText }}</span>
                    <span>{{ progress }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${progress}%` }"></div>
                  </div>
                </div>

                <!-- Result & Download -->
                <div v-if="resultVideoUrl" class="space-y-4 pt-4 border-t border-gray-200">
                  <h3 class="font-medium text-gray-800">处理完成</h3>
                  <div
                    class="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center relative shadow-md">
                    <video :src="resultVideoUrl" controls class="max-w-full max-h-full"></video>
                  </div>
                  <button @click="downloadResult"
                    class="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-green-500/30 flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载视频
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：预览区域 -->
          <div class="lg:col-span-8">
            <div
              class="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm min-h-[500px] flex flex-col">
              <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 class="font-medium text-gray-700">实时预览</h3>
                </div>
                <div class="text-sm text-gray-500" v-if="settings.rotate !== 0 || settings.flipH || settings.flipV">
                  <span v-if="settings.rotate !== 0">旋转: {{ settings.rotate }}°</span>
                  <span v-if="settings.flipH" class="ml-2">水平翻转</span>
                  <span v-if="settings.flipV" class="ml-2">垂直翻转</span>
                </div>
              </div>

              <div class="flex-1 p-6 flex items-center justify-center bg-gray-50 relative">
                <!-- Placeholder -->
                <div v-if="!videoUrl" class="text-center text-gray-400">
                  <div class="text-6xl mb-4">🔄</div>
                  <p>请先在左侧上传视频</p>
                </div>

                <!-- Video Preview -->
                <div v-else
                  class="bg-black rounded-lg overflow-hidden shadow-lg flex items-center justify-center max-w-full relative transition-all duration-300"
                  style="max-height: 600px;">
                  <video ref="videoRef" :src="videoUrl" controls class="max-w-full max-h-[600px]" :style="{
                    transform: `rotate(${settings.rotate}deg) scale(${settings.flipH ? -1 : 1}, ${settings.flipV ? -1 : 1})`,
                    transition: 'transform 0.3s'
                  }"></video>
                </div>
              </div>
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
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
