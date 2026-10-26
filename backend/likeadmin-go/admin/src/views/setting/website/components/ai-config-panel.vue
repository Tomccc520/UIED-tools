<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <settings-section class="ai-config-panel" :title="title" :description="description">
        <template #actions><slot name="actions" /></template>
        <a-empty v-if="!options.length" description="当前模块没有可配置项，请点击上方“重新加载”重试。" />
        <div v-else class="ai-config-panel__selection">
            <div class="ai-config-panel__field">
                <div class="ai-config-panel__label">{{ selectionLabel }}</div>
                <a-select
                    :model-value="modelValue"
                    :options="options"
                    :aria-label="selectionLabel"
                    allow-search
                    @update:model-value="selectOption"
                />
            </div>
            <div class="ai-config-panel__meta"><slot name="meta" /></div>
        </div>
        <slot />
    </settings-section>
</template>
<script setup lang="ts">
import SettingsSection from '@/components/settings-section/index.vue'
const props = defineProps<{
    title: string
    description: string
    selectionLabel: string
    modelValue: string
    options: { label: string; value: string }[]
}>()
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
/** 只选择当前接口提供的条目；筛选和切换不会创建服务商或发起请求。 */
const selectOption = (value: unknown) => {
    if (typeof value === 'string' && props.options.some((item) => item.value === value))
        emit('update:modelValue', value)
}
</script>
<style scoped lang="scss">
.ai-config-panel__selection {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
}
.ai-config-panel__field {
    flex: 1;
    min-width: 0;
    max-width: 520px;
}
.ai-config-panel__label {
    font-size: 13px;
    color: var(--color-text-2);
    margin-bottom: 8px;
}
.ai-config-panel__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    max-width: 520px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3);
}
.ai-config-panel :deep(.ai-config-form) {
    margin-top: 20px;
}
.ai-config-panel :deep(.ai-config-description) {
    margin: 0 0 16px;
    color: var(--color-text-3);
    font-size: 13px;
    line-height: 1.7;
}
@media (max-width: 768px) {
    .ai-config-panel__selection {
        flex-direction: column;
        align-items: stretch;
    }
    .ai-config-panel__field {
        max-width: none;
    }
    .ai-config-panel :deep(button) {
        min-height: 44px;
    }
}
</style>
