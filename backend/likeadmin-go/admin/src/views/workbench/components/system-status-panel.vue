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
        title="系统信息"
        :header-style="{ paddingBottom: 0 }"
        :body-style="{ paddingTop: 0 }"
    >
        <a-descriptions :column="1" size="large" :label-style="{ width: '84px' }" class="env-descriptions">
            <a-descriptions-item
                v-for="item in environmentInfoList"
                :key="item.label"
                :label="item.label"
            >
                {{ item.value }}
            </a-descriptions-item>
        </a-descriptions>
        <div class="status-progress-list">
            <div v-for="item in statusProgressList" :key="item.label" class="status-progress-item">
                <div class="status-progress-head">
                    <span>{{ item.label }}</span>
                    <span>{{ item.percent }}%</span>
                </div>
                <a-progress :percent="item.percent" :show-text="false" :stroke-width="8" />
            </div>
        </div>
    </a-card>
</template>

<script lang="ts" setup>
interface EnvironmentInfoItem {
    label: string
    value: string
}

interface StatusProgressItem {
    label: string
    percent: number
}

const props = defineProps<{
    environmentInfoList: EnvironmentInfoItem[]
    statusProgressList: StatusProgressItem[]
}>()
</script>

<style lang="scss" scoped>
.general-card {
    margin-top: 16px;
    border-radius: 4px;
}

.env-descriptions {
    padding-top: 8px;
}

.status-progress-list {
    padding: 8px 0 0;
}

.status-progress-item + .status-progress-item {
    margin-top: 12px;
}

.status-progress-item {
    padding: 10px 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 4px;
    background: #fff;
}

.status-progress-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--color-text-2, #4e5969);
}
</style>
