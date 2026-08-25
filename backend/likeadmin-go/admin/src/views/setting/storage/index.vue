<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="storage">
        <a-card class="!border-none" :bordered="false">
            <a-alert
                type="warning"
                :closable="false"
                show-icon
                banner
                title="温馨提示：1.切换存储方式后，需要将资源文件传输至新的存储端；2.请勿随意切换存储方式，可能导致图片无法查看"
            />
        </a-card>

        <a-card class="!border-none mt-4" :bordered="false">
            <a-spin :loading="state.loading" class="w-full">
                <a-table :data="state.lists" :pagination="false" :bordered="false" row-key="alias">
                    <a-table-column title="储存方式" data-index="alias" :width="160" />
                    <a-table-column title="储存位置" data-index="describe" :min-width="220" />
                    <a-table-column title="状态" :width="100">
                        <template #cell="{ record }">
                            <a-tag v-if="record.status == 1" color="green">开启</a-tag>
                            <a-tag v-else color="red">关闭</a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="操作" :width="100" fixed="right">
                        <template #cell="{ record }">
                            <a-button
                                v-perms="['setting:storage:edit']"
                                type="text"
                                @click="handleSet(record.alias)"
                            >
                                设置
                            </a-button>
                        </template>
                    </a-table-column>
                </a-table>
            </a-spin>
        </a-card>

        <edit-popup ref="editRef" @success="getLists" />
    </div>
</template>

<script lang="ts" setup name="storage">
import { storageLists } from '@/api/setting/storage'
import EditPopup from './edit.vue'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()

const state = reactive<{
    loading: boolean
    lists: Record<string, any>[]
}>({
    loading: false,
    lists: []
})

/**
 * 函数说明：获取存储引擎列表数据
 */
const getLists = async () => {
    state.loading = true
    try {
        state.lists = (await storageLists()) || []
    } finally {
        state.loading = false
    }
}

/**
 * 函数说明：打开指定存储引擎的配置弹窗
 */
const handleSet = (alias: string) => {
    editRef.value?.open(alias)
}

getLists()
</script>
