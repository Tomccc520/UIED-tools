<!--
  @file ImageToWebp.vue
  @description 图片格式转换工具组件，支持多种格式图片互相转换
  @copyright Tomda (https://www.tomda.top)
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2024-12-22

  功能特性：
  1. 支持拖拽和点击上传图片
  2. 支持浏览器可读取的图片转换为JPG、PNG、WebP
  3. 支持调整图片质量和压缩率
  4. 支持批量转换多张图片
  5. 本地处理，无需上传服务器
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ $ensureFreeToolTitle(info.title) }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <!-- 文件上传区域 -->
        <div v-if="images.length === 0">
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept="image/*" multiple
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileChange" />

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片到这里</div>
              <p class="text-xs text-gray-400">支持 JPG、PNG、WebP、BMP、GIF 等常见格式</p>
              <p class="text-xs text-gray-400 mt-1">支持批量上传多张图片</p>
            </div>
          </div>
        </div>

        <!-- 图片转换工具区域 -->
        <div v-else class="space-y-4">
          <div class="border rounded-lg p-6 bg-white">
            <!-- 顶部工具栏 -->
            <div class="mb-6 flex flex-col space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <h3 class="text-sm font-medium text-gray-700">图片格式转换工具</h3>
                  <span class="text-xs text-gray-400">{{ images.length }}张图片</span>
                </div>
                <div class="flex items-center space-x-3">
                  <!-- 下载所有按钮 -->
                  <button v-if="hasConvertedImages" @click="downloadAllImages"
                    class="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>下载全部</span>
                  </button>
                </div>
              </div>

              <!-- 转换设置 -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-700 mb-3">转换设置</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- 输出格式选择 -->
                  <div>
                    <label class="text-sm text-gray-600 mb-1 block">输出格式</label>
                    <div class="mt-1">
                      <div class="flex flex-wrap gap-2">
                        <button v-for="format in outputFormats" :key="format" @click="selectedFormat = format" :class="[
                          'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                          selectedFormat === format
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        ]">
                          {{ format }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- 质量设置 -->
                  <div>
                    <label class="text-sm text-gray-600 mb-1 block">质量 ({{ quality }}%)</label>
                    <div class="flex items-center space-x-2">
                      <input type="range" v-model="quality" min="10" max="100" step="1" :disabled="selectedFormat === 'PNG'"
                        class="flex-1 accent-blue-500" />
                      <span class="text-xs text-gray-500 w-8 text-right">{{ quality }}%</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">{{ selectedFormat === 'PNG' ? 'PNG 使用无损编码，不应用质量参数' : '质量越高，文件体积通常越大' }}</p>
                  </div>

                  <!-- 特殊选项 -->
                  <div>
                    <div v-if="selectedFormat === 'PNG'" class="flex items-center mt-5">
                      <input id="transparent" type="checkbox" v-model="transparent" class="accent-blue-500 mr-2" />
                      <label for="transparent" class="text-sm text-gray-600">保留透明度</label>
                    </div>
                    <p v-if="selectedFormat === 'JPG'" class="text-xs text-gray-500 mt-5">JPG 不支持透明度，透明区域将填充为白色。</p>
                  </div>
                </div>
                <p class="mt-3 text-xs text-gray-500" role="status">设置用于下一次转换；已有结果保持其标注格式，点击“开始转换”后才会更新。</p>

                <div class="mt-4">
                  <button @click="convertAllImages" :disabled="isConverting"
                    class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{{ isConverting ? '转换中...' : '开始转换' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 图片预览区域 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(image, index) in images" :key="image.id"
                class="border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col">
                <div class="relative">
                  <div class="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img :src="image.previewUrl" class="max-w-full max-h-full object-contain" />
                  </div>
                  <!-- 图像上方标签 -->
                  <div class="absolute top-2 left-2 flex space-x-2">
                    <span class="bg-gray-800/80 text-white text-xs rounded px-2 py-1">
                      {{ image.file.name.split('.').pop()?.toUpperCase() }}
                    </span>
                    <span class="bg-gray-800/80 text-white text-xs rounded px-2 py-1">
                      {{ formatFileSize(image.file.size) }}
                    </span>
                  </div>
                  <span v-if="image.result"
                    class="absolute top-2 right-2 bg-green-500/90 text-white text-xs rounded px-2 py-1">
                    已转换 · {{ image.result.format.toUpperCase() }}
                  </span>
                </div>

                <div class="p-3 flex-grow">
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="text-sm font-medium text-gray-700 truncate" :title="image.file.name">
                      {{ image.file.name }}
                    </h5>
                  </div>

                  <!-- 转换结果 -->
                  <div v-if="image.result" class="mt-2">
                    <p class="mb-2 text-xs text-gray-600">实际格式：{{ image.result.format.toUpperCase() }} · {{ image.result.filename }}</p>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                      <span>原始大小: {{ formatFileSize(image.file.size) }}</span>
                      <span>转换后: {{ formatFileSize(image.result.blob.size) }}</span>
                      <span :class="image.result.blob.size < image.file.size ? 'text-green-500' : 'text-orange-500'">
                        {{ image.result.blob.size < image.file.size ? '节省' : '增加' }}: {{ calcSavings(image.file.size,
                          image.result.blob.size) }} </span>
                    </div>
                  </div>
                  <p v-if="image.error" role="alert" class="mt-2 text-xs text-red-500">{{ image.error }}</p>

                  <!-- 操作按钮 -->
                  <div class="mt-3 flex justify-between">
                    <button @click="removeImage(index)"
                      class="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center space-x-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>移除</span>
                    </button>
                    <button v-if="image.result" @click="downloadImage(image)"
                      class="text-xs text-blue-500 hover:text-blue-600 transition-colors flex items-center space-x-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>下载</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作提示 -->
            <div class="mt-4 flex justify-between items-center px-2">
              <button @click="clearImages"
                class="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>清除全部</span>
              </button>
              <div class="text-xs text-gray-400">
                <span>💡 全部转换完成后，可下载单张或全部转换后的图片</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8">
        <div class="space-y-6">
          <!-- 功能点展示 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">多格式转换</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">支持浏览器可读取的图片转换为 JPG、PNG 或 WebP；BMP 仅支持作为输入，不提供 BMP 导出。</p>
            </div>

            <div class="bg-white border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">批量转换</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">一次性转换多张图片，提高工作效率，节省宝贵时间，支持打包下载</p>
            </div>

            <div class="bg-white border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">本地处理</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">所有图片在浏览器本地处理，无需上传服务器，保护隐私，提升速度</p>
            </div>
          </div>

          <!-- 常见问题解答 -->
          <div class="bg-white rounded-xl p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="(item, index) in faq" :key="index"
                class="pb-6 last:pb-0 border-b border-gray-200 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.q }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ item.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" class="mt-8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import JSZip from 'jszip'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { encodeImageCanvas, createConvertedImageNames, type ImageOutputFormat } from '@/utils/imageFormatConversion'

const route = useRoute()
const info = reactive({
  title: "免费在线图片格式转换工具",
  subtitle: "支持JPG、PNG、WebP等多种格式互相转换，批量处理高效便捷"
})
const outputFormats = ['JPG', 'PNG', 'WEBP']
const selectedFormat = ref('WEBP')
const quality = ref(80)
const transparent = ref(true)
const isConverting = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

interface ConvertedImage {
  blob: Blob
  format: ImageOutputFormat
  mime: string
  filename: string
  url: string
}

interface ConversionSettings {
  format: ImageOutputFormat
  quality: number
  transparent: boolean
}

interface ImageItem {
  id: number
  file: File
  previewUrl: string
  result?: ConvertedImage
  error?: string
}

const images = ref<ImageItem[]>([])
let nextImageId = 0
let batchVersion = 0
let isDisposed = false
const cancelConversions = new Map<number, () => void>()
const CONVERSION_TIMEOUT_MS = 30_000
const hasConvertedImages = computed(() => images.value.some(image => !!image.result))

/** 从文件选择器添加图片，并清空输入值以支持再次选择相同文件。 */
const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  addFiles(Array.from(input.files))
  input.value = ''
}

/** 接收拖拽文件并交由统一图片校验入口处理。 */
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files.length) addFiles(Array.from(e.dataTransfer.files))
}

