<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <nav class="maintenance-links" aria-label="系统维护入口">
        <router-link
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            class="maintenance-link"
            data-admin-smoke="workbench-shortcut-panel"
        >
            {{ item.label }} <span aria-hidden="true">›</span>
        </router-link>
    </nav>
</template>

<script lang="ts" setup>
interface ShortcutItem {
    label: string
    to: string
    short: string
}
defineProps<{ items: ShortcutItem[] }>()
</script>

<style lang="scss" scoped>
.maintenance-links {
    padding: 0 20px 16px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
}
.maintenance-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 8px 12px;
    color: var(--color-text-2);
    background: var(--color-fill-1);
    border-radius: 6px;
    text-decoration: none;
}
.maintenance-link:hover {
    color: var(--uied-admin-accent);
    background: var(--uied-admin-accent-soft);
}
.maintenance-link:focus-visible {
    outline: 2px solid var(--uied-admin-accent);
    outline-offset: 2px;
}
@media (max-width: 768px) {
    .maintenance-links {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding: 0 16px 16px;
    }
}
</style>
