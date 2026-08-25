<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-23
 */
-->
<template>
    <div class="website-protocol-page pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 协议管理">
            <template #subtitle>
                统一维护服务协议与隐私协议，支持富文本编辑并在保存后实时生效。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag color="arcoblue" bordered>运营配置</a-tag>
                        <a-tag color="green" bordered>实时生效</a-tag>
                        <a-tag :color="hasUnsavedChanges ? 'orange' : 'green'" bordered>
                            {{ hasUnsavedChanges ? '待发布' : '已同步' }}
                        </a-tag>
                    </div>
                    <a-button size="small" @click="getProtocolDetail">刷新配置</a-button>
                    <a-button size="small" @click="openToolsPreview">前端预览</a-button>
                    <a-button size="small" @click="runHealthCheck">一键体检</a-button>
                </div>
            </template>
        </a-page-header>

        <a-card class="page-card pro-panel-card" :bordered="false">


            <operate-collapse
                v-model="operationCollapseKeys"
                :validation-tips="protocolValidationTips"
                :guide-items="guideItems"
                :last-saved-at="lastSavedAt"
                :show-quick-actions="false"
            />

            <div class="mode-toolbar mt-4">
                <div class="mode-toolbar__left">
                    <a-switch v-model="simpleMode" type="round" />
                    <span class="mode-toolbar__label">{{
                        simpleMode ? '运营简版（推荐）' : '高级模式'
                    }}</span>
                </div>
                <span class="mode-toolbar__tip">
                    {{
                        simpleMode
                            ? '简版聚焦协议正文维护；统计卡片已收进高级模式。'
                            : '高级模式会展示统计卡片，便于内容运营做发布前检查。'
                    }}
                </span>
            </div>

            <div v-if="!simpleMode" class="stats-grid mt-4">
                <div class="stat-card">
                    <div class="stat-label">服务协议状态</div>
                    <div class="stat-value">{{ serviceReady ? '已配置' : '待完善' }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">隐私协议状态</div>
                    <div class="stat-value">{{ privacyReady ? '已配置' : '待完善' }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">发布状态</div>
                    <div class="stat-value" :class="{ 'is-warning': hasUnsavedChanges }">
                        {{ hasUnsavedChanges ? '待发布' : '已同步' }}
                    </div>
                </div>
            </div>

            <div class="protocol-grid mt-5">
                <div class="layout-group">
                    <div class="group-head">
                        <span>服务协议</span>
                        <a-tag color="arcoblue" bordered>{{ serviceContentLength }} 字</a-tag>
                    </div>
                    <a-form :model="formData" layout="vertical">
                        <a-form-item label="协议名称">
                            <a-input
                                v-model="formData.service.name"
                                placeholder="请输入服务协议标题"
                            />
                        </a-form-item>
                    </a-form>
                    <editor v-model="formData.service.content" height="420" />
                </div>

                <div class="layout-group">
                    <div class="group-head">
                        <span>隐私协议</span>
                        <a-tag color="arcoblue" bordered>{{ privacyContentLength }} 字</a-tag>
                    </div>
                    <a-form :model="formData" layout="vertical">
                        <a-form-item label="协议名称">
                            <a-input
                                v-model="formData.privacy.name"
                                placeholder="请输入隐私协议标题"
                            />
                        </a-form-item>
                    </a-form>
                    <editor v-model="formData.privacy.content" height="420" />
                </div>
            </div>
        </a-card>

        <footer-btns :fixed="false" v-perms="['setting:protocol:save']">
            <a-button type="primary" :loading="isSubmitting" @click="handleSave">保存</a-button>
        </footer-btns>
    </div>
</template>

<script setup lang="ts" name="webProtocol">
import { getProtocol, setProtocol } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave } from 'vue-router'
import OperateCollapse from './components/operate-collapse.vue'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { useOperateSubmit } from './composables/use-operate-submit'

interface ProtocolDetail {
    name: string
    content: string
}

interface ProtocolFormData {
    service: ProtocolDetail
    privacy: ProtocolDetail
}

interface FocusItem {
    label: string
    value: string
    desc: string
    className: 'is-ok' | 'is-warning' | 'is-danger'
}

const { isSubmitting, lastSavedAt, runSubmit } = useOperateSubmit('协议配置已保存')
const appStore = useAppStore()
/**
 * 函数说明：控制协议页运营模式。简版聚焦正文编辑，高级模式展示发布统计卡片。
 */
const simpleMode = ref(true)
const operationCollapseKeys = ref<(string | number)[]>([
    'quick_actions',
    'validation_tips',
    'operation_guide'
])
const baselineSnapshot = ref('')
const guideItems = [
    '先填写服务协议、隐私协议标题，再补齐正文内容。',
    '正文建议包含生效时间、责任边界、联系方式等关键信息。',
    '保存后到前端协议页检查排版和跳转链接。'
]

const formData = ref<ProtocolFormData>({
    privacy: {
        content: '',
        name: ''
    },
    service: {
        content: '',
        name: ''
    }
})

/**
 * 函数说明：移除富文本标签并统计纯文本长度，用于协议内容字数展示。
 */
const getPlainTextLength = (html: string): number =>
    String(html || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim().length

/**
 * 函数说明：构建协议表单快照，供未保存变更判断和离开提醒使用。
 */
const buildSnapshot = (): string =>
    JSON.stringify({
        serviceName: String(formData.value.service.name || '').trim(),
        serviceContent: String(formData.value.service.content || '').trim(),
        privacyName: String(formData.value.privacy.name || '').trim(),
        privacyContent: String(formData.value.privacy.content || '').trim()
    })

/**
 * 函数说明：更新当前页面基线快照，作为后续“是否已修改”的对照值。
 */
const updateBaselineSnapshot = () => {
    baselineSnapshot.value = buildSnapshot()
}

/**
 * 函数说明：返回协议页未保存状态，供顶部状态和离开拦截复用。
 */
const hasUnsavedChanges = computed(() => {
    if (!baselineSnapshot.value) {
        return false
    }
    return buildSnapshot() !== baselineSnapshot.value
})

const serviceContentLength = computed(() => getPlainTextLength(formData.value.service.content))
const privacyContentLength = computed(() => getPlainTextLength(formData.value.privacy.content))
const serviceReady = computed(
    () =>
        Boolean(String(formData.value.service.name || '').trim()) && serviceContentLength.value > 0
)
const privacyReady = computed(
    () =>
        Boolean(String(formData.value.privacy.name || '').trim()) && privacyContentLength.value > 0
)/**
 * 函数说明：收集协议配置校验提示，统一供工作区和保存流程复用。
 */
const protocolValidationTips = computed(() => {
    const tips: string[] = []
    if (!String(formData.value.service.name || '').trim()) {
        tips.push('请填写服务协议名称。')
    }
    if (serviceContentLength.value === 0) {
        tips.push('请填写服务协议正文内容。')
    }
    if (!String(formData.value.privacy.name || '').trim()) {
        tips.push('请填写隐私协议名称。')
    }
    if (privacyContentLength.value === 0) {
        tips.push('请填写隐私协议正文内容。')
    }
    return tips
})

/**
 * 函数说明：读取服务协议与隐私协议详情并回填编辑器。
 */
const getProtocolDetail = async () => {
    const data = await getProtocol()
    formData.value = {
        privacy: {
            name: String(data?.privacy?.name || ''),
            content: String(data?.privacy?.content || '')
        },
        service: {
            name: String(data?.service?.name || ''),
            content: String(data?.service?.content || '')
        }
    }
    updateBaselineSnapshot()
}

/**
 * 函数说明：执行协议配置体检并输出统一反馈。
 */
const runHealthCheck = () => {
    if (protocolValidationTips.value.length > 0) {
        feedback.alertWarning(`配置体检未通过：${protocolValidationTips.value[0]}`)
        return
    }
    feedback.msgSuccess('配置体检通过：服务协议与隐私协议结构完整')
}

/**
 * 函数说明：打开前端首页预览，便于运营保存后快速回归协议入口。
 */
const openToolsPreview = () => {
    window.open(resolveToolsPreviewUrl(appStore.config), '_blank')
}

/**
 * 函数说明：保存当前协议配置并刷新页面数据。
 */
const handleSave = async () => {
    if (protocolValidationTips.value.length > 0) {
        feedback.msgError(protocolValidationTips.value[0])
        return
    }
    const success = await runSubmit(async () => {
        await setProtocol(formData.value)
        await getProtocolDetail()
    })
    if (!success) {
        return
    }
    updateBaselineSnapshot()
}

/**
 * 函数说明：浏览器刷新或关闭前提示未保存变更，减少误操作导致的数据丢失。
 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges.value) {
        return
    }
    event.preventDefault()
    event.returnValue = ''
}

/**
 * 函数说明：路由切换前提醒运营确认离开，防止未保存内容被意外丢弃。
 */
onBeforeRouteLeave(async () => {
    if (!hasUnsavedChanges.value) {
        return true
    }
    try {
        await feedback.confirm('当前页面存在未保存变更，确定离开吗？')
        return true
    } catch {
        return false
    }
})

onMounted(() => {
    void getProtocolDetail()
    window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped lang="scss">
.layout-page-actions,
.layout-status-tags,
.page-entry-card__actions,
.ops-workspace__actions {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.page-entry-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.page-entry-card {
    padding: 18px 20px;
    border: 1px solid var(--color-border-2);
    border-radius: 14px;
    background: linear-gradient(180deg, #fff, var(--color-fill-1));
}

.page-entry-card__title {
    margin-bottom: 10px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-1);
}

.page-entry-card__desc {
    margin-bottom: 14px;
    font-size: 13px;
    line-height: 1.75;
    color: var(--color-text-3);
}

.page-entry-list {
    margin: 0;
    padding-left: 18px;
    font-size: 13px;
    line-height: 1.9;
    color: var(--color-text-2);
}

.stat-card {
    padding: 16px 18px;
    border-radius: 14px;
    border: 1px solid var(--color-border-2);
    background: #fff;
}

.stat-label {
    font-size: 12px;
    color: var(--color-text-3);
}

.stat-value {
    margin-top: 10px;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 700;
    color: var(--color-text-1);
}

.stat-value.is-warning {
    color: rgb(var(--orange-6));
}

.ops-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.9fr);
    gap: 12px;
}

.ops-workspace__main,
.ops-workspace__aside {
    border: 1px solid var(--color-border-2);
    border-radius: 14px;
    background: #fff;
    padding: 16px;
}

.ops-workspace__eyebrow {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 9px;
    border-radius: 999px;
    border: 1px solid #d8d2ff;
    background: #f3efff;
    color: #5b47d6;
    font-size: 12px;
    font-weight: 700;
}

.ops-workspace__title {
    margin-top: 10px;
    font-size: 20px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--color-text-1);
}

.ops-workspace__desc {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.65;
    color: var(--color-text-3);
}

.ops-workspace__meta {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.ops-workspace__meta-item {
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
}

.ops-workspace__meta-item span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3);
}

.ops-workspace__meta-item strong {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-1);
}

