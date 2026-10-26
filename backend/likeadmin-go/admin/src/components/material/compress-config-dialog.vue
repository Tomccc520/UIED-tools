<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <a-modal
        :visible="true"
        title="图片自动压缩设置"
        :width="'min(520px, calc(100vw - 24px))'"
        :mask-closable="false"
        :closable="!saving"
        :esc-to-close="!saving"
        :on-before-cancel="requestClose"
    >
        <a-alert v-if="error || saveError" type="error" :closable="false" show-icon>
            {{ error || saveError }}
            <template v-if="error" #action>
                <a-button :disabled="loading || saving" @click="requestRetry">重新读取</a-button>
            </template>
        </a-alert>
        <a-spin :loading="loading" style="display: block">
            <a-form layout="vertical" :model="modelValue" :disabled="disabled">
                <a-form-item label="启用自动压缩" field="enabled">
                    <a-switch
                        :model-value="modelValue.enabled"
                        checked-text="开启"
                        unchecked-text="关闭"
                        @update:model-value="patch('enabled', $event)"
                    />
                </a-form-item>
                <a-form-item
                    label="触发阈值（KB）"
                    field="minSizeKB"
                    help="0 表示所有符合格式的图片均尝试压缩。"
                >
                    <a-input-number
                        :model-value="modelValue.minSizeKB"
                        :min="0"
                        :max="102400"
                        mode="button"
                        class="w-full"
                        @update:model-value="patch('minSizeKB', $event)"
                    />
                </a-form-item>
                <a-form-item label="JPEG 质量（40-100）" field="jpegQuality">
                    <a-slider
                        :model-value="modelValue.jpegQuality"
                        :min="40"
                        :max="100"
                        :step="1"
                        show-input
                        @update:model-value="patch('jpegQuality', $event)"
                    />
                </a-form-item>
                <a-form-item label="PNG 压缩等级" field="pngCompressionLevel">
                    <a-radio-group
                        :model-value="modelValue.pngCompressionLevel"
                        @update:model-value="patch('pngCompressionLevel', $event)"
                    >
                        <a-radio value="speed">优先速度</a-radio>
                        <a-radio value="default">平衡模式</a-radio>
                        <a-radio value="best">优先体积</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-alert type="info" show-icon>
                    仅对新上传 JPG/PNG 自动压缩；SVG/GIF 与已上传历史文件不会自动重写。
                </a-alert>
            </a-form>
        </a-spin>
        <template #footer>
            <a-button :disabled="saving" @click="requestClose">取消</a-button>
            <a-button :disabled="loading || saving" @click="requestRetry">重新读取</a-button>
            <a-button type="primary" :loading="saving" :disabled="disabled" @click="requestSave">
                保存设置
            </a-button>
        </template>
    </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MaterialCompressConfig } from './types'

const props = defineProps<{
    modelValue: MaterialCompressConfig
    loading: boolean
    saving: boolean
    loaded: boolean
    error: string
    saveError: string
}>()
const emit = defineEmits<{
    (event: 'patch', value: Partial<MaterialCompressConfig>): void
    (event: 'close'): void
    (event: 'retry'): void
    (event: 'save'): void
}>()
/** 统一压缩配置编辑和保存的可用状态，不允许提交读取失败后的展示值。 */
const disabled = computed(
    () => props.loading || props.saving || !props.loaded || Boolean(props.error)
)

/** 只发出当前字段的编辑事件，压缩策略和接口均由素材父组件维护。 */
const patch = <K extends keyof MaterialCompressConfig>(key: K, value: unknown) => {
    if (!disabled.value) emit('patch', { [key]: value } as Pick<MaterialCompressConfig, K>)
}
/** 保存中阻止关闭；其余关闭行为交给父组件统一处理。 */
const requestClose = () => {
    if (props.saving) return false
    emit('close')
    return true
}
/** 防止读取与保存期间重复触发重新读取。 */
const requestRetry = () => {
    if (!props.loading && !props.saving) emit('retry')
}
/** 仅在成功读取配置且没有错误时请求保存，不写入展示用默认值。 */
const requestSave = () => {
    if (!disabled.value) emit('save')
}
</script>
