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
 * 函数说明：将 AI 分组映射为卡片展示数据，统一补齐数量与简介文案
 */
const groupCards = computed(() => {
  return aiGroups.value.map((group) => {
    const tools = Array.isArray(group.list) ? group.list : []
    return {
      id: group.id,
      title: group.title,
      tools,
      count: tools.length,
      summary: `覆盖 ${tools.length} 个工具入口，支持新窗口快速打开`
    }
  })
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
  <div class="ai-toolbox-hub min-h-screen">
    <section class="hero-card">
      <div class="hero-intro">
        <p class="hero-badge">AI 导航中心</p>
        <h1 class="hero-title">免费 AI 工具箱</h1>
        <p class="hero-desc">
          集中收纳写作、办公、图像、对话、提示词等 AI 工具。保持卡片式入口，减少翻页与查找成本，所有工具支持一键新窗口打开。
        </p>
        <div class="hero-tags">
          <span class="hero-tag">卡片聚合</span>
          <span class="hero-tag">分组检索</span>
          <span class="hero-tag">即点即用</span>
          <span class="hero-tag">持续更新</span>
        </div>
      </div>
      <div class="hero-metrics">
        <article class="metric-card">
          <p class="metric-label">分组数量</p>
          <p class="metric-value">{{ aiGroups.length }}</p>
        </article>
        <article class="metric-card">
          <p class="metric-label">工具数量</p>
          <p class="metric-value">{{ aiTools.length }}</p>
        </article>
        <article class="metric-card metric-card-wide">
          <p class="metric-label">当前概览</p>
          <p class="metric-value metric-small">{{ summaryText }}</p>
        </article>
      </div>
    </section>

    <section class="block-card">
      <div class="block-head">
        <h2 class="block-title">热门 AI 工具</h2>
        <span class="block-tip">优先推荐高频入口</span>
      </div>
      <div class="quick-grid">
        <button
          v-for="tool in quickTools"
          :key="tool.id"
          type="button"
          class="quick-tool-card"
          @click="openTool(tool)"
        >
          <div class="quick-tool-head">
            <div class="quick-tool-title-wrap">
              <ToolIcon v-if="tool.logo" :icon="tool.logo" />
              <h3 class="quick-tool-title">{{ tool.title }}</h3>
            </div>
            <span class="quick-badge">推荐</span>
          </div>
          <p class="quick-tool-desc">{{ tool.desc || '进入工具开始使用' }}</p>
          <p class="quick-tool-link">打开工具</p>
        </button>
      </div>
    </section>

    <section class="block-card">
      <div class="block-head">
        <h2 class="block-title">全部分组</h2>
        <span class="block-tip">点击卡片中的工具按钮可直接打开</span>
      </div>

      <div v-if="groupCards.length > 0" class="group-grid">
        <article
          v-for="group in groupCards"
          :key="group.id"
          class="group-card"
        >
          <header class="group-head">
            <h3 class="group-title">{{ group.title }}</h3>
            <span class="group-count">{{ group.count }} 个</span>
          </header>
          <p class="group-summary">{{ group.summary }}</p>
          <div class="group-tool-list">
            <button
              v-for="tool in group.tools"
              :key="tool.id"
              type="button"
              class="group-tool-item"
              @click="openTool(tool)"
            >
              <span class="group-tool-name">{{ tool.title }}</span>
              <span class="group-tool-action">打开</span>
            </button>
          </div>
        </article>
      </div>

      <div v-else class="empty-card">
        AI 工具数据加载中，请稍后刷新重试。
      </div>
    </section>

    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<style scoped>
.ai-toolbox-hub {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card {
  border: 1px solid #dce7f4;
  border-radius: 16px;
  background:
    radial-gradient(130% 180% at 0% 0%, rgba(16, 185, 129, 0.13) 0%, rgba(16, 185, 129, 0) 60%),
    radial-gradient(120% 160% at 100% 0%, rgba(14, 165, 233, 0.16) 0%, rgba(14, 165, 233, 0) 55%),
    #ffffff;
  padding: 22px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
}

.hero-intro {
  min-width: 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #b9d7f2;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #0b72b0;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  margin: 0 0 10px;
}

.hero-title {
  margin: 0;
  color: #0f172a;
  font-size: clamp(26px, 4vw, 34px);
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.015em;
}

.hero-desc {
  margin: 10px 0 0;
  color: #334155;
  font-size: 14px;
  line-height: 1.85;
  max-width: 720px;
}

.hero-tags {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-tag {
  border: 1px solid #d6e3ee;
  border-radius: 999px;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  padding: 5px 10px;
}

.hero-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.metric-card {
  border: 1px solid #d8e6f5;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  padding: 12px;
}

.metric-card-wide {
  grid-column: 1 / -1;
}

.metric-label {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}

.metric-value {
  margin: 6px 0 0;
  color: #0f172a;
  font-size: 24px;
  line-height: 1;
  font-weight: 700;
}

.metric-small {
  font-size: 14px;
  line-height: 1.4;
  font-weight: 600;
}

.block-card {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  padding: 18px;
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.block-title {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 700;
}

.block-tip {
  color: #64748b;
  font-size: 12px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.quick-tool-card {
  width: 100%;
  border: 1px solid #dbe7f3;
  border-radius: 14px;
  background:
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  padding: 14px;
  text-align: left;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.quick-tool-card:hover {
  border-color: #8ec5ea;
  transform: translateY(-1px);
}

.quick-tool-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.quick-tool-title-wrap {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.quick-tool-title {
  margin: 0;
  color: #0f172a;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 700;
}

.quick-badge {
  border: 1px solid #b4dcf4;
  border-radius: 999px;
  background: #ecf8ff;
  color: #0b72b0;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  flex-shrink: 0;
}

.quick-tool-desc {
  margin: 10px 0 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.7;
  min-height: 44px;
}

.quick-tool-link {
  margin: 10px 0 0;
  color: #0f7ab8;
  font-size: 13px;
  font-weight: 600;
}

.group-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.group-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  padding: 14px;
}

.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.group-title {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
}

.group-count {
  border: 1px solid #cfe0f0;
  border-radius: 999px;
  background: #ffffff;
  color: #64748b;
  font-size: 12px;
  padding: 2px 8px;
}

.group-summary {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 12px;
}

.group-tool-list {
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.group-tool-item {
  width: 100%;
  border: 1px solid #d9e4ef;
  border-radius: 10px;
  background: #ffffff;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  text-align: left;
  transition: border-color 0.2s ease;
}

.group-tool-item:hover {
  border-color: #8ec5ea;
}

.group-tool-name {
  color: #334155;
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-tool-action {
  color: #0f7ab8;
  font-size: 12px;
  flex-shrink: 0;
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

@media (max-width: 1200px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .group-grid {
    grid-template-columns: 1fr;
  }

  .quick-grid {
    grid-template-columns: 1fr;
  }
}
</style>
