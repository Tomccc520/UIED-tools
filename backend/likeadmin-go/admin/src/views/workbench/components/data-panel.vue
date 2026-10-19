<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <dl class="metric-grid">
        <div v-for="item in metricItems" :key="item.key" class="metric-item">
            <dt>{{ item.label }}</dt>
            <dd class="metric-value">{{ item.value }}</dd>
            <dd class="metric-total">
                <span>{{ item.totalLabel }}</span
                ><strong>{{ item.totalValue }}</strong>
            </dd>
        </div>
    </dl>
</template>

<script lang="ts" setup>
interface MetricItem {
    key: string
    label: string
    value: string
    totalLabel: string
    totalValue: string
}
defineProps<{ metricItems: MetricItem[] }>()
</script>

<style lang="scss" scoped>
.metric-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin: 0;
    padding: 20px 0;
}
.metric-item {
    padding: 4px 20px;
    border-right: 1px solid var(--uied-admin-border);
}
.metric-item:last-child {
    border: 0;
}
dt {
    color: var(--color-text-2);
    font-size: 13px;
}
dd {
    margin: 0;
}
.metric-value {
    margin-top: 8px;
    color: var(--uied-admin-ink);
    font-size: 24px;
    line-height: 1.25;
    font-weight: 600;
    overflow-wrap: anywhere;
}
.metric-total {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--color-text-3);
}
.metric-total strong {
    color: var(--color-text-2);
    font-weight: 500;
}
@media (max-width: 1100px) {
    .metric-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        row-gap: 20px;
    }
    .metric-item:nth-child(2) {
        border: 0;
    }
}
@media (max-width: 400px) {
    .metric-item {
        padding: 4px 12px;
    }
    .metric-value {
        font-size: 22px;
    }
}
</style>
