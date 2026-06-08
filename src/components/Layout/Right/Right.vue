<!--
 * @file Right.vue
 * @description 右侧边栏组件，展示推荐工具
 * @author UIED技术团队
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 【重要说明】
 * 1. 组件用法:
 *    import Right from '@/components/Layout/Right/Right.vue'
 *    <Right />
 *
 * 2. 数据结构:
 *    - 相关工具: 从当前工具类别中获取相关推荐
 *    - 随机工具: 从其他分类中随机推荐
 *
 * 3. 注意事项:
 *    - 只在工具页面显示(/tools/开头的路由)
 *    - 推荐工具仅支持站内路由跳转
 *    - 使用sticky定位确保边栏固定
 *
 * 4. 样式说明:
 *    - 整体使用圆角和阴影效果
 *    - 推荐工具使用hover效果
-->

<script setup lang="ts">
import { computed, ref, watch, onMounted } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import ToolRankingBoard from '@/components/Common/ToolRankingBoard.vue'
import { useToolsStore } from '@/store/modules/tools'
import { getSitePublicConfig, type SitePublicConfig } from '@/services/siteConfig'
import { useToolRuntimeGate } from '@/composables/useToolRuntimeGate'
import type { Tool } from '@/types/tools'
import {
  findToolByUrl,
  getRandomToolsFromCategories,
  getRelatedToolsFromCategories
} from '@/services/toolCatalog'

const route = useRoute()
const { isToolDisabled, openToolEntry } = useToolRuntimeGate()

// 判断是否显示工具推荐
const shouldShowRecommend = computed(() => {
  return !route.meta.hideToolsRecommend
})

// store实例
const toolsStore = useToolsStore()

// 相关工具推荐
const relatedTools = ref<Tool[]>([])
const randomTools = ref<Tool[]>([])
// 最近使用的工具
const recentTools = ref<Tool[]>([])
const siteConfig = ref<SitePublicConfig | null>(null)

/**
 * 函数说明：处理右侧推荐工具点击，停用状态阻断并提示，其余按内链/外链正常跳转。
 */
const handleToolEntryClick = async (tool: Tool) => {
  await openToolEntry(tool, {
    target: 'current',
    action: 'open',
    source: 'right-sidebar'
  })
}

/**
 * 函数说明：基于后台工具分类树刷新右侧“相关工具 / 随机工具”数据。
 */
const getToolsData = async () => {
  if (!route.path.startsWith('/tools/') || !shouldShowRecommend.value) return

  await toolsStore.getToolCate()
  relatedTools.value = getRelatedToolsFromCategories(toolsStore.cates, route.path, 8, 8)
  randomTools.value = getRandomToolsFromCategories(toolsStore.cates, 8, route.path)
}

/**
 * 函数说明：读取右侧栏热榜配置，统一控制工具页右栏热榜模块的显示与标题。
 */
const loadRightSiteConfig = async () => {
  try {
    siteConfig.value = await getSitePublicConfig()
  } catch (error) {
    console.error('获取右侧栏站点配置失败:', error)
    siteConfig.value = null
  }
}

/**
 * 函数说明：从 localStorage 获取最近使用记录，确保刷新后仍可恢复最近访问工具。
 */
const getRecentTools = () => {
  try {
    const stored = localStorage.getItem('recentTools')
    if (stored) {
      recentTools.value = JSON.parse(stored).slice(0, 5) // 只显示最近5个工具
    }
  } catch (error) {
    console.error('获取最近使用工具失败:', error)
    recentTools.value = []
  }
}

/**
 * 函数说明：将当前工具写入最近使用记录，工具基础信息优先从后台工具分类树读取。
 */
const addToRecentTools = (currentPath: string) => {
  if (!currentPath.startsWith('/tools/')) return

  const currentTool = findToolByUrl(toolsStore.cates, currentPath)
  if (!currentTool) return

  try {
    // 获取已有记录
    let recent: Tool[] = []
    const stored = localStorage.getItem('recentTools')
    if (stored) {
      recent = JSON.parse(stored)
    }

    // 移除已存在的相同工具（避免重复）
    recent = recent.filter(tool => tool.url !== currentTool.url)

    // 添加到数组开头
    recent.unshift(currentTool)

    // 只保留最近10个
    if (recent.length > 10) {
      recent = recent.slice(0, 10)
    }

    // 保存回localStorage
    localStorage.setItem('recentTools', JSON.stringify(recent))

    // 更新当前显示
    recentTools.value = recent.slice(0, 5)
  } catch (error) {
    console.error('保存最近使用工具失败:', error)
  }
}

