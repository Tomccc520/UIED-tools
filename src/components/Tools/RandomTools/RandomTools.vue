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
import { ArrowPathIcon, ArrowUpRightIcon, SparklesIcon } from '@heroicons/vue/24/outline'
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
    <header class="random-tools-page__header">
      <div class="random-tools-page__heading">
        <p class="random-tools-page__eyebrow">
          <span>发现工具 / 01</span>
          <i></i>
          随机推荐
        </p>
        <h1>给今天换一组顺手工具</h1>
        <p>从工具库里抽取 8 个选择，打开一个，也许刚好解决眼前的任务。</p>
      </div>

      <div class="random-tools-page__actions">
        <div class="random-tools-page__stat" aria-label="本轮工具数量">
          <span>本轮推荐</span>
          <strong>{{ loading ? '—' : String(randomTools.length).padStart(2, '0') }}</strong>
        </div>
        <button
          type="button"
          class="random-tools-page__refresh"
          :disabled="loading"
          title="换一批推荐"
          aria-label="换一批推荐"
          @click="refreshTools(false)"
        >
          <ArrowPathIcon :class="{ 'is-spinning': loading }" aria-hidden="true" />
          <span>换一批</span>
        </button>
      </div>
    </header>

    <nav class="random-tools-page__categories" aria-label="随机工具分类">
      <button
        v-for="category in categories"
        :key="category.key"
        type="button"
        class="random-tools-page__category"
        :class="{ 'random-tools-page__category--active': selectedCategory === category.key }"
        :aria-pressed="selectedCategory === category.key"
        @click="selectCategory(category.key)"
      >
        {{ category.title }}
      </button>
    </nav>

    <section class="random-tools-page__stage" aria-label="随机工具推荐">
      <div class="random-tools-page__stage-topline">
        <div>
          <span class="random-tools-page__stage-kicker">推荐清单</span>
          <strong>本轮推荐</strong>
        </div>
        <span>点击卡片立即打开工具</span>
      </div>
      <div v-if="loading" class="random-tools-page__loading" role="status">
        <i></i>
        <span>正在发现新的工具组合</span>
      </div>

      <div v-else-if="randomTools.length" class="random-tools-page__grid">
        <button
          v-for="(tool, index) in randomTools"
          :key="tool.toolKey || tool.url || tool.id"
          type="button"
          class="random-tools-page__card"
          @click="handleGallerySelect(index)"
        >
          <div class="random-tools-page__card-head">
            <span class="random-tools-page__card-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="random-tools-page__card-cate">{{ tool.cate || '实用工具' }}</span>
            <ArrowUpRightIcon aria-hidden="true" />
          </div>
          <div class="random-tools-page__card-main">
            <ToolIcon :icon="tool.logo" />
            <div>
              <h2>{{ tool.title }}</h2>
              <p>{{ tool.desc || '打开工具，开始处理你的任务。' }}</p>
            </div>
          </div>
          <div class="random-tools-page__card-footer">
            <span>立即使用</span>
            <span class="random-tools-page__card-dot"><SparklesIcon aria-hidden="true" /></span>
          </div>
        </button>
      </div>

      <div v-else class="random-tools-page__empty">
        当前分类暂时没有可推荐的工具
      </div>
    </section>
  </div>
</template>

<style scoped>
.random-tools-page {
  --random-ink: #17191d;
  --random-muted: #747b87;
  --random-line: #d9dde4;
  --random-accent: #5b54e8;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 1.75rem 0 2.25rem;
  color: var(--random-ink);
}

.random-tools-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0 0.25rem 1.4rem;
}

.random-tools-page__heading {
  min-width: 0;
}

.random-tools-page__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 0.45rem;
  color: #636a76;
  font-size: 0.69rem;
  line-height: 1.2rem;
  font-weight: 800;
}

.random-tools-page__eyebrow span {
  color: var(--random-accent);
}

.random-tools-page__eyebrow i {
  width: 26px;
  height: 1px;
  background: #a9aeb8;
}

