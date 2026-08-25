<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="dept-page">
        <a-page-header title="部门管理" subtitle="维护组织架构、部门状态与层级扩展，保证账号归属清晰。">
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>{{ deptStatusLabel }}</a-tag>
                    <a-button data-admin-smoke="dept-query" @click="getLists">查询</a-button>
                    <a-button data-admin-smoke="dept-reset" @click="resetParams">重置筛选</a-button>
                    <a-button data-admin-smoke="dept-expand" @click="handleExpand">{{ isExpand ? '全部折叠' : '全部展开' }}</a-button>
                    <a-button data-admin-smoke="dept-add" v-perms="['system:dept:add']" type="primary" @click="handleAdd()">
                        <template #icon>
                            <icon-plus />
                        </template>
                        新增部门
                    </a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 2, lg: 4 }" :col-gap="12" :row-gap="12" class="dept-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">部门总数</div>
                    <div class="metric-value">{{ deptMetrics.total }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">顶级部门</div>
                    <div class="metric-value">{{ deptMetrics.root }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">启用部门</div>
                    <div class="metric-value">{{ deptMetrics.active }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">停用部门</div>
                    <div class="metric-value is-warning">{{ deptMetrics.stopped }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-card class="general-card" title="部门列表" :bordered="false">
            <a-grid :cols="{ xs: 1, md: 12 }" :col-gap="12" :row-gap="12" class="dept-filter-grid">
                <a-grid-item :span="{ xs: 12, md: 5 }">
                    <a-input-search
                        v-model="queryParams.name"
                        placeholder="搜索部门名称"
                        allow-clear
                        @search="getLists"
                        @clear="getLists"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 4 }">
                    <a-select v-model="queryParams.isStop" placeholder="部门状态" allow-clear>
                        <a-option :value="-1">全部状态</a-option>
                        <a-option :value="0">正常</a-option>
                        <a-option :value="1">停用</a-option>
                    </a-select>
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <div class="filter-result">匹配 {{ deptMetrics.total }} 项 / 顶级 {{ deptMetrics.root }} 项</div>
                </a-grid-item>
            </a-grid>


            <a-table
                class="mt-4"
                :loading="loading"
                :data="lists"
                row-key="id"
                :pagination="false"
                :bordered="false"
                v-model:expanded-keys="expandedKeys"
                :scroll="{ x: 960 }"
            >
                <a-table-column
                    title="部门名称"
                    data-index="name"
                    :min-width="200"
                    :ellipsis="true"
                    :tooltip="true"
                />
                <a-table-column title="部门状态" data-index="isStop" :width="110">
                    <template #cell="{ record }">
                        <a-tag :color="record.isStop ? 'red' : 'green'">
                            {{ record.isStop ? '停用' : '正常' }}
                        </a-tag>
                    </template>
                </a-table-column>
                <a-table-column title="排序" data-index="sort" :width="100" />
                <a-table-column title="更新时间" data-index="updateTime" :width="180" />
                <a-table-column title="操作" :width="180" fixed="right">
                    <template #cell="{ record }">
                        <div class="row-actions">
                            <a-button
                                v-perms="['system:dept:add']"
                                type="text"
                                size="small"
                                @click="handleAdd(record.id)"
                            >
                                新增
                            </a-button>
                            <a-button
                                v-perms="['system:dept:edit']"
                                type="text"
                                size="small"
                                @click="handleEdit(record)"
                            >
                                编辑
                            </a-button>
                            <a-button
                                v-if="record.pid !== 0"
                                v-perms="['system:dept:del']"
                                type="text"
                                size="small"
                                status="danger"
                                @click="handleDelete(record.id)"
                            >
                                删除
                            </a-button>
                        </div>
                    </template>
                </a-table-column>
                <template #empty>
                    <a-empty :description="deptEmptyDescription">
                        <template #extra>
                            <a-space>
                                <a-button @click="resetParams">重置筛选</a-button>
                                <a-button type="outline" @click="handleExpand">切换展开状态</a-button>
                                <a-button v-perms="['system:dept:add']" type="primary" @click="handleAdd()">
                                    新增部门
                                </a-button>
                            </a-space>
                        </template>
                    </a-empty>
                </template>
            </a-table>
        </a-card>

        <edit-popup v-if="showEdit" ref="editRef" @success="getLists" @close="showEdit = false" />
    </div>
</template>

<script lang="ts" setup name="department">
import { IconPlus } from '@arco-design/web-vue/es/icon'
import EditPopup from './edit.vue'
import { deptDelete, deptLists } from '@/api/org/department'
import feedback from '@/utils/feedback'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
const loading = ref(false)
const lists = ref<any[]>([])
const showEdit = ref(false)
const queryParams = reactive({
    isStop: -1,
    name: ''
})

let isExpand = true
const expandedKeys = ref<number[]>([])

/**
 * 函数说明：读取部门树列表并根据当前展开状态同步展开节点。
 */
const getLists = async () => {
    loading.value = true
    try {
        const responseData = await deptLists(buildDeptQueryParams())
        lists.value = normalizeDeptRows(responseData)
        expandedKeys.value = isExpand ? collectExpandableKeys(lists.value) : []
    } finally {
        loading.value = false
    }
}

/**
 * 函数说明：重置查询参数并重新拉取部门列表。
 */
const resetParams = () => {
    queryParams.isStop = -1
    queryParams.name = ''
    getLists()
}

/**
 * 函数说明：打开新增部门弹窗，可传父级部门 ID 预填。
 */
const handleAdd = async (id?: number) => {
    showEdit.value = true
    await nextTick()
    if (id) {
        editRef.value?.setFormData({
            pid: id
        })
    }
    editRef.value?.open('add')
}

/**
 * 函数说明：打开编辑部门弹窗并加载详情。
 */
const handleEdit = async (data: any) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    editRef.value?.getDetail(data)
}

/**
 * 函数说明：删除部门并刷新列表。
 */
const handleDelete = async (id: number) => {
    await feedback.confirm('确定要删除？')
    await deptDelete({ id })
    feedback.msgSuccess('删除成功')
    getLists()
}

/**
 * 函数说明：切换部门树展开/折叠状态。
 */
const handleExpand = () => {
    isExpand = !isExpand
    expandedKeys.value = isExpand ? collectExpandableKeys(lists.value) : []
}

/**
 * 函数说明：递归收集可展开节点 key，用于 Arco 表格树展开。
 */
const collectExpandableKeys = (rows: any[]): number[] => {
    const rowKeys: number[] = []
    for (const row of rows) {
        if (Array.isArray(row.children) && row.children.length > 0) {
            rowKeys.push(row.id)
            rowKeys.push(...collectExpandableKeys(row.children))
        }
    }
    return rowKeys
}

/**
 * 函数说明：构建部门查询参数，确保“全部状态”使用 -1，避免空字符串被后端误判为 0。
 */
const buildDeptQueryParams = (): { isStop: number; name: string } => {
    const isStopValue = Number(queryParams.isStop)
    return {
        isStop: Number.isFinite(isStopValue) ? isStopValue : -1,
        name: String(queryParams.name || '').trim()
    }
}

/**
 * 函数说明：统一提取部门列表数据，兼容数组或对象包装结构。
 */
const normalizeDeptRows = (payload: any): any[] => {
    if (Array.isArray(payload)) {
        return payload
    }
    const listValue = payload?.list ?? payload?.lists ?? payload?.rows ?? []
    if (Array.isArray(listValue)) {
        return listValue
    }
    if (listValue && typeof listValue === 'object') {
        return Object.values(listValue)
    }
    return []
}

/**
 * 函数说明：递归统计部门树关键指标，供页面工作区和概览卡展示。
 */
const collectDeptMetrics = (rows: any[]) => {
    const metrics = {
        total: 0,
        root: 0,
        active: 0,
        stopped: 0
    }

    const walk = (nodes: any[], depth = 0) => {
        for (const node of nodes) {
            metrics.total += 1
            if (depth === 0) {
                metrics.root += 1
            }
            if (Number(node.isStop) === 1) {
                metrics.stopped += 1
            } else {
                metrics.active += 1
            }
            if (Array.isArray(node.children) && node.children.length > 0) {
                walk(node.children, depth + 1)
            }
        }
    }

    walk(rows)
    return metrics
}

const deptMetrics = computed(() => collectDeptMetrics(lists.value))
const deptStatusLabel = computed(() => {
    if (Number(queryParams.isStop) === 0) return '仅看正常部门'
    if (Number(queryParams.isStop) === 1) return '仅看停用部门'
    return '查看全部部门'
})
const deptEmptyDescription = computed(() => {
    if (String(queryParams.name || '').trim() || Number(queryParams.isStop) !== -1) {
        return '当前筛选条件下没有找到部门，建议先重置筛选再确认。'
    }
    return '还没有部门数据，建议先新增顶级部门作为组织入口。'
})
onMounted(async () => {
    await getLists()
})
</script>

<style lang="scss" scoped>
.dept-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.dept-metrics,
.dept-filter-grid {
    width: 100%;
}

.metric-card {
    border-radius: 16px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.metric-label {
    font-size: 12px;
    color: #86909c;
}

.metric-value {
    margin-top: 8px;
    font-size: 30px;
    font-weight: 700;
    color: #1d2129;
}

.metric-value.is-warning {
    color: #ff7d00;
}

.dept-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
    gap: 16px;
}

.dept-workspace__main,
.dept-workspace__aside {
    padding: 20px 22px;
    border-radius: 16px;
    background: #fff;
}

.dept-workspace__eyebrow {
    font-size: 12px;
    font-weight: 600;
    color: #4e5969;
}

.dept-workspace__title {
    margin-top: 10px;
    font-size: 22px;
    line-height: 1.4;
    font-weight: 700;
    color: #1d2129;
}

.dept-workspace__desc {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.7;
    color: #4e5969;
}

.dept-workspace__meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
}

.dept-workspace__meta-item,
.dept-workspace__checklist-item {
    padding: 14px 16px;
    border-radius: 14px;
    background: #f7f8fa;
}

.dept-workspace__meta-item span,
.dept-workspace__checklist-label {
    display: block;
    font-size: 12px;
    color: #86909c;
}

.dept-workspace__meta-item strong,
.dept-workspace__checklist-value {
    display: block;
    margin-top: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #1d2129;
}

.dept-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: #1d2129;
}