/**
 * 函数说明：同步右侧栏数据与最近使用记录，确保工具分类加载完成后再写入最近使用。
 */
const syncRightSidebarState = async (currentPath: string) => {
  await Promise.all([getToolsData(), loadRightSiteConfig()])
  addToRecentTools(currentPath)
}

/**
 * 函数说明：判断右侧栏是否展示工具热榜，需同时满足全局开关与右栏开关开启。
 */
const shouldShowSidebarToolRanking = computed(() => {
  if (!siteConfig.value) {
    return true
  }
  return siteConfig.value.toolRankingEnabled && siteConfig.value.toolRankingShowOnSidebar
})

/**
 * 函数说明：读取右侧栏热榜标题，未配置时回退默认标题。
 */
const sidebarToolRankingTitle = computed(() => {
  return siteConfig.value?.toolRankingSidebarTitle || '本周热榜'
})

/**
 * 函数说明：读取右侧栏热榜周期，未配置时回退周榜。
 */
const sidebarToolRankingPeriod = computed(() => {
  return siteConfig.value?.toolRankingSidebarPeriod || 'week'
})

/**
 * 函数说明：监听路由变化，切换工具后同步刷新推荐与最近使用列表。
 */
watch(() => route.path, (newPath) => {
  void syncRightSidebarState(newPath)
})

/**
 * 函数说明：组件挂载时初始化右侧推荐与最近使用数据。
 */
onMounted(() => {
  getRecentTools()
  void syncRightSidebarState(route.path)
})

// 判断是否为工具页面
const isToolPage = computed(() => route.path.startsWith('/tools/'))
</script>

<template>
  <div v-if="shouldShowRecommend" class="sticky top-[5.5rem] w-56 overflow-hidden">
    <!-- 最近使用的工具 -->
    <div v-if="recentTools.length > 0" class="bg-white rounded-xl shadow-sm mb-4">
      <div class="px-4 py-3 border-b border-gray-100">
        <h3 class="text-base font-medium text-gray-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" aria-hidden="true" role="img">
            <title>最近使用工具图标</title>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          最近使用
        </h3>
      </div>
      <div class="divide-y divide-gray-100">
        <div
          v-for="tool in recentTools"
          :key="tool.url"
          :class="[
            'block px-4 py-3 transition-all duration-200 group',
            isToolDisabled(tool) ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-50 cursor-pointer'
          ]"
          :aria-label="`使用${tool.title}工具：${tool.desc}`"
          @click="handleToolEntryClick(tool)"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-800 group-hover:text-green-500 transition-colors">
                {{ tool.title }}
              </div>
              <div class="text-xs text-gray-500 mt-1 line-clamp-1">
                {{ tool.desc }}
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 相关工具推荐 -->
    <div class="bg-white rounded-xl shadow-sm mb-4">
      <div class="px-4 py-3 border-b border-gray-100">
        <h3 class="text-base font-medium text-gray-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" aria-hidden="true" role="img">
            <title>相关工具图标</title>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          相关工具
        </h3>
      </div>
      <div class="divide-y divide-gray-100">
        <div
          v-for="tool in relatedTools"
          :key="tool.url"
          :class="[
            'block px-4 py-3 transition-all duration-200 group',
            isToolDisabled(tool) ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-50 cursor-pointer'
          ]"
          :aria-label="`使用${tool.title}工具：${tool.desc}`"
          @click="handleToolEntryClick(tool)"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-800 group-hover:text-blue-500 transition-colors">
                {{ tool.title }}
              </div>
              <div class="text-xs text-gray-500 mt-1 line-clamp-1">
                {{ tool.desc }}
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <ToolRankingBoard
      v-if="shouldShowSidebarToolRanking"
      :title="sidebarToolRankingTitle"
      :period="sidebarToolRankingPeriod"
      :limit="5"
      compact
      :fallback-tools="randomTools"
      empty-text="当前热榜还在积累数据，先展示随机推荐"
    />
  </div>
</template>

<style scoped>
.sticky {
  position: sticky;
  top: 0;
}
</style>
