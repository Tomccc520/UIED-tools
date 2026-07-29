<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
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
          <div
            class="relative border border-dashed rounded-lg min-h-[220px] flex flex-col items-center justify-center transition-colors duration-200 bg-white"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="handleFileInputChange"
            />
            <div class="absolute inset-0 cursor-pointer z-10" @click="triggerFileInput"></div>

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽照片到这里</div>
              <p class="text-xs text-gray-400 mb-1">支持 JPG、PNG、WebP 格式，文件大小不超过 10MB</p>
              <p class="text-xs text-gray-400">适合证件照、人像头像和半身照，建议上传轮廓清晰的原图</p>
            </div>
          </div>

          <div v-if="currentImage" class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">人像抠图设置</div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="border border-gray-200 rounded-lg p-4 bg-white">
                <div class="text-xs text-gray-400 mb-1">处理方式</div>
                <div class="text-sm text-gray-700 font-medium">云端 AI 抠图</div>
              </div>
              <div class="border border-gray-200 rounded-lg p-4 bg-white">
                <div class="text-xs text-gray-400 mb-1">服务配置</div>
                <div class="text-sm text-gray-700 font-medium">后台统一管理</div>
              </div>
              <div class="border border-gray-200 rounded-lg p-4 bg-white">
                <div class="text-xs text-gray-400 mb-1">输出格式</div>
                <div class="text-sm text-gray-700 font-medium">PNG 透明背景</div>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <el-button type="primary" size="large" :loading="isProcessing" @click="processImage" class="!h-10">
                {{ isProcessing ? 'AI人像抠图处理中...' : '开始AI人像抠图' }}
              </el-button>
              <el-button size="large" @click="triggerFileInput" class="!h-10">上传其他照片</el-button>
              <el-button v-if="processedImageUrl" type="success" size="large" @click="downloadImage" class="!h-10">
                下载透明PNG
              </el-button>
            </div>
          </div>

          <div v-if="currentImage || processedImageUrl" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-3">原始人像</div>
              <div class="relative aspect-[3/4] bg-white rounded-lg overflow-hidden">
                <img v-if="currentImage" :src="currentImage" class="w-full h-full object-contain" />
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-3">抠图结果（透明背景）</div>
              <div class="relative aspect-[3/4] transparent-bg rounded-lg overflow-hidden">
                <img v-if="processedImageUrl" :src="processedImageUrl" class="w-full h-full object-contain" />
                <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">等待处理...</div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border border-gray-100 rounded-lg p-6">
                <h4 class="text-base font-medium text-gray-900 mb-3">云端 API 处理</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  页面通过后端代理调用抠图服务商，密钥不会暴露在浏览器中。
                </p>
              </div>
              <div class="border border-gray-100 rounded-lg p-6">
                <h4 class="text-base font-medium text-gray-900 mb-3">头发边缘更友好</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  针对头发、肩部等细节场景优化，适合做证件照换底、头像处理和海报素材。
                </p>
              </div>
              <div class="border border-gray-100 rounded-lg p-6">
                <h4 class="text-base font-medium text-gray-900 mb-3">可接后台配额策略</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  已复用统一 `/api/matting/matting` 接口，后续可直接接入会员、次数和计费规则。
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
import { onBeforeUnmount, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { requestMattingImage } from '@/services/matting'

const info = reactive({
  title: '免费AI人像抠图工具',
  subtitle: '通过云端 AI 抠图输出透明 PNG，适合头像和证件照等人像场景'
})

const faq = [
  {
    q: '为什么这个工具单独做了人像模式？',
    a: '页面针对证件照、头像和半身照整理了更明确的人像处理流程，实际服务商由后台统一配置。'
  },
  {
    q: '支持哪些图片格式？',
    a: '支持 JPG、PNG、WebP，建议上传清晰正面人像图，边缘效果更好。'
  },
  {
    q: '输出结果是什么格式？',
    a: '处理后统一输出透明背景 PNG，可继续做证件照换底、排版或设计合成。'
  },
  {
    q: '失败了怎么办？',
    a: '可尝试更换更清晰的人像图，或避免复杂背景、强逆光照片。'
  }
]

const currentImage = ref('')
const processedImageUrl = ref('')
const isProcessing = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const processedObjectUrl = ref('')

/**
 * 函数说明：释放旧的抠图结果对象 URL，避免重复处理导致内存累积
 */
const cleanupProcessedObjectUrl = () => {
  if (!processedObjectUrl.value) return
  URL.revokeObjectURL(processedObjectUrl.value)
  processedObjectUrl.value = ''
}

/**
 * 函数说明：处理文件选择事件并执行格式与大小校验
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
 * 函数说明：触发系统文件选择器，便于快速更换上传图片
 */
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

/**
 * 函数说明：更新当前预览图片和待处理文件，并清空旧的抠图结果
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
  cleanupProcessedObjectUrl()
  processedImageUrl.value = ''
}

/**
 * 函数说明：调用后台统一配置的 AI 抠图 API 并输出透明 PNG。
 */
const processImage = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先上传人像照片')
    return
  }

  isProcessing.value = true
  try {
    const resultBlob = await requestMattingImage(selectedFile.value)
    cleanupProcessedObjectUrl()
    const objectUrl = URL.createObjectURL(resultBlob)
    processedObjectUrl.value = objectUrl
    processedImageUrl.value = objectUrl
    ElMessage.success('AI人像抠图完成')
  } catch (error) {
    const message = error instanceof Error ? error.message : '人像抠图失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    isProcessing.value = false
  }
}

/**
 * 函数说明：下载透明背景 PNG 结果图
 */
const downloadImage = () => {
  if (!processedImageUrl.value) return
  const name = selectedFile.value?.name || 'portrait'
  const baseName = name.replace(/\.[^.]+$/, '')
  const link = document.createElement('a')
  link.href = processedImageUrl.value
  link.download = `${baseName}_portrait_matting.png`
  link.click()
}

onBeforeUnmount(() => {
  if (currentImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(currentImage.value)
  }
  cleanupProcessedObjectUrl()
})

const route = useRoute()
</script>

<style scoped>
img {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.transparent-bg {
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  background-color: #ffffff;
}
</style>
