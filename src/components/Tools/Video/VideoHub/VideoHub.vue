<!--
 * @file VideoHub.vue
 * @description 视频工具总览页，聚合展示已上线视频处理能力
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

interface VideoToolCard {
  title: string
  desc: string
  path: string
  badge: string
}

const route = useRoute()
const router = useRouter()

const onlineTools: VideoToolCard[] = [
  {
    title: '免费视频压缩',
    desc: '保持分辨率前提下压缩体积，适合上传与分享。',
    path: '/tools/video/compress',
    badge: '热门'
  },
  {
    title: '免费视频转 GIF',
    desc: '可截取片段、调整尺寸和帧率，导出动图。',
    path: '/tools/video/gif',
    badge: '高频'
  },
  {
    title: '免费视频抽帧',
    desc: '支持单帧截图与批量导出画面序列。',
    path: '/tools/video/frame',
    badge: '已上线'
  },
  {
    title: '免费视频时长剪辑',
    desc: '可视化截取片段，快速导出短视频。',
    path: '/tools/video/trimmer',
    badge: '常用'
  },
  {
    title: '免费视频旋转/翻转',
    desc: '修正拍摄方向，支持镜像处理。',
    path: '/tools/video/rotate',
    badge: '实用'
  },
  {
    title: '免费视频加水印',
    desc: '支持文字与图片水印，保护内容版权。',
    path: '/tools/video/watermark',
    badge: '版权'
  },
  {
    title: '免费视频格式转换',
    desc: '支持 MP4、WebM、MOV 等常见格式转换导出。',
    path: '/tools/video/convert',
    badge: '新品'
  },
  {
    title: '免费视频分辨率重设',
    desc: '支持 1080p、720p、480p 与自定义尺寸重设。',
    path: '/tools/video/resolution',
    badge: '新品'
  },
  {
    title: '免费视频拼接',
    desc: '支持多段视频按顺序合并输出，快速生成合集视频。',
    path: '/tools/video/merge',
    badge: '新品'
  }
]

/**
 * 获取工具总数展示文本
 * @returns 已上线工具数量文本
 */
const toolsCountText = computed(() => {
  return `已上线 ${onlineTools.length} 个视频工具`
})

/**
 * 获取可用于新窗口打开的工具链接
 * @param path 工具路径
 * @returns 已解析链接
 */
const resolveToolHref = (path: string) => {
  return router.resolve(path).href
}
</script>

<template>
  <div class="min-h-screen space-y-4">
    <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div class="video-hero relative px-6 py-8 sm:px-8 sm:py-10">
        <div class="absolute inset-0 bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50" />
        <div class="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
        <div class="absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-emerald-200/40 blur-3xl" />

        <div class="relative z-10">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium text-sky-700 backdrop-blur">
            <span class="inline-block h-1.5 w-1.5 rounded-full bg-sky-500" />
            视频工具总览
          </div>
          <h1 class="mb-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">免费在线视频处理工具箱</h1>
          <p class="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            统一管理视频压缩、抽帧、剪辑、转 GIF、加水印等高频需求。所有处理优先在浏览器本地执行，兼顾效率与隐私。
          </p>

          <div class="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
            <span class="rounded-full border border-slate-200 bg-white px-3 py-1">本地处理</span>
            <span class="rounded-full border border-slate-200 bg-white px-3 py-1">免安装</span>
            <span class="rounded-full border border-slate-200 bg-white px-3 py-1">支持主流浏览器</span>
            <span class="rounded-full border border-slate-200 bg-white px-3 py-1">移动端可用</span>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div class="mb-4 flex items-center justify-between gap-4">
        <h2 class="text-lg font-semibold text-slate-900 sm:text-xl">全部视频工具</h2>
        <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 sm:text-sm">
          {{ toolsCountText }}
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <a
          v-for="tool in onlineTools"
          :key="tool.path"
          :href="resolveToolHref(tool.path)"
          target="_blank"
          rel="noopener noreferrer"
          class="group rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-300"
        >
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-semibold text-slate-900">{{ tool.title }}</h3>
            <span class="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">{{ tool.badge }}</span>
          </div>
          <p class="text-sm leading-6 text-slate-600">{{ tool.desc }}</p>
          <div class="mt-3 text-sm font-medium text-sky-700">进入工具 →</div>
        </a>
      </div>
    </section>

    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<style scoped>
.video-hero {
  isolation: isolate;
}
</style>
