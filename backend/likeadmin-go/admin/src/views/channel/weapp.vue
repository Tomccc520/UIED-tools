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
        <a-page-header title="微信小程序渠道设置" subtitle="统一维护小程序基础信息、开发者凭证与服务器域名，便于运营和技术协同使用。">
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>{{ configuredFieldCount }}/{{ totalFieldCount }} 已配置</a-tag>
                    <a-button data-admin-smoke="channel-weapp-restore" @click="handleReset" :disabled="isLoading || isSaving">恢复最近配置</a-button>
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
                    <div class="metric-label">域名字段</div>
                    <div class="metric-value">{{ configuredDomainCount }}/{{ serverDomainFields.length + 1 }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">AppID</div>
                    <div class="metric-value metric-value--small">{{ appIdLabel }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">业务域名</div>
                    <div class="metric-value metric-value--small">{{ businessDomainLabel }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-space direction="vertical" fill :size="16">
            <a-card class="!border-none channel-card channel-card--notice" :bordered="false">
                <a-alert
                    type="warning"
                    title="填写微信小程序开发配置前，请先在微信公众平台申请小程序并完成认证。"
                    :closable="false"
                    show-icon
                    banner
                />
            </a-card>

            <a-spin :loading="isLoading" tip="正在加载小程序配置..." class="w-full">
                <div class="channel-config-layout">
                    <div class="channel-config-main">
                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">基础信息</div>
                            <div class="section-desc">维护小程序名称、原始 ID 和小程序码，便于运营识别渠道来源。</div>
                            <a-form :model="formData" layout="vertical" class="section-form">
                                <a-form-item label="小程序名称" field="name">
                                    <a-input v-model="formData.name" placeholder="请输入小程序名称" allow-clear />
                                </a-form-item>
                                <a-form-item label="原始ID" field="primaryId">
                                    <a-input v-model="formData.primaryId" placeholder="请输入原始ID" allow-clear />
                                </a-form-item>
                                <a-form-item label="小程序码" field="qrCode">
                                    <div>
                                        <material-picker v-model="formData.qrCode" :limit="1" />
                                        <div class="form-tips">建议尺寸：宽400px*高400px，支持 jpg、jpeg、png 格式。</div>
                                    </div>
                                </a-form-item>
                            </a-form>
                        </a-card>

                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">开发者凭证</div>
                            <div class="section-desc">保存 AppID 与 AppSecret，供登录、支付或服务端调用链路复用。</div>
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
                            <div class="section-title">服务器域名</div>
                            <div class="section-desc">这些域名通常需要同步到微信公众平台，保存后可直接复制给技术同学使用。</div>
                            <div class="domain-list">
                                <div v-for="item in serverDomainFields" :key="item.key" class="domain-item">
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

                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">业务域名</div>
                            <div class="section-desc">用于小程序业务域名校验，建议和前台实际访问域名保持一致。</div>
                            <div class="domain-item">
                                <div class="domain-item__head">
                                    <div>
                                        <div class="domain-item__title">业务域名</div>
                                        <div class="domain-item__desc">登录微信公众平台，进入“开发 > 开发设置 > 业务域名”填写。</div>
                                    </div>
                                    <a-button v-copy="formData.businessDomain" :disabled="!formData.businessDomain">复制</a-button>
                                </div>
                                <a-input :model-value="formData.businessDomain" disabled />
                            </div>
                        </a-card>
                    </div>

                    <div class="channel-config-side">
                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">配置提示</div>
                            <div class="tips-list">
                                <div class="tips-item">基础信息主要给运营识别渠道，小程序名称和二维码建议与公众号后台保持一致。</div>
                                <div class="tips-item">AppID 与 AppSecret 建议由技术同学直接复制，不建议人工转述。</div>
                                <div class="tips-item">服务器域名保存后建议立即复制到微信公众平台，避免环境不一致。</div>
                            </div>
                        </a-card>
                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">核对结果</div>
                            <div class="audit-list">
                                <div class="audit-item">
                                    <span>小程序码</span>
                                    <strong>{{ qrCodeLabel }}</strong>
                                </div>
                                <div class="audit-item">
                                    <span>开发者凭证</span>
                                    <strong>{{ credentialStatusLabel }}</strong>
                                </div>
                                <div class="audit-item">
                                    <span>业务域名</span>
                                    <strong>{{ businessDomainLabel }}</strong>
                                </div>
                            </div>
                        </a-card>
                    </div>
                </div>
            </a-spin>
        </a-space>

        <footer-btns v-perms="['channel:mp:save']">
            <a-space>
                <a-button data-admin-smoke="channel-weapp-reset" @click="handleReset" :disabled="isLoading || isSaving">重置</a-button>
                <a-button data-admin-smoke="channel-weapp-save" type="primary" :loading="isSaving" @click="handelSave">保存</a-button>
            </a-space>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="weappConfig">
import { getWeappConfig, setWeappConfig } from '@/api/channel/weapp'
import feedback from '@/utils/feedback'

type WeappFormData = {
    name: string
    primaryId: string
    qrCode: string
    appId: string
    appSecret: string
    businessDomain: string
    downloadFileDomain: string
    requestDomain: string
    socketDomain: string
    tcpDomain: string
    udpDomain: string
    uploadFileDomain: string
}

const formData = reactive<WeappFormData>({
    name: '',
    primaryId: '',
    qrCode: '',
    appId: '',
    appSecret: '',
    businessDomain: '',
    downloadFileDomain: '',
    requestDomain: '',
    socketDomain: '',
    tcpDomain: '',
    udpDomain: '',
    uploadFileDomain: ''
})
const detailSnapshot = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

const serverDomainFields = [
    {
        key: 'requestDomain' as const,
        label: 'request 合法域名',
        tips: '微信公众平台 > 开发 > 开发设置 > 服务器域名，填写 https 协议域名。'
    },
    {
        key: 'socketDomain' as const,
        label: 'socket 合法域名',
        tips: '微信公众平台 > 开发 > 开发设置 > 服务器域名，填写 wss 协议域名。'
    },
    {
        key: 'uploadFileDomain' as const,
        label: 'uploadFile 合法域名',
        tips: '用于上传文件请求，通常与 request 域名保持一致。'
    },
    {
        key: 'downloadFileDomain' as const,
        label: 'downloadFile 合法域名',
        tips: '用于文件下载请求，通常与 request 域名保持一致。'
    },
    {
        key: 'udpDomain' as const,
        label: 'udp 合法域名',
        tips: '如业务未使用 UDP，可保留为空；如使用需与实际服务端口一致。'
    }
]
const totalFieldCount = 8

/**
 * 函数说明：更新小程序配置快照，供重置时恢复表单数据。
 */
const updateDetailSnapshot = () => {
    detailSnapshot.value = JSON.stringify(formData)
}

/**
 * 函数说明：获取微信小程序配置并回填表单。
 */
const getDetail = async () => {
    isLoading.value = true
    try {
        const data = await getWeappConfig()
        for (const key in formData) {
            // @ts-ignore
            formData[key] = data[key] ?? formData[key]
        }
        updateDetailSnapshot()
    } catch (error) {
        feedback.msgError('微信小程序配置加载失败，请稍后重试')
    } finally {
        isLoading.value = false
    }
}

/**
 * 函数说明：保存微信小程序配置。
 */
const handelSave = async () => {
    if (isSaving.value) {
        return
    }
    isSaving.value = true
    try {
        await setWeappConfig(formData)
        updateDetailSnapshot()
        feedback.msgSuccess('微信小程序配置保存成功')
    } finally {
        isSaving.value = false
    }
}

/**
 * 函数说明：重置小程序配置为最近一次成功加载/保存的状态。
 */
const handleReset = () => {
    if (!detailSnapshot.value) {
        return
    }
    try {
        const snapshot = JSON.parse(detailSnapshot.value) as Record<string, any>
        for (const key in formData) {
            // @ts-ignore
            formData[key] = snapshot[key] ?? formData[key]
        }
        feedback.msgSuccess('已恢复最近保存配置')
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
        formData.businessDomain,
        formData.requestDomain,
        formData.socketDomain
    ]
    return fields.filter((item) => String(item || '').trim()).length
})
const configuredDomainCount = computed(() => {
    const fields = [formData.businessDomain, ...serverDomainFields.map((item) => formData[item.key])]
    return fields.filter((item) => String(item || '').trim()).length
})
const miniProgramNameLabel = computed(() => String(formData.name || '').trim() || '待配置')
const appIdLabel = computed(() => String(formData.appId || '').trim() || '待配置')
const businessDomainLabel = computed(() => String(formData.businessDomain || '').trim() || '待配置')
const qrCodeLabel = computed(() => (String(formData.qrCode || '').trim() ? '已上传' : '待上传'))
const credentialStatusLabel = computed(() => {
    if (String(formData.appId || '').trim() && String(formData.appSecret || '').trim()) {
        return '已完整配置'
    }
    return '待补凭证'
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
    .audit-item {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
