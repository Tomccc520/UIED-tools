<!--
 * @file LiteratureRecommend.vue
 * @description AI文献推荐工具
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
            <div class="w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
            <div class="w-64 h-64 bg-cyan-400 rounded-full blur-3xl -ml-20"></div>
          </div>
          <h2
            class="text-4xl font-bold mb-4 relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
            AI文献推荐
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">智能推荐相关领域的高质量文献，助力学术研究和论文写作</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- 左侧：配置区域 -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                推荐配置
              </h3>

              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">研究领域/主题 <span
                      class="text-red-500">*</span></label>
                  <el-input v-model="form.topic" placeholder="例如：人工智能在医疗领域的应用" size="large" clearable
                    class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">关键词</label>
                  <el-input v-model="form.keywords" placeholder="多个关键词用逗号分隔" size="large" clearable
                    class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">文献类型</label>
                  <el-select v-model="form.type" placeholder="选择文献类型" class="w-full" size="large">
                    <el-option label="中文核心期刊" value="chinese_core" />
                    <el-option label="SCI/SSCI期刊" value="sci" />
                    <el-option label="硕博学位论文" value="thesis" />
                    <el-option label="经典书籍/教材" value="book" />
                    <el-option label="会议论文" value="conference" />
                  </el-select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">年份范围</label>
                  <el-select v-model="form.yearRange" placeholder="选择年份范围" class="w-full" size="large">
                    <el-option label="近3年" value="3" />
                    <el-option label="近5年" value="5" />
                    <el-option label="近10年" value="10" />
                    <el-option label="经典文献(不限年份)" value="all" />
                  </el-select>
                </div>

                <div class="pt-4">
                  <button @click="generateContent" :disabled="isGenerating || !form.topic"
                    class="group w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform active:scale-[0.98]">
                    <span v-if="!isGenerating" class="flex items-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      开始推荐
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
                      AI正在检索分析...
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
                  <h3 class="font-medium text-gray-700">推荐结果</h3>
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
                <button @click="handleAiAssist('expand')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  扩充推荐
                </button>
              </div>

              <div class="flex-1 relative bg-white min-h-0">
                <v-md-editor v-model="resultText" height="100%" :mode="mode" placeholder="AI推荐的文献将在这里显示..."
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
  topic: '',
  keywords: '',
  type: 'chinese_core',
  yearRange: '5'
})

const isGenerating = ref(false)
const resultText = ref('')

/**
 * 生成内容
 * @description 根据用户配置的参数调用AI生成内容
 */
const generateContent = async () => {
  if (!form.topic) {
    ElMessage.warning('请输入研究领域或主题')
    return
  }

  try {
    isGenerating.value = true
    resultText.value = ''

    // 构建提示词
    const prompt = `请为我推荐关于"${form.topic}"${form.keywords ? `（关键词：${form.keywords}）` : ''}的相关文献。
文献类型要求：${getOptionLabel(form.type, typeOptions)}
年份范围要求：${getOptionLabel(form.yearRange, yearOptions)}

要求：
1. 推荐 5-8 篇高质量文献。
2. 每篇文献请包含：标题、作者、年份、来源（期刊/会议/出版社）、摘要/核心观点、推荐理由。
3. 格式清晰，使用 Markdown 列表展示。
4. 如果可能，请包含一些经典的基础文献和最新的前沿文献。
5. 推荐理由要具体，说明该文献在研究领域中的贡献或价值。
6. 标题请使用 Markdown 三级标题格式（### 标题），严禁在标题行使用 ** 加粗符号`

    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个专业的学术顾问，熟悉各领域的经典文献和最新研究进展。',
      temperature: 0.7
    }, (content) => {
      resultText.value += content
    })

    ElMessage.success('推荐完成')
  } catch (error) {
    console.error('生成失败:', error)
    ElMessage.error('生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

/**
 * AI辅助编辑
 * @description 对已生成的内容进行辅助操作
 * @param type 辅助操作类型
 */
const handleAiAssist = async (type: string) => {
  if (!resultText.value) return

  isGenerating.value = true
  const originalText = resultText.value
  let prompt = ''

  switch (type) {
    case 'expand':
      prompt = `请基于以下文献推荐列表，再补充推荐 3-5 篇相关的高质量文献，保持格式一致：\n\n${originalText}`
      break
  }

  try {
    if (type !== 'expand') {
      resultText.value = ''
    } else {
      resultText.value += '\n\n---\n\n### 补充推荐\n\n'
    }

    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个专业的学术顾问。'
    }, (chunk) => {
      resultText.value += chunk
    })
  } catch (error) {
    ElMessage.error('AI助手处理失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

const typeOptions = [
  { label: '中文核心期刊', value: 'chinese_core' },
  { label: 'SCI/SSCI期刊', value: 'sci' },
  { label: '硕博学位论文', value: 'thesis' },
  { label: '经典书籍/教材', value: 'book' },
  { label: '会议论文', value: 'conference' }
]

const yearOptions = [
  { label: '近3年', value: '3' },
  { label: '近5年', value: '5' },
  { label: '近10年', value: '10' },
  { label: '经典文献(不限年份)', value: 'all' }
]

/**
 * 获取选项标签
 */
const getOptionLabel = (value: string, options: any[]) => {
  const option = options.find(opt => opt.value === value)
  return option ? option.label : value
}

/**
 * 复制生成结果 (Markdown)
 * @description 将生成的Markdown源码复制到剪贴板
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
 * @description 将预览区域的HTML内容复制到剪贴板
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
 * @description 清空当前生成的内容并重置状态
 */
const clearResult = () => {
  resultText.value = ''
  isGenerating.value = false
}

/**
 * 保存编辑器内容
 * @param text Markdown文本
 * @param html HTML内容
 */
const save = (text: string, html: string) => {
  console.log('save', text, html)
}
</script>

<style scoped>
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

.custom-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
  padding: 8px 12px;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #2563eb inset;
}

/* 覆盖 v-md-editor 默认样式以匹配设计 */
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
</style>
