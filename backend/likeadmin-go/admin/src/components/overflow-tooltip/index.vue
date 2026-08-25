<template>
    <div ref="tooltipRootRef">
        <a-tooltip
            :content="content"
            :position="placement"
            :mini="mini"
            :popup-container="popupContainer"
            :popup-visible="disabled ? false : undefined"
        >
            <div
                ref="textRef"
                class="overflow-text truncate"
                :style="{ textOverflow: overfloType }"
            >
                {{ content }}
            </div>
        </a-tooltip>
    </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'

const props = defineProps({
    content: {
        type: String,
        default: ''
    },
    teleported: {
        type: Boolean,
        default: false
    },
    mini: {
        type: Boolean,
        default: false
    },
    placement: {
        type: String as PropType<string>,
        default: 'top'
    },
    overfloType: {
        type: String as PropType<'ellipsis' | 'unset' | 'clip'>,
        default: 'ellipsis'
    }
})
const tooltipRootRef = shallowRef<HTMLElement>()
const textRef = shallowRef<HTMLElement>()
const disabled = ref(false)
const popupContainer = computed(() => {
    if (props.teleported) {
        return undefined
    }
    return tooltipRootRef.value ?? undefined
})

/**
 * 判断文本是否溢出，仅在溢出时展示 Tooltip。
 */
const updateDisabled = () => {
    if (textRef.value?.scrollWidth! > textRef.value?.offsetWidth!) {
        disabled.value = false
        return
    }
    disabled.value = true
}

/**
 * 函数说明：绑定鼠标移入事件，按需计算溢出提示
 */
const bindHoverEvent = () => {
    textRef.value?.addEventListener('mouseenter', updateDisabled)
}

/**
 * 函数说明：解绑鼠标移入事件
 */
const unbindHoverEvent = () => {
    textRef.value?.removeEventListener('mouseenter', updateDisabled)
}

onMounted(() => {
    bindHoverEvent()
})

onBeforeUnmount(() => {
    unbindHoverEvent()
})

watch(
    () => props.content,
    () => {
        nextTick(() => {
            updateDisabled()
        })
    },
    {
        immediate: true
    }
)
</script>

<style></style>
