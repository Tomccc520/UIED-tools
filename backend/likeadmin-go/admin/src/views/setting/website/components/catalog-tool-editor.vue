<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
-->
<template>
    <section class="catalog-editor" aria-label="工具管理">
        <div class="catalog-editor__filters">
            <a-input-search v-model="query" :input-attrs="{ 'aria-label': '搜索工具' }" placeholder="搜索工具名称、用途、链接或标识" allow-clear />
            <div class="catalog-editor__category"><a-select v-model="category" aria-label="筛选工具分类" placeholder="全部分类" allow-clear>
                <a-option v-for="name in categories" :key="name" :value="name">{{ name }}</a-option>
            </a-select></div>
            <span class="catalog-editor__count" role="status">{{ filteredRows.length }} 个工具</span>
        </div>
        <a-alert v-if="parseError" type="error" :closable="false">{{ parseError }}，原始配置已保留。</a-alert>
        <a-table v-else :data="filteredRows" row-key="key" :pagination="{ pageSize: 15, showTotal: true, showPageSize: true }" :scroll="{ x: 820 }" size="small">
            <template #columns>
                <a-table-column title="工具" :width="260">
                    <template #cell="{ record }">
                        <strong>{{ record.tool.title || '未命名工具' }}</strong>
                        <div class="catalog-editor__desc">{{ record.tool.desc || record.tool.url }}</div>
                        <code class="catalog-editor__route">{{ record.tool.url }}</code>
                    </template>
                </a-table-column>
                <a-table-column title="分类" :width="160"><template #cell="{ record }">{{ record.category }}<div class="catalog-editor__desc">{{ record.group }}</div></template></a-table-column>
                <a-table-column title="状态" :width="100"><template #cell="{ record }"><span class="catalog-editor__state" :class="{ 'is-disabled': record.tool.status === 0 }">{{ record.tool.status === 0 ? '已停用' : '已启用' }}</span></template></a-table-column>
                <a-table-column title="搜索与问答信息" :width="160"><template #cell="{ record }"><span>{{ record.tool.seoTitle && record.tool.seoDescription ? 'SEO 已填写' : 'SEO 待完善' }}</span><div class="catalog-editor__desc">{{ record.tool.geoSummary ? 'GEO 已填写' : 'GEO 待完善' }}</div></template></a-table-column>
                <a-table-column title="操作" :width="120" fixed="right">
                    <template #cell="{ record }"><div class="catalog-editor__row-actions"><a-button v-perms="['setting:website:catalog:save']" type="text" :disabled="disabled || !canEdit" :aria-label="`编辑${record.tool.title}`" @click="openEditor(record)">编辑</a-button><a v-if="resolveCatalogPreviewHref(record.tool.url, previewBase)" :href="resolveCatalogPreviewHref(record.tool.url, previewBase)" target="_blank" rel="noopener noreferrer" :aria-label="`预览${record.tool.title}`">预览</a></div></template>
                </a-table-column>
            </template>
            <template #empty><a-empty description="没有匹配的工具，请调整关键词或分类" /></template>
        </a-table>
        <a-drawer :visible="Boolean(selected)" :width="'min(640px, 100vw)'" :title="selected ? `编辑工具 · ${selected.tool.title}` : '编辑工具'" :mask-closable="false" :esc-to-close="false" :on-before-cancel="beforeDrawerCancel">
            <a-alert v-if="editError" type="error" role="alert" class="catalog-editor__notice">{{ editError }}</a-alert>
            <div class="catalog-editor__identity"><div><p class="catalog-editor__location">{{ selected?.category }} / {{ selected?.group }}</p><code>{{ selected?.tool.url }}</code></div><a v-if="previewHref" :href="previewHref" target="_blank" rel="noopener noreferrer">打开工具预览 ↗</a></div>
            <a-alert v-if="pendingChanges" type="warning" class="catalog-editor__notice" :closable="false">列表还有未保存更改。请先统一保存，或将本次修改应用到列表后一起保存。</a-alert>
            <fieldset :disabled="disabled || isPersisting || !canEdit" :inert="disabled || isPersisting || !canEdit ? '' : undefined" class="catalog-editor__fields">
            <a-tabs v-model:active-key="activeTab">
                <a-tab-pane key="basic" title="基本信息">
                    <a-form :model="draft" layout="vertical">
                        <a-form-item label="工具名称" required><a-input v-model="draft.title" :input-attrs="{ 'aria-label': '工具名称' }" :max-length="100" /></a-form-item>
                        <a-form-item label="工具状态"><a-select v-model="draft.status" aria-label="工具状态" allow-clear placeholder="默认启用"><a-option :value="1">已启用</a-option><a-option :value="0">已停用</a-option></a-select></a-form-item>
                        <a-form-item label="工具简介"><a-textarea v-model="draft.desc" :textarea-attrs="{ 'aria-label': '工具简介' }" :auto-size="{ minRows: 3, maxRows: 8 }" /></a-form-item>
                        <a-form-item label="标签"><a-input v-model="tagText" :input-attrs="{ 'aria-label': '工具标签' }" placeholder="用中文或英文逗号分隔" /></a-form-item>
                        <a-form-item label="工具链接"><a-input :model-value="String(selected?.tool.url || '')" readonly /><template #extra>工具链接决定路由和计费匹配，如需调整请使用高级编辑。</template></a-form-item>
                    </a-form>
                </a-tab-pane>
                <a-tab-pane key="seo" title="SEO">
                    <a-form :model="draft" layout="vertical">
                        <a-form-item label="搜索标题"><a-input v-model="draft.seoTitle" :input-attrs="{ 'aria-label': '工具搜索标题' }" :max-length="100" /></a-form-item>
                        <a-form-item label="关键词"><a-input v-model="draft.seoKeywords" :input-attrs="{ 'aria-label': '工具关键词' }" /></a-form-item>
                        <a-form-item label="搜索描述"><a-textarea v-model="draft.seoDescription" :textarea-attrs="{ 'aria-label': '工具搜索描述' }" :auto-size="{ minRows: 4, maxRows: 8 }" /></a-form-item>
                        <a-form-item label="分享图链接"><a-input v-model="draft.seoImage" :input-attrs="{ 'aria-label': '工具分享图链接' }" /></a-form-item>
                    </a-form>
                </a-tab-pane>
                <a-tab-pane key="geo" title="GEO">
                    <a-form :model="draft" layout="vertical">
                        <a-form-item label="工具介绍摘要"><a-textarea v-model="draft.geoSummary" :textarea-attrs="{ 'aria-label': '工具介绍摘要' }" :auto-size="{ minRows: 4, maxRows: 8 }" /></a-form-item>
                        <a-form-item label="常见问题"><a-textarea v-model="draft.geoQuestions" :textarea-attrs="{ 'aria-label': '工具常见问题' }" :auto-size="{ minRows: 6, maxRows: 12 }" /><template #extra>供工具介绍与问答内容使用，保留现有问题格式。</template></a-form-item>
                    </a-form>
                </a-tab-pane>
                <a-tab-pane key="policy" title="计费种子">
                    <a-alert class="catalog-editor__notice">这里保存的是目录中的计费种子，不会直接改变实际扣费。保存工具后，还需到“批量维护与同步”执行“同步计费策略”。</a-alert>
                    <a-form :model="draft" layout="vertical">
                        <a-form-item label="每次使用积分"><a-input-number v-model="draft.consumePoints" aria-label="每次使用积分" :min="0" :precision="0" placeholder="留空继承默认策略" /></a-form-item>
                        <a-form-item label="会员免扣积分"><a-select v-model="memberFreeMode" aria-label="会员免扣积分"><a-option value="inherit">继承默认策略</a-option><a-option value="yes">免扣积分</a-option><a-option value="no">按积分扣费</a-option></a-select></a-form-item>
                    </a-form>
                </a-tab-pane>
            </a-tabs>
            </fieldset>
            <template #footer>
                <div class="catalog-editor__footer">
                    <p>{{ pendingChanges ? '应用到列表后，使用页面保存条统一生效。' : '保存成功后立即生效，无需再点页面保存。' }}</p>
                    <div class="catalog-editor__footer-actions">
                        <a-button :disabled="isPersisting" @click="requestClose">取消</a-button>
                        <a-button v-perms="['setting:website:catalog:save']" :disabled="disabled || isPersisting || !canEdit || !draftChanged" data-admin-smoke="tools-catalog-tool-apply" @click="applyChanges">应用到列表</a-button>
                        <a-button v-if="persistChanges" v-perms="['setting:website:catalog:save']" type="primary" :loading="isPersisting" :disabled="disabled || isPersisting || !canEdit || pendingChanges || !draftChanged" data-admin-smoke="tools-catalog-tool-save" @click="saveChanges">保存工具并生效</a-button>
                    </div>
                </div>
            </template>
        </a-drawer>
    </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import feedback from '@/utils/feedback'
