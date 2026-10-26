<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <section class="order-table">
        <div class="order-table__toolbar">
            <h2>订单列表</h2>
            <a-radio-group v-model="columnMode" type="button" aria-label="表格字段"
                ><a-radio value="core">常用字段</a-radio
                ><a-radio value="all">全部字段</a-radio></a-radio-group
            >
        </div>
        <list-load-feedback
            v-if="state.error && records.length"
            :error="state.error"
            :loading="state.loading"
            has-data
            @retry="emit('retry')"
        />
        <a-table
            :data="records"
            :loading="state.loading"
            :pagination="false"
            :bordered="false"
            :columns="visibleColumns"
            :scroll="orderTableScroll"
            row-key="id"
        >
            <template #status="{ record }">
                <a-tag :color="resolveStatusColor(record.status)" bordered>{{
                    record.statusText
                }}</a-tag>
            </template>

            <template #callbackStatus="{ record }">
                <a-tag :color="resolveCallbackStatusColor(record.callbackStatus)" bordered>
                    {{ record.callbackStatusText || '未回调' }}
                </a-tag>
            </template>

            <template #amount="{ record }">¥{{ Number(record.amount || 0).toFixed(2) }}</template>

            <template #callbackError="{ record }">
                <a-typography-text
                    v-if="record.callbackError"
                    type="danger"
                    :ellipsis="{ rows: 1, showTooltip: true }"
                >
                    {{ record.callbackError }}
                </a-typography-text>
                <span v-else>-</span>
            </template>

            <template #deliveryStatus="{ record }">
                <a-tag :color="resolveDeliveryStatusColor(record.deliveryStatus)" bordered>
                    {{ record.deliveryStatusText || '未交付' }}
                </a-tag>
            </template>

            <template #deliveryInfo="{ record }">
                <div class="delivery-info">
                    <div>域名：{{ record.licenseBoundDomain || '-' }}</div>
                    <div v-if="licenseVisible">授权码：{{ record.licenseKeyMasked || '-' }}</div>
                    <div>
                        下载：
                        <a
                            v-if="record.downloadUrl"
                            :href="record.downloadUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            >打开链接</a
                        >
                        <span v-else>-</span>
                    </div>
                    <div>下载检测：{{ record.downloadCheckStatusText || '未检测' }}</div>
                    <div>交付时间：{{ record.deliveredTime || '-' }}</div>
                </div>
            </template>

            <template #deliveryCheck="{ record }"
                ><order-delivery-check :record="record" :license-visible="licenseVisible"
            /></template>

            <template #action="{ record }">
                <a-space size="mini">
                    <a-button
                        v-perms="['order:delivery']"
                        type="text"
                        status="warning"
                        @click="emit('delivery', record)"
                    >
                        交付
                    </a-button>
                    <a-button
                        v-if="licenseVisible && record.isSourceDeliveryOrder"
                        v-perms="['setting:license:detail']"
                        type="text"
                        @click="emit('license', record)"
                    >
                        去授权管理
                    </a-button>
                    <a-button
                        v-if="record.isSourceDeliveryOrder"
                        v-perms="['order:check_download']"
                        type="text"
                        status="primary"
                        :loading="isRowActionLoading(record.orderSn, 'check_download')"
                        @click="emit('check-download', record)"
                    >
                        检测下载
                    </a-button>
                    <a-button
                        v-if="Number(record.status) !== 1"
                        v-perms="['order:reissue']"
                        type="text"
                        status="success"
                        @click="emit('reissue', record.orderSn)"
                    >
                        补单
                    </a-button>
                    <a-button
                        v-if="Number(record.status) === 0"
                        v-perms="['order:close']"
                        type="text"
                        status="danger"
                        :loading="isRowActionLoading(record.orderSn, 'close')"
                        @click="emit('close', record.orderSn)"
                    >
                        关闭
                    </a-button>
                </a-space>
            </template>
            <template #empty
                ><list-load-feedback
                    :error="state.error"
                    :loading="state.loading"
                    :loaded="state.loaded"
                    empty-text="暂无匹配的订单数据"
                    @retry="emit('retry')"
            /></template>
        </a-table>
    </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import useAppStore from '@/stores/modules/app'
import ListLoadFeedback from '@/components/list-load-feedback/index.vue'
import OrderDeliveryCheck from './order-delivery-check.vue'
import {
    buildVisibleOrderColumns,
    resolveStatusColor,
    resolveCallbackStatusColor,
    resolveDeliveryStatusColor
} from '../order-display'
import type { OrderRecord, OrderListState } from '../types'
const props = defineProps<{
    records: OrderRecord[]
    state: OrderListState
    licenseVisible: boolean
    rowActionLoading: Record<string, boolean>
}>()
const emit = defineEmits<{
    (event: 'delivery', value: OrderRecord): void
    (event: 'license', value: OrderRecord): void
    (event: 'check-download', value: OrderRecord): void
    (event: 'reissue', value: string): void
    (event: 'close', value: string): void
    (event: 'retry'): void
}>()
const appStore = useAppStore()
const columnMode = ref('core')
/** 常用列便于日常处理，完整字段模式保留全部原列，手机操作列随表格一起滚动。 */
const visibleColumns = computed(() =>
    buildVisibleOrderColumns(columnMode.value === 'all', appStore.isMobile)
)
/** 根据实际显示列计算滚动宽度，表格内容只在自身区域内横向滚动。 */
const orderTableScroll = computed(() => ({
    x: visibleColumns.value.reduce((width, column) => width + (Number(column.width) || 120), 0)
}))
/** 读取当前订单动作的忙碌状态，不把其他行或全表都锁住。 */
const isRowActionLoading = (orderSn: string, action: string) =>
    Boolean(
        props.rowActionLoading[`${String(action || '').trim()}:${String(orderSn || '').trim()}`]
    )
</script>
<style scoped lang="scss">
.order-table {
    min-width: 0;
}
.order-table__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}
.order-table__toolbar h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
}
.delivery-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-3);
    white-space: normal;
    overflow-wrap: anywhere;
}
@media (max-width: 600px) {
    .order-table__toolbar :deep(.arco-radio-button) {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
    }
}
</style>
