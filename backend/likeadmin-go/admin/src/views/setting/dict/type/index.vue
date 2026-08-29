<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="dict-type-page">
        <a-page-header
            title="字典类型管理"
            subtitle="维护字典类型定义，为系统状态、标签、选项提供统一数据源。"
        >
            <template #extra>
                <a-space>
                    <a-button @click="refreshLists">
                        <template #icon>
                            <icon-refresh />
                        </template>
                        刷新
                    </a-button>
                    <a-button v-perms="['setting:dict:type:add']" type="primary" @click="handleAdd">
                        <template #icon>
                            <icon-plus />
                        </template>
                        新增字典类型
                    </a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 3 }" :col-gap="12" :row-gap="12" class="dict-type-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">类型总数</div>
                    <div class="metric-value">{{ pager.count }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">当前页数据</div>
                    <div class="metric-value">{{ pager.lists.length }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">停用数量</div>
                    <div class="metric-value is-warning">{{ disabledCount }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>

        <a-card class="!border-none" :bordered="false">
            <a-grid :cols="{ xs: 1, md: 12 }" :col-gap="12" :row-gap="12" class="filter-grid">
                <a-grid-item :span="{ xs: 12, md: 4 }">
                    <a-input
                        v-model="queryParams.dictName"
                        placeholder="字典名称"
                        allow-clear
                        @press-enter="resetPage"
                        @clear="resetPage"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 4 }">
                    <a-input
                        v-model="queryParams.dictType"
                        placeholder="字典类型"
                        allow-clear
                        @press-enter="resetPage"
                        @clear="resetPage"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 2 }">
                    <a-select v-model="queryParams.dictStatus" allow-clear placeholder="状态">
                        <a-option :value="''">全部</a-option>
                        <a-option :value="1">正常</a-option>
                        <a-option :value="0">停用</a-option>
                    </a-select>
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 2 }">
                    <a-space>
                        <a-button type="primary" @click="resetPage">查询</a-button>
                        <a-button @click="resetParams">重置</a-button>
                    </a-space>
                </a-grid-item>
            </a-grid>
        </a-card>

        <a-card class="!border-none mt-4" :bordered="false">
            <div class="mb-4">
                <a-button
                    v-perms="['setting:dict:type:list']"
                    status="danger"
                    :disabled="!selectData.length"
                    @click="handleDelete(selectData)"
                >
                    <template #icon>
                        <icon-delete />
                    </template>
                    删除选中
                </a-button>
            </div>

            <a-table
                :data="pager.lists"
                :loading="pager.loading"
                :pagination="false"
                :bordered="false"
                row-key="id"
                :row-selection="rowSelection"
            >
                <a-table-column title="ID" data-index="id" :width="90" />
                <a-table-column title="字典名称" data-index="dictName" :width="160" />
                <a-table-column title="字典类型" data-index="dictType" :width="180" />
                <a-table-column title="状态" :width="100">
                    <template #cell="{ record }">
                        <a-tag v-if="record.dictStatus == 1" color="green">正常</a-tag>
                        <a-tag v-else color="red">停用</a-tag>
                    </template>
                </a-table-column>
                <a-table-column
                    title="备注"
                    data-index="dictRemark"
                    :min-width="170"
                    :ellipsis="true"
                    :tooltip="true"
                />
                <a-table-column title="创建时间" data-index="createTime" :width="180" />
                <a-table-column title="操作" :width="240" fixed="right">
                    <template #cell="{ record }">
                        <a-space>
                            <a-button
                                v-perms="['setting:dict:type:edit']"
                                type="text"
                                @click="handleEdit(record)"
                            >
                                编辑
                            </a-button>
                            <a-button v-perms="['setting:dict:data:list']" type="text">
                                <router-link
                                    :to="{
                                        path: getRoutePath('setting:dict:data:list'),
                                        query: { type: record.dictType }
                                    }"
                                >
                                    数据管理
                                </router-link>
                            </a-button>
                            <a-button
                                v-perms="['setting:dict:type:del']"
                                type="text"
                                status="danger"
                                @click="handleDelete([record.id])"
                            >
                                删除
                            </a-button>
                        </a-space>
                    </template>
                </a-table-column>
            </a-table>
            <a-empty
                v-if="!pager.loading && pager.lists.length === 0"
                description="暂无字典类型数据"
            />

            <div class="mt-4 flex justify-end">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </a-card>

        <edit-popup v-if="showEdit" ref="editRef" @success="getLists" @close="showEdit = false" />
    </div>
</template>

<script lang="ts" setup name="dictType">
import { IconDelete, IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { dictTypeDelete, dictTypeLists } from '@/api/setting/dict'
import { usePaging } from '@/hooks/usePaging'
import { getRoutePath } from '@/router'
import feedback from '@/utils/feedback'
import EditPopup from './edit.vue'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
const showEdit = ref(false)
const queryParams = reactive({
    dictName: '',
    dictType: '',
    dictStatus: 1 as '' | number
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: dictTypeLists,
    params: queryParams
})
const disabledCount = computed(() =>
    pager.lists.reduce(
        (total, item: Record<string, any>) => total + (Number(item.dictStatus) === 0 ? 1 : 0),
        0
    )
)

const selectData = ref<Array<string | number>>([])

const rowSelection = computed(() => ({
    type: 'checkbox',
    showCheckedAll: true,
    selectedRowKeys: selectData.value,
    onChange: (keys: Array<string | number>) => {
        selectData.value = keys
    }
}))

/**
 * 函数说明：刷新字典类型列表，并提供操作完成提示。
 */
const refreshLists = async () => {
    await getLists()
    feedback.msgSuccess('字典类型已刷新')
}

/**
 * 函数说明：打开新增字典类型弹窗
 */
const handleAdd = async () => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('add')
}

/**
 * 函数说明：打开编辑字典类型弹窗并回填数据
 */
const handleEdit = async (data: any) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    editRef.value?.setFormData(data)
}

/**
 * 函数说明：批量删除字典类型并刷新列表
 */
const handleDelete = async (ids: Array<string | number>) => {
    await feedback.confirm('确定要删除？')
    await dictTypeDelete({ ids })
    feedback.msgSuccess('删除成功')
    selectData.value = []
    getLists()
}

getLists()
</script>

<style scoped lang="scss">
.dict-type-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.dict-type-metrics {
    .metric-card {
        .metric-label {
            font-size: 12px;
            color: var(--color-text-3, #86909c);
        }
        .metric-value {
            margin-top: 6px;
            font-size: 24px;
            font-weight: 700;
            color: var(--color-text-1, #1d2129);
            &.is-warning {
                color: #ff7d00;
            }
        }
    }
}

.filter-grid {
    align-items: center;
}
</style>
