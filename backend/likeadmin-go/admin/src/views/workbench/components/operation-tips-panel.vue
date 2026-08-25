<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <a-card
        class="general-card"
        title="运营提醒"
        :header-style="{ paddingBottom: '0' }"
        :body-style="{ padding: '15px 20px 13px 20px' }"
    >
        <template #extra>
            <a-tag size="small" color="arcoblue" bordered>{{ tips.length }} 条</a-tag>
        </template>
        <a-list v-if="tips.length" :data="tips" :bordered="false" :split="true" class="ops-list">
            <template #item="{ item, index }">
                <a-list-item class="ops-list-item">
                    <div class="ops-item">
                        <a-tag size="small" :color="index === 0 ? 'arcoblue' : 'blue'">
                            {{ index === 0 ? '重点' : '建议' }}
                        </a-tag>
                        <span class="ops-text">{{ item }}</span>
                    </div>
                </a-list-item>
            </template>
        </a-list>
        <a-empty v-else description="暂无运营提醒" />
    </a-card>
</template>

<script lang="ts" setup>
const props = defineProps<{
    tips: string[]
}>()
</script>

<style lang="scss" scoped>
.general-card {
    min-height: 360px;
    border-radius: 4px;
}

.ops-list {
    padding-top: 2px;
}

.ops-list-item {
    padding-left: 0;
    padding-right: 0;
}

.ops-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
}

.ops-text {
    font-size: 13px;
    line-height: 1.65;
    color: var(--color-text-2, #4e5969);
}

@media (max-width: 1280px) {
    .general-card {
        min-height: auto;
    }
}
</style>
