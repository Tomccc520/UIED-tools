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
        title="订单交付信息"
        :width="'min(860px, calc(100vw - 24px))'"
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
            <details class="delivery-context">
                <summary>查看交付状态与修复建议</summary>
                <div class="delivery-workspace">
                    <div class="delivery-workspace__main">
                        <div class="delivery-workspace__eyebrow">源码交付工作台</div>
                        <div class="delivery-workspace__title">
                            {{
                                deliveryModal.orderSn
                                    ? `当前正在维护订单 ${deliveryModal.orderSn}`
                                    : '当前正在维护源码交付信息'
                            }}
                        </div>
                        <div class="delivery-workspace__desc">
                            {{
                                licenseVisible
                                    ? '先补齐域名、授权码和下载入口，再根据系统授权状态判断是否需要跳到授权管理页继续修复。'
                                    : '先补齐域名、交付凭据和下载入口，再检查资料与下载链路是否完整。'
                            }}
                        </div>
                        <div class="delivery-workspace__meta">
                            <div class="delivery-workspace__meta-item">
                                <span>交付状态</span>
                                <strong>{{ deliveryModal.deliveryStatusText }}</strong>
                            </div>
                            <div class="delivery-workspace__meta-item">
                                <span>交付校验</span>
                                <strong>{{ deliveryModal.deliveryCheckText }}</strong>
                            </div>
                            <div v-if="licenseVisible" class="delivery-workspace__meta-item">
                                <span>系统授权</span>
                                <strong>{{ deliveryModal.systemLicenseStatusText || '-' }}</strong>
                            </div>
                            <div v-if="licenseVisible" class="delivery-workspace__meta-item">
                                <span>系统域名</span>
                                <strong>{{ deliveryModal.systemLicenseBoundDomain || '-' }}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="delivery-workspace__aside">
                        <div class="delivery-workspace__aside-title">当前动作建议</div>
                        <div class="delivery-workspace__aside-text">
                            {{ deliveryModalActionSummary }}
                        </div>
                        <a-space direction="vertical" fill>
                            <a-button
                                v-if="licenseVisible && deliveryModal.id > 0"
                                type="primary"
                                @click="emit('license')"
                            >
                                去授权管理继续修复
                            </a-button>
                            <a-button
                                v-if="licenseVisible && deliveryModal.systemLicenseBoundDomain"
                                @click="emit('apply-system-domain')"
                            >
                                使用系统授权域名
                            </a-button>
                            <a-button
                                type="outline"
                                :loading="checking"
                                :disabled="
                                    checking || !String(deliveryModal.downloadUrl || '').trim()
                                "
                                @click="emit('check-download')"
                            >
                                检测下载链接
                            </a-button>
                        </a-space>
                    </div>
                </div>

                <div class="delivery-workspace-checklist">
                    <div
                        v-for="item in deliveryModalChecklist"
                        :key="item.label"
                        class="delivery-workspace-checklist__item"
                        :class="item.className"
                    >
                        <div class="delivery-workspace-checklist__label">
                            {{ item.label }}
                        </div>
                        <div class="delivery-workspace-checklist__value">
                            {{ item.value }}
                        </div>
                        <div class="delivery-workspace-checklist__desc">
                            {{ item.desc }}
                        </div>
                    </div>
                </div>
            </details>
            <a-form :model="deliveryModal" layout="vertical">
                <a-form-item label="订单号">
                    <a-input :model-value="deliveryModal.orderSn" disabled />
                </a-form-item>
                <a-form-item label="交付状态">
                    <a-select
                        :model-value="modelValue.deliveryStatus"
                        @update:model-value="updateField('deliveryStatus', $event)"
                    >
                        <a-option :value="0">未交付</a-option>
                        <a-option :value="1">已交付</a-option>
                        <a-option :value="2">待补充</a-option>
                        <a-option :value="3">已失效</a-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="绑定域名">
                    <a-input
                        :model-value="modelValue.licenseBoundDomain"
                        @update:model-value="updateField('licenseBoundDomain', $event)"
                        allow-clear
                        placeholder="如：uiedtool.com"
                    />
                </a-form-item>
                <a-form-item v-if="licenseVisible" label="授权码">
                    <a-input
                        :model-value="modelValue.licenseKey"
                        @update:model-value="updateField('licenseKey', $event)"
                        allow-clear
                        placeholder="可记录发给客户的授权码"
                    />
                </a-form-item>
                <a-form-item label="下载链接">
                    <a-input
                        :model-value="modelValue.downloadUrl"
                        @update:model-value="updateField('downloadUrl', $event)"
                        allow-clear
                        placeholder="源码包或交付文档下载地址"
                    />
                </a-form-item>
                <a-form-item label="下载检测">
                    <div class="delivery-check-inline">
                        <a-tag
                            :color="resolveDownloadCheckTagColor(deliveryModal.downloadCheckStatus)"
                            bordered
                        >
                            {{ deliveryModal.downloadCheckStatusText || '未检测' }}
                        </a-tag>
                        <span
                            v-if="deliveryModal.downloadCheckTime"
                            class="delivery-check-inline__text"
                        >
                            最近检测：{{ deliveryModal.downloadCheckTime }}
                        </span>
                    </div>
                    <div
                        v-if="deliveryModal.downloadCheckMessage"
                        class="delivery-check-inline__text mt-2"
                    >
                        {{ deliveryModal.downloadCheckMessage }}
                    </div>
                </a-form-item>
                <a-form-item label="交付时间（Unix 秒，可选）">
                    <a-input-number
                        :model-value="modelValue.deliveredTime"
                        @update:model-value="updateField('deliveredTime', $event)"
                        :min="0"
                        :step="3600"
                        mode="button"
                        class="w-full"
                    />
                </a-form-item>
                <a-form-item label="交付备注">
                    <a-textarea
                        :model-value="modelValue.deliveryNote"
                        @update:model-value="updateField('deliveryNote', $event)"
                        :auto-size="{ minRows: 2, maxRows: 4 }"
                    />
                </a-form-item>
            </a-form>
        </fieldset>
        <template #footer
            ><a-button :disabled="saving" @click="emit('close')">取消</a-button
            ><a-button type="primary" :loading="saving" @click="emit('submit')"
                >保存交付信息</a-button
            ></template
        >
    </a-modal>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { OrderDeliveryDraft } from '../types'
