<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="role-page">
        <a-page-header title="角色管理" subtitle="统一管理后台角色、授权范围与成员规模。">
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>已选 {{ selectedRoleRows.length }}</a-tag>
                    <a-button data-admin-smoke="role-reset" @click="resetFilters">重置筛选</a-button>
                    <a-button data-admin-smoke="role-refresh" @click="refreshLists">
                        <template #icon>
                            <icon-refresh />
                        </template>
                        刷新
                    </a-button>
                    <a-button :disabled="selectedRoleRows.length === 0" @click="clearRoleSelection"
                        >清空选择</a-button
                    >
                    <a-button
                        v-perms="['system:role:del']"
                        status="danger"
                        :disabled="selectedRoleRows.length === 0"
                        @click="handleBatchDelete"
                    >
                        批量删除
                    </a-button>
                    <a-button data-admin-smoke="role-add" v-perms="['system:role:add']" type="primary" @click="handleAdd">
                        <template #icon>
                            <icon-plus />
                        </template>
                        新增角色
                    </a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 3 }" :col-gap="12" :row-gap="12" class="role-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">角色总数</div>
                    <div class="metric-value">{{ pager.count }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">已加载角色</div>
                    <div class="metric-value">{{ pager.lists.length }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">管理员总数</div>
                    <div class="metric-value">{{ memberTotal }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-card class="general-card" title="角色列表" :bordered="false">
            <a-grid :cols="{ xs: 1, md: 12 }" :col-gap="12" :row-gap="12" class="role-filter-grid">
                <a-grid-item :span="{ xs: 12, md: 5 }">
                    <a-input-search
                        v-model="queryForm.keyword"
                        data-admin-smoke="role-query"
                        placeholder="搜索角色名称或说明"
                        allow-clear
                        @search="queryRoles"
                        @clear="queryRoles"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <a-select
                        v-model="queryForm.memberScope"
                        placeholder="管理员人数"
                        @change="queryRoles"
                    >
                        <a-option value="all">全部角色</a-option>
                        <a-option value="hasMember">有人数</a-option>
                        <a-option value="noMember">无人使用</a-option>
                    </a-select>
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 2 }">
                    <div class="filter-result">
                        匹配 {{ pager.count }} 项 / 已选 {{ selectedRoleRows.length }} 项
                    </div>
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 2 }">
                    <div class="filter-action">
                        <a-button size="small" @click="resetFilters">重置</a-button>
                    </div>
                </a-grid-item>
            </a-grid>


            <div
                v-if="selectedRoleRows.length > 0 || actionFeedback.message"
                class="role-feedback-panel"
            >
                <div v-if="selectedRoleRows.length > 0" class="role-feedback-panel__selection">
                    <div class="role-feedback-panel__selection-main">
                        <div class="role-feedback-panel__selection-title">
                            当前已选择 {{ selectedRoleRows.length }} 项角色
                        </div>
                        <div class="role-feedback-panel__selection-desc">
                            建议优先确认这些角色是否仍被账号使用，再执行批量删除。
                        </div>
                    </div>
                    <a-space wrap>
                        <a-button @click="clearRoleSelection">清空选择</a-button>
                        <a-button
                            v-perms="['system:role:del']"
                            status="danger"
                            @click="handleBatchDelete"
                        >
                            批量删除
                        </a-button>
                    </a-space>
                </div>
                <a-alert
                    v-if="actionFeedback.message"
                    class="role-feedback-panel__notice"
                    :type="actionFeedback.type"
                    closable
                    @close="clearActionFeedback"
                >
                    {{ actionFeedback.message }}
                </a-alert>
            </div>

            <a-table
                class="mt-4"
                :data="pager.lists"
                :columns="roleColumns"
                :loading="pager.loading"
                :pagination="false"
                :bordered="false"
                row-key="id"
                :row-selection="rowSelection"
            >
                <template #action="{ record }">
                    <div class="row-actions">
                        <a-button
                            v-perms="['system:role:edit']"
                            type="text"
                            size="small"
                            @click="handleEdit(record)"
                        >
                            编辑
                        </a-button>
                        <a-button
                            v-perms="['system:role:edit']"
                            type="text"
                            size="small"
                            @click="handleAuth(record)"
                        >
                            权限设置
                        </a-button>
                        <a-button
                            v-perms="['system:role:del']"
                            type="text"
                            size="small"
                            status="danger"
                            @click="handleDelete(record.id)"
                        >
                            删除
                        </a-button>
                    </div>
                </template>
                <template #empty>
                    <a-empty :description="roleEmptyDescription">
                        <template #extra>
                            <a-space>
                                <a-button @click="resetFilters">重置筛选</a-button>
                                <a-button @click="refreshLists">重新加载</a-button>
                                <a-button v-perms="['system:role:add']" type="outline" @click="handleAdd">
                                    新增角色
                                </a-button>
                            </a-space>
                        </template>
                    </a-empty>
                </template>
            </a-table>

            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="fetchRoleLists" />
            </div>
        </a-card>

        <edit-popup
            v-if="showEdit"
            ref="editRef"
            @success="fetchRoleLists"
            @close="showEdit = false"
        />
        <auth-popup
            v-if="showAuth"
            ref="authRef"
            @success="fetchRoleLists"
            @close="showAuth = false"
        />
    </div>
</template>

<script lang="ts" setup name="role">
import type { TableColumnData } from '@arco-design/web-vue'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { roleAll, roleDelete, roleLists } from '@/api/perms/role'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'
import EditPopup from './edit.vue'
import AuthPopup from './auth.vue'

interface ActionFeedbackState {
    type: 'success' | 'warning' | 'error' | 'info'
    message: string
}

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
const authRef = shallowRef<InstanceType<typeof AuthPopup>>()
const showEdit = ref(false)
const showAuth = ref(false)
const queryForm = reactive({
    keyword: '',
    memberScope: 'all'
})
const actionFeedback = reactive<ActionFeedbackState>({
    type: 'info',
    message: ''
})
const { pager, getLists } = usePaging({
    fetchFun: roleLists,
    params: queryForm
})

/**
 * 函数说明：角色表格列定义，统一走 columns 模式，规避列插槽注入异常。
 */
const roleColumns: TableColumnData[] = [
    { dataIndex: 'id', title: 'ID', width: 90 },
    { dataIndex: 'name', title: '角色名称', width: 160 },
    { dataIndex: 'remark', title: '角色说明', width: 220, ellipsis: true, tooltip: true },
    { dataIndex: 'sort', title: '排序', width: 90 },
    { dataIndex: 'member', title: '管理员人数', width: 120 },
    { dataIndex: 'createTime', title: '创建时间', width: 180 },
    { dataIndex: 'action', title: '操作', width: 220, slotName: 'action', fixed: 'right' }
]
const roleTableData = computed<Record<string, any>[]>(() => {
    return Array.isArray(pager.lists) ? pager.lists : []
})
const memberTotal = computed(() =>
    roleTableData.value.reduce(
        (total, item: Record<string, any>) => total + Number(item.member || 0),
        0
    )
)

/**
 * 函数说明：输出角色页当前筛选标签，统一给工作区和空态描述使用。
 */
const roleFilterLabel = computed(() => {
    if (queryForm.memberScope === 'hasMember') {
        return '有人数'
    }
    if (queryForm.memberScope === 'noMember') {
        return '无人使用'
    }
    return '全部角色'
})

/**
 * 函数说明：生成角色页空态说明，让空列表时仍然给出明确下一步。
 */
const roleEmptyDescription = computed(() => {
    if (String(queryForm.keyword || '').trim() || queryForm.memberScope !== 'all') {
        return '当前筛选下没有匹配角色，建议先重置筛选再查看完整角色池。'
    }
    return '当前没有角色数据，建议先刷新或新增一条角色配置。'
})
const selectedRoleKeys = ref<Array<string | number>>([])
const selectedRoleRows = computed<Record<string, any>[]>(() => {
    if (!selectedRoleKeys.value.length) {
        return []
    }
    const selectedKeySet = new Set(selectedRoleKeys.value.map((item) => Number(item)))
    return roleTableData.value.filter((item) => selectedKeySet.has(Number(item.id)))
})
const rowSelection = computed(() => ({
    type: 'checkbox',
    showCheckedAll: true,
    selectedRowKeys: selectedRoleKeys.value,
    onChange: (keys: Array<string | number>) => {
        selectedRoleKeys.value = keys
    }
}))

/**
 * 函数说明：设置页面操作反馈消息，统一筛选/批量操作提示体验。
 */
const setActionFeedback = (type: ActionFeedbackState['type'], message: string) => {
    actionFeedback.type = type
    actionFeedback.message = message
}

/**
 * 函数说明：清空顶部操作反馈提示，减少页面视觉干扰。
 */
const clearActionFeedback = () => {
    actionFeedback.message = ''
}

/**
 * 函数说明：拉取角色列表，兼容分页接口异常时回退到角色全量接口，避免页面出现“空白无数据”。
 */
const fetchRoleLists = async () => {
    try {
        await getLists()
        if (roleTableData.value.length > 0 || pager.count > 0) {
            selectedRoleKeys.value = selectedRoleKeys.value.filter((key) =>
                roleTableData.value.some((item) => Number(item.id) === Number(key))
            )
            return
        }
        const hasQuery =
            String(queryForm.keyword || '').trim() !== '' ||
            String(queryForm.memberScope || 'all') !== 'all'
        if (!hasQuery) {
            const allRows = await roleAll()
            if (Array.isArray(allRows) && allRows.length > 0) {
                pager.lists = allRows as any[]
                pager.count = allRows.length
                selectedRoleKeys.value = selectedRoleKeys.value.filter((key) =>
                    roleTableData.value.some((item) => Number(item.id) === Number(key))
                )
            }
        }
    } catch (error) {
        setActionFeedback('error', '角色数据加载失败，请检查登录态或接口权限')
        feedback.msgError('角色数据加载失败，请检查登录态或接口权限')
    }
}

/**
 * 函数说明：执行角色筛选查询并回到第一页，确保条件变化后重新请求后端分页数据。
 */
const queryRoles = async () => {
    clearActionFeedback()
    selectedRoleKeys.value = []
    pager.page = 1
    await fetchRoleLists()
}

/**
 * 函数说明：刷新角色列表并提示用户当前数据已更新。
 */
const refreshLists = async () => {
    await fetchRoleLists()
    setActionFeedback('success', '角色列表已刷新')
    feedback.msgSuccess('角色列表已刷新')
}

/**
 * 函数说明：清空当前角色批量选择状态，避免误操作。
 */
const clearRoleSelection = () => {
    if (selectedRoleKeys.value.length === 0) {
        setActionFeedback('info', '当前没有已选角色')
        return
    }
    selectedRoleKeys.value = []
    setActionFeedback('info', '已清空角色选择')
}

/**
 * 函数说明：重置角色筛选条件，快速回到全量角色视图。
 */
const resetFilters = () => {
    queryForm.keyword = ''
    queryForm.memberScope = 'all'
    void queryRoles()
    setActionFeedback('info', '筛选条件已重置')
}

/**
 * 函数说明：打开新增角色弹窗
 */
const handleAdd = async () => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('add')
}

