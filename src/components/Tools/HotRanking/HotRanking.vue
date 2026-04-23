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
import { getNewToolsFromCategories } from '@/services/toolCatalog'
import type { Tool } from '@/types/tools'
import type { ToolRankingPeriod } from '@/services/toolRanking'

const pageLoading = ref(true)
const toolRankingEnabled = ref(true)
const toolRankingPageTitle = ref('站内工具使用排行榜')
const toolRankingPageDescription = ref('按站内真实点击量排行，帮助你快速看清当前最受欢迎的工具。')
const activeToolRankingPeriod = ref<ToolRankingPeriod>('week')
const toolRankingPageLimit = ref(12)
const toolRankingFallbackTools = ref<Tool[]>([])
const toolRankingPeriodOptions: Array<{ label: string; value: ToolRankingPeriod }> = [
  { label: '日榜', value: 'day' },
  { label: '周榜', value: 'week' },
  { label: '月榜', value: 'month' },
  { label: '总榜', value: 'all' }
]

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
 * 函数说明：构建页面顶部的榜单口径说明，统一展示当前榜单的核心规则。
 */
const toolRankingHighlights = computed(() => {
  return [
    {
      label: '排行口径',
      value: '点击量'
    },
    {
      label: '更新周期',
      value: toolRankingPeriodLabel.value
    },
    {
      label: '展示范围',
      value: `前 ${toolRankingPageLimit.value} 名`
    }
  ]
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
 * 函数说明：读取后台热榜页面配置，并同步生成榜单兜底工具列表。
 */
const loadToolRankingPageConfig = async () => {
  pageLoading.value = true
  try {
    const siteConfig = await getSitePublicConfig({ forceRefresh: true })
    toolRankingEnabled.value = Boolean(siteConfig.toolRankingEnabled)
    toolRankingPageTitle.value = siteConfig.toolRankingPageTitle || '站内工具使用排行榜'
    toolRankingPageDescription.value = resolveToolRankingPageDescription(siteConfig.toolRankingPageDescription)
    activeToolRankingPeriod.value = siteConfig.toolRankingDefaultPeriod || 'week'
    toolRankingPageLimit.value = Math.min(20, Math.max(1, Number(siteConfig.toolRankingPageLimit || 12)))
    toolRankingFallbackTools.value = getNewToolsFromCategories(siteConfig.toolCategories || [], toolRankingPageLimit.value)
  } catch {
    toolRankingEnabled.value = true
    toolRankingPageTitle.value = '站内工具使用排行榜'
    toolRankingPageDescription.value = '按站内真实点击量排行，帮助你快速看清当前最受欢迎的工具。'
    activeToolRankingPeriod.value = 'week'
    toolRankingPageLimit.value = 12
    toolRankingFallbackTools.value = []
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
  <div class="tool-ranking-page" role="region" aria-label="站内工具使用排行榜">
    <section class="tool-ranking-page__hero">
      <div class="tool-ranking-page__hero-head">
        <div>
          <p class="tool-ranking-page__eyebrow">{{ toolRankingPeriodLabel }}</p>
          <h1 class="tool-ranking-page__title">{{ toolRankingPageTitle }}</h1>
          <p class="tool-ranking-page__desc">{{ toolRankingPageDescription }}</p>
        </div>
        <div class="tool-ranking-page__hero-mark">TOP</div>
      </div>
      <div class="tool-ranking-page__meta">
        <div
          v-for="item in toolRankingHighlights"
          :key="item.label"
          class="tool-ranking-page__meta-item"
        >
          <span class="tool-ranking-page__meta-label">{{ item.label }}</span>
          <span class="tool-ranking-page__meta-value">{{ item.value }}</span>
        </div>
      </div>
      <div class="tool-ranking-page__periods">
        <button
          v-for="item in toolRankingPeriodOptions"
          :key="item.value"
          type="button"
          class="tool-ranking-page__period-btn"
          :class="{ 'tool-ranking-page__period-btn--active': activeToolRankingPeriod === item.value }"
          @click="handleToolRankingPeriodChange(item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <section class="tool-ranking-page__board-shell">
      <div class="tool-ranking-page__board-head">
        <div class="tool-ranking-page__board-title">榜单明细</div>
        <div class="tool-ranking-page__board-note">站内工具页点击越多，排名越靠前</div>
      </div>

      <div v-if="pageLoading" class="tool-ranking-page__status">
        工具排行榜加载中...
      </div>

      <ToolRankingBoard
        v-else-if="toolRankingEnabled"
        flat
        :show-header="false"
        :title="toolRankingPageTitle"
        :period="activeToolRankingPeriod"
        :limit="toolRankingPageLimit"
        :fallback-tools="toolRankingFallbackTools"
        empty-text="当前还没有足够的站内工具数据，榜单会在真实使用后自动更新。"
      />

      <div v-else class="tool-ranking-page__status tool-ranking-page__status--muted">
        当前站内工具排行榜已在后台关闭。
      </div>
    </section>
  </div>
</template>

<style scoped>
.tool-ranking-page {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 1.2rem 0 1.75rem;
  color: #0f172a;
}

.tool-ranking-page__hero {
  position: relative;
  overflow: hidden;
  margin-bottom: 0.75rem;
  padding: 1.1rem 1.1rem 0.95rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.92)),
    repeating-linear-gradient(
      90deg,
      rgba(15, 23, 42, 0.015) 0,
      rgba(15, 23, 42, 0.015) 1px,
      transparent 1px,
      transparent 48px
    );
}

.tool-ranking-page__hero::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #4f46e5 0%, rgba(79, 70, 229, 0.14) 55%, transparent 100%);
}

.tool-ranking-page__hero-head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
}

