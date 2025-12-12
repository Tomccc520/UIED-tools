<!--
 * @file TextToPdf.vue
 * @description 文本转PDF工具组件，支持将文本内容转换为PDF文档
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-30
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
          <!-- 左侧编辑区域 -->
          <div class="flex-1 flex flex-col gap-4">
            <!-- 工具栏 -->
            <div class="flex flex-wrap gap-2 items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div class="flex gap-2">
                <button @click="triggerFileInput" class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center">
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  导入TXT
                </button>
                <input ref="fileInputRef" type="file" accept=".txt" class="hidden" @change="handleFileInputChange" />
                <button @click="clearText" class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-red-500 hover:text-red-600">
                  清空
                </button>
              </div>
              <div class="text-sm text-gray-500">
                {{ textContent.length }} 字
              </div>
            </div>

            <!-- 输入框 -->
            <textarea
              v-model="textContent"
              class="w-full h-[400px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
              placeholder="请输入或粘贴文本内容..."
            ></textarea>
          </div>

          <!-- 右侧设置与预览 -->
          <div class="w-full lg:w-80 flex flex-col gap-6">
            <div class="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 class="font-medium text-gray-900 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                PDF设置
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">页面尺寸</label>
                  <select v-model="settings.pageSize" class="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-blue-500 focus:ring-blue-500">
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">字体大小 ({{ settings.fontSize }}px)</label>
                  <el-slider v-model="settings.fontSize" :min="10" :max="36" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">行高 ({{ settings.lineHeight }})</label>
                  <el-slider v-model="settings.lineHeight" :min="1" :max="3" :step="0.1" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">页边距 ({{ settings.margin }}mm)</label>
                  <el-slider v-model="settings.margin" :min="0" :max="50" />
                </div>
              </div>

              <div class="mt-6 pt-6 border-t border-gray-200">
                <button @click="generatePDF" :disabled="!textContent || generating"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg v-if="generating" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ generating ? '生成中...' : '生成PDF' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 隐藏的预览区域，用于生成PDF -->
        <div class="fixed left-[-9999px] top-0">
          <div ref="previewRef" class="bg-white text-black break-words whitespace-pre-wrap"
            :style="{
              width: getPageWidth + 'mm',
              padding: settings.margin + 'mm',
              fontSize: settings.fontSize + 'px',
              lineHeight: settings.lineHeight,
              fontFamily: 'SimSun, Arial, sans-serif'
            }">
            {{ textContent }}
          </div>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="feature in features" :key="feature.title" class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 flex-shrink-0">
                <span v-html="feature.icon"></span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">{{ feature.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />

      <!-- 使用说明 -->
      <UsageGuide :steps="guideSteps" :notes="guideNotes" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()

const info = reactive({
  title: "在线文本转PDF工具",
  subtitle: "将文本内容快速转换为PDF文档，支持自定义排版设置"
})

const textContent = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const previewRef = ref<HTMLElement | null>(null)
const generating = ref(false)

const settings = reactive({
  pageSize: 'a4',
  fontSize: 14,
  lineHeight: 1.5,
  margin: 20
})

const getPageWidth = computed(() => {
  return settings.pageSize === 'a4' ? 210 : 215.9 // A4 vs Letter width in mm
})

const features = [
  {
    title: '简单易用',
    desc: '直接输入或粘贴文本，或导入TXT文件，一键生成PDF',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>`
  },
  {
    title: '自定义排版',
    desc: '支持调整字体大小、行高、页边距等设置，满足不同需求',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>`
  },
  {
    title: '本地处理',
    desc: '所有转换在浏览器本地完成，保护您的隐私安全',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>`
  }
]

const guideSteps = [
  { title: '输入文本', description: '在输入框中输入文本，或点击“导入TXT”上传文本文件。' },
  { title: '调整设置', description: '设置字体大小、行高、页边距等参数。' },
  { title: '生成下载', description: '点击“生成PDF”按钮，等待处理完成后下载文件。' }
]

const guideNotes = [
  '支持中文内容，生成PDF为图片格式，确保在任何设备上显示一致。',
  '建议文本长度适中，过长的文本可能会导致生成时间较长。'
]

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    textContent.value = e.target?.result as string
  }
  reader.readAsText(file)
  input.value = ''
}

const clearText = () => {
  textContent.value = ''
}

const generatePDF = async () => {
  if (!textContent.value || !previewRef.value) return

  generating.value = true
  try {
    const element = previewRef.value
    const canvas = await html2canvas(element, {
      scale: 2, // 提高清晰度
      useCORS: true
    })

    const contentWidth = canvas.width
    const contentHeight = canvas.height

    // A4尺寸 [595.28, 841.89]
    const pdfPageWidth = settings.pageSize === 'a4' ? 595.28 : 612 // A4 or Letter points
    const pdfPageHeight = settings.pageSize === 'a4' ? 841.89 : 792
    
    const pageHeight = contentWidth / pdfPageWidth * pdfPageHeight
    let leftHeight = contentHeight
    let position = 0
    const imgWidth = pdfPageWidth
    const imgHeight = pdfPageWidth / contentWidth * contentHeight

    const pdf = new jsPDF(settings.pageSize === 'a4' ? 'p' : 'p', 'pt', settings.pageSize)

    if (leftHeight < pageHeight) {
      pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, imgWidth, imgHeight)
    } else {
      while (leftHeight > 0) {
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight)
        leftHeight -= pageHeight
        position -= 841.89 // Use calculated page height
        if (leftHeight > 0) {
          pdf.addPage()
        }
      }
    }

    pdf.save('text_converted.pdf')
    ElMessage.success('PDF生成成功')
  } catch (error) {
    console.error('PDF生成失败:', error)
    ElMessage.error('PDF生成失败，请重试')
  } finally {
    generating.value = false
  }
}
</script>
