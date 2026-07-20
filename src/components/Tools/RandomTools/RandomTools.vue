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
  { background: '#15171c', foreground: '#f8fafc', accent: '#ffcc33', muted: '#3a3d45' },
  { background: '#123c36', foreground: '#f4fff9', accent: '#65d6ad', muted: '#28685d' },
  { background: '#e8edf4', foreground: '#162033', accent: '#2f6fed', muted: '#c3ccda' },
  { background: '#702f3d', foreground: '#fff8f4', accent: '#ffb199', muted: '#9b5260' },
  { background: '#27324a', foreground: '#f7f8ff', accent: '#9bb5ff', muted: '#455474' },
  { background: '#f3e9d2', foreground: '#252018', accent: '#d55332', muted: '#d8c7a6' },
  { background: '#283b24', foreground: '#f6faef', accent: '#b6da74', muted: '#52694b' },
  { background: '#312a3f', foreground: '#fff9ff', accent: '#e8a6d7', muted: '#5c4c70' }
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
  for (let x = 56; x < width; x += 74) {
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()
  }

  context.fillStyle = palette.accent
  context.fillRect(0, 0, 16, height)
  context.fillRect(56, 68, 112, 8)
  context.fillRect(width - 180, height - 76, 124, 8)

  context.fillStyle = palette.muted
  context.fillRect(width - 172, 54, 116, 116)
  context.fillStyle = palette.accent
  context.fillRect(width - 146, 80, 64, 64)

  context.fillStyle = palette.foreground
  context.font = '700 25px "PingFang SC", "Microsoft YaHei", sans-serif'
  context.textBaseline = 'top'
  context.fillText(`NO. ${String(index + 1).padStart(2, '0')}`, 56, 104)
  context.fillStyle = palette.accent
  context.font = '600 24px "PingFang SC", "Microsoft YaHei", sans-serif'
  context.fillText(tool.cate || '效率工具', 56, 158)

  context.fillStyle = palette.foreground
  context.font = '800 58px "PingFang SC", "Microsoft YaHei", sans-serif'
  splitCoverTitle(tool.title).forEach((line, lineIndex) => {
    context.fillText(line, 56, 346 + lineIndex * 78)
  })

  context.fillStyle = palette.foreground
  context.globalAlpha = 0.72
  context.font = '400 23px "PingFang SC", "Microsoft YaHei", sans-serif'
  const description = String(tool.desc || '发现一个新的实用工具').replace(/\s+/g, ' ').slice(0, 34)
  context.fillText(description, 56, height - 102)
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
        <p class="random-tools-page__eyebrow">DISCOVER / 随机发现</p>
        <h1>换个方向，遇见新工具</h1>
        <p>从现有工具库随机挑选一组，也许下一个正好解决你手头的问题。</p>
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
        <span>{{ loading ? '正在重新组合' : `本轮 ${randomTools.length} 个工具` }}</span>
        <CursorArrowRaysIcon aria-hidden="true" />
      </div>

      <div v-if="loading" class="random-tools-page__loading" role="status">
        <i></i>
        <span>正在发现新的工具组合</span>
      </div>

      <CircularGallery
        v-else-if="galleryItems.length"
        class="random-tools-page__gallery"
        :items="galleryItems"
        :bend="2.4"
        text-color="#ffffff"
        :border-radius="0.035"
        font="700 30px 'PingFang SC', 'Microsoft YaHei', sans-serif"
        :scroll-speed="2"
        :scroll-ease="0.055"
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
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 2rem 0 1.5rem;
  color: #15171c;
}

.random-tools-page__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  padding: 0 0.25rem 1.5rem;
}

.random-tools-page__heading {
  min-width: 0;
}

.random-tools-page__eyebrow {
  margin: 0 0 0.5rem;
  color: #5b54e8;
  font-size: 0.75rem;
  line-height: 1.25rem;
  font-weight: 800;
}

.random-tools-page__heading h1 {
  margin: 0;
  color: #111318;
  font-size: 2.25rem;
  line-height: 1.2;
  font-weight: 900;
  letter-spacing: 0;
}

.random-tools-page__heading > p:last-child {
  max-width: 620px;
  margin: 0.65rem 0 0;
  color: #687080;
  font-size: 0.92rem;
  line-height: 1.7;
}

.random-tools-page__refresh {
  min-width: 116px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
  border: 0;
  border-radius: 6px;
  background: #15171c;
  color: #ffffff;
  font-size: 0.875rem;
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
  gap: 0.35rem;
  margin-bottom: 0.75rem;
  padding: 0.25rem;
  overflow-x: auto;
  scrollbar-width: none;
}

.random-tools-page__categories::-webkit-scrollbar {
  display: none;
}

.random-tools-page__category {
  min-height: 34px;
  padding: 0 0.8rem;
  flex-shrink: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #656d7c;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.random-tools-page__category:hover {
  background: #eceef3;
  color: #15171c;
}

.random-tools-page__category--active {
  background: #e4e1ff;
  color: #4038c8;
}

.random-tools-page__stage {
  position: relative;
  height: min(610px, calc(100vh - 270px));
  min-height: 500px;
  overflow: hidden;
  border-radius: 8px;
  background: #0c0e12;
}

.random-tools-page__stage::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: rgba(255, 255, 255, 0.16);
  pointer-events: none;
  z-index: 2;
}

.random-tools-page__stage-topline {
  position: absolute;
  top: 1rem;
  right: 1.1rem;
  left: 1.1rem;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.72rem;
  font-weight: 700;
  pointer-events: none;
}

.random-tools-page__stage-topline svg {
  width: 1.05rem;
  height: 1.05rem;
}

.random-tools-page__gallery {
  width: 100%;
  height: 100%;
}

.random-tools-page__loading,
.random-tools-page__empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.88rem;
}

.random-tools-page__loading i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ffcc33;
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
    padding: 1rem 0 0.75rem;
  }

  .random-tools-page__header {
    align-items: flex-start;
    gap: 1rem;
    padding: 0 0.1rem 1rem;
  }

  .random-tools-page__heading h1 {
    font-size: 1.7rem;
    line-height: 2.1rem;
  }

  .random-tools-page__heading > p:last-child {
    font-size: 0.82rem;
    line-height: 1.5rem;
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
    margin-right: -0.25rem;
    margin-left: -0.25rem;
  }

  .random-tools-page__stage {
    height: min(560px, calc(100vh - 245px));
    min-height: 450px;
    border-radius: 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .random-tools-page__refresh,
  .random-tools-page__category {
    transition: none;
  }
}
</style>
