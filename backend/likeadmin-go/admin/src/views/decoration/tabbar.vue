<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="decoration-tabbar min-w-[800px]">
        <a-card class="!border-none flex-1" :bordered="false" :body-style="{ height: '100%' }">
            <div class="flex h-full items-start">
                <div class="pages-preview mx-[30px]">
                    <div class="tabbar flex">
                        <div
                            class="tabbar-item flex flex-col justify-center items-center flex-1"
                            v-for="(item, index) in tabbar.list"
                            :key="index"
                            :style="{ color: tabbar.style.defaultColor }"
                        >
                            <img class="w-[22px] h-[22px]" :src="item.unselected" alt="" />
                            <div class="leading-3 text-[12px] mt-[4px]">{{ item.name }}</div>
                        </div>
                    </div>
                </div>
                <div class="flex-1">
                    <div
                        class="title flex items-center before:w-[3px] before:h-[14px] before:block before:bg-primary before:mr-2"
                    >
                        底部导航设置
                        <span class="form-tips ml-[10px] !mt-0">
                            至少添加2个导航，最多添加5个导航
                        </span>
                    </div>
                    <a-form layout="vertical">
                        <a-tabs v-model:active-key="activeTab">
                            <a-tab-pane key="content" title="导航图片">
                                <div class="mb-[18px]">
                                    <draggable
                                        class="draggable"
                                        v-model="tabbar.list"
                                        animation="300"
                                        draggable=".draggable"
                                        :move="onMove"
                                    >
                                        <template v-slot:item="{ element, index }">
                                            <del-wrap
                                                @close="handleDelete(index)"
                                                class="max-w-[400px]"
                                                :class="{ draggable: index != 0 }"
                                            >
                                                <div class="bg-fill-light w-full p-4 mt-4">
                                                    <a-form-item label="导航图标">
                                                        <material-picker
                                                            v-model="element.unselected"
                                                            upload-class="bg-body"
                                                            size="60px"
                                                        >
                                                            <template #upload>
                                                                <div
                                                                    class="upload-btn w-[60px] h-[60px]"
                                                                >
                                                                    <icon
                                                                        name="system-icon-Plus"
                                                                        :size="16"
                                                                    />
                                                                    <span class="text-xs leading-5">
                                                                        未选中
                                                                    </span>
                                                                </div>
                                                            </template>
                                                        </material-picker>
                                                        <material-picker
                                                            v-model="element.selected"
                                                            upload-class="bg-body"
                                                            size="60px"
                                                        >
                                                            <template #upload>
                                                                <div
                                                                    class="upload-btn w-[60px] h-[60px]"
                                                                >
                                                                    <icon
                                                                        name="system-icon-Plus"
                                                                        :size="16"
                                                                    />
                                                                    <span class="text-xs leading-5">
                                                                        选中
                                                                    </span>
                                                                </div>
                                                            </template>
                                                        </material-picker>
                                                    </a-form-item>
                                                    <a-form-item label="导航名称">
                                                        <a-input
                                                            v-model="element.name"
                                                            placeholder="请输入名称"
                                                            allow-clear
                                                        />
                                                    </a-form-item>
                                                    <a-form-item label="链接地址">
                                                        <link-picker
                                                            v-model="element.link"
                                                            :disabled="index == 0"
                                                        />
                                                    </a-form-item>
                                                </div>
                                            </del-wrap>
                                        </template>
                                    </draggable>
                                </div>

                                <div v-if="tabbar.list?.length < max">
                                    <a-button type="primary" @click="handleAdd">
                                        添加导航
                                    </a-button>
                                </div>
                            </a-tab-pane>
                            <a-tab-pane key="styles" title="样式设置">
                                <a-form-item label="默认颜色">
                                    <color-picker
                                        class="max-w-[400px]"
                                        v-model="tabbar.style.defaultColor"
                                        default-color="#999999"
                                    />
                                </a-form-item>
                                <a-form-item label="选中颜色">
                                    <color-picker
                                        class="max-w-[400px]"
                                        v-model="tabbar.style.selectedColor"
                                        default-color="#4173ff"
                                    />
                                </a-form-item>
                            </a-tab-pane>
                        </a-tabs>
                    </a-form>
                </div>
            </div>
        </a-card>
        <footer-btns class="mt-4" :fixed="false" v-perms="['decorate:tabbar:save']">
            <a-button type="primary" @click="setData">保存</a-button>
        </footer-btns>
    </div>
</template>
<script lang="ts" setup name="decorationTabbar">
import { getDecorateTabbar, setDecorateTabbar } from '@/api/decoration'
import feedback from '@/utils/feedback'
import Draggable from 'vuedraggable'

const max = 5
const min = 2
const activeTab = ref('content')
const tabbar = reactive({
    style: {
        defaultColor: '',
        selectedColor: ''
    },
    list: [
        {
            name: '',
            selected: '',
            unselected: '',
            link: {}
        },
        {
            name: '',
            selected: '',
            unselected: '',
            link: {}
        }
    ]
})

/**
 * 函数说明：新增一个底部导航项
 */
const handleAdd = () => {
    if (tabbar.list?.length < max) {
        tabbar.list.push({
            name: '',
            selected: '',
            unselected: '',
            link: {}
        })
    } else {
        feedback.msgError(`最多添加${max}个`)
    }
}

/**
 * 函数说明：删除指定索引的底部导航项
 */
const handleDelete = (index: number) => {
    if (tabbar.list?.length <= min) {
        return feedback.msgError(`最少保留${min}个`)
    }
    tabbar.list.splice(index, 1)
}

/**
 * 函数说明：限制第一个导航不可拖拽排序
 */
const onMove = (e: any) => {
    if (e.relatedContext.index == 0) {
        return false
    }
    return true
}

/**
 * 函数说明：获取底部导航配置并回填页面
 */
const getData = async () => {
    const data = await getDecorateTabbar()
    tabbar.list = data.list.map((item: any) => ({ ...item, link: JSON.parse(item.link) }))
    tabbar.style = data.style
}

/**
 * 函数说明：保存底部导航配置
 */
const setData = async () => {
    await setDecorateTabbar(toRaw(tabbar))
    getData()
    feedback.msgSuccess('保存成功')
}
getData()
</script>
<style lang="scss" scoped>
.decoration-tabbar {
    min-height: calc(100vh - var(--navbar-height) - 80px);
    @apply flex flex-col;
    .pages-preview {
        background-color: #f7f7f7;
        width: 360px;
        height: 615px;
        color: #333;
        position: relative;
        .tabbar {
            position: absolute;
            height: 50px;
            background-color: #fff;
            bottom: 0;
            width: 100%;
            border: 2px solid rgb(var(--primary-6));
        }
    }
}
</style>
