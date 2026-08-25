<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="link-picker flex-1" @click="!disabled && popupRef?.open()">
        <a-input :model-value="getLink" placeholder="请选择链接" readonly :disabled="disabled">
            <template #suffix>
                <icon v-if="!modelValue?.path" name="system-icon-ArrowRight" />
                <icon
                    v-else
                    name="system-icon-Close"
                    @click.stop="!disabled && emit('update:modelValue', {})"
                />
            </template>
        </a-input>
        <popup ref="popupRef" width="700px" title="链接选择" @confirm="handleConfirm">
            <link-content v-model="activeLink" />
        </popup>
    </div>
</template>

<script lang="ts" setup>
import { LinkTypeEnum, type Link } from '.'
import LinkContent from './index.vue'
import Popup from '@/components/popup/index.vue'
const props = defineProps({
    modelValue: {
        type: Object
    },
    disabled: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits<{
    (event: 'update:modelValue', value: any): void
}>()

const popupRef = shallowRef<InstanceType<typeof Popup>>()
const activeLink = ref<Link>({ path: '', type: LinkTypeEnum.SHOP_PAGES })

/**
 * 函数说明：确认链接选择并同步到父组件
 */
const handleConfirm = () => {
    emit('update:modelValue', activeLink.value)
}

/**
 * 函数说明：根据链接类型展示输入框文本
 */
const getLink = computed(() => {
    switch (props.modelValue?.type) {
        case LinkTypeEnum.SHOP_PAGES:
            return props.modelValue.name
        case LinkTypeEnum.CUSTOM_LINK:
            return props.modelValue.query?.url
        default:
            return props.modelValue?.name
    }
})
watch(
    () => props.modelValue,
    (value) => {
        if (value?.type) {
            activeLink.value = value as Link
        }
    },
    {
        immediate: true
    }
)
</script>

<style scoped lang="scss">
.link-picker {
    :deep(.arco-input) {
        &.arco-input-disabled {
            .arco-input-wrapper {
                cursor: not-allowed;
            }
            .arco-input-suffix {
                cursor: not-allowed;
            }
        }
        .arco-input-wrapper {
            cursor: pointer;
        }
        .arco-input-suffix {
            cursor: pointer;
        }
    }
}
</style>
