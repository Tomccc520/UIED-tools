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
import { useRouter } from 'vue-router'
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

const router = useRouter()
const loading = ref(false)
const rankingList = ref<ToolRankingListItem[]>([])
const liveRankingReady = ref(false)

/**
 * 函数说明：根据榜单项判断是否为外链，确保站内站外跳转行为一致。
 */
const isExternalLink = (url: string): boolean => /^https?:\/\//i.test(String(url || '').trim())

/**
 * 函数说明：构建当前页面可展示的榜单数据，接口无结果时自动回退到传入的兜底工具列表。
 */
const displayRankingList = computed<ToolRankingListItem[]>(() => {
  if (rankingList.value.length > 0) {
    return rankingList.value
  }
  return buildFallbackToolRankingItems(props.fallbackTools).slice(0, Math.max(1, Number(props.limit || 8)))
})

/**
 * 函数说明：读取实时工具榜单，失败时保留兜底列表，不打断页面主内容渲染。
 */
const loadToolRankingList = async () => {
  loading.value = true
  try {
    const result = await getToolRankingList({
      period: props.period,
      limit: props.limit,
      sortBy: 'view'
    })
    rankingList.value = result.list
    liveRankingReady.value = result.list.length > 0
  } catch {
    rankingList.value = []
    liveRankingReady.value = false
  } finally {
    loading.value = false
  }
}

/**
 * 函数说明：处理榜单点击，站外地址新开窗口，站内工具页保持当前页跳转。
 */
const handleRankingClick = async (item: ToolRankingListItem) => {
  const targetUrl = String(item.toolUrl || '').trim()
  if (!targetUrl) {
    return
  }
  if (isExternalLink(targetUrl)) {
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
    return
  }
  await router.push(targetUrl)
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
  if (item.viewCount > 0) {
    return `${item.cateTitle || '工具热榜'} · 点击 ${item.viewCount}`
  }
  return item.cateTitle || '工具热榜'
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

    <div v-if="displayRankingList.length > 0" class="tool-ranking-board__list">
      <button
        v-for="item in displayRankingList"
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
          <span>{{ item.viewCount > 0 ? `点击 ${item.viewCount}` : '推荐' }}</span>
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
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
  padding: 1rem;
}

.tool-ranking-board--flat {
  border: 0;
  background: transparent;
  box-shadow: none;
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
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.tool-ranking-board__item:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(99, 102, 241, 0.12);
  background: #ffffff;
}

.tool-ranking-board--flat .tool-ranking-board__item {
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0;
  padding: 1rem 0;
}

.tool-ranking-board--flat .tool-ranking-board__item:hover {
  box-shadow: none;
  transform: none;
  background: rgba(79, 70, 229, 0.03);
  border-color: rgba(79, 70, 229, 0.16);
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
  width: 2.4rem;
  height: 2.4rem;
  font-size: 1rem;
  font-family: Georgia, 'Times New Roman', serif;
}

.tool-ranking-board--flat .tool-ranking-board__content {
  min-width: 0;
  flex: 1;
}

.tool-ranking-board--flat .tool-ranking-board__item-title {
  font-size: 1rem;
  line-height: 1.5rem;
}

.tool-ranking-board--flat .tool-ranking-board__item-meta {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  color: #64748b;
}

.tool-ranking-board--flat .tool-ranking-board__stat {
  color: #0f172a;
  font-size: 0.875rem;
  font-weight: 600;
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
}
</style>
