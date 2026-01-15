<!--
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 -->

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */
import { ref, onUnmounted, computed, nextTick } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import JSZip from 'jszip'

const route = useRoute()

const fileInput = ref<HTMLInputElement | null>(null)
const videoFile = ref<File | null>(null)
const videoUrl = ref<string>('')
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const screenshots = ref<{ url: string; time: number }[]>([])

// Auto Extract Settings
const showAutoExtract = ref(false)
const extractMode = ref<'interval' | 'count'>('count')
const extractCount = ref(10)
const extractInterval = ref(5)
const isExtracting = ref(false)
const extractProgress = ref(0)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.type.startsWith('video/')) {
      videoFile.value = file
      if (videoUrl.value) {
        URL.revokeObjectURL(videoUrl.value)
      }
      videoUrl.value = URL.createObjectURL(file)
      screenshots.value = []
      currentTime.value = 0
    } else {
      ElMessage.warning('请选择有效的视频文件')
    }
  }
}

const handleTimeUpdate = () => {
  if (videoRef.value && !isExtracting.value) {
    currentTime.value = videoRef.value.currentTime
  }
}

const handleLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

const captureFrame = async (time?: number) => {
  if (!videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // If a specific time is requested, seek to it first
    if (typeof time === 'number') {
      video.currentTime = time
      await new Promise(resolve => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked)
          resolve(true)
        }
        video.addEventListener('seeked', onSeeked)
      })
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageUrl = canvas.toDataURL('image/png')
    const screenshot = {
      url: imageUrl,
      time: video.currentTime
    }

    // Check if duplicate
    const isDuplicate = screenshots.value.some(s => Math.abs(s.time - screenshot.time) < 0.1)
    if (!isDuplicate) {
      screenshots.value.unshift(screenshot)
    }
  }
}

const startAutoExtract = async () => {
  if (!videoRef.value || duration.value <= 0) {
    ElMessage.warning('请先加载有效的视频')
    return
  }

  if (extractMode.value === 'interval' && extractInterval.value <= 0) {
    ElMessage.warning('间隔时间必须大于0')
    return
  }

  isExtracting.value = true
  showAutoExtract.value = false
  extractProgress.value = 0

  const video = videoRef.value
  const wasPlaying = !video.paused
  video.pause()

  const points: number[] = []

  if (extractMode.value === 'count') {
    const step = duration.value / (extractCount.value + 1)
    for (let i = 1; i <= extractCount.value; i++) {
      points.push(step * i)
    }
  } else {
    for (let t = extractInterval.value; t < duration.value; t += extractInterval.value) {
      points.push(t)
    }
  }

  if (points.length === 0) {
    ElMessage.warning('设置的条件无法提取到任何帧')
    isExtracting.value = false
    return
  }

  try {
    for (let i = 0; i < points.length; i++) {
      await captureFrame(points[i])
      extractProgress.value = Math.round(((i + 1) / points.length) * 100)
    }
    ElMessage.success(`成功提取 ${points.length} 帧画面`)
  } catch (error) {
    ElMessage.error('自动提取过程中出错')
    console.error(error)
  } finally {
    isExtracting.value = false
    video.currentTime = points[points.length - 1]
    if (wasPlaying) video.play()
  }
}

