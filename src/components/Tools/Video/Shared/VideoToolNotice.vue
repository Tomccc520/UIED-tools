<!--
 * @file VideoToolNotice.vue
 * @description 视频工具统一提示条，展示格式支持、浏览器兼容与本地隐私处理说明
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
  formats?: string
  compatibility?: string
  privacy?: string
}

const props = withDefaults(defineProps<Props>(), {
  formats: '格式支持：MP4、MOV、WebM、AVI、MKV（具体以浏览器解码能力为准）',
  compatibility: '浏览器兼容：推荐 Chrome / Edge / Safari 最新版；Firefox 部分编码能力受限',
  privacy: '隐私说明：所有处理均在本地浏览器完成，不上传视频文件'
})
</script>

<template>
  <section class="video-tool-notice rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-4 sm:p-5">
    <h3 class="text-sm sm:text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
      <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </span>
      处理提示
    </h3>

    <ul class="space-y-2 text-xs sm:text-sm text-slate-600">
      <li class="flex items-start gap-2">
        <span class="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-sky-500" />
        <span>{{ props.formats }}</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>{{ props.compatibility }}</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
        <span>{{ props.privacy }}</span>
      </li>
    </ul>
  </section>
</template>
