<template>
    <div ref="popoverRootRef" @mouseenter="inPopover = true" @mouseleave="inPopover = false">
        <a-popover
            position="top"
            v-model:popup-visible="visible"
            trigger="contextmenu"
            class="popover-input"
            :content-style="popoverContentStyle"
            :popup-container="popoverContainer"
        >
            <template #content>
                <div class="flex p-3" @click.stop="">
                    <div class="popover-input__input mr-[10px] flex-1">
                        <a-select
                            class="flex-1"
                            :size="arcoSize"
                            v-if="type == 'select'"
                            v-model="inputValue"
                            allow-search
                            allow-clear
                        >
                            <a-option v-for="item in options" :key="item.value" :value="item.value">
                                {{ item.label }}
                            </a-option>
                        </a-select>
                        <a-textarea
                            v-if="type === 'textarea'"
                            v-model.trim="inputValue"
                            :max-length="limit"
                            :show-word-limit="showLimit"
                            :auto-size="{ minRows: 2, maxRows: 6 }"
                            :placeholder="placeholder"
                            allow-clear
                        />
                        <a-input
                            v-else-if="type !== 'select'"
                            v-model.trim="inputValue"
                            :max-length="limit"
                            :size="arcoSize"
                            :placeholder="placeholder"
                            allow-clear
                        />
                    </div>
                    <div class="popover-input__btns flex-none">
                        <a-button type="text" @click="close">取消</a-button>
                        <a-button type="primary" :size="arcoSize" @click="handleConfirm"
                            >确定</a-button
                        >
                    </div>
                </div>
            </template>
            <template #default>
                <div class="inline" @click.stop="handleOpen">
                    <slot></slot>
                </div>
            </template>
        </a-popover>
    </div>
</template>

<script lang="ts" setup>
import { useEventListener } from '@vueuse/core'
import type { PropType } from 'vue'

const props = defineProps({
    value: {
        type: String
    },
    type: {
        type: String,
        default: 'text'
    },
    width: {
        type: [Number, String],
        default: '300px'
    },
    placeholder: String,
    disabled: {
        type: Boolean,
        default: false
    },
    options: {
        type: Array as PropType<any[]>,
        default: () => []
    },
    size: {
        type: String as PropType<'default' | 'small' | 'large'>,
        default: 'default'
    },
    limit: {
        type: Number,
        default: 200
    },
    showLimit: {
        type: Boolean,
        default: false
    },
    teleported: {
        type: Boolean,
        default: true
    }
})
const emit = defineEmits(['confirm'])
const visible = ref(false)
const inPopover = ref(false)
const inputValue = ref()
const popoverRootRef = ref<HTMLElement | null>(null)

/**
 * 将历史 size 语义映射为 Arco 语义，保持外部调用不变。
 */
const arcoSize = computed<'medium' | 'small' | 'large'>(() => {
    if (props.size === 'default') {
        return 'medium'
    }
    return props.size
})

/**
 * 统一弹层宽度和内边距，保证切换 UI 库后视觉尺寸不变
 */
const popoverContentStyle = computed(() => ({
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    padding: '0'
}))

/**
 * 兼容 teleported 参数：false 时挂载到当前容器
 */
const popoverContainer = computed(() => {
    if (props.teleported) {
        return undefined
    }
    return popoverRootRef.value ?? undefined
})

const handleConfirm = () => {
    close()
    emit('confirm', inputValue.value)
}
const handleOpen = () => {
    if (props.disabled) {
        return
    }
    visible.value = true
}
const close = () => {
    visible.value = false
}

watch(
    () => props.value,
    (value) => {
        inputValue.value = value
    },
    {
        immediate: true
    }
)

useEventListener(document.documentElement, 'click', () => {
    if (inPopover.value) return
    close()
})
</script>

<style scoped lang="scss"></style>
