<!--
 * @file VideoUploadZone.vue
 * @description 视频上传兼容包装，复用公共上传区并保留现有选择、拖拽事件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-20
-->

<script setup lang="ts">
import FileUploadZone from '@/components/Common/FileUploadZone.vue'

defineProps<{
  title: string
  formats: string
  hint?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: []
  drop: [event: DragEvent]
}>()
</script>

<template>
  <FileUploadZone
    class="video-upload-zone"
    external-picker
    size="large"
    :title="title"
    :description="formats"
    :hint="hint || '也可以将文件拖拽到这里'"
    :disabled="disabled"
    button-label="选择视频"
    @select="emit('select')"
    @drop="emit('drop', $event)"
  />
</template>

<style scoped>
.video-upload-zone { margin-top: 20px; }
</style>
