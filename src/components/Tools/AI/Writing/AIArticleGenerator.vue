<!--
 * @file AIArticleGenerator.vue
 * @description AI文章生成工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 -->

<template>
  <div>
    <AIToolPageTemplate
      eyebrow="AI 写作工作台"
      title="AI 文章生成"
      description="输入主题、关键词和写作约束，生成可编辑的 Markdown 草稿，并继续完成扩写、改写、润色与纠错。"
      input-title="写作配置"
      result-title="文章草稿"
      :is-busy="isGenerating"
      :has-result="Boolean(resultText)"
    >
      <template #input>
        <div class="article-form">
          <label class="article-field">
            <span>文章主题 <b>*</b></span>
            <el-input v-model="form.topic" placeholder="请输入文章主题或标题" size="large" clearable />
          </label>
          <label class="article-field">
            <span>关键词 <em>可选</em></span>
            <el-input v-model="form.keywords" placeholder="多个关键词用逗号分隔" size="large" clearable />
          </label>
          <label class="article-field">
            <span>文章类型</span>
            <el-select v-model="form.type" placeholder="选择文章类型" class="w-full" size="large">
              <el-option label="通用文章" value="general" />
              <el-option label="新闻资讯" value="news" />
              <el-option label="博客/公众号" value="blog" />
              <el-option label="学术论文" value="academic" />
              <el-option label="故事/小说" value="story" />
              <el-option label="种草文案" value="marketing" />
            </el-select>
          </label>
          <label class="article-field">
            <span>写作风格</span>
            <el-select v-model="form.style" placeholder="选择写作风格" class="w-full" size="large">
              <el-option label="专业严谨" value="professional" />
              <el-option label="幽默风趣" value="humorous" />
              <el-option label="温馨感人" value="emotional" />
              <el-option label="犀利点评" value="critical" />
              <el-option label="简单直白" value="simple" />
            </el-select>
          </label>
          <label class="article-field">
            <span>篇幅长度 <em>{{ form.length }} 字</em></span>
            <el-slider v-model="form.length" :min="100" :max="2000" :step="100" />
          </label>
        </div>
      </template>

      <template #primary-action>
        <button class="article-primary-action" :disabled="isGenerating || !form.topic" @click="generateArticle">
          <span v-if="!isGenerating">开始生成</span>
          <span v-else>AI 正在创作中…</span>
        </button>
      </template>

      <template #result-actions>
        <button v-if="resultText && mode !== 'preview'" class="article-action" @click="copyResult">复制 Markdown</button>
        <button v-if="resultText" class="article-action" @click="copyPreviewHtml">复制预览样式</button>
        <button v-if="resultText" class="article-action article-action--danger" @click="clearResult">清空</button>
      </template>

      <template #assist-actions>
        <button v-for="item in assistActions" :key="item.type" class="article-assist-action" :disabled="isGenerating || !resultText" @click="handleAiAssist(item.type)">{{ item.label }}</button>
      </template>

      <template #result>
        <div v-if="showResultEditor" class="article-result-editor">
          <v-md-editor v-model="resultText" height="100%" :mode="mode" placeholder="AI生成的内容将在这里显示..." :disabled-menus="[]" @save="save"></v-md-editor>
        </div>
        <div v-else class="article-empty-result">
          <strong>等待生成</strong>
          <span>填写主题后开始，结果会在这里进入可编辑状态。</span>
        </div>
      </template>

      <template #guide>
        <WritingGuide />
      </template>
    </AIToolPageTemplate>
    <MemberCoreToolTips
      v-if="currentMemberCoreExperience"
      class="mb-4"
      :tool-key="currentMemberCoreExperience.toolKey"
      :title="memberCoreTipsTitle"
      :items="memberCoreTipsItems"
    />
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { downloadMarkdownResult } from '@/utils/markdownResult'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import MemberCoreToolTips from '@/components/Common/MemberCoreToolTips.vue'
import AIToolPageTemplate from '@/components/Common/PageTemplates/AIToolPageTemplate.vue'
import WritingGuide from './WritingGuide.vue'
import { generateAIWriting } from '@/services/ai'
import {
  createCoreToolRunRequestId,
  useCoreToolManualConsume
} from '@/composables/useCoreToolManualConsume'
import { useMemberCoreToolExperienceTips } from '@/composables/useMemberCoreToolExperienceTips'

const route = useRoute()
const assistActions = [
  { type: 'expand', label: '扩写' },
  { type: 'continue', label: '续写' },
  { type: 'summarize', label: '简写' },
  { type: 'rewrite', label: '改写' },
  { type: 'polish', label: '润色' },
  { type: 'fix', label: '纠错' }
]
const { consumeCoreToolRun, resolveCoreToolRun } = useCoreToolManualConsume()
const {
  currentMemberCoreExperience,
  memberCoreTipsTitle,
  memberCoreTipsItems
} = useMemberCoreToolExperienceTips(route)
const mode = ref<'editable' | 'preview' | 'edit'>('editable')
const form = reactive({
  topic: '',
  keywords: '',
  type: 'general',
  style: 'professional',
  length: 800
})

