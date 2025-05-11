<!--
 * @file OCRRecognition.vue
 * @description OCR图像文字识别组件,支持多语言文字识别
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-2-8
 *
 * 功能特性：
 * 1. 支持图片上传和URL输入两种方式
 * 2. 支持多语言文字识别
 * 3. 支持识别结果复制
 * 4. 支持结果分行展示
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
              温馨提示：支持JPG、PNG等常见图片格式，建议上传清晰的图片以获得更好的识别效果。
            </p>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="grid grid-cols-1 gap-8">
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="space-y-6">
              <!-- 图片上传区域 -->
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange" />
                <div class="space-y-4">
                  <div class="flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="text-gray-600">
                    <button class="text-blue-500 hover:text-blue-600" @click="triggerFileInput">点击上传</button>
                    <span class="mx-2">或</span>
                    <span>将图片拖放到此处</span>
                  </div>
                  <div class="text-xs text-gray-500">支持 JPG、PNG 等常见图片格式</div>
                </div>
              </div>

              <!-- 图片URL输入 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">图片URL地址</label>
                <el-input v-model="imageUrl" placeholder="请输入图片URL地址" class="w-full" />
              </div>

              <!-- 识别按钮 -->
              <div class="flex justify-center">
                <el-button type="primary" :loading="recognizing"
                  class="!w-48 !h-12 !text-base !font-medium !bg-blue-500 hover:!bg-blue-600 transition-colors duration-300 flex items-center justify-center gap-2"
                  @click="startRecognition">
                  <template v-if="!recognizing">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>开始识别</span>
                  </template>
                  <template v-else>
                    <span>识别中...</span>
                  </template>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 识别结果 -->
          <div v-if="recognitionResult" class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 flex justify-between items-center">
              <span class="text-gray-700 font-medium">识别结果</span>
              <el-button type="primary" link size="small" @click="copyResult">
                <span class="text-xs">复制结果</span>
              </el-button>
            </div>
            <div class="border rounded-lg bg-gray-50 p-4">
              <div class="space-y-2">
                <div v-for="(line, index) in recognitionResult.TextLine" :key="index"
                  class="text-gray-700 p-2 hover:bg-gray-100 rounded transition-colors">
                  {{ line }}
                </div>
              </div>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">功能说明</div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div v-for="feature in features" :key="feature.title" class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    v-html="feature.icon"></svg>
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
import { ref } from 'vue'
import { ElMessage, ElButton, ElInput } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

// 组件配置信息
const info = {
  title: "OCR图像文字识别",
  subtitle: "支持多语言文字识别,快速提取图片中的文字内容"
}

// 常见问题
const faqItems = [
  {
    q: '支持哪些图片格式？',
    a: '支持JPG、PNG等常见图片格式，建议上传清晰的图片以获得更好的识别效果。'
  },
  {
    q: '识别准确率如何？',
    a: '对于清晰的图片文字，识别准确率较高。但对于模糊、倾斜或特殊字体的文字，可能会影响识别效果。'
  },
  {
    q: '为什么有时会识别失败？',
    a: '可能是由于图片不清晰、网络问题或服务器压力大导致的。建议使用清晰的图片，并在失败时稍后重试。'
  },
  {
    q: '是否支持多语言识别？',
    a: '是的，支持识别多种语言的文字，包括中文、英文等常见语言。'
  }
]

// 功能特点
const features = [
  {
    title: '多种输入',
    desc: '支持图片上传和URL输入',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>'
  },
  {
    title: '多语言支持',
    desc: '支持多种语言文字识别',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>'
  },
  {
    title: '快速识别',
    desc: '高效的文字识别处理',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>'
  },
  {
    title: '结果处理',
    desc: '支持复制和分行展示',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/>'
  }
]

// 状态变量
const route = useRoute()
const fileInput = ref<HTMLInputElement | null>(null)
const imageUrl = ref('')
const recognizing = ref(false)
const recognitionResult = ref<any>(null)

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    // 清空URL输入
    imageUrl.value = ''
    // 开始识别
    startRecognition(file)
  }
}

// 开始识别
const startRecognition = async (file?: File) => {
  if (!file && !imageUrl.value) {
    ElMessage.warning('请上传图片或输入图片URL')
    return
  }

  try {
    recognizing.value = true
    const formData = new FormData()

    if (file) {
      formData.append('file', file)
    } else {
      // 使用URL时，通过JSON发送
      const response = await axios.post('https://api.pearktrue.cn/api/ocr/', {
        file: imageUrl.value
      })

      if (response.data.code === 200) {
        recognitionResult.value = response.data.data
        ElMessage.success('识别成功')
      } else {
        throw new Error(response.data.msg || '识别失败')
      }
      return
    }

    // 上传文件时使用formData
    const response = await axios.post('https://api.pearktrue.cn/api/ocr/', formData)

    if (response.data.code === 200) {
      recognitionResult.value = response.data.data
      ElMessage.success('识别成功')
    } else {
      throw new Error(response.data.msg || '识别失败')
    }
  } catch (error: any) {
    console.error('识别失败:', error)
    ElMessage.error(error.message || '识别失败，请重试')
  } finally {
    recognizing.value = false
  }
}

// 复制识别结果
const copyResult = () => {
  if (!recognitionResult.value) return

  const text = recognitionResult.value.ParsedText
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}
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

/* 自定义输入框样式 */
:deep(.el-textarea__inner) {
  min-height: 60px !important;
}
</style>
