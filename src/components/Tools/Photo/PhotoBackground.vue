<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-21
 */
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 border border-gray-100">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3">
            <span class="text-gray-800">{{ $ensureFreeToolTitle(info.title) }}</span>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <div class="grid grid-cols-1 gap-8">
          <div class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
              @change="handleFileInputChange" />
            <div class="absolute inset-0 cursor-pointer z-10" @click="triggerFileInput"></div>

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽照片到这里</div>
              <p class="text-xs text-gray-400 mb-1">支持 JPG、PNG、WebP 格式，文件大小不超过 10MB</p>
              <p class="text-xs text-gray-400">建议上传背景干净的人像照片，换底色更自然</p>
            </div>
          </div>

          <div v-if="currentImage" class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">背景颜色设置</div>
            <p class="text-xs text-gray-500 mb-4">
              {{ hasForegroundPng ? '当前照片已完成抠图，可直接切换底色，无需重复调用 AI 模型。' : '首次处理会先生成透明 PNG，之后可任意切换底色。' }}
            </p>
            <div class="space-y-6">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button v-for="color in presetColors" :key="color.name"
                  class="p-4 rounded-lg border transition-all duration-200 bg-white"
                  :class="selectedColor === color.value ? 'border-blue-500' : 'border-gray-200'" @click="selectColor(color.value)">
                  <div class="w-full h-12 rounded mb-2" :style="{ backgroundColor: color.value }"></div>
                  <div class="text-sm text-gray-600 text-center">{{ color.name }}</div>
                </button>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-end gap-4">
                <div class="sm:w-56">
                  <div class="text-sm text-gray-600 mb-2">自定义颜色</div>
                  <input type="color" v-model="customColor" class="w-full h-10 rounded cursor-pointer" />
                </div>
                <el-button type="primary" plain class="!h-10 sm:w-36" @click="selectColor(customColor)">
                  应用自定义颜色
                </el-button>
              </div>

              <div class="flex flex-wrap gap-3">
                <el-button type="primary" size="large" :loading="isProcessing" @click="processImage" class="!h-10">
                  {{ isProcessing ? 'AI抠图处理中...' : hasForegroundPng ? '重新生成当前底色' : '开始抠图并换底色' }}
                </el-button>
                <el-button size="large" class="!h-10" @click="triggerFileInput">
                  上传其他照片
                </el-button>
                <el-button v-if="processedImageUrl" type="success" size="large" @click="downloadImage" class="!h-10">
                  下载照片
                </el-button>
              </div>
            </div>
          </div>

          <div v-if="currentImage || processedImageUrl" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-3">原始照片</div>
              <div class="relative aspect-[3/4] bg-white rounded-lg overflow-hidden">
                <img v-if="currentImage" :src="currentImage" class="w-full h-full object-contain" />
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-3">换底色效果</div>
              <div class="relative aspect-[3/4] bg-white rounded-lg overflow-hidden">
                <img v-if="processedImageUrl" :src="processedImageUrl" class="w-full h-full object-contain" />
                <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
                  等待处理...
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border border-gray-100 rounded-lg p-6">
                <h4 class="text-base font-medium text-gray-900 mb-3">AI 抠图 + 智能合成</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  先通过抠图模型提取人像前景，再按证件照标准底色进行合成，边缘更干净。
                </p>
              </div>
              <div class="border border-gray-100 rounded-lg p-6">
                <h4 class="text-base font-medium text-gray-900 mb-3">证件照底色预设</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  内置白底、蓝底、红底等常见规范颜色，也支持自定义颜色快速调试。
                </p>
              </div>
              <div class="border border-gray-100 rounded-lg p-6">
                <h4 class="text-base font-medium text-gray-900 mb-3">可扩展会员能力</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  已接入独立推理接口，后续可平滑接入配额、套餐和订单能力，不影响页面交互。
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="(item, index) in faq" :key="index" class="pb-6 last:pb-0 border-b border-gray-200 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.q }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ item.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { requestMattingImage, warmupMattingModelId } from '@/services/matting'
import { useToolConsume } from '@/composables/useToolConsume'

const info = reactive({
  title: '免费AI证件照换底色工具',
  subtitle: '同一张图仅抠图一次，后续可自由切换底色并实时生成证件照效果'
})

const presetColors = [
  { name: '标准白底', value: '#FFFFFF' },
  { name: '标准蓝底', value: '#2E5ED1' },
  { name: '标准红底', value: '#D12E2E' },
  { name: '浅蓝底色', value: '#87CEEB' }
]

const currentImage = ref('')
const processedImageUrl = ref('')
const foregroundPngUrl = ref('')
const selectedColor = ref('#FFFFFF')
const customColor = ref('#FFFFFF')
const isProcessing = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const hasForegroundPng = computed(() => Boolean(foregroundPngUrl.value))
const route = useRoute()
const { ensureToolConsume } = useToolConsume()

