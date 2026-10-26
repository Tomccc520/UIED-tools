<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <section class="commercial-payment" aria-label="支付接入配置">
        <a-card
            class="!border-none mt-4"
            :bordered="false"
            data-admin-smoke="login-register-payment-panel"
        >
            <div class="font-medium mb-6">支付设置</div>
            <a-alert v-if="syncError" type="warning" role="alert" :closable="false" class="mb-4">
                {{ syncError }}
            </a-alert>

            <a-form-item label="可用支付渠道">
                <div>
                    <a-checkbox-group v-model="formData.paymentChannels">
                        <a-checkbox value="mock">测试支付（开发环境）</a-checkbox>
                        <a-checkbox value="wechat_h5">微信支付（H5）</a-checkbox>
                        <a-checkbox value="alipay_h5">支付宝（H5）</a-checkbox>
                    </a-checkbox-group>
                    <div class="form-tips">
                        建议至少保留一个渠道；正式环境可关闭 mock，仅保留微信/支付宝。
                    </div>
                </div>
            </a-form-item>

            <a-form-item
                label="微信支付跳转地址"
                v-if="formData.paymentChannels.includes('wechat_h5')"
            >
                <div class="w-full max-w-[760px]">
                    <a-input
                        v-model="formData.paymentWechatUrl"
                        placeholder="请输入微信支付页地址，如：https://pay.example.com/wechat"
                        allow-clear
                    />
                    <div class="form-tips mt-1">
                        下单后前端将跳转该地址，并自动拼接 orderSn / payChannel 参数。
                    </div>
                </div>
            </a-form-item>

            <a-form-item
                label="微信下单接口地址"
                v-if="formData.paymentChannels.includes('wechat_h5')"
            >
                <div class="w-full max-w-[760px]">
                    <a-input
                        v-model="formData.paymentWechatCreateApi"
                        placeholder="可选：服务端下单接口地址，如：https://pay.example.com/api/wechat/create"
                        allow-clear
                    />
                    <div class="form-tips mt-1">
                        配置后系统将由后端发起微信下单，并返回实时 payUrl/tradeNo。
                    </div>
                </div>
            </a-form-item>

            <a-form-item
                label="微信支付 V3 官方参数"
                v-if="formData.paymentChannels.includes('wechat_h5')"
            >
                <div class="w-full max-w-[980px] payment-v3-fields">
                    <a-alert type="info" class="mb-3">
                        <template #title>官方微信支付 V3 参数（推荐生产环境配置）</template>
                        建议同时配置“微信下单接口地址”与以下参数，便于后续切换官方直连链路。
                    </a-alert>
                    <a-space class="mb-3">
                        <a-button
                            size="small"
                            type="outline"
                            :loading="syncing"
                            @click="$emit('syncCertificate')"
                        >
                            自动拉取微信平台证书
                        </a-button>
                    </a-space>
                    <div class="wechat-cert-meta mb-3">
                        <a-space wrap>
                            <a-tag :color="wechatCertStatusColor">{{ wechatCertStatusText }}</a-tag>
                            <a-tag color="arcoblue">
                                平台证书序列号：{{ formData.paymentWechatPlatformSerialNo || '-' }}
                            </a-tag>
                        </a-space>
                        <div class="form-tips mt-1">
                            生效时间：{{
                                formatWechatTimeText(formData.paymentWechatPlatformEffectiveTime)
                            }}
                        </div>
                        <div class="form-tips">
                            到期时间：{{
                                formatWechatTimeText(formData.paymentWechatPlatformExpireTime)
                            }}
                        </div>
                        <div class="form-tips">
                            最近同步：{{
                                formData.paymentWechatPlatformSyncedAt > 0
                                    ? new Date(
                                          formData.paymentWechatPlatformSyncedAt * 1000
                                      ).toLocaleString()
                                    : '-'
                            }}
                        </div>
                    </div>
                    <a-grid :cols="24" :col-gap="12" :row-gap="12">
                        <a-grid-item :span="8">
                            <a-input
                                v-model="formData.paymentWechatMchId"
                                placeholder="商户号 mchid（必填）"
                                allow-clear
                            />
                        </a-grid-item>
                        <a-grid-item :span="8">
                            <a-input
                                v-model="formData.paymentWechatAppId"
                                placeholder="AppID（必填）"
                                allow-clear
                            />
                        </a-grid-item>
                        <a-grid-item :span="8">
                            <a-input
                                v-model="formData.paymentWechatSerialNo"
                                placeholder="商户证书序列号 serial_no（必填）"
                                allow-clear
                            />
                        </a-grid-item>
                        <a-grid-item :span="12">
                            <a-input-password
                                v-model="formData.paymentWechatApiV3Key"
                                placeholder="APIv3 密钥（必填）"
                                allow-clear
                            />
                        </a-grid-item>
                        <a-grid-item :span="12">
                            <a-input
                                v-model="formData.paymentWechatNotifyUrl"
                                placeholder="支付回调地址（必填），如：https://api.xxx.com/api/common/frontend-user/purchase/wechat/callback"
                                allow-clear
                            />
                        </a-grid-item>
                        <a-grid-item :span="24">
                            <a-textarea
                                v-model="formData.paymentWechatPrivateKey"
                                :auto-size="{ minRows: 4, maxRows: 10 }"
                                placeholder="商户私钥 PEM（必填）"
                            />
                        </a-grid-item>
                        <a-grid-item :span="24">
                            <a-textarea
                                v-model="formData.paymentWechatPlatformCert"
                                :auto-size="{ minRows: 3, maxRows: 8 }"
                                placeholder="平台证书 PEM（可选，建议配置）"
                            />
                        </a-grid-item>
                    </a-grid>
                    <div class="form-tips mt-1">
                        必填项：商户号、AppID、商户证书序列号、APIv3
                        密钥、商户私钥、支付回调地址。平台证书建议按微信平台最新证书同步。
                    </div>
                </div>
            </a-form-item>

            <a-form-item
                label="支付宝跳转地址"
                v-if="formData.paymentChannels.includes('alipay_h5')"
            >
                <div class="w-full max-w-[760px]">
                    <a-input
                        v-model="formData.paymentAlipayUrl"
                        placeholder="请输入支付宝支付页地址，如：https://pay.example.com/alipay"
                        allow-clear
                    />
                    <div class="form-tips mt-1">
                        下单后前端将跳转该地址，并自动拼接 orderSn / payChannel 参数。
                    </div>
                </div>
            </a-form-item>

            <a-form-item
                label="支付宝下单接口地址"
                v-if="formData.paymentChannels.includes('alipay_h5')"
            >
                <div class="w-full max-w-[760px]">
                    <a-input
                        v-model="formData.paymentAlipayCreateApi"
                        placeholder="可选：服务端下单接口地址，如：https://pay.example.com/api/alipay/create"
                        allow-clear
                    />
                    <div class="form-tips mt-1">
                        建议正式支付联调时配置，支持待支付订单重新拉起支付。
                    </div>
                </div>
            </a-form-item>

            <a-form-item label="下单请求签名密钥">
                <div class="w-full max-w-[760px]">
                    <a-input-password
                        v-model="formData.paymentRequestSecret"
                        placeholder="可选：后端调用支付网关下单时用于签名"
                        allow-clear
                    />
                    <div class="form-tips mt-1">
                        若支付网关要求签名校验，请填写；系统会自动生成 sign 与 X-Payment-Sign。
                    </div>
                </div>
            </a-form-item>

            <a-form-item label="支付网关鉴权模式">
                <div class="w-full max-w-[760px]">
                    <a-radio-group v-model="formData.paymentRequestAuthType" type="button">
                        <a-radio value="none">不鉴权</a-radio>
                        <a-radio value="bearer">Bearer Token</a-radio>
                        <a-radio value="header">自定义 Header</a-radio>
                    </a-radio-group>
                    <div class="form-tips mt-1">
                        用于“服务端下单接口地址”请求头鉴权；仅影响后端到支付网关的下单调用。
                    </div>
                </div>
            </a-form-item>

            <a-form-item
                label="自定义鉴权 Header"
                v-if="formData.paymentRequestAuthType === 'header'"
            >
                <div class="w-full max-w-[760px]">
                    <a-input
                        v-model="formData.paymentRequestHeader"
                        placeholder="请输入请求头名称，例如：X-Payment-Token"
                        allow-clear
                    />
                    <div class="form-tips mt-1">仅支持字母/数字/短横线，默认 X-Payment-Token。</div>
                </div>
            </a-form-item>

            <a-form-item label="支付网关鉴权令牌" v-if="formData.paymentRequestAuthType !== 'none'">
                <div class="w-full max-w-[760px]">
                    <a-input-password
                        v-model="formData.paymentRequestToken"
                        placeholder="请输入支付网关鉴权令牌"
                        allow-clear
                    />
                    <div class="form-tips mt-1">
                        Bearer 模式会写入 Authorization: Bearer Token；自定义模式会写入你指定的
                        Header。
                    </div>
                </div>
            </a-form-item>

            <a-form-item label="支付网关下单超时（秒）">
                <div class="w-full max-w-[360px]">
                    <a-input-number
                        v-model="formData.paymentRequestTimeout"
                        :min="3"
                        :max="60"
                        :step="1"
                        class="w-full"
                    />
                    <div class="form-tips mt-1">
                        建议 8~20 秒，避免网关超时导致“下单接口请求失败”。
                    </div>
                </div>
            </a-form-item>

            <a-form-item label="回调签名密钥">
                <div class="w-full max-w-[760px]">
                    <a-input-password
                        v-model="formData.paymentCallbackSecret"
                        placeholder="用于第三方支付回调验签，建议 16~64 位随机字符串"
                        allow-clear
                    />
                    <div class="form-tips mt-1">
                        mock 渠道可留空；启用微信/支付宝正式回调时建议必填。
                    </div>
                </div>
            </a-form-item>
        </a-card>
    </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { CommercialDraft } from './commercial-config'
