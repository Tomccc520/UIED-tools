<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <section v-if="menuList.length" class="task-panel" aria-labelledby="workbench-tasks-title">
        <h2 id="workbench-tasks-title">常用任务</h2>
        <div class="task-grid">
            <router-link
                v-for="item in menuList"
                :key="item.url"
                :to="item.url"
                class="task-link"
                :aria-label="`${item.name}：${item.desc}`"
                data-admin-smoke="workbench-quick-operation"
            >
                <span class="task-icon" aria-hidden="true">{{ item.short }}</span>
                <span class="task-copy"
                    ><strong>{{ item.name }}</strong
                    ><span>{{ item.desc }}</span></span
                >
                <span class="task-arrow" aria-hidden="true">›</span>
            </router-link>
        </div>
    </section>
</template>

<script lang="ts" setup>
interface QuickMenuCard {
    name: string
    short: string
    url: string
    desc: string
}
defineProps<{ menuList: QuickMenuCard[] }>()
</script>

<style lang="scss" scoped>
.task-panel {
    padding: 20px;
    background: var(--color-bg-2);
    border: 1px solid var(--uied-admin-border);
    border-radius: var(--uied-admin-radius);
}
h2 {
    margin: 0 0 12px;
    font-size: 16px;
    color: var(--uied-admin-ink);
}
.task-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
}
.task-link {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 80px;
    padding: 12px;
    color: var(--color-text-1);
    text-decoration: none;
    border: 1px solid var(--uied-admin-border);
    border-radius: 8px;
    transition: border-color 160ms ease, background-color 160ms ease;
}
.task-icon {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    background: var(--color-fill-2);
    color: var(--color-text-2);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}
.task-copy {
    display: grid;
    gap: 4px;
    min-width: 0;
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
    border-color: var(--uied-admin-accent);
    background: var(--uied-admin-accent-soft);
}
.task-link:focus-visible {
    outline: 2px solid var(--uied-admin-accent);
    outline-offset: 2px;
}
@media (max-width: 1100px) {
    .task-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (max-width: 640px) {
    .task-panel {
        padding: 16px;
    }
    .task-grid {
        grid-template-columns: 1fr;
    }
    .task-link {
        min-height: 68px;
    }
}
@media (prefers-reduced-motion: reduce) {
    .task-link {
        transition: none;
    }
}
</style>
