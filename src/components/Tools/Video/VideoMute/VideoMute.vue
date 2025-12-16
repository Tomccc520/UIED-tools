<!--
 * @file VideoMute.vue
 * @description 视频静音工具
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
    } else {
      ElMessage.warning('请选择有效的视频文件')
    }
  }
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
    ElMessage.error('无法创建 Canvas')
    isProcessing.value = false
    return
  }

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  // Capture only video stream (no audio added = mute)
  const stream = canvas.captureStream(30)
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
    progress.value = 100
    statusText.value = '处理完成！'
    ElMessage.success('静音处理完成')
  }

  mediaRecorder.start()

  const originalTime = video.currentTime
  video.currentTime = 0
  video.muted = true // Mute playback to avoid echo, though not strictly needed for logic
  
  await new Promise(r => setTimeout(r, 100))
  
  video.play()
  statusText.value = '正在移除音频...'

  const drawFrame = () => {
    if (!isProcessing.value) return

    if (video.ended) {
      mediaRecorder.stop()
      video.currentTime = originalTime
      video.muted = false
    } else {
      ctx.drawImage(video, 0, 0)
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
  a.download = `muted_${new Date().getTime()}.webm`
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
          <h2 class="text-4xl font-bold mb-3 text-gray-800">视频静音</h2>
          <p class="text-gray-500 text-sm">一键移除视频中的音频轨道，快速制作静音视频</p>
        </div>

        <!-- Upload Area -->
        <div v-if="!videoUrl"
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer mb-8"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="text-6xl mb-4 text-gray-300">🔇</div>
          <p class="text-xl font-medium text-gray-700 mb-2">点击或拖拽视频文件到此处</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="max-w-3xl mx-auto space-y-8">
          <div class="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center relative">
            <video ref="videoRef" :src="videoUrl" controls class="max-w-full max-h-[400px]"></video>
          </div>
          
          <div class="flex items-center justify-between bg-gray-50 p-6 rounded-xl">
             <div class="text-gray-700">
              <span class="font-bold">文件名:</span> {{ videoFile?.name }}
            </div>
            <div class="space-x-4">
              <button @click="processVideo" :disabled="isProcessing"
                class="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
                {{ isProcessing ? '处理中...' : '开始静音处理' }}
              </button>
              <button @click="fileInput?.click()" class="text-gray-500 hover:text-gray-700">更换视频</button>
            </div>
          </div>

          <div v-if="resultVideoUrl" class="bg-green-50 border border-green-100 rounded-xl p-6 text-center animate-fade-in">
            <h3 class="text-green-800 font-bold mb-4">处理成功</h3>
            <video :src="resultVideoUrl" controls class="max-w-full max-h-[300px] mx-auto mb-4 bg-black rounded"></video>
            <button @click="downloadVideo"
              class="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md">
              下载静音视频
            </button>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>
