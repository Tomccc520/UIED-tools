<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="article-lists">
        <a-card class="!border-none" :bordered="false">
            <a-form class="mb-[-16px]" :model="queryParams" layout="inline">
                <a-form-item label="文章标题">
                    <a-input
                        v-model="queryParams.title"
                        class="w-[280px]"
                        allow-clear
                        @press-enter="resetPage"
                        @clear="resetPage"
                    />
                </a-form-item>
                <a-form-item label="栏目名称">
                    <a-select v-model="queryParams.cid" class="w-[280px]" allow-clear>
                        <a-option :value="''">全部</a-option>
                        <a-option
                            v-for="item in optionsData.articleCate"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                        />
                    </a-select>
                </a-form-item>
                <a-form-item label="文章状态">
                    <a-select v-model="queryParams.isShow" class="w-[280px]" allow-clear>
                        <a-option :value="''">全部</a-option>
                        <a-option :value="1" label="显示" />
                        <a-option :value="0" label="隐藏" />
                    </a-select>
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" @click="resetPage">查询</a-button>
                    <a-button class="ml-2" @click="resetParams">重置</a-button>
                </a-form-item>
            </a-form>
        </a-card>

        <a-card class="!border-none mt-4" :bordered="false">
            <div>
                <router-link
                    v-perms="['article:add', 'article:add/edit']"
                    :to="{
                        path: getRoutePath('article:add/edit')
                    }"
                >
                    <a-button type="primary" class="mb-4">
                        <template #icon>
                            <icon-plus />
                        </template>
                        发布文章
                    </a-button>
                </router-link>
            </div>

            <a-table
                :data="pager.lists"
                :loading="pager.loading"
                :pagination="false"
                :bordered="false"
            >
                <a-table-column title="ID" data-index="id" :min-width="80" />
                <a-table-column title="封面" :min-width="100">
                    <template #cell="{ record }">
                        <image-contain
                            v-if="record.image"
                            :src="record.image"
                            :width="60"
                            :height="45"
                            :preview-src-list="[record.image]"
                            preview-teleported
                            fit="contain"
                        />
                    </template>
                </a-table-column>
                <a-table-column
                    title="标题"
                    data-index="title"
                    :min-width="180"
                    :ellipsis="true"
                    :tooltip="true"
                />
                <a-table-column title="栏目" data-index="category" :min-width="100" />
                <a-table-column title="作者" data-index="author" :min-width="120" />
                <a-table-column title="浏览量" data-index="visit" :min-width="100" />
                <a-table-column title="状态" :min-width="100">
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
                <a-table-column title="排序" data-index="sort" :min-width="100" />
                <a-table-column title="发布时间" data-index="createTime" :min-width="160" />
                <a-table-column title="操作" :width="120" fixed="right">
                    <template #cell="{ record }">
                        <a-button v-perms="['article:edit', 'article:add/edit']" type="text">
                            <router-link
                                :to="{
                                    path: getRoutePath('article:add/edit'),
                                    query: { id: record.id }
                                }"
                            >
                                编辑
                            </router-link>
                        </a-button>
                        <a-button
                            v-perms="['article:del']"
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
    </div>
</template>
<script lang="ts" setup name="articleLists">
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { articleLists, articleDelete, articleStatus, articleCateAll } from '@/api/article'
import { useDictOptions } from '@/hooks/useDictOptions'
import { usePaging } from '@/hooks/usePaging'
import { getRoutePath } from '@/router'
import feedback from '@/utils/feedback'

const queryParams = reactive({
    title: '',
    cid: '',
    isShow: ''
})

const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: articleLists,
    params: queryParams
})

const { optionsData } = useDictOptions<{
    articleCate: any[]
}>({
    articleCate: {
        api: articleCateAll
    }
})

/**
 * 函数说明：切换文章显示状态，失败时回滚列表状态
 */
const changeStatus = async (id: number) => {
    try {
        await articleStatus({ id })
        feedback.msgSuccess('修改成功')
        getLists()
    } catch (error) {
        getLists()
    }
}

/**
 * 函数说明：删除文章并刷新列表
 */
const handleDelete = async (id: number) => {
    await feedback.confirm('确定要删除？')
    await articleDelete({ id })
    feedback.msgSuccess('删除成功')
    getLists()
}

onActivated(() => {
    getLists()
})

getLists()
</script>
