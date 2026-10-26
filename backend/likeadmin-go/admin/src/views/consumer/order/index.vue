<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-30
 */
-->
<template>
    <div class="consumer-order-page pro-page-shell">
        <admin-page-header
            title="订单管理"
            description="查询订单、核对支付与交付状态，按需要处理补单或交付资料。"
        >
            <template #extra
                ><a-space wrap
                    ><span class="order-count">共 {{ pager.count }} 条</span
                    ><a-button @click="handleRefresh">刷新</a-button
                    ><a-button :loading="exporting" @click="handleExport"
                        >导出 CSV</a-button
                    ></a-space
                ></template
            >
        </admin-page-header>
        <div class="order-page-sections">
            <a-card :bordered="false" class="order-panel"
                ><order-overview
                    :summary="linkageSummary"
                    :repair-context="licenseRepairContext"
                    :license-visible="isLicenseFeatureVisible"
                    :loading="summaryLoading"
                    :loaded="summaryLoaded"
                    :error="summaryError"
                    @filter="handleQuickFilterDelivery"
                    @retry="loadLinkageSummary"
                    @return-license="handleGoBackToLicense"
                    @clear-context="handleClearRepairContext"
            /></a-card>
            <a-card :bordered="false" class="order-panel"
                ><order-filters-panel
                    :model-value="queryParams"
                    :license-visible="isLicenseFeatureVisible"
                    :active-filter-count="activeFilterCount"
                    :result-count="pager.lists.length"
                    @patch="updateOrderFilters"
                    @search="handleSearch"
                    @reset="handleResetFilters"
            /></a-card>
            <a-card :bordered="false" class="order-panel"
                ><order-table
                    :records="pager.lists"
                    :state="{
                        loading: pager.loading,
                        loaded: pager.loaded,
                        error: pager.error
                    }"
                    :license-visible="isLicenseFeatureVisible"
                    :row-action-loading="rowActionLoadingMap"
                    @delivery="handleOpenDelivery"
                    @license="handleGoLicense"
                    @check-download="handleCheckDownload"
                    @reissue="handleOpenReissue"
                    @close="handleCloseOrder"
                    @retry="handleRefresh" />
                <div class="order-page-pagination">
                    <pagination v-model="pager" @change="loadOrderList" /></div
            ></a-card>
        </div>
        <order-reissue-dialog
            v-if="reissueModal.visible"
            :model-value="reissueModal"
            :saving="reissueSubmitting"
            :error="reissueError"
            @patch="patchReissueDraft"
            @submit="handleSubmitReissue"
            @close="closeReissueDialog"
        />
        <order-delivery-dialog
            v-if="deliveryModal.visible"
            :model-value="deliveryModal"
            :saving="deliverySubmitting"
            :checking="isRowActionLoading(deliveryModal.orderSn, 'check_download')"
            :error="deliveryError"
            :license-visible="isLicenseFeatureVisible"
            @patch="patchDeliveryDraft"
            @submit="handleSubmitDelivery"
            @close="closeDeliveryDialog"
            @license="handleGoLicenseFromDelivery"
            @apply-system-domain="handleApplySystemDomainToDelivery"
            @check-download="handleCheckDownload(deliveryModal)"
        />
    </div>
</template>

<script setup lang="ts" name="consumerOrderList">
import {
    checkOrderDownload,
    closeOrder,
    exportOrderList,
    getOrderLinkageSummary,
    getOrderList,
    reissueOrder,
    saveOrderDelivery
} from '@/api/consumer'
import { usePaging } from '@/hooks/usePaging'
import { getRoutePath } from '@/router'
import feedback from '@/utils/feedback'
import AdminPageHeader from '@/components/page-header/index.vue'
import OrderOverview from './components/order-overview.vue'
import OrderFiltersPanel from './components/order-filters.vue'
import OrderTable from './components/order-table.vue'
import OrderReissueDialog from './components/order-reissue-dialog.vue'
import OrderDeliveryDialog from './components/order-delivery-dialog.vue'
import { normalizeOrderLinkageSummary, resolveDeliveryCheckText } from './order-display'
import type { OrderFilters, OrderReissueDraft, OrderDeliveryDraft } from './types'

