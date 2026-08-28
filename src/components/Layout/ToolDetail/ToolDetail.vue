<!--
 * @file ToolDetail.vue
 * @description 工具页公共说明内容区域
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-28
 -->
<script setup lang="ts">
import { onMounted } from 'vue';
const props = defineProps({
  title: {
    type: String,
    default: '描述'
  }
})

onMounted(() => {
})
</script>

<template>
  <!-- desc -->
  <div class="uied-tool-card mt-4 rounded-lg bg-white p-4">
    <el-divider content-position="left">{{ props.title }}</el-divider>
    <div class="m-4">
      <slot></slot>
    </div> 
  </div>
</template>

<style scoped>

</style>
