<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
-->
<!--
 * @file ImageJoiner.vue
 * @description 图片拼接工具，支持多张图片横向或纵向拼接
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-12-22
 -->

<template>
  <div class="min-h-screen uied-file-tool">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="file-tool-card bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="file-tool-heading text-center mb-8 relative">
          <h1 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="file-tool-heading__title relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ $ensureFreeToolTitle(info.title) }}</span>
            </div>
          </h1>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <div class="file-tool-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 左侧设置区域 -->
          <div class="lg:col-span-1 space-y-6">
            <!-- 上传区域 -->
            <div class="file-tool-panel bg-white border border-gray-200 rounded-lg p-6">
              <div
                class="relative border border-dashed rounded-lg min-h-[150px] flex flex-col items-center justify-center transition-colors duration-200 bg-gray-50"
                :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'"
                @drop.prevent="handleDrop" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
                <input ref="fileInputRef" type="file" class="hidden" multiple accept="image/*" @change="handleFileInputChange" />
                <button type="button" aria-label="选择要拼接的图片" class="absolute inset-0 cursor-pointer z-10 border-0 bg-transparent" @click="triggerFileInput"></button>
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
              <p v-if="pendingBatches > 0" role="status" class="mt-2 text-xs text-gray-500">正在读取图片，请稍候…</p>
            </div>

            <!-- 拼接设置 -->
            <div class="file-tool-panel bg-white border border-gray-200 rounded-lg p-6">
              <div class="mb-4 text-gray-700 font-medium border-b pb-2">拼接设置</div>
              <div class="space-y-4">
                <div>
                  <label class="text-sm text-gray-600 mb-2 block">拼接方向</label>
                  <el-radio-group v-model="direction" size="large">
                    <el-radio-button label="vertical">纵向拼接</el-radio-button>
                    <el-radio-button label="horizontal">横向拼接</el-radio-button>
                  </el-radio-group>
                </div>

                <div>
                  <label class="text-sm text-gray-600 mb-2 block">间距 ({{ spacing }}px)</label>
                  <el-slider v-model="spacing" :min="0" :max="100" :step="1" />
                </div>

                <div>
                  <label class="text-sm text-gray-600 mb-2 block">背景颜色</label>
                  <div class="flex items-center gap-2">
                    <input type="color" v-model="backgroundColor" class="h-8 w-8 rounded cursor-pointer border-none" />
                    <span class="text-sm text-gray-500">{{ backgroundColor }}</span>
                  </div>
                </div>

                <div>
                  <label class="text-sm text-gray-600 mb-2 block">输出格式</label>
                  <el-select v-model="outputFormat" class="w-full">
                    <el-option label="JPG" value="image/jpeg" />
                    <el-option label="PNG" value="image/png" />
                  </el-select>
                </div>
              </div>
            </div>

            <!-- 图片列表（可拖拽排序） -->
            <div v-if="fileList.length > 0 || pendingBatches > 0" class="file-tool-panel bg-white border border-gray-200 rounded-lg p-6">
              <div class="flex justify-between items-center mb-4 border-b pb-2">
                <div class="text-gray-700 font-medium">图片列表 ({{ fileList.length }})</div>
                <el-button type="text" class="!text-red-500" @click="clearAll">清空</el-button>
              </div>
              <draggable 
                v-model="fileList" 
                item-key="id"
                class="space-y-2"
                ghost-class="ghost"
              >
                <template #item="{ element, index }">
                  <div class="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-100 cursor-move hover:bg-gray-100 transition-colors">
                    <span class="text-gray-400 text-xs w-4">{{ index + 1 }}</span>
                    <img :src="element.url" class="w-10 h-10 object-cover rounded" />
                    <div class="flex-1 min-w-0">
                      <div class="file-tool-filename text-xs text-gray-600 truncate" :title="element.name">{{ element.name }}</div>
                      <div class="text-xs text-gray-400">{{ formatSize(element.size) }}</div>
                    </div>
                    <el-button type="text" :aria-label="`移除 ${element.name}`" @click="removeFile(index)">
                      <el-icon class="text-gray-400 hover:text-red-500"><Close /></el-icon>
                    </el-button>
                  </div>
                </template>
              </draggable>
            </div>
          </div>

          <!-- 右侧预览区域 -->
          <div class="lg:col-span-2">
            <div class="file-tool-panel bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
              <div class="file-tool-toolbar flex justify-between items-center mb-4">
                <div class="text-gray-700 font-medium">效果预览</div>
                <el-button type="primary" :loading="isProcessing" @click="generateAndDownload" :disabled="fileList.length === 0 || pendingBatches > 0">
                  生成并下载
                </el-button>
              </div>
              
              <div class="flex-1 bg-gray-100 rounded-lg overflow-auto p-4 flex justify-center min-h-[400px]">
                <div v-if="fileList.length === 0" class="flex flex-col items-center justify-center text-gray-400 h-full">
                  <el-icon :size="48" class="mb-2"><Picture /></el-icon>
                  <div>请添加图片</div>
                </div>
                <div v-else ref="previewContainer" class="relative shadow-lg transition-all duration-300" :style="previewStyle">
                  <!-- 预览内容由 canvas 生成 -->
                  <img v-if="previewUrl" :src="previewUrl" class="max-w-full h-auto" />
                  <div v-else-if="previewError" role="alert" class="p-4 text-sm text-red-600">
                    {{ previewError }}
                    <el-button type="text" @click="generatePreview">重试</el-button>
                  </div>
                  <div v-else class="flex items-center justify-center h-full text-gray-400">
                    <el-icon class="is-loading mr-2"><Loading /></el-icon>
                    生成预览中...
                  </div>
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
import '@/styles/file-tool-responsive.css'
import { ref, markRaw, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Close, Picture, Loading } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { encodeImageCanvas } from '@/utils/imageFormatConversion'

