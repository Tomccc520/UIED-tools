<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-27
 */
-->
<template>
    <div class="admin-page">
        <a-page-header title="管理员管理" subtitle="统一维护后台管理员账号、状态与角色归属。">
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>已选 {{ selectedAdminRows.length }}</a-tag>
                    <a-button data-admin-smoke="admin-query" @click="queryAdmins">查询</a-button>
                    <a-button data-admin-smoke="admin-reset" @click="resetFilters">重置筛选</a-button>
                    <a-button data-admin-smoke="admin-refresh" @click="refreshLists">
                        <template #icon>
                            <icon-refresh />
                        </template>
                        刷新
                    </a-button>
                    <a-button
                        :disabled="selectedAdminRows.length === 0"
                        @click="clearAdminSelection"
                    >
                        清空选择
                    </a-button>
                    <a-button
                        v-perms="['system:admin:del']"
                        status="danger"
                        :disabled="selectedAdminRows.length === 0"
                        @click="handleBatchDelete"
                    >
                        批量删除
                    </a-button>
                    <a-button data-admin-smoke="admin-add" v-perms="['system:admin:add']" type="primary" @click="handleAdd">
                        <template #icon>
                            <icon-plus />
                        </template>
                        新增管理员
                    </a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 2, lg: 4 }" :col-gap="12" :row-gap="12" class="admin-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">管理员总数</div>
                    <div class="metric-value">{{ pager.count }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">当前页已加载</div>
                    <div class="metric-value">{{ adminTableData.length }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">启用账号</div>
                    <div class="metric-value">{{ metrics.active }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">停用账号</div>
                    <div class="metric-value is-warning">{{ metrics.disabled }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-card class="general-card" title="管理员列表" :bordered="false">
            <a-grid :cols="{ xs: 1, md: 12 }" :col-gap="12" :row-gap="12" class="admin-filter-grid">
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <a-input
                        v-model="queryForm.username"
                        placeholder="管理员账号"
                        allow-clear
                        @press-enter="queryAdmins"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <a-input
                        v-model="queryForm.nickname"
                        placeholder="管理员名称"
                        allow-clear
                        @press-enter="queryAdmins"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <a-select v-model="queryForm.role" placeholder="管理员角色" allow-clear>
                        <a-option :value="-1">全部角色</a-option>
                        <a-option
                            v-for="(item, index) in roleOptions"
                            :key="index"
                            :value="item.id"
                        >
                            {{ item.name }}
                        </a-option>
                    </a-select>
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 2 }">
                    <a-select v-model="queryForm.isDisable" placeholder="账号状态">
                        <a-option :value="-1">全部状态</a-option>
                        <a-option :value="0">启用</a-option>
                        <a-option :value="1">停用</a-option>
                    </a-select>
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 1 }">
                    <div class="filter-result">
                        总计 {{ pager.count }} / 当前页 {{ adminTableData.length }}
                    </div>
                </a-grid-item>
            </a-grid>


            <div
                v-if="selectedAdminRows.length > 0 || actionFeedback.message"
                class="admin-feedback-panel"
            >
                <div v-if="selectedAdminRows.length > 0" class="admin-feedback-panel__selection">
                    <div class="admin-feedback-panel__selection-main">
                        <div class="admin-feedback-panel__selection-title">
                            当前已选择 {{ selectedAdminRows.length }} 位管理员
                        </div>
                        <div class="admin-feedback-panel__selection-desc">
                            建议先确认是否包含系统管理员，再执行批量删除或清空选择。
                        </div>
                    </div>
                    <a-space wrap>
                        <a-button @click="clearAdminSelection">清空选择</a-button>
                        <a-button
                            v-perms="['system:admin:del']"
                            status="danger"
                            @click="handleBatchDelete"
                        >
                            批量删除
                        </a-button>
                    </a-space>
                </div>
                <a-alert
                    v-if="actionFeedback.message"
                    class="admin-feedback-panel__notice"
                    :type="actionFeedback.type"
                    closable
                    @close="clearActionFeedback"
                >
                    {{ actionFeedback.message }}
                </a-alert>
            </div>

            <a-table
                class="mt-4"
                :data="adminTableData"
                :columns="adminColumns"
                :loading="pager.loading"
                :pagination="false"
                :bordered="false"
                row-key="id"
                :row-selection="rowSelection"
            >
                <template #avatar="{ record }">
                    <a-avatar :size="40" :image-url="record.avatar" />
                </template>
                <template #isDisable="{ record }">
                    <a-tag v-if="Number(record.isDisable) === 0" color="green">启用</a-tag>
                    <a-tag v-else color="red">停用</a-tag>
                </template>
                <template #statusAction="{ record }">
                    <a-switch
                        v-if="Number(record.id) !== 1"
                        v-perms="['system:admin:disable']"
                        :model-value="record.isDisable"
                        :checked-value="0"
                        :unchecked-value="1"
                        @change="changeStatus(record)"
                    />
                    <a-tag v-else color="arcoblue" bordered>系统管理员</a-tag>
                </template>
                <template #action="{ record }">
                    <div class="row-actions">
                        <a-button
                            v-perms="['system:admin:edit']"
                            type="text"
                            size="small"
                            @click="handleEdit(record)"
                        >
                            编辑
                        </a-button>
                        <a-button
                            v-if="Number(record.id) !== 1"
                            v-perms="['system:admin:del']"
                            type="text"
                            size="small"
                            status="danger"
                            @click="handleDelete(Number(record.id))"
                        >
                            删除
                        </a-button>
                    </div>
                </template>
                <template #empty>
                    <a-empty :description="adminEmptyDescription">
                        <template #extra>
                            <a-space>
                                <a-button @click="resetFilters">重置筛选</a-button>
                                <a-button @click="refreshLists">重新加载</a-button>
                                <a-button v-perms="['system:admin:add']" type="outline" @click="handleAdd">
                                    新增管理员
                                </a-button>
                            </a-space>
                        </template>
                    </a-empty>
                </template>
            </a-table>

            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="fetchAdminLists" />
            </div>
        </a-card>

        <edit-popup
            v-if="showEdit"
            ref="editRef"
            @success="fetchAdminLists"
            @close="showEdit = false"
        />
    </div>
</template>

<script lang="ts" setup name="permissionAdmin">
import type { TableColumnData } from '@arco-design/web-vue'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { adminDelete, adminLists, adminStatus } from '@/api/perms/admin'
import { roleAll } from '@/api/perms/role'
import { useDictOptions } from '@/hooks/useDictOptions'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'
import EditPopup from './edit.vue'

interface ActionFeedbackState {
    type: 'success' | 'warning' | 'error' | 'info'
    message: string
}

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
const showEdit = ref(false)
const selectedAdminKeys = ref<Array<string | number>>([])
const actionFeedback = reactive<ActionFeedbackState>({
    type: 'info',
    message: ''
})
const queryForm = reactive<Record<string, any>>({
    username: '',
    nickname: '',
    role: -1,
    isDisable: -1
})

const { optionsData } = useDictOptions<{
    role: Array<{ id: number | string; name: string }>
}>({
    role: {
        api: roleAll
    }
})
const roleOptions = computed(() => (Array.isArray(optionsData.role) ? optionsData.role : []))
const { pager, getLists, resetParams, resetPage } = usePaging({
    fetchFun: adminLists,
    params: queryForm
})

/**
 * 函数说明：管理员表格列定义，统一采用 columns 模式，避免列插槽注入异常导致空白表格。
 */
const adminColumns: TableColumnData[] = [
    { dataIndex: 'id', title: 'ID', width: 90 },
    { dataIndex: 'avatar', title: '头像', width: 90, slotName: 'avatar' },
    { dataIndex: 'username', title: '账号', width: 140 },
    { dataIndex: 'nickname', title: '名称', width: 140 },
    { dataIndex: 'role', title: '角色', width: 140, ellipsis: true, tooltip: true },
    { dataIndex: 'dept', title: '部门', width: 140, ellipsis: true, tooltip: true },
    { dataIndex: 'createTime', title: '创建时间', width: 180 },
    { dataIndex: 'lastLoginTime', title: '最近登录时间', width: 180 },
    { dataIndex: 'lastLoginIp', title: '最近登录IP', width: 160 },
    { dataIndex: 'isDisable', title: '状态', width: 90, slotName: 'isDisable' },
    { dataIndex: 'statusAction', title: '启停', width: 120, slotName: 'statusAction' },
    { dataIndex: 'action', title: '操作', width: 140, slotName: 'action', fixed: 'right' }
]

const adminTableData = computed<Record<string, any>[]>(() =>
    Array.isArray(pager.lists) ? pager.lists : []
)
const selectedAdminRows = computed<Record<string, any>[]>(() => {
    if (!selectedAdminKeys.value.length) {
        return []
    }
    const selectedKeySet = new Set(selectedAdminKeys.value.map((item) => Number(item)))
    return adminTableData.value.filter((item) => selectedKeySet.has(Number(item.id)))
})
const metrics = computed(() => ({
    active: adminTableData.value.filter((item) => Number(item.isDisable) === 0).length,
    disabled: adminTableData.value.filter((item) => Number(item.isDisable) === 1).length
}))
/**
 * 函数说明：解析当前角色筛选标签，统一工作区与筛选区展示口径。
 */
const adminRoleFilterLabel = computed(() => {
    const currentRole = roleOptions.value.find((item) => Number(item.id) === Number(queryForm.role))
    if (currentRole?.name) {
        return currentRole.name
    }
    return '全部角色'
})
/**
 * 函数说明：汇总当前筛选口径，用于工作区摘要展示。
 */
const adminFilterLabel = computed(() => {
    if (queryForm.username) {
        return `账号：${queryForm.username}`
    }
    if (queryForm.nickname) {
        return `名称：${queryForm.nickname}`
    }
    if (Number(queryForm.role) > 0) {
        return `角色：${adminRoleFilterLabel.value}`
    }
    if (Number(queryForm.isDisable) === 0) {
        return '状态：启用'
    }
    if (Number(queryForm.isDisable) === 1) {
        return '状态：停用'
    }
    return '全部管理员'
})

/**
 * 函数说明：生成管理员表格空态文案，避免空列表时缺少下一步指引。
 */
const adminEmptyDescription = computed(() => {
    if (queryForm.username || queryForm.nickname || Number(queryForm.role) > 0 || Number(queryForm.isDisable) >= 0) {
        return '当前筛选条件下没有匹配的管理员'
    }
    return '当前还没有管理员数据'
})
const rowSelection = computed(() => ({
    type: 'checkbox',
    showCheckedAll: true,
    selectedRowKeys: selectedAdminKeys.value,
    onChange: (keys: Array<string | number>) => {
        selectedAdminKeys.value = keys
    }
}))

/**
 * 函数说明：设置页面操作反馈消息，统一批量操作与筛选提示风格。
 */
const setActionFeedback = (type: ActionFeedbackState['type'], message: string) => {
    actionFeedback.type = type
    actionFeedback.message = message
}

/**
 * 函数说明：清空顶部反馈提示，减少页面噪音。
 */
const clearActionFeedback = () => {
    actionFeedback.message = ''
}

/**
 * 函数说明：拉取管理员列表并修正历史选择项，避免跨页后保留无效选择。
 */
const fetchAdminLists = async () => {
    /**
     * 函数说明：统一角色筛选入参，空值回退为 -1（全部角色），避免后端把空字符串解析为 0 导致误过滤。
     */
    const normalizedRole =
        queryForm.role === '' || queryForm.role === null || queryForm.role === undefined
            ? -1
            : Number(queryForm.role)
    queryForm.role = Number.isFinite(normalizedRole) ? normalizedRole : -1
    try {
        await getLists()
        selectedAdminKeys.value = selectedAdminKeys.value.filter((key) =>
            adminTableData.value.some((item) => Number(item.id) === Number(key))
        )
    } catch {
        setActionFeedback('error', '管理员数据加载失败，请检查登录态或接口权限')
        feedback.msgError('管理员数据加载失败，请检查登录态或接口权限')
    }
}

/**
 * 函数说明：执行查询并回到第一页，保证筛选结果与分页一致。
 */
const queryAdmins = () => {
    clearActionFeedback()
    resetPage()
}

/**
 * 函数说明：刷新管理员列表并反馈刷新状态。
 */
const refreshLists = async () => {
    await fetchAdminLists()
    setActionFeedback('success', '管理员列表已刷新')
    feedback.msgSuccess('管理员列表已刷新')
}

/**
 * 函数说明：重置筛选条件并刷新列表。
 */
const resetFilters = async () => {
    selectedAdminKeys.value = []
    await resetParams()
    setActionFeedback('info', '筛选条件已重置')
}

/**
 * 函数说明：清空当前批量选择状态，避免误操作。
 */
const clearAdminSelection = () => {
    if (!selectedAdminKeys.value.length) {
        setActionFeedback('info', '当前没有已选管理员')
        return
    }
    selectedAdminKeys.value = []
    setActionFeedback('info', '已清空管理员选择')
}

/**
 * 函数说明：打开新增管理员弹窗。
 */
const handleAdd = async () => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('add')
}

/**
 * 函数说明：打开编辑管理员弹窗并回填详情。
 */
const handleEdit = async (data: Record<string, any>) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    editRef.value?.setFormData(data)
}

