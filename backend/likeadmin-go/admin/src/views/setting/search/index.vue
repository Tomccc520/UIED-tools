<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="hot-search pro-page-shell">
        <admin-page-header title="热门搜索" description="维护搜索页推荐的关键词，排序值越大越靠前。">
            <template #extra><a-button :disabled="isSubmitting" :loading="isLoadingData" @click="reloadData">重新加载</a-button></template>
        </admin-page-header>
        <config-edit-frame :loading="isLoadingData" :ready="hasLoadedData" :error="loadErrorMessage" :save-error="submitError" :dirty="hasUnsavedChanges" :saving="isSubmitting" :saved-at="lastSavedAt" @retry="reloadData">
            <fieldset class="hot-search__fields" :disabled="!canEdit" :inert="!canEdit ? '' : undefined">
                <a-card :bordered="false" class="pro-panel-card">
                    <a-form :model="formData" layout="vertical">
                        <a-form-item label="显示热门搜索" class="!mb-0">
                            <div><a-switch v-model="formData.isHotSearch" :checked-value="1" :unchecked-value="0" aria-label="显示热门搜索" /><p class="hot-search__hint">关闭后保留关键词配置，前台不显示热门搜索。</p></div>
                        </a-form-item>
                    </a-form>
                </a-card>
                <a-card :bordered="false" class="pro-panel-card hot-search__keywords">
                    <div class="hot-search__heading"><h2>推荐关键词</h2><a-button v-perms="['setting:search:save']" @click="handleAdd"><template #icon><icon-plus /></template>添加关键词</a-button></div>
                    <a-empty v-if="!formData.list.length" description="还没有推荐关键词，点击添加关键词开始设置。" />
                    <div v-for="(item, index) in formData.list" :key="item.__rowKey" class="hot-search__row">
                        <label class="hot-search__name"><span>关键词 {{ index + 1 }}</span><a-input v-model="item.name" allow-clear placeholder="请输入关键词" :max-length="30" show-word-limit :aria-label="`关键词 ${index + 1}`" /></label>
                        <label><span>排序</span><a-input-number v-model="item.sort" :min="0" :max="9999" :precision="0" hide-button :aria-label="`关键词 ${index + 1} 排序`" /></label>
                        <a-button v-perms="['setting:search:save']" type="text" status="danger" :aria-label="`删除关键词 ${index + 1}`" @click="handleDel(index)">删除</a-button>
                    </div>
                </a-card>
            </fieldset>
            <section class="hot-search__preview" aria-label="关键词顺序预览">
                <h2>关键词顺序预览</h2><p v-if="!formData.isHotSearch" class="hot-search__hint">当前已关闭，保存后前台不显示以下关键词。</p>
                <div v-if="previewList.length" class="hot-search__tags"><a-tag v-for="item in previewList" :key="item.__rowKey">{{ item.name }}</a-tag></div><p v-else class="hot-search__hint">添加关键词后可在这里查看展示顺序。</p>
            </section>
            <template #actions><a-button v-perms="['setting:search:save']" type="primary" :loading="isSubmitting" :disabled="!canEdit || !hasUnsavedChanges" data-admin-smoke="hot-search-save" @click="handleSave">保存热门搜索</a-button></template>
        </config-edit-frame>
    </div>
</template>
<script setup lang="ts" name="search">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { getSearch, setSearch } from '@/api/setting/search'
import type { List, Search } from '@/api/setting/search'
import AdminPageHeader from '@/components/page-header/index.vue'
import ConfigEditFrame from '../website/components/config-edit-frame.vue'
import { useConfigLoad } from '../website/composables/use-config-load'
import { useOperateSubmit } from '../website/composables/use-operate-submit'
import useUserStore from '@/stores/modules/user'
import feedback from '@/utils/feedback'

