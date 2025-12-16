<!--
 * @file ImageToGif.vue
 * @description 图片合成GIF工具，支持多张图片转GIF
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-12-22
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 左侧设置区域 -->
          <div class="lg:col-span-1 space-y-6">
            <!-- 上传区域 -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <div
                class="relative border border-dashed rounded-lg min-h-[150px] flex flex-col items-center justify-center transition-colors duration-200 bg-gray-50"
                :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'"
                @drop.prevent="handleDrop" @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false">
                <input ref="fileInputRef" type="file" class="hidden" multiple accept="image/*"
                  @change="handleFileInputChange" />
                <div class="absolute inset-0 cursor-pointer z-10" @click="triggerFileInput"></div>
                <div class="text-center px-4">
                  <div class="w-8 h-8 mb-2 mx-auto">
                    <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片</div>
                  <p class="text-xs text-gray-400">支持 JPG、PNG、WebP</p>
                </div>
              </div>
            </div>

            <!-- GIF设置 -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <div class="mb-4 text-gray-700 font-medium border-b pb-2">GIF设置</div>
              <div class="space-y-4">
                <div>
                  <label class="text-sm text-gray-600 mb-2 block">图片宽度 ({{ width }}px)</label>
                  <el-input-number v-model="width" :min="50" :max="2000" :step="10" class="w-full" />
                </div>

                <div>
                  <label class="text-sm text-gray-600 mb-2 block">图片高度 ({{ height }}px)</label>
                  <el-input-number v-model="height" :min="50" :max="2000" :step="10" class="w-full" />
                </div>

                <div>
                  <label class="text-sm text-gray-600 mb-2 block">每帧延迟 ({{ delay }}ms)</label>
                  <el-slider v-model="delay" :min="50" :max="2000" :step="50" />
                </div>

                <div>
                  <label class="text-sm text-gray-600 mb-2 block">画质 (1-10, 10为最佳)</label>
                  <el-slider v-model="quality" :min="1" :max="10" :step="1" />
                </div>

                <div>
                  <label class="text-sm text-gray-600 mb-2 block">循环播放</label>
                  <el-switch v-model="loop" active-text="开启" inactive-text="关闭" />
                </div>
              </div>
            </div>

            <!-- 图片列表（可拖拽排序） -->
            <div v-if="fileList.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
              <div class="flex justify-between items-center mb-4 border-b pb-2">
                <div class="text-gray-700 font-medium">图片列表 ({{ fileList.length }})</div>
                <el-button type="text" class="!text-red-500" @click="clearAll">清空</el-button>
              </div>
              <draggable v-model="fileList" item-key="id" class="space-y-2" ghost-class="ghost">
                <template #item="{ element, index }">
                  <div
                    class="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-100 cursor-move hover:bg-gray-100 transition-colors">
                    <span class="text-gray-400 text-xs w-4">{{ index + 1 }}</span>
                    <img :src="element.url" class="w-10 h-10 object-cover rounded" />
                    <div class="flex-1 min-w-0">
                      <div class="text-xs text-gray-600 truncate" :title="element.name">{{ element.name }}</div>
                      <div class="text-xs text-gray-400">{{ formatSize(element.size) }}</div>
                    </div>
                    <el-button type="text" @click="removeFile(index)">
                      <el-icon class="text-gray-400 hover:text-red-500">
                        <Close />
                      </el-icon>
                    </el-button>
                  </div>
                </template>
              </draggable>
            </div>
          </div>

          <!-- 右侧预览区域 -->
          <div class="lg:col-span-2">
            <div class="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
              <div class="flex justify-between items-center mb-4">
                <div class="text-gray-700 font-medium">效果预览</div>
                <div class="flex gap-2">
                  <el-button @click="generatePreview" :disabled="fileList.length === 0 || isProcessing">
                    预览GIF
                  </el-button>
                  <el-button type="primary" :loading="isProcessing" @click="downloadGif" :disabled="!previewUrl">
                    下载GIF
                  </el-button>
                </div>
              </div>

              <div
                class="flex-1 bg-gray-100 rounded-lg overflow-auto p-4 flex justify-center min-h-[400px] items-center">
                <div v-if="fileList.length === 0" class="flex flex-col items-center justify-center text-gray-400">
                  <el-icon :size="48" class="mb-2">
                    <Picture />
                  </el-icon>
                  <div>请添加图片</div>
                </div>
                <div v-else-if="isProcessing" class="flex flex-col items-center justify-center text-gray-400">
                  <el-progress type="circle" :percentage="progress" />
                  <div class="mt-4">生成中...</div>
                </div>
                <img v-else-if="previewUrl" :src="previewUrl" class="max-w-full h-auto" />
                <div v-else class="text-gray-400">
                  点击“预览GIF”生成预览
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 工具推荐 -->
        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Close, Picture, Loading } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import GIF from 'gif.js'

