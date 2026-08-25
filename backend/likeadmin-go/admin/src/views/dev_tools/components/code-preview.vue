<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="code-preview">
        <a-modal v-model:visible="show" :width="900" title="代码预览" :footer="false">
            <a-tabs v-model:active-key="activeTab">
                <a-tab-pane
                    v-for="(item, key, index) in code"
                    :title="key"
                    :key="`index${index}-${String(key)}`"
                >
                    <div class="flex" style="height: 50vh">
                        <a-scrollbar class="flex-1">
                            <highlightjs autodetect :code="item" />
                        </a-scrollbar>
                        <div>
                            <a-button @click="handleCopy(item)" type="text">
                                <template #icon>
                                    <icon name="system-icon-CopyDocument" />
                                </template>
                                复制
                            </a-button>
                        </div>
                    </div>
                </a-tab-pane>
            </a-tabs>
        </a-modal>
    </div>
</template>

<script lang="ts" setup>
import feedback from '@/utils/feedback'
import useClipboard from 'vue-clipboard3'

const props = defineProps<{
    modelValue: boolean
    code: Record<string, string>
}>()

const emit = defineEmits<{
    (event: 'update:modelValue', value: boolean): void
}>()
const { toClipboard } = useClipboard()

const activeTab = ref('index0')

/**
 * 函数说明：复制指定代码内容到剪贴板
 */
const handleCopy = async (text: string) => {
    try {
        await toClipboard(text)
        feedback.msgSuccess('复制成功')
    } catch (e) {
        feedback.msgError('复制失败')
    }
}

/**
 * 函数说明：对话框显示状态的双向绑定代理
 */
const show = computed<boolean>({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})
</script>
