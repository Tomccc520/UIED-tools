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
        <admin-page-header title="顶部与搜索" description="维护顶栏、搜索推荐及 AI 工具页的链接。">
            <template #extra>
                <a-button data-admin-smoke="website-header-reload" :disabled="isSubmitting" :loading="isLoadingData" @click="reloadHeaderData">重新加载</a-button>
                <a-button data-admin-smoke="website-header-preview" @click="openToolsPreview">预览已保存内容</a-button>
                <a-button data-admin-smoke="website-header-health" :disabled="!hasLoadedData || isLoadingData" @click="runHeaderHealthCheck">检查配置</a-button>
            </template>
        </admin-page-header>

        <config-edit-frame :loading="isLoadingData" :ready="hasLoadedData" :error="loadErrorMessage" :save-error="submitError" :dirty="hasUnsavedChanges" :saving="isSubmitting" :saved-at="lastSavedAt" @retry="reloadHeaderData">
            <a-alert v-if="hasLoadedData && !canEdit" type="info" class="header-notice">当前账号仅可查看配置，不能编辑或保存。</a-alert>
            <a-alert v-if="damagedFieldCount" type="warning" class="header-notice" :closable="false">{{ damagedFieldCount }} 组链接数据需要修复，原始内容已保留。其他分组的修改可以单独保存。</a-alert>
            <a-card class="header-workspace pro-panel-card" :bordered="false">
                <a-tabs v-model:active-key="activeHeaderTab" class="header-section-tabs">
                    <a-tab-pane key="top" title="顶栏链接" />
                    <a-tab-pane key="search" title="搜索推荐" />
                    <a-tab-pane key="ai" title="AI 工具页" />
                </a-tabs>
                <fieldset :disabled="!canEdit" :inert="!canEdit ? '' : undefined" class="header-edit-fields">
                    <a-form v-if="activeHeaderTab === 'search'" :model="formData" layout="vertical" class="search-provider-form">
                        <h2>搜索服务方</h2>
                        <p class="header-help">显示在主站搜索面板的服务来源说明，可留空。</p>
                        <div class="header-provider-grid">
                            <a-form-item label="服务方名称"><a-input v-model="formData.toolsSearchProviderLabel" :input-attrs="{ 'aria-label': '搜索服务方名称' }" :max-length="80" placeholder="如：硅基流动" /></a-form-item>
                            <a-form-item label="服务方链接"><a-input v-model="formData.toolsSearchProviderLink" :input-attrs="{ 'aria-label': '搜索服务方链接' }" placeholder="https://" /></a-form-item>
                        </div>
                    </a-form>

                    <section v-for="section in visibleLinkSections" :key="section.key" class="header-link-section" :aria-label="section.title">
                        <header class="header-link-section__heading">
                            <div><h2>{{ section.title }}</h2><p class="header-help">{{ section.description }}</p></div>
                            <a-button :disabled="!canOperate() || Boolean(linkFieldErrors[section.key])" @click="addLinkItem(section.key)">新增链接</a-button>
                        </header>
                        <a-alert v-if="linkFieldErrors[section.key]" type="error" class="header-notice" :closable="false">{{ linkFieldErrors[section.key] }}</a-alert>
                        <template v-else>
                            <a-empty v-if="!getLinkItems(section.key).length" description="暂无自定义链接。留空时沿用主站默认入口。" />
                            <div v-for="(item, index) in getLinkItems(section.key)" :key="`${section.key}-${index}`" class="header-link-row">
                                <div class="header-link-row__fields">
                                    <label>名称<a-input v-model="item.name" :input-attrs="{ 'aria-label': `${section.title}第${index + 1}条名称` }" placeholder="显示名称" /></label>
                                    <label>链接<a-input v-model="item.link" :input-attrs="{ 'aria-label': `${section.title}第${index + 1}条链接` }" placeholder="站内路径、锚点或 https:// 地址" /></label>
                                    <label v-if="section.key === 'toolsSearchQuickTools'" class="header-link-row__description">简介<a-input v-model="item.desc" :input-attrs="{ 'aria-label': `${section.title}第${index + 1}条简介` }" placeholder="简短说明工具用途" /></label>
                                </div>
                                <div class="header-row-actions">
                                    <a-button type="text" :disabled="index === 0" :aria-label="`上移${section.title}第${index + 1}条`" @click="moveLinkItem(section.key, index, -1)">上移</a-button>
                                    <a-button type="text" :disabled="index === getLinkItems(section.key).length - 1" :aria-label="`下移${section.title}第${index + 1}条`" @click="moveLinkItem(section.key, index, 1)">下移</a-button>
                                    <a-button type="text" status="danger" :aria-label="`删除${section.title}第${index + 1}条`" @click="removeLinkItem(section.key, index)">删除</a-button>
                                </div>
                            </div>
                        </template>
                        <details v-if="linkFieldErrors[section.key]" :open="repairExpanded[section.key]" class="header-repair" @toggle="recordRepairExpanded(section.key, $event)">
                            <summary>修复原始数据</summary>
                            <p class="header-help">输入对象数组；确认修复后再保存。不会自动替换或清空原始内容。</p>
                            <a-textarea v-model="linkRepairDrafts[section.key]" :textarea-attrs="{ 'aria-label': `${section.title}原始 JSON` }" :auto-size="{ minRows: 6, maxRows: 16 }" />
                            <div class="header-repair__actions"><a-button :disabled="!canOperate()" @click="applyLinkRepair(section.key)">应用修复</a-button><a-button @click="resetLinkRepair(section.key)">恢复原文</a-button></div>
                        </details>
                    </section>
                    <details class="header-defaults"><summary>恢复默认配置</summary><p class="header-help">将所有分组回填为项目默认值，检查后统一保存。</p><a-button @click="restoreHeaderDefaults">回填默认配置</a-button></details>
                </fieldset>
            </a-card>
            <template #actions><a-button v-perms="['setting:website:header:save']" data-admin-smoke="website-header-save" type="primary" :disabled="!canEdit || !hasUnsavedChanges" :loading="isSubmitting" @click="handleSubmit">保存更改</a-button></template>
        </config-edit-frame>
    </div>