const route = useRoute()

const info = {
  title: "免费在线图片拼接",
  subtitle: "支持多张图片横向或纵向拼接，自定义间距和背景色，制作长图神器"
}

interface ImageFile {
  id: string
  file: File
  name: string
  size: number
  url: string
  width: number
  height: number
  image: HTMLImageElement
}

// 状态
const fileList = ref<ImageFile[]>([])
const isDragging = ref(false)
const isProcessing = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')
const previewError = ref('')
const pendingBatches = ref(0)
const ownedUrls = new Set<string>()
const pendingLoads = new Map<string, () => void>()
let uploadVersion = 0
let nextFileId = 0
let uploadQueue = Promise.resolve()
let disposed = false
let renderVersion = 0

// 设置
const direction = ref('vertical')
const spacing = ref(0)
const backgroundColor = ref('#ffffff')
const outputFormat = ref('image/jpeg')

// 监听设置变化，重新生成预览
watch([fileList, direction, spacing, backgroundColor, outputFormat], () => {
  renderVersion += 1
  if (disposed) return
  if (fileList.value.length > 0) {
    generatePreview()
  } else {
    previewUrl.value = ''
    previewError.value = ''
  }
}, { deep: true, flush: 'sync' })

const previewStyle = computed(() => {
  return {
    backgroundColor: backgroundColor.value
  }
})

// 文件处理
/** 从原生输入接收图片，并清空输入值以允许再次选择同一文件。 */
const handleFileInputChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) {
    processFiles(Array.from(input.files))
  }
  input.value = ''
}

/** 打开系统图片选择器。 */
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

/** 接收拖拽文件，并交给同一上传队列校验和解码。 */
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files) {
    processFiles(Array.from(e.dataTransfer.files))
  }
}

/** 释放一个归本工具持有的对象地址，防止清空和移除时重复释放。 */
const releaseUrl = (url: string) => {
  if (ownedUrls.delete(url)) URL.revokeObjectURL(url)
}

/** 每个输入文件只解码一次；成功后保存原始图像，后续预览和下载直接复用。 */
const loadImage = (file: File, version: number): Promise<ImageFile | null> => new Promise(resolve => {
  let url = ''
  let image: HTMLImageElement | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let settled = false

  /** 结束读取并解除监听；失败或取消时释放尚未加入列表的图片地址。 */
  const finish = (item: ImageFile | null) => {
    if (settled) return
    settled = true
    clearTimeout(timer)
    pendingLoads.delete(url)
    if (image) { image.onload = null; image.onerror = null }
    if (!item) releaseUrl(url)
    resolve(item)
  }

  /** 只提示当前上传任务的读取错误，旧任务不得影响清空后的页面。 */
  const fail = () => {
    if (settled) return
    if (!disposed && version === uploadVersion) ElMessage.error(`无法读取图片 ${file.name}，请重新选择`)
    finish(null)
  }

  try {
    url = URL.createObjectURL(file)
    ownedUrls.add(url)
    image = markRaw(new Image())
    pendingLoads.set(url, () => finish(null))
    timer = setTimeout(fail, 15000)
    image.onload = () => {
      if (settled) return
      if (disposed || version !== uploadVersion) { finish(null); return }
      const width = image!.naturalWidth || image!.width
      const height = image!.naturalHeight || image!.height
      if (!width || !height) { fail(); return }
      finish({ id: `joined-image-${++nextFileId}`, file, name: file.name, size: file.size, url, width, height, image: image! })
    }
    image.onerror = fail
    image.src = url
  } catch (error) {
    console.error('图片读取失败:', error)
    fail()
  }
})

