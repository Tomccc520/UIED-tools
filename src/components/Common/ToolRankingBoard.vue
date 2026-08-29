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
  emptyText?: string
}>(), {
  title: '工具热榜',
  period: 'week',
  limit: 8,
  compact: false,
  flat: false,
  showHeader: true,
  fallbackTools: () => [],
  emptyText: '当前还没有足够的排行榜数据'
})

const { openToolEntry } = useToolRuntimeGate()
const loading = ref(false)
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
  const fallbackRankingItems = buildFallbackToolRankingItems(props.fallbackTools)
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
 * 函数说明：独立排行榜页抽取前三名，用于强化榜单首屏重点信息。
 */
const topRankingItems = computed(() => displayRankingList.value.slice(0, 3))

/**
 * 函数说明：独立排行榜页抽取前三名之后的列表项，避免同一工具重复显示。
 */
const secondaryRankingItems = computed(() => {
  if (props.flat && !props.compact && displayRankingList.value.length > 3) {
    return displayRankingList.value.slice(3)
  }
  return displayRankingList.value
})

/**
 * 函数说明：计算当前榜单最高点击量，用于渲染相对热度条。
 */
const maxViewCount = computed(() => {
  return Math.max(1, ...displayRankingList.value.map((item) => Number(item.viewCount || 0)))
})

/**
 * 函数说明：读取实时工具榜单，失败时保留兜底列表，不打断页面主内容渲染。
 */
const loadToolRankingList = async () => {
  const currentRequestId = latestLoadRequestId.value + 1
  latestLoadRequestId.value = currentRequestId
  loading.value = true
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
  } finally {
    if (currentRequestId === latestLoadRequestId.value) {
      loading.value = false
    }
  }
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

/**
 * 函数说明：根据点击量与排名生成热度条宽度，让榜单视觉层级更明确。
 */
const resolveRankingHeatStyle = (item: ToolRankingListItem) => {
  const viewCount = Number(item.viewCount || 0)
  const basePercent = viewCount > 0 ? Math.round((viewCount / maxViewCount.value) * 100) : 36
  const rankBonus = Math.max(0, 18 - Number(item.rank || 0) * 3)
  return {
    width: `${Math.min(100, Math.max(18, basePercent + rankBonus))}%`
  }
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
  <div :class="['tool-ranking-board', { 'tool-ranking-board--compact': compact, 'tool-ranking-board--flat': flat }]">
    <div v-if="showHeader" class="tool-ranking-board__header">
      <div>
        <div class="tool-ranking-board__title">{{ title }}</div>
        <div class="tool-ranking-board__subtitle">
          {{ liveRankingReady ? '实时按工具点击量排行' : '当前展示兜底推荐内容，榜单会在产生真实点击后自动接管' }}
        </div>
      </div>
      <div class="tool-ranking-board__badge">{{ period === 'day' ? '日榜' : period === 'month' ? '月榜' : period === 'all' ? '总榜' : '周榜' }}</div>
    </div>

    <div v-if="displayRankingList.length > 0 && flat && !compact" class="tool-ranking-board__podium">
      <button
        v-for="item in topRankingItems"
        :key="`podium-${item.toolKey}-${item.rank}`"
        type="button"
        class="tool-ranking-board__podium-item"
        :class="`tool-ranking-board__podium-item--rank-${item.rank}`"
        @click="handleRankingClick(item)"
      >
        <div class="tool-ranking-board__podium-rank">No.{{ item.rank }}</div>
        <div class="tool-ranking-board__podium-title">{{ item.toolTitle }}</div>
        <div class="tool-ranking-board__podium-meta">{{ resolveRankingMetaText(item) }}</div>
        <div class="tool-ranking-board__heat">
          <span :style="resolveRankingHeatStyle(item)"></span>
        </div>
        <div class="tool-ranking-board__podium-stat">{{ resolveRankingStatText(item) }}</div>
      </button>
    </div>

    <div
      v-if="displayRankingList.length > 0"
      class="tool-ranking-board__list"
      :class="{ 'tool-ranking-board__list--with-podium': flat && !compact }"
    >
      <button
        v-for="item in secondaryRankingItems"
        :key="`${item.toolKey}-${item.rank}`"
        type="button"
        class="tool-ranking-board__item"
        @click="handleRankingClick(item)"
      >
        <div class="tool-ranking-board__rank" :class="{ 'tool-ranking-board__rank--top': item.rank <= 3 }">
          {{ item.rank }}
        </div>
        <div class="tool-ranking-board__content">
          <div class="tool-ranking-board__item-title">{{ item.toolTitle }}</div>
          <div class="tool-ranking-board__item-meta">{{ resolveRankingMetaText(item) }}</div>
        </div>
        <div v-if="!compact" class="tool-ranking-board__stat">
          <span>{{ resolveRankingStatText(item) }}</span>
          <i class="tool-ranking-board__stat-bar" :style="resolveRankingHeatStyle(item)"></i>
        </div>
      </button>
    </div>

    <div v-else class="tool-ranking-board__empty">
      {{ loading ? '工具热榜加载中...' : emptyText }}
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
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
  font-size: 0.75rem;
  font-weight: 600;
}

