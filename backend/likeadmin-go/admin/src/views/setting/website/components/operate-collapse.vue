<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-25
 */
-->
<template>
    <a-collapse v-model:active-key="innerActiveKeys" class="ops-collapse" :bordered="false">
        <a-collapse-item v-if="hasQuickActions" key="quick_actions">
            <template #header>
                <div class="collapse-title-row">
                    <span>快捷操作</span>
                    <a-tag color="arcoblue" bordered>高频</a-tag>
                </div>
            </template>
            <div class="ops-toolbar">
                <div class="ops-left">
                    <slot name="left-actions" />
                </div>
                <div class="ops-right">
                    <slot name="right-actions" />
                    <span class="ops-last-saved" v-if="lastSavedAt"
                        >最近保存：{{ lastSavedAt }}</span
                    >
                </div>
            </div>
        </a-collapse-item>

        <a-collapse-item v-if="showValidation" key="validation_tips">
            <template #header>
                <div class="collapse-title-row">
                    <span>校验提示</span>
                    <a-tag :color="validationTagColor" bordered>
                        {{ validationTagText }}
                    </a-tag>
                </div>
            </template>
            <ul class="ops-guide-list">
                <li v-if="validationTips.length === 0">当前未发现校验问题，可直接保存发布。</li>
                <li v-for="(item, index) in validationTips" :key="`validation-tip-${index}`">
                    {{ item }}
                </li>
            </ul>
        </a-collapse-item>

        <a-collapse-item key="operation_guide">
            <template #header>
                <div class="collapse-title-row">
                    <span>操作指南</span>
                    <a-tag color="green" bordered>推荐流程</a-tag>
                </div>
            </template>
            <ol class="ops-guide-list">
                <li v-for="(item, index) in guideItems" :key="`guide-item-${index}`">{{ item }}</li>
            </ol>
        </a-collapse-item>
    </a-collapse>
</template>

<script lang="ts" setup>
interface Props {
    modelValue: Array<string | number>
    guideItems: string[]
    validationTips: string[]
    lastSavedAt?: string
    showValidation?: boolean
    showQuickActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    lastSavedAt: '',
    showValidation: true,
    showQuickActions: true
})

const emit = defineEmits<{
    (event: 'update:modelValue', value: Array<string | number>): void
}>()
const slots = useSlots()

/**
 * 函数说明：同步外部折叠面板状态，保证统一运营组件可被页面双向绑定。
 */
const innerActiveKeys = computed<Array<string | number>>({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

/**
 * 函数说明：判断当前页是否需要展示快捷操作区，避免页面内出现重复动作条。
 */
const hasQuickActions = computed(() => {
    if (!props.showQuickActions) {
        return false
    }

    return Boolean(slots['left-actions'] || slots['right-actions'] || props.lastSavedAt)
})

/**
 * 函数说明：根据校验提示数量输出标签颜色，帮助运营快速识别风险状态。
 */
const validationTagColor = computed(() => {
    return props.validationTips.length > 0 ? 'orange' : 'green'
})

/**
 * 函数说明：输出校验状态文案，统一官网设置页面的提示口径。
 */
const validationTagText = computed(() => {
    return props.validationTips.length > 0 ? `待修复 ${props.validationTips.length}` : '已通过'
})
</script>

<style lang="scss" scoped>
.ops-collapse {
    margin-top: 12px;
    border: 1px solid var(--color-border-2);
    border-radius: 10px;
    background: #fff;
    overflow: hidden;
}

.collapse-title-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.ops-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
}

.ops-left {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.ops-right {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

.ops-last-saved {
    font-size: 12px;
    color: var(--color-text-3);
}

.ops-guide-list {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    line-height: 1.9;
    color: var(--color-text-2);
}

@media (max-width: 920px) {
    .ops-toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .ops-right {
        margin-left: 0;
        justify-content: space-between;
    }
}
</style>
