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
  <section class="rounded-xl border border-slate-200 bg-white p-4" role="status" aria-live="polite">
    <div class="mb-2 flex items-center justify-between gap-3 text-xs sm:text-sm">
      <span class="min-w-0 break-words font-medium text-slate-700">{{ statusText || '处理中...' }}</span>
      <span class="shrink-0 font-semibold text-sky-700">{{ Math.max(0, Math.min(100, Math.round(progress))) }}%</span>
    </div>

    <div class="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        class="h-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300"
        :style="{ width: `${Math.max(0, Math.min(100, progress))}%` }"
      />
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 text-[12px] text-slate-500">
      <span class="min-w-0 break-words">{{ etaText || '预计剩余时间：计算中' }}</span>
      <button
        v-if="showCancel"
        type="button"
        class="min-h-11 shrink-0 rounded-md border border-rose-200 px-3 py-2 text-rose-600 transition-colors hover:bg-rose-50"
        @click="handleCancel"
      >
        取消处理
      </button>
    </div>
  </section>
</template>
