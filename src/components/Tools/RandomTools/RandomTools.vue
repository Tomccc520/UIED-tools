<!--
* @file RandomTools.vue
* @description 随机工具推荐页面
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-1-10
*
* 功能特性：
* 1. 随机推荐工具
* 2. 按分类随机
* 3. 动画效果
* 4. 自动轮播
* 5. 交互式推荐
-->

<template>
  <div class="random-tools-container p-6">
    <!-- 顶部操作区 -->
    <div class="mb-12">
      <!-- 标题和操作区 -->
      <div class="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
        <div class="flex-1 w-full">
          <h1
            class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            随机工具推荐
          </h1>
          <p class="text-gray-500 text-sm">每次为你精选不同的实用工具，助你提高效率</p>
        </div>
        <div class="w-full sm:w-auto">
          <button
            class="refresh-button group w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl px-8 py-4 flex items-center justify-center gap-3 transition-all duration-300"
            @click="refreshTools" :disabled="loading">
            <div class="w-6 h-6" :class="{ 'animate-spin': loading }">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                class="transform group-hover:rotate-180 transition-transform duration-500">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span class="text-lg font-medium">换一批推荐</span>
            <div
              class="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            </div>
          </button>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="categories-wrapper bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
        <div class="flex flex-wrap gap-3">
          <button v-for="cate in categories" :key="cate.id"
            class="category-tag px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300"
            :class="selectedCategory === cate.id ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 hover:shadow-sm'"
            @click="selectCategory(cate.id)">
            {{ cate.title }}
          </button>
        </div>
      </div>
    </div>

    <!-- 工具卡片网格 -->
    <TransitionGroup name="tools-grid" tag="div" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="tool in randomTools" :key="tool.id"
        class="tool-card group relative bg-white rounded-2xl transition-all duration-300 cursor-pointer"
        @click="handleToolClick(tool)">
        <!-- 卡片内容 -->
        <div class="p-8">
          <!-- 图标和标题区 -->
          <div class="flex items-start gap-4 mb-4">
            <div
              class="tool-icon-wrapper w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <ToolIcon :icon="tool.logo" class="w-6 h-6" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 mb-1 truncate">{{ tool.title }}</h3>
              <div class="category-badge">{{ tool.cate }}</div>
            </div>
          </div>

          <!-- 描述 -->
          <p class="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-6">{{ tool.desc }}</p>

          <!-- 使用按钮 -->
          <div
            class="absolute bottom-0 left-0 right-0 h-16 px-8 flex items-center justify-between border-t border-gray-100">
            <span class="text-sm text-gray-500">点击使用</span>
            <div class="flex items-center text-blue-600">
              <span
                class="text-sm font-medium mr-2 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">立即使用</span>
              <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 悬停效果装饰 -->
        <div
          class="absolute inset-0 rounded-2xl border border-gray-200 group-hover:border-blue-200 transition-colors duration-300">
        </div>
        <div
          class="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10">
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToolsStore } from '@/store/modules/tools'
import type { Tool, ToolCategory } from '@/store/modules/tools'
import ToolIcon from '../ToolIcon.vue'

const router = useRouter()
const store = useToolsStore()

// 状态
const loading = ref(false)
const selectedCategory = ref(0)
const randomTools = ref<Tool[]>([])
const categories = ref([
  { id: 0, title: '全部分类' },
  { id: -1, title: '热门工具' },
  ...store.cates
])

// 处理工具点击
const handleToolClick = (tool: Tool) => {
  window.open(tool.url, '_blank')
}

// 获取分类列表
const getCategoryList = (toolsCate: ToolCategory[]) => {
  const categories = [
    { id: 0, title: '全部分类' },
    { id: -1, title: '热门工具' }
  ]

  // 只添加顶级分类
  toolsCate.forEach((cate: ToolCategory) => {
    categories.push({
      id: cate.id,
      title: cate.title
    })
  })

  return categories
}

// 刷新工具列表
const refreshTools = async () => {
  loading.value = true
  try {
    // 等待获取工具分类数据
    await store.getToolCate()
    // 直接从store中获取工具分类
    const toolsCate = store.cates
    console.log('获取到的分类数据:', toolsCate)

    // 更新分类列表
    categories.value = getCategoryList(toolsCate)

    // 递归获取所有工具
    const getAllTools = (items: any[]): Tool[] => {
      let tools: Tool[] = []
      for (const item of items) {
        console.log('正在处理的item:', item)
        if (item.list && Array.isArray(item.list)) {
          // 如果有list属性，继续递归
          tools = [...tools, ...getAllTools(item.list)]
        } else if (item.url) {
          // 如果有url属性，说明是最终的工具
          tools.push(item)
        }
      }
      return tools
    }

    // 获取所有工具
    const allTools: Tool[] = []
    toolsCate.forEach((cate: ToolCategory) => {
      console.log('处理分类:', cate.title)
      const categoryTools = getAllTools(cate.list)
      console.log('该分类获取到的工具:', categoryTools)
      allTools.push(...categoryTools)
    })

    console.log('所有获取到的工具:', allTools)
    const adTools = store.recommends || []
    console.log('广告工具:', adTools)

    // 根据选中的分类筛选工具
    let filteredTools: Tool[] = []
    if (selectedCategory.value === 0) {
      // 全部分类，包含所有工具和热门工具
      filteredTools = [...allTools, ...adTools]
    } else if (selectedCategory.value === -1) {
      // 热门工具分类，只显示热门工具
      filteredTools = adTools
    } else {
      // 其他分类，按分类ID筛选
      filteredTools = allTools.filter((tool: Tool) => {
        // 获取工具所属的顶级分类
        const parentCate = toolsCate.find((cate: ToolCategory) => {
          // 遍历所有层级查找工具
          const findToolInList = (items: any[]): boolean => {
            for (const item of items) {
              if (item.url === tool.url) {
                return true
              }
              if (item.list && Array.isArray(item.list)) {
                if (findToolInList(item.list)) {
                  return true
                }
              }
            }
            return false
          }

          return findToolInList(cate.list)
        })

        return parentCate?.id === selectedCategory.value
      })
    }

    console.log('筛选后的工具:', filteredTools)
    // 随机选择工具
    randomTools.value = shuffleArray(filteredTools).slice(0, 6)
    console.log('最终展示的工具:', randomTools.value)
  } catch (error) {
    console.error('获取工具列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 选择分类
const selectCategory = (cateId: number) => {
  selectedCategory.value = cateId
  refreshTools()
}

// 打乱数组
const shuffleArray = <T extends Tool>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// 生命周期钩子
onMounted(() => {
  refreshTools()
})
</script>

<style scoped>
.tool-card {
  height: 280px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background-color: #f3f4f6;
  color: #6b7280;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* 网格动画 */
.tools-grid-enter-active,
.tools-grid-leave-active {
  transition: all 0.5s ease;
}

.tools-grid-enter-from,
.tools-grid-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.tools-grid-leave-active {
  position: absolute;
}

@media (max-width: 640px) {
  .tool-card {
    height: 240px;
  }
}

.refresh-button {
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.2), 0 4px 8px -2px rgba(59, 130, 246, 0.1);
}

.refresh-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.refresh-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px -4px rgba(59, 130, 246, 0.3), 0 6px 12px -2px rgba(59, 130, 246, 0.15);
}

.category-tag {
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.category-tag:hover {
  transform: translateY(-1px);
}
</style>
