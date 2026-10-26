<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */
-->
<template>
    <div class="website-footer-settings pro-page-shell">
        <admin-page-header title="页脚链接">
            <template #subtitle>编辑页脚分组、官方媒体与文案，完成后统一保存。</template>
            <template #extra>
                <a-button data-admin-smoke="website-footer-reload" :disabled="isSubmitting || isLoadingData" @click="reloadFooterData">重新加载</a-button>
                <a-button data-admin-smoke="website-footer-preview" @click="openToolsPreview">预览已保存内容</a-button>
                <a-button data-admin-smoke="website-footer-health" :disabled="!hasLoadedData || isLoadingData" @click="runFooterHealthCheck">检查配置</a-button>
            </template>
        </admin-page-header>
        <config-edit-frame :loading="isLoadingData" :ready="hasLoadedData" :error="loadErrorMessage" :save-error="submitError" :dirty="hasUnsavedChanges" :saving="isSubmitting" :saved-at="lastSavedAt" @retry="reloadFooterData">
            <a-alert v-if="hasLoadedData && !canEdit" class="footer-config__notice" type="info" :closable="false">当前账号仅可查看配置，不能编辑或保存。</a-alert>
            <a-alert v-if="formatIssues.length" class="footer-config__notice" type="warning" :closable="false">
                有 {{ formatIssues.length }} 项链接配置需要修复。未修改的内容会保持原样。
                <template #action><a-button @click="showIssue(formatIssues[0].field)">查看问题</a-button></template>
            </a-alert>
            <a-card :bordered="false" class="pro-panel-card footer-config">
                <a-tabs v-model:active-key="activeFooterSection" class="footer-config__tabs">
                    <a-tab-pane key="quick" title="快捷入口" />
                    <a-tab-pane key="friends" title="友情链接" />
                    <a-tab-pane key="media" title="官方媒体" />
                    <a-tab-pane key="copy" title="文案与版权" />
                </a-tabs>
                <template v-if="activeFooterSection === 'quick'">
                    <h2>快捷入口分组</h2><p class="footer-config__help">选择分组后编辑名称与链接。没有自定义分组时，主站沿用默认分组。</p>
                    <config-link-groups-editor v-model="formData.toolsFooterQuickSections" label="快捷入口" :disabled="!canOperate()" />
                </template>
                <template v-else-if="activeFooterSection === 'friends'">
                    <h2>友情链接分组</h2><p class="footer-config__help">维护合作站点与长期入口。没有自定义分组时，主站沿用默认分组。</p>
                    <config-link-groups-editor v-model="formData.toolsFooterFriendSections" label="友情链接" :disabled="!canOperate()" />
                </template>
                <template v-else-if="activeFooterSection === 'media'">
                    <h2>官方媒体</h2><p class="footer-config__help">编辑官方账号与社区入口；留空时主站沿用默认媒体链接。</p>
                    <content-links-editor v-model="formData.toolsOfficialMediaLinks" label="官方媒体" sortable :disabled="!canOperate()" />
                </template>
                <template v-else>
                    <h2>页脚文案</h2>
                    <a-form layout="vertical" :model="formData" :disabled="!canEdit" class="footer-config__copy">
                        <a-form-item label="介绍文案"><a-input v-model="formData.toolsFooterIntro" :input-attrs="{ 'aria-label': '页脚介绍文案' }" :max-length="120" show-word-limit /><template #extra>使用 {webName} 自动插入站点名称。</template></a-form-item>
                        <div class="footer-config__grid">
                            <a-form-item label="快捷入口标题"><a-input v-model="formData.toolsFooterQuickTitle" :max-length="20" /></a-form-item>
                            <a-form-item label="友情链接标题"><a-input v-model="formData.toolsFooterFriendTitle" :max-length="20" /></a-form-item>
                            <a-form-item label="官方媒体标题"><a-input v-model="formData.toolsOfficialMediaTitle" :max-length="20" /></a-form-item>
                            <a-form-item label="技术支持标签"><a-input v-model="formData.toolsFooterSupportLabel" :max-length="20" /></a-form-item>
                        </div>
                    </a-form>
                    <section class="footer-config__section"><h2>备案与版权链接</h2><p class="footer-config__help">这是主站页脚链接；留空时沿用主站默认链接。</p><content-links-editor v-model="formData.toolsFooterRecordLinks" label="备案版权" sortable :disabled="!canOperate()" /></section>
                    <section class="footer-config__section"><h2>技术支持链接</h2><content-links-editor v-model="formData.toolsFooterSupportLinks" label="技术支持" sortable :disabled="!canOperate()" /></section>
                    <details class="footer-config__defaults"><summary>高级：填入项目默认页脚</summary><p class="footer-config__help">替换本页草稿，检查并保存后才会生效。</p><a-button :disabled="!canOperate()" @click="restoreFooterDefaults">填入默认配置</a-button></details>
                </template>
            </a-card>
            <template #actions><a-button v-perms="['setting:website:footer:save']" data-admin-smoke="website-footer-save" type="primary" :loading="isSubmitting" :disabled="!canEdit || !hasUnsavedChanges" @click="handleSubmit">保存配置</a-button></template>
        </config-edit-frame>
    </div>
