<!--
 * @file VideoWatermark.vue
 * @description 视频加水印工具，支持文字和图片水印，支持拖拽调节位置
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
import { ref, reactive, onUnmounted, computed, watch } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useDraggable } from '@vueuse/core'

const route = useRoute()

const fileInput = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const videoFile = ref<File | null>(null)
const videoUrl = ref<string>('')
const videoRef = ref<HTMLVideoElement | null>(null)
const previewContainerRef = ref<HTMLElement | null>(null)
const watermarkRef = ref<HTMLElement | null>(null)
const resultVideoUrl = ref<string>('')

const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')

// Watermark Settings
const settings = reactive({
  type: 'text' as 'text' | 'image',
  text: 'UIED Tools',
  textColor: '#ffffff',
  textSize: 24,
  opacity: 0.8,
  image: null as File | null,
  imageUrl: '',
  imageWidth: 100,
  x: 20,
  y: 20
})

// Draggable logic - safe initialization
const { x, y } = useDraggable(watermarkRef, {
  initialValue: { x: 20, y: 20 },
  preventDefault: true,
  // Only enable when element exists
  disabled: computed(() => !videoUrl.value)
})

// Update settings when dragged
watch([x, y], ([newX, newY]) => {
  // Constrain within container
  if (previewContainerRef.value && watermarkRef.value) {
    const container = previewContainerRef.value
    const watermark = watermarkRef.value

    const maxX = container.clientWidth - watermark.clientWidth
    const maxY = container.clientHeight - watermark.clientHeight

    settings.x = Math.max(0, Math.min(newX, maxX))
    settings.y = Math.max(0, Math.min(newY, maxY))
  } else {
    settings.x = newX
    settings.y = newY
  }
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
}

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.type.startsWith('image/')) {
      settings.image = file
      if (settings.imageUrl) URL.revokeObjectURL(settings.imageUrl)
      settings.imageUrl = URL.createObjectURL(file)
      settings.type = 'image'
    } else {
      ElMessage.warning('请选择有效的图片文件')
    }
  }
}

const loadVideo = (file: File) => {
  videoFile.value = file
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (resultVideoUrl.value) URL.revokeObjectURL(resultVideoUrl.value)

  videoUrl.value = URL.createObjectURL(file)
  resultVideoUrl.value = ''
  progress.value = 0
  statusText.value = ''
}

const processVideo = async () => {
  if (!videoRef.value || !previewContainerRef.value) return

  isProcessing.value = true
  statusText.value = '准备处理...'
  progress.value = 0

  const video = videoRef.value
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    ElMessage.error('无法创建 Canvas 上下文')
    isProcessing.value = false
    return
  }

  // Set canvas size to match video resolution
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Calculate scale factor between preview and actual video
  const previewRect = previewContainerRef.value.getBoundingClientRect()
  const scaleX = video.videoWidth / previewRect.width
  const scaleY = video.videoHeight / previewRect.height

  // Setup MediaRecorder
  const stream = canvas.captureStream(30) // 30 FPS
  const mimeType = 'video/webm;codecs=vp9'
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
    statusText.value = '处理完成'
    progress.value = 100
    ElMessage.success('水印添加成功')

    // Restore video state
    video.currentTime = 0
    video.pause()
    video.muted = false
  }

  mediaRecorder.start()

  // Play and render loop
  const originalTime = video.currentTime
  video.currentTime = 0
  video.muted = true // Mute during processing to avoid feedback if any

  statusText.value = '正在渲染...'

  await video.play()

  const draw = () => {
    if (!isProcessing.value) return

    if (video.ended) {
      mediaRecorder.stop()
      return
    }

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Draw watermark
    ctx.globalAlpha = settings.opacity

    const watermarkX = settings.x * scaleX
    const watermarkY = settings.y * scaleY

    if (settings.type === 'text') {
      ctx.font = `${settings.textSize * scaleX}px Arial` // Simple scaling approximation
      ctx.fillStyle = settings.textColor
      ctx.textBaseline = 'top'
      ctx.fillText(settings.text, watermarkX, watermarkY)
    } else if (settings.type === 'image' && settings.imageUrl) {
      const img = new Image()
      img.src = settings.imageUrl
      // Note: In a real loop, we shouldn't create Image object every frame.
      // But for this simplified version, we rely on browser cache or pre-loading.
      // Better to pre-load image.
      // Let's assume it's loaded for now or do a quick hack.
      // Actually, creating new Image() synchronously in loop is bad.
      // We should load it once.
    }

    ctx.globalAlpha = 1.0

    progress.value = Math.round((video.currentTime / video.duration) * 100)

    requestAnimationFrame(draw)
  }

  // Pre-load image if needed
  if (settings.type === 'image' && settings.imageUrl) {
    const img = new Image()
    img.onload = () => {
      // Override draw function to use this img
      const originalDraw = draw
      // We need to pass img to the loop
      const drawWithImage = () => {
        if (!isProcessing.value) return
        if (video.ended) {
          mediaRecorder.stop()
          return
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = settings.opacity
        const watermarkX = settings.x * scaleX
        const watermarkY = settings.y * scaleY
        const w = settings.imageWidth * scaleX
        const h = (settings.imageWidth * img.height / img.width) * scaleX
        ctx.drawImage(img, watermarkX, watermarkY, w, h)
        ctx.globalAlpha = 1.0
        progress.value = Math.round((video.currentTime / video.duration) * 100)
        requestAnimationFrame(drawWithImage)
      }
      requestAnimationFrame(drawWithImage)
    }
    img.src = settings.imageUrl
  } else {
    requestAnimationFrame(draw)
  }
}