import { resolveDownloadCheckTagColor } from '../order-display'
const props = defineProps<{
    modelValue: OrderDeliveryDraft
    saving: boolean
    error: string
    licenseVisible: boolean
    checking: boolean
}>()
const emit = defineEmits<{
    (event: 'patch', value: Partial<OrderDeliveryDraft>): void
    (event: 'submit'): void
    (event: 'close'): void
    (event: 'license'): void
    (event: 'apply-system-domain'): void
    (event: 'check-download'): void
}>()
/** 保持父级草稿为唯一数据源，重新打开对话框时不复用上一个订单的本地副本。 */
const deliveryModal = computed(() => props.modelValue)
/** 只发出表单补丁；保存时忽略迟到输入，不独立请求或保存订单。 */
const updateField = (key: keyof OrderDeliveryDraft, value: unknown) => {
    if (props.saving) return
    emit('patch', {
        [key]: value == null ? (typeof props.modelValue[key] === 'number' ? 0 : '') : value
    } as Partial<OrderDeliveryDraft>)
}
/**
 * 函数说明：汇总交付弹窗顶部的动作建议，让运营先知道当前这单优先修什么。
 */
const deliveryModalActionSummary = computed(() => {
    if (!props.licenseVisible) {
        if (deliveryModal.value.deliveryCheckStatus === 'download_invalid') {
            return '当前订单的下载链路异常，建议先检测并替换下载链接，再决定是否交付。'
        }
        if (deliveryModal.value.deliveryCheckStatus === 'delivery_incomplete') {
            return '当前订单资料还不完整，优先补齐域名、交付凭据和下载入口。'
        }
        return '请复核交付资料与下载链路，确认完整后再保存。'
    }
    if (deliveryModal.value.deliveryCheckStatus === 'license_inactive') {
        return '当前订单的主要问题是授权未激活，建议先跳到授权管理页完成校验。'
    }
    if (deliveryModal.value.deliveryCheckStatus === 'domain_mismatch') {
        return '当前订单的主要问题是域名不匹配，建议优先核对订单域名与系统授权域名。'
    }
    if (deliveryModal.value.deliveryCheckStatus === 'download_invalid') {
        return '当前订单的下载链路异常，建议先检测并替换下载链接，再决定是否交付。'
    }
    if (deliveryModal.value.deliveryCheckStatus === 'delivery_incomplete') {
        return '当前订单资料还不完整，优先补齐域名、授权码和下载入口。'
    }
    if (deliveryModal.value.deliveryCheckStatus === 'expired') {
        return '当前订单已标记为失效，处理前请先确认是否需要重新交付或更换授权。'
    }
    return '当前交付资料已基本齐全，可以复核下载链路后完成保存。'
})

/**
 * 函数说明：生成交付弹窗里的资料清单块，统一展示当前这单缺哪些材料。
 */
