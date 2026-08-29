<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="dict-data-page">
        <a-page-header
            title="字典数据管理"
            subtitle="维护字典项与取值，确保业务表单和状态文案可运营。"
        >
            <template #extra>
                <a-space>
                    <a-button @click="router.back()">
                        <template #icon>
                            <icon-left />
                        </template>
                        返回类型列表
                    </a-button>
                    <a-button @click="refreshLists">
                        <template #icon>
                            <icon-refresh />
                        </template>
                        刷新
                    </a-button>
                    <a-button v-perms="['setting:dict:data:add']" type="primary" @click="handleAdd">
                        <template #icon>
                            <icon-plus />
                        </template>
                        添加数据
                    </a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 3 }" :col-gap="12" :row-gap="12" class="dict-data-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">数据总数</div>
                    <div class="metric-value">{{ pager.count }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">当前字典类型</div>
                    <div class="metric-value metric-text">{{ currentDictTypeName }}</div>
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
                    <a-select
                        v-model="queryParams.dictType"
                        allow-clear
                        @change="handleDictTypeChange"
                        placeholder="字典类型"
                    >
                        <a-option
                            v-for="item in optionsData.dictType"
                            :key="item.id"
                            :value="item.dictType"
                        >
                            {{ item.dictName }}
                        </a-option>
                    </a-select>
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 4 }">
                    <a-input
                        v-model="queryParams.name"
                        placeholder="数据名称"
                        allow-clear
                        @press-enter="handleQuery"
                        @clear="handleQuery"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 2 }">
                    <a-select v-model="queryParams.status" allow-clear placeholder="数据状态">
                        <a-option :value="''">全部</a-option>
                        <a-option :value="1">正常</a-option>
                        <a-option :value="0">停用</a-option>
                    </a-select>
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 2 }">
                    <a-space>
                        <a-button type="primary" @click="handleQuery">查询</a-button>
                        <a-button @click="handleReset">重置</a-button>
                    </a-space>
                </a-grid-item>
            </a-grid>
        </a-card>

        <a-card class="!border-none mt-4" :bordered="false">
            <div class="mb-4">
                <a-button
                    v-perms="['setting:dict:data:del']"
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
                <a-table-column title="数据名称" data-index="name" :width="160" />
                <a-table-column title="数据值" data-index="value" :width="170" />
                <a-table-column title="状态" :width="100">
                    <template #cell="{ record }">
                        <a-tag v-if="record.status == 1" color="green">正常</a-tag>
                        <a-tag v-else color="red">停用</a-tag>
                    </template>
                </a-table-column>
                <a-table-column
                    title="备注"
                    data-index="remark"
                    :min-width="170"
                    :ellipsis="true"
                    :tooltip="true"
                />
                <a-table-column title="排序" data-index="sort" :width="90" />
                <a-table-column title="操作" :width="140" fixed="right">
                    <template #cell="{ record }">
                        <a-space>
                            <a-button
                                v-perms="['setting:dict:data:edit']"
                                type="text"
                                @click="handleEdit(record)"
                            >
                                编辑
                            </a-button>
                            <a-button
                                v-perms="['setting:dict:data:del']"
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
            <a-empty v-if="!pager.loading && pager.lists.length === 0" description="暂无字典数据" />

            <div class="mt-4 flex justify-end">
                <pagination v-model="pager" @change="handlePageChange" />
            </div>
        </a-card>

        <edit-popup v-if="showEdit" ref="editRef" @success="getLists" @close="showEdit = false" />
    </div>
</template>

