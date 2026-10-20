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
  <section class="video-result-comparison rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h4 class="text-sm font-semibold text-slate-800">处理结果对比</h4>
      <span v-if="summary" class="max-w-full break-words rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium leading-5 text-emerald-700">
        {{ summary }}
      </span>
    </div>

    <div class="overflow-x-auto">
      <table class="video-result-comparison__table w-full min-w-[420px] table-fixed border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr class="text-left text-xs text-slate-500">
            <th scope="col" class="px-3">指标</th>
            <th scope="col" class="px-3">处理前</th>
            <th scope="col" class="px-3">处理后</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="metric in metrics" :key="metric.label" class="bg-white">
            <th scope="row" class="rounded-l-lg px-3 py-2 text-left font-medium text-slate-700">{{ metric.label }}</th>
            <td data-label="处理前" class="px-3 py-2 text-slate-600">{{ metric.before }}</td>
            <td data-label="处理后" class="rounded-r-lg px-3 py-2 font-semibold text-slate-800">{{ metric.after }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.video-result-comparison {
  container: video-result / inline-size;
  min-width: 0;
}

@container video-result (max-width: 420px) {
  .video-result-comparison__table {
    min-width: 0;
  }

  .video-result-comparison__table thead {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .video-result-comparison__table tbody {
    display: grid;
    gap: 8px;
  }

  .video-result-comparison__table tr {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-radius: 8px;
  }

  .video-result-comparison__table th[scope='row'] {
    grid-column: 1 / -1;
    padding-bottom: 0;
  }

  .video-result-comparison__table td {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .video-result-comparison__table td::before {
    display: block;
    margin-bottom: 4px;
    color: var(--uied-color-text-secondary, #667085);
    font-size: 12px;
    font-weight: 400;
    content: attr(data-label);
  }
}
</style>
