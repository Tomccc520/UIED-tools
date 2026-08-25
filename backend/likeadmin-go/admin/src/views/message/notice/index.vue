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
            <a-alert
                type="warning"
                show-icon
                :closable="false"
                content="温馨提示：平台配置在各个场景下的通知发送方式和内容模板"
            />
        </a-card>

        <a-card class="!border-none mt-4" :bordered="false">
            <a-tabs v-model:active-key="tabsActive" @change="getLists">
                <a-tab-pane
                    v-for="(item, index) in tabsMap"
                    :key="index"
                    :title="item.name"
                    :name="item.type"
                />
            </a-tabs>

            <a-table
                :loading="state.loading"
                :data="state.lists"
                :pagination="false"
                :bordered="false"
                row-key="id"
            >
                <a-table-column title="通知场景" data-index="name" :width="160" />
                <a-table-column title="通知类型" data-index="type" :width="180" />
                <a-table-column title="短信通知" :width="100">
                    <template #cell="{ record }">
                        <a-tag v-if="record.smsStatus == 1" color="green">开启</a-tag>
                        <a-tag v-else color="red">关闭</a-tag>
                    </template>
                </a-table-column>
                <a-table-column title="操作" :width="100" fixed="right">
                    <template #cell="{ record }">
                        <a-button v-perms="['setting:notice:detail']" type="text">
                            <router-link
                                :to="{
                                    path: getRoutePath('setting:notice:detail'),
                                    query: { id: record.id }
                                }"
                            >
                                设置
                            </router-link>
                        </a-button>
                    </template>
                </a-table-column>
            </a-table>
        </a-card>
    </div>
</template>

<script lang="ts" setup name="notice">
import { noticeLists } from '@/api/message'
import { getRoutePath } from '@/router'

enum NoticeEnums {
    USER = 1,
    PLATFORM = 2
}

const tabsActive = ref<number>(NoticeEnums.USER)
const tabsMap = [
    {
        name: '通知用户',
        type: NoticeEnums.USER
    },
    {
        name: '通知平台',
        type: NoticeEnums.PLATFORM
    }
]

// 列表数据
const state = reactive({
    loading: false,
    lists: [] as any[]
})

/**
 * 函数说明：按当前通知对象（用户/平台）拉取通知场景列表
 */
const getLists = async () => {
    try {
        state.loading = true
        state.lists = await noticeLists({
            recipient: tabsActive.value
        })
    } finally {
        state.loading = false
    }
}

onActivated(() => {
    getLists()
})

getLists()
</script>
