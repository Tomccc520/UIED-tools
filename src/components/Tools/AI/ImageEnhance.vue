<!--
 * @file ImageEnhance.vue
 * @description AI图片变清晰工具组件，支持图片清晰度提升
 * @author UIED技术团队
 * @createDate 2024-01-27
 *
 * 功能特性：
 * 1. 支持拖拽和点击上传图片
 * 2. 支持图片预览
 * 3. 一键提升图片清晰度
 * 4. 本地处理，保护隐私
 * 5. 支持下载处理后的图片
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
          <!-- 温馨提示 -->
          <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p class="text-yellow-600 text-sm">
              温馨提示：该功能正在优化中，如遇到问题请稍后再试。目前仅支持1920*1800以下分辨率的图片处理。
            </p>
          </div>
        </div>

        <!-- 上传区域 -->
        <div class="grid grid-cols-1 gap-8">
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div
              class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-gray-50"
              :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'"
              @drop.prevent="handleDrop" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
              <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
              <div class="absolute inset-0 cursor-pointer z-10" @click="triggerFileInput"></div>
              <div class="text-center px-4">
                <div class="w-8 h-8 mb-2 mx-auto">
                  <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片到这里</div>
                <p class="text-xs text-gray-400 mb-1">支持 PNG、JPG、JPEG、GIF 格式</p>
                <p class="text-xs text-gray-400">建议上传清晰度较低的图片以获得更好的效果</p>
              </div>
            </div>
          </div>

          <!-- 预览和处理区域 -->
          <div v-if="imageUrl" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- 左侧：原图预览 -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <div class="mb-4 text-gray-700 font-medium">原始图片</div>
              <div class="border rounded-lg bg-gray-50 p-4 flex items-center justify-center min-h-[300px]">
                <img :src="imageUrl" class="max-w-full max-h-[300px] object-contain" alt="原始图片" />
              </div>
            </div>

            <!-- 右侧：处理后预览 -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <div class="mb-4 flex justify-between items-center">
                <span class="text-gray-700 font-medium">处理后图片</span>
                <span v-if="enhancedImageUrl" class="text-xs text-gray-500">右键图片另存为即可保存</span>
              </div>
              <div class="border rounded-lg bg-gray-50 p-4 flex flex-col items-center justify-center min-h-[300px]">
                <template v-if="enhancedImageUrl">
                  <div class="relative w-full h-full flex justify-center">
                    <img :src="enhancedImageUrl"
                      class="max-w-full max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity duration-200"
                      alt="处理后图片" @error="ElMessage.error('图片加载失败，请刷新页面重试')" @click="downloadImage" />
                  </div>
                  <div class="mt-4 flex gap-2 items-center justify-center w-full">
                    <el-button type="primary"
                      class="!px-8 !py-3 flex items-center gap-2 !bg-blue-500 hover:!bg-blue-600 !text-base"
                      @click="downloadImage">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>打开图片</span>
                    </el-button>
                  </div>
                </template>
                <template v-else>
                  <div class="text-gray-400 text-sm">点击下方按钮开始处理</div>
                </template>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div v-if="imageUrl" class="flex justify-center gap-4 mt-6">
            <el-button type="primary" :loading="processing"
              class="!w-48 !h-12 !text-base !font-medium !bg-blue-500 hover:!bg-blue-600 transition-colors duration-300 flex items-center justify-center gap-2"
              @click="enhanceImage">
              <template v-if="!processing">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>开始处理</span>
              </template>
              <template v-else>
                <span>处理中...</span>
              </template>
            </el-button>
          </div>

          <!-- 功能说明 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">功能说明</div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div v-for="feature in features" :key="feature.title" class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg v-if="feature.icon === 'Upload'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <svg v-else-if="feature.icon === 'AI'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <svg v-else-if="feature.icon === 'Lock'" class="w-5 h-5 text-blue-500" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4" />
                  </svg>
                  <svg v-else-if="feature.icon === 'Download'" class="w-5 h-5 text-blue-500" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ feature.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 常见问题 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="faq in faqItems" :key="faq.q" class="pb-6 border-b border-gray-200 last:pb-0 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ faq.q }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ faq.a }}</p>
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
import { ref, onUnmounted } from 'vue'
import { ElMessage, ElButton } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

