<!--
 * @file PhotoBackground.vue
 * @description 免费在线证件照换底色工具
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-01-15
 *
 * 功能特性：
 * 1. 支持一键智能抠图并更换背景色
 * 2. 支持多种标准底色(白底、红底、蓝底等)
 * 3. 支持自定义背景颜色
 * 4. 支持微调人像位置和大小
 * 5. 本地处理，保护隐私
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

        <!-- 维护提示 -->
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                该功能正在维护升级中，我们正在努力为您带来更好的体验。
              </p>
            </div>
          </div>
        </div>

        <!-- 主要功能区域 -->
        <div class="grid grid-cols-1 gap-8 opacity-50 pointer-events-none select-none grayscale filter">
          <!-- 上传区域 -->
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
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
              <p class="text-xs text-gray-400 mb-1">
                支持 JPG、PNG、WebP 格式，文件大小不超过 10MB
              </p>
              <p class="text-xs text-gray-400">
                建议上传正面免冠照片，效果更佳
              </p>
            </div>
          </div>

          <!-- 背景色选择面板 -->
          <div v-if="currentImage" class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">背景颜色设置</div>
            <div class="space-y-6">
              <!-- 预设颜色选择 -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button v-for="color in presetColors" :key="color.name"
                  class="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                  :class="selectedColor === color.value ? 'border-blue-500' : 'border-gray-200'"
                  @click="selectColor(color.value)">
                  <div class="w-full h-12 rounded mb-2" :style="{ backgroundColor: color.value }"></div>
                  <div class="text-sm text-gray-600 text-center">{{ color.name }}</div>
                </button>
              </div>

              <!-- 自定义颜色 -->
              <div class="flex items-center space-x-4">
                <div class="flex-1">
                  <div class="text-sm text-gray-600 mb-2">自定义颜色</div>
                  <input type="color" v-model="customColor" class="w-full h-10 rounded cursor-pointer" />
                </div>
                <div class="flex-1">
                  <div class="text-sm text-gray-600 mb-2">容差值 ({{ tolerance }})</div>
                  <el-slider v-model="tolerance" :min="1" :max="100" :step="1" />
                </div>
                <button @click="selectColor(customColor)"
                  class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 h-10 self-end">
                  应用
                </button>
              </div>

              <!-- 操作按钮 -->
              <div class="flex space-x-3">
                <el-button type="primary" size="large" :loading="isProcessing" @click="processImage"
                  class="flex-1 !h-10">
                  {{ isProcessing ? '处理中...' : '开始处理' }}
                </el-button>
                <el-button v-if="processedImageUrl" type="success" size="large" @click="downloadImage"
                  class="flex-1 !h-10">
                  下载
                </el-button>
              </div>
            </div>
          </div>

          <!-- 图片预览区域 -->
          <div v-if="currentImage || processedImageUrl" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 原图预览 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-3">原始照片</div>
              <div class="relative aspect-[3/4] bg-white rounded-lg overflow-hidden">
                <img v-if="currentImage" :src="currentImage" class="w-full h-full object-contain" />
              </div>
            </div>

            <!-- 处理后预览 -->
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-3">处理效果</div>
              <div class="relative aspect-[3/4] bg-white rounded-lg overflow-hidden">
                <img v-if="processedImageUrl" :src="processedImageUrl" class="w-full h-full object-contain" />
                <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
                  等待处理...
                </div>
              </div>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border border-gray-100 rounded-lg p-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 class="text-base font-medium text-gray-900">智能抠图</h4>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">
                  采用先进的AI算法，精准识别人像轮廓，自动去除背景，效果自然
                </p>
              </div>

              <div class="border border-gray-100 rounded-lg p-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h4 class="text-base font-medium text-gray-900">标准底色</h4>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">
                  内置多种标准证件照底色，一键切换，满足不同场景需求
                </p>
              </div>

              <div class="border border-gray-100 rounded-lg p-6">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 class="text-base font-medium text-gray-900">隐私保护</h4>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">
                  所有处理均在本地完成，无需上传服务器，保护您的隐私安全
                </p>
              </div>
            </div>
          </div>

          <!-- 常见问题 -->
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
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

