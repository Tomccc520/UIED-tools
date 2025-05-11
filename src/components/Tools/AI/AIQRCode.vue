<!--
 * @file AIQRCode.vue
 * @description AI艺术二维码生成工具组件
 * @author UIED技术团队
 * @createDate 2024-01-27
 *
 * 功能特性：
 * 1. 支持输入链接和提示词生成艺术二维码
 * 2. 提供丰富的提示词选择
 * 3. 支持图片预览和下载
 * 4. 提供详细的使用说明
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
              温馨提示：该功能正在优化中，如遇到问题请稍后再试。生成二维码可能需要一些时间，请耐心等待。
            </p>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="grid grid-cols-1 gap-8">
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="space-y-6">
              <!-- 链接输入 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">链接地址</label>
                <el-input v-model="url" placeholder="请输入需要生成二维码的链接地址" class="w-full" />
              </div>

              <!-- 提示词输入 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">提示词 (Prompt)</label>
                <el-input v-model="prompt" type="textarea" :rows="2" placeholder="请输入提示词，例如：草原、星空等" class="w-full" />

                <!-- 基础提示词选择 -->
                <div class="mt-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium text-gray-700">快速添加提示词</div>
                    <el-button type="primary" link size="small" @click="clearPrompt">
                      <span class="text-xs">清空提示词</span>
                    </el-button>
                  </div>

                  <!-- 提示词分类标签页 -->
                  <el-tabs>
                    <!-- 场景主题 -->
                    <el-tab-pane label="场景主题">
                      <div class="flex flex-wrap gap-2">
                        <el-button v-for="item in sceneStyles" :key="item.text" size="small"
                          :type="isPromptSelected(item.prompt) ? 'primary' : 'default'"
                          class="!text-xs !px-3 !py-1 !rounded-full hover:!bg-blue-50"
                          @click="appendPrompt(item.prompt)">
                          {{ item.text }}
                        </el-button>
                      </div>
                    </el-tab-pane>

                    <!-- 艺术风格 -->
                    <el-tab-pane label="艺术风格">
                      <div class="flex flex-wrap gap-2">
                        <el-button v-for="style in artStyles" :key="style.text" size="small"
                          :type="isPromptSelected(style.prompt) ? 'primary' : 'default'"
                          class="!text-xs !px-3 !py-1 !rounded-full hover:!bg-blue-50"
                          @click="appendPrompt(style.prompt)">
                          {{ style.text }}
                        </el-button>
                      </div>
                    </el-tab-pane>

                    <!-- 色彩风格 -->
                    <el-tab-pane label="色彩风格">
                      <div class="flex flex-wrap gap-2">
                        <el-button v-for="color in colorStyles" :key="color.text" size="small"
                          :type="isPromptSelected(color.prompt) ? 'primary' : 'default'"
                          class="!text-xs !px-3 !py-1 !rounded-full hover:!bg-blue-50"
                          @click="appendPrompt(color.prompt)">
                          {{ color.text }}
                        </el-button>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>
                <div class="mt-4 flex items-center gap-2">
                  <div class="text-xs text-gray-500">当前提示词：</div>
                  <div class="text-xs text-blue-500 flex-1">{{ prompt || '暂无提示词' }}</div>
                </div>
              </div>

              <!-- 生成按钮 -->
              <div class="flex justify-center">
                <el-button type="primary" :loading="generating"
                  class="!w-48 !h-12 !text-base !font-medium !bg-blue-500 hover:!bg-blue-600 transition-colors duration-300 flex items-center justify-center gap-2"
                  @click="generateQRCode">
                  <template v-if="!generating">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span>开始生成</span>
                  </template>
                  <template v-else>
                    <span>生成中...</span>
                  </template>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 预览区域 -->
          <div v-if="generatedImageUrl" class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 flex justify-between items-center">
              <span class="text-gray-700 font-medium">生成结果</span>
              <span class="text-xs text-gray-500">右键图片另存为即可保存</span>
            </div>
            <div class="border rounded-lg bg-gray-50 p-4 flex flex-col items-center justify-center min-h-[300px]">
              <div class="relative w-full h-full flex justify-center">
                <img :src="generatedImageUrl"
                  class="max-w-full max-h-[300px] object-contain cursor-pointer hover:opacity-90 transition-opacity duration-200"
                  alt="生成的二维码" @error="ElMessage.error('图片加载失败，请重试')" @click="openImage" />
              </div>
              <div class="mt-4 flex gap-2 items-center justify-center w-full">
                <el-button type="primary"
                  class="!px-8 !py-3 flex items-center gap-2 !bg-blue-500 hover:!bg-blue-600 !text-base"
                  @click="openImage">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>打开图片</span>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">功能说明</div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div v-for="feature in features" :key="feature.title" class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg v-if="feature.icon === 'Link'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <svg v-else-if="feature.icon === 'AI'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <svg v-else-if="feature.icon === 'QRCode'" class="w-5 h-5 text-blue-500" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
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
import { ref } from 'vue'
import { ElMessage, ElButton, ElInput } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

