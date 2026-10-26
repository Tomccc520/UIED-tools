<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <div class="order-filters">
        <a-form class="order-filter-form" :model="modelValue" layout="vertical">
            <a-form-item label="关键字" field="keyword">
                <a-input
                    :model-value="modelValue.keyword"
                    :input-attrs="{ 'aria-label': '关键字' }"
                    @update:model-value="updateField('keyword', $event)"
                    class="w-[300px]"
                    placeholder="订单号/商品名称/用户昵称/手机"
                    allow-clear
                    @press-enter="emit('search')"
                    @clear="emit('search')"
                />
            </a-form-item>

            <a-form-item label="订单状态" field="status">
                <a-select
                    :model-value="modelValue.status"
                    @update:model-value="updateField('status', $event)"
                    class="w-[180px]"
                    allow-clear
                >
                    <a-option value="">全部状态</a-option>
                    <a-option value="0">待支付</a-option>
                    <a-option value="1">已支付</a-option>
                    <a-option value="2">已关闭</a-option>
                </a-select>
            </a-form-item>

            <a-form-item label="商品类型" field="productType">
                <a-select
                    :model-value="modelValue.productType"
                    @update:model-value="updateField('productType', $event)"
                    class="w-[200px]"
                    allow-clear
                >
                    <a-option value="">全部类型</a-option>
                    <a-option value="member_plan">会员套餐</a-option>
                    <a-option value="points_pack">积分包</a-option>
                </a-select>
            </a-form-item>

            <div class="order-filter-actions">
                <a-button type="primary" @click="emit('search')">查询</a-button>
                <a-button @click="emit('reset')">重置</a-button>
            </div>
            <details
                class="order-filter-advanced"
                :open="advancedOpen"
                @toggle="handleAdvancedToggle"
            >
                <summary>
                    更多筛选<span v-if="advancedFilterCount"
                        >（已选 {{ advancedFilterCount }} 项）</span
                    >
                </summary>
                <div class="order-filter-advanced__fields">
                    <a-form-item label="回调状态" field="callbackStatus">
                        <a-select
                            :model-value="modelValue.callbackStatus"
                            @update:model-value="updateField('callbackStatus', $event)"
                            class="w-[180px]"
                            allow-clear
                        >
                            <a-option value="">全部回调</a-option>
                            <a-option value="0">未回调</a-option>
                            <a-option value="3">支付处理中</a-option>
                            <a-option value="1">回调成功</a-option>
                            <a-option value="2">回调失败</a-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="交付状态" field="deliveryStatus">
                        <a-select
                            :model-value="modelValue.deliveryStatus"
                            @update:model-value="updateField('deliveryStatus', $event)"
                            class="w-[180px]"
                            allow-clear
                        >
                            <a-option value="">全部交付</a-option>
                            <a-option value="0">未交付</a-option>
                            <a-option value="1">已交付</a-option>
                            <a-option value="2">待补充</a-option>
                            <a-option value="3">已失效</a-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="联动状态" field="deliveryCheckStatus">
                        <a-select
                            :model-value="modelValue.deliveryCheckStatus"
                            @update:model-value="updateField('deliveryCheckStatus', $event)"
                            class="w-[200px]"
                            allow-clear
                        >
                            <a-option value="">全部联动</a-option>
                            <a-option value="abnormal">异常待处理</a-option>
                            <a-option value="pending_delivery">待交付</a-option>
                            <a-option v-if="licenseVisible" value="license_inactive"
                                >授权未激活</a-option
                            >
                            <a-option v-if="licenseVisible" value="domain_mismatch"
                                >域名不匹配</a-option
                            >
                            <a-option value="download_invalid">下载异常</a-option>
                            <a-option value="delivery_incomplete">资料不完整</a-option>
                            <a-option value="expired">已失效</a-option>
                            <a-option value="ok">资料完整</a-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="绑定域名" field="boundDomain">
                        <a-input
                            :model-value="modelValue.boundDomain"
                            :input-attrs="{ 'aria-label': '绑定域名' }"
                            @update:model-value="updateField('boundDomain', $event)"
                            class="w-[220px]"
                            placeholder="筛选订单绑定域名"
                            allow-clear
                            @press-enter="emit('search')"
                            @clear="emit('search')"
                        />
                    </a-form-item>

                    <a-form-item label="创建时间">
                        <daterange-picker
                            :start-time="modelValue.startTime"
                            @update:start-time="updateField('startTime', $event)"
                            :end-time="modelValue.endTime"
                            @update:end-time="updateField('endTime', $event)"
                        />
                    </a-form-item>
                </div>
            </details>
        </a-form>
        <div class="filter-result">
            筛选条件：{{ activeFilterCount }} 项 | 当前加载 {{ resultCount }} 条
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { OrderFilters } from '../types'
const props = defineProps<{
    modelValue: OrderFilters
    licenseVisible: boolean
    activeFilterCount: number
    resultCount: number
}>()
const emit = defineEmits<{
    (event: 'patch', value: Partial<OrderFilters>): void
    (event: 'search'): void
    (event: 'reset'): void
}>()
const advancedOpen = ref(false)
const advancedFields: (keyof OrderFilters)[] = [
    'callbackStatus',
    'deliveryStatus',
    'deliveryCheckStatus',
    'boundDomain',
    'startTime',
    'endTime'
]
/** 统计高级筛选项，路由带入条件时主动展开，让运营看得到已生效的筛选。 */
const advancedFilterCount = computed(
    () => advancedFields.filter((key) => String(props.modelValue[key] || '').trim()).length
)
/** 当前条件出现高级字段时展开，用户仍可手动收起，筛选计数持续显示。 */
watch(
    advancedFilterCount,
    (count) => {
        if (count) advancedOpen.value = true
    },
    { immediate: true }
)
/** 只发送一个字段补丁，不修改传入模型；清空选择器统一恢复空字符串。 */
const updateField = (key: keyof OrderFilters, value: unknown) =>
    emit('patch', { [key]: value == null ? '' : String(value) })
