<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-23
 */
-->
<template>
    <div class="website-filing-page pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 备案与版权">
            <template #subtitle>
                配置页脚备案信息与版权链接，支持多条展示和可选跳转地址。
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
                    <a-button size="small" @click="getData">刷新配置</a-button>
                    <a-button size="small" @click="openToolsPreview">前端预览</a-button>
                    <a-button size="small" @click="runHealthCheck">一键体检</a-button>
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
                            ? '简版聚焦备案列表维护；统计卡片已收进高级模式。'
                            : '高级模式会展示统计卡片，便于检查空链接和异常项。'
                    }}
                </span>
            </div>

            <div v-if="!simpleMode" class="stats-grid mt-4">
                <div class="stat-card">
                    <div class="stat-label">已填文本</div>
                    <div class="stat-value">{{ filledNameCount }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">空链接项</div>
                    <div class="stat-value">{{ emptyLinkCount }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">异常项</div>
                    <div class="stat-value" :class="{ 'is-danger': invalidItemCount > 0 }">
                        {{ invalidItemCount }}
                    </div>
                </div>
            </div>

            <a-space direction="vertical" fill :size="12" class="mt-5">
                <div v-for="(item, index) in formData" :key="index" class="filing-row">
                    <div class="filing-row__header">
                        <a-tag color="arcoblue" bordered>备案项 {{ index + 1 }}</a-tag>
                        <div class="row-actions">
                            <a-button type="text" @click="moveItem(index, -1)">上移</a-button>
                            <a-button type="text" @click="moveItem(index, 1)">下移</a-button>
                            <a-button
                                type="text"
                                status="danger"
                                :disabled="formData.length <= 1"
                                @click="handleDelete(index)"
                            >
                                删除
                            </a-button>
                        </div>
                    </div>
                    <a-grid :cols="{ xs: 1, md: 12 }" :col-gap="12" :row-gap="12">
                        <a-grid-item :span="{ xs: 12, md: 4 }">
                            <a-form-item label="显示内容">
                                <a-input
                                    v-model="item.name"
                                    placeholder="例如：粤ICP备2022056875号"
                                />
                            </a-form-item>
                        </a-grid-item>
                        <a-grid-item :span="{ xs: 12, md: 8 }">
                            <a-form-item label="跳转链接">
                                <a-input
                                    v-model="item.link"
                                    placeholder="例如：https://beian.miit.gov.cn/"
                                />
                                <div class="form-tips">可留空；不填写则前端仅展示文本</div>
                            </a-form-item>
                        </a-grid-item>
                    </a-grid>
                </div>
            </a-space>
        </a-card>

        <footer-btns :fixed="false" v-perms="['setting:copyright:save']">
            <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="webFilling">
import { getCopyright, setCopyright } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave } from 'vue-router'
import OperateCollapse from './components/operate-collapse.vue'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { useOperateSubmit } from './composables/use-operate-submit'

interface FilingItem {
    name: string
    link: string
}

interface FocusItem {
    label: string
    value: string
    desc: string
    className: 'is-ok' | 'is-warning' | 'is-danger'
}

const { isSubmitting, lastSavedAt, runSubmit } = useOperateSubmit('备案与版权配置已保存')
const appStore = useAppStore()
/**
 * 函数说明：控制备案页运营模式。简版聚焦备案列表编辑，高级模式展示统计卡片。
 */
const simpleMode = ref(true)
const operationCollapseKeys = ref<(string | number)[]>([
    'quick_actions',
    'validation_tips',
    'operation_guide'
])
const baselineSnapshot = ref('')
const guideItems = [
    '建议至少保留 1 条备案信息，避免页脚版权区为空。',
    '内容建议填写备案号或版权文案，链接可选填。',
    '保存后到前端页脚检查展示和跳转效果。'
]

const formData = ref<FilingItem[]>([
    {
        name: '',
        link: ''
    }
])

/**
 * 函数说明：校验备案链接格式，支持 /、#、http(s) 三种入口。
 */
const isValidFilingLink = (link: string): boolean => {
    const value = String(link || '').trim()
    if (!value) {
        return true
    }
    return value.startsWith('/') || value.startsWith('#') || /^https?:\/\//i.test(value)
}

/**
 * 函数说明：克隆备案列表，避免快照与响应式对象共享引用。
 */
const cloneFilingList = (list: FilingItem[]): FilingItem[] => list.map((item) => ({ ...item }))

/**
 * 函数说明：构建当前备案配置快照，供未保存变更判断与离开提醒使用。
 */
const buildSnapshot = (): string =>
    JSON.stringify(
        formData.value.map((item) => ({
            name: String(item.name || '').trim(),
            link: String(item.link || '').trim()
        }))
    )

/**
 * 函数说明：更新当前页面基线快照，用于后续比较是否有未保存改动。
 */
const updateBaselineSnapshot = () => {
    baselineSnapshot.value = buildSnapshot()
}

/**
 * 函数说明：返回备案页未保存状态，供顶部状态和离开拦截复用。
 */
const hasUnsavedChanges = computed(() => {
    if (!baselineSnapshot.value) {
        return false
    }
    return buildSnapshot() !== baselineSnapshot.value
})

const filledNameCount = computed(
    () => formData.value.filter((item) => String(item.name || '').trim()).length
)
const emptyLinkCount = computed(
    () => formData.value.filter((item) => !String(item.link || '').trim()).length
)
const invalidItemCount = computed(() => {
    let count = 0
    formData.value.forEach((item) => {
        const hasName = Boolean(String(item.name || '').trim())
        const validLink = isValidFilingLink(item.link)
        if (!hasName || !validLink) {
            count += 1
        }
    })
    return count
})

const validationTips = computed(() => {
    const tips: string[] = []
    if (formData.value.length === 0) {
        tips.push('至少保留 1 条备案信息。')
        return tips
    }
    formData.value.forEach((item, index) => {
        if (!String(item.name || '').trim()) {
            tips.push(`第 ${index + 1} 条备案显示内容不能为空。`)
        }
        if (!isValidFilingLink(item.link)) {
            tips.push(`第 ${index + 1} 条备案链接格式不正确。`)
        }
    })
    return tips.slice(0, 8)
})

/**
 * 函数说明：读取备案配置并回填表单列表。
 */
const getData = async () => {
    const data = await getCopyright()
    if (!Array.isArray(data) || data.length === 0) {
        formData.value = [{ name: '', link: '' }]
        updateBaselineSnapshot()
        return
    }
    formData.value = cloneFilingList(data)
    updateBaselineSnapshot()
}/**
 * 函数说明：删除指定备案信息项，至少保留一项避免页面空态。
 */
const handleDelete = (index: number) => {
    if (formData.value.length <= 1) {
        feedback.msgError('至少保留一个')
        return
    }
    formData.value.splice(index, 1)
}

/**
 * 函数说明：调整备案项顺序，支持上移和下移。
 */
const moveItem = (index: number, step: -1 | 1) => {
    const targetIndex = index + step
    if (targetIndex < 0 || targetIndex >= formData.value.length) {
        return
    }
    const current = formData.value[index]
    formData.value[index] = formData.value[targetIndex]
    formData.value[targetIndex] = current
}

/**
 * 函数说明：执行备案配置体检并输出统一反馈。
 */
const runHealthCheck = () => {
    if (validationTips.value.length > 0) {
        feedback.alertWarning(`配置体检未通过：${validationTips.value[0]}`)
        return
    }
    feedback.msgSuccess('配置体检通过：备案信息结构完整')
}

/**
 * 函数说明：打开前端首页预览，便于运营保存后立刻回归页脚表现。
 */
const openToolsPreview = () => {
    window.open(resolveToolsPreviewUrl(appStore.config), '_blank')
}

/**
 * 函数说明：保存备案信息配置并刷新列表。
 */
const handleSubmit = async () => {
    if (validationTips.value.length > 0) {
        feedback.msgError(validationTips.value[0])
        return
    }
    const success = await runSubmit(async () => {
        await setCopyright(formData.value)
        await getData()
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
    void getData()
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

.stat-value.is-danger {
    color: rgb(var(--red-6));
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

.filing-row {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 14px;
    padding: 12px 14px;
    background: #fff;
}

.filing-row__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
}

.row-actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    min-height: 32px;
    flex-wrap: wrap;
}

.row-actions :deep(.arco-btn) {
    padding: 0 8px;
    border-radius: 8px;
}

.form-tips {
    background: var(--color-fill-1, #f7f8fa);
    border-radius: 10px;
    border: 1px dashed var(--color-border-2, #e5e6eb);
    padding: 10px 12px;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3);
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