</template>

<script lang="ts" setup name="websiteHeaderSettings">
import { computed, onMounted, reactive, ref } from 'vue'
import AdminPageHeader from '@/components/page-header/index.vue'
import ConfigEditFrame from '@/components/config-edit-frame/index.vue'
import { useConfigEditor } from '@/composables/use-config-editor'
import { getWebsite, setWebsite } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import useUserStore from '@/stores/modules/user'
import feedback from '@/utils/feedback'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { readConfigLinks, buildConfigFieldPatch } from './composables/config-links'
import { OFFICIAL_SITE_DEFAULT_HEADER } from './defaults/officialSite'

interface ToolsLinkItem extends Record<string, unknown> { name: string; link: string; desc?: string }
type HeaderTab = 'top' | 'search' | 'ai'
type HeaderLinkField = 'toolsHeaderLinks' | 'toolsSearchQuickTools' | 'toolsAiChatHeaderLinks' | 'toolsAiCommonHeaderLinks'
interface HeaderLinkSection { key: HeaderLinkField; tab: HeaderTab; title: string; description: string }
const linkSections: HeaderLinkSection[] = [
    { key: 'toolsHeaderLinks', tab: 'top', title: '顶栏快捷链接', description: '主站顶部的常用入口，建议保持简短。' },
    { key: 'toolsSearchQuickTools', tab: 'search', title: '搜索推荐入口', description: '主站搜索面板的默认推荐，按这里的顺序展示。' },
    { key: 'toolsAiChatHeaderLinks', tab: 'ai', title: 'AI 对话页链接', description: '用于 DeepSeek 等对话工具页的顶部入口。' },
    { key: 'toolsAiCommonHeaderLinks', tab: 'ai', title: '其他 AI 工具页链接', description: '用于文本配音、提示词等通用 AI 工具页。' }
]
const linkFields = linkSections.map(section => section.key)
const appStore = useAppStore()
const userStore = useUserStore()
/** 根据当前账号权限控制编辑区和全部修改函数，支持超级管理员通配权限。 */
const canEdit = computed(() => userStore.perms.some(permission => permission === '*' || permission === 'setting:website:header:save'))
const activeHeaderTab = ref<HeaderTab>('top')
/** 只挂载当前任务的表单，切换时由父级草稿保留所有分组内容。 */
const visibleLinkSections = computed(() => linkSections.filter(section => section.tab === activeHeaderTab.value))
const formData = reactive({ toolsSearchProviderLabel: '', toolsSearchProviderLink: '' })
const headerLinks = ref<ToolsLinkItem[]>([])
const searchQuickTools = ref<ToolsLinkItem[]>([])
const aiChatHeaderLinks = ref<ToolsLinkItem[]>([])
const aiCommonHeaderLinks = ref<ToolsLinkItem[]>([])
const linkLists = { toolsHeaderLinks: headerLinks, toolsSearchQuickTools: searchQuickTools, toolsAiChatHeaderLinks: aiChatHeaderLinks, toolsAiCommonHeaderLinks: aiCommonHeaderLinks }
const rawLinkFields = reactive<Record<HeaderLinkField, string>>({ toolsHeaderLinks: '', toolsSearchQuickTools: '', toolsAiChatHeaderLinks: '', toolsAiCommonHeaderLinks: '' })
const linkFieldErrors = reactive<Record<HeaderLinkField, string>>({ ...rawLinkFields })
const linkRepairDrafts = reactive<Record<HeaderLinkField, string>>({ ...rawLinkFields })
const repairExpanded = reactive<Record<HeaderLinkField, boolean>>({ toolsHeaderLinks: false, toolsSearchQuickTools: false, toolsAiChatHeaderLinks: false, toolsAiCommonHeaderLinks: false })
const baselineHeaderPayload = ref<Record<string, string>>({})
/** 汇总需修复的分组数量，保持异常提示可见，不把空展示当作空配置。 */
const damagedFieldCount = computed(() => linkFields.filter(field => linkFieldErrors[field]).length)

