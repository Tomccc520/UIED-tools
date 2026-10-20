<!--
 * @file RandomTools.vue
 * @description 以结构化推荐卡片呈现随机工具，支持分类筛选与随机刷新
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-17
 -->

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowPathIcon, ArrowUpRightIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useToolRuntimeGate } from '@/composables/useToolRuntimeGate'
import { flattenToolsFromCategories } from '@/services/toolCatalog'
import { useToolsStore } from '@/store/modules/tools'
import type { Tool, ToolCategory } from '@/types/tools'
import ToolIcon from '@/components/Tools/ToolIcon.vue'

interface RandomToolCategory {
  key: string
  title: string
  categoryIndex?: number
}

const store = useToolsStore()
const { openToolEntry } = useToolRuntimeGate()
const loading = ref(false)
const selectedCategory = ref('all')
const randomTools = ref<Tool[]>([])
const categories = ref<RandomToolCategory[]>([
  { key: 'all', title: '全部分类' },
  { key: 'hot', title: '热门工具' }
])

/**
 * 函数说明：将后台一级工具分类转换为随机工具页筛选项。
 */
const buildCategoryOptions = (toolCategories: ToolCategory[]): RandomToolCategory[] => {
  return [
    { key: 'all', title: '全部分类' },
    { key: 'hot', title: '热门工具' },
    ...toolCategories.map((category, categoryIndex) => ({
      key: `category-${categoryIndex}-${category.id}`,
      title: category.title,
      categoryIndex
    }))
  ]
}

/**
 * 函数说明：按工具链接去重，避免后台推荐和分类主数据重复进入推荐列表。
 */
const dedupeTools = (tools: Tool[]): Tool[] => {
  const seen = new Set<string>()
  return tools.filter((tool) => {
    const uniqueKey = String(tool.url || tool.id)
    if (seen.has(uniqueKey)) {
      return false
    }
    seen.add(uniqueKey)
    return true
  })
}

/**
 * 函数说明：使用 Fisher-Yates 算法生成不修改原数组的随机工具顺序。
 */
const shuffleTools = (tools: Tool[]): Tool[] => {
  const shuffledTools = [...tools]
  for (let index = shuffledTools.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffledTools[index], shuffledTools[randomIndex]] = [shuffledTools[randomIndex], shuffledTools[index]]
  }
  return shuffledTools
}

/**
 * 函数说明：根据当前分类构建候选工具池，热门工具为空时回退全部工具。
 */
const resolveToolPool = (): Tool[] => {
  const allTools = flattenToolsFromCategories(store.cates)
  if (selectedCategory.value === 'hot') {
    const recommendTools = dedupeTools(store.recommends || [])
    return recommendTools.length ? recommendTools : allTools
  }
  if (selectedCategory.value === 'all') {
    return dedupeTools([...allTools, ...(store.recommends || [])])
  }
  const selectedOption = categories.value.find((category) => category.key === selectedCategory.value)
  const matchedCategory = typeof selectedOption?.categoryIndex === 'number'
    ? store.cates[selectedOption.categoryIndex]
    : undefined
  return matchedCategory ? flattenToolsFromCategories([matchedCategory]) : allTools
}

/**
 * 函数说明：重新读取后台工具主数据并随机抽取八个候选工具。
 */
