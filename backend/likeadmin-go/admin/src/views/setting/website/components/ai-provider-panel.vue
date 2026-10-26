<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <ai-config-panel
        title="服务商连接"
        description="选择服务商，设置连接地址、默认模型与启用状态。"
        selection-label="当前文本服务商"
        :model-value="modelValue"
        :options="options"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <template #actions>
            <template v-if="currentProvider"
                ><a-switch
                    :model-value="currentProvider.enabled"
                    checked-text="启用"
                    unchecked-text="停用"
                    aria-label="启用当前文本服务商"
                    @update:model-value="updateField('enabled', $event)"
                /><a-button :disabled="!currentProvider.enabled" @click="$emit('set-default')"
                    >设为默认</a-button
                ></template
            >
        </template>
        <template #meta
            ><template v-if="currentProvider"
                ><a-tag bordered>{{ currentProvider.provider }}</a-tag
                ><a-tag v-if="currentProvider.isDefault" color="green" bordered>默认</a-tag
                ><a-tag v-if="ready" color="green" bordered>可调用</a-tag></template
            ></template
        >
        <template v-if="currentProvider">
            <p class="ai-config-description">
                {{ currentProvider.description || '未填写 Provider 描述。' }}
            </p>
            <a-form layout="vertical" :model="currentProvider">
                <a-row :gutter="16">
                    <a-col :xs="24" :lg="12"
                        ><a-form-item label="Provider 名称"
                            ><a-input
                                :model-value="currentProvider.label"
                                placeholder="请输入展示名称"
                                @update:model-value="updateField('label', $event)" /></a-form-item
                    ></a-col>
                    <a-col :xs="24" :lg="12"
                        ><a-form-item label="默认模型"
                            ><a-select
                                :model-value="currentProvider.defaultModel"
                                allow-search
                                allow-create
                                placeholder="获取模型后选择，或输入自定义模型 ID"
                                @update:model-value="updateField('defaultModel', $event)"
                                ><a-option
                                    v-for="model in currentProvider.models || []"
                                    :key="model.value"
                                    :value="model.value"
                                    >{{ model.label || model.value }}</a-option
                                ></a-select
                            ></a-form-item
                        ></a-col
                    >
                    <a-col :xs="24"
                        ><a-form-item label="Base URL"
                            ><a-input
                                :model-value="currentProvider.baseUrl"
                                placeholder="请输入兼容 Chat Completions 的基础地址"
                                @update:model-value="updateField('baseUrl', $event)" /></a-form-item
                    ></a-col>
                    <a-col :xs="24"
                        ><a-form-item label="API Key">
                            <div class="provider-key-row">
                                <a-input-password
                                    :model-value="currentProvider.apiKey"
                                    autocomplete="off"
                                    placeholder="请输入 API Key，模型获取与前端调用均由后端代理"
                                    allow-clear
                                    @update:model-value="updateField('apiKey', $event)"
                                /><a-button
                                    type="primary"
                                    :loading="fetchingProviderKey === currentProvider.provider"
                                    :disabled="
                                        !currentProvider.baseUrl?.trim() ||
                                        !currentProvider.apiKey?.trim() ||
                                        Boolean(fetchingProviderKey)
                                    "
                                    @click="$emit('fetch-models')"
                                    >获取模型</a-button
                                >
                            </div>
                            <div class="field-help">
                                Key 只提交给本站 Go 服务端，由服务端请求 Provider 的 /models
                                接口，不会直接暴露给官网前端。
                            </div>
                        </a-form-item></a-col
                    >
                    <a-col :xs="24"
                        ><a-form-item label="Provider 说明"
                            ><a-textarea
                                :model-value="currentProvider.description"
                                :auto-size="{ minRows: 2, maxRows: 3 }"
                                placeholder="补充这个 Provider 的适用场景或模型说明"
                                @update:model-value="
                                    updateField('description', $event)
                                " /></a-form-item
                    ></a-col>
                </a-row>
            </a-form>
            <section class="model-list" aria-label="当前模型库">
                <div class="model-list__heading">
                    <h3>当前模型库</h3>
                    <span v-if="currentProvider.models?.length"
                        >已获取 {{ currentProvider.models.length }} 个</span
                    >
                </div>
                <div v-if="currentProvider.models?.length" class="model-list__items">
                    <a-button
                        v-for="model in displayedModels"
                        :key="`${currentProvider.provider}-${model.value}`"
                        size="small"
                        type="outline"
                        :aria-pressed="currentProvider.defaultModel === model.value"
                        @click="updateField('defaultModel', model.value)"
                        >{{ model.label || model.value }}</a-button
                    >
                    <p
                        v-if="currentProvider.models.length > displayedModels.length"
                        class="field-help"
                    >
                        另有
                        {{
                            currentProvider.models.length - displayedModels.length
                        }}
                        个，请在默认模型中搜索。
                    </p>
                </div>
                <a-empty v-else description="填写 Base URL 和 API Key 后点击“获取模型”。" />
            </section>
        </template>
    </ai-config-panel>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { AiProviderConfig } from '@/api/setting/ai_model'
import AiConfigPanel from './ai-config-panel.vue'
const props = defineProps<{
    modelValue: string
    providers: AiProviderConfig[]
    currentProvider: AiProviderConfig | null
    ready: boolean
    fetchingProviderKey: string
}>()
const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void
    (event: 'patch', provider: string, patch: Partial<AiProviderConfig>): void
    (event: 'set-default'): void
    (event: 'fetch-models'): void
}>()
/** 从父级草稿建立服务商选项，切换仅改变父级选择值。 */
const options = computed(() =>
    props.providers.map((item) => ({ value: item.provider, label: item.label || item.provider }))
)
/** 首屏限制模型快捷按钮，其余模型仍可在完整下拉列表中搜索。 */
const displayedModels = computed(() => (props.currentProvider?.models || []).slice(0, 12))
/** 发出当前服务商的字段补丁；获取模型、设默认与持久化均由父页执行。 */
const updateField = (field: keyof AiProviderConfig, value: unknown) => {
    if (props.currentProvider)
        emit('patch', props.currentProvider.provider, {
            [field]: value,
        } as Partial<AiProviderConfig>)
}
</script>
<style scoped lang="scss">
.provider-key-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    width: 100%;
}
.field-help {
    margin: 7px 0 0;
    color: var(--color-text-3);
    font-size: 12px;
    line-height: 1.7;
}
.model-list {
    padding-top: 16px;
    border-top: 1px solid var(--color-border-2);
}
.model-list__heading {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
}
.model-list h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
}
.model-list__heading span {
    color: var(--color-text-3);
    font-size: 12px;
}
.model-list__items {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.model-list__items button {
    max-width: 100%;
    height: auto;
    white-space: normal;
    overflow-wrap: anywhere;
    padding: 5px 12px;
}
.model-list__items button[aria-pressed='true'] {
    color: var(--uied-admin-accent);
    background: var(--uied-admin-accent-soft);
    border-color: var(--uied-admin-accent-border);
}
@media (max-width: 768px) {
    .provider-key-row {
        grid-template-columns: 1fr;
    }
}
</style>
