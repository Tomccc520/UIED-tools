<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="channel-page">
        <a-page-header title="微信公众号设置" subtitle="集中维护公众号基础信息、开发者配置、服务器配置与功能域名。">
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>{{ configuredFieldCount }}/{{ totalFieldCount }} 已配置</a-tag>
                    <a-button data-admin-smoke="channel-wx-oa-config-restore" @click="handleReset" :disabled="isLoading || isSaving">恢复最近配置</a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 2, lg: 4 }" :col-gap="12" :row-gap="12" class="channel-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">配置完成度</div>
                    <div class="metric-value">{{ configuredFieldCount }}/{{ totalFieldCount }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">公众号名称</div>
                    <div class="metric-value metric-value--small">{{ accountNameLabel }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">开发者凭证</div>
                    <div class="metric-value metric-value--small">{{ credentialStatusLabel }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">消息加密方式</div>
                    <div class="metric-value metric-value--small">{{ encryptionTypeLabel }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-space direction="vertical" fill :size="16">
            <a-card class="!border-none channel-card channel-card--notice" :bordered="false">
                <a-alert
                    type="warning"
                    title="填写微信公众号开发配置前，请先在微信公众平台申请服务号并完成认证。"
                    :closable="false"
                    show-icon
                    banner
                />
            </a-card>

            <a-spin :loading="isLoading" tip="正在加载公众号配置..." class="w-full">
                <div class="channel-config-layout">
                    <div class="channel-config-main">
                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">基础信息</div>
                            <div class="section-desc">维护公众号名称、原始 ID 和二维码，便于运营核对渠道主体。</div>
                            <a-form :model="formData" layout="vertical" class="section-form">
                                <a-form-item label="公众号名称" field="name">
                                    <a-input v-model="formData.name" placeholder="请输入公众号名称" allow-clear />
                                </a-form-item>
                                <a-form-item label="原始ID" field="primaryId">
                                    <a-input v-model="formData.primaryId" placeholder="请输入原始ID" allow-clear />
                                </a-form-item>
                                <a-form-item label="公众号二维码" field="qrCode">
                                    <div>
                                        <material-picker v-model="formData.qrCode" :limit="1" />
                                        <div class="form-tips">建议尺寸：宽400px*高400px，支持 jpg、jpeg、png 格式。</div>
                                    </div>
                                </a-form-item>
                            </a-form>
                        </a-card>

                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">开发者信息</div>
                            <div class="section-desc">保存 AppID 与 AppSecret，供网页登录授权、消息服务与支付链路复用。</div>
                            <a-form :model="formData" layout="vertical" class="section-form">
                                <a-form-item label="AppID" field="appId">
                                    <a-input v-model="formData.appId" placeholder="请输入AppID" allow-clear />
                                </a-form-item>
                                <a-form-item label="AppSecret" field="appSecret">
                                    <a-input v-model="formData.appSecret" placeholder="请输入AppSecret" allow-clear />
                                </a-form-item>
                                <a-form-item>
                                    <div class="form-tips">登录微信公众平台，进入“开发 > 开发设置 > 开发者ID”，复制 AppID 与 AppSecret。</div>
                                </a-form-item>
                            </a-form>
                        </a-card>

                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">服务器配置</div>
                            <div class="section-desc">用于消息回调和签名校验。保存后建议同步到微信公众平台“基本配置”。</div>
                            <a-form :model="formData" layout="vertical" class="section-form">
                                <a-form-item label="URL">
                                    <div class="copy-field">
                                        <a-input :model-value="formData.url" disabled />
                                        <a-button v-copy="formData.url" :disabled="!formData.url">复制</a-button>
                                    </div>
                                    <div class="form-tips">微信公众平台 > 开发 > 基本配置 > 服务器配置，填写服务器地址 URL。</div>
                                </a-form-item>
                                <a-form-item label="Token" field="token">
                                    <a-input v-model="formData.token" placeholder="请输入Token" allow-clear />
                                    <div class="form-tips">建议使用可识别的随机字符串；不填时默认值为 likeshop。</div>
                                </a-form-item>
                                <a-form-item label="EncodingAESKey" field="encodingAesKey">
                                    <a-input v-model="formData.encodingAesKey" placeholder="请输入EncodingAESKey" allow-clear />
                                    <div class="form-tips">消息加密密钥由 43 位字符组成，字符范围为 A-Z、a-z、0-9。</div>
                                </a-form-item>
                                <a-form-item label="消息加密方式" required field="encryptionType">
                                    <a-radio-group class="radio-stack" v-model="formData.encryptionType">
                                        <a-radio :value="1">明文模式（不使用消息体加解密，安全系数较低）</a-radio>
                                        <a-radio :value="2">兼容模式（明文与密文共存，便于调试）</a-radio>
                                        <a-radio :value="3">安全模式（推荐，消息包为纯密文）</a-radio>
                                    </a-radio-group>
                                </a-form-item>
                            </a-form>
                        </a-card>

                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">功能域名</div>
                            <div class="section-desc">这些域名需要同步到公众号“功能设置”，保存后可直接复制使用。</div>
                            <div class="domain-list">
                                <div v-for="item in featureDomainFields" :key="item.key" class="domain-item">
                                    <div class="domain-item__head">
                                        <div>
                                            <div class="domain-item__title">{{ item.label }}</div>
                                            <div class="domain-item__desc">{{ item.tips }}</div>
                                        </div>
                                        <a-button v-copy="formData[item.key]" :disabled="!formData[item.key]">复制</a-button>
                                    </div>
                                    <a-input :model-value="formData[item.key]" disabled />
                                </div>
                            </div>
                        </a-card>
                    </div>

                    <div class="channel-config-side">
                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">配置提示</div>
                            <div class="tips-list">
                                <div class="tips-item">公众号名称、原始ID 和二维码主要给运营识别主体，建议与公众号后台保持一致。</div>
                                <div class="tips-item">Token、EncodingAESKey 与加密方式保存后，需要同步到微信公众平台的服务器配置。</div>
                                <div class="tips-item">业务域名、JS接口安全域名、网页授权域名建议一次性同步，避免联调时遗漏。</div>
                            </div>
                        </a-card>
                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">核对结果</div>
                            <div class="audit-list">
                                <div class="audit-item">
                                    <span>二维码</span>
                                    <strong>{{ qrCodeLabel }}</strong>
                                </div>
                                <div class="audit-item">
                                    <span>Token</span>
                                    <strong>{{ tokenStatusLabel }}</strong>
                                </div>
                                <div class="audit-item">
                                    <span>域名配置</span>
                                    <strong>{{ domainConfiguredCount }}/3</strong>
                                </div>
                            </div>
                        </a-card>
                    </div>
                </div>
            </a-spin>
        </a-space>

        <footer-btns v-perms="['channel:oa:save']">
            <a-space>
                <a-button data-admin-smoke="channel-wx-oa-config-reset" @click="handleReset" :disabled="isLoading || isSaving">重置</a-button>
                <a-button data-admin-smoke="channel-wx-oa-config-save" type="primary" :loading="isSaving" @click="handelSave">保存</a-button>
            </a-space>
        </footer-btns>
    </div>
</template>
<script lang="ts" setup name="wxOaConfig">
import { getOaConfig, setOaConfig } from '@/api/channel/wx_oa'
import feedback from '@/utils/feedback'

const formData = reactive({
    name: '',
    primaryId: '',
    qrCode: '',
    appId: '',
    appSecret: '',
    url: '',
    token: '',
    encodingAesKey: '',
    encryptionType: 1,
    businessDomain: '',
    jsDomain: '',
    webDomain: ''
})
const detailSnapshot = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const featureDomainFields = [
    {
        key: 'businessDomain' as const,
        label: '业务域名',
        tips: '微信公众平台 > 设置 > 公众号设置 > 功能设置，填写业务域名。'
    },
    {
        key: 'jsDomain' as const,
        label: 'JS接口安全域名',
        tips: '用于前端调用微信 JS SDK 时的域名校验。'
    },
    {
        key: 'webDomain' as const,
        label: '网页授权域名',
        tips: '用于网页授权回调域名校验，建议与前台实际域名一致。'
    }
]
const totalFieldCount = 9

/**
 * 函数说明：更新当前配置快照，用于重置回填。
 */
const updateDetailSnapshot = () => {
    detailSnapshot.value = JSON.stringify(formData)
}

/**
 * 函数说明：获取公众号配置详情并回填表单。
 */
const getDetail = async () => {
    isLoading.value = true
    try {
        const data = await getOaConfig()
        for (const key in formData) {
            //@ts-ignore
            formData[key] = data[key] ?? formData[key]
        }
        updateDetailSnapshot()
    } catch (error) {
        feedback.msgError('公众号配置加载失败，请稍后重试')
    } finally {
        isLoading.value = false
    }
}

/**
 * 函数说明：保存公众号配置并刷新页面数据。
 */
const handelSave = async () => {
    if (isSaving.value) {
        return
    }
    isSaving.value = true
    try {
        await setOaConfig(formData)
        updateDetailSnapshot()
        feedback.msgSuccess('公众号配置保存成功')
    } finally {
        isSaving.value = false
    }
}

/**
 * 函数说明：将当前表单重置为最近一次成功加载/保存的配置快照。
 */
const handleReset = () => {
    if (!detailSnapshot.value) {
        return
    }
    try {
        const snapshot = JSON.parse(detailSnapshot.value) as Record<string, any>
        for (const key in formData) {
            //@ts-ignore
            formData[key] = snapshot[key] ?? formData[key]
        }
        feedback.msgSuccess('已恢复为最近保存配置')
    } catch (error) {
        feedback.msgError('重置失败，请刷新页面后重试')
    }
}

const configuredFieldCount = computed(() => {
    const fields = [
        formData.name,
        formData.primaryId,
        formData.qrCode,
        formData.appId,
        formData.appSecret,
        formData.token,
        formData.encodingAesKey,
        formData.businessDomain,
        formData.jsDomain
    ]
    return fields.filter((item) => String(item || '').trim()).length
})
const domainConfiguredCount = computed(() => {
    return featureDomainFields.filter((item) => String(formData[item.key] || '').trim()).length
})
const accountNameLabel = computed(() => String(formData.name || '').trim() || '待配置')
const qrCodeLabel = computed(() => (String(formData.qrCode || '').trim() ? '已上传' : '待上传'))
const tokenStatusLabel = computed(() => (String(formData.token || '').trim() ? '已配置' : '待配置'))
const credentialStatusLabel = computed(() => {
    if (String(formData.appId || '').trim() && String(formData.appSecret || '').trim()) {
        return '已完整配置'
    }
    return '待补凭证'
})
const encryptionTypeLabel = computed(() => {
    if (Number(formData.encryptionType) === 1) return '明文模式'
    if (Number(formData.encryptionType) === 2) return '兼容模式'
    return '安全模式'
})

getDetail()
</script>

<style lang="scss" scoped>
.channel-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.channel-metrics {
    width: 100%;
}

.metric-card,
.channel-card {
    border-radius: 16px;
}

.metric-label {
    font-size: 12px;
    color: #86909c;
}

.metric-value {
    margin-top: 8px;
    font-size: 28px;
    font-weight: 700;
    color: #1d2129;
}

.metric-value--small {
    font-size: 20px;
}

.channel-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
    gap: 16px;
}

.channel-workspace__main,
.channel-workspace__aside {
    padding: 20px 22px;
    border-radius: 16px;
    background: #fff;
}

.channel-workspace__eyebrow {
    font-size: 12px;
    font-weight: 600;
    color: #4e5969;
}

.channel-workspace__title {
    margin-top: 10px;
    font-size: 22px;
    line-height: 1.4;
    font-weight: 700;
    color: #1d2129;
}

.channel-workspace__desc {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.7;
    color: #4e5969;
}

.channel-workspace__meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
}

.channel-workspace__meta-item,
.channel-workspace__checklist-item {
    padding: 14px 16px;
    border-radius: 14px;
    background: #f7f8fa;
}

.channel-workspace__meta-item span,
.channel-workspace__checklist-label {
    display: block;
    font-size: 12px;
    color: #86909c;
}

.channel-workspace__meta-item strong,
.channel-workspace__checklist-value {
    display: block;
    margin-top: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #1d2129;
}

.channel-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: #1d2129;
}

.channel-workspace__checklist {
    display: grid;
    gap: 12px;
    margin-top: 14px;
}

.channel-workspace__checklist-item.is-ready {
    background: #effff6;
}

.channel-workspace__checklist-item.is-warning {
    background: #fff7e8;
}

.channel-workspace__checklist-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: #4e5969;
}

