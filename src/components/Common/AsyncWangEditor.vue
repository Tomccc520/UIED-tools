<!--
 * @file AsyncWangEditor.vue
 * @description 异步加载 wangEditor 编辑器组件，降低首屏依赖体积
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
-->
<template>
  <Suspense>
    <template #default>
      <component :is="AsyncEditorComponent" v-bind="attrs" />
    </template>
    <template #fallback>
      <div class="async-wang-editor-skeleton">编辑器加载中...</div>
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
 * 异步加载 wangEditor 的 Editor 组件
 * 编辑器样式与组件模块在真正渲染时才加载
 */
const AsyncEditorComponent = defineAsyncComponent({
  loader: async () => {
    const { Editor } = await ensureWangEditorReady()
    return Editor
  },
  delay: 0,
  suspensible: false
})
</script>

<style scoped>
.async-wang-editor-skeleton {
  min-height: 240px;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.875rem;
  background: #fff;
}
</style>
