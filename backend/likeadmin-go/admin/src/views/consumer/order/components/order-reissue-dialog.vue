<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <a-modal
        :visible="modelValue.visible"
        :mask-closable="!saving"
        :closable="!saving"
        :esc-to-close="!saving"
        :footer="false"
        unmount-on-close
        @cancel="emit('close')"
        title="订单补单"
        :width="'min(520px, calc(100vw - 24px))'"
    >
        <a-alert
            v-if="error"
            type="error"
            :closable="false"
            role="alert"
            class="order-dialog-error"
            >{{ error }}</a-alert
        >
        <fieldset class="order-dialog-fields" :disabled="saving" :inert="saving ? '' : undefined">
            <a-form :model="reissueModal" layout="vertical">
                <a-form-item label="订单号">
                    <a-input :model-value="reissueModal.orderSn" disabled />
                </a-form-item>
                <a-form-item label="交易号（可选）">
                    <a-input
                        :model-value="modelValue.tradeNo"
                        @update:model-value="updateField('tradeNo', $event)"
                        placeholder="可选，不填将自动使用 admin_manual_订单号"
                        allow-clear
                    />
                </a-form-item>
                <a-form-item label="支付渠道">
                    <a-select
                        :model-value="modelValue.payChannel"
                        @update:model-value="updateField('payChannel', $event)"
                        placeholder="请选择补单支付渠道"
                    >
                        <a-option value="admin_manual">后台人工（admin_manual）</a-option>
                        <a-option value="wechat_h5">微信H5（wechat_h5）</a-option>
                        <a-option value="alipay_h5">支付宝H5（alipay_h5）</a-option>
                        <a-option value="mock">开发模拟（mock）</a-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="补单备注（可选）">
                    <a-input
                        :model-value="modelValue.remark"
                        @update:model-value="updateField('remark', $event)"
                        placeholder="可选，例如：人工核验到账后补单"
                        allow-clear
                    />
                </a-form-item>
            </a-form>
        </fieldset>
        <template #footer
            ><a-button :disabled="saving" @click="emit('close')">取消</a-button
            ><a-button type="primary" :loading="saving" @click="emit('submit')"
                >确认补单</a-button
            ></template
        >
    </a-modal>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { OrderReissueDraft } from '../types'
const props = defineProps<{
    modelValue: OrderReissueDraft
    saving: boolean
    error: string
}>()
const emit = defineEmits<{
    (event: 'patch', value: Partial<OrderReissueDraft>): void
    (event: 'submit'): void
    (event: 'close'): void
}>()
/** 保持父级草稿为唯一数据源，重新打开对话框时不复用上一个订单的本地副本。 */
const reissueModal = computed(() => props.modelValue)
/** 只发出表单补丁；保存时忽略迟到输入，不独立请求或保存订单。 */
const updateField = (key: keyof OrderReissueDraft, value: unknown) => {
    if (props.saving) return
    emit('patch', {
        [key]: value == null ? (typeof props.modelValue[key] === 'number' ? 0 : '') : value
    } as Partial<OrderReissueDraft>)
}
</script>
<style scoped lang="scss">
.order-dialog-fields {
    min-width: 0;
    padding: 0;
    margin: 0;
    border: 0;
}
.order-dialog-error {
    margin-bottom: 16px;
}
@media (max-width: 600px) {
    :deep(.arco-btn) {
        min-height: 44px;
    }
}
</style>
