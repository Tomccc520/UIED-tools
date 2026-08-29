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
          <p class="tool-ranking-page__eyebrow">
            <span>RANKING 01</span>
            <i></i>
            {{ toolRankingPeriodLabel }}点击榜
          </p>
          <h1 class="tool-ranking-page__title">{{ toolRankingPageTitle }}</h1>
          <p class="tool-ranking-page__desc">{{ toolRankingPageDescription }}</p>
        </div>

        <div class="tool-ranking-page__hero-panel">
          <span>TOP</span>
          <strong>{{ String(toolRankingPageLimit).padStart(2, '0') }}</strong>
        </div>
      </div>

      <div class="tool-ranking-page__controls">
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
        <div class="tool-ranking-page__summary">
          <span>排序口径 <strong>点击量</strong></span>
          <span>更新周期 <strong>{{ toolRankingPeriodLabel }}</strong></span>
        </div>
      </div>
    </section>

    <section class="tool-ranking-page__board-shell">
      <div class="tool-ranking-page__board-head">
        <div>
          <div class="tool-ranking-page__board-title">本期排行</div>
          <div class="tool-ranking-page__board-note">基于站内工具真实点击统计</div>
        </div>
        <span class="tool-ranking-page__board-badge">{{ toolRankingPeriodLabel }} / TOP {{ toolRankingPageLimit }}</span>
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
  --ranking-ink: #17191d;
  --ranking-muted: #707784;
  --ranking-line: #d9dde4;
  --ranking-accent: #ff5b3d;
  /* 页面背景铺满主内容轨道，避免热榜内容漂浮在浅灰底上。 */
  width: calc(100% + (var(--uied-page-gutter) * 2));
  max-width: none;
  min-height: calc(100vh - 7rem);
  margin: 0 calc(-1 * var(--uied-page-gutter));
  padding: 1.5rem 0 1.75rem;
  background: #ffffff;
  box-sizing: border-box;
  border-radius: 20px;
  overflow: hidden;
  color: var(--ranking-ink);
}

.tool-ranking-page__hero {
  width: min(1120px, 100%);
  margin-right: auto;
  margin-left: auto;
  margin-bottom: 1.4rem;
  padding: 0 0.25rem 1.1rem;
  border-bottom: 1px solid var(--ranking-line);
}

.tool-ranking-page__hero-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2rem;
  align-items: center;
}

.tool-ranking-page__hero-copy {
  min-width: 0;
}

.tool-ranking-page__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 0.45rem;
  font-size: 0.7rem;
  line-height: 1.2rem;
  font-weight: 800;
  color: #666d78;
}

.tool-ranking-page__eyebrow span {
  color: var(--ranking-accent);
}

.tool-ranking-page__eyebrow i {
  width: 28px;
  height: 1px;
  background: #a8adb6;
}

.tool-ranking-page__title {
  margin: 0;
  font-size: 2.15rem;
  line-height: 1.2;
  font-weight: 900;
  color: var(--ranking-ink);
  letter-spacing: 0;
}

.tool-ranking-page__desc {
  max-width: 720px;
  margin: 0.45rem 0 0;
  font-size: 0.86rem;
  line-height: 1.6;
  color: var(--ranking-muted);
}

.tool-ranking-page__controls {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.2rem;
}

.tool-ranking-page__periods {
  display: flex;
  gap: 1.35rem;
  min-width: 260px;
  border-bottom: 1px solid var(--ranking-line);
}

.tool-ranking-page__period-btn {
  position: relative;
  appearance: none;
  border: 0;
  background: transparent;
  color: #747b86;
  padding: 0 0 0.65rem;
  font-size: 0.8rem;
  line-height: 1;
  font-weight: 800;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.tool-ranking-page__period-btn:hover {
  color: var(--ranking-ink);
}

.tool-ranking-page__period-btn--active {
  color: var(--ranking-ink);
}

.tool-ranking-page__period-btn--active::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: var(--ranking-accent);
}

.tool-ranking-page__hero-panel {
  min-width: 126px;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 0.35rem;
  color: var(--ranking-ink);
}

.tool-ranking-page__hero-panel span {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--ranking-muted);
}

.tool-ranking-page__hero-panel strong {
  font-size: 4.2rem;
  line-height: 0.9;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.tool-ranking-page__summary {
  display: flex;
  gap: 1rem;
  color: var(--ranking-muted);
  font-size: 0.72rem;
}

.tool-ranking-page__summary strong {
  margin-left: 0.25rem;
  color: var(--ranking-ink);
}

.tool-ranking-page__board-shell {
  width: min(1120px, 100%);
  margin-right: auto;
  margin-left: auto;
  min-height: 360px;
  padding: 0 0.25rem;
}

.tool-ranking-page__board-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 0.9rem;
}

.tool-ranking-page__board-title {
  font-size: 1.05rem;
  line-height: 1.5rem;
  font-weight: 900;
  color: var(--ranking-ink);
}

.tool-ranking-page__board-note {
  margin-top: 0.18rem;
  font-size: 0.78rem;
  color: var(--ranking-muted);
}

.tool-ranking-page__board-badge {
  flex-shrink: 0;
  color: var(--ranking-muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0;
}

.tool-ranking-page__status {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  color: var(--ranking-ink);
  font-size: 0.95rem;
}

.tool-ranking-page__status--muted {
  color: #64748b;
}

@media (max-width: 768px) {
  .tool-ranking-page {
    padding: 0.9rem var(--uied-page-gutter) 1rem;
  }

  .tool-ranking-page__hero {
    padding: 0 0.1rem 0.9rem;
  }

  .tool-ranking-page__hero-main {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.7rem;
  }

  .tool-ranking-page__board-head {
    align-items: flex-end;
  }

  .tool-ranking-page__title {
    font-size: 1.55rem;
    line-height: 1.9rem;
  }

  .tool-ranking-page__desc {
    font-size: 0.78rem;
    line-height: 1.4rem;
  }

  .tool-ranking-page__hero-panel {
    min-width: auto;
  }

  .tool-ranking-page__hero-panel strong {
    font-size: 2.5rem;
  }

  .tool-ranking-page__controls {
    display: block;
    margin-top: 0.9rem;
  }

  .tool-ranking-page__periods {
    width: 100%;
    min-width: 0;
    justify-content: space-between;
  }

  .tool-ranking-page__period-btn {
    padding-right: 0.2rem;
    padding-left: 0.2rem;
  }

  .tool-ranking-page__summary {
    margin-top: 0.65rem;
    justify-content: space-between;
  }

  .tool-ranking-page__board-shell {
    padding: 0 0.1rem;
  }

  .tool-ranking-page__board-shell,
  .tool-ranking-page__status {
    min-height: 280px;
  }
}

/* 函数说明：超窄屏将榜单数量信息移到标题下方，避免标题与 TOP 数字争抢横向空间。 */
@media (max-width: 360px) {
  .tool-ranking-page__hero-main {
    display: block;
  }

  .tool-ranking-page__hero-panel {
    justify-content: flex-start;
    margin-top: 0.65rem;
  }

  .tool-ranking-page__hero-panel strong {
    font-size: 2.2rem;
  }
}
</style>
