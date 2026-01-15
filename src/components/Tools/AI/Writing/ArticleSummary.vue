<!--
 * @file ArticleSummary.vue
 * @description AI长文/报告摘要生成工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 头部区域 -->
        <div class="text-center mb-10 relative">
          <div class="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div class="w-64 h-64 bg-teal-400 rounded-full blur-3xl"></div>
            <div class="w-64 h-64 bg-emerald-400 rounded-full blur-3xl -ml-20"></div>
          </div>
          <h2
            class="text-4xl font-bold mb-4 relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">
            AI摘要生成
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">智能提炼长文和报告的核心观点，快速生成精准摘要，提高阅读效率</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- 左侧：配置区域 -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </span>
                摘要配置
              </h3>

              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">原文内容 <span
                      class="text-red-500">*</span></label>
                  <el-input v-model="form.sourceContent" type="textarea" :rows="10" placeholder="请粘贴需要提取摘要的文章或报告内容..."
                    class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">摘要长度</label>
                  <el-select v-model="form.length" placeholder="选择摘要长度" class="w-full" size="large">
                    <el-option label="简短概括 (100-200字)" value="short" />
                    <el-option label="标准摘要 (300-500字)" value="medium" />
                    <el-option label="详细综述 (800字以上)" value="long" />
                  </el-select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">摘要形式</label>
                  <el-select v-model="form.format" placeholder="选择摘要形式" class="w-full" size="large">
                    <el-option label="段落式" value="paragraph" />
                    <el-option label="要点列表式" value="bullet" />
                    <el-option label="思维导图式 (层级结构)" value="mindmap" />
                  </el-select>
                </div>

                <div class="pt-4">
                  <button @click="generateContent" :disabled="isGenerating || !form.sourceContent"
                    class="group w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transform active:scale-[0.98]">
                    <span v-if="!isGenerating" class="flex items-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      生成摘要
                    </span>
                    <span v-else class="flex items-center">
                      <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                      AI正在提炼中...
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：生成结果 -->
          <div class="lg:col-span-8">
            <div class="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[900px] bg-white shadow-sm">
              <div class="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 class="font-medium text-gray-700">摘要结果</h3>
                </div>

                <div class="flex items-center gap-2">
                  <button v-if="resultText && mode !== 'preview'" @click="copyResult"
                    class="px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    复制Markdown
                  </button>
                  <button v-if="resultText" @click="copyPreviewHtml"
                    class="px-3 py-1.5 text-sm text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    复制预览样式
                  </button>
                  <button v-if="resultText" @click="clearResult"
                    class="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    清空
                  </button>
                </div>
              </div>

              <!-- AI辅助工具栏 -->
              <div class="px-3 py-2 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-2">
                <button @click="handleAiAssist('simplify')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  更精简点
                </button>
                <button @click="handleAiAssist('extract_keywords')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  提取关键词
                </button>
              </div>

              <div class="flex-1 relative bg-white min-h-0">
                <v-md-editor v-model="resultText" height="100%" :mode="mode" placeholder="AI生成的摘要将在这里显示..."
                  :disabled-menus="[]" @save="save"></v-md-editor>
              </div>
            </div>
          </div>
        </div>

        <WritingGuide />
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import WritingGuide from './WritingGuide.vue'
import { generateAIWriting } from '@/services/ai'

const route = useRoute()
const mode = ref<'editable' | 'preview' | 'edit'>('editable')
const form = reactive({
  sourceContent: '',
  length: 'medium',
  format: 'paragraph'
})

const isGenerating = ref(false)
const resultText = ref('')

/**
 * 生成内容
 */
