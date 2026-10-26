<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <div class="container workbench-page">
        <header class="workbench-heading">
            <div>
                <h1>工作台</h1>
                <p>{{ adminName }}，选择要处理的任务。</p>
            </div>
            <div class="heading-actions">
                <a-button :loading="loading" data-admin-smoke="workbench-refresh" @click="getData">
                    刷新数据
                </a-button>
            </div>
        </header>

        <quick-operation-panel :groups="quickMenuGroups" />

        <section class="data-section" aria-labelledby="workbench-data-title" :aria-busy="loading">
            <div class="section-heading">
                <h2 id="workbench-data-title">今日概况</h2>
                <span v-if="lastUpdated">统计时间 {{ lastUpdated }}</span>
            </div>
            <div v-if="errorMessage" class="data-error" role="alert">
                <div>
                    <strong>{{ errorMessage }}</strong>
                    <p v-if="hasLoaded">下方保留上次成功读取的数据，可能不是最新状态。</p>
                </div>
                <a-button :loading="loading" data-admin-smoke="workbench-retry" @click="getData"
                    >重试</a-button
                >
            </div>
            <a-spin :loading="loading" tip="正在读取统计数据..." class="data-loading">
                <div v-if="hasLoaded && hasMetrics" class="panel">
                    <data-panel :metric-items="todayCards" />
                    <trend-panel :option="visitorOption" :has-data="hasVisitorData" />
                    <p class="metric-note">
                        工具访问来自工具页访问统计；订单量包含已创建订单，销售额仅统计已支付订单。
                    </p>
                </div>
                <a-empty
                    v-else-if="hasLoaded && !errorMessage"
                    class="data-empty"
                    description="暂无统计数据，站点产生访问或订单后将在这里显示。"
                />
                <p v-else-if="!errorMessage" class="loading-placeholder" role="status">
                    正在读取统计数据...
                </p>
            </a-spin>
        </section>

        <div class="secondary-sections">
            <details
                v-if="maintenanceLinks.length"
                class="secondary-section"
                data-workbench-section="maintenance"
            >
                <summary>系统维护 <span>账号、权限与开发工具</span></summary>
                <shortcut-panel :items="maintenanceLinks" />
            </details>
            <details class="secondary-section" data-workbench-section="system">
                <summary>系统信息 <span>版本与统计来源</span></summary>
                <system-status-panel :environment-info-list="environmentInfoList" />
            </details>
            <details class="secondary-section" data-workbench-section="release-checklist">
                <summary>发布自查 <span>临时清单，不代表实际部署状态</span></summary>
                <release-todo-panel
                    :todo-list="releaseTodoList"
                    @mark-all="markAllTodoDone"
                    @reset="resetTodoList"
                />
            </details>
            <details
                v-if="supportList.length"
                class="secondary-section"
                data-workbench-section="support"
            >
                <summary>服务支持 <span>联系与帮助</span></summary>
                <support-panel :support-list="supportList" />
            </details>
        </div>
    </div>
</template>

<script lang="ts" setup name="workbench">
import { Message } from '@arco-design/web-vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { getWorkbench } from '@/api/app'
import useUserStore from '@/stores/modules/user'
import { flattenAdminNavigation, getAdminQuickNavigation, adminNavigationTitle, getAdminTaskDefinition } from '@/utils/admin-navigation'
import qqGroup from './image/qq_group.png'
import customerService from './image/customer_service.png'
import DataPanel from './components/data-panel.vue'
import TrendPanel from './components/trend-panel.vue'
import QuickOperationPanel from './components/quick-operation-panel.vue'
import ShortcutPanel from './components/shortcut-panel.vue'
import ReleaseTodoPanel from './components/release-todo-panel.vue'
import SystemStatusPanel from './components/system-status-panel.vue'
import SupportPanel from './components/support-panel.vue'

interface ReleaseTodoItem {
    key: string
    label: string
    done: boolean
}

const userStore = useUserStore()
const loading = ref(false)
const hasLoaded = ref(false)
const errorMessage = ref('')
const workbenchData = reactive({
    version: {} as Record<string, any>,
    today: {} as Record<string, any>,
    visitor: {} as Record<string, any>
})
let requestSequence = 0
let requestTimer: ReturnType<typeof setTimeout> | undefined

const maintenancePaths = [
    '/permission/admin',
    '/permission/role',
    '/permission/menu',
    '/organization/department',
    '/dev_tools/dict',
    '/dev_tools/code',
    '/material/icons'
]
const supportList = [
    {
        image: qqGroup,
        title: 'QQ 交流群',
        desc: '技术问题、版本动态与功能建议。'
    },
    {
        image: customerService,
        title: '企业客服微信',
        desc: '商务合作、私有部署与售后支持。'
    }
]
const releaseTodoList = reactive<ReleaseTodoItem[]>([
    { key: 'website', label: '核对本次调整的官网配置与工具页面', done: false },
    { key: 'models', label: '验证受影响的接口、AI 模型与权限', done: false },
    { key: 'checks', label: '完成类型检查、构建与关键流程回归', done: false },
    { key: 'deploy', label: '部署后验证版本、接口与线上页面', done: false }
])
const navigationItems = computed(() => flattenAdminNavigation(userStore.routes))
const adminName = computed(() =>
    String(
        userStore.userInfo?.nickname ||
            userStore.userInfo?.name ||
            userStore.userInfo?.username ||
            '管理员'
    )
)
const versionText = computed(() => String(workbenchData.version.version || '').trim())
const lastUpdated = computed(() => String(workbenchData.today.time || '').trim())

