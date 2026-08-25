<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="cache-page">
        <a-page-header title="缓存监控" subtitle="查看 Redis 运行状态、命令分布与内存消耗，快速判断缓存压力。">
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>{{ redisModeLabel }}</a-tag>
                    <a-button data-admin-smoke="cache-refresh" @click="getSystemCache">刷新监控</a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 2, lg: 4 }" :col-gap="12" :row-gap="12" class="cache-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">Key 总数</div>
                    <div class="metric-value">{{ baseInfo.dbSize || 0 }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">已用内存</div>
                    <div class="metric-value">{{ baseInfo.used_memory_human || '-' }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">连接数</div>
                    <div class="metric-value">{{ baseInfo.connected_clients || '-' }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">运行天数</div>
                    <div class="metric-value">{{ baseInfo.uptime_in_days || '-' }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-spin :loading="loading" class="w-full">
            <a-card class="general-card" title="缓存基础信息" :bordered="false">
                <div class="section-title">基础信息</div>
                <div class="section-desc">集中查看 Redis 版本、模式、CPU、内存和网络入口/出口等基础指标。</div>
                <a-table class="mt-4" :data="baseInfoRows" :pagination="false" :bordered="false" row-key="id" :scroll="{ x: 1120 }">
                    <a-table-column title="指标" data-index="k1" :width="140" />
                    <a-table-column title="值" data-index="v1" :min-width="140" />
                    <a-table-column title="指标" data-index="k2" :width="140" />
                    <a-table-column title="值" data-index="v2" :min-width="140" />
                    <a-table-column title="指标" data-index="k3" :width="140" />
                    <a-table-column title="值" data-index="v3" :min-width="140" />
                    <a-table-column title="指标" data-index="k4" :width="140" />
                    <a-table-column title="值" data-index="v4" :min-width="140" />
                </a-table>
            </a-card>

            <div class="cache-chart-grid">
                <a-card class="!border-none" :bordered="false">
                    <div class="section-title">命令统计</div>
                    <div class="section-desc">查看热点命令分布，判断是否存在单一命令过热或异常调用模式。</div>
                    <div class="chart-wrap">
                        <v-charts autoresize :option="chartOptions.commandChartOption" />
                    </div>
                </a-card>

                <a-card class="!border-none" :bordered="false">
                    <div class="section-title">内存信息</div>
                    <div class="section-desc">实时查看 Redis 内存占用，评估是否接近上限或需要调整淘汰策略。</div>
                    <div class="chart-wrap">
                        <v-charts autoresize :option="chartOptions.memoryChartOption" />
                    </div>
                </a-card>
            </div>
        </a-spin>
    </div>
</template>

<script setup lang="ts" name="cache">
import { systemCache } from '@/api/setting/system'
import vCharts from 'vue-echarts'

const loading = ref(false)
const baseInfo = ref<Record<string, any>>({})

const chartOptions = reactive({
    commandChartOption: {
        tooltip: {
            trigger: 'item'
        },
        series: [
            {
                label: {
                    show: true
                },
                labelLine: {
                    show: true
                },
                type: 'pie',
                radius: '85%',
                color: [
                    '#0D47A1',
                    '#1565C0',
                    '#1976D2',
                    '#1E88E5',
                    '#2196F3',
                    '#42A5F5',
                    '#64B5F6',
                    '#90CAF9',
                    '#BBDEFB',
                    '#E3F2FD',
                    '#CAF0F8',
                    '#ADE8F4',
                    '#90E0EF',
                    '#48CAE4',
                    '#00B4D8',
                    '#0096C7',
                    '#0077B6',
                    '#023E8A',
                    '#03045E',
                    '#8ecae6',
                    '#98c1d9',
                    '#D9ED92',
                    '#B5E48C',
                    '#99D98C',
                    '#76C893',
                    '#52B69A',
                    '#34A0A4',
                    '#168AAD',
                    '#1A759F',
                    '#1E6091',
                    '#184E77',
                    '#457b9d'
                ],
                data: [
                    {
                        value: '',
                        name: ''
                    }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    },
    memoryChartOption: {
        tooltip: {
            formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
            {
                name: 'Pressure',
                type: 'gauge',
                radius: '100%',
                detail: {
                    formatter: '{value}'
                },
                data: [
                    {
                        value: '',
                        name: '内存消耗'
                    }
                ]
            }
        ]
    }
})

/**
 * 函数说明：格式化 Redis 运行模式文案。
 */
const formatRedisMode = (mode: string): string => {
    if (mode === 'standalone') {
        return '单机'
    }
    if (mode === 'cluster') {
        return '集群'
    }
    return mode || '-'
}

/**
 * 函数说明：根据基础信息生成表格展示数据。
 */
const baseInfoRows = computed(() => {
    const info = baseInfo.value
    return [
        {
            id: 1,
            k1: 'Redis版本',
            v1: info.redis_version || '-',
            k2: '运行模式',
            v2: formatRedisMode(info.redis_mode),
            k3: '端口',
            v3: info.tcp_port || '-',
            k4: '客户端数',
            v4: info.connected_clients || '-'
        },
        {
            id: 2,
            k1: '运行时间(天)',
            v1: info.uptime_in_days || '-',
            k2: '使用内存',
            v2: info.used_memory_human || '-',
            k3: '使用CPU',
            v3: info.used_cpu_user_children || '-',
            k4: '内存配置',
            v4: info.maxmemory_human || '-'
        },
        {
            id: 3,
            k1: 'AOF是否开启',
            v1: Number(info.aof_enabled) === 1 ? '开启' : '关闭',
            k2: 'RDB是否成功',
            v2: info.rdb_last_bgsave_status === 'ok' ? '成功' : info.rdb_last_bgsave_status || '-',
            k3: 'Key数量',
            v3: info.dbSize || '-',
            k4: '网络入口/出口(kbps)',
            v4: `${info.instantaneous_input_kbps || 0} / ${info.instantaneous_output_kbps || 0}`
        }
    ]
})

/**
 * 函数说明：获取缓存监控信息并更新图表数据。
 */
const getSystemCache = async () => {
    loading.value = true
    try {
        const data = await systemCache()
        baseInfo.value = {
            ...(data.info || {}),
            dbSize: data.dbSize || 0
        }

        chartOptions.commandChartOption.series[0].data = data.commandStats || []

        const memoryValue = Number(data.info?.used_memory || 0) / 1024 / 1024
        chartOptions.memoryChartOption.series[0].data[0].value = memoryValue.toFixed(2)
        chartOptions.memoryChartOption.series[0].detail.formatter = '{value}M'
    } finally {
        loading.value = false
    }
}

const redisModeLabel = computed(() => formatRedisMode(String(baseInfo.value.redis_mode || '')))

getSystemCache()
</script>

<style scoped lang="scss">
.cache-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.cache-metrics {
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

.cache-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
    gap: 16px;
}

.cache-workspace__main,
.cache-workspace__aside {
    padding: 20px 22px;
    border-radius: 16px;
    background: #fff;
}

.cache-workspace__eyebrow {
    font-size: 12px;
    font-weight: 600;
    color: #4e5969;
}

.cache-workspace__title {
    margin-top: 10px;
    font-size: 22px;
    line-height: 1.4;
    font-weight: 700;
    color: #1d2129;
}

.cache-workspace__desc {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.7;
    color: #4e5969;
}

.cache-workspace__meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
}

.cache-workspace__meta-item,
.cache-workspace__checklist-item {
    padding: 14px 16px;
    border-radius: 14px;
    background: #f7f8fa;
}

.cache-workspace__meta-item span,
.cache-workspace__checklist-label {
    display: block;
    font-size: 12px;
    color: #86909c;
}

.cache-workspace__meta-item strong,
.cache-workspace__checklist-value {
    display: block;
    margin-top: 8px;
    font-size: 16px;
    font-weight: 700;
    color: #1d2129;
}

.cache-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: #1d2129;
}

.cache-workspace__checklist {
    display: grid;
    gap: 12px;
    margin-top: 14px;
}

.cache-workspace__checklist-item.is-ready {
    background: #effff6;
}

.cache-workspace__checklist-item.is-warning {
    background: #fff7e8;
}

.cache-workspace__checklist-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: #4e5969;
}

.cache-workspace__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 16px;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1d2129;
}

.section-desc {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.7;
    color: #4e5969;
}

.cache-chart-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.chart-wrap {
    display: flex;
    height: 320px;
    align-items: center;
}

@media (max-width: 1200px) {
    .cache-workspace {
        grid-template-columns: 1fr;
    }

    .cache-workspace__meta {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .cache-chart-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .cache-workspace__meta {
        grid-template-columns: 1fr;
    }
}
</style>
