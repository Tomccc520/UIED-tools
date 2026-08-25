<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-26
 */
-->
<template>
    <aside class="layout-workspace-aside">
        <a-card class="workspace-aside-card" :bordered="false">
            <template #title>
                <div class="workspace-aside-title-row">
                    <span>运营导航</span>
                    <a-tag :color="hasUnsavedChanges ? 'orange' : 'green'" size="small" bordered>
                        {{ hasUnsavedChanges ? '待发布' : '已同步' }}
                    </a-tag>
                </div>
            </template>
            <a-progress
                class="workspace-progress"
                :percent="moduleCompletionPercent"
                :show-text="true"
                status="success"
                :stroke-width="14"
            />
            <div class="workspace-progress-label">
                已完成 {{ moduleResolvedCount }}/{{ moduleTotalCount }} 个模块
            </div>

            <div class="workspace-nav-list">
                <button
                    v-for="item in modules"
                    :key="`workspace-nav-${item.key}`"
                    type="button"
                    class="workspace-nav-item"
                    :class="{ 'is-active': activeKey === item.key }"
                    @click="emit('select', item.key)"
                >
                    <span class="workspace-nav-name">{{ item.label }}</span>
                    <a-tag
                        :color="item.missingCount > 0 ? 'orange' : 'green'"
                        size="small"
                        bordered
                    >
                        {{ item.missingCount > 0 ? `待完善 ${item.missingCount}` : '已完成' }}
                    </a-tag>
                </button>
            </div>

            <div class="workspace-action-list">
                <a-button long @click="emit('health-check')">一键体检</a-button>
                <a-button long @click="emit('preview')">前端预览</a-button>
                <a-button type="primary" long :loading="isSubmitting" @click="emit('submit')"
                    >保存配置</a-button
                >
            </div>
        </a-card>
    </aside>
</template>

<script lang="ts" setup>
interface ModuleOverviewItem {
    key: string
    label: string
    missingCount: number
}

interface Props {
    hasUnsavedChanges: boolean
    isSubmitting: boolean
    moduleCompletionPercent: number
    moduleResolvedCount: number
    moduleTotalCount: number
    modules: ModuleOverviewItem[]
    activeKey: string
}

defineProps<Props>()

const emit = defineEmits<{
    (event: 'select', value: string): void
    (event: 'health-check'): void
    (event: 'preview'): void
    (event: 'submit'): void
}>()
</script>

<style lang="scss" scoped>
.layout-workspace-aside {
    position: sticky;
    top: calc(var(--navbar-height, 60px) + 12px);
    z-index: 2;
}

.workspace-aside-card {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 12px;
}

.workspace-aside-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.workspace-progress {
    margin-bottom: 8px;
}

.workspace-progress-label {
    margin-bottom: 10px;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.workspace-nav-list {
    display: grid;
    gap: 8px;
    margin-bottom: 12px;
}

.workspace-nav-item {
    width: 100%;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 10px;
    background: #fff;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.workspace-nav-item:hover {
    border-color: var(--color-primary-light-3, rgba(108, 84, 255, 0.24));
}

.workspace-nav-item.is-active {
    border-color: var(--color-primary-6, #6c54ff);
    background: var(--color-primary-light-1, rgba(108, 84, 255, 0.08));
}

.workspace-nav-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1, #1d2129);
}

.workspace-action-list {
    display: grid;
    gap: 8px;
}

@media (max-width: 1080px) {
    .layout-workspace-aside {
        position: static;
    }
}
</style>
