<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-26
 */
-->
<template>
    <div class="layout-module-panel">
        <div class="layout-module-toolbar">
            <a-radio-group
                v-model="innerGroupView"
                type="button"
                size="small"
                class="module-group-switch"
            >
                <a-radio value="all">全部模块</a-radio>
                <a-radio value="structure">核心布局</a-radio>
                <a-radio value="content">内容运营</a-radio>
                <a-radio value="ai">AI专页</a-radio>
            </a-radio-group>
            <a-input-search
                v-model="innerKeyword"
                placeholder="搜索模块名称，如：页脚 / AI工具箱 / 侧边栏"
                allow-clear
            />
            <a-space align="center">
                <a-switch v-model="innerOnlyMissing" />
                <span class="module-toolbar-label">仅看待完善模块</span>
            </a-space>
        </div>
        <div class="layout-module-status">
            <a-space size="mini" wrap>
                <a-tag color="arcoblue" bordered>匹配模块 {{ modules.length }}</a-tag>
                <a-tag :color="totalMissingCount > 0 ? 'orange' : 'green'" bordered>
                    待完善 {{ totalMissingCount }}
                </a-tag>
            </a-space>
            <a-button
                v-if="hasFilterCondition"
                type="text"
                size="mini"
                class="module-reset-btn"
                @click="resetFilters"
            >
                重置筛选
            </a-button>
        </div>

        <div class="layout-module-overview">
            <button
                v-for="item in modules"
                :key="item.key"
                type="button"
                class="module-overview-card"
                :class="{ 'is-active': activeKey === item.key }"
                @click="emit('select', item.key)"
            >
                <div class="module-overview-title-row">
                    <span class="module-overview-title">{{ item.label }}</span>
                    <a-tag
                        :color="item.missingCount === 0 ? 'green' : 'orange'"
                        size="small"
                        bordered
                    >
                        待完善 {{ item.missingCount }}
                    </a-tag>
                </div>
                <div class="module-overview-desc">{{ item.description }}</div>
                <div class="module-overview-meta">已配置 {{ item.configuredCount }}</div>
            </button>
        </div>

        <a-empty
            v-if="modules.length === 0"
            class="layout-module-empty"
            description="暂无匹配模块，请调整搜索词或筛选条件"
        />
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface ModuleOverviewItem {
    key: string
    label: string
    description: string
    configuredCount: number
    missingCount: number
}

interface Props {
    modules: ModuleOverviewItem[]
    activeKey: string
    groupView: 'all' | 'structure' | 'content' | 'ai'
    keyword: string
    onlyMissing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (event: 'update:groupView', value: 'all' | 'structure' | 'content' | 'ai'): void
    (event: 'update:keyword', value: string): void
    (event: 'update:onlyMissing', value: boolean): void
    (event: 'select', value: string): void
}>()

/**
 * 函数说明：同步分组筛选状态，保持父组件与子组件双向绑定一致。
 */
const innerGroupView = computed({
    get() {
        return props.groupView
    },
    set(value: 'all' | 'structure' | 'content' | 'ai') {
        emit('update:groupView', value)
    }
})

/**
 * 函数说明：同步模块搜索关键词，统一交给父组件执行过滤逻辑。
 */
const innerKeyword = computed({
    get() {
        return props.keyword
    },
    set(value: string) {
        emit('update:keyword', value)
    }
})

/**
 * 函数说明：同步“仅看待完善模块”状态，保持运营筛选连续性。
 */
const innerOnlyMissing = computed({
    get() {
        return props.onlyMissing
    },
    set(value: boolean) {
        emit('update:onlyMissing', value)
    }
})

/**
 * 函数说明：统计当前筛选结果中的待完善总数，给运营提供即时风险感知。
 */
const totalMissingCount = computed(() => {
    return props.modules.reduce(
        (total, moduleItem) => total + Number(moduleItem.missingCount || 0),
        0
    )
})

/**
 * 函数说明：判断是否存在筛选条件，决定是否展示“重置筛选”动作。
 */
const hasFilterCondition = computed(() => {
    return props.groupView !== 'all' || Boolean(props.keyword.trim()) || props.onlyMissing
})

/**
 * 函数说明：一键恢复模块筛选默认状态，降低运营回退筛选成本。
 */
const resetFilters = () => {
    emit('update:groupView', 'all')
    emit('update:keyword', '')
    emit('update:onlyMissing', false)
}
</script>

<style lang="scss" scoped>
.layout-module-panel {
    margin-bottom: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 12px;
    background: #fff;
    padding: 10px 12px;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
}

.layout-module-toolbar {
    margin-bottom: 10px;
    display: grid;
    grid-template-columns: minmax(0, auto) minmax(240px, 1fr) auto;
    align-items: center;
    gap: 10px;
}

.module-group-switch {
    :deep(.arco-radio-button-content) {
        min-width: 82px;
        text-align: center;
    }
}

.module-toolbar-label {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.layout-module-status {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

.module-reset-btn {
    color: var(--color-text-3, #86909c);
}

.layout-module-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 10px;
}

.module-overview-card {
    width: 100%;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 10px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
    padding: 10px 12px;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.module-overview-card:hover {
    border-color: var(--color-primary-light-3, rgba(108, 84, 255, 0.24));
    box-shadow: 0 6px 16px rgba(108, 84, 255, 0.08);
}

.module-overview-card.is-active {
    border-color: var(--color-primary-6, #6c54ff);
    background: var(--color-primary-light-1, rgba(108, 84, 255, 0.08));
}

.module-overview-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.module-overview-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1, #1d2129);
}

.module-overview-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-text-3, #86909c);
}

.module-overview-meta {
    margin-top: 6px;
    font-size: 12px;
    color: var(--color-text-1, #1d2129);
}

.layout-module-empty {
    margin-top: 4px;
}

@media (max-width: 1280px) {
    .layout-module-toolbar {
        grid-template-columns: 1fr 1fr;
        align-items: stretch;
    }

    .module-group-switch {
        grid-column: 1 / -1;
    }
}

@media (max-width: 920px) {
    .layout-module-toolbar {
        grid-template-columns: 1fr;
        align-items: stretch;
    }

    .layout-module-status {
        flex-direction: column;
        align-items: flex-start;
    }

    .layout-module-overview {
        grid-template-columns: 1fr;
    }
}
</style>
