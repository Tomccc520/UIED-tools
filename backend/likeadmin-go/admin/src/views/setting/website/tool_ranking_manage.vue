<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
 */
-->
<template>
    <div class="website-tool-ranking-manage pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 热榜管理">
            <template #subtitle>
                按站内真实点击量排序，并补充开始处理、成功与下载数据，方便运营判断哪些工具值得优先曝光。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag color="arcoblue" bordered>站内聚合</a-tag>
                        <a-tag color="green" bordered>实时可查</a-tag>
                        <a-tag color="orange" bordered>工具 {{ summary.toolCount }}</a-tag>
                    </div>
                    <a-button size="small" @click="loadData">刷新数据</a-button>
                    <a-button size="small" @click="handleExport">导出 CSV</a-button>
                    <a-button size="small" @click="openHotRankingPreview">前端预览</a-button>
                    <a-button size="small" type="outline" @click="goConfigPage">榜单配置</a-button>
                </div>
            </template>
        </a-page-header>

        <a-card class="page-card pro-panel-card" :bordered="false">


            <div class="filter-bar mt-4">
                <a-input
                    v-model="queryParams.keyword"
                    allow-clear
                    placeholder="搜索工具标题 / toolKey / 链接"
                    @press-enter="handleSearch"
                />
                <a-input
                    v-model="queryParams.cateTitle"
                    allow-clear
                    placeholder="筛选分类，如：图片处理"
                    @press-enter="handleSearch"
                />
                <a-select v-model="queryParams.period" :options="periodOptions" />
                <a-select v-model="queryParams.sortBy" :options="sortOptions" />
                <div class="filter-bar__actions">
                    <a-button type="primary" @click="handleSearch">查询</a-button>
                    <a-button @click="handleReset">重置</a-button>
                </div>
            </div>

            <div class="result-summary mt-4">
                <a-tag color="arcoblue" bordered>当前结果 {{ pagination.count }} 条</a-tag>
                <a-tag color="green" bordered>周期 {{ resolvePeriodLabel(queryParams.period) }}</a-tag>
                <a-tag color="orange" bordered>排序 {{ resolveSortLabel(queryParams.sortBy) }}</a-tag>
                <a-tag v-if="queryParams.keyword" color="purple" bordered>
                    关键词 {{ queryParams.keyword }}
                </a-tag>
                <a-tag v-if="queryParams.cateTitle" color="magenta" bordered>
                    分类 {{ queryParams.cateTitle }}
                </a-tag>
            </div>

            <section class="trend-panel mt-4">
                <div class="trend-panel__head">
                    <div>
                        <div class="trend-panel__title">热榜趋势</div>
                        <div class="trend-panel__desc">{{ trendSummaryText }}</div>
                    </div>
                    <div class="trend-panel__meta">
                        <a-tag color="arcoblue" bordered>{{ resolvePeriodLabel(queryParams.period) }}</a-tag>
                        <a-tag color="gray" bordered>{{ trendRangeText }}</a-tag>
                    </div>
                </div>
                <div v-if="trendData.labels.length > 0" class="trend-panel__chart">
                    <v-charts autoresize :option="trendChartOption" />
                </div>
                <a-empty
                    v-else
                    class="trend-panel__empty"
                    description="当前筛选条件下还没有趋势数据，先让工具页产生真实点击或切换其它周期查看。"
                />
            </section>

            <a-table
                class="mt-4"
                row-key="toolKey"
                :loading="loading"
                :data="rankingList"
                :pagination="false"
                :bordered="false"
                stripe
            >
                <template #columns>
                    <a-table-column title="排名" :width="80">
                        <template #cell="{ record }">
                            <a-tag :color="record.rank <= 3 ? 'orangered' : 'arcoblue'" bordered>
                                #{{ record.rank }}
                            </a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="工具信息" :width="360">
                        <template #cell="{ record }">
                            <div class="tool-cell">
                                <div class="tool-cell__title">{{ record.toolTitle || record.toolKey }}</div>
                                <div class="tool-cell__sub">{{ record.toolKey }}</div>
                            </div>
                        </template>
                    </a-table-column>
                    <a-table-column title="所属分类" data-index="cateTitle" :width="140">
                        <template #cell="{ record }">
                            <a-tag color="gray" bordered>{{ record.cateTitle || '未归类' }}</a-tag>
                        </template>
                    </a-table-column>
                    <a-table-column title="点击" data-index="viewCount" :width="100" />
                    <a-table-column title="开始" data-index="startCount" :width="100" />
                    <a-table-column title="成功" data-index="successCount" :width="100" />
                    <a-table-column title="下载" data-index="downloadCount" :width="100" />
                    <a-table-column title="综合分" data-index="score" :width="110" />
                    <a-table-column title="工具链接">
                        <template #cell="{ record }">
                            <a-link @click="openToolLink(record.toolUrl)">
                                {{ record.toolUrl || '未配置链接' }}
                            </a-link>
                        </template>
                    </a-table-column>
                </template>
                <template #empty>
                    <a-empty description="当前筛选条件下还没有热榜数据，先访问前台工具页积累埋点，或切换到其它周期查看。" />
                </template>
            </a-table>

            <div class="table-footer mt-4">
                <a-pagination
                    :current="queryParams.pageNo"
                    :page-size="queryParams.pageSize"
                    :total="pagination.count"
                    show-total
                    show-jumper
                    show-page-size
                    :page-size-options="['10', '20', '50']"
                    @change="handlePageChange"
                    @page-size-change="handlePageSizeChange"
                />
            </div>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import vCharts from 'vue-echarts'