import { flattenCatalogEditorTree, updateCatalogEditorTool, resolveCatalogPreviewHref, type CatalogEditorRow } from '../composables/tool-catalog-editor'

const props = withDefaults(defineProps<{ modelValue: string; disabled?: boolean; canEdit?: boolean; pendingChanges?: boolean; previewBase?: string; persistChanges?: (nextValue: string, sourceValue: string) => Promise<boolean> }>(), { disabled: false, canEdit: false, pendingChanges: false, previewBase: '' })
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
const query = ref('')
const category = ref('')
const selected = ref<CatalogEditorRow | null>(null)
const draft = reactive<Record<string, any>>({})
const tagText = ref('')
const memberFreeMode = ref('inherit')
const activeTab = ref('basic')
const editError = ref('')
const draftBaseline = ref('')
const toolBaseline = ref('')
const isPersisting = ref(false)
let disposed = false
const previewHref = computed(() => resolveCatalogPreviewHref(selected.value?.tool.url, props.previewBase))

/** 解析最新目录供表格展示；失败保留输入并显示错误，不生成空目录覆盖原配置。 */
const parsed = computed(() => {
    try { return { rows: flattenCatalogEditorTree(props.modelValue), error: '' } }
    catch (error) { return { rows: [] as CatalogEditorRow[], error: error instanceof Error ? error.message : '配置格式错误' } }
})
const parseError = computed(() => parsed.value.error)
const categories = computed(() => [...new Set(parsed.value.rows.map(row => row.category))])
/** 根据名称、描述、标识和分类即时筛选工具，分页只渲染当前结果。 */
const filteredRows = computed(() => {
    const keyword = query.value.trim().toLocaleLowerCase()
    return parsed.value.rows.filter(row => (!category.value || row.category === category.value)
        && (!keyword || [row.tool.title, row.tool.desc, row.tool.url, row.tool.toolKey, ...(Array.isArray(row.tool.tags) ? row.tool.tags : [])].join(' ').toLocaleLowerCase().includes(keyword)))
})
/** 记录抽屉内编辑快照，关闭前检查尚未加入页面的更改。 */
const getDraftSnapshot = () => JSON.stringify({ draft, tags: tagText.value, memberFree: memberFreeMode.value })
const draftChanged = computed(() => Boolean(selected.value) && draftBaseline.value !== getDraftSnapshot())