.tool-ranking-page__hero-mark {
  flex-shrink: 0;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 0.88;
  font-weight: 700;
  letter-spacing: -0.08em;
  color: rgba(15, 23, 42, 0.08);
}

.tool-ranking-page__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  color: #4f46e5;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tool-ranking-page__title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
  line-height: 1.08;
  font-weight: 700;
  color: #0f172a;
}

.tool-ranking-page__desc {
  max-width: 720px;
  margin: 0.65rem 0 0;
  font-size: 0.92rem;
  line-height: 1.62;
  color: #64748b;
}

.tool-ranking-page__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.tool-ranking-page__periods {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.tool-ranking-page__period-btn {
  appearance: none;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: #ffffff;
  color: #334155;
  border-radius: 999px;
  padding: 0.5rem 0.82rem;
  font-size: 0.8125rem;
  line-height: 1;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.tool-ranking-page__period-btn:hover {
  border-color: rgba(79, 70, 229, 0.25);
  color: #1e293b;
}

.tool-ranking-page__period-btn--active {
  border-color: rgba(79, 70, 229, 0.18);
  background: rgba(79, 70, 229, 0.07);
  color: #4338ca;
}

.tool-ranking-page__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
}

.tool-ranking-page__meta-label {
  font-size: 0.75rem;
  color: #64748b;
}

.tool-ranking-page__meta-value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0f172a;
}

.tool-ranking-page__board-shell {
  min-height: 360px;
  padding: 0.85rem 1rem 0.25rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  background: #ffffff;
}

.tool-ranking-page__board-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  margin-bottom: 0.1rem;
}

.tool-ranking-page__board-title {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.tool-ranking-page__board-note {
  font-size: 0.78rem;
  color: #64748b;
}

.tool-ranking-page__status {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  color: #0f172a;
  font-size: 0.95rem;
}

.tool-ranking-page__status--muted {
  color: #64748b;
}

@media (max-width: 768px) {
  .tool-ranking-page {
    padding: 0.75rem 0 1rem;
  }

  .tool-ranking-page__hero,
  .tool-ranking-page__board-shell {
    padding-left: 0.85rem;
    padding-right: 0.85rem;
    border-radius: 18px;
  }

  .tool-ranking-page__hero-head,
  .tool-ranking-page__board-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .tool-ranking-page__title {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .tool-ranking-page__desc {
    font-size: 0.875rem;
    line-height: 1.5rem;
  }

  .tool-ranking-page__board-shell,
  .tool-ranking-page__status {
    min-height: 280px;
  }

  .tool-ranking-page__hero-mark {
    font-size: 2.1rem;
  }
}
</style>
