<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-27
 */
-->
<template>
    <a-collapse v-model:active-key="activeKeys" class="config-overview-collapse" :bordered="false">
        <a-collapse-item key="overview">
            <template #header>
                <div class="config-overview-header">
                    <span>配置诊断</span>
                    <a-tag :color="pendingCount > 0 ? 'orange' : 'green'" bordered>
                        {{ pendingCount > 0 ? `待完善 ${pendingCount}` : '配置完整' }}
                    </a-tag>
                </div>
            </template>
            <div class="config-overview-content">
                <p>{{ summary }}</p>
                <div class="config-overview-list">
                    <div v-for="item in items" :key="item.label" class="config-overview-item">
                        <strong>{{ item.label }} · {{ item.value }}</strong>
                        <span>{{ item.desc }}</span>
                    </div>
                </div>
            </div>
        </a-collapse-item>
    </a-collapse>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ConfigOverviewItem {
    label: string
    value: string | number
    desc: string
}

const props = withDefaults(
    defineProps<{
        modelValue?: (string | number)[]
        summary: string
        pendingCount?: number
        items?: ConfigOverviewItem[]
    }>(),
    {
        modelValue: () => [],
        pendingCount: 0,
        items: () => [],
    }
)

const emit = defineEmits<{
    (event: 'update:modelValue', value: (string | number)[]): void
}>()

/**
 * 函数说明：代理折叠区展开状态，保持父页面可统一控制默认收起行为。
 */
const activeKeys = computed<(string | number)[]>({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', Array.isArray(value) ? value : [value]),
})
</script>

<style lang="scss" scoped>
.config-overview-collapse {
    margin-bottom: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 8px;
    overflow: hidden;

    :deep(.arco-collapse-item-header) {
        min-height: 42px;
        padding: 8px 12px;
        background: var(--color-fill-1, #f7f8fa);
    }

    :deep(.arco-collapse-item-content-box) {
        padding: 12px;
    }
}

.config-overview-header {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-weight: 600;
    color: var(--color-text-1, #1d2129);
}

.config-overview-content {
    > p {
        margin: 0 0 10px;
        color: var(--color-text-2, #4e5969);
        line-height: 1.7;
    }
}

.config-overview-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.config-overview-item {
    min-width: 0;
    padding: 10px 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 6px;
    background: var(--color-bg-2, #fff);

    strong,
    span {
        display: block;
    }

    strong {
        color: var(--color-text-1, #1d2129);
        font-size: 13px;
    }

    span {
        margin-top: 4px;
        color: var(--color-text-3, #86909c);
        font-size: 12px;
        line-height: 1.6;
    }
}

@media (max-width: 768px) {
    .config-overview-list {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