/** 并行解码同批图片，按选择批次和原始文件顺序提交，避免解码快慢改变拼接顺序。 */
const processFiles = (files: File[]) => {
  if (disposed) return
  const validFiles = files.filter(file => file.type.startsWith('image/'))
  if (!validFiles.length) { ElMessage.error('请选择图片文件'); return }
  renderVersion += 1
  const version = uploadVersion
  const ready = Promise.all(validFiles.map(file => loadImage(file, version)))
  pendingBatches.value += 1
  uploadQueue = uploadQueue.then(async () => {
    const items = await ready
    if (disposed || version !== uploadVersion) return
    fileList.value.push(...items.filter((item): item is ImageFile => item !== null))
    pendingBatches.value -= 1
  })
}

/** 移除指定图片并释放资源，剩余列表由统一预览流程重绘。 */
const removeFile = (index: number) => {
  const item = fileList.value[index]
  if (!item) return
  releaseUrl(item.url)
  fileList.value.splice(index, 1)
}

/** 清空列表及待处理批次，使所有尚未执行的图片回调失效。 */
const clearAll = () => {
  uploadVersion += 1
  renderVersion += 1
  pendingLoads.forEach(cancel => cancel())
  ownedUrls.forEach(releaseUrl)
  uploadQueue = Promise.resolve()
  pendingBatches.value = 0
  fileList.value = []
  previewUrl.value = ''
  previewError.value = ''
}

/** 把文件字节数转为便于阅读的单位文本。 */
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/** 使用已解码的图片同步生成预览，避免旧异步渲染覆盖新列表。 */
const generatePreview = () => {
  if (fileList.value.length === 0) return
  previewError.value = ''
  try {
    const canvas = drawCanvas()
    previewUrl.value = encodeCanvas(canvas)
  } catch (error) {
    console.error('生成预览失败:', error)
    previewUrl.value = ''
    previewError.value = '预览生成失败，请重试'
  }
}

/** 使用与预览一致的图像和布局导出，读取未完成时不生成缺图产物。 */
const generateAndDownload = async () => {
  if (isProcessing.value || pendingBatches.value > 0 || fileList.value.length === 0) return
  const version = renderVersion
  const ext = outputFormat.value === 'image/png' ? 'png' : 'jpg'
  isProcessing.value = true
  try {
    const canvas = drawCanvas()
    const blob = await encodeImageCanvas(canvas, ext, 0.9)
    if (disposed || version !== renderVersion) return
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `joined_image_${new Date().getTime()}.${ext}`
    try {
      document.body.appendChild(link)
      link.click()
    } finally {
      link.remove()
      URL.revokeObjectURL(url)
    }
    
    ElMessage.success('图片拼接完成')
  } catch (error) {
    if (disposed || version !== renderVersion) return
    console.error('图片拼接失败:', error)
    ElMessage.error('图片拼接失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

/** 校验浏览器确实编码了所选格式，拒绝尺寸越界产生的空画布地址。 */
const encodeCanvas = (canvas: HTMLCanvasElement): string => {
  const url = canvas.toDataURL(outputFormat.value, 0.9)
  if (!url.startsWith(`data:${outputFormat.value};base64,`) || !url.split(',')[1]) {
    throw new Error('Canvas image encoding failed')
  }
  return url
}

/** 以当前列表和参数快照绘制画布，每张已解码图片只绘制一次。 */
const drawCanvas = (): HTMLCanvasElement => {
  const items = fileList.value.slice()
  if (!items.length) throw new Error('No images to draw')
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')

  const space = spacing.value
  const vertical = direction.value === 'vertical'
  canvas.width = vertical
    ? Math.max(...items.map(item => item.width))
    : items.reduce((sum, item) => sum + item.width, 0) + (items.length - 1) * space
  canvas.height = vertical
    ? items.reduce((sum, item) => sum + item.height, 0) + (items.length - 1) * space
    : Math.max(...items.map(item => item.height))
  ctx.fillStyle = backgroundColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let offset = 0
  items.forEach(item => {
    const x = vertical ? (canvas.width - item.width) / 2 : offset
    const y = vertical ? offset : (canvas.height - item.height) / 2
    ctx.drawImage(item.image, x, y)
    offset += (vertical ? item.height : item.width) + space
  })
  return canvas
}

onUnmounted(() => {
  disposed = true
  clearAll()
})
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
