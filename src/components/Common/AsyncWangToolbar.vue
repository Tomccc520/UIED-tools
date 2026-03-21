<!--
 * @file AsyncWangToolbar.vue
 * @description 异步加载 wangEditor 工具栏组件，避免全局提前加载富文本依赖
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
-->
<template>
  <Suspense>
    <template #default>
      <component :is="AsyncToolbarComponent" v-bind="attrs" />
    </template>
    <template #fallback>
      <div class="async-wang-toolbar-skeleton">工具栏加载中...</div>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { defineAsyncComponent, useAttrs } from 'vue'
import { ensureWangEditorReady } from './wangEditorAsync'

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

/**
 * 异步加载 wangEditor 的 Toolbar 组件
 * 与编辑器主体共享同一依赖加载 Promise，避免重复请求
 */
const AsyncToolbarComponent = defineAsyncComponent({
  loader: async () => {
    const { Toolbar } = await ensureWangEditorReady()
    return Toolbar
  },
  delay: 0,
  suspensible: false
})
</script>

<style scoped>
.async-wang-toolbar-skeleton {
  height: 42px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.875rem;
  background: #f9fafb;
}
</style>