const route = useRoute()

const info = {
  title: "免费图片合成GIF",
  subtitle: "在线将多张图片合成为动态GIF，支持自定义延迟、尺寸和循环播放"
}

interface ImageFile {
  id: string
  file: File
  name: string
  size: number
  url: string
  width: number
  height: number
}

// 状态
const fileList = ref<ImageFile[]>([])
const isDragging = ref(false)
const isProcessing = ref(false)
const progress = ref(0)
const fileInputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')

// 设置
const width = ref(400)
const height = ref(400)
const delay = ref(500)
const quality = ref(10)
const loop = ref(true)

// 文件处理
const handleFileInputChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) {
    processFiles(Array.from(input.files))
  }
  input.value = ''
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files) {
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    processFiles(files)
  }
}

const processFiles = async (files: File[]) => {
  for (const file of files) {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      // 如果是第一张图片，自动设置宽高
      if (fileList.value.length === 0) {
        width.value = img.width
        height.value = img.height
      }

      fileList.value.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        url,
        width: img.width,
        height: img.height
      })
    }
    img.src = url
  }
}

const removeFile = (index: number) => {
  URL.revokeObjectURL(fileList.value[index].url)
  fileList.value.splice(index, 1)
}

const clearAll = () => {
  fileList.value.forEach(f => URL.revokeObjectURL(f.url))
  fileList.value = []
  previewUrl.value = ''
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成 GIF
const generatePreview = async () => {
  if (fileList.value.length === 0) return

  isProcessing.value = true
  progress.value = 0

  try {
    const gif = new GIF({
      workers: 2,
      quality: quality.value,
      width: width.value,
      height: height.value,
      workerScript: '/workers/gif.worker.js',
      repeat: loop.value ? 0 : -1
    } as any)

    // 加载所有图片
    const images = await Promise.all(fileList.value.map(item => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.src = item.url
      })
    }))

    // 添加帧
    const canvas = document.createElement('canvas')
    canvas.width = width.value
    canvas.height = height.value
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')

    images.forEach(img => {
      // 清空画布
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width.value, height.value)

      // 居中绘制，保持比例
      const scale = Math.min(width.value / img.width, height.value / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const x = (width.value - w) / 2
      const y = (height.value - h) / 2

      ctx.drawImage(img, x, y, w, h)

      gif.addFrame(ctx, { copy: true, delay: delay.value })
    })

    gif.on('progress', (p: number) => {
      progress.value = Math.round(p * 100)
    })

    gif.on('finished', (blob: Blob) => {
      if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = URL.createObjectURL(blob)
      isProcessing.value = false
      ElMessage.success('GIF 生成成功')
    })

    gif.render()

  } catch (error) {
    console.error('生成 GIF 失败:', error)
    ElMessage.error('生成 GIF 失败，请重试')
    isProcessing.value = false
  }
}

const downloadGif = () => {
  if (!previewUrl.value) return

  const link = document.createElement('a')
  link.href = previewUrl.value
  link.download = `animation_${new Date().getTime()}.gif`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onUnmounted(() => {
  clearAll()
})
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
