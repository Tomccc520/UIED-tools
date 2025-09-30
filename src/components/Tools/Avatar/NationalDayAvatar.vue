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

// 导入静态资源
import backgroundImageUrl from '@/assets/national-day/background-image.png'
import titleImageUrl from '@/assets/national-day/title-image.png'
import actDoneHappyUrl from '@/assets/national-day/act-done-happy.png'
// import sloganImageUrl from '@/assets/national-day/slogan-image.png' // 文件不存在，注释掉

// 导入所有国庆框架图片
import hat1 from '@/assets/national-day/hat1.png'
import hat8 from '@/assets/national-day/hat8.png'
import hat9 from '@/assets/national-day/hat9.png'
import hat10 from '@/assets/national-day/hat10.png'
import hat11 from '@/assets/national-day/hat11.png'
import hat12 from '@/assets/national-day/hat12.png'
import hat13 from '@/assets/national-day/hat13.png'
import hat14 from '@/assets/national-day/hat14.png'
import hat15 from '@/assets/national-day/hat15.png'
import hat16 from '@/assets/national-day/hat16.png'
import hat17 from '@/assets/national-day/hat17.png'
import hat18 from '@/assets/national-day/hat18.png'
import hat21 from '@/assets/national-day/hat21.png'
import hat22 from '@/assets/national-day/hat22.png'
import hat23 from '@/assets/national-day/hat23.png'
import head1 from '@/assets/national-day/head1.png'
import head2 from '@/assets/national-day/head2.png'
import head3 from '@/assets/national-day/head3.png'
import head4 from '@/assets/national-day/head4.png'
import head5 from '@/assets/national-day/head5.png'
import head6 from '@/assets/national-day/head6.png'

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

// 国庆头像框架图片映射
const frameImageMap = {
  'hat1.png': hat1,
  'hat8.png': hat8,
  'hat9.png': hat9,
  'hat10.png': hat10,
  'hat11.png': hat11,
  'hat12.png': hat12,
  'hat13.png': hat13,
  'hat14.png': hat14,
  'hat15.png': hat15,
  'hat16.png': hat16,
  'hat17.png': hat17,
  'hat18.png': hat18,
  'hat21.png': hat21,
  'hat22.png': hat22,
  'hat23.png': hat23,
  'head1.png': head1,
  'head2.png': head2,
  'head3.png': head3,
  'head4.png': head4,
  'head5.png': head5,
  'head6.png': head6
}

// 国庆头像框架图片列表
const frameImages = [
  'hat1.png', 'hat8.png', 'hat9.png', 'hat10.png', 'hat11.png', 'hat12.png',
  'hat13.png', 'hat14.png', 'hat15.png', 'hat16.png', 'hat17.png', 'hat18.png',
  'hat21.png', 'hat22.png', 'hat23.png', 'head1.png', 'head2.png', 'head3.png',
  'head4.png', 'head5.png', 'head6.png'
]

// 背景图片
const backgroundImage = computed(() => backgroundImageUrl)
const titleImage = computed(() => titleImageUrl)
const actDoneHappyImage = computed(() => actDoneHappyUrl)
// const sloganImage = computed(() => sloganImageUrl) // 注释掉不存在的图片

/**
 * 获取框架图片URL
 * @param frameName 框架文件名
 * @returns 图片URL
 */
const getFrameImageUrl = (frameName: string): string => {
  return frameImageMap[frameName as keyof typeof frameImageMap] || hat1
}

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
  frameImg.src = getFrameImageUrl(frameImages[currentFrameIndex.value])
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
        frameImg.src = getFrameImageUrl(frameImages[0])
      }
    }
  })
})
</script>

