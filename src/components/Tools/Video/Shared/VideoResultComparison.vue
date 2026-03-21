<!--
 * @file VideoResultComparison.vue
 * @description 视频工具统一结果对比组件，展示处理前后关键指标
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

interface CompareMetric {
  label: string
  before: string
  after: string
}

interface Props {
  metrics: CompareMetric[]
  summary?: string
}

withDefaults(defineProps<Props>(), {
  summary: ''
})
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div class="mb-3 flex items-center justify-between">
      <h4 class="text-sm font-semibold text-slate-800">处理结果对比</h4>
      <span v-if="summary" class="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
        {{ summary }}
      </span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[420px] table-fixed border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr class="text-left text-xs text-slate-500">
            <th class="px-3">指标</th>
            <th class="px-3">处理前</th>
            <th class="px-3">处理后</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="metric in metrics" :key="metric.label" class="bg-white">
            <td class="rounded-l-lg px-3 py-2 font-medium text-slate-700">{{ metric.label }}</td>
            <td class="px-3 py-2 text-slate-600">{{ metric.before }}</td>
            <td class="rounded-r-lg px-3 py-2 font-semibold text-slate-800">{{ metric.after }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
