<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
-->
<template>
    <div class="config-edit-frame" :data-state="saveState" :aria-busy="loading || saving">
        <a-alert v-if="error" type="error" role="alert" class="config-edit-frame__alert" :closable="false">
            {{ error }}
            <template #action><a-button size="small" :loading="loading" :disabled="saving" @click="$emit('retry')">重新加载</a-button></template>
        </a-alert>
        <a-alert v-if="saveError" type="error" role="alert" class="config-edit-frame__alert" :closable="false">{{ saveError }}</a-alert>
        <a-spin :loading="loading" tip="正在读取配置..." style="display: block">
            <fieldset :disabled="loading || saving || !ready || Boolean(error)" class="config-edit-frame__fields" :inert="loading || saving || !ready || Boolean(error) ? '' : undefined">
                <slot />
            </fieldset>
        </a-spin>
        <footer v-if="saveBarVisible" class="config-edit-frame__save" :data-state="saveState">
            <div class="config-edit-frame__status" role="status" aria-live="polite">
                <span class="config-edit-frame__indicator" aria-hidden="true"></span>
                <div><strong>{{ statusText }}</strong><span>{{ saving ? '保存过程中请稍候' : savedAt ? `最近保存：${savedAt}` : '修改后点击保存，生效状态会显示在这里' }}</span></div>
            </div>
            <fieldset :disabled="loading || saving || !ready || Boolean(error)" class="config-edit-frame__actions"><slot name="actions" /></fieldset>
        </footer>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{ loading: boolean; ready: boolean; dirty: boolean; saving: boolean; error?: string; saveError?: string; savedAt?: string; showSaveBar?: boolean }>(), { showSaveBar: true, error: '', saveError: '', savedAt: '' })
defineEmits<{ (event: 'retry'): void }>()
/** 允许列表收起空闲保存区；真实草稿、提交和保存失败始终可见，避免隐藏需要处理的更改。 */
const saveBarVisible = computed(() => props.showSaveBar || props.dirty || props.saving || Boolean(props.saveError))
/** 保存状态与加载状态分开表达，初次读取不冒充保存成功，失败后仍可重试保存。 */
const saveState = computed(() => props.saving ? 'saving' : props.loading ? 'loading' : props.error || props.saveError ? 'error' : !props.ready ? 'pending' : props.dirty ? 'dirty' : props.savedAt ? 'saved' : 'ready')
/** 仅对可确认的状态给出结果文案；保存失败保留草稿，避免出现“失败但已保存”的歧义。 */
const statusText = computed(() => ({ saving: '正在保存更改', loading: '正在读取配置', error: props.error ? '加载失败，暂不能保存' : '保存未成功，修改已保留', pending: '尚未读取配置', dirty: '有未保存的更改', saved: '所有更改已保存', ready: '当前没有未保存更改' }[saveState.value]))
</script>
<style scoped lang="scss">
.config-edit-frame { min-width: 0; }
.config-edit-frame__fields, .config-edit-frame__actions { min-width: 0; padding: 0; margin: 0; border: 0; }
.config-edit-frame__alert { margin-bottom: 16px; }
/* 保存条高于表格固定列，避免长表格的“编辑”按钮覆盖保存操作。 */
.config-edit-frame__save { position: sticky; bottom: 12px; z-index: 20; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 20px; padding: 14px 18px; border: 1px solid var(--uied-admin-border); border-radius: var(--uied-admin-radius); background: var(--color-bg-2); box-shadow: 0 4px 18px rgb(23 32 51 / 6%);
    strong, span { display: block; font-size: 13px; }
    strong + span { margin-top: 4px; font-size: 12px; color: var(--color-text-3); }
}
.config-edit-frame__status { display: flex; align-items: center; gap: 12px; min-width: 0; }
.config-edit-frame__save .config-edit-frame__indicator { flex: 0 0 8px; width: 8px; height: 8px; border-radius: 50%; background: var(--color-text-4); }
.config-edit-frame__save[data-state='dirty'], .config-edit-frame__save[data-state='saving'] { border-color: var(--uied-admin-accent-border); }
.config-edit-frame__save[data-state='dirty'] .config-edit-frame__indicator, .config-edit-frame__save[data-state='saving'] .config-edit-frame__indicator { background: var(--uied-admin-accent); }
.config-edit-frame__save[data-state='saved'] .config-edit-frame__indicator { background: var(--color-success-6); }
.config-edit-frame__save[data-state='error'] .config-edit-frame__indicator { background: var(--color-danger-6); }
.config-edit-frame__actions { display: flex; flex-wrap: wrap; gap: 8px; }
@media (max-width: 600px) {
    .config-edit-frame__save { bottom: 8px; padding: 12px; }
    .config-edit-frame__actions { width: 100%; }
    .config-edit-frame__actions :deep(button) { min-height: 44px; flex: 1; }
    :deep(.compact-form .arco-form-item) { flex-direction: column; }
    :deep(.compact-form .arco-form-item-label-col), :deep(.compact-form .arco-form-item-wrapper-col) { flex: 0 0 100%; width: 100%; max-width: 100%; text-align: left; }
    :deep(.compact-form .arco-form-item-label-col) { justify-content: flex-start; }
    :deep(.compact-form .arco-form-item-label) { flex: initial; width: auto; padding-right: 0; text-align: left; }
}
</style>
