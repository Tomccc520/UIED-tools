<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
-->
<template>
    <div class="config-edit-frame" :aria-busy="loading || saving">
        <a-alert v-if="error" type="error" role="alert" class="config-edit-frame__alert" :closable="false">
            {{ error }}
            <template #action><a-button size="small" @click="$emit('retry')">重试</a-button></template>
        </a-alert>
        <a-alert v-if="saveError" type="error" role="alert" class="config-edit-frame__alert" :closable="false">{{ saveError }}</a-alert>
        <a-spin :loading="loading" tip="正在读取配置..." style="display: block">
            <fieldset :disabled="loading || saving || !ready || Boolean(error)" class="config-edit-frame__fields" :inert="loading || saving || !ready || Boolean(error) ? '' : undefined">
                <slot />
            </fieldset>
        </a-spin>
        <div class="config-edit-frame__save" role="status" aria-live="polite">
            <div><strong>{{ saving ? '正在保存配置' : loading ? '正在读取配置' : error ? '加载失败，暂不能保存' : !ready ? '尚未读取配置' : dirty ? '有未保存更改' : savedAt ? '配置已保存' : '当前无未保存更改' }}</strong><span>{{ savedAt ? `最近保存：${savedAt}` : '保存配置后生效' }}</span></div>
            <fieldset :disabled="loading || saving || !ready || Boolean(error)" class="config-edit-frame__actions"><slot name="actions" /></fieldset>
        </div>
    </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ loading: boolean; ready: boolean; dirty: boolean; saving: boolean; error?: string; saveError?: string; savedAt?: string }>(), { error: '', saveError: '', savedAt: '' })
defineEmits<{ (event: 'retry'): void }>()
</script>
<style scoped lang="scss">
.config-edit-frame { min-width: 0; }
.config-edit-frame__fields, .config-edit-frame__actions { min-width: 0; padding: 0; margin: 0; border: 0; }
.config-edit-frame__alert { margin-bottom: 16px; }
/* 保存条高于表格固定列，避免长表格的“编辑”按钮覆盖保存操作。 */
.config-edit-frame__save { position: sticky; bottom: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 16px; padding: 12px 16px; border: 1px solid var(--color-border-2); border-radius: 6px; background: var(--color-bg-2);
    strong, span { display: block; font-size: 13px; }
    span { margin-top: 4px; font-size: 12px; color: var(--color-text-3); }
}
@media (max-width: 600px) {
    :deep(.compact-form .arco-form-item) { flex-direction: column; }
    :deep(.compact-form .arco-form-item-label-col), :deep(.compact-form .arco-form-item-wrapper-col) { flex: 0 0 100%; width: 100%; max-width: 100%; text-align: left; }
}
</style>