const refreshTools = async (reloadCatalog: boolean = true) => {
  loading.value = true
  try {
    if (reloadCatalog || !store.cates.length) {
      await store.getToolCate()
    }
    categories.value = buildCategoryOptions(store.cates)
    randomTools.value = shuffleTools(resolveToolPool()).slice(0, 8)
  } catch (error) {
    console.error('随机工具加载失败:', error)
    randomTools.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 函数说明：切换工具分类并立即生成该分类的新一轮随机推荐。
 */
const selectCategory = (categoryKey: string) => {
  if (selectedCategory.value === categoryKey && randomTools.value.length) {
    return
  }
  selectedCategory.value = categoryKey
  void refreshTools(false)
}

/**
 * 函数说明：点击推荐工具后统一走运行态门禁，避免绕过停用、登录和计费策略。
 */
const handleGallerySelect = async (index: number) => {
  const selectedTool = randomTools.value[index]
  if (!selectedTool) {
    return
  }
  await openToolEntry(selectedTool, {
    target: 'blank',
    action: 'open',
    source: 'random-tools'
  })
}

onMounted(() => {
  void refreshTools()
})
</script>

<template>
  <div class="random-tools-page">
    <article class="random-tools-page__panel">
      <header class="random-tools-page__header">
        <div class="random-tools-page__heading">
          <h1>随机工具推荐</h1>
          <p>选个感兴趣的分类，发现一款顺手的工具。</p>
        </div>
        <button
          type="button"
          class="random-tools-page__refresh"
          :disabled="loading"
          aria-label="换一批推荐"
          @click="refreshTools(false)"
        >
          <ArrowPathIcon :class="{ 'is-spinning': loading }" aria-hidden="true" />
          <span>{{ loading ? '挑选中' : '换一批' }}</span>
        </button>
      </header>

      <nav class="random-tools-page__categories" aria-label="随机工具分类">
        <button
          v-for="category in categories"
          :key="category.key"
          type="button"
          class="random-tools-page__category"
          :aria-pressed="selectedCategory === category.key"
          @click="selectCategory(category.key)"
        >
          {{ category.title }}
        </button>
      </nav>

      <label class="random-tools-page__mobile-filter">
        <span>工具分类</span>
        <span class="random-tools-page__select-wrap">
          <select
            :value="selectedCategory"
            @change="selectCategory(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="category in categories" :key="category.key" :value="category.key">
              {{ category.title }}
            </option>
          </select>
          <ChevronDownIcon aria-hidden="true" />
        </span>
      </label>

      <section class="random-tools-page__stage" aria-label="随机工具推荐" :aria-busy="loading">
        <div class="random-tools-page__summary">
          <h2>为你推荐 <span v-if="!loading">{{ randomTools.length }} 款</span></h2>
          <span>在新窗口打开</span>
        </div>
        <p class="sr-only" role="status" aria-live="polite">
          {{ loading ? '正在挑选工具' : `已推荐 ${randomTools.length} 款工具` }}
        </p>

        <div v-if="loading" class="random-tools-page__loading">
          <ArrowPathIcon aria-hidden="true" />
          <span>正在挑选工具…</span>
        </div>

        <div v-else-if="randomTools.length" class="random-tools-page__grid">
          <button
            v-for="(tool, index) in randomTools"
            :key="tool.toolKey || tool.url || tool.id"
            type="button"
            class="random-tools-page__card"
            :aria-label="`在新窗口打开${tool.title}`"
            @click="handleGallerySelect(index)"
          >
            <ToolIcon :icon="tool.logo" class="random-tools-page__icon" />
            <span class="random-tools-page__card-category">{{ tool.cate || '实用工具' }}</span>
            <h3 :title="tool.title">{{ tool.title }}</h3>
            <p>{{ tool.desc || '打开工具，开始处理你的任务。' }}</p>
            <span class="random-tools-page__card-action">
              <span>打开工具</span>
              <ArrowUpRightIcon aria-hidden="true" />
            </span>
          </button>
        </div>

        <div v-else class="random-tools-page__empty">
          <p>当前分类暂无推荐工具</p>
          <button type="button" @click="refreshTools(false)">重新推荐</button>
        </div>
      </section>
    </article>
  </div>
</template>

<style scoped>
.random-tools-page {
  width: 100%;
  min-width: 0;
  max-width: 1180px;
  margin: 0 auto;
  container: random-tools / inline-size;
  color: var(--uied-color-text);
}

.random-tools-page__panel {
  padding: 28px;
  border: 1px solid var(--uied-color-border);
  border-radius: var(--uied-radius-lg);
  background: var(--uied-color-surface);
}

.random-tools-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.random-tools-page__heading { min-width: 0; }
.random-tools-page__heading h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.02em;
}

.random-tools-page__heading p {
  margin: 8px 0 0;
  color: var(--uied-color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.random-tools-page__refresh {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: var(--uied-radius-md);
  background: var(--uied-color-primary);
  color: var(--uied-color-surface);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--uied-motion-fast) ease;
}

.random-tools-page__refresh:hover:not(:disabled) { background: var(--uied-color-primary-hover); }
.random-tools-page__refresh:disabled { opacity: 0.65; cursor: wait; }
.random-tools-page__refresh svg { width: 18px; height: 18px; }
.random-tools-page__refresh .is-spinning { animation: random-tools-spin 0.8s linear infinite; }

.random-tools-page__categories {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--uied-color-border);
}

.random-tools-page__category {
  min-height: 36px;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: var(--uied-radius-sm);
  background: var(--uied-color-page);
  color: var(--uied-color-text-secondary);
  font-size: 13px;
  line-height: 22px;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--uied-motion-fast) ease, color var(--uied-motion-fast) ease;
}

