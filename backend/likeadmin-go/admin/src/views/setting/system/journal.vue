<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="journal-page">
        <a-page-header title="系统日志" subtitle="查看后台访问日志、来源 IP 和错误信息，便于排查运行问题。">
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>{{ visitTypeLabel }}</a-tag>
                    <a-button data-admin-smoke="journal-query" @click="resetPage">查询</a-button>
                    <a-button data-admin-smoke="journal-reset" @click="resetParams">重置筛选</a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 2, lg: 4 }" :col-gap="12" :row-gap="12" class="journal-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">日志总数</div>
                    <div class="metric-value">{{ pager.count }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">当前页</div>
                    <div class="metric-value">{{ pager.lists.length }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">错误日志</div>
                    <div class="metric-value is-warning">{{ errorCount }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">独立来源 IP</div>
                    <div class="metric-value">{{ ipCount }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-card class="general-card" title="系统日志列表" :bordered="false">
            <a-grid :cols="{ xs: 1, md: 12 }" :col-gap="12" :row-gap="12" class="journal-filter-grid">
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <a-input
                        v-model="formData.username"
                        placeholder="管理员账号"
                        allow-clear
                        @press-enter="resetPage"
                        @clear="resetPage"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <a-select v-model="formData.type" placeholder="访问方式" allow-clear>
                        <a-option
                            v-for="item in visitType"
                            :key="item.value || 'all'"
                            :label="item.label"
                            :value="item.value"
                        />
                    </a-select>
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <a-input
                        v-model="formData.ip"
                        placeholder="来源 IP"
                        allow-clear
                        @press-enter="resetPage"
                        @clear="resetPage"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 3 }">
                    <a-input
                        v-model="formData.url"
                        placeholder="访问链接"
                        allow-clear
                        @press-enter="resetPage"
                        @clear="resetPage"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 6 }">
                    <daterange-picker
                        v-model:startTime="formData.startTime"
                        v-model:endTime="formData.endTime"
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 6 }">
                    <div class="filter-result">匹配 {{ pager.count }} 项 / 当前页 {{ pager.lists.length }} 项</div>
                </a-grid-item>
            </a-grid>


            <a-table
                class="mt-4"
                :data="pager.lists"
                :columns="journalColumns"
                :loading="pager.loading"
                :pagination="false"
                :bordered="false"
                row-key="id"
                :scroll="{ x: 1420 }"
            >
                <template #empty>
                    <a-empty :description="journalEmptyDescription">
                        <template #extra>
                            <a-space>
                                <a-button @click="resetParams">重置筛选</a-button>
                                <a-button @click="resetPage">重新加载</a-button>
                            </a-space>
                        </template>
                    </a-empty>
                </template>
            </a-table>

            <div class="flex mt-4 justify-end">
                <pagination v-model="pager" @change="getLists" />
            </div>
        </a-card>
    </div>
</template>

<script setup lang="ts" name="journal">
import type { TableColumnData } from '@arco-design/web-vue'
import { systemLogLists } from '@/api/setting/system'
import { usePaging } from '@/hooks/usePaging'

const formData = reactive({
    username: '',
    url: '',
    ip: '',
    type: '',
    startTime: '',
    endTime: ''
})

const visitType = ref<Array<{ label: string; value: string }>>([
    {
        label: '全部',
        value: ''
    },
    {
        label: 'GET',
        value: 'GET'
    },
    {
        label: 'POST',
        value: 'POST'
    }
])

/**
 * 函数说明：系统日志表格列定义，使用 columns 渲染，避免列子组件模式在当前壳布局下出现空表格。
 */
const journalColumns: TableColumnData[] = [
    { title: '记录ID', dataIndex: 'id', width: 100 },
    { title: '操作', dataIndex: 'title', minWidth: 140, ellipsis: true, tooltip: true },
    { title: '管理员', dataIndex: 'username', minWidth: 120, ellipsis: true, tooltip: true },
    { title: '访问链接', dataIndex: 'url', minWidth: 240, ellipsis: true, tooltip: true },
    { title: '访问方式', dataIndex: 'type', minWidth: 100 },
    { title: '来源IP', dataIndex: 'ip', minWidth: 160 },
    { title: '错误信息', dataIndex: 'error', minWidth: 220, ellipsis: true, tooltip: true },
    { title: '执行耗时(毫秒)', dataIndex: 'taskTime', minWidth: 130 },
    { title: '日志时间', dataIndex: 'createTime', minWidth: 180 }
]

/**
 * 函数说明：初始化日志分页查询能力，复用原有接口参数结构。
 */
const { pager, getLists, resetParams, resetPage } = usePaging({
    fetchFun: systemLogLists,
    params: formData
})

/**
 * 函数说明：统计当前页错误日志数量和独立 IP 数量，用于工作区概览。
 */
const pageMetrics = computed(() => {
    const ipSet = new Set<string>()
    let errorTotal = 0

    for (const item of pager.lists as any[]) {
        if (item?.ip) {
            ipSet.add(String(item.ip))
        }
        if (String(item?.error || '').trim()) {
            errorTotal += 1
        }
    }

    return {
        errorTotal,
        ipTotal: ipSet.size
    }
})

const errorCount = computed(() => pageMetrics.value.errorTotal)
const ipCount = computed(() => pageMetrics.value.ipTotal)
const visitTypeLabel = computed(() => visitType.value.find((item) => item.value === formData.type)?.label || '全部方式')
const journalTimeRangeLabel = computed(() => {
    if (!formData.startTime && !formData.endTime) {
        return '全部时间'
    }
    return `${formData.startTime || '开始'} 至 ${formData.endTime || '结束'}`
})
const journalEmptyDescription = computed(() => {
    return Number(pager.count || 0)
        ? '当前页暂无日志数据，请切换分页后重试。'
        : '没有匹配的系统日志，请检查筛选条件。'
})

getLists()
</script>

<style lang="scss" scoped>
.journal-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.journal-metrics,
.journal-filter-grid {
    width: 100%;
}

.metric-card {
    border-radius: 16px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.metric-label {
    font-size: 12px;
    color: #86909c;
}

.metric-value {
    margin-top: 8px;
    font-size: 30px;
    font-weight: 700;
    color: #1d2129;
}

.metric-value.is-warning {
    color: #ff7d00;
}

.journal-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
    gap: 16px;
}

.journal-workspace__main,
.journal-workspace__aside {
    padding: 20px 22px;
    border-radius: 16px;
    background: #fff;
}

.journal-workspace__eyebrow {
    font-size: 12px;
    font-weight: 600;
    color: #4e5969;
}

.journal-workspace__title {
    margin-top: 10px;
    font-size: 22px;
    line-height: 1.4;
    font-weight: 700;
    color: #1d2129;
}

.journal-workspace__desc {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.7;
    color: #4e5969;
}

.journal-workspace__meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
}

