<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <section class="order-overview">
        <section
            v-if="licenseVisible && repairContext.isActive"
            class="order-repair"
            aria-label="授权联动修复上下文"
        >
            <div class="order-repair__heading">
                <h2>
                    {{
                        repairContext.orderSn
                            ? `正在处理订单 ${repairContext.orderSn}`
                            : '正在处理授权联动异常'
                    }}
                </h2>
                <a-space wrap
                    ><a-button v-if="repairContext.orderSn" @click="emit('return-license')"
                        >返回授权页继续处理</a-button
                    ><a-button @click="emit('clear-context')">清除上下文</a-button></a-space
                >
            </div>
            <p>已按授权页带回的订单号和域名筛选，先核对交付资料，再继续处理系统授权。</p>
            <dl>
                <div>
                    <dt>订单号</dt>
                    <dd>{{ repairContext.orderSn || '-' }}</dd>
                </div>
                <div>
                    <dt>订单域名</dt>
                    <dd>{{ repairContext.domain || '-' }}</dd>
                </div>
                <div>
                    <dt>联动状态</dt>
                    <dd>{{ repairContext.deliveryCheckText || '未指定' }}</dd>
                </div>
                <div>
                    <dt>系统授权</dt>
                    <dd>{{ repairContext.licenseStatusText || '-' }}</dd>
                </div>
            </dl>
        </section>
        <div class="order-overview__heading">
            <h2>交付概况</h2>
            <span>选择状态可快速筛选订单</span>
        </div>
        <list-load-feedback
            v-if="error"
            :error="error"
            :loading="loading"
            :has-data="loaded"
            @retry="emit('retry')"
        />
        <div class="order-overview__items" :aria-busy="loading">
            <button
                v-for="item in visibleItems"
                :key="item.key"
                type="button"
                :title="item.description"
                :class="{
                    'is-warning': item.key === 'abnormalCount' && summary.abnormalCount > 0
                }"
                @click="emit('filter', item.filter)"
            >
                <span>{{ item.title }}</span
                ><strong>{{ loaded ? summary[item.key] : '—' }}</strong
                ><small>{{ item.description }}</small>
            </button>
        </div>
    </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import ListLoadFeedback from '@/components/list-load-feedback/index.vue'
import type { OrderLinkageSummary, OrderRepairContext } from '../types'
const props = defineProps<{
    summary: OrderLinkageSummary
    repairContext: OrderRepairContext
    licenseVisible: boolean
    loading: boolean
    loaded: boolean
    error: string
}>()
const emit = defineEmits<{
    (event: 'filter', value: string): void
    (event: 'retry'): void
    (event: 'return-license'): void
    (event: 'clear-context'): void
}>()
const items: {
    key: keyof OrderLinkageSummary
    title: string
    description: string
    filter: string
    licenseOnly?: boolean
}[] = [
    {
        key: 'sourceOrderCount',
        title: '源码交付订单',
        description: '当前参与源码交付的订单总数',
        filter: ''
    },
    {
        key: 'abnormalCount',
        title: '异常待处理',
        description: '交付资料、域名或下载链路存在问题',
        filter: 'abnormal'
    },
    {
        key: 'licenseInactiveCount',
        title: '授权未激活',
        description: '已交付但系统授权尚不可用',
        filter: 'license_inactive',
        licenseOnly: true
    },
    {
        key: 'domainMismatchCount',
        title: '域名不匹配',
        description: '订单域名与系统授权域名不一致',
        filter: 'domain_mismatch',
        licenseOnly: true
    },
    {
        key: 'downloadInvalidCount',
        title: '下载异常',
        description: '下载链接无效或最近检测失败',
        filter: 'download_invalid'
    },
    {
        key: 'deliveryIncompleteCount',
        title: '资料待补充',
        description: '域名、交付凭据或下载入口缺失',
        filter: 'delivery_incomplete'
    }
]
/** 授权相关入口只在已启用授权功能时展示，不凭概况卡片补造权限入口。 */
const visibleItems = computed(() =>
    items.filter((item) => !item.licenseOnly || props.licenseVisible)
)
</script>
<style scoped lang="scss">
.order-overview h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
}
.order-overview__heading {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
}
.order-overview__heading > span,
.order-repair p {
    font-size: 12px;
    color: var(--color-text-3);
    line-height: 1.7;
}
.order-overview__items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 8px;
}
.order-overview__items button {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 6px 12px;
    text-align: left;
    padding: 12px;
    border: 1px solid var(--color-border-2);
    border-radius: var(--uied-admin-radius);
    background: var(--color-bg-2);
    color: var(--color-text-2);
    cursor: pointer;
}
.order-overview__items button:hover {
    border-color: var(--uied-admin-accent);
}
.order-overview__items button:focus-visible {
    outline: 2px solid var(--uied-admin-accent);
    outline-offset: 2px;
}
.order-overview__items strong {
    font-size: 22px;
    color: var(--color-text-1);
}
.order-overview__items small {
    grid-column: 1/-1;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-3);
}
.order-overview__items .is-warning strong {
    color: rgb(var(--warning-6));
}
.order-repair {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--color-border-2);
}
.order-repair__heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}
.order-repair dl {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin: 12px 0 0;
}
.order-repair dt {
    font-size: 12px;
    color: var(--color-text-3);
}
.order-repair dd {
    margin: 6px 0 0;
    font-size: 13px;
    overflow-wrap: anywhere;
}
@media (max-width: 768px) {
    .order-repair dl {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (max-width: 400px) {
    .order-overview__items {
        grid-template-columns: 1fr;
    }
    .order-repair dl {
        grid-template-columns: 1fr;
    }
    .order-repair__heading :deep(button) {
        min-height: 44px;
    }
}
</style>
