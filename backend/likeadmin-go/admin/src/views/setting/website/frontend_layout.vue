<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <div class="website-frontend-layout pro-page-shell">
        <admin-page-header title="学习与更新">
            <template #subtitle>维护首页文章栏目和网站更新记录。</template>
            <template #extra>
                <a-button data-admin-smoke="frontend-layout-preview" @click="openToolsHomePreview">预览首页</a-button>
                <a-button data-admin-smoke="frontend-layout-reload" :loading="isLoadingData" :disabled="isSubmitting" @click="retryLoadData">重新加载</a-button>
            </template>
        </admin-page-header>

        <config-edit-frame :loading="isLoadingData" :ready="hasLoadedData" :error="loadErrorMessage" :save-error="submitError" :dirty="hasUnsavedChanges" :saving="isSubmitting" :saved-at="lastSavedAt" @retry="retryLoadData">
            <a-alert v-if="validationMessage" class="content-message" type="warning" :closable="false" role="alert">{{ validationMessage }}</a-alert>
            <section class="content-panel">
                <a-tabs v-model:active-key="activeTab" class="layout-tabs" aria-label="内容模块" lazy-load>
                    <a-tab-pane key="homepageLearning" title="每日学习">
                        <div class="content-section-heading">
                            <div><h2>栏目显示</h2><p>在首页展示 UIED 文章。</p></div>
                            <label class="content-display-toggle"><span>在首页显示</span><a-switch v-model="homepageLearningEnabled" data-admin-smoke="frontend-layout-learning-enabled" aria-label="启用每日学习栏目" /></label>
                        </div>
                        <a-form :model="formData" layout="vertical" class="content-form compact-form">
                            <div class="content-form__pair">
                                <a-form-item label="栏目标题" required><a-input v-model="formData.toolsHomepageLearningTitle" placeholder="每日学习" :max-length="20" :input-attrs="{ 'aria-label': '栏目标题' }" /></a-form-item>
                                <a-form-item label="展示条数"><a-input-number v-model="homepageLearningLimit" :min="1" :max="50" :precision="0" aria-label="展示条数" /><template #extra>当前文章来源每次最多返回 20 条。</template></a-form-item>
                            </div>
                        </a-form>
                        <details class="content-optional content-source-settings" :open="learningSourceExpanded" @toggle="syncLearningSourceExpanded">
                            <summary><span>文章来源与筛选</span><small>{{ formData.toolsHomepageLearningFilterType === 'all' ? 'UIED · 全部文章' : 'UIED · 已设置分类筛选' }}</small></summary>
                            <a-form :model="formData" layout="vertical" class="content-form compact-form">
                                <a-form-item label="文章来源（RSS）" required><a-input v-model="formData.toolsHomepageLearningRssUrl" placeholder="https://www.uied.cn/api/open/v1/rss.xml" :input-attrs="{ 'aria-label': '文章来源' }" /><template #extra>支持 uied.cn 与 www.uied.cn 的 HTTPS RSS 地址。</template></a-form-item>
                                <a-form-item label="显示内容"><a-radio-group v-model="formData.toolsHomepageLearningFilterType" type="button" aria-label="文章筛选方式"><a-radio value="all">全部文章</a-radio><a-radio value="category_slug">按分类别名</a-radio><a-radio value="categories">按分类 ID</a-radio></a-radio-group></a-form-item>
                                <a-form-item v-if="formData.toolsHomepageLearningFilterType === 'category_slug'" label="分类别名" required><a-input v-model="formData.toolsHomepageLearningCategorySlug" placeholder="如：ai" /></a-form-item>
                                <a-form-item v-if="formData.toolsHomepageLearningFilterType === 'categories'" label="分类 ID" required><a-input v-model="formData.toolsHomepageLearningCategoryIds" placeholder="如：307，多个用英文逗号分隔" /></a-form-item>
                            </a-form>
                        </details>
                    </a-tab-pane>
                    <a-tab-pane key="pageOps" title="更新记录">
                        <div class="content-section-heading"><div><h2>版本记录</h2><p>新增版本或选择已有版本编辑。</p></div><a-button @click="openChangelogPreview">预览更新记录</a-button></div>
                        <content-timeline-editor v-model="formData.toolsChangelogTimeline" :default-value="defaultTimeline" />
                        <details class="content-optional" :open="pageOptionsExpanded" @toggle="syncPageOptionsExpanded">
                            <summary>页面文案、链接与开源说明</summary>
                            <a-form :model="formData" layout="vertical" class="content-form compact-form">
                                <a-form-item label="页面介绍"><a-textarea v-model="formData.toolsChangelogIntroText" :auto-size="{ minRows: 2, maxRows: 6 }" :textarea-attrs="{ 'aria-label': '更新记录页面介绍' }" /></a-form-item>
                                <a-form-item label="版本摘要"><a-input v-model="formData.toolsChangelogStatsText" :input-attrs="{ 'aria-label': '更新记录版本摘要' }" placeholder="如：当前版本与更新日期，可留空" /></a-form-item>
                            </a-form>
                            <h3>顶部链接</h3><content-links-editor v-model="formData.toolsChangelogHeaderLinks" label="顶部链接" />
                            <h3>资料链接</h3><content-links-editor v-model="formData.toolsChangelogMetaLinks" label="资料链接" />
                            <a-form :model="formData" layout="vertical" class="content-form compact-form">
                                <a-form-item label="开源说明标题"><a-input v-model="formData.toolsChangelogSplitTitle" /></a-form-item>
                                <a-form-item label="开源说明"><a-textarea v-model="formData.toolsChangelogSplitDesc" :auto-size="{ minRows: 2, maxRows: 6 }" /></a-form-item>
                                <a-form-item label="开源链接"><a-input v-model="formData.toolsChangelogSplitLink" placeholder="站内路径或 https:// 地址" /></a-form-item>
                                <a-form-item label="链接文字"><a-input v-model="formData.toolsChangelogSplitLinkText" /></a-form-item>
                            </a-form>
                        </details>
                    </a-tab-pane>
                </a-tabs>
            </section>
            <details class="content-transfer">
                <summary>高级维护：导入与导出</summary>
                <p>仅包含文章栏目与更新记录；其他页面配置不参与导入或保存。</p>
                <a-space wrap><a-button @click="openImport">导入配置</a-button><a-button @click="exportContent">导出本页</a-button></a-space>
            </details>
            <template #actions><a-button v-perms="['setting:website:frontendLayout:save']" data-admin-smoke="frontend-layout-save-top" type="primary" :loading="isSubmitting" :disabled="isLoadingData || !hasLoadedData || Boolean(loadErrorMessage) || !hasUnsavedChanges" @click="handleSubmit">保存网站内容</a-button></template>
        </config-edit-frame>
        <a-modal v-model:visible="importVisible" title="导入本页配置" :footer="false" unmount-on-close>
            <p>导入会替换文件中包含的本页字段。检查无误后再保存生效。</p>
            <a-textarea v-model="importSource" :rows="12" :textarea-attrs="{ 'aria-label': '导入配置 JSON' }" />
            <a-alert v-if="importError" class="content-message" type="error" :closable="false">{{ importError }}</a-alert>
            <div class="content-import-actions"><a-button @click="importVisible = false">取消</a-button><a-button type="primary" @click="applyImport">应用到草稿</a-button></div>
        </a-modal>
    </div>
