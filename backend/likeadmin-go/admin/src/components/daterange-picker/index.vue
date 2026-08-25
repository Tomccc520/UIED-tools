<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <a-range-picker
        v-model="content"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :placeholder="['开始时间', '结束时间']"
        allow-clear
    />
</template>

<script lang="ts" setup>
import { withDefaults, computed } from 'vue'

/* Props S */
const props = withDefaults(
    defineProps<{
        startTime?: string
        endTime?: string
    }>(),
    {
        startTime: '',
        endTime: ''
    }
)
const emit = defineEmits(['update:startTime', 'update:endTime'])

const content = computed<any>({
    /**
     * 函数说明：组合开始/结束时间用于范围选择器展示
     */
    get: () => {
        return [props.startTime, props.endTime]
    },
    /**
     * 函数说明：拆分范围值并同步回父组件
     */
    set: (value: Event | any) => {
        if (value === null) {
            emit('update:startTime', '')
            emit('update:endTime', '')
        } else {
            emit('update:startTime', value[0])
            emit('update:endTime', value[1])
        }
    }
})
</script>
