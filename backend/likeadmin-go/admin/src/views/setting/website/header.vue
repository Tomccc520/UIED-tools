<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */
-->
<template>
    <div class="website-header-settings pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 头部设置">
            <template #subtitle>
                维护顶部快捷入口、搜索推荐和 AI 工具页运营链接。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag :color="hasUnsavedChanges ? 'orange' : 'green'" bordered>
                            {{ hasUnsavedChanges ? '待发布' : '已同步' }}
                        </a-tag>
                    </div>
                    <a-button data-admin-smoke="website-header-reload" size="small" @click="reloadHeaderData"
                        >重新加载</a-button
                    >
                    <a-button data-admin-smoke="website-header-preview" size="small" @click="openToolsPreview"
                        >前端预览</a-button
                    >
                    <a-button data-admin-smoke="website-header-health" size="small" @click="runHeaderHealthCheck"
                        >一键体检</a-button
                    >
                    <a-button
                        v-perms="['setting:website:header:save']"
                        data-admin-smoke="website-header-save"
                        type="primary"
                        size="small"
                        :loading="isSubmitting"
                        @click="handleSubmit"
                    >
                        保存
                    </a-button>
                </div>
            </template>
        </a-page-header>

        <a-card class="page-card pro-panel-card" :bordered="false">
            <config-overview-collapse
                v-model="overviewCollapseKeys"
                :summary="headerActionSummary"
                :pending-count="headerValidationTips.length"
                :items="headerFocusItems"
            />

            <div class="mode-toolbar">
                <a-space>
                    <a-switch v-model="simpleMode" type="round" />
                    <span class="mode-toolbar__label">{{ simpleMode ? '运营简版（推荐）' : '高级模式' }}</span>
                </a-space>
            </div>

            <div class="layout-group mt-5">
                <div class="group-head">
                    <span>头部快捷链接</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addHeaderLink">新增链接</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">用于前端顶部导航右侧快捷入口，建议控制在 3-8 条，避免过长导致换行。</div>
                <div v-if="headerLinks.length === 0" class="form-tips">
                    这一组还没开始配置，先补 1 条官网核心入口，前端头部就能先跑起来。
                </div>
                <div v-for="(item, index) in headerLinks" :key="`header-link-${index}`" class="link-row">
                    <a-input v-model="item.name" placeholder="名称，如：个人网站" />
                    <a-input v-model="item.link" placeholder="链接，如：https://uiedtool.com/" />
                    <div class="row-actions">
                        <a-button type="text" @click="moveLinkItem(headerLinks, index, -1)">上移</a-button>
                        <a-button type="text" @click="moveLinkItem(headerLinks, index, 1)">下移</a-button>
                        <a-button type="text" status="danger" @click="removeHeaderLink(index)">删除</a-button>
                    </div>
                </div>
            </div>

            <div class="layout-group mt-5">
                <div class="group-head">
                    <span>搜索面板快捷入口</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addSearchQuickTool">新增入口</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">用于前端搜索面板首屏默认推荐，建议维护 4-8 条高频 AI / 工具入口。</div>
                <a-form
                    :model="formData"
                    :label-col-props="{ span: 6 }"
                    :wrapper-col-props="{ span: 18 }"
                    class="compact-form search-provider-form"
                >
                    <a-form-item label="服务方名称">
                        <a-input
                            v-model="formData.toolsSearchProviderLabel"
                            maxlength="80"
                            show-word-limit
                            placeholder="如：硅基流动 x 华为云联合 SiliconFlow"
                        />
                    </a-form-item>
                    <a-form-item label="服务方链接">
                        <a-input
                            v-model="formData.toolsSearchProviderLink"
                            placeholder="如：https://cloud.siliconflow.cn/i/AZywGNhl"
                        />
                    </a-form-item>
                </a-form>
                <div v-if="searchQuickTools.length === 0" class="form-tips">
                    搜索弹层还没有默认推荐，先补 1 条高频工具入口，首屏会更完整。
                </div>
                <div v-for="(item, index) in searchQuickTools" :key="`search-quick-${index}`" class="search-quick-row">
                    <a-input v-model="item.name" placeholder="标题，如：DeepSeek R1对话" />
                    <a-input v-model="item.desc" placeholder="简介，如：基于 DeepSeek-R1 推理模型的智能对话" />
                    <a-input v-model="item.link" placeholder="链接，如：/tools/ai/deepseek-r1" />
                    <div class="row-actions">
                        <a-button type="text" @click="moveLinkItem(searchQuickTools, index, -1)">上移</a-button>
                        <a-button type="text" @click="moveLinkItem(searchQuickTools, index, 1)">下移</a-button>
                        <a-button type="text" status="danger" @click="removeSearchQuickTool(index)">删除</a-button>
                    </div>
                </div>
            </div>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <div class="group-head">
                    <span>AI对话页顶部链接</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addAiChatHeaderLink">新增链接</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">用于 AIChat / DeepSeek 等对话页顶部快捷入口。</div>
                <div v-if="aiChatHeaderLinks.length === 0" class="form-tips">
                    对话页顶部还没有快捷入口，先补 1 条最常用的模型或服务链接即可。
                </div>
                <div v-for="(item, index) in aiChatHeaderLinks" :key="`ai-chat-header-${index}`" class="link-row">
                    <a-input v-model="item.name" placeholder="名称，如：AI工具箱导航" />
                    <a-input v-model="item.link" placeholder="链接，如：https://hao.uied.cn/ai" />
                    <div class="row-actions">
                        <a-button type="text" @click="moveLinkItem(aiChatHeaderLinks, index, -1)">上移</a-button>
                        <a-button type="text" @click="moveLinkItem(aiChatHeaderLinks, index, 1)">下移</a-button>
                        <a-button type="text" status="danger" @click="removeAiChatHeaderLink(index)">删除</a-button>
                    </div>
                </div>
            </div>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <div class="group-head">
                    <span>AI通用页顶部链接</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addAiCommonHeaderLink">新增链接</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">用于提示词反推、文本配音等通用 AI 工具页顶部推荐入口。</div>
                <div v-if="aiCommonHeaderLinks.length === 0" class="form-tips">
                    通用 AI 页顶部还没有快捷入口，先补 1 条最常用的运营入口即可。
                </div>
                <div v-for="(item, index) in aiCommonHeaderLinks" :key="`ai-common-header-${index}`" class="link-row">
                    <a-input v-model="item.name" placeholder="名称，如：AI工具导航" />
                    <a-input v-model="item.link" placeholder="链接，如：https://hao.uied.cn/ai" />
                    <div class="row-actions">
                        <a-button type="text" @click="moveLinkItem(aiCommonHeaderLinks, index, -1)">上移</a-button>
                        <a-button type="text" @click="moveLinkItem(aiCommonHeaderLinks, index, 1)">下移</a-button>
                        <a-button type="text" status="danger" @click="removeAiCommonHeaderLink(index)">删除</a-button>
                    </div>
                </div>
            </div>
        </a-card>

        <footer-btns :fixed="false" v-perms="['setting:website:header:save']">
            <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="websiteHeaderSettings">