/**
 * 函数说明：打开编辑角色弹窗并回填详情
 */
const handleEdit = async (data: any) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    editRef.value?.setFormData(data)
}

/**
 * 函数说明：打开角色权限设置弹窗并回填角色信息
 */
const handleAuth = async (data: any) => {
    showAuth.value = true
    await nextTick()
    authRef.value?.open()
    authRef.value?.setFormData(data)
}

/**
 * 函数说明：删除角色并刷新列表
 */
const handleDelete = async (id: number) => {
    await feedback.confirm('确定要删除？')
    await roleDelete({ id })
    feedback.msgSuccess('删除成功')
    setActionFeedback('success', '角色删除成功')
    await fetchRoleLists()
}

/**
 * 函数说明：批量删除角色并输出成功/失败统计，方便运营快速回收无效角色。
 */
const handleBatchDelete = async () => {
    if (selectedRoleRows.value.length === 0) {
        setActionFeedback('warning', '请先选择要删除的角色')
        feedback.msgError('请先选择要删除的角色')
        return
    }
    await feedback.confirm(`确定删除已选择的 ${selectedRoleRows.value.length} 项角色吗？`)

    const targetIds = [...selectedRoleKeys.value]
        .map((item) => Number(item))
        .filter((id) => Number.isFinite(id))

    let successCount = 0
    let failedCount = 0
    for (const id of targetIds) {
        try {
            await roleDelete({ id })
            successCount++
        } catch {
            failedCount++
        }
    }

    if (successCount > 0 && failedCount === 0) {
        const successText = `批量删除完成：成功 ${successCount} 项`
        setActionFeedback('success', successText)
        feedback.msgSuccess(successText)
    } else if (successCount > 0 && failedCount > 0) {
        const warningText = `批量删除完成：成功 ${successCount} 项，失败 ${failedCount} 项`
        setActionFeedback('warning', warningText)
        feedback.msgSuccess(warningText)
    } else {
        setActionFeedback('error', '批量删除失败，请检查角色依赖或权限设置')
        feedback.msgError('批量删除失败，请检查角色依赖或权限设置')
    }
    if (failedCount > 0) {
        feedback.alertWarning('存在删除失败项（可能包含系统角色或仍被管理员绑定），请检查后重试')
    }
    selectedRoleKeys.value = []
    await fetchRoleLists()
}