const stepFrame = (frames: number) => {
  if (videoRef.value) {
    // Assuming 30fps as a safe default, so 1 frame is ~0.033s
    videoRef.value.currentTime += frames * 0.04
  }
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

const downloadImage = (item: { url: string; time: number }) => {
  const a = document.createElement('a')
  a.href = item.url
  a.download = `frame_${formatTime(item.time).replace(/[:.]/g, '_')}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const downloadAll = async () => {
  if (screenshots.value.length === 0) return

  const zip = new JSZip()
  const folder = zip.folder("video_frames")

  screenshots.value.forEach((shot, index) => {
    // Remove data:image/png;base64, prefix
    const base64Data = shot.url.split(',')[1]
    const fileName = `frame_${formatTime(shot.time).replace(/[:.]/g, '_')}.png`
    folder?.file(fileName, base64Data, { base64: true })
  })

  try {
    const content = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = "video_frames.zip"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('批量下载已开始')
  } catch (error) {
    ElMessage.error('打包下载失败')
    console.error(error)
  }
}

const removeScreenshot = (index: number) => {
  screenshots.value.splice(index, 1)
}

onUnmounted(() => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
})

const dropHandler = (ev: DragEvent) => {
  ev.preventDefault()
  if (ev.dataTransfer?.items) {
    [...ev.dataTransfer.items].forEach((item, i) => {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file && file.type.startsWith('video/')) {
          videoFile.value = file
          if (videoUrl.value) URL.revokeObjectURL(videoUrl.value)
          videoUrl.value = URL.createObjectURL(file)
          screenshots.value = []
          currentTime.value = 0
        }
      }
    })
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
          <h2 class="text-4xl font-bold mb-3 text-gray-800">视频抽帧工具</h2>
          <p class="text-gray-500 text-sm">在线提取视频画面，支持精确截图和一键下载，本地处理保护隐私</p>
        </div>

        <!-- Upload Area -->
        <div v-if="!videoUrl" @drop="dropHandler" @dragover="dragOverHandler"
          class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer mb-8"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div class="text-6xl mb-4 text-gray-300">📹</div>
          <p class="text-xl font-medium text-gray-700 mb-2">点击或拖拽视频文件到此处</p>
          <p class="text-sm text-gray-500">支持 MP4, WebM, OGG 等常见视频格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left: Video Player -->
          <div class="lg:col-span-2 space-y-4">
            <div
              class="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center relative shadow-lg">
              <video ref="videoRef" :src="videoUrl" controls class="w-full h-full" @timeupdate="handleTimeUpdate"
                @loadedmetadata="handleLoadedMetadata"></video>

              <!-- Processing Overlay -->
              <div v-if="isExtracting"
                class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-10">
                <div class="text-xl font-bold mb-2">正在智能提取画面...</div>
                <div class="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: `${extractProgress}%` }">
                  </div>
                </div>
                <div class="mt-2 text-sm text-gray-300">{{ extractProgress }}%</div>
              </div>
            </div>

            <div class="flex flex-col gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div class="flex justify-between items-center">
                <div class="text-lg font-mono font-bold text-gray-700 flex items-center gap-2">
                  {{ formatTime(currentTime) }} <span class="text-gray-400">/ {{ formatTime(duration) }}</span>
                </div>

                <!-- Frame Stepping Controls -->
                <div class="flex items-center gap-1">
                  <button @click="stepFrame(-5)" title="后退5帧" class="p-1.5 text-gray-600 hover:bg-gray-200 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button @click="stepFrame(-1)" title="上一帧" class="p-1.5 text-gray-600 hover:bg-gray-200 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button @click="stepFrame(1)" title="下一帧" class="p-1.5 text-gray-600 hover:bg-gray-200 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button @click="stepFrame(5)" title="前进5帧" class="p-1.5 text-gray-600 hover:bg-gray-200 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <button @click="fileInput?.click()"
                  class="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                  更换视频
                </button>

                <button @click="showAutoExtract = true"
                  class="px-4 py-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  智能抽帧
                </button>

                <button @click="captureFrame()"
                  class="flex-1 px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center min-w-[140px]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  截图当前帧
                </button>
              </div>
            </div>

            <!-- Auto Extract Settings Panel (Conditional) -->
            <div v-if="showAutoExtract" class="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fade-in">
              <div class="flex justify-between items-center mb-3">
                <h4 class="font-bold text-gray-800">智能抽帧设置</h4>
                <button @click="showAutoExtract = false" class="text-gray-400 hover:text-gray-600">&times;</button>
              </div>

              <div class="flex flex-col sm:flex-row gap-4 mb-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">提取模式</label>
                  <div class="flex rounded-md shadow-sm" role="group">
                    <button type="button" @click="extractMode = 'count'"
                      :class="{ 'bg-blue-600 text-white': extractMode === 'count', 'bg-white text-gray-700 hover:bg-gray-50': extractMode !== 'count' }"
                      class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-l-lg flex-1">
                      按数量 (均分)
                    </button>
                    <button type="button" @click="extractMode = 'interval'"
                      :class="{ 'bg-blue-600 text-white': extractMode === 'interval', 'bg-white text-gray-700 hover:bg-gray-50': extractMode !== 'interval' }"
                      class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-r-lg border-l-0 flex-1">
                      按间隔 (秒)
                    </button>
                  </div>
                </div>

                <div class="flex-1">
                  <label v-if="extractMode === 'count'" class="block text-sm font-medium text-gray-700 mb-1">提取数量
                    (张)</label>
                  <label v-else class="block text-sm font-medium text-gray-700 mb-1">时间间隔 (秒)</label>

                  <input v-if="extractMode === 'count'" type="number" v-model="extractCount" min="1" max="100"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <input v-else type="number" v-model="extractInterval" min="0.1" step="0.5"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>

              <div class="flex justify-end">
                <button @click="startAutoExtract"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                  开始提取
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Right: Screenshots -->
        <div class="lg:col-span-1">
          <div class="bg-gray-50 rounded-xl p-4 border border-gray-200 h-full max-h-[600px] flex flex-col">
            <h3 class="font-bold text-gray-800 mb-4 flex justify-between items-center">
              截图列表
              <div class="flex items-center gap-2">
                <button v-if="screenshots.length > 0" @click="downloadAll"
                  class="text-xs text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-2 py-1 rounded border border-blue-200">
                  打包下载
                </button>
                <span class="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{{
                  screenshots.length }}</span>
              </div>
            </h3>

            <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              <div v-if="screenshots.length === 0" class="text-center py-10 text-gray-400">
                <p>暂无截图</p>
                <p class="text-xs mt-2">点击"截图当前帧"按钮保存画面</p>
              </div>

              <div v-for="(shot, index) in screenshots" :key="index"
                class="group bg-white p-2 rounded border border-gray-200 hover:shadow-md transition-shadow relative">
                <div class="aspect-video bg-gray-100 rounded overflow-hidden mb-2 cursor-pointer"
                  @click="downloadImage(shot)">
                  <img :src="shot.url" class="w-full h-full object-cover" />
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span class="font-mono">{{ formatTime(shot.time) }}</span>
                  <button @click="downloadImage(shot)" class="text-blue-600 hover:text-blue-800 font-medium">下载</button>
                </div>
                <button @click="removeScreenshot(index)"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm text-xs">
                  &times;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Canvas for Processing -->
    <canvas ref="canvasRef" class="hidden"></canvas>

  </div>

  <!-- Usage Instructions -->
  <div class="bg-white rounded-xl p-8 shadow-sm">
    <h3 class="text-xl font-bold mb-4 text-gray-800">使用说明</h3>
    <div class="space-y-4 text-gray-600">
      <div>
        <h4 class="font-medium text-gray-800 mb-2">1. 上传视频</h4>
        <p class="text-sm">点击上传区域或直接将视频文件拖拽到页面中。支持 MP4, WebM, OGG 等常见浏览器支持的视频格式。</p>
      </div>
      <div>
        <h4 class="font-medium text-gray-800 mb-2">2. 选择画面</h4>
        <p class="text-sm">使用播放器控制条定位到想要提取的画面，或者直接播放视频到指定位置暂停。</p>
      </div>
      <div>
        <h4 class="font-medium text-gray-800 mb-2">4. 智能抽帧</h4>
        <p class="text-sm">点击"智能抽帧"展开设置面板，可以设置提取的时间范围、提取模式（按数量或按间隔）、输出格式（PNG/JPG）及图片质量。</p>
      </div>
      <div class="bg-blue-50 p-4 rounded-lg">
        <h4 class="font-medium text-blue-800 mb-2">🔒 隐私安全说明</h4>
        <p class="text-sm text-blue-700">本工具所有处理均在您的浏览器本地进行，视频文件不会上传到服务器，完全保护您的隐私安全。</p>
      </div>
    </div>
  </div>

  <ToolsRecommend :currentPath="route.path" />
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
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