.channel-config-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.8fr);
    gap: 16px;
    align-items: start;
}

.channel-config-main,
.channel-config-side {
    display: grid;
    gap: 16px;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1d2129;
}

.section-desc {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.7;
    color: #4e5969;
}

.section-form {
    margin-top: 20px;
    max-width: 760px;
}

.form-tips {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.6;
    color: #86909c;
}

.copy-field {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 12px;
}

.radio-stack {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
}

.domain-list,
.tips-list,
.audit-list {
    display: grid;
    gap: 12px;
    margin-top: 16px;
}

.domain-item,
.tips-item,
.audit-item {
    padding: 14px 16px;
    border-radius: 14px;
    background: #f7f8fa;
}

.domain-item__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
}

.domain-item__title {
    font-size: 14px;
    font-weight: 700;
    color: #1d2129;
}

.domain-item__desc,
.tips-item,
.audit-item span {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: #4e5969;
}

.audit-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.audit-item strong {
    font-size: 14px;
    font-weight: 700;
    color: #1d2129;
}

@media (max-width: 1200px) {
    .channel-workspace,
    .channel-config-layout {
        grid-template-columns: 1fr;
    }

    .channel-workspace__meta {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 768px) {
    .channel-workspace__meta {
        grid-template-columns: 1fr;
    }

    .domain-item__head,
    .audit-item,
    .copy-field {
        grid-template-columns: 1fr;
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
