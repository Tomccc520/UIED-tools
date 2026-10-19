<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <section class="release-checklist" aria-label="临时发布自查">
        <p>仅供本次操作临时勾选，刷新后清空；不会执行检查、发布或更新线上状态。</p>
        <div class="todo-toolbar">
            <a-button data-admin-smoke="workbench-release-mark-all" @click="$emit('markAll')"
                >全部勾选</a-button
            >
            <a-button data-admin-smoke="workbench-release-reset" @click="$emit('reset')"
                >清空勾选</a-button
            >
        </div>
        <div class="todo-list">
            <a-checkbox
                v-for="item in todoList"
                :key="item.key"
                v-model="item.done"
                class="todo-item"
            >
                <span :class="{ 'is-done': item.done }">{{ item.label }}</span>
            </a-checkbox>
        </div>
    </section>
</template>

<script lang="ts" setup>
interface ReleaseTodoItem {
    key: string
    label: string
    done: boolean
}
defineEmits<{ (event: 'markAll'): void; (event: 'reset'): void }>()
defineProps<{ todoList: ReleaseTodoItem[] }>()
</script>

<style lang="scss" scoped>
.release-checklist {
    padding: 0 20px 20px;
}
p {
    margin: 0 0 12px;
    color: var(--color-text-3);
    font-size: 12px;
    line-height: 1.6;
}
.todo-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}
.todo-list {
    display: grid;
    gap: 4px;
}
.todo-item {
    min-height: 44px;
    padding: 8px 0;
}
.is-done {
    color: var(--color-text-3);
    text-decoration: line-through;
}
@media (max-width: 640px) {
    .release-checklist {
        padding: 0 16px 16px;
    }
}
</style>
