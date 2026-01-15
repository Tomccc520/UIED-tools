<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-10 relative">
          <div class="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div class="w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
            <div class="w-64 h-64 bg-indigo-400 rounded-full blur-3xl -ml-20"></div>
          </div>
          <h2
            class="text-4xl font-bold mb-4 relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            AI OKR 制定
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">
            智能协助制定目标与关键结果（OKR），确保目标聚焦且可衡量，提升团队执行力
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- 左侧配置区 -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </span>
                目标配置
              </h3>

              <div class="space-y-5">
                <!-- 周期 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">周期</label>
                  <el-select v-model="form.period" placeholder="选择周期" class="w-full custom-select" size="large">
                    <el-option label="年度 OKR" value="annual" />
                    <el-option label="第一季度 (Q1)" value="q1" />
                    <el-option label="第二季度 (Q2)" value="q2" />
                    <el-option label="第三季度 (Q3)" value="q3" />
                    <el-option label="第四季度 (Q4)" value="q4" />
                    <el-option label="月度 OKR" value="monthly" />
                    <el-option label="项目 OKR" value="project" />
                  </el-select>
                </div>

                <!-- 角色/部门 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">角色/部门</label>
                  <el-input v-model="form.role" placeholder="请输入您的职位或所属部门" size="large" class="custom-input" />
                </div>

                <!-- 目标 (O) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">目标 (Objective) <span
                      class="text-red-500">*</span></label>
                  <el-input v-model="form.objective" type="textarea" :rows="4"
                    placeholder="请输入您想要实现的目标，如：提升产品用户体验，增加市场份额..." class="custom-input" resize="none" />
                </div>

                <div class="pt-4">
                  <button @click="generateContent" :disabled="isGenerating"
                    class="group w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform active:scale-[0.98]">
                    <span v-if="!isGenerating" class="flex items-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      生成 OKR
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
                      正在制定...
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧预览区 -->
          <div class="lg:col-span-8">
            <div class="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[900px] bg-white shadow-sm">
              <div class="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <ChartBarIcon class="w-5 h-5" />
                  </div>
                  <h3 class="font-medium text-gray-700">OKR 预览</h3>
                </div>

                <div class="flex items-center gap-2">
                  <button v-if="resultText" @click="copyContent"
                    class="px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center">
                    <ClipboardIcon class="w-4 h-4 mr-1.5" />
                    复制内容
                  </button>
                  <button v-if="resultText" @click="downloadMarkdown"
                    class="px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center">
                    <ArrowDownTrayIcon class="w-4 h-4 mr-1.5" />
                    下载
                  </button>
                  <button v-if="resultText" @click="resultText = ''"
                    class="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center">
                    <TrashIcon class="w-4 h-4 mr-1.5" />
                    清空
                  </button>
                </div>
              </div>

              <!-- AI 辅助工具栏 -->
              <div class="px-3 py-2 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-2">
                <button @click="handleAiAssist('refine')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <SparklesIcon class="w-3.5 h-3.5 mr-1.5" />
                  优化目标
                </button>
                <button @click="handleAiAssist('expand')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <ListBulletIcon class="w-3.5 h-3.5 mr-1.5" />
                  拆解计划
                </button>
                <button @click="handleAiAssist('evaluate')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <ChartPieIcon class="w-3.5 h-3.5 mr-1.5" />
                  评估风险
                </button>
              </div>

              <!-- 编辑器区域 -->
              <div class="flex-1 relative bg-white min-h-0">
                <v-md-editor v-model="resultText" height="100%" :mode="mode" placeholder="AI生成的OKR将在这里显示..."
                  :disabled-menus="[]" @save="save"></v-md-editor>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            使用说明
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">1. 设定目标</h4>
              <p>输入您想要实现的定性目标（Objective），无需过于具体，保持方向性。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">2. 智能拆解</h4>
              <p>系统会自动生成符合 SMART 原则的关键结果（Key Results）和行动建议。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">3. 持续优化</h4>
              <p>利用"优化目标"、"拆解计划"等功能，将 OKR 转化为具体的执行方案。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import {
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  ClipboardIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  SparklesIcon,
  InformationCircleIcon,
  ListBulletIcon,
  ChartPieIcon
} from '@heroicons/vue/24/outline'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { generateAIWriting } from '@/services/ai'

const route = useRoute()
const mode = ref<'editable' | 'preview' | 'edit'>('editable')
const isGenerating = ref(false)
const resultText = ref('')

const form = reactive({
  period: '',
  role: '',
  objective: ''
})

const getPeriodLabel = (period: string) => {
  const map: Record<string, string> = {
    annual: '年度',
    q1: '第一季度',
    q2: '第二季度',
    q3: '第三季度',
    q4: '第四季度',
    monthly: '月度',
    project: '项目'
  }
  return map[period] || ''
}

const generateContent = async () => {
  if (!form.objective) {
    ElMessage.warning('请输入目标(O)')
    return
  }

  try {
    isGenerating.value = true
    resultText.value = ''

    const periodLabel = getPeriodLabel(form.period)

    const prompt = `请协助我制定一份OKR（目标与关键结果）。
${periodLabel ? `周期：${periodLabel}` : ''}
${form.role ? `角色/部门：${form.role}` : ''}
目标 (Objective)：${form.objective}

要求：
1. 对目标 (O) 进行润色，使其更具鼓舞性和方向性。
2. 制定 3-5 个关键结果 (KR) 来衡量目标的达成。
3. KR 必须符合 SMART 原则（具体的、可衡量的、可实现的、相关的、有时间限制的）。
4. 给出具体的行动建议或实现路径。
5. 标题请使用 Markdown 三级标题格式（### 标题），严禁在标题行使用 ** 加粗符号。`

    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个OKR专家，擅长制定清晰、有力且可执行的目标管理方案。',
      temperature: 0.6
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

  let prompt = ''
  let systemPrompt = ''

  switch (type) {
    case 'refine':
      prompt = `请优化上述OKR，使其更具挑战性且符合SMART原则，语言更具鼓舞性。

      当前OKR内容：
      ${resultText.value}`
      systemPrompt = '你是一个严谨的OKR教练。'
      break
    case 'expand':
      prompt = `请将上述OKR拆解为具体的周/月执行计划，明确每个阶段的里程碑。

      当前OKR内容：
      ${resultText.value}`
      systemPrompt = '你是一个项目管理专家，擅长制定执行计划。'
      break
    case 'evaluate':
      prompt = `请评估上述OKR的可行性和潜在风险，并给出具体的改进建议。

      当前OKR内容：
      ${resultText.value}`
      systemPrompt = '你是一个战略咨询顾问，擅长风险评估。'
      break
  }

  try {
    isGenerating.value = true
    const originalText = resultText.value
    resultText.value = ''

    await generateAIWriting({
      prompt,
      systemPrompt,
      temperature: 0.6
    }, (content) => {
      resultText.value += content
    })

    ElMessage.success('优化完成')
  } catch (error) {
    // resultText.value = originalText
    ElMessage.error('操作失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

const copyContent = async () => {
  if (!resultText.value) return
  try {
    await navigator.clipboard.writeText(resultText.value)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const downloadMarkdown = () => {
  if (!resultText.value) return
  const blob = new Blob([resultText.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `OKR-${form.period || '方案'}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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
