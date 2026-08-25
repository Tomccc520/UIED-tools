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
        title="服务支持"
        :header-style="{ paddingBottom: 0 }"
        :body-style="{ paddingTop: 0 }"
    >
        <template #extra>
            <a-link>官方渠道</a-link>
        </template>
        <div v-if="supportList.length" class="support-list">
            <div v-for="(item, index) in supportList" :key="index" class="support-item">
                <img class="support-image" :src="item.image" :alt="item.title" />
                <div class="support-copy">
                    <div class="support-title">{{ item.title }}</div>
                    <div class="support-desc">{{ item.desc }}</div>
                </div>
            </div>
        </div>
        <a-empty v-else description="暂无服务支持配置" />
    </a-card>
</template>

<script lang="ts" setup>
interface WorkbenchSupportItem {
    image: string
    title: string
    desc: string
}

const props = defineProps<{
    supportList: WorkbenchSupportItem[]
}>()
</script>

<style lang="scss" scoped>
.general-card {
    margin-top: 16px;
    min-height: 166px;
    border-radius: 4px;
}

.support-list {
    padding-top: 10px;
}

.support-item + .support-item {
    margin-top: 14px;
}

.support-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 4px;
    background: var(--color-fill-1, #f7f8fa);
}

.support-image {
    width: 68px;
    height: 68px;
    border-radius: 4px;
    object-fit: cover;
    background-color: var(--color-fill-2, #f2f3f5);
}

.support-copy {
    min-width: 0;
}

.support-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1, #1d2129);
}

.support-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-3, #86909c);
}
</style>