.tool-ranking-board__list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.tool-ranking-board__list--with-podium {
  margin-top: 1rem;
}

.tool-ranking-board__podium {
  display: grid;
  grid-template-columns: 1.1fr 1fr 1fr;
  gap: 0;
  border: 1px solid #d9dde4;
  border-radius: 16px;
  overflow: hidden;
  background: #f3f5f7;
}

.tool-ranking-board__podium-item {
  position: relative;
  min-height: 176px;
  overflow: hidden;
  border: 0;
  border-right: 1px solid #d9dde4;
  border-radius: 0;
  padding: 1.15rem 1.2rem;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.tool-ranking-board__podium-item:last-child {
  border-right: 0;
}

.tool-ranking-board__podium-item::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background: #17191d;
}

.tool-ranking-board__podium-item:hover {
  background: #ffffff;
}

.tool-ranking-board__podium-item--rank-1 {
  background: #fff9e9;
}

.tool-ranking-board__podium-item--rank-1::before {
  background: #f2b624;
}

.tool-ranking-board__podium-item--rank-2::before {
  background: #3478e5;
}

.tool-ranking-board__podium-item--rank-3::before {
  background: #35a46f;
}

.tool-ranking-board__podium-rank {
  font-size: 0.7rem;
  line-height: 1.2;
  font-weight: 800;
  color: #6c737e;
}

.tool-ranking-board__podium-title {
  margin-top: 1.2rem;
  min-height: 2.7rem;
  font-size: 1.12rem;
  line-height: 1.35;
  font-weight: 900;
  color: #17191d;
}

.tool-ranking-board__podium-meta {
  margin-top: 0.45rem;
  font-size: 0.75rem;
  line-height: 1.45;
  color: #747b86;
}

.tool-ranking-board__podium-stat {
  margin-top: 0.65rem;
  font-size: 0.78rem;
  line-height: 1.2;
  font-weight: 800;
  color: #17191d;
}

.tool-ranking-board__heat {
  position: relative;
  width: 100%;
  height: 5px;
  margin-top: 0.75rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(23, 25, 29, 0.1);
}

.tool-ranking-board__heat span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #3478e5;
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

.tool-ranking-board--flat .tool-ranking-board__item {
  min-height: 72px;
  background: transparent;
  border: 0;
  border: 1px solid #e0e3e8;
  border-radius: 12px;
  padding: 0.9rem 0.75rem;
}

.tool-ranking-board--flat .tool-ranking-board__item:hover {
  transform: none;
  background: #f6f7f8;
  border-color: #cfd5de;
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
  background: #4f46e5;
  color: #ffffff;
}

.tool-ranking-board--flat .tool-ranking-board__rank {
  width: 2.6rem;
  height: auto;
  justify-content: flex-start;
  background: transparent;
  color: #787f8a;
  font-size: 0.9rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
}

.tool-ranking-board--flat .tool-ranking-board__content {
  min-width: 0;
  flex: 1;
}

.tool-ranking-board--flat .tool-ranking-board__item-title {
  font-size: 0.95rem;
  line-height: 1.5rem;
  font-weight: 800;
}

.tool-ranking-board--flat .tool-ranking-board__item-meta {
  margin-top: 0.125rem;
  font-size: 0.76rem;
  color: #747b86;
}

.tool-ranking-board--flat .tool-ranking-board__stat {
  display: grid;
  min-width: 92px;
  gap: 0.38rem;
  color: #17191d;
  font-size: 0.78rem;
  font-weight: 800;
}

.tool-ranking-board__stat-bar {
  display: block;
  height: 4px;
  max-width: 92px;
  border-radius: 999px;
  background: #3478e5;
}

.tool-ranking-board--flat .tool-ranking-board__empty {
  padding: 2rem 0.25rem;
}

.tool-ranking-board__content {
  min-width: 0;
  flex: 1;
}

.tool-ranking-board__item-title {
  font-size: 0.9375rem;
  line-height: 1.375rem;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tool-ranking-board__item-meta {
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
  color: #4f46e5;
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

  .tool-ranking-board__podium {
    grid-template-columns: 1fr;
  }

  .tool-ranking-board__podium-item {
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid #d9dde4;
  }

  .tool-ranking-board__podium-item:last-child {
    border-bottom: 0;
  }

  .tool-ranking-board__podium-title {
    min-height: auto;
    font-size: 1rem;
  }

  .tool-ranking-board--flat .tool-ranking-board__item {
    align-items: center;
  }

  .tool-ranking-board--flat .tool-ranking-board__item-title {
    display: -webkit-box;
    overflow: hidden;
    white-space: normal;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .tool-ranking-board--flat .tool-ranking-board__stat {
    min-width: 72px;
    text-align: right;
  }
}
</style>
