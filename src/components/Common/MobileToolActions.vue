<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
-->
<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

withDefaults(defineProps<{
  title: string
  description?: string
  actionLabel: string
  disabled?: boolean
  busy?: boolean
  cancelLabel?: string
  hidden?: boolean
  ariaLabel?: string
}>(), { description: '', disabled: false, busy: false, cancelLabel: '', hidden: false, ariaLabel: '工具操作' })

const emit = defineEmits<{ action: []; cancel: [] }>()
// 操作栏仅跟随手机视口，桌面页面继续使用原有行内操作。
const isMobileViewport = useMediaQuery('(max-width: 640px)')
</script>

<template>
  <Teleport v-if="isMobileViewport && !hidden" to="body">
    <section class="mobile-tool-actions" :aria-label="ariaLabel" :aria-busy="busy">
      <div class="mobile-tool-actions__status" role="status" aria-live="polite">
        <strong>{{ title }}</strong>
        <span v-if="description">{{ description }}</span>
      </div>
      <div class="mobile-tool-actions__buttons">
        <button v-if="busy && cancelLabel" type="button" class="mobile-tool-actions__cancel" @click="emit('cancel')">{{ cancelLabel }}</button>
        <button type="button" class="mobile-tool-actions__primary" :disabled="disabled || busy" @click="emit('action')">{{ actionLabel }}</button>
      </div>
    </section>
  </Teleport>
</template>

<style scoped>
.mobile-tool-actions { position: fixed; z-index: 50; inset: auto 0 0; display: flex; align-items: center; gap: 12px; padding: 12px max(12px, env(safe-area-inset-right, 0px)) calc(12px + env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left, 0px)); border-top: 1px solid var(--uied-color-border); background: var(--uied-color-surface); box-shadow: 0 -4px 20px rgb(16 24 40 / 5%); color: var(--uied-color-text); }
.mobile-tool-actions__status { display: grid; flex: 1; min-width: 0; gap: 2px; line-height: 1.5; }
.mobile-tool-actions__status strong { font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
.mobile-tool-actions__status span { color: var(--uied-color-text-secondary); font-size: 12px; overflow-wrap: anywhere; }
.mobile-tool-actions__buttons { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.mobile-tool-actions button { min-height: 48px; border: 1px solid var(--uied-color-border); border-radius: 8px; padding: 0 14px; background: var(--uied-color-surface); color: var(--uied-color-text); font-size: 14px; font-weight: 600; cursor: pointer; }
.mobile-tool-actions .mobile-tool-actions__primary { min-width: 112px; border-color: var(--uied-color-primary); background: var(--uied-color-primary); color: white; }
.mobile-tool-actions button:disabled { opacity: .55; cursor: not-allowed; }
.mobile-tool-actions button:focus-visible { outline: 2px solid var(--uied-color-primary); outline-offset: 3px; }
:global(body:has(.mobile-tool-actions)) { padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px)); }
:global(body:has(.el-image-viewer__wrapper) .mobile-tool-actions) { visibility: hidden; }
</style>
