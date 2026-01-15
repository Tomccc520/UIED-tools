<!--
 * @file TrainingScheme.vue
 * @description AI培训方案生成工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-16
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-10 relative">
          <div class="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div class="w-64 h-64 bg-teal-400 rounded-full blur-3xl"></div>
            <div class="w-64 h-64 bg-cyan-400 rounded-full blur-3xl -ml-20"></div>
          </div>
          <h2
            class="text-4xl font-bold mb-4 relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600">
            AI培训方案
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">智能生成系统化培训方案，包含课程设计、时间安排和考核评估</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span class="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mr-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                培训配置
              </h3>

              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">培训主题 <span
                      class="text-red-500">*</span></label>
                  <el-input v-model="form.topic" placeholder="例如：新员工入职培训、销售技巧提升" size="large" clearable
                    class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">培训对象</label>
                  <el-input v-model="form.audience" placeholder="例如：全体新员工、销售部门" size="large" class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">培训目标</label>
                  <el-input v-model="form.goal" type="textarea" :rows="3" placeholder="希望通过培训达到的效果..."
                    class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">时间与时长</label>
                  <el-input v-model="form.duration" placeholder="例如：3天，共24课时" size="large" class="custom-input" />
                </div>

                <div class="pt-4">
                  <button @click="generateContent" :disabled="isGenerating || !form.topic"
                    class="group w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transform active:scale-[0.98]">
                    <span v-if="!isGenerating" class="flex items-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      生成方案
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
                      AI正在策划中...
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

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
                  <h3 class="font-medium text-gray-700">方案内容</h3>
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

              <div class="px-3 py-2 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-2">
                <button @click="handleAiAssist('detail')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  细化课程
                </button>
                <button @click="handleAiAssist('assess')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  增加考核
                </button>
              </div>

              <div class="flex-1 relative bg-white min-h-0">
                <v-md-editor v-model="resultText" height="100%" :mode="mode" placeholder="AI生成的方案将在这里显示..."
                  :disabled-menus="[]" @save="save"></v-md-editor>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">使用说明</h3>
            <ul class="space-y-2 list-disc list-inside text-gray-600 text-sm">
                <li>输入培训主题和目标，AI将生成完整的培训实施方案。</li>
                <li>包含培训背景、目标、对象、课程内容、时间安排和考核方式。</li>
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
  topic: '',
  audience: '',
  goal: '',
  duration: ''
})

const isGenerating = ref(false)
const resultText = ref('')

const generateContent = async () => {
  if (!form.topic) {
    ElMessage.warning('请输入培训主题')
    return
  }

  try {
    isGenerating.value = true
    resultText.value = ''

    const prompt = `请帮我设计一份详细的培训方案。
培训主题：${form.topic}
${form.audience ? `培训对象：${form.audience}` : ''}
${form.goal ? `培训目标：${form.goal}` : ''}
${form.duration ? `时间与时长：${form.duration}` : ''}

要求：
1. 方案结构完整，包含背景、目标、对象、内容（模块化）、形式、时间安排、考核评估。
2. 课程设计科学合理，理论与实践结合。
3. 具有可操作性。
4. 标题请使用 Markdown 三级标题格式（### 标题），严禁在标题行使用 ** 加粗符号。`

    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个专业的企业培训师和课程设计师。',
      temperature: 0.7
    }, (content) => {
      resultText.value += content
    })

    ElMessage.success('生成完成')
  } catch (error) {
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
    case 'detail':
      prompt = `请对方案中的课程内容进行细化，增加具体的知识点和教学方法：\n\n${originalText}`
      break
    case 'assess':
      prompt = `请补充详细的考核评估方式和标准，以便检验培训效果：\n\n${originalText}`
      break
  }

  try {
    resultText.value = ''
    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个专业的企业培训师。'
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