.ops-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1);
}

.ops-workspace__checklist {
    margin-top: 10px;
    display: grid;
    gap: 8px;
}

.ops-workspace__checklist-item {
    border: 1px solid var(--color-border-2);
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
    padding: 10px 12px;
}

.ops-workspace__checklist-item.is-ok {
    border-color: #d7ebde;
    background: #f7fcf8;
}

.ops-workspace__checklist-item.is-warning {
    border-color: #f0dfb0;
    background: #fffaf0;
}

.ops-workspace__checklist-item.is-danger {
    border-color: #f0c8c8;
    background: #fff7f7;
}

.ops-workspace__checklist-label {
    font-size: 12px;
    color: var(--color-text-3);
}

.ops-workspace__checklist-value {
    margin-top: 4px;
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1);
}

.ops-workspace__checklist-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--color-text-3);
}

.ops-workspace__actions {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.mode-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 10px 12px;
    border: 1px dashed var(--color-border-2, #e5e6eb);
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
}

.mode-toolbar__left {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.mode-toolbar__label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1, #1d2129);
}

.mode-toolbar__tip {
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-3, #86909c);
}

.mode-alert {
    margin-bottom: 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
}

.protocol-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
}

.layout-group {
    border: 1px solid var(--color-border-2);
    border-radius: 14px;
    padding: 16px;
    background: #fff;
}

.group-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1);
}

@media (max-width: 1200px) {
    .protocol-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 920px) {
    .page-entry-grid,
    .stats-grid,
    .ops-workspace,
    .ops-workspace__meta {
        grid-template-columns: 1fr;
    }
}
</style>
