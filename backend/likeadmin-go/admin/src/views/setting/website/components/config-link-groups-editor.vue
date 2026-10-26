<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <section class="link-groups" :aria-label="label">
        <a-alert v-if="parsed.error || actionError" type="error" :closable="false">{{ parsed.error || actionError }}</a-alert>
        <div v-if="!parsed.error" class="link-groups__selector">
            <label><span>选择分组</span><a-select :model-value="activeIndex" :disabled="!parsed.items.length" :aria-label="label + '当前分组'" @update:model-value="selectGroup">
                <a-option v-for="(group, index) in parsed.items" :key="index" :value="index">{{ group.title || '未命名分组' }} · {{ group.items.length }} 条链接</a-option>
            </a-select></label>
            <a-button :disabled="disabled" @click="addGroup">新增分组</a-button>
        </div>
        <a-empty v-if="!parsed.error && !parsed.items.length" description="暂无分组，可新增分组后添加链接" />
        <div v-if="selectedGroup" class="link-groups__current">
            <label class="link-groups__title"><span>分组名称</span><a-input :model-value="selectedGroup.title" :disabled="disabled" :input-attrs="{ 'aria-label': label + '分组名称' }" placeholder="例如：设计工具" @update:model-value="updateTitle" /></label>
            <div class="link-groups__actions">
                <a-button type="text" :disabled="disabled || activeIndex === 0" @click="moveGroup(-1)">分组上移</a-button>
                <a-button type="text" :disabled="disabled || activeIndex === parsed.items.length - 1" @click="moveGroup(1)">分组下移</a-button>
                <a-button type="text" status="danger" :disabled="disabled" @click="removeGroup">移除分组</a-button>
            </div>
            <content-links-editor :model-value="JSON.stringify(selectedGroup.items, null, 2)" :context-key="linksContext" :label="label + '第' + (activeIndex + 1) + '组'" sortable :disabled="disabled" @update:model-value="updateLinks" />
        </div>
        <div v-if="canUndo" class="link-groups__undo" role="status">已从草稿移除分组<a-button type="text" :disabled="disabled" @click="undoRemove">撤销</a-button></div>
        <details class="link-groups__source" :open="Boolean(parsed.error)">
            <summary>高级：原始 JSON</summary>
            <p>直接修改数据时保留未识别字段；修改后仍需在页面统一保存。</p>
            <a-textarea :model-value="modelValue" :readonly="disabled" :textarea-attrs="{ 'aria-label': label + '原始 JSON' }" :auto-size="{ minRows: 6, maxRows: 16 }" @update:model-value="replaceRaw" />
        </details>
    </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ContentLinksEditor from './content-links-editor.vue'
