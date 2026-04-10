<!--
 * @file AIToolboxHub.vue
 * @description AI工具箱聚合页，按分组展示工具并支持锚点导航
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
-->

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolIcon from '@/components/Tools/ToolIcon.vue'
import { useToolsStore } from '@/store/modules/tools'
import type { Tool, ToolCategory, ToolSubCategory } from '@/types/tools'

const route = useRoute()
const router = useRouter()
const toolsStore = useToolsStore()
const scrollContainerRef = ref<HTMLElement | null>(null)

const mouseX = ref('50%')
const mouseY = ref('50%')

const quickToolPaths: string[] = [
  '/tools/ai/deepseek-r1',
  '/tools/ai/deepseek-nav',
  '/tools/ai/chat',
  '/tools/ai/matting-hub',
  '/tools/ai/portrait-matting',
  '/tools/ai/ocr'
]

/**
 * 函数说明：标准化工具路由路径，统一去除查询、哈希与尾部斜杠。
 */
const normalizeRoutePath = (rawPath: string): string => {
  const normalized = String(rawPath || '').trim().replace(/[?#].*$/, '')
  if (!normalized) {
    return '/'
  }
  if (normalized.length === 1) {
    return normalized
  }
  return normalized.replace(/\/+$/, '')
}

/**
 * 函数说明：判断工具路由是否属于 AI 工具箱命名空间，避免依赖分类标题匹配。
 */
const isAiToolPath = (toolPath: string): boolean => {
  return normalizeRoutePath(toolPath).startsWith('/tools/ai')
}

/**
 * 函数说明：判断工具是否在后台被停用（status=0）。
 */
const isToolDisabled = (tool: Tool): boolean => {
  return Number(tool.status ?? 1) === 0
}

/**
 * 函数说明：输出工具停用提示文案，优先显示后台配置备注。
 */
const resolveToolDisabledMessage = (tool: Tool): string => {
  const toolTitle = String(tool.title || '').trim() || '当前工具'
  const remark = String(tool.remark || '').trim()
  if (remark) {
    return `工具「${toolTitle}」已停用：${remark}`
  }
  return `工具「${toolTitle}」已在后台停用，请稍后再试。`
}

/**
 * 函数说明：页面初始化时加载工具分类数据，保证 AI 聚合页内容可渲染
 */
const initToolCates = async (): Promise<void> => {
  if (toolsStore.cates.length > 0) {
    return
  }
  await toolsStore.getToolCate()
}

/**
 * 函数说明：读取 AI 工具箱一级分类，供本页分组渲染
 */
const aiCategory = computed<ToolCategory | undefined>(() => {
  const matchedByToolPath = toolsStore.cates.find((cate) => {
    return (cate.list || []).some((group) => {
      return (group.list || []).some((tool) => isAiToolPath(tool.url))
    })
  })
  if (matchedByToolPath) {
    return matchedByToolPath
  }
  return toolsStore.cates.find((cate) => cate.title === 'AI工具箱')
})

/**
 * 函数说明：提取 AI 分组列表，统一兜底为空数组
 */
const aiGroups = computed<ToolSubCategory[]>(() => {
  return aiCategory.value?.list || []
})

/**
 * 函数说明：拍平 AI 工具列表，便于统计与精选入口匹配
 */
const aiTools = computed<Tool[]>(() => {
  return aiGroups.value.flatMap((group) => (Array.isArray(group.list) ? group.list : []))
})

/**
 * 函数说明：统计分组与工具总量，用于页面头部摘要
 */
const summaryText = computed<string>(() => {
  return `共 ${aiGroups.value.length} 个分组 · ${aiTools.value.length} 个 AI 工具`
})

/**
 * 函数说明：构建精选工具列表，优先命中预置路径，数量不足时自动补齐
 */
const featuredTools = computed<Tool[]>(() => {
  const toolMap = new Map<string, Tool>()
  aiTools.value.forEach((tool) => {
    toolMap.set(tool.url, tool)
  })

  const selected: Tool[] = []
  quickToolPaths.forEach((path) => {
    const tool = toolMap.get(path)
    if (tool) {
      selected.push(tool)
    }
  })

  if (selected.length >= 8) {
    return selected.slice(0, 8)
  }

  const remain = aiTools.value.filter((tool) => !quickToolPaths.includes(tool.url))
  return [...selected, ...remain].slice(0, 8)
})

/**
 * 函数说明：过滤空分组并补齐分组统计字段，同时生成可用于页面锚点定位的分组锚点ID
 */
const displayGroups = computed(() => {
  return aiGroups.value
    .map((group, index) => {
      const normalizedId = String(group.id || '').trim() || String(index + 1)
      return {
        ...group,
        list: Array.isArray(group.list) ? group.list : [],
        total: Array.isArray(group.list) ? group.list.length : 0,
        anchorId: `ai-group-${normalizedId}`
      }
    })
    .filter((group) => group.list.length > 0)
})

/**
 * 函数说明：计算卡片鼠标光效样式变量，提升与首页一致的交互反馈
 */
const cardStyle = computed<Record<string, string>>(() => {
  return {
    '--mouse-x': mouseX.value,
    '--mouse-y': mouseY.value
  }
})

/**
 * 函数说明：更新卡片鼠标位置，用于径向光效定位
 */
const handleMouseMove = (event: MouseEvent): void => {
  const target = event.currentTarget as HTMLElement | null
  if (!target) {
    return
  }
  const rect = target.getBoundingClientRect()
  mouseX.value = `${event.clientX - rect.left}px`
  mouseY.value = `${event.clientY - rect.top}px`
}

/**
 * 函数说明：鼠标离开卡片后重置光效位置
 */
const handleMouseLeave = (): void => {
  mouseX.value = '50%'
  mouseY.value = '50%'
}

/**
 * 函数说明：统一处理工具跳转，自动兼容站内路由和外链
 */
const openTool = async (tool: Tool): Promise<void> => {
  if (isToolDisabled(tool)) {
    ElMessage.warning(resolveToolDisabledMessage(tool))
    return
  }
  if (tool.isExternal || /^https?:\/\//i.test(tool.url)) {
    window.open(tool.url, '_blank', 'noopener,noreferrer')
    return
  }
  await router.push(tool.url)
}

/**
 * 函数说明：滚动到页面指定锚点，支持 AI 聚合页内部导航
 */
const scrollToAnchor = async (anchorId: string): Promise<void> => {
  const normalizedAnchorId = String(anchorId || '').trim()
  if (!normalizedAnchorId) {
    return
  }
  await nextTick()
  const anchorElement = document.getElementById(normalizedAnchorId)
  if (!anchorElement) {
    return
  }

  const scrollContainer = scrollContainerRef.value
  if (!scrollContainer) {
    anchorElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  // 预留顶部视觉间距，避免标题贴边
  const offsetTop = 14
  const containerRect = scrollContainer.getBoundingClientRect()
  const targetRect = anchorElement.getBoundingClientRect()
  const targetTop = targetRect.top - containerRect.top + scrollContainer.scrollTop - offsetTop
  scrollContainer.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: 'smooth'
  })
}

/**
 * 函数说明：规范化 AI 聚合页锚点，兼容历史 ai-group-1 序号锚点并自动映射到当前真实分组ID。
 */
const normalizeAiAnchorId = (rawAnchor: string): string => {
  const anchorId = String(rawAnchor || '').trim()
  if (!anchorId) {
    return 'ai-highlight'
  }

  if (anchorId === 'ai-highlight' || anchorId === 'ai-groups') {
    return anchorId
  }

  const groupList = displayGroups.value
  if (!groupList.length) {
    return anchorId
  }

  const matchedGroup = groupList.find((group) => group.anchorId === anchorId)
  if (matchedGroup) {
    return matchedGroup.anchorId
  }

  const legacyIndexMatch = anchorId.match(/^ai-group-(\d+)$/)
  if (legacyIndexMatch) {
    const groupIndex = Number(legacyIndexMatch[1]) - 1
    if (groupIndex >= 0 && groupIndex < groupList.length) {
      return groupList[groupIndex].anchorId
    }
  }

  return 'ai-highlight'
}

/**
 * 函数说明：根据路由 query 定位锚点，保持与侧边栏跳转逻辑一致
 */
const syncScrollAnchor = async (): Promise<void> => {
  const queryValue = route.query.value
  const queryAnchor = typeof queryValue === 'string' ? queryValue.trim() : ''
  const hashAnchor = String(route.hash || '').replace(/^#/, '').trim()
  const anchorId = normalizeAiAnchorId(queryAnchor || hashAnchor || 'ai-highlight')
  await scrollToAnchor(anchorId)
}

onMounted(async () => {
  await initToolCates()
  await syncScrollAnchor()
})

watch(
  () => [route.query.value, route.hash, displayGroups.value.length],
  () => {
    void syncScrollAnchor()
  }
)
</script>

<template>
  <div class="ai-home-container">
    <div ref="scrollContainerRef" class="scroll-container">
      <div class="ai-main">
        <section id="recommend">
          <div id="ai-highlight" class="section-title">
            <div class="title-text">免费AI工具箱</div>
            <div class="title-line"></div>
          </div>
          <div class="summary-chip">{{ summaryText }}</div>
          <div class="grid gap-4">
            <div
              v-for="tool in featuredTools"
              :key="tool.id"
              class="tool-card-container"
              @mousemove="handleMouseMove"
              @mouseleave="handleMouseLeave"
            >
              <button
                type="button"
                :class="['tool-card', { 'tool-card--disabled': isToolDisabled(tool) }]"
                :style="cardStyle"
                :disabled="isToolDisabled(tool)"
                @click="openTool(tool)"
              >
                <div v-if="isToolDisabled(tool)" class="tool-disabled-tag">已停用</div>
                <div class="flex items-center border-b pb-2 relative z-10">
                  <ToolIcon v-if="tool.logo" :icon="tool.logo" />
                  <div class="flex flex-col ml-2 w-full">
                    <div class="font-semibold text-lg truncate mb-1">{{ tool.title }}</div>
                    <div class="flex justify-between mt-1">
                      <el-text size="small" class="truncate">{{ tool.cate }}</el-text>
                    </div>
                  </div>
                </div>
                <div class="flex mt-2 relative z-10">
                  <el-text class="truncate text-[14px] text-[#666] w-full">{{ tool.desc || '进入工具开始使用' }}</el-text>
                </div>
                <div class="card-shine"></div>
                <div class="card-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section id="ai-groups">
          <div
            v-for="group in displayGroups"
            :key="group.anchorId"
          >
            <div :id="group.anchorId" class="sub-title">
              <div class="sub-title-indicator"></div>
              <div class="sub-title-text">{{ group.title }}</div>
              <div class="sub-title-count">{{ group.total }}个</div>
            </div>
            <div class="grid gap-4">
              <div
                v-for="tool in group.list"
                :key="tool.id"
                :id="`tool-${tool.id}`"
                class="tool-card-container"
                @mousemove="handleMouseMove"
                @mouseleave="handleMouseLeave"
              >
                <button
                  type="button"
                  :class="['tool-card', { 'tool-card--disabled': isToolDisabled(tool) }]"
                  :style="cardStyle"
                  :disabled="isToolDisabled(tool)"
                  @click="openTool(tool)"
                >
                  <div v-if="isToolDisabled(tool)" class="tool-disabled-tag">已停用</div>
                  <div class="flex items-center border-b pb-2 relative z-10">
                    <ToolIcon v-if="tool.logo" :icon="tool.logo" />
                    <div class="flex flex-col ml-2 w-full">
                      <div class="font-semibold text-lg truncate mb-1">{{ tool.title }}</div>
                      <div class="flex justify-between mt-1">
                        <el-text size="small" class="truncate">{{ tool.cate }}</el-text>
                      </div>
                    </div>
                  </div>
                  <div class="flex mt-2 relative z-10">
                    <el-text class="truncate text-[14px] text-[#666] w-full">{{ tool.desc || '进入工具开始使用' }}</el-text>
                  </div>
                  <div class="card-shine"></div>
                  <div class="card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div v-if="displayGroups.length === 0" class="empty-card">
            AI 工具数据加载中，请稍后刷新重试。
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-home-container {
  padding: 0 1rem 2rem;
}

.ai-main {
  min-width: 0;
}

.scroll-container {
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.scroll-container::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

#recommend {
  scroll-margin-top: 2rem;
}

.summary-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.8rem;
  margin-bottom: 1rem;
  border-radius: 999px;
  border: 1px solid #dce8f8;
  background: #f5f9ff;
  color: #416182;
  font-size: 0.78rem;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 2rem 0 0.8rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.title-text {
  position: relative;
  z-index: 1;
  padding-right: 1rem;
  background: #f5f7fa;
}

.title-line {
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.sub-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.5rem 0 1rem;
  padding-left: 0.5rem;
}

.sub-title-indicator {
  width: 4px;
  height: 16px;
  background: #0ea5e9;
  border-radius: 2px;
}

.sub-title-text {
  font-size: 1rem;
  font-weight: 600;
  color: #495a6c;
}

.sub-title-count {
  margin-left: auto;
  font-size: 0.75rem;
  color: #6b7f95;
  border: 1px solid #d5e2f0;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
}

.grid {
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

.tool-card-container {
  position: relative;
}

.tool-card {
  width: 100%;
  text-align: left;
  position: relative;
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.25s ease;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.1rem;
  border-radius: 1rem;
}

.tool-card:hover {
  transform: translateY(-4px);
  border-color: #8ac5ee;
}

.tool-card--disabled {
  opacity: 0.62;
  cursor: not-allowed;
  filter: grayscale(0.18);
}

.tool-card--disabled:hover {
  transform: none;
  border-color: #e5e7eb;
}

.tool-disabled-tag {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  z-index: 12;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.tool-card .font-semibold.text-lg {
  width: calc(100% - 0.75rem);
  min-height: 1.5em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-card .flex.justify-between {
  margin-top: auto;
}

.card-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(14, 165, 233, 0.1), transparent 45%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 1;
}

.tool-card:hover .card-shine {
  opacity: 1;
}

.card-arrow {
  position: absolute;
  top: 1.1rem;
  right: 1.1rem;
  color: #999;
  opacity: 0;
  transform: translate(-8px, 8px);
  transition: all 0.2s ease;
}

.tool-card:hover .card-arrow {
  opacity: 1;
  transform: translate(0, 0);
  color: #0ea5e9;
}

.empty-card {
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  text-align: center;
  padding: 26px 14px;
  font-size: 14px;
}

@media screen and (max-width: 768px) {
  .tool-card {
    padding: 1rem;
  }

  .card-arrow {
    display: none;
  }
}

</style>