import { useRouter } from 'vue-router'
import feedback from '@/utils/feedback'
import { streamFileDownload } from '@/utils/file'
import {
    exportToolRankingManage,
    getToolRankingManageList,
    getToolRankingManageSummary,
    getToolRankingManageTrend,
    type ToolRankingPeriod,
    type ToolRankingSortBy,
    type ToolRankingManageTrend,
    type ToolRankingExportRow
} from '@/api/setting/tool_ranking'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'

interface ToolRankingManageRow {
    rank: number
    toolKey: string
    toolTitle: string
    toolUrl: string
    cateTitle: string
    viewCount: number
    startCount: number
    successCount: number
    downloadCount: number
    score: number
}

interface ToolRankingManageSummaryState {
    period: ToolRankingPeriod
    toolCount: number
    cateCount: number
    viewCount: number
    startCount: number
    successCount: number
    downloadCount: number
    champion: Partial<ToolRankingManageRow>
    updatedAt: number
}

const router = useRouter()
const loading = ref(false)
const rankingList = ref<ToolRankingManageRow[]>([])
const summary = reactive<ToolRankingManageSummaryState>({
    period: 'week',
    toolCount: 0,
    cateCount: 0,
    viewCount: 0,
    startCount: 0,
    successCount: 0,
    downloadCount: 0,
    champion: {},
    updatedAt: 0
})
const pagination = reactive({
    count: 0
})
const trendData = reactive<ToolRankingManageTrend>({
    period: 'week',
    sortBy: 'view',
    startDate: '',
    endDate: '',
    labels: [],
    viewSeries: [],
    startSeries: [],
    successSeries: [],
    downloadSeries: [],
    scoreSeries: []
})
const queryParams = reactive({
    pageNo: 1,
    pageSize: 20,
    keyword: '',
    cateTitle: '',
    period: 'week' as ToolRankingPeriod,
    sortBy: 'view' as ToolRankingSortBy
})

const periodOptions = [
    { label: '日榜', value: 'day' },
    { label: '周榜', value: 'week' },
    { label: '月榜', value: 'month' },
    { label: '总榜', value: 'all' }
]

const sortOptions = [
    { label: '访问量', value: 'view' },
    { label: '综合分', value: 'score' },
    { label: '开始处理', value: 'start' },
    { label: '成功次数', value: 'success' },
    { label: '下载次数', value: 'download' }
]

/**
 * 函数说明：格式化时间戳，供热榜管理页展示最近刷新时间。
 */
