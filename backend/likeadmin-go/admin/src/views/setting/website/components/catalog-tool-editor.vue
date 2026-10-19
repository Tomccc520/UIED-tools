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
            <span role="status">共 {{ filteredRows.length }} 个工具</span>
        </div>
        <a-alert v-if="parseError" type="error" :closable="false">{{ parseError }}，原始配置已保留。</a-alert>
        <a-table v-else :data="filteredRows" row-key="key" :pagination="{ pageSize: 15, showTotal: true, showPageSize: true }" :scroll="{ x: 680 }" size="small">
            <template #columns>
                <a-table-column title="工具" :width="260">
                    <template #cell="{ record }">
                        <strong>{{ record.tool.title || '未命名工具' }}</strong>
                        <div class="catalog-editor__desc">{{ record.tool.desc || record.tool.url }}</div>
                    </template>
                </a-table-column>
                <a-table-column title="分类" :width="160"><template #cell="{ record }">{{ record.category }}<div class="catalog-editor__desc">{{ record.group }}</div></template></a-table-column>
                <a-table-column title="搜索与问答信息" :width="160"><template #cell="{ record }"><span>{{ record.tool.seoTitle && record.tool.seoDescription ? 'SEO 已填写' : 'SEO 待完善' }}</span><div class="catalog-editor__desc">{{ record.tool.geoSummary ? 'GEO 已填写' : 'GEO 待完善' }}</div></template></a-table-column>
                <a-table-column title="操作" :width="90" fixed="right">
                    <template #cell="{ record }"><a-button v-perms="['setting:website:catalog:save']" type="text" :disabled="disabled" :aria-label="`编辑${record.tool.title}`" @click="openEditor(record)">编辑</a-button></template>
                </a-table-column>
            </template>
            <template #empty><a-empty description="没有匹配的工具，请调整关键词或分类" /></template>
        </a-table>
        <a-drawer :visible="Boolean(selected)" :width="'min(640px, 100vw)'" :title="selected ? `编辑工具 · ${selected.tool.title}` : '编辑工具'" :mask-closable="false" :esc-to-close="false" :on-before-cancel="beforeDrawerCancel">
            <a-alert v-if="editError" type="error" role="alert" class="catalog-editor__notice">{{ editError }}</a-alert>
            <p class="catalog-editor__location">{{ selected?.category }} / {{ selected?.group }}</p>
            <a-tabs v-model:active-key="activeTab">
                <a-tab-pane key="basic" title="基本信息">
                    <a-form :model="draft" layout="vertical">
                        <a-form-item label="工具名称" required><a-input v-model="draft.title" :input-attrs="{ 'aria-label': '工具名称' }" :max-length="100" /></a-form-item>
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
                    <a-alert class="catalog-editor__notice">这里编辑工具的计费种子。应用到目录并保存后，仍需使用“同步计费策略”写入实际执行规则。</a-alert>
                    <a-form :model="draft" layout="vertical">
                        <a-form-item label="每次使用积分"><a-input-number v-model="draft.consumePoints" aria-label="每次使用积分" :min="0" :precision="0" placeholder="留空继承默认策略" /></a-form-item>
                        <a-form-item label="会员免扣积分"><a-select v-model="memberFreeMode" aria-label="会员免扣积分"><a-option value="inherit">继承默认策略</a-option><a-option value="yes">免扣积分</a-option><a-option value="no">按积分扣费</a-option></a-select></a-form-item>
                    </a-form>
                </a-tab-pane>
            </a-tabs>
            <template #footer><a-space><a-button @click="requestClose">取消</a-button><a-button type="primary" :disabled="disabled" @click="applyChanges">加入待保存更改</a-button></a-space></template>
        </a-drawer>
    </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import feedback from '@/utils/feedback'
import { flattenCatalogEditorTree, updateCatalogEditorTool, type CatalogEditorRow } from '../composables/tool-catalog-editor'

const props = withDefaults(defineProps<{ modelValue: string; disabled?: boolean }>(), { disabled: false })
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
    selected.value = row
    Object.keys(draft).forEach(key => delete draft[key])
    for (const key of ['title', 'desc', 'seoTitle', 'seoKeywords', 'seoDescription', 'seoImage', 'geoSummary', 'geoQuestions']) draft[key] = String(row.tool[key] || '')
    draft.consumePoints = row.tool.consumePoints
    tagText.value = Array.isArray(row.tool.tags) ? row.tool.tags.join(', ') : ''
    memberFreeMode.value = typeof row.tool.memberFree === 'boolean' ? row.tool.memberFree ? 'yes' : 'no' : 'inherit'
    activeTab.value = 'basic'
    editError.value = ''
    toolBaseline.value = JSON.stringify(row.tool)
    draftBaseline.value = getDraftSnapshot()
}
/** 用户放弃抽屉内容时确认，取消确认则继续保留草稿。 */
const confirmClose = async () => {
    if (!draftChanged.value) return true
    try { await feedback.confirm('工具编辑尚未加入待保存更改，确定放弃吗？'); return true } catch { return false }
}
/** 清除当前抽屉选中项，已应用到页面的目录更改由页面保存管理。 */
const closeEditor = () => { selected.value = null }
/** 点击取消时复用关闭确认，避免误丢正在编辑的工具。 */
const requestClose = async () => { if (await confirmClose()) closeEditor() }
/** Arco 的关闭拦截仅接受同步布尔值，先阻止自动关闭，再异步确认草稿是否可放弃。 */
const beforeDrawerCancel = () => { void requestClose(); return false }
/** 合并单个工具的修改到页面待保存目录；仅提交变化字段并检查编辑基线。 */
const applyChanges = () => {
    if (!selected.value || props.disabled) return
    try {
        const original = selected.value.tool
        const patch: Record<string, unknown> = {}
        for (const key of ['title', 'desc', 'seoTitle', 'seoKeywords', 'seoDescription', 'seoImage', 'geoSummary', 'geoQuestions', 'consumePoints']) {
            if (draft[key] !== (original[key] ?? (key === 'consumePoints' ? undefined : ''))) patch[key] = draft[key] ?? undefined
        }
        const tags = tagText.value.split(/[,，]/).map(tag => tag.trim()).filter(Boolean)
        if (JSON.stringify(tags) !== JSON.stringify(original.tags || [])) patch.tags = tags
        const memberFree = memberFreeMode.value === 'inherit' ? undefined : memberFreeMode.value === 'yes'
        if (memberFree !== original.memberFree) patch.memberFree = memberFree
        emit('update:modelValue', updateCatalogEditorTool(props.modelValue, selected.value.key, toolBaseline.value, patch))
        closeEditor()
        feedback.msgSuccess('已加入待保存更改，请点击页面“保存配置”后生效')
    } catch (error) { editError.value = error instanceof Error ? error.message : '工具编辑失败，原配置已保留' }
}
/** 页面刷新时保护抽屉中尚未加入目录的草稿。 */
const beforeUnload = (event: BeforeUnloadEvent) => { if (draftChanged.value) { event.preventDefault(); event.returnValue = '' } }
onBeforeRouteLeave(confirmClose)
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
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
.catalog-editor__location { color: var(--color-text-3); margin-top: 0; }
@media (max-width: 600px) { .catalog-editor__category { flex: 1; } }
</style>