const queryParams = reactive<OrderFilters>({
    keyword: '',
    status: '',
    callbackStatus: '',
    deliveryStatus: '',
    deliveryCheckStatus: '',
    boundDomain: '',
    productType: '',
    startTime: '',
    endTime: ''
})
const reissueSubmitting = ref(false)
const deliverySubmitting = ref(false)
const exporting = ref(false)
const reissueError = ref('')
const deliveryError = ref('')
const summaryLoading = ref(false)
const summaryLoaded = ref(false)
const summaryError = ref('')
let summaryRequestSerial = 0
const route = useRoute()
const router = useRouter()
const orderRouteIdentity = route.name ?? route.path
let routeResetPending = false
const isLicenseFeatureVisible = computed(() => Boolean(getRoutePath('setting:license:detail')))
const rowActionLoadingMap = reactive<Record<string, boolean>>({})
const linkageSummary = ref({
    sourceOrderCount: 0,
    abnormalCount: 0,
    okCount: 0,
    pendingDeliveryCount: 0,
    licenseInactiveCount: 0,
    domainMismatchCount: 0,
    downloadInvalidCount: 0,
    deliveryIncompleteCount: 0,
    expiredCount: 0
})
const reissueModal = reactive<OrderReissueDraft>({
    visible: false,
    orderSn: '',
    tradeNo: '',
    payChannel: 'admin_manual',
    remark: ''
})
const deliveryModal = reactive<OrderDeliveryDraft>({
    id: 0,
    visible: false,
    orderSn: '',
    deliveryStatus: 0,
    deliveryStatusText: '未交付',
    licenseBoundDomain: '',
    licenseKey: '',
    downloadUrl: '',
    deliveryCheckStatus: '',
    deliveryCheckText: '资料完整',
    systemLicenseStatusText: '',
    systemLicenseBoundDomain: '',
    downloadCheckStatus: 0,
    downloadCheckStatusText: '未检测',
    downloadCheckTime: '',
    downloadCheckMessage: '',
    deliveryNote: '',
    deliveredTime: 0
})

/** 合并筛选字段补丁，查询仍由统一搜索或原有清空事件触发。 */
const updateOrderFilters = (patch: Partial<OrderFilters>) => Object.assign(queryParams, patch)
/** 补单中保持提交快照稳定，禁止子组件更新订单号或可见状态。 */
const patchReissueDraft = (patch: Partial<OrderReissueDraft>) => {
    if (reissueSubmitting.value) return
    for (const key of ['tradeNo', 'payChannel', 'remark'] as const)
        if (key in patch) reissueModal[key] = String(patch[key] ?? '')
}
/** 交付编辑只合并允许修改的字段，不接受组件更换目标订单标识。 */
const patchDeliveryDraft = (patch: Partial<OrderDeliveryDraft>) => {
    if (deliverySubmitting.value) return
    for (const key of ['licenseBoundDomain', 'licenseKey', 'downloadUrl', 'deliveryNote'] as const)
        if (key in patch) deliveryModal[key] = String(patch[key] ?? '')
    for (const key of ['deliveryStatus', 'deliveredTime'] as const)
        if (key in patch) deliveryModal[key] = Number(patch[key] ?? 0)
}
/** 关闭补单表单；请求未完成时保持结果可观察，避免另一个订单替换目标。 */
const closeReissueDialog = () => {
    if (!reissueSubmitting.value) reissueModal.visible = false
}
/** 关闭交付表单；保存期间不允许关闭或改换目标订单。 */
const closeDeliveryDialog = () => {
    if (!deliverySubmitting.value) deliveryModal.visible = false
}

/**
 * 函数说明：规范化订单号，统一作为行级动作 loading 的定位 key。
 */
const normalizeOrderSn = (value: unknown) => {
    return String(value || '').trim()
}

/**
 * 函数说明：生成行级动作 loading key，避免单个订单操作冻结整张表。
 */
const getRowActionKey = (orderSn: string, action: string) => {
    return `${String(action || '').trim()}:${normalizeOrderSn(orderSn)}`
}

/**
 * 函数说明：设置指定订单行的动作 loading 状态。
 */
const setRowActionLoading = (orderSn: string, action: string, loading: boolean) => {
    const key = getRowActionKey(orderSn, action)
    if (loading) {
        rowActionLoadingMap[key] = true
        return
    }
    delete rowActionLoadingMap[key]
}