/** 记录原生展开状态，避免表单其它字段更新时无故收起高级筛选。 */
const handleAdvancedToggle = (event: Event) => {
    advancedOpen.value = (event.target as HTMLDetailsElement).open
}
</script>
<style scoped lang="scss">
.order-filter-form {
    display: grid;
    grid-template-columns:
        minmax(240px, 2fr) minmax(140px, 1fr) minmax(160px, 1fr)
        auto;
    gap: 0 16px;
    align-items: end;
}
.order-filter-form :deep(.arco-form-item) {
    margin-bottom: 0;
    min-width: 0;
}
.order-filter-form :deep(.arco-input-wrapper),
.order-filter-form :deep(.arco-select),
.order-filter-form :deep(.arco-picker) {
    width: 100%;
    max-width: 100%;
}
.order-filter-actions {
    display: flex;
    gap: 8px;
    padding-bottom: 1px;
}
.order-filter-advanced {
    grid-column: 1/-1;
    margin-top: 16px;
}
.order-filter-advanced summary {
    padding: 4px 0;
    cursor: pointer;
    font-size: 13px;
    color: var(--color-text-2);
}
.order-filter-advanced__fields {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-top: 16px;
}
.filter-result {
    margin-top: 16px;
    font-size: 12px;
    color: var(--color-text-3);
}
@media (max-width: 1100px) {
    .order-filter-form {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
    }
    .order-filter-advanced__fields {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (max-width: 600px) {
    .order-filter-form,
    .order-filter-advanced__fields {
        grid-template-columns: 1fr;
    }
    .order-filter-actions {
        width: 100%;
    }
    .order-filter-actions :deep(button) {
        min-height: 44px;
        flex: 1;
    }
}
</style>
