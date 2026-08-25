<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-26
 */
-->
<template>
    <div class="layout-focus-strip">
        <div class="layout-focus-main">
            <div class="layout-focus-label">当前编辑模块</div>
            <div class="layout-focus-title">{{ moduleLabel }}</div>
            <div class="layout-focus-meta">
                <a-tag :color="missingCount > 0 ? 'orange' : 'green'" size="small" bordered>
                    待完善 {{ missingCount }}
                </a-tag>
                <a-tag size="small" bordered>已配置 {{ configuredCount }}</a-tag>
                <a-tag size="small" bordered>进度 {{ progressText }}</a-tag>
            </div>
        </div>
        <div class="layout-focus-actions">
            <a-button :disabled="!hasPrev" @click="emit('prev')">上一个模块</a-button>
            <a-button type="primary" :disabled="!hasNext" @click="emit('next')"
                >下一个模块</a-button
            >
        </div>
    </div>
</template>

<script lang="ts" setup>
interface Props {
    moduleLabel: string
    missingCount: number
    configuredCount: number
    progressText: string
    hasPrev: boolean
    hasNext: boolean
}

defineProps<Props>()

const emit = defineEmits<{
    (event: 'prev'): void
    (event: 'next'): void
}>()
</script>

<style lang="scss" scoped>
.layout-focus-strip {
    margin-bottom: 10px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 10px;
    background: #fff;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
}

.layout-focus-main {
    min-width: 0;
    display: grid;
    gap: 4px;
}

.layout-focus-label {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.layout-focus-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.layout-focus-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.layout-focus-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

@media (max-width: 920px) {
    .layout-focus-strip {
        align-items: stretch;
    }

    .layout-focus-actions {
        margin-left: 0;
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
