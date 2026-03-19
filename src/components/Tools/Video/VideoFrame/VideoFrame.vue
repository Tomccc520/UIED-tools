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
import VideoToolNotice from '@/components/Tools/Video/Shared/VideoToolNotice.vue'
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

/**
 * 处理文件选择
 * @param event - 文件选择事件
 */
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

/**
 * 更新当前播放时间
 */
const handleTimeUpdate = () => {
  if (videoRef.value && !isExtracting.value) {
    currentTime.value = videoRef.value.currentTime
  }
}

/**
 * 加载视频元数据
 */
const handleLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

/**
 * 捕获当前帧
 * @param time - 可选，指定时间点
 */
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

/**
 * 开始自动抽帧
 */
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

/**
 * 步进帧
 * @param frames - 帧数
 */
const stepFrame = (frames: number) => {
  if (videoRef.value) {
    // Assuming 30fps as a safe default, so 1 frame is ~0.033s
    videoRef.value.currentTime += frames * 0.04
  }
}

/**
 * 格式化时间
 * @param seconds - 秒数
 */
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

/**
 * 下载单张图片
 * @param item - 截图对象
 */
const downloadImage = (item: { url: string; time: number }) => {
  const a = document.createElement('a')
  a.href = item.url
  a.download = `frame_${formatTime(item.time).replace(/[:.]/g, '_')}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * 批量下载所有截图
 */
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

/**
 * 移除截图
 * @param index - 索引
 */
const removeScreenshot = (index: number) => {
  screenshots.value.splice(index, 1)
}

onUnmounted(() => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value)
  }
})

/**
 * 拖拽文件处理
 * @param ev - 拖拽事件
 */
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
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-10 relative">
          <div class="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div class="w-64 h-64 bg-indigo-400 rounded-full blur-3xl"></div>
            <div class="w-64 h-64 bg-purple-400 rounded-full blur-3xl -ml-20"></div>
          </div>
          <h2
            class="text-4xl font-bold mb-4 relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
            免费视频抽帧工具
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">
            在线提取视频画面，支持精确截图和一键批量下载，本地处理保护隐私
          </p>
        </div>
        <VideoToolNotice class="mb-8" />

        <!-- Initial Upload Area -->
        <div v-if="!videoUrl" @drop="dropHandler" @dragover="dragOverHandler"
          class="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer mb-8 group"
          @click="fileInput?.click()">
          <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
          <div
            class="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
            点击或拖拽视频文件到此处
          </h3>
          <p class="text-gray-500">支持 MP4, WebM, OGG 等常见视频格式</p>
        </div>

        <!-- Editor Area -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left: Configuration Panel -->
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

              <!-- File Info -->
              <div class="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="overflow-hidden flex-1">
                    <div class="text-sm font-medium text-gray-800 truncate">{{ videoFile?.name }}</div>
                    <div class="text-xs text-gray-500">{{ (videoFile?.size ? videoFile.size / 1024 / 1024 : 0).toFixed(2) }}
                      MB</div>
                  </div>
                  <button @click="fileInput?.click()" class="text-xs text-indigo-600 hover:text-indigo-800">
                    更换
                  </button>
                  <input type="file" ref="fileInput" class="hidden" accept="video/*" @change="handleFileChange" />
                </div>
              </div>

              <!-- Controls -->
              <div class="space-y-4">
                <button @click="captureFrame()"
                  class="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform active:scale-[0.98]">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  截图当前帧
                </button>

                <div class="bg-white p-4 rounded-xl border border-gray-200">
                  <div class="flex justify-between items-center mb-4">
                    <h4 class="font-medium text-gray-700 text-sm">智能抽帧设置</h4>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" v-model="showAutoExtract" class="sr-only peer">
                      <div
                        class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600">
                      </div>
                    </label>
                  </div>

                  <div v-if="showAutoExtract" class="space-y-4 animate-fade-in">
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-2">提取模式</label>
                      <div class="flex rounded-lg shadow-sm">
                        <button type="button" @click="extractMode = 'count'"
                          :class="{ 'bg-indigo-50 text-indigo-600 border-indigo-200': extractMode === 'count', 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200': extractMode !== 'count' }"
                          class="flex-1 px-3 py-2 text-xs font-medium border rounded-l-lg transition-colors">
                          按数量
                        </button>
                        <button type="button" @click="extractMode = 'interval'"
                          :class="{ 'bg-indigo-50 text-indigo-600 border-indigo-200': extractMode === 'interval', 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200': extractMode !== 'interval' }"
                          class="flex-1 px-3 py-2 text-xs font-medium border-t border-b border-r rounded-r-lg transition-colors">
                          按间隔
                        </button>
                      </div>
                    </div>

                    <div>
                      <label v-if="extractMode === 'count'" class="block text-xs font-medium text-gray-500 mb-2">提取数量
                        (张)</label>
                      <label v-else class="block text-xs font-medium text-gray-500 mb-2">时间间隔 (秒)</label>

                      <input v-if="extractMode === 'count'" type="number" v-model="extractCount" min="1" max="100"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
                      <input v-else type="number" v-model="extractInterval" min="0.1" step="0.5"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" />
                    </div>

                    <button @click="startAutoExtract"
                      class="w-full py-2 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium rounded-lg transition-colors text-sm border border-indigo-200">
                      开始提取
                    </button>
                  </div>
                </div>

                <!-- Frame Stepping -->
                <div class="bg-white p-4 rounded-xl border border-gray-200">
                  <h4 class="font-medium text-gray-700 text-sm mb-3">微调控制</h4>
                  <div class="grid grid-cols-4 gap-2">
                    <button @click="stepFrame(-5)" title="后退5帧"
                      class="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex justify-center">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    <button @click="stepFrame(-1)" title="上一帧"
                      class="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex justify-center">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button @click="stepFrame(1)" title="下一帧"
                      class="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex justify-center">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button @click="stepFrame(5)" title="前进5帧"
                      class="p-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors flex justify-center">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Preview & Results -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Video Player -->
            <div
              class="border border-gray-200 rounded-xl overflow-hidden bg-black shadow-sm flex items-center justify-center relative group">
              <video ref="videoRef" :src="videoUrl" controls class="w-full max-h-[600px]" @timeupdate="handleTimeUpdate"
                @loadedmetadata="handleLoadedMetadata"></video>

              <!-- Processing Overlay -->
              <div v-if="isExtracting"
                class="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm">
                <div class="text-xl font-bold mb-3">正在智能提取画面...</div>
                <div class="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                    :style="{ width: `${extractProgress}%` }">
                  </div>
                </div>
                <div class="mt-3 text-sm text-gray-300 font-mono">{{ extractProgress }}%</div>
              </div>
            </div>

            <!-- Screenshots Grid -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <h3 class="font-semibold text-gray-700">截图列表</h3>
                  <span class="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">{{ screenshots.length }}</span>
                </div>
                <button v-if="screenshots.length > 0" @click="downloadAll"
                  class="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  打包下载
                </button>
              </div>

              <div class="p-4 min-h-[200px]">
                <div v-if="screenshots.length === 0" class="flex flex-col items-center justify-center py-12 text-gray-400">
                  <svg class="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>暂无截图</p>
                  <p class="text-xs mt-1">点击"截图当前帧"按钮保存画面</p>
                </div>

                <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div v-for="(shot, index) in screenshots" :key="index"
                    class="group bg-gray-50 rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-all relative">
                    <div class="aspect-video bg-gray-200 cursor-pointer overflow-hidden" @click="downloadImage(shot)">
                      <img :src="shot.url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div class="p-2 flex items-center justify-between">
                      <span class="text-xs font-mono text-gray-500">{{ formatTime(shot.time) }}</span>
                      <button @click="downloadImage(shot)"
                        class="text-gray-400 hover:text-indigo-600 transition-colors" title="下载">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                    <button @click="removeScreenshot(index)"
                      class="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm backdrop-blur-sm">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Instructions -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            使用说明
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">1. 上传视频</h4>
              <p>支持 MP4, WebM, OGG 等常见格式。文件处理完全在本地进行，保护隐私。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">2. 提取画面</h4>
              <p>可手动截图当前帧，或使用智能抽帧功能批量提取指定数量或间隔的画面。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">3. 保存结果</h4>
              <p>支持单张图片下载，或将所有截图打包为 ZIP 文件批量下载。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hidden Canvas for Processing -->
    <canvas ref="canvasRef" class="hidden"></canvas>
    
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<style scoped>
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
