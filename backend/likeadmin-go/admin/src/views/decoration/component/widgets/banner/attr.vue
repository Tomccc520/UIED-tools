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
        <a-form layout="vertical">
            <a-form-item label="是否启用">
                <a-radio-group v-model="content.enabled">
                    <a-radio :value="1">开启</a-radio>
                    <a-radio :value="0">停用</a-radio>
                </a-radio-group>
            </a-form-item>
            <a-form-item label="图片设置">
                <div class="flex-1">
                    <div class="form-tips">最多添加5张，建议图片尺寸：750px*340px</div>
                    <del-wrap
                        v-for="(item, index) in content.data"
                        :key="index"
                        @close="handleDelete(index)"
                        class="max-w-[400px]"
                    >
                        <div class="bg-fill-light flex items-center w-full p-4 mt-4">
                            <material-picker
                                v-model="item.image"
                                upload-class="bg-body"
                                exclude-domain
                            />
                            <div class="ml-3 flex-1">
                                <a-form-item label="图片名称">
                                    <a-input
                                        v-model="item.name"
                                        placeholder="请输入名称"
                                        allow-clear
                                    />
                                </a-form-item>
                                <a-form-item class="mt-[18px]" label="图片链接">
                                    <link-picker v-model="item.link" />
                                </a-form-item>
                            </div>
                        </div>
                    </del-wrap>
                </div>
            </a-form-item>
            <a-form-item v-if="content.data?.length < limit">
                <a-button type="primary" @click="handleAdd">添加图片</a-button>
            </a-form-item>
        </a-form>
    </div>
</template>
<script lang="ts" setup>
import feedback from '@/utils/feedback'
import type { PropType } from 'vue'
import type options from './options'
const limit = 5
type OptionsType = ReturnType<typeof options>
const props = defineProps({
    content: {
        type: Object as PropType<OptionsType['content']>,
        default: () => ({})
    },
    styles: {
        type: Object as PropType<OptionsType['styles']>,
        default: () => ({})
    }
})

/**
 * 函数说明：新增轮播图片项
 */
const handleAdd = () => {
    if (props.content.data?.length < limit) {
        props.content.data.push({
            image: '',
            name: '',
            link: {}
        })
    } else {
        feedback.msgError(`最多添加${limit}张图片`)
    }
}

/**
 * 函数说明：删除指定轮播图片项
 */
const handleDelete = (index: number) => {
    if (props.content.data?.length <= 1) {
        return feedback.msgError('最少保留一张图片')
    }
    props.content.data.splice(index, 1)
}
</script>

<style lang="scss" scoped></style>