</template>

<script setup lang="ts" name="websiteFrontendLayout">
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { getWebsite, setWebsite } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import AdminPageHeader from '@/components/page-header/index.vue'
import ConfigEditFrame from '@/components/config-edit-frame/index.vue'
import ContentTimelineEditor from './components/content-timeline-editor.vue'
import ContentLinksEditor from './components/content-links-editor.vue'
import { useConfigLoad } from '@/composables/use-config-load'
import { useOperateSubmit } from '@/composables/use-operate-submit'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { createFrontendContent, readFrontendContent, buildFrontendContentPatch, validateFrontendContent, frontendContentKeys, type FrontendContentForm } from './composables/frontend-content'
import defaultChangelogTimelineSource from './defaults/changelogTimeline'

const appStore = useAppStore()
const formData = reactive(createFrontendContent())
const baselineLayoutSnapshot = ref('')
const validationMessage = ref('')
const learningSourceExpanded = ref(false)
const pageOptionsExpanded = ref(false)
/** 同步原生折叠状态，校验失败后可展开对应来源设置并继续由用户控制。 */
const syncLearningSourceExpanded = (event: Event) => { learningSourceExpanded.value = (event.target as HTMLDetailsElement).open }
/** 保留页面设置的手动展开状态，不因普通草稿更新收起当前编辑区域。 */
const syncPageOptionsExpanded = (event: Event) => { pageOptionsExpanded.value = (event.target as HTMLDetailsElement).open }
const importVisible = ref(false)
const importSource = ref('')
const importError = ref('')
const defaultTimeline = JSON.stringify(defaultChangelogTimelineSource, null, 2)
const tabStorageKey = 'uied-frontend-layout-active-tab'
/** 恢复用户上次编辑的本页模块，不显示已经拆分到其他菜单的历史模块。 */
const readActiveTab = (): string => {
    try { return localStorage.getItem(tabStorageKey) === 'pageOps' ? 'pageOps' : 'homepageLearning' }
    catch { return 'homepageLearning' }
}
const activeTab = ref(readActiveTab())
/** 只记录界面选择，不把切换模块当作配置修改。 */
watch(activeTab, value => { try { localStorage.setItem(tabStorageKey, value) } catch { /* 存储受限时仍可编辑。 */ } })
const homepageLearningEnabled = computed({ get: () => formData.toolsHomepageLearningEnabled === '1', set: (value: boolean) => { formData.toolsHomepageLearningEnabled = value ? '1' : '0' } })
const homepageLearningLimit = computed({ get: () => Number(formData.toolsHomepageLearningLimit) || 20, set: (value: number | undefined) => { formData.toolsHomepageLearningLimit = String(value ?? '') } })
/** 对本页完整草稿建立快照，未知或其他页面字段永远不加入本页模型。 */
const buildLayoutSnapshot = (): string => JSON.stringify(formData)
/** 仅在读取成功或持久化确认后更新服务器基线。 */
const updateBaselineLayoutSnapshot = () => { baselineLayoutSnapshot.value = buildLayoutSnapshot() }
const hasUnsavedChanges = computed(() => Boolean(baselineLayoutSnapshot.value) && baselineLayoutSnapshot.value !== buildLayoutSnapshot())
const { isLoadingData, hasLoadedData, loadErrorMessage, loadConfiguration, reloadConfiguration } = useConfigLoad(hasUnsavedChanges)
const { isSubmitting, lastSavedAt, submitError, runSubmit } = useOperateSubmit('网站内容已保存')

