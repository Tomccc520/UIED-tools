<!--
 * @file VideoProcessStatus.vue
 * @description 视频工具统一处理进度组件，支持显示进度、ETA 与取消按钮
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-19
-->

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-19
 */

interface Props {
  progress: number
  statusText: string
  etaText?: string
  showCancel?: boolean
}

withDefaults(defineProps<Props>(), {
  etaText: '',
  showCancel: true
})

const emit = defineEmits<{
  cancel: []
}>()

/**
 * 触发取消处理事件
 */
const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-white p-4">
    <div class="mb-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
      <span class="font-medium text-slate-700 truncate">{{ statusText || '处理中...' }}</span>
      <span class="font-semibold text-sky-700">{{ Math.max(0, Math.min(100, Math.round(progress))) }}%</span>
    </div>

    <div class="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        class="h-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300"
        :style="{ width: `${Math.max(0, Math.min(100, progress))}%` }"
      />
    </div>

    <div class="flex items-center justify-between gap-3 text-[12px] text-slate-500">
      <span>{{ etaText || '预计剩余时间：计算中' }}</span>
      <button
        v-if="showCancel"
        type="button"
        class="rounded-md border border-rose-200 px-2.5 py-1 text-rose-600 transition-colors hover:bg-rose-50"
        @click="handleCancel"
      >
        取消处理
      </button>
    </div>
  </section>
</template>