const formatDateTimeText = (timestamp: number): string => {
    if (!timestamp) {
        return '刚刚'
    }
    const date = new Date(timestamp * 1000)
    if (Number.isNaN(date.getTime())) {
        return '刚刚'
    }
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
        date.getHours()
    )}:${pad(date.getMinutes())}`
}

/**
 * 函数说明：输出趋势图时间范围文案，避免直接显示空白日期区间。
 */
const trendRangeText = computed(() => {
    if (trendData.startDate && trendData.endDate) {
        return `${trendData.startDate} 至 ${trendData.endDate}`
    }
    if (trendData.labels.length > 0) {
        return `${trendData.labels[0]} 起`
    }
    return '暂无趋势区间'
})

/**
 * 函数说明：转换周期文案，统一在筛选条和工作区内复用。
 */
const resolvePeriodLabel = (period: ToolRankingPeriod): string => {
    return periodOptions.find((item) => item.value === period)?.label || '周榜'
}

/**
 * 函数说明：转换排序文案，统一在筛选条和工作区内复用。
 */
const resolveSortLabel = (sortBy: ToolRankingSortBy): string => {
    return sortOptions.find((item) => item.value === sortBy)?.label || '访问量'
}

/**
 * 函数说明：输出趋势图辅助说明，帮助运营理解当前图表和列表共用的筛选口径。
 */
const trendSummaryText = computed(() => {
    return `当前趋势按“${resolvePeriodLabel(queryParams.period)} + ${resolveSortLabel(queryParams.sortBy)}”同步筛选，可同时观察点击、开始、成功、下载与综合分的变化。`
})

/**
 * 函数说明：构建趋势图配置，统一热榜管理页折线图的配色、坐标和图例格式。
 */
const trendChartOption = computed(() => {
    return {
        color: ['#4f46e5', '#0ea5e9', '#16a34a', '#f59e0b', '#7c3aed'],
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            top: 0,
            left: 'left',
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
                color: '#475569'
            }
        },
        grid: {
            top: 52,
            left: 12,
            right: 12,
            bottom: 12,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: trendData.labels,
            axisLabel: {
                color: '#64748b'
            },
            axisLine: {
                lineStyle: {
                    color: '#e2e8f0'
                }
            }
        },
        yAxis: {
            type: 'value',
            splitLine: {
                lineStyle: {
                    color: '#eef2f7'
                }
            },
            axisLabel: {
                color: '#64748b'
            }
        },
        series: [
            {
                name: '点击',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                data: trendData.viewSeries
            },
            {
                name: '开始',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                data: trendData.startSeries
            },
            {
                name: '成功',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                data: trendData.successSeries
            },
            {
                name: '下载',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                data: trendData.downloadSeries
            },
            {
                name: '综合分',
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                data: trendData.scoreSeries
            }
        ]
    }
})

/**
 * 函数说明：将导出字段安全转成 CSV 单元格，避免逗号和引号破坏导出文件格式。
 */
const escapeToolRankingCsvCell = (value: unknown): string => {
    const normalizedText = String(value ?? '').replace(/"/g, '""')
    return `"${normalizedText}"`
}

/**
 * 函数说明：将热榜导出结果转换成 CSV 文本，供后台直接下载使用。
 */
const buildToolRankingCsvText = (rowList: ToolRankingExportRow[]): string => {
    const header = ['排名', '工具标题', 'toolKey', '工具链接', '所属分类', '点击', '开始', '成功', '下载', '综合分']
    const lines = [header.map(escapeToolRankingCsvCell).join(',')]
    rowList.forEach((item) => {
        lines.push(
            [
                item.rank,
                item.toolTitle,
                item.toolKey,
                item.toolUrl,
                item.cateTitle,
                item.viewCount,
                item.startCount,
                item.successCount,
                item.downloadCount,
                item.score
            ]
                .map(escapeToolRankingCsvCell)
                .join(',')
        )
    })
    return `\uFEFF${lines.join('\n')}`
}

/**
 * 函数说明：读取热榜概览与列表数据，保持页面顶部统计和表格结果一致。
 */
const loadData = async () => {
    loading.value = true
    try {
        const [summaryData, listData, trendResult] = await Promise.all([
            getToolRankingManageSummary(),
            getToolRankingManageList({ ...queryParams }),
            getToolRankingManageTrend({ ...queryParams })
        ])
        summary.period = (summaryData.period || 'week') as ToolRankingPeriod
        summary.toolCount = Number(summaryData.toolCount || 0)
        summary.cateCount = Number(summaryData.cateCount || 0)
        summary.viewCount = Number(summaryData.viewCount || 0)
        summary.startCount = Number(summaryData.startCount || 0)
        summary.successCount = Number(summaryData.successCount || 0)
        summary.downloadCount = Number(summaryData.downloadCount || 0)
        summary.champion = summaryData.champion || {}
        summary.updatedAt = Number(summaryData.updatedAt || 0)
        rankingList.value = Array.isArray(listData.lists) ? (listData.lists as ToolRankingManageRow[]) : []
        pagination.count = Number(listData.count || 0)
        trendData.period = (trendResult.period || queryParams.period) as ToolRankingPeriod
        trendData.sortBy = (trendResult.sortBy || queryParams.sortBy) as ToolRankingSortBy
        trendData.startDate = String(trendResult.startDate || '')
        trendData.endDate = String(trendResult.endDate || '')
        trendData.labels = Array.isArray(trendResult.labels) ? trendResult.labels : []
        trendData.viewSeries = Array.isArray(trendResult.viewSeries) ? trendResult.viewSeries : []
        trendData.startSeries = Array.isArray(trendResult.startSeries) ? trendResult.startSeries : []
        trendData.successSeries = Array.isArray(trendResult.successSeries) ? trendResult.successSeries : []
        trendData.downloadSeries = Array.isArray(trendResult.downloadSeries) ? trendResult.downloadSeries : []
        trendData.scoreSeries = Array.isArray(trendResult.scoreSeries) ? trendResult.scoreSeries : []
    } catch (error) {
        feedback.msgError('读取工具热榜数据失败')
        rankingList.value = []
        pagination.count = 0
        trendData.labels = []
        trendData.viewSeries = []
        trendData.startSeries = []
        trendData.successSeries = []
        trendData.downloadSeries = []
        trendData.scoreSeries = []
    } finally {
        loading.value = false
    }
}

/**
 * 函数说明：执行热榜查询，并将分页重置回第一页，避免旧页码造成空结果误判。
 */
const handleSearch = () => {
    queryParams.pageNo = 1
    void loadData()
}

/**
 * 函数说明：重置筛选条件，回到默认周榜点击量排序视图。
 */
const handleReset = () => {
    queryParams.pageNo = 1
    queryParams.pageSize = 20
    queryParams.keyword = ''
    queryParams.cateTitle = ''
    queryParams.period = 'week'
    queryParams.sortBy = 'view'
    void loadData()
}

/**
 * 函数说明：切换页码时只刷新表格数据，保持当前筛选条件不丢失。
 */
const handlePageChange = (pageNo: number) => {
    queryParams.pageNo = pageNo
    void loadData()
}

/**
 * 函数说明：切换每页条数时同步回第一页，保证分页边界稳定。
 */
const handlePageSizeChange = (pageSize: number) => {
    queryParams.pageNo = 1
    queryParams.pageSize = pageSize
    void loadData()
}

/**
 * 函数说明：打开前台热榜独立页，便于后台运营立即核对前台展示结果。
 */
const openHotRankingPreview = () => {
    window.open(resolveToolsPreviewUrl('/tools/hot-ranking'), '_blank', 'noopener,noreferrer')
}

/**
 * 函数说明：跳转到榜单配置页，方便从数据分析直接进入展示策略调整。
 */
const goConfigPage = () => {
    router.push('/official_site/tool_ranking_config')
}

/**
 * 函数说明：打开工具链接预览，站内工具走前台预览域名，外链直接打开原始地址。
 */
const openToolLink = (toolUrl: string) => {
    const targetUrl = String(toolUrl || '').trim()
    if (!targetUrl) {
        feedback.msgError('当前工具还没有配置跳转链接')
        return
    }
    const previewUrl = /^https?:\/\//i.test(targetUrl)
        ? targetUrl
        : resolveToolsPreviewUrl(targetUrl)
    window.open(previewUrl, '_blank', 'noopener,noreferrer')
}

/**
 * 函数说明：导出当前筛选条件下的热榜结果，统一生成 CSV 文件交给运营复盘。
 */
const handleExport = async () => {
    try {
        const exportResult = await exportToolRankingManage({ ...queryParams })
        const exportRows = Array.isArray(exportResult.list) ? exportResult.list : []
        if (exportRows.length === 0) {
            feedback.msgError('当前筛选条件下没有可导出的热榜数据')
            return
        }
        streamFileDownload(buildToolRankingCsvText(exportRows), exportResult.fileName || 'tool-ranking.csv')
        feedback.msgSuccess('热榜数据导出成功')
    } catch (error) {
        feedback.msgError('导出热榜数据失败')
    }
}

onMounted(() => {
    void loadData()
})
</script>

<style scoped>
.website-tool-ranking-manage {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.layout-page-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.layout-status-tags {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.page-entry-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.page-entry-card {
    padding: 18px 20px;
    border: 1px solid var(--color-border-2);
    border-radius: 12px;
    background: linear-gradient(180deg, #ffffff 0%, #f7f8fa 100%);
}

.page-entry-card__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1);
}

.page-entry-card__desc,
.page-entry-list {
    margin-top: 10px;
    font-size: 13px;
    line-height: 1.8;
    color: var(--color-text-3);
}

.page-entry-list {
    padding-left: 18px;
}

.page-entry-card__actions {
    margin-top: 14px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.ops-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.85fr);
    gap: 16px;
}

.ops-workspace__main,
.ops-workspace__aside {
    padding: 20px;
    border-radius: 12px;
    border: 1px solid var(--color-border-2);
    background: #fff;
}

.ops-workspace__eyebrow {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgb(var(--arcoblue-6));
}

.ops-workspace__title {
    margin-top: 10px;
    font-size: 22px;
    line-height: 1.4;
    font-weight: 700;
    color: var(--color-text-1);
}

.ops-workspace__desc {
    margin-top: 10px;
    font-size: 13px;
    line-height: 1.8;
    color: var(--color-text-3);
}

.ops-workspace__meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
}

.ops-workspace__meta-item {
    padding: 14px 16px;
    border-radius: 10px;
    background: #f7f8fa;
    border: 1px solid var(--color-border-2);
}

.ops-workspace__meta-item span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3);
}

.ops-workspace__meta-item strong {
    display: block;
    margin-top: 6px;
    font-size: 16px;
    color: var(--color-text-1);
}

.ops-workspace__aside-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1);
}

.champion-card {
    margin-top: 12px;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid rgba(var(--arcoblue-6), 0.16);
    background: linear-gradient(180deg, rgba(var(--arcoblue-1), 0.7) 0%, #ffffff 100%);
}

.champion-card--empty {
    border-style: dashed;
    background: #fafcff;
}

.champion-card__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-1);
}

.champion-card__meta,
.champion-card__stats {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 10px;
    font-size: 12px;
    color: var(--color-text-3);
}

.ops-workspace__actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 14px;
}

.filter-bar {
    display: grid;
    grid-template-columns: minmax(220px, 1.2fr) minmax(180px, 0.9fr) 160px 160px auto;
    gap: 12px;
}

.filter-bar__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.result-summary {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.trend-panel {
    padding: 18px 20px;
    border: 1px solid var(--color-border-2);
    border-radius: 12px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%);
}

.trend-panel__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
}

.trend-panel__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1);
}

.trend-panel__desc {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.8;
    color: var(--color-text-3);
}

.trend-panel__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.trend-panel__chart {
    height: 360px;
}

.trend-panel__empty {
    padding: 28px 0 10px;
}

.tool-cell__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
}

.tool-cell__sub {
    margin-top: 4px;
    font-size: 12px;
    color: var(--color-text-3);
    word-break: break-all;
}

.table-footer {
    display: flex;
    justify-content: flex-end;
}

@media (max-width: 1200px) {
    .ops-workspace,
    .page-entry-grid {
        grid-template-columns: 1fr;
    }

    .ops-workspace__meta {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .filter-bar {
        grid-template-columns: 1fr 1fr;
    }

    .filter-bar__actions {
        grid-column: 1 / -1;
        justify-content: flex-start;
    }
}

@media (max-width: 768px) {
    .ops-workspace__meta,
    .filter-bar,
    .page-entry-grid {
        grid-template-columns: 1fr;
    }

    .trend-panel__head {
        flex-direction: column;
    }

    .trend-panel__chart {
        height: 300px;
    }
}
</style>
