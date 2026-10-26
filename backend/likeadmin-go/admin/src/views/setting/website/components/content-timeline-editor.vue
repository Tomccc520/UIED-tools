<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <div class="timeline-editor">
        <div class="timeline-editor__toolbar">
            <p>选择版本后编辑，保存后更新前台记录。</p>
            <a-button :disabled="Boolean(parsed.error)" @click="addVersion">新增版本</a-button>
        </div>
        <a-alert v-if="parsed.error" type="error" :closable="false">{{ parsed.error }}，原内容已保留。</a-alert>
        <div v-else-if="parsed.items.length" class="timeline-editor__workspace">
            <div class="timeline-editor__mobile-selector">
                <label>选择更新版本</label>
                <a-select :model-value="selected" :options="versionOptions" allow-search aria-label="选择更新版本" @update:model-value="selectVersion" />
            </div>
            <nav class="timeline-editor__versions" aria-label="选择更新版本">
                <button v-for="(item, index) in parsed.items" :key="index" type="button" :aria-pressed="selected === index" @click="selected = index">
                    <strong>{{ item.version || '新版本' }}</strong>
                    <span>{{ item.title || '填写版本标题' }}</span>
                    <small>{{ item.date || '填写日期' }}</small>
                </button>
            </nav>
            <section v-if="active" class="timeline-editor__form" aria-label="编辑版本">
                <a-form :model="active" layout="vertical">
                    <div class="timeline-editor__pair">
                        <a-form-item label="版本号" required><a-input :model-value="String(active.version || '')" :input-attrs="{ 'aria-label': '版本号' }" placeholder="如：3.0.6" @update:model-value="updateVersion('version', $event)" /></a-form-item>
                        <a-form-item label="发布日期" required><a-input :model-value="String(active.date || '')" :input-attrs="{ 'aria-label': '发布日期' }" placeholder="YYYY-MM-DD" @update:model-value="updateVersion('date', $event)" /></a-form-item>
                    </div>
                    <a-form-item label="版本标题" required><a-input :model-value="String(active.title || '')" :input-attrs="{ 'aria-label': '版本标题' }" placeholder="说明这次更新的主要变化" @update:model-value="updateVersion('title', $event)" /></a-form-item>
                </a-form>
                <div class="timeline-editor__section-heading"><h3>更新内容</h3><a-button type="text" :disabled="Boolean(featureError)" @click="addFeature">添加内容分组</a-button></div>
                <a-alert v-if="featureError" type="error" :closable="false">{{ featureError }}</a-alert>
                <section v-for="(feature, index) in features" :key="index" class="timeline-editor__feature">
                    <div class="timeline-editor__feature-title">
                        <a-input :model-value="String(feature.title || '')" :input-attrs="{ 'aria-label': '第' + (index + 1) + '组标题' }" placeholder="如：功能更新、问题修复" @update:model-value="updateFeature(index, 'title', $event)" />
                        <a-button type="text" status="danger" :aria-label="'移除第' + (index + 1) + '组更新'" @click="removeFeature(index)">移除</a-button>
                    </div>
                    <a-textarea :model-value="Array.isArray(feature.points) ? feature.points.join('\n') : ''" :textarea-attrs="{ 'aria-label': '第' + (index + 1) + '组更新内容' }" :auto-size="{ minRows: 3, maxRows: 12 }" placeholder="每行一条更新内容" @update:model-value="updateFeature(index, 'points', String($event).split('\n'))" />
                    <p v-if="feature.points !== undefined && !Array.isArray(feature.points)" class="timeline-editor__error">原内容格式不是数组，请展开原始 JSON 检查。</p>
                </section>
                <details class="timeline-editor__optional">
                    <summary>标签与排序</summary>
                    <a-form :model="active" layout="vertical">
                        <div class="timeline-editor__pair">
                            <a-form-item label="标签文案"><a-input :model-value="String(active.badgeText || '')" @update:model-value="updateVersion('badgeText', $event)" /></a-form-item>
                            <a-form-item label="标签样式"><a-select :model-value="String(active.badgeType || 'info')" @update:model-value="updateVersion('badgeType', $event)"><a-option value="info">普通</a-option><a-option value="success">完成</a-option><a-option value="warning">提示</a-option><a-option value="danger">重要</a-option></a-select></a-form-item>
                        </div>
                    </a-form>
                    <a-space wrap>
                        <a-button :disabled="selected === 0" @click="moveVersion(-1)">上移版本</a-button>
                        <a-button :disabled="selected === parsed.items.length - 1" @click="moveVersion(1)">下移版本</a-button>
                        <a-button status="danger" @click="removeVersion">移除此版本</a-button>
                    </a-space>
                </details>
            </section>
        </div>
        <a-empty v-else description="尚未配置自定义更新记录">
            <template #extra><a-button @click="loadDefaults">载入默认记录后编辑</a-button></template>
        </a-empty>
        <details class="timeline-editor__optional">
            <summary>导入或检查原始 JSON</summary>
            <p>可粘贴已有版本数组。无效内容会保留，并在保存前提示修正。</p>
            <a-textarea :model-value="modelValue" :auto-size="{ minRows: 6, maxRows: 18 }" :textarea-attrs="{ 'aria-label': '更新记录原始 JSON' }" @update:model-value="$emit('update:modelValue', String($event))" />
        </details>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { readContentArray, updateContentItem } from '../composables/frontend-content'
