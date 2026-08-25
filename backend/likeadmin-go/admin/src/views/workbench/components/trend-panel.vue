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
        title="访问趋势"
    >
        <template #extra>
            <a-link>最近周期</a-link>
        </template>
        <v-charts class="visitor-chart" :option="option" :autoresize="true" />
    </a-card>
</template>

<script lang="ts" setup>
import vCharts from 'vue-echarts'

const props = defineProps<{
    option: Record<string, any>
}>()
</script>

<style lang="scss" scoped>
.general-card {
    min-height: 380px;
    border-radius: 4px;
}

.visitor-chart {
    height: 320px;
}

@media (max-width: 1280px) {
    .general-card {
        min-height: 360px;
    }

    .visitor-chart {
        height: 300px;
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
