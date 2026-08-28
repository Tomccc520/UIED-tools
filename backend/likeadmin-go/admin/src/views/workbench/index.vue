<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <div class="container">
        <a-spin :loading="loading" tip="正在加载工作台数据..." style="display: block">
            <div class="workbench-shell">
                <div class="left-side">
                    <banner-panel
                        :admin-name="adminName"
                        :period-greeting="periodGreeting"
                        :version-text="versionText"
                        :highlight-list="welcomeHighlightList"
                    />

                    <div class="panel">
                        <data-panel :metric-items="todayCards" />
                        <trend-panel :option="workbenchData.visitorOption" />
                    </div>

                    <a-grid :cols="24" :col-gap="16" :row-gap="16" class="left-bottom-grid">
                        <a-grid-item :span="{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 }">
                            <operation-tips-panel :tips="operationTips" />
                        </a-grid-item>
                        <a-grid-item :span="{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12, xxl: 12 }">
                            <release-todo-panel
                                :todo-list="releaseTodoList"
                                :pending-count="releaseTodoStats.pendingCount"
                                :percent="releaseChecklistPercent"
                                @mark-all="markAllTodoDone"
                                @reset="resetTodoList"
                            />
                        </a-grid-item>
                    </a-grid>
                </div>

                <div class="right-side">
                    <div class="panel moduler-wrap action-hub-panel">
                        <quick-operation-panel :menu-list="quickMenuCards" />
                        <shortcut-panel :items="actionButtonList" />
                    </div>
                    <system-status-panel
                        :environment-info-list="environmentInfoList"
                        :status-progress-list="statusProgressList"
                    />
                    <support-panel :support-list="supportList" />
                </div>
            </div>
        </a-spin>
    </div>
</template>

<script lang="ts" setup name="workbench">
import { Message } from '@arco-design/web-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { getWorkbench } from '@/api/app'
import useUserStore from '@/stores/modules/user'
import menu_admin from './image/menu_admin.png'
import menu_role from './image/menu_role.png'
import menu_dept from './image/menu_dept.png'
import menu_dict from './image/menu_dict.png'
import menu_generator from './image/menu_generator.png'
import menu_file from './image/menu_file.png'
import menu_auth from './image/menu_auth.png'
import menu_web from './image/menu_web.png'
import qq_group from './image/qq_group.png'
import customer_service from './image/customer_service.png'
import BannerPanel from './components/banner-panel.vue'
import DataPanel from './components/data-panel.vue'
import TrendPanel from './components/trend-panel.vue'
import QuickOperationPanel from './components/quick-operation-panel.vue'
import OperationTipsPanel from './components/operation-tips-panel.vue'
import ShortcutPanel from './components/shortcut-panel.vue'
import ReleaseTodoPanel from './components/release-todo-panel.vue'
import SystemStatusPanel from './components/system-status-panel.vue'
import SupportPanel from './components/support-panel.vue'

interface WorkbenchQuickMenuItem {
    name: string
    image: string
    url: string
}

interface WorkbenchSupportItem {
    image: string
    title: string
    desc: string
}

interface ReleaseTodoItem {
    key: string
    label: string
    done: boolean
}

const userStore = useUserStore()
const loading = ref(false)

const actionButtonList = [
    { label: '前端布局', to: '/official_site/frontend_layout', short: 'LAY' },
    { label: '侧栏菜单', to: '/official_site/sidebar', short: 'SID' },
    { label: '头部设置', to: '/official_site/header', short: 'HDR' },
    { label: '页脚设置', to: '/official_site/footer', short: 'FTR' },
    { label: '工具主数据', to: '/official_site/tools_catalog', short: 'TOOL' },
    { label: 'SEO设置', to: '/official_site/seo', short: 'SEO' }
]

const quickLinkDescMap: Record<string, string> = {
    管理员: '账号与权限维护',
    角色管理: '权限组与能力分配',
    部门管理: '组织架构配置',
    字典管理: '基础枚举配置',
    代码生成器: '模块快速搭建',
    素材中心: '图片与图标资产',
    图标库: 'SVG 菜单图标维护',
    菜单权限: '路由与按钮权限',
    网站信息: '官网基础信息设置'
}

/**
 * 函数说明：把接口返回的数值统一转成可读字符串，避免直接出现空值。
 */
const formatMetricValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') {
        return '--'
    }
    return String(value)
}

/**
 * 函数说明：把任意输入安全转成数字，供工作台统计计算使用。
 */
const toNumber = (value: unknown): number => {
    const numericValue = Number(value)
    return Number.isFinite(numericValue) ? numericValue : 0
}

/**
 * 函数说明：根据当前小时返回问候语，增强工作台首屏的亲和感。
 */
const getPeriodGreeting = (): string => {
    const hour = new Date().getHours()
    if (hour < 6) return '凌晨好'
    if (hour < 12) return '上午好'
    if (hour < 18) return '下午好'
    return '晚上好'
}

/**
 * 函数说明：从用户信息中提取展示名称，兼容 nickname、name、username 等字段。
 */
const pickUserDisplayName = (userInfo: Record<string, any>): string => {
    return (
        String(userInfo?.nickname || '') ||
        String(userInfo?.name || '') ||
        String(userInfo?.username || '') ||
        '管理员'
    )
}

/**
 * 函数说明：输出快捷入口说明文案，保证工作台入口语义清晰。
 */
const resolveQuickDesc = (name: string): string => {
    return quickLinkDescMap[name] || '进入该模块继续配置'
}

const workbenchData = reactive({
    version: {
        version: '',
        website: '',
        based: '',
        channel: {
            gitee: '',
            website: ''
        }
    },
    support: [
        {
            image: qq_group,
            title: '扫码进入 QQ 交流群',
            desc: '技术问题、版本动态、功能建议可在群内实时沟通。'
        },
        {
            image: customer_service,
            title: '添加企业客服微信',
            desc: '商务合作、私有部署、售后支持可通过客服一对一沟通。'
        }
    ] as WorkbenchSupportItem[],
    today: {} as Record<string, any>,
    menu: [
        { name: '管理员', image: menu_admin, url: '/permission/admin' },
        { name: '角色管理', image: menu_role, url: '/permission/role' },
        { name: '部门管理', image: menu_dept, url: '/organization/department' },
        { name: '字典管理', image: menu_dict, url: '/dev_tools/dict' },
        { name: '代码生成器', image: menu_generator, url: '/dev_tools/code' },
        { name: '素材中心', image: menu_file, url: '/material/index' },
        { name: '图标库', image: menu_file, url: '/material/icons' },
        { name: '菜单权限', image: menu_auth, url: '/permission/menu' },
        { name: '网站信息', image: menu_web, url: '/official_site/information' }
    ] as WorkbenchQuickMenuItem[],
    visitor: {},
    visitorOption: {
        grid: {
            left: 40,
            right: 20,
            top: 26,
            bottom: 30
        },
        xAxis: {
            type: 'category',
            data: [0],
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            splitLine: {
                lineStyle: {
                    color: '#edf0f5'
                }
            }
        },
        tooltip: {
            trigger: 'axis'
        },
        series: [
            {
                name: '访问量',
                data: [0],
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 7,
                lineStyle: {
                    width: 3,
                    color: '#6c54ff'
                },
                itemStyle: {
                    color: '#6c54ff'
                },
                areaStyle: {
                    color: 'rgba(108, 84, 255, 0.16)'
                }
            }
        ]
    }
})

const defaultReleaseTodoTemplate: ReleaseTodoItem[] = [
    { key: 'navbar-check', label: '检查顶部导航按钮交互（搜索 / 通知 / 设置）', done: true },
    { key: 'official-check', label: '核对官网设置中的菜单、头部、页脚、SEO 配置', done: false },
    { key: 'model-check', label: '检查 AI 模型管理配置与前端调用状态', done: false },
    { key: 'publish-check', label: '发布前执行菜单和官网设置冒烟回归', done: false }
]
const releaseTodoList = reactive(defaultReleaseTodoTemplate.map((item) => ({ ...item })))

const adminName = computed(() => pickUserDisplayName(userStore.userInfo))
const periodGreeting = computed(() => getPeriodGreeting())
const versionText = computed(() => formatMetricValue(workbenchData.version.version))

/**
 * 函数说明：工作台顶部的关键指标卡，保持官方 Workplace 首屏四列节奏。
 */
