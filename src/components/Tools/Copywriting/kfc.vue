<!--
* @file KFC.vue
* @description 肯德基疯狂星期四文案生成器
* @author UIED技术团队
* @copyright Tomda (https://www.tomda.top)
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-1-9
*
* 功能特性：
* 1. 自动获取最新KFC文案
* 2. 一键复制功能
* 3. 优雅的动画效果
* 4. 响应式布局
-->

<template>
  <div class="kfc-page">
    <StandardToolPageTemplate
      eyebrow="文案工具"
      title="疯狂星期四文案"
      description="生成可直接分享的疯狂星期四中文文案，并在同一个工作区完成英文翻译与复制。"
      workspace-label="文案工作区"
    >
      <template #meta>
        <span class="kfc-meta">无需登录</span>
        <span class="kfc-meta">服务端自动降级</span>
        <span class="kfc-meta">支持中英翻译</span>
      </template>

      <div class="kfc-output-grid">
        <section class="copy-panel" aria-labelledby="kfc-chinese-label">
          <div id="kfc-chinese-label" class="text-sm text-gray-500 mb-4">中文文案</div>
          <div
            class="text-gray-700 leading-relaxed text-base sm:text-[1.1rem] typing-text"
            :class="{ 'is-typing': state.isTyping }"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {{ state.isGenerating ? '正在获取文案…' : (state.typingText || '点击“生成文案”开始') }}
          </div>
        </section>

        <section class="copy-panel copy-panel--translation" aria-labelledby="kfc-english-label">
          <div id="kfc-english-label" class="text-sm text-gray-500 mb-4">英文翻译</div>
          <div class="text-gray-700 leading-relaxed text-base sm:text-[1.1rem]" role="status" aria-live="polite">
            {{ state.isTranslating ? '正在翻译…' : (state.translatedText || '生成中文文案后，可在这里查看英文翻译。') }}
          </div>
        </section>
      </div>

      <template #actions>
        <button type="button" @click="generate" :disabled="state.isGenerating || state.isTyping"
          class="kfc-action kfc-action--primary" aria-label="生成一条新的疯狂星期四文案">
          <el-icon class="mr-1"><Plus /></el-icon>
          {{ state.isGenerating || state.isTyping ? '生成中…' : '生成文案' }}
        </button>
        <button type="button" @click="translateText" :disabled="!state.displayText || state.isTranslating"
          class="kfc-action kfc-action--secondary" aria-label="将当前中文文案翻译为英文">
          <el-icon class="mr-1"><Document /></el-icon>
          {{ state.isTranslating ? '翻译中…' : '翻译文案' }}
        </button>
        <button type="button" @click="() => copyText('chinese')" :disabled="!state.displayText"
          class="kfc-action kfc-action--quiet" aria-label="复制当前中文文案">
          <el-icon class="mr-1"><Document /></el-icon>
          复制中文
        </button>
        <button v-if="state.translatedText" type="button" @click="() => copyText('english')"
          class="kfc-action kfc-action--quiet" aria-label="复制当前英文翻译">
          <el-icon class="mr-1"><Document /></el-icon>
          复制英文
        </button>
      </template>
    </StandardToolPageTemplate>

    <div class="mt-4">
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, reactive } from '@vue/runtime-core'
import { Document, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { copy } from '@/utils/copy'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import StandardToolPageTemplate from '@/components/Common/PageTemplates/StandardToolPageTemplate.vue'
import { fetchCopywritingText, fetchCopywritingTranslation } from '@/services/copywriting'

const route = useRoute()
const typingSpeed = 50 // 打字速度（毫秒/字）
let generateRequestId = 0
let typingRequestId = 0

const state = reactive({
  displayText: '',
  translatedText: '',
  isGenerating: false,
  isTranslating: false,
  typingText: '',
  isTyping: false
})

/**
 * 函数说明：按字符展示文案，并在用户连续点击生成时自动终止过期打字任务。
 */
async function typeText(text: string) {
  const requestId = ++typingRequestId
  state.isTyping = true
  state.typingText = ''
  for (let i = 0; i < text.length; i++) {
    if (requestId !== typingRequestId) {
      return
    }
    state.typingText += text[i]
    await new Promise(resolve => setTimeout(resolve, typingSpeed))
  }
  state.isTyping = false
}

/**
 * 函数说明：通过同域 Go API 获取肯德基文案，后台已内置上游重试和本地兜底。
 */
async function generate() {
  const requestId = ++generateRequestId
  state.isGenerating = true
  try {
    const result = await fetchCopywritingText('kfc')
    if (requestId !== generateRequestId) {
      return
    }
    state.displayText = result.text
    // 启动打字机效果
    typeText(result.text)
    // 清空之前的翻译
    state.translatedText = ''
    ElMessage.success(result.source === 'fallback' ? '已加载备用文案' : '生成成功')

  } catch (error) {
    if (requestId !== generateRequestId) {
      return
    }
    console.error('KFC 文案接口异常:', error)
    // 失败使用默认文案
    const defaultText = "V我50，请我吃肯德基疯狂星期四。\n今天是肯德基疯狂星期四，谁请我吃？\n伞兵，你妈妈喊你回家吃肯德基！\n小时候妈妈说我吃饭不专心，吃得不多，长不高。现在KFC疯狂星期四，我更加专心，吃得更多，个子也长得更高了。"
    state.displayText = defaultText
    typeText(defaultText)
    state.translatedText = ''
    ElMessage.success('已加载默认文案')
  } finally {
    if (requestId === generateRequestId) {
      state.isGenerating = false
    }
  }
}

// 移除不再需要的备用 API 函数 tryDirectBackupAPI

/**
 * 函数说明：通过同域 Go API 翻译当前文案，后台会在主翻译源异常时切换备用源。
 */
async function translateText() {
  try {
    state.isTranslating = true
    state.translatedText = await fetchCopywritingTranslation(state.displayText)
    ElMessage.success('翻译成功')
  } catch (error) {
    console.error('翻译接口异常:', error)
    ElMessage.error('翻译服务异常')
  } finally {
    state.isTranslating = false
  }
}

/**
 * 函数说明：复制中文或英文文案，并向用户反馈复制结果。
 */
function copyText(type: 'chinese' | 'english') {
  const text = type === 'chinese' ? state.displayText : state.translatedText
  copy(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 初始生成一条文案
generate()

onBeforeUnmount(() => {
  generateRequestId++
  typingRequestId++
})
</script>

<style scoped>
.kfc-page {
  width: 100%;
}

.kfc-meta {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 4px 9px;
  border: 1px solid #dde0e8;
  border-radius: 999px;
  color: var(--uied-color-text-secondary);
  font-size: 11px;
  font-weight: 600;
  background: #fff;
}

.kfc-output-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.copy-panel {
  min-height: 230px;
  padding: clamp(18px, 3vw, 28px);
  border: 1px solid var(--uied-color-border);
  border-radius: var(--uied-radius-lg);
  background: var(--uied-color-surface-subtle);
}

.copy-panel--translation {
  background:
    linear-gradient(135deg, rgb(91 84 232 / 5%), transparent 52%),
    #fbfbfd;
}

.kfc-action {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 20px;
  color: var(--uied-color-text);
  font-size: 14px;
  font-weight: 600;
  border: 1px solid var(--uied-color-border);
  border-radius: var(--uied-radius-md);
  background: var(--uied-color-surface);
  transition: color var(--uied-motion-fast) ease, border-color var(--uied-motion-fast) ease, background-color var(--uied-motion-fast) ease;
}

.kfc-action--primary {
  color: #fff;
  border-color: var(--uied-color-primary);
  background: var(--uied-color-primary);
}

.kfc-action--primary:hover:not(:disabled) {
  border-color: var(--uied-color-primary-hover);
  background: var(--uied-color-primary-hover);
}

.kfc-action--secondary {
  color: var(--uied-color-primary);
  border-color: #d8d5fb;
  background: var(--uied-color-primary-soft);
}

.kfc-action--secondary:hover:not(:disabled),
.kfc-action--quiet:hover:not(:disabled) {
  border-color: var(--uied-color-primary);
}

.kfc-action:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.typing-text {
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 24px;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.typing-text::after {
  content: '|';
  animation: blink 1s infinite;
  margin-left: 2px;
}

.typing-text:not(.is-typing)::after {
  display: none;
}

@media screen and (max-width: 640px) {
  .kfc-output-grid {
    grid-template-columns: 1fr;
  }

  .copy-panel {
    min-height: 170px;
  }

  .kfc-action {
    width: 100%;
    min-height: 44px;
    padding-right: 12px;
    padding-left: 12px;
  }
}
</style>
