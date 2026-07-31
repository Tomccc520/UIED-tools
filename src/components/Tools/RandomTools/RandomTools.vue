<!--
 * @file RandomTools.vue
 * @description 使用循环 WebGL 画廊呈现随机工具推荐
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-17
 -->

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowPathIcon, CursorArrowRaysIcon } from '@heroicons/vue/24/outline'
import CircularGallery, { type CircularGalleryItem } from '@/components/Common/CircularGallery.vue'
import { useToolRuntimeGate } from '@/composables/useToolRuntimeGate'
import { flattenToolsFromCategories } from '@/services/toolCatalog'
import { useToolsStore } from '@/store/modules/tools'
import type { Tool, ToolCategory } from '@/types/tools'

interface RandomToolCategory {
  key: string
  title: string
  categoryIndex?: number
}

interface CoverPalette {
  background: string
  foreground: string
  accent: string
  muted: string
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

const coverPalettes: CoverPalette[] = [
  { background: '#18191d', foreground: '#f7f4ec', accent: '#f4c84a', muted: '#35363d' },
  { background: '#2656d8', foreground: '#ffffff', accent: '#ff6b52', muted: '#1d43aa' },
  { background: '#dce7d6', foreground: '#18221a', accent: '#4b7d50', muted: '#b9cbb4' },
  { background: '#f4f0e8', foreground: '#17213b', accent: '#3468e8', muted: '#d6d0c5' },
  { background: '#7b2e46', foreground: '#fff7f3', accent: '#f3a3b8', muted: '#5d2235' },
  { background: '#173c45', foreground: '#f1fcf8', accent: '#63d4b2', muted: '#285762' },
  { background: '#b64b31', foreground: '#fff8ee', accent: '#ffd067', muted: '#8d3826' },
  { background: '#d8d0ea', foreground: '#251d34', accent: '#6a4eb0', muted: '#b7acd1' }
]

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
 * 函数说明：按工具链接去重，避免后台推荐和分类主数据重复进入循环画廊。
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
 * 函数说明：控制 Canvas 标题行宽，兼容中英文长工具名。
 */
const splitCoverTitle = (title: string): string[] => {
  const normalizedTitle = String(title || '实用工具').trim()
  if (normalizedTitle.length <= 9) {
    return [normalizedTitle]
  }
  const splitIndex = Math.min(10, Math.ceil(normalizedTitle.length / 2))
  return [normalizedTitle.slice(0, splitIndex), normalizedTitle.slice(splitIndex, splitIndex + 10)]
}

/**
 * 函数说明：为缺少封面图的工具生成稳定 Canvas 位图，供 WebGL 作为真实纹理加载。
 */
const createToolCover = (tool: Tool, index: number): string => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    return ''
  }

  const palette = coverPalettes[index % coverPalettes.length]
  const width = 720
  const height = 900
  canvas.width = width
  canvas.height = height
  context.fillStyle = palette.background
  context.fillRect(0, 0, width, height)

  context.strokeStyle = palette.muted
  context.lineWidth = 2
  for (let row = 0; row <= 4; row += 1) {
    const y = 68 + row * 176
    context.beginPath()
    context.moveTo(54, y)
    context.lineTo(width - 54, y)
    context.stroke()
  }

  context.fillStyle = palette.accent
  context.fillRect(0, 0, width, 18)
  context.fillRect(54, 68, 118, 7)
  context.fillRect(width - 176, height - 76, 122, 7)

  context.strokeStyle = palette.accent
  context.lineWidth = 4
  context.strokeRect(width - 156, 66, 102, 102)
  context.fillStyle = palette.accent
  context.fillRect(width - 130, 92, 50, 50)

  context.fillStyle = palette.foreground
  context.font = '700 24px "PingFang SC", "Microsoft YaHei", sans-serif'
  context.textBaseline = 'top'
  context.fillText(`UIED / ${String(index + 1).padStart(2, '0')}`, 54, 106)
  context.fillStyle = palette.accent
  context.font = '700 23px "PingFang SC", "Microsoft YaHei", sans-serif'
  context.fillText(String(tool.cate || '效率工具').toUpperCase(), 54, 158)

  context.save()
  context.globalAlpha = 0.11
  context.fillStyle = palette.foreground
  context.font = '900 232px "Arial Black", sans-serif'
  context.textAlign = 'right'
  context.fillText(String(index + 1).padStart(2, '0'), width - 42, 228)
  context.restore()

  context.fillStyle = palette.foreground
  context.font = '800 56px "PingFang SC", "Microsoft YaHei", sans-serif'
  splitCoverTitle(tool.title).forEach((line, lineIndex) => {
    context.fillText(line, 54, 382 + lineIndex * 76)
  })

  context.fillStyle = palette.foreground
  context.globalAlpha = 0.68
  context.font = '500 22px "PingFang SC", "Microsoft YaHei", sans-serif'
  const description = String(tool.desc || '发现一个新的实用工具').replace(/\s+/g, ' ').slice(0, 34)
  context.fillText(description, 54, height - 112)
  context.globalAlpha = 1
  return canvas.toDataURL('image/png')
}