const deliveryModalChecklist = computed(() => {
    const hasDomain = Boolean(String(deliveryModal.value.licenseBoundDomain || '').trim())
    const hasLicenseKey = Boolean(String(deliveryModal.value.licenseKey || '').trim())
    const hasDownloadUrl = Boolean(String(deliveryModal.value.downloadUrl || '').trim())
    const checklist = [
        {
            label: '域名资料',
            value: hasDomain ? '已填写' : '待补充',
            desc: hasDomain
                ? `当前域名：${deliveryModal.value.licenseBoundDomain}`
                : '源码交付通常需要绑定客户最终使用域名。',
            className: hasDomain ? 'is-ok' : 'is-warning'
        },
        ...(props.licenseVisible
            ? [
                  {
                      label: '授权码资料',
                      value: hasLicenseKey ? '已填写' : '待补充',
                      desc: hasLicenseKey
                          ? '订单已记录授权码，可用于客户交付。'
                          : '授权码为空时，客户无法直接完成授权激活。',
                      className: hasLicenseKey ? 'is-ok' : 'is-warning'
                  }
              ]
            : []),
        {
            label: '下载链路',
            value:
                deliveryModal.value.downloadCheckStatus === 1
                    ? '可下载'
                    : hasDownloadUrl
                    ? '待确认'
                    : '缺下载入口',
            desc:
                deliveryModal.value.downloadCheckMessage ||
                (hasDownloadUrl
                    ? '建议交付前手动做一次下载检测。'
                    : '源码包或交付文档下载链接尚未填写。'),
            className:
                deliveryModal.value.downloadCheckStatus === 1
                    ? 'is-ok'
                    : hasDownloadUrl
                    ? ''
                    : 'is-danger'
        },
        ...(props.licenseVisible
            ? [
                  {
                      label: '系统授权',
                      value: deliveryModal.value.systemLicenseStatusText || '未记录',
                      desc: deliveryModal.value.systemLicenseBoundDomain
                          ? `系统域名：${deliveryModal.value.systemLicenseBoundDomain}`
                          : '当前没有读取到系统授权绑定域名。',
                      className:
                          deliveryModal.value.deliveryCheckStatus === 'license_inactive' ||
                          deliveryModal.value.deliveryCheckStatus === 'domain_mismatch'
                              ? 'is-danger'
                              : ''
                  }
              ]
            : [])
    ]
    return checklist
})
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
.delivery-context {
    margin-bottom: 20px;
}
.delivery-context > summary {
    cursor: pointer;
    padding: 6px 0;
    color: var(--color-text-2);
    font-size: 13px;
}
.delivery-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(200px, 1fr);
    gap: 16px;
    margin: 16px 0;
}
.delivery-workspace__main,
.delivery-workspace__aside {
    border: 1px solid var(--color-border-2);
    border-radius: var(--uied-admin-radius);
    padding: 16px;
}
.delivery-workspace__eyebrow {
    font-size: 12px;
    color: var(--uied-admin-accent);
}
.delivery-workspace__title {
    margin-top: 8px;
    font-size: 16px;
    font-weight: 600;
    overflow-wrap: anywhere;
}
.delivery-workspace__desc,
.delivery-workspace__aside-text {
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-3);
    margin-top: 8px;
}
.delivery-workspace__aside-text {
    margin-bottom: 16px;
}
.delivery-workspace__aside-title {
    font-size: 14px;
    font-weight: 600;
}
.delivery-workspace__meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
}
.delivery-workspace__meta-item span {
    font-size: 12px;
    color: var(--color-text-3);
}
.delivery-workspace__meta-item strong {
    display: block;
    font-size: 13px;
    margin-top: 4px;
    overflow-wrap: anywhere;
}
.delivery-workspace-checklist {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 16px;
}
.delivery-workspace-checklist__item {
    border: 1px solid var(--color-border-2);
    border-radius: var(--uied-admin-radius);
    padding: 12px;
}
.delivery-workspace-checklist__label,
.delivery-workspace-checklist__desc {
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3);
}
.delivery-workspace-checklist__value {
    font-size: 15px;
    font-weight: 600;
    margin: 6px 0;
}
.delivery-workspace-checklist__item.is-warning .delivery-workspace-checklist__value {
    color: rgb(var(--warning-6));
}
.delivery-workspace-checklist__item.is-danger .delivery-workspace-checklist__value {
    color: rgb(var(--danger-6));
}
.delivery-workspace-checklist__item.is-ok .delivery-workspace-checklist__value {
    color: rgb(var(--success-6));
}
.delivery-check-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}
.delivery-check-inline__text {
    font-size: 12px;
    color: var(--color-text-3);
    overflow-wrap: anywhere;
}
@media (max-width: 600px) {
    .delivery-workspace,
    .delivery-workspace__meta,
    .delivery-workspace-checklist {
        grid-template-columns: 1fr;
    }
}
</style>
