<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <a-image :style="styles" :src="getImageUrl(src)" :fit="fit" :alt="alt" :preview="preview">
        <template #loader>
            <div class="image-slot"></div>
        </template>
        <template #error>
            <div class="image-slot">
                <icon name="system-icon-Picture" :size="30" />
            </div>
        </template>
    </a-image>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { CSSProperties, PropType } from 'vue'
import { addUnit } from '@/utils/util'
import useAppStore from '@/stores/modules/app'

const props = defineProps({
    width: {
        type: [String, Number],
        default: 'auto'
    },
    height: {
        type: [String, Number],
        default: 'auto'
    },
    radius: {
        type: [String, Number],
        default: 0
    },
    src: {
        type: String,
        default: ''
    },
    fit: {
        type: String as PropType<'fill' | 'contain' | 'cover' | 'none' | 'scale-down'>,
        default: 'cover'
    },
    alt: {
        type: String,
        default: ''
    },
    preview: {
        type: Boolean,
        default: false
    }
})

const { getImageUrl } = useAppStore()

/**
 * 函数说明：计算图片显示样式（宽高与圆角）
 */
const styles = computed<CSSProperties>(() => {
    return {
        width: addUnit(props.width),
        height: addUnit(props.height),
        borderRadius: addUnit(props.radius)
    }
})
</script>

<style lang="scss" scoped>
:deep(.arco-image) {
    display: block;
    .image-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background: #fafafa;
        color: #909399;
    }
}
</style>
