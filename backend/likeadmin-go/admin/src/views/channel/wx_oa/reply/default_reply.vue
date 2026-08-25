<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-30
 */
-->
<template>
    <div class="container">
        <a-card class="general-card" title="默认回复设置" :bordered="false">
            <a-row>
                <a-col :flex="1">
                    <a-form
                        :model="formModel"
                        :label-col-props="{ span: 6 }"
                        :wrapper-col-props="{ span: 18 }"
                        label-align="left"
                    >
                        <a-row :gutter="16">
                            <a-col :xs="24" :sm="12" :md="8">
                                <a-form-item field="name" label="规则名称">
                                    <a-input
                                        v-model="formModel.name"
                                        placeholder="请输入规则名称"
                                        allow-clear
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24" :sm="12" :md="8">
                                <a-form-item field="content" label="回复内容">
                                    <a-input
                                        v-model="formModel.content"
                                        placeholder="请输入回复内容"
                                        allow-clear
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24" :sm="12" :md="8">
                                <a-form-item field="status" label="启用状态">
                                    <a-select
                                        v-model="formModel.status"
                                        :options="statusOptions"
                                        placeholder="请选择启用状态"
                                        allow-clear
                                    />
                                </a-form-item>
                            </a-col>
                        </a-row>
                    </a-form>
                </a-col>
                <a-divider class="search-divider" direction="vertical" />
                <a-col :flex="'86px'" class="search-actions">
                    <a-space direction="vertical" :size="18">
                        <a-button data-admin-smoke="channel-oa-reply-default-query" type="primary" @click="search">
                            <template #icon>
                                <icon-search />
                            </template>
                            查询
                        </a-button>
                        <a-button data-admin-smoke="channel-oa-reply-default-reset" @click="reset">
                            <template #icon>
                                <icon-refresh />
                            </template>
                            重置
                        </a-button>
                    </a-space>
                </a-col>
            </a-row>

            <a-divider class="table-divider" />

            <a-alert
                class="reply-rule-alert"
                :type="defaultAlertType"
                :title="defaultAlertTitle"
                :closable="false"
                show-icon
            >
                {{ defaultAlertDescription }}
            </a-alert>

            <a-row class="table-operation-row">
                <a-col :span="12">
                    <a-space wrap>
                        <a-button
                            v-perms="['channel:oaReplyDefault:add']"
                            data-admin-smoke="channel-oa-reply-default-add"
                            type="primary"
                            @click="handleAdd"
                        >
                            <template #icon>
                                <icon-plus />
                            </template>
                            新增
                        </a-button>
                        <a-button
                            v-perms="['channel:oaReplyDefault:del']"
                            status="danger"
                            :disabled="selectedReplyRows.length === 0 || batchDeleting"
                            :loading="batchDeleting"
                            @click="handleBatchDelete"
                        >
                            批量删除
                        </a-button>
                        <a-button :disabled="selectedReplyRows.length === 0" @click="clearReplySelection">
                            清空选择
                        </a-button>
                    </a-space>
                </a-col>
                <a-col :span="12" class="table-actions">
                    <a-space>
                        <a-tag color="arcoblue" bordered>总计 {{ totalReplyCount }} 条</a-tag>
                        <a-tag :color="enabledStateColor" bordered>{{ enabledStateText }}</a-tag>
                    </a-space>
                    <a-tooltip content="刷新">
                        <div
                            class="action-icon"
                            data-admin-smoke="channel-oa-reply-default-refresh"
                            @click="refreshLists"
                        >
                            <icon-refresh :size="18" />
                        </div>
                    </a-tooltip>
                    <a-dropdown @select="handleSelectDensity">
                        <a-tooltip content="密度">
                            <div class="action-icon">
                                <icon-line-height :size="18" />
                            </div>
                        </a-tooltip>
                        <template #content>
                            <a-doption
                                v-for="item in densityList"
                                :key="item.value"
                                :value="item.value"
                                :class="{ active: item.value === tableSize }"
                            >
                                {{ item.name }}
                            </a-doption>
                        </template>
                    </a-dropdown>
                </a-col>
            </a-row>

            <div
                class="reply-feedback"
                v-if="selectedReplyRows.length > 0 || actionFeedback.message || hasEnabledConflict"
            >
                <a-alert v-if="hasEnabledConflict" type="warning" :closable="false" show-icon>
                    当前启用了 {{ enabledReplyRows.length }} 条默认回复，建议只保留一条兜底规则。
                </a-alert>
                <a-alert v-if="selectedReplyRows.length > 0" type="info" :closable="false">
                    已选择 {{ selectedReplyRows.length }} 条默认回复，可批量删除或清空选择。
                </a-alert>
                <a-alert
                    v-if="actionFeedback.message"
                    :type="actionFeedback.type"
                    closable
                    @close="clearActionFeedback"
                >
                    {{ actionFeedback.message }}
                </a-alert>
            </div>

            <a-table
                row-key="id"
                :loading="pager.loading"
                :pagination="false"
                :data="filteredReplyRows"
                :bordered="false"
                :size="tableSize"
                :row-selection="rowSelection"
            >
                <a-table-column title="规则名称" :min-width="180">
                    <template #cell="{ record }">
                        <a-space>
                            <span>{{ record.name || '未命名规则' }}</span>
                            <a-tag v-if="isPrimaryRule(record)" color="green" bordered>当前生效</a-tag>
                        </a-space>
                    </template>
                </a-table-column>
                <a-table-column title="回复类型" :min-width="110">
                    <template #cell="{ record }">
                        {{ getContentType(record.contentType) }}
                    </template>
                </a-table-column>
                <a-table-column title="回复内容" :min-width="260">
                    <template #cell="{ record }">
                        <div class="content-cell">{{ formatReplyContent(record.content) }}</div>
                    </template>
                </a-table-column>
                <a-table-column title="状态" :min-width="120">
                    <template #cell="{ record }">
                        <a-space>
                            <span class="circle" :class="{ pass: Number(record.status) === 1 }"></span>
                            <a-switch
                                v-perms="['channel:oaReplyDefault:status']"
                                v-model="record.status"
                                :checked-value="1"
                                :unchecked-value="0"
                                @change="changeStatus(record.id)"
                            />
                        </a-space>
                    </template>
                </a-table-column>
                <a-table-column title="排序" data-index="sort" :min-width="100" />
                <a-table-column title="操作" :width="150" fixed="right">
                    <template #cell="{ record }">
                        <a-space>
                            <a-button
                                v-perms="['channel:oaReplyDefault:edit']"
                                type="text"
                                size="small"
                                @click="handleEdit(record)"
                            >
                                编辑
                            </a-button>
                            <a-button
                                v-perms="['channel:oaReplyDefault:del']"
                                type="text"
                                size="small"
                                status="danger"
                                @click="handleDelete(record.id)"
                            >
                                删除
                            </a-button>
                        </a-space>
                    </template>
                </a-table-column>
            </a-table>

            <div v-if="!pager.loading && filteredReplyRows.length === 0" class="reply-empty-wrap">
                <a-empty description="暂无符合条件的默认回复规则">
                    <template #extra>
                        <a-button v-perms="['channel:oaReplyDefault:add']" type="primary" @click="handleAdd">
                            <template #icon>
                                <icon-plus />
                            </template>
                            新增第一条默认回复
                        </a-button>
                    </template>
                </a-empty>
            </div>

            <div class="reply-pagination">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </a-card>

        <edit-popup v-if="showEdit" ref="editRef" @success="handleEditSuccess" @close="showEdit = false" />
    </div>