<script lang="ts" setup name="dictData">
import { IconDelete, IconLeft, IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { dictDataDelete, dictDataLists, dictTypeAll } from '@/api/setting/dict'
import { useDictOptions } from '@/hooks/useDictOptions'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'
import EditPopup from './edit.vue'

const route = useRoute()
const router = useRouter()
const showEdit = ref(false)
const editRef = shallowRef<InstanceType<typeof EditPopup>>()

const queryParams = reactive({
    dictType: String(route.query.type || ''),
    name: '',
    status: 1 as '' | number
})

const { optionsData } = useDictOptions<{
    dictType: any[]
}>({
    dictType: {
        api: dictTypeAll
    }
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: dictDataLists,
    params: queryParams
})
const hasLoadedDictData = ref(false)
const disabledCount = computed(() =>
    pager.lists.reduce(
        (total, item: Record<string, any>) => total + (Number(item.status) === 0 ? 1 : 0),
        0
    )
)
const currentDictTypeName = computed(() => {
    const dictItem = optionsData.dictType.find((item) => item.dictType === queryParams.dictType)
    return dictItem?.dictName || '全部字典'
})

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
 * 函数说明：当未指定字典类型时，自动使用第一个可用类型，避免列表接口参数为空导致异常。
 */
const syncDefaultDictType = () => {
    if (queryParams.dictType) {
        return
    }
    if (!Array.isArray(optionsData.dictType) || optionsData.dictType.length === 0) {
        return
    }
    queryParams.dictType = String(optionsData.dictType[0]?.dictType || '')
}

/**
 * 函数说明：统一封装字典数据加载，收敛异常并给出明确提示，避免页面出现未捕获报错。
 */
const loadDictDataList = async (silent = false) => {
    try {
        await getLists()
        hasLoadedDictData.value = true
    } catch {
        pager.lists = []
        pager.count = 0
        if (!queryParams.dictType) {
            if (!silent) {
                feedback.msgWarning('请先选择字典类型后再查询')
            }
            return
        }
        if (!silent) {
            feedback.msgError('字典数据加载失败，请检查字典类型配置')
        }
    }
}

/**
 * 函数说明：切换字典类型后回到第一页并刷新列表。
 */
const handleDictTypeChange = async () => {
    await resetPage()
}

/**
 * 函数说明：执行查询并保证错误被捕获，避免 Promise 未处理告警。
 */
const handleQuery = async () => {
    await loadDictDataList()
}

/**
 * 函数说明：重置筛选条件后自动补全默认字典类型并刷新列表。
 */
const handleReset = async () => {
    await resetParams()
    syncDefaultDictType()
    await loadDictDataList(true)
}

/**
 * 函数说明：分页变化后刷新列表并收敛异常反馈。
 */
const handlePageChange = async () => {
    await loadDictDataList()
}

/**
 * 函数说明：刷新字典数据列表，并提示当前数据已同步。
 */
const refreshLists = async () => {
    await loadDictDataList()
    feedback.msgSuccess('字典数据已刷新')
}

/**
 * 函数说明：打开新增字典数据弹窗并注入当前字典类型
 */
const handleAdd = async () => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('add')
    const type = optionsData.dictType.find((item) => item.dictType == queryParams.dictType)
    editRef.value?.setFormData({
        typeValue: type?.dictType,
        typeId: type?.id || 0
    })
}

/**
 * 函数说明：打开编辑字典数据弹窗并注入字典类型文本
 */
const handleEdit = async (data: any) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    const type = optionsData.dictType.find((item) => item.dictType == queryParams.dictType)
    editRef.value?.setFormData({ ...data, typeValue: type?.dictType || '' })
}

/**
 * 函数说明：删除字典数据并刷新列表
 */
const handleDelete = async (ids: Array<string | number>) => {
    await feedback.confirm('确定要删除？')
    await dictDataDelete({ ids })
    feedback.msgSuccess('删除成功')
    selectData.value = []
    await loadDictDataList(true)
}

watch(
    () => optionsData.dictType,
    (dictTypeOptions) => {
        if (!Array.isArray(dictTypeOptions) || dictTypeOptions.length === 0) {
            return
        }
        const previousDictType = queryParams.dictType
        syncDefaultDictType()
        if (!hasLoadedDictData.value || (!previousDictType && queryParams.dictType)) {
            void loadDictDataList(true)
        }
    },
    { deep: true, immediate: true }
)

onMounted(() => {
    void loadDictDataList(true)
})
</script>

<style scoped lang="scss">
.dict-data-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.dict-data-metrics {
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
            &.metric-text {
                font-size: 16px;
                font-weight: 600;
            }
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
