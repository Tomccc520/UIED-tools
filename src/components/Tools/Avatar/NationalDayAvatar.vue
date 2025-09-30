/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const originalImage = ref<HTMLImageElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const uploadRef = ref<HTMLInputElement | null>(null)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const loading = ref(false)
const currentFrameIndex = ref(0)
const generatedImageUrl = ref('')
const showPreview = ref(false)
const participantCount = ref(522)

// 国庆头像框架图片列表
const frameImages = [
  'hat1.png', 'hat8.png', 'hat9.png', 'hat10.png', 'hat11.png', 'hat12.png',
  'hat13.png', 'hat14.png', 'hat15.png', 'hat16.png', 'hat17.png', 'hat18.png',
  'hat21.png', 'hat22.png', 'hat23.png', 'head1.png', 'head2.png', 'head3.png',
  'head4.png', 'head5.png', 'head6.png'
]

// 背景图片
const backgroundImage = computed(() => '/src/assets/national-day/background-image.png')
const titleImage = computed(() => '/src/assets/national-day/title-image.png')
const sloganImage = computed(() => '/src/assets/national-day/slogan-image.png')

/**
 * 显示提示消息
 * @param message 消息内容
 * @param type 消息类型
 */
const showMessage = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

/**
 * 检查文件格式是否合法
 * @param file 上传的文件
 * @returns 是否合法
 */
const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!validTypes.includes(file.type)) {
    showMessage('请上传 JPG 或 PNG 格式的图片', 'error')
    return false
  }

  // 检查文件大小 (4MB)
  const maxSize = 4 * 1024 * 1024
  if (file.size > maxSize) {
    showMessage('图片大小不能超过 4MB', 'error')
    return false
  }

  return true
}

