<!--
 * @file HotRanking.vue
 * @description 站内工具排行榜独立页面，仅展示工具热榜内容
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
 -->

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ToolRankingBoard from '@/components/Common/ToolRankingBoard.vue'
import { getSitePublicConfig } from '@/services/siteConfig'
import type { ToolRankingPeriod } from '@/services/toolRanking'

const pageLoading = ref(true)
const toolRankingEnabled = ref(true)
const toolRankingPageTitle = ref('站内工具使用排行榜')
const toolRankingPageDescription = ref('按站内真实点击量排行，帮助你快速看清当前最受欢迎的工具。')
const activeToolRankingPeriod = ref<ToolRankingPeriod>('week')
const toolRankingPageLimit = ref(12)
const toolRankingPeriodOptions: Array<{ label: string; value: ToolRankingPeriod }> = [
  { label: '日榜', value: 'day' },
  { label: '周榜', value: 'week' },
  { label: '月榜', value: 'month' },
  { label: '总榜', value: 'all' }
]

/**
 * 函数说明：标准化独立热榜页展示数量，兼容后台脏值与非数字值，保证榜单页稳定渲染。
 */
const normalizeToolRankingPageLimit = (value: unknown): number => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return 12
  }
  return Math.min(20, Math.max(1, Math.floor(numericValue)))
}

/**
 * 函数说明：输出当前榜单周期的中文标签，保证页面标题辅助信息清晰稳定。
 */
const toolRankingPeriodLabel = computed(() => {
  if (activeToolRankingPeriod.value === 'day') {
    return '日榜'
  }
  if (activeToolRankingPeriod.value === 'month') {
    return '月榜'
  }
  if (activeToolRankingPeriod.value === 'all') {
    return '总榜'
  }
  return '周榜'
})

/**
 * 函数说明：切换独立热榜页榜单周期，保持页面只围绕站内工具排行榜切换显示。
 */
const handleToolRankingPeriodChange = (period: ToolRankingPeriod) => {
  activeToolRankingPeriod.value = period
}

/**
 * 函数说明：标准化热榜页描述文案，兼容历史旧文案并统一收口到点击量排序口径。
 */
const resolveToolRankingPageDescription = (value: string) => {
  const rawText = String(value || '').trim()
  if (!rawText) {
    return '按站内真实点击量排行，帮助你快速看清当前最受欢迎的工具。'
  }
  if (rawText.includes('开始处理') || rawText.includes('下载行为') || rawText.includes('真实访问')) {
    return '按站内真实点击量排行，帮助你快速看清当前最受欢迎的工具。'
  }
  return rawText
}

/**
 * 函数说明：同步独立热榜页浏览器标题，避免页面正文与浏览器标题口径不一致。
 */
const syncToolRankingDocumentTitle = () => {
  if (typeof document === 'undefined') {
    return
  }
  document.title = `${toolRankingPageTitle.value} - Tools`
}

/**
 * 函数说明：读取后台热榜页面配置，并为榜单请求同步页面展示参数。
 */
const loadToolRankingPageConfig = async () => {
  pageLoading.value = true
  try {
    const siteConfig = await getSitePublicConfig({ forceRefresh: true })
    toolRankingEnabled.value = Boolean(siteConfig.toolRankingEnabled)
    toolRankingPageTitle.value = siteConfig.toolRankingPageTitle || '站内工具使用排行榜'
    toolRankingPageDescription.value = resolveToolRankingPageDescription(siteConfig.toolRankingPageDescription)
    activeToolRankingPeriod.value = siteConfig.toolRankingDefaultPeriod || 'week'
    toolRankingPageLimit.value = normalizeToolRankingPageLimit(siteConfig.toolRankingPageLimit)
  } catch {
    toolRankingEnabled.value = true
    toolRankingPageTitle.value = '站内工具使用排行榜'
    toolRankingPageDescription.value = '按站内真实点击量排行，帮助你快速看清当前最受欢迎的工具。'
    activeToolRankingPeriod.value = 'week'
    toolRankingPageLimit.value = 12
  } finally {
    syncToolRankingDocumentTitle()
    pageLoading.value = false
  }
}

onMounted(() => {
  void loadToolRankingPageConfig()
})
</script>