.random-tools-page__category:hover { color: var(--uied-color-text); background: var(--uied-color-border); }
.random-tools-page__category[aria-pressed="true"] {
  background: var(--uied-color-primary-soft);
  color: var(--uied-color-primary);
  font-weight: 600;
}

.random-tools-page__mobile-filter { display: none; }
.random-tools-page__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 24px 0 16px;
}

.random-tools-page__summary h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.random-tools-page__summary h2 span,
.random-tools-page__summary > span {
  color: var(--uied-color-text-secondary);
  font-size: 12px;
  font-weight: 400;
}

.random-tools-page__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.random-tools-page__card {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  grid-template-rows: 44px auto 1fr auto;
  align-content: start;
  align-items: start;
  column-gap: 12px;
  row-gap: 12px;
  min-width: 0;
  min-height: 216px;
  padding: 20px;
  border: 1px solid var(--uied-color-border);
  border-radius: var(--uied-radius-md);
  background: var(--uied-color-surface);
  color: var(--uied-color-text);
  text-align: left;
  cursor: pointer;
  transition: border-color var(--uied-motion-fast) ease, box-shadow var(--uied-motion-fast) ease;
}

.random-tools-page__card:hover {
  border-color: var(--uied-color-primary);
  box-shadow: 0 4px 12px rgb(16 24 40 / 5%);
}

.random-tools-page__card > .random-tools-page__icon {
  grid-area: 1 / 1;
  width: 44px;
  height: 44px;
  border-radius: var(--uied-radius-md);
}