import { getWebsite, setWebsite } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave } from 'vue-router'
import ConfigOverviewCollapse from './components/config-overview-collapse.vue'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { useOperateSubmit } from './composables/use-operate-submit'
import { OFFICIAL_SITE_DEFAULT_HEADER } from './defaults/officialSite'

interface ToolsLinkItem {
    name: string
    link: string
    desc?: string
}

const appStore = useAppStore()
const { isSubmitting, runSubmit } = useOperateSubmit('头部设置已保存')
const baselineSnapshot = ref('')
const simpleMode = ref(true)
const overviewCollapseKeys = ref<(string | number)[]>([])

const formData = reactive<Record<string, string>>({
    toolsSearchProviderLabel: '',
    toolsSearchProviderLink: '',
})

const headerLinks = ref<ToolsLinkItem[]>([])
const searchQuickTools = ref<ToolsLinkItem[]>([])
const aiChatHeaderLinks = ref<ToolsLinkItem[]>([])
const aiCommonHeaderLinks = ref<ToolsLinkItem[]>([])

/**
 * 函数说明：深拷贝头部链接列表，避免默认值对象被编辑态污染。
 */
const cloneLinkItems = (items: ToolsLinkItem[]): ToolsLinkItem[] => {
    return items.map((item) => ({
        name: String(item.name || ''),
        link: String(item.link || ''),
        desc: String(item.desc || ''),
    }))
}

