<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <aside class="material__right material__right--detail" aria-label="附件详情">
        <h3 class="material-detail__header">附件详情</h3>
        <div class="material-detail__content">
            <div class="material-detail__preview">
                <file-item :uri="displayUrl" file-size="220px" :type="type" />
            </div>
            <a-scrollbar class="flex-1 min-h-0">
                <dl class="material-detail__meta">
                    <div v-for="item in metadata" :key="item.label" class="detail-meta-row">
                        <dt>{{ item.label }}</dt>
                        <dd>{{ item.value }}</dd>
                    </div>
                </dl>
                <a-divider margin="14px 0" />
                <a-form
                    :model="modelValue"
                    layout="vertical"
                    class="material-detail__form"
                    :disabled="disabled"
                >
                    <a-form-item label="替代文本" field="altText">
                        <a-textarea
                            :model-value="modelValue.altText"
                            :max-length="255"
                            placeholder="描述此图片的用途，如仅装饰可留空"
                            :auto-size="{ minRows: 2, maxRows: 4 }"
                            allow-clear
                            @update:model-value="patch('altText', $event)"
                        />
                    </a-form-item>
                    <a-form-item label="标题" field="title">
                        <a-input
                            :model-value="modelValue.title"
                            :max-length="150"
                            placeholder="请输入附件标题"
                            allow-clear
                            @update:model-value="patch('title', $event)"
                        />
                    </a-form-item>
                    <a-form-item label="说明文字" field="caption">
                        <a-input
                            :model-value="modelValue.caption"
                            :max-length="255"
                            placeholder="请输入说明文字"
                            allow-clear
                            @update:model-value="patch('caption', $event)"
                        />
                    </a-form-item>
                    <a-form-item label="描述" field="description">
                        <a-textarea
                            :model-value="modelValue.description"
                            :max-length="1200"
                            placeholder="请输入附件描述"
                            :auto-size="{ minRows: 3, maxRows: 6 }"
                            allow-clear
                            @update:model-value="patch('description', $event)"
                        />
                    </a-form-item>
                    <a-form-item label="图片路径（可编辑）" field="uri">
                        <a-input
                            :model-value="modelValue.uri"
                            :max-length="500"
                            placeholder="例如：uploads/2026/04/demo.jpg"
                            allow-clear
                            @update:model-value="patch('uri', $event)"
                        />
                    </a-form-item>
                    <details class="material-detail__binding" :open="hasBinding">
                        <summary>业务对象绑定<span>文章、工具页等关联信息</span></summary>
                        <a-form-item label="业务对象类型" field="bindType">
                            <a-select
                                :model-value="modelValue.bindType"
                                :options="bindTypeOptions"
                                placeholder="请选择业务类型"
                                allow-create
                                allow-search
                                @update:model-value="patch('bindType', $event)"
                            />
                        </a-form-item>
                        <a-form-item label="业务对象 ID" field="bindId">
                            <a-input-number
                                :model-value="modelValue.bindId"
                                :min="0"
                                :max="999999999999"
                                mode="button"
                                hide-button
                                class="w-full"
                                placeholder="例如：文章 ID"
                                @update:model-value="patch('bindId', $event)"
                            />
                        </a-form-item>
                        <a-form-item label="业务对象标题" field="bindTitle">
                            <a-input
                                :model-value="modelValue.bindTitle"
                                :max-length="255"
                                placeholder="请输入关联对象的标题"
                                allow-clear
                                @update:model-value="patch('bindTitle', $event)"
                            />
                        </a-form-item>
                        <a-form-item label="业务对象链接" field="bindUrl">
                            <a-input
                                :model-value="modelValue.bindUrl"
                                :max-length="500"
                                placeholder="例如：https://uiedtool.com/..."
                                allow-clear
                                @update:model-value="patch('bindUrl', $event)"
                            />
                        </a-form-item>
                    </details>
                    <a-form-item label="文件 URL">
                        <div class="material-detail__url">
                            <a-input :model-value="material.uri" readonly aria-label="文件 URL" />
                            <a-button type="outline" @click="requestCopy">复制链接</a-button>
                        </div>
                    </a-form-item>
                    <slot name="actions" />
                </a-form>
            </a-scrollbar>
        </div>
    </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FileItem from './file.vue'
import type { MaterialItem, MaterialMetaForm } from './types'

