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
        title="服务商与密钥"
        description="保存后，抠图工具使用这里的默认服务商。"
        selection-label="当前抠图服务商"
        :model-value="modelValue"
        :options="options"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <template #actions
            ><a-tag :color="ready ? 'green' : 'orange'" bordered>{{
                ready ? '可调用' : '待配置'
            }}</a-tag></template
        >
        <template #meta
            ><template v-if="currentProvider"
                ><a-tag bordered>{{ currentProvider.provider }}</a-tag
                ><span>{{ currentProvider.description }}</span></template
            ></template
        >
        <a-alert type="info" :closable="false" show-icon
            >密钥仅保存于管理后台并由服务端内部读取，不会返回给官网浏览器。</a-alert
        >
        <a-form
            v-if="currentProvider"
            class="ai-config-form"
            layout="vertical"
            :model="currentProvider"
        >
            <a-row :gutter="16">
                <template v-if="currentProvider.provider === 'koukoutu'">
                    <a-col :xs="24"
                        ><a-form-item label="API 地址"
                            ><a-input
                                :model-value="currentProvider.apiUrl"
                                placeholder="https://sync.koukoutu.com/v1/create"
                                @update:model-value="updateField('apiUrl', $event)" /></a-form-item
                    ></a-col>
                    <a-col :xs="24"
                        ><a-form-item label="API Key"
                            ><a-input-password
                                :model-value="currentProvider.apiKey"
                                autocomplete="off"
                                placeholder="请输入抠抠图 X-API-Key"
                                allow-clear
                                @update:model-value="updateField('apiKey', $event)" /></a-form-item
                    ></a-col>
                </template>
                <template v-else>
                    <a-col :xs="24" :lg="12"
                        ><a-form-item label="AccessKey ID"
                            ><a-input-password
                                :model-value="currentProvider.accessKeyId"
                                autocomplete="off"
                                placeholder="请输入阿里云 AccessKey ID"
                                allow-clear
                                @update:model-value="
                                    updateField('accessKeyId', $event)
                                " /></a-form-item
                    ></a-col>
                    <a-col :xs="24" :lg="12"
                        ><a-form-item label="AccessKey Secret"
                            ><a-input-password
                                :model-value="currentProvider.accessKeySecret"
                                autocomplete="off"
                                placeholder="请输入阿里云 AccessKey Secret"
                                allow-clear
                                @update:model-value="
                                    updateField('accessKeySecret', $event)
                                " /></a-form-item
                    ></a-col>
                    <a-col :xs="24"
                        ><a-form-item label="Endpoint"
                            ><a-input
                                :model-value="currentProvider.endpoint"
                                placeholder="imageseg.cn-shanghai.aliyuncs.com"
                                @update:model-value="
                                    updateField('endpoint', $event)
                                " /></a-form-item
                    ></a-col>
                </template>
                <a-col :xs="24" :lg="12"
                    ><a-form-item label="请求超时（秒）"
                        ><a-input-number
                            :model-value="currentProvider.timeoutSeconds"
                            :min="10"
                            :max="300"
                            class="w-full"
                            @update:model-value="
                                updateField('timeoutSeconds', $event)
                            " /></a-form-item
                ></a-col>
            </a-row>
        </a-form>
    </ai-config-panel>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { AiMattingProviderConfig } from '@/api/setting/ai_model'
import AiConfigPanel from './ai-config-panel.vue'
const props = defineProps<{
    modelValue: string
    providers: AiMattingProviderConfig[]
    currentProvider: AiMattingProviderConfig | null
    ready: boolean
}>()
const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void
    (event: 'patch', provider: string, patch: Partial<AiMattingProviderConfig>): void
}>()
/** 从父页草稿生成下拉选项，不修改原数组或独立读取配置。 */
const options = computed(() =>
    props.providers.map((item) => ({ value: item.provider, label: item.label || item.provider }))
)
/** 发送带服务商标识的字段补丁，父页决定是否允许更新当前草稿。 */
const updateField = (field: keyof AiMattingProviderConfig, value: unknown) => {
    if (props.currentProvider)
        emit('patch', props.currentProvider.provider, {
            [field]: value,
        } as Partial<AiMattingProviderConfig>)
}
</script>