/** 筛选图片文件并分配稳定标识，避免列表移除后异步结果写入其他图片。 */
const addFiles = (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  if (!imageFiles.length) {
    ElMessage.warning('请只选择图片文件')
    return
  }
  imageFiles.forEach(file => images.value.push({ id: ++nextImageId, file, previewUrl: URL.createObjectURL(file) }))
}

/** 快照整批文件、格式和质量，逐张转换；失败不冒充成功，取消后的批次不再写回。 */
const convertAllImages = async () => {
  if (!images.value.length || isConverting.value || isDisposed) return
  const version = ++batchVersion
  const batch = [...images.value]
  const settings: ConversionSettings = {
    format: selectedFormat.value.toLowerCase() as ImageOutputFormat,
    quality: selectedFormat.value === 'PNG' ? 1 : Number(quality.value) / 100,
    transparent: selectedFormat.value === 'WEBP' || (selectedFormat.value === 'PNG' && transparent.value)
  }
  const filenames = createConvertedImageNames(batch.map(image => ({ name: image.file.name, format: settings.format })))
  isConverting.value = true
  let completed = 0
  let failed = 0
  try {
    for (let index = 0; index < batch.length; index++) {
      if (version !== batchVersion || isDisposed) break
      const image = batch[index]
      if (!images.value.some(item => item.id === image.id)) continue
      image.error = undefined
      try {
        const blob = await convertImage(image, settings)
        const current = images.value.find(item => item.id === image.id)
        if (!blob || !current || version !== batchVersion || isDisposed) continue
        const previousUrl = current.result?.url
        current.result = {
          blob, format: settings.format, mime: blob.type, filename: filenames[index], url: URL.createObjectURL(blob)
        }
        if (previousUrl) URL.revokeObjectURL(previousUrl)
        completed++
      } catch (error) {
        if (version !== batchVersion || isDisposed || !images.value.some(item => item.id === image.id)) continue
        const message = `“${image.file.name}”：${error instanceof Error ? error.message : '图片转换失败，请重试'}`
        image.error = message
        failed++
        ElMessage.error(message)
      }
    }
    if (version !== batchVersion || isDisposed) return
    if (failed && completed) ElMessage.warning(`已转换 ${completed} 张，${failed} 张失败，请查看对应图片提示`)
    else if (completed) ElMessage.success(`已转换 ${completed} 张图片`)
  } finally {
    if (version === batchVersion) isConverting.value = false
  }
}