.journal-workspace__meta-item,
.journal-workspace__checklist-item {
    padding: 14px 16px;
    border-radius: 14px;
    background: #f7f8fa;
}

.journal-workspace__meta-item span,
.journal-workspace__checklist-label {
    display: block;
    font-size: 12px;
    color: #86909c;
}

.journal-workspace__meta-item strong,
.journal-workspace__checklist-value {
    display: block;
    margin-top: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #1d2129;
}

.journal-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: #1d2129;
}

.journal-workspace__checklist {
    display: grid;
    gap: 12px;
    margin-top: 14px;
}

.journal-workspace__checklist-item.is-ready {
    background: #effff6;
}

.journal-workspace__checklist-item.is-warning {
    background: #fff7e8;
}

.journal-workspace__checklist-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: #4e5969;
}

.journal-workspace__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
}

.filter-result {
    display: flex;
    align-items: center;
    min-height: 32px;
    color: #4e5969;
    font-size: 13px;
}

.journal-filter-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 16px;
    padding: 14px 16px;
    border-radius: 14px;
    background: #f7f8fa;
}

.journal-filter-strip__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.journal-filter-strip__chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: #fff;
    font-size: 12px;
    color: #4e5969;
}

.journal-filter-strip__chip strong {
    color: #1d2129;
}

.journal-filter-strip__hint {
    min-width: 240px;
    text-align: right;
}

.journal-filter-strip__hint-label {
    font-size: 12px;
    color: #86909c;
}

.journal-filter-strip__hint-text {
    margin-top: 4px;
    font-size: 13px;
    color: #1d2129;
}

@media (max-width: 1200px) {
    .journal-workspace {
        grid-template-columns: 1fr;
    }

    .journal-workspace__meta {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .journal-filter-strip {
        flex-direction: column;
        align-items: flex-start;
    }

    .journal-filter-strip__hint {
        min-width: 0;
        text-align: left;
    }
}

@media (max-width: 768px) {
    .journal-workspace__meta {
        grid-template-columns: 1fr;
    }
}
</style>