/**
 * 函数说明：切换单个管理员状态，失败时自动刷新列表回滚界面状态。
 */
const changeStatus = async (record: Record<string, any>) => {
    const currentIsDisable = Number(record.isDisable || 0)
    const actionText = currentIsDisable === 0 ? '停用' : '启用'
    try {
        await feedback.confirm(`确定${actionText}管理员「${record.nickname || record.username}」？`)
        await adminStatus({ id: record.id })
        feedback.msgSuccess(`${actionText}成功`)
        setActionFeedback('success', `${actionText}成功`)
    } catch {
        await fetchAdminLists()
        return
    }
    await fetchAdminLists()
}

/**
 * 函数说明：删除管理员并刷新列表。
 */
const handleDelete = async (id: number) => {
    await feedback.confirm('确定要删除该管理员吗？')
    await adminDelete({ id })
    feedback.msgSuccess('删除成功')
    setActionFeedback('success', '管理员删除成功')
    await fetchAdminLists()
}

/**
 * 函数说明：批量删除已选管理员，输出成功/失败统计，提升运营批处理效率。
 */
const handleBatchDelete = async () => {
    if (!selectedAdminRows.value.length) {
        setActionFeedback('warning', '请先选择要删除的管理员')
        feedback.msgError('请先选择要删除的管理员')
        return
    }
    await feedback.confirm(`确定删除已选择的 ${selectedAdminRows.value.length} 位管理员吗？`)

    let successCount = 0
    let failedCount = 0
    let skippedCount = 0
    for (const row of selectedAdminRows.value) {
        const id = Number(row.id)
        if (!Number.isFinite(id) || id <= 0) {
            failedCount++
            continue
        }
        if (id === 1) {
            skippedCount++
            continue
        }
        try {
            await adminDelete({ id })
            successCount++
        } catch {
            failedCount++
        }
    }

    if (successCount > 0 && failedCount === 0) {
        setActionFeedback('success', `批量删除完成：成功 ${successCount} 项`)
        feedback.msgSuccess(`批量删除完成：成功 ${successCount} 项`)
    } else if (successCount > 0 || skippedCount > 0) {
        setActionFeedback(
            'warning',
            `批量删除完成：成功 ${successCount} 项，失败 ${failedCount} 项，跳过 ${skippedCount} 项`
        )
        feedback.msgSuccess(
            `批量删除完成：成功 ${successCount} 项，失败 ${failedCount} 项，跳过 ${skippedCount} 项`
        )
    } else {
        setActionFeedback('error', '批量删除失败，请检查权限后重试')
        feedback.msgError('批量删除失败，请检查权限后重试')
    }

    if (skippedCount > 0) {
        feedback.alertWarning('系统管理员不可删除，已自动跳过')
    }
    selectedAdminKeys.value = []
    await fetchAdminLists()
}