interface SearchListItem extends List { __rowKey: string }
const formData = reactive<{ isHotSearch: number; list: SearchListItem[] }>({ isHotSearch: 1, list: [] })
const userStore = useUserStore()
/** 读取后台原有保存权限，界面和脚本入口使用同一门禁。 */
const canEdit = computed(() => userStore.perms.some(permission => permission === '*' || permission === 'setting:search:save'))
const { isSubmitting, lastSavedAt, submitError, runSubmit } = useOperateSubmit('热门搜索已保存')
const baselineSnapshot = ref('')
/** 排除仅供界面使用的行键，完整比较当前编辑值。 */
const buildSnapshot = () => JSON.stringify({ isHotSearch: formData.isHotSearch, list: formData.list.map(item => ({ name: item.name, sort: item.sort })) })
/** 首次读取之前不把默认表单视为可保存的草稿。 */
const hasUnsavedChanges = computed(() => Boolean(baselineSnapshot.value) && buildSnapshot() !== baselineSnapshot.value)
const { isLoadingData, hasLoadedData, loadErrorMessage, loadConfiguration, reloadConfiguration } = useConfigLoad(hasUnsavedChanges)
/** 读取失败、只读和正在提交时，禁止增删或发布配置。 */
const canOperate = () => canEdit.value && hasLoadedData.value && !isLoadingData.value && !isSubmitting.value && !loadErrorMessage.value
/** 为已验证的列表建立稳定行键，输入和排序时不会重新创建控件。 */
const normalizeList = (list: List[]): SearchListItem[] => list.map((item, index) => ({ name: item.name, sort: item.sort, __rowKey: `${Date.now()}-${index}-${Math.random().toString(16).slice(2, 8)}` }))
/** 按排序值生成独立预览，避免改变正在编辑的原列表顺序。 */
const previewList = computed(() => formData.list.filter(item => item.name.trim()).slice().sort((left, right) => right.sort - left.sort))
/** 先验证完整响应再回填；读取失败保留原草稿与保存基线。 */
const getData = async () => {
    if (isSubmitting.value) return false
    return loadConfiguration(async () => {
        const data = await getSearch() as Search
        if (!data || ![0, 1].includes(data.isHotSearch) || !Array.isArray(data.list) || data.list.some(item => !item || typeof item.name !== 'string' || !Number.isInteger(item.sort) || item.sort < 0)) throw new Error('热门搜索响应不完整')
        const nextList = normalizeList(data.list)
        formData.isHotSearch = data.isHotSearch
        formData.list = nextList
        baselineSnapshot.value = buildSnapshot()
        submitError.value = ''
    })
}
/** 在成功加载且具有权限后新增关键词草稿。 */
const handleAdd = () => {
    if (!canOperate()) return
    formData.list.push({ name: '', sort: 0, __rowKey: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}` })
}
/** 只移除合法索引对应的本地草稿，不直接提交服务器。 */
const handleDel = (index: number) => {
    if (!canOperate() || !Number.isInteger(index) || index < 0 || index >= formData.list.length) return
    formData.list.splice(index, 1)
}
/** 保存独立的提交快照；成功后不重读表单，避免覆盖后来编辑或误报读取失败。 */
const handleSave = async () => {
    if (!canOperate() || !hasUnsavedChanges.value) return false
    const payload: Search = { isHotSearch: formData.isHotSearch, list: formData.list.map(item => ({ name: item.name.trim(), sort: item.sort })) }
    if (![0, 1].includes(payload.isHotSearch) || payload.list.some(item => !item.name || item.name.length > 30 || !Number.isInteger(item.sort) || item.sort < 0 || item.sort > 9999)) { feedback.msgError('请填写 1–30 字的关键词，排序须为 0–9999 的整数。'); return false }
    const snapshot = JSON.stringify(payload)
    return runSubmit(async () => { await setSearch(payload); baselineSnapshot.value = snapshot })
}
/** 重新读取前保护草稿；提交期间不触发读取。 */
const reloadData = async () => {
    if (isSubmitting.value) return false
    return reloadConfiguration(getData)
}
/** 刷新或关闭浏览器前提示尚未保存的编辑。 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (hasUnsavedChanges.value || isSubmitting.value) { event.preventDefault(); event.returnValue = '' }
}
/** 离开页面前确认草稿，提交进行中不允许切走。 */
const confirmLeave = async () => {
    if (isSubmitting.value) return false
    if (!hasUnsavedChanges.value) return true
    try { await feedback.confirm('当前页面存在未保存更改，确定离开吗？'); return true } catch { return false }
}
onBeforeRouteLeave(confirmLeave)
onMounted(() => { void getData(); window.addEventListener('beforeunload', handleBeforeUnload) })
onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload))
</script>
<style scoped lang="scss">
.hot-search { min-width: 0; }
.hot-search__fields { min-width: 0; border: 0; padding: 0; margin: 0; }
.hot-search__keywords { margin-top: 16px; }
.hot-search__heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.hot-search h2 { margin: 0; font-size: 15px; font-weight: 600; color: var(--color-text-1); }
.hot-search__hint { margin: 8px 0 0; font-size: 12px; line-height: 1.7; color: var(--color-text-3); }
.hot-search__row { display: grid; grid-template-columns: minmax(0, 1fr) 110px 56px; gap: 12px; align-items: end; padding: 14px 0; border-top: 1px solid var(--color-border-1); }
.hot-search__row label { display: flex; min-width: 0; flex-direction: column; gap: 8px; font-size: 12px; color: var(--color-text-2); }
.hot-search__row :deep(.arco-input-wrapper), .hot-search__row :deep(.arco-input-number) { min-width: 0; width: 100%; }
.hot-search__preview { padding: 20px 0 0; }
.hot-search__tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.hot-search__tags :deep(.arco-tag) { max-width: 100%; white-space: normal; height: auto; overflow-wrap: anywhere; padding: 5px 10px; color: var(--uied-admin-accent); background: var(--uied-admin-accent-soft); }
@media (max-width: 600px) {
    .hot-search__row { grid-template-columns: minmax(0, 1fr) 64px; gap: 12px; }
    .hot-search__name { grid-column: 1 / -1; }
    .hot-search :deep(.arco-card-body) { padding: 16px; }
    .hot-search__heading button, .hot-search__row button { min-height: 44px; }
}
</style>
