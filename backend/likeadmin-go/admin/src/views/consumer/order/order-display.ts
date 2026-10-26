/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import type { TableColumnData } from '@arco-design/web-vue'
import type { OrderLinkageSummary } from './types'

/**
 * 函数说明：订单列表表格列定义，统一输出运营核心字段。
 */
export const allOrderColumns: TableColumnData[] = [
    { title: '订单号', dataIndex: 'orderSn', width: 210 },
    { title: '用户ID', dataIndex: 'userId', width: 90 },
    {
        title: '用户昵称',
        dataIndex: 'userNickname',
        width: 130,
        ellipsis: true,
        tooltip: true
    },
    { title: '手机号', dataIndex: 'userMobile', width: 140 },
    { title: '商品类型', dataIndex: 'productTypeText', width: 110 },
    {
        title: '商品名称',
        dataIndex: 'productName',
        width: 150,
        ellipsis: true,
        tooltip: true
    },
    { title: '金额', dataIndex: 'amount', width: 100, slotName: 'amount' },
    { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
    {
        title: '回调状态',
        dataIndex: 'callbackStatus',
        width: 110,
        slotName: 'callbackStatus'
    },
    {
        title: '交易号',
        dataIndex: 'tradeNo',
        width: 190,
        ellipsis: true,
        tooltip: true
    },
    { title: '回调时间', dataIndex: 'callbackTime', width: 170 },
    {
        title: '回调错误',
        dataIndex: 'callbackError',
        width: 220,
        slotName: 'callbackError'
    },
    {
        title: '交付状态',
        dataIndex: 'deliveryStatus',
        width: 110,
        slotName: 'deliveryStatus'
    },
    {
        title: '交付校验',
        dataIndex: 'deliveryCheck',
        width: 320,
        slotName: 'deliveryCheck'
    },
    {
        title: '交付信息',
        dataIndex: 'deliveryInfo',
        width: 280,
        slotName: 'deliveryInfo'
    },
    { title: '会员天数', dataIndex: 'memberDays', width: 100 },
    { title: '基础积分', dataIndex: 'points', width: 100 },
    { title: '赠送积分', dataIndex: 'giftPoints', width: 100 },
    { title: '支付渠道', dataIndex: 'payChannel', width: 120 },
    { title: '支付时间', dataIndex: 'paidTime', width: 170 },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    {
        title: '操作',
        dataIndex: 'action',
        width: 280,
        fixed: 'right',
        slotName: 'action'
    }
]

/**
 * 函数说明：订单状态颜色映射，便于运营快速识别处理优先级。
 */
export const resolveStatusColor = (status: number | string) => {
    const value = Number(status)
    if (value === 1) {
        return 'green'
    }
    if (value === 2) {
        return 'gray'
    }
    return 'orange'
}

/**
 * 函数说明：回调状态颜色映射，便于运营快速识别回调异常订单。
 */
export const resolveCallbackStatusColor = (status: number | string) => {
    const value = Number(status)
    if (value === 1) {
        return 'green'
    }
    if (value === 2) {
        return 'red'
    }
    return 'orange'
}

/**
 * 函数说明：交付状态颜色映射，便于运营快速识别源码交付进度。
 */
export const resolveDeliveryStatusColor = (status: number | string) => {
    const value = Number(status)
    if (value === 1) {
        return 'green'
    }
    if (value === 2) {
        return 'orange'
    }
    if (value === 3) {
        return 'red'
    }
    return 'gray'
}

/**
 * 函数说明：收集订单交付链路缺失项，便于后台快速识别“已交付但资料不完整”的异常。
 */
export const collectDeliveryIssues = (record: Record<string, any>) => {
    const issues = Array.isArray(record.deliveryIssues) ? record.deliveryIssues : []
    return issues.map((item) => String(item || '').trim()).filter(Boolean)
}

/**
 * 函数说明：输出后台订单交付校验标签颜色，统一运营对交付完整性的识别方式。
 */
export const resolveDeliveryCheckColor = (record: Record<string, any>) => {
    const status = String(record.deliveryCheckStatus || '').trim()
    if (!status) {
        return 'gray'
    }
    if (status === 'ok') {
        return 'green'
    }
    if (status === 'expired' || status === 'license_inactive' || status === 'download_invalid') {
        return 'red'
    }
    return 'orange'
}

/**
 * 函数说明：输出后台订单交付校验文案，直接提示当前记录还缺哪一步。
 */
export const resolveDeliveryCheckText = (record: Record<string, any>) => {
    if (!record.isSourceDeliveryOrder) {
        return '不参与'
    }
    return String(record.deliveryCheckText || '资料完整')
}

/**
 * 函数说明：输出下载检测标签颜色，便于运营在弹窗内直接识别链接健康度。
 */
export const resolveDownloadCheckTagColor = (status: number | string) => {
    const value = Number(status || 0)
    if (value === 1) {
        return 'green'
    }
    if (value === 2) {
        return 'red'
    }
    return 'gray'
}

/** 按展示模式选择列；完整模式保留原有全部字段，手机不固定操作列遮挡订单信息。 */
export const buildVisibleOrderColumns = (
    allFields: boolean,
    mobile: boolean
): TableColumnData[] => {
    const coreFields = new Set([
        'orderSn',
        'userNickname',
        'productName',
        'amount',
        'status',
        'deliveryStatus',
        'deliveryCheck',
        'createTime',
        'action'
    ])
    return allOrderColumns
        .filter((column) => allFields || coreFields.has(String(column.dataIndex)))
        .map((column) => ({ ...column, fixed: mobile ? undefined : column.fixed }))
}

/** 校验汇总响应后再显示统计；兼容缺少较新统计项的服务端，但不把失败响应当作零订单。 */
export const normalizeOrderLinkageSummary = (value: unknown): OrderLinkageSummary => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error('订单汇总响应无效')
    const data = value as Record<string, unknown>
    if (
        !['sourceOrderCount', 'abnormalCount'].every(
            (key) =>
                typeof data[key] === 'number' &&
                Number.isFinite(data[key]) &&
                Number(data[key]) >= 0
        )
    )
        throw new Error('订单汇总响应不完整')
    const keys = [
        'sourceOrderCount',
        'abnormalCount',
        'okCount',
        'pendingDeliveryCount',
        'licenseInactiveCount',
        'domainMismatchCount',
        'downloadInvalidCount',
        'deliveryIncompleteCount',
        'expiredCount'
    ] as const
    return Object.fromEntries(
        keys.map((key) => [
            key,
            Number.isFinite(Number(data[key])) ? Math.max(0, Number(data[key])) : 0
        ])
    ) as unknown as OrderLinkageSummary
}
