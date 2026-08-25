<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-26
 */
-->
<template>
    <a-collapse v-model:active-key="innerActiveKeys" class="layout-ops-collapse" :bordered="false">
        <a-collapse-item key="quick_actions">
            <template #header>
                <div class="collapse-title-row">
                    <span>快捷操作</span>
                    <a-tag color="arcoblue" bordered>高频</a-tag>
                </div>
            </template>
            <div class="layout-ops-context">
                <a-space size="mini" wrap>
                    <a-tag color="arcoblue" bordered>当前模块：{{ moduleLabel || '未选择' }}</a-tag>
                    <a-tag :color="missingCount > 0 ? 'orange' : 'green'" bordered>
                        待完善 {{ missingCount }}
                    </a-tag>
                    <a-tag :color="hasUnsavedChanges ? 'orange' : 'green'" bordered>
                        {{ hasUnsavedChanges ? '待发布' : '已同步' }}
                    </a-tag>
                </a-space>
            </div>
            <div class="layout-ops-toolbar">
                <div class="layout-ops-left">
                    <a-button @click="emit('go-hot-tools')">热门工具配置</a-button>
                    <a-button @click="emit('go-icon-library')">图标库管理</a-button>
                    <a-button @click="emit('preview')">前端预览</a-button>
                    <a-button @click="emit('health-check')">一键体检</a-button>
                    <a-button status="warning" @click="emit('restore-default')"
                        >恢复当前模块默认</a-button
                    >
                </div>
                <div class="layout-ops-right">
                    <a-button type="primary" :loading="isSubmitting" @click="emit('submit')"
                        >保存配置</a-button
                    >
                    <a-dropdown trigger="click">
                        <a-button>更多操作</a-button>
                        <template #content>
                            <a-doption @click="emit('cleanup')">一键清理空白项</a-doption>
                            <a-doption @click="emit('sync-catalog')">同步分类菜单</a-doption>
                            <a-doption @click="emit('export-json')">导出配置JSON</a-doption>
                            <a-doption @click="emit('import-json')">导入配置JSON</a-doption>
                        </template>
                    </a-dropdown>
                    <span class="layout-state-tip" v-if="lastSavedAt"
                        >最近保存：{{ lastSavedAt }}</span
                    >
                </div>
            </div>
        </a-collapse-item>
        <a-collapse-item key="operation_guide">
            <template #header>
                <div class="collapse-title-row">
                    <span>操作指南</span>
                    <a-tag color="green" bordered>推荐流程</a-tag>
                </div>
            </template>
            <ol class="layout-guide-list">
                <li>先点下方模块卡片进入对应模块，补齐“待完善项”。</li>
                <li>编辑后执行“一键体检”，先解决重复链接和分类不匹配问题。</li>
                <li>确认无误后点击“保存配置”，再去前端页面核对展示。</li>
            </ol>
        </a-collapse-item>
    </a-collapse>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
    modelValue: Array<string | number>
    lastSavedAt?: string
    isSubmitting: boolean
    moduleLabel?: string
    missingCount?: number
    hasUnsavedChanges?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    lastSavedAt: '',
    moduleLabel: '',
    missingCount: 0,
    hasUnsavedChanges: false
})

const emit = defineEmits<{
    (event: 'update:modelValue', value: Array<string | number>): void
    (event: 'go-hot-tools'): void
    (event: 'go-icon-library'): void
    (event: 'preview'): void
    (event: 'health-check'): void
    (event: 'restore-default'): void
    (event: 'submit'): void
    (event: 'cleanup'): void
    (event: 'sync-catalog'): void
    (event: 'export-json'): void
    (event: 'import-json'): void
}>()

/**
 * 函数说明：与父组件同步折叠面板状态，确保刷新后保持用户当前工作上下文。
 */
const innerActiveKeys = computed({
    get() {
        return props.modelValue
    },
    set(value: Array<string | number>) {
        emit('update:modelValue', value)
    }
})
</script>

<style lang="scss" scoped>
.layout-ops-collapse {
    margin-bottom: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 12px;
    background: #fff;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);

    :deep(.arco-collapse-item-header) {
        min-height: 44px;
        padding: 0 14px;
        background: #fafbff;
    }

    :deep(.arco-collapse-item-content-box) {
        padding: 12px 14px;
    }
}

.collapse-title-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.layout-guide-list {
    margin: 0;
    padding-left: 20px;
    font-size: 13px;
    line-height: 1.9;
    color: var(--color-text-2, #4e5969);
}

.layout-ops-context {
    margin-bottom: 10px;
}

.layout-ops-toolbar {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}

.layout-ops-left {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.layout-ops-right {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

.layout-state-tip {
    margin-left: auto;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

@media (max-width: 1080px) {
    .layout-ops-toolbar {
        flex-direction: column;
        align-items: stretch;
    }

    .layout-ops-right {
        margin-left: 0;
        justify-content: space-between;
    }
}
</style>