/**
 * 函数说明：判断指定订单行的动作是否处于 loading 状态。
 */
const isRowActionLoading = (orderSn: string, action: string) => {
    return Boolean(rowActionLoadingMap[getRowActionKey(orderSn, action)])
}

/**
 * 函数说明：解析从授权页返回时带上的修单上下文，便于订单页直接告诉运营当前在修哪一单。
 */
const licenseRepairContext = computed(() => ({
    from: String(route.query.from || '').trim(),
    orderSn: String(route.query.orderSn || '').trim(),
    domain: String(route.query.boundDomain || route.query.domain || '').trim(),
    deliveryCheckStatus: String(route.query.deliveryCheckStatus || '').trim(),
    deliveryCheckText: String(route.query.deliveryCheckText || '').trim(),
    licenseStatusText: String(route.query.licenseStatusText || '').trim(),
    isActive:
        String(route.query.from || '').trim() === 'license' &&
        Boolean(
            String(route.query.orderSn || '').trim() ||
                String(route.query.boundDomain || route.query.domain || '').trim() ||
                String(route.query.deliveryCheckStatus || '').trim()
        )
}))

/**
 * 函数说明：统计当前已启用的筛选条件数量，用于筛选提示展示。
 */
const activeFilterCount = computed(() => {
    return [
        queryParams.keyword,
        queryParams.status,
        queryParams.callbackStatus,
        queryParams.deliveryStatus,
        queryParams.deliveryCheckStatus,
        queryParams.boundDomain,
        queryParams.productType,
        queryParams.startTime,
        queryParams.endTime
    ].reduce((count, value) => count + (String(value || '').trim() ? 1 : 0), 0)
})

/**
 * 函数说明：生成 CSV 并触发浏览器下载，支持 UTF-8 BOM 防止中文乱码。
 */
