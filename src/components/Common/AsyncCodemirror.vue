<!--
 * @file AsyncCodemirror.vue
 * @description 异步加载的 CodeMirror 编辑器封装，降低工具页首屏依赖解析压力
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
-->
<template>
  <Suspense>
    <template #default>
      <component
        :is="AsyncCodemirrorComponent"
        :model-value="modelValue"
        :placeholder="placeholder"
        :style="editorStyle"
        :autofocus="autofocus"
        :indent-with-tab="indentWithTab"
        :tab-size="tabSize"
        :extensions="props.extensions as any"
        @update:model-value="handleUpdate"
      />
    </template>
    <template #fallback>
      <div class="async-codemirror-skeleton" :style="editorStyle">编辑器加载中...</div>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  height?: string | number
  autofocus?: boolean
  indentWithTab?: boolean
  tabSize?: number
  extensions?: unknown[]
}>(), {
  placeholder: '',
  height: '400px',
  autofocus: true,
  indentWithTab: true,
  tabSize: 2,
  extensions: () => []
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

/**
 * 异步加载 CodeMirror 组件
 * 将重量依赖移动到真正访问工具页时加载，避免进入页面前提前解析
 */
const AsyncCodemirrorComponent = defineAsyncComponent({
  loader: async () => {
    const module = await import('vue-codemirror')
    return module.Codemirror
  },
  delay: 0,
  suspensible: false
})

/**
 * 计算编辑器样式
 * 支持 number / string 两种高度入参，统一输出可直接绑定的 style 对象
 */
const editorStyle = computed(() => {
  const normalizedHeight = typeof props.height === 'number' ? `${props.height}px` : props.height
  return { height: normalizedHeight }
})

/**
 * 透传编辑器内容更新
 * 保持与 v-model 语义一致，父组件无需关心异步加载细节
 */
const handleUpdate = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.async-codemirror-skeleton {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-size: 0.875rem;
  background: #f9fafb;
}
</style>