const todayCards = computed(() => [
    {
        key: 'visits',
        icon: 'PV',
        label: '今日访问量',
        value: formatMetricValue(workbenchData.today.todayVisits),
        totalLabel: '累计访问',
        totalValue: formatMetricValue(workbenchData.today.totalVisits)
    },
    {
        key: 'sales',
        icon: 'GMV',
        label: '今日销售额',
        value: formatMetricValue(workbenchData.today.todaySales),
        totalLabel: '累计销售',
        totalValue: formatMetricValue(workbenchData.today.totalSales)
    },
    {
        key: 'orders',
        icon: 'ORD',
        label: '今日订单量',
        value: formatMetricValue(workbenchData.today.todayOrder),
        totalLabel: '累计订单',
        totalValue: formatMetricValue(workbenchData.today.totalOrder)
    },
    {
        key: 'users',
        icon: 'USR',
        label: '新增用户',
        value: formatMetricValue(workbenchData.today.todayUsers),
        totalLabel: '累计用户',
        totalValue: formatMetricValue(workbenchData.today.totalUsers)
    }
])

/**
 * 函数说明：控制工作台快捷入口数量，避免左下角区域信息过载。
 */
const quickMenuList = computed<WorkbenchQuickMenuItem[]>(() => {
    const list = Array.isArray(workbenchData.menu) ? workbenchData.menu : []
    return list.slice(0, 6)
})

/**
 * 函数说明：将快捷入口转换为展示卡片，提前补齐描述文案。
 */
const quickMenuCards = computed(() => {
    return quickMenuList.value.map((item) => ({
        ...item,
        desc: resolveQuickDesc(item.name)
    }))
})

const supportList = computed<WorkbenchSupportItem[]>(() => {
    return Array.isArray(workbenchData.support) ? workbenchData.support : []
})

/**
 * 函数说明：输出系统环境信息，方便工作台右栏快速确认版本状态。
 */
const environmentInfoList = computed(() => [
    {
        label: '运行框架',
        value: formatMetricValue(workbenchData.version.based)
    },
    {
        label: '当前版本',
        value: formatMetricValue(workbenchData.version.version)
    },
    {
        label: '发布渠道',
        value: '官网 / Gitee / GitHub'
    },
    {
        label: '最后更新',
        value: formatMetricValue(workbenchData.today.time)
    }
])

/**
 * 函数说明：根据当日核心指标生成运营建议，增强工作台可操作性。
 */
const operationTips = computed(() => {
    const tips: string[] = []
    const todayVisits = toNumber(workbenchData.today.todayVisits)
    const todayUsers = toNumber(workbenchData.today.todayUsers)
    const todayOrder = toNumber(workbenchData.today.todayOrder)
    const todaySales = toNumber(workbenchData.today.todaySales)

    if (todayVisits <= 0) {
        tips.push('今日访问量暂无增长，建议先检查首页 Banner 和热门工具位配置。')
    } else {
        tips.push(`今日访问量 ${todayVisits}，建议继续优化高转化工具页首屏文案。`)
    }

    if (todayUsers <= 0) {
        tips.push('新增用户为 0，建议重点检查登录入口与会员引导链路。')
    } else {
        tips.push(`新增用户 ${todayUsers}，可同步评估会员转化漏斗表现。`)
    }

    if (todayOrder <= 0) {
        tips.push('当前订单较低，建议在首页增加商业版升级引导与促销位。')
    } else {
        tips.push(`今日订单 ${todayOrder} 笔，建议持续观察支付成功率与退款率。`)
    }

    if (todaySales <= 0) {
        tips.push('当前销售额为 0，建议复核付费页和购买闭环是否正常。')
    }

    return tips.slice(0, 4)
})

/**
 * 函数说明：欢迎区保留两条最关键的运营提示，避免首屏文案过长。
 */
const welcomeHighlightList = computed(() => {
    const list = operationTips.value.slice(0, 1)
    if (list.length > 0) {
        return list
    }
    return ['建议先完成官网设置中的菜单、头部和页脚配置。']
})

/**
 * 函数说明：计算右栏系统状态条百分比，作为环境健康度展示。
 */
