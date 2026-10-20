<!--
 * @file ToolRankingBoard.vue
 * @description 工具排行榜展示组件，支持首页和工具右侧栏共用同一套榜单展示逻辑
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
-->

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useToolRuntimeGate, type ToolRuntimeEntry } from '@/composables/useToolRuntimeGate'
import { buildFallbackToolRankingItems, getToolRankingList, type ToolRankingListItem, type ToolRankingPeriod } from '@/services/toolRanking'
import type { Tool } from '@/types/tools'

const props = withDefaults(defineProps<{
  title?: string
  period?: ToolRankingPeriod
  limit?: number
  compact?: boolean
  flat?: boolean
  showHeader?: boolean
  fallbackTools?: Tool[]
  useFallbackOnError?: boolean
  emptyText?: string
  errorText?: string
  showRetry?: boolean
}>(), {
  title: '工具热榜',
  period: 'week',
  limit: 8,
  compact: false,
  flat: false,
  showHeader: true,
  fallbackTools: () => [],
  useFallbackOnError: true,
  emptyText: '当前还没有足够的排行榜数据',
  errorText: '排行榜加载失败，请重试',
  showRetry: false
})

const { openToolEntry } = useToolRuntimeGate()
const loading = ref(false)
const loadError = ref(false)
const rankingList = ref<ToolRankingListItem[]>([])
const liveRankingReady = ref(false)
const latestLoadRequestId = ref(0)

/**
 * 函数说明：标准化榜单展示数量，避免后台配置异常导致页面列表过长或空白。
 */
const normalizedLimit = computed(() => {
  const limitValue = Number(props.limit || 8)
  return Math.min(20, Math.max(1, Number.isFinite(limitValue) ? Math.floor(limitValue) : 8))
})

/**
 * 函数说明：将榜单项转换为统一工具运行态入口，复用公共门禁处理停用和跳转。
 */
const toRankingRuntimeEntry = (item: ToolRankingListItem): ToolRuntimeEntry => {
  return {
    title: item.toolTitle,
    url: item.toolUrl,
    toolKey: item.toolKey,
    status: item.status,
    remark: item.remark
  }
}

/**
 * 函数说明：生成榜单项去重键，避免实时榜单与兜底推荐重复展示同一个工具。
 */
const resolveRankingUniqueKey = (item: ToolRankingListItem): string => {
  return String(item.toolKey || item.toolUrl || '').trim().toLowerCase()
}

/**
 * 函数说明：构建当前页面可展示的榜单数据，优先保留真实榜单并用去重后的推荐工具补足配置数量。
 */
const displayRankingList = computed<ToolRankingListItem[]>(() => {
  const fallbackRankingItems = !loadError.value || props.useFallbackOnError
    ? buildFallbackToolRankingItems(props.fallbackTools)
    : []
  const seenKeys = new Set(rankingList.value.map(resolveRankingUniqueKey))
  const supplementalItems = fallbackRankingItems.filter((item) => {
    const uniqueKey = resolveRankingUniqueKey(item)
    if (!uniqueKey || seenKeys.has(uniqueKey)) {
      return false
    }
    seenKeys.add(uniqueKey)
    return true
  })
  const displayItems = [...rankingList.value, ...supplementalItems]

  return displayItems.slice(0, normalizedLimit.value).map((item, index) => ({
    ...item,
    rank: index + 1
  }))
})

/**
 * 函数说明：读取实时工具榜单，失败时保留兜底列表，不打断页面主内容渲染。
 */
const loadToolRankingList = async () => {
  const currentRequestId = latestLoadRequestId.value + 1
  latestLoadRequestId.value = currentRequestId
  loading.value = true
  loadError.value = false
  try {
    const result = await getToolRankingList({
      period: props.period,
      limit: props.limit,
      sortBy: 'view'
    })
    if (currentRequestId !== latestLoadRequestId.value) {
      return
    }
    rankingList.value = result.list
    liveRankingReady.value = result.list.length > 0
  } catch {
    if (currentRequestId !== latestLoadRequestId.value) {
      return
    }
    rankingList.value = []
    liveRankingReady.value = false
    loadError.value = true
    reportToolRankingLoadError(props.period)
  } finally {
    if (currentRequestId === latestLoadRequestId.value) {
      loading.value = false
    }
  }
}

