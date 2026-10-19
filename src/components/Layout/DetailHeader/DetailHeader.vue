<!--
 * @file DetailHeader.vue
 * @description 工具页公共标题区域
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-28
 -->
<script setup lang="ts">
// import { Star } from '@element-plus/icons-vue'
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router'
import { useToolsStore } from '@/store/modules/tools'
// import { ElMessageBox } from 'element-plus'
import { ensureFreeToolTitle } from '@/utils/string'
import { findToolByUrl } from '@/services/toolCatalog'
const props = defineProps({
  title: String,
  subtitle: String,
  primaryHeading: Boolean,
  id: Number
})
const route = useRoute()
//store
const toolsStore = useToolsStore()

/**
 * 函数说明：缺少工具目录时加载配置；路由切换直接复用目录，避免旧页面请求覆盖当前标题。
 */
const loadToolCatalog = async () => {
  if (!toolsStore.cates.length) await toolsStore.getToolCate()
}

/**
 * 函数说明：按当前路由实时查找标题和简介，不读取可能被旧页面异步请求覆盖的共享详情。
 */
const currentToolInfo = computed(() => findToolByUrl(toolsStore.cates, route.fullPath || route.path))

/**
 * 函数说明：工具页头部标题统一补齐“免费”前缀，优先读取后台工具标题。
 */
const displayTitle = computed(() => {
  return ensureFreeToolTitle(currentToolInfo.value?.title || props.title || '')
})

/**
 * 函数说明：工具页副标题优先读取后台工具简介，未配置时回退组件传入文案。
 */
const displaySubtitle = computed(() => {
  return currentToolInfo.value?.desc || props.subtitle || ''
})

//收藏
// const collect = () => {
//   ElMessageBox({
//     title: '提示',
//     message: '请使用快捷键`Ctrl+D`进行收藏'
//   })
// }

onMounted(() => {
  void loadToolCatalog()
})

</script>

<template>
  <div class="uied-tool-card flex flex-col rounded-lg bg-white p-4 mt-4 mb-4">
    <component :is="primaryHeading ? 'h1' : 'div'" class="text-xl font-medium">
      {{ displayTitle }}
    </component>
    <div v-if="displaySubtitle" class="text-sm text-gray-600 mt-2">
      {{ displaySubtitle }}
    </div>
  </div>
</template>

<style scoped></style>