// 组件配置信息
const info = {
  title: "AI艺术二维码生成",
  subtitle: "使用AI技术，将普通二维码转换为艺术作品"
}

// 常见问题
const faqItems = [
  {
    q: '如何获得更好的生成效果？',
    a: '建议使用简短清晰的提示词，可以尝试不同的场景和风格组合。同时确保输入的链接地址正确有效。'
  },
  {
    q: '生成的二维码可以正常扫描吗？',
    a: '可以正常扫描。我们在生成过程中会确保二维码的可识别性，同时兼顾艺术效果。'
  },
  {
    q: '生成二维码需要多长时间？',
    a: '通常需要10-20秒不等，取决于服务器负载情况。如果等待时间过长，可以刷新页面重试。'
  },
  {
    q: '生成的二维码可以商用吗？',
    a: '生成的二维码版权归属需要遵循相关规定。建议在商业用途前仔细阅读使用条款，必要时寻求法律建议。'
  },
  {
    q: '为什么有时会生成失败？',
    a: '可能是由于网络问题、服务器负载过高或提示词不当等原因。建议检查网络连接，稍后重试或修改提示词。'
  }
]

// 功能特点
const features = [
  {
    title: '链接转换',
    desc: '支持任意链接生成二维码',
    icon: 'Link'
  },
  {
    title: 'AI艺术',
    desc: '使用AI技术生成艺术效果',
    icon: 'AI'
  },
  {
    title: '可靠扫描',
    desc: '确保二维码可正常识别',
    icon: 'QRCode'
  },
  {
    title: '便捷保存',
    desc: '生成图片可直接下载',
    icon: 'Download'
  }
]

// 场景主题选项
const sceneStyles = [
  { text: '草原', prompt: '草原' },
  { text: '星空', prompt: '星空' },
  { text: '海洋', prompt: '海洋' },
  { text: '森林', prompt: '森林' },
  { text: '城市', prompt: '城市' },
  { text: '山川', prompt: '山川' },
  { text: '花园', prompt: '花园' },
  { text: '沙漠', prompt: '沙漠' },
  { text: '雪景', prompt: '雪景' },
  { text: '瀑布', prompt: '瀑布' }
]

// 艺术风格选项
const artStyles = [
  { text: '水彩', prompt: '水彩' },
  { text: '油画', prompt: '油画' },
  { text: '素描', prompt: '素描' },
  { text: '水墨', prompt: '水墨' },
  { text: '插画', prompt: '插画' },
  { text: '抽象', prompt: '抽象' },
  { text: '现代', prompt: '现代' },
  { text: '复古', prompt: '复古' },
  { text: '科技', prompt: '科技' },
  { text: '童话', prompt: '童话' }
]

// 色彩风格选项
const colorStyles = [
  { text: '暖色', prompt: '暖色' },
  { text: '冷色', prompt: '冷色' },
  { text: '彩虹', prompt: '彩虹' },
  { text: '黑白', prompt: '黑白' },
  { text: '金属', prompt: '金属' },
  { text: '霓虹', prompt: '霓虹' },
  { text: '渐变', prompt: '渐变' },
  { text: '柔和', prompt: '柔和' },
  { text: '明亮', prompt: '明亮' },
  { text: '暗调', prompt: '暗调' }
]

// 状态管理
const url = ref('')
const prompt = ref('')
const generating = ref(false)
const generatedImageUrl = ref('')

// 获取当前路由
const route = useRoute()

// 检查提示词是否已选择
const isPromptSelected = (checkPrompt: string) => {
  return prompt.value.includes(checkPrompt)
}

// 清空提示词
const clearPrompt = () => {
  prompt.value = ''
}

// 添加提示词方法
const appendPrompt = (newPrompt: string) => {
  if (!prompt.value) {
    prompt.value = newPrompt
  } else {
    prompt.value = `${prompt.value}, ${newPrompt}`
  }
}

// 生成二维码
const generateQRCode = async () => {
  if (!url.value.trim()) {
    ElMessage.error('请输入链接地址')
    return
  }

  if (!prompt.value.trim()) {
    ElMessage.error('请输入提示词')
    return
  }

  try {
    generating.value = true
    const params = {
      prompt: prompt.value.trim(),
      url: url.value.trim()
    }

    const result = await axios.get('https://api.pearktrue.cn/api/aiqrcode/', { params })

    if (result.data.code === 200) {
      generatedImageUrl.value = result.data.imgurl
      ElMessage.success('二维码生成成功')
    } else {
      ElMessage.error(result.data.msg || '生成失败，请重试')
    }
  } catch (error: any) {
    console.error('生成二维码时出错:', error)
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

// 打开图片
const openImage = () => {
  if (!generatedImageUrl.value) return
  window.open(generatedImageUrl.value, '_blank')
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
