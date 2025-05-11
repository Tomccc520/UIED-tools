<!--
* @file ToolIcon.vue
* @description 工具图标组件，支持 SVG 和图片两种类型的图标展示
* @author UIED技术团队
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
  <div class="tool-icon">
    <template v-if="typeof icon === 'object' && icon.type === 'svg' && icon.name">
      <div class="icon-wrapper" v-html="toolIcons[icon.name].content" />
    </template>
    <template v-else-if="typeof icon === 'string'">
      <img :src="icon" class="icon-image" :alt="icon" />
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
  icon: string | { type: 'svg', name: keyof typeof toolIcons }
}

defineProps<Props>()
</script>

<style scoped>
.tool-icon {
  @apply w-10 h-10 min-h-[2.5rem] min-w-[2.5rem] rounded-full flex items-center justify-center;
  background-color: rgba(108, 84, 255, 0.1);
  color: #6C54FF;
  transition: all 0.3s ease;
}

.icon-wrapper {
  @apply w-6 h-6;
  transition: all 0.3s ease;
}

.icon-image {
  @apply w-6 h-6 object-contain;
  transition: all 0.3s ease;
}

.icon-placeholder {
  @apply w-6 h-6 flex items-center justify-center;
}

:deep(svg) {
  width: 100%;
  height: 100%;
  stroke: #6C54FF;
  transition: all 0.3s ease;
}

:deep(svg path) {
  stroke-dasharray: 50;
  stroke-dashoffset: 0;
  transition: all 0.3s ease;
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
