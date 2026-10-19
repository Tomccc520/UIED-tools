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
        :header-style="{ paddingBottom: 0 }"
        :body-style="{ paddingTop: '20px' }"
        title="工具访问趋势"
    >
        <template #extra>
            <span class="panel-extra-label">最近 15 天</span>
        </template>
        <v-charts v-if="hasData" class="visitor-chart" :option="option" :autoresize="true" />
        <a-empty v-else class="trend-empty" description="最近 15 天暂无工具访问记录" />
    </a-card>
</template>

<script lang="ts" setup>
import vCharts from 'vue-echarts'

const props = defineProps<{
    option: Record<string, any>
    hasData: boolean
}>()
</script>

<style lang="scss" scoped>
.general-card {
    border: 0;
    border-top: 1px solid var(--uied-admin-border);
    border-radius: 4px;
}

.visitor-chart {
    height: 260px;
}

.trend-empty {
    padding: 24px 0;
}

.panel-extra-label {
    color: var(--color-text-3, #86909c);
    font-size: 13px;
}

@media (max-width: 1280px) {
    .general-card {
        min-height: auto;
    }

    .visitor-chart {
        height: 260px;
    }
}

@media (max-width: 768px) {
    .general-card {
        min-height: auto;
    }

    .visitor-chart {
        height: 260px;
    }
}
</style>
