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
        <a-alert v-if="parsed.error" type="error" :closable="false">{{ parsed.error }}，原始内容已保留。</a-alert>
        <div v-for="(item, index) in parsed.items" :key="index" class="content-links__row">
            <a-input :model-value="String(item.name || '')" :input-attrs="{ 'aria-label': label + '第' + (index + 1) + '条名称' }" placeholder="链接名称" @update:model-value="update(index, 'name', $event)" />
            <a-input :model-value="String(item.link || '')" :input-attrs="{ 'aria-label': label + '第' + (index + 1) + '条地址' }" placeholder="站内路径或 https:// 地址" @update:model-value="update(index, 'link', $event)" />
            <a-button type="text" status="danger" :aria-label="'移除' + label + '第' + (index + 1) + '条'" @click="remove(index)">移除</a-button>
        </div>
        <a-button type="text" :disabled="Boolean(parsed.error)" @click="add">添加链接</a-button>
        <details v-if="parsed.error"><summary>修正原始 JSON</summary><a-textarea :model-value="modelValue" :auto-size="{ minRows: 4, maxRows: 10 }" @update:model-value="$emit('update:modelValue', String($event))" /></details>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { readContentArray, updateContentItem } from '../composables/frontend-content'
const props = defineProps<{ modelValue: string; label: string }>()
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
/** 保留链接原始扩展字段，解析失败时留给用户修正而不覆盖为空。 */
const parsed = computed(() => {
    try { return { items: readContentArray(props.modelValue), error: '' } }
    catch { return { items: [] as Record<string, any>[], error: '链接格式不正确' } }
})
/** 编辑单个链接字段，不重建其他链接或其扩展数据。 */
const update = (index: number, field: string, value: unknown) => emit('update:modelValue', updateContentItem(props.modelValue, index, field, value))
/** 添加本地链接草稿，填写完整后再统一保存。 */
const add = () => emit('update:modelValue', JSON.stringify([...parsed.value.items, { name: '', link: '' }], null, 2))
/** 移除草稿内的链接，保存前仍能通过重新加载恢复。 */
const remove = (index: number) => emit('update:modelValue', JSON.stringify(parsed.value.items.filter((_, position) => position !== index), null, 2))
</script>
<style scoped lang="scss">
.content-links__row { display:grid;grid-template-columns:minmax(100px,1fr) minmax(0,2fr) auto;gap:12px;margin-bottom:12px;align-items:start; }
.content-links details { margin-top:12px; }
.content-links summary { cursor:pointer;padding:8px 0; }
@media(max-width:600px) { .content-links__row { grid-template-columns:minmax(0,1fr) auto;gap:8px; } .content-links__row > :nth-child(2) { grid-row:2;grid-column:1 / -1; } }
</style>
