<!--
 * @file VideoFlip.vue
 * @description 视频翻转/旋转工具
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
import { ref, reactive, onUnmounted, computed } from 'vue'
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

const transform = reactive({
  rotate: 0, // 0, 90, 180, 270
  flipH: false,
  flipV: false
})

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
      transform.rotate = 0
      transform.flipH = false
      transform.flipV = false
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
      transform.rotate = 0
      transform.flipH = false
      transform.flipV = false
    } else {
      ElMessage.warning('请选择有效的视频文件')
    }
  }
}

const rotate = () => {
  transform.rotate = (transform.rotate + 90) % 360
}

const previewStyle = computed(() => {
  let transformStr = `rotate(${transform.rotate}deg)`
  if (transform.flipH) transformStr += ' scaleX(-1)'
  if (transform.flipV) transformStr += ' scaleY(-1)'
  return { transform: transformStr, transition: 'transform 0.3s' }
})

const processVideo = async () => {
  if (!videoRef.value) return
  const video = videoRef.value

  isProcessing.value = true
  statusText.value = '准备处理...'
  progress.value = 0

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    ElMessage.error('无法创建 Canvas')
    isProcessing.value = false
    return
  }

  // Calculate canvas dimensions based on rotation
  if (transform.rotate === 90 || transform.rotate === 270) {
    canvas.width = video.videoHeight
    canvas.height = video.videoWidth
  } else {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
  }

  // Setup MediaRecorder
  const canvasStream = canvas.captureStream(30)

  // Capture Audio
  try {
    // @ts-ignore
    const videoStream = video.captureStream ? video.captureStream() : (video.mozCaptureStream ? video.mozCaptureStream() : null)
    if (videoStream) {
      const audioTracks = videoStream.getAudioTracks()
      if (audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0])
      }
    } else {
       // Fallback
       const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
       const source = audioCtx.createMediaElementSource(video)
       const dest = audioCtx.createMediaStreamDestination()
       source.connect(dest)
       source.connect(audioCtx.destination)
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
    ElMessage.success('翻转处理完成')
  }

  mediaRecorder.start()

  const originalTime = video.currentTime
  video.currentTime = 0

  await new Promise(r => setTimeout(r, 100))

  video.play()
  statusText.value = '正在录制...'

  const drawFrame = () => {
    if (!isProcessing.value) return

    if (video.ended) {
      mediaRecorder.stop()
      video.currentTime = originalTime
    } else {
      ctx.save()

      // Center origin
      ctx.translate(canvas.width / 2, canvas.height / 2)

      // Rotate
      ctx.rotate((transform.rotate * Math.PI) / 180)

      // Flip
      ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1)

      // Draw image centered
      // If rotated 90/270, width/height are swapped in canvas size, but drawImage expects image dims
      // We need to draw the video such that it fits the rotated canvas
      // When rotated 90deg, canvas w=H, h=W.
      // We are at center.
      // We draw video at -W/2, -H/2
      ctx.drawImage(video, -video.videoWidth / 2, -video.videoHeight / 2)

      ctx.restore()

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
  a.download = `flipped_${new Date().getTime()}.webm`
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
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl shadow-sm min-h-[600px] p-6 sm:p-8">
        <!-- 头部区域 -->
        <div class="text-center mb-8">
          <h2
            class="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            视频翻转/旋转
          </h2>
          <p class="text-gray-500 text-sm">在线旋转视频方向，支持水平/垂直翻转，快速修复拍摄方向错误</p>
        </div>

        <!-- Upload Area -->
        <div v-if="!videoUrl"
          class="border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-8 group"
          :class="[isDragOver ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50']"
          @click="fileInput?.click()"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop">
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </span>
                操作面板
              </h3>

              <div class="space-y-6">
                <!-- Transform Controls -->
                <div class="space-y-3">
                  <label class="block text-sm font-medium text-gray-700">变换设置</label>
                  <button @click="rotate"
                    class="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center shadow-sm font-medium group">
                    <span class="mr-2 text-lg group-hover:rotate-90 transition-transform duration-300">↻</span> 旋转 90° (当前: {{ transform.rotate }}°)
                  </button>
                  <div class="grid grid-cols-2 gap-3">
                    <button @click="transform.flipH = !transform.flipH"
                      class="py-3 px-4 border rounded-xl hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm font-medium"
                      :class="transform.flipH ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-600'">
                      <span class="mr-2 text-lg">↔</span> 水平翻转
                    </button>
                    <button @click="transform.flipV = !transform.flipV"
                      class="py-3 px-4 border rounded-xl hover:bg-gray-50 flex items-center justify-center transition-all shadow-sm font-medium"
                      :class="transform.flipV ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-600'">
                      <span class="mr-2 text-lg">↕</span> 垂直翻转
                    </button>
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
                    {{ isProcessing ? '处理中...' : '开始处理' }}
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 class="font-medium text-gray-700">实时预览</h3>
                </div>
              </div>

              <div class="flex-1 p-6 flex items-center justify-center bg-gray-50 relative min-h-[400px]">
                <!-- Video Preview -->
                <div class="bg-black rounded-lg overflow-hidden shadow-lg flex items-center justify-center max-w-full relative transition-all duration-300"
                  style="max-height: 600px;">
                  <video ref="videoRef" :src="videoUrl" controls class="max-w-full max-h-[600px]"
                    :style="previewStyle"></video>
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
                 <h4 class="font-medium text-gray-800 mb-1">设置参数</h4>
                 <p>点击"旋转"按钮调整视频角度，或使用水平/垂直翻转功能镜像视频。</p>
               </div>
             </div>
             <div class="flex items-start">
               <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">2</span>
               <div>
                 <h4 class="font-medium text-gray-800 mb-1">预览效果</h4>
                 <p>在右侧预览区域实时查看视频变换效果，确认无误后点击处理。</p>
               </div>
             </div>
             <div class="flex items-start">
               <span class="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mr-3">3</span>
               <div>
                 <h4 class="font-medium text-gray-800 mb-1">保存视频</h4>
                 <p>处理完成后，点击"下载视频"即可保存 WebM 格式文件到本地。</p>
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