onMounted(() => {
    void fetchRoleLists()
})
</script>

<style scoped lang="scss">
.role-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.role-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.9fr);
    gap: 12px;
}

.role-workspace__main,
.role-workspace__aside {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 14px;
    background: #fff;
    padding: 16px;
}

.role-workspace__eyebrow {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 9px;
    border-radius: 999px;
    border: 1px solid rgba(var(--primary-2), 0.6);
    background: rgba(var(--primary-1), 0.6);
    color: rgb(var(--primary-6));
    font-size: 12px;
    font-weight: 700;
}

.role-workspace__title {
    margin-top: 10px;
    font-size: 20px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.role-workspace__desc {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.65;
    color: var(--color-text-3, #86909c);
}

.role-workspace__meta {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.role-workspace__meta-item {
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
}

.role-workspace__meta-item span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.role-workspace__meta-item strong {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-1, #1d2129);
    word-break: break-all;
}

.role-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.role-workspace__checklist {
    margin-top: 10px;
    display: grid;
    gap: 8px;
}

.role-workspace__checklist-item {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
    padding: 10px 12px;
}

.role-workspace__checklist-item.is-ok {
    border-color: #d7ebde;
    background: #f7fcf8;
}

.role-workspace__checklist-item.is-warning {
    border-color: #f0dfb0;
    background: #fffaf0;
}

.role-workspace__checklist-label {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.role-workspace__checklist-value {
    margin-top: 4px;
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.role-workspace__checklist-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--color-text-3, #86909c);
}

.role-workspace__actions {
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

:deep(.arco-page-header) {
    border-radius: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    background: linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
}

:deep(.arco-page-header-wrapper) {
    padding: 16px 18px;
}

.role-metrics {
    .metric-card {
        border-radius: 12px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        .metric-label {
            font-size: 12px;
            color: var(--color-text-3, #86909c);
        }
        .metric-value {
            margin-top: 8px;
            font-size: 24px;
            font-weight: 700;
            color: var(--color-text-1, #1d2129);
        }
    }
}

:deep(.role-filter-grid) {
    align-items: center;
    .filter-result {
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        color: var(--color-text-3, #86909c);
        font-size: 12px;
    }
    .filter-action {
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
}

.role-filter-strip {
    margin-top: 12px;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.85fr);
    gap: 12px;
}

.role-filter-strip__summary,
.role-filter-strip__hint {
    border-radius: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    background: var(--color-fill-1, #f7f8fa);
    padding: 12px;
}

.role-filter-strip__summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
}

.role-filter-strip__chip {
    padding: 10px 12px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid rgba(229, 230, 235, 0.9);
}

.role-filter-strip__chip span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.role-filter-strip__chip strong {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-1, #1d2129);
    word-break: break-all;
}

.role-filter-strip__hint-label {
    font-size: 12px;
    font-weight: 700;
    color: rgb(var(--primary-6));
}

.role-filter-strip__hint-text {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-2, #4e5969);
}

.role-feedback-panel {
    display: grid;
    gap: 12px;
    margin-top: 14px;
}

.role-feedback-panel__selection {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 16px;
    border: 1px solid rgba(var(--primary-6), 0.14);
    border-radius: 12px;
    background: rgba(var(--primary-6), 0.06);
}

.role-feedback-panel__selection-main {
    min-width: 0;
}

.role-feedback-panel__selection-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.role-feedback-panel__selection-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-3, #86909c);
}

.role-feedback-panel__notice {
    margin: 0;
}

.row-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
}

:deep(.role-page .arco-card) {
    border-radius: 12px;
}

:deep(.role-page .arco-table-container) {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 10px;
}

:deep(.role-page .arco-table-th) {
    background: var(--color-fill-1, #f7f8fa);
}

@media (max-width: 900px) {
    .role-workspace,
    .role-workspace__meta,
    .role-filter-strip,
    .role-filter-strip__summary {
        grid-template-columns: 1fr;
    }

    .role-feedback-panel__selection {
        align-items: flex-start;
        flex-direction: column;
    }

    :deep(.role-filter-grid .filter-result),
    :deep(.role-filter-grid .filter-action) {
        justify-content: flex-start;
    }
}
</style>