/** 读取指定分组的真实草稿，未知字段继续随对象保留。 */
const getLinkItems = (field: HeaderLinkField): ToolsLinkItem[] => linkLists[field].value
/** 读取当前链接数据；搜索简介是可编辑文字，其他扩展字段不做投影或强制转换。 */
const readHeaderLinks = (field: HeaderLinkField, value: unknown): ToolsLinkItem[] => {
    const label = linkSections.find(section => section.key === field)!.title
    const items = readConfigLinks(value, label)
    if (field === 'toolsSearchQuickTools' && items.some(item => item.desc !== undefined && typeof item.desc !== 'string')) throw new Error(`${label}的简介应为文字，原始内容已保留。`)
    return items as ToolsLinkItem[]
}
/** 组装完整本页载荷；损坏但未修复的分组维持原始字符串，不将其空展示数组写回。 */
const buildHeaderPayload = (): Record<string, string> => ({
    ...formData,
    ...Object.fromEntries(linkFields.map(field => [field, linkFieldErrors[field] ? rawLinkFields[field] : JSON.stringify(getLinkItems(field))]))
})
/** 草稿比较同时保护未应用的修复文本，避免离开页面丢失正在修复的原始数据。 */
const buildHeaderSnapshot = (): string => JSON.stringify({
    payload: buildHeaderPayload(),
    pendingRepairs: Object.fromEntries(linkFields.filter(field => linkFieldErrors[field] && linkRepairDrafts[field] !== rawLinkFields[field]).map(field => [field, linkRepairDrafts[field]]))
})
const { isLoadingData, hasLoadedData, loadErrorMessage, isSubmitting, lastSavedAt, submitError, hasUnsavedChanges, canOperate, loadConfiguration, reloadConfiguration, submitConfiguration } = useConfigEditor({ canEdit, snapshot: buildHeaderSnapshot, successText: '顶部与搜索配置已保存' })