/** 读取成功后一次回填；失败保留原草稿并由公共框架禁止提交。 */
const getData = () => loadConfiguration(async () => {
    const next = readFrontendContent(await getWebsite())
    Object.assign(formData, next)
    updateBaselineLayoutSnapshot()
    validationMessage.value = ''
    submitError.value = ''
})
/** 重新加载前确认未保存修改；保存过程中不启动并行读取。 */
const retryLoadData = async () => {
    if (isSubmitting.value) return
    await reloadConfiguration(getData)
}
/** 与服务器基线比较，只提交本页真正改变的字段。 */
const buildFrontendLayoutPayload = () => buildFrontendContentPatch(formData, JSON.parse(baselineLayoutSnapshot.value || '{}') as FrontendContentForm)
/** 校验本次修改范围并提交快照；失败保留草稿，保存后不重读整页覆盖新编辑。 */
const handleSubmit = async () => {
    if (isSubmitting.value || isLoadingData.value || !hasLoadedData.value || loadErrorMessage.value) return
    const payload = buildFrontendLayoutPayload()
    if (!Object.keys(payload).length) { feedback.msgSuccess('当前没有未保存更改'); return }
    const learningPatch = Object.fromEntries(Object.entries(payload).filter(([key]) => key.startsWith('toolsHomepageLearning')))
    const contentPatch = Object.fromEntries(Object.entries(payload).filter(([key]) => !key.startsWith('toolsHomepageLearning')))
    const learningError = validateFrontendContent(formData, learningPatch)
    validationMessage.value = learningError || validateFrontendContent(formData, contentPatch)
    if (validationMessage.value) {
        activeTab.value = learningError ? 'homepageLearning' : 'pageOps'
        if (learningError) learningSourceExpanded.value = true
        else {
            const pageOptionsPatch = Object.fromEntries(Object.entries(contentPatch).filter(([key]) => key !== 'toolsChangelogTimeline'))
            if (validateFrontendContent(formData, pageOptionsPatch)) pageOptionsExpanded.value = true
        }
        return
    }
    const submittedSnapshot = buildLayoutSnapshot()
    await runSubmit(async () => {
        await setWebsite(payload)
        baselineLayoutSnapshot.value = submittedSnapshot
    })
}
/** 打开主站预览，沿用环境和站点配置中的安全预览地址。 */
const openToolsHomePreview = () => window.open(resolveToolsPreviewUrl(appStore.config), '_blank', 'noopener,noreferrer')
/** 打开更新记录页预览，与主站其他预览使用同一地址解析规则。 */
const openChangelogPreview = () => window.open(resolveToolsPreviewUrl(appStore.config, '/changelog'), '_blank', 'noopener,noreferrer')
/** 打开导入面板，导入内容只进入草稿，不触发真实保存。 */
const openImport = () => { importSource.value = ''; importError.value = ''; importVisible.value = true }
/** 先完整解析导入数据，再只合并其中明确包含的本页字段，失败不改变草稿。 */
const applyImport = () => {
    try {
        const source = JSON.parse(importSource.value)
        const next = readFrontendContent(source)
        const keys = frontendContentKeys.filter(key => Object.prototype.hasOwnProperty.call(source, key))
        if (!keys.length) throw new Error('没有找到本页可导入的配置字段')
        for (const key of keys) formData[key] = next[key]
        importVisible.value = false
    } catch (error) { importError.value = error instanceof Error ? error.message : '配置格式不正确' }
}
/** 仅导出本页已加载的草稿，避免把其他业务和敏感配置放入下载文件。 */
const exportContent = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'uied-homepage-content.json'
    anchor.click()
    URL.revokeObjectURL(url)
}
/** 关闭或刷新页面前保护草稿；普通模块切换继续保留内存编辑。 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => { if (hasUnsavedChanges.value) { event.preventDefault(); event.returnValue = '' } }
onBeforeRouteLeave(async () => {
    if (!hasUnsavedChanges.value) return true
    try { await feedback.confirm('本页有未保存修改，确定离开吗？'); return true } catch { return false }
})
onMounted(() => { void getData(); window.addEventListener('beforeunload', handleBeforeUnload) })
onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload))
</script>

<style scoped lang="scss">
.website-frontend-layout { padding-bottom:24px; }
.content-panel { background:var(--color-bg-2);border:1px solid var(--uied-admin-border);border-radius:var(--uied-admin-radius);padding:8px 24px 24px; }
.content-section-heading { display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin:8px 0 24px; }
.content-section-heading h2 { margin:0;font-size:16px;font-weight:600; }
.content-section-heading p { margin:6px 0 0;font-size:13px;color:var(--color-text-3);line-height:1.7; }
.content-form { max-width:800px; }
.content-form__pair { display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,.6fr);gap:24px; }
.content-display-toggle { display:flex;align-items:center;gap:12px;white-space:nowrap;color:var(--color-text-2);font-size:13px; }
.content-form :deep(.arco-input-number) { width:160px; }
.content-message { margin-bottom:16px; }
.layout-tabs :deep(.arco-tabs-tab) { min-height:48px; }
.layout-tabs :deep(.arco-tabs-tab:focus-visible) { outline:2px solid var(--uied-admin-accent);outline-offset:-2px; }
.layout-tabs :deep(.arco-tabs-content) { padding-top:20px; }
.content-optional { margin-top:28px;border-top:1px solid var(--color-border-2);padding-top:16px; }
.content-optional summary,.content-transfer summary { padding:8px 0;cursor:pointer;font-size:13px;color:var(--color-text-2); }
.content-optional h3 { font-size:14px;margin:20px 0 12px; }
.content-source-settings { margin-top:12px; }
.content-source-settings summary small { margin-left:12px;color:var(--color-text-3);font-size:12px; }
.content-optional[open] > summary { margin-bottom:16px; }
.content-transfer { padding:12px 0 0; }
.content-transfer p { color:var(--color-text-3);font-size:12px;line-height:1.7;margin:0 0 12px; }
.content-import-actions { display:flex;justify-content:flex-end;gap:8px;margin-top:16px; }
@media(max-width:600px) { .content-panel { padding:4px 16px 16px; } .content-section-heading { flex-wrap:wrap;margin-bottom:20px; } .content-form__pair { grid-template-columns:1fr;gap:0; } .content-source-settings summary small { display:block;margin-left:14px;margin-top:4px; } .content-source-settings :deep(.arco-radio-group-button) { display:flex;flex-wrap:wrap; } .content-source-settings :deep(.arco-radio-button) { min-height:44px;white-space:nowrap; } }
</style>
