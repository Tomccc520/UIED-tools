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
 * 函数说明：构建排行榜页规则提示，帮助用户快速理解榜单数据来源和使用场景。
 */
const toolRankingRuleNotes = computed(() => {
  return [
    '真实点击自动累计',
    '同周期内动态排序',
    '冷启动时展示工具主数据推荐'
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
    toolRankingPageLimit.value = normalizeToolRankingPageLimit(siteConfig.toolRankingPageLimit)
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
      <div class="tool-ranking-page__hero-main">
        <div class="tool-ranking-page__hero-copy">
          <p class="tool-ranking-page__eyebrow">站内热度 · {{ toolRankingPeriodLabel }}</p>
          <h1 class="tool-ranking-page__title">{{ toolRankingPageTitle }}</h1>
          <p class="tool-ranking-page__desc">{{ toolRankingPageDescription }}</p>

          <div class="tool-ranking-page__periods" aria-label="切换排行榜周期">
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
        </div>

        <div class="tool-ranking-page__hero-panel">
          <div class="tool-ranking-page__hero-panel-title">当前榜单</div>
          <div class="tool-ranking-page__hero-panel-value">Top {{ toolRankingPageLimit }}</div>
          <div class="tool-ranking-page__hero-panel-desc">按点击热度排序，优先展示用户正在高频使用的工具。</div>
        </div>
      </div>

      <div class="tool-ranking-page__meta">
        <div v-for="item in toolRankingHighlights" :key="item.label" class="tool-ranking-page__meta-item">
          <span class="tool-ranking-page__meta-label">{{ item.label }}</span>
          <span class="tool-ranking-page__meta-value">{{ item.value }}</span>
        </div>
      </div>
      <div class="tool-ranking-page__rules">
        <span
          v-for="item in toolRankingRuleNotes"
          :key="item"
          class="tool-ranking-page__rule-item"
        >
          {{ item }}
        </span>
      </div>
    </section>

    <section class="tool-ranking-page__board-shell">
      <div class="tool-ranking-page__board-head">
        <div>
          <div class="tool-ranking-page__board-title">榜单明细</div>
          <div class="tool-ranking-page__board-note">前三名会优先放大展示，后续工具按热度继续排列。</div>
        </div>
        <span class="tool-ranking-page__board-badge">{{ toolRankingPeriodLabel }} · 点击榜</span>
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
  max-width: 1120px;
  margin: 0 auto;
  padding: 1rem 0 1.75rem;
  color: #0f172a;
}

.tool-ranking-page__hero {
  position: relative;
  overflow: hidden;
  margin-bottom: 0.75rem;
  padding: 1.2rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: #ffffff;
}

.tool-ranking-page__hero::before {
  content: '';
  position: absolute;
  inset: 0;
  height: 4px;
  background: linear-gradient(90deg, #2563eb 0%, #06b6d4 52%, #f59e0b 100%);
}

.tool-ranking-page__hero-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
  gap: 1rem;
  align-items: flex-start;
}

.tool-ranking-page__hero-copy {
  min-width: 0;
}

.tool-ranking-page__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.78rem;
  line-height: 1.25rem;
  font-weight: 800;
  color: #2563eb;
}

.tool-ranking-page__title {
  margin: 0;
  font-size: clamp(1.85rem, 4vw, 2.55rem);
  line-height: 1.12;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: 0;
}

.tool-ranking-page__desc {
  max-width: 720px;
  margin: 0.55rem 0 0;
  font-size: 0.92rem;
  line-height: 1.7;
  color: #475569;
}

.tool-ranking-page__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tool-ranking-page__periods {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 1rem;
  padding: 0.28rem;
  width: fit-content;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  background: #f8fafc;
}

.tool-ranking-page__period-btn {
  appearance: none;
  border: 0;
  background: transparent;
  color: #334155;
  border-radius: 999px;
  padding: 0.48rem 0.86rem;
  font-size: 0.8125rem;
  line-height: 1;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.tool-ranking-page__period-btn:hover {
  color: #0f172a;
}

.tool-ranking-page__period-btn--active {
  background: #0f172a;
  color: #ffffff;
}

.tool-ranking-page__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.52rem 0.76rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: #f8fafc;
}

.tool-ranking-page__meta-label {
  font-size: 0.75rem;
  color: #64748b;
}

.tool-ranking-page__meta-value {
  font-size: 0.8125rem;
  font-weight: 800;
  color: #0f172a;
}

.tool-ranking-page__rules {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.65rem;
}

.tool-ranking-page__rule-item {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 0.62rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  font-size: 0.76rem;
  font-weight: 700;
}

.tool-ranking-page__hero-panel {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  padding: 1rem;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.tool-ranking-page__hero-panel-title {
  font-size: 0.78rem;
  font-weight: 800;
  color: #64748b;
}

.tool-ranking-page__hero-panel-value {
  margin-top: 0.45rem;
  font-size: 2.25rem;
  line-height: 1;
  font-weight: 900;
  color: #0f172a;
}

.tool-ranking-page__hero-panel-desc {
  margin-top: 0.65rem;
  font-size: 0.82rem;
  line-height: 1.55;
  color: #64748b;
}

.tool-ranking-page__board-shell {
  min-height: 360px;
  padding: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 8px;
  background: #ffffff;
}

.tool-ranking-page__board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.85rem;
}

.tool-ranking-page__board-title {
  font-size: 1.05rem;
  line-height: 1.5rem;
  font-weight: 900;
  color: #0f172a;
}

.tool-ranking-page__board-note {
  margin-top: 0.18rem;
  font-size: 0.78rem;
  color: #64748b;
}

.tool-ranking-page__board-badge {
  flex-shrink: 0;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  background: #f8fafc;
  color: #0f172a;
  font-size: 0.78rem;
  font-weight: 800;
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
    padding: 0.9rem;
    border-radius: 8px;
  }

  .tool-ranking-page__hero-main {
    grid-template-columns: 1fr;
  }

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

  .tool-ranking-page__periods {
    width: 100%;
  }

  .tool-ranking-page__period-btn {
    flex: 1;
  }

  .tool-ranking-page__board-shell,
  .tool-ranking-page__status {
    min-height: 280px;
  }
}
</style>
