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
            <a-form-item label="客服标题">
                <a-input class="w-[400px]" v-model="content.title" allow-clear />
            </a-form-item>
            <a-form-item label="服务时间">
                <a-input class="w-[400px]" v-model="content.time" allow-clear />
            </a-form-item>
            <a-form-item label="联系电话">
                <a-input class="w-[400px]" v-model="content.mobile" allow-clear />
            </a-form-item>
            <a-form-item label="客服二维码">
                <div>
                    <material-picker v-model="content.qrcode" exclude-domain />
                    <div class="form-tips">建议图片尺寸：200*200像素；图片格式：jpg、png、jpeg</div>
                </div>
            </a-form-item>
        </a-form>
    </div>
</template>
<script lang="ts" setup>
import type { PropType } from 'vue'
import type options from './options'
type OptionsType = ReturnType<typeof options>
defineProps({
    content: {
        type: Object as PropType<OptionsType['content']>,
        default: () => ({})
    },
    styles: {
        type: Object as PropType<OptionsType['styles']>,
        default: () => ({})
    }
})
</script>

<style lang="scss" scoped></style>