/**
 * 函数说明：记录排行榜请求失败的必要信息，方便前端排障但不把异常堆栈展示给用户。
 * @param period 当前排行榜周期
 */
const reportToolRankingLoadError = (period: ToolRankingPeriod): void => {
  console.error('[tool-ranking] load failed', {
    period,
    message: '排行榜接口请求失败或超时'
  })
}

/**
 * 函数说明：重新发起排行榜请求，供失败状态按钮使用。
 */
const handleRetryToolRanking = (): void => {
  void loadToolRankingList()
}

/**
 * 函数说明：处理榜单点击，站外地址新开窗口，站内工具页保持当前页跳转。
 */
const handleRankingClick = async (item: ToolRankingListItem) => {
  await openToolEntry(toRankingRuntimeEntry(item), {
    target: 'current',
    action: 'open',
    source: 'tool-ranking'
  })
}

/**
 * 函数说明：输出榜单项的辅助说明，首页显示分类与分值，右侧紧凑模式优先显示开始/成功数据。
 */
const resolveRankingMetaText = (item: ToolRankingListItem): string => {
  if (props.compact) {
    if (item.startCount > 0 || item.successCount > 0) {
      return `开始 ${item.startCount} · 成功 ${item.successCount}`
    }
    return item.cateTitle || '工具热榜'
  }
  if (props.flat) {
    return item.cateTitle || '工具热榜'
  }
  if (item.viewCount > 0) {
    return `${item.cateTitle || '工具热榜'} · 点击 ${item.viewCount}`
  }
  return item.cateTitle || '工具热榜'
}

/**
 * 函数说明：输出榜单项右侧统计文案，兼容真实点击数据和冷启动推荐数据。
 */
const resolveRankingStatText = (item: ToolRankingListItem): string => {
  if (item.viewCount > 0) {
    return `点击 ${item.viewCount}`
  }
  return '推荐'
}

onMounted(() => {
  void loadToolRankingList()
})

watch(
  () => [props.period, props.limit],
  () => {
    void loadToolRankingList()
  }
)
</script>

<template>
  <div :class="['tool-ranking-board', { 'tool-ranking-board--compact': compact, 'tool-ranking-board--flat': flat }]" :aria-busy="loading">
    <div v-if="showHeader" class="tool-ranking-board__header">
      <div>
        <div class="tool-ranking-board__title">{{ title }}</div>
        <div class="tool-ranking-board__subtitle">
          {{ liveRankingReady ? '实时按工具点击量排行' : '当前展示兜底推荐内容，榜单会在产生真实点击后自动接管' }}
        </div>
      </div>
      <div class="tool-ranking-board__badge">{{ period === 'day' ? '日榜' : period === 'month' ? '月榜' : period === 'all' ? '总榜' : '周榜' }}</div>
    </div>

    <template v-if="displayRankingList.length > 0 && (!loading || !flat)">
      <ol class="tool-ranking-board__list" :aria-label="`${title}列表`">
        <li v-for="item in displayRankingList" :key="`${item.toolKey}-${item.rank}`">
          <button type="button" class="tool-ranking-board__item" @click="handleRankingClick(item)">
            <span class="tool-ranking-board__rank" :class="{ 'tool-ranking-board__rank--top': item.rank <= 3 }">
              <span class="sr-only">第</span>
              {{ flat && !compact ? String(item.rank).padStart(2, '0') : item.rank }}
              <span class="sr-only">名</span>
            </span>
            <span class="tool-ranking-board__content">
              <span class="tool-ranking-board__item-title">{{ item.toolTitle }}</span>
              <span v-if="flat && !compact && item.toolDescription" class="tool-ranking-board__item-description">{{ item.toolDescription }}</span>
              <span class="tool-ranking-board__item-meta">{{ resolveRankingMetaText(item) }}</span>
            </span>
            <span v-if="!compact" class="tool-ranking-board__stat">
              <template v-if="flat">
                <span class="tool-ranking-board__stat-value">{{ item.viewCount }}</span>
                <span class="tool-ranking-board__stat-label">次点击</span>
              </template>
              <template v-else>{{ resolveRankingStatText(item) }}</template>
            </span>
            <ChevronRightIcon v-if="flat && !compact" class="tool-ranking-board__arrow" aria-hidden="true" />
          </button>
        </li>
      </ol>
    </template>

    <div v-else class="tool-ranking-board__empty" role="status" aria-live="polite">
      <template v-if="loading">
        工具热榜加载中...
      </template>
      <template v-else-if="loadError">
        <span>{{ errorText }}</span>
        <button v-if="showRetry" type="button" class="tool-ranking-board__retry" @click="handleRetryToolRanking">
          重试
        </button>
      </template>
      <template v-else>
        {{ emptyText }}
      </template>
    </div>
  </div>