onMounted(() => {
    void fetchAdminLists()
})
</script>

<style scoped lang="scss">
.admin-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

:deep(.arco-page-header) {
    border-radius: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    background: linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
}

:deep(.arco-page-header-wrapper) {
    padding: 16px 18px;
}

.admin-metrics {
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

        .is-warning {
            color: #f77234;
        }
    }
}

.admin-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.95fr);
    gap: 12px;
}

.admin-workspace__main,
.admin-workspace__aside {
    padding: 18px 20px;
    border-radius: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
}

.admin-workspace__eyebrow {
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: rgb(var(--primary-6));
}

.admin-workspace__title {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.35;
    color: var(--color-text-1, #1d2129);
}

.admin-workspace__desc {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-2, #4e5969);
}

.admin-workspace__meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 16px;
}

.admin-workspace__meta-item {
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(var(--primary-6), 0.06);
}

.admin-workspace__meta-item span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.admin-workspace__meta-item strong {
    display: block;
    margin-top: 6px;
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.admin-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.admin-workspace__checklist {
    display: grid;
    gap: 10px;
    margin-top: 14px;
}

.admin-workspace__checklist-item {
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    background: #fff;
}

.admin-workspace__checklist-item.is-ok {
    border-color: rgba(var(--success-6), 0.2);
    background: rgba(var(--success-6), 0.05);
}

.admin-workspace__checklist-item.is-warning {
    border-color: rgba(var(--warning-6), 0.2);
    background: rgba(var(--warning-6), 0.06);
}

.admin-workspace__checklist-label {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.admin-workspace__checklist-value {
    margin-top: 4px;
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.admin-workspace__checklist-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-2, #4e5969);
}

.admin-workspace__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
}

:deep(.admin-filter-grid) {
    align-items: center;

    .filter-result {
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        color: var(--color-text-3, #86909c);
        font-size: 12px;
    }
}

.admin-filter-strip {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
    gap: 12px;
    margin-top: 14px;
}

.admin-filter-strip__summary,
.admin-filter-strip__hint {
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    background: #fff;
}

.admin-filter-strip__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.admin-filter-strip__chip {
    min-width: 118px;
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
}

.admin-filter-strip__chip span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.admin-filter-strip__chip strong {
    display: block;
    margin-top: 5px;
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.admin-filter-strip__hint-label {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.admin-filter-strip__hint-text {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-2, #4e5969);
}

.admin-feedback-panel {
    display: grid;
    gap: 12px;
    margin-top: 14px;
}

.admin-feedback-panel__selection {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 16px;
    border: 1px solid rgba(var(--primary-6), 0.14);
    border-radius: 12px;
    background: rgba(var(--primary-6), 0.06);
}

.admin-feedback-panel__selection-main {
    min-width: 0;
}

.admin-feedback-panel__selection-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.admin-feedback-panel__selection-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-3, #86909c);
}

.admin-feedback-panel__notice {
    margin: 0;
}

.row-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
}

:deep(.admin-page .arco-card) {
    border-radius: 12px;
}

:deep(.admin-page .arco-table-container) {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 10px;
}

:deep(.admin-page .arco-table-th) {
    background: var(--color-fill-1, #f7f8fa);
}

@media (max-width: 900px) {
    .admin-workspace,
    .admin-workspace__meta,
    .admin-filter-strip {
        grid-template-columns: 1fr;
    }

    .admin-feedback-panel__selection {
        align-items: flex-start;
        flex-direction: column;
    }

    .admin-filter-strip__summary {
        flex-direction: column;
    }

    :deep(.admin-filter-grid .filter-result) {
        justify-content: flex-start;
    }
}
</style>
