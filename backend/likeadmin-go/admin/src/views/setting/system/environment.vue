<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="system-environment">
        <a-page-header title="运行环境" subtitle="查看服务器、Go 进程与磁盘运行状态。">
            <template #extra>
                <a-button data-admin-smoke="environment-refresh" type="primary" :loading="loading" @click="getSystemInfo">
                    刷新环境信息
                </a-button>
            </template>
        </a-page-header>
        <a-alert v-if="loadError" type="warning" :closable="false" show-icon>
            {{ loadError }}
        </a-alert>
        <a-spin :loading="loading" class="w-full">
            <div class="resource-grid">
                <a-card class="!border-none" :bordered="false">
                    <div class="card-title">CPU</div>
                    <div class="metric-grid">
                        <div class="metric-item">
                            <div class="metric-value">{{ info.cpu.cpuNum || '-' }}</div>
                            <div class="metric-label">核心数</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value">{{ formatPercent(info.cpu.used) }}</div>
                            <div class="metric-label">用户使用率</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value">{{ formatPercent(info.cpu.sys) }}</div>
                            <div class="metric-label">系统使用率</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value">{{ formatPercent(info.cpu.free) }}</div>
                            <div class="metric-label">当前空闲率</div>
                        </div>
                    </div>
                </a-card>

                <a-card class="!border-none" :bordered="false">
                    <div class="card-title">内存</div>
                    <div class="metric-grid">
                        <div class="metric-item">
                            <div class="metric-value">{{ info.mem.total || '-' }}</div>
                            <div class="metric-label">总内存</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value">{{ formatPercent(info.mem.used) }}</div>
                            <div class="metric-label">已用内存</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value">{{ formatPercent(info.mem.free) }}</div>
                            <div class="metric-label">剩余内存</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-value">{{ formatPercent(info.mem.usage) }}</div>
                            <div class="metric-label">使用率</div>
                        </div>
                    </div>
                </a-card>
            </div>

            <a-card class="!border-none" :bordered="false">
                <div class="table-card-header">
                    <span>服务器信息</span>
                    <a-button data-admin-smoke="environment-refresh-main" size="small" @click="getSystemInfo">刷新</a-button>
                </div>
                <div class="mt-4">
                    <a-table
                        :data="sysTableData"
                        :columns="sysColumns"
                        :pagination="false"
                        :bordered="false"
                    />
                </div>
            </a-card>

            <a-card class="!border-none mt-4" :bordered="false">
                <div>Go 环境信息</div>
                <div class="mt-4">
                    <a-table
                        :data="goTableData"
                        :columns="goColumns"
                        :pagination="false"
                        :bordered="false"
                    />
                </div>
            </a-card>

            <a-card class="!border-none mt-4" :bordered="false">
                <div>硬盘状态</div>
                <div class="mt-4">
                    <a-table
                        :data="info.disk"
                        :columns="diskColumns"
                        :pagination="false"
                        :bordered="false"
                        row-key="dirName"
                    />
                </div>
            </a-card>
        </a-spin>
    </div>
</template>

<script lang="ts" setup name="environment">
import type { TableColumnData } from '@arco-design/web-vue'
import { systemInfo, systemInfoLegacy } from '@/api/setting/system'
import feedback from '@/utils/feedback'

interface SystemInfo {
    cpu: Record<string, any>
    disk: Record<string, any>[]
    go: Record<string, any>
    mem: Record<string, any>
    sys: Record<string, any>
}

const loading = ref(false)
const loadError = ref('')
const info = ref<SystemInfo>({
    cpu: {},
    disk: [],
    go: {},
    mem: {},
    sys: {}
})

/**
 * 函数说明：格式化百分比展示，保持与旧版页面一致的空值显示规则
 */
const formatPercent = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
        return '-'
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return `${value}%`
    }
    const text = String(value).trim()
    if (!text) {
        return '-'
    }
    if (text.endsWith('%')) {
        return text
    }
    return `${text}%`
}

/**
 * 函数说明：判断任意值是否为普通对象。
 */
const isRecordObject = (value: unknown): value is Record<string, any> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 函数说明：按候选字段读取值，兼容驼峰、下划线及历史字段名。
 */
const pickValue = (
    source: Record<string, any>,
    candidates: string[],
    fallback: unknown = ''
): any => {
    for (const key of candidates) {
        if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
            return source[key]
        }
    }
    return fallback
}

/**
 * 函数说明：从对象中挑选第一个有效对象节点，用于兼容多后端结构。
 */
const pickObject = (source: Record<string, any>, candidates: string[]): Record<string, any> => {
    for (const key of candidates) {
        const value = source[key]
        if (isRecordObject(value)) {
            return value
        }
    }
    return {}
}

/**
 * 函数说明：从对象中挑选第一个数组节点，用于兼容不同磁盘字段命名。
 */
