<!--
 * @file PEST.vue
 * @description PEST分析工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-16
 -->

<template>
  <div class="pest-page">
    <AIToolPageTemplate
      title="PEST 宏观环境分析"
      description="围绕政治、经济、社会与技术四个维度建立结构化判断，适用于市场进入、战略规划和外部环境研究。"
      input-title="定义分析任务"
      result-title="PEST 分析报告"
      :is-busy="isGenerating"
      :has-result="Boolean(resultText)"
    >
      <template #input>
        <div class="pest-fields">
          <div>
            <label for="pest-target">分析对象 <span aria-hidden="true">*</span></label>
            <el-input id="pest-target" v-model="form.target" placeholder="例如：跨境电商行业、某公司出海战略" size="large"
              clearable class="custom-input" />
            <p>写清行业、组织或具体战略，结果会更聚焦。</p>
          </div>

          <div>
            <label for="pest-background">背景信息</label>
            <el-input id="pest-background" v-model="form.background" type="textarea" :rows="5"
              placeholder="补充目标市场、发展阶段、当前挑战等背景信息…" class="custom-input" />
          </div>
        </div>
      </template>

      <template #primary-action>
        <button type="button" @click="generateContent" :disabled="isGenerating || !form.target"
          class="pest-primary-action">
          <svg v-if="!isGenerating" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M13 2 4 14h7v8l9-12h-7V2Z" />
          </svg>
          <span v-else class="pest-spinner" aria-hidden="true"></span>
          {{ isGenerating ? 'AI 正在分析…' : '开始分析' }}
        </button>
      </template>

      <template #result-actions>
        <button type="button" @click="copyResult" :disabled="!resultText || mode === 'preview'"
          class="pest-toolbar-button">复制 Markdown</button>
        <button type="button" @click="copyPreviewHtml" :disabled="!resultText"
          class="pest-toolbar-button">复制预览样式</button>
        <button type="button" @click="clearResult" :disabled="!resultText"
          class="pest-toolbar-button pest-toolbar-button--danger">清空</button>
      </template>

      <template #assist-actions>
        <button type="button" @click="handleAiAssist('strategy')" :disabled="isGenerating || !resultText"
          class="pest-assist-button">基于报告生成战略建议</button>
      </template>

      <template #result>
        <v-md-editor v-if="showResultEditor" v-model="resultText" height="100%" :mode="mode"
          placeholder="AI 生成的 PEST 分析报告将在这里显示…" :disabled-menus="[]" @save="save"></v-md-editor>
        <div v-else class="pest-empty">
          <div class="pest-empty__diagram" aria-hidden="true">
            <span>P</span><span>E</span><span>S</span><span>T</span>
          </div>
          <strong>报告区等待任务</strong>
          <p>填写左侧分析对象，AI 将按四个环境维度生成可继续编辑的 Markdown 报告。</p>
        </div>
      </template>

      <template #guide>
        <h2>如何得到更准确的分析</h2>
        <ul>
          <li>分析对象尽量包含行业、地区或业务阶段。</li>
          <li>背景信息可补充目标市场、竞争格局和当前决策。</li>
          <li>生成后可继续编辑，并让 AI 基于报告提出战略建议。</li>
        </ul>
      </template>
    </AIToolPageTemplate>

    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { downloadMarkdownResult } from '@/utils/markdownResult'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import AIToolPageTemplate from '@/components/Common/PageTemplates/AIToolPageTemplate.vue'
import { generateAIWriting } from '@/services/ai'

const route = useRoute()
const mode = ref<'editable' | 'preview' | 'edit'>('editable')
const form = reactive({
  target: '',
  background: ''
})

const isGenerating = ref(false)
const resultText = ref('')
const showResultEditor = ref(false)
let pendingResultChunk = ''
let resultStreamFlushRafId: number | null = null

/**
 * 刷新待写入的流式文本分片
 * 在动画帧内合并分片写入，减少编辑器高频响应式更新导致的卡顿
 */
const flushPendingResultChunk = () => {
  resultStreamFlushRafId = null
  if (!pendingResultChunk) return
  resultText.value += pendingResultChunk
  pendingResultChunk = ''
}

/**
 * 强制刷新剩余分片
 * 请求结束或异常时立即清空缓冲，确保结果区内容完整
 */
