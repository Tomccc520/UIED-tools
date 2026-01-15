<!--
 * @file ResumeCreation.vue
 * @description AI简历制作工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-16
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
            AI简历制作
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">智能生成专业简历，优化工作经历和技能描述，提升求职成功率</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- 左侧：配置区域 -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                简历信息
              </h3>

              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">求职意向 <span
                      class="text-red-500">*</span></label>
                  <el-input v-model="form.intention" placeholder="例如：高级前端工程师" size="large" clearable
                    class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">工作经验 (简述)</label>
                  <el-input v-model="form.experience" type="textarea" :rows="4"
                    placeholder="简要描述您的工作经历，AI将为您润色优化..." class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">教育背景</label>
                  <el-input v-model="form.education" type="textarea" :rows="2" placeholder="学校、专业、学历..."
                    class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">核心技能</label>
                  <el-input v-model="form.skills" type="textarea" :rows="2" placeholder="列出您的主要技能..."
                    class="custom-input" />
                </div>

                <div class="pt-4">
                  <button @click="generateContent" :disabled="isGenerating || !form.intention"
                    class="group w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform active:scale-[0.98]">
                    <span v-if="!isGenerating" class="flex items-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      生成简历
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
                      AI正在制作中...
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
                  <h3 class="font-medium text-gray-700">简历内容</h3>
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
                <button @click="handleAiAssist('optimize')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  优化经历
                </button>
                <button @click="handleAiAssist('expand')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  丰富细节
                </button>
                <button @click="handleAiAssist('polish')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  润色
                </button>
              </div>

              <div class="flex-1 relative bg-white min-h-0">
                <v-md-editor v-model="resultText" height="100%" :mode="mode" placeholder="AI生成的简历将在这里显示..."
                  :disabled-menus="[]" @save="save"></v-md-editor>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">使用说明</h3>
            <ul class="space-y-2 list-disc list-inside text-gray-600 text-sm">
                <li>输入您的求职意向和现有经历，AI将自动生成专业的简历内容。</li>
                <li>支持一键优化工作经历，突出业绩和亮点。</li>
                <li>生成的简历采用标准Markdown格式，可直接导出或复制使用。</li>
            </ul>
        </div>
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
import { generateAIWriting } from '@/services/ai'

const route = useRoute()
const mode = ref<'editable' | 'preview' | 'edit'>('editable')
const form = reactive({
  intention: '',
  experience: '',
  education: '',
  skills: ''
})

const isGenerating = ref(false)
const resultText = ref('')

const generateContent = async () => {
  if (!form.intention) {
    ElMessage.warning('请输入求职意向')
    return
  }

  try {
    isGenerating.value = true
    resultText.value = ''

    const prompt = `请帮我制作一份专业的求职简历。
求职意向：${form.intention}
${form.experience ? `工作经历：${form.experience}` : ''}
${form.education ? `教育背景：${form.education}` : ''}
${form.skills ? `技能专长：${form.skills}` : ''}

要求：
1. 简历结构清晰，包含基本信息（占位）、个人优势、工作经历、项目经验、教育背景等板块。
2. 重点优化工作经历，使用STAR法则（情境、任务、行动、结果）描述，突出业绩和数据。
3. 语言专业简练，符合HR筛选标准。
4. 针对${form.intention}岗位进行关键词优化。
5. 标题请使用 Markdown 三级标题格式（### 标题），严禁在标题行使用 ** 加粗符号。`

    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个资深的职业规划师和简历优化专家。',
      temperature: 0.7
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

const handleAiAssist = async (type: string) => {
  if (!resultText.value) return

  isGenerating.value = true
  const originalText = resultText.value
  let prompt = ''

  switch (type) {
    case 'optimize':
      prompt = `请对简历中的工作经历部分进行深度优化，使其更具说服力，突出职业亮点：\n\n${originalText}`
      break
    case 'expand':
      prompt = `请丰富简历细节，增加专业术语和具体案例描述：\n\n${originalText}`
      break
    case 'polish':
      prompt = `请对简历进行整体润色，使其语言更专业、流畅：\n\n${originalText}`
      break
  }

  try {
    resultText.value = ''
    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个资深的职业规划师。'
    }, (chunk) => {
      resultText.value += chunk
    })
  } catch (error) {
    ElMessage.error('AI助手处理失败，请重试')
    resultText.value = originalText
  } finally {
    isGenerating.value = false
  }
}

const copyResult = async () => {
  if (!resultText.value) return
  try {
    await navigator.clipboard.writeText(resultText.value)
    ElMessage.success('已复制 Markdown 源码')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

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
    }
  } catch (err) {
    ElMessage.error('复制预览内容失败')
  }
}

const clearResult = () => {
  resultText.value = ''
  isGenerating.value = false
}

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
