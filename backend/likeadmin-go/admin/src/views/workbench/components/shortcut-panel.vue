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
        title="最近访问"
        :header-style="{ paddingBottom: '0' }"
        :body-style="{ paddingTop: '26px' }"
    >
        <a-row :gutter="8">
            <a-col
                v-for="item in items"
                :key="item.to"
                :xs="12"
                :sm="8"
                :md="8"
                :lg="8"
                :xl="8"
                :xxl="8"
                class="wrapper"
            >
                <router-link :to="item.to" class="wrapper-link" data-admin-smoke="workbench-shortcut-panel">
                    <div class="icon">{{ item.short }}</div>
                    <a-typography-paragraph class="text">
                        {{ item.label }}
                    </a-typography-paragraph>
                </router-link>
            </a-col>
        </a-row>
    </a-card>
</template>

<script lang="ts" setup>
interface ShortcutItem {
    label: string
    to: string
    short: string
}

const props = defineProps<{
    items: ShortcutItem[]
}>()
</script>

<style lang="scss" scoped>
.general-card {
    border-radius: 4px;
}

.wrapper {
    margin-bottom: 16px;
}

.wrapper-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    cursor: pointer;
}

.icon {
    display: flex;
    width: 32px;
    height: 32px;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    background-color: rgb(var(--gray-1));
    color: rgb(var(--gray-8));
    font-size: 12px;
    font-weight: 700;
    transition: all 0.2s ease;
    margin-bottom: 4px;
}

.text {
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
    color: rgb(var(--gray-8));
    margin-bottom: 0 !important;
}

.wrapper-link:hover {
    .icon {
        color: rgb(var(--arcoblue-6));
        background-color: #e8f3ff;
    }

    .text {
        color: rgb(var(--arcoblue-6));
    }
}

:deep(.arco-card-header-title) {
    line-height: inherit;
}

@media (max-width: 768px) {
    .wrapper {
        margin-bottom: 12px;
    }
}
</style>
