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
                title="温馨提示：用于管理网站的分类，只可添加到一级"
                :closable="false"
                show-icon
                banner
            />
        </a-card>

        <a-card class="!border-none mt-4" :bordered="false">
            <div>
                <a-button
                    class="mb-4"
                    v-perms="['article:cate:add']"
                    type="primary"
                    @click="handleAdd()"
                >
                    <template #icon>
                        <icon-plus />
                    </template>
                    新增
                </a-button>
            </div>

            <a-table
                :data="pager.lists"
                :loading="pager.loading"
                :pagination="false"
                :bordered="false"
            >
                <a-table-column title="栏目名称" data-index="name" :min-width="140" />
                <a-table-column title="文章数" data-index="number" :min-width="120" />
                <a-table-column title="状态" :min-width="120">
                    <template #cell="{ record }">
                        <a-switch
                            v-perms="['article:cate:change']"
                            v-model="record.isShow"
                            :checked-value="1"
                            :unchecked-value="0"
                            @change="changeStatus(record.id)"
                        />
                    </template>
                </a-table-column>
                <a-table-column title="排序" data-index="sort" :min-width="120" />
                <a-table-column title="操作" :width="120" fixed="right">
                    <template #cell="{ record }">
                        <a-button
                            v-perms="['article:cate:edit']"
                            type="text"
                            @click="handleEdit(record)"
                        >
                            编辑
                        </a-button>
                        <a-button
                            v-perms="['article:cate:del']"
                            type="text"
                            status="danger"
                            @click="handleDelete(record.id)"
                        >
                            删除
                        </a-button>
                    </template>
                </a-table-column>
            </a-table>

            <div class="flex justify-end mt-4">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </a-card>

        <edit-popup v-if="showEdit" ref="editRef" @success="getLists" @close="showEdit = false" />
    </div>
</template>
<script lang="ts" setup name="articleColumn">
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { articleCateDelete, articleCateLists, articleCateStatus } from '@/api/article'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'
import EditPopup from './edit.vue'

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
const showEdit = ref(false)

const { pager, getLists } = usePaging({
    fetchFun: articleCateLists
})

/**
 * 函数说明：打开新增栏目弹窗
 */
const handleAdd = async () => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('add')
}

/**
 * 函数说明：打开编辑栏目弹窗并读取详情
 */
const handleEdit = async (data: any) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    editRef.value?.getDetail(data)
}

/**
 * 函数说明：删除栏目并刷新列表
 */
const handleDelete = async (id: number) => {
    await feedback.confirm('确定要删除？')
    await articleCateDelete({ id })
    feedback.msgSuccess('删除成功')
    getLists()
}

/**
 * 函数说明：切换栏目状态，失败时回滚列表展示
 */
const changeStatus = async (id: number) => {
    try {
        await articleCateStatus({ id })
        feedback.msgSuccess('修改成功')
        getLists()
    } catch (error) {
        getLists()
    }
}

getLists()
</script>