// 组件配置信息
const info = reactive({
  title: "免费证件照换底色工具（维护中）",
  subtitle: "该功能正在升级维护中，请稍后再试"
}) as {
  title: string;
  subtitle: string;
}

// 预设底色
const presetColors = [
  { name: '标准白底', value: '#FFFFFF' },
  { name: '标准蓝底', value: '#2E5ED1' },
  { name: '标准红底', value: '#D12E2E' },
  { name: '浅蓝底色', value: '#87CEEB' }
]

// 状态管理
const currentImage = ref<string>('')
const processedImageUrl = ref<string>('')
const selectedColor = ref('#FFFFFF')
const customColor = ref('#FFFFFF')
const tolerance = ref(30)
const isProcessing = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 常见问题
const faq = [
  {
    q: '支持哪些照片格式？',
    a: '支持JPG、PNG、WebP等常见图片格式，建议上传清晰的正面免冠照片。'
  },
  {
    q: '换底色后的照片可以直接使用吗？',
    a: '可以，处理后的照片符合标准证件照要求，可直接用于办理证件。'
  },
  {
    q: '照片会上传到服务器吗？',
    a: '不会，所有处理都在您的浏览器本地完成，保护您的隐私安全。'
  },
  {
    q: '背景颜色不够标准怎么办？',
    a: '我们提供的预设颜色都符合国标要求，您也可以使用自定义颜色功能调整到满意效果。'
  }
]

// 文件上传处理
const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  handleImageUpload(file)
  input.value = '' // 清空input值，允许重复选择同一文件
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (!files?.length) return

  const file = files[0]
  if (file.type.startsWith('image/')) {
    handleImageUpload(file)
  } else {
    ElMessage.warning('请上传图片文件')
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 图片处理相关函数
const handleImageUpload = (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    currentImage.value = e.target?.result as string
    processedImageUrl.value = '' // 清除之前的处理结果
  }
  reader.readAsDataURL(file)
}

const selectColor = (color: string) => {
  selectedColor.value = color
}

const processImage = async () => {
  if (!currentImage.value) {
    ElMessage.warning('请先上传照片')
    return
  }

  isProcessing.value = true
  try {
    // 加载原始图片
    const img = new Image()
    img.src = currentImage.value
    await new Promise((resolve) => { img.onload = resolve })

    // 创建 Canvas 并绘制图片
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建Canvas上下文')
    ctx.drawImage(img, 0, 0)

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // 获取右上角的背景色样本
    const samplePos = (10 * canvas.width + 10) * 4
    const bgColor = {
      r: data[samplePos],
      g: data[samplePos + 1],
      b: data[samplePos + 2]
    }

    // 获取目标背景色
    const targetColor = hexToRgb(selectedColor.value)

    // 替换背景色
    // const tolerance = 30 // 容差值
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // 计算与背景色的差异
      const diff = Math.sqrt(
        Math.pow(r - bgColor.r, 2) +
        Math.pow(g - bgColor.g, 2) +
        Math.pow(b - bgColor.b, 2)
      )

      // 如果颜色接近背景色，则替换
      if (diff < tolerance.value) {
        data[i] = targetColor.r
        data[i + 1] = targetColor.g
        data[i + 2] = targetColor.b
      }
    }

    // 更新画布
    ctx.putImageData(imageData, 0, 0)

    // 保存结果
    processedImageUrl.value = canvas.toDataURL('image/jpeg', 0.95)
    ElMessage.success('处理完成')
  } catch (error) {
    console.error('处理失败:', error)
    ElMessage.error('处理失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

// 辅助函数：HEX 转 RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 }
}

const downloadImage = () => {
  if (!processedImageUrl.value) return

  const link = document.createElement('a')
  link.href = processedImageUrl.value
  link.download = 'photo_' + new Date().getTime() + '.jpg'
  link.click()
}

// 获取当前路由
const route = useRoute()
</script>

<style scoped>
/* 禁用图片拖动 */
img {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 自定义颜色选择器样式 */
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
