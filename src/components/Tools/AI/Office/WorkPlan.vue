<!--
 * @file WorkPlan.vue
 * @description AI工作方案生成工具
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
            <div class="w-64 h-64 bg-emerald-400 rounded-full blur-3xl -ml-20"></div>
          </div>
          <h2
            class="text-4xl font-bold mb-4 relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-emerald-600">
            AI工作方案
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">智能生成详细的工作实施方案，明确目标、步骤和资源配置</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span class="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mr-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                方案配置
              </h3>

              <div class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">方案主题 <span
                      class="text-red-500">*</span></label>
                  <el-input v-model="form.topic" placeholder="例如：2026年第一季度市场推广方案" size="large" clearable
                    class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">方案类型</label>
                  <el-select v-model="form.type" placeholder="选择方案类型" class="w-full" size="large">
                    <el-option label="通用方案" value="general" />
                    <el-option label="部门计划" value="department" />
                    <el-option label="个人计划" value="personal" />
                    <el-option label="培训方案" value="training" />
                  </el-select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">工作目标</label>
                  <el-input v-model="form.goal" type="textarea" :rows="3" placeholder="希望达成的具体目标..."
                    class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">时间规划</label>
                  <el-input v-model="form.timeline" placeholder="例如：1月-3月，分三个阶段" size="large" class="custom-input" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">资源需求</label>
                  <el-input v-model="form.resources" type="textarea" :rows="2" placeholder="需要的人员、资金或设备支持..."
                    class="custom-input" />
                </div>

                <div class="pt-4">
                  <button @click="generateContent" :disabled="isGenerating || !form.topic"
                    class="group w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40 transform active:scale-[0.98]">
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
                      AI正在规划中...
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
                  细化步骤
                </button>
                <button @click="handleAiAssist('risk')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  风险评估
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
            <li>输入方案主题和目标，AI将生成包含背景、目标、实施步骤、时间表和资源需求的完整方案。</li>
            <li>可进一步细化步骤或进行风险评估。</li>
          </ul>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { generateAIWriting } from '@/services/ai'

const route = useRoute()
const mode = ref<'editable' | 'preview' | 'edit'>('editable')
const form = reactive({
  topic: '',
  type: 'general',
  goal: '',
  timeline: '',
  resources: ''
})

onMounted(() => {
  if (route.query.type) {
    form.type = route.query.type as string
  }
})

const isGenerating = ref(false)
const resultText = ref('')

const generateContent = async () => {
  if (!form.topic) {
    ElMessage.warning('请输入方案主题')
    return
  }

  try {
    isGenerating.value = true
    resultText.value = ''

    const prompt = `请帮我撰写一份详细的${getTypeLabel(form.type)}。
方案主题：${form.topic}
${form.goal ? `工作目标：${form.goal}` : ''}
${form.timeline ? `时间规划：${form.timeline}` : ''}
${form.resources ? `资源需求：${form.resources}` : ''}

要求：
1. 方案结构完整，包含项目背景、工作目标、实施步骤（分阶段）、时间节点、资源配置、预期成果和风险预案。
2. 逻辑严密，可执行性强。
3. 标题请使用 Markdown 三级标题格式（### 标题），严禁在标题行使用 ** 加粗符号。`

    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个专业的项目经理和策划专家。',
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
      prompt = `请对方案中的实施步骤进行细化，增加具体的操作指引和注意事项：\n\n${originalText}`
      break
    case 'risk':
      prompt = `请基于当前方案，补充详细的风险评估和应对措施：\n\n${originalText}`
      break
  }

  try {
    resultText.value = ''
    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个专业的项目经理。'
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

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    general: '工作方案',
    department: '部门计划',
    personal: '个人计划',
    training: '培训方案'
  }
  return map[type] || '工作方案'
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