</template>
<script setup lang="ts" name="websiteFooterSettings">
import { computed, onMounted, reactive, ref } from 'vue'
import AdminPageHeader from '@/components/page-header/index.vue'
import ConfigEditFrame from '@/components/config-edit-frame/index.vue'
import ConfigLinkGroupsEditor from './components/config-link-groups-editor.vue'
import ContentLinksEditor from './components/content-links-editor.vue'
import { getWebsite, setWebsite } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import useUserStore from '@/stores/modules/user'
import feedback from '@/utils/feedback'
import { useConfigEditor } from '@/composables/use-config-editor'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { OFFICIAL_SITE_DEFAULT_FOOTER } from './defaults/officialSite'
import { buildConfigFieldPatch, readConfigLinks, readConfigLinkGroups, type ConfigLink } from './composables/config-links'
import { isContentLink } from './composables/frontend-content'

const fieldLabels = {
    toolsFooterIntro: '页脚介绍文案', toolsFooterQuickTitle: '快捷入口标题', toolsFooterFriendTitle: '友情链接标题', toolsOfficialMediaTitle: '官方媒体标题', toolsFooterSupportLabel: '技术支持标签',
    toolsFooterSupportLinks: '技术支持链接', toolsFooterRecordLinks: '备案版权链接', toolsOfficialMediaLinks: '官方媒体链接', toolsFooterQuickSections: '快捷入口分组', toolsFooterFriendSections: '友情链接分组'
}
type FooterField = keyof typeof fieldLabels
type FooterForm = Record<FooterField, string>
type FooterSection = 'quick' | 'friends' | 'media' | 'copy'
const jsonFields: FooterField[] = ['toolsFooterSupportLinks', 'toolsFooterRecordLinks', 'toolsOfficialMediaLinks', 'toolsFooterQuickSections', 'toolsFooterFriendSections']
const groupFields: FooterField[] = ['toolsFooterQuickSections', 'toolsFooterFriendSections']
const formData = reactive<FooterForm>({ toolsFooterIntro: '', toolsFooterQuickTitle: '', toolsFooterFriendTitle: '', toolsOfficialMediaTitle: '', toolsFooterSupportLabel: '', toolsFooterSupportLinks: '[]', toolsFooterRecordLinks: '[]', toolsOfficialMediaLinks: '[]', toolsFooterQuickSections: '[]', toolsFooterFriendSections: '[]' })
const baselineFields = ref<FooterForm>({ ...formData })
const activeFooterSection = ref<FooterSection>('quick')
const appStore = useAppStore()
const userStore = useUserStore()
const canEdit = computed(() => userStore.perms.some(permission => permission === '*' || permission === 'setting:website:footer:save'))
/** 原始字符串构成唯一草稿；数组可视化不接管其他字段或丢弃扩展数据。 */
const buildFooterSnapshot = () => JSON.stringify(formData)
const { isLoadingData, hasLoadedData, loadErrorMessage, isSubmitting, lastSavedAt, submitError, hasUnsavedChanges, canOperate, loadConfiguration, reloadConfiguration, submitConfiguration } = useConfigEditor({ canEdit, snapshot: buildFooterSnapshot, successText: '页脚配置已保存' })
/** 将校验字段定位到对应任务页签，不让隐藏内容阻断保存而找不到位置。 */
const showIssue = (field: FooterField) => {
    activeFooterSection.value = field === 'toolsFooterQuickSections' ? 'quick' : field === 'toolsFooterFriendSections' ? 'friends' : field === 'toolsOfficialMediaLinks' ? 'media' : 'copy'
}
/** 记录损坏 JSON 的实际字段，保留原始内容并允许独立编辑其他正常字段。 */
const formatIssues = computed(() => jsonFields.flatMap(field => {
    try { groupFields.includes(field) ? readConfigLinkGroups(formData[field], fieldLabels[field]) : readConfigLinks(formData[field], fieldLabels[field]); return [] }
    catch (error) { return [{ field, message: error instanceof Error ? error.message : `${fieldLabels[field]}格式不正确` }] }
}))
/** 读取本页字段，合法 JSON 原文不重排，坏 JSON 保留以供修复，不回退成空数组。 */
const getData = () => loadConfiguration(async () => {
    const data = await getWebsite()
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('页脚配置响应无效')
    const next = {} as FooterForm
    for (const field of Object.keys(fieldLabels) as FooterField[]) {
        const value = data[field]
        next[field] = value === undefined ? (jsonFields.includes(field) ? '[]' : '') : typeof value === 'string' ? value : JSON.stringify(value)
    }
    Object.assign(formData, next)
    baselineFields.value = { ...next }
})
/** 检查链接必填项与协议，不改写地址、空白或扩展字段。 */
const invalidLinks = (items: ConfigLink[]) => items.some(item => !item.name.trim() || !item.link.trim() || !isContentLink(item.link))
/** 只校验待保存字段，未修改的历史异常不会被本次操作隐式替换。 */
const validateFooterPatch = (payload: FooterForm, patch: Partial<FooterForm>): { field: FooterField; message: string } | null => {
    for (const field of Object.keys(patch) as FooterField[]) {
        const label = fieldLabels[field]
        if (!jsonFields.includes(field)) {
            if (!payload[field].trim()) return { field, message: `请填写${label}` }
            continue
        }
        try {
            if (groupFields.includes(field)) {
                const groups = readConfigLinkGroups(payload[field], label)
                if (groups.some(group => !group.title.trim() || invalidLinks(group.items))) return { field, message: `${label}需要填写分组名称，以及每条链接的名称和有效地址` }
            } else if (invalidLinks(readConfigLinks(payload[field], label))) return { field, message: `${label}需要填写每条链接的名称和有效地址` }
        } catch (error) { return { field, message: error instanceof Error ? error.message : `${label}格式不正确` } }
    }
    return null
}
/** 保存独立字段补丁，成功建立已提交基线；失败保留原文及所有尚未提交编辑。 */
const handleSubmit = async () => {
    if (!canOperate() || !hasUnsavedChanges.value) return false
    const payload = { ...formData }
    const patch = buildConfigFieldPatch(payload, baselineFields.value)
    const error = validateFooterPatch(payload, patch)
    if (error) { showIssue(error.field); feedback.msgError(error.message); return false }
    const saved = await submitConfiguration(() => setWebsite(patch), JSON.stringify(payload))
    if (saved) baselineFields.value = payload
    return saved
}
/** 明确执行全页检查时定位首个问题，检查本身不修改表单。 */
const runFooterHealthCheck = () => {
    const error = validateFooterPatch({ ...formData }, { ...formData })
    if (error) { showIssue(error.field); feedback.msgError(error.message); return false }
    feedback.msgSuccess('页脚配置检查通过')
    return true
}
/** 重载前保护草稿，提交中或只读状态继续遵循公共编辑生命周期。 */
const reloadFooterData = () => reloadConfiguration(getData)
/** 只打开项目已有的主站预览地址，页面未保存内容不冒充已经生效。 */
const openToolsPreview = () => window.open(resolveToolsPreviewUrl(appStore.config), '_blank', 'noopener,noreferrer')
/** 用户明确选择后填入项目默认草稿，保存前保留重新加载恢复原值的能力。 */
const restoreFooterDefaults = async () => {
    if (!canOperate()) return false
    try { await feedback.confirm('将用项目默认内容替换本页草稿，检查并保存后才生效。确定继续吗？') } catch { return false }
    if (!canOperate()) return false
    const defaults = OFFICIAL_SITE_DEFAULT_FOOTER
    Object.assign(formData, { toolsFooterIntro: defaults.intro, toolsFooterQuickTitle: defaults.quickTitle, toolsFooterFriendTitle: defaults.friendTitle, toolsOfficialMediaTitle: defaults.officialMediaTitle, toolsFooterSupportLabel: defaults.supportLabel, toolsFooterSupportLinks: JSON.stringify(defaults.supportLinks, null, 2), toolsFooterRecordLinks: JSON.stringify(defaults.recordLinks, null, 2), toolsOfficialMediaLinks: JSON.stringify(defaults.officialMediaLinks, null, 2), toolsFooterQuickSections: JSON.stringify(defaults.quickSections, null, 2), toolsFooterFriendSections: JSON.stringify(defaults.friendSections, null, 2) })
    return true
}
onMounted(() => { void getData() })
</script>
<style scoped lang="scss">
.website-footer-settings { min-width: 0; }
.footer-config h2 { margin: 0 0 12px; font-size: 16px; color: var(--color-text-1); font-weight: 600; }
.footer-config__tabs { margin-bottom: 20px; }
.footer-config__help { margin: 0 0 20px; color: var(--color-text-3); font-size: 13px; line-height: 1.7; }
.footer-config__notice { margin-bottom: 16px; }
.footer-config__copy { max-width: 920px; }
.footer-config__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 20px; }
.footer-config__section { margin-top: 28px; padding-top: 24px; border-top: 1px solid var(--color-border-2); }
.footer-config__defaults { margin-top: 24px; }
.footer-config__defaults summary { cursor: pointer; font-size: 13px; color: var(--color-text-3); padding: 8px 0; }
@media (max-width: 600px) { .footer-config__grid { grid-template-columns: 1fr; } .footer-config :deep(.arco-card-body) { padding: 16px; } .footer-config :deep(button) { min-height: 44px; } }
</style>
