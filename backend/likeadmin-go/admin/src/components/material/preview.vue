<template>
    <a-image-preview
        v-if="type == 'image'"
        v-model:visible="visible"
        :src="url"
        :mask-closable="true"
        @close="handleClose"
    />
    <a-modal
        v-if="type == 'video'"
        v-model:visible="visible"
        width="740px"
        title="视频预览"
        :footer="false"
        unmount-on-close
        @cancel="handleClose"
    >
        <video-player ref="playerRef" :src="url" width="100%" height="450px" />
    </a-modal>
</template>

<script lang="ts" setup>
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    url: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'image'
    }
})
const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
}>()

const playerRef = shallowRef()

const visible = computed({
    get() {
        return props.modelValue
    },

    set(value) {
        emit('update:modelValue', value)
    }
})

/**
 * 统一关闭预览弹层并回传父组件状态。
 */
const handleClose = () => {
    emit('update:modelValue', false)
}

watch(
    () => props.modelValue,
    (value) => {
        if (value) {
            nextTick(() => {
                playerRef.value?.play()
            })
        } else {
            nextTick(() => {
                playerRef.value?.pause()
            })
        }
    }
)
</script>
