<!--
 * @file AsyncCodeDiff.vue
 * @description 异步加载的文本对比组件封装，避免非对比页面提前加载 v-code-diff
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
-->
<template>
  <Suspense>
    <template #default>
      <component :is="AsyncCodeDiffComponent" v-bind="attrs" />
    </template>
    <template #fallback>
      <div class="async-code-diff-skeleton">对比组件加载中...</div>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { defineAsyncComponent, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

/**
 * 异步加载 v-code-diff 组件
 * 仅在 Diff 页面真正渲染时拉取依赖，降低主包解析压力
 */
const AsyncCodeDiffComponent = defineAsyncComponent({
  loader: async () => {
    const module = await import('v-code-diff')
    return module.CodeDiff
  },
  delay: 0,
  suspensible: false
})
</script>

<style scoped>
.async-code-diff-skeleton {
  min-height: 200px;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.875rem;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
