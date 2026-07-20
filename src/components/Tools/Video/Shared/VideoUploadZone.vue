<!--
 * @file VideoUploadZone.vue
 * @description 视频工具统一上传区，支持点击选择和拖拽上传
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-20
-->

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'

defineProps<{
  title: string
  formats: string
  hint?: string
}>()

const emit = defineEmits<{
  select: []
  drop: [event: DragEvent]
}>()

const isDragOver = ref(false)

/**
 * 函数说明：结束拖拽态并将文件事件交给业务页面处理。
 */
const handleDrop = (event: DragEvent) => {
  isDragOver.value = false
  emit('drop', event)
}
</script>

<template>
  <div
    class="video-upload-zone"
    :class="{ 'video-upload-zone--active': isDragOver }"
    @click="emit('select')"
    @dragover.prevent="isDragOver = true"
    @dragleave.prevent="isDragOver = false"
    @drop.prevent="handleDrop"
  >
    <div class="video-upload-zone__icon">
      <el-icon><UploadFilled /></el-icon>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ formats }}</p>
    <button type="button" class="video-upload-zone__button" @click.stop="emit('select')">选择视频</button>
    <span class="video-upload-zone__hint">{{ hint || '也可以将文件拖拽到这里' }}</span>
  </div>
</template>

<style scoped>
.video-upload-zone {
  display: flex;
  min-height: 300px;
  margin-top: 20px;
  border: 1px dashed #b9c5d6;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 20px;
  text-align: center;
  transition: border-color 160ms ease, background-color 160ms ease;
}

.video-upload-zone:hover,
.video-upload-zone--active {
  border-color: #2563eb;
  background: #f3f7ff;
}

.video-upload-zone__icon {
  display: inline-flex;
  width: 52px;
  height: 52px;
  border-radius: 8px;
  background: #e8efff;
  color: #2563eb;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.video-upload-zone h3 {
  margin: 16px 0 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0;
}

.video-upload-zone p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.video-upload-zone__button {
  min-width: 120px;
  margin-top: 20px;
  border: 1px solid #2563eb;
  border-radius: 6px;
  background: #2563eb;
  color: #ffffff;
  font-size: 14px;
  font-weight: 650;
  line-height: 40px;
  padding: 0 18px;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.video-upload-zone__button:hover {
  border-color: #1d4ed8;
  background: #1d4ed8;
}

.video-upload-zone__hint {
  margin-top: 9px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .video-upload-zone {
    min-height: 260px;
    padding: 28px 16px;
  }
}
</style>
