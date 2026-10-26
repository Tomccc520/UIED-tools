<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <div class="content-links">
        <a-alert v-if="parsed.error" type="error" :closable="false">{{ parsed.error }}</a-alert>
        <div v-for="(item, index) in parsed.items" :key="index" class="content-links__row">
            <label><span>名称</span><a-input :model-value="String(item.name || '')" :disabled="disabled" :input-attrs="{ 'aria-label': label + '第' + (index + 1) + '条名称' }" placeholder="链接名称" @update:model-value="update(index, 'name', $event)" /></label>
            <label><span>地址</span><a-input :model-value="String(item.link || '')" :disabled="disabled" :input-attrs="{ 'aria-label': label + '第' + (index + 1) + '条地址' }" placeholder="站内路径或 https:// 地址" @update:model-value="update(index, 'link', $event)" /></label>
            <div class="content-links__actions">
                <template v-if="sortable">
                    <a-button type="text" :disabled="disabled || index === 0" :aria-label="'上移' + label + '第' + (index + 1) + '条'" @click="move(index, -1)">上移</a-button>
                    <a-button type="text" :disabled="disabled || index === parsed.items.length - 1" :aria-label="'下移' + label + '第' + (index + 1) + '条'" @click="move(index, 1)">下移</a-button>
                </template>
                <a-button type="text" status="danger" :disabled="disabled" :aria-label="'移除' + label + '第' + (index + 1) + '条'" @click="remove(index)">移除</a-button>
            </div>
        </div>
        <div v-if="canUndo" class="content-links__undo" role="status">已从草稿移除链接<a-button type="text" :disabled="disabled" @click="undoRemove">撤销</a-button></div>
        <a-button type="outline" :disabled="disabled || Boolean(parsed.error)" @click="add">添加链接</a-button>
        <details v-if="parsed.error" open><summary>修正原始 JSON</summary><a-textarea :model-value="modelValue" :readonly="disabled" :textarea-attrs="{ 'aria-label': label + '原始 JSON' }" :auto-size="{ minRows: 4, maxRows: 10 }" @update:model-value="replaceRaw($event)" /></details>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { updateContentItem } from '../composables/frontend-content'
import { readConfigLinks } from '../composables/config-links'
const props = withDefaults(defineProps<{ modelValue: string; label: string; sortable?: boolean; disabled?: boolean; contextKey?: number | string }>(), { sortable: false, disabled: false, contextKey: '' })
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
const removedSnapshot = ref<{ before: string; after: string; contextKey: number | string } | null>(null)
/** 保留链接原始扩展字段，解析失败时留给用户修正而不覆盖为空。 */
const parsed = computed(() => {
    try { return { items: readConfigLinks(props.modelValue), error: '' } }
    catch (error) { return { items: [] as Record<string, any>[], error: error instanceof Error ? error.message : '链接格式不正确，原始内容已保留。' } }
})
const canUndo = computed(() => removedSnapshot.value?.contextKey === props.contextKey && removedSnapshot.value?.after === props.modelValue)
/** 父级切换或移除分组后清除旧撤销记录，不重挂载输入框，也不影响同一组的普通编辑。 */
watch(() => props.contextKey, () => { removedSnapshot.value = null }, { flush: 'sync' })
/** 更新合法草稿并清理过时撤销记录，禁用状态不接受组件事件。 */
const replaceRaw = (value: unknown) => {
    if (props.disabled) return
    removedSnapshot.value = null
    emit('update:modelValue', String(value))
}
/** 编辑单个链接字段，不重建其他链接或其扩展数据。 */
const update = (index: number, field: string, value: unknown) => {
    if (!props.disabled && !parsed.value.error) replaceRaw(updateContentItem(props.modelValue, index, field, value))
}
/** 添加本地链接草稿，填写完整后再统一保存。 */
const add = () => {
    if (!props.disabled && !parsed.value.error) replaceRaw(JSON.stringify([...parsed.value.items, { name: '', link: '' }], null, 2))
}
/** 移除草稿内的链接，记录可撤销的完整原文，不直接保存到服务器。 */
const remove = (index: number) => {
    if (props.disabled || parsed.value.error || !Number.isInteger(index) || index < 0 || index >= parsed.value.items.length) return
    const after = JSON.stringify(parsed.value.items.filter((_, position) => position !== index), null, 2)
    removedSnapshot.value = { before: props.modelValue, after, contextKey: props.contextKey }
    emit('update:modelValue', after)
}
/** 仅在没有后续编辑时撤销最近移除，避免覆盖后来的草稿。 */
const undoRemove = () => {
    if (!props.disabled && canUndo.value && removedSnapshot.value) replaceRaw(removedSnapshot.value.before)
}
/** 只调整相邻链接的位置，保留完整对象和扩展字段。 */
const move = (index: number, step: -1 | 1) => {
    if (props.disabled || !props.sortable || parsed.value.error) return
    const items = [...parsed.value.items]
    const target = index + step
    if (!Number.isInteger(index) || index < 0 || index >= items.length || target < 0 || target >= items.length) return
    ;[items[index], items[target]] = [items[target], items[index]]
    replaceRaw(JSON.stringify(items, null, 2))
}
</script>
<style scoped lang="scss">
.content-links__row { display: grid; grid-template-columns: minmax(100px, 1fr) minmax(0, 2fr) auto; gap: 12px; margin-bottom: 16px; align-items: end; }
.content-links__row label { display: grid; gap: 6px; min-width: 0; }
.content-links__row label > span { color: var(--color-text-3); font-size: 12px; }
.content-links__actions { display: flex; flex-wrap: wrap; gap: 4px; }
.content-links__undo { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; color: var(--color-text-3); font-size: 13px; }
.content-links details { margin-top: 12px; }
.content-links summary { cursor: pointer; padding: 8px 0; }
@media(max-width: 768px) { .content-links__row { grid-template-columns: minmax(0, 1fr); gap: 10px; border-bottom: 1px solid var(--color-border-2); padding-bottom: 16px; } .content-links__actions { justify-content: flex-end; } .content-links :deep(button) { min-height: 44px; } }
</style>