/** 打开单个工具的副本；保存前不更改目录，其余扩展字段由原始数据继续保留。 */
const openEditor = (row: CatalogEditorRow) => {
    if (props.disabled || !props.canEdit || isPersisting.value) return
    selected.value = row
    Object.keys(draft).forEach(key => delete draft[key])
    for (const key of ['title', 'desc', 'seoTitle', 'seoKeywords', 'seoDescription', 'seoImage', 'geoSummary', 'geoQuestions']) draft[key] = String(row.tool[key] || '')
    draft.consumePoints = row.tool.consumePoints
    draft.status = row.tool.status
    tagText.value = Array.isArray(row.tool.tags) ? row.tool.tags.join(', ') : ''
    memberFreeMode.value = typeof row.tool.memberFree === 'boolean' ? row.tool.memberFree ? 'yes' : 'no' : 'inherit'
    activeTab.value = 'basic'
    editError.value = ''
    toolBaseline.value = JSON.stringify(row.tool)
    draftBaseline.value = getDraftSnapshot()
}
/** 用户放弃抽屉内容时确认，取消确认则继续保留草稿。 */
const confirmClose = async () => {
    if (isPersisting.value) return false
    if (!draftChanged.value) return true
    try { await feedback.confirm('工具编辑尚未保存，确定放弃本次修改吗？'); return true } catch { return false }
}
/** 清除当前抽屉选中项，已应用到页面的目录更改由页面保存管理。 */
const closeEditor = () => { selected.value = null }
/** 点击取消时复用关闭确认，避免误丢正在编辑的工具。 */
const requestClose = async () => { if (await confirmClose()) closeEditor() }
/** Arco 的关闭拦截仅接受同步布尔值，先阻止自动关闭，再异步确认草稿是否可放弃。 */
const beforeDrawerCancel = () => { void requestClose(); return false }
/** 根据抽屉副本生成字段级补丁，合并时保留其它工具与未识别扩展字段。 */
const buildNextCatalog = (): string => {
    if (!selected.value) throw new Error('请先选择要编辑的工具')
    const original = selected.value.tool
    const patch: Record<string, unknown> = {}
    for (const key of ['title', 'desc', 'seoTitle', 'seoKeywords', 'seoDescription', 'seoImage', 'geoSummary', 'geoQuestions', 'status', 'consumePoints']) {
        if (draft[key] !== (original[key] ?? (key === 'consumePoints' || key === 'status' ? undefined : ''))) patch[key] = draft[key] ?? undefined
    }
    const tags = tagText.value.split(/[,，]/).map(tag => tag.trim()).filter(Boolean)
    if (JSON.stringify(tags) !== JSON.stringify(original.tags || [])) patch.tags = tags
    const memberFree = memberFreeMode.value === 'inherit' ? undefined : memberFreeMode.value === 'yes'
    if (memberFree !== original.memberFree) patch.memberFree = memberFree
    return updateCatalogEditorTool(props.modelValue, selected.value.key, toolBaseline.value, patch)
}

