<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-26
 */
-->
<template>
    <a-alert v-if="missingCount > 0" class="layout-module-warning" type="warning" show-icon>
        <div class="layout-module-warning-body">
            <div class="layout-module-warning-title">
                当前模块仍有 {{ missingCount }} 项待完善，建议先修复再保存发布。
            </div>
            <ul v-if="tips.length > 0" class="layout-module-warning-list">
                <li v-for="(tip, index) in tips" :key="`module-warning-tip-${index}`">{{ tip }}</li>
            </ul>
        </div>
    </a-alert>
</template>

<script lang="ts" setup>
interface Props {
    missingCount: number
    tips: string[]
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
.layout-module-warning {
    margin-bottom: 10px;
}

.layout-module-warning-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.layout-module-warning-title {
    font-size: 13px;
    color: var(--color-text-1, #1d2129);
}

.layout-module-warning-list {
    margin: 0;
    padding-left: 18px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3, #86909c);
}
</style>