const statusProgressList = computed(() => {
    const todayVisits = toNumber(workbenchData.today.todayVisits)
    const todayUsers = toNumber(workbenchData.today.todayUsers)
    const todayOrder = toNumber(workbenchData.today.todayOrder)
    const todaySales = toNumber(workbenchData.today.todaySales)

    return [
        { label: '访问健康度', percent: Math.min(100, Math.max(8, Math.round(todayVisits / 2))) },
        { label: '用户增长度', percent: Math.min(100, Math.max(8, Math.round(todayUsers / 2))) },
        { label: '订单转化度', percent: Math.min(100, Math.max(8, Math.round(todayOrder * 4))) },
        { label: '营收完成度', percent: Math.min(100, Math.max(8, Math.round(todaySales / 5))) }
    ]
})

/**
 * 函数说明：统计待办完成情况，供右栏发布进度展示。
 */
const releaseTodoStats = computed(() => {
    const pendingCount = releaseTodoList.filter((item) => !item.done).length
    return {
        totalCount: releaseTodoList.length,
        pendingCount
    }
})

/**
 * 函数说明：计算发布待办完成度百分比，用于右栏标签展示。
 */
const releaseChecklistPercent = computed(() => {
    const { totalCount, pendingCount } = releaseTodoStats.value
    if (!totalCount) {
        return 0
    }
    return Math.round(((totalCount - pendingCount) / totalCount) * 100)
})

/**
 * 函数说明：将待办项全部标记完成，便于发版前快速收口。
 */
const markAllTodoDone = () => {
    releaseTodoList.forEach((item) => {
        item.done = true
    })
    Message.success('今日待办已全部标记完成')
}

/**
 * 函数说明：恢复默认待办清单，避免误操作后无法回退。
 */
const resetTodoList = () => {
    const initialTodoList = defaultReleaseTodoTemplate.map((item) => ({ ...item }))
    releaseTodoList.splice(0, releaseTodoList.length, ...initialTodoList)
    Message.success('已恢复默认待办清单')
}

/**
 * 函数说明：获取工作台核心数据并同步写入趋势图，保留原有接口契约不变。
 */
const getData = async () => {
    loading.value = true
    try {
        const res = await getWorkbench()
        workbenchData.version = res.version || workbenchData.version
        workbenchData.today = res.today || {}
        workbenchData.visitor = res.visitor || {}

        if (Array.isArray(res.menu) && res.menu.length) {
            workbenchData.menu = res.menu
        }
        if (Array.isArray(res.support) && res.support.length) {
            workbenchData.support = res.support
        }

        const visitorDate = Array.isArray(res.visitor?.date) ? res.visitor.date : []
        const visitorList = Array.isArray(res.visitor?.list) ? res.visitor.list : []
        workbenchData.visitorOption.xAxis.data = visitorDate.length ? visitorDate : ['--']
        workbenchData.visitorOption.series[0].data = visitorList.length ? visitorList : [0]
    } catch (error) {
        Message.error('获取工作台数据失败，请稍后重试')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    void getData()
})
</script>

<style lang="scss" scoped>
.container {
    /* 大屏限制工作台内容宽度并居中，避免 2K/4K 屏幕卡片被无限拉宽。 */
    width: 100%;
    max-width: 1840px;
    margin: 0 auto;
    box-sizing: border-box;
    background-color: var(--color-fill-2);
    padding: 16px 20px;
    padding-bottom: 0;
}

.workbench-shell {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 296px;
    gap: 16px;
    align-items: flex-start;
}

.left-side {
    flex: 1;
    min-width: 0;
}

.right-side {
    width: 296px;
    flex-shrink: 0;
}

.panel {
    background-color: var(--color-bg-2);
    border-radius: 4px;
    overflow: hidden;
}

.moduler-wrap {
    border-radius: 4px;
    background-color: var(--color-bg-2);
}

.left-bottom-grid {
    margin-top: 16px;
}

.action-hub-panel {
    overflow: hidden;
}

@media (max-width: 1220px) {
    .right-side {
        width: 272px;
    }
}

@media (max-width: 1120px) {
    .workbench-shell {
        display: block;
    }

    .right-side {
        width: 100%;
        margin-top: 16px;
    }
}

@media (max-width: 960px) {
    .container {
        padding: 12px 12px 0;
    }

    .left-bottom-grid {
        margin-top: 12px;
    }
}
</style>