</template>

<script lang="ts" setup>
import {
    IconLineHeight,
    IconPlus,
    IconRefresh,
    IconSearch
} from '@arco-design/web-vue/es/icon'
import { changeOaReplyStatus, getOaReplyList, oaReplyDel } from '@/api/channel/wx_oa'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'
import EditPopup from './edit.vue'

interface ActionFeedbackState {
    type: 'success' | 'warning' | 'error' | 'info'
    message: string
}

interface SearchFormModel {
    name: string
    content: string
    status: string
}

type ReplyRow = Record<string, any>
type TableSize = 'mini' | 'small' | 'medium' | 'large'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
const showEdit = ref(false)
const type = 'default'
const actionFeedback = reactive<ActionFeedbackState>({
    type: 'info',
    message: ''
})
const selectedReplyKeys = ref<Array<string | number>>([])
const batchDeleting = ref(false)
const tableSize = ref<TableSize>('medium')
const densityList: Array<{ name: string; value: TableSize }> = [
    { name: '迷你', value: 'mini' },
    { name: '偏小', value: 'small' },
    { name: '中等', value: 'medium' },
    { name: '偏大', value: 'large' }
]
const statusOptions = [
    { label: '全部', value: '' },
    { label: '已启用', value: '1' },
    { label: '未启用', value: '0' }
]