const faq = [
  {
    q: '支持哪些照片格式？',
    a: '支持 JPG、PNG、WebP 格式，建议上传清晰正面照。'
  },
  {
    q: '换底色后的照片可以直接使用吗？',
    a: '可以，处理后可直接用于证件照打印或继续裁剪排版。'
  },
  {
    q: '照片会长期存储吗？',
    a: '不会，接口仅用于推理处理，当前不做业务持久化。'
  },
  {
    q: '如果效果不理想怎么办？',
    a: '可尝试背景更干净、人物轮廓更清晰的原图，通常会显著提升效果。'
  }
]

/**
 * 函数说明：加载 Blob URL 图片，供 Canvas 进行二次合成
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片加载失败'))
    image.src = src
  })
}

/**
 * 函数说明：释放指定 Blob URL，避免重复上传后内存累积
 */
const revokeBlobUrl = (url: string) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

/**
 * 函数说明：重置已抠出的透明 PNG 缓存
 */
const resetForegroundPng = () => {
  revokeBlobUrl(foregroundPngUrl.value)
  foregroundPngUrl.value = ''
}

/**
 * 函数说明：根据当前选色和透明前景图生成最终证件照
 */
const renderPhotoWithBackground = async () => {
  if (!foregroundPngUrl.value) {
    throw new Error('透明前景图不存在，请先执行抠图')
  }

  const foregroundImage = await loadImage(foregroundPngUrl.value)
  const canvas = document.createElement('canvas')
  canvas.width = foregroundImage.width
  canvas.height = foregroundImage.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 初始化失败')
  }

  ctx.fillStyle = selectedColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(foregroundImage, 0, 0)
  processedImageUrl.value = canvas.toDataURL('image/jpeg', 0.95)
}

/**
 * 函数说明：确保透明 PNG 已生成；若已存在则直接复用避免重复抠图
 */
const ensureForegroundPng = async () => {
  if (foregroundPngUrl.value) {
    return
  }
  if (!selectedFile.value) {
    throw new Error('请先上传照片')
  }

  const transparentBlob = await requestMattingImage(selectedFile.value)
  resetForegroundPng()
  foregroundPngUrl.value = URL.createObjectURL(transparentBlob)
}

/**
 * 函数说明：处理文件选择事件并执行上传前校验
 */
const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  handleImageUpload(input.files[0])
  input.value = ''
}

/**
 * 函数说明：处理拖拽上传并复用统一上传逻辑
 */
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false

  const files = event.dataTransfer?.files
  if (!files?.length) return

  const file = files[0]
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }
  handleImageUpload(file)
}

/**
 * 函数说明：触发文件选择器，便于更换上传图片
 */
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

/**
 * 函数说明：保存原始文件对象并生成本地预览图
 */
const handleImageUpload = (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  selectedFile.value = file
  if (currentImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(currentImage.value)
  }
  currentImage.value = URL.createObjectURL(file)
  resetForegroundPng()
  processedImageUrl.value = ''
}

/**
 * 函数说明：更新目标背景颜色
 */
const selectColor = (color: string) => {
  selectedColor.value = color
  if (!foregroundPngUrl.value || isProcessing.value) {
    return
  }

  void renderPhotoWithBackground().catch((error) => {
    const message = error instanceof Error ? error.message : '底色预览失败，请重试'
    ElMessage.error(message)
  })
}

/**
 * 函数说明：首次点击时执行抠图并缓存透明图，后续仅本地换色合成
 */
const processImage = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先上传照片')
    return
  }

  const needMatting = !foregroundPngUrl.value
  if (needMatting) {
    const canConsume = await ensureToolConsume({
      toolKey: 'photo-background',
      action: 'matting',
      loginWarningText: '请先登录后再使用 AI 抠图功能',
      showConsumeSuccessToast: true
    })
    if (!canConsume) {
      return
    }
  }

  isProcessing.value = true
  try {
    await ensureForegroundPng()
    await renderPhotoWithBackground()
    ElMessage.success(needMatting ? '抠图完成，后续切换颜色无需再次抠图' : '底色已更新')
  } catch (error) {
    const message = error instanceof Error ? error.message : '换底色失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    isProcessing.value = false
  }
}

/**
 * 函数说明：下载换底色后的证件照图片
 */
const downloadImage = async () => {
  if (!processedImageUrl.value) return
  const canDownload = await ensureToolConsume({
    toolKey: 'photo-background',
    action: 'download',
    mode: 'check-login',
    loginWarningText: '请先登录后再下载证件照'
  })
  if (!canDownload) {
    return
  }
  const fileName = selectedFile.value?.name || 'photo.jpg'
  const baseName = fileName.replace(/\.[^.]+$/, '')
  const link = document.createElement('a')
  link.href = processedImageUrl.value
  link.download = `${baseName}_bg.jpg`
  link.click()
}

onBeforeUnmount(() => {
  revokeBlobUrl(currentImage.value)
  resetForegroundPng()
})

onMounted(() => {
  warmupMattingModelId()
})
</script>

<style scoped>
img {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

input[type="color"] {
  -webkit-appearance: none;
  border: none;
  padding: 0;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}
</style>