import { addConfigLinkGroup, moveConfigLinkGroup, readConfigLinkGroups, readConfigLinks, removeConfigLinkGroup, updateConfigLinkGroup, type ConfigLinkGroup } from '../composables/config-links'
const props = withDefaults(defineProps<{ modelValue: string; label: string; disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
const activeIndex = ref(0)
const linksContext = ref(0)
const actionError = ref('')
const removedSnapshot = ref<{ before: string; after: string; index: number } | null>(null)
/** 解析原始分组用于展示，失败显示原始编辑器，禁止用空数组覆盖错误数据。 */
const parsed = computed(() => {
    try { return { items: readConfigLinkGroups(props.modelValue, props.label), error: '' } }
    catch (error) { return { items: [] as ConfigLinkGroup[], error: error instanceof Error ? error.message : '分组格式不正确，原始内容已保留。' } }
})
const selectedGroup = computed(() => parsed.value.items[activeIndex.value])
const canUndo = computed(() => removedSnapshot.value?.after === props.modelValue)
/** 外部重载或删除改变数量时修正选择，仍保持本页其他分组原文不变。 */
watch(() => parsed.value.items.length, length => { if (activeIndex.value >= length) activeIndex.value = Math.max(0, length - 1) })
/** 只接受当前真实分组的位置，不使用下拉输入创建未知索引。 */
const selectGroup = (value: unknown) => {
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < parsed.value.items.length && value !== activeIndex.value) {
        linksContext.value++
        activeIndex.value = value
    }
}
/** 更新完整原始字符串，禁用状态忽略事件并清除不能再安全撤销的旧记录。 */
const replaceRaw = (value: unknown, resetLinksContext = true) => {
    if (props.disabled) return
    if (resetLinksContext) linksContext.value++
    actionError.value = ''
    removedSnapshot.value = null
    emit('update:modelValue', String(value))
}
/** 在解析与位置校验成功后提交本地变更；错误只作提示，不产生替代数据。 */
const edit = (operation: () => string) => {
    if (props.disabled || parsed.value.error) return false
    try { replaceRaw(operation(), false); return true }
    catch (error) { actionError.value = error instanceof Error ? error.message : '修改未完成，请重新选择分组。'; return false }
}
/** 只修改当前分组标题，保留组内链接和所有扩展字段。 */
const updateTitle = (value: unknown) => edit(() => updateConfigLinkGroup(props.modelValue, activeIndex.value, { title: String(value) }))
/** 写入当前组的链接编辑结果，不重建其他分组或其字段。 */
const updateLinks = (value: string) => edit(() => updateConfigLinkGroup(props.modelValue, activeIndex.value, { items: readConfigLinks(value) }))
/** 新增分组后选中新草稿，填写名称与链接即可继续编辑。 */
const addGroup = () => {
    const index = parsed.value.items.length
    if (edit(() => addConfigLinkGroup(props.modelValue))) {
        linksContext.value++
        activeIndex.value = index
    }
}
/** 调整当前分组的顺序，选择始终跟随被移动的分组。 */
const moveGroup = (step: -1 | 1) => {
    const target = activeIndex.value + step
    if (target < 0 || target >= parsed.value.items.length) return
    if (edit(() => moveConfigLinkGroup(props.modelValue, activeIndex.value, step))) {
        linksContext.value++
        activeIndex.value = target
    }
}
/** 移除分组仅形成草稿，记录完整旧值供无后续编辑时撤销。 */
const removeGroup = () => {
    if (props.disabled || parsed.value.error || !selectedGroup.value) return
    const before = props.modelValue
    const index = activeIndex.value
    try {
        const after = removeConfigLinkGroup(before, index)
        linksContext.value++
        actionError.value = ''
        removedSnapshot.value = { before, after, index }
        emit('update:modelValue', after)
        activeIndex.value = Math.max(0, index - 1)
    } catch (error) { actionError.value = error instanceof Error ? error.message : '移除未完成，请重新选择分组。' }
}
/** 后续没有其他编辑时恢复被移除的完整分组，不覆盖新的草稿。 */
const undoRemove = () => {
    if (props.disabled || !canUndo.value || !removedSnapshot.value) return
    const { before, index } = removedSnapshot.value
    replaceRaw(before)
    activeIndex.value = index
}
</script>
<style scoped lang="scss">
.link-groups { min-width: 0; }
.link-groups__selector { display: flex; gap: 12px; align-items: end; margin: 0 0 24px; }
.link-groups__selector label { flex: 1; max-width: 480px; min-width: 0; }
.link-groups label { display: grid; gap: 8px; color: var(--color-text-2); font-size: 13px; }
.link-groups__title { max-width: 600px; }
.link-groups__actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0 20px; }
.link-groups__source { margin-top: 24px; border-top: 1px solid var(--color-border-2); padding-top: 12px; }
.link-groups__source summary { color: var(--color-text-3); cursor: pointer; font-size: 13px; padding: 8px 0; }
.link-groups__source p { color: var(--color-text-3); font-size: 12px; line-height: 1.7; }
.link-groups__undo { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; color: var(--color-text-3); font-size: 13px; margin-top: 12px; }
.link-groups summary:focus-visible { outline: 2px solid rgb(var(--primary-6)); outline-offset: 2px; }
@media (max-width: 600px) { .link-groups__selector { flex-wrap: wrap; } .link-groups__selector label { flex-basis: 100%; max-width: none; } .link-groups :deep(button) { min-height: 44px; } }
</style>