/**
 * 函数说明：解析链接数组 JSON，异常时回退为空数组，避免编辑页面被坏数据拖垮。
 */
const parseLinkItems = (value: unknown): ToolsLinkItem[] => {
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value || '[]') : value
        if (!Array.isArray(parsed)) {
            return []
        }
        return parsed.map((item) => ({
            name: String(item?.name || ''),
            link: String(item?.link || ''),
            desc: String(item?.desc || ''),
        }))
    } catch {
        return []
    }
}

/**
 * 函数说明：判断链接是否为允许格式，支持站内路径、锚点与 http(s) 外链。
 */
const isValidLinkValue = (link: string): boolean => {
    const value = String(link || '').trim()
    if (!value) {
        return false
    }
    if (value.startsWith('/')) {
        return true
    }
    if (value.startsWith('#')) {
        return true
    }
    return /^https?:\/\//i.test(value)
}

/**
 * 函数说明：生成当前编辑状态快照，用于离开页面前判断是否存在未保存改动。
 */
const buildHeaderSnapshot = (): string => {
    return JSON.stringify({
        toolsHeaderLinks: headerLinks.value,
        toolsSearchQuickTools: searchQuickTools.value,
        toolsSearchProviderLabel: formData.toolsSearchProviderLabel.trim(),
        toolsSearchProviderLink: formData.toolsSearchProviderLink.trim(),
        toolsAiChatHeaderLinks: aiChatHeaderLinks.value,
        toolsAiCommonHeaderLinks: aiCommonHeaderLinks.value,
    })
}

/**
 * 函数说明：更新基线快照，表示页面当前状态已与后端同步。
 */
const updateBaselineSnapshot = () => {
    baselineSnapshot.value = buildHeaderSnapshot()
}

/**
 * 函数说明：判断当前页面是否存在未保存变更，减少运营误操作。
 */
const hasUnsavedChanges = computed<boolean>(() => {
    if (!baselineSnapshot.value) {
        return false
    }
    return buildHeaderSnapshot() !== baselineSnapshot.value
})

/**
 * 函数说明：生成头部设置页动作摘要，帮助运营先理解当前头部入口维护重点。
 */
const headerActionSummary = computed(() => {
    if (formData.toolsSearchProviderLink.trim() && !/^https?:\/\//i.test(formData.toolsSearchProviderLink.trim())) {
        return '搜索服务方链接格式不合法，建议先修正链接，再继续维护顶部入口和 AI 顶部运营位。'
    }
    if (headerLinks.value.length === 0) {
        return '当前没有头部快捷链接，建议先恢复前端默认或补齐官网核心入口。'
    }
    return '建议先确认搜索面板服务方和快捷入口都完整，再继续补齐 AI 对话页和通用 AI 页顶部链接。'
})

/**
 * 函数说明：生成头部设置页重点检查项，统一展示顶部导航和搜索面板的当前状态。
 */
const headerFocusItems = computed(() => {
    const hasProvider = Boolean(formData.toolsSearchProviderLabel.trim() && formData.toolsSearchProviderLink.trim())
    return [
        {
            label: '搜索服务方',
            value: hasProvider ? '已配置' : '待补充',
            desc: hasProvider
                ? formData.toolsSearchProviderLabel
                : '服务方名称和链接建议成对维护，便于搜索面板解释来源。',
            className: hasProvider ? 'is-ok' : 'is-warning',
        },
        {
            label: '搜索推荐',
            value: `${searchQuickTools.value.length} 条`,
            desc: searchQuickTools.value.length > 0 ? '用于搜索面板首屏默认推荐。' : '建议优先维护 4-8 条高频入口。',
            className: searchQuickTools.value.length > 0 ? 'is-ok' : 'is-danger',
        },
        {
            label: 'AI 顶部入口',
            value: `${aiChatHeaderLinks.value.length + aiCommonHeaderLinks.value.length} 条`,
            desc: '覆盖 AI 对话页与通用 AI 工具页的顶部运营入口。',
            className: aiChatHeaderLinks.value.length + aiCommonHeaderLinks.value.length > 0 ? 'is-ok' : '',
        },
    ]
})