const isGenerating = ref(false)
const resultText = ref('')
const showResultEditor = ref(false)
let pendingResultChunk = ''
let resultStreamFlushRafId: number | null = null
let activeCoreToolRunRequestId: string | null = null
let activeCoreToolRunSettled = false

/**
 * 函数说明：按当前运行 requestId 幂等结算核心工具运行，避免成功与退款重复提交。
 */
const settleActiveCoreToolRun = async (
  outcome: 'success' | 'failed',
  reason = ''
): Promise<boolean> => {
  const requestId = activeCoreToolRunRequestId
  if (!requestId || activeCoreToolRunSettled) return false
  activeCoreToolRunSettled = true
  const settled = await resolveCoreToolRun(requestId, outcome, reason)
  if (activeCoreToolRunRequestId === requestId) {
    activeCoreToolRunRequestId = null
  }
  return settled
}

/**
 * 函数说明：生成本次运行唯一 requestId 并在真实扣费前完成核心工具积分预扣。
 */
const beginCoreToolRun = async (options: {
  toolKey: string
  action: string
  routePath: string
}): Promise<string | null> => {
  const requestId = createCoreToolRunRequestId()
  activeCoreToolRunRequestId = requestId
  activeCoreToolRunSettled = false
  try {
    const canConsume = await consumeCoreToolRun({ ...options, requestId })
    if (!canConsume) {
      activeCoreToolRunRequestId = null
      return null
    }
    return requestId
  } catch (error) {
    await settleActiveCoreToolRun('failed', '积分预扣请求异常')
    throw error
  }
}

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
 * @param chunk 流式返回文本
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

/**
 * 生成文章
 * @description 根据用户配置的参数调用AI生成文章
 */
const generateArticle = async () => {
  if (!form.topic) {
    ElMessage.warning('请输入文章主题')
    return
  }

  const requestId = await beginCoreToolRun({
    toolKey: 'ai-article-generator',
    action: 'generate',
    routePath: '/tools/ai/article-generator'
  })
  if (!requestId) return

  try {
    ensureResultEditorReady()
    isGenerating.value = true
    resetResultStreamState()
    resultText.value = ''
    // 保持当前模式，或者切换到 editable 以便观察
    // mode.value = 'editable'

    // 构建提示词
    const prompt = `请帮我写一篇${form.length}字左右的文章。
主题：${form.topic}
${form.keywords ? `关键词：${form.keywords}` : ''}
文章类型：${getArticleTypeLabel(form.type)}
写作风格：${getStyleLabel(form.style)}
篇幅长度：约${form.length}字

要求：
1. 内容充实，观点明确
2. 结构清晰，分段合理
3. 语言流畅，符合${getStyleLabel(form.style)}的风格
4. 字数控制在${form.length}字左右
5. 请使用Markdown格式输出，包含合适的标题层级
6. 必须符合SEO优化标准，自然融入关键词，提升搜索引擎友好度
7. 标题请使用 Markdown 三级标题格式（### 标题），严禁在标题行使用 ** 加粗符号`

    const generatedResult = await generateAIWriting({
      prompt,
      systemPrompt: '你是一个专业的文章写作助手，能够根据用户的要求生成高质量的文章。',
      temperature: 0.7
    }, (content) => {
      if (activeCoreToolRunRequestId !== requestId) return
      appendResultChunk(content)
    })
    forceFlushPendingResultChunk()
    if (activeCoreToolRunRequestId !== requestId) return
    if (!generatedResult.trim() || !resultText.value.trim()) {
      await settleActiveCoreToolRun('failed', '接口返回空结果')
      ElMessage.error('生成失败，请稍后重试')
      return
    }
    await settleActiveCoreToolRun('success')

    ElMessage.success('生成完成')
  } catch (error) {
    forceFlushPendingResultChunk()
    await settleActiveCoreToolRun('failed', '生成接口失败')
    console.error('生成失败:', error)
    ElMessage.error('生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
    resetResultStreamState()
  }
}

/**
 * AI辅助编辑
 * @description 对已生成的内容进行扩写、续写、润色等操作
 * @param type 辅助操作类型
 */
const handleAiAssist = async (type: string) => {
  if (!resultText.value) return

  const requestId = await beginCoreToolRun({
    toolKey: 'ai-article-generator',
    action: `assist-${type}`,
    routePath: '/tools/ai/article-generator'
  })
  if (!requestId) return

  ensureResultEditorReady()
  isGenerating.value = true
  const originalText = resultText.value
  let prompt = ''

  switch (type) {
    case 'expand':
      prompt = `请对以下内容进行扩写，丰富细节，增加字数，保持原意不变：\n\n${originalText}`
      break
    case 'continue':
      prompt = `请根据以下内容进行续写，保持风格一致：\n\n${originalText}`
      break
    case 'summarize':
      prompt = `请对以下内容进行缩写，精简语言，保留核心信息：\n\n${originalText}`
      break
    case 'rewrite':
      prompt = `请对以下内容进行改写，优化措辞，提升可读性，保持原意：\n\n${originalText}`
      break
    case 'polish':
      prompt = `请对以下内容进行润色，修正语病，使其更通顺专业：\n\n${originalText}`
      break
    case 'fix':
      prompt = `请找出以下内容中的错别字和语病并修正，直接输出修正后的内容：\n\n${originalText}`
      break
  }

  try {
    resetResultStreamState()
    if (type !== 'continue') {
      resultText.value = '' // Clear for replacement
    } else {
      resultText.value += '\n\n' // Add newline for continue
    }

    const generatedResult = await generateAIWriting({
      prompt,
      systemPrompt: '你是一个专业的文字编辑助手。'
    }, (chunk) => {
      if (activeCoreToolRunRequestId !== requestId) return
      appendResultChunk(chunk)
    })
    forceFlushPendingResultChunk()
    if (activeCoreToolRunRequestId !== requestId) return
    if (!generatedResult.trim() || !resultText.value.trim()) {
      await settleActiveCoreToolRun('failed', '辅助接口返回空结果')
      ElMessage.error('AI助手处理失败，请重试')
      if (type !== 'continue') {
        resultText.value = originalText
      }
      return
    }
    await settleActiveCoreToolRun('success')
  } catch (error) {
    forceFlushPendingResultChunk()
    await settleActiveCoreToolRun('failed', '辅助接口失败')
    ElMessage.error('AI助手处理失败，请重试')
    if (type !== 'continue') {
      resultText.value = originalText // Restore if failed
    }
  } finally {
    isGenerating.value = false
    resetResultStreamState()
  }
}

/**
 * 获取文章类型标签
 * @param type 文章类型值
 * @returns 对应的中文标签
 */
const getArticleTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    general: '通用文章',
    news: '新闻资讯',
    blog: '博客/公众号',
    academic: '学术论文',
    story: '故事/小说',
    marketing: '种草文案'
  }
  return map[type] || '通用文章'
}

