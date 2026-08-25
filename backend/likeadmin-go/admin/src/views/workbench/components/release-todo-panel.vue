<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <a-card
        class="general-card"
        title="发布待办"
        :header-style="{ paddingBottom: '0' }"
        :body-style="{ padding: '15px 20px 16px 20px' }"
    >
        <template #extra>
            <a-tag :color="pendingCount > 0 ? 'orange' : 'green'" bordered>{{ percent }}%</a-tag>
        </template>
        <div class="todo-summary">
            <div class="todo-summary-item">
                <div class="todo-summary-label">待处理</div>
                <div class="todo-summary-value">{{ pendingCount }}</div>
            </div>
            <div class="todo-summary-item">
                <div class="todo-summary-label">已完成</div>
                <div class="todo-summary-value">{{ todoList.length - pendingCount }}</div>
            </div>
            <div class="todo-summary-item">
                <div class="todo-summary-label">总数</div>
                <div class="todo-summary-value">{{ todoList.length }}</div>
            </div>
        </div>
        <a-progress
            class="todo-progress"
            :percent="percent"
            :show-text="false"
            :stroke-width="8"
            :status="pendingCount > 0 ? 'normal' : 'success'"
        />
        <div class="todo-toolbar">
            <a-button size="mini" data-admin-smoke="workbench-release-mark-all" @click="$emit('markAll')"
                >全部完成</a-button
            >
            <a-button size="mini" data-admin-smoke="workbench-release-reset" @click="$emit('reset')"
                >恢复默认</a-button
            >
        </div>
        <label v-for="item in todoList" :key="item.key" class="todo-item">
            <a-checkbox v-model="item.done">
                <span :class="{ 'is-done': item.done }">{{ item.label }}</span>
            </a-checkbox>
        </label>
    </a-card>
</template>

<script lang="ts" setup>
interface ReleaseTodoItem {
    key: string
    label: string
    done: boolean
}

defineEmits<{
    (event: 'markAll'): void
    (event: 'reset'): void
}>()

const props = defineProps<{
    todoList: ReleaseTodoItem[]
    pendingCount: number
    percent: number
}>()
</script>

<style lang="scss" scoped>
.general-card {
    min-height: 360px;
    border-radius: 4px;
}

.todo-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 12px;
}

.todo-summary-item {
    padding: 10px 12px;
    border-radius: 4px;
    background: var(--color-fill-1, #f7f8fa);
    border: 1px solid var(--color-border-2, #e5e6eb);
}

.todo-summary-label {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.todo-summary-value {
    margin-top: 4px;
    font-size: 16px;
    line-height: 22px;
    font-weight: 600;
    color: var(--color-text-1, #1d2129);
}

.todo-progress {
    margin-bottom: 12px;
}

.todo-toolbar {
    display: flex;
    gap: 8px;
    padding: 0 0 12px;
    flex-wrap: wrap;
}

.todo-toolbar :deep(.arco-btn) {
    height: 28px;
    padding: 0 10px;
    border-radius: 8px;
}

.todo-item {
    display: block;
    padding: 10px 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 4px;
    background: var(--color-fill-1, #f7f8fa);
}

.todo-item + .todo-item {
    margin-top: 10px;
}

.todo-item .is-done {
    color: var(--color-text-4, #c9cdd4);
    text-decoration: line-through;
}

@media (max-width: 640px) {
    .todo-summary {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 1280px) {
    .general-card {
        min-height: auto;
    }
}
</style>