</template>

<style scoped>
.tool-ranking-board {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 20px;
  padding: 1rem;
}

.tool-ranking-board--flat {
  border: 0;
  background: transparent;
  padding: 0;
}

.tool-ranking-board--compact {
  border-radius: 16px;
  padding: 0.875rem;
}

.tool-ranking-board__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
}

.tool-ranking-board__title {
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.tool-ranking-board__subtitle {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  line-height: 1.25rem;
  color: #64748b;
}

.tool-ranking-board__badge {
  flex-shrink: 0;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background: var(--uied-color-primary-soft);
  color: var(--uied-color-primary);
  font-size: 0.75rem;
  font-weight: 600;
}

.tool-ranking-board__list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tool-ranking-board__item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 0;
  background: rgba(248, 250, 252, 0.92);
  border-radius: 16px;
  padding: 0.75rem;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.tool-ranking-board__item:hover {
  transform: translateY(-1px);
  background: #ffffff;
}

.tool-ranking-board__rank {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.08);
  color: #334155;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
}

.tool-ranking-board__rank--top {
  background: var(--uied-color-primary);
  color: #ffffff;
}

.tool-ranking-board__content {
  min-width: 0;
  flex: 1;
}

.tool-ranking-board__item-title {
  display: block;
  font-size: 0.9375rem;
  line-height: 1.375rem;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-ranking-board__item-meta {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.75rem;
  line-height: 1.25rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-ranking-board__stat {
  flex-shrink: 0;
  font-size: 0.75rem;
  line-height: 1.25rem;
  color: var(--uied-color-primary);
  font-weight: 600;
}

.tool-ranking-board__empty {
  padding: 0.875rem;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.9);
  font-size: 0.875rem;
  line-height: 1.5rem;
  color: #64748b;
}

.tool-ranking-board__retry {
  display: inline-flex;
  min-height: 2.25rem;
  align-items: center;
  justify-content: center;
  margin-left: 0.75rem;
  padding: 0 0.9rem;
  color: #fff;
  background: var(--uied-color-primary);
  border: 0;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.tool-ranking-board__retry:focus-visible {
  outline: 2px solid var(--uied-color-primary);
  outline-offset: 2px;
}

.tool-ranking-board--compact .tool-ranking-board__header {
  margin-bottom: 0.75rem;
}

.tool-ranking-board--compact .tool-ranking-board__title {
  font-size: 0.9375rem;
}

.tool-ranking-board--compact .tool-ranking-board__subtitle {
  font-size: 0.7rem;
}

.tool-ranking-board--compact .tool-ranking-board__item {
  padding: 0.625rem 0.6875rem;
  border-radius: 14px;
}

.tool-ranking-board--compact .tool-ranking-board__rank {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.8125rem;
}

@media (max-width: 768px) {
  .tool-ranking-board {
    border-radius: 18px;
  }

  .tool-ranking-board__header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* 独立榜单借鉴资讯页的节点列表，紧凑侧栏继续保留原有布局。 */
.tool-ranking-board--flat {
  container: ranking-board / inline-size;
  border-radius: 0;
}

.tool-ranking-board--flat .tool-ranking-board__list {
  gap: 0;
  padding-left: 24px;
}

.tool-ranking-board--flat li {
  position: relative;
}

.tool-ranking-board--flat li::before {
  position: absolute;
  z-index: 1;
  top: calc(50% - 4px);
  left: -24px;
  width: 8px;
  height: 8px;
  box-sizing: border-box;
  border: 2px solid var(--uied-color-primary);
  border-radius: 50%;
  background: var(--uied-color-surface);
  content: '';
}

.tool-ranking-board--flat li::after {
  position: absolute;
  top: 0;
  bottom: 0;
  left: -20.5px;
  width: 1px;
  background: var(--uied-color-primary-soft);
  content: '';
}

.tool-ranking-board--flat li:first-child::after {
  top: 50%;
}

.tool-ranking-board--flat li:last-child::after {
  bottom: 50%;
}

.tool-ranking-board--flat .tool-ranking-board__item {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 90px 16px;
  align-items: center;
  gap: 20px;
  width: 100%;
  min-height: 124px;
  padding: 24px 12px;
  border: 0;
  border-bottom: 1px solid var(--uied-color-border);
  border-radius: 0;
  background: var(--uied-color-surface);
  transition: background-color var(--uied-motion-fast);
}

.tool-ranking-board--flat li:last-child .tool-ranking-board__item {
  border-bottom: 0;
}

.tool-ranking-board--flat .tool-ranking-board__item:hover {
  transform: none;
  background: var(--uied-color-surface-subtle);
}

.tool-ranking-board--flat .tool-ranking-board__item:focus-visible {
  position: relative;
  outline: 2px solid var(--uied-color-primary);
  outline-offset: -2px;
  border-radius: var(--uied-radius-sm);
}

.tool-ranking-board--flat .tool-ranking-board__rank {
  width: 56px;
  height: 36px;
  border-radius: var(--uied-radius-md);
  background: var(--uied-color-surface-subtle);
  color: var(--uied-color-text-secondary);
  font-size: 15px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.tool-ranking-board--flat .tool-ranking-board__rank--top {
  background: var(--uied-color-primary-soft);
  color: var(--uied-color-primary);
  font-weight: 600;
}

.tool-ranking-board--flat .tool-ranking-board__item-title {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  white-space: normal;
  font-size: 17px;
  line-height: 1.6;
  font-weight: 600;
  color: var(--uied-color-text);
}

.tool-ranking-board__item-description {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 6px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--uied-color-text-secondary);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.75;
}

.tool-ranking-board--flat .tool-ranking-board__item-meta {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--uied-color-text-secondary);
}

.tool-ranking-board--flat .tool-ranking-board__stat {
  min-width: 0;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 5px;
  color: var(--uied-color-text);
  font-size: 15px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.tool-ranking-board__stat-label {
  color: var(--uied-color-text-secondary);
  font-size: 11px;
  font-weight: 400;
}

.tool-ranking-board__arrow {
  width: 16px;
  height: 16px;
  color: var(--uied-color-text-secondary);
}

.tool-ranking-board--flat .tool-ranking-board__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 280px;
  padding: 24px;
  border-radius: var(--uied-radius-md);
  background: var(--uied-color-surface-subtle);
  color: var(--uied-color-text-secondary);
  text-align: center;
}

.tool-ranking-board--flat .tool-ranking-board__retry {
  min-height: 44px;
  margin: 0;
  padding-inline: 24px;
  background: var(--uied-color-primary);
  font-size: 14px;
}

@container ranking-board (max-width: 540px) {
  .tool-ranking-board--flat .tool-ranking-board__list {
    padding-left: 16px;
  }

  .tool-ranking-board--flat li::before {
    left: -16px;
    top: calc(50% - 3px);
    width: 6px;
    height: 6px;
    border-width: 1.5px;
  }

  .tool-ranking-board--flat li::after {
    left: -13.5px;
  }

  .tool-ranking-board--flat .tool-ranking-board__item {
    grid-template-columns: 34px minmax(0, 1fr) 42px 12px;
    gap: 8px;
    min-height: 96px;
    padding: 20px 4px;
  }

  .tool-ranking-board--flat .tool-ranking-board__rank {
    width: 32px;
    height: 30px;
    font-size: 13px;
  }

  .tool-ranking-board--flat .tool-ranking-board__stat {
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
  }

  .tool-ranking-board--flat .tool-ranking-board__item-title {
    font-size: 15px;
  }

  .tool-ranking-board__item-description {
    font-size: 13px;
  }

  .tool-ranking-board--flat .tool-ranking-board__item-meta {
    margin-top: 6px;
    font-size: 12px;
  }

  .tool-ranking-board__arrow {
    width: 12px;
    height: 12px;
  }
}
</style>
