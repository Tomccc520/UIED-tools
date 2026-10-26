/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */

export interface OrderFilters {
    keyword: string
    status: string
    callbackStatus: string
    deliveryStatus: string
    deliveryCheckStatus: string
    boundDomain: string
    productType: string
    startTime: string
    endTime: string
}

export interface OrderReissueDraft {
    visible: boolean
    orderSn: string
    tradeNo: string
    payChannel: string
    remark: string
}

export interface OrderDeliveryDraft {
    id: number
    visible: boolean
    orderSn: string
    deliveryStatus: number
    deliveryStatusText: string
    licenseBoundDomain: string
    licenseKey: string
    downloadUrl: string
    deliveryCheckStatus: string
    deliveryCheckText: string
    systemLicenseStatusText: string
    systemLicenseBoundDomain: string
    downloadCheckStatus: number
    downloadCheckStatusText: string
    downloadCheckTime: string
    downloadCheckMessage: string
    deliveryNote: string
    deliveredTime: number
}

export interface OrderLinkageSummary {
    sourceOrderCount: number
    abnormalCount: number
    okCount: number
    pendingDeliveryCount: number
    licenseInactiveCount: number
    domainMismatchCount: number
    downloadInvalidCount: number
    deliveryIncompleteCount: number
    expiredCount: number
}

export interface OrderRepairContext {
    from: string
    orderSn: string
    domain: string
    deliveryCheckStatus: string
    deliveryCheckText: string
    licenseStatusText: string
    isActive: boolean
}

export interface OrderListState {
    loading: boolean
    loaded: boolean
    error: string
}

export type OrderRecord = Record<string, any>
