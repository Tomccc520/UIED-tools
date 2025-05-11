<!--
 * @file Right.vue
 * @description 右侧边栏组件，展示推荐工具
 * @author UIED技术团队
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
import { reactive, computed, ref, watch, onMounted } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import ToolsExport from '@/components/Tools/tools'
import { useToolsStore } from '@/store/modules/tools'
import type { Tool } from '@/types/tools'

const route = useRoute()

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

// 获取工具数据
const getToolsData = async () => {
  if (!route.path.startsWith('/tools/') || !shouldShowRecommend.value) return

  // 等待工具分类数据加载完成
  await toolsStore.getToolCate()

  // 获取相关工具和随机工具
  relatedTools.value = ToolsExport.getRelatedTools(route.path, 8)
  randomTools.value = ToolsExport.getRandomTools(8, route.path)
}

// 从localStorage获取最近使用记录
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

// 添加当前工具到最近使用记录
const addToRecentTools = (currentPath: string) => {
  if (!currentPath.startsWith('/tools/')) return

  // 获取当前工具信息（使用现有方法查找当前工具）
  const allTools = ToolsExport.toolsList()
  const currentTool = allTools.find(tool => tool.url === currentPath)
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

// 监听路由变化
watch(() => route.path, (newPath) => {
  getToolsData()
  addToRecentTools(newPath) // 添加到最近使用
})

// 组件挂载时获取数据
onMounted(() => {
  getToolsData()
  getRecentTools() // 获取最近使用工具
  addToRecentTools(route.path) // 记录当前工具
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
        <router-link v-for="tool in recentTools" :key="tool.url" :to="tool.url"
          class="block px-4 py-3 hover:bg-gray-50 transition-all duration-200 group"
          :aria-label="`使用${tool.title}工具：${tool.desc}`">
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
        </router-link>
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
        <router-link v-for="tool in relatedTools" :key="tool.url" :to="tool.url"
          class="block px-4 py-3 hover:bg-gray-50 transition-all duration-200 group"
          :aria-label="`使用${tool.title}工具：${tool.desc}`">
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
        </router-link>
      </div>
    </div>

    <!-- 随机工具推荐 -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="px-4 py-3 border-b border-gray-100">
        <h3 class="text-base font-medium text-gray-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" aria-hidden="true" role="img">
            <title>随机推荐工具图标</title>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
          随机推荐
        </h3>
      </div>
      <div class="divide-y divide-gray-100">
        <router-link v-for="tool in randomTools" :key="tool.url" :to="tool.url"
          class="block px-4 py-3 hover:bg-gray-50 transition-all duration-200 group"
          :aria-label="`使用${tool.title}工具：${tool.desc}`">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-800 group-hover:text-purple-500 transition-colors">
                {{ tool.title }}
              </div>
              <div class="text-xs text-gray-500 mt-1 line-clamp-1">
                {{ tool.desc }}
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sticky {
  position: sticky;
  top: 0;
}
</style>