import feedback from '@/utils/feedback'
const props = defineProps<{ modelValue: string; defaultValue: string }>()
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
const selected = ref(0)
/** 只解析原始数组，不在显示时过滤、合并或重排用户已有记录。 */
const parsed = computed(() => {
    try { return { items: readContentArray(props.modelValue), error: '' } }
    catch (error) { return { items: [] as Record<string, any>[], error: error instanceof Error ? error.message : '更新记录格式错误' } }
})
const active = computed(() => parsed.value.items[selected.value])
/** 小屏用可搜索版本选择器，避免历史记录过多时需要长距离横向滑动。 */
const versionOptions = computed(() => parsed.value.items.map((item, index) => ({ value: index, label: String(item.version || '新版本') + ' · ' + String(item.title || '填写版本标题') })))
/** 仅接受当前数组内的版本位置，选择版本不改变记录内容。 */
const selectVersion = (value: unknown) => {
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < parsed.value.items.length) selected.value = value
}
const featureError = computed(() => active.value?.features !== undefined && (!Array.isArray(active.value.features) || active.value.features.some((item: any) => !item || typeof item !== 'object' || Array.isArray(item))) ? '更新内容分组格式不正确，请在原始 JSON 中修正。' : '')
const features = computed<Record<string, any>[]>(() => featureError.value ? [] : active.value?.features || [])
/** 数据重新加载或移除版本后，将选择位置限制在仍然存在的记录范围内。 */
watch(() => parsed.value.items.length, length => { selected.value = Math.max(0, Math.min(selected.value, length - 1)) })
/** 合并当前版本的一个字段，其他版本和扩展字段继续保留。 */
const updateVersion = (key: string, value: unknown) => emit('update:modelValue', updateContentItem(props.modelValue, selected.value, key, value))
/** 合并一个更新分组的字段，未编辑分组保持原对象数据。 */
const updateFeature = (index: number, key: string, value: unknown) => {
    const next = features.value.map((item, position) => position === index ? { ...item, [key]: value } : item)
    updateVersion('features', next)
}
/** 添加空的更新分组，必填校验在保存前执行，编辑中不丢失草稿。 */
const addFeature = () => updateVersion('features', [...features.value, { title: '', points: [''] }])
/** 移除当前草稿中的分组，服务器原文仍可通过重新加载恢复。 */
const removeFeature = (index: number) => updateVersion('features', features.value.filter((_, position) => position !== index))
/** 使用浏览器本地日期创建版本草稿，不因 UTC 日期跨天生成错误日期。 */
const addVersion = () => {
    const items = readContentArray(props.modelValue)
    const now = new Date()
    const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
    items.unshift({ id: 'version-' + crypto.randomUUID(), version: '', date, title: '', badgeText: '', badgeType: 'info', features: [{ title: '功能更新', points: [''] }] })
    selected.value = 0
    emit('update:modelValue', JSON.stringify(items, null, 2))
}
/** 在当前数组内调整版本顺序，随记录移动选择位置。 */
const moveVersion = (step: number) => {
    const items = readContentArray(props.modelValue)
    const target = selected.value + step
    if (target < 0 || target >= items.length) return
    const item = items.splice(selected.value, 1)[0]
    items.splice(target, 0, item)
    selected.value = target
    emit('update:modelValue', JSON.stringify(items, null, 2))
}
/** 删除版本前明确确认；只改草稿，保存前不会改动服务器记录。 */
const removeVersion = async () => {
    try { await feedback.confirm('确定从本次草稿中移除版本“' + String(active.value?.version || '新版本') + '”吗？保存后生效。') } catch { return }
    const items = readContentArray(props.modelValue)
    items.splice(selected.value, 1)
    emit('update:modelValue', JSON.stringify(items, null, 2))
}
/** 将项目默认记录放入草稿，仍由用户编辑并显式保存。 */
const loadDefaults = () => emit('update:modelValue', props.defaultValue)
</script>
<style scoped lang="scss">
.timeline-editor__toolbar,.timeline-editor__section-heading,.timeline-editor__feature-title { display:flex;align-items:center;justify-content:space-between;gap:12px; }
.timeline-editor__toolbar { margin-bottom:16px;flex-wrap:wrap; }
.timeline-editor p { margin:0;color:var(--color-text-3);font-size:12px;line-height:1.7; }
.timeline-editor__workspace { display:grid;grid-template-columns:220px minmax(0,1fr);gap:24px; }
.timeline-editor__mobile-selector { display:none;min-width:0; }
.timeline-editor__mobile-selector label { display:block;font-size:13px;margin-bottom:8px;color:var(--color-text-2); }
.timeline-editor__versions { display:flex;flex-direction:column;gap:4px;align-self:start;max-height:620px;overflow:auto; }
.timeline-editor__versions button { text-align:left;border:0;background:transparent;border-radius:6px;padding:12px;color:var(--color-text-2);cursor:pointer; }
.timeline-editor__versions strong,.timeline-editor__versions span,.timeline-editor__versions small { display:block; }
.timeline-editor__versions span { margin-top:4px;font-size:12px;line-height:1.6; }
.timeline-editor__versions small { margin-top:6px;color:var(--color-text-3); }
.timeline-editor__versions button[aria-pressed=true] { color:var(--uied-admin-accent);background:var(--uied-admin-accent-soft); }
.timeline-editor__versions button:focus-visible { outline:2px solid var(--uied-admin-accent);outline-offset:-2px; }
.timeline-editor__pair { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px; }
.timeline-editor__form { min-width:0; }
.timeline-editor h3 { margin:0;font-size:14px; }
.timeline-editor__feature { border-top:1px solid var(--color-border-2);padding-top:16px;margin-top:16px; }
.timeline-editor__feature-title { margin-bottom:8px; }
.timeline-editor__optional { margin-top:24px;padding-top:16px;border-top:1px solid var(--color-border-2); }
.timeline-editor__optional summary { cursor:pointer;font-size:13px;color:var(--color-text-2);padding:4px 0 12px; }
.timeline-editor__optional p { margin-bottom:12px; }
.timeline-editor .timeline-editor__error { color:rgb(var(--danger-6)); }
@media(max-width:900px) { .timeline-editor__workspace { grid-template-columns:1fr;gap:16px; } .timeline-editor__versions { display:none; } .timeline-editor__mobile-selector { display:block; } }
@media(max-width:600px) { .timeline-editor__pair { grid-template-columns:1fr;gap:0; } }
</style>