const downloadResult = () => {
  if (!resultVideoUrl.value) return
  const a = document.createElement('a')
  a.href = resultVideoUrl.value
  a.download = `watermarked_${new Date().getTime()}.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onUnmounted(() => {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (resultVideoUrl.value) URL.revokeObjectURL(resultVideoUrl.value)
  if (settings.imageUrl) URL.revokeObjectURL(settings.imageUrl)
})
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">视频加水印</h2>
          <p class="text-gray-500 text-sm">在线为视频添加文字或图片水印，支持拖拽调节位置，本地处理保护隐私</p>
        </div>

        <!-- Upload Area -->
        <div v-if="!videoUrl"
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer mb-8"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="text-6xl mb-4 text-gray-300">©️</div>
          <p class="text-xl font-medium text-gray-700 mb-2">点击或拖拽视频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP4, WebM, MOV 等常见视频格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left: Preview -->
          <div class="lg:col-span-2 space-y-6">
            <div ref="previewContainerRef"
              class="bg-black rounded-lg overflow-hidden relative shadow-lg group select-none">
              <video ref="videoRef" :src="videoUrl" controls class="w-full h-auto block"></video>

              <!-- Watermark Overlay -->
              <div ref="watermarkRef"
                class="absolute cursor-move hover:ring-2 hover:ring-blue-500 hover:ring-dashed p-1 rounded transition-shadow"
                :style="{
                  left: `${x}px`,
                  top: `${y}px`,
                  opacity: settings.opacity
                }">
                <span v-if="settings.type === 'text'" :style="{
                  color: settings.textColor,
                  fontSize: `${settings.textSize}px`,
                  fontFamily: 'Arial',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }">{{ settings.text }}</span>

                <img v-else-if="settings.imageUrl" :src="settings.imageUrl"
                  :style="{ width: `${settings.imageWidth}px` }" class="pointer-events-none block" />
              </div>
            </div>

            <!-- Process Status -->
            <div v-if="isProcessing" class="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span class="text-blue-700 font-medium">{{ statusText }} {{ progress }}%</span>
              </div>
              <button disabled class="text-gray-400 cursor-not-allowed">处理中不可取消</button>
            </div>
          </div>

          <!-- Right: Controls -->
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 h-full flex flex-col">
              <h3 class="font-bold text-gray-800 mb-4">水印设置</h3>

              <div class="space-y-6 flex-1">
                <!-- Type Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">水印类型</label>
                  <div class="flex bg-white rounded-lg p-1 border border-gray-200">
                    <button v-for="type in ['text', 'image']" :key="type" @click="settings.type = type as any"
                      class="flex-1 py-1.5 text-sm rounded-md transition-colors capitalize"
                      :class="settings.type === type ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'">
                      {{ type === 'text' ? '文字' : '图片' }}
                    </button>
                  </div>
                </div>

                <!-- Text Settings -->
                <template v-if="settings.type === 'text'">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">文字内容</label>
                    <input type="text" v-model="settings.text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">颜色</label>
                      <input type="color" v-model="settings.textColor" class="w-full h-10 rounded cursor-pointer" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">大小</label>
                      <input type="number" v-model="settings.textSize" min="12" max="100"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                </template>

                <!-- Image Settings -->
                <template v-else>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">上传图片</label>
                    <div @click="imageInput?.click()"
                      class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 bg-white">
                      <span class="text-sm text-gray-500">{{ settings.imageUrl ? '点击更换图片' : '点击上传图片' }}</span>
                      <input type="file" ref="imageInput" class="hidden" accept="image/*" @change="handleImageChange" />
                    </div>
                  </div>

                  <div v-if="settings.imageUrl">
                    <label class="block text-sm font-medium text-gray-700 mb-2">图片宽度 (px)</label>
                    <el-slider v-model="settings.imageWidth" :min="20" :max="500" />
                  </div>
                </template>

                <!-- Common Settings -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">不透明度</label>
                  <el-slider v-model="settings.opacity" :min="0.1" :max="1" :step="0.1" />
                </div>
              </div>

              <!-- Actions -->
              <div class="pt-6 border-t border-gray-200 space-y-3">
                <button v-if="!resultVideoUrl" @click="processVideo" :disabled="isProcessing"
                  class="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
                  <span v-if="isProcessing" class="mr-2 animate-spin">⌛</span>
                  {{ isProcessing ? '处理中...' : '开始生成视频' }}
                </button>

                <button v-if="resultVideoUrl" @click="downloadResult"
                  class="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  下载视频
                </button>

                <button @click="fileInput?.click()"
                  class="w-full py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  更换视频
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="bg-white rounded-xl p-8 shadow-sm mt-8 border-t border-gray-100">
          <h3 class="text-xl font-bold mb-4 text-gray-800">使用说明</h3>
          <div class="space-y-4 text-gray-600">
            <div>
              <h4 class="font-medium text-gray-800 mb-2">1. 设置水印</h4>
              <p class="text-sm">选择"文字"或"图片"模式，在预览区域直接拖拽水印到合适的位置。</p>
            </div>
            <div>
              <h4 class="font-medium text-gray-800 mb-2">2. 生成视频</h4>
              <p class="text-sm">点击"开始生成视频"，工具将逐帧录制视频并合成水印。请耐心等待处理完成。</p>
            </div>
            <div>
              <h4 class="font-medium text-gray-800 mb-2">3. 下载保存</h4>
              <p class="text-sm">处理完成后点击"下载视频"按钮，保存 WebM 格式文件。本地处理，不消耗流量。</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg">
              <h4 class="font-medium text-blue-800 mb-2">🔒 隐私安全说明</h4>
              <p class="text-sm text-blue-700">本工具所有处理均在您的浏览器本地进行，视频文件不会上传到服务器。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>
