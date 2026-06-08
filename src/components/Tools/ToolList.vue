<template>
  <div class="tools-list">
    <div v-for="cate in toolsList" :key="cate.id" class="mb-8">
      <h2 class="text-lg font-medium mb-4">{{ cate.title }}</h2>
      <div v-for="subCate in cate.list" :key="subCate.id" class="mb-6">
        <h3 class="text-base font-medium mb-3 text-gray-700">{{ subCate.title }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="tool in subCate.list"
            :key="tool.id"
            :class="[
              'block p-4 bg-white rounded-lg transition-shadow relative',
              isToolDisabled(tool) ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'
            ]"
            @click="handleToolCardClick(tool)"
          >
            <div v-if="isToolDisabled(tool)" class="tool-disabled-tag">已停用</div>
            <div class="flex items-start space-x-3">
              <ToolIcon :icon="tool.logo" />
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 mb-1">{{ tool.title }}</h4>
                <p class="text-sm text-gray-500 line-clamp-2">{{ tool.desc }}</p>
              </div>
            </div>
          </div>
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
import { useToolRuntimeGate } from '@/composables/useToolRuntimeGate'
import type { Tool } from '@/types/tools'
import ToolIcon from './ToolIcon.vue'

const toolsStore = useToolsStore()
const { isToolDisabled, openToolEntry } = useToolRuntimeGate()

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

/**
 * 函数说明：处理工具列表卡片点击，停用状态阻断并提示，其余按内链/外链正常跳转。
 */
const handleToolCardClick = async (tool: Tool) => {
  await openToolEntry(tool, {
    target: 'current',
    action: 'open',
    source: 'tool-list'
  })
}

onMounted(() => {
  void initToolList()
})
</script> 

<style scoped>
.tool-disabled-tag {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 4;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}
</style>