const headerValidationTips = computed(() => {
    const tips: string[] = []
    if (formData.toolsSearchProviderLink.trim() && !/^https?:\/\//i.test(formData.toolsSearchProviderLink.trim())) {
        tips.push('搜索面板服务方链接需为 http(s) 地址。')
    }
    return tips
})

/**
 * 函数说明：读取后端配置并回填页面表单，保持本页独立编辑且不覆盖其它官网设置。
 */
const getData = async () => {
    const data = await getWebsite()
    formData.toolsSearchProviderLabel = String(data.toolsSearchProviderLabel || '')
    formData.toolsSearchProviderLink = String(data.toolsSearchProviderLink || '')
    headerLinks.value = parseLinkItems(data.toolsHeaderLinks)
    searchQuickTools.value = parseLinkItems(data.toolsSearchQuickTools)
    aiChatHeaderLinks.value = parseLinkItems(data.toolsAiChatHeaderLinks)
    aiCommonHeaderLinks.value = parseLinkItems(data.toolsAiCommonHeaderLinks)
    updateBaselineSnapshot()
}

/**
 * 函数说明：重新读取后台头部配置，方便脚本导入后立即回显最新数据。
 */
const reloadHeaderData = async () => {
    await getData()
    feedback.msgSuccess('已重新加载后台头部配置')
}

/**
 * 函数说明：统一确认高风险移除操作，避免运营误删配置项。
 */
const confirmHeaderDangerAction = async (message: string) => {
    try {
        await feedback.confirm(message)
        return true
    } catch {
        return false
    }
}

/**
 * 函数说明：将当前表单恢复为前端默认头部配置，便于后台一键回填后再保存。
 */
const restoreHeaderDefaults = async () => {
    const confirmed = await confirmHeaderDangerAction('确定回填前端默认头部配置吗？当前未保存修改将被覆盖。')
    if (!confirmed) {
        return
    }
    formData.toolsSearchProviderLabel = OFFICIAL_SITE_DEFAULT_HEADER.searchProviderLabel
    formData.toolsSearchProviderLink = OFFICIAL_SITE_DEFAULT_HEADER.searchProviderLink
    headerLinks.value = cloneLinkItems(OFFICIAL_SITE_DEFAULT_HEADER.headerLinks)
    searchQuickTools.value = cloneLinkItems(OFFICIAL_SITE_DEFAULT_HEADER.searchQuickTools)
    aiChatHeaderLinks.value = cloneLinkItems(OFFICIAL_SITE_DEFAULT_HEADER.aiChatHeaderLinks)
    aiCommonHeaderLinks.value = cloneLinkItems(OFFICIAL_SITE_DEFAULT_HEADER.aiCommonHeaderLinks)
    feedback.msgSuccess('已回填前端默认头部配置，请确认后保存')
}

/**
 * 函数说明：新增头部快捷链接条目。
 */
const addHeaderLink = () => {
    headerLinks.value.push({ name: '', link: '' })
}

/**
 * 函数说明：删除指定头部快捷链接条目。
 */
const removeHeaderLink = async (index: number) => {
    const currentItem = headerLinks.value[index]
    const itemName = String(currentItem?.name || '').trim() || `第 ${index + 1} 项`
    const confirmed = await confirmHeaderDangerAction(`确定删除头部快捷链接「${itemName}」吗？`)
    if (!confirmed) {
        return
    }
    headerLinks.value.splice(index, 1)
}

