<!--
* @file ToolIcon.vue
* @description 工具图标组件，支持 SVG 和图片两种类型的图标展示
* @author UIED技术团队
* @copyright Tomda (https://www.tomda.top)
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2024-1-10
*
* 功能特性：
* 1. 支持 SVG 图标展示
* 2. 支持图片图标展示
* 3. 鼠标移入触发 SVG 描边动画
* 4. 平滑的过渡动画
* 5. 响应式尺寸
-->

<template>
  <div class="tool-icon" aria-hidden="true">
    <template v-if="typeof icon === 'object' && icon.type === 'svg' && icon.name && getSvgIcon(icon.name)">
      <div class="icon-wrapper" v-html="getSvgIcon(icon.name)?.content" />
    </template>
    <template v-else-if="typeof icon === 'string'">
      <img :src="icon" class="icon-image" alt="" />
    </template>
    <template v-else>
      <div class="icon-placeholder">
        <span class="text-xs">图标</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { toolIcons } from './icons'

interface Props {
  icon: string | { type: 'svg', name: string }
}

defineProps<Props>()

/**
 * 函数说明：按图标名称读取内置 SVG，未匹配时由模板显示占位图标。
 */
const getSvgIcon = (name: string) => {
  return toolIcons[name as keyof typeof toolIcons]
}
</script>

<style scoped>
.tool-icon {
  @apply w-10 h-10 min-h-[2.5rem] min-w-[2.5rem] rounded-full flex items-center justify-center;
  color: var(--uied-color-primary);
  background-color: var(--uied-color-primary-soft);
  transition: color var(--uied-motion-fast) ease, background-color var(--uied-motion-fast) ease;
}

.icon-wrapper {
  @apply w-6 h-6;
}

.icon-image {
  @apply w-6 h-6 object-contain;
}

.icon-placeholder {
  @apply w-6 h-6 flex items-center justify-center;
}

:deep(svg) {
  width: 100%;
  height: 100%;
  stroke: currentColor;
  transition: stroke var(--uied-motion-fast) ease;
}

:deep(svg path) {
  stroke-dasharray: 50;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset var(--uied-motion-base) ease;
}

.tool-icon:hover :deep(svg path) {
  animation: dash 1.5s ease;
}

@keyframes dash {
  0% {
    stroke-dashoffset: 50;
  }

  100% {
    stroke-dashoffset: 0;
  }
}
</style>