/**
 * 获取写作风格标签
 * @param style 写作风格值
 * @returns 对应的中文标签
 */
const getStyleLabel = (style: string) => {
  const map: Record<string, string> = {
    professional: '专业严谨',
    humorous: '幽默风趣',
    emotional: '温馨感人',
    critical: '犀利点评',
    simple: '简单直白'
  }
  return map[style] || '专业严谨'
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
const clearResult = async () => {
  if (activeCoreToolRunRequestId && !activeCoreToolRunSettled) {
    await settleActiveCoreToolRun('failed', '用户主动清空结果')
  }
  resetResultStreamState()
  resultText.value = ''
  isGenerating.value = false
}

onBeforeUnmount(async () => {
  if (activeCoreToolRunRequestId && !activeCoreToolRunSettled) {
    await settleActiveCoreToolRun('failed', '组件卸载导致运行中止')
  }
  resetResultStreamState()
})

/**
 * 保存编辑器内容
 * @param text Markdown文本
 * @param html HTML内容
 */
const save = (text: string, _html: string) => {
  const downloaded = downloadMarkdownResult(text)
  downloaded
    ? ElMessage.success('已下载 Markdown 文件')
    : ElMessage.warning('暂无可保存的内容')
}
</script>

<style scoped>
.article-form { display: grid; gap: 18px; }
.article-field { display: grid; gap: 7px; color: #344054; font-size: 12px; font-weight: 650; }
.article-field span { display: flex; justify-content: space-between; gap: 8px; }
.article-field b { color: #d92d20; }
.article-field em { color: #98a2b3; font-size: 11px; font-style: normal; font-weight: 500; }
.article-primary-action { width: 100%; min-height: 42px; border: 0; color: #fff; background: var(--uied-color-primary); font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity .2s ease, transform .2s ease; }
.article-primary-action:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
.article-primary-action:disabled { opacity: .45; cursor: not-allowed; }
.article-action, .article-assist-action { border: 1px solid #dfe2ea; padding: 6px 10px; color: #596273; background: #fff; font-size: 11px; cursor: pointer; }
.article-action:hover, .article-assist-action:hover:not(:disabled) { border-color: var(--uied-color-primary); color: var(--uied-color-primary); }
.article-action--danger:hover { border-color: #d92d20; color: #d92d20; }
.article-assist-action:disabled { opacity: .45; cursor: not-allowed; }
.article-result-editor { height: 100%; min-height: 540px; }
.article-empty-result { display: grid; place-content: center; gap: 7px; height: 100%; min-height: 540px; color: #98a2b3; text-align: center; }
.article-empty-result strong { color: #475467; font-size: 17px; }
.article-empty-result span { font-size: 13px; }

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

/* 动画 */
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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