/** 应用到页面草稿供多工具批量编辑，不触发持久化，也不提示已发布。 */
const applyChanges = () => {
    if (!selected.value || props.disabled || !props.canEdit || isPersisting.value || !draftChanged.value) return
    try {
        emit('update:modelValue', buildNextCatalog())
        closeEditor()
        feedback.msgSuccess('已应用到列表，统一保存后生效')
    } catch (error) { editError.value = error instanceof Error ? error.message : '工具编辑失败，原配置已保留' }
}

/** 等待父页完成真实保存；失败保留抽屉草稿，已有列表草稿时禁止暗中连带发布。 */
const saveChanges = async () => {
    if (!selected.value || props.disabled || !props.canEdit || isPersisting.value || !draftChanged.value || !props.persistChanges) return
    if (props.pendingChanges) { editError.value = '列表还有未保存更改，请先统一保存，或应用本次修改后一并保存。'; return }
    editError.value = ''
    let nextValue: string
    try { nextValue = buildNextCatalog() }
    catch (error) { editError.value = error instanceof Error ? error.message : '工具编辑无效，请检查后重试。'; return }
    const sourceValue = props.modelValue
    try {
        isPersisting.value = true
        const success = await props.persistChanges(nextValue, sourceValue)
        if (disposed) return
        if (success) closeEditor()
        else editError.value = '工具未保存，您的修改已保留。请检查页面提示后重试。'
    } catch { if (!disposed) editError.value = '工具保存失败，您的修改已保留，请重试。' }
    finally { if (!disposed) isPersisting.value = false }
}
/** 页面刷新时保护抽屉中尚未加入目录的草稿。 */
const beforeUnload = (event: BeforeUnloadEvent) => { if (draftChanged.value || isPersisting.value) { event.preventDefault(); event.returnValue = '' } }
onBeforeRouteLeave(confirmClose)
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => { disposed = true; window.removeEventListener('beforeunload', beforeUnload) })
</script>

<style scoped lang="scss">
.catalog-editor { min-width: 0; margin-top: 16px; }
.catalog-editor__filters { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-bottom: 16px;
    > :first-child { flex: 1 1 260px; }
    > span { color: var(--color-text-3); font-size: 13px; }
}
.catalog-editor__category { flex: 0 0 180px; min-width: 0; }
.catalog-editor__desc { margin-top: 4px; color: var(--color-text-3); font-size: 12px; white-space: normal; overflow-wrap: anywhere; }
.catalog-editor__notice { margin-bottom: 16px; }
.catalog-editor__location { color: var(--color-text-3); margin: 0 0 6px; }
.catalog-editor__route { display: block; margin-top: 6px; color: var(--color-text-3); font-size: 11px; overflow-wrap: anywhere; }
.catalog-editor__row-actions { display: flex; align-items: center; gap: 8px; }
.catalog-editor__row-actions a, .catalog-editor__identity a { color: rgb(var(--primary-6)); text-decoration: none; font-size: 13px; }
.catalog-editor__row-actions a:hover, .catalog-editor__identity a:hover { text-decoration: underline; }
.catalog-editor__state { color: var(--color-text-2); font-size: 12px; }
.catalog-editor__state.is-disabled { color: var(--color-text-3); }
.catalog-editor__identity { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
.catalog-editor__identity code { color: var(--color-text-3); font-size: 12px; overflow-wrap: anywhere; }
.catalog-editor__identity a { flex-shrink: 0; }
.catalog-editor__fields { border: 0; min-width: 0; padding: 0; margin: 0; }
.catalog-editor__footer { display: flex; flex-direction: column; gap: 12px; }
.catalog-editor__footer p { margin: 0; color: var(--color-text-3); font-size: 12px; text-align: left; line-height: 1.6; }
.catalog-editor__footer-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.catalog-editor__count { white-space: nowrap; }
@media (max-width: 600px) { .catalog-editor__identity { flex-direction: column; } .catalog-editor__footer-actions > :last-child { flex: 1 1 100%; } }
@media (max-width: 600px) { .catalog-editor__category { flex: 1; } }
</style>
