<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */
-->

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToolsStore } from '@/store/modules/tools'
import ToolIcon from '@/components/Tools/ToolIcon.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import type { Tool, ToolCategory, ToolSubCategory } from '@/types/tools'

const route = useRoute()
const router = useRouter()
const toolsStore = useToolsStore()

const quickToolPaths: string[] = [
  '/tools/ai/deepseek-r1',
  '/tools/ai/deepseek-nav',
  '/tools/ai/chat',
  '/tools/ai/matting-hub',
  '/tools/ai/portrait-matting',
  '/tools/ai/ocr'
]

/**
 * 函数说明：页面初始化时加载工具分类数据，保证聚合页可渲染
 */
const initToolCates = async (): Promise<void> => {
  if (toolsStore.cates.length > 0) {
    return
  }
  await toolsStore.getToolCate()
}

/**
 * 函数说明：读取 AI 工具箱一级分类，供聚合页分组渲染
 */
const aiCategory = computed<ToolCategory | undefined>(() => {
  return toolsStore.cates.find((cate) => cate.title === 'AI工具箱')
})

/**
 * 函数说明：提取 AI 分组列表，统一兜底为空数组
 */
const aiGroups = computed<ToolSubCategory[]>(() => {
  return aiCategory.value?.list || []
})

/**
 * 函数说明：拍平 AI 工具列表，便于统计与快捷入口匹配
 */
const aiTools = computed<Tool[]>(() => {
  return aiGroups.value.flatMap((group) => (Array.isArray(group.list) ? group.list : []))
})

/**
 * 函数说明：构建快捷入口工具卡，按预设路径优先展示高频工具
 */
const quickTools = computed<Tool[]>(() => {
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

  if (selected.length >= 6) {
    return selected.slice(0, 6)
  }

  const remain = aiTools.value.filter((tool) => !quickToolPaths.includes(tool.url))
  return [...selected, ...remain].slice(0, 6)
})

/**
 * 函数说明：统计分组数量与工具数量，用于顶部摘要展示
 */
const summaryText = computed(() => {
  return `共 ${aiGroups.value.length} 个分组 · ${aiTools.value.length} 个 AI 工具`
})

/**
 * 函数说明：解析站内路由为可新窗口访问的 href
 */
const resolveToolHref = (path: string): string => {
  return router.resolve(path).href
}

/**
 * 函数说明：统一处理工具跳转，自动兼容站内路由与外链
 */
const openTool = (tool: Tool): void => {
  if (tool.isExternal || /^https?:\/\//i.test(tool.url)) {
    window.open(tool.url, '_blank', 'noopener,noreferrer')
    return
  }
  window.open(resolveToolHref(tool.url), '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  void initToolCates()
})
</script>

<template>
  <div class="ai-toolbox-hub min-h-screen space-y-4">
    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div class="hero relative px-6 py-8 sm:px-8 sm:py-10">
        <div class="absolute inset-0 bg-gradient-to-br from-cyan-50 via-sky-50 to-emerald-50" />
        <div class="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-200/45 blur-3xl" />
        <div class="absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-emerald-200/45 blur-3xl" />

        <div class="relative z-10">
          <div
            class="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-3 py-1 text-xs font-medium text-cyan-700"
          >
            <span class="inline-block h-1.5 w-1.5 rounded-full bg-cyan-500" />
            AI 工具箱聚合页
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">免费 AI 工具箱导航</h1>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            把写作、办公、图像、对话、提示词等 AI 工具集中到一个页面，按分组快速定位，避免在左侧菜单里逐层翻找。
          </p>
          <div class="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
            <span class="rounded-full border border-slate-200 bg-white px-3 py-1">一页聚合</span>
            <span class="rounded-full border border-slate-200 bg-white px-3 py-1">分组查找</span>
            <span class="rounded-full border border-slate-200 bg-white px-3 py-1">新窗口打开</span>
            <span class="rounded-full border border-slate-200 bg-white px-3 py-1">持续扩展</span>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div class="mb-4 flex items-center justify-between gap-4">
        <h2 class="text-lg font-semibold text-slate-900 sm:text-xl">核心入口</h2>
        <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 sm:text-sm">
          {{ summaryText }}
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="tool in quickTools"
          :key="tool.id"
          type="button"
          class="quick-card group rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300"
          @click="openTool(tool)"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <ToolIcon v-if="tool.logo" :icon="tool.logo" />
              <h3 class="font-semibold text-slate-900">{{ tool.title }}</h3>
            </div>
            <span class="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-700">推荐</span>
          </div>
          <p class="text-sm leading-6 text-slate-600">{{ tool.desc || '进入工具开始使用' }}</p>
          <div class="mt-3 text-sm font-medium text-cyan-700">打开工具 →</div>
        </button>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div class="mb-4 flex items-center justify-between gap-4">
        <h2 class="text-lg font-semibold text-slate-900 sm:text-xl">全部分组</h2>
        <span class="text-xs text-slate-500">点击工具名称将以新窗口打开</span>
      </div>

      <div v-if="aiGroups.length > 0" class="space-y-4">
        <article
          v-for="group in aiGroups"
          :key="group.id"
          class="group-panel rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <h3 class="text-base font-semibold text-slate-900">{{ group.title }}</h3>
            <span class="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500">
              {{ Array.isArray(group.list) ? group.list.length : 0 }} 个工具
            </span>
          </div>

          <div class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            <button
              v-for="tool in group.list"
              :key="tool.id"
              type="button"
              class="tool-entry flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:border-cyan-300"
              @click="openTool(tool)"
            >
              <span class="truncate text-sm text-slate-700">{{ tool.title }}</span>
              <span class="ml-3 shrink-0 text-xs text-cyan-700">进入</span>
            </button>
          </div>
        </article>
      </div>

      <div v-else class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        AI 工具数据加载中，请稍后刷新重试。
      </div>
    </section>

    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<style scoped>
.hero {
  isolation: isolate;
}
</style>