/**
 * 函数说明：将当前随机工具转换为 CircularGallery 所需的封面数据。
 */
const galleryItems = computed<CircularGalleryItem[]>(() => {
  if (typeof document === 'undefined') {
    return []
  }
  return randomTools.value.map((tool, index) => ({
    key: tool.toolKey || tool.url || tool.id,
    image: createToolCover(tool, index),
    text: tool.title
  }))
})

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
 * 函数说明：点击画廊工具后统一走运行态门禁，避免绕过停用、登录和计费策略。
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
          <span>DISCOVERY 01</span>
          <i></i>
          随机工具
        </p>
        <h1>今天，换一组工具看看</h1>
        <p>从工具库中重新组合一组值得尝试的选择。</p>
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

    <section class="random-tools-page__stage" aria-label="随机工具画廊">
      <div class="random-tools-page__stage-topline">
        <span>UIED TOOLS / RANDOM DECK</span>
        <span class="random-tools-page__stage-count">
          {{ loading ? 'LOADING' : String(randomTools.length).padStart(2, '0') }}
          <CursorArrowRaysIcon aria-hidden="true" />
        </span>
      </div>

      <div v-if="loading" class="random-tools-page__loading" role="status">
        <i></i>
        <span>正在发现新的工具组合</span>
      </div>

      <CircularGallery
        v-else-if="galleryItems.length"
        class="random-tools-page__gallery"
        :items="galleryItems"
        :bend="1.55"
        text-color="#17191d"
        :border-radius="0.028"
        font="800 27px 'PingFang SC', 'Microsoft YaHei', sans-serif"
        :scroll-speed="1.8"
        :scroll-ease="0.06"
        @select="handleGallerySelect"
      />

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
  padding: 1.75rem 0 1.5rem;
  color: var(--random-ink);
}

.random-tools-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 0 0.25rem 1.25rem;
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
  font-size: 2rem;
  line-height: 1.25;
  font-weight: 900;
  letter-spacing: 0;
}

.random-tools-page__heading > p:last-child {
  margin: 0.45rem 0 0;
  color: var(--random-muted);
  font-size: 0.86rem;
  line-height: 1.55;
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
  transition: background-color 0.2s ease, transform 0.2s ease;
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
  transition: background-color 0.18s ease, color 0.18s ease;
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
  height: min(540px, calc(100vh - 250px));
  min-height: 470px;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #d5dae2;
  background-color: #e9edf2;
  background-image:
    linear-gradient(rgba(23, 25, 29, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(23, 25, 29, 0.045) 1px, transparent 1px);
  background-size: 56px 56px;
}

.random-tools-page__stage::before {
  content: '';
  position: absolute;
  inset: 45px 0 auto;
  height: 1px;
  background: rgba(23, 25, 29, 0.11);
  pointer-events: none;
  z-index: 2;
}

.random-tools-page__stage-topline {
  position: absolute;
  top: 0;
  right: 1rem;
  left: 1rem;
  height: 45px;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #5e6570;
  font-size: 0.65rem;
  font-weight: 800;
  pointer-events: none;
}

.random-tools-page__stage-count {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--random-ink);
}

.random-tools-page__stage-count svg {
  width: 1.05rem;
  height: 1.05rem;
}

.random-tools-page__gallery {
  width: 100%;
  height: 100%;
  padding-top: 20px;
}

.random-tools-page__loading,
.random-tools-page__empty {
  height: 100%;
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

  .random-tools-page__stage {
    height: min(510px, calc(100vh - 220px));
    min-height: 430px;
    border-radius: 6px;
    background-size: 42px 42px;
  }

  .random-tools-page__stage-topline {
    right: 0.8rem;
    left: 0.8rem;
  }

  .random-tools-page__gallery {
    padding-top: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .random-tools-page__refresh,
  .random-tools-page__category {
    transition: none;
  }
}
</style>