<template>
  <!-- 使用背景图片的全屏背景 -->
  <div class="min-h-screen bg-cover bg-center bg-no-repeat" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <!-- 内容容器 -->
    <div class="min-h-screen flex flex-col">
      <!-- 头部标题区域 -->
      <div class="text-center pt-8 pb-4">
        <!-- 迎国庆换新颜标题图片 -->
        <div class="mb-4">
          <img :src="titleImage" alt="迎国庆换新颜" class="mx-auto h-16 md:h-20 object-contain" />
        </div>
        
        <!-- 副标题 -->
        <p class="text-white text-lg md:text-xl font-medium mb-2">领取你的国庆专属头像</p>
        <p class="text-red-100 text-sm">目前已有 {{ participantCount }}万 人参与活动</p>
      </div>

      <!-- 主要内容区域 -->
      <div class="flex-1 flex items-center justify-center px-4">
        <div class="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-md mx-auto">
          <!-- 移动端垂直布局 -->
          <div class="flex flex-col">
            
            <!-- 头像预览区域 -->
            <div class="p-6 bg-gradient-to-br from-red-50/80 to-yellow-50/80 backdrop-blur-sm">
              <!-- 画布预览 -->
              <div class="flex justify-center items-center mb-6">
                <div class="relative">
                  <div class="bg-white p-4 rounded-2xl shadow-lg">
                    <canvas ref="canvasRef" 
                      class="border-4 border-red-200 rounded-xl shadow-sm w-full aspect-square"
                      style="width: 280px; height: 280px;"></canvas>
                  </div>
                  <div v-if="loading"
                    class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                </div>
              </div>

              <!-- 框架选择器 -->
              <div class="bg-white rounded-xl p-4 shadow-sm border border-red-100">
                <div class="flex items-center justify-center space-x-6">
                  <button @click="prevFrame"
                    class="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg"
                    :disabled="loading">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>

                  <div class="text-center">
                    <div class="w-20 h-20 bg-gradient-to-br from-red-50 to-yellow-50 rounded-xl flex items-center justify-center mb-2 border-2 border-red-200">
                      <img :src="getFrameImageUrl(frameImages[currentFrameIndex])" :alt="`框架 ${currentFrameIndex + 1}`"
                        class="w-16 h-16 object-contain" />
                    </div>
                    <span class="text-sm text-gray-600 font-medium">{{ currentFrameIndex + 1 }} / {{ frameImages.length }}</span>
                  </div>

                  <button @click="nextFrame"
                    class="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg"
                    :disabled="loading">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 操作区域 -->
            <div class="p-6 bg-white/90 backdrop-blur-sm">
              <div class="space-y-6">
                
                <!-- 上传图片按钮 -->
                <div class="text-center">
                  <p class="text-gray-600 mb-4 text-sm">请选择文件</p>
                  <button @click="triggerUpload"
                    class="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 font-bold text-lg shadow-lg"
                    :disabled="loading">
                    上传
                  </button>
                  <input ref="uploadRef" type="file" accept="image/*" @change="handleFileUpload" class="hidden" />
                </div>

                <!-- 生成头像按钮 -->
                <div v-if="originalImage" class="text-center">
                  <button @click="generateAvatar"
                    class="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-bold text-lg shadow-lg"
                    :disabled="loading || !originalImage">
                    生成国庆头像
                  </button>
                </div>

                <!-- 使用说明 -->
                <div class="bg-gradient-to-r from-red-50 to-yellow-50 border-2 border-red-200 rounded-xl p-6">
                  <h3 class="text-lg font-bold mb-4 text-red-800 text-center">使用说明</h3>
                  <ul class="text-sm text-red-700 space-y-3">
                    <li class="flex items-start">
                      <span class="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 font-bold">1</span>
                      点击"上传"按钮选择您的头像照片
                    </li>
                    <li class="flex items-start">
                      <span class="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 font-bold">2</span>
                      使用左右箭头选择喜欢的国庆框架
                    </li>
                    <li class="flex items-start">
                      <span class="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 font-bold">3</span>
                      点击"生成国庆头像"制作专属头像
                    </li>
                    <li class="flex items-start">
                      <span class="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5 font-bold">4</span>
                      长按保存图片或点击下载按钮
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部祝福语 -->
          <div class="bg-gradient-to-r from-red-500/90 to-red-600/90 text-white text-center py-6 backdrop-blur-sm">
            <img :src="actDoneHappyImage" alt="愿祖国繁荣昌盛 祝您国庆节快乐" class="mx-auto max-w-full h-auto" />
          </div>
        </div>
      </div>

      <!-- 工具推荐区域 -->
      <div class="px-4 pb-8">
        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>

    <!-- 预览弹窗 -->
    <div v-if="showPreview" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closePreview">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4" @click.stop>
        <div class="text-center">
          <h3 class="text-xl font-bold mb-4 text-gray-800">国庆头像生成成功！</h3>
          <div class="mb-6">
            <img :src="generatedImageUrl" alt="生成的头像" class="w-64 h-64 object-contain mx-auto rounded-xl shadow-lg border-4 border-red-200" />
          </div>
          <p class="text-sm text-gray-600 mb-6">长按图片保存到相册，或点击下载按钮</p>
          <div class="flex space-x-3">
            <button @click="downloadAvatar"
              class="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-bold shadow-lg">
              下载头像
            </button>
            <button @click="closePreview"
              class="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200 font-bold">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示信息 -->
    <div v-if="showToast"
      class="fixed top-4 right-4 px-6 py-3 rounded-xl text-sm text-white shadow-2xl transition-all duration-300 z-50"
      :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'">
      {{ toastMessage }}
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
