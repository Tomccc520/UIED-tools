<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="post-page">
        <a-page-header title="岗位管理" subtitle="统一管理岗位编码、排序与启停状态，便于部门成员挂接。">
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>{{ postStatusLabel }}</a-tag>
                    <a-button data-admin-smoke="post-query" @click="resetPage">查询</a-button>
                    <a-button data-admin-smoke="post-reset" @click="resetParams">重置筛选</a-button>
                    <a-button data-admin-smoke="post-add" v-perms="['system:post:add']" type="primary" @click="handleAdd()">
                        <template #icon>
                            <icon-plus />
                        </template>
                        新增岗位
                    </a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 2, lg: 4 }" :col-gap="12" :row-gap="12" class="post-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">岗位总数</div>
                    <div class="metric-value">{{ postMetrics.total }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">当前页岗位</div>
                    <div class="metric-value">{{ pager.lists.length }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">正常岗位</div>
                    <div class="metric-value">{{ postMetrics.active }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">停用岗位</div>
                    <div class="metric-value is-warning">{{ postMetrics.stopped }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-card class="general-card" title="岗位列表" :bordered="false">
            <a-grid :cols="{ xs: 1, md: 12 }" :col-gap="12" :row-gap="12" class="post-filter-grid">
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <a-input
                        v-model="queryParams.code"
                        placeholder="搜索岗位编码"
                        allow-clear
                        @press-enter="resetPage"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <a-input
                        v-model="queryParams.name"
                        placeholder="搜索岗位名称"
                        allow-clear
                        @press-enter="resetPage"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <a-select v-model="queryParams.isStop" placeholder="岗位状态" allow-clear>
                        <a-option :value="-1">全部状态</a-option>
                        <a-option :value="0">正常</a-option>
                        <a-option :value="1">停用</a-option>
                    </a-select>
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <div class="filter-result">匹配 {{ pager.count }} 项 / 当前页 {{ pager.lists.length }} 项</div>
                </a-grid-item>
            </a-grid>


            <a-table
                class="mt-4"
                :loading="pager.loading"
                :data="pager.lists"
                :pagination="false"
                :bordered="false"
                row-key="id"
                :scroll="{ x: 980 }"
            >
                <a-table-column title="岗位编码" data-index="code" :width="140" />
                <a-table-column title="岗位名称" data-index="name" :width="160" />
                <a-table-column title="排序" data-index="sort" :width="100" />
                <a-table-column
                    title="备注"
                    data-index="remarks"
                    :min-width="220"
                    :ellipsis="true"
                    :tooltip="true"
                />
                <a-table-column title="添加时间" data-index="createTime" :width="180" />
                <a-table-column title="岗位状态" data-index="isStop" :width="110">
                    <template #cell="{ record }">
                        <a-tag :color="record.isStop ? 'red' : 'green'">
                            {{ record.isStop ? '停用' : '正常' }}
                        </a-tag>
                    </template>
                </a-table-column>
                <a-table-column title="操作" :width="140" fixed="right">
                    <template #cell="{ record }">
                        <div class="row-actions">
                            <a-button
                                v-perms="['system:post:edit']"
                                type="text"
                                size="small"
                                @click="handleEdit(record)"
                            >
                                编辑
                            </a-button>
                            <a-button
                                v-perms="['system:post:del']"
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
                    <a-empty :description="postEmptyDescription">
                        <template #extra>
                            <a-space>
                                <a-button @click="resetParams">重置筛选</a-button>
                                <a-button @click="resetPage">重新加载</a-button>
                                <a-button v-perms="['system:post:add']" type="primary" @click="handleAdd()">
                                    新增岗位
                                </a-button>
                            </a-space>
                        </template>
                    </a-empty>
                </template>
            </a-table>

            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </a-card>

        <edit-popup v-if="showEdit" ref="editRef" @success="getLists" @close="showEdit = false" />
    </div>
</template>

<script lang="ts" setup name="post">
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { postDelete, postLists } from '@/api/org/post'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'
import EditPopup from './edit.vue'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
const showEdit = ref(false)
const queryParams = reactive({
    code: '',
    name: '',
    isStop: -1
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: postLists,
    params: queryParams
})

/**
 * 函数说明：打开新增岗位弹窗。
 */
const handleAdd = async () => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('add')
}

/**
 * 函数说明：打开编辑岗位弹窗并回填详情。
 */
const handleEdit = async (data: any) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    editRef.value?.getDetail(data)
}

/**
 * 函数说明：删除岗位并刷新列表。
 */
const handleDelete = async (id: number) => {
    await feedback.confirm('确定要删除？')
    await postDelete({ id })
    feedback.msgSuccess('删除成功')
    getLists()
}

/**
 * 函数说明：统计岗位列表指标，用于概览卡与工作区提示。
 */
const postMetrics = computed(() => {
    const rows = Array.isArray(pager.lists) ? pager.lists : []
    return rows.reduce(
        (result, item: any) => {
            result.total += 1
            if (Number(item.isStop) === 1) {
                result.stopped += 1
            } else {
                result.active += 1
            }
            return result
        },
        {
            total: Number(pager.count || 0),
            active: 0,
            stopped: 0
        }
    )
})

const postStatusLabel = computed(() => {
    if (Number(queryParams.isStop) === 0) return '仅看正常岗位'
    if (Number(queryParams.isStop) === 1) return '仅看停用岗位'
    return '查看全部岗位'
})
const postEmptyDescription = computed(() => {
    if (String(queryParams.code || '').trim() || String(queryParams.name || '').trim() || Number(queryParams.isStop) !== -1) {
        return '当前筛选条件下没有找到岗位，请检查编码、名称或状态。'
    }
    return '还没有岗位数据，建议先新增常用岗位。'
})

getLists()
</script>

<style lang="scss" scoped>
.post-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.post-metrics,
.post-filter-grid {
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

.post-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
    gap: 16px;
}

.post-workspace__main,
.post-workspace__aside {
    padding: 20px 22px;
    border-radius: 16px;
    background: #fff;
}

.post-workspace__eyebrow {
    font-size: 12px;
    font-weight: 600;
    color: #4e5969;
}

.post-workspace__title {
    margin-top: 10px;
    font-size: 22px;
    line-height: 1.4;
    font-weight: 700;
    color: #1d2129;
}

.post-workspace__desc {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.7;
    color: #4e5969;
}

.post-workspace__meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
}

.post-workspace__meta-item,
.post-workspace__checklist-item {
    padding: 14px 16px;
    border-radius: 14px;
    background: #f7f8fa;
}

.post-workspace__meta-item span,
.post-workspace__checklist-label {
    display: block;
    font-size: 12px;
    color: #86909c;
}

.post-workspace__meta-item strong,
.post-workspace__checklist-value {
    display: block;
    margin-top: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #1d2129;
}

.post-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: #1d2129;
}

.post-workspace__checklist {
    display: grid;
    gap: 12px;
    margin-top: 14px;
}

.post-workspace__checklist-item.is-ready {
    background: #effff6;
}

.post-workspace__checklist-item.is-warning {
    background: #fff7e8;
}

.post-workspace__checklist-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: #4e5969;
}

.post-workspace__actions {
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

.post-filter-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 16px;
    padding: 14px 16px;
    border-radius: 14px;
    background: #f7f8fa;
}

.post-filter-strip__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.post-filter-strip__chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: #fff;
    font-size: 12px;
    color: #4e5969;
}

.post-filter-strip__chip strong {
    color: #1d2129;
}

.post-filter-strip__hint {
    min-width: 240px;
    text-align: right;
}

.post-filter-strip__hint-label {
    font-size: 12px;
    color: #86909c;
}

.post-filter-strip__hint-text {
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
    .post-workspace {
        grid-template-columns: 1fr;
    }

    .post-workspace__meta {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .post-filter-strip {
        flex-direction: column;
        align-items: flex-start;
    }

    .post-filter-strip__hint {
        min-width: 0;
        text-align: left;
    }
}

@media (max-width: 768px) {
    .post-workspace__meta {
        grid-template-columns: 1fr;
    }
}
</style>