const generateContent = async () => {
  if (!form.sourceContent) {
    ElMessage.warning('请输入原文内容')
    return
  }

  try {
    isGenerating.value = true
    resultText.value = ''

    // 构建提示词
    const prompt = `请帮我为以下内容生成一份摘要。
摘要长度：${getLengthLabel(form.length)}
摘要形式：${getFormatLabel(form.format)}

原文内容：
${form.sourceContent}

要求：
1. 准确提炼原文的核心观点、主要论据和结论。
2. 语言简练，逻辑清晰，客观中立。
3. 去除冗余信息和修饰性文字。
4. 如果是段落式，要求连贯通顺；如果是列表式，要求要点突出。
5. 请使用Markdown格式输出。
6. 标题请使用 Markdown 三级标题格式（### 标题），严禁在标题行使用 ** 加粗符号`

    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个高效的信息提炼专家，擅长快速抓住文章重点并生成高质量摘要。',
      temperature: 0.5 // 摘要需要准确性，降低随机性
    }, (content) => {
      resultText.value += content
    })

    ElMessage.success('生成完成')
  } catch (error) {
    console.error('生成失败:', error)
    ElMessage.error('生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

/**
 * AI辅助编辑
 */
const handleAiAssist = async (type: string) => {
  if (!resultText.value) return

  isGenerating.value = true
  const originalText = resultText.value
  let prompt = ''

  switch (type) {
    case 'simplify':
      prompt = `请将以下摘要进一步精简，保留最核心的骨干信息，字数减少30%：\n\n${originalText}`
      break
    case 'extract_keywords':
      prompt = `请从以下内容中提取 5-8 个核心关键词，并给出简要解释：\n\n${originalText}`
      break
  }

  try {
    if (type === 'extract_keywords') {
      resultText.value += '\n\n---\n\n### 核心关键词\n\n'
    } else {
      resultText.value = ''
    }

    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个信息处理专家。'
    }, (chunk) => {
      resultText.value += chunk
    })
  } catch (error) {
    ElMessage.error('AI助手处理失败，请重试')
    if (type !== 'extract_keywords') {
      resultText.value = originalText
    }
  } finally {
    isGenerating.value = false
  }
}

const getLengthLabel = (val: string) => {
  const map: Record<string, string> = {
    short: '简短概括 (100-200字)',
    medium: '标准摘要 (300-500字)',
    long: '详细综述 (800字以上)'
  }
  return map[val] || '标准摘要'
}

const getFormatLabel = (val: string) => {
  const map: Record<string, string> = {
    paragraph: '段落式',
    bullet: '要点列表式',
    mindmap: '思维导图式'
  }
  return map[val] || '段落式'
}

/**
 * 复制生成结果 (Markdown)
 */
const copyResult = async () => {
  if (!resultText.value) return
  try {
    await navigator.clipboard.writeText(resultText.value)
    ElMessage.success('已复制 Markdown 源码')
  } catch (err) {
    console.error('复制失败', err)
    ElMessage.error('复制失败')
  }
}

/**
 * 复制预览样式 (HTML)
 */
const copyPreviewHtml = async () => {
  if (!resultText.value) return
  try {
    const previewElement = document.querySelector('.vuepress-markdown-body')
    if (previewElement) {
      const htmlContent = previewElement.innerHTML
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const textBlob = new Blob([resultText.value], { type: 'text/plain' })
      const data = [new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob
      })]
      await navigator.clipboard.write(data)
      ElMessage.success('已复制预览样式内容')
    } else {
      ElMessage.warning('未找到预览内容，请切换到预览模式')
    }
  } catch (err) {
    console.error('复制失败', err)
    ElMessage.error('复制预览内容失败')
  }
}

/**
 * 清空生成结果
 */
const clearResult = () => {
  resultText.value = ''
  isGenerating.value = false
}

/**
 * 保存编辑器内容
 */
const save = (text: string, html: string) => {
  console.log('save', text, html)
}
</script>

<style scoped>
.custom-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
  padding: 8px 12px;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #2563eb inset;
}

:deep(.v-md-editor) {
  box-shadow: none;
  border: none;
}

:deep(.v-md-editor__toolbar) {
  border-bottom: 1px solid #f3f4f6;
  background-color: #f9fafb;
}

:deep(.vuepress-markdown-body) {
  font-size: 14px;
  padding: 20px;
}

:deep(.v-md-textarea-editor pre),
:deep(.v-md-textarea-editor textarea) {
  font-size: 14px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