const pickArray = (source: Record<string, any>, candidates: string[]): Record<string, any>[] => {
    for (const key of candidates) {
        const value = source[key]
        if (Array.isArray(value)) {
            return value.filter((item) => isRecordObject(item)) as Record<string, any>[]
        }
    }
    return []
}

/**
 * 函数说明：兼容监控接口多种返回结构，统一映射为页面渲染数据。
 */
const normalizeSystemInfo = (raw: unknown): SystemInfo => {
    const payload = isRecordObject(raw) ? raw : {}
    const cpuSource = pickObject(payload, ['cpu', 'cpuInfo', 'serverCpu'])
    const memSource = pickObject(payload, ['mem', 'memory', 'memInfo'])
    const rawSysSource = pickObject(payload, ['sys', 'server', 'serverInfo', 'sysInfo'])
    const rawGoSource = pickValue(payload, ['go', 'jvm', 'runtime', 'goInfo'], {})
    const goSource = Array.isArray(rawGoSource)
        ? (rawGoSource.find((item) => isRecordObject(item)) as Record<string, any>) || {}
        : isRecordObject(rawGoSource)
        ? rawGoSource
        : {}
    const diskSource = pickArray(payload, ['disk', 'sysFiles', 'diskInfo', 'diskList', 'disks'])

    const sysSource =
        Object.keys(rawSysSource).length > 0 ? rawSysSource : pickObject(payload, ['system']) || {}

    return {
        cpu: {
            cpuNum: pickValue(cpuSource, ['cpuNum', 'cpu_num', 'cpuCores', 'cores'], '-'),
            used: pickValue(cpuSource, ['used', 'usage', 'user', 'userRate'], ''),
            sys: pickValue(cpuSource, ['sys', 'system', 'systemRate'], ''),
            free: pickValue(cpuSource, ['free', 'idle', 'idleRate'], ''),
            total: pickValue(cpuSource, ['total'], '')
        },
        mem: {
            total: pickValue(memSource, ['total', 'all'], ''),
            used: pickValue(memSource, ['used', 'usage', 'usedRate'], ''),
            free: pickValue(memSource, ['free', 'freeRate'], ''),
            usage: pickValue(memSource, ['usage', 'used', 'usedRate'], '')
        },
        sys: {
            computerName: pickValue(sysSource, ['computerName', 'hostName', 'serverName'], ''),
            computerIp: pickValue(sysSource, ['computerIp', 'ip', 'serverIp'], ''),
            osName: pickValue(sysSource, ['osName', 'os', 'system'], ''),
            osArch: pickValue(sysSource, ['osArch', 'arch', 'architecture'], ''),
            userDir: pickValue(sysSource, ['userDir', 'projectPath', 'workDir'], '')
        },
        go: {
            name: pickValue(goSource, ['name', 'runtimeName'], 'Go'),
            startTime: pickValue(goSource, ['startTime', 'startAt'], ''),
            home: pickValue(goSource, ['home', 'homePath', 'path'], ''),
            inputArgs: pickValue(goSource, ['inputArgs', 'args'], ''),
            version: pickValue(goSource, ['version', 'goVersion', 'runtimeVersion'], ''),
            runTime: pickValue(goSource, ['runTime', 'uptime'], '')
        },
        disk: diskSource.map((item) => ({
            dirName: pickValue(item, ['dirName', 'mountPath', 'path'], ''),
            sysTypeName: pickValue(item, ['sysTypeName', 'fileSystem', 'fstype'], ''),
            typeName: pickValue(item, ['typeName', 'diskType', 'device'], ''),
            total: pickValue(item, ['total', 'totalSize'], ''),
            free: pickValue(item, ['free', 'freeSize'], ''),
            used: pickValue(item, ['used', 'usedSize'], ''),
            usage: pickValue(item, ['usage', 'usedPercent'], '')
        }))
    }
}

/**
 * 函数说明：判断当前环境数据是否缺失核心字段，用于触发接口回退。
 */
const isSystemInfoSparse = (data: SystemInfo): boolean => {
    return (
        Object.keys(data.sys).filter((key) => data.sys[key] !== '').length === 0 &&
        Object.keys(data.go).filter((key) => data.go[key] !== '').length === 0 &&
        data.disk.length === 0
    )
}

/**
 * 函数说明：表格仅在存在有效对象时渲染行，避免展示空白占位行。
 */
const sysTableData = computed(() =>
    info.value.sys.computerName || info.value.sys.computerIp ? [info.value.sys] : []
)

/**
 * 函数说明：Go 信息表格仅在存在有效字段时渲染。
 */
const goTableData = computed(() =>
    info.value.go.version || info.value.go.startTime ? [info.value.go] : []
)

/**
 * 函数说明：服务器信息列配置，统一通过 columns 模式渲染，避免列子组件丢失导致表格空白。
 */
