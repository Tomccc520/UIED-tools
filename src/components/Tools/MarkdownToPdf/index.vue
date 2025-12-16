<!--
 * @file MarkdownToPdf.vue
 * @description Markdown转PDF工具组件，支持将Markdown内容转换为PDF文档
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
                  导入MD
                </button>
                <input ref="fileInputRef" type="file" accept=".md,.txt" class="hidden" @change="handleFileInputChange" />
                <button @click="clearText" class="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-red-500 hover:text-red-600">
                  清空
                </button>
              </div>
              <div class="text-sm text-gray-500">
                {{ textContent.length }} 字
              </div>
            </div>

            <!-- 输入框 -->
            <v-md-editor 
              v-model="textContent" 
              height="500px"
              placeholder="请输入或粘贴Markdown内容..."
              :disabled-menus="[]"
              @save="generatePDF"
            ></v-md-editor>
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
          <div ref="previewRef" class="bg-white text-black break-words"
            :style="{
              width: getPageWidth + 'mm',
              padding: settings.margin + 'mm',
            }">
            <!-- 使用 v-md-editor 的预览组件或渲染后的HTML -->
             <div class="markdown-body" v-html="renderedHtml"></div>
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
import { marked } from 'marked'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()

const info = reactive({
  title: "在线Markdown转PDF工具",
  subtitle: "将Markdown文档转换为精美的PDF文件，支持实时预览和自定义设置"
})

const textContent = ref('# 欢迎使用 Markdown 转 PDF 工具\n\n这是一个示例文档。\n\n- 支持 Markdown 语法\n- 支持代码高亮\n- 支持表格和公式\n\n```javascript\nconsole.log("Hello World");\n```')
const fileInputRef = ref<HTMLInputElement | null>(null)
const previewRef = ref<HTMLElement | null>(null)
const generating = ref(false)

const settings = reactive({
  pageSize: 'a4',
  margin: 20
})

const getPageWidth = computed(() => {
  return settings.pageSize === 'a4' ? 210 : 215.9 // A4 vs Letter width in mm
})

const renderedHtml = computed(() => {
  return marked.parse(textContent.value)
})

const features = [
  {
    title: 'Markdown支持',
    desc: '完整支持Markdown标准语法，包括标题、列表、代码块、表格等',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>`
  },
  {
    title: '所见即所得',
    desc: '提供实时预览编辑，支持代码高亮和样式美化',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>`
  },
  {
    title: '本地安全',
    desc: '所有转换在浏览器本地完成，不会上传到服务器，保护您的隐私',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>`
  }
]

const guideSteps = [
  { title: '输入内容', description: '在左侧编辑器中输入Markdown内容，或点击“导入MD”上传文件。' },
  { title: '调整设置', description: '设置PDF页面尺寸和页边距。' },
  { title: '生成下载', description: '点击“生成PDF”按钮，等待处理完成后下载文件。' }
]

const guideNotes = [
  '支持标准Markdown语法和扩展语法。',
  '建议在生成前检查预览效果，确保排版符合预期。'
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

    pdf.save('markdown_converted.pdf')
    ElMessage.success('PDF生成成功')
  } catch (error) {
    console.error('PDF生成失败:', error)
    ElMessage.error('PDF生成失败，请重试')
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
/* 简单的Markdown样式，模拟GitHub风格 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #24292e;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body :deep(h1) {
  font-size: 2em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-body :deep(h2) {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-body :deep(p) {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,0.05);
  border-radius: 3px;
}

.markdown-body :deep(pre) {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
  margin-bottom: 16px;
}

.markdown-body :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 0 0 16px 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 2em;
  margin-bottom: 16px;
}

.markdown-body :deep(table) {
  display: block;
  width: 100%;
  overflow: auto;
  margin-bottom: 16px;
  border-spacing: 0;
  border-collapse: collapse;
}

.markdown-body :deep(table th),
.markdown-body :deep(table td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body :deep(table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

.markdown-body :deep(img) {
  max-width: 100%;
  box-sizing: content-box;
}
</style>