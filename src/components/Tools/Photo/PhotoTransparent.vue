<!--
 * @file PhotoTransparent.vue
 * @description 证件照透明背景生成工具
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-01-15
 *
 * 功能特性：
 * 1. 智能去除证件照背景
 * 2. 生成标准PNG透明证件照
 * 3. 支持多种证件类型
 * 4. 本地处理保护隐私
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
        <div class="grid grid-cols-1 gap-8">
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

          <!-- 证件类型选择 -->
          <div v-if="currentImage" class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">选择证件类型</div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button v-for="type in documentTypes" :key="type.id"
                class="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                :class="selectedType === type.id ? 'border-blue-500' : 'border-gray-200'" @click="selectType(type.id)">
                <div class="text-sm text-gray-600 text-center">{{ type.name }}</div>
                <div class="text-xs text-gray-400 text-center mt-1">{{ type.size }}</div>
              </button>
            </div>

            <!-- 操作按钮 -->
            <div class="flex space-x-3 mt-6">
              <el-button type="primary" size="large" :loading="isProcessing" @click="processImage" class="flex-1 !h-10">
                {{ isProcessing ? '处理中...' : '开始处理' }}
              </el-button>
              <el-button v-if="processedImageUrl" type="success" size="large" @click="downloadImage"
                class="flex-1 !h-10">
                下载
              </el-button>
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
              <div class="relative aspect-[3/4] transparent-bg rounded-lg overflow-hidden">
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
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h4 class="text-base font-medium text-gray-900">多种规格</h4>
                </div>
                <p class="text-sm text-gray-600 leading-relaxed">
                  支持护照、签证、身份证等多种证件照规格，一键生成标准尺寸
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
import { ref, reactive } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

// 组件配置信息
const info = reactive({
  title: "证件照透明背景工具（维护中）",
  subtitle: "该功能正在升级维护中，请稍后再试"
})

// 证件类型
const documentTypes = [
  { id: 1, name: '一寸照片', size: '25×35mm' },
  { id: 2, name: '二寸照片', size: '35×49mm' },
  { id: 3, name: '小二寸', size: '35×45mm' },
  { id: 4, name: '大一寸', size: '33×48mm' },
  { id: 5, name: '护照照片', size: '33×48mm' },
  { id: 6, name: '签证照片', size: '33×48mm' },
  { id: 7, name: '身份证照片', size: '26×32mm' },
  { id: 8, name: '驾驶证照片', size: '21×26mm' }
]

// 状态管理
const currentImage = ref<string>('')
const processedImageUrl = ref<string>('')
const selectedType = ref(1)
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
    q: '生成的照片是什么格式？',
    a: '处理后的照片为PNG格式，带透明背景，方便后续编辑使用。'
  },
  {
    q: '照片会上传到服务器吗？',
    a: '不会，所有处理都在您的浏览器本地完成，保护您的隐私安全。'
  },
  {
    q: '照片尺寸不够标准怎么办？',
    a: '建议搭配我们的证件照裁剪工具使用，可以精确调整到标准尺寸。'
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

const selectType = (typeId: number) => {
  selectedType.value = typeId
}

const processImage = async () => {
  if (!currentImage.value) {
    ElMessage.warning('请先上传照片')
    return
  }

  isProcessing.value = true
  try {
    // TODO: 实现实际的图片处理逻辑
    // 1. 使用 AI 模型进行人像分割
    // 2. 生成透明背景
    // 3. 调整尺寸
    await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟处理过程
    processedImageUrl.value = currentImage.value // 临时使用原图
    ElMessage.success('处理完成')
  } catch (error) {
    ElMessage.error('处理失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

const downloadImage = () => {
  if (!processedImageUrl.value) return

  const link = document.createElement('a')
  link.href = processedImageUrl.value
  link.download = 'photo_transparent_' + new Date().getTime() + '.png'
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

.transparent-bg {
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  background-color: #ffffff;
}
</style>