const props = defineProps<{ formData: CommercialDraft; syncing: boolean; syncError: string }>()
defineEmits<{ (event: 'syncCertificate'): void }>()
// 凭据只保存在父页草稿中，面板不读取、保存或同步任何后台配置。
const formData = props.formData
/**
 * 函数说明：将 ISO 时间文本格式化为本地可读时间，解析失败则返回原文本。
 */
const formatWechatTimeText = (value: unknown): string => {
    const text = String(value || '').trim()
    if (!text) {
        return '-'
    }
    const timestamp = new Date(text).getTime()
    if (Number.isNaN(timestamp)) {
        return text
    }
    return new Date(timestamp).toLocaleString()
}

/**
 * 函数说明：计算微信平台证书剩余天数，返回 null 表示未配置或不可计算。
 */
const wechatCertRemainDays = computed<number | null>(() => {
    const expireText = String(formData.paymentWechatPlatformExpireTime || '').trim()
    if (!expireText) {
        return null
    }
    const expireTimestamp = new Date(expireText).getTime()
    if (Number.isNaN(expireTimestamp)) {
        return null
    }
    const remainMs = expireTimestamp - Date.now()
    return Math.floor(remainMs / (24 * 60 * 60 * 1000))
})

/**
 * 函数说明：根据证书剩余天数生成状态文案，便于运营快速判断是否需要续拉。
 */
