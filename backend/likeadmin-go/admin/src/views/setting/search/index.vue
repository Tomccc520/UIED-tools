<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="hot-search">
        <a-card class="!border-none" :bordered="false">
            <a-form :model="formData" layout="vertical">
                <a-form-item label="功能状态" class="!mb-0">
                    <div>
                        <a-radio-group v-model="formData.isHotSearch">
                            <a-radio :value="1">开启</a-radio>
                            <a-radio :value="0">关闭</a-radio>
                        </a-radio-group>
                        <div class="form-tips">默认开启，关闭则前端不显示该功能</div>
                    </div>
                </a-form-item>
            </a-form>
        </a-card>

        <a-card class="!border-none mt-4" :bordered="false">
            <div class="lg:flex">
                <div class="flex-1 min-w-0">
                    <a-button
                        v-perms="['setting:search:save']"
                        type="primary"
                        class="mb-4"
                        @click="handleAdd"
                    >
                        <template #icon>
                            <icon-plus />
                        </template>
                        添加
                    </a-button>

                    <a-table
                        :data="formData.list"
                        :pagination="false"
                        :bordered="false"
                        row-key="__rowKey"
                    >
                        <a-table-column title="关键词" :min-width="220">
                            <template #cell="{ record }">
                                <a-input
                                    v-model="record.name"
                                    allow-clear
                                    placeholder="请输入关键字"
                                    :max-length="30"
                                    show-word-limit
                                />
                            </template>
                        </a-table-column>
                        <a-table-column title="排序" :width="120">
                            <template #cell="{ record }">
                                <a-input-number
                                    v-model="record.sort"
                                    :min="0"
                                    :max="9999"
                                    hide-button
                                />
                            </template>
                        </a-table-column>
                        <a-table-column title="操作" :width="100" fixed="right">
                            <template #cell="{ rowIndex }">
                                <a-button
                                    v-perms="['setting:search:save']"
                                    type="text"
                                    status="danger"
                                    @click="handleDel(rowIndex)"
                                >
                                    删除
                                </a-button>
                            </template>
                        </a-table-column>
                    </a-table>
                </div>

                <div class="flex-none hot-search-phone mt-4 lg:mt-0 lg:ml-4">
                    <div class="mb-4 text-center">- 热搜预览图 -</div>
                    <div class="hot-search-phone-content">
                        <div class="search-com">
                            <div class="search-con flex items-center px-[15px]">
                                <icon-search :size="17" />
                                <span class="ml-[5px]">请输入关键词搜索</span>
                            </div>
                        </div>
                        <div class="hot-search-title">热门搜索</div>
                        <div class="hot-search-text">
                            <span
                                v-for="(text, index) in previewList"
                                :key="index"
                                class="truncate max-w-full"
                            >
                                {{ text.name }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </a-card>

        <footer-btns v-perms="['setting:search:save']">
            <a-button type="primary" @click="handleSave">保存</a-button>
        </footer-btns>
    </div>
</template>

<script setup lang="ts" name="search">
import { IconPlus, IconSearch } from '@arco-design/web-vue/es/icon'
import { getSearch, setSearch } from '@/api/setting/search'
import type { List, Search } from '@/api/setting/search'
import feedback from '@/utils/feedback'

interface SearchListItem extends List {
    __rowKey: string
}

const formData = reactive<{
    isHotSearch: number
    list: SearchListItem[]
}>({
    isHotSearch: 1,
    list: []
})

/**
 * 函数说明：根据接口数据重建行键，确保表格输入时键稳定
 */
const normalizeList = (list: List[] = []): SearchListItem[] => {
    return list.map((item, index) => ({
        name: item.name || '',
        sort: Number(item.sort || 0),
        __rowKey: `${Date.now()}-${index}-${Math.random().toString(16).slice(2, 8)}`
    }))
}

const previewList = computed(() => {
    return formData.list
        .filter((item) => String(item.name || '').trim())
        .slice()
        .sort((v1, v2) => Number(v2.sort || 0) - Number(v1.sort || 0))
})

/**
 * 函数说明：获取热门搜索配置并回填表单
 */
const getData = async () => {
    try {
        const data = (await getSearch()) as Search
        formData.isHotSearch = Number(data?.isHotSearch ?? 1)
        formData.list = normalizeList(data?.list || [])
    } catch (error) {
        console.log('获取=>', error)
    }
}

/**
 * 函数说明：新增一条热搜关键词配置
 */
const handleAdd = () => {
    formData.list.push({
        name: '',
        sort: 0,
        __rowKey: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
    })
}

/**
 * 函数说明：删除指定索引的热搜关键词
 */
const handleDel = (index: number) => {
    formData.list.splice(index, 1)
}

/**
 * 函数说明：保存热门搜索配置
 */
const handleSave = async () => {
    try {
        const payload: Search = {
            isHotSearch: Number(formData.isHotSearch || 0),
            list: formData.list.map((item) => ({
                name: String(item.name || '').trim(),
                sort: Number(item.sort || 0)
            }))
        }
        await setSearch(payload)
        feedback.msgSuccess('操作成功')
        getData()
    } catch (error) {
        console.log('保存=>', error)
    }
}

getData()
</script>

<style lang="scss" scoped>
.hot-search {
    .hot-search-phone {
        width: 300px;
        &-content {
            width: 100%;
            height: 530px;
            padding: 12px 12px;
            border-radius: 10px;
            border: 1px solid #e6e6e6;

            .search-com {
                .search-con {
                    height: 100%;
                    height: 36px;
                    border-radius: 36px;
                    background: #f4f4f4;
                    color: #999999;
                }
            }

            .hot-search-title {
                padding: 10px 0;
                font-size: 13px;
            }

            .hot-search-text {
                span {
                    font-size: 12px;
                    border-radius: 100px;
                    padding: 5px 10px;
                    margin: 0 6px 6px 0;
                    display: inline-block;
                    background-color: #f4f4f4;
                }
            }
        }
    }
}
</style>