/**
 * 函数说明：创建默认回复筛选表单默认值。
 */
const createDefaultFormModel = (): SearchFormModel => ({
    name: '',
    content: '',
    status: ''
})

const formModel = reactive<SearchFormModel>(createDefaultFormModel())
const searchModel = ref<SearchFormModel>(createDefaultFormModel())

const { pager, getLists } = usePaging({
    fetchFun: getOaReplyList,
    params: { type }
})

const replyRows = computed<ReplyRow[]>(() => {
    return Array.isArray(pager.lists) ? pager.lists : []
})
const filteredReplyRows = computed<ReplyRow[]>(() => {
    const name = searchModel.value.name.trim().toLowerCase()
    const content = searchModel.value.content.trim().toLowerCase()
    const status = searchModel.value.status
    return replyRows.value.filter((item) => {
        const itemName = String(item.name || '').toLowerCase()
        const itemContent = String(item.content || '').toLowerCase()
        const itemStatus = String(Number(item.status))
        const matchName = !name || itemName.includes(name)
        const matchContent = !content || itemContent.includes(content)
        const matchStatus = !status || itemStatus === status
        return matchName && matchContent && matchStatus
    })
})
const selectedReplyRows = computed<ReplyRow[]>(() => {
    if (!selectedReplyKeys.value.length) {
        return []
    }
    const selectedKeySet = new Set(selectedReplyKeys.value.map((item) => Number(item)))
    return replyRows.value.filter((item) => selectedKeySet.has(Number(item.id)))
})
const rowSelection = computed(() => ({
    type: 'checkbox',
    showCheckedAll: true,
    selectedRowKeys: selectedReplyKeys.value,
    onChange: (keys: Array<string | number>) => {
        selectedReplyKeys.value = keys
    }
}))
const totalReplyCount = computed(() => Number(pager.count) || replyRows.value.length)
const enabledReplyRows = computed(() => replyRows.value.filter((item) => Number(item.status) === 1))
const hasEnabledConflict = computed(() => enabledReplyRows.value.length > 1)
const primaryRule = computed<ReplyRow | null>(() => {
    if (!enabledReplyRows.value.length) {
        return null
    }
    return [...enabledReplyRows.value].sort((prev, next) => {
        const prevSort = Number(prev.sort) || 0
        const nextSort = Number(next.sort) || 0
        if (prevSort !== nextSort) {
            return prevSort - nextSort
        }
        return Number(prev.id) - Number(next.id)
    })[0]
})
const enabledStateColor = computed(() => {
    if (enabledReplyRows.value.length === 1) {
        return 'green'
    }
    if (enabledReplyRows.value.length > 1) {
        return 'orange'
    }
    return 'red'
})
const enabledStateText = computed(() => {
    if (enabledReplyRows.value.length === 1) {
        return '已启用 1 条'
    }
    if (enabledReplyRows.value.length > 1) {
        return `启用 ${enabledReplyRows.value.length} 条`
    }
    return '未启用'
})
const defaultAlertType = computed(() => {
    return enabledReplyRows.value.length === 1 ? 'success' : 'warning'
})
const defaultAlertTitle = computed(() => {
    if (!totalReplyCount.value) {
        return '当前还没有默认回复规则'
    }
    if (!enabledReplyRows.value.length) {
        return '当前没有启用的默认回复'
    }
    if (hasEnabledConflict.value) {
        return '当前启用了多条默认回复'
    }
    return `当前生效：${primaryRule.value?.name || '未命名默认回复'}`
})
const defaultAlertDescription = computed(() => {
    if (!totalReplyCount.value) {
        return '请先新增一条默认回复，用户消息未命中关键词时会自动收到该内容。'
    }
    if (!enabledReplyRows.value.length) {
        return '用户消息未命中关键词时不会收到兜底反馈，建议启用一条正式规则。'
    }
    if (hasEnabledConflict.value) {
        return '建议只保留一条正式生效规则，避免兜底回复策略不清晰。'
    }
    return formatReplyContent(primaryRule.value?.content)
})