/** 常用任务与侧栏、搜索共用授权来源和规范名称，不再维护另一份入口表。 */
const quickMenuGroups = computed(() => {
    const items = getAdminQuickNavigation(navigationItems.value).filter(item => item.path.split(/[?#]/)[0] !== '/workbench')
        .map(item => ({ name: adminNavigationTitle(item.path, item.title), desc: getAdminTaskDefinition(item.path)?.description || item.breadcrumb, url: item.path }))
    return items.length ? [{ key: 'daily', title: '日常运营', items }] : []
})
const maintenanceLinks = computed(() =>
    navigationItems.value
        .filter((item) => !item.external && maintenancePaths.includes(item.path.split('?')[0]))
        .map((item) => ({
            label: item.title,
            to: item.path,
            short: item.title.slice(0, 2)
        }))
)

/**
 * 函数说明：校验接口统计值；缺失、空值和非法数值保持未知，不推算成零。
 * @param value 接口中的原始统计字段。
 * @returns 有效非负数值；字段不可用时返回 null。
 */
const readMetric = (value: unknown): number | null => {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim()))
        return null
    const result = Number(value)
    return Number.isFinite(result) && result >= 0 ? result : null
}

/**
 * 函数说明：格式化真实统计值，金额保留两位小数，字段缺失时明确说明暂无数据。
 * @param value 接口统计值。
 * @param currency 是否为人民币金额。
 * @returns 供指标卡展示的中文数值文本。
 */
const formatMetric = (value: unknown, currency = false): string => {
    const result = readMetric(value)
    if (result === null) return '暂无数据'
    return currency ? `¥${result.toFixed(2)}` : result.toLocaleString('zh-CN')
}

const hasMetrics = computed(() =>
    [
        'todayVisits',
        'totalVisits',
        'todaySales',
        'totalSales',
        'todayOrder',
        'totalOrder',
        'todayUsers',
        'totalUsers'
    ].some((key) => readMetric(workbenchData.today[key]) !== null)
)
const todayCards = computed(() => [
    {
        key: 'visits',
        label: '今日工具访问',
        value: formatMetric(workbenchData.today.todayVisits),
        totalLabel: '累计工具访问',
        totalValue: formatMetric(workbenchData.today.totalVisits)
    },
    {
        key: 'users',
        label: '今日新增用户',
        value: formatMetric(workbenchData.today.todayUsers),
        totalLabel: '累计用户',
        totalValue: formatMetric(workbenchData.today.totalUsers)
    },
    {
        key: 'orders',
        label: '今日订单量',
        value: formatMetric(workbenchData.today.todayOrder),
        totalLabel: '累计订单',
        totalValue: formatMetric(workbenchData.today.totalOrder)
    },
    {
        key: 'sales',
        label: '今日销售额',
        value: formatMetric(workbenchData.today.todaySales, true),
        totalLabel: '累计销售额',
        totalValue: formatMetric(workbenchData.today.totalSales, true)
    }
])
const visitorRows = computed(() => {
    const dates = Array.isArray(workbenchData.visitor.date) ? workbenchData.visitor.date : []
    const values = Array.isArray(workbenchData.visitor.list) ? workbenchData.visitor.list : []
    return dates.flatMap((date, index) => {
        const value = readMetric(values[index])
        return typeof date === 'string' && value !== null ? [{ date, value }] : []
    })
})
const hasVisitorData = computed(() => visitorRows.value.some((item) => item.value > 0))
const visitorOption = computed(() => ({
    grid: { left: 42, right: 20, top: 24, bottom: 28 },
    tooltip: { trigger: 'axis' },
    xAxis: {
        type: 'category',
        data: visitorRows.value.map((item) => item.date),
        boundaryGap: false
    },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
        {
            name: '工具访问',
            data: visitorRows.value.map((item) => item.value),
            type: 'line',
            smooth: false,
            symbol: 'circle',
            symbolSize: 5,
            lineStyle: { width: 2 }
        }
    ]
}))
const environmentInfoList = computed(() => [
    { label: '当前版本', value: versionText.value || '尚未读取' },
    {
        label: '运行框架',
        value: String(workbenchData.version.based || '尚未读取')
    },
    { label: '统计时间', value: lastUpdated.value || '尚未读取' },
    { label: '数据来源', value: '用户、订单及工具访问统计' }
])

