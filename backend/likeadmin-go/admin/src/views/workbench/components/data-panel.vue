<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <a-grid :cols="24" :row-gap="16" class="panel">
        <a-grid-item
            v-for="(item, index) in metricItems"
            :key="item.key"
            class="panel-col"
            :style="{ borderRight: index === metricItems.length - 1 ? 'none' : undefined }"
            :span="{ xs: 24, sm: 12, md: 12, lg: 12, xl: 12, xxl: 6 }"
        >
            <div class="metric-main">
                <a-avatar :size="48" class="col-avatar">
                    {{ item.icon }}
                </a-avatar>
                <div class="metric-content">
                    <div class="metric-label">{{ item.label }}</div>
                    <div class="metric-value">{{ item.value }}</div>
                    <div class="metric-total">
                        <span class="metric-total__label">{{ item.totalLabel }}</span>
                        <strong class="metric-total__value">{{ item.totalValue }}</strong>
                    </div>
                </div>
            </div>
        </a-grid-item>
        <a-grid-item :span="24">
            <a-divider class="panel-border" />
        </a-grid-item>
    </a-grid>
</template>

<script lang="ts" setup>
interface MetricItem {
    key: string
    icon: string
    label: string
    value: string
    totalLabel: string
    totalValue: string
}

const props = defineProps<{
    metricItems: MetricItem[]
}>()
</script>

<style lang="scss" scoped>
.arco-grid.panel {
    margin-bottom: 0;
    padding: 12px 16px 0 16px;
    background-color: var(--color-bg-2, #fff);
}

.panel-col {
    padding-left: 28px;
    border-right: 1px solid rgb(var(--gray-2));
}

.col-avatar {
    flex-shrink: 0;
    margin-right: 12px;
    background-color: var(--color-fill-2);
    color: rgb(var(--arcoblue-6));
    font-size: 12px;
    font-weight: 700;
}

.metric-main {
    display: flex;
    align-items: center;
    gap: 12px;
}

.metric-content {
    min-width: 0;
}

.metric-label {
    font-size: 13px;
    color: var(--color-text-2, #4e5969);
}

.metric-value {
    margin-top: 6px;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.metric-total {
    margin-top: 6px;
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    flex-wrap: wrap;
}

.metric-total__label {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.metric-total__value {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-2, #4e5969);
}

@media (max-width: 1400px) {
    .panel-col {
        padding-left: 24px;
    }
}

@media (max-width: 768px) {
    .arco-grid.panel {
        padding: 12px 12px 0;
    }

    .panel-col {
        padding-left: 0;
        border-right: none !important;
    }

    .metric-main {
        align-items: flex-start;
    }

    .metric-content {
        padding-bottom: 12px;
    }
}
</style>
