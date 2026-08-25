<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
 */
-->
<template>
    <div class="website-tool-ranking-config pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 榜单配置">
            <template #subtitle>
                统一配置工具热榜的独立页展示与右侧栏入口，保存后前台会直接读取这套配置。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag color="arcoblue" bordered>运营配置</a-tag>
                        <a-tag color="green" bordered>前台直读</a-tag>
                        <a-tag :color="formData.enabled === 1 ? 'green' : 'gray'" bordered>
                            {{ formData.enabled === 1 ? '已启用' : '已关闭' }}
                        </a-tag>
                        <a-tag :color="hasUnsavedChanges ? 'orange' : 'green'" bordered>
                            {{ hasUnsavedChanges ? '待发布' : '已同步' }}
                        </a-tag>
                    </div>
                    <a-button size="small" @click="loadData">重新加载</a-button>
                    <a-button size="small" @click="openHotRankingPreview">前端预览</a-button>
                    <a-button size="small" type="outline" @click="goManagePage">查看热榜数据</a-button>
                </div>
            </template>
        </a-page-header>

        <a-card class="page-card pro-panel-card" :bordered="false">


            <operate-collapse
                v-model="operationCollapseKeys"
                :validation-tips="validationTips"
                :guide-items="guideItems"
                :last-saved-at="lastSavedAt"
                :show-quick-actions="false"
            />

            <div class="layout-group mt-5">
                <div class="group-head">
                    <span>全局开关与独立页</span>
                    <div class="group-actions">
                        <a-button type="text" @click="restoreDefaultConfig">恢复默认</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">
                    独立页是完整榜单页，建议默认开启。关闭后右侧栏即使保留入口，也会失去完整承接页面。
                </div>

                <a-form :model="formData" layout="vertical" class="compact-form">
                    <a-row :gutter="16">
                        <a-col :xs="24" :lg="8">
                            <a-form-item label="启用工具热榜">
                                <a-switch
                                    v-model="formData.enabled"
                                    :checked-value="1"
                                    :unchecked-value="0"
                                    checked-text="开启"
                                    unchecked-text="关闭"
                                />
                            </a-form-item>
                        </a-col>
                        <a-col :xs="24" :lg="8">
                            <a-form-item label="默认周期">
                                <a-select v-model="formData.defaultPeriod" :options="periodOptions" />
                            </a-form-item>
                        </a-col>
                        <a-col :xs="24" :lg="8">
                            <a-form-item label="默认展示数量">
                                <a-input-number
                                    v-model="formData.pageLimit"
                                    :min="1"
                                    :max="20"
                                    mode="button"
                                />
                            </a-form-item>
                        </a-col>
                        <a-col :xs="24">
                            <a-form-item label="独立页标题">
                                <a-input
                                    v-model="formData.pageTitle"
                                    maxlength="120"
                                    show-word-limit
                                    placeholder="如：站内工具使用排行榜"
                                />
                            </a-form-item>
                        </a-col>
                        <a-col :xs="24">
                            <a-form-item label="独立页说明">
                                <a-textarea
                                    v-model="formData.pageDescription"
                                    :auto-size="{ minRows: 3, maxRows: 5 }"
                                    maxlength="255"
                                    show-word-limit
                                    placeholder="说明热榜的统计口径、入口作用和前台展示位置"
                                />
                            </a-form-item>
                        </a-col>
                    </a-row>
                </a-form>
            </div>

            <div class="layout-group mt-5">
                <div class="group-head">
                    <span>右侧栏热榜模块</span>
                </div>
                <div class="form-tips mb-2">
                    用于工具页右侧栏的紧凑热榜模块。建议保持标题短、数量少，突出最近点击量即可。
                </div>

                <a-form :model="formData" layout="vertical" class="compact-form">
                    <a-row :gutter="16">
                        <a-col :xs="24" :lg="8">
                            <a-form-item label="右侧栏展示">
                                <a-switch
                                    v-model="formData.showOnSidebar"
                                    :checked-value="1"
                                    :unchecked-value="0"
                                    checked-text="展示"
                                    unchecked-text="隐藏"
                                />
                            </a-form-item>
                        </a-col>
                        <a-col :xs="24" :lg="8">
                            <a-form-item label="右侧栏周期">
                                <a-select v-model="formData.sidebarPeriod" :options="periodOptions" />
                            </a-form-item>
                        </a-col>
                        <a-col :xs="24" :lg="8">
                            <a-form-item label="右侧栏标题">
                                <a-input
                                    v-model="formData.sidebarTitle"
                                    maxlength="120"
                                    show-word-limit
                                    placeholder="如：本周热榜"
                                />
                            </a-form-item>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
        </a-card>

        <footer-btns :fixed="false" v-perms="['setting:tool-ranking:config:save']">
            <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="toolRankingConfig">