const sysColumns: TableColumnData[] = [
    { title: '服务器名称', dataIndex: 'computerName', minWidth: 150 },
    { title: '服务器IP', dataIndex: 'computerIp', minWidth: 120 },
    { title: '操作系统', dataIndex: 'osName', minWidth: 100 },
    { title: '系统架构', dataIndex: 'osArch', minWidth: 100 },
    { title: '项目路径', dataIndex: 'userDir', minWidth: 250, ellipsis: true, tooltip: true }
]

/**
 * 函数说明：Go 环境列配置，统一采用 columns 模式以保证渲染稳定性。
 */
const goColumns: TableColumnData[] = [
    { title: 'Go名称', dataIndex: 'name', minWidth: 120 },
    { title: '启动时间', dataIndex: 'startTime', minWidth: 120 },
    { title: '安装路径', dataIndex: 'home', minWidth: 120, ellipsis: true, tooltip: true },
    { title: '运行参数', dataIndex: 'inputArgs', minWidth: 120, ellipsis: true, tooltip: true },
    { title: 'Go版本', dataIndex: 'version', minWidth: 120 },
    { title: '运行时长', dataIndex: 'runTime', minWidth: 120 }
]

/**
 * 函数说明：硬盘状态列配置，使用 render 显示百分比，兼容数字与字符串类型。
 */
const diskColumns: TableColumnData[] = [
    { title: '盘符路径', dataIndex: 'dirName', minWidth: 120 },
    { title: '文件系统', dataIndex: 'sysTypeName', minWidth: 120 },
    { title: '盘符类型', dataIndex: 'typeName', minWidth: 140, ellipsis: true, tooltip: true },
    { title: '总大小', dataIndex: 'total', minWidth: 100 },
    { title: '可用大小', dataIndex: 'free', minWidth: 100 },
    { title: '已用大小', dataIndex: 'used', minWidth: 100 },
    {
        title: '已用百分比',
        dataIndex: 'usage',
        minWidth: 110,
        render: ({ record }: { record: Record<string, any> }) => `${record?.usage ?? '-'}%`
    }
]

/**
 * 函数说明：获取系统环境信息并更新页面状态
 */
const getSystemInfo = async () => {
    loading.value = true
    loadError.value = ''
    try {
        let normalized = normalizeSystemInfo(await systemInfo())
        if (isSystemInfoSparse(normalized)) {
            normalized = normalizeSystemInfo(await systemInfoLegacy())
        }
        info.value = normalized
    } catch {
        try {
            info.value = normalizeSystemInfo(await systemInfoLegacy())
            loadError.value = '主监控接口暂不可用，已自动切换兼容接口展示。'
        } catch {
            loadError.value = '系统环境接口暂不可用，请检查后端 monitor 路由与登录态。'
            feedback.msgError('系统环境接口暂不可用，请检查后端 monitor 路由与登录态')
        }
    } finally {
        loading.value = false
    }
}

getSystemInfo()
</script>

<style lang="scss" scoped>
.system-environment {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.resource-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.environment-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
    gap: 16px;
}

.environment-workspace__main,
.environment-workspace__aside {
    padding: 20px 22px;
    border-radius: 16px;
    background: #fff;
}

.environment-workspace__eyebrow {
    font-size: 12px;
    font-weight: 600;
    color: #4e5969;
}

.environment-workspace__title {
    margin-top: 10px;
    font-size: 22px;
    line-height: 1.4;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.environment-workspace__desc {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.7;
    color: var(--color-text-2, #4e5969);
}

.environment-workspace__meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
}

.environment-workspace__meta-item,
.environment-workspace__checklist-item {
    padding: 14px 16px;
    border-radius: 14px;
    background: var(--color-fill-1, #f7f8fa);
}

.environment-workspace__meta-item span,
.environment-workspace__checklist-label {
    display: block;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.environment-workspace__meta-item strong,
.environment-workspace__checklist-value {
    display: block;
    margin-top: 8px;
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.environment-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.environment-workspace__checklist {
    display: grid;
    gap: 12px;
    margin-top: 14px;
}

.environment-workspace__checklist-item.is-ready {
    background: #effff6;
}

.environment-workspace__checklist-item.is-warning {
    background: #fff7e8;
}

.environment-workspace__checklist-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-2, #4e5969);
}

.card-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-1, #1d2129);
    margin-bottom: 16px;
}

.metric-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
}

.metric-item {
    border-radius: 10px;
    padding: 14px 16px;
    background: var(--color-fill-1, #f7f8fa);
}

.metric-value {
    font-size: 28px;
    line-height: 1.15;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.metric-label {
    margin-top: 8px;
    font-size: 13px;
    color: var(--color-text-3, #86909c);
}

@media (min-width: 1024px) {
    .resource-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 1200px) {
    .environment-workspace {
        grid-template-columns: 1fr;
    }

    .environment-workspace__meta {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 768px) {
    .environment-workspace__meta {
        grid-template-columns: 1fr;
    }
}
</style>
