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
            <a-form-item label="排版样式">
                <a-radio-group v-model="content.style">
                    <a-radio :value="1">横排</a-radio>
                    <a-radio :value="2">竖排</a-radio>
                </a-radio-group>
            </a-form-item>
            <a-form-item label="标题名称">
                <a-input class="w-[400px]" v-model="content.title" allow-clear />
            </a-form-item>
            <a-form-item label="菜单设置">
                <div class="flex-1">
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
