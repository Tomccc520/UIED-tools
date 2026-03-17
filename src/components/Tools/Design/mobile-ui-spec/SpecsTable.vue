<!--
 * @file SpecsTable.vue
 * @description 移动端规格表子组件，统一展示并提供复制能力
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
-->
<template>
  <div class="mb-6">
    <h5 class="text-lg font-medium mb-3 pb-1 border-b border-gray-100">{{ title }}</h5>
    <div class="device-spec-table space-y-2">
      <div
        v-for="(spec, index) in items"
        :key="`${spec.label}-${index}`"
        class="device-spec-row group flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
      >
        <div class="spec-label text-sm text-gray-500">{{ spec.label }}</div>
        <div class="spec-value font-mono text-sm font-medium text-gray-800 flex items-center gap-2">
          {{ spec.value }}
          <el-button
            type="primary"
            link
            size="small"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            @click="handleCopy(spec.value)"
          >
            <el-icon>
              <CopyDocument />
            </el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CopyDocument } from '@element-plus/icons-vue'

interface SpecRow {
  label: string
  value: string
}

defineProps<{
  title: string
  items: SpecRow[]
}>()

const emit = defineEmits<{
  (event: 'copy', value: string): void
}>()

/**
 * 处理规格值复制动作
 * 由父组件统一执行复制逻辑和提示，子组件仅负责触发事件
 */
const handleCopy = (value: string) => {
  emit('copy', value)
}
</script>

<style scoped>
.device-spec-table {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.device-spec-row {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.device-spec-row:last-child {
  border-bottom: none;
}

.spec-label {
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  font-weight: 500;
  color: #374151;
  width: 40%;
  border-right: 1px solid #e5e7eb;
}

.spec-value {
  padding: 0.75rem 1rem;
  color: #4b5563;
  width: 60%;
}

.device-spec-table .device-spec-row:first-child .spec-label {
  border-top-left-radius: 0.5rem;
}

.device-spec-table .device-spec-row:first-child .spec-value {
  border-top-right-radius: 0.5rem;
}

.device-spec-table .device-spec-row:last-child .spec-label {
  border-bottom-left-radius: 0.5rem;
}

.device-spec-table .device-spec-row:last-child .spec-value {
  border-bottom-right-radius: 0.5rem;
}
</style>
