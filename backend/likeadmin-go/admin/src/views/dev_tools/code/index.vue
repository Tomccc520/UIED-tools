<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="code-generation">
        <a-card class="!border-none" :bordered="false">
            <a-form class="mb-[-16px]" :model="formData" layout="inline">
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
                    <a-button type="primary" @click="resetPage">查询</a-button>
                    <a-button class="ml-2" @click="resetParams">重置</a-button>
                </a-form-item>
            </a-form>
        </a-card>
        <a-card class="!border-none mt-4" :bordered="false">
            <a-spin :loading="pager.loading">
                <div class="flex">
                    <data-table
                        v-perms="['gen:importTable']"
                        class="inline-block mr-[10px]"
                        @success="getLists"
                    >
                        <a-button type="primary">
                            <template #icon>
                                <icon name="system-icon-Plus" />
                            </template>
                            导入数据表
                        </a-button>
                    </data-table>
                    <a-button
                        v-perms="['gen:delTable']"
                        :disabled="!selectData.length"
                        @click="handleDelete()"
                        status="danger"
                    >
                        <template #icon>
                            <icon name="system-icon-Delete" />
                        </template>
                        删除
                    </a-button>
                    <a-button
                        class="ml-2"
                        v-perms="['gen:genCode', 'gen:downloadCode']"
                        :disabled="!selectData.length"
                        @click="handleGenerate(selectData)"
                    >
                        生成代码
                    </a-button>
                </div>
                <div class="mt-4">
                    <a-table
                        :data="pager.lists"
                        :loading="pager.loading"
                        :pagination="false"
                        :bordered="false"
                        row-key="id"
                        :row-selection="rowSelection"
                    >
                        <a-table-column title="表名称" data-index="tableName" :width="220" />
                        <a-table-column title="表描述" data-index="tableComment" :width="220" />
                        <a-table-column title="创建时间" data-index="createTime" :width="220" />
                        <a-table-column title="更新时间" data-index="updateTime" :width="220" />
                        <a-table-column title="操作" :width="180" fixed="right">
                            <template #cell="{ record }">
                                <div class="flex items-center">
                                    <a-button
                                        v-perms="['gen:previewCode']"
                                        type="text"
                                        @click="handlePreview(record.id)"
                                    >
                                        预览
                                    </a-button>
                                    <a-button type="text" v-perms="['gen:editTable']">
                                        <router-link
                                            :to="{
                                                path: getRoutePath('gen:editTable'),
                                                query: {
                                                    id: record.id
                                                }
                                            }"
                                        >
                                            编辑
                                        </router-link>
                                    </a-button>
                                    <a-dropdown
                                        class="ml-2"
                                        @select="handleCommand($event, record)"
                                        v-perms="[
                                            'gen:genCode',
                                            'gen:downloadCode',
                                            'gen:syncTable',
                                            'gen:delTable'
                                        ]"
                                    >
                                        <a-button type="text">
                                            更多
                                            <icon name="system-icon-ArrowDown" :size="14" />
                                        </a-button>
                                        <template #content>
                                            <a-doption
                                                v-perms="['gen:genCode', 'gen:downloadCode']"
                                                value="generate"
                                            >
                                                生成代码
                                            </a-doption>
                                            <a-doption v-perms="['gen:syncTable']" value="sync">
                                                同步
                                            </a-doption>
                                            <a-doption v-perms="['gen:delTable']" value="delete">
                                                删除
                                            </a-doption>
                                        </template>
                                    </a-dropdown>
                                </div>
                            </template>
                        </a-table-column>
                    </a-table>
                </div>
                <div class="flex justify-end mt-4">
                    <pagination v-model="pager" @change="getLists" />
                </div>
            </a-spin>
        </a-card>
        <code-preview
            v-if="previewState.show"
            v-model="previewState.show"
            :code="previewState.code"
        />
    </div>
</template>

<script lang="ts" setup name="codeGenerate">
import {
    generateTable,
    syncColumn,
    generateDelete,
    generatePreview,
    generateCode,
    downloadCode
} from '@/api/tools/code'
import { usePaging } from '@/hooks/usePaging'
import DataTable from '../components/data-table.vue'
import CodePreview from '../components/code-preview.vue'
import feedback from '@/utils/feedback'
import { streamFileDownload } from '@/utils/file'
import { getRoutePath } from '@/router'

const formData = reactive({
    tableName: '',
    tableComment: ''
})

const previewState = reactive({
    show: false,
    loading: false,
    code: {}
})

const { pager, getLists, resetParams, resetPage } = usePaging({
    fetchFun: generateTable,
    params: formData
})

const selectData = ref<any[]>([])

const rowSelection = computed(() => ({
    type: 'checkbox',
    showCheckedAll: true,
    selectedRowKeys: selectData.value.map((item) => item.id),
    onChange: (_keys: Array<string | number>, rows: any[]) => {
        selectData.value = rows
    }
}))

/**
 * 函数说明：同步指定数据表结构
 */
const handleSync = async (id: number) => {
    await feedback.confirm('确定要同步表结构？')
    await syncColumn({ id })
    feedback.msgSuccess('操作成功')
}

/**
 * 函数说明：删除已导入的数据表
 */
const handleDelete = async (ids?: number[]) => {
    if (!ids) ids = selectData.value.map(({ id }) => id)
    await feedback.confirm('确定要删除？')
    await generateDelete({ ids })
    feedback.msgSuccess('删除成功')
    selectData.value = []
    getLists()
}

/**
 * 函数说明：预览指定数据表生成的代码
 */
const handlePreview = async (id: number) => {
    const data: any = await generatePreview({ id })
    previewState.code = data
    previewState.show = true
}

/**
 * 函数说明：按生成方式执行下载或服务端生成
 */
const handleGenerate = async (selectData: any[]) => {
    const downloadTables = getTables(selectData, 0)
    const genTables = getTables(selectData, 1)
    if (downloadTables) {
        const file = await downloadCode({ tables: downloadTables })
        streamFileDownload(file, 'likeadmin-curd.zip')
    }
    if (genTables) {
        await generateCode({ tables: genTables })
        feedback.msgSuccess('生成成功')
    }
}

/**
 * 函数说明：过滤并拼接符合类型的数据表名称
 */
const getTables = (selectData: any[], type: 0 | 1) => {
    return selectData
        .filter(({ genType }) => genType == type)
        .map(({ tableName }) => tableName)
        .join()
}

/**
 * 函数说明：处理“更多”下拉菜单动作
 */
const handleCommand = (command: any, row: any) => {
    switch (command) {
        case 'generate':
            handleGenerate([row])
            break
        case 'sync':
            handleSync(row.id)
            break
        case 'delete':
            handleDelete([row.id])
    }
}

onActivated(() => {
    getLists()
})

getLists()
</script>
