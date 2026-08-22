<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-20
 */
-->
<template>
  <section class="perler-react-host" :class="{ 'perler-react-host--focus': mode === 'focus' }">
    <div ref="mountElement" class="perler-react-host__mount"></div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import PerlerCanvasPage from './Perler/app/page'
import PerlerFocusPage from './Perler/app/focus/page'

const props = withDefaults(
  defineProps<{
    mode?: 'canvas' | 'focus'
  }>(),
  {
    mode: 'canvas'
  }
)

const mountElement = ref<HTMLElement>()
let reactRoot: Root | null = null

/**
 * 函数说明：在 Vue 工具路由内容区挂载拼豆 React 画布，外层导航继续完全复用主站组件。
 */
const renderPerlerPage = (): void => {
  if (!reactRoot) {
    return
  }
  const PageComponent = props.mode === 'focus' ? PerlerFocusPage : PerlerCanvasPage
  reactRoot.render(createElement(PageComponent))
}

onMounted(() => {
  if (!mountElement.value) {
    return
  }
  reactRoot = createRoot(mountElement.value)
  renderPerlerPage()
})

watch(
  () => props.mode,
  () => renderPerlerPage()
)

onBeforeUnmount(() => {
  reactRoot?.unmount()
  reactRoot = null
})
</script>

<style scoped>
.perler-react-host {
  min-width: 0;
  background: #f7f8fa;
}

.perler-react-host__mount {
  min-width: 0;
}

:deep(.perler-page) {
  padding: 20px 0 0;
  background: #f7f8fa;
  color: #1f2937;
  font-family: inherit;
}

:deep(.perler-page .perler-hero) {
  max-width: none;
  margin: 0 0 12px;
  padding: 22px 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  text-align: left;
}

:deep(.perler-page .perler-hero > .relative.z-10) {
  padding: 0;
}

:deep(.perler-page .perler-hero .items-center) {
  align-items: flex-start;
}

:deep(.perler-page .perler-hero .absolute) {
  display: none;
}

:deep(.perler-page .perler-hero h1) {
  background: none;
  color: #111827;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0;
  -webkit-text-fill-color: #111827;
}

:deep(.perler-page .perler-hero h2),
:deep(.perler-page .perler-hero .h-1) {
  display: none;
}

:deep(.perler-page .perler-hero p) {
  margin-top: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  text-align: left;
}

:deep(.perler-page > main) {
  max-width: 100%;
  width: 100%;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  gap: 16px;
}

:deep(.perler-page > main > .border-2.border-dashed) {
  width: 100%;
  max-width: none;
  min-height: 238px;
  border-color: #c6ced8;
  border-radius: 8px;
  background: #f8fafc;
  box-shadow: none;
}

:deep(.perler-page > main > .bg-gradient-to-r) {
  width: 100%;
  max-width: none;
  border-color: #dbeafe;
  border-radius: 6px;
  background: #f8fbff;
  box-shadow: none;
}

:deep(.perler-page .shadow-sm),
:deep(.perler-page .shadow-md),
:deep(.perler-page .shadow-lg),
:deep(.perler-page .shadow-xl),
:deep(.perler-page .shadow-2xl) {
  box-shadow: none;
}

:deep(.perler-page button.bg-gradient-to-r) {
  border-radius: 6px;
  background: #2f62f6;
  background-image: none;
  color: #ffffff;
  box-shadow: none;
}

:deep(.perler-page button.bg-gradient-to-r:hover) {
  background: #1f4fd6;
  transform: none;
}

:deep(.perler-page > footer) {
  width: 100%;
  max-width: none;
  margin: 4px 0 0;
  padding: 0;
  border: 0;
}

:deep(.perler-page > footer > div) {
  margin: 0;
}

:deep(.perler-page > footer button) {
  border: 1px solid #dbe3f0;
  border-radius: 6px;
  background: #ffffff !important;
  background-image: none !important;
  color: #475569 !important;
  box-shadow: none;
}

:deep(.perler-page > footer button:hover) {
  border-color: #93c5fd;
  background: #f8fbff;
  color: #2563eb;
  transform: none;
}

:deep(.perler-page > footer p) {
  display: none;
}

.perler-react-host--focus {
  margin: -1rem;
}

@media (max-width: 768px) {
  :deep(.perler-page) {
    padding-top: 12px;
  }

  :deep(.perler-page .perler-hero) {
    padding: 18px 16px;
  }

  :deep(.perler-page .perler-hero h1) {
    font-size: 22px;
  }

  :deep(.perler-page > main) {
    padding: 16px;
  }

  :deep(.perler-page > main > .border-2.border-dashed) {
    min-height: 210px;
  }

  .perler-react-host--focus {
    margin: 0;
  }
}
</style>
