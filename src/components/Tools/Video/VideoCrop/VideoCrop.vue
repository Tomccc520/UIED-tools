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
const isDragOver = ref(false)

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

const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
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
      <div class="bg-white rounded-xl shadow-sm min-h-[600px] p-6 sm:p-8">
        <!-- 头部区域 -->
        <div class="text-center mb-8">
          <h2
            class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            视频画面裁剪
          </h2>
          <p class="text-gray-500 text-sm">在线裁剪视频画面区域，支持自由调整比例，本地处理保护隐私</p>
        </div>

        <!-- Upload Area -->
        <div v-if="!videoUrl"
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer mb-8 group"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
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
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </span>
                操作面板
              </h3>

              <div class="space-y-6">
                <!-- Crop Info -->
                <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <h4 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                    裁剪参数
                  </h4>
                  <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div class="flex justify-between p-2 bg-gray-50 rounded"><span>X:</span> <span class="font-mono font-medium text-indigo-600">{{ Math.round(crop.x) }}%</span></div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded"><span>Y:</span> <span class="font-mono font-medium text-indigo-600">{{ Math.round(crop.y) }}%</span></div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded"><span>宽:</span> <span class="font-mono font-medium text-indigo-600">{{ Math.round(crop.width) }}%</span></div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded"><span>高:</span> <span class="font-mono font-medium text-indigo-600">{{ Math.round(crop.height) }}%</span></div>
                  </div>
                </div>

                <!-- Process Button -->
                <div class="space-y-3">
                  <button @click="processVideo" :disabled="isProcessing"
                    class="w-full py-3 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    <span v-if="isProcessing" class="mr-2 animate-spin">
                      <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                    {{ isProcessing ? '处理中...' : '开始裁剪' }}
                  </button>

                  <button v-if="resultVideoUrl" @click="downloadVideo"
                    class="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载视频
                  </button>

                  <button @click="fileInput?.click()"
                    class="w-full py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    更换视频
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：预览区域 -->
          <div class="lg:col-span-8 space-y-6">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 class="font-medium text-gray-700">预览 & 裁剪</h3>
                </div>
              </div>

              <div class="flex-1 p-6 flex items-center justify-center bg-gray-50 relative min-h-[400px]">
                <!-- Video Preview -->
                <div ref="containerRef"
                  class="bg-black rounded-lg overflow-hidden relative shadow-lg flex items-center justify-center select-none max-w-full"
                  style="max-height: 600px;">
                  <video ref="videoRef" :src="videoUrl" class="max-w-full max-h-[600px]" controls></video>

                  <!-- Crop Overlay -->
                  <div class="absolute inset-0 pointer-events-none">
                    <!-- Dimmed Areas -->
                    <div class="absolute bg-black/50 transition-all duration-75" :style="{ top: 0, left: 0, right: 0, height: `${crop.y}%` }"></div>
                    <div class="absolute bg-black/50 transition-all duration-75" :style="{ bottom: 0, left: 0, right: 0, height: `${100 - crop.y - crop.height}%` }"></div>
                    <div class="absolute bg-black/50 transition-all duration-75" :style="{ top: `${crop.y}%`, left: 0, width: `${crop.x}%`, height: `${crop.height}%` }"></div>
                    <div class="absolute bg-black/50 transition-all duration-75" :style="{ top: `${crop.y}%`, right: 0, width: `${100 - crop.x - crop.width}%`, height: `${crop.height}%` }"></div>

                    <!-- Crop Box -->
                    <div
                      class="absolute border-2 border-white pointer-events-auto cursor-move shadow-[0_0_0_1px_rgba(0,0,0,0.5)] transition-all duration-75"
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
                      <div class="absolute -top-1.5 -left-1.5 w-3 h-3 bg-indigo-500 border border-white cursor-nw-resize hover:scale-125 transition-transform"
                        @mousedown.stop="startResize($event, 'nw')"></div>
                      <div class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-indigo-500 border border-white cursor-ne-resize hover:scale-125 transition-transform"
                        @mousedown.stop="startResize($event, 'ne')"></div>
                      <div class="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-indigo-500 border border-white cursor-sw-resize hover:scale-125 transition-transform"
                        @mousedown.stop="startResize($event, 'sw')"></div>
                      <div class="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-indigo-500 border border-white cursor-se-resize hover:scale-125 transition-transform"
                        @mousedown.stop="startResize($event, 'se')"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Progress Status -->
            <div v-if="isProcessing" class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
               <div class="flex justify-between items-center mb-2">
                 <span class="text-sm font-medium text-gray-700">{{ statusText }}</span>
                 <span class="text-sm font-medium text-indigo-600">{{ progress }}%</span>
               </div>
               <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                 <div class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                   :style="{ width: `${progress}%` }"></div>
               </div>
               <p class="text-xs text-gray-400 mt-2 text-center">处理过程中请勿关闭页面</p>
             </div>
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 mt-12">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
             <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             使用说明
           </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">1</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">调整区域</h4>
                <p>直接在预览画面中拖动裁剪框调整位置，拖动四个角调整裁剪大小。</p>
              </div>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">2</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">开始裁剪</h4>
                <p>设置好裁剪区域后，点击"开始裁剪"按钮，工具将自动处理视频画面。</p>
              </div>
            </div>
            <div class="flex items-start">
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">3</span>
              <div>
                <h4 class="font-medium text-gray-800 mb-1">保存视频</h4>
                <p>处理完成后，点击"下载视频"即可保存裁剪后的视频文件。</p>
              </div>
            </div>
          </div>
          <div class="mt-6 pt-6 border-t border-gray-200">
             <div class="flex items-center text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-200">
               <svg class="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
               </svg>
               <span class="text-gray-700 font-medium mr-2">隐私安全说明:</span>
               本工具所有处理均在您的浏览器本地进行，视频文件不会上传到服务器。
             </div>
           </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>
