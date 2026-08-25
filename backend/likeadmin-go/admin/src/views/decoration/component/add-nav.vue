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
        <div>
            <del-wrap
                class="max-w-[400px]"
                v-for="(item, index) in modelValue"
                :key="index"
                @close="handleDelete(index)"
            >
                <div class="nav-item-card flex items-center w-full p-4 mb-4">
                    <material-picker
                        v-model="item.image"
                        upload-class="bg-body"
                        size="60px"
                        exclude-domain
                    >
                        <template #upload>
                            <div class="upload-btn w-[60px] h-[60px]">
                                <icon name="system-icon-Plus" :size="20" />
                            </div>
                        </template>
                    </material-picker>
                    <div class="ml-3 flex-1">
                        <div class="flex">
                            <span class="nav-item-label flex-none mr-3">名称</span>
                            <a-input v-model="item.name" placeholder="请输入名称" allow-clear />
                        </div>
                        <div class="flex mt-[18px]">
                            <span class="nav-item-label flex-none mr-3">链接</span>
                            <link-picker v-model="item.link" />
                        </div>
                    </div>
                </div>
            </del-wrap>
        </div>
        <div>
            <a-button type="primary" @click="handleAdd">添加</a-button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import feedback from '@/utils/feedback'
import type { PropType } from 'vue'

const props = defineProps({
    modelValue: {
        type: Array as PropType<any[]>,
        default: () => []
    },
    max: {
        type: Number,
        default: 10
    },
    min: {
        type: Number,
        default: 1
    }
})

/**
 * 函数说明：新增一个导航项
 */
const handleAdd = () => {
    if (props.modelValue?.length < props.max) {
        props.modelValue.push({
            image: '',
            name: '导航名称',
            link: {}
        })
    } else {
        feedback.msgError(`最多添加${props.max}个`)
    }
}

/**
 * 函数说明：删除指定索引导航项
 */
const handleDelete = (index: number) => {
    if (props.modelValue?.length <= props.min) {
        return feedback.msgError(`最少保留${props.min}个`)
    }
    props.modelValue.splice(index, 1)
}
</script>

<style lang="scss" scoped>
.nav-item-card {
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
}

.nav-item-label {
    color: var(--color-text-3, #86909c);
    line-height: 32px;
}
</style>