.random-tools-page__heading h1 {
  margin: 0;
  color: var(--random-ink);
  font-size: clamp(1.8rem, 3vw, 2.55rem);
  line-height: 1.25;
  font-weight: 900;
  letter-spacing: 0;
}

.random-tools-page__heading > p:last-child {
  margin: 0.45rem 0 0;
  color: var(--random-muted);
  max-width: 38rem;
  font-size: 0.88rem;
  line-height: 1.55;
}

.random-tools-page__actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-shrink: 0;
}

.random-tools-page__stat {
  display: grid;
  gap: 0.12rem;
  padding-right: 1rem;
  border-right: 1px solid var(--random-line);
  color: var(--random-muted);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.random-tools-page__stat strong {
  color: var(--random-ink);
  font-size: 1.2rem;
  line-height: 1;
  letter-spacing: 0;
}

.random-tools-page__refresh {
  min-width: 110px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
  border: 0;
  border-radius: 5px;
  background: var(--random-ink);
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition: background-color var(--uied-motion-fast) ease, transform var(--uied-motion-fast) ease;
}

.random-tools-page__refresh:hover:not(:disabled) {
  background: #343842;
  transform: translateY(-1px);
}

.random-tools-page__refresh:disabled {
  cursor: wait;
  opacity: 0.65;
}

.random-tools-page__refresh svg {
  width: 1.15rem;
  height: 1.15rem;
}

.random-tools-page__refresh svg.is-spinning {
  animation: random-tools-spin 0.8s linear infinite;
}

.random-tools-page__categories {
  display: flex;
  gap: 0;
  margin-bottom: 0.65rem;
  padding: 0 0.25rem;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--random-line);
}

.random-tools-page__categories::-webkit-scrollbar {
  display: none;
}

.random-tools-page__category {
  position: relative;
  min-height: 40px;
  padding: 0 0.9rem;
  flex-shrink: 0;
  border: 0;
  background: transparent;
  color: #727986;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--uied-motion-fast) ease, color var(--uied-motion-fast) ease;
}

.random-tools-page__category:hover {
  color: var(--random-ink);
}

.random-tools-page__category--active {
  color: var(--random-ink);
}

.random-tools-page__category--active::after {
  content: '';
  position: absolute;
  right: 0.9rem;
  bottom: -1px;
  left: 0.9rem;
  height: 2px;
  background: var(--random-accent);
}

.random-tools-page__stage {
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--random-ink);
  border-bottom: 1px solid var(--random-line);
  background: #ffffff;
}

.random-tools-page__stage-topline {
  min-height: 3.9rem;
  padding: 0 0.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--random-line);
  color: var(--random-muted);
  font-size: 0.72rem;
}

.random-tools-page__stage-topline > div {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
}

.random-tools-page__stage-topline strong {
  color: var(--random-ink);
  font-size: 1rem;
}

.random-tools-page__stage-kicker {
  color: var(--random-accent);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.random-tools-page__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
}

.random-tools-page__card {
  min-height: 15.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
  padding: 1.2rem 1.25rem 1.05rem;
  border: 0;
  border-right: 1px solid var(--random-line);
  border-bottom: 1px solid var(--random-line);
  background: #fff;
  color: var(--random-ink);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--uied-motion-fast) ease, box-shadow var(--uied-motion-fast) ease, transform var(--uied-motion-fast) ease;
}

.random-tools-page__card:nth-child(4n) {
  border-right: 0;
}

.random-tools-page__card:nth-last-child(-n + 4) {
  border-bottom: 0;
}

.random-tools-page__card:hover {
  position: relative;
  z-index: 1;
  background: #f7f6ff;
  box-shadow: inset 0 0 0 2px var(--random-accent);
  transform: translateY(-1px);
}

.random-tools-page__card:focus-visible {
  position: relative;
  z-index: 2;
  outline: 3px solid rgba(91, 84, 232, 0.28);
  outline-offset: -3px;
}

