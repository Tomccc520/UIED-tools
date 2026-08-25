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
            <a-form-item label="菜单设置">
                <div class="flex-1">
                    <div class="form-tips mb-4">最多可添加10个，建议图片尺寸：100px*100px</div>
                    <AddNav v-model="content.data" />
                </div>
            </a-form-item>
        </a-form>
    </div>
</template>
<script lang="ts" setup>
import type { PropType } from 'vue'
import type options from './options'
import AddNav from '../../add-nav.vue'
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
