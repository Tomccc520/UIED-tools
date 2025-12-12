<!--
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
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
          <!-- 推荐链接 -->
          <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm">
            <a href="https://ai.feishu.cn/wiki/CIktwhQHni3FLwkllYac6Bm2ndb?from=from_copylink" target="_blank"
              class="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              每日免费分享最新AI资讯
            </a>
            <a href="https://www.uied.cn/" target="_blank"
              class="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              AI学习平台
            </a>
            <a href="https://uiedtool.com" target="_blank"
              class="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              AI免费工具uiedtool.com
            </a>
            <a href="https://hot.uied.cn" target="_blank"
              class="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              AI资讯热榜hot.uied.cn
            </a>
            <a href="https://hao.uied.cn/ai" target="_blank"
              class="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              AI工具导航
            </a>
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
                    <!-- Preview Image if available -->
                    <img v-if="previewUrl" :src="previewUrl" class="max-h-64 object-contain rounded-lg" />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none"
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
                <el-input v-model="imageUrl" placeholder="请输入图片URL地址" class="w-full" @input="handleUrlInput" />
              </div>

              <!-- 参数设置 -->
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">反推模型</label>
                  <el-select v-model="params.type" class="w-full">
                    <el-option label="通用 (Normal)" value="normal" />
                  </el-select>
                </div>
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
                    <span>开始反推</span>
                  </template>
                  <template v-else>
                    <span>反推中...</span>
                  </template>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 识别结果 -->
          <div v-if="recognitionResult"
            class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div class="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div class="flex items-center gap-3">
                <span class="text-gray-700 font-medium">提示词结果</span>
                <span class="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600 font-medium capitalize">{{
                  params.type
                }}</span>
              </div>
              <el-button type="primary" link size="small" @click="copyResult">
                <div class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>复制结果</span>
                </div>
              </el-button>
            </div>
            <div class="p-6 bg-white">
              <div class="relative group">
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap text-justify font-mono text-sm">{{
                  recognitionResult
                }}</p>
                <div class="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <el-button size="small" @click="copyResult">复制</el-button>
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
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElButton, ElInput, ElSelect, ElOption } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

// 组件配置信息
const info = {
  title: "免费图片提示词反推",
  subtitle: "上传图片，AI智能反推提示词，通用模型精准识别"
}

// 功能特点
const features = [
  {
    title: '通用模型',
    desc: '适用于各种类型的图片反推',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>'
  },
  {
    title: '精准反推',
    desc: '智能分析画面内容，生成精准提示词',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>'
  },
  {
    title: '免费使用',
    desc: '每日免费调用，助力AI创作',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
  },
  {
    title: '简单易用',
    desc: '一键上传，快速生成，复制即用',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>'
  }
]

// 状态变量
const route = useRoute()
const fileInput = ref<HTMLInputElement | null>(null)
const imageUrl = ref('')
const previewUrl = ref('')
const recognizing = ref(false)
const recognitionResult = ref('')
const selectedFile = ref<File | null>(null)

const params = reactive({
  type: 'normal',
  lang: 'zh-CN'
})

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    selectedFile.value = file
    imageUrl.value = '' // 清空URL输入

    // 生成预览
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 处理URL输入
const handleUrlInput = () => {
  if (imageUrl.value) {
    selectedFile.value = null
    previewUrl.value = imageUrl.value
  }
}

// 开始识别
const startRecognition = async () => {
  if (!selectedFile.value && !imageUrl.value) {
    ElMessage.warning('请上传图片或输入图片URL')
    return
  }

  try {
    recognizing.value = true
    const formData = new FormData()

    formData.append('type', params.type)
    formData.append('lang', params.lang)

    if (selectedFile.value) {
      formData.append('image', selectedFile.value)
    } else {
      // 如果是URL，API参数也是 image
      formData.append('image', imageUrl.value)
    }

    // API地址
    const apiUrl = 'https://api.pearktrue.cn/api/prompt_image'

    let response;
    // 如果只有URL，优先尝试JSON POST，因为某些后端可能对multipart/form-data里的url字符串处理不一致
    // 但根据用户描述 "JsonPost传入的image链接"，我们尝试JSON
    if (!selectedFile.value && imageUrl.value) {
      response = await axios.post(apiUrl, {
        image: imageUrl.value,
        type: params.type,
        lang: params.lang
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } else {
      response = await axios.post(apiUrl, formData)
    }

    if (response.data.code === 200) {
      // 尝试解析返回的数据
      let resultData = response.data.data;

      // 如果是字符串，尝试解析为JSON
      if (typeof resultData === 'string') {
        try {
          const parsed = JSON.parse(resultData);
          // 如果解析成功且包含prompt字段，则使用prompt字段
          if (parsed && parsed.prompt) {
            recognitionResult.value = parsed.prompt;
          } else {
            // 否则直接显示字符串
            recognitionResult.value = resultData;
          }
        } catch (e) {
          // 解析失败，说明不是JSON字符串，直接显示
          recognitionResult.value = resultData;
        }
      }
      // 如果已经是对象且包含prompt字段
      else if (typeof resultData === 'object' && resultData !== null && resultData.prompt) {
        recognitionResult.value = resultData.prompt;
      }
      // 其他情况直接转字符串
      else {
        recognitionResult.value = typeof resultData === 'object' ? JSON.stringify(resultData) : String(resultData);
      }

      ElMessage.success('反推成功')
    } else {
      throw new Error(response.data.msg || '反推失败')
    }
  } catch (error: any) {
    console.error('反推失败:', error)
    ElMessage.error(error.message || '反推失败，请重试')
  } finally {
    recognizing.value = false
  }
}

// 复制识别结果
const copyResult = () => {
  if (!recognitionResult.value) return

  navigator.clipboard.writeText(recognitionResult.value).then(() => {
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
</style>
