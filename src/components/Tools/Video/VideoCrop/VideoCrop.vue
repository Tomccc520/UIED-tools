<!--
 * @file VideoCrop.vue
 * @description 视频画面裁剪工具，支持拖拽调整裁剪区域
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
import { ref, reactive, onUnmounted, computed, watch, nextTick } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()

const fileInput = ref<HTMLInputElement | null>(null)
const videoFile = ref<File | null>(null)
const videoUrl = ref<string>('')
const resultVideoUrl = ref<string>('')
const videoRef = ref<HTMLVideoElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')

// Crop State (in percentage relative to container)
const crop = reactive({
  x: 10,
  y: 10,
  width: 80,
  height: 80,
  isDragging: false,
  isResizing: false,
  resizeHandle: '' // nw, ne, sw, se
})

// Dragging state
const dragStart = reactive({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 })

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.type.startsWith('video/')) {
      videoFile.value = file
      if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
      if (resultVideoUrl.value) URL.revokeObjectURL(resultVideoUrl.value)
      videoUrl.value = URL.createObjectURL(file)
      resultVideoUrl.value = ''

      // Reset crop
      crop.x = 10
      crop.y = 10
      crop.width = 80
      crop.height = 80
    } else {
      ElMessage.warning('请选择有效的视频文件')
    }
  }
}

// Mouse Event Handlers for Crop Box
const startDrag = (e: MouseEvent) => {
  e.preventDefault()
  crop.isDragging = true
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  dragStart.cropX = crop.x
  dragStart.cropY = crop.y

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!crop.isDragging || !containerRef.value) return

  const containerRect = containerRef.value.getBoundingClientRect()
  const deltaX = ((e.clientX - dragStart.x) / containerRect.width) * 100
  const deltaY = ((e.clientY - dragStart.y) / containerRect.height) * 100

  let newX = dragStart.cropX + deltaX
  let newY = dragStart.cropY + deltaY

  // Boundary checks
  newX = Math.max(0, Math.min(newX, 100 - crop.width))
  newY = Math.max(0, Math.min(newY, 100 - crop.height))

  crop.x = newX
  crop.y = newY
}

const stopDrag = () => {
  crop.isDragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}

// Resize Handlers
const startResize = (e: MouseEvent, handle: string) => {
  e.preventDefault()
  e.stopPropagation()
  crop.isResizing = true
  crop.resizeHandle = handle
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  dragStart.cropX = crop.x
  dragStart.cropY = crop.y
  dragStart.cropW = crop.width
  dragStart.cropH = crop.height

  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
}

const onResize = (e: MouseEvent) => {
  if (!crop.isResizing || !containerRef.value) return

  const containerRect = containerRef.value.getBoundingClientRect()
  const deltaX = ((e.clientX - dragStart.x) / containerRect.width) * 100
  const deltaY = ((e.clientY - dragStart.y) / containerRect.height) * 100

  if (crop.resizeHandle.includes('e')) {
    crop.width = Math.max(5, Math.min(dragStart.cropW + deltaX, 100 - dragStart.cropX))
  }
  if (crop.resizeHandle.includes('s')) {
    crop.height = Math.max(5, Math.min(dragStart.cropH + deltaY, 100 - dragStart.cropY))
  }
  if (crop.resizeHandle.includes('w')) {
    const maxDelta = dragStart.cropW - 5
    const actualDelta = Math.min(deltaX, maxDelta)
    const newX = Math.max(0, dragStart.cropX + actualDelta)
    if (newX !== crop.x) {
      crop.width = dragStart.cropW - (newX - dragStart.cropX)
      crop.x = newX
    }
  }
  if (crop.resizeHandle.includes('n')) {
    const maxDelta = dragStart.cropH - 5
    const actualDelta = Math.min(deltaY, maxDelta)
    const newY = Math.max(0, dragStart.cropY + actualDelta)
    if (newY !== crop.y) {
      crop.height = dragStart.cropH - (newY - dragStart.cropY)
      crop.y = newY
    }
  }
}

const stopResize = () => {
  crop.isResizing = false
  crop.resizeHandle = ''
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
}