.random-tools-page__card-head,
.random-tools-page__card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
}

.random-tools-page__card-index {
  color: var(--random-accent);
  font-size: 0.68rem;
  font-weight: 900;
}

.random-tools-page__card-cate {
  flex: 1;
  overflow: hidden;
  color: var(--random-muted);
  font-size: 0.68rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.random-tools-page__card-head svg {
  width: 1rem;
  height: 1rem;
  color: #a0a5b1;
}

.random-tools-page__card-main {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  min-width: 0;
}

.random-tools-page__card-main :deep(.tool-icon) {
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.7rem;
}

.random-tools-page__card-main h2 {
  margin: 0.15rem 0 0.4rem;
  overflow: hidden;
  font-size: 1.05rem;
  line-height: 1.35;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.random-tools-page__card-main p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--random-muted);
  font-size: 0.78rem;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.random-tools-page__card-footer {
  margin-top: auto;
  padding-top: 0.8rem;
  border-top: 1px solid var(--random-line);
  color: #666d79;
  font-size: 0.7rem;
  font-weight: 800;
}

.random-tools-page__card-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #eeedff;
  color: var(--random-accent);
}

.random-tools-page__card-dot svg {
  width: 0.85rem;
  height: 0.85rem;
}

.random-tools-page__loading,
.random-tools-page__empty {
  min-height: 20rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  color: #626a76;
  font-size: 0.88rem;
}

.random-tools-page__loading i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--random-accent);
  animation: random-tools-pulse 0.9s ease-in-out infinite alternate;
}

@keyframes random-tools-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes random-tools-pulse {
  from {
    opacity: 0.35;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1.15);
  }
}

@media (max-width: 768px) {
  .random-tools-page {
    padding: 0.85rem 0 0.75rem;
  }

  .random-tools-page__header {
    align-items: flex-start;
    gap: 1rem;
    padding: 0 0.1rem 0.85rem;
  }

  .random-tools-page__actions {
    gap: 0.6rem;
  }

  .random-tools-page__stat {
    display: none;
  }

  .random-tools-page__heading h1 {
    font-size: 1.5rem;
    line-height: 1.9rem;
  }

  .random-tools-page__heading > p:last-child {
    font-size: 0.78rem;
    line-height: 1.35rem;
  }

  .random-tools-page__refresh {
    min-width: 42px;
    width: 42px;
    height: 42px;
    padding: 0;
  }

  .random-tools-page__refresh span {
    display: none;
  }

  .random-tools-page__categories {
    margin-right: -0.1rem;
    margin-left: -0.1rem;
  }

  .random-tools-page__stage-topline {
    min-height: 3.6rem;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    gap: 0.18rem;
  }

  .random-tools-page__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .random-tools-page__card {
    min-height: 14.5rem;
    padding: 1rem;
  }

  .random-tools-page__card:nth-child(4n) {
    border-right: 1px solid var(--random-line);
  }

  .random-tools-page__card:nth-child(2n) {
    border-right: 0;
  }

  .random-tools-page__card:nth-last-child(-n + 4) {
    border-bottom: 1px solid var(--random-line);
  }

  .random-tools-page__card:nth-last-child(-n + 2) {
    border-bottom: 0;
  }
}

@media (max-width: 480px) {
  .random-tools-page__header {
    gap: 0.75rem;
  }

  .random-tools-page__heading h1 {
    font-size: 1.45rem;
  }

  .random-tools-page__heading > p:last-child {
    max-width: 17rem;
  }

  .random-tools-page__grid {
    grid-template-columns: 1fr;
  }

  .random-tools-page__card,
  .random-tools-page__card:nth-child(2n),
  .random-tools-page__card:nth-child(4n) {
    min-height: 12.5rem;
    border-right: 0;
    border-bottom: 1px solid var(--random-line);
  }

  .random-tools-page__card:last-child {
    border-bottom: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .random-tools-page__refresh,
  .random-tools-page__category {
    transition: none;
  }
}
</style>