<template>
  <article class="tool-ranking-page" :aria-label="toolRankingPageTitle">
    <header class="tool-ranking-page__header">
      <h1 class="tool-ranking-page__title">{{ toolRankingPageTitle }}</h1>
      <p class="tool-ranking-page__desc">{{ toolRankingPageDescription }}</p>
      <div class="tool-ranking-page__toolbar">
        <div class="tool-ranking-page__periods" role="group" aria-label="切换排行榜周期">
          <button
            v-for="item in toolRankingPeriodOptions"
            :key="item.value"
            type="button"
            class="tool-ranking-page__period-btn"
            :aria-pressed="activeToolRankingPeriod === item.value"
            :class="{ 'tool-ranking-page__period-btn--active': activeToolRankingPeriod === item.value }"
            @click="handleToolRankingPeriodChange(item.value)"
          >
            {{ item.label }}
          </button>
        </div>
        <span class="tool-ranking-page__hint">点击工具，即可使用</span>
      </div>
    </header>

    <section class="tool-ranking-page__board-shell" :aria-label="`${toolRankingPeriodLabel}工具排名`">
      <div v-if="pageLoading" class="tool-ranking-page__status" role="status" aria-live="polite">
        工具排行榜加载中...
      </div>

      <ToolRankingBoard
        v-else-if="toolRankingEnabled"
        flat
        :show-header="false"
        :title="toolRankingPageTitle"
        :period="activeToolRankingPeriod"
        :limit="toolRankingPageLimit"
        :fallback-tools="[]"
        :use-fallback-on-error="false"
        show-retry
        empty-text="当前暂无排行榜数据，产生真实使用后会自动更新。"
        error-text="排行榜加载失败，请重试"
      />

      <div v-else class="tool-ranking-page__status" role="status" aria-live="polite">
        当前站内工具排行榜已在后台关闭。
      </div>
    </section>
  </article>
</template>

<style scoped>
.tool-ranking-page {
  width: 100%;
  box-sizing: border-box;
  padding: 32px;
  border: 1px solid var(--uied-color-border);
  border-radius: var(--uied-radius-lg);
  background: var(--uied-color-surface);
  color: var(--uied-color-text);
}

.tool-ranking-page__title {
  margin: 0;
  font-size: 26px;
  line-height: 1.4;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.tool-ranking-page__desc {
  max-width: 720px;
  margin: 10px 0 0;
  color: var(--uied-color-text-secondary);
  font-size: 14px;
  line-height: 1.8;
}

.tool-ranking-page__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin: 24px 0;
}

.tool-ranking-page__periods {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  border: 1px solid var(--uied-color-border);
  border-radius: var(--uied-radius-md);
  background: var(--uied-color-surface-subtle);
}

.tool-ranking-page__period-btn {
  appearance: none;
  min-width: 68px;
  min-height: 44px;
  padding: 8px 18px;
  border: 1px solid transparent;
  border-radius: var(--uied-radius-sm);
  background: transparent;
  color: var(--uied-color-text-secondary);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color var(--uied-motion-fast), background-color var(--uied-motion-fast);
}

.tool-ranking-page__period-btn:hover {
  color: var(--uied-color-text);
  background: var(--uied-color-surface);
}

.tool-ranking-page__period-btn--active {
  border-color: var(--uied-color-border);
  background: var(--uied-color-surface);
  color: var(--uied-color-primary);
  font-weight: 600;
  box-shadow: 0 1px 2px rgb(16 24 40 / 5%);
}

.tool-ranking-page__period-btn:focus-visible {
  outline: 2px solid var(--uied-color-primary);
  outline-offset: 2px;
}

.tool-ranking-page__hint {
  color: var(--uied-color-text-secondary);
  font-size: 13px;
}

.tool-ranking-page__board-shell {
  min-width: 0;
}

.tool-ranking-page__status {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  padding: 24px;
  border-radius: var(--uied-radius-md);
  background: var(--uied-color-surface-subtle);
  color: var(--uied-color-text-secondary);
  font-size: 14px;
  line-height: 1.8;
  text-align: center;
}

@container uied-tool (max-width: 600px) {
  .tool-ranking-page {
    padding: 20px 16px 12px;
  }

  .tool-ranking-page__title {
    font-size: 22px;
  }

  .tool-ranking-page__toolbar {
    margin: 20px 0 16px;
  }

  .tool-ranking-page__periods {
    width: 100%;
  }

  .tool-ranking-page__period-btn {
    min-width: 0;
    padding-inline: 8px;
  }

  .tool-ranking-page__hint {
    display: none;
  }
}
</style>