.random-tools-page__card-category {
  grid-area: 1 / 2;
  align-self: center;
  justify-self: end;
  max-width: 100%;
  overflow: hidden;
  color: var(--uied-color-text-secondary);
  font-size: 12px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.random-tools-page__card h3 {
  display: -webkit-box;
  grid-area: 2 / 1 / auto / -1;
  margin: 0;
  overflow: hidden;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.random-tools-page__card p {
  display: -webkit-box;
  grid-area: 3 / 1 / auto / -1;
  margin: -4px 0 0;
  overflow: hidden;
  color: var(--uied-color-text-secondary);
  font-size: 13px;
  line-height: 22px;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.random-tools-page__card-action {
  display: flex;
  grid-area: 4 / 1 / auto / -1;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 4px;
  color: var(--uied-color-text-secondary);
  font-size: 12px;
  line-height: 20px;
  transition: color var(--uied-motion-fast) ease;
}

.random-tools-page__card-action svg { width: 16px; height: 16px; }
.random-tools-page__card:hover .random-tools-page__card-action { color: var(--uied-color-primary); }

.random-tools-page :is(button, select):focus-visible {
  outline: 2px solid var(--uied-color-primary);
  outline-offset: 3px;
}

.random-tools-page__loading,
.random-tools-page__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 240px;
  color: var(--uied-color-text-secondary);
  font-size: 14px;
}

.random-tools-page__loading svg { width: 20px; height: 20px; animation: random-tools-spin 0.8s linear infinite; }
.random-tools-page__empty { flex-direction: column; }
.random-tools-page__empty p { margin: 0; }
.random-tools-page__empty button {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--uied-color-border);
  border-radius: var(--uied-radius-md);
  background: var(--uied-color-surface);
  color: var(--uied-color-text);
  cursor: pointer;
}

@keyframes random-tools-spin { to { transform: rotate(360deg); } }

@container random-tools (max-width: 1100px) {
  .random-tools-page__categories { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }
}

@container random-tools (max-width: 900px) {
  .random-tools-page__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@container random-tools (max-width: 780px) {
  .random-tools-page__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .random-tools-page__category { min-height: 44px; }
}

@container random-tools (max-width: 680px) {
  .random-tools-page__categories { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}

@container random-tools (max-width: 560px) {
  .random-tools-page__panel { padding: 20px 16px; }
  .random-tools-page__header { align-items: flex-start; gap: 12px; }
  .random-tools-page__heading h1 { font-size: 24px; line-height: 32px; }
  .random-tools-page__heading p { margin-top: 6px; font-size: 13px; }
  .random-tools-page__refresh { gap: 6px; padding: 0 12px; }
  .random-tools-page__categories { display: none; }
  .random-tools-page__mobile-filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--uied-color-border);
    color: var(--uied-color-text-secondary);
    font-size: 13px;
  }
  .random-tools-page__select-wrap { position: relative; flex: 1; max-width: 200px; }
  .random-tools-page__select-wrap select {
    width: 100%;
    min-height: 44px;
    padding: 8px 36px 8px 12px;
    appearance: none;
    border: 1px solid var(--uied-color-border);
    border-radius: var(--uied-radius-sm);
    background: var(--uied-color-surface);
    color: var(--uied-color-text);
    font-size: 14px;
    line-height: 24px;
    cursor: pointer;
  }
  .random-tools-page__select-wrap svg {
    position: absolute;
    top: 14px;
    right: 12px;
    width: 16px;
    height: 16px;
    pointer-events: none;
  }
  .random-tools-page__summary { margin-top: 20px; }
  .random-tools-page__grid { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .random-tools-page__card {
    grid-template-columns: 40px minmax(0, 1fr) 16px;
    grid-template-rows: auto auto auto;
    align-items: center;
    column-gap: 12px;
    row-gap: 4px;
    min-height: 124px;
    padding: 16px;
  }
  .random-tools-page__card > .random-tools-page__icon { grid-area: 1 / 1 / 4 / 2; align-self: start; width: 40px; height: 40px; }
  .random-tools-page__card h3 { grid-area: 1 / 2; font-size: 15px; line-height: 22px; }
  .random-tools-page__card p { grid-area: 2 / 2; margin: 0; font-size: 12px; line-height: 20px; }
  .random-tools-page__card-category { grid-area: 3 / 2; justify-self: start; font-size: 11px; line-height: 18px; }
  .random-tools-page__card-action { grid-area: 1 / 3 / 4 / 4; padding: 0; }
  .random-tools-page__card-action > span { display: none; }
}

@container random-tools (max-width: 350px) {
  .random-tools-page__header { flex-wrap: wrap; }
  .random-tools-page__refresh { margin-top: 4px; }
  .random-tools-page__card { grid-template-columns: 36px minmax(0, 1fr) 16px; column-gap: 8px; padding: 12px; }
  .random-tools-page__card > .random-tools-page__icon { min-width: 36px; min-height: 36px; width: 36px; height: 36px; }
}

@media (prefers-reduced-motion: reduce) {
  .random-tools-page *,
  .random-tools-page :deep(.tool-icon),
  .random-tools-page :deep(svg path) { animation: none !important; transition: none !important; }
}
</style>
