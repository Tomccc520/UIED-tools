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
        title="AI 工具能力代理"
        description="维护二维码、OCR、图像增强与配音等上游能力地址，前端统一走后端代理。"
        selection-label="当前工具能力"
        :model-value="modelValue"
        :options="options"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <template #actions
            ><a-switch
                v-if="currentAbility"
                :model-value="currentAbility.enabled"
                checked-text="启用"
                unchecked-text="停用"
                aria-label="启用当前工具能力"
                @update:model-value="updateField('enabled', $event)"
        /></template>
        <template #meta
            ><template v-if="currentAbility"
                ><a-tag bordered>{{ currentAbility.ability }}</a-tag
                ><a-tag v-if="ready" color="green" bordered>可调用</a-tag></template
            ></template
        >
        <template v-if="currentAbility">
            <p class="ai-config-description">
                {{ currentAbility.description || '未填写能力说明。' }}
            </p>
            <a-form layout="vertical" :model="currentAbility">
                <a-row :gutter="16">
                    <a-col :xs="24" :lg="12"
                        ><a-form-item label="能力名称"
                            ><a-input
                                :model-value="currentAbility.label"
                                placeholder="请输入能力名称"
                                @update:model-value="updateField('label', $event)" /></a-form-item
                    ></a-col>
                    <a-col :xs="24" :lg="12"
                        ><a-form-item label="请求方法"
                            ><a-select
                                :model-value="currentAbility.method"
                                placeholder="请选择请求方法"
                                @update:model-value="updateField('method', $event)"
                                ><a-option value="GET">GET</a-option
                                ><a-option value="POST">POST</a-option></a-select
                            ></a-form-item
                        ></a-col
                    >
                    <a-col :xs="24"
                        ><a-form-item label="上游地址"
                            ><a-input
                                :model-value="currentAbility.upstreamUrl"
                                placeholder="请输入上游接口完整地址"
                                @update:model-value="
                                    updateField('upstreamUrl', $event)
                                " /></a-form-item
                    ></a-col>
                    <a-col :xs="24" :lg="12"
                        ><a-form-item label="API Key 请求头"
                            ><a-input
                                :model-value="currentAbility.apiKeyHeader"
                                placeholder="例如 Authorization / X-API-Key"
                                @update:model-value="
                                    updateField('apiKeyHeader', $event)
                                " /></a-form-item
                    ></a-col>
                    <a-col :xs="24" :lg="12"
                        ><a-form-item label="超时时间（秒）"
                            ><a-input-number
                                :model-value="currentAbility.timeoutSeconds"
                                :min="10"
                                :max="300"
                                class="w-full"
                                @update:model-value="
                                    updateField('timeoutSeconds', $event)
                                " /></a-form-item
                    ></a-col>
                    <a-col :xs="24"
                        ><a-form-item label="API Key"
                            ><a-input-password
                                :model-value="currentAbility.apiKey"
                                autocomplete="off"
                                placeholder="如上游需要鉴权，可在这里填写 API Key"
                                allow-clear
                                @update:model-value="updateField('apiKey', $event)" /></a-form-item
                    ></a-col>
                    <a-col :xs="24"
                        ><a-form-item label="能力说明"
                            ><a-textarea
                                :model-value="currentAbility.description"
                                :auto-size="{ minRows: 2, maxRows: 3 }"
                                placeholder="补充这个 AI 能力的适用工具页或限制说明"
                                @update:model-value="
                                    updateField('description', $event)
                                " /></a-form-item
                    ></a-col>
                </a-row>
            </a-form>
        </template>
    </ai-config-panel>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { AiImageAbilityConfig } from '@/api/setting/ai_model'
import AiConfigPanel from './ai-config-panel.vue'
const props = defineProps<{
    modelValue: string
    abilities: AiImageAbilityConfig[]
    currentAbility: AiImageAbilityConfig | null
    ready: boolean
}>()
const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void
    (event: 'patch', ability: string, patch: Partial<AiImageAbilityConfig>): void
}>()
/** 生成当前工具能力的可选项，不创建额外能力或请求。 */
const options = computed(() =>
    props.abilities.map((item) => ({ value: item.ability, label: item.label || item.ability }))
)
/** 将带能力标识的字段修改交给父页，避免子面板独立保存或覆盖其他能力。 */
const updateField = (field: keyof AiImageAbilityConfig, value: unknown) => {
    if (props.currentAbility)
        emit('patch', props.currentAbility.ability, {
            [field]: value,
        } as Partial<AiImageAbilityConfig>)
}
</script>