/** 原子回填已读取配置；单组坏 JSON 单独记录，缺失字段或错误响应不覆盖已有草稿。 */
const getData = () => loadConfiguration(async () => {
    const data = await getWebsite()
    const requiredKeys = [...Object.keys(formData), ...linkFields]
    if (!data || requiredKeys.some(key => typeof data[key] !== 'string')) throw new Error('顶部与搜索配置响应不完整')
    const nextLists = {} as Record<HeaderLinkField, ToolsLinkItem[]>
    const nextErrors = {} as Record<HeaderLinkField, string>
    for (const field of linkFields) {
        try { nextLists[field] = readHeaderLinks(field, data[field]); nextErrors[field] = '' }
        catch (error) { nextLists[field] = []; nextErrors[field] = error instanceof Error ? error.message : '链接数据无效，原始内容已保留。' }
    }
    formData.toolsSearchProviderLabel = data.toolsSearchProviderLabel as string
    formData.toolsSearchProviderLink = data.toolsSearchProviderLink as string
    for (const field of linkFields) {
        rawLinkFields[field] = data[field] as string
        linkRepairDrafts[field] = data[field] as string
        linkLists[field].value = nextLists[field]
        linkFieldErrors[field] = nextErrors[field]
        repairExpanded[field] = false
    }
    baselineHeaderPayload.value = buildHeaderPayload()
})
/** 重新读取前由公共控制器确认草稿，不在保存中覆盖表单。 */
const reloadHeaderData = () => reloadConfiguration(getData)
/** 保留原始链接行为，允许站内路径、锚点和 HTTP(S) 地址。 */
const isValidLinkValue = (link: string): boolean => /^(?:\/|#|https?:\/\/)/i.test(String(link || '').trim())
/** 根据字段定位实际编辑页签；坏 JSON 的修复入口同时自动展开。 */
const revealField = (field: HeaderLinkField | 'toolsSearchProviderLink') => {
    activeHeaderTab.value = field === 'toolsSearchProviderLink' ? 'search' : linkSections.find(section => section.key === field)!.tab
    if (field !== 'toolsSearchProviderLink' && linkFieldErrors[field]) repairExpanded[field] = true
}
/** 从原生 details 记录展开选择，普通编辑不会重置用户已展开的修复区。 */
const recordRepairExpanded = (field: HeaderLinkField, event: Event) => { repairExpanded[field] = Boolean((event.target as HTMLDetailsElement).open) }
/** 明确应用有效的修复文本，解析失败保留原文和输入，不生成空列表。 */
const applyLinkRepair = (field: HeaderLinkField): boolean => {
    if (!canOperate()) return false
    try {
        const items = readHeaderLinks(field, linkRepairDrafts[field])
        linkLists[field].value = items
        linkFieldErrors[field] = ''
        repairExpanded[field] = false
        return true
    } catch (error) {
        linkFieldErrors[field] = error instanceof Error ? error.message : '链接数据无效，原始内容已保留。'
        revealField(field)
        return false
    }
}
/** 放弃尚未应用的修复输入，仅恢复读取时原文，不触及其他字段。 */
const resetLinkRepair = (field: HeaderLinkField) => {
    if (!canOperate()) return
    linkRepairDrafts[field] = rawLinkFields[field]
}
/** 创建本地空链接草稿，损坏分组须先明确修复后再编辑。 */
const addLinkItem = (field: HeaderLinkField) => {
    if (!canOperate() || linkFieldErrors[field]) return
    getLinkItems(field).push(field === 'toolsSearchQuickTools' ? { name: '', link: '', desc: '' } : { name: '', link: '' })
}
/** 确认后移除当前链接；异步确认期间卸载或切换数据后不误删其他条目。 */
const removeLinkItem = async (field: HeaderLinkField, index: number) => {
    if (!canOperate()) return
    const item = getLinkItems(field)[index]
    if (!item) return
    try { await feedback.confirm(`确定移除链接「${item.name.trim() || `第 ${index + 1} 条`}」吗？`) } catch { return }
    if (!canOperate() || getLinkItems(field)[index] !== item) return
    getLinkItems(field).splice(index, 1)
}
/** 调整有效位置的链接顺序，首末边界不改变内容，保留每个条目的扩展字段。 */
const moveLinkItem = (field: HeaderLinkField, index: number, step: -1 | 1) => {
    if (!canOperate()) return
    const list = getLinkItems(field)
    const target = index + step
    if (!Number.isInteger(index) || index < 0 || index >= list.length || target < 0 || target >= list.length) return
    ;[list[index], list[target]] = [list[target], list[index]]
}
/** 默认值只能通过显式确认回填，网络错误和坏数据不会触发恢复默认。 */
const restoreHeaderDefaults = async () => {
    if (!canOperate()) return
    try { await feedback.confirm('确定回填所有默认配置吗？当前未保存的顶部与搜索修改将被替换，检查后再保存。') } catch { return }
    if (!canOperate()) return
    formData.toolsSearchProviderLabel = OFFICIAL_SITE_DEFAULT_HEADER.searchProviderLabel
    formData.toolsSearchProviderLink = OFFICIAL_SITE_DEFAULT_HEADER.searchProviderLink
    const defaults = { toolsHeaderLinks: OFFICIAL_SITE_DEFAULT_HEADER.headerLinks, toolsSearchQuickTools: OFFICIAL_SITE_DEFAULT_HEADER.searchQuickTools, toolsAiChatHeaderLinks: OFFICIAL_SITE_DEFAULT_HEADER.aiChatHeaderLinks, toolsAiCommonHeaderLinks: OFFICIAL_SITE_DEFAULT_HEADER.aiCommonHeaderLinks }
    for (const field of linkFields) {
        linkLists[field].value = readHeaderLinks(field, defaults[field])
        linkFieldErrors[field] = ''
        linkRepairDrafts[field] = rawLinkFields[field]
        repairExpanded[field] = false
    }
    feedback.msgSuccess('默认配置已加入草稿，检查后保存。')
}
/** 校验本次改变的字段，未编辑的损坏原文不进入补丁；定位错误而不留下隐藏阻断。 */
const validateBeforeSubmit = (showMessage = true, checkAll = false): boolean => {
    const patch = checkAll ? buildHeaderPayload() : buildConfigFieldPatch(buildHeaderPayload(), baselineHeaderPayload.value)
    const pendingRepair = linkFields.find(field => linkFieldErrors[field] && linkRepairDrafts[field] !== rawLinkFields[field])
    if (pendingRepair) { revealField(pendingRepair); if (showMessage) feedback.msgError('请先应用或恢复正在编辑的原始数据，再保存其他更改。'); return false }
    if (Object.hasOwn(patch, 'toolsSearchProviderLink') && formData.toolsSearchProviderLink.trim() && !/^https?:\/\//i.test(formData.toolsSearchProviderLink.trim())) {
        revealField('toolsSearchProviderLink'); if (showMessage) feedback.msgError('搜索服务方链接需为 http(s) 地址。'); return false
    }
    for (const field of linkFields) {
        if (!Object.hasOwn(patch, field)) continue
        if (linkFieldErrors[field]) { revealField(field); if (showMessage) feedback.msgError(linkFieldErrors[field]); return false }
        if (getLinkItems(field).some(item => !item.name.trim() || !isValidLinkValue(item.link))) {
            revealField(field); if (showMessage) feedback.msgError(`${linkSections.find(section => section.key === field)!.title}需填写名称与合法链接。`); return false
        }
    }
    return true
}
/** 检查全部配置并定位问题，不改变草稿，也不把检查结果冒充实际发布。 */
const runHeaderHealthCheck = () => {
    if (!hasLoadedData.value || isLoadingData.value) return
    if (validateBeforeSubmit(true, true)) feedback.msgSuccess('顶部与搜索配置检查通过。')
}
/** 使用原有预览入口打开已保存的主站配置。 */
const openToolsPreview = () => { window.open(resolveToolsPreviewUrl(appStore.config), '_blank', 'noopener,noreferrer') }
/** 保存本页字段增量及完整提交快照，失败留稿，提交中的新编辑不被确认成已保存。 */
const handleSubmit = async (): Promise<boolean> => {
    if (!canOperate() || !hasUnsavedChanges.value || !validateBeforeSubmit(true)) return false
    const submittedPayload = buildHeaderPayload()
    const patch = buildConfigFieldPatch(submittedPayload, baselineHeaderPayload.value)
    if (!Object.keys(patch).length) return false
    const saved = await submitConfiguration(() => setWebsite(patch), buildHeaderSnapshot())
    if (saved) baselineHeaderPayload.value = submittedPayload
    return saved
}

onMounted(() => { void getData() })
</script>

<style lang="scss" scoped>
.website-header-settings { min-width: 0; }
.header-notice { margin-bottom: 16px; }
.header-edit-fields { border: 0; margin: 0; padding: 0; min-width: 0; }
.header-section-tabs { margin-bottom: 20px; }
.header-link-section + .header-link-section, .header-defaults { margin-top: 24px; }
.header-link-section h2, .search-provider-form h2 { margin: 0; font-size: 16px; line-height: 1.5; color: var(--color-text-1); }
.header-help { margin: 6px 0 16px; color: var(--color-text-3); font-size: 13px; line-height: 1.7; }
.header-link-section__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.header-link-row { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 12px; padding: 16px 0; border-top: 1px solid var(--color-border-2); }
.header-link-row__fields { flex: 1 1 420px; min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 12px; }
.header-link-row label { display: grid; gap: 8px; color: var(--color-text-2); font-size: 12px; min-width: 0; }
.header-link-row__description { grid-column: 1 / -1; }
.header-row-actions { display: flex; gap: 4px; align-self: flex-end; flex-wrap: wrap; }
.header-provider-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.header-repair summary, .header-defaults summary { cursor: pointer; color: var(--color-text-3); width: fit-content; padding: 8px 0; font-size: 13px; }
.header-repair summary:focus-visible, .header-defaults summary:focus-visible { outline: 2px solid rgb(var(--primary-6)); outline-offset: 2px; }
.header-repair__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
@media (max-width: 600px) {
    .header-workspace :deep(.arco-card-body) { padding: 16px; }
    .header-provider-grid, .header-link-row__fields { grid-template-columns: minmax(0, 1fr); }
    .header-link-row__description { grid-column: auto; }
    .header-row-actions { width: 100%; }
    .header-row-actions :deep(button), .header-repair__actions :deep(button), .header-defaults :deep(button) { min-height: 44px; }
}
</style>
