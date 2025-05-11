<!--
* @file ToolsRecommend.vue
* @description 工具推荐公共组件
* @createDate 2025-1-10
*
* 【重要说明】
* 1. 组件用法:
*    import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
*    <ToolsRecommend :currentPath="route.path" />
*
* 2. 数据结构:
*    - 相关工具: 6个同类 + 2个其他,共8个
*    - 热门工具: 固定8个外部链接
*    - 新品工具: 随机8个
*    - 实用工具: 随机8个
*
* 3. 注意事项:
*    - 热门工具区域支持外部链接,使用isExternal属性区分
*    - 其他区域仅支持站内路由跳转
*    - 每个区块必须展示8个工具,不能少
*    - 组件依赖 @/components/Tools/tools.ts 中的工具获取方法
*
* 4. 样式说明:
*    - 使用grid布局,移动端1列,PC端4列
*    - 每个工具卡片使用hover效果
*    - 标题区域使用特定图标和颜色区分
-->

<template>
  <!-- 工具推荐区域 START -->
  <!--
    布局说明:
    - 使用grid布局分为4列
    - gap-4 设置列间距为1rem
    - 移动端自动转为单列
  -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <!-- 1. 相关工具区域
         - 使用闪电图标(蓝色)
         - 展示8个同类工具
         - 仅支持站内路由跳转
    -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="px-4 py-3 border-b border-gray-100">
        <h3 class="text-base font-medium text-gray-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          相关工具
        </h3>
      </div>
      <div class="divide-y divide-gray-100">
        <div v-for="tool in relatedTools" :key="tool.id" @click="handleToolClick(tool)"
          class="block px-4 py-3 hover:bg-gray-50 transition-all duration-200 group cursor-pointer">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-800 group-hover:text-blue-500 transition-colors">{{ tool.title
                }}</div>
              <div class="text-xs text-gray-500 mt-1 line-clamp-1">{{ tool.desc }}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 热门工具区域
         - 使用火焰图标(红色)
         - 展示8个固定的外部推荐工具
         - 支持外部链接跳转
         - 使用isExternal属性区分链接类型
    -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="px-4 py-3 border-b border-gray-100">
        <h3 class="text-base font-medium text-gray-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          热门工具
        </h3>
      </div>
      <div class="divide-y divide-gray-100">
        <template v-for="tool in hotTools" :key="tool.id">
          <router-link v-if="!tool.isExternal" :to="tool.url"
            class="block px-4 py-3 hover:bg-gray-50 transition-all duration-200 group">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium text-gray-800 group-hover:text-red-500 transition-colors">{{ tool.title
                  }}</div>
                <div class="text-xs text-gray-500 mt-1 line-clamp-1">{{ tool.desc }}</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </router-link>
          <a v-else :href="tool.url" target="_blank" rel="noopener noreferrer"
            class="block px-4 py-3 hover:bg-gray-50 transition-all duration-200 group">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-medium text-gray-800 group-hover:text-red-500 transition-colors">{{ tool.title
                  }}</div>
                <div class="text-xs text-gray-500 mt-1 line-clamp-1">{{ tool.desc }}</div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        </template>
      </div>
    </div>

    <!-- 3. 新品工具区域
         - 使用勾选图标(绿色)
         - 随机展示8个最新工具
         - 仅支持站内路由跳转
    -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="px-4 py-3 border-b border-gray-100">
        <h3 class="text-base font-medium text-gray-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          新品上线
        </h3>
      </div>
      <div class="divide-y divide-gray-100">
        <div v-for="tool in newTools" :key="tool.id" @click="handleToolClick(tool)"
          class="block px-4 py-3 hover:bg-gray-50 transition-all duration-200 group cursor-pointer">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-800 group-hover:text-green-500 transition-colors">{{ tool.title
                }}
              </div>
              <div class="text-xs text-gray-500 mt-1 line-clamp-1">{{ tool.desc }}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 实用工具区域
         - 使用工具图标(紫色)
         - 随机展示8个实用工具
         - 仅支持站内路由跳转
    -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="px-4 py-3 border-b border-gray-100">
        <h3 class="text-base font-medium text-gray-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
          实用工具
        </h3>
      </div>
      <div class="divide-y divide-gray-100">
        <div v-for="tool in utilityTools" :key="tool.id" @click="handleToolClick(tool)"
          class="block px-4 py-3 hover:bg-gray-50 transition-all duration-200 group cursor-pointer">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-800 group-hover:text-purple-500 transition-colors">{{ tool.title
                }}
              </div>
              <div class="text-xs text-gray-500 mt-1 line-clamp-1">{{ tool.desc }}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 工具推荐区域 END -->
</template>

<script setup lang="ts">
import { getHotTools, getNewTools, getUtilityTools, getRelatedTools } from '@/components/Tools/tools'

// Props定义
const props = defineProps<{
  currentPath: string  // 当前页面路径,用于获取相关工具
}>()

// 工具点击处理函数
const handleToolClick = (tool: any) => {
  if (tool.isExternal) {
    window.open(tool.url, '_blank')
  } else {
    window.open(`${window.location.origin}${tool.url}`, '_blank')
  }
}

// 获取各类推荐工具数据
// 注意: 每个区块必须返回8个工具
const hotTools = getHotTools(8)  // 热门工具: 8个固定外部链接
const newTools = getNewTools(8)  // 新品工具: 随机8个
const utilityTools = getUtilityTools(8)  // 实用工具: 随机8个
const relatedTools = getRelatedTools(props.currentPath, 8, 0)  // 相关工具: 8个同类工具
</script>
