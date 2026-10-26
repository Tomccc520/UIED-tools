<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <details v-if="record.isSourceDeliveryOrder" class="order-delivery-check">
        <summary>
            <a-tag :color="resolveDeliveryCheckColor(record)" bordered>{{
                resolveDeliveryCheckText(record)
            }}</a-tag
            ><span>{{ issues.length ? `${issues.length} 项待处理` : '查看详情' }}</span>
        </summary>
        <div class="order-delivery-check__detail">
            <div v-if="licenseVisible">系统授权：{{ record.systemLicenseStatusText || '-' }}</div>
            <div>系统域名：{{ record.systemLicenseBoundDomain || '-' }}</div>
            <div>下载检测：{{ record.downloadCheckStatusText || '未检测' }}</div>
            <div v-if="record.downloadCheckTime">最近检测：{{ record.downloadCheckTime }}</div>
            <div v-if="record.downloadCheckMessage">
                检测结果：{{ record.downloadCheckMessage }}
            </div>
            <ul v-if="issues.length">
                <li v-for="issue in issues" :key="issue">{{ issue }}</li>
            </ul>
        </div>
    </details>
    <a-tag v-else color="gray" bordered>不参与</a-tag>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import {
    collectDeliveryIssues,
    resolveDeliveryCheckColor,
    resolveDeliveryCheckText
} from '../order-display'
import type { OrderRecord } from '../types'
const props = defineProps<{ record: OrderRecord; licenseVisible: boolean }>()
/** 将交付问题保留在当前订单的可展开详情中，列表首屏只展示处理状态。 */
const issues = computed(() => collectDeliveryIssues(props.record))
</script>
<style scoped lang="scss">
.order-delivery-check summary {
    cursor: pointer;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}
.order-delivery-check summary > span {
    font-size: 12px;
    color: var(--color-text-3);
}
.order-delivery-check summary:focus-visible {
    outline: 2px solid var(--uied-admin-accent);
    outline-offset: 3px;
}
.order-delivery-check__detail {
    margin-top: 12px;
    font-size: 12px;
    line-height: 1.8;
    color: var(--color-text-2);
    overflow-wrap: anywhere;
    white-space: normal;
}
.order-delivery-check__detail ul {
    margin: 8px 0 0;
    padding-left: 18px;
}
</style>
