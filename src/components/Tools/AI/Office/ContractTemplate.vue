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
            AI合同模版生成
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">
            智能生成各类标准合同模版，条款清晰，专业规范，降低法律风险
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
                合同配置
              </h3>

              <div class="space-y-5">
                <!-- 合同类型 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">合同类型 <span
                      class="text-red-500">*</span></label>
                  <el-select v-model="form.type" placeholder="选择合同类型" class="w-full custom-select" size="large">
                    <el-option label="劳动合同" value="labor" />
                    <el-option label="房屋租赁合同" value="lease" />
                    <el-option label="买卖合同" value="sales" />
                    <el-option label="技术服务合同" value="service" />
                    <el-option label="合作协议" value="cooperation" />
                    <el-option label="保密协议" value="nda" />
                    <el-option label="其他合同" value="other" />
                  </el-select>
                </div>

                <!-- 甲方信息 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">甲方（委托方/出租方等）</label>
                  <el-input v-model="form.partyA" placeholder="请输入甲方名称或个人姓名" size="large" class="custom-input" />
                </div>

                <!-- 乙方信息 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">乙方（受托方/承租方等）</label>
                  <el-input v-model="form.partyB" placeholder="请输入乙方名称或个人姓名" size="large" class="custom-input" />
                </div>

                <!-- 核心条款 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">核心条款/特别约定</label>
                  <el-input v-model="form.terms" type="textarea" :rows="6"
                    placeholder="请输入合同的核心条款，如金额、期限、交付方式、违约责任等特别约定..." class="custom-input" resize="none" />
                </div>

                <div class="pt-4">
                  <button @click="generateContent" :disabled="isGenerating"
                    class="group w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform active:scale-[0.98]">
                    <span v-if="!isGenerating" class="flex items-center">
                      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      生成合同模版
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
                      正在拟定...
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
                    <DocumentTextIcon class="w-5 h-5" />
                  </div>
                  <h3 class="font-medium text-gray-700">合同内容</h3>
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
                <button @click="handleAiAssist('review')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <ShieldCheckIcon class="w-3.5 h-3.5 mr-1.5" />
                  审查风险
                </button>
                <button @click="handleAiAssist('polish')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <SparklesIcon class="w-3.5 h-3.5 mr-1.5" />
                  润色条款
                </button>
                <button @click="handleAiAssist('expand')" :disabled="isGenerating || !resultText"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                  <PlusCircleIcon class="w-3.5 h-3.5 mr-1.5" />
                  补充细节
                </button>
              </div>

              <!-- 编辑器区域 -->
              <div class="flex-1 relative bg-white min-h-0">
                <v-md-editor v-model="resultText" height="100%" :mode="mode" placeholder="AI生成的合同将在这里显示..."
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
              <h4 class="font-medium text-gray-900">1. 选择类型</h4>
              <p>根据需求选择合适的合同类型，系统会自动匹配相应的合同结构和条款。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">2. 填写信息</h4>
              <p>完善甲乙双方信息及核心条款，信息越详细，生成的合同越规范。</p>
            </div>
            <div class="space-y-2">
              <h4 class="font-medium text-gray-900">3. AI 优化</h4>
              <p>生成后可使用"审查风险"、"润色条款"等功能进一步完善合同内容。</p>
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
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  ClipboardIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  SparklesIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  PlusCircleIcon
} from '@heroicons/vue/24/outline'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { generateAIWriting } from '@/services/ai'

const route = useRoute()
const mode = ref<'editable' | 'preview' | 'edit'>('editable')
const isGenerating = ref(false)
const resultText = ref('')

const form = reactive({
  type: '',
  partyA: '',
  partyB: '',
  terms: ''
})

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    labor: '劳动合同',
    lease: '房屋租赁合同',
    sales: '买卖合同',
    service: '技术服务合同',
    cooperation: '合作协议',
    nda: '保密协议',
    other: '合同'
  }
  return map[type] || '合同'
}

const generateContent = async () => {
  if (!form.type) {
    ElMessage.warning('请选择合同类型')
    return
  }

  try {
    isGenerating.value = true
    resultText.value = ''

    const typeLabel = getTypeLabel(form.type)

    const prompt = `请帮我起草一份${typeLabel}。
合同类型：${typeLabel}
${form.partyA ? `甲方：${form.partyA}` : ''}
${form.partyB ? `乙方：${form.partyB}` : ''}
${form.terms ? `核心条款/特别约定：${form.terms}` : ''}

要求：
1. 条款严谨，符合法律规范。
2. 结构完整，包含双方信息、合同标的、权利义务、违约责任、争议解决等必要章节。
3. 语言专业、准确。
4. 标题请使用 Markdown 三级标题格式（### 标题），严禁在标题行使用 ** 加粗符号。`

    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个专业的法律顾问，擅长起草各类商业合同和法律文件。',
      temperature: 0.5
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

  const typeLabel = getTypeLabel(form.type)
  let prompt = ''
  let systemPrompt = ''

  switch (type) {
    case 'review':
      prompt = `请审查上述${typeLabel}草案，指出可能存在的法律风险、漏洞或不公平条款，并给出具体的修改建议。

      当前合同内容：
      ${resultText.value}`
      systemPrompt = '你是一个严谨的法律风控专家，擅长审查合同风险。'
      break
    case 'polish':
      prompt = `请润色上述${typeLabel}草案，使语言更加专业、严谨、符合法律规范，保持原意不变。

      当前合同内容：
      ${resultText.value}`
      systemPrompt = '你是一个资深的法律文书专家，擅长优化法律文本。'
      break
    case 'expand':
      prompt = `请根据上述${typeLabel}草案，补充更多细节条款，如不可抗力、通知送达、法律适用等通用条款，使其更加完整。

      当前合同内容：
      ${resultText.value}`
      systemPrompt = '你是一个经验丰富的律师，擅长完善合同细节。'
      break
  }

  try {
    isGenerating.value = true
    // 对于AI辅助，我们通常是基于原文生成新的内容，或者在原文后追加。
    // 这里为了体验，我们清空并重新流式输出优化后的完整内容（如果是全文优化）
    // 或者追加内容（如果是风险审查意见）。
    // 假设 review 是追加意见，polish/expand 是重写。

    if (type === 'review') {
      // Append mode for review
      const separator = '\n\n---\n\n### 风险审查意见\n\n'
      resultText.value += separator
      await generateAIWriting({
        prompt,
        systemPrompt,
        temperature: 0.5
      }, (content) => {
        resultText.value += content
      })
    } else {
      // Rewrite mode for polish/expand
      const originalText = resultText.value
      resultText.value = ''
      await generateAIWriting({
        prompt,
        systemPrompt,
        temperature: 0.5
      }, (content) => {
        resultText.value += content
      })
    }

    ElMessage.success('优化完成')
  } catch (error) {
    // resultText.value = originalText // Difficult to restore in stream unless we kept it
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
  a.download = `${getTypeLabel(form.type)}模版.md`
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