// Processing Logic
const processVideo = async () => {
  if (!videoRef.value) return

  const video = videoRef.value

  // Calculate actual crop coordinates
  const sx = (crop.x / 100) * video.videoWidth
  const sy = (crop.y / 100) * video.videoHeight
  const sWidth = (crop.width / 100) * video.videoWidth
  const sHeight = (crop.height / 100) * video.videoHeight

  // Validate dimensions
  if (sWidth < 10 || sHeight < 10) {
    ElMessage.warning('裁剪区域太小')
    return
  }

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

  // Set canvas size to crop size
  canvas.width = sWidth
  canvas.height = sHeight

  // Setup MediaRecorder
  const canvasStream = canvas.captureStream(30) // 30 FPS

  // Try to get audio track from original video
  try {
    // @ts-ignore - captureStream is experimental but supported
    const videoStream = video.captureStream ? video.captureStream() : (video.mozCaptureStream ? video.mozCaptureStream() : null)
    if (videoStream) {
      const audioTracks = videoStream.getAudioTracks()
      if (audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0])
      }
    } else {
      // Fallback: Use AudioContext to capture audio if captureStream fails
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioCtx.createMediaElementSource(video)
      const dest = audioCtx.createMediaStreamDestination()
      source.connect(dest)
      source.connect(audioCtx.destination) // Optional: hear it while processing
      if (dest.stream.getAudioTracks().length > 0) {
        canvasStream.addTrack(dest.stream.getAudioTracks()[0])
      }
    }
  } catch (e) {
    console.warn('Audio capture failed:', e)
  }

  const mimeType = 'video/webm;codecs=vp9,opus'
  const options = MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : { mimeType: 'video/webm' }
  const mediaRecorder = new MediaRecorder(canvasStream, options)
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
    ElMessage.success('裁剪完成')
  }

  mediaRecorder.start()

  // Play video from start to end to record
  const originalTime = video.currentTime
  video.currentTime = 0

  await new Promise(r => setTimeout(r, 100)) // Wait for seek

  video.play()
  statusText.value = '正在裁剪...'

  const drawFrame = () => {
    if (!isProcessing.value) return

    if (video.ended) {
      mediaRecorder.stop()
      video.currentTime = originalTime
    } else {
      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight)
      progress.value = Math.round((video.currentTime / video.duration) * 100)
      requestAnimationFrame(drawFrame)
    }
  }
  requestAnimationFrame(drawFrame)
}

