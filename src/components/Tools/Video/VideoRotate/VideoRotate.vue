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
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">视频旋转/翻转</h2>
          <p class="text-gray-500 text-sm">在线旋转视频角度或镜像翻转，修复拍摄方向错误</p>
        </div>

        <!-- Upload Area -->
        <div class="border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-8 relative overflow-hidden group"
          :class="[isDragOver ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50']"
          v-if="!videoUrl"
          @click="fileInput?.click()"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="text-6xl mb-4 text-blue-500 transition-transform group-hover:scale-110 duration-300">🔄</div>
          <p class="text-xl font-bold text-gray-700 mb-2">点击或拖拽视频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP4, WebM, MOV 等格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          <!-- Left: Preview -->
          <div class="lg:col-span-2">
            <div class="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center shadow-lg relative">
              <video 
                ref="videoRef" 
                :src="videoUrl" 
                controls
                class="max-w-full max-h-[500px] transition-transform duration-300"
                :style="{
                  transform: `rotate(${settings.rotate}deg) scale(${settings.flipH ? -1 : 1}, ${settings.flipV ? -1 : 1})`
                }"
              ></video>
            </div>
          </div>
          
          <!-- Right: Controls -->
          <div class="space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
               <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                 <span class="w-1 h-5 bg-blue-600 rounded-full mr-2"></span>
                 旋转设置
               </h3>
               
               <div class="grid grid-cols-2 gap-4 mb-6">
                 <button @click="rotateLeft" class="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-sm transition-all flex flex-col items-center justify-center gap-2 group">
                   <svg class="w-6 h-6 group-hover:-rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                   <span class="text-sm font-medium">向左旋转 90°</span>
                 </button>
                 <button @click="rotateRight" class="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-sm transition-all flex flex-col items-center justify-center gap-2 group">
                   <svg class="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"></path></svg>
                   <span class="text-sm font-medium">向右旋转 90°</span>
                 </button>
                 <button @click="toggleFlipH" 
                   class="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-sm transition-all flex flex-col items-center justify-center gap-2"
                   :class="{'border-blue-500 text-blue-600 bg-blue-50': settings.flipH}">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                   <span class="text-sm font-medium">水平翻转</span>
                 </button>
                 <button @click="toggleFlipV"
                   class="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:shadow-sm transition-all flex flex-col items-center justify-center gap-2"
                   :class="{'border-blue-500 text-blue-600 bg-blue-50': settings.flipV}">
                   <svg class="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                   <span class="text-sm font-medium">垂直翻转</span>
                 </button>
               </div>
               
               <button @click="processVideo" :disabled="isProcessing"
                 class="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                 <span v-if="isProcessing" class="mr-2 animate-spin">⏳</span>
                 {{ isProcessing ? `正在处理 (${progress}%)` : '开始转换并导出' }}
               </button>
               
               <button @click="fileInput?.click()" class="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 text-sm">
                 更换视频
               </button>
            </div>
            
            <!-- Result -->
            <div v-if="resultVideoUrl" class="bg-green-50 border border-green-100 rounded-xl p-6 text-center animate-fade-in shadow-sm">
              <h3 class="text-green-800 font-bold mb-4">处理成功</h3>
              <div class="bg-black rounded-lg overflow-hidden mb-4 shadow-sm">
                 <video :src="resultVideoUrl" controls class="w-full"></video>
              </div>
              <button @click="downloadResult"
                class="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                下载视频
              </button>
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>