const wechatCertStatusText = computed<string>(() => {
    const remainDays = wechatCertRemainDays.value
    if (remainDays === null) {
        return '未获取'
    }
    if (remainDays < 0) {
        return '已过期'
    }
    if (remainDays <= 7) {
        return `即将过期（剩余${remainDays}天）`
    }
    if (remainDays <= 30) {
        return `需关注（剩余${remainDays}天）`
    }
    return `有效（剩余${remainDays}天）`
})

/**
 * 函数说明：根据证书剩余天数返回状态颜色，用于 Arco 标签视觉提示。
 */
const wechatCertStatusColor = computed<string>(() => {
    const remainDays = wechatCertRemainDays.value
    if (remainDays === null) {
        return 'gray'
    }
    if (remainDays < 0) {
        return 'red'
    }
    if (remainDays <= 7) {
        return 'orangered'
    }
    if (remainDays <= 30) {
        return 'gold'
    }
    return 'green'
})
</script>
<style scoped lang="scss">
.payment-v3-fields {
    padding: 12px;
    border: 1px dashed var(--color-border-2);
    border-radius: var(--uied-admin-radius);
    background: var(--color-fill-1);
}
.wechat-cert-meta {
    padding: 10px;
    border-radius: var(--uied-admin-radius);
    background: var(--color-bg-2);
    border: 1px solid var(--color-border-2);
}
.commercial-payment :deep(.arco-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}
@media (max-width: 600px) {
    .commercial-payment :deep(.arco-grid) {
        display: flex !important;
        flex-direction: column;
        gap: 12px;
    }
    .commercial-payment :deep(.arco-grid-item) {
        width: 100%;
    }
}
</style>