import { computed, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import {
    getToolRankingConfigDetail,
    saveToolRankingConfigDetail,
    type ToolRankingConfigDetail,
    type ToolRankingPeriod
} from '@/api/setting/tool_ranking'
import OperateCollapse from './components/operate-collapse.vue'
import { useOperateSubmit } from './composables/use-operate-submit'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'

interface FocusItem {
    label: string
    value: string
    desc: string
    className: 'is-ok' | 'is-warning' | 'is-danger'
}

const router = useRouter()
const appStore = useAppStore()
const { isSubmitting, lastSavedAt, runSubmit } = useOperateSubmit('工具热榜配置已保存')
const operationCollapseKeys = ref<(string | number)[]>(['validation_tips', 'operation_guide'])
const baselineSnapshot = ref('')
const guideItems = [
    '先确认是否开启工具热榜，再决定右侧栏是否展示。',
    '右侧栏建议保留精简标题与短榜单，避免喧宾夺主。',
    '保存后到工具页右栏和独立热榜页各回归一次实际展示。'
]
const periodOptions = [
    { label: '日榜', value: 'day' },
    { label: '周榜', value: 'week' },
    { label: '月榜', value: 'month' },
    { label: '总榜', value: 'all' }
]
const defaultFormData = (): ToolRankingConfigDetail => ({
    enabled: 1,
    pageTitle: '站内工具使用排行榜',
    pageDescription:
        '这是工具热榜的独立页面，按站内真实访问、开始处理与下载行为聚合，帮助运营快速判断哪些工具最受欢迎。',
    defaultPeriod: 'week',
    pageLimit: 12,
    showOnSidebar: 1,
    sidebarTitle: '本周热榜',
    sidebarPeriod: 'week'
})
const formData = reactive<ToolRankingConfigDetail>(defaultFormData())

/**
 * 函数说明：构建榜单配置快照，供未保存状态判断与离开提醒使用。
 */
const buildSnapshot = (): string =>
    JSON.stringify({
        enabled: Number(formData.enabled || 0),
        pageTitle: String(formData.pageTitle || '').trim(),
        pageDescription: String(formData.pageDescription || '').trim(),
        defaultPeriod: String(formData.defaultPeriod || 'week').trim(),
        pageLimit: Number(formData.pageLimit || 12),
        showOnSidebar: Number(formData.showOnSidebar || 0),
        sidebarTitle: String(formData.sidebarTitle || '').trim(),
        sidebarPeriod: String(formData.sidebarPeriod || 'week').trim()
    })

/**
 * 函数说明：更新榜单配置页面基线快照，供未保存状态比较使用。
 */
const updateBaselineSnapshot = () => {
    baselineSnapshot.value = buildSnapshot()
}

/**
 * 函数说明：收集榜单配置校验提示，统一输出给运营折叠工作区。
 */
const collectValidationTips = (): string[] => {
    const tips: string[] = []
    if (formData.enabled === 1 && !String(formData.pageTitle || '').trim()) {
        tips.push('独立页已开启，请填写热榜页标题。')
    }
    if (formData.enabled === 1 && !String(formData.pageDescription || '').trim()) {
        tips.push('独立页已开启，请填写热榜页说明。')
    }
    if (formData.enabled === 1 && Number(formData.pageLimit || 0) <= 0) {
        tips.push('独立页默认展示数量至少为 1。')
    }
    if (formData.showOnSidebar === 1 && !String(formData.sidebarTitle || '').trim()) {
        tips.push('右侧栏热榜已开启，请填写右侧栏模块标题。')
    }
    if (formData.enabled === 0 && formData.showOnSidebar === 1) {
        tips.push('全局热榜已关闭，建议同步关闭右侧栏入口，避免前台出现空承接。')
    }
    return tips
}

const validationTips = computed(() => collectValidationTips())

/**
 * 函数说明：输出榜单配置页当前未保存状态，用于顶部状态标签与离开提醒。
 */
const hasUnsavedChanges = computed(() => {
    if (!baselineSnapshot.value) {
        return false
    }
    return baselineSnapshot.value !== buildSnapshot()
})

/**
 * 函数说明：转换榜单周期文案，统一在工作区和表单说明中复用。
 */
const resolvePeriodLabel = (period: ToolRankingPeriod): string =>
    periodOptions.find((item) => item.value === period)?.label || '周榜'

/**
 * 函数说明：将接口返回配置写入页面表单，避免直接替换响应式对象。
 */
const patchFormData = (payload: Partial<ToolRankingConfigDetail>) => {
    const nextData = {
        ...defaultFormData(),
        ...(payload || {})
    }
    formData.enabled = Number(nextData.enabled || 0) === 1 ? 1 : 0
    formData.pageTitle = String(nextData.pageTitle || '').trim()
    formData.pageDescription = String(nextData.pageDescription || '').trim()
    formData.defaultPeriod = (String(nextData.defaultPeriod || 'week').trim() || 'week') as ToolRankingPeriod
    formData.pageLimit = Math.min(20, Math.max(1, Number(nextData.pageLimit || 12) || 12))
    formData.showOnSidebar = Number(nextData.showOnSidebar || 0) === 1 ? 1 : 0
    formData.sidebarTitle = String(nextData.sidebarTitle || '').trim()
    formData.sidebarPeriod = (String(nextData.sidebarPeriod || 'week').trim() || 'week') as ToolRankingPeriod
}

/**
 * 函数说明：读取榜单配置详情并同步刷新页面基线快照。
 */
const loadData = async () => {
    try {
        const detail = await getToolRankingConfigDetail()
        patchFormData(detail)
        updateBaselineSnapshot()
    } catch (error) {
        feedback.msgError('读取工具热榜配置失败')
    }
}

/**
 * 函数说明：恢复默认榜单配置，用于快速回到推荐的前台展示口径。
 */
const restoreDefaultConfig = () => {
    patchFormData(defaultFormData())
}

/**
 * 函数说明：打开独立热榜页预览，方便后台保存前后对比前台展示效果。
 */
const openHotRankingPreview = () => {
    window.open(resolveToolsPreviewUrl(appStore.config, '/tools/hot-ranking'), '_blank')
}

/**
 * 函数说明：跳转到热榜管理页，让运营从配置页直接回到热榜数据分析页。
 */
const goManagePage = () => {
    router.push('/official_site/tool_ranking_manage')
}

/**
 * 函数说明：提交榜单配置保存请求，成功后刷新基线快照并更新顶部状态。
 */
const handleSubmit = async () => {
    const passed = await runSubmit(async () => {
        await saveToolRankingConfigDetail({
            enabled: formData.enabled,
            pageTitle: String(formData.pageTitle || '').trim(),
            pageDescription: String(formData.pageDescription || '').trim(),
            defaultPeriod: formData.defaultPeriod,
            pageLimit: Math.min(20, Math.max(1, Number(formData.pageLimit || 12) || 12)),
            showOnSidebar: formData.showOnSidebar,
            sidebarTitle: String(formData.sidebarTitle || '').trim(),
            sidebarPeriod: formData.sidebarPeriod
        })
        updateBaselineSnapshot()
    })
    if (passed) {
        void appStore.getConfig()
    }
}

onMounted(() => {
    void loadData()
})

/**
 * 函数说明：离开榜单配置页前提示未保存改动，避免运营误切页面导致配置丢失。
 */
onBeforeRouteLeave((to, from, next) => {
    if (!hasUnsavedChanges.value) {
        next()
        return
    }
    feedback
        .confirm('当前工具热榜配置尚未保存，确认离开当前页面吗？')
        .then(() => next())
        .catch(() => next(false))
})
</script>

<style scoped>
.website-tool-ranking-config {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.layout-page-actions,
.layout-status-tags,
.page-entry-card__actions,
.ops-workspace__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.page-entry-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.page-entry-card {
    padding: 18px 20px;
    border: 1px solid var(--color-border-2);
    border-radius: 12px;
    background: linear-gradient(180deg, #ffffff 0%, #f7f8fa 100%);
}

.page-entry-card__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1);
}

.page-entry-card__desc,
.page-entry-list {
    margin-top: 10px;
    font-size: 13px;
    line-height: 1.8;
    color: var(--color-text-3);
}

.page-entry-list {
    padding-left: 18px;
}

.ops-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.85fr);
    gap: 16px;
}

