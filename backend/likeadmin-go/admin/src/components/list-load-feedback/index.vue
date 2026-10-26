<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <a-alert v-if="error" :type="hasData ? 'warning' : 'error'" :closable="false" role="alert" class="list-load-feedback__error">
        {{ hasData ? '列表更新失败，当前显示上次成功加载的数据。' : error }}
        <template #action><a-button size="small" :loading="loading" @click="$emit('retry')">重试</a-button></template>
    </a-alert>
    <div v-else-if="loading || !loaded" class="list-load-feedback__pending" role="status">正在加载列表…</div>
    <a-empty v-else :description="emptyText" />
</template>
<script setup lang="ts">
withDefaults(defineProps<{ error?: string; loading?: boolean; loaded?: boolean; hasData?: boolean; emptyText?: string }>(), { error: '', loading: false, loaded: false, hasData: false, emptyText: '暂无数据' })
defineEmits<{ (event: 'retry'): void }>()
</script>
<style scoped>
.list-load-feedback__error { text-align: left; margin: 12px 0; }
.list-load-feedback__pending { padding: 24px 16px; color: var(--color-text-3); font-size: 13px; text-align: center; }
</style>
