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
        <a-page-header title="H5 渠道设置" subtitle="控制 H5 渠道开关、关闭后跳转策略与当前访问入口。">
            <template #extra>
                <a-space>
                    <a-tag :color="Number(formData.status) === 1 ? 'green' : 'red'" bordered>
                        {{ Number(formData.status) === 1 ? '渠道开启' : '渠道关闭' }}
                    </a-tag>
                    <a-button data-admin-smoke="channel-h5-restore" @click="handleReset" :disabled="isLoading || isSaving">恢复最近配置</a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 3 }" :col-gap="12" :row-gap="12" class="channel-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">渠道状态</div>
                    <div class="metric-value">{{ Number(formData.status) === 1 ? '开启' : '关闭' }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">关闭后访问</div>
                    <div class="metric-value">{{ Number(formData.close) === 1 ? '自定义链接' : '空页面' }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">当前入口</div>
                    <div class="metric-value metric-value--small">{{ accessLinkLabel }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-spin :loading="isLoading" tip="正在加载 H5 渠道配置..." class="w-full">
            <div class="channel-config-layout">
                <div class="channel-config-main">
                    <a-card class="!border-none channel-card" :bordered="false">
                        <div class="section-title">H5 访问策略</div>
                        <div class="section-desc">管理 H5 渠道开关，以及关闭后的默认访问行为。</div>
                        <a-form :model="formData" layout="vertical" class="section-form">
                            <a-form-item label="渠道状态" required field="status">
                                <div>
                                    <a-radio-group v-model="formData.status">
                                        <a-radio :value="1">开启</a-radio>
                                        <a-radio :value="0">关闭</a-radio>
                                    </a-radio-group>
                                    <div class="form-tips">关闭后将不再对外提供 H5 服务，请谨慎操作。</div>
                                </div>
                            </a-form-item>
                            <a-form-item label="关闭后访问页面" field="close">
                                <a-radio-group v-model="formData.close">
                                    <a-radio :value="0">空页面</a-radio>
                                    <a-radio :value="1">自定义链接</a-radio>
                                </a-radio-group>
                            </a-form-item>
                            <a-form-item v-if="formData.close == 1" label="自定义链接" field="url">
                                <a-input v-model="formData.url" placeholder="请输入完整的 URL" allow-clear />
                            </a-form-item>
                        </a-form>
                    </a-card>
                </div>

                <div class="channel-config-side">
                    <a-card class="!border-none channel-card" :bordered="false">
                        <div class="section-title">配置说明</div>
                        <div class="tips-list">
                            <div class="tips-item">H5 渠道关闭后，可选择直接空页面或跳转到外部链接。</div>
                            <div class="tips-item">如使用自定义链接，必须填写完整的 <code>http://</code> 或 <code>https://</code> 地址。</div>
                            <div class="tips-item">建议保存前先确认当前 H5 入口和落地页是否一致。</div>
                        </div>
                    </a-card>
                    <a-card class="!border-none channel-card" :bordered="false">
                        <div class="section-title">当前入口</div>
                        <div class="side-value">{{ accessLinkLabel }}</div>
                        <div class="section-desc">供运营核对当前 H5 渠道实际入口地址。</div>
                    </a-card>
                </div>
            </div>
        </a-spin>

        <footer-btns v-perms="['channel:h5:save']">
            <a-space>
                <a-button data-admin-smoke="channel-h5-reset" @click="handleReset" :disabled="isLoading || isSaving">重置</a-button>
                <a-button data-admin-smoke="channel-h5-save" type="primary" :loading="isSaving" @click="handelSave">保存</a-button>
            </a-space>
        </footer-btns>
    </div>
</template>
<script lang="ts" setup name="h5Config">
import { getH5Config, setH5Config } from '@/api/channel/h5'
import feedback from '@/utils/feedback'

const formData = reactive({
    status: 0,
    close: 0,
    url: '',
    accessLink: ''
})
const detailSnapshot = ref('')
const isLoading = ref(false)
const isSaving = ref(false)

/**
 * 函数说明：更新 H5 渠道配置快照，供重置回滚操作使用。
 */
const updateDetailSnapshot = () => {
    detailSnapshot.value = JSON.stringify(formData)
}

/**
 * 函数说明：获取 H5 渠道配置并回填表单。
 */
const getDetail = async () => {
    isLoading.value = true
    try {
        const data = await getH5Config()
        for (const key in formData) {
            //@ts-ignore
            formData[key] = data[key] ?? formData[key]
        }
        updateDetailSnapshot()
    } catch (error) {
        feedback.msgError('H5 渠道配置加载失败，请稍后重试')
    } finally {
        isLoading.value = false
    }
}

/**
 * 函数说明：保存 H5 渠道配置。
 */
const handelSave = async () => {
    if (isSaving.value) {
        return
    }
    if (formData.close === 1) {
        const customUrl = String(formData.url || '').trim()
        if (!customUrl) {
            feedback.msgError('关闭后访问页面为“自定义链接”时，链接不能为空')
            return
        }
        if (!/^https?:\/\//i.test(customUrl)) {
            feedback.msgError('自定义链接需以 http:// 或 https:// 开头')
            return
        }
    }

    isSaving.value = true
    try {
        await setH5Config(formData)
        updateDetailSnapshot()
        feedback.msgSuccess('H5 渠道配置保存成功')
    } finally {
        isSaving.value = false
    }
}

/**
 * 函数说明：重置 H5 配置到最近一次成功加载/保存状态。
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
        feedback.msgSuccess('已恢复最近保存配置')
    } catch (error) {
        feedback.msgError('重置失败，请刷新页面后重试')
    }
}

const accessLinkLabel = computed(() => String(formData.accessLink || '').trim() || '未返回入口地址')
const customUrlStatus = computed(() => {
    if (Number(formData.close) !== 1) return '未启用'
    return String(formData.url || '').trim() || '待填写'
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

.side-value {
    margin-top: 12px;
    font-size: 18px;
    font-weight: 700;
    color: #1d2129;
    word-break: break-all;
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
