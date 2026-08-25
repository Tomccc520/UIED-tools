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
        <a-page-header title="微信开放平台设置" subtitle="用于 APP 微信登录与微信支付能力配置，建议由技术同学统一维护。">
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>{{ providerStatusLabel }}</a-tag>
                    <a-button data-admin-smoke="channel-wx-dev-restore" @click="handleReset" :disabled="isLoading || isSaving">恢复最近配置</a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 3 }" :col-gap="12" :row-gap="12" class="channel-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">已配置字段</div>
                    <div class="metric-value">{{ configuredFieldCount }}</div>
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
                    <div class="metric-label">AppSecret</div>
                    <div class="metric-value metric-value--small">{{ appSecretLabel }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-space direction="vertical" fill :size="16">
            <a-card class="!border-none channel-card channel-card--notice" :bordered="false">
                <a-alert
                    type="warning"
                    title="填写微信开放平台开发配置前，请先在微信开放平台完成应用创建、认证与能力开通。"
                    :closable="false"
                    show-icon
                    banner
                />
            </a-card>
            <a-spin :loading="isLoading" tip="正在加载开放平台配置..." class="w-full">
                <div class="channel-config-layout">
                    <div class="channel-config-main">
                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">APP 应用配置</div>
                            <div class="section-desc">维护开放平台 AppID 与 AppSecret，供 APP 微信登录和支付链路使用。</div>
                            <a-form :model="formData" layout="vertical" class="section-form">
                                <a-form-item label="AppID" field="appId">
                                    <a-input v-model="formData.appId" placeholder="请输入 AppID" allow-clear />
                                </a-form-item>
                                <a-form-item label="AppSecret" field="appSecret">
                                    <a-input v-model="formData.appSecret" placeholder="请输入 AppSecret" allow-clear />
                                </a-form-item>
                            </a-form>
                        </a-card>
                    </div>

                    <div class="channel-config-side">
                        <a-card class="!border-none channel-card" :bordered="false">
                            <div class="section-title">配置提示</div>
                            <div class="tips-list">
                                <div class="tips-item">AppID 与 AppSecret 建议由技术同学从微信开放平台直接复制，避免手动输入出错。</div>
                                <div class="tips-item">保存前先确认应用类型是否支持当前登录或支付能力。</div>
                                <div class="tips-item">如需回滚，可使用“恢复最近配置”快速回到最近一次成功保存状态。</div>
                            </div>
                        </a-card>
                    </div>
                </div>
            </a-spin>
        </a-space>

        <footer-btns v-perms="['channel:wx:save']">
            <a-space>
                <a-button data-admin-smoke="channel-wx-dev-reset" @click="handleReset" :disabled="isLoading || isSaving">重置</a-button>
                <a-button data-admin-smoke="channel-wx-dev-save" type="primary" :loading="isSaving" @click="handelSave">保存</a-button>
            </a-space>
        </footer-btns>
    </div>
</template>
<script lang="ts" setup name="wxDevConfig">
import { getWxDevConfig, setWxDevConfig } from '@/api/channel/wx_dev'
import feedback from '@/utils/feedback'

const formData = reactive({
    appId: '',
    appSecret: ''
})
const detailSnapshot = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

/**
 * 函数说明：更新开放平台配置快照，供重置按钮回滚表单状态。
 */
const updateDetailSnapshot = () => {
    detailSnapshot.value = JSON.stringify(formData)
}

/**
 * 函数说明：获取微信开放平台配置并回填表单。
 */
const getDetail = async () => {
    isLoading.value = true
    try {
        const data = await getWxDevConfig()
        for (const key in formData) {
            //@ts-ignore
            formData[key] = data[key] ?? formData[key]
        }
        updateDetailSnapshot()
    } catch (error) {
        feedback.msgError('微信开放平台配置加载失败，请稍后重试')
    } finally {
        isLoading.value = false
    }
}

/**
 * 函数说明：保存微信开放平台配置。
 */
const handelSave = async () => {
    if (isSaving.value) {
        return
    }
    isSaving.value = true
    try {
        await setWxDevConfig(formData)
        updateDetailSnapshot()
        feedback.msgSuccess('微信开放平台配置保存成功')
    } finally {
        isSaving.value = false
    }
}

/**
 * 函数说明：恢复到最近一次成功加载或保存的开放平台配置。
 */
const handleReset = () => {
    if (!detailSnapshot.value) {
        return
    }
    try {
        const snapshot = JSON.parse(detailSnapshot.value) as Record<string, string>
        for (const key in formData) {
            //@ts-ignore
            formData[key] = snapshot[key] ?? formData[key]
        }
        feedback.msgSuccess('已恢复最近保存配置')
    } catch (error) {
        feedback.msgError('重置失败，请刷新页面后重试')
    }
}

const configuredFieldCount = computed(() => [formData.appId, formData.appSecret].filter((item) => String(item || '').trim()).length)
const appIdLabel = computed(() => String(formData.appId || '').trim() || '待配置')
const appSecretLabel = computed(() => (String(formData.appSecret || '').trim() ? '已填写' : '待配置'))
const providerStatusLabel = computed(() => (configuredFieldCount.value === 2 ? '配置完整' : '待补配置'))

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
    grid-template-columns: repeat(3, minmax(0, 1fr));
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
    max-width: 720px;
}

.tips-list {
    display: grid;
    gap: 10px;
    margin-top: 14px;
}

.tips-item {
    padding: 12px 14px;
    border-radius: 12px;
    background: #f7f8fa;
    font-size: 13px;
    line-height: 1.7;
    color: #4e5969;
}

@media (max-width: 1200px) {
    .channel-workspace,
    .channel-config-layout {
        grid-template-columns: 1fr;
    }

    .channel-workspace__meta {
        grid-template-columns: 1fr;
    }
}
</style>