.dept-workspace__checklist {
    display: grid;
    gap: 12px;
    margin-top: 14px;
}

.dept-workspace__checklist-item.is-ready {
    background: #effff6;
}

.dept-workspace__checklist-item.is-warning {
    background: #fff7e8;
}

.dept-workspace__checklist-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: #4e5969;
}

.dept-workspace__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
}

.filter-result {
    display: flex;
    align-items: center;
    min-height: 32px;
    color: #4e5969;
    font-size: 13px;
}

.dept-filter-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 16px;
    padding: 14px 16px;
    border-radius: 14px;
    background: #f7f8fa;
}

.dept-filter-strip__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.dept-filter-strip__chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: #fff;
    font-size: 12px;
    color: #4e5969;
}

.dept-filter-strip__chip strong {
    color: #1d2129;
}

.dept-filter-strip__hint {
    min-width: 240px;
    text-align: right;
}

.dept-filter-strip__hint-label {
    font-size: 12px;
    color: #86909c;
}

.dept-filter-strip__hint-text {
    margin-top: 4px;
    font-size: 13px;
    color: #1d2129;
}

.row-actions {
    display: flex;
    align-items: center;
    gap: 4px;
}

@media (max-width: 1200px) {
    .dept-workspace {
        grid-template-columns: 1fr;
    }

    .dept-workspace__meta {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .dept-filter-strip {
        flex-direction: column;
        align-items: flex-start;
    }

    .dept-filter-strip__hint {
        min-width: 0;
        text-align: left;
    }
}

@media (max-width: 768px) {
    .dept-workspace__meta {
        grid-template-columns: 1fr;
    }
}
</style>