const getContentType = computed(() => {
    return (val: number) => {
        switch (val) {
            case 1:
                return '文本'
            default:
                return '-'
        }
    }
})

/**
 * 函数说明：格式化回复内容展示，避免空内容影响后台阅读。
 */
const formatReplyContent = (content: unknown) => {
    const text = String(content || '').trim()
    if (!text) {
        return '暂未填写回复内容'
    }
    return text
}

/**
 * 函数说明：判断当前表格规则是否为主生效规则。
 */
const isPrimaryRule = (record: ReplyRow) => {
    return Boolean(primaryRule.value && Number(primaryRule.value.id) === Number(record.id))
}

/**
 * 函数说明：应用当前筛选条件。
 */
const search = () => {
    searchModel.value = { ...formModel }
    selectedReplyKeys.value = []
    clearActionFeedback()
}

/**
 * 函数说明：重置筛选条件并恢复完整列表。
 */
const reset = () => {
    Object.assign(formModel, createDefaultFormModel())
    searchModel.value = createDefaultFormModel()
    selectedReplyKeys.value = []
    clearActionFeedback()
}

/**
 * 函数说明：切换表格密度，保持与 Arco Pro 表格操作栏一致。
 */
const handleSelectDensity = (value: string | number | Record<string, any>) => {
    const nextValue = String(value) as TableSize
    if (densityList.some((item) => item.value === nextValue)) {
        tableSize.value = nextValue
    }
}

/**
 * 函数说明：设置页面操作反馈文案，统一默认回复页面交互反馈。
 */
const setActionFeedback = (type: ActionFeedbackState['type'], message: string) => {
    actionFeedback.type = type
    actionFeedback.message = message
}

/**
 * 函数说明：清空顶部反馈提示，保持页面信息密度可控。
 */
const clearActionFeedback = () => {
    actionFeedback.message = ''
}

/**
 * 函数说明：刷新默认回复列表并同步清理无效选择项。
 */
const refreshLists = async () => {
    await getLists()
    selectedReplyKeys.value = selectedReplyKeys.value.filter((key) =>
        replyRows.value.some((item) => Number(item.id) === Number(key))
    )
    setActionFeedback('info', '列表已刷新')
}

/**
 * 函数说明：清空当前批量选择，避免误删默认回复规则。
 */
const clearReplySelection = () => {
    selectedReplyKeys.value = []
    setActionFeedback('info', '已清空选择项')
}

/**
 * 函数说明：打开新增默认回复弹窗。
 */
const handleAdd = async () => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('add', type)
}

/**
 * 函数说明：打开编辑默认回复弹窗并加载详情。
 */
const handleEdit = async (data: ReplyRow) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit', type)
    editRef.value?.getDetail(data)
}

/**
 * 函数说明：处理新增或编辑成功后的列表刷新。
 */
