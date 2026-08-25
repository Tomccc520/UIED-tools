<template>
    <div class="dialog">
        <div class="dialog__trigger" @click="open">
            <!-- 触发弹窗 -->
            <slot name="trigger"></slot>
        </div>
        <a-modal
            v-model:visible="visible"
            :modal-class="customClass || undefined"
            :title="title || undefined"
            :title-align="center ? 'center' : 'start'"
            :width="width"
            :mask-closable="clickModalClose"
            :render-to-body="true"
            :footer="hasFooter ? undefined : false"
            @cancel="handleEvent('cancel')"
        >
            <!-- 自定义内容 -->
            <slot>{{ content }}</slot>
            <!-- 底部弹窗页脚 -->
            <template #footer>
                <div class="dialog-footer">
                    <a-button v-if="cancelButtonText" @click="handleEvent('cancel')">
                        {{ cancelButtonText }}
                    </a-button>
                    <a-button
                        v-if="confirmButtonText"
                        type="primary"
                        @click="handleEvent('confirm')"
                    >
                        {{ confirmButtonText }}
                    </a-button>
                </div>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
interface PopupProps {
    title?: string
    content?: string
    confirmButtonText?: string | boolean
    cancelButtonText?: string | boolean
    width?: string | number
    disabled?: boolean
    async?: boolean
    clickModalClose?: boolean
    center?: boolean
    customClass?: string
}

const props = withDefaults(defineProps<PopupProps>(), {
    title: '',
    content: '',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    width: '400px',
    disabled: false,
    async: false,
    clickModalClose: false,
    center: false,
    customClass: ''
})

const emit = defineEmits(['confirm', 'cancel', 'close', 'open'])
const slots = useSlots()

const visible = ref(false)
/**
 * 函数说明：根据按钮文案或插槽自动判断是否展示弹窗底部，避免操作按钮丢失。
 */
const hasFooter = computed(() => {
    if (slots.footer) {
        return true
    }
    return Boolean(props.cancelButtonText || props.confirmButtonText)
})

/**
 * 统一处理弹窗确认/取消逻辑，兼容 async 模式下“确认后不自动关闭”的既有行为
 */
const handleEvent = (type: 'confirm' | 'cancel') => {
    emit(type)
    if (!props.async || type === 'cancel') {
        close()
    }
}

/**
 * 关闭弹窗并通知外层，供父组件同步更新展示状态
 */
const close = () => {
    visible.value = false
    nextTick(() => {
        emit('close')
    })
}

/**
 * 打开弹窗，保留 disabled 拦截和 open 事件语义
 */
const open = () => {
    if (props.disabled) {
        return
    }
    emit('open')
    visible.value = true
}

provide('visible', visible)

defineExpose({
    visible,
    close,
    open
})
</script>

<style scoped lang="scss">
.dialog-body {
    white-space: pre-line;
}
</style>