.ops-workspace__main,
.ops-workspace__aside,
.layout-group {
    padding: 20px;
    border-radius: 12px;
    border: 1px solid var(--color-border-2);
    background: #fff;
}

.ops-workspace__eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgb(var(--arcoblue-6));
}

.ops-workspace__title {
    margin-top: 10px;
    font-size: 22px;
    line-height: 1.4;
    font-weight: 700;
    color: var(--color-text-1);
}

.ops-workspace__desc {
    margin-top: 10px;
    font-size: 13px;
    line-height: 1.8;
    color: var(--color-text-3);
}

.ops-workspace__meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
}

.ops-workspace__meta-item {
    padding: 14px 16px;
    border-radius: 10px;
    background: #f7f8fa;
    border: 1px solid rgba(15, 23, 42, 0.05);
}

.ops-workspace__meta-item span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3);
}

.ops-workspace__meta-item strong {
    display: block;
    margin-top: 6px;
    font-size: 16px;
    color: var(--color-text-1);
}

.ops-workspace__aside-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1);
}

.ops-workspace__checklist {
    display: grid;
    gap: 10px;
    margin-top: 14px;
}

.ops-workspace__checklist-item {
    padding: 14px 16px;
    border-radius: 10px;
    border: 1px solid var(--color-border-2);
    background: #fff;
}

.ops-workspace__checklist-item.is-ok {
    border-color: rgba(22, 163, 74, 0.24);
    background: rgba(240, 253, 244, 0.7);
}

.ops-workspace__checklist-item.is-warning {
    border-color: rgba(245, 158, 11, 0.24);
    background: rgba(255, 251, 235, 0.7);
}

.ops-workspace__checklist-item.is-danger {
    border-color: rgba(239, 68, 68, 0.24);
    background: rgba(254, 242, 242, 0.7);
}

.ops-workspace__checklist-label {
    font-size: 12px;
    color: var(--color-text-3);
}

.ops-workspace__checklist-value {
    margin-top: 6px;
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1);
}

.ops-workspace__checklist-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3);
}

.group-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1);
}

.group-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.form-tips {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px dashed rgba(15, 23, 42, 0.12);
    background: #fafbff;
    font-size: 12px;
    line-height: 1.8;
    color: var(--color-text-3);
}

@media (max-width: 1280px) {
    .ops-workspace,
    .page-entry-grid,
    .ops-workspace__meta {
        grid-template-columns: 1fr;
    }
}
</style>