/**
 * 函数说明：只标记当前页面的临时自查项，不修改服务器发布状态。
 */
const markAllTodoDone = () => {
    releaseTodoList.forEach((item) => {
        item.done = true
    })
    Message.success('临时自查项已全部勾选；部署状态请在线上验收。')
}

/**
 * 函数说明：清空当前页面的临时自查勾选，所有检查项均恢复为未确认。
 */
const resetTodoList = () => {
    releaseTodoList.forEach((item) => {
        item.done = false
    })
    Message.success('已清空临时自查勾选')
}

/**
 * 函数说明：读取真实工作台数据，12 秒内给出结果；失败保留已加载数据，并提供页面级重试。
 */
const getData = async () => {
    if (loading.value) return
    const sequence = ++requestSequence
    loading.value = true
    errorMessage.value = ''
    try {
        const timeout = new Promise<never>((_, reject) => {
            requestTimer = setTimeout(() => reject(new Error('WORKBENCH_TIMEOUT')), 12000)
        })
        const response = await Promise.race([getWorkbench(), timeout])
        if (sequence !== requestSequence) return
        if (!response || typeof response !== 'object' || Array.isArray(response))
            throw new Error('WORKBENCH_INVALID_RESPONSE')
        workbenchData.version =
            response.version && typeof response.version === 'object' ? response.version : {}
        workbenchData.today =
            response.today && typeof response.today === 'object' ? response.today : {}
        workbenchData.visitor =
            response.visitor && typeof response.visitor === 'object' ? response.visitor : {}
        hasLoaded.value = true
    } catch (error) {
        if (sequence !== requestSequence) return
        console.error('[workbench] 统计数据读取失败', error)
        errorMessage.value = '工作台数据加载失败，请重试'
    } finally {
        if (requestTimer) clearTimeout(requestTimer)
        requestTimer = undefined
        if (sequence === requestSequence) loading.value = false
    }
}

onMounted(() => {
    void getData()
})
onBeforeUnmount(() => {
    requestSequence += 1
    if (requestTimer) clearTimeout(requestTimer)
})
</script>

<style lang="scss" scoped>
.container {
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    padding: 24px;
    box-sizing: border-box;
}
.workbench-heading,
.heading-actions,
.section-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}
.workbench-heading {
    margin-bottom: 24px;
}
h1,
h2,
p {
    margin: 0;
}
h1 {
    color: var(--uied-admin-ink);
    font-size: 24px;
    line-height: 32px;
}
.workbench-heading p {
    margin-top: 4px;
    color: var(--color-text-3);
}
.heading-actions {
    justify-content: flex-end;
}
.data-section {
    margin-top: 24px;
}
.section-heading {
    margin-bottom: 12px;
}
h2 {
    font-size: 16px;
    color: var(--uied-admin-ink);
}
.section-heading > span {
    color: var(--color-text-3);
    font-size: 12px;
}
.panel,
.data-empty {
    background: var(--color-bg-2);
    border: 1px solid var(--uied-admin-border);
    border-radius: var(--uied-admin-radius);
    overflow: hidden;
}
.data-empty {
    padding: 32px 16px;
}
.data-loading {
    display: block;
}
.loading-placeholder {
    min-height: 160px;
    padding: 32px 0;
    color: var(--color-text-3);
}
.metric-note {
    padding: 12px 20px 20px;
    color: var(--color-text-3);
    font-size: 12px;
    line-height: 1.6;
}
.data-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
    padding: 16px;
    border: 1px solid var(--color-danger-light-4);
    border-radius: 8px;
    background: var(--color-danger-light-1);
    color: var(--color-danger-6);
}
.data-error p {
    margin-top: 4px;
    font-size: 12px;
}
.secondary-sections {
    margin-top: 24px;
    display: grid;
    gap: 12px;
}
.secondary-section {
    border: 1px solid var(--uied-admin-border);
    border-radius: 8px;
    background: var(--color-bg-2);
    overflow: hidden;
}
.secondary-section > summary {
    padding: 16px 20px;
    min-height: 48px;
    cursor: pointer;
    color: var(--color-text-1);
    font-weight: 600;
}
.secondary-section > summary span {
    padding-left: 12px;
    color: var(--color-text-3);
    font-size: 12px;
    font-weight: 400;
}
.secondary-section > summary:hover {
    background: var(--color-fill-1);
}
.secondary-section > summary:focus-visible {
    outline: 2px solid var(--uied-admin-accent);
    outline-offset: -3px;
}
@media (max-width: 768px) {
    .container {
        padding: 16px;
    }
    .workbench-heading {
        align-items: flex-start;
    }
    .heading-actions {
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
    }
    .section-heading {
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 4px;
    }
    .secondary-section > summary {
        padding: 12px 16px;
    }
    .secondary-section > summary span {
        display: block;
        padding-left: 16px;
        margin-top: 4px;
    }
}
</style>