const downloadVideo = () => {
  if (!resultVideoUrl.value) return
  const a = document.createElement('a')
  a.href = resultVideoUrl.value
  a.download = `cropped_${new Date().getTime()}.webm`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onUnmounted(() => {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (resultVideoUrl.value) URL.revokeObjectURL(resultVideoUrl.value)
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
})
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">视频画面裁剪</h2>
          <p class="text-gray-500 text-sm">在线裁剪视频画面区域，支持自由调整比例，本地处理保护隐私</p>
        </div>

        <!-- Upload Area -->
        <div v-if="!videoUrl"
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer mb-8"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="text-6xl mb-4 text-gray-300">✂️</div>
          <p class="text-xl font-medium text-gray-700 mb-2">点击或拖拽视频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP4, WebM, MOV 等常见视频格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left: Preview & Crop -->
          <div class="lg:col-span-2 space-y-6">
            <div ref="containerRef"
              class="bg-black rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center select-none"
              style="min-height: 400px;">
              <video ref="videoRef" :src="videoUrl" class="max-w-full max-h-[500px]" controls></video>

              <!-- Crop Overlay -->
              <div class="absolute inset-0 pointer-events-none">
                <!-- Dimmed Areas -->
                <!-- Top -->
                <div class="absolute bg-black/50" :style="{ top: 0, left: 0, right: 0, height: `${crop.y}%` }"></div>
                <!-- Bottom -->
                <div class="absolute bg-black/50"
                  :style="{ bottom: 0, left: 0, right: 0, height: `${100 - crop.y - crop.height}%` }"></div>
                <!-- Left -->
                <div class="absolute bg-black/50"
                  :style="{ top: `${crop.y}%`, left: 0, width: `${crop.x}%`, height: `${crop.height}%` }"></div>
                <!-- Right -->
                <div class="absolute bg-black/50"
                  :style="{ top: `${crop.y}%`, right: 0, width: `${100 - crop.x - crop.width}%`, height: `${crop.height}%` }">
                </div>

                <!-- Crop Box -->
                <div
                  class="absolute border-2 border-white pointer-events-auto cursor-move shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                  :style="{
                    left: `${crop.x}%`,
                    top: `${crop.y}%`,
                    width: `${crop.width}%`,
                    height: `${crop.height}%`
                  }" @mousedown.stop="startDrag">
                  <!-- Grid Lines -->
                  <div class="absolute top-1/3 left-0 right-0 h-px bg-white/30 pointer-events-none"></div>
                  <div class="absolute top-2/3 left-0 right-0 h-px bg-white/30 pointer-events-none"></div>
                  <div class="absolute left-1/3 top-0 bottom-0 w-px bg-white/30 pointer-events-none"></div>
                  <div class="absolute left-2/3 top-0 bottom-0 w-px bg-white/30 pointer-events-none"></div>

                  <!-- Resize Handles -->
                  <div class="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
                    @mousedown.stop="startResize($event, 'nw')"></div>
                  <div class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
                    @mousedown.stop="startResize($event, 'ne')"></div>
                  <div class="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
                    @mousedown.stop="startResize($event, 'sw')"></div>
                  <div class="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
                    @mousedown.stop="startResize($event, 'se')"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Controls -->
          <div class="space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="w-1 h-6 bg-blue-600 rounded-full mr-2"></span>
                裁剪设置
              </h3>

              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div>X: {{ Math.round(crop.x) }}%</div>
                <div>Y: {{ Math.round(crop.y) }}%</div>
                <div>宽: {{ Math.round(crop.width) }}%</div>
                <div>高: {{ Math.round(crop.height) }}%</div>
              </div>

              <div class="text-xs text-gray-400 mb-6">
                提示：直接在左侧预览图中拖动方框或调整边角
              </div>

              <button @click="processVideo" :disabled="isProcessing"
                class="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-3">
                {{ isProcessing ? '正在裁剪...' : '开始裁剪并导出' }}
              </button>

              <button @click="fileInput?.click()" class="w-full py-2 text-gray-500 hover:text-gray-700 text-sm">
                更换视频
              </button>
            </div>

            <!-- Result -->
            <div class="space-y-4">
              <h3 class="font-bold text-gray-700">导出结果</h3>
              <div
                class="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center relative shadow-lg">
                <video v-if="resultVideoUrl" :src="resultVideoUrl" controls class="max-w-full max-h-full"></video>
                <div v-else class="text-gray-500 flex flex-col items-center p-6 w-full">
                  <div v-if="isProcessing" class="w-full max-w-xs">
                    <div class="flex justify-between text-xs font-medium text-blue-400 mb-2">
                      <span>{{ statusText }}</span>
                      <span>{{ progress }}%</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-2 overflow-hidden mb-4">
                      <div class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${progress}%` }"></div>
                    </div>
                  </div>
                  <div v-else class="text-center">
                    <div class="text-4xl mb-2">🎬</div>
                    <p>点击上方按钮开始处理</p>
                  </div>
                </div>
              </div>

              <button v-if="resultVideoUrl" @click="downloadVideo"
                class="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载裁剪后的视频
              </button>
            </div>
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="bg-white rounded-xl p-8 shadow-sm mt-8 border-t border-gray-100">
          <h3 class="text-xl font-bold mb-4 text-gray-800">使用说明</h3>
          <div class="space-y-4 text-gray-600">
            <div>
              <h4 class="font-medium text-gray-800 mb-2">1. 调整区域</h4>
              <p class="text-sm">在视频预览区中，拖动白色方框移动裁剪位置，拖动方框四角的控制点调整裁剪大小。</p>
            </div>
            <div>
              <h4 class="font-medium text-gray-800 mb-2">2. 开始裁剪</h4>
              <p class="text-sm">点击"开始裁剪并导出"按钮，工具将逐帧录制选定区域。处理时间取决于视频长度。</p>
            </div>
            <div>
              <h4 class="font-medium text-gray-800 mb-2">3. 下载保存</h4>
              <p class="text-sm">处理完成后点击下载按钮，保存 WebM 格式文件。</p>
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
