<template>
  <div class="tools-list">
    <div v-for="cate in toolsList" :key="cate.id" class="mb-8">
      <h2 class="text-lg font-medium mb-4">{{ cate.title }}</h2>
      <div v-for="subCate in cate.list" :key="subCate.id" class="mb-6">
        <h3 class="text-base font-medium mb-3 text-gray-700">{{ subCate.title }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <router-link v-for="tool in subCate.list" :key="tool.id" :to="tool.url"
            class="block p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
            <div class="flex items-start space-x-3">
              <ToolIcon :icon="tool.logo" />
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 mb-1">{{ tool.title }}</h4>
                <p class="text-sm text-gray-500 line-clamp-2">{{ tool.desc }}</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */
import { computed, onMounted } from 'vue'
import { useToolsStore } from '@/store/modules/tools'
import ToolIcon from './ToolIcon.vue'

const toolsStore = useToolsStore()

/**
 * 函数说明：工具列表组件统一读取 store 中的工具分类，优先使用后台配置，接口异常时回退前端默认分类。
 */
const toolsList = computed(() => toolsStore.cates)

/**
 * 函数说明：组件挂载时补拉一次工具分类，确保独立使用该组件时也能获得最新后台配置。
 */
const initToolList = async () => {
  if (toolsStore.cates.length > 0) {
    return
  }
  await toolsStore.getToolCate()
}

onMounted(() => {
  void initToolList()
})
</script> 