const props = defineProps<{
    material: MaterialItem
    modelValue: MaterialMetaForm
    displayUrl: string
    type: string
    disabled: boolean
    bindTypeOptions: Array<{ label: string; value: string }>
}>()
const emit = defineEmits<{
    (event: 'patch', value: Partial<MaterialMetaForm>): void
    (event: 'copy', url: string): void
}>()

/** 将上传时间转换为中文日期，无效时间保持原值以便识别历史记录。 */
const formatUploadAt = (value?: string) => {
    const raw = String(value || '').trim()
    if (!raw) return '-'
    const date = new Date(raw.replace(/-/g, '/'))
    if (Number.isNaN(date.getTime())) return raw
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(
        date.getDate()
    ).padStart(2, '0')}日`
}
/** 优先显示后端分辨率，旧记录退回已记录的宽高。 */
const formatResolution = (record: MaterialItem) => {
    if (String(record.resolution || '').trim()) return String(record.resolution).trim()
    return record.width && record.height ? `${record.width}×${record.height} 像素` : '-'
}
/** 随父级选中的附件生成只读信息，切换素材时不复用旧附件快照。 */
const metadata = computed(() => [
    { label: '上传于', value: formatUploadAt(props.material.createTime) },
    { label: '上传者', value: props.material.uploaderName || '系统上传' },
    { label: '上传至', value: props.material.uploadToName || props.material.cateName || '未分组' },
    { label: '文件名', value: props.material.fileName || props.material.name },
    { label: '文件类型', value: props.material.mimeType || '-' },
    { label: '文件大小', value: props.material.size || '-' },
    { label: '分辨率', value: formatResolution(props.material) }
])
/** 已有关联对象时默认展开，未关联的附件收起低频业务字段。 */
const hasBinding = computed(() =>
    Boolean(
        props.modelValue.bindType ||
            props.modelValue.bindId ||
            props.modelValue.bindTitle ||
            props.modelValue.bindUrl
    )
)

/** 仅发出字段补丁，父级负责当前附件归属、草稿和保存期间的快照。 */
const patch = <K extends keyof MaterialMetaForm>(key: K, value: unknown) => {
    if (!props.disabled) emit('patch', { [key]: value } as Pick<MaterialMetaForm, K>)
}
/** 复制动作携带点击时的当前附件地址，不在展示组件中操作系统剪贴板。 */
const requestCopy = () => {
    if (!props.disabled) emit('copy', props.material.uri)
}
</script>

<style scoped lang="scss">
.material__right--detail {
    display: flex;
    flex-direction: column;
    width: 360px;
    min-width: 360px;
    min-height: 0;
    background: var(--color-bg-2);
}
.material-detail__header {
    margin: 0;
    padding: 12px 14px;
    border-bottom: 1px solid var(--color-border-2);
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
}
.material-detail__content {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
}
.material-detail__preview {
    padding: 12px 14px 0;
    :deep(.file-item) {
        width: 100%;
    }
}
.material-detail__meta {
    display: grid;
    gap: 6px;
    margin: 0;
    padding: 12px 14px 0;
}
.detail-meta-row {
    display: grid;
    grid-template-columns: 58px minmax(0, 1fr);
    gap: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-2);
    overflow-wrap: anywhere;
    dt {
        color: var(--color-text-3);
    }
    dd {
        margin: 0;
    }
}
.material-detail__form {
    padding: 0 14px 14px;
    :deep(.arco-form-item) {
        margin-bottom: 12px;
    }
}
.material-detail__url {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    gap: 8px;
    :deep(.arco-input-wrapper) {
        min-width: 120px;
        flex: 1;
    }
    .arco-btn {
        flex-shrink: 0;
    }
}
.material-detail__binding {
    border-block: 1px solid var(--color-border-2);
    margin-block: 14px;
    summary {
        cursor: pointer;
        padding: 12px 0;
        color: var(--color-text-1);
        font-weight: 500;
    }
    summary span {
        display: block;
        padding-left: 14px;
        font-size: 12px;
        color: var(--color-text-3);
        font-weight: 400;
    }
    summary:focus-visible {
        outline: 2px solid rgb(var(--primary-6));
        outline-offset: 2px;
    }
}
@media (max-width: 1180px) {
    .material__right--detail {
        width: 100%;
        min-width: 0;
        border-left: 0;
        border-top: 1px solid var(--color-border-2);
    }
}
</style>
