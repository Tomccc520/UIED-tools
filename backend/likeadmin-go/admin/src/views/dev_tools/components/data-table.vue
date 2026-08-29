<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="data-table">
        <popup
            ref="popupRef"
            :clickModalClose="false"
            title="选择表"
            width="900px"
            :async="true"
            @confirm="handleConfirm"
        >
            <template #trigger>
                <slot></slot>
            </template>
            <a-form class="table-filter-form" :model="formData" layout="inline">
                <a-form-item label="表名称">
                    <a-input
                        class="w-[280px]"
                        v-model="formData.tableName"
                        allow-clear
                        @press-enter="resetPage"
                        @clear="resetPage"
                    />
                </a-form-item>
                <a-form-item label="表描述">
                    <a-input
                        class="w-[280px]"
                        v-model="formData.tableComment"
                        allow-clear
                        @press-enter="resetPage"
                        @clear="resetPage"
                    />
                </a-form-item>
                <a-form-item>
                    <a-space>
                        <a-button type="primary" @click="resetPage">查询</a-button>
                        <a-button @click="resetParams">重置</a-button>
                    </a-space>
                </a-form-item>
            </a-form>
            <div class="m-4">
                <a-table
                    :data="pager.lists"
                    :loading="pager.loading"
                    :pagination="false"
                    :bordered="false"
                    row-key="tableName"
                    :row-selection="rowSelection"
                    :scroll="{ y: 400 }"
                >
                    <a-table-column title="表名称" data-index="tableName" :width="220" />
                    <a-table-column title="表描述" data-index="tableComment" :width="260" />
                    <a-table-column title="创建时间" data-index="createTime" :width="220" />
                </a-table>
            </div>
            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </popup>
    </div>
</template>

<script lang="ts" setup>
import Popup from '@/components/popup/index.vue'
import Pagination from '@/components/pagination/index.vue'
import { usePaging } from '@/hooks/usePaging'
import { dataTable, selectTable } from '@/api/tools/code'
import feedback from '@/utils/feedback'

const emit = defineEmits<{
    (event: 'success'): void
}>()

const popupRef = shallowRef<InstanceType<typeof Popup>>()

const formData = reactive({
    tableName: '', // 表名称
    tableComment: '' // 表描述
})

const { pager, getLists, resetParams, resetPage } = usePaging({
    fetchFun: dataTable,
    params: formData,
    size: 10
})

const selectData = ref<any[]>([])

const rowSelection = computed(() => ({
    type: 'checkbox',
    showCheckedAll: true,
    selectedRowKeys: selectData.value,
    onChange: (keys: Array<string | number>) => {
        selectData.value = keys
    }
}))

/**
 * 函数说明：确认导入选中的数据表
 */
const handleConfirm = async () => {
    if (!selectData.value.length) return feedback.msgError('请选择数据表')
    await selectTable({
        tables: selectData.value.join()
    })
    feedback.msgSuccess('导入成功')
    popupRef.value?.close()
    emit('success')
}

/**
 * 函数说明：弹窗打开时拉取最新数据表列表
 */
watch(
    () => popupRef.value?.visible,
    (value) => {
        if (value) getLists()
    }
)
</script>

<style lang="scss" scoped>
.table-filter-form {
    padding: 4px 0 2px;
}
</style>
