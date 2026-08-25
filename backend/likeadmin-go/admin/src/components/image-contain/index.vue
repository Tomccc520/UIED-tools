<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <a-image
        :style="styles"
        :src="props.src"
        :fit="props.fit"
        :alt="props.alt"
        :preview="props.preview"
    />
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { CSSProperties, PropType } from 'vue'
import { addUnit } from '@/utils/util'

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
        default: true
    },
    hideOnClickModal: {
        type: Boolean,
        default: true
    }
})

/**
 * 函数说明：计算图片尺寸和圆角样式
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
    .arco-image-error {
        @apply text-xs;
    }
}
</style>