const handleEditSuccess = async () => {
    await getLists()
    setActionFeedback('success', '默认回复规则已保存')
}

/**
 * 函数说明：删除默认回复规则。
 */
const handleDelete = async (id: number) => {
    await feedback.confirm('确定要删除这条默认回复规则吗？')
    await oaReplyDel({ id, type })
    feedback.msgSuccess('删除成功')
    setActionFeedback('success', '删除成功')
    selectedReplyKeys.value = selectedReplyKeys.value.filter((item) => Number(item) !== Number(id))
    getLists()
}

/**
 * 函数说明：批量删除默认回复规则，输出成功/失败统计。
 */
const handleBatchDelete = async () => {
    if (batchDeleting.value) {
        return
    }
    if (!selectedReplyRows.value.length) {
        setActionFeedback('warning', '请先选择需要删除的默认回复规则')
        return
    }
    await feedback.confirm(`确定删除已选 ${selectedReplyRows.value.length} 条默认回复规则吗？`)
    batchDeleting.value = true
    try {
        let successCount = 0
        let failedCount = 0
        const currentIds = selectedReplyRows.value.map((item) => Number(item.id))
        for (const id of currentIds) {
            try {
                await oaReplyDel({ id, type })
                successCount++
            } catch (error) {
                failedCount++
            }
        }
        selectedReplyKeys.value = []
        await getLists()
        if (successCount > 0 && failedCount === 0) {
            const successText = `批量删除完成：成功 ${successCount} 条`
            setActionFeedback('success', successText)
            feedback.msgSuccess(successText)
            return
        }
        if (successCount > 0) {
            const warningText = `批量删除完成：成功 ${successCount} 条，失败 ${failedCount} 条`
            setActionFeedback('warning', warningText)
            feedback.msgWarning(warningText)
            return
        }
        setActionFeedback('error', '批量删除失败，请检查权限后重试')
        feedback.msgError('批量删除失败，请检查权限后重试')
    } finally {
        batchDeleting.value = false
    }
}

/**
 * 函数说明：切换默认回复启用状态，失败时自动回滚列表状态。
 */
const changeStatus = async (id: number) => {
    try {
        await changeOaReplyStatus({ id, type })
        feedback.msgSuccess('修改成功')
        setActionFeedback('success', '状态修改成功')
        getLists()
    } catch (error) {
        setActionFeedback('error', '状态修改失败，已自动回滚')
        feedback.msgError('状态修改失败，已自动回滚')
        getLists()
    }
}

getLists()
</script>

<style lang="scss" scoped>
.container {
    padding: 0 20px 20px;
}

.general-card {
    min-height: calc(100vh - 116px);
    border-radius: 4px;
}

.search-divider {
    height: 84px;
}

.search-actions {
    text-align: right;
}

.table-divider {
    margin-top: 0;
}

.reply-rule-alert,
.table-operation-row {
    margin-bottom: 16px;
}

.table-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.action-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-left: 12px;
    color: rgb(var(--gray-8));
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.1s ease;

    &:hover {
        background-color: var(--color-fill-2);
    }
}

.active {
    color: rgb(var(--arcoblue-6));
    background-color: var(--color-fill-2);
}

.reply-feedback {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}

.circle {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: rgb(var(--gray-4));

    &.pass {
        background-color: rgb(var(--green-6));
    }
}

.content-cell {
    display: -webkit-box;
    overflow: hidden;
    color: var(--color-text-2);
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.reply-empty-wrap {
    display: flex;
    justify-content: center;
    padding: 24px 0 8px;
}

.reply-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
}

@media (max-width: 768px) {
    .container {
        padding: 0 12px 16px;
    }

    .search-divider {
        display: none;
    }

    .search-actions {
        width: 100%;
        margin-bottom: 12px;
        text-align: left;
    }

    .table-operation-row {
        :deep(.arco-col) {
            width: 100%;
            flex: 0 0 100%;
        }
    }

    .table-actions {
        justify-content: flex-start;
        margin-top: 12px;
    }
}
</style>
