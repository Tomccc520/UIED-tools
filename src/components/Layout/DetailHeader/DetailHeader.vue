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
import { computed, onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router'
import { useToolsStore } from '@/store/modules/tools'
// import { ElMessageBox } from 'element-plus'
import { ensureFreeToolTitle, rtrim } from '@/utils/string'
const props = defineProps({
  title: String,
  subtitle: String,
  id: Number
})
const route = useRoute()
//查询参数
const searchParam = reactive({
  cateId: 0,
  title: '',
  route: ''
})
//store
const toolsStore = useToolsStore()

/**
 * 函数说明：读取当前路由对应的工具配置，优先让页头文案跟随后台工具分类树。
 */
const loadToolInfo = async () => {
  const routeStr = route.path
  searchParam.route = rtrim(routeStr, '/')
  await toolsStore.getToolInfo(searchParam)
}

/**
 * 函数说明：提取当前工具配置，供标题和简介优先使用后台化数据。
 */
const currentToolInfo = computed(() => toolsStore.toolInfo)

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
  void loadToolInfo()
})

watch(
  () => route.path,
  () => {
    void loadToolInfo()
  }
)

</script>

<template>
  <div class="uied-tool-card flex flex-col rounded-lg bg-white p-4 mt-4 mb-4">
    <div class="text-xl font-medium">
      {{ displayTitle }}
    </div>
    <div v-if="displaySubtitle" class="text-sm text-gray-600 mt-2">
      {{ displaySubtitle }}
    </div>
  </div>
</template>

<style scoped></style>