// 组件配置信息
const info = {
  title: "AI图片变清晰工具",
  subtitle: "使用AI技术提升图片清晰度，让模糊图片变得清晰"
}

// 常见问题
const faqItems = [
  {
    q: '支持哪些图片格式？',
    a: '支持PNG、JPG、JPEG、GIF等常见图片格式。为了获得最佳效果，建议上传清晰度较低的图片。'
  },
  {
    q: '图片大小和分辨率有限制吗？',
    a: '图片大小不能超过10MB，分辨率不能超过1920*1800像素。如果图片过大，可以先压缩或调整尺寸后再上传。'
  },
  {
    q: '处理后的图片会保存多久？',
    a: '处理后的图片链接有效期为24小时，请及时下载保存。'
  },
  {
    q: '为什么有些图片处理效果不明显？',
    a: '处理效果与原图质量、清晰度、分辨率等因素有关。如果原图已经比较清晰，提升效果可能不会很明显。'
  },
  {
    q: '图片会上传到服务器吗？',
    a: '是的，图片需要上传到服务器进行AI处理，但我们承诺不会保存您的原始图片，处理完成后会立即删除。'
  }
]

// 功能特点
const features = [
  {
    title: '便捷上传',
    desc: '支持拖拽和点击上传图片',
    icon: 'Upload'
  },
  {
    title: 'AI处理',
    desc: '使用先进的AI技术提升清晰度',
    icon: 'AI'
  },
  {
    title: '隐私保护',
    desc: '图片处理完即删除，保护隐私',
    icon: 'Lock'
  },
  {
    title: '免费下载',
    desc: '处理后的图片可免费下载',
    icon: 'Download'
  }
]

// 状态管理
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const imageUrl = ref('')
const enhancedImageUrl = ref('')
const processing = ref(false)

// 获取当前路由
const route = useRoute()

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件变化
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 检查文件大小限制
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过10MB')
    return
  }

  // 检查图片分辨率
  const checkImageResolution = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        resolve(img.width <= 1920 && img.height <= 1800)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  // 检查分辨率
  const isValidResolution = await checkImageResolution(file)
  if (!isValidResolution) {
    ElMessage.error('图片分辨率过大，请上传不超过1920*1800的图片')
    return
  }

  // 创建预览URL
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
    enhancedImageUrl.value = ''
  }
  reader.readAsDataURL(file)
}

// 处理拖拽
const handleDrop = async (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (!files?.length) return

  const file = files[0]
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  const input = fileInputRef.value
  if (input) {
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    input.files = dataTransfer.files
    await handleFileChange({ target: input } as unknown as Event)
  }
}

// 增强图片
const enhanceImage = async () => {
  if (!imageUrl.value) {
    ElMessage.error('请先上传图片')
    return
  }

  try {
    processing.value = true

    // 准备表单数据
    const formData = new FormData()
    // 从 base64 转换为 blob
    const base64Data = imageUrl.value.split(',')[1]
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'image/jpeg' })
    formData.append('file', blob)

    // 调用API
    const result = await axios.post('https://api.pearktrue.cn/api/imagedistinct/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (result.data.code === 200) {
      // 直接使用返回的图片URL
      enhancedImageUrl.value = result.data.image_url
      ElMessage.success('图片处理成功，点击图片可放大预览')
    } else {
      ElMessage.error(result.data.msg || '图片处理失败，请重试')
    }
  } catch (error: any) {
    console.error('处理图片时出错:', error)
    ElMessage.error(error.response?.data?.msg || '处理图片时出错，请重试')
  } finally {
    processing.value = false
  }
}

// 下载图片
const downloadImage = () => {
  if (!enhancedImageUrl.value) return
  window.open(enhancedImageUrl.value, '_blank')
}

// 组件卸载时清理 URL
onUnmounted(() => {
  if (enhancedImageUrl.value && enhancedImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(enhancedImageUrl.value)
  }
})
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
</style>
