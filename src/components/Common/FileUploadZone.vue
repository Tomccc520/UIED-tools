<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
-->

<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'

const props = withDefaults(defineProps<{
  title: string
  description?: string
  hint?: string
  ariaLabel?: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  busy?: boolean
  busyText?: string
  buttonLabel?: string
  size?: 'compact' | 'default' | 'large'
  externalPicker?: boolean
}>(), { multiple: false, disabled: false, busy: false, size: 'default', externalPicker: false })

const emit = defineEmits<{
  files: [files: File[]]
  select: []
  drop: [event: DragEvent]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)
const descriptionId = `file-upload-${useId()}`

/** 打开原生选择器，或让兼容包装层使用自己的选择器；禁用时不触发任何选择操作。 */
function selectFiles() {
  if (props.disabled) return
  if (props.externalPicker) emit('select')
  else fileInput.value?.click()
}

/** 按原始顺序交付文件，单选只取第一张；格式、大小、解码与业务校验由工具负责。 */
function submitFiles(files: File[]) {
  if (props.disabled || !files.length) return
  emit('files', props.multiple ? files : files.slice(0, 1))
}

/** 先快照文件再清空输入，允许再次选择同一个文件，取消选择时不产生上传事件。 */
function handleChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''
  submitFiles(files)
}

/** 仅在可用时显示拖入高亮；始终阻止浏览器把拖入文件作为新页面打开。 */
function handleDragOver() {
  isDragOver.value = !props.disabled
}

/** 在上传区内部子元素间移动时保持高亮，真正离开整个区域时才复位。 */
function handleDragLeave(event: DragEvent) {
  const target = event.currentTarget as HTMLElement
  if (event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return
  isDragOver.value = false
}

/** 交付拖入文件或兼容原始拖拽事件，外部选择器模式不会再重复派发 files。 */
function handleDrop(event: DragEvent) {
  isDragOver.value = false
  if (props.disabled) return
  if (props.externalPicker) emit('drop', event)
  else submitFiles(Array.from(event.dataTransfer?.files || []))
}

/** 处理状态切换为禁用时撤销高亮，避免拖拽过程中按钮禁用后仍显示可上传。 */
watch(() => props.disabled, (disabled) => {
  if (disabled) isDragOver.value = false
})
</script>

<template>
  <div
    class="file-upload-zone"
    :class="[`file-upload-zone--${size}`, { 'file-upload-zone--active': isDragOver, 'file-upload-zone--disabled': disabled }]"
    :aria-busy="busy"
    @dragover.prevent="handleDragOver"
    @dragenter.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <input
      v-if="!externalPicker"
      ref="fileInput"
      type="file"
      hidden
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      :aria-label="ariaLabel || title"
      @change="handleChange"
    >
    <button
      type="button"
      class="file-upload-zone__trigger"
      :disabled="disabled"
      :aria-label="ariaLabel || title"
      :aria-describedby="descriptionId"
      @click="selectFiles"
    ></button>
    <span class="file-upload-zone__icon" aria-hidden="true"><slot name="icon"><UploadFilled /></slot></span>
    <strong class="file-upload-zone__title">{{ title }}</strong>
    <div :id="descriptionId" class="file-upload-zone__description">
      <p v-if="description">{{ description }}</p>
      <p v-if="hint" class="file-upload-zone__hint">{{ hint }}</p>
    </div>
    <span v-if="buttonLabel" class="file-upload-zone__button" aria-hidden="true">{{ buttonLabel }}</span>
    <p v-if="busy && busyText" role="status" aria-live="polite" class="file-upload-zone__status">{{ busyText }}</p>
  </div>
</template>

<style scoped>
.file-upload-zone {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 200px;
  padding: 24px 20px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border: 1px dashed var(--uied-color-border);
  border-radius: var(--uied-radius-md);
  color: var(--uied-color-text);
  background: var(--uied-color-surface-subtle);
  text-align: center;
  overflow-wrap: anywhere;
  transition: border-color var(--uied-motion-fast) ease, background-color var(--uied-motion-fast) ease;
}
.file-upload-zone:not(.file-upload-zone--disabled):hover,
.file-upload-zone--active {
  border-color: var(--uied-color-primary);
  background: var(--uied-color-primary-soft);
}
.file-upload-zone__trigger {
  position: absolute;
  z-index: 1;
  inset: 0;
  width: 100%;
  min-height: 44px;
  padding: 0;
  border: 0;
  border-radius: inherit;
  background: transparent;
  cursor: pointer;
}
.file-upload-zone__trigger:focus-visible { outline: 2px solid var(--uied-color-primary); outline-offset: 4px; }
.file-upload-zone__trigger:disabled { cursor: not-allowed; }
.file-upload-zone--disabled { opacity: 0.6; }
.file-upload-zone__icon { display: inline-flex; width: 32px; height: 32px; color: var(--uied-color-primary); pointer-events: none; }
.file-upload-zone__icon :deep(svg) { width: 100%; height: 100%; }
.file-upload-zone__title { margin-top: 12px; font-size: 14px; font-weight: 600; line-height: 1.5; pointer-events: none; }
.file-upload-zone__description { margin-top: 6px; color: var(--uied-color-text-secondary); font-size: 12px; line-height: 1.6; pointer-events: none; }
.file-upload-zone__description p { margin: 0; }
.file-upload-zone__hint { margin-top: 2px !important; }
.file-upload-zone__button { display: inline-flex; min-width: 120px; min-height: 44px; margin-top: 20px; padding: 0 18px; align-items: center; justify-content: center; border: 1px solid var(--uied-color-primary); border-radius: var(--uied-radius-sm); color: white; background: var(--uied-color-primary); font-size: 14px; font-weight: 600; pointer-events: none; }
.file-upload-zone:not(.file-upload-zone--disabled):hover .file-upload-zone__button { border-color: var(--uied-color-primary-hover); background: var(--uied-color-primary-hover); }
.file-upload-zone__status { margin: 12px 0 0; color: var(--uied-color-text-secondary); font-size: 12px; line-height: 1.6; pointer-events: none; }
.file-upload-zone--compact { min-height: 150px; padding: 20px 16px; }
.file-upload-zone--large { min-height: 300px; padding: 36px 20px; }
.file-upload-zone--large .file-upload-zone__icon { width: 52px; height: 52px; padding: 12px; border-radius: var(--uied-radius-md); background: var(--uied-color-primary-soft); }
.file-upload-zone--large .file-upload-zone__title { margin-top: 16px; font-size: 18px; font-weight: 700; }
.file-upload-zone--large .file-upload-zone__description { font-size: 13px; }
@media (max-width: 640px) { .file-upload-zone--large { min-height: 236px; padding: 28px 16px; } }
</style>