/**
 * 函数说明：新增搜索面板快捷入口条目。
 */
const addSearchQuickTool = () => {
    searchQuickTools.value.push({ name: '', desc: '', link: '' })
}

/**
 * 函数说明：删除指定搜索面板快捷入口条目。
 */
const removeSearchQuickTool = async (index: number) => {
    const currentItem = searchQuickTools.value[index]
    const itemName = String(currentItem?.name || '').trim() || `第 ${index + 1} 项`
    const confirmed = await confirmHeaderDangerAction(`确定删除搜索快捷入口「${itemName}」吗？`)
    if (!confirmed) {
        return
    }
    searchQuickTools.value.splice(index, 1)
}

/**
 * 函数说明：新增 AI 对话页顶部链接条目。
 */
const addAiChatHeaderLink = () => {
    aiChatHeaderLinks.value.push({ name: '', link: '' })
}

/**
 * 函数说明：删除指定 AI 对话页顶部链接条目。
 */
const removeAiChatHeaderLink = async (index: number) => {
    const currentItem = aiChatHeaderLinks.value[index]
    const itemName = String(currentItem?.name || '').trim() || `第 ${index + 1} 项`
    const confirmed = await confirmHeaderDangerAction(`确定删除 AI 对话顶部链接「${itemName}」吗？`)
    if (!confirmed) {
        return
    }
    aiChatHeaderLinks.value.splice(index, 1)
}

/**
 * 函数说明：新增 AI 通用页顶部链接条目。
 */
const addAiCommonHeaderLink = () => {
    aiCommonHeaderLinks.value.push({ name: '', link: '' })
}

/**
 * 函数说明：删除指定 AI 通用页顶部链接条目。
 */
const removeAiCommonHeaderLink = async (index: number) => {
    const currentItem = aiCommonHeaderLinks.value[index]
    const itemName = String(currentItem?.name || '').trim() || `第 ${index + 1} 项`
    const confirmed = await confirmHeaderDangerAction(`确定删除 AI 通用顶部链接「${itemName}」吗？`)
    if (!confirmed) {
        return
    }
    aiCommonHeaderLinks.value.splice(index, 1)
}

/**
 * 函数说明：通用数组排序方法，支持上移和下移。
 */
function moveLinkItem<T>(list: T[], index: number, step: -1 | 1) {
    const targetIndex = index + step
    if (targetIndex < 0 || targetIndex >= list.length) {
        return
    }
    const current = list[index]
    list[index] = list[targetIndex]
    list[targetIndex] = current
}

/**
 * 函数说明：执行页面级体检，提前发现缺失字段和非法链接。
 */
const runHeaderHealthCheck = () => {
    if (!validateBeforeSubmit(false)) {
        return
    }
    feedback.msgSuccess('头部设置体检通过，可以保存发布。')
}

/**
 * 函数说明：打开前端首页预览，便于运营保存后立即核对展示结果。
 */
const openToolsPreview = () => {
    window.open(resolveToolsPreviewUrl(appStore.config), '_blank')
}

/**
 * 函数说明：统一校验头部页面保存前的必填项和链接格式。
 */
const validateBeforeSubmit = (showMessage = true): boolean => {
    formData.toolsSearchProviderLabel = formData.toolsSearchProviderLabel.trim()
    formData.toolsSearchProviderLink = formData.toolsSearchProviderLink.trim()

    if (formData.toolsSearchProviderLink && !/^https?:\/\//i.test(formData.toolsSearchProviderLink)) {
        showMessage && feedback.msgError('搜索面板服务方链接需为 http(s) 地址')
        return false
    }

    const invalidHeaderLink = headerLinks.value.find(
        (item) => !String(item.name || '').trim() || !isValidLinkValue(item.link)
    )
    if (invalidHeaderLink) {
        showMessage && feedback.msgError('头部快捷链接需同时填写名称与合法链接')
        return false
    }
    const invalidSearchQuick = searchQuickTools.value.find(
        (item) => !String(item.name || '').trim() || !isValidLinkValue(item.link)
    )
    if (invalidSearchQuick) {
        showMessage && feedback.msgError('搜索快捷入口需至少填写标题与合法链接')
        return false
    }
    const invalidAiChat = aiChatHeaderLinks.value.find(
        (item) => !String(item.name || '').trim() || !isValidLinkValue(item.link)
    )
    if (invalidAiChat) {
        showMessage && feedback.msgError('AI对话页顶部链接需同时填写名称与合法链接')
        return false
    }
    const invalidAiCommon = aiCommonHeaderLinks.value.find(
        (item) => !String(item.name || '').trim() || !isValidLinkValue(item.link)
    )
    if (invalidAiCommon) {
        showMessage && feedback.msgError('AI通用页顶部链接需同时填写名称与合法链接')
        return false
    }
    return true
}