const forceFlushPendingResultChunk = () => {
  if (resultStreamFlushRafId !== null) {
    window.cancelAnimationFrame(resultStreamFlushRafId)
    resultStreamFlushRafId = null
  }
  flushPendingResultChunk()
}

/**
 * 调度流式分片刷新
 * 单帧内最多刷新一次，平衡输出流畅度与主线程开销
 */
const scheduleResultStreamFlush = () => {
  if (resultStreamFlushRafId !== null) return
  resultStreamFlushRafId = window.requestAnimationFrame(() => {
    flushPendingResultChunk()
  })
}

/**
 * 追加流式返回分片
 * 先写入缓冲再统一刷新，避免每个 chunk 都触发编辑器重渲染
 *  chunk 流式返回文本
 */
const appendResultChunk = (chunk: string) => {
  if (!chunk) return
  pendingResultChunk += chunk
  scheduleResultStreamFlush()
}

/**
 * 重置流式输出状态
 * 在新请求开始或组件卸载时清空缓冲与动画帧状态，避免串流污染
 */
const resetResultStreamState = () => {
  pendingResultChunk = ''
  if (resultStreamFlushRafId !== null) {
    window.cancelAnimationFrame(resultStreamFlushRafId)
    resultStreamFlushRafId = null
  }
}

/**
 * 确保结果编辑器已就绪
 * 仅在用户实际使用结果区时挂载编辑器，降低页面初始化成本
 */
const ensureResultEditorReady = () => {
  if (showResultEditor.value) return
  showResultEditor.value = true
}


const generateContent = async () => {
  if (!form.target) {
    ElMessage.warning('请输入分析对象')
    return
  }

  try {
    ensureResultEditorReady()
    isGenerating.value = true
    resetResultStreamState()
    resultText.value = ''

    const prompt = `请运用PEST模型对${form.target}进行宏观环境分析。
${form.background ? `背景信息：${form.background}` : ''}

要求：
1. 分别从政治(Political)、经济(Economic)、社会(Social)、技术(Technological)四个维度进行深入分析。
2. 结合具体情况，分析各维度对分析对象的具体影响。
3. 标题请使用 Markdown 三级标题格式（### 标题），严禁在标题行使用 ** 加粗符号。`

    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个资深的战略分析师，擅长运用PEST模型进行宏观环境分析。',
      temperature: 0.7
    }, (content) => {
      appendResultChunk(content)
    })
    forceFlushPendingResultChunk()

    ElMessage.success('生成完成')
  } catch (error) {
    forceFlushPendingResultChunk()
    ElMessage.error('生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
    resetResultStreamState()
  }
}

const handleAiAssist = async (type: string) => {
  if (!resultText.value) return

  ensureResultEditorReady()
  isGenerating.value = true
  const originalText = resultText.value
  let prompt = ''

  switch (type) {
    case 'strategy':
      prompt = `请基于现有的PEST分析结果，为${form.target}提出具体的战略建议，帮助其应对外部环境的机遇与挑战：\n\n${originalText}`
      break
  }

  try {
    resetResultStreamState()
    resultText.value = ''
    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个资深的战略分析师，擅长运用PEST模型进行宏观环境分析。'
    }, (chunk) => {
      appendResultChunk(chunk)
    })
    forceFlushPendingResultChunk()
  } catch (error) {
    forceFlushPendingResultChunk()
    ElMessage.error('AI助手处理失败，请重试')
    resultText.value = originalText
  } finally {
    isGenerating.value = false
    resetResultStreamState()
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
    if (!showResultEditor.value) {
      ensureResultEditorReady()
      await nextTick()
    }
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
  resetResultStreamState()
  resultText.value = ''
  isGenerating.value = false
}

onBeforeUnmount(() => {
  resetResultStreamState()
})

const save = (text: string, _html: string) => {
  const downloaded = downloadMarkdownResult(text)
  downloaded
    ? ElMessage.success('已下载 Markdown 文件')
    : ElMessage.warning('暂无可保存的内容')
}
</script>

<style scoped>
.pest-page {
  width: 100%;
}

.pest-page :deep(.tools-recommend) {
  margin-top: 18px;
}

