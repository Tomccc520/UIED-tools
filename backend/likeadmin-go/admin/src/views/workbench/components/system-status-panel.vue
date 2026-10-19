<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <dl class="environment-info">
        <div v-for="item in environmentInfoList" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
        </div>
    </dl>
</template>

<script lang="ts" setup>
interface EnvironmentInfoItem {
    label: string
    value: string
}
defineProps<{ environmentInfoList: EnvironmentInfoItem[] }>()
</script>

<style lang="scss" scoped>
.environment-info {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px 24px;
    margin: 0;
    padding: 0 20px 20px;
}
.environment-info > div {
    min-width: 0;
}
dt {
    color: var(--color-text-3);
    font-size: 12px;
}
dd {
    margin: 4px 0 0;
    color: var(--color-text-2);
    overflow-wrap: anywhere;
    line-height: 1.6;
}
@media (max-width: 640px) {
    .environment-info {
        grid-template-columns: 1fr;
        padding: 0 16px 16px;
    }
}
</style>
