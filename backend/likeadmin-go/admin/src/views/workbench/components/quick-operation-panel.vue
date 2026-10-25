<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <section v-if="groups.length" class="task-panel" aria-labelledby="workbench-tasks-title">
        <h2 id="workbench-tasks-title">常用任务</h2>
        <div class="task-groups">
            <section v-for="group in groups" :key="group.key" class="task-group" :aria-labelledby="`workbench-task-${group.key}`">
                <h3 :id="`workbench-task-${group.key}`">{{ group.title }}</h3>
                <router-link
                    v-for="item in group.items"
                    :key="item.url"
                    :to="item.url"
                    class="task-link"
                    :aria-label="`${item.name}：${item.desc}`"
                    data-admin-smoke="workbench-quick-operation"
                >
                    <span class="task-copy"><strong>{{ item.name }}</strong><span>{{ item.desc }}</span></span>
                    <span class="task-arrow" aria-hidden="true">→</span>
                </router-link>
            </section>
        </div>
    </section>
</template>

<script lang="ts" setup>
interface QuickMenuCard {
    name: string
    url: string
    desc: string
}
interface QuickMenuGroup {
    key: string
    title: string
    items: QuickMenuCard[]
}
defineProps<{ groups: QuickMenuGroup[] }>()
</script>

<style lang="scss" scoped>
.task-panel {
    padding: 20px;
    background: var(--color-bg-2);
    border: 1px solid var(--uied-admin-border);
    border-radius: var(--uied-admin-radius);
}
h2 {
    margin: 0 0 20px;
    font-size: 16px;
    color: var(--uied-admin-ink);
}
.task-groups {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
}
.task-group {
    min-width: 0;
}
.task-group + .task-group {
    border-left: 1px solid var(--uied-admin-border);
    padding-left: 24px;
}
h3 {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
    color: var(--uied-admin-muted);
}
.task-link {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 64px;
    padding: 12px 8px;
    box-sizing: border-box;
    color: var(--color-text-1);
    text-decoration: none;
    border-radius: 6px;
    transition: color 160ms ease, background-color 160ms ease;
}
.task-copy {
    display: grid;
    gap: 4px;
    min-width: 0;
    overflow-wrap: anywhere;
}
.task-copy strong {
    font-size: 14px;
    font-weight: 600;
}
.task-copy > span {
    color: var(--color-text-3);
    font-size: 12px;
    line-height: 1.5;
}
.task-arrow {
    margin-left: auto;
    flex-shrink: 0;
    color: var(--color-text-3);
}
.task-link:hover {
    color: var(--uied-admin-accent);
    background: var(--uied-admin-accent-soft);
}
.task-link:focus-visible {
    outline: 2px solid var(--uied-admin-accent);
    outline-offset: 2px;
}
@media (max-width: 640px) {
    .task-panel {
        padding: 16px;
    }
    .task-groups {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    .task-group + .task-group {
        border-left: 0;
        border-top: 1px solid var(--uied-admin-border);
        padding: 16px 0 0;
    }
    .task-link {
        min-height: 60px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .task-link {
        transition: none;
    }
}
</style>
