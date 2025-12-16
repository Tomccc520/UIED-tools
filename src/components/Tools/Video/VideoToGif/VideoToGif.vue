<!--
 * @file VideoToGif.vue
 * @description 视频转GIF工具，支持截取片段、调整尺寸和帧率
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
import GIF from 'gif.js'
import { ElMessage } from 'element-plus'

const route = useRoute()

const fileInput = ref<HTMLInputElement | null>(null)
const videoFile = ref<File | null>(null)
const videoUrl = ref<string>('')
const videoRef = ref<HTMLVideoElement | null>(null)
const gifUrl = ref<string>('')
const isProcessing = ref(false)
const progress = ref(0)
const statusText = ref('')

// Settings
const settings = reactive({
  startTime: 0,
  endTime: 0,
  width: 320,
  height: 0, // auto calculated
  fps: 10,
  quality: 10, // 1-30, lower is better
  speed: 1
})

const videoMeta = reactive({
  duration: 0,
  width: 0,
  height: 0
})

/**
 * 处理文件选择
 * @param event - 事件对象
 */
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

/**
 * 加载视频文件
 * @param file - 视频文件对象
 */
const loadVideo = (file: File) => {
  videoFile.value = file
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (gifUrl.value) URL.revokeObjectURL(gifUrl.value)

  videoUrl.value = URL.createObjectURL(file)
  gifUrl.value = ''
  progress.value = 0
  statusText.value = ''
}

/**
 * 视频加载完成回调
 * 初始化视频元数据和默认设置
 */
const onVideoLoaded = () => {
  if (videoRef.value) {
    videoMeta.duration = videoRef.value.duration
    videoMeta.width = videoRef.value.videoWidth
    videoMeta.height = videoRef.value.videoHeight

    // Init settings
    settings.startTime = 0
    settings.endTime = Math.min(videoRef.value.duration, 5) // Default 5s

    // Scale width to max 480 for performance default
    const ratio = videoMeta.width / videoMeta.height
    settings.width = Math.min(videoMeta.width, 480)
    settings.height = Math.round(settings.width / ratio)
  }
}

/**
 * 处理宽度变化
 * 自动计算高度以保持纵横比
 */
const handleWidthChange = () => {
  if (videoMeta.width && videoMeta.height) {
    const ratio = videoMeta.width / videoMeta.height
    settings.height = Math.round(settings.width / ratio)
  }
}