const downloadAsCsv = (filename: string, rows: Array<Record<string, any>>) => {
    const headers = [
        '订单号',
        '用户ID',
        '用户昵称',
        '手机号',
        '商品类型',
        '商品名称',
        '金额',
        '状态',
        '回调状态',
        '交付状态',
        '交付校验',
        '绑定域名',
        '授权码',
        '下载链接',
        '交付时间',
        '交易号',
        '回调时间',
        '回调错误',
        '支付渠道',
        '支付时间',
        '创建时间'
    ]
    const lines = rows.map((item) => {
        return [
            item.orderSn,
            item.userId,
            item.userNickname,
            item.userMobile,
            item.productTypeText,
            item.productName,
            item.amount,
            item.statusText,
            item.callbackStatusText || '未回调',
            item.deliveryStatusText || '未交付',
            item.isSourceDeliveryOrder ? resolveDeliveryCheckText(item) : '不参与',
            item.licenseBoundDomain,
            item.licenseKeyMasked,
            item.downloadUrl,
            item.deliveredTime,
            item.tradeNo,
            item.callbackTime,
            item.callbackError,
            item.payChannel,
            item.paidTime,
            item.createTime
        ]
            .map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`)
            .join(',')
    })
    const csvText = ['\uFEFF' + headers.join(','), ...lines].join('\n')
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
}

/**
 * 函数说明：初始化订单分页查询。
 */
const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getOrderList,
    params: queryParams
})

/**
 * 函数说明：加载交付联动汇总数据，供筛选区上方运营总览卡直接显示。
 */
const loadLinkageSummary = async () => {
    const serial = ++summaryRequestSerial
    summaryLoading.value = true
    summaryError.value = ''
    try {
        const data = normalizeOrderLinkageSummary(await getOrderLinkageSummary())
        if (serial !== summaryRequestSerial) return
        linkageSummary.value = data
        summaryLoaded.value = true
    } catch {
        if (serial === summaryRequestSerial) summaryError.value = '交付概况加载失败，请重试'
    } finally {
        if (serial === summaryRequestSerial) summaryLoading.value = false
    }
}

/**
 * 函数说明：统一刷新订单列表和联动汇总，避免页面不同区域数据不同步。
 */
const refreshOrderPage = async () => {
    await Promise.all([getLists(), loadLinkageSummary()])
}
/** 接住列表交互中的失败，保留 hook 对其它调用方的拒绝语义。 */
const runOrderQuery = async (query: () => Promise<unknown>) => {
    try {
        await query()
        return true
    } catch {
        return false
    }
}
/** 分页时仅刷新当前订单列表，异常交由列表错误区显示。 */
const loadOrderList = () => runOrderQuery(getLists)

/**
 * 函数说明：把路由里的联动筛选参数回填到订单页筛选表单，支持从授权页反向跳转。
 */
const syncFiltersFromRoute = () => {
    queryParams.keyword = String(route.query.orderSn || '').trim()
    queryParams.deliveryCheckStatus = String(route.query.deliveryCheckStatus || '').trim()
    queryParams.boundDomain = String(route.query.boundDomain || route.query.domain || '').trim()
}

/**
 * 函数说明：清理当前路由里的联动筛选参数，避免重置筛选后 URL 仍保留旧上下文。
 */
const clearRouteFilters = async () => {
    if (
        !route.query.orderSn &&
        !route.query.deliveryCheckStatus &&
        !route.query.boundDomain &&
        !route.query.domain &&
        !route.query.licenseStatusText &&
        !route.query.deliveryCheckText &&
        !route.query.from
    ) {
        return
    }
    routeResetPending = true
    try {
        await router.replace({ path: route.path, query: {} })
        // 等待路由监听消费本次清理；随后由重置入口统一请求一次。
        await nextTick()
    } finally {
        routeResetPending = false
    }
}

/**
 * 函数说明：执行订单筛选查询。
 */
const handleSearch = async () => {
    if (await runOrderQuery(() => Promise.all([resetPage(), loadLinkageSummary()])))
        feedback.msgSuccess('订单筛选条件已生效')
}

/**
 * 函数说明：重置订单筛选条件并刷新列表。
 */
const handleResetFilters = async () => {
    await clearRouteFilters()
    if (await runOrderQuery(() => Promise.all([resetParams(), loadLinkageSummary()])))
        feedback.msgSuccess('订单筛选条件已重置')
}

/**
 * 函数说明：刷新当前订单列表。
 */
const handleRefresh = async () => {
    if (await runOrderQuery(refreshOrderPage)) feedback.msgSuccess('订单列表已刷新')
}

/**
 * 函数说明：从联动总览卡快速带入联动状态筛选，减少运营在筛选区重复操作。
 */
const handleQuickFilterDelivery = async (status: string) => {
    queryParams.deliveryCheckStatus = String(status || '').trim()
    await runOrderQuery(() => Promise.all([resetPage(), loadLinkageSummary()]))
}

/**
 * 函数说明：清除从授权页带回的修单上下文，恢复订单页的普通运营视图。
 */
const handleClearRepairContext = async () => {
    await clearRouteFilters()
    if (await runOrderQuery(() => Promise.all([resetParams(), loadLinkageSummary()])))
        feedback.msgSuccess('已退出授权联动修复上下文')
}

/**
 * 函数说明：触发后台补单，补发会员权益或积分。
 */
const handleOpenReissue = (orderSn: string) => {
    if (reissueSubmitting.value) return
    reissueError.value = ''
    const targetOrderSn = String(orderSn || '').trim()
    if (!targetOrderSn) {
        return
    }
    reissueModal.visible = true
    reissueModal.orderSn = targetOrderSn
    reissueModal.tradeNo = ''
    reissueModal.payChannel = 'admin_manual'
    reissueModal.remark = ''
}

/**
 * 函数说明：打开订单交付弹窗，回填当前交付状态与授权信息。
 */
const handleOpenDelivery = (record: Record<string, any>) => {
    if (deliverySubmitting.value) return
    deliveryError.value = ''
    deliveryModal.visible = true
    deliveryModal.id = Number(record.id || 0)
    deliveryModal.orderSn = String(record.orderSn || '').trim()
    deliveryModal.deliveryStatus = Number(record.deliveryStatus || 0)
    deliveryModal.deliveryStatusText = String(record.deliveryStatusText || '未交付')
    deliveryModal.licenseBoundDomain = String(record.licenseBoundDomain || '').trim()
    deliveryModal.licenseKey = String(record.licenseKey || '').trim()
    deliveryModal.downloadUrl = String(record.downloadUrl || '').trim()
    deliveryModal.deliveryCheckStatus = String(record.deliveryCheckStatus || '').trim()
    deliveryModal.deliveryCheckText = resolveDeliveryCheckText(record)
    deliveryModal.systemLicenseStatusText = String(record.systemLicenseStatusText || '').trim()
    deliveryModal.systemLicenseBoundDomain = String(record.systemLicenseBoundDomain || '').trim()
    deliveryModal.downloadCheckStatus = Number(record.downloadCheckStatus || 0)
    deliveryModal.downloadCheckStatusText = String(record.downloadCheckStatusText || '未检测')
    deliveryModal.downloadCheckTime = String(record.downloadCheckTime || '')
    deliveryModal.downloadCheckMessage = String(record.downloadCheckMessage || '')
    deliveryModal.deliveryNote = String(record.deliveryNote || '').trim()
    deliveryModal.deliveredTime = Number(record.deliveredTimeValue || 0)
}

/**
 * 函数说明：确认提交订单补单，支持补充交易号与备注，便于后续审计。
 */
const handleSubmitReissue = async () => {
    if (reissueSubmitting.value) return false
    const targetOrderSn = String(reissueModal.orderSn || '').trim()
    if (!targetOrderSn) {
        feedback.msgWarning('订单号不能为空')
        return false
    }
    const payload = {
        orderSn: targetOrderSn,
        tradeNo: String(reissueModal.tradeNo || '').trim(),
        payChannel: String(reissueModal.payChannel || '').trim() || 'admin_manual',
        remark: String(reissueModal.remark || '').trim()
    }
    reissueSubmitting.value = true
    reissueError.value = ''
    try {
        await reissueOrder(payload)
        if (reissueModal.orderSn === targetOrderSn) reissueModal.visible = false
        feedback.msgSuccess('补单成功，权益已补发')
        await runOrderQuery(refreshOrderPage)
        return true
    } catch (error) {
        reissueError.value = '补单未成功，已保留填写内容，请核对后重试。'
        if (!(error as { notified?: boolean })?.notified) feedback.msgError(reissueError.value)
        return false
    } finally {
        reissueSubmitting.value = false
    }
}

/**
 * 函数说明：保存订单交付信息，统一记录源码交付状态、绑定域名和下载链接。
 */
const handleSubmitDelivery = async () => {
    if (deliverySubmitting.value) return false
    const targetOrderSn = String(deliveryModal.orderSn || '').trim()
    if (!targetOrderSn) {
        feedback.msgWarning('订单号不能为空')
        return false
    }
    const targetId = deliveryModal.id
    const payload = {
        orderSn: targetOrderSn,
        deliveryStatus: Number(deliveryModal.deliveryStatus || 0),
        licenseBoundDomain: String(deliveryModal.licenseBoundDomain || '').trim(),
        licenseKey: String(deliveryModal.licenseKey || '').trim(),
        downloadUrl: String(deliveryModal.downloadUrl || '').trim(),
        deliveryNote: String(deliveryModal.deliveryNote || '').trim(),
        deliveredTime: Number(deliveryModal.deliveredTime || 0)
    }
    deliverySubmitting.value = true
    deliveryError.value = ''
    try {
        await saveOrderDelivery(payload)
        if (deliveryModal.id === targetId && deliveryModal.orderSn === targetOrderSn)
            deliveryModal.visible = false
        feedback.msgSuccess('订单交付信息已保存')
        await runOrderQuery(refreshOrderPage)
        return true
    } catch (error) {
        deliveryError.value = '交付信息保存失败，您的修改已保留，请重试。'
        if (!(error as { notified?: boolean })?.notified) feedback.msgError(deliveryError.value)
        return false
    } finally {
        deliverySubmitting.value = false
    }
}

/**
 * 函数说明：手动检测订单下载链接可访问性，并刷新列表和弹窗状态。
 */
const handleCheckDownload = async (record: Record<string, any>) => {
    const targetId = Number(record.id || deliveryModal.id || 0)
    const targetOrderSn = normalizeOrderSn(record.orderSn || deliveryModal.orderSn)
    if (targetId <= 0 || !targetOrderSn) {
        feedback.msgWarning('订单信息无效，无法检测下载链接')
        return false
    }
    if (isRowActionLoading(targetOrderSn, 'check_download')) return false
    const modalDownloadUrl = deliveryModal.downloadUrl
    setRowActionLoading(targetOrderSn, 'check_download', true)
    try {
        const data: any = await checkOrderDownload({ id: targetId })
        const latestOrder = data?.order
        if (
            !latestOrder ||
            typeof latestOrder !== 'object' ||
            Array.isArray(latestOrder) ||
            ![0, 1, 2].includes(Number(latestOrder.downloadCheckStatus)) ||
            (latestOrder.id !== undefined && Number(latestOrder.id) !== targetId) ||
            (latestOrder.orderSn !== undefined &&
                normalizeOrderSn(latestOrder.orderSn) !== targetOrderSn)
        )
            throw new Error('invalid order response')
        // 只回填仍然对应本次订单与链接的检查信息；A 的迟到结果不会覆盖 B 的弹窗或新草稿。
        if (
            deliveryModal.id === targetId &&
            normalizeOrderSn(deliveryModal.orderSn) === targetOrderSn &&
            deliveryModal.downloadUrl === modalDownloadUrl
        ) {
            deliveryModal.downloadCheckStatus = Number(latestOrder.downloadCheckStatus || 0)
            deliveryModal.downloadCheckStatusText = String(
                latestOrder.downloadCheckStatusText || '未检测'
            )
            deliveryModal.downloadCheckTime = String(latestOrder.downloadCheckTime || '')
            deliveryModal.downloadCheckMessage = String(latestOrder.downloadCheckMessage || '')
            deliveryModal.deliveryCheckStatus = String(
                latestOrder.deliveryCheckStatus || deliveryModal.deliveryCheckStatus || ''
            ).trim()
            deliveryModal.deliveryCheckText = String(
                latestOrder.deliveryCheckText || deliveryModal.deliveryCheckText || '资料完整'
            )
        }
        feedback.msgSuccess(
            Number(latestOrder.downloadCheckStatus) === 1
                ? '下载链接检测通过'
                : '下载链接检测已完成'
        )
        await runOrderQuery(refreshOrderPage)
        return true
    } catch (error) {
        if (!(error as { notified?: boolean })?.notified)
            feedback.msgError('下载链接检测失败，请重试。')
        return false
    } finally {
        setRowActionLoading(targetOrderSn, 'check_download', false)
    }
}

/**
 * 函数说明：将系统授权域名快速回填到交付弹窗，减少运营在域名对齐场景下的重复录入。
 */
const handleApplySystemDomainToDelivery = () => {
    if (!deliveryModal.systemLicenseBoundDomain) {
        feedback.msgWarning('当前没有可用的系统授权域名')
        return
    }
    deliveryModal.licenseBoundDomain = deliveryModal.systemLicenseBoundDomain
    feedback.msgSuccess('已回填系统授权域名，请保存订单交付信息')
}

/**
 * 函数说明：从订单页跳转到授权管理页，并带上当前订单上下文用于快速修复授权。
 */
const handleGoLicense = async (record: Record<string, any>) => {
    const licensePath = getRoutePath('setting:license:detail')
    if (!licensePath) {
        feedback.msgWarning('授权功能当前未启用')
        return
    }
    await router.push({
        path: licensePath,
        query: {
            from: 'order-delivery',
            orderSn: String(record.orderSn || '').trim(),
            domain: String(record.licenseBoundDomain || '').trim(),
            licenseKey: String(record.licenseKeyMasked || '').trim(),
            deliveryCheckStatus: String(record.deliveryCheckStatus || '').trim(),
            deliveryCheckText: resolveDeliveryCheckText(record),
            licenseStatusText: String(record.systemLicenseStatusText || '').trim()
        }
    })
}

/**
 * 函数说明：从订单页返回授权页，并保留当前修单上下文，避免运营在两个页面来回切换时丢失目标订单。
 */
const handleGoBackToLicense = async () => {
    const licensePath = getRoutePath('setting:license:detail')
    if (!licensePath || !licenseRepairContext.value.isActive) {
        return
    }
    await router.push({
        path: licensePath,
        query: {
            from: 'order-delivery',
            orderSn: licenseRepairContext.value.orderSn,
            domain: licenseRepairContext.value.domain,
            deliveryCheckStatus: licenseRepairContext.value.deliveryCheckStatus,
            deliveryCheckText: licenseRepairContext.value.deliveryCheckText,
            licenseStatusText: licenseRepairContext.value.licenseStatusText
        }
    })
}

/**
 * 函数说明：在交付弹窗内直接跳转到授权管理页，保留当前订单修复上下文。
 */
const handleGoLicenseFromDelivery = async () => {
    const licensePath = getRoutePath('setting:license:detail')
    if (!licensePath) {
        feedback.msgWarning('授权功能当前未启用')
        return
    }
    await router.push({
        path: licensePath,
        query: {
            from: 'order-delivery',
            orderSn: String(deliveryModal.orderSn || '').trim(),
            domain: String(deliveryModal.licenseBoundDomain || '').trim(),
            licenseKey: String(deliveryModal.licenseKey || '').trim(),
            deliveryCheckStatus: String(deliveryModal.deliveryCheckStatus || '').trim(),
            deliveryCheckText: String(deliveryModal.deliveryCheckText || '').trim(),
            licenseStatusText: String(deliveryModal.systemLicenseStatusText || '').trim()
        }
    })
}

/**
 * 函数说明：关闭待支付订单，防止重复支付或脏订单积压。
 */
const handleCloseOrder = async (orderSn: string) => {
    const targetOrderSn = String(orderSn || '').trim()
    if (!targetOrderSn || isRowActionLoading(targetOrderSn, 'close')) return false
    setRowActionLoading(targetOrderSn, 'close', true)
    try {
        try {
            await feedback.confirm(
                `确定关闭订单「${targetOrderSn}」吗？关闭后该订单将无法继续支付，请先确认当前状态是否正确。`
            )
        } catch {
            return false
        }
        await closeOrder({ orderSn: targetOrderSn })
        feedback.msgSuccess('订单已关闭')
        await runOrderQuery(refreshOrderPage)
        return true
    } catch (error) {
        if (!(error as { notified?: boolean })?.notified)
            feedback.msgError('关闭订单失败，请刷新状态后重试。')
        return false
    } finally {
        setRowActionLoading(targetOrderSn, 'close', false)
    }
}

/**
 * 函数说明：按当前筛选条件导出订单 CSV。
 */
const handleExport = async () => {
    if (exporting.value) return false
    const filters = { ...queryParams }
    exporting.value = true
    try {
        const data = await exportOrderList(filters)
        const lists = Array.isArray(data?.lists) ? data.lists : []
        if (lists.length === 0) {
            feedback.msgWarning('暂无可导出的订单数据')
            return false
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        downloadAsCsv(`uiedtool-orders-${timestamp}.csv`, lists)
        feedback.msgSuccess(`已导出 ${lists.length} 条订单`)
        return true
    } catch (error) {
        if (!(error as { notified?: boolean })?.notified)
            feedback.msgError('订单导出失败，请重试。')
        return false
    } finally {
        exporting.value = false
    }
}

/** 路由进入是唯一自动读取入口，避免首次激活重复读，以及缓存页离开后仍跟随其它页面请求。 */
watch(
    () => route.fullPath,
    async () => {
        if (routeResetPending || (route.name ?? route.path) !== orderRouteIdentity) return
        syncFiltersFromRoute()
        pager.page = 1
        await runOrderQuery(refreshOrderPage)
    },
    { immediate: true }
)
</script>
<style scoped lang="scss">
.consumer-order-page {
    padding: 20px 24px;
    min-width: 0;
}
.order-count {
    font-size: 13px;
    color: var(--color-text-3);
}
.order-page-sections {
    display: grid;
    gap: 16px;
}
.order-panel {
    border: 1px solid var(--uied-admin-border);
    border-radius: var(--uied-admin-radius);
    min-width: 0;
}
.order-page-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    max-width: 100%;
    overflow-x: auto;
}
@media (max-width: 600px) {
    .consumer-order-page {
        padding: 16px 12px;
    }
    .order-panel :deep(.arco-card-body) {
        padding: 16px;
    }
    .order-page-pagination :deep(.arco-pagination-jumper) {
        display: none;
    }
}
</style>
