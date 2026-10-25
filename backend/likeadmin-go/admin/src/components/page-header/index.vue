<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
-->
<template>
    <header class="admin-page-header">
        <div class="admin-page-header__copy">
            <h1>{{ title }}</h1>
            <div v-if="$slots.subtitle || description" class="admin-page-header__description"><slot name="subtitle">{{ description }}</slot></div>
        </div>
        <div v-if="$slots.extra" class="admin-page-header__actions"><slot name="extra" /></div>
    </header>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ title: string; description?: string }>(), { description: '' })
</script>
<style scoped lang="scss">
.admin-page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
.admin-page-header__copy { flex: 1 1 260px; min-width: 0; }
h1 { margin: 0; color: var(--uied-admin-ink); font-size: 24px; line-height: 1.4; font-weight: 600; letter-spacing: -.4px; }
.admin-page-header__description { margin-top: 6px; color: var(--color-text-3); font-size: 13px; line-height: 1.7; max-width: 720px; }
.admin-page-header__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; min-width: 0; }
.admin-page-header__actions :deep(.layout-page-actions) { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
@media (max-width: 600px) { h1 { font-size: 21px; } .admin-page-header { gap: 12px; margin-bottom: 16px; } .admin-page-header__actions { width: 100%; } .admin-page-header__actions :deep(button) { min-height: 44px; } }
</style>