.pest-fields {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.pest-fields label {
  display: block;
  margin-bottom: 8px;
  color: #303747;
  font-size: 13px;
  font-weight: 700;
}

.pest-fields label span {
  color: var(--uied-color-danger);
}

.pest-fields p {
  margin: 8px 0 0;
  color: #858c9b;
  font-size: 11px;
  line-height: 1.6;
}

.custom-input :deep(.el-input__wrapper) {
  min-height: 44px;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #d8dce5 inset;
  background: rgb(255 255 255 / 92%);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--uied-color-primary) inset;
}

.custom-input :deep(.el-textarea__inner) {
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #d8dce5 inset;
  background: rgb(255 255 255 / 92%);
}

.custom-input :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px var(--uied-color-primary) inset;
}

.pest-primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 46px;
  padding: 11px 16px;
  border: 1px solid var(--uied-color-primary);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  background: var(--uied-color-primary);
  box-shadow: 0 9px 20px rgb(91 84 232 / 18%);
  transition: background-color var(--uied-motion-fast) ease, border-color var(--uied-motion-fast) ease, transform var(--uied-motion-fast) ease;
}

.pest-primary-action:hover:not(:disabled) {
  border-color: var(--uied-color-primary-hover);
  background: var(--uied-color-primary-hover);
  transform: translateY(-1px);
}

.pest-primary-action:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}

.pest-primary-action svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.pest-spinner {
  width: 17px;
  height: 17px;
  border: 2px solid rgb(255 255 255 / 38%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: pest-spin 0.8s linear infinite;
}

.pest-toolbar-button,
.pest-assist-button {
  min-height: 32px;
  padding: 6px 10px;
  border: 1px solid #dde0e8;
  border-radius: 7px;
  color: #525a6b;
  font-size: 11px;
  font-weight: 650;
  background: #fff;
  transition: color var(--uied-motion-fast) ease, border-color var(--uied-motion-fast) ease, background-color var(--uied-motion-fast) ease;
}

.pest-toolbar-button:hover:not(:disabled),
.pest-assist-button:hover:not(:disabled) {
  color: var(--uied-color-primary);
  border-color: var(--uied-color-primary);
  background: #f7f6ff;
}

.pest-toolbar-button--danger:hover:not(:disabled) {
  color: var(--uied-color-danger);
  border-color: rgb(217 45 32 / 36%);
  background: rgb(217 45 32 / 5%);
}

.pest-toolbar-button:disabled,
.pest-assist-button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.pest-assist-button {
  color: var(--uied-color-primary);
  border-color: rgb(91 84 232 / 22%);
}

.pest-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 520px;
  padding: 40px 24px;
  text-align: center;
  background:
    linear-gradient(90deg, rgb(17 24 39 / 3%) 1px, transparent 1px),
    linear-gradient(rgb(17 24 39 / 3%) 1px, transparent 1px),
    #fcfcfd;
  background-size: 30px 30px;
}

.pest-empty__diagram {
  display: grid;
  grid-template-columns: repeat(2, 48px);
  gap: 5px;
  margin-bottom: 22px;
  transform: rotate(-2deg);
}

.pest-empty__diagram span {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid #cfd3dc;
  color: #788092;
  font-family: "DIN Alternate", "Avenir Next Condensed", sans-serif;
  font-size: 18px;
  font-weight: 700;
  background: rgb(255 255 255 / 88%);
}

.pest-empty__diagram span:nth-child(2),
.pest-empty__diagram span:nth-child(3) {
  color: #fff;
  border-color: var(--uied-color-primary);
  background: var(--uied-color-primary);
}

.pest-empty strong {
  color: #252b38;
  font-size: 17px;
}

.pest-empty p {
  max-width: 420px;
  margin: 10px 0 0;
  color: #7b8292;
  font-size: 13px;
  line-height: 1.75;
}

.pest-page :deep(.ai-tool-guide__content h2) {
  margin: 0 0 12px;
  color: #242b39;
  font-size: 16px;
  font-weight: 700;
}

.pest-page :deep(.ai-tool-guide__content ul) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pest-page :deep(.ai-tool-guide__content li) {
  padding-left: 12px;
  border-left: 2px solid #dfe2ea;
  color: #697183;
  font-size: 12px;
  line-height: 1.65;
}

:deep(.v-md-editor) {
  height: 100% !important;
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

@keyframes pest-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 720px) {
  .pest-empty {
    min-height: 430px;
  }

  .pest-page :deep(.ai-tool-guide__content ul) {
    grid-template-columns: 1fr;
  }
}
</style>
