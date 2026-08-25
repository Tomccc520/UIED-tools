<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <div class="banner-panel">
        <div class="banner-head">
            <div class="banner-copy">
                <a-typography-title :heading="5" style="margin-top: 0; margin-bottom: 0">
                    {{ periodGreeting }}，{{ adminName }}
                </a-typography-title>
                <a-typography-paragraph class="banner-desc">
                    先处理官网设置、工具主数据、AI 模型与商业交付链路，这四组是当前后台最核心的运营主线。
                </a-typography-paragraph>
            </div>
            <a-tag color="arcoblue" bordered>v{{ versionText }}</a-tag>
        </div>

        <div v-if="highlightList.length" class="banner-meta-list">
            <div v-for="item in highlightList" :key="item" class="banner-meta-item">
                <span class="banner-meta-dot"></span>
                <span class="banner-meta-text">{{ item }}</span>
            </div>
        </div>
        <a-divider class="panel-border" />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    adminName: string
    periodGreeting: string
    versionText: string
    highlightList: string[]
}>()
</script>

<style lang="scss" scoped>
.banner-panel {
    width: 100%;
    padding: 20px 20px 0 20px;
    background-color: var(--color-bg-2, #fff);
    border-radius: 4px 4px 0 0;
}

.banner-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.banner-copy {
    min-width: 0;
}

.banner-desc {
    margin-top: 8px;
    margin-bottom: 0 !important;
    color: var(--color-text-2, #4e5969);
    line-height: 1.8;
}

.banner-meta-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 16px;
}

.banner-meta-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.banner-meta-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: rgb(var(--arcoblue-6));
    flex-shrink: 0;
}

.banner-meta-text {
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-2, #4e5969);
}

@media (max-width: 640px) {
    .banner-head {
        flex-direction: column;
        align-items: flex-start;
    }

    .metric-panel {
        grid-template-columns: 1fr;
    }

    .metric-col,
    .metric-col:first-child,
    .metric-col-last {
        border-right: none;
        padding: 0 0 12px;
    }
}
</style>