/** 按本批快照解码并校验实际编码结果；返回 Blob，移除、清空或卸载时取消并返回 null。 */
const convertImage = (imageItem: ImageItem, settings: ConversionSettings): Promise<Blob | null> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    let settled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    /** 结算当前任务并解除监听、超时和解码资源，迟到的编码回调不再产生副作用。 */
    const finish = (blob: Blob | null, error?: Error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      img.onload = null
      img.onerror = null
      img.src = ''
      cancelConversions.delete(imageItem.id)
      if (error) reject(error)
      else resolve(blob)
    }
    cancelConversions.set(imageItem.id, () => finish(null))
    timer = setTimeout(() => finish(null, new Error('图片处理超时，请重新转换')), CONVERSION_TIMEOUT_MS)
    img.onload = async () => {
      if (settled) return
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('当前浏览器无法创建图片画布')
        if (!settings.transparent) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        ctx.drawImage(img, 0, 0)
        finish(await encodeImageCanvas(canvas, settings.format, settings.quality))
      } catch (error) {
        finish(null, error instanceof Error ? error : new Error('图片编码失败，请重试'))
      }
    }
    img.onerror = () => finish(null, new Error('图片读取失败，请检查文件是否损坏'))
    img.src = imageItem.previewUrl
  })
}

/** 下载当前已保存的实际转换结果，文件名不读取尚未执行的新设置。 */
const downloadImage = (image: ImageItem) => {
  const result = image.result
  if (!result) return
  const link = document.createElement('a')
  link.href = result.url
  link.download = result.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** 快照已转换的 Blob 和文件元数据打包，同名结果唯一命名，不再从对象地址重新读取内容。 */
const downloadAllImages = async () => {
  const convertedImages = images.value.filter(image => !!image.result)
  if (!convertedImages.length) return
  if (convertedImages.length === 1) {
    downloadImage(convertedImages[0])
    return
  }
  const results = convertedImages.map(image => image.result!)
  try {
    ElMessage.info('正在打包文件，请稍候...')
    const zip = new JSZip()
    const folder = zip.folder('converted_images')
    const filenames = createConvertedImageNames(results.map(result => ({ name: result.filename, format: result.format })))
    results.forEach((result, index) => folder?.file(filenames[index], result.blob, { binary: true }))
    const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } })
    if (isDisposed) return
    const link = document.createElement('a')
    const url = URL.createObjectURL(content)
    link.href = url
    link.download = `converted_images_${Date.now()}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    ElMessage.success('图片打包下载成功')
  } catch (error) {
    if (!isDisposed) ElMessage.error('打包下载失败，请重试')
  }
}

/** 释放图片输入与结果地址，并取消该图片尚未完成的解码或编码任务。 */
const releaseImage = (image: ImageItem) => {
  cancelConversions.get(image.id)?.()
  URL.revokeObjectURL(image.previewUrl)
  if (image.result) URL.revokeObjectURL(image.result.url)
}

/** 按当前列表位置移除图片，异步结果始终用稳定标识写回而不依赖数组下标。 */
const removeImage = (index: number) => {
  const image = images.value[index]
  if (!image) return
  releaseImage(image)
  images.value.splice(index, 1)
}

/** 取消当前批次并清空全部资源，允许立即重新上传，不受旧回调影响。 */
const clearImages = () => {
  batchVersion++
  images.value.forEach(releaseImage)
  images.value = []
  isConverting.value = false
}

/** 将文件字节数转换为便于比较的容量文本。 */
const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/** 计算转换前后的体积变化百分比，空源文件返回零。 */
const calcSavings = (originalSize: number, newSize: number): string => {
  if (!originalSize) return '0%'
  return Math.abs(((originalSize - newSize) / originalSize) * 100).toFixed(1) + '%'
}

onUnmounted(() => {
  isDisposed = true
  clearImages()
})

const faq = [
  {
    q: '为什么需要图片格式转换？',
    a: '不同图片格式各有优势，如 WebP 提供高压缩率，PNG 支持透明背景，JPG 适合照片。根据使用场景选择合适格式可以平衡质量和文件大小。'
  },
  {
    q: '如何选择合适的图片格式？',
    a: 'WebP 适合网站图片并支持透明度；JPG 适合照片，透明区域会填充白色；PNG 适合透明图像和图标。BMP 可作为浏览器支持的输入，但不提供 BMP 导出。动画图片转换后仅保留浏览器解码的静态画面。'
  },
  {
    q: '如何选择最佳质量设置？',
    a: 'JPG 和 WebP 可从 80% 质量开始测试；PNG 使用无损编码，不应用质量参数。转换使用浏览器 Canvas 编码器，不提供 WebP 无损模式或渐进式 JPEG 开关；浏览器不支持目标格式时会提示失败，不会用其他格式冒充。'
  },
  {
    q: '有文件大小或数量限制吗？',
    a: '为了保证处理性能，建议每次上传不超过 20 张图片，单张不超过 10MB。所有处理都在浏览器本地完成，不会上传到服务器。'
  },
  {
    q: '转换后的图片会有质量损失吗？',
    a: 'JPG 和 WebP 通常使用有损编码，较高质量可以减少损失但会增大文件。PNG 无损保存解码后的像素；转换可能移除原文件的元数据。修改设置不会改变已有文件，需要再次点击“开始转换”。'
  }
]
</script>

<style scoped>
/* 禁用图片拖动 */
img {
  user-select: none;
  -webkit-user-drag: none;
}
</style>