/**
 * 处理文件上传
 * @param event 上传事件
 */
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file || !isValidImageFile(file)) {
    return
  }

  loading.value = true
  
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      originalImage.value = img
      drawCanvas()
      loading.value = false
    }
    img.onerror = () => {
      showMessage('图片加载失败，请重试', 'error')
      loading.value = false
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

/**
 * 绘制画布内容
 */
const drawCanvas = async () => {
  if (!canvasRef.value || !originalImage.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸
  canvas.width = 400
  canvas.height = 400

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制用户上传的图片（作为背景）
  const imgAspectRatio = originalImage.value.width / originalImage.value.height
  const canvasAspectRatio = canvas.width / canvas.height

  let drawWidth, drawHeight, drawX, drawY

  if (imgAspectRatio > canvasAspectRatio) {
    // 图片更宽，以高度为准
    drawHeight = canvas.height
    drawWidth = drawHeight * imgAspectRatio
    drawX = (canvas.width - drawWidth) / 2
    drawY = 0
  } else {
    // 图片更高，以宽度为准
    drawWidth = canvas.width
    drawHeight = drawWidth / imgAspectRatio
    drawX = 0
    drawY = (canvas.height - drawHeight) / 2
  }

  ctx.drawImage(originalImage.value, drawX, drawY, drawWidth, drawHeight)

  // 加载并绘制国庆框架
  const frameImg = new Image()
  frameImg.onload = () => {
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height)
  }
  frameImg.src = `/src/assets/national-day/${frameImages[currentFrameIndex.value]}`
}

/**
 * 切换到上一个框架
 */
const prevFrame = () => {
  currentFrameIndex.value = currentFrameIndex.value === 0 
    ? frameImages.length - 1 
    : currentFrameIndex.value - 1
  drawCanvas()
}

/**
 * 切换到下一个框架
 */
const nextFrame = () => {
  currentFrameIndex.value = (currentFrameIndex.value + 1) % frameImages.length
  drawCanvas()
}

/**
 * 生成头像
 */
const generateAvatar = () => {
  if (!canvasRef.value || !originalImage.value) {
    showMessage('请先上传图片', 'error')
    return
  }

  loading.value = true
  
  setTimeout(() => {
    const canvas = canvasRef.value!
    generatedImageUrl.value = canvas.toDataURL('image/png')
    showPreview.value = true
    loading.value = false
    showMessage('头像生成成功！', 'success')
  }, 500)
}

/**
 * 下载头像
 */
const downloadAvatar = () => {
  if (!generatedImageUrl.value) {
    showMessage('请先生成头像', 'error')
    return
  }

  const link = document.createElement('a')
  link.download = `national-day-avatar-${Date.now()}.png`
  link.href = generatedImageUrl.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  showMessage('下载成功！', 'success')
}

/**
 * 触发文件选择
 */
const triggerUpload = () => {
  uploadRef.value?.click()
}

/**
 * 关闭预览
 */
const closePreview = () => {
  showPreview.value = false
}

onMounted(() => {
  // 初始化时绘制默认框架
  nextTick(() => {
    if (canvasRef.value) {
      const canvas = canvasRef.value
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = 400
        canvas.height = 400
        
        // 绘制默认框架
        const frameImg = new Image()
        frameImg.onload = () => {
          ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height)
        }
        frameImg.src = `/src/assets/national-day/${frameImages[0]}`
      }
    }
  })
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-red-600 hover:text-red-500 transition-colors duration-300">🇨🇳 国庆专属头像</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">为您的头像添加国庆元素，展现爱国情怀</p>
          <p class="text-gray-400 text-xs mt-2">支持 JPG/PNG 格式，文件大小不超过 4MB</p>
        </div>

        <!-- 操作区域 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 左侧：编辑区域 -->
          <div class="space-y-6">
            <!-- 画布预览 -->
            <div class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6">
              <div class="flex justify-center items-center">
                <div class="relative">
                  <canvas 
                    ref="canvasRef"
                    class="border border-gray-300 rounded-lg shadow-sm max-w-full h-auto"
                    style="width: 300px; height: 300px;"
                  ></canvas>
                  <div v-if="loading" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 框架选择 -->
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="text-lg font-semibold mb-4 text-gray-800">选择国庆框架</h3>
              <div class="flex items-center justify-center space-x-4">
                <button 
                  @click="prevFrame"
                  class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  :disabled="loading"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                
                <div class="text-center">
                  <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    <img 
                      :src="`/src/assets/national-day/${frameImages[currentFrameIndex]}`" 
                      :alt="`框架 ${currentFrameIndex + 1}`"
                      class="w-12 h-12 object-contain"
                    />
                  </div>
                  <span class="text-sm text-gray-600">{{ currentFrameIndex + 1 }} / {{ frameImages.length }}</span>
                </div>
                
                <button 
                  @click="nextFrame"
                  class="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  :disabled="loading"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧：操作按钮 -->
          <div class="space-y-6">
            <!-- 上传图片 -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold mb-4 text-gray-800">上传头像</h3>
              <div class="space-y-4">
                <button
                  @click="triggerUpload"
                  class="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                  :disabled="loading"
                >
                  <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  选择图片
                </button>
                <input
                  ref="uploadRef"
                  type="file"
                  accept="image/*"
                  @change="handleFileUpload"
                  class="hidden"
                />
              </div>
            </div>

            <!-- 生成头像 -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold mb-4 text-gray-800">生成头像</h3>
              <button
                @click="generateAvatar"
                class="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium"
                :disabled="loading || !originalImage"
              >
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                生成国庆头像
              </button>
            </div>

            <!-- 使用说明 -->
            <div class="bg-gradient-to-r from-red-50 to-yellow-50 border border-red-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold mb-3 text-red-800">使用说明</h3>
              <ul class="text-sm text-red-700 space-y-2">
                <li class="flex items-start">
                  <span class="text-red-500 mr-2">1.</span>
                  点击"选择图片"上传您的头像照片
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-2">2.</span>
                  使用左右箭头选择喜欢的国庆框架
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-2">3.</span>
                  点击"生成国庆头像"制作专属头像
                </li>
                <li class="flex items-start">
                  <span class="text-red-500 mr-2">4.</span>
                  长按保存图片或点击下载按钮
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐区域 -->
      <ToolsRecommend :currentPath="route.path" />

      <!-- 预览弹窗 -->
      <div v-if="showPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closePreview">
        <div class="bg-white rounded-lg p-6 max-w-md mx-4" @click.stop>
          <div class="text-center">
            <h3 class="text-lg font-semibold mb-4">国庆头像生成成功！</h3>
            <div class="mb-4">
              <img :src="generatedImageUrl" alt="生成的头像" class="w-64 h-64 object-contain mx-auto rounded-lg shadow-md" />
            </div>
            <p class="text-sm text-gray-600 mb-4">长按图片保存到相册，或点击下载按钮</p>
            <div class="flex space-x-3">
              <button
                @click="downloadAvatar"
                class="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                下载头像
              </button>
              <button
                @click="closePreview"
                class="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div v-if="showToast"
        class="fixed top-4 right-4 px-4 py-2 rounded-lg text-sm text-white shadow-lg transition-all duration-300 z-50"
        :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'">
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 响应式调整 */
@media (max-width: 640px) {
  .grid-cols-1.lg\\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}

/* 加载动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 按钮禁用状态 */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 画布样式 */
canvas {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -moz-crisp-edges;
  image-rendering: -o-crisp-edges;
  image-rendering: optimize-contrast;
}
</style>