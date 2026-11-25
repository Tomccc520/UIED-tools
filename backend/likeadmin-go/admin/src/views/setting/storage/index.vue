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
            <a-alert type="info" :closable="false" show-icon>
                当前上传服务使用本地存储，文件保存在服务器的上传目录中。
            </a-alert>
        </a-card>

        <a-card class="!border-none mt-4" :bordered="false">
            <a-alert v-if="state.loadError" type="error" :closable="false">
                存储方式读取失败，请重试。
                <template #action><a-button size="small" @click="getLists">重新读取</a-button></template>
            </a-alert>
            <a-spin v-else :loading="state.loading" class="w-full">
                <a-table v-slot:columns :data="state.lists" :pagination="false" :bordered="false" row-key="alias">
                    <a-table-column title="存储方式" data-index="name" :width="160" />
                    <a-table-column title="存储位置" data-index="describe" :min-width="220" />
                    <a-table-column title="状态" :width="100">
                        <template #cell="{ record }">
                            <a-tag v-if="record.status == 1" color="green">开启</a-tag>
                            <a-tag v-else color="red">关闭</a-tag>
                        </template>
                    </a-table-column>
                </a-table>
            </a-spin>
        </a-card>

    </div>
</template>

<script lang="ts" setup name="storage">
import { storageLists } from '@/api/setting/storage'

const state = reactive<{
    loadError: boolean
    loading: boolean
    lists: Record<string, any>[]
}>({
    loadError: false,
    loading: false,
    lists: []
})

/**
 * 函数说明：获取存储引擎列表数据
 */
const getLists = async () => {
    if (state.loading) return
    state.loadError = false
    state.loading = true
    try {
        const lists = await storageLists()
        if (!Array.isArray(lists)) throw new Error('存储列表响应格式错误')
        state.lists = lists
    } catch {
        state.loadError = true
    } finally {
        state.loading = false
    }
}

getLists()
</script>