/**
 * 函数说明：提交头部设置，仅保存本页负责的字段，避免覆盖其它官网配置。
 */
const handleSubmit = async () => {
    if (!validateBeforeSubmit(true)) {
        return
    }

    const payload: Record<string, string> = {
        toolsHeaderLinks: JSON.stringify(headerLinks.value),
        toolsSearchQuickTools: JSON.stringify(searchQuickTools.value),
        toolsSearchProviderLabel: formData.toolsSearchProviderLabel,
        toolsSearchProviderLink: formData.toolsSearchProviderLink,
        toolsAiChatHeaderLinks: JSON.stringify(aiChatHeaderLinks.value),
        toolsAiCommonHeaderLinks: JSON.stringify(aiCommonHeaderLinks.value),
    }

    const success = await runSubmit(async () => {
        await setWebsite(payload)
    })
    if (!success) {
        return
    }
    updateBaselineSnapshot()
}

/**
 * 函数说明：页面刷新或关闭前提示未保存变更，避免运营误关闭标签页。
 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges.value) {
        return
    }
    event.preventDefault()
    event.returnValue = ''
}

/**
 * 函数说明：路由切换前提示未保存变更，防止编辑中断。
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

<style lang="scss" scoped>
.pro-page-shell {
    padding-bottom: 24px;
}

.layout-page-header {
    margin-bottom: 16px;
    padding: 0 4px;
}

.layout-page-actions,
.layout-status-tags {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.layout-page-actions {
    justify-content: flex-end;
    gap: 10px;
}

.layout-status-tags {
    gap: 8px;
}

.page-card {
    border-radius: 8px;
}

.mode-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    background: var(--color-fill-1, #f7f8fa);
}

.mode-toolbar__label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1);
}

.mode-toolbar__tip {
    font-size: 12px;
    color: var(--color-text-3);
}

.layout-group {
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
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
    flex-wrap: wrap;
}

.group-actions {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
}

.group-actions :deep(.arco-btn) {
    height: 30px;
    padding: 0 10px;
    border-radius: 8px;
}

.group-actions :deep(.arco-btn.arco-btn-text) {
    background: var(--color-fill-1, #f7f8fa);
}

.form-tips {
    background: var(--color-fill-1, #f7f8fa);
    border-radius: 8px;
    border: 1px dashed var(--color-border-2, #e5e6eb);
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3);
}

.link-row {
    display: grid;
    grid-template-columns: minmax(180px, 240px) minmax(320px, 1fr) auto;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 0;
    border-top: 1px solid var(--color-border-2);
}

.search-quick-row {
    display: grid;
    grid-template-columns:
        minmax(180px, 220px) minmax(260px, 1fr) minmax(280px, 1fr)
        auto;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 0;
    border-top: 1px solid var(--color-border-2);
}

.link-row:first-of-type,
.search-quick-row:first-of-type {
    border-top: 0;
}

.row-actions {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    min-height: 32px;
    justify-content: flex-end;
}

.row-actions :deep(.arco-btn) {
    padding: 0 8px;
    border-radius: 8px;
}

@media (max-width: 920px) {
    .link-row,
    .search-quick-row,
    .mode-toolbar {
        grid-template-columns: 1fr;
    }

    .mode-toolbar {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
