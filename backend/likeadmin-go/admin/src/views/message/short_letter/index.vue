<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div>
        <a-card class="!border-none" :bordered="false">
            <a-table
                :loading="state.loading"
                :data="state.lists"
                :pagination="false"
                :bordered="false"
                row-key="alias"
            >
                <a-table-column title="短信渠道" data-index="name" :width="160" />
                <a-table-column title="状态" :width="120">
                    <template #cell="{ record }">
                        <a-tag v-if="record.status == 1" color="green">开启</a-tag>
                        <a-tag v-else color="red">关闭</a-tag>
                    </template>
                </a-table-column>
                <a-table-column title="操作" :width="120" fixed="right">
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
        </a-card>

        <edit-popup ref="editRef" @success="getLists" />
    </div>
</template>

<script lang="ts" setup name="shortLetter">
import { smsLists } from '@/api/message'
import EditPopup from './edit.vue'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()

// 列表数据
const state = reactive({
    loading: false,
    lists: [] as any[]
})

/**
 * 函数说明：获取短信渠道列表并同步加载状态
 */
const getLists = async () => {
    try {
        state.loading = true
        state.lists = await smsLists()
    } finally {
        state.loading = false
    }
}

/**
 * 函数说明：打开短信渠道设置弹窗
 */
const handleSet = (alias: string) => {
    editRef.value?.open(alias)
}

getLists()
</script>