/**
 * 格式化时间
 * @param seconds - 秒数
 * @returns 格式化后的时间字符串 (mm:ss.ms)
 */
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${m}:${s.toString().padStart(2, '0')}.${ms}`
}

/**
 * 生成GIF
 * 截取视频帧并合成GIF
 */
const generateGif = async () => {
  if (!videoRef.value) return

  isProcessing.value = true
  progress.value = 0
  statusText.value = '准备处理...'
  gifUrl.value = ''

  try {
    const video = videoRef.value
    const canvas = document.createElement('canvas')
    canvas.width = settings.width
    canvas.height = settings.height
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('Canvas context failed')

    const gif = new GIF({
      workers: 2,
      quality: settings.quality,
      width: settings.width,
      height: settings.height,
      workerScript: '/workers/gif.worker.js'
    })

    const duration = settings.endTime - settings.startTime
    const fps = settings.fps
    const interval = 1 / fps
    const totalFrames = Math.ceil(duration * fps)

    let currentFrame = 0
    let currentTime = settings.startTime

    statusText.value = '正在截取帧...'

    // Save current video state
    const originalTime = video.currentTime
    const wasPaused = video.paused

    video.pause()

    while (currentTime <= settings.endTime) {
      video.currentTime = currentTime

      await new Promise(resolve => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked)
          resolve(null)
        }
        video.addEventListener('seeked', onSeeked)
      })

      ctx.drawImage(video, 0, 0, settings.width, settings.height)

      gif.addFrame(ctx, {
        copy: true,
        delay: (1000 / fps) / settings.speed
      })

      currentFrame++
      progress.value = Math.round((currentFrame / totalFrames) * 50)
      currentTime += interval
    }

    // Restore video state
    video.currentTime = originalTime

    statusText.value = '正在渲染GIF...'

    gif.on('progress', (p: number) => {
      progress.value = 50 + Math.round(p * 50)
    })

    gif.on('finished', (blob: Blob) => {
      gifUrl.value = URL.createObjectURL(blob)
      isProcessing.value = false
      statusText.value = '生成完成！'
      progress.value = 100
      ElMessage.success('GIF 生成成功')
    })

    gif.render()

  } catch (error) {
    console.error(error)
    ElMessage.error('生成失败，请重试')
    isProcessing.value = false
    statusText.value = '生成失败'
  }
}

const downloadGif = () => {
  if (!gifUrl.value) return
  const a = document.createElement('a')
  a.href = gifUrl.value
  const filename = videoFile.value ? videoFile.value.name.replace(/\.[^/.]+$/, "") : 'video'
  a.download = `${filename}_${settings.width}w.gif`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onUnmounted(() => {
  if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
  if (gifUrl.value) URL.revokeObjectURL(gifUrl.value)
})

const dropHandler = (ev: DragEvent) => {
  ev.preventDefault()
  if (ev.dataTransfer?.items) {
    const item = ev.dataTransfer.items[0]
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file && file.type.startsWith('video/')) {
        loadVideo(file)
      }
    }
  }
}

const dragOverHandler = (ev: DragEvent) => {
  ev.preventDefault()
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">视频转 GIF</h2>
          <p class="text-gray-500 text-sm">在线将视频转换为 GIF 动图，支持截取片段、调整尺寸和帧率，本地处理保护隐私</p>
        </div>

        <!-- Upload Area -->
        <div v-if="!videoUrl" @drop="dropHandler" @dragover="dragOverHandler"
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer mb-8"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="text-6xl mb-4 text-gray-300">🎞️</div>
          <p class="text-xl font-medium text-gray-700 mb-2">点击或拖拽视频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP4, WebM, MOV 等常见视频格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left: Video & Controls -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Video Player -->
            <div
              class="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center relative shadow-lg">
              <video ref="videoRef" :src="videoUrl" controls class="w-full h-full max-h-[500px]"
                @loadedmetadata="onVideoLoaded"></video>
            </div>

            <!-- Controls -->
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Time Range -->
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    截取片段 ({{ formatTime(settings.startTime) }} - {{ formatTime(settings.endTime) }})
                    <span class="text-xs text-gray-500 ml-2">时长: {{ (settings.endTime - settings.startTime).toFixed(1)
                      }}s</span>
                  </label>
                  <div class="flex items-center gap-4">
                    <el-input-number v-model="settings.startTime" :min="0" :max="settings.endTime" :step="0.1"
                      size="small" />
                    <el-slider v-model="settings.startTime" :max="videoMeta.duration" :step="0.1" class="flex-1"
                      :show-tooltip="false" range v-if="false" />
                    <!-- Simple slider for start/end is tricky with element-plus range slider binding to array. Use two inputs for simplicity or custom slider -->
                    <span class="text-gray-400">至</span>
                    <el-input-number v-model="settings.endTime" :min="settings.startTime" :max="videoMeta.duration"
                      :step="0.1" size="small" />
                  </div>
                  <el-slider v-model="settings.startTime" :max="videoMeta.duration" :step="0.1" class="mt-2" />
                  <el-slider v-model="settings.endTime" :max="videoMeta.duration" :step="0.1" />
                </div>

                <!-- Size -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">宽度 (px)</label>
                  <el-input-number v-model="settings.width" :min="50" :max="1920" @change="handleWidthChange"
                    class="w-full" />
                  <p class="text-xs text-gray-500 mt-1">高度将自动按比例调整: {{ settings.height }}px</p>
                </div>

                <!-- FPS -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">帧率 (FPS)</label>
                  <el-slider v-model="settings.fps" :min="1" :max="30" :step="1" show-input />
                </div>

                <!-- Speed -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">播放速度</label>
                  <el-select v-model="settings.speed" class="w-full">
                    <el-option label="0.5x (慢放)" :value="0.5" />
                    <el-option label="1.0x (正常)" :value="1" />
                    <el-option label="1.5x (快放)" :value="1.5" />
                    <el-option label="2.0x (倍速)" :value="2" />
                  </el-select>
                </div>

                <!-- Quality -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">画质 (1-30)</label>
                  <el-slider v-model="settings.quality" :min="1" :max="30" :step="1"
                    :format-tooltip="(val: number) => val + ' (数值越小画质越好)'" />
                  <p class="text-xs text-gray-500 mt-1">数值越小画质越好，但处理越慢</p>
                </div>
              </div>

              <div class="flex gap-4 pt-4 border-t border-gray-200">
                <button @click="fileInput?.click()"
                  class="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  更换视频
                </button>
                <button @click="generateGif" :disabled="isProcessing"
                  class="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {{ isProcessing ? '处理中...' : '生成 GIF' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Result -->
          <div class="lg:col-span-1 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 h-full flex flex-col">
              <h3 class="font-bold text-gray-800 mb-4">生成结果</h3>

              <div
                class="flex-1 flex flex-col items-center justify-center min-h-[300px] bg-white rounded-lg border-2 border-dashed border-gray-200 p-4 relative overflow-hidden">

                <div v-if="isProcessing" class="text-center z-10">
                  <el-progress type="circle" :percentage="progress" />
                  <p class="mt-4 text-blue-600 font-medium animate-pulse">{{ statusText }}</p>
                </div>

                <div v-else-if="gifUrl" class="w-full h-full flex flex-col items-center">
                  <img :src="gifUrl" class="max-w-full max-h-[400px] object-contain rounded shadow-sm mb-4" />
                  <p class="text-xs text-gray-500 mb-4">长按图片可保存或拖拽</p>
                  <button @click="downloadGif"
                    class="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载 GIF
                  </button>
                </div>

                <div v-else class="text-center text-gray-400">
                  <div class="text-5xl mb-3">🖼️</div>
                  <p>预览区域</p>
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
            <h4 class="font-medium text-gray-800 mb-2">1. 调整片段</h4>
            <p class="text-sm">使用滑块选择要转换的视频起止时间。建议片段不要过长，以免生成时间过久。</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-800 mb-2">2. 设置参数</h4>
            <p class="text-sm">调整宽度会自动按比例计算高度。帧率越高画面越流畅但文件越大。画质数值越小越清晰。</p>
          </div>
          <div>
            <h4 class="font-medium text-gray-800 mb-2">3. 生成下载</h4>
            <p class="text-sm">点击生成按钮，等待处理完成后即可预览和下载。GIF 生成完全在本地进行，不消耗流量。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>

<style scoped>
:deep(.el-slider__runway) {
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>